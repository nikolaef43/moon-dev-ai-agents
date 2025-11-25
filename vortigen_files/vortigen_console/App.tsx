import React, { useState, useCallback, useEffect } from 'react';
import { AIMode, View, SystemState, SimulationResult, AuditLog, StrategyType, BacktestResult } from './types';
import { generateResponse } from './services/geminiService';
import { MOCK_SYSTEM_STATE, generateLogEntry, triggerEvolutionEvent, processConsensusEvents, processAIBoardEvents, processBoardroomEvents } from './mockData';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './views/Dashboard';
import { Agents } from './views/Agents';
import { Strategies } from './views/Strategies';
import { Risk } from './views/Risk';
import { AuditLogView } from './views/AuditLog';
import { Collective } from './views/Swarm';
import { Evolution } from './views/Evolution';
import { Simulation } from './views/Simulation';
import { DataDiscovery } from './views/DataDiscovery';
import { Consensus } from './views/Consensus';
import { AIBoard } from './views/AIBoard';
import { Quantum } from './views/Quantum';
import { Router } from './views/Router';
import { Predictions } from './views/Analysis';
import { Boardroom } from './views/Boardroom';

const App: React.FC = () => {
  const [view, setView] = useState<View>('dashboard');
  const [systemState, setSystemState] = useState<SystemState>(MOCK_SYSTEM_STATE);

  useEffect(() => {
    const logInterval = setInterval(() => {
        setSystemState(prevState => {
            const newLog = generateLogEntry(prevState.agents);
            return {
                ...prevState,
                auditLogs: [newLog, ...prevState.auditLogs].slice(0, 100)
            };
        });
    }, 4000);

    const evolutionInterval = setInterval(() => {
        setSystemState(prevState => triggerEvolutionEvent(prevState));
    }, 10000);

    const consensusInterval = setInterval(() => {
        setSystemState(prevState => processConsensusEvents(prevState));
    }, 3000);

    const aiBoardInterval = setInterval(() => {
        setSystemState(prevState => processAIBoardEvents(prevState));
    }, 7000);

    const boardroomInterval = setInterval(() => {
        setSystemState(prevState => processBoardroomEvents(prevState));
    }, 5000);

    return () => {
        clearInterval(logInterval);
        clearInterval(evolutionInterval);
        clearInterval(consensusInterval);
        clearInterval(aiBoardInterval);
        clearInterval(boardroomInterval);
    };
  }, []);
  
  const handleSend = useCallback(async (prompt: string, mode: AIMode) => {
    if (!prompt) return null;
    try {
      const response = await generateResponse(prompt, mode, systemState);
      return response;
    } catch (error) {
      console.error("Failed to get response from AI", error);
      return { text: 'An error occurred while contacting the AI.' };
    }
  }, [systemState]);

  const handleSimulationComplete = useCallback((result: SimulationResult) => {
    setSystemState(prevState => {
      const newLog = {
        id: new Date().toISOString() + Math.random(),
        timestamp: new Date().toISOString(),
        level: 'CONSENSUS' as const,
        message: `Simulation Complete for ${result.strategy} under ${result.scenario}. Key Learning: "${result.collectiveAdaptation}" integrated into collective logic.`
      };
      return {
        ...prevState,
        auditLogs: [newLog, ...prevState.auditLogs].slice(0, 100)
      };
    });
  }, []);

  const handleAgentCommand = useCallback((agentId: string, side: 'Buy' | 'Sell', symbol: string, quantity: number) => {
    setSystemState(prevState => {
      const newLog: AuditLog = {
        id: new Date().toISOString() + Math.random(),
        timestamp: new Date().toISOString(),
        level: 'CRITICAL',
        agentId: agentId,
        message: `Manual Override: Executing ${side.toUpperCase()} order for ${quantity} ${symbol}.`
      };
      return {
        ...prevState,
        auditLogs: [newLog, ...prevState.auditLogs].slice(0, 100)
      };
    });
  }, []);
  
  const handleAgentConfiguration = useCallback((agentId: string, config: { risk_tolerance: number, adaptation_speed: number }) => {
    setSystemState(prevState => {
      const updatedAgents = prevState.agents.map(agent => {
        if (agent.id === agentId) {
            return {
                ...agent,
                genes: {
                    ...agent.genes,
                    risk_tolerance: config.risk_tolerance,
                    adaptation_speed: config.adaptation_speed
                },
                genomeVersion: agent.genomeVersion.includes('-m') ? agent.genomeVersion : agent.genomeVersion + '-m'
            };
        }
        return agent;
      });
      
      const newLog: AuditLog = {
        id: new Date().toISOString() + Math.random(),
        timestamp: new Date().toISOString(),
        level: 'WARN',
        agentId: agentId,
        message: `Manual Configuration: Risk Tolerance -> ${(config.risk_tolerance * 100).toFixed(0)}%, Adaptation Speed -> ${(config.adaptation_speed * 100).toFixed(0)}%.`
      };

      return {
        ...prevState,
        agents: updatedAgents,
        auditLogs: [newLog, ...prevState.auditLogs].slice(0, 100)
      };
    });
  }, []);

  const handleRunBacktest = useCallback((strategy: StrategyType, startDate: string, endDate: string, initialCapital: number) => {
    setSystemState(prevState => {
      const newLog: AuditLog = {
        id: new Date().toISOString() + Math.random(),
        timestamp: new Date().toISOString(),
        level: 'INFO',
        message: `Backtest initiated for '${strategy}' from ${startDate} to ${endDate} with $${initialCapital.toLocaleString()}.`
      };
       return {
        ...prevState,
        auditLogs: [newLog, ...prevState.auditLogs].slice(0, 100)
      };
    });
  }, []);


  const renderView = () => {
    switch (view) {
      case 'dashboard':
        return <Dashboard systemState={systemState} onSend={handleSend} />;
      case 'board':
        return <AIBoard aiBoardState={systemState.aiBoardState} />;
      case 'boardroom':
        return <Boardroom boardEvents={systemState.boardEvents} />;
      case 'router':
        return <Router modelRoutes={systemState.modelRoutes} boardMembers={systemState.aiBoardState.members} />;
      case 'agents':
        return <Agents agents={systemState.agents} strategies={systemState.strategies} onCommand={handleAgentCommand} onConfigure={handleAgentConfiguration} />;
      case 'consensus':
        return <Consensus consensusSignals={systemState.consensusSignals} agents={systemState.agents} />;
      case 'collective':
          return <Collective collectiveState={systemState.collectiveState} />;
      case 'evolution':
          return <Evolution evolutionaryState={systemState.evolutionaryState} auditLogs={systemState.auditLogs} />;
      case 'simulation':
          return <Simulation strategies={systemState.strategies} onSimulationComplete={handleSimulationComplete} />;
      case 'predictions':
          return <Predictions predictions={systemState.predictions} />;
      case 'quantum':
          return <Quantum quantumAddons={systemState.quantumAddons} />;
      case 'data':
          return <DataDiscovery dataSources={systemState.dataSources} />;
      case 'strategies':
          return <Strategies strategies={systemState.strategies} onRunBacktest={handleRunBacktest} />;
      case 'risk':
          return <Risk circuitBreaker={systemState.circuitBreaker} />;
      case 'logs':
          return <AuditLogView logs={systemState.auditLogs} />;
      default:
        return <Dashboard systemState={systemState} onSend={handleSend} />;
    }
  };

  return (
    <div className="h-full w-full flex font-sans bg-gray-900 text-gray-100">
      <Sidebar currentView={view} setView={setView} systemState={systemState} />
      <main className="flex-1 flex flex-col overflow-hidden">
        {renderView()}
      </main>
    </div>
  );
};

export default App;