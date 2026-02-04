/**
 * API Configuration
 * Configure backend URLs and settings
 */

// Backend URLs
export const JAVA_API_URL = 'http://localhost:8080/api/yfdata';
export const FLASK_API_URL = 'http://localhost:5000/api';

// API Mode - set to 'mock' for development or 'backend' for production
export const API_MODE = process.env.REACT_APP_API_MODE || 'backend';

// Request timeout in milliseconds
export const REQUEST_TIMEOUT = 30000;

// Common headers
export const API_HEADERS = {
    'Content-Type': 'application/json',
};

/**
 * Helper function to create fetch request with timeout
 */
export const fetchWithTimeout = async (url, options = {}, timeout = REQUEST_TIMEOUT) => {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);
    
    try {
        const response = await fetch(url, {
            ...options,
            signal: controller.signal
        });
        clearTimeout(id);
        return response;
    } catch (error) {
        clearTimeout(id);
        if (error.name === 'AbortError') {
            throw new Error('Request timeout');
        }
        throw error;
    }
};

/**
 * Helper function to handle API errors
 */
export const handleApiError = (error) => {
    console.error('API Error:', error);
    
    if (error.message === 'Request timeout') {
        return { error: 'Request timed out. Please try again.' };
    }
    
    if (error.message.includes('Failed to fetch')) {
        return { error: 'Cannot connect to server. Please ensure the backend is running.' };
    }
    
    return { error: error.message || 'An unexpected error occurred' };
};
