
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import sys
from pathlib import Path
import threading
import time
import json
import os

# Add project root to path
project_root = str(Path(__file__).parent.parent)
if project_root not in sys.path:
    sys.path.append(project_root)

from src import nice_funcs_us_stocks as us_stocks
# Import other agents as needed
# from src.agents.trading_agent import TradingAgent 

app = FastAPI(title="Moon Dev Local Console", description="API for Moon Dev Local Trading Console")

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # For local dev, allow all. In prod, restrict to frontend URL.
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class TradeRequest(BaseModel):
    symbol: str
    action: str  # buy, sell
    amount_usd: float
    type: str = "market"

class MarketDataRequest(BaseModel):
    symbol: str
    timeframe: str = "1H"
    limit: int = 100

@app.get("/")
def read_root():
    return {"status": "online", "message": "Moon Dev Local Console API is running 🌙"}

@app.get("/api/us-stocks/account")
def get_us_stock_account():
    """Get US Stock account balance and details"""
    return us_stocks.us_stock_handler.get_account()

@app.post("/api/us-stocks/trade")
def execute_us_stock_trade(trade: TradeRequest):
    """Execute a trade on US Stocks"""
    if trade.action.lower() == "buy":
        return us_stocks.limit_buy(trade.symbol, trade.amount_usd)
    elif trade.action.lower() == "sell":
        return us_stocks.limit_sell(trade.symbol, trade.amount_usd)
    else:
        raise HTTPException(status_code=400, detail="Invalid action. Use 'buy' or 'sell'.")

@app.get("/api/us-stocks/market-data/{symbol}")
def get_us_stock_data(symbol: str, timeframe: str = "1H", limit: int = 100):
    """Get market data for a US Stock"""
    df = us_stocks.get_market_data(symbol, timeframe, limit)
    # Convert DataFrame to JSON compatible format
    data = json.loads(df.to_json(orient="index", date_format="iso"))
    return {"symbol": symbol, "data": data}

# Placeholder for Agent Control
agents_status = {
    "trading_agent": "stopped",
    "polymarket_agent": "stopped"
}

@app.get("/api/agents/status")
def get_agents_status():
    return agents_status

@app.post("/api/agents/{agent_name}/start")
def start_agent(agent_name: str):
    if agent_name not in agents_status:
        raise HTTPException(status_code=404, detail="Agent not found")
    
    # In a real implementation, this would start a background task/process
    agents_status[agent_name] = "running"
    return {"status": "started", "agent": agent_name}

@app.post("/api/agents/{agent_name}/stop")
def stop_agent(agent_name: str):
    if agent_name not in agents_status:
        raise HTTPException(status_code=404, detail="Agent not found")
    
    agents_status[agent_name] = "stopped"
    return {"status": "stopped", "agent": agent_name}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
