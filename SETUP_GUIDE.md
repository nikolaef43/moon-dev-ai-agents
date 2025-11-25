# 🔧 VortigenOS - Setup & Troubleshooting Guide

## 🚨 Current Issue: Python Environment

### Problem
The system Python (Python 3.13) doesn't have pip or the required packages installed.

### Solution Options

#### Option 1: Use Conda Environment (Recommended)
```bash
# Create conda environment
conda create -n vortigenos python=3.10.9
conda activate vortigenos

# Install dependencies
pip install -r requirements.txt

# Start backend
python src/server.py
```

#### Option 2: Install pip for Python 3.13
```bash
# Download get-pip.py
curl https://bootstrap.pypa.io/get-pip.py -o get-pip.py

# Install pip
python get-pip.py

# Install dependencies
python -m pip install fastapi uvicorn websockets python-multipart

# Start backend
python src/server.py
```

#### Option 3: Use Python 3.11 (if available)
```bash
# Check if Python 3.11 is available
py -3.11 --version

# Install dependencies
py -3.11 -m pip install fastapi uvicorn websockets python-multipart

# Start backend
py -3.11 src/server.py
```

## 📋 Complete Setup Steps

### 1. Python Environment Setup

**Check Python version:**
```bash
python --version
```

**Recommended: Python 3.10 or 3.11**

### 2. Install Backend Dependencies

```bash
# Using pip
pip install fastapi uvicorn websockets python-multipart pydantic

# Or using requirements.txt (if conda env)
pip install -r requirements.txt
```

### 3. Install Frontend Dependencies

```bash
cd frontend
npm install
cd ..
```

### 4. Configure Environment Variables

Create `.env` file in root directory:
```bash
# AI Model APIs (at least one required)
ANTHROPIC_KEY=your_anthropic_api_key
OPENAI_KEY=your_openai_api_key
DEEPSEEK_KEY=your_deepseek_api_key

# Trading APIs (optional - for paper trading)
ALPACA_API_KEY=your_alpaca_key
ALPACA_SECRET_KEY=your_alpaca_secret
ALPACA_BASE_URL=https://paper-api.alpaca.markets
```

### 5. Start VortigenOS

**Option A: Using start_app.bat (Windows)**
```bash
start_app.bat
```

**Option B: Manual start**
```bash
# Terminal 1 - Backend
python src/server.py

# Terminal 2 - Frontend
cd frontend
npm run dev
```

## 🐛 Common Issues & Solutions

### Issue 1: "No module named 'fastapi'"

**Solution:**
```bash
pip install fastapi uvicorn websockets
```

### Issue 2: "npm: command not found"

**Solution:**
- Install Node.js from https://nodejs.org/
- Restart terminal after installation

### Issue 3: "PowerShell execution policy"

**Solution:**
```bash
# Use cmd instead
cmd /c npm install
cmd /c npm run dev
```

### Issue 4: "Port 8000 already in use"

**Solution:**
```bash
# Find and kill process on port 8000
netstat -ano | findstr :8000
taskkill /PID <PID> /F
```

### Issue 5: "WebSocket connection failed"

**Solution:**
- Ensure backend is running on port 8000
- Check if firewall is blocking the connection
- Try refreshing the browser

### Issue 6: "Module not found" errors in frontend

**Solution:**
```bash
cd frontend
rm -rf node_modules package-lock.json
npm install
```

## 🔍 Verification Steps

### 1. Check Backend is Running
```bash
# Should return: {"status":"online","message":"VortigenOS API is running 🌙"...}
curl http://localhost:8000
```

### 2. Check Frontend is Running
```bash
# Open in browser
http://localhost:5173
```

### 3. Check WebSocket Connection
```bash
# In browser console, should see:
✅ WebSocket connected
```

### 4. Check API Docs
```bash
# Open in browser
http://localhost:8000/docs
```

## 📦 Required Packages

### Backend (Python)
- fastapi >= 0.110.0
- uvicorn >= 0.29.0
- websockets >= 12.0
- pydantic >= 2.5.0
- python-multipart >= 0.0.6

### Frontend (Node.js)
- react >= 19.2.0
- react-dom >= 19.2.0
- react-router-dom >= 7.9.0
- axios >= 1.13.0
- recharts >= 3.5.0
- lucide-react >= 0.554.0

## 🚀 Quick Start (After Setup)

### Start Backend
```bash
python src/server.py
```

**Expected output:**
```
🌙 VortigenOS API Starting...
📡 WebSocket endpoint: ws://localhost:8000/ws
🔗 API docs: http://localhost:8000/docs
INFO:     Uvicorn running on http://0.0.0.0:8000
```

### Start Frontend
```bash
cd frontend
npm run dev
```

**Expected output:**
```
VITE v7.x.x  ready in xxx ms

➜  Local:   http://localhost:5173/
➜  Network: use --host to expose
```

### Access VortigenOS
Open browser to: **http://localhost:5173**

## 📞 Getting Help

### Check Logs
- **Backend logs**: Terminal running `python src/server.py`
- **Frontend logs**: Terminal running `npm run dev`
- **Browser console**: F12 → Console tab

### Documentation
- `VORTIGENOS_README.md` - Full documentation
- `QUICK_START.md` - Quick reference
- `COMPLETION_REPORT.md` - Implementation details
- API Docs: http://localhost:8000/docs

## 🎯 Next Steps After Setup

1. ✅ Verify backend is running
2. ✅ Verify frontend is running
3. ✅ Open http://localhost:5173
4. ✅ Check WebSocket connection (green dot in header)
5. ✅ Test agent start/stop
6. ✅ Try executing a trade

---

**VortigenOS** - Advanced AI Trading Platform 🌙

**Need help?** Check the documentation or review the error messages in the terminal.
