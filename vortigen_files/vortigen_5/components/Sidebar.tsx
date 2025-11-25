
import React from 'react';
import { BarChart3, Target, TerminalSquare, Zap, LineChart, Activity, Settings, Flame, FlaskConical, Mic, Eye, ShieldAlert, Archive, Wind, BotMessageSquare, MessageSquare, BrainCircuit, Users, Bot, ChevronRight, Workflow as WorkflowIcon, Globe, TestTube, Construction, ShieldCheck } from 'lucide-react';
import { ActiveTab, TradingMode } from '../types';
import { useAppContext } from '../context/AppContext';

interface SidebarProps {
  showSidebar: boolean;
}

const NavButton: React.FC<{
  id: ActiveTab;
  label: string;
  icon: React.ElementType;
  activeTab: ActiveTab;
  onClick: (id: ActiveTab) => void;
}> = ({ id, label, icon: Icon, activeTab, onClick }) => (
  <button
    onClick={() => onClick(id)}
    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all font-medium text-left ${
      activeTab === id
        ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/50"
        : "text-slate-400 hover:bg-slate-800"
    }`}
    aria-label={`Go to ${label}`}
  >
    <Icon size={18} />
    {label}
  </button>
);

const NavGroup: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <details open className="group">
        <summary className="px-4 pt-4 pb-2 text-xs font-semibold text-slate-500 uppercase tracking-wider cursor-pointer list-none flex justify-between items-center">
            {title}
            <ChevronRight size={14} className="group-open:rotate-90 transition-transform"/>
        </summary>
        <div className="space-y-1">
            {children}
        </div>
    </details>
);


const Sidebar: React.FC<SidebarProps> = ({ showSidebar }) => {
  const { state, dispatch } = useAppContext();
  const { activeTab, tradingMode, aiAgents, aiBots } = state;

  const setActiveTab = (tab: ActiveTab) => {
    dispatch({ type: 'SET_ACTIVE_TAB', payload: tab });
  };

  const setTradingMode = (mode: TradingMode) => {
    dispatch({ type: 'SET_TRADING_MODE', payload: mode });
  };

  const tabGroups = [
      {
          title: "CORE",
          tabs: [
              { id: 'overview' as ActiveTab, label: 'Overview', icon: BarChart3 },
              { id: 'agents' as ActiveTab, label: `Agent Network (${aiAgents.length})`, icon: Users },
              { id: 'bots' as ActiveTab, label: `Bot Fleet (${aiBots.length})`, icon: Bot },
              { id: 'agentCommand' as ActiveTab, label: 'Agent Command', icon: TerminalSquare },
              { id: 'positions' as ActiveTab, label: 'Your Positions', icon: Target },
              { id: 'options' as ActiveTab, label: 'Options', icon: Flame },
              { id: 'workflow' as ActiveTab, label: 'Workflow', icon: WorkflowIcon },
          ]
      },
      {
          title: "ANALYTICS & EVOLUTION",
          tabs: [
              { id: 'aiBoard' as ActiveTab, label: 'AI Board', icon: Users },
              { id: 'causalAnalytics' as ActiveTab, label: 'Causal Analytics', icon: TestTube },
              { id: 'risk' as ActiveTab, label: 'Risk Hub', icon: ShieldAlert },
              { id: 'volatility' as ActiveTab, label: 'Volatility', icon: Wind },
              { id: 'strategyLab' as ActiveTab, label: 'Strategy Lab', icon: FlaskConical },
              { id: 'systemEvolution' as ActiveTab, label: 'System Evolution', icon: BrainCircuit },
          ]
      },
      {
          title: "AI FEEDS",
          tabs: [
              { id: 'insights' as ActiveTab, label: 'AI Insights', icon: Zap },
              { id: 'socialSentiment' as ActiveTab, label: 'Social Sentiment', icon: MessageSquare },
              { id: 'agentForum' as ActiveTab, label: 'Agent Forum', icon: BotMessageSquare },
              { id: 'manifoldInspector' as ActiveTab, label: 'Manifold Inspector', icon: Construction },
              { id: 'economicTwin' as ActiveTab, label: 'Economic Twin', icon: Globe },
              { id: 'liveAssist' as ActiveTab, label: 'Live AI Assist', icon: Mic },
          ]
      },
      {
          title: "SYSTEM & LOGS",
          tabs: [
              { id: 'activity' as ActiveTab, label: 'Live Activity', icon: Activity },
              { id: 'logSafe' as ActiveTab, label: 'Log Safe', icon: Archive },
              { id: 'config' as ActiveTab, label: 'Configuration', icon: Settings },
              { id: 'systemAudit' as ActiveTab, label: 'System Audit', icon: ShieldCheck },
          ]
      }
  ];


  if (!showSidebar) return null;

  return (
    <aside className="w-72 bg-slate-950 border-r border-slate-800 flex flex-col no-print">
      <div className="p-6 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center font-black text-lg">V</div>
          <div>
            <h1 className="font-bold text-xl">VORTIGEN</h1>
            <p className="text-xs text-slate-500">Command Center</p>
          </div>
        </div>
      </div>
      <nav className="flex-1 p-4 overflow-y-auto">
        {tabGroups.map(group => (
            <NavGroup title={group.title} key={group.title}>
                {group.tabs.map(tab => (
                    <NavButton
                        key={tab.id}
                        id={tab.id}
                        label={tab.label}
                        icon={tab.icon}
                        activeTab={activeTab}
                        onClick={setActiveTab}
                    />
                ))}
            </NavGroup>
        ))}
      </nav>
      <div className="p-4 border-t border-slate-800">
        <div className="bg-slate-900 rounded-lg p-4 mb-3">
          <div className="text-sm font-bold mb-3">Trading Mode</div>
          <div className="flex gap-2">
            {(['paper', 'live'] as TradingMode[]).map((mode) => (
              <button
                key={mode}
                onClick={() => setTradingMode(mode)}
                className={`flex-1 py-2 rounded text-sm font-semibold ${
                  tradingMode === mode
                    ? mode === "paper" ? "bg-blue-600 text-white" : "bg-red-600 text-white"
                    : "bg-slate-800 text-slate-300"
                }`}
                aria-label={`Switch to ${mode} mode`}
              >
                {mode.charAt(0).toUpperCase() + mode.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
