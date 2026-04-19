import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Suspense, lazy } from 'react';

const Landing = lazy(() => import('./pages/Landing'));
const UserPortal = lazy(() => import('./pages/UserPortal'));
const MapNavigator = lazy(() => import('./pages/MapNavigator'));
const PureMap = lazy(() => import('./pages/PureMap'));
const FoodOrder = lazy(() => import('./pages/FoodOrder'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));

export default function App() {
    return (
        <BrowserRouter>
            <Suspense fallback={<div className="min-h-screen bg-[#020617] flex items-center justify-center text-neon-green font-mono">INITIALIZING PLATFORM...</div>}>
                <Routes>
                {/* Entry */}
                <Route path="/" element={<Landing />} />

                {/* User Portal (Layout Wrapper) */}
                <Route path="/user" element={<UserPortal />}>
                    <Route index element={<MapNavigator />} />
                    <Route path="map" element={<PureMap />} />
                    <Route path="food" element={<FoodOrder />} />
                </Route>

                {/* Admin Portal */}
                <Route path="/admin" element={<AdminDashboard />} />

                {/* Catch-all fallback */}
                <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </Suspense>
        </BrowserRouter>
    );
}
