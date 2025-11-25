# VORTIGEN / SynergyOS v5.0
Welcome to VORTIGEN, an institutional-grade, multi-agent AI trading command center. This interface provides a 'God Mode' view for commanding and monitoring AI agents, portfolio performance, and risk metrics in a real-time, simulated environment.

This project is built with React 19, TypeScript, and leverages the Gemini API for its AI capabilities. It runs entirely in your browser with no backend required, simulating a complex, resilient, and intelligent trading system.

## ✨ Features

- **"God Mode" Command Center**: A unified interface to monitor and command a swarm of 36+ specialized AI agents and 45+ bots.
- **Cognitive Command Palette (`Cmd+K`)**: Issue natural language commands to the entire system. The AI uses Gemini's Function Calling to navigate, filter data, and perform actions.
- **Multi-Agent Dashboard**: Monitor the health, accuracy, latency, and trades of all agents in real-time.
- **Advanced Risk Hub**: A dedicated dashboard for institutional-grade risk analysis, including Value at Risk (VaR), stress testing, and agent risk contribution.
- **Live Activity Feed**: A real-time stream of decisions, executions, and alerts from the entire agent network with one-click CSV export for compliance.
- **Interactive AI Assistants**:
  - **Live Voice Assist**: Engage in real-time voice conversations with a Gemini-powered assistant.
  - **Text Chat Widget**: A powerful chat interface with a "Thinking Mode" (Gemini 1.5 Pro) and "Web Search" grounding.
- **Strategy Evolution Lab**: Simulate a genetic algorithm to evolve, test, promote, and compare trading strategies side-by-side.
- **Agent Forum**: Observe autonomous agents as they debate market events, reach a consensus, and propose actionable signals for your final approval.

## 🛠️ Tech Stack

- **Frontend**: React 19, TypeScript, Tailwind CSS
- **AI**: Google Gemini API (Flash, Pro, TTS, Live, Function Calling)
- **State Management**: React Context with a hardened reducer pattern
- **Charting**: Lightweight, custom SVG-based charting (no external libraries)
- **Icons**: Lucide React

---

## 🚀 Local Installation & Launch Guide (A-Z)

Follow these steps to get VORTIGEN running locally for testing and development.

### 1. Prerequisites

Ensure you have the following tools installed on your system.

| Tool       | Version | Installation Command                               |
|------------|---------|----------------------------------------------------|
| **Python** | 3.8+    | `brew install python` / `sudo apt install python3`   |
| **Node.js**| 18+     | `nvm install 18 && nvm use 18`                     |
| **Git**    | 2.30+   | `brew install git` / `sudo apt install git`        |

*Note: A simple Python server is used only to serve the static files locally. The entire application logic runs in the browser.*

### 2. Installation (2 minutes)

**Step 1: Get the Code**
Clone the repository or download and extract the project files to a local directory.

**Step 2: Configure Environment**
Create a file named `.env` in the root of the project. This is where you will put your Google Gemini API key.

```bash
# Create the file
touch .env

# Open and edit the file to add your key
echo "API_KEY=YOUR_GEMINI_API_KEY_HERE" > .env
```
*You can get a free API key from [Google AI Studio](https://aistudio.google.com/app/apikey).*

**Step 3: Install Dependencies**
There are no `npm` dependencies to install, as all modules are loaded directly in the browser via an `importmap`.

### 3. Backtesting & Validation (Simulated)

The VORTIGEN platform includes several built-in tools for testing and validating strategies before "paper trading" begins.

**Step 1: Run a Simulated Backtest**
1. Launch the application (see next section).
2. Navigate to the **"Analytics"** tab.
3. The historical price chart will show simulated data for AAPL. Use the timeframe selectors (1D, 7D, etc.) to see how the data fetching service (`dataAggregator`) simulates calls to different providers and handles failover.

**Step 2: Validate Strategy Evolution**
1. Navigate to the **"Strategy Lab"** tab.
2. Select a "Parent Strategy" (e.g., 'Intraday Momentum').
3. Click **"Generate New Mutation"**. This simulates the `StrategyGeneratorAgent` creating and backtesting a new variation. Observe its performance (Sharpe, Drawdown) relative to the parent.
4. Click **"Evolve Next Generation"**. This simulates a full genetic algorithm cycle, culling underperformers and creating a new generation of strategies.

### 4. Launching the Application for Testing

**Step 1: Start the Local Server**
Open your terminal in the project's root directory and run the simple Python web server.

```bash
python3 -m http.server 8000
```
This will start serving the files on port 8000. You should see output like:
`Serving HTTP on 0.0.0.0 port 8000 (http://0.0.0.0:8000/) ...`

**Step 2: Open in Browser**
Open your web browser and navigate to:
[http://localhost:8000](http://localhost:8000)

The VORTIGEN application should load and initialize. The system status will show as "ACTIVE," and the simulation loops will begin running.

### 5. Validation Checklist (What to Test)

Once the application is running, perform these checks to ensure everything is working correctly:

| Test                      | Action                                                                   | Expected Result                                                                    |
|---------------------------|--------------------------------------------------------------------------|------------------------------------------------------------------------------------|
| **Agent Health Simulation** | Go to the **Agents** tab. Watch the health percentages over a few minutes. | Agent health will slowly degrade. Some may turn yellow or red.                       |
| **Circuit Breaker**       | Wait for an agent's health to drop or errors to accumulate.              | The agent's status will flip to "error," and its controls will be disabled.          |
| **Signal Generation**     | Go to the **Activity** tab.                                              | New "DECISION" and "EXECUTION" activities should appear every 5-15 seconds.        |
| **AI Insights**           | Go to the **Insights** tab and click "Generate New Insights".            | New insight cards will appear with text generated by the Gemini API.                 |
| **Live Voice Assist**     | Go to the **Live Assist** tab, click the microphone, and speak.          | The agent should transcribe your speech and respond with synthesized audio.         |
| **Command Palette**       | Press `Cmd+K` and type "show risk hub".                                  | The application should navigate to the **Risk Hub** tab.                             |
| **Report Generation**     | In the header, click the report icon and generate a report.              | A print preview will appear with an HTML report generated by Gemini.                 |
| **API Key Validation**    | Go to the **Config** tab. Disable a provider or remove its key and save. | A notification should appear, and warnings will show on the config screen.           |
