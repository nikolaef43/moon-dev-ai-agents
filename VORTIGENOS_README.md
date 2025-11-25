# 🌙 VortigenOS - AI Trading Platform

A premium, institutional-grade AI trading console built for local hosting. Combines advanced AI agents with a beautiful, real-time interface.

## ✨ Features

### 🎯 Core Capabilities
- **Multi-Asset Trading**: Stocks, ETFs, Options, Futures, Crypto, and Polymarket
- **AI Agent Management**: Control and monitor autonomous trading agents
- **Command Palette** (`Cmd+K` / `Ctrl+K`): Quick navigation and command execution
- **Real-time Dashboard**: Portfolio overview with live updates
- **Premium UI**: Dark mode, glassmorphism, smooth animations
- **WebSocket Integration**: Real-time updates across all features

### 🤖 AI Agents
- **Trading Agent**: Autonomous crypto trading with 6-model swarm consensus
- **Polymarket Agent**: Prediction market analysis and trading
- **Sentiment Agent**: Social media sentiment tracking
- **Whale Agent**: Whale wallet monitoring and alerts
- **Risk Agent**: Portfolio risk management and monitoring

### 📊 Trading Interfaces
- **US Stocks**: Trade equities, ETFs, options, and futures
- **Crypto**: Multi-exchange support (Aster, HyperLiquid, Solana)
- **Polymarket**: Prediction market trading interface

## 🚀 Quick Start

### Prerequisites
- **Python 3.10+**
- **Node.js 18+**
- **npm** or **yarn**

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/YOUR_USERNAME/vortigenos.git
   cd vortigenos
   ```

2. **Install Python dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

3. **Install Frontend dependencies**:
   ```bash
   cd frontend
   npm install
   cd ..
   ```

4. **Configure Environment**:
   Create a `.env` file in the root directory:
   ```bash
   # AI Model APIs (at least one required)
   ANTHROPIC_KEY=your_anthropic_key
   OPENAI_KEY=your_openai_key
   DEEPSEEK_KEY=your_deepseek_key
   
   # Trading APIs (optional for paper trading)
   ALPACA_API_KEY=your_alpaca_key
   ALPACA_SECRET_KEY=your_alpaca_secret
   ALPACA_BASE_URL=https://paper-api.alpaca.markets
   ```

### Launch

**Windows**:
```bash
start_app.bat
```

**Mac/Linux**:
```bash
# Terminal 1 - Backend
python src/server.py

# Terminal 2 - Frontend
cd frontend
npm run dev
```

The console will be available at:
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs

## 🎮 Usage

### Command Palette
Press `Cmd+K` (Mac) or `Ctrl+K` (Windows/Linux) to open the command palette:
- Type to search for pages
- Use arrow keys to navigate
- Press Enter to select

### Trading
1. Navigate to **US Stocks** or **Crypto** page
2. Select asset type (Stock, ETF, Option, Future)
3. Enter symbol and amount
4. Click BUY or SELL

### Agent Management
1. Go to **AI Agents** page
2. Click **Start Agent** to activate
3. Monitor logs and status in real-time
4. Click **Stop Agent** to deactivate

## 📁 Project Structure

```
vortigenos/
├── frontend/                 # React frontend
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── pages/           # Page components
│   │   ├── services/        # API services
│   │   ├── context/         # State management
│   │   └── App.jsx          # Main app component
│   └── package.json
├── src/                     # Python backend
│   ├── agents/              # AI agent implementations
│   ├── server.py            # FastAPI server
│   └── nice_funcs_us_stocks.py  # US stock trading handler
├── requirements.txt         # Python dependencies
├── start_app.bat           # Windows launcher
└── README.md               # This file
```

## 🔧 Configuration

### Trading Settings
Edit `src/agents/trading_agent.py`:
- `EXCHANGE`: "ASTER", "HYPERLIQUID", or "SOLANA"
- `USE_SWARM_MODE`: True for 6-model consensus
- `LONG_ONLY`: True to disable shorting
- `MAX_POSITION_PERCENTAGE`: % of balance per position
- `LEVERAGE`: Leverage multiplier (1-125x)

### API Endpoints
The backend exposes these endpoints:
- `GET /api/us-stocks/account` - Get account balance
- `POST /api/us-stocks/trade` - Execute trade
- `GET /api/us-stocks/market-data/{symbol}` - Get market data
- `GET /api/agents/status` - Get agent status
- `POST /api/agents/{name}/start` - Start agent
- `POST /api/agents/{name}/stop` - Stop agent
- `WS /ws` - WebSocket for real-time updates

## 🎨 UI Components

### Design System
- **Colors**: Custom CSS variables in `frontend/src/index.css`
- **Glass Panels**: `.glass-panel` class for glassmorphism
- **Buttons**: `.btn-primary`, `.btn-secondary`
- **Animations**: Fade-in, pulse, glow effects

### Key Components
- **Sidebar**: Navigation with active state
- **CommandPalette**: Quick navigation (Cmd+K)
- **ErrorBoundary**: Catch and display errors
- **NotificationContainer**: Toast notifications
- **AppContext**: Global state management

## 🔐 Security

⚠️ **Important Security Notes**:
- Never commit your `.env` file
- Use paper trading accounts for testing
- API keys should have minimal permissions
- This is for educational purposes only

## 📚 Features

### Real-Time Updates
- ✅ WebSocket connection with auto-reconnect
- ✅ Live agent status updates
- ✅ Real-time health monitoring
- ✅ Trade execution notifications
- ✅ Connection status tracking

### Error Handling
- ✅ Error boundaries catch React errors
- ✅ Toast notifications for all events
- ✅ Retry logic with exponential backoff
- ✅ User-friendly error messages
- ✅ Loading states everywhere

### State Management
- ✅ Context API for global state
- ✅ localStorage persistence
- ✅ WebSocket integration
- ✅ Auto-reconnection
- ✅ Notification system

## 🛠️ Development

### Running in Development
```bash
# Backend with auto-reload
python src/server.py

# Frontend with hot reload
cd frontend
npm run dev
```

### Building for Production
```bash
cd frontend
npm run build
```

## ⚠️ Disclaimer

**IMPORTANT**: This is an experimental research project, NOT a production trading system.

- No guarantees of profitability
- Trading involves substantial risk of loss
- Past performance does not indicate future results
- Use at your own risk
- Always do your own research (DYOR)

This software is provided "as is" without warranty of any kind.

## 📜 License

MIT License - See LICENSE file for details

## 🙏 Credits

- **VortigenOS**: Advanced AI trading platform
- **Moon Dev**: Original AI agents and infrastructure
- **Community**: Open source contributors

## 📞 Support

- **Documentation**: See `docs/` folder
- **API Docs**: http://localhost:8000/docs
- **Issues**: GitHub Issues

---

Built with ❤️ by the VortigenOS team  
**Powered by FastAPI, React, and WebSockets**
