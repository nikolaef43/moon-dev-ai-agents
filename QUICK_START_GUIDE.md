# 🚀 QUICK START GUIDE - 30 Minutes to Running System

**Last Updated:** 2025-11-24  
**Estimated Time:** 30 minutes  
**Difficulty:** Easy  

---

## 📋 PREREQUISITES

Before starting, ensure you have:
- [ ] **Windows 10/11** (or Mac/Linux)
- [ ] **Python 3.10+** installed
- [ ] **Node.js 18+** installed
- [ ] **Git** installed (optional)
- [ ] **Text editor** (VS Code, Notepad++, etc.)

**Check your versions:**
```powershell
python --version  # Should be 3.10+
node --version    # Should be 18+
npm --version     # Should be 9+
```

---

## ⏱️ STEP-BY-STEP GUIDE

### STEP 1: Create .env File (10 minutes)

#### 1.1 Navigate to Project Directory
```powershell
cd c:\Users\n_psa\moon-dev-ai-agents
```

#### 1.2 Copy Template
```powershell
Copy-Item .env_example .env
```

#### 1.3 Edit .env File
Open `.env` in your text editor and add **at minimum**:

```bash
# ===== REQUIRED FOR STARTUP =====

# AI Model (choose ONE):
ANTHROPIC_KEY=sk-ant-...           # Get from: https://console.anthropic.com/
# OR
OPENAI_KEY=sk-...                  # Get from: https://platform.openai.com/
# OR
DEEPSEEK_KEY=...                   # Get from: https://platform.deepseek.com/

# Market Data (for Solana):
BIRDEYE_API_KEY=...                # Get from: https://birdeye.so/
RPC_ENDPOINT=https://...           # Get from: https://helius.dev/

# ===== OPTIONAL (for trading) =====

# Solana Trading:
SOLANA_PRIVATE_KEY=...             # Your wallet private key (Base58)

# HyperLiquid Trading:
HYPER_LIQUID_ETH_PRIVATE_KEY=...   # Your ETH private key

# US Stocks (Alpaca):
ALPACA_API_KEY=...                 # Get from: https://alpaca.markets/
ALPACA_SECRET_KEY=...
ALPACA_BASE_URL=https://paper-api.alpaca.markets  # Paper trading
```

#### 1.4 Verify .env File
```powershell
Test-Path .env  # Should return: True
```

**⚠️ SECURITY WARNING:**
- Never commit `.env` to Git
- Never share your private keys
- Use paper trading accounts first

---

### STEP 2: Install Python Dependencies (15 minutes)

#### 2.1 Install Main Dependencies
```powershell
pip install -r requirements.txt
```

**Expected output:**
```
Collecting anthropic==0.40.0...
Collecting fastapi==0.115.5...
...
Successfully installed 640 packages
```

#### 2.2 Handle Special Cases (Windows)

**If TA-Lib fails:**
```powershell
# Download wheel from: https://www.lfd.uci.edu/~gohlke/pythonlibs/
# Then install:
pip install TA_Lib-0.4.32-cp310-cp310-win_amd64.whl
```

**If PyAudio fails:**
```powershell
pip install pipwin
pipwin install pyaudio
```

#### 2.3 Verify Installation
```powershell
python -c "import fastapi, anthropic, solana; print('✅ All imports successful')"
```

**Expected output:**
```
✅ All imports successful
```

---

### STEP 3: Install Frontend Dependencies (5 minutes)

#### 3.1 Navigate to Frontend
```powershell
cd frontend
```

#### 3.2 Install npm Packages
```powershell
npm install
```

**Expected output:**
```
added 500 packages in 45s
```

#### 3.3 Verify Installation
```powershell
npm list react
```

**Expected output:**
```
frontend@0.0.0
└── react@19.2.0
```

#### 3.4 Return to Root
```powershell
cd ..
```

---

### STEP 4: Start the System (2 minutes)

#### 4.1 Quick Start (Windows)
```powershell
# Double-click this file:
start_app.bat
```

**This will open TWO terminal windows:**
1. **Backend** - Python FastAPI server
2. **Frontend** - Vite dev server

#### 4.2 Manual Start (Alternative)

**Terminal 1 - Backend:**
```powershell
python src/server.py
```

**Expected output:**
```
INFO:     Started server process [12345]
INFO:     Waiting for application startup.
INFO:     Application startup complete.
INFO:     Uvicorn running on http://0.0.0.0:8000
```

**Terminal 2 - Frontend:**
```powershell
cd frontend
npm run dev
```

**Expected output:**
```
  VITE v7.2.4  ready in 500 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
  ➜  press h + enter to show help
```

---

### STEP 5: Verify System (3 minutes)

#### 5.1 Check Backend
Open browser to: **http://localhost:8000**

**Expected response:**
```json
{
  "status": "online",
  "message": "Moon Dev Local Console API is running 🌙"
}
```

#### 5.2 Check API Docs
Open browser to: **http://localhost:8000/docs**

You should see **Swagger UI** with all endpoints.

#### 5.3 Check Frontend
Open browser to: **http://localhost:5173**

You should see:
- 🌙 Moon Dev logo
- Dark theme UI
- Sidebar with Dashboard, US Stocks, Agents
- Command Palette hint (Cmd+K)

#### 5.4 Test Command Palette
Press **Ctrl+K** (Windows) or **Cmd+K** (Mac)

You should see a search box with navigation options.

---

## ✅ SUCCESS CHECKLIST

After completing all steps, verify:

- [ ] Backend running on http://localhost:8000
- [ ] Frontend running on http://localhost:5173
- [ ] API docs accessible at /docs
- [ ] Dashboard loads without errors
- [ ] Command Palette opens (Ctrl+K)
- [ ] No console errors in browser (F12)

**If all checked:** 🎉 **SYSTEM IS READY!**

---

## 🐛 TROUBLESHOOTING

### Issue: "Port 8000 already in use"

**Solution:**
```powershell
# Find process using port 8000:
netstat -ano | findstr :8000

# Kill process (replace PID):
taskkill /PID <PID> /F
```

### Issue: "Port 5173 already in use"

**Solution:**
```powershell
# Find process using port 5173:
netstat -ano | findstr :5173

# Kill process (replace PID):
taskkill /PID <PID> /F
```

### Issue: "Module not found: anthropic"

**Solution:**
```powershell
# Reinstall dependencies:
pip install -r requirements.txt --force-reinstall
```

### Issue: "npm ERR! code ENOENT"

**Solution:**
```powershell
cd frontend
rm -rf node_modules package-lock.json
npm install
```

### Issue: "API key invalid"

**Solution:**
1. Open `.env` file
2. Verify API key format (no quotes, no spaces)
3. Test key at provider's website
4. Restart backend server

### Issue: "CORS error in browser console"

**Solution:**
1. Verify backend is running on port 8000
2. Check `src/server.py` CORS settings
3. Clear browser cache (Ctrl+Shift+Delete)
4. Restart both servers

### Issue: "Cannot find module 'react'"

**Solution:**
```powershell
cd frontend
npm install react react-dom
```

---

## 📊 SYSTEM STATUS INDICATORS

### Backend Healthy ✅
```
INFO:     Uvicorn running on http://0.0.0.0:8000
```

### Frontend Healthy ✅
```
➜  Local:   http://localhost:5173/
```

### Backend Error ❌
```
ERROR:    [Errno 10048] error while attempting to bind on address
```
**Fix:** Port 8000 in use (see troubleshooting)

### Frontend Error ❌
```
EADDRINUSE: address already in use :::5173
```
**Fix:** Port 5173 in use (see troubleshooting)

---

## 🎯 NEXT STEPS

### After System is Running:

#### 1. Explore the UI (5 minutes)
- [ ] Navigate to Dashboard
- [ ] Check US Stocks page
- [ ] View Agents page
- [ ] Try Command Palette (Ctrl+K)

#### 2. Configure Trading (10 minutes)
- [ ] Open `src/config.py`
- [ ] Set `EXCHANGE` (solana, hyperliquid, aster)
- [ ] Configure `MAX_POSITION_PERCENTAGE`
- [ ] Set `LONG_ONLY = True` (safer)
- [ ] Review risk limits

#### 3. Test an Agent (15 minutes)
- [ ] Open terminal
- [ ] Run: `python src/agents/sentiment_agent.py`
- [ ] Watch for Twitter sentiment analysis
- [ ] Press Ctrl+C to stop

#### 4. Read Documentation (30 minutes)
- [ ] `README.md` - Full project overview
- [ ] `CONSOLE_README.md` - Console guide
- [ ] `FULL_AUDIT_REPORT.md` - Complete audit
- [ ] `CRITICAL_ISSUES_CHECKLIST.md` - Security fixes

#### 5. Join Community (5 minutes)
- [ ] Discord: https://discord.gg/8UPuVZ53bh
- [ ] Watch tutorials: YouTube playlist
- [ ] Star GitHub repo

---

## 🔐 SECURITY REMINDERS

Before trading with real money:

- [ ] **Use paper trading** accounts first
- [ ] **Test thoroughly** with small amounts
- [ ] **Review risk limits** in config.py
- [ ] **Backup your .env** file securely
- [ ] **Never share** private keys
- [ ] **Monitor positions** actively
- [ ] **Set stop losses** appropriately
- [ ] **Understand the risks** fully

---

## 📚 LEARNING PATH

### Beginner (Week 1)
1. Get system running (this guide)
2. Explore UI and features
3. Read all documentation
4. Watch video tutorials
5. Join Discord community

### Intermediate (Week 2-4)
1. Configure trading settings
2. Run backtesting agents
3. Test with paper trading
4. Customize agents
5. Build custom strategies

### Advanced (Month 2+)
1. Live trading (small amounts)
2. Multi-exchange trading
3. Custom agent development
4. Strategy optimization
5. Production deployment

---

## 🆘 GETTING HELP

### Self-Help Resources
1. **Documentation:** See `docs/` folder
2. **Audit Reports:** Read FULL_AUDIT_REPORT.md
3. **GitHub Issues:** Search existing issues
4. **Video Tutorials:** YouTube playlist

### Community Support
1. **Discord:** https://discord.gg/8UPuVZ53bh
2. **GitHub Discussions:** Ask questions
3. **Community Forum:** Share strategies

### Commercial Support
1. **Email:** moon@algotradecamp.com
2. **Website:** https://moondev.com
3. **Education:** https://algotradecamp.com

---

## 📈 PROGRESS TRACKER

Track your setup progress:

```
Setup Progress: [█████░░░░░] 50%

✅ Prerequisites checked
✅ .env file created
✅ Python dependencies installed
✅ Frontend dependencies installed
✅ Backend started
⬜ Frontend started
⬜ System verified
⬜ First agent tested
⬜ Documentation read
⬜ Community joined
```

---

## 🎓 WHAT YOU'VE ACCOMPLISHED

After completing this guide, you have:

✅ **Installed** a production-grade AI trading platform  
✅ **Configured** 55 specialized AI agents  
✅ **Connected** to multiple exchanges  
✅ **Deployed** a premium web console  
✅ **Learned** the system architecture  

**Total Time Invested:** ~30 minutes  
**Value Created:** Priceless 🚀

---

## 🌟 FINAL TIPS

1. **Start Small:** Use paper trading first
2. **Learn Continuously:** Read docs, watch videos
3. **Test Everything:** Never trust, always verify
4. **Manage Risk:** Set limits, use stop losses
5. **Stay Updated:** Join Discord for updates
6. **Contribute:** Share your improvements
7. **Have Fun:** Enjoy the journey! 🌙

---

**System Status:** ✅ READY TO LAUNCH  
**Next Action:** Double-click `start_app.bat`  
**Time to Success:** 30 minutes  

**Good luck, and happy trading! 🚀**
