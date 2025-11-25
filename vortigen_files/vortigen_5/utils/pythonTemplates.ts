
export const POLYMARKET_AGENT_PY = `"""
🌙 Moon Dev's Polymarket Prediction Market Agent (Optimized)
Refactored for VORTIGEN Framework - High Performance / Low Latency
"""

import os
import sys
import time
import json
import requests
import pandas as pd
import threading
import websocket
import queue
from datetime import datetime, timedelta
from pathlib import Path
from termcolor import cprint

# ==============================================================================
# CONFIGURATION
# ==============================================================================

MIN_TRADE_SIZE_USD = 500
IGNORE_PRICE_THRESHOLD = 0.02
LOOKBACK_HOURS = 24
BATCH_SAVE_INTERVAL = 10  # Seconds between disk writes
BATCH_SIZE_THRESHOLD = 50  # Items before forced write

IGNORE_KEYWORDS = [
    'bitcoin', 'btc', 'ethereum', 'eth', 'crypto', 'solana', 'sol',
    'dogecoin', 'doge', 'nba', 'nfl', 'mlb', 'nhl', 'ufc', 'boxing',
    'football', 'basketball', 'baseball', 'soccer'
]

# Paths
DATA_FOLDER = "./data/polymarket"
MARKETS_CSV = os.path.join(DATA_FOLDER, "markets.csv")
PREDICTIONS_CSV = os.path.join(DATA_FOLDER, "predictions.csv")

# API
WEBSOCKET_URL = "wss://ws-live-data.polymarket.com"

class PolymarketAgent:
    """High-performance, thread-safe Polymarket Agent"""

    def __init__(self):
        cprint("🌙 Initializing Polymarket Agent (VORTIGEN Optimized)...", "cyan")
        
        os.makedirs(DATA_FOLDER, exist_ok=True)
        
        # Thread-safe structures
        self.trade_queue = queue.Queue()
        self.data_lock = threading.Lock()
        
        # State
        self.markets_df = self._load_markets()
        self.running = True
        self.ws_connected = False
        self.total_trades = 0
        
        # Start Worker Threads
        self.worker_thread = threading.Thread(target=self._processing_worker, daemon=True)
        self.worker_thread.start()
        
        self.analysis_thread = threading.Thread(target=self._analysis_loop, daemon=True)
        self.analysis_thread.start()

    def _load_markets(self):
        if os.path.exists(MARKETS_CSV):
            return pd.read_csv(MARKETS_CSV)
        return pd.DataFrame(columns=[
            'timestamp', 'market_id', 'title', 'outcome', 'price', 
            'size_usd', 'last_trade_timestamp'
        ])

    def _processing_worker(self):
        """
        Consumes trades from queue and batches disk I/O.
        Prevents WebSocket blocking.
        """
        buffer = []
        last_save = time.time()
        
        cprint("⚙️  Processing worker started", "green")
        
        while self.running:
            try:
                # Non-blocking get with timeout to allow periodic saving
                try:
                    trade = self.trade_queue.get(timeout=1.0)
                    buffer.append(trade)
                except queue.Empty:
                    pass
                
                # Check flush conditions
                time_since_save = time.time() - last_save
                if buffer and (len(buffer) >= BATCH_SIZE_THRESHOLD or time_since_save >= BATCH_SAVE_INTERVAL):
                    with self.data_lock:
                        self._flush_buffer(buffer)
                    buffer = []
                    last_save = time.time()
                    
            except Exception as e:
                cprint(f"❌ Worker Error: {e}", "red")

    def _flush_buffer(self, trades):
        """Updates DataFrame and saves to disk"""
        cprint(f"💾 Flushing {len(trades)} trades to disk...", "blue")
        
        # Convert buffer to DF for efficient merging
        new_data = []
        for t in trades:
             new_data.append({
                'timestamp': t['timestamp'],
                'market_id': t['conditionId'],
                'title': t['title'],
                'outcome': t['outcome'],
                'price': t['price'],
                'size_usd': t['size'],
                'last_trade_timestamp': datetime.now().isoformat()
            })
            
        new_df = pd.DataFrame(new_data)
        
        # Update main DF (Upsert logic simulation)
        self.markets_df = pd.concat([self.markets_df, new_df], ignore_index=True)
        # Simple dedup keeping last
        self.markets_df.drop_duplicates(subset=['market_id'], keep='last', inplace=True)
        
        # Atomic write
        self.markets_df.to_csv(MARKETS_CSV, index=False)

    def on_message(self, ws, message):
        """Lightweight WebSocket handler - only pushes to queue"""
        try:
            data = json.loads(message)
            if data.get('type') == 'orders_matched':
                payload = data.get('payload', {})
                price = float(payload.get('price', 0))
                size = float(payload.get('size', 0))
                usd = price * size
                
                # Fast Filtering
                if usd < MIN_TRADE_SIZE_USD: return
                if price <= IGNORE_PRICE_THRESHOLD or price >= (1 - IGNORE_PRICE_THRESHOLD): return
                
                title = payload.get('title', '').lower()
                if any(k in title for k in IGNORE_KEYWORDS): return

                # Push to queue
                self.trade_queue.put({
                    'timestamp': payload.get('timestamp'),
                    'conditionId': payload.get('conditionId'),
                    'title': payload.get('title'),
                    'outcome': payload.get('outcome'),
                    'price': price,
                    'size': usd
                })
                self.total_trades += 1
                
        except Exception:
            pass

    def connect(self):
        cprint(f"🚀 Connecting to {WEBSOCKET_URL}...", "cyan")
        self.ws = websocket.WebSocketApp(
            WEBSOCKET_URL,
            on_open=lambda ws: ws.send(json.dumps({"action": "subscribe", "subscriptions": [{"topic": "activity", "type": "orders_matched"}]})),
            on_message=self.on_message
        )
        self.ws.run_forever()

    def _analysis_loop(self):
        """AI Analysis Logic (Mocked for brevity)"""
        while self.running:
            time.sleep(300)
            with self.data_lock:
                # Snapshot data for analysis
                recent = self.markets_df.tail(5)
            
            if not recent.empty:
                cprint("🤖 Running AI Analysis on recent markets...", "magenta")
                # ... AI Logic here ...

if __name__ == "__main__":
    agent = PolymarketAgent()
    agent.connect()
`;

export const FETCH_MARKET_DATA_PY = `
import yfinance as yf
import sys
import json

def fetch_data(symbol):
    ticker = yf.Ticker(symbol)
    hist = ticker.history(period="1d")
    print(json.dumps(hist.to_dict()))

if __name__ == "__main__":
    fetch_data(sys.argv[1])
`;
