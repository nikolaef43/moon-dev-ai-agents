# 🌙 VortigenOS - Quick Start Guide

## 🚀 Launch VortigenOS

### Option 1: One-Click Launch (Windows)
```bash
start_app.bat
```

### Option 2: Manual Launch
```bash
# Terminal 1 - Backend
python src/server.py

# Terminal 2 - Frontend  
cd frontend
npm run dev
```

## 🌐 Access Points

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs
- **WebSocket**: ws://localhost:8000/ws

## ⌨️ Keyboard Shortcuts

- `Cmd+K` / `Ctrl+K` - Open Command Palette
- `ESC` - Close modals/palettes

## 📊 Main Features

### Dashboard
- Real-time portfolio overview
- Account balance tracking
- Recent activity feed
- Quick action buttons

### US Stocks
- Trade stocks, ETFs, options, futures
- Real-time market data charts
- Live order execution
- Account balance display

### Crypto & Polymarket
- Polymarket AI consensus picks
- Recent prediction markets
- Crypto agent controls
- Real-time agent status

### AI Agents
- Start/Stop agents
- Monitor agent health
- View real-time logs
- Configure agent settings

## 🤖 Available Agents

1. **Trading Agent** - Swarm consensus crypto trading
2. **Polymarket Agent** - Prediction market analysis
3. **Sentiment Agent** - Twitter sentiment tracking
4. **Whale Agent** - Whale wallet monitoring
5. **Risk Agent** - Portfolio risk management

## 🔧 Configuration

### Environment Variables (.env)
```bash
# AI Models
ANTHROPIC_KEY=your_key
OPENAI_KEY=your_key
DEEPSEEK_KEY=your_key

# Trading (Optional)
ALPACA_API_KEY=your_key
ALPACA_SECRET_KEY=your_secret
```

## 📡 Real-Time Features

- ✅ WebSocket auto-connect
- ✅ Live agent updates
- ✅ Health monitoring
- ✅ Trade notifications
- ✅ Connection status

## 🐛 Troubleshooting

### Backend won't start
```bash
pip install fastapi uvicorn websockets
python src/server.py
```

### Frontend won't start
```bash
cd frontend
npm install
npm run dev
```

### WebSocket not connecting
- Check if backend is running on port 8000
- Check browser console for errors
- Try refreshing the page

## 📚 Documentation

- `VORTIGENOS_README.md` - Full documentation
- `COMPLETION_REPORT.md` - Implementation details
- `AUDIT_REPORT.md` - System audit
- API Docs: http://localhost:8000/docs

## 🎯 Quick Actions

### Start Trading
1. Open http://localhost:5173
2. Go to "US Stocks" or "Crypto"
3. Enter symbol and amount
4. Click BUY or SELL

### Manage Agents
1. Go to "AI Agents" page
2. Click "Start Agent"
3. Monitor logs and health
4. Click "Stop Agent" when done

### View Dashboard
1. Go to "Dashboard"
2. See portfolio stats
3. View recent activity
4. Use quick actions

---

**VortigenOS** - Advanced AI Trading Platform 🌙
