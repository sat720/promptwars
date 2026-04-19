import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Landing from './pages/Landing';
import UserPortal from './pages/UserPortal';
import MapNavigator from './pages/MapNavigator';
import PureMap from './pages/PureMap';
import FoodOrder from './pages/FoodOrder';
import AdminDashboard from './pages/AdminDashboard';

export default function App() {
    return (
        <BrowserRouter>
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
        </BrowserRouter>
    );
}
