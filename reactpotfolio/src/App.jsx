import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import AppRoutes from './routes/AppRoutes';
import './index.css';

function App() {
    return (
        <BrowserRouter>
            <div className="App">
                <AppRoutes />
            </div>
        </BrowserRouter>
    );
}

// Export App as usual; index.js handles rendering
export default App;
