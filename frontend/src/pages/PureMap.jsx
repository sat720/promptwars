import { useState, useEffect } from 'react';

const MOCK_API_URL = window.location.origin.includes('localhost') 
  ? 'http://localhost:8080/api' 
  : '/api';

const getRad = (deg) => (deg - 90) * (Math.PI / 180);
const getRadiusValue = (radiusLevel) => {
    if (radiusLevel === 'lower') return 70;
    if (radiusLevel === 'upper') return 110;
    if (radiusLevel === 'concourse') return 150;
    if (radiusLevel === 'gate') return 190;
    return 0; // pitch
};
const getCoords = (angleDeg, radiusLevel) => {
    const r = typeof radiusLevel === 'number' ? radiusLevel : getRadiusValue(radiusLevel);
    return {
        x: 200 + r * Math.cos(getRad(angleDeg)),
        y: 200 + r * Math.sin(getRad(angleDeg))
    };
};
const getZoneColor = (data) => {
    if (data.zone === 'Red') return '#ef4444';
    if (data.zone === 'Blue') return '#3b82f6';
    if (data.zone === 'Green') return '#22c55e';
    if (data.zone === 'Yellow') return '#eab308';
    const a = data.angle;
    if (a >= 315 || a < 45) return '#3b82f6'; 
    if (a >= 45 && a < 135) return '#ef4444'; 
    if (a >= 135 && a < 225) return '#22c55e'; 
    if (a >= 225 && a < 315) return '#eab308'; 
    return '#94a3b8'; 
};

export default function PureMap() {
    const [zoneData, setZoneData] = useState({});
    const [announcements, setAnnouncements] = useState([]);

    useEffect(() => {
        const fetchData = () => {
            fetch(`${MOCK_API_URL}/venues/status`).then(res => res.json()).then(setZoneData).catch(()=>{});
            fetch(`${MOCK_API_URL}/platform/announcements`).then(res => res.json()).then(setAnnouncements).catch(()=>{});
        };
        fetchData();
        const int = setInterval(fetchData, 3000);
        return () => clearInterval(int);
    }, []);

    return (
        <div className="min-h-screen bg-stadium-dark px-4 py-8 flex mt-[-60px] md:mt-0 items-center justify-center relative overscroll-none overflow-hidden animate-in fade-in">
            {/* Massive SVG Renderer */}
            <div className="w-full max-w-[700px] aspect-square relative bg-stadium-card rounded-[40px] p-2 md:p-6 border border-gray-800 shadow-[0_0_50px_rgba(0,0,0,0.5)]">
                <svg viewBox="-30 -30 460 460" className="w-full h-full drop-shadow-2xl" aria-label="Interactive Stadium Map">
                    <defs>
                        <radialGradient id="redZone" cx="50%" cy="50%" r="50%"><stop offset="0%" stopColor="#ef4444" stopOpacity="0.4" /><stop offset="100%" stopColor="#ef4444" stopOpacity="0.0" /></radialGradient>
                        <radialGradient id="blueZone" cx="50%" cy="50%" r="50%"><stop offset="0%" stopColor="#3b82f6" stopOpacity="0.4" /><stop offset="100%" stopColor="#3b82f6" stopOpacity="0.0" /></radialGradient>
                        <radialGradient id="greenZone" cx="50%" cy="50%" r="50%"><stop offset="0%" stopColor="#22c55e" stopOpacity="0.4" /><stop offset="100%" stopColor="#22c55e" stopOpacity="0.0" /></radialGradient>
                        <radialGradient id="yellowZone" cx="50%" cy="50%" r="50%"><stop offset="0%" stopColor="#eab308" stopOpacity="0.4" /><stop offset="100%" stopColor="#eab308" stopOpacity="0.0" /></radialGradient>
                    </defs>

                    {/* Outer Shell */}
                    <circle cx="200" cy="200" r="210" fill="#0f172a" stroke="#1e293b" strokeWidth="8" />
                    
                    {/* Zone Shading (4 Quadrants) */}
                    <path d="M 200 60 A 140 140 0 0 1 340 200 L 200 200 Z" fill="url(#blueZone)" />
                    <path d="M 340 200 A 140 140 0 0 1 200 340 L 200 200 Z" fill="url(#redZone)" />
                    <path d="M 200 340 A 140 140 0 0 1 60 200 L 200 200 Z" fill="url(#greenZone)" />
                    <path d="M 60 200 A 140 140 0 0 1 200 60 L 200 200 Z" fill="url(#yellowZone)" />

                    {/* Circulation / Walking Rings */}
                    <circle cx="200" cy="200" r="150" fill="none" stroke="#475569" strokeWidth="12" opacity="0.3" />
                    <circle cx="200" cy="200" r="150" fill="none" stroke="#94a3b8" strokeWidth="2" strokeDasharray="10 5" opacity="0.5" />
                    
                    {/* Explicit Gate Aisles connecting Concourse(150) to Gates(190) */}
                    {[0, 90, 180, 270].map(deg => (
                        <line key={`aisle-${deg}`} x1={getCoords(deg, 150).x} y1={getCoords(deg, 150).y} x2={getCoords(deg, 190).x} y2={getCoords(deg, 190).y} stroke="#475569" strokeWidth="12" opacity="0.3" />
                    ))}

                    {/* Explicit Stairwell Cross-Paths (Gaps between zones) */}
                    {[45, 135, 225, 315].map(deg => {
                        const inner = getCoords(deg, 70);
                        const outer = getCoords(deg, 150);
                        return (
                            <line key={deg} x1={inner.x} y1={inner.y} x2={outer.x} y2={outer.y} stroke="#cbd5e1" strokeWidth="8" strokeDasharray="3 3" opacity="0.6"/>
                        );
                    })}

                    <circle cx="200" cy="200" r="110" fill="none" stroke="#334155" strokeWidth="1" />
                    <circle cx="200" cy="200" r="70" fill="none" stroke="#334155" strokeWidth="1" />
                    <circle cx="200" cy="200" r="40" fill="none" stroke="#475569" strokeWidth="3" />

                    {/* Center Pitch */}
                    <rect x="175" y="150" width="50" height="100" fill="#064e3b" stroke="#10b981" rx="10" />

                    {/* All Math Nodes Plotting */}
                    {Object.entries(zoneData).map(([name, data]) => {
                        const coords = getCoords(data.angle, data.radiusLevel);
                        let dotColor = getZoneColor(data);

                        return (
                            <g key={name} className="transition-transform origin-center" style={{ transformOrigin: `${coords.x}px ${coords.y}px` }} aria-label={`${name} - ${data.type}`}>
                                {/* Seats = tiny dots */}
                                {data.type === 'seat' && <circle cx={coords.x} cy={coords.y} r="4" fill={dotColor} />}
                                {/* Food = larger dot */}
                                {data.type === 'food' && <circle cx={coords.x} cy={coords.y} r="10" fill={dotColor} stroke="#0f172a" strokeWidth="2" />}
                                {/* Gate = Big Square */}
                                {data.type === 'gate' && <rect x={coords.x-10} y={coords.y-10} width="20" height="20" fill={dotColor} />}
                                {/* Washroom = Triangle */}
                                {data.type === 'restroom' && <polygon points={`${coords.x},${coords.y-10} ${coords.x-10},${coords.y+8} ${coords.x+10},${coords.y+8}`} fill={dotColor} stroke="#0f172a" strokeWidth="2" />}
                                {/* Reception = Diamond */}
                                {data.type === 'reception' && <polygon points={`${coords.x},${coords.y-12} ${coords.x+12},${coords.y} ${coords.x},${coords.y+12} ${coords.x-12},${coords.y}`} fill={dotColor} />}
                                
                                <text x={coords.x} y={coords.y + 22} fontSize="9" fill="#94a3b8" textAnchor="middle" className="font-mono font-bold drop-shadow-md tracking-tighter">
                                    {data.radiusLevel === 'gate' ? name.split(' ')[1] : (data.type === 'seat' ? name : '')}
                                </text>
                            </g>
                        );
                    })}
                </svg>
            </div>
        </div>
    );
}
