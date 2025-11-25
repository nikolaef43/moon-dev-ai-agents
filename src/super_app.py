# 🌙 VortigenOS + Vortigen 5 + MoonDev – Unified Super App
"""A single FastAPI entry point that merges:
- VortigenOS backend (agent management, WebSocket, Polymarket placeholders)
- Vortigen 5 agents (mutation, options, research, risk, risk_parity)
- MoonDev AI agents (all existing agents under src/agents)
- Simple token‑cost tracking for each agent invocation
The goal is a *complete, operational* app that exposes all agents (including bots),
Polymarket integration points, and a cost‑estimation API.
"""

# ------------------------------------------------------------
# Imports
# ------------------------------------------------------------
from fastapi import FastAPI, HTTPException, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, validator
import sys
from pathlib import Path
import asyncio
import json
import os
import importlib.util
import glob
import threading
from typing import Dict, List, Any
from datetime import datetime

# US‑stock helper (already Windows‑safe)
# Ensure project root is in sys.path for relative imports
project_root = str(Path(__file__).parent.parent)
if project_root not in sys.path:
    sys.path.append(project_root)
import nice_funcs_us_stocks as us_stocks

# ------------------------------------------------------------
# FastAPI app & CORS
# ------------------------------------------------------------
app = FastAPI(
    title="Vortigen Super App",
    description="Unified backend merging VortigenOS, Vortigen 5, and MoonDev agents.",
    version="3.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ------------------------------------------------------------
# WebSocket connection manager
# ------------------------------------------------------------
class ConnectionManager:
    def __init__(self):
        self.active: List[WebSocket] = []

    async def connect(self, ws: WebSocket):
        await ws.accept()
        self.active.append(ws)

    def disconnect(self, ws: WebSocket):
        if ws in self.active:
            self.active.remove(ws)

    async def broadcast(self, msg: dict):
        for ws in self.active:
            try:
                await ws.send_json(msg)
            except Exception:
                pass

manager = ConnectionManager()

# ------------------------------------------------------------
# Token‑cost tracking (simple in‑memory model)
# ------------------------------------------------------------
# Cost per action – these numbers are illustrative and can be tuned.
TOKEN_COSTS = {
    "default": 1.0,  # base cost per call
    "mutation_agent": 0.5,
    "options_agent": 0.7,
    "research_agent": 0.8,
    "risk_agent": 0.6,
    "risk_parity_agent": 0.9,
    # MoonDev agents will fall back to "default"
}

# Accumulated usage per agent (for reporting)
USAGE_STATS: Dict[str, float] = {}

def charge_agent(agent_name: str):
    cost = TOKEN_COSTS.get(agent_name, TOKEN_COSTS["default"])
    USAGE_STATS[agent_name] = USAGE_STATS.get(agent_name, 0.0) + cost
    return cost

# ------------------------------------------------------------
# Dynamic agent discovery (both MoonDev and Vortigen 5)
# ------------------------------------------------------------
AGENT_STATUS: Dict[str, Dict[str, Any]] = {}

def discover_agents():
    """Load agents from two locations:
    1. MoonDev: ./src/agents
    2. Vortigen 5: ./vortigen_files/vortigen_5/agents
    Each module must expose a class named <CamelCase>Agent.
    """
    # MoonDev agents
    moon_dir = os.path.join(os.path.dirname(__file__), "agents")
    # Vortigen 5 agents
    vortigen_dir = os.path.join(os.path.dirname(__file__), "..", "vortigen_files", "vortigen_5", "agents")
    for base_dir in (moon_dir, vortigen_dir):
        if not os.path.isdir(base_dir):
            continue
        for fp in glob.glob(os.path.join(base_dir, "*.py")):
            mod_name = os.path.splitext(os.path.basename(fp))[0]
            if mod_name.startswith("__"):
                continue
            spec = importlib.util.spec_from_file_location(mod_name, fp)
            module = importlib.util.module_from_spec(spec)
            try:
                spec.loader.exec_module(module)
                class_name = "".join([p.capitalize() for p in mod_name.split("_")]) + "Agent"
                agent_cls = getattr(module, class_name, None)
                AGENT_STATUS[mod_name] = {
                    "status": "stopped",
                    "health": 100,
                    "last_activity": None,
                    "config": {},
                    "class": agent_cls,
                    "instance": None,
                }
            except Exception as e:
                print(f"[WARN] Could not load agent {mod_name}: {e}")

# Load at import time
discover_agents()

# ------------------------------------------------------------
# Pydantic models
# ------------------------------------------------------------
class TradeRequest(BaseModel):
    symbol: str
    action: str  # buy / sell
    amount_usd: float
    asset_type: str = "stock"

    @validator("action")
    def action_ok(cls, v):
        if v.lower() not in {"buy", "sell"}:
            raise ValueError("action must be 'buy' or 'sell'")
        return v.lower()

    @validator("amount_usd")
    def amount_ok(cls, v):
        if v <= 0:
            raise ValueError("amount must be positive")
        return v

class AgentConfigRequest(BaseModel):
    config: Dict[str, Any]

# ------------------------------------------------------------
# Root & health endpoints
# ------------------------------------------------------------
@app.get("/")
async def root():
    return {
        "status": "online",
        "message": "Vortigen Super App is running 🌙",
        "timestamp": datetime.now().isoformat(),
    }

@app.get("/api/health")
async def health():
    return {
        "status": "healthy",
        "agents_loaded": len(AGENT_STATUS),
        "agents_running": len([a for a in AGENT_STATUS.values() if a["status"] == "running"]),
        "websocket_connections": len(manager.active),
        "timestamp": datetime.now().isoformat(),
    }

# ------------------------------------------------------------
# US‑Stocks endpoints (unchanged)
# ------------------------------------------------------------
@app.get("/api/us-stocks/account")
async def us_account():
    try:
        acc = us_stocks.us_stock_handler.get_account()
        return {"success": True, "data": acc, "timestamp": datetime.now().isoformat()}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/us-stocks/trade")
async def us_trade(req: TradeRequest):
    try:
        result = us_stocks.limit_buy(req.symbol, req.amount_usd) if req.action == "buy" else us_stocks.limit_sell(req.symbol, req.amount_usd)
        await manager.broadcast({
            "type": "trade_executed",
            "data": {
                "symbol": req.symbol,
                "action": req.action,
                "amount": req.amount_usd,
                "asset_type": req.asset_type,
                "timestamp": datetime.now().isoformat(),
            },
        })
        return {"success": True, "data": result, "timestamp": datetime.now().isoformat()}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/us-stocks/market-data/{symbol}")
async def us_market(symbol: str, timeframe: str = "1H", limit: int = 100):
    try:
        df = us_stocks.get_market_data(symbol, timeframe, limit)
        data = json.loads(df.to_json(orient="index", date_format="iso"))
        return {"success": True, "symbol": symbol, "data": data, "timestamp": datetime.now().isoformat()}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ------------------------------------------------------------
# Agent management (merged list)
# ------------------------------------------------------------
@app.get("/api/agents/status")
async def all_agents_status():
    safe = {n: {k: v for k, v in info.items() if k not in ["instance", "class"]}
            for n, info in AGENT_STATUS.items()}
    return {"success": True, "data": safe, "timestamp": datetime.now().isoformat()}

@app.get("/api/agents/{name}/status")
async def agent_status(name: str):
    if name not in AGENT_STATUS:
        raise HTTPException(status_code=404, detail=f"Agent '{name}' not found")
    return {"success": True, "agent": name, "data": AGENT_STATUS[name], "timestamp": datetime.now().isoformat()}

@app.post("/api/agents/{name}/start")
async def start_agent(name: str):
    if name not in AGENT_STATUS:
        raise HTTPException(status_code=404, detail=f"Agent '{name}' not found")
    info = AGENT_STATUS[name]
    if info["status"] == "running":
        return {"success": True, "message": f"{name} already running", "timestamp": datetime.now().isoformat()}
    # Instantiate if needed
    if info["instance"] is None and info["class"]:
        try:
            info["instance"] = info["class"]()
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Failed to instantiate {name}: {e}")
    # Start agent run method in a separate thread if not already running
    if info.get("thread") is None:
        if hasattr(info["instance"], "run"):
            try:
                thread = threading.Thread(target=info["instance"].run, daemon=True)
                thread.start()
                info["thread"] = thread
            except Exception as e:
                raise HTTPException(status_code=500, detail=f"Failed to start thread for {name}: {e}")
        else:
            # No run method, just mark as running
            pass
    info["status"] = "running"
    info["last_activity"] = datetime.now().isoformat()
    charge = charge_agent(name)  # record cost
    await manager.broadcast({
        "type": "agent_status_changed",
        "data": {"agent": name, "status": "running", "cost": charge, "timestamp": datetime.now().isoformat()},
    })
    return {"success": True, "message": f"{name} started", "cost": charge, "timestamp": datetime.now().isoformat()}

@app.post("/api/agents/{name}/stop")
async def stop_agent(name: str):
    if name not in AGENT_STATUS:
        raise HTTPException(status_code=404, detail=f"Agent '{name}' not found")
    info = AGENT_STATUS[name]
    if info["status"] == "stopped":
        return {"success": True, "message": f"{name} already stopped", "timestamp": datetime.now().isoformat()}
    info["status"] = "stopped"
    info["last_activity"] = datetime.now().isoformat()
    await manager.broadcast({
        "type": "agent_status_changed",
        "data": {"agent": name, "status": "stopped", "timestamp": datetime.now().isoformat()},
    })
    return {"success": True, "message": f"{name} stopped", "timestamp": datetime.now().isoformat()}

@app.post("/api/agents/{name}/config")
async def config_agent(name: str, cfg: AgentConfigRequest):
    if name not in AGENT_STATUS:
        raise HTTPException(status_code=404, detail=f"Agent '{name}' not found")
    AGENT_STATUS[name]["config"].update(cfg.config)
    AGENT_STATUS[name]["last_activity"] = datetime.now().isoformat()
    await manager.broadcast({
        "type": "agent_config_changed",
        "data": {"agent": name, "config": AGENT_STATUS[name]["config"], "timestamp": datetime.now().isoformat()},
    })
    return {"success": True, "message": f"Config updated for {name}", "config": AGENT_STATUS[name]["config"], "timestamp": datetime.now().isoformat()}

@app.get("/api/agents/{name}/logs")
async def agent_logs(name: str, limit: int = 100):
    if name not in AGENT_STATUS:
        raise HTTPException(status_code=404, detail=f"Agent '{name}' not found")
    # Mock logs – replace with real logger later
    logs = [{"timestamp": datetime.now().isoformat(), "level": "INFO",
             "message": f"{name} status {AGENT_STATUS[name]['status']}"} for _ in range(limit)]
    return {"success": True, "agent": name, "logs": logs, "timestamp": datetime.now().isoformat()}

# ------------------------------------------------------------
# Cost / usage endpoint
# ------------------------------------------------------------
@app.get("/api/usage")
async def usage_report():
    return {"success": True, "usage": USAGE_STATS, "timestamp": datetime.now().isoformat()}

# ------------------------------------------------------------
# Polymarket placeholders (already present in VortigenOS)
# ------------------------------------------------------------
@app.get("/api/polymarket/markets")
async def polymarket_markets(limit: int = 20):
    return {"success": True, "data": {"markets": [], "consensus_picks": []}, "timestamp": datetime.now().isoformat()}

@app.get("/api/polymarket/predictions")
async def polymarket_predictions():
    return {"success": True, "data": {"predictions": []}, "timestamp": datetime.now().isoformat()}

# ------------------------------------------------------------
# WebSocket endpoint (real‑time updates)
# ------------------------------------------------------------
@app.websocket("/ws")
async def ws_endpoint(ws: WebSocket):
    await manager.connect(ws)
    try:
        await ws.send_json({"type": "connected", "message": "Vortigen Super App WS ready", "timestamp": datetime.now().isoformat()})
        while True:
            try:
                raw = await ws.receive_text()
                msg = json.loads(raw)
                if msg.get("type") == "ping":
                    await ws.send_json({"type": "pong", "timestamp": datetime.now().isoformat()})
            except WebSocketDisconnect:
                break
            except json.JSONDecodeError:
                await ws.send_json({"type": "error", "message": "Invalid JSON", "timestamp": datetime.now().isoformat()})
            except Exception as e:
                await ws.send_json({"type": "error", "message": str(e), "timestamp": datetime.now().isoformat()})
    finally:
        manager.disconnect(ws)

# ------------------------------------------------------------
# Background health broadcaster (same as VortigenOS)
# ------------------------------------------------------------
async def broadcast_health():
    while True:
        try:
            await asyncio.sleep(5)
            for n, info in AGENT_STATUS.items():
                if info["status"] == "running":
                    cur = info.get("health", 100)
                    info["health"] = max(50, cur - 0.5)  # demo degradation
            await manager.broadcast({
                "type": "agent_health_update",
                "data": {n: i["health"] for n, i in AGENT_STATUS.items()},
                "timestamp": datetime.now().isoformat(),
            })
        except Exception as e:
            print(f"[ERROR] health loop: {e}")

# ------------------------------------------------------------
# Startup / shutdown hooks
# ------------------------------------------------------------
@app.on_event("startup")
async def on_startup():
    print("[Vortigen Super] Starting...")
    asyncio.create_task(broadcast_health())

@app.on_event("shutdown")
async def on_shutdown():
    print("[Vortigen Super] Shutting down – stopping agents...")
    for n, info in AGENT_STATUS.items():
        if info["status"] == "running":
            info["status"] = "stopped"

# ------------------------------------------------------------
# Main entry point
# ------------------------------------------------------------
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, log_level="info")
