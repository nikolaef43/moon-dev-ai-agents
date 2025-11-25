import React, { createContext, useContext, useReducer, useEffect } from 'react';

// Initial state
const initialState = {
    // System status
    isConnected: false,
    isLoading: false,
    error: null,

    // Agent data
    agents: {},
    agentLogs: {},

    // Market data
    usStocksAccount: null,
    polymarketMarkets: [],

    // WebSocket
    ws: null,
    wsReconnectAttempts: 0,

    // UI state
    notifications: [],
    lastUpdate: null,
};

// Action types
const ActionTypes = {
    // Connection
    SET_CONNECTED: 'SET_CONNECTED',
    SET_LOADING: 'SET_LOADING',
    SET_ERROR: 'SET_ERROR',
    CLEAR_ERROR: 'CLEAR_ERROR',

    // Agents
    SET_AGENTS: 'SET_AGENTS',
    UPDATE_AGENT: 'UPDATE_AGENT',
    ADD_AGENT_LOG: 'ADD_AGENT_LOG',

    // Market data
    SET_US_STOCKS_ACCOUNT: 'SET_US_STOCKS_ACCOUNT',
    SET_POLYMARKET_MARKETS: 'SET_POLYMARKET_MARKETS',

    // WebSocket
    SET_WEBSOCKET: 'SET_WEBSOCKET',
    INCREMENT_RECONNECT: 'INCREMENT_RECONNECT',
    RESET_RECONNECT: 'RESET_RECONNECT',

    // Notifications
    ADD_NOTIFICATION: 'ADD_NOTIFICATION',
    REMOVE_NOTIFICATION: 'REMOVE_NOTIFICATION',

    // General
    SET_LAST_UPDATE: 'SET_LAST_UPDATE',
};

// Reducer
function appReducer(state, action) {
    switch (action.type) {
        case ActionTypes.SET_CONNECTED:
            return { ...state, isConnected: action.payload };

        case ActionTypes.SET_LOADING:
            return { ...state, isLoading: action.payload };

        case ActionTypes.SET_ERROR:
            return {
                ...state,
                error: action.payload,
                isLoading: false
            };

        case ActionTypes.CLEAR_ERROR:
            return { ...state, error: null };

        case ActionTypes.SET_AGENTS:
            return { ...state, agents: action.payload };

        case ActionTypes.UPDATE_AGENT:
            return {
                ...state,
                agents: {
                    ...state.agents,
                    [action.payload.name]: {
                        ...state.agents[action.payload.name],
                        ...action.payload.data
                    }
                }
            };

        case ActionTypes.ADD_AGENT_LOG:
            return {
                ...state,
                agentLogs: {
                    ...state.agentLogs,
                    [action.payload.agent]: [
                        ...(state.agentLogs[action.payload.agent] || []),
                        action.payload.log
                    ].slice(-100) // Keep last 100 logs
                }
            };

        case ActionTypes.SET_US_STOCKS_ACCOUNT:
            return { ...state, usStocksAccount: action.payload };

        case ActionTypes.SET_POLYMARKET_MARKETS:
            return { ...state, polymarketMarkets: action.payload };

        case ActionTypes.SET_WEBSOCKET:
            return { ...state, ws: action.payload };

        case ActionTypes.INCREMENT_RECONNECT:
            return { ...state, wsReconnectAttempts: state.wsReconnectAttempts + 1 };

        case ActionTypes.RESET_RECONNECT:
            return { ...state, wsReconnectAttempts: 0 };

        case ActionTypes.ADD_NOTIFICATION:
            return {
                ...state,
                notifications: [...state.notifications, {
                    id: Date.now(),
                    ...action.payload
                }]
            };

        case ActionTypes.REMOVE_NOTIFICATION:
            return {
                ...state,
                notifications: state.notifications.filter(n => n.id !== action.payload)
            };

        case ActionTypes.SET_LAST_UPDATE:
            return { ...state, lastUpdate: action.payload };

        default:
            return state;
    }
}

// Create context
const AppContext = createContext();

// Provider component
export function AppProvider({ children }) {
    const [state, dispatch] = useReducer(appReducer, initialState);

    // WebSocket connection
    useEffect(() => {
        let ws;
        let reconnectTimeout;

        const connect = () => {
            try {
                ws = new WebSocket('ws://localhost:8000/ws');

                ws.onopen = () => {
                    console.log('✅ WebSocket connected');
                    dispatch({ type: ActionTypes.SET_CONNECTED, payload: true });
                    dispatch({ type: ActionTypes.RESET_RECONNECT });
                    dispatch({
                        type: ActionTypes.ADD_NOTIFICATION,
                        payload: {
                            type: 'success',
                            message: 'Connected to server'
                        }
                    });
                };

                ws.onmessage = (event) => {
                    try {
                        const message = JSON.parse(event.data);
                        handleWebSocketMessage(message);
                    } catch (error) {
                        console.error('Error parsing WebSocket message:', error);
                    }
                };

                ws.onerror = (error) => {
                    console.error('❌ WebSocket error:', error);
                    dispatch({
                        type: ActionTypes.SET_ERROR,
                        payload: 'WebSocket connection error'
                    });
                };

                ws.onclose = () => {
                    console.log('🔌 WebSocket disconnected');
                    dispatch({ type: ActionTypes.SET_CONNECTED, payload: false });
                    dispatch({ type: ActionTypes.SET_WEBSOCKET, payload: null });

                    // Attempt to reconnect with exponential backoff
                    if (state.wsReconnectAttempts < 10) {
                        const delay = Math.min(1000 * Math.pow(2, state.wsReconnectAttempts), 30000);
                        console.log(`Reconnecting in ${delay}ms...`);
                        dispatch({ type: ActionTypes.INCREMENT_RECONNECT });
                        reconnectTimeout = setTimeout(connect, delay);
                    } else {
                        dispatch({
                            type: ActionTypes.ADD_NOTIFICATION,
                            payload: {
                                type: 'error',
                                message: 'Failed to connect to server. Please check if the backend is running.'
                            }
                        });
                    }
                };

                dispatch({ type: ActionTypes.SET_WEBSOCKET, payload: ws });
            } catch (error) {
                console.error('Error creating WebSocket:', error);
            }
        };

        const handleWebSocketMessage = (message) => {
            dispatch({ type: ActionTypes.SET_LAST_UPDATE, payload: new Date().toISOString() });

            switch (message.type) {
                case 'connected':
                    console.log('📡 Server message:', message.message);
                    break;

                case 'agent_status_changed':
                    dispatch({
                        type: ActionTypes.UPDATE_AGENT,
                        payload: {
                            name: message.data.agent,
                            data: { status: message.data.status }
                        }
                    });
                    dispatch({
                        type: ActionTypes.ADD_NOTIFICATION,
                        payload: {
                            type: 'info',
                            message: `Agent ${message.data.agent} is now ${message.data.status}`
                        }
                    });
                    break;

                case 'agent_health_update':
                    Object.entries(message.data).forEach(([agent, health]) => {
                        dispatch({
                            type: ActionTypes.UPDATE_AGENT,
                            payload: {
                                name: agent,
                                data: { health }
                            }
                        });
                    });
                    break;

                case 'trade_executed':
                    dispatch({
                        type: ActionTypes.ADD_NOTIFICATION,
                        payload: {
                            type: 'success',
                            message: `${message.data.action.toUpperCase()} order executed: ${message.data.symbol}`
                        }
                    });
                    break;

                case 'error':
                    dispatch({
                        type: ActionTypes.SET_ERROR,
                        payload: message.message
                    });
                    break;

                default:
                    console.log('Unknown message type:', message.type);
            }
        };

        // Initial connection
        connect();

        // Cleanup
        return () => {
            if (reconnectTimeout) clearTimeout(reconnectTimeout);
            if (ws) ws.close();
        };
    }, [state.wsReconnectAttempts]);

    // Auto-dismiss notifications
    useEffect(() => {
        if (state.notifications.length > 0) {
            const timer = setTimeout(() => {
                dispatch({
                    type: ActionTypes.REMOVE_NOTIFICATION,
                    payload: state.notifications[0].id
                });
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [state.notifications]);

    // Persist state to localStorage
    useEffect(() => {
        try {
            const persistedState = {
                agents: state.agents,
                usStocksAccount: state.usStocksAccount,
            };
            localStorage.setItem('moonDevState', JSON.stringify(persistedState));
        } catch (error) {
            console.error('Error persisting state:', error);
        }
    }, [state.agents, state.usStocksAccount]);

    // Load persisted state on mount
    useEffect(() => {
        try {
            const persisted = localStorage.getItem('moonDevState');
            if (persisted) {
                const data = JSON.parse(persisted);
                if (data.agents) dispatch({ type: ActionTypes.SET_AGENTS, payload: data.agents });
                if (data.usStocksAccount) dispatch({ type: ActionTypes.SET_US_STOCKS_ACCOUNT, payload: data.usStocksAccount });
            }
        } catch (error) {
            console.error('Error loading persisted state:', error);
        }
    }, []);

    const value = {
        state,
        dispatch,
        ActionTypes,
    };

    return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

// Custom hook to use the context
export function useApp() {
    const context = useContext(AppContext);
    if (!context) {
        throw new Error('useApp must be used within AppProvider');
    }
    return context;
}

// Helper functions
export const actions = {
    setLoading: (isLoading) => ({
        type: ActionTypes.SET_LOADING,
        payload: isLoading
    }),

    setError: (error) => ({
        type: ActionTypes.SET_ERROR,
        payload: error
    }),

    clearError: () => ({
        type: ActionTypes.CLEAR_ERROR
    }),

    addNotification: (type, message) => ({
        type: ActionTypes.ADD_NOTIFICATION,
        payload: { type, message }
    }),

    updateAgent: (name, data) => ({
        type: ActionTypes.UPDATE_AGENT,
        payload: { name, data }
    }),
};
