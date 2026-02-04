import React from 'react';
import { Routes, Route } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import { Home, Holdings, Transactions, SearchResults, NotFound } from '../pages';

const AppRoutes = () => {
    return (
        <Routes>
            <Route path="/" element={<MainLayout />}>
                <Route index element={<Home />} />
                <Route path="holdings" element={<Holdings />} />
                <Route path="transactions" element={<Transactions />} />
                <Route path="search" element={<SearchResults />} />
                <Route path="*" element={<NotFound />} />
            </Route>
        </Routes>
    );
};

export default AppRoutes;
