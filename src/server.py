# 🌙 VortigenOS - FastAPI Backend
"""Complete API server with WebSocket support, dynamic agent discovery, and error handling.
Provides endpoints for US stocks, Polymarket, and AI agents management.
"""

# ------------------------------------------------------------
# Imports
# ------------------------------------------------------------
from fastapi import FastAPI, HTTPException, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, validator
import sys
from pathlib import Path
import threading
import asyncio
import json
import os
import importlib.util
import glob
from typing import Dict, List, Any
from datetime import datetime
import traceback

# ------------------------------------------------------------
# Project setup
# ------------------------------------------------------------
# Ensure project root is in sys.path for relative imports
project_root = str(Path(__file__).parent.parent)
if project_root not in sys.path:
    sys.path.append(project_root)

# Import US stock helper (already fixed for Windows encoding)
from src import nice_funcs_us_stocks as us_stocks

# ------------------------------------------------------------
# FastAPI app & CORS
# ------------------------------------------------------------
app = FastAPI(
    title="VortigenOS API",
    description="API for VortigenOS AI trading platform",
    version="2.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ------------------------------------------------------------
# Connection manager for WebSocket
# ------------------------------------------------------------
class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)

    async def broadcast(self, message: dict):
        for connection in self.active_connections:
            try:
                await connection.send_json(message)
            except Exception:
                pass

manager = ConnectionManager()

# ------------------------------------------------------------
# Dynamic agent discovery
# ------------------------------------------------------------
AGENT_STATUS: Dict[str, Dict[str, Any]] = {}

def load_agents():
    """Discover Python modules in src/agents and initialise status entries.
    Each agent module should define a class named <CamelCase>Agent (e.g., trading_agent -> TradingAgent).
    """
    agents_dir = os.path.join(os.path.dirname(__file__), "agents")
    for file_path in glob.glob(os.path.join(agents_dir, "*.py")):
        module_name = os.path.splitext(os.path.basename(file_path))[0]
        if module_name.startswith("__"):
            continue
        spec = importlib.util.spec_from_file_location(module_name, file_path)
        module = importlib.util.module_from_spec(spec)
        try:
            spec.loader.exec_module(module)
            class_name = "".join([part.capitalize() for part in module_name.split("_")]) + "Agent"
            agent_class = getattr(module, class_name, None)
            AGENT_STATUS[module_name] = {
                "status": "stopped",
                "health": 100,
                "last_activity": None,
                "config": {},
                "class": agent_class,
                "instance": None,
            }
        except Exception as e:
            print(f"[WARN] Failed to load agent {module_name}: {e}")

# Load agents at import time
load_agents()

# ------------------------------------------------------------
# Pydantic models
# ------------------------------------------------------------
class TradeRequest(BaseModel):
    symbol: str
    action: str  # buy or sell
    amount_usd: float
    asset_type: str = "stock"

    @validator("action")
    def validate_action(cls, v):
        if v.lower() not in ["buy", "sell"]:
            raise ValueError("Action must be 'buy' or 'sell'")
        return v.lower()

    @validator("amount_usd")
    def validate_amount(cls, v):
        if v <= 0:
            raise ValueError("Amount must be positive")
        return v

class AgentConfigRequest(BaseModel):
    config: Dict[str, Any]

# ------------------------------------------------------------
# Health & root endpoints
# ------------------------------------------------------------
@app.get("/")
async def read_root():
    return {
        "status": "online",
        "message": "VortigenOS API is running 🌙",
        "version": "2.0.0",
        "timestamp": datetime.now().isoformat(),
    }

@app.get("/api/health")
async def health_check():
    return {
        "status": "healthy",
        "agents_loaded": len(AGENT_STATUS),
        "agents_running": len([a for a, v in AGENT_STATUS.items() if v["status"] == "running"]),
        "websocket_connections": len(manager.active_connections),
        "timestamp": datetime.now().isoformat(),
    }

# ------------------------------------------------------------
# US Stocks endpoints (mock mode if no Alpaca keys)
# ------------------------------------------------------------
@app.get("/api/us-stocks/account")
async def get_us_stock_account():
    try:
        account = us_stocks.us_stock_handler.get_account()
        return {"success": True, "data": account, "timestamp": datetime.now().isoformat()}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/us-stocks/trade")
async def execute_us_stock_trade(trade: TradeRequest):
    try:
        if trade.action == "buy":
            result = us_stocks.limit_buy(trade.symbol, trade.amount_usd)
        else:
            result = us_stocks.limit_sell(trade.symbol, trade.amount_usd)
        # Broadcast trade execution
        await manager.broadcast({
            "type": "trade_executed",
            "data": {
                "symbol": trade.symbol,
                "action": trade.action,
                "amount": trade.amount_usd,
                "asset_type": trade.asset_type,
                "timestamp": datetime.now().isoformat(),
            },
        })
        return {"success": True, "data": result, "timestamp": datetime.now().isoformat()}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/us-stocks/market-data/{symbol}")
async def get_us_stock_data(symbol: str, timeframe: str = "1H", limit: int = 100):
    try:
        df = us_stocks.get_market_data(symbol, timeframe, limit)
        data = json.loads(df.to_json(orient="index", date_format="iso"))
        return {"success": True, "symbol": symbol, "data": data, "timestamp": datetime.now().isoformat()}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ------------------------------------------------------------
# Agent management endpoints
# ------------------------------------------------------------
@app.get("/api/agents/status")
async def get_agents_status():
    safe_status = {
        name: {k: v for k, v in info.items() if k not in ["instance", "class"]}
        for name, info in AGENT_STATUS.items()
    }
    return {"success": True, "data": safe_status, "timestamp": datetime.now().isoformat()}

@app.get("/api/agents/{agent_name}/status")
async def get_agent_status(agent_name: str):
    if agent_name not in AGENT_STATUS:
        raise HTTPException(status_code=404, detail=f"Agent '{agent_name}' not found")
    return {"success": True, "agent": agent_name, "data": AGENT_STATUS[agent_name], "timestamp": datetime.now().isoformat()}

@app.post("/api/agents/{agent_name}/start")
async def start_agent(agent_name: str):
    if agent_name not in AGENT_STATUS:
        raise HTTPException(status_code=404, detail=f"Agent '{agent_name}' not found")
    info = AGENT_STATUS[agent_name]
    if info["status"] == "running":
        return {"success": True, "message": f"{agent_name} already running", "timestamp": datetime.now().isoformat()}
    # Instantiate if needed
    if info["instance"] is None and info["class"]:
        try:
            info["instance"] = info["class"]()
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Failed to instantiate {agent_name}: {e}")
    # Start agent run method in a separate thread if not already running
    if info.get("thread") is None:
        if hasattr(info["instance"], "run"):
            try:
                thread = threading.Thread(target=info["instance"].run, daemon=True)
                thread.start()
                info["thread"] = thread
            except Exception as e:
                raise HTTPException(status_code=500, detail=f"Failed to start thread for {agent_name}: {e}")
        else:
            # No run method, just mark as running
            pass
    info["status"] = "running"
    info["last_activity"] = datetime.now().isoformat()
    await manager.broadcast({
        "type": "agent_status_changed",
        "data": {"agent": agent_name, "status": "running", "timestamp": datetime.now().isoformat()},
    })
    return {"success": True, "message": f"{agent_name} started", "timestamp": datetime.now().isoformat()}

@app.post("/api/agents/{agent_name}/stop")
async def stop_agent(agent_name: str):
    if agent_name not in AGENT_STATUS:
        raise HTTPException(status_code=404, detail=f"Agent '{agent_name}' not found")
    info = AGENT_STATUS[agent_name]
    if info["status"] == "stopped":
        return {"success": True, "message": f"{agent_name} already stopped", "timestamp": datetime.now().isoformat()}
    info["status"] = "stopped"
    info["last_activity"] = datetime.now().isoformat()
    await manager.broadcast({
        "type": "agent_status_changed",
        "data": {"agent": agent_name, "status": "stopped", "timestamp": datetime.now().isoformat()},
    })
    return {"success": True, "message": f"{agent_name} stopped", "timestamp": datetime.now().isoformat()}

@app.post("/api/agents/{agent_name}/config")
async def update_agent_config(agent_name: str, config_request: AgentConfigRequest):
    if agent_name not in AGENT_STATUS:
        raise HTTPException(status_code=404, detail=f"Agent '{agent_name}' not found")
    AGENT_STATUS[agent_name]["config"].update(config_request.config)
    AGENT_STATUS[agent_name]["last_activity"] = datetime.now().isoformat()
    await manager.broadcast({
        "type": "agent_config_changed",
        "data": {"agent": agent_name, "config": AGENT_STATUS[agent_name]["config"], "timestamp": datetime.now().isoformat()},
    })
    return {"success": True, "message": f"Config updated for {agent_name}", "config": AGENT_STATUS[agent_name]["config"], "timestamp": datetime.now().isoformat()}

@app.get("/api/agents/{agent_name}/logs")
async def get_agent_logs(agent_name: str, limit: int = 100):
    if agent_name not in AGENT_STATUS:
        raise HTTPException(status_code=404, detail=f"Agent '{agent_name}' not found")
    # Mock logs – replace with real log retrieval later
    logs = [
        {"timestamp": datetime.now().isoformat(), "level": "INFO", "message": f"{agent_name} status {AGENT_STATUS[agent_name]['status']}"}
        for _ in range(limit)
    ]
    return {"success": True, "agent": agent_name, "logs": logs, "timestamp": datetime.now().isoformat()}

# ------------------------------------------------------------
# Polymarket endpoints (placeholder)
# ------------------------------------------------------------
@app.get("/api/polymarket/markets")
async def get_polymarket_markets(limit: int = 20):
    return {"success": True, "data": {"markets": [], "consensus_picks": []}, "timestamp": datetime.now().isoformat()}

@app.get("/api/polymarket/predictions")
async def get_polymarket_predictions():
    return {"success": True, "data": {"predictions": []}, "timestamp": datetime.now().isoformat()}

# ------------------------------------------------------------
# WebSocket endpoint
# ------------------------------------------------------------
@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        await websocket.send_json({
            "type": "connected",
            "message": "Connected to VortigenOS",
            "timestamp": datetime.now().isoformat(),
        })
        while True:
            try:
                data = await websocket.receive_text()
                message = json.loads(data)
                if message.get("type") == "ping":
                    await websocket.send_json({"type": "pong", "timestamp": datetime.now().isoformat()})
                elif message.get("type") == "subscribe":
                    await websocket.send_json({
                        "type": "subscribed",
                        "channel": message.get("channel"),
                        "timestamp": datetime.now().isoformat(),
                    })
            except WebSocketDisconnect:
                break
            except json.JSONDecodeError:
                await websocket.send_json({"type": "error", "message": "Invalid JSON", "timestamp": datetime.now().isoformat()})
            except Exception as e:
                await websocket.send_json({"type": "error", "message": str(e), "timestamp": datetime.now().isoformat()})
    finally:
        manager.disconnect(websocket)

# ------------------------------------------------------------
# Background task: broadcast agent health
# ------------------------------------------------------------
async def broadcast_agent_health():
    while True:
        try:
            await asyncio.sleep(5)
            for name, info in AGENT_STATUS.items():
                if info["status"] == "running":
                    current = info.get("health", 100)
                    info["health"] = max(50, current - 0.5)
            await manager.broadcast({
                "type": "agent_health_update",
                "data": {name: info["health"] for name, info in AGENT_STATUS.items()},
                "timestamp": datetime.now().isoformat(),
            })
        except Exception as e:
            print(f"[ERROR] Health broadcast failed: {e}")

# ------------------------------------------------------------
# Startup / shutdown events
# ------------------------------------------------------------
@app.on_event("startup")
async def startup_event():
    print("[VortigenOS] API Starting...")
    print(f"[WebSocket] endpoint: ws://localhost:8000/ws")
    print(f"[API Docs] http://localhost:8000/docs")
    asyncio.create_task(broadcast_agent_health())

@app.on_event("shutdown")
async def shutdown_event():
    print("[VortigenOS] API Shutting down...")
    for name, info in AGENT_STATUS.items():
        if info["status"] == "running":
            info["status"] = "stopped"

# ------------------------------------------------------------
# Main entry point
# ------------------------------------------------------------
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, log_level="info")
