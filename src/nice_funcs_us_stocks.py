
import os
import time
import pandas as pd
from termcolor import cprint
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Mocking Alpaca API for now since we don't have keys
# In a real scenario, we would import alpaca_trade_api as tradeapi

class USStockHandler:
    def __init__(self):
        self.api_key = os.getenv("ALPACA_API_KEY")
        self.secret_key = os.getenv("ALPACA_SECRET_KEY")
        self.base_url = os.getenv("ALPACA_BASE_URL", "https://paper-api.alpaca.markets")
        
        if not self.api_key or not self.secret_key:
            cprint("⚠️ Alpaca API keys not found. US Stock trading will be in MOCK mode.", "yellow")
            self.mock_mode = True
        else:
            self.mock_mode = False
            # self.api = tradeapi.REST(self.api_key, self.secret_key, self.base_url, api_version='v2')
            cprint("✅ Alpaca API connected!", "green")

    def get_account(self):
        """Get account details"""
        if self.mock_mode:
            return {
                "status": "ACTIVE",
                "currency": "USD",
                "buying_power": "100000.00",
                "cash": "100000.00",
                "portfolio_value": "100000.00",
                "equity": "100000.00"
            }
        # return self.api.get_account()
        return {}

    def get_position(self, symbol):
        """Get position for a specific symbol"""
        if self.mock_mode:
            # Return a mock position or None
            return None
        # try:
        #     return self.api.get_position(symbol)
        # except:
        #     return None
        return None

    def get_bars(self, symbol, timeframe='1H', limit=100):
        """Get historical bars"""
        cprint(f"📊 Fetching {timeframe} bars for {symbol}...", "cyan")
        if self.mock_mode:
            # Generate mock data
            dates = pd.date_range(end=pd.Timestamp.now(), periods=limit, freq=timeframe)
            df = pd.DataFrame({
                'open': [150.0 + i for i in range(limit)],
                'high': [155.0 + i for i in range(limit)],
                'low': [145.0 + i for i in range(limit)],
                'close': [152.0 + i for i in range(limit)],
                'volume': [1000000 for _ in range(limit)]
            }, index=dates)
            return df
        
        # Real implementation would use self.api.get_bars...
        return pd.DataFrame()

    def submit_order(self, symbol, qty, side, type='market', time_in_force='gtc'):
        """Submit an order"""
        cprint(f"🚀 Submitting {side} order for {qty} {symbol}...", "green")
        if self.mock_mode:
            return {"id": "mock_order_id", "status": "filled"}
        
        # return self.api.submit_order(symbol=symbol, qty=qty, side=side, type=type, time_in_force=time_in_force)
        return {}

# Global instance
us_stock_handler = USStockHandler()

# Wrapper functions to match nice_funcs style
def get_account_balance():
    acct = us_stock_handler.get_account()
    return float(acct.get('equity', 0))

def get_position(symbol):
    return us_stock_handler.get_position(symbol)

def get_market_data(symbol, timeframe='1H', limit=100):
    return us_stock_handler.get_bars(symbol, timeframe, limit)

def limit_buy(symbol, usd_amount, limit_price=None):
    # Calculate qty based on price
    # For mock, assume price is 100
    price = 100
    qty = usd_amount / price
    return us_stock_handler.submit_order(symbol, qty, 'buy')

def limit_sell(symbol, usd_amount, limit_price=None):
    price = 100
    qty = usd_amount / price
    return us_stock_handler.submit_order(symbol, qty, 'sell')
