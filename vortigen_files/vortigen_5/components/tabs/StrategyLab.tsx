
'use client';

// FIX: Import `PropsWithChildren` to correctly type the Tooltip component.
import React, { useState, useEffect, useCallback, PropsWithChildren } from 'react';
import {
  FlaskConical,
  Plus,
  ChevronRight,
  Check,
  X,
  Scale,
  Loader2,
  GripVertical,
  BrainCircuit,
  HelpCircle,
  Code,
  Copy,
  CheckCircle
} from 'lucide-react';
import DashboardCard from '../DashboardCard';
import { mutateStrategy, evolveStrategyGeneration } from '../../services/strategyMutationService';
import { useAppContext } from '../../context/AppContext';
import {
  Strategy,
  Mutation,
  SelectableItem,
  Activity,
} from '../../types';
import { XAUUSD_SWING_STRATEGY_CODE } from '../../utils/mql5Templates';
import CodeViewerModal from '../CodeViewerModal';

const ComparisonChart: React.FC<{ items: SelectableItem[] }> = ({ items }) => {
    const width = 800;
    const height = 300;
    const padding = { top: 20, right: 20, bottom: 30, left: 40 };

    const allDataPoints = items.flatMap(item => item.horizonPerformance || []);
    if (allDataPoints.length === 0) {
        return (
            <div className="h-[300px] flex items-center justify-center text-slate-500">
                No performance data to display for selected items.
            </div>
        );
    }

    const allValues = allDataPoints.map(p => p.value);
    const minVal = Math.min(...allValues);
    const maxVal = Math.max(...allValues);
    const valRange = maxVal - minVal === 0 ? 1 : maxVal - minVal;
    
    const dataLength = items[0]?.horizonPerformance?.length || 1;

    const xScale = (index: number) => padding.left + (index / (dataLength - 1)) * (width - padding.left - padding.right);
    const yScale = (value: number) => padding.top + (height - padding.top - padding.bottom) - ((value - minVal) / valRange) * (height - padding.top - padding.bottom);
    
    const colors = ['#22d3ee', '#a78bfa', '#f472b6', '#4ade80', '#facc15', '#fb923c'];

    return (
        <div className="relative">
            <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto bg-slate-950/50 rounded-lg">
                {/* Y-Axis Grid Lines */}
                {[...Array(5)].map((_, i) => {
                    const y = padding.top + i * ((height - padding.top - padding.bottom) / 4);
                    const value = maxVal - i * (valRange / 4);
                    return (
                        <g key={i}>
                            <line x1={padding.left} y1={y} x2={width - padding.right} y2={y} stroke="#334155" strokeWidth="1" />
                            <text x={padding.left - 8} y={y} fill="#94a3b8" fontSize="10" textAnchor="end" alignmentBaseline="middle">{value.toFixed(0)}</text>
                        </g>
                    )
                })}

                {/* Data Paths */}
                {items.map((item, itemIndex) => {
                    if (!item.horizonPerformance || item.horizonPerformance.length === 0) return null;
                    const pathData = item.horizonPerformance
                        .map((point, pointIndex) => `${pointIndex === 0 ? 'M' : 'L'} ${xScale(pointIndex)} ${yScale(point.value)}`)
                        .join(' ');
                    
                    return <path key={item.name + (item as any).id} d={pathData} stroke={colors[itemIndex % colors.length]} strokeWidth="2" fill="none" />;
                })}
            </svg>
            <div className="flex flex-wrap gap-x-4 gap-y-2 mt-4 justify-center">
                {items.map((item, index) => (
                    <div key={item.name + (item as any).id} className="flex items-center gap-2 text-xs">
                        <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: colors[index % colors.length] }}></div>
                        <span className="text-slate-300">{item.__type === 'strategy' ? item.name : `${item.parentName} / ${item.name}`}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};


const StrategyComparisonModal: React.FC<{
  items: SelectableItem[];
  onClose: () => void;
}> = ({ items, onClose }) => {
  const cellKey = (item: SelectableItem, metric: string) =>
    item.__type === 'strategy'
      ? `${item.name}-${metric}`
      : `${item.parentName}-mut${item.id}-${metric}`;

  return (
    <div
      className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-slate-900 border border-slate-700 rounded-xl shadow-2xl w-full max-w-6xl max-h-[90vh] flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-between items-center p-4 border-b border-slate-800">
          <h2 className="text-xl font-bold flex items-center gap-3">
            <Scale /> Strategy Comparison
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-800 rounded-full transition"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6 overflow-auto">
          <h3 className="text-lg font-bold mb-4 text-center">Simulated Performance Equity Curve</h3>
          <ComparisonChart items={items} />
          
          <h3 className="text-lg font-bold my-6 text-center">Quantitative Performance Metrics</h3>
          <div
            className="grid gap-x-4 gap-y-2"
            style={{
              gridTemplateColumns: `minmax(120px, 1.5fr) repeat(${items.length}, minmax(0, 1fr))`,
            }}
          >
            <div className="font-bold text-slate-400">Metric</div>
            {items.map(i => (
              <div
                key={cellKey(i, 'header')}
                className="font-bold text-center text-cyan-400 truncate"
              >
                {i.__type === 'strategy' ? i.name : `${i.name} (mut)`}
              </div>
            ))}

            {[
                { label: 'Sharpe Ratio', key: 'sharpe', format: (v: any) => v.toFixed(2), color: '' },
                { label: 'Max Drawdown', key: 'drawdown', format: (v: any) => `${v.toFixed(2)}%`, color: 'text-red-400' },
                { label: 'Stat. Edge (Z-Score)', key: 'statisticalEdge', format: (v: any) => v?.toFixed(2) || '—', color: 'text-green-400' },
                { label: 'Confidence', key: 'confidence', format: (v: any) => v ? `${(v * 100).toFixed(0)}%` : '—', color: 'text-blue-400' },
                { label: 'Uncertainty', key: 'uncertainty', format: (v: any) => v ? `${(v * 100).toFixed(0)}%` : '—', color: 'text-yellow-400' },
                { label: 'Fitness Score', key: 'fitness', format: (v: any) => v?.toFixed(1) || '—', color: 'text-purple-400' },
            ].map(metric => (
                <React.Fragment key={metric.key}>
                    <div className="font-semibold">{metric.label}</div>
                    {items.map(i => (
                        <div key={cellKey(i, metric.key)} className={`text-center font-mono ${metric.color}`}>
                            {metric.format((i as any)[metric.key])}
                        </div>
                    ))}
                </React.Fragment>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const PromotionModal: React.FC<{
    mutation: Mutation;
    parentStrategyName: string;
    onClose: () => void;
    onConfirm: (newName: string) => void;
}> = ({ mutation, parentStrategyName, onClose, onConfirm }) => {
    const [newName, setNewName] = useState(`${parentStrategyName} v${(Math.random() * 8 + 2).toFixed(1)}`);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (newName.trim()) {
            onConfirm(newName.trim());
        }
    };

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50" onClick={onClose}>
            <div className="bg-slate-900 border border-slate-700 rounded-xl shadow-2xl w-full max-w-md" onClick={e => e.stopPropagation()}>
                <form onSubmit={handleSubmit}>
                    <div className="p-6">
                        <h3 className="text-lg font-bold">Promote Mutation</h3>
                        <p className="text-sm text-slate-400 mt-1">
                            Promote <span className="font-bold text-cyan-400">{mutation.name}</span> to a new parent strategy.
                        </p>
                        <div className="mt-4">
                            <label htmlFor="strategy-name" className="block text-sm font-medium text-slate-300 mb-1">
                                New Parent Strategy Name
                            </label>
                            <input
                                id="strategy-name"
                                type="text"
                                value={newName}
                                onChange={(e) => setNewName(e.target.value)}
                                className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                                required
                            />
                        </div>
                    </div>
                    <div className="bg-slate-800/50 px-6 py-3 flex justify-end gap-3 rounded-b-xl">
                        <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-semibold rounded-lg bg-slate-700 hover:bg-slate-600">
                            Cancel
                        </button>
                        <button type="submit" className="px-4 py-2 text-sm font-semibold rounded-lg bg-green-600 hover:bg-green-700">
                            Confirm Promotion
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};


const StrategyLab: React.FC = () => {
  const { state, dispatch } = useAppContext();
  const { strategies } = state;

  const [selectedStrategy, setSelectedStrategy] = useState<Strategy | null>(null);
  const [isMutating, setIsMutating] = useState(false);
  const [isEvolving, setIsEvolving] = useState(false);
  const [compareItems, setCompareItems] = useState<SelectableItem[]>([]);
  const [showCompare, setShowCompare] = useState(false);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [promotionTarget, setPromotionTarget] = useState<Mutation | null>(null);
  const [evolutionLogs, setEvolutionLogs] = useState<string[]>([]);
  const [showCodeModal, setShowCodeModal] = useState(false);

  useEffect(() => {
    if (selectedStrategy) {
      const fresh = strategies.find(s => s.name === selectedStrategy.name);
      setSelectedStrategy(fresh ?? null);
    }
  }, [strategies, selectedStrategy?.name]);

  const isSameItem = (a: SelectableItem, b: SelectableItem): boolean => {
      if (a.__type !== b.__type) return false;
      if (a.__type === 'strategy' && b.__type === 'strategy') {
          return a.name === b.name;
      }
      if (a.__type === 'mutation' && b.__type === 'mutation') {
          return a.id === b.id;
      }
      return false;
  };

  const toggleCompare = (item: SelectableItem) => {
    setCompareItems(prev => {
        const exists = prev.some(p => isSameItem(p, item));
        if (exists) {
            return prev.filter(p => !isSameItem(p, item));
        } else {
            return [...prev, item];
        }
    });
  };
  
  const handleNewStrategy = useCallback(() => {
    const name = window.prompt("Enter a name for the new parent strategy:");
    if (name && name.trim()) {
        const trimmedName = name.trim();
        if (strategies.some(s => s.name.toLowerCase() === trimmedName.toLowerCase())) {
            dispatch({
                type: 'SHOW_NOTIFICATION',
                payload: { message: `Strategy '${trimmedName}' already exists.`, type: 'error' }
            });
            return;
        }
        const newStrategy: Strategy = {
            name: trimmedName,
            sharpe: 1.0, 
            drawdown: -20.0,
            mutations: [],
        };
        dispatch({ type: 'ADD_STRATEGY', payload: newStrategy });
        dispatch({
            type: 'SHOW_NOTIFICATION',
            payload: { message: `Strategy '${trimmedName}' created successfully.`, type: 'success' }
        });
    }
  }, [dispatch, strategies]);

  const generateMutation = async () => {
    if (!selectedStrategy) return;
    setIsMutating(true);
    setEvolutionLogs([]);
    try {
      const newMut = await mutateStrategy(selectedStrategy);
      dispatch({
        type: 'ADD_MUTATION',
        payload: { parentStrategyName: selectedStrategy.name, mutation: newMut },
      });

      const act: Activity = {
        id: Date.now(),
        type: 'SYSTEM',
        agent: 'MutationAgent',
        message: `Evolved mutation #${newMut.id} for '${selectedStrategy.name}'.`,
        timestamp: new Date().toISOString(),
      };
      dispatch({ type: 'ADD_ACTIVITY', payload: act });
    } finally {
      setIsMutating(false);
    }
  };
  
  const handleEvolveGeneration = async () => {
    if (!selectedStrategy) return;
    setIsEvolving(true);
    setEvolutionLogs([]);
    try {
        const { newGeneration, validationLogs } = await evolveStrategyGeneration(selectedStrategy, selectedStrategy.mutations);
        setEvolutionLogs(validationLogs);
        dispatch({
            type: 'EVOLVE_STRATEGY_GENERATION',
            payload: { parentStrategyName: selectedStrategy.name, mutations: newGeneration }
        });
        const act: Activity = {
            id: Date.now(),
            type: 'SYSTEM',
            agent: 'GeneticOptimizerAgent',
            message: `Evolved new generation for '${selectedStrategy.name}' using advanced validation.`,
            timestamp: new Date().toISOString(),
        };
        dispatch({ type: 'ADD_ACTIVITY', payload: act });
    } finally {
        setIsEvolving(false);
    }
  };

  const handleConfirmPromotion = (newParentStrategyName: string) => {
    if (!selectedStrategy || !promotionTarget) return;

    dispatch({
      type: 'PROMOTE_MUTATION',
      payload: { 
          parentStrategyName: selectedStrategy.name, 
          mutationId: promotionTarget.id,
          newParentStrategyName
      },
    });
    const newStrategy = { name: newParentStrategyName, mutations: [] };
    setSelectedStrategy(newStrategy as Strategy);
    setPromotionTarget(null);
  };

  const cull = (mutId: number) => {
    if (!selectedStrategy) return;
    dispatch({
      type: 'CULL_MUTATION',
      payload: { parentStrategyName: selectedStrategy.name, mutationId: mutId },
    });
    const act: Activity = {
      id: Date.now(),
      type: 'SYSTEM',
      agent: 'StrategyValidatorAgent',
      message: `Culled mutation #${mutId} from '${selectedStrategy.name}'.`,
      timestamp: new Date().toISOString(),
    };
    dispatch({ type: 'ADD_ACTIVITY', payload: act });
  };

  const onDragStart = (e: React.DragEvent, idx: number) => {
    setDragIndex(idx);
    e.dataTransfer.effectAllowed = 'move';
  };

  const onDragEnter = (e: React.DragEvent, targetIdx: number) => {
    e.preventDefault();
    setDragOverIndex(targetIdx);
  };

  const onDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOverIndex(null);
  }
  
  const onDrop = (e: React.DragEvent, targetIdx: number) => {
    e.preventDefault();
    if (dragIndex === null || !selectedStrategy) return;

    const newMuts = [...selectedStrategy.mutations];
    const [moved] = newMuts.splice(dragIndex, 1);
    newMuts.splice(targetIdx, 0, moved);

    dispatch({
      type: 'REORDER_MUTATIONS',
      payload: { parentStrategyName: selectedStrategy.name, orderedMutations: newMuts },
    });
    setDragIndex(null);
    setDragOverIndex(null);
  };
  
  const onDragEnd = () => {
    setDragIndex(null);
    setDragOverIndex(null);
  }

  const Tooltip: React.FC<PropsWithChildren<{text: string}>> = ({ children, text }) => (
    <div className="relative group flex items-center">
        {children}
        <div className="absolute bottom-full mb-2 w-48 bg-slate-950 text-slate-300 text-xs rounded py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 border border-slate-700">
            {text}
        </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold flex items-center gap-3">
          <FlaskConical size={28} className="text-cyan-400" />
          Strategy Lab
        </h2>
        <button
          onClick={() => setShowCompare(true)}
          disabled={compareItems.length < 2}
          className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition"
        >
          <Scale size={16} /> Compare ({compareItems.length})
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <DashboardCard title="Parent Strategies" className="lg:col-span-1">
          <div className="space-y-2">
            {strategies.map(str => {
              const checked = compareItems.some(i => isSameItem(i, { ...str, __type: 'strategy' }));
              return (
                <div
                  key={str.name}
                  className={`flex items-center p-3 rounded-lg transition ${
                    selectedStrategy?.name === str.name
                      ? 'bg-slate-800 ring-2 ring-cyan-500'
                      : 'hover:bg-slate-800/50'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggleCompare({ ...str, __type: 'strategy' })}
                    className="mr-3 w-4 h-4 rounded bg-slate-700 border-slate-600 text-cyan-500 focus:ring-cyan-600"
                  />
                  <button
                    onClick={() => setSelectedStrategy(str)}
                    className="flex-grow flex justify-between items-center text-left"
                  >
                    <div>
                      <div className="font-bold">{str.name}</div>
                      <div className="text-xs text-slate-400">
                        Sharpe: {str.sharpe.toFixed(2)} | DD: {str.drawdown.toFixed(2)}%
                      </div>
                    </div>
                    <ChevronRight size={18} className="text-slate-500" />
                  </button>
                </div>
              );
            })}
            <button
              onClick={handleNewStrategy}
              className="w-full mt-4 p-3 rounded-lg flex items-center justify-center gap-2 bg-cyan-600/20 hover:bg-cyan-600/40 text-cyan-300 font-semibold transition"
            >
              <Plus size={16} /> New Parent Strategy
            </button>
          </div>
        </DashboardCard>

        <DashboardCard
          title={selectedStrategy ? `Mutations – ${selectedStrategy.name}` : 'Select a Parent'}
          className="lg:col-span-2"
        >
          {selectedStrategy ? (
            <>
              <div className="flex justify-between items-start mb-4">
                <p className="text-sm text-slate-400">
                    AI‑generated variations. Validated using multi-factor inputs (Price Data, News Sentiment, Order Flow). Drag to re-order priority.
                </p>
                {selectedStrategy.name === 'XAUUSD Swing EMA-RSI' && (
                    <button 
                        onClick={() => setShowCodeModal(true)}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-slate-700 hover:bg-slate-600 rounded-lg text-cyan-300"
                    >
                        <Code size={14} /> View Source (MQL5)
                    </button>
                )}
              </div>
              
              {/* Header for the mutation list */}
              <div className="grid grid-cols-12 gap-2 text-xs font-bold text-slate-500 px-4 mb-2">
                <div className="col-span-4">Mutation</div>
                <div className="col-span-2 text-center">Sharpe</div>
                <div className="col-span-2 text-center">Edge (Z)</div>
                <div className="col-span-2 text-center">Confidence</div>
                <div className="col-span-2"></div>
              </div>


              <div className="space-y-3" onDragLeave={onDragLeave}>
                {selectedStrategy.mutations.map((mut, idx) => {
                  const checked = compareItems.some(i => isSameItem(i, { ...mut, __type: 'mutation', parentName: selectedStrategy.name }));
                  const isBeingDragged = dragIndex === idx;
                  const isDragTarget = dragOverIndex === idx;

                  return (
                    <div key={mut.id} className="relative">
                      {isDragTarget && dragIndex !== null && dragIndex < idx && <div className="h-1 bg-cyan-500 rounded-full absolute -top-2 left-0 right-0"></div>}
                      <div
                        draggable
                        onDragStart={e => onDragStart(e, idx)}
                        onDragEnter={e => onDragEnter(e, idx)}
                        onDragOver={e => e.preventDefault()}
                        onDrop={e => onDrop(e, idx)}
                        onDragEnd={onDragEnd}
                        className={`bg-slate-800/50 rounded-lg p-2 flex items-center cursor-move transition-all grid grid-cols-12 gap-2 ${
                          isBeingDragged ? 'opacity-30' : 'opacity-100'
                        }`}
                      >
                        <div className="col-span-4 flex items-center gap-2">
                           <GripVertical size={18} className="text-slate-500 flex-shrink-0" />
                           <input type="checkbox" checked={checked} onChange={() => toggleCompare({ ...mut, __type: 'mutation', parentName: selectedStrategy.name })}
                            className="w-4 h-4 rounded bg-slate-700 border-slate-600 text-cyan-500 focus:ring-cyan-600" />
                          <div className="font-mono text-cyan-400 text-sm">{mut.name}</div>
                        </div>
                        
                        <div className="col-span-2 text-center font-mono">{mut.sharpe.toFixed(2)}</div>
                        
                        <div className={`col-span-2 text-center font-mono font-bold ${mut.statisticalEdge && mut.statisticalEdge > 3 ? 'text-green-400' : 'text-yellow-400'}`}>
                           <Tooltip text="Z-Score vs. 1,000 random portfolios. >3.0 is a significant edge.">
                                {mut.statisticalEdge?.toFixed(2) ?? 'N/A'}
                           </Tooltip>
                        </div>

                        <div className="col-span-2 text-center font-mono">
                           <Tooltip text={`Model Confidence: ${(mut.confidence ?? 0) * 100}% | Uncertainty: ${(mut.uncertainty ?? 0) * 100}%`}>
                            {mut.confidence ? `${(mut.confidence * 100).toFixed(0)}%` : 'N/A'}
                           </Tooltip>
                        </div>

                        <div className="col-span-2 flex items-center justify-end gap-1">
                          <button onClick={() => setPromotionTarget(mut)} className="p-1.5 bg-green-600/50 hover:bg-green-600/80 rounded transition" title="Promote"><Check size={14} /></button>
                          <button onClick={() => cull(mut.id)} className="p-1.5 bg-red-600/50 hover:bg-red-600/80 rounded transition" title="Cull"><X size={14} /></button>
                        </div>
                      </div>
                      {isDragTarget && dragIndex !== null && dragIndex > idx && <div className="h-1 bg-cyan-500 rounded-full absolute -bottom-2 left-0 right-0"></div>}
                    </div>
                  );
                })}
                 <div className="flex gap-2 mt-4">
                    <button
                        onClick={generateMutation}
                        disabled={isMutating || isEvolving}
                        className="w-full p-3 rounded-lg flex items-center justify-center gap-2 bg-purple-600/20 hover:bg-purple-600/40 text-purple-300 font-semibold transition disabled:opacity-50"
                        >
                        {isMutating ? (
                            <>
                            <Loader2 className="animate-spin" size={16} /> Mutating...
                            </>
                        ) : (
                            <>
                            <Plus size={16} /> Generate New Mutation
                            </>
                        )}
                    </button>
                     <button
                        onClick={handleEvolveGeneration}
                        disabled={isMutating || isEvolving || selectedStrategy.mutations.length === 0}
                        className="w-full p-3 rounded-lg flex items-center justify-center gap-2 bg-cyan-600/20 hover:bg-cyan-600/40 text-cyan-300 font-semibold transition disabled:opacity-50"
                        >
                        {isEvolving ? (
                            <>
                            <Loader2 className="animate-spin" size={16} /> Evolving...
                            </>
                        ) : (
                            <>
                            <BrainCircuit size={16} /> Evolve Next Generation
                            </>
                        )}
                    </button>
                </div>
                {evolutionLogs.length > 0 && (
                    <div className="mt-4 p-4 bg-slate-900 rounded-lg border border-slate-700">
                        <h4 className="font-bold text-sm text-slate-300 mb-2">Genetic Optimizer Log (Advanced Validation)</h4>
                        <div className="space-y-1 text-xs text-slate-400 max-h-40 overflow-y-auto font-mono">
                            {evolutionLogs.map((log, index) => (
                                <p key={index} className={log.includes('❌') ? 'text-red-400' : log.includes('✅') ? 'text-green-400' : ''}>
                                    {log}
                                </p>
                            ))}
                        </div>
                    </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-48 text-slate-500">
              <p>Select a parent strategy to view its mutations.</p>
            </div>
          )}
        </DashboardCard>
      </div>

      {showCompare && (
        <StrategyComparisonModal
          items={compareItems}
          onClose={() => {
            setShowCompare(false);
            setCompareItems([]);
          }}
        />
      )}
      
      {promotionTarget && selectedStrategy && (
          <PromotionModal
            mutation={promotionTarget}
            parentStrategyName={selectedStrategy.name}
            onClose={() => setPromotionTarget(null)}
            onConfirm={handleConfirmPromotion}
           />
      )}
      
      {showCodeModal && (
          <CodeViewerModal 
            code={XAUUSD_SWING_STRATEGY_CODE || '// Error loading source code'} 
            title="XAUUSD_Swing_EMA_RSI.mq5" 
            onClose={() => setShowCodeModal(false)} 
            language="cpp"
          />
      )}
    </div>
  );
};

export default StrategyLab;
