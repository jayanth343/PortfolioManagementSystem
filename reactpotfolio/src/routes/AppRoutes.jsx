import React from 'react';
import { Routes, Route } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import { Landing, Dashboard, Holdings, Transactions, SearchResults, AssetDetails, NotFound } from '../pages';

const AppRoutes = () => {
    return (
        <Routes>
            {/* Landing Page - No Layout */}
            <Route path="/" element={<Landing />} />
            
            {/* Dashboard and other pages - With Layout */}
            <Route element={<MainLayout />}>
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="holdings" element={<Holdings />} />
                <Route path="transactions" element={<Transactions />} />
                <Route path="search" element={<SearchResults />} />
                <Route path="asset/:type/:symbol" element={<AssetDetails />} />
                <Route path="asset/:symbol" element={<AssetDetails />} />
                <Route path="*" element={<NotFound />} />
            </Route>
        </Routes>
    );
};

export default AppRoutes;
