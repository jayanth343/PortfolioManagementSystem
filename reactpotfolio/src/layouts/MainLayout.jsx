import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';

const MainLayout = () => {
    return (
        <div className="main-layout">
            <Header />
            <main>
                <Outlet />
            </main>
        </div>
    );
};

export default MainLayout;
