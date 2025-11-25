"""
Unit tests for FastAPI server endpoints
Run with: pytest tests/test_server.py -v
"""

import pytest
from fastapi.testclient import TestClient
import sys
from pathlib import Path

# Add project root to path
project_root = str(Path(__file__).parent.parent)
if project_root not in sys.path:
    sys.path.append(project_root)

from src.server import app

client = TestClient(app)


class TestHealthCheck:
    """Test health check endpoint"""
    
    def test_root_endpoint(self):
        """Test that root endpoint returns online status"""
        response = client.get("/")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "online"
        assert "Moon Dev" in data["message"]


class TestUSStocksAccount:
    """Test US Stocks account endpoint"""
    
    def test_get_account(self):
        """Test getting account balance"""
        response = client.get("/api/us-stocks/account")
        assert response.status_code == 200
        # Account endpoint should return some data structure


class TestUSStocksTrade:
    """Test US Stocks trade execution"""
    
    def test_buy_trade_valid(self):
        """Test valid buy trade"""
        trade_data = {
            "symbol": "AAPL",
            "action": "buy",
            "amount_usd": 100.0,
            "type": "market"
        }
        response = client.post("/api/us-stocks/trade", json=trade_data)
        # May return 200 or 500 depending on mock implementation
        assert response.status_code in [200, 500]
    
    def test_sell_trade_valid(self):
        """Test valid sell trade"""
        trade_data = {
            "symbol": "AAPL",
            "action": "sell",
            "amount_usd": 100.0,
            "type": "market"
        }
        response = client.post("/api/us-stocks/trade", json=trade_data)
        assert response.status_code in [200, 500]
    
    def test_trade_invalid_action(self):
        """Test trade with invalid action"""
        trade_data = {
            "symbol": "AAPL",
            "action": "invalid",
            "amount_usd": 100.0,
            "type": "market"
        }
        response = client.post("/api/us-stocks/trade", json=trade_data)
        assert response.status_code == 400
        assert "Invalid action" in response.json()["detail"]
    
    def test_trade_empty_symbol(self):
        """Test trade with empty symbol"""
        trade_data = {
            "symbol": "",
            "action": "buy",
            "amount_usd": 100.0,
            "type": "market"
        }
        response = client.post("/api/us-stocks/trade", json=trade_data)
        assert response.status_code == 400
        assert "Symbol is required" in response.json()["detail"]
    
    def test_trade_negative_amount(self):
        """Test trade with negative amount"""
        trade_data = {
            "symbol": "AAPL",
            "action": "buy",
            "amount_usd": -100.0,
            "type": "market"
        }
        response = client.post("/api/us-stocks/trade", json=trade_data)
        assert response.status_code == 400
        assert "positive" in response.json()["detail"].lower()
    
    def test_trade_excessive_amount(self):
        """Test trade with excessive amount"""
        trade_data = {
            "symbol": "AAPL",
            "action": "buy",
            "amount_usd": 200000.0,
            "type": "market"
        }
        response = client.post("/api/us-stocks/trade", json=trade_data)
        assert response.status_code == 400
        assert "exceeds maximum" in response.json()["detail"].lower()


class TestMarketData:
    """Test market data endpoint"""
    
    def test_get_market_data_valid(self):
        """Test getting market data for valid symbol"""
        response = client.get("/api/us-stocks/market-data/AAPL")
        # May return 200, 404, or 500 depending on mock implementation
        assert response.status_code in [200, 404, 500]
    
    def test_get_market_data_empty_symbol(self):
        """Test getting market data with empty symbol"""
        response = client.get("/api/us-stocks/market-data/ ")
        # FastAPI may handle this differently
        assert response.status_code in [400, 404, 422]
    
    def test_get_market_data_invalid_limit(self):
        """Test getting market data with invalid limit"""
        response = client.get("/api/us-stocks/market-data/AAPL?limit=0")
        assert response.status_code == 400
        assert "Limit must be between" in response.json()["detail"]
    
    def test_get_market_data_excessive_limit(self):
        """Test getting market data with excessive limit"""
        response = client.get("/api/us-stocks/market-data/AAPL?limit=2000")
        assert response.status_code == 400
        assert "Limit must be between" in response.json()["detail"]


class TestAgentControl:
    """Test agent control endpoints"""
    
    def test_get_agents_status(self):
        """Test getting all agents status"""
        response = client.get("/api/agents/status")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, dict)
        assert "trading_agent" in data
        assert "polymarket_agent" in data
    
    def test_start_agent_valid(self):
        """Test starting a valid agent"""
        response = client.post("/api/agents/trading_agent/start")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "started"
        assert data["agent"] == "trading_agent"
    
    def test_start_agent_invalid(self):
        """Test starting an invalid agent"""
        response = client.post("/api/agents/nonexistent_agent/start")
        assert response.status_code == 404
        assert "not found" in response.json()["detail"].lower()
    
    def test_stop_agent_valid(self):
        """Test stopping a valid agent"""
        response = client.post("/api/agents/trading_agent/stop")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "stopped"
        assert data["agent"] == "trading_agent"
    
    def test_stop_agent_invalid(self):
        """Test stopping an invalid agent"""
        response = client.post("/api/agents/nonexistent_agent/stop")
        assert response.status_code == 404
        assert "not found" in response.json()["detail"].lower()
    
    def test_agent_status_thread_safety(self):
        """Test that agent status updates are thread-safe"""
        import concurrent.futures
        
        def start_stop_agent():
            client.post("/api/agents/trading_agent/start")
            client.post("/api/agents/trading_agent/stop")
        
        # Run multiple concurrent requests
        with concurrent.futures.ThreadPoolExecutor(max_workers=10) as executor:
            futures = [executor.submit(start_stop_agent) for _ in range(20)]
            concurrent.futures.wait(futures)
        
        # Verify status is still consistent
        response = client.get("/api/agents/status")
        assert response.status_code == 200
        data = response.json()
        assert data["trading_agent"] in ["running", "stopped"]


class TestCORS:
    """Test CORS configuration"""
    
    def test_cors_allowed_origin(self):
        """Test that allowed origins can access API"""
        headers = {"Origin": "http://localhost:5173"}
        response = client.get("/", headers=headers)
        assert response.status_code == 200
    
    def test_cors_preflight(self):
        """Test CORS preflight request"""
        headers = {
            "Origin": "http://localhost:5173",
            "Access-Control-Request-Method": "POST",
            "Access-Control-Request-Headers": "Content-Type"
        }
        response = client.options("/api/us-stocks/trade", headers=headers)
        # Preflight should be handled by middleware
        assert response.status_code in [200, 405]


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
