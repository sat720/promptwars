import { Outlet, Link, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';

const MOCK_API_URL = window.location.origin.includes('localhost') 
  ? 'http://localhost:8080/api' 
  : '/api';

export default function UserPortal() {
    const loc = useLocation();
    
    // SOS Modal State
    const [sosOpen, setSosOpen] = useState(false);
    const [sosForm, setSosForm] = useState({ name: '', mobile: '', location: '', landmarks: '' });
    const [sosStatus, setSosStatus] = useState('');
    const [zoneData, setZoneData] = useState({});
    const [announcements, setAnnouncements] = useState([]);
    const [liveScore, setLiveScore] = useState(null);

    useEffect(() => {
        // Fetch zones for the dropdown just once
        fetch(`${MOCK_API_URL}/venues/status`)
            .then(res => res.json())
            .then(data => setZoneData(data))
            .catch(()=>{});

        // Poll for announcements globally
        const fetchAnnouncements = () => {
            fetch(`${MOCK_API_URL}/platform/announcements`)
                .then(res => res.json())
                .then(setAnnouncements)
                .catch(()=>{});
        };
        fetchAnnouncements();
        const int = setInterval(fetchAnnouncements, 3000);

        // Fetch live score
        const fetchScore = () => {
            fetch(`${MOCK_API_URL}/platform/score`)
                .then(res => res.json())
                .then(setLiveScore)
                .catch(()=>{});
        };
        fetchScore();
        const scoreInt = setInterval(fetchScore, 5000);

        return () => {
            clearInterval(int);
            clearInterval(scoreInt);
        };
    }, []);

    const submitSos = async (e) => {
        e.preventDefault();
        setSosStatus('Sending distress signal...');
        try {
            await fetch(`${MOCK_API_URL}/platform/sos`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(sosForm)
            });
            setSosStatus('SOS Signal Received! Help is on the way.');
            setTimeout(() => {
                setSosOpen(false);
                setSosStatus('');
                setSosForm({ name: '', mobile: '', location: '', landmarks: '' });
            }, 3000);
        } catch(err) {
            setSosStatus('Failed to send SOS. Please dial emergency services.');
        }
    };
    
    return (
        <div className="min-h-screen bg-stadium-dark flex flex-col text-white pb-20 md:pb-0">
            <header className="bg-stadium-card border-b border-gray-700 p-4 sticky top-0 z-50 shadow-xl">
                <div className="max-w-4xl mx-auto flex justify-between items-center">
                    <Link to="/" className="text-xl font-black italic tracking-tighter hover:text-neon-green transition-colors">
                        STADIUM<span className="text-neon-green">SAATHI</span>
                    </Link>
                    <nav className="flex space-x-2 md:space-x-4">
                        <Link to="/user" className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase transition-all flex items-center ${loc.pathname === '/user' ? 'bg-neon-green text-black shadow-[0_0_15px_rgba(34,197,94,0.4)]' : 'text-gray-400 hover:text-white hover:bg-gray-800'}`}>Route</Link>
                        <Link to="/user/map" className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase transition-all flex items-center ${loc.pathname === '/user/map' ? 'bg-blue-500 text-white shadow-[0_0_15px_rgba(59,130,246,0.4)]' : 'text-gray-400 hover:text-white hover:bg-gray-800'}`}>Map</Link>
                        <Link to="/user/food" className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase transition-all flex items-center ${loc.pathname.includes('/food') ? 'bg-neon-yellow text-black shadow-[0_0_15px_rgba(234,179,8,0.4)]' : 'text-gray-400 hover:text-white hover:bg-gray-800'}`}>Food</Link>
                    </nav>

                    {/* NEW: PREMIUM COMPACT SCOREBOARD (WIDER & SLEEK) */}
                    {liveScore && (
                        <div className="hidden lg:flex items-center bg-gray-900/40 border border-gray-700/50 rounded-xl px-4 py-1.5 ml-4 min-w-[200px] shadow-inner group hover:border-neon-green transition-all duration-300">
                            <div className="flex flex-col border-r border-gray-800 pr-3 mr-3">
                                <span className="text-[10px] font-black text-neon-green tracking-tighter uppercase leading-none">{liveScore.teamA} <span className="text-gray-500 font-bold mx-0.5">v</span> {liveScore.teamB}</span>
                                <span className="text-xl font-black text-white leading-none mt-1">{liveScore.scoreA}</span>
                            </div>
                            <div className="flex flex-col">
                                <span className="text-[8px] font-bold text-gray-500 uppercase tracking-widest">{liveScore.overs} OV</span>
                                <span className="text-[9px] font-black text-blue-400 uppercase tracking-tighter mt-0.5 whitespace-nowrap">{liveScore.status}</span>
                            </div>
                        </div>
                    )}
                </div>
            </header>

            {/* GLOBAL ANNOUNCEMENT TICKER */}
            {announcements.length > 0 && (
                <div className="bg-blue-600/90 backdrop-blur-sm border-b border-blue-400 py-1.5 overflow-hidden z-40">
                    <div className="whitespace-nowrap animate-marquee flex items-center space-x-12 px-4">
                        {[...announcements].reverse().slice(0, 3).map(a => (
                            <div key={a.id} className="flex items-center">
                                <span className="w-2 h-2 bg-white rounded-full mr-3 animate-pulse"></span>
                                <span className="text-[11px] font-black uppercase tracking-wider text-white">
                                    Broadcast: {a.message}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
            
            <main className="flex-1 w-full max-w-4xl mx-auto relative overflow-hidden">
                <Outlet />
            </main>

            {/* UNIVERSAL FLOATING SOS BUTTON */}
            <button 
                onClick={() => setSosOpen(true)}
                className="fixed bottom-6 right-6 w-16 h-16 rounded-full bg-red-600 hover:bg-red-500 text-white border-2 border-red-400 shadow-[0_10px_25px_rgba(220,38,38,0.5)] flex items-center justify-center transition-transform hover:scale-110 z-50 animate-pulse"
                aria-label="Emergency SOS"
            >
                <span className="font-black tracking-widest uppercase text-sm drop-shadow-md">SOS</span>
            </button>

            {/* SOS MODAL */}
            {sosOpen && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
                    <div className="bg-stadium-card border-2 border-red-500 rounded-3xl w-full max-w-md p-6 shadow-[0_0_50px_rgba(220,38,38,0.2)] animate-in zoom-in-95 duration-200">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-black text-red-500 uppercase flex items-center">
                                <svg className="w-8 h-8 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                                Emergency SOS
                            </h2>
                            <button onClick={() => setSosOpen(false)} className="text-gray-400 hover:text-white">✕</button>
                        </div>
                        
                        {sosStatus ? (
                            <div className="text-center py-10 font-mono text-red-400 border border-red-500/50 rounded-xl bg-red-900/10 shadow-inner">
                                {sosStatus}
                            </div>
                        ) : (
                            <form onSubmit={submitSos} className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Name</label>
                                    <input required type="text" className="w-full bg-gray-900 border border-gray-700 focus:border-red-500 rounded-lg p-3 text-white font-mono outline-none" value={sosForm.name} onChange={e => setSosForm({...sosForm, name: e.target.value})} />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Mobile Number</label>
                                    <input required type="tel" className="w-full bg-gray-900 border border-gray-700 focus:border-red-500 rounded-lg p-3 text-white font-mono outline-none" value={sosForm.mobile} onChange={e => setSosForm({...sosForm, mobile: e.target.value})} />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Nearest Location / Gate</label>
                                    <select required className="w-full bg-gray-900 border border-gray-700 focus:border-red-500 rounded-lg p-3 text-white font-mono outline-none" value={sosForm.location} onChange={e => setSosForm({...sosForm, location: e.target.value})}>
                                        <option value="" disabled>Select your nearest zone</option>
                                        {Object.keys(zoneData).map(k => <option key={k} value={k}>{k}</option>)}
                                    </select>
                                </div>
                                <div className="pb-4 border-b border-gray-800">
                                    <label className="block text-xs font-bold text-gray-400 uppercase mb-1 flex items-center justify-between">
                                        Nearby Landmarks
                                        <span className="text-[9px] text-gray-500 normal-case w-32 border border-gray-700 p-1 rounded-sm block leading-tight">(If you don't know your location, describe what you see)</span>
                                    </label>
                                    <textarea className="w-full bg-gray-900 border border-gray-700 focus:border-red-500 rounded-lg p-3 text-white font-mono outline-none min-h-[80px]" placeholder="e.g., Near a large blue sponsor banner" value={sosForm.landmarks} onChange={e => setSosForm({...sosForm, landmarks: e.target.value})}></textarea>
                                </div>
                                <button type="submit" className="w-full py-4 rounded-xl font-black text-lg uppercase bg-red-600 text-white hover:bg-red-500 active:scale-95 transition-all shadow-lg flex justify-center items-center">
                                    <svg className="w-5 h-5 mr-2 animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path></svg>
                                    Send Distress Signal
                                </button>
                            </form>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
