import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api/portfolio';

export const getPortfolioSummary = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/summary`);
    return response.data;
  } catch (error) {
    console.error('Error fetching portfolio summary:', error);
    throw error;
  }
};

export const getPortfolioPerformance = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/performance`);
    return response.data;
  } catch (error) {
    console.error('Error fetching portfolio performance:', error);
    throw error;
  }
};

export const getAssetAllocation = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/allocation`);
    return response.data;
  } catch (error) {
    console.error('Error fetching asset allocation:', error);
    throw error;
  }
};

export const getInvestmentBreakdown = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/breakdown`);
    return response.data;
  } catch (error) {
    console.error('Error fetching investment breakdown:', error);
    throw error;
  }
};

export const getPerformers = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/performers`);
    return response.data;
  } catch (error) {
    console.error('Error fetching performers:', error);
    throw error;
  }
};
