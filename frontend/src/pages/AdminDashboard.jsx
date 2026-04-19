import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const MOCK_API_URL = window.location.origin.includes('localhost') 
  ? 'http://localhost:8080/api' 
  : '/api';

export default function AdminDashboard() {
    const [view, setView] = useState('overview'); // overview, orders, broadcast
    const [orders, setOrders] = useState([]);
    const [announcements, setAnnouncements] = useState([]);
    const [alerts, setAlerts] = useState([]);
    const [zoneData, setZoneData] = useState({});
    const [newMessage, setNewMessage] = useState('');
    const [alertFilter, setAlertFilter] = useState('All');

    const fetchData = () => {
        fetch(`${MOCK_API_URL}/platform/orders`).then(res => res.json()).then(setOrders).catch(() => {});
        fetch(`${MOCK_API_URL}/platform/announcements`).then(res => res.json()).then(setAnnouncements).catch(() => {});
        fetch(`${MOCK_API_URL}/platform/alerts`).then(res => res.json()).then(setAlerts).catch(() => {});
        fetch(`${MOCK_API_URL}/venues/status`).then(res => res.json()).then(setZoneData).catch(() => {});
    };

    useEffect(() => {
        fetchData();
        const int = setInterval(fetchData, 3000);
        return () => clearInterval(int);
    }, []);

    const postAnnouncement = async () => {
        if (!newMessage) return;
        await fetch(`${MOCK_API_URL}/platform/announcements`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: newMessage })
        });
        setNewMessage('');
        fetchData();
    };

    const updateAlertStatus = async (id, status) => {
        await fetch(`${MOCK_API_URL}/platform/alerts/${id}/status`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status })
        });
        fetchData();
    };

    const updateOrderStatus = async (id, status) => {
        await fetch(`${MOCK_API_URL}/platform/orders/${id}/status`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status })
        });
        fetchData();
    };

    // Revenue Logic
    const realizedRevenue = orders.filter(o => o.status === 'Delivered').reduce((sum, o) => sum + (o.totalAmount || 0), 0);
    const projectedRevenue = orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
    
    const seatsCount = Object.values(zoneData).filter(z => z.type === 'seat').length;
    const realisticSeats = seatsCount === 0 ? 0 : seatsCount * 450;
    const seatsRevenue = realisticSeats * 45;

    const filteredAlerts = alertFilter === 'All' ? alerts : alerts.filter(a => a.type === alertFilter || a.status === alertFilter);

    // Alert Icons Mapper
    const getAlertIcon = (type) => {
        if (type === 'MEDICAL') return <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" /></svg>;
        if (type === 'SECURITY') return <svg className="w-5 h-5 text-blue-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M2.166 4.9L10 1.154l7.834 3.746v5.203c0 5.791-4.017 10.394-7.834 11.238-3.817-.844-7.834-5.447-7.834-11.238V4.9z" clipRule="evenodd" /></svg>;
        if (type === 'CROWD') return <svg className="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>;
        if (type === 'SOS') return <svg className="w-5 h-5 text-red-600 animate-pulse" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" /></svg>;
        return <svg className="w-5 h-5 text-gray-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" /></svg>;
    };

    return (
        <div className="min-h-screen bg-[#020617] flex flex-col md:flex-row text-white font-sans selection:bg-blue-500/30">
            
            {/* --- LEFT SIDEBAR NAV --- */}
            <aside className="w-full md:w-64 bg-[#0f172a] border-r border-gray-800 flex flex-col md:min-h-screen sticky top-0 z-50 md:z-auto">
                <div className="p-6 border-b border-gray-800">
                    <Link to="/" className="text-xl font-black italic tracking-tighter hover:text-white transition-colors text-gray-400 block mb-2">
                        STADIUM<span className="text-blue-500">SAATHI</span>
                    </Link>
                    <span className="px-2 py-1 bg-blue-500/10 text-blue-400 text-[9px] font-black uppercase rounded border border-blue-500/20 tracking-widest">Command Center</span>
                </div>
                <nav className="flex-1 p-4 space-y-1">
                    <button onClick={() => setView('overview')} className={`w-full text-left px-4 py-3 rounded-xl font-bold uppercase tracking-wider text-xs transition-all flex items-center ${view === 'overview' ? 'bg-blue-600/10 border border-blue-500/30 text-blue-400' : 'text-gray-400 hover:bg-gray-800/50'}`}>
                        <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"></path></svg>
                        Admin Dashboard
                    </button>
                    <button onClick={() => setView('orders')} className={`w-full text-left px-4 py-3 rounded-xl font-bold uppercase tracking-wider text-xs transition-all flex items-center ${view === 'orders' ? 'bg-yellow-500/10 border border-yellow-500/30 text-yellow-500' : 'text-gray-400 hover:bg-gray-800/50'}`}>
                        <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path></svg>
                        Food Operations
                    </button>
                    <button onClick={() => setView('broadcast')} className={`w-full text-left px-4 py-3 rounded-xl font-bold uppercase tracking-wider text-xs transition-all flex items-center ${view === 'broadcast' ? 'bg-blue-500/10 border border-blue-500/30 text-blue-400' : 'text-gray-400 hover:bg-gray-800/50'}`}>
                        <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z"></path></svg>
                        Broadcast Alerts
                    </button>
                </nav>

                <div className="p-4 mt-auto border-t border-gray-800">
                    <button 
                        onClick={async () => {
                            if(window.confirm('Reset all live data to Judge-ready Fresh State?')) {
                                await fetch(`${MOCK_API_URL}/platform/reset`, { method: 'POST' });
                                fetchData();
                            }
                        }}
                        className="w-full text-left px-4 py-3 rounded-xl font-black uppercase tracking-widest text-[9px] transition-all flex items-center bg-red-600/10 border border-red-500/30 text-red-500 hover:bg-red-600/20"
                    >
                        <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
                        Reset for Demo
                    </button>
                </div>
            </aside>

            {/* --- RIGHT MAIN CONTENT --- */}
            <main className="flex-1 p-4 md:p-8 animate-in fade-in h-screen overflow-y-auto bg-[#020617]">
                
                {/* VIEW: OVERVIEW (ALERT FEED PAGE) */}
                {view === 'overview' && (
                    <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
                        
                        {/* LEFT COLUMN: STATS & SUMMARY */}
                        <div className="xl:col-span-4 space-y-6">
                            <h2 className="text-2xl font-black text-white uppercase tracking-tight mb-2">Platform Summary</h2>
                            
                            <div className="grid grid-cols-1 gap-4">
                                <div className="bg-[#0f172a] border border-gray-800 rounded-2xl p-5 shadow-sm">
                                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block mb-1">Seats Revenue</span>
                                    <span className="text-2xl font-black text-white">${seatsRevenue.toLocaleString()}</span>
                                    <div className="mt-2 text-[10px] text-green-500 font-bold uppercase">84% Occupancy • Global</div>
                                </div>
                                <div className="bg-[#0f172a] border border-gray-800 rounded-2xl p-5 shadow-sm">
                                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block mb-1">Food Revenue</span>
                                    <div className="flex items-baseline space-x-2">
                                        <span className="text-2xl font-black text-blue-400">${projectedRevenue.toFixed(2)}</span>
                                        <span className="text-xs text-gray-500">(Full Potential)</span>
                                    </div>
                                    <div className="mt-2 text-[10px] text-blue-400 font-bold uppercase">Realized: ${realizedRevenue.toFixed(2)}</div>
                                </div>
                                <div className="bg-[#0f172a] border border-red-500/20 rounded-2xl p-5 shadow-[0_4px_20px_-10px_rgba(239,68,68,0.5)]">
                                    <span className="text-[10px] font-bold text-red-500 uppercase tracking-widest block mb-1">Emergency SOS Status</span>
                                    <span className="text-2xl font-black text-red-500 flex items-center">
                                        {alerts.filter(a => a.type === 'SOS' && a.status === 'Pending').length} Active Signals
                                        {alerts.some(a => a.type === 'SOS' && a.status === 'Pending') && <span className="ml-3 w-2 h-2 bg-red-500 rounded-full animate-ping"></span>}
                                    </span>
                                </div>
                            </div>

                            {/* SMALL MAPPING / ZONE STATUS */}
                            <div className="bg-[#0f172a] border border-gray-800 rounded-3xl p-6">
                                <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4">Stadium Zones</h3>
                                <div className="space-y-3">
                                    {['Red', 'Blue', 'Green', 'Yellow'].map(z => (
                                        <div key={z} className="flex items-center justify-between text-xs font-bold">
                                            <span className="flex items-center">
                                                <span className={`w-3 h-3 rounded-full mr-3 ${z==='Red'?'bg-red-500':z==='Blue'?'bg-blue-500':z==='Green'?'bg-green-500':'bg-yellow-500'}`}></span>
                                                {z} Zone
                                            </span>
                                            <span className="text-gray-500 font-mono">STABLE</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* RIGHT COLUMN: PROFESSIONAL ALERT FEED */}
                        <div className="xl:col-span-8 flex flex-col h-[calc(100vh-100px)]">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-2xl font-black text-white flex items-center uppercase tracking-tight">
                                    <svg className="w-6 h-6 mr-3 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                                    Alert Feed
                                </h2>
                                <div className="text-xs font-bold text-gray-400 font-mono flex items-center space-x-3">
                                    <span><span className="text-blue-400">{alerts.filter(a=>a.status==='Pending').length}</span> PENDING</span>
                                    <span>•</span>
                                    <span><span className="text-yellow-400">{alerts.filter(a=>a.status==='Dispatched').length}</span> DISPATCHED</span>
                                    <span>•</span>
                                    <span><span className="text-green-500">{alerts.filter(a=>a.status==='Resolved').length}</span> RESOLVED</span>
                                </div>
                            </div>

                            {/* FILTERS TRAY */}
                            <div className="flex flex-wrap gap-2 mb-6">
                                {['All', 'Pending', 'SOS', 'Medical', 'Security', 'Crowd', 'Lost'].map(f => (
                                    <button 
                                        key={f} 
                                        onClick={() => setAlertFilter(f)}
                                        className={`px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${alertFilter === f ? 'bg-blue-600 text-white shadow-lg' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}
                                    >
                                        {f}
                                    </button>
                                ))}
                            </div>

                            {/* THE FEED */}
                            <div className="flex-1 space-y-3 overflow-y-auto pr-2 custom-scrollbar">
                                {filteredAlerts.length === 0 ? (
                                    <div className="p-10 text-center bg-gray-900/40 rounded-3xl border border-dashed border-gray-800 text-gray-600 italic font-mono text-sm">
                                        System Clear. No alerts to display in this category.
                                    </div>
                                ) : filteredAlerts.map(alert => (
                                    <div key={alert.id} className="bg-[#0f172a] border border-gray-800 rounded-2xl p-4 flex items-center group transition-all hover:bg-[#1e293b]/50">
                                        <div className="p-3 bg-gray-900 rounded-xl mr-4 group-hover:bg-[#0f172a] transition-colors shadow-inner">
                                            {getAlertIcon(alert.type)}
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center space-x-2 mb-1">
                                                <span className="text-[11px] font-black text-white tracking-widest">{alert.type}</span>
                                                <span className={`px-1.5 py-0.5 rounded text-[8px] font-black tracking-tighter ${alert.priority === 'HIGH' ? 'bg-red-900/40 text-red-500' : alert.priority === 'MEDIUM' ? 'bg-yellow-900/40 text-yellow-500' : 'bg-blue-900/40 text-blue-500'}`}>
                                                    {alert.priority}
                                                </span>
                                                <span className={`px-1.5 py-0.5 rounded text-[8px] font-black tracking-tighter bg-gray-800/80 text-gray-400`}>
                                                    {alert.status.toUpperCase()}
                                                </span>
                                            </div>
                                            <p className="text-sm font-bold text-gray-300 mb-1">{alert.message}</p>
                                            <div className="flex items-center text-[10px] text-gray-500 font-mono space-x-3">
                                                <span className="flex items-center"><svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 12l4.243-4.243a2 2 0 10-2.828-2.828l-4.243 4.243-4.243-4.243a2 2 0 00-2.828 2.828l4.243 4.243-4.243 4.243a2 2 0 012.828 2.828l4.243-4.243 4.243 4.243a2 2 0 002.828-2.828z"></path></svg>{alert.location}</span>
                                                <span>•</span>
                                                <span>{Math.floor((Date.now() - alert.timestamp) / 60000)}m ago</span>
                                            </div>
                                            {alert.details && <p className="mt-2 text-[10px] italic text-red-400 border-l border-red-500/50 pl-2">"{alert.details}"</p>}
                                        </div>
                                        
                                        <div className="flex space-x-2 ml-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                            {alert.status === 'Pending' && (
                                                <button 
                                                    onClick={() => updateAlertStatus(alert.id, 'Dispatched')}
                                                    className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-[10px] font-black uppercase flex items-center shadow-lg transform active:scale-95 transition-all"
                                                >
                                                    <svg className="w-3 h-3 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path></svg>
                                                    Dispatch
                                                </button>
                                            )}
                                            <button 
                                                onClick={() => updateAlertStatus(alert.id, 'Resolved')}
                                                className="p-2 border border-gray-700 hover:border-green-500 hover:text-green-500 rounded-lg text-gray-400 transition-colors shadow-sm"
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* VIEW: FOOD ORDERS */}
                {view === 'orders' && (
                    <div className="max-w-4xl animate-in slide-in-from-right duration-300">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-3xl font-black text-white uppercase tracking-tight">Catering Operations</h2>
                        </div>
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                            <div className="lg:col-span-1 bg-[#0f172a] border border-gray-800 rounded-2xl p-4 h-fit">
                                <h3 className="text-xs font-black text-gray-500 uppercase tracking-widest mb-4 border-b border-gray-800 pb-2">Seat Revenue Breakdown</h3>
                                <div className="space-y-2">
                                    {Object.entries(orders.reduce((acc, curr) => {
                                        acc[curr.seatInfo] = (acc[curr.seatInfo] || 0) + (curr.totalAmount || 0);
                                        return acc;
                                    }, {})).map(([seat, total]) => (
                                        <div key={seat} className="flex justify-between text-xs font-mono">
                                            <span className="text-gray-400">Seat {seat}</span>
                                            <span className="text-blue-400 font-bold">${total.toFixed(2)}</span>
                                        </div>
                                    ))}
                                    {orders.length === 0 && <p className="text-gray-600 text-[10px] italic">Waiting for transactions...</p>}
                                </div>
                            </div>
                            <div className="lg:col-span-2 space-y-4">
                                {orders.map(order => (
                                    <div key={order.id} className={`bg-[#0f172a] border rounded-2xl p-5 shadow-sm ${order.status === 'Delivered' ? 'opacity-50 border-gray-800' : 'border-gray-700'}`}>
                                        <div className="flex flex-col md:flex-row justify-between mb-4 pb-4 border-b border-gray-800">
                                            <div className="flex items-center space-x-3">
                                                <span className="bg-gray-800 text-white font-black text-xs px-3 py-1 rounded-full border border-gray-700">SEAT {order.seatInfo}</span>
                                                <span className="text-blue-400 font-black text-lg">${(order.totalAmount || 0).toFixed(2)}</span>
                                            </div>
                                            <select 
                                                value={order.status}
                                                onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                                                className={`text-[10px] font-black uppercase rounded-lg px-3 py-2 outline-none border ${order.status === 'Pending' ? 'bg-red-900/20 text-red-500 border-red-500/30' : 'bg-green-900/20 text-green-500 border-green-500/30'}`}
                                            >
                                                <option className="bg-[#0f172a]" value="Pending">Pending</option>
                                                <option className="bg-[#0f172a]" value="Delivered">Delivered</option>
                                            </select>
                                        </div>
                                        <div className="text-xs font-mono text-gray-400 grid grid-cols-2 gap-2">
                                            {order.items.map((i, idx) => <div key={idx}><span className="text-white font-bold">{i.quantity}x</span> {i.name}</div>)}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* VIEW: BROADCAST */}
                {view === 'broadcast' && (
                    <div className="max-w-4xl animate-in slide-in-from-right duration-300">
                        <h2 className="text-3xl font-black text-white mb-6 uppercase tracking-tight">Public Announcement Console</h2>
                        <div className="bg-[#0f172a] border border-blue-500/20 rounded-3xl p-6 md:p-8 shadow-xl mb-8">
                            <label className="block text-[10px] font-black text-gray-500 uppercase mb-3 tracking-widest">Global Broadcast Transmission</label>
                            <div className="flex flex-col md:flex-row gap-4">
                                <input 
                                    type="text" value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    placeholder="Enter stadium-wide priority alert..."
                                    className="flex-1 bg-gray-900 border border-gray-800 focus:border-blue-500 rounded-xl px-5 text-sm font-mono text-white outline-none py-4 transition-all"
                                />
                                <button onClick={postAnnouncement} disabled={!newMessage} className="bg-blue-600 hover:bg-blue-500 text-white font-black px-10 py-4 rounded-xl uppercase tracking-widest transition-all disabled:opacity-50">
                                    TRANSMIT
                                </button>
                            </div>
                        </div>
                        <h3 className="text-[10px] font-black text-gray-600 uppercase tracking-widest mb-4">Transmission History</h3>
                        <div className="space-y-3">
                            {announcements.map(a => (
                                <div key={a.id} className="bg-[#0f172a] border-l-4 border-blue-500 p-4 flex justify-between items-center group shadow-sm transition-all hover:translate-x-1">
                                    <div>
                                        <p className="text-sm font-bold text-gray-200 mb-1">{a.message}</p>
                                        <span className="text-[10px] text-gray-500 font-mono tracking-widest">{new Date(a.timestamp).toLocaleTimeString()}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
