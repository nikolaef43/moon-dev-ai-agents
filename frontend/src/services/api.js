
import axios from 'axios';

const API_URL = 'http://localhost:8000/api';

export const api = {
    // US Stocks
    getUSStockAccount: () => axios.get(`${API_URL}/us-stocks/account`),
    getUSStockData: (symbol) => axios.get(`${API_URL}/us-stocks/market-data/${symbol}`),
    executeUSStockTrade: (data) => axios.post(`${API_URL}/us-stocks/trade`, data),

    // Agents
    getAgentsStatus: () => axios.get(`${API_URL}/agents/status`),
    startAgent: (name) => axios.post(`${API_URL}/agents/${name}/start`),
    stopAgent: (name) => axios.post(`${API_URL}/agents/${name}/stop`),
};
