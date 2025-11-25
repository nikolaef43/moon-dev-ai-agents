import axios from 'axios';

const API_URL = 'http://localhost:8000/api';
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

// Create axios instance with default config
const apiClient = axios.create({
    baseURL: API_URL,
    timeout: 30000, // 30 seconds
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor
apiClient.interceptors.request.use(
    (config) => {
        // Add timestamp to prevent caching
        config.params = {
            ...config.params,
            _t: Date.now(),
        };
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor
apiClient.interceptors.response.use(
    (response) => {
        return response;
    },
    async (error) => {
        const originalRequest = error.config;

        // Handle network errors
        if (!error.response) {
            console.error('❌ Network error:', error.message);
            throw new Error('Network error. Please check if the backend server is running.');
        }

        // Handle timeout
        if (error.code === 'ECONNABORTED') {
            console.error('❌ Request timeout');
            throw new Error('Request timeout. The server took too long to respond.');
        }

        // Handle specific HTTP errors
        if (error.response) {
            const { status, data } = error.response;

            switch (status) {
                case 400:
                    throw new Error(data.detail || 'Bad request. Please check your input.');
                case 401:
                    throw new Error('Unauthorized. Please check your API credentials.');
                case 403:
                    throw new Error('Forbidden. You do not have permission to access this resource.');
                case 404:
                    throw new Error(data.detail || 'Resource not found.');
                case 429:
                    throw new Error('Too many requests. Please try again later.');
                case 500:
                    throw new Error(data.detail || 'Internal server error. Please try again later.');
                case 503:
                    throw new Error('Service unavailable. The server is temporarily down.');
                default:
                    throw new Error(data.detail || `Server error: ${status}`);
            }
        }

        return Promise.reject(error);
    }
);

// Retry helper function
const retryRequest = async (fn, retries = MAX_RETRIES) => {
    for (let i = 0; i < retries; i++) {
        try {
            return await fn();
        } catch (error) {
            if (i === retries - 1) throw error;

            // Exponential backoff
            const delay = RETRY_DELAY * Math.pow(2, i);
            console.log(`Retry attempt ${i + 1}/${retries} after ${delay}ms...`);
            await new Promise(resolve => setTimeout(resolve, delay));
        }
    }
};

// API functions with error handling
export const api = {
    // ============================================================================
    // HEALTH & STATUS
    // ============================================================================

    async checkHealth() {
        try {
            const response = await apiClient.get('/health');
            return response.data;
        } catch (error) {
            console.error('Health check failed:', error.message);
            throw error;
        }
    },

    // ============================================================================
    // US STOCKS
    // ============================================================================

    async getUSStockAccount() {
        try {
            return await retryRequest(() => apiClient.get('/us-stocks/account'));
        } catch (error) {
            console.error('Failed to get US stock account:', error.message);
            throw error;
        }
    },

    async getUSStockData(symbol, timeframe = '1H', limit = 100) {
        try {
            if (!symbol) throw new Error('Symbol is required');

            return await retryRequest(() =>
                apiClient.get(`/us-stocks/market-data/${symbol}`, {
                    params: { timeframe, limit }
                })
            );
        } catch (error) {
            console.error(`Failed to get market data for ${symbol}:`, error.message);
            throw error;
        }
    },

    async executeUSStockTrade(data) {
        try {
            // Validate input
            if (!data.symbol) throw new Error('Symbol is required');
            if (!data.action) throw new Error('Action is required');
            if (!data.amount_usd || data.amount_usd <= 0) throw new Error('Valid amount is required');

            const response = await apiClient.post('/us-stocks/trade', data);
            return response;
        } catch (error) {
            console.error('Failed to execute trade:', error.message);
            throw error;
        }
    },

    // ============================================================================
    // AGENTS
    // ============================================================================

    async getAgentsStatus() {
        try {
            return await retryRequest(() => apiClient.get('/agents/status'));
        } catch (error) {
            console.error('Failed to get agents status:', error.message);
            throw error;
        }
    },

    async getAgentStatus(name) {
        try {
            if (!name) throw new Error('Agent name is required');

            return await retryRequest(() => apiClient.get(`/agents/${name}/status`));
        } catch (error) {
            console.error(`Failed to get status for agent ${name}:`, error.message);
            throw error;
        }
    },

    async startAgent(name) {
        try {
            if (!name) throw new Error('Agent name is required');

            const response = await apiClient.post(`/agents/${name}/start`);
            return response;
        } catch (error) {
            console.error(`Failed to start agent ${name}:`, error.message);
            throw error;
        }
    },

    async stopAgent(name) {
        try {
            if (!name) throw new Error('Agent name is required');

            const response = await apiClient.post(`/agents/${name}/stop`);
            return response;
        } catch (error) {
            console.error(`Failed to stop agent ${name}:`, error.message);
            throw error;
        }
    },

    async updateAgentConfig(name, config) {
        try {
            if (!name) throw new Error('Agent name is required');
            if (!config) throw new Error('Config is required');

            const response = await apiClient.post(`/agents/${name}/config`, { config });
            return response;
        } catch (error) {
            console.error(`Failed to update config for agent ${name}:`, error.message);
            throw error;
        }
    },

    async getAgentLogs(name, limit = 100) {
        try {
            if (!name) throw new Error('Agent name is required');

            return await retryRequest(() =>
                apiClient.get(`/agents/${name}/logs`, {
                    params: { limit }
                })
            );
        } catch (error) {
            console.error(`Failed to get logs for agent ${name}:`, error.message);
            throw error;
        }
    },

    // ============================================================================
    // POLYMARKET
    // ============================================================================

    async getPolymarketMarkets(limit = 20) {
        try {
            return await retryRequest(() =>
                apiClient.get('/polymarket/markets', {
                    params: { limit }
                })
            );
        } catch (error) {
            console.error('Failed to get Polymarket markets:', error.message);
            throw error;
        }
    },

    async getPolymarketPredictions() {
        try {
            return await retryRequest(() => apiClient.get('/polymarket/predictions'));
        } catch (error) {
            console.error('Failed to get Polymarket predictions:', error.message);
            throw error;
        }
    },
};

// Connection status checker
export const checkConnection = async () => {
    try {
        await api.checkHealth();
        return true;
    } catch (error) {
        return false;
    }
};

// Export axios instance for custom requests
export { apiClient };

export default api;
