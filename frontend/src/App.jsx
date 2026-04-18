import { useState, useEffect, useMemo } from 'react';

const MOCK_API_URL = 'https://stadium-saathi-backend-81760530833.asia-south1.run.app/api';

// --- MATH HELPERS for Polar Coordinate Pathing ---
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

const getShortestAngleDiff = (start, end) => {
    let diff = (end - start) % 360;
    if (diff > 180) diff -= 360;
    if (diff <= -180) diff += 360;
    return diff;
};

// WALKING SPEED CONSTANT (Approx. units per minute for stadium scale)
const SPEED = 25; 

const getWalkingTime = (nodeA, nodeB) => {
    if (!nodeA || !nodeB) return 0;
    const r1 = getRadiusValue(nodeA.radiusLevel);
    const r2 = getRadiusValue(nodeB.radiusLevel);
    
    // Simplistic distance: Radial distance + Arc distance
    const radialDist = Math.abs(r1 - r2);
    const avgR = (r1 + r2) / 2;
    const angleDiff = Math.abs(getShortestAngleDiff(nodeA.angle || 0, nodeB.angle || 0));
    const arcDist = (angleDiff / 180) * Math.PI * avgR;
    
    return Math.round((radialDist + arcDist) / SPEED);
};

// Gets the zone color strictly by zone string or angle mapping for gates/reception
const getZoneColor = (data) => {
    if (data.zone === 'Red') return '#ef4444';
    if (data.zone === 'Blue') return '#3b82f6';
    if (data.zone === 'Green') return '#22c55e';
    if (data.zone === 'Yellow') return '#eab308';
    
    // Fallbacks based on angles if zone is missing
    const a = data.angle;
    if (a >= 315 || a < 45) return '#3b82f6'; // East/Blue
    if (a >= 45 && a < 135) return '#ef4444'; // South/Red
    if (a >= 135 && a < 225) return '#22c55e'; // West/Green
    if (a >= 225 && a < 315) return '#eab308'; // North/Yellow
    return '#94a3b8'; // Neutral
};

function App() {
  const [zoneData, setZoneData] = useState({});
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); 
  const [selectedTarget, setSelectedTarget] = useState(null);
  const [userLoc, setUserLoc] = useState('BL1');
  const [view, setView] = useState('dashboard');
  const [lastUpdate, setLastUpdate] = useState(new Date().toLocaleTimeString());

  const [aiNudge, setAiNudge] = useState(null);

  useEffect(() => {
    const fetchOccupancy = () => {
        fetch(`${MOCK_API_URL}/venues/status`)
        .then(res => res.json())
        .then(data => {
            setZoneData(data);
            setLoading(false);
            setLastUpdate(new Date().toLocaleTimeString());
        })
        .catch(err => console.error("Waiting for Backend..."));
    };

    fetchOccupancy();
    const pollInterval = setInterval(fetchOccupancy, 2500); // 2.5s for efficiency
    return () => clearInterval(pollInterval);
  }, []);

  const displayNodes = useMemo(() => {
      if (!zoneData || !userLoc) return [];
      const userNode = zoneData[userLoc] || { radiusLevel: 'pitch', angle: 0 };

      return Object.entries(zoneData)
        .filter(([_, data]) => data.type !== 'seat')
        .filter(([_, data]) => filter === 'all' || data.type === filter)
        .map(([name, data]) => {
            const walkTime = getWalkingTime(userNode, data);
            return { 
                name, 
                ...data, 
                walkTime,
                totalTime: data.waitTimeMins + walkTime 
            };
        });
  }, [zoneData, filter, userLoc]);

  const lowestWaitNode = useMemo(() => {
      if (displayNodes.length === 0) return null;
      return displayNodes.reduce((min, node) => node.waitTimeMins < min.waitTimeMins ? node : min, displayNodes[0]);
  }, [displayNodes]);

  const fastestTotalNode = useMemo(() => {
      if (displayNodes.length === 0) return null;
      return displayNodes.reduce((min, node) => node.totalTime < min.totalTime ? node : min, displayNodes[0]);
  }, [displayNodes]);

  const triggerLocalMathNudge = () => {
      if (!displayNodes.length) return;
      const minWait = displayNodes.reduce((min, node) => node.waitTimeMins < min.waitTimeMins ? node : min, displayNodes[0]);
      const minTotal = displayNodes.reduce((min, node) => node.totalTime < min.totalTime ? node : min, displayNodes[0]);
      
      const HighlightBox = ({ text }) => <span className="font-black text-neon-green not-italic mx-1">{text}</span>;

      if (minTotal.name === minWait.name) {
          setAiNudge(<span>"Smart Suggestion: Take the route to <HighlightBox text={minTotal.name} /> to save time. This location has the perfect balance of proximity and low wait times."</span>);
      } else {
          setAiNudge(<span>"Smart Suggestion: Take the route to <HighlightBox text={minTotal.name} /> to save time. Although <HighlightBox text={minWait.name} /> has a shorter line, walking there takes longer than the time you'd save."</span>);
      }
  };

  // Fetch AI Nudge when filter changes (Google Services Integration - Option A)
  useEffect(() => {
    if (filter !== 'all' && zoneData && userLoc) {
        fetch(`${MOCK_API_URL}/recommendation/nudge`, { 
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ currentLocation: userLoc })
        })
        .then(res => res.json())
        .then(data => {
            if (data.nudgeText) {
                setAiNudge(data.nudgeText);
            } else {
                // Backend signaled no key or error -> Trigger Local Math (Option B)
                triggerLocalMathNudge();
            }
        })
        .catch(() => triggerLocalMathNudge());
    } else {
        setAiNudge(null);
    }
  }, [filter, userLoc]);

  if (loading) return <div className="p-10 text-center text-xl text-white animate-pulse">Initializing Arena Matrix...</div>;

  // --- A* NAVIGATIONAL ROUTING SVG COMPILER ---
  const generateRealisticPath = (startNode, endNode) => {
      if (!startNode || !endNode) return "";
      
      if (startNode.radiusLevel === undefined || startNode.radiusLevel === 'pitch') {
          const pt = getCoords(endNode.angle || 0, 150);
          const p2 = getCoords(endNode.angle || 0, endNode.radiusLevel);
          return `M 200 200 L ${pt.x} ${pt.y} L ${p2.x} ${p2.y}`;
      }

      const r1 = getRadiusValue(startNode.radiusLevel);
      const r2 = getRadiusValue(endNode.radiusLevel);
      const a1 = startNode.angle;
      const a2 = endNode.angle;

      let path = `M ${getCoords(a1, r1).x} ${getCoords(a1, r1).y} `;
      const STAIRWELLS = [45, 135, 225, 315];
      let currentAngle = a1;

      if (r1 !== r2 && r1 !== 150) { 
          let bestStair = currentAngle;
          let minDiff = 999;
          STAIRWELLS.forEach(s => {
              const diff = Math.abs(getShortestAngleDiff(currentAngle, s));
              if (diff < minDiff) { minDiff = diff; bestStair = s; }
          });

          if (Math.abs(currentAngle - bestStair) > 1) { 
              const sweep1 = getShortestAngleDiff(currentAngle, bestStair) > 0 ? 1 : 0;
              const ptStair1 = getCoords(bestStair, r1);
              path += `A ${r1} ${r1} 0 0 ${sweep1} ${ptStair1.x} ${ptStair1.y} `;
              currentAngle = bestStair;
          }

          const TARGET_RING = 150;
          const ptStair2 = getCoords(currentAngle, TARGET_RING);
          path += `L ${ptStair2.x} ${ptStair2.y} `;
      }

      if (Math.abs(currentAngle - a2) > 1) {
          const sweep2 = getShortestAngleDiff(currentAngle, a2) > 0 ? 1 : 0;
          const arcRadius = r1 !== r2 ? 150 : r1; 
          const ptTargetAngle = getCoords(a2, arcRadius);
          
          path += `A ${arcRadius} ${arcRadius} 0 0 ${sweep2} ${ptTargetAngle.x} ${ptTargetAngle.y} `;
      }

      const ptFinal = getCoords(a2, r2);
      path += `L ${ptFinal.x} ${ptFinal.y}`;

      return path;
  };

  const generateDirections = (startKey, endKey) => {
      if(startKey === endKey) return "You are already at the destination.";
      
      const startNode = zoneData[startKey] || { zone: 'Center', radiusLevel: 'pitch' };
      const endNode = zoneData[endKey] || { zone: 'Center', radiusLevel: 'pitch' };

      const STAIRWELLS = [45, 135, 225, 315];
      let bestStair = startNode.angle;
      let minDiff = 999;
      STAIRWELLS.forEach(s => {
          const diff = Math.abs(getShortestAngleDiff(startNode.angle || 0, s));
          if (diff < minDiff) { minDiff = diff; bestStair = s; }
      });

      let stairName = "";
      if (bestStair === 45) stairName = "North-East Stairs";
      if (bestStair === 135) stairName = "South-East Stairs";
      if (bestStair === 225) stairName = "South-West Stairs";
      if (bestStair === 315) stairName = "North-West Stairs";

      return (
          <ul className="text-[13px] md:text-sm space-y-4 text-gray-300 font-mono list-decimal pl-5 marker:text-neon-green">
              <li>Depart from your location: <span className="text-white font-bold">{startKey}</span>.</li>
              
              {startNode.radiusLevel === 'lower' && <li>Walk along the lower path to the <span className="text-white font-bold">{stairName}</span>. Go up the stairs to the Main Walkway.</li>}
              {startNode.radiusLevel === 'upper' && <li>Walk down the <span className="text-white font-bold">{stairName}</span> onto the Main Walkway.</li>}
              {(startNode.radiusLevel === 'gate') && <li>Pass through the gates and enter the Main Walkway.</li>}
              
              <li>Follow the perimeter walkway towards the <span className="bg-gray-800 text-white px-2 py-1 rounded border border-gray-600">{endNode.zone || 'Target'} Zone</span>.</li>
              
              {endNode.radiusLevel === 'gate' && <li>Turn outwards and walk straight to exit.</li>}
              {endNode.radiusLevel === 'lower' && <li>Go down the stairs to the lower seats.</li>}
              
              <li>Arrive at your destination: <span className="text-neon-green font-black underline underline-offset-4 decoration-2">{endKey}</span>.</li>
          </ul>
      );
  };

  if (view === 'map' && selectedTarget) {
      const startNode = zoneData[userLoc] || { radiusLevel: 'pitch', angle: 0 };
      const endNode = zoneData[selectedTarget];
      const routeColor = getZoneColor(endNode) !== '#94a3b8' ? getZoneColor(endNode) : '#22c55e'; // Inherit target color for route

      return (
          <div className="min-h-screen bg-stadium-dark px-4 py-8 flex flex-col items-center">
              <header className="w-full max-w-4xl px-4 flex justify-between items-center mb-6">
                 <div>
                     <h1 className="text-4xl text-white font-black italic shadow-text tracking-tighter cursor-pointer" onClick={() => setView('dashboard')}>ARENA MAP</h1>
                 </div>
                 <button onClick={() => setView('dashboard')} className="px-6 py-2 border border-gray-600 bg-gray-800 text-white rounded-full hover:bg-neon-green hover:text-black font-bold uppercase transition-all shadow-lg active:scale-95 text-xs">
                     Back
                 </button>
              </header>

              {/* Flex Container for Legend and Map - Legend on Right */}
              <div className="w-full max-w-4xl flex flex-col md:flex-row-reverse items-center md:items-start justify-center gap-6">
                
                {/* SVG LEGEND (Moved to Right) */}
                <div role="region" aria-label="Map Legend" className="w-full md:w-56 bg-stadium-card rounded-[20px] p-5 border border-gray-700 shadow-xl flex-shrink-0">
                    <h4 className="font-black text-white mb-4 pb-2 border-b border-gray-700 tracking-widest text-[12px]">MAP LEGEND</h4>
                    <div className="flex items-center mb-3"><div className="w-3 h-3 bg-gray-500 rounded-full mr-3"></div> <span className="text-[11px] font-mono text-gray-300">Seats</span></div>
                    <div className="flex items-center mb-3"><div className="w-3 h-3 bg-white mr-3"></div> <span className="text-[11px] font-mono text-gray-300">Gates</span></div>
                    <div className="flex items-center mb-3"><div className="w-3 h-3 bg-white rounded-full border border-gray-500 mr-3"></div> <span className="text-[11px] font-mono text-gray-300">Food Stall</span></div>
                    <div className="flex items-center mb-3"><div className="w-0 h-0 border-l-[5px] border-l-transparent border-r-[5px] border-r-transparent border-b-[8px] border-b-white mr-3"></div> <span className="text-[11px] font-mono text-gray-300">Washrooms</span></div>
                    <div className="flex items-center mb-4"><div className="w-4 h-4 bg-white transform rotate-45 scale-75 mr-3"></div> <span className="text-[11px] font-mono text-gray-300">Reception</span></div>
                    <div className="flex items-center mb-3 pt-2 border-t border-gray-800"><div className="flex space-x-1 mr-3"><div className="w-1 h-3 bg-gray-500"/><div className="w-1 h-3 bg-gray-500"/><div className="w-1 h-3 bg-gray-500"/></div> <span className="text-[11px] font-mono text-gray-400">Staircase Access</span></div>
                    <div className="flex items-center"><div className="w-4 h-1.5 bg-gray-600 mr-3"></div> <span className="text-[11px] font-mono text-gray-400">Main Walkway</span></div>
                </div>

                {/* Massive SVG Renderer */}
                <div className="w-full max-w-[600px] aspect-square relative bg-stadium-card rounded-[40px] p-2 md:p-6 border border-gray-800 shadow-[0_0_50px_rgba(0,0,0,0.5)]">
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

                        {/* Advanced Orthogonal/Radial SVG Routing Path */}
                        {endNode && (
                            <path 
                                d={generateRealisticPath(startNode, endNode)}
                                fill="none" stroke={routeColor} strokeWidth="6" strokeDasharray="15 15" className="animate-[dash_8s_linear_infinite]" strokeLinecap="round" strokeLinejoin="round" style={{filter: `drop-shadow(0 0 8px ${routeColor})`}}
                            />
                        )}

                        {/* User Marker */}
                        {userLoc === 'Center Pitch' ? (
                        <circle cx="200" cy="200" r="8" fill="#fff" className="animate-ping" label="Current Position" />
                        ) : (
                        <g transform={`translate(${getCoords(startNode.angle, startNode.radiusLevel).x}, ${getCoords(startNode.angle, startNode.radiusLevel).y})`}>
                            <circle cx="0" cy="0" r="10" fill="none" stroke="#fff" strokeWidth="2" className="animate-ping" />
                            <circle cx="0" cy="0" r="6" fill="#fff" />
                        </g>
                        )}

                        {/* All Math Nodes Plotting */}
                        {Object.entries(zoneData).map(([name, data]) => {
                            const coords = getCoords(data.angle, data.radiusLevel);
                            const isSelected = selectedTarget === name;
                            
                            // Color specific by zone
                            let dotColor = getZoneColor(data);

                            return (
                                <g key={name} className="transition-transform origin-center" style={{ transformOrigin: `${coords.x}px ${coords.y}px` }} aria-label={`${name} - ${data.type}`}>
                                    
                                    {/* No pulse ring as requested */}
                                    
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
                                    
                                    <text x={coords.x} y={coords.y + 22} fontSize="9" fill={isSelected ? "#fff" : "#94a3b8"} textAnchor="middle" className="font-mono font-bold drop-shadow-md tracking-tighter">
                                        {data.radiusLevel === 'gate' ? name.split(' ')[1] : (data.type === 'seat' ? name : '')}
                                    </text>
                                </g>
                            );
                        })}
                    </svg>
                </div>
              </div>

              {/* Text Directions physically below map, normal document flow */}
              <div role="region" aria-label="Navigation Steps" className="w-full max-w-4xl bg-stadium-card border border-gray-700 p-8 shadow-2xl rounded-3xl mt-6 relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-4 opacity-10"><svg className="w-24 h-24" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M12 1.586l-4 4v12.828l4-4V1.586zM3.707 3.293A1 1 0 002 4v10a1 1 0 00.293.707L6 18.414V5.586L3.707 3.293zM17.707 5.293L14 1.586v12.828l2.293 2.293A1 1 0 0018 16V6a1 1 0 00-.293-.707z" clipRule="evenodd"></path></svg></div>
                  <h3 className="text-neon-green font-black uppercase text-xl border-b border-gray-700 pb-3 mb-4 flex items-center relative z-10">
                      <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path></svg>
                      Turn-by-Turn Directions
                  </h3>
                  <div className="relative z-10">
                      {generateDirections(userLoc, selectedTarget)}
                  </div>
              </div>
          </div>
      );
  }

  // DASHBOARD VIEW
  return (
    <div className="max-w-xl mx-auto p-4 min-h-screen flex flex-col text-white pb-20">
        <header className="border-b border-gray-700 pb-4 mb-6">
            <h1 className="text-4xl font-black text-white mb-1 tracking-tighter shadow-text uppercase">Stadium Saathi</h1>
            <div className="flex justify-between items-center text-[10px] font-mono uppercase text-neon-green drop-shadow-md mt-1">
                <span>Active Grid Nodes: {Object.keys(zoneData).length}</span>
                <span className="bg-neon-green text-stadium-dark font-black px-2 py-1 rounded shadow shadow-neon-green/30">SYNC: {lastUpdate}</span>
            </div>
        </header>

        {/* Global Controls - Grouped Dropdown */}
        <section className="bg-stadium-card p-5 rounded-[20px] border border-gray-700 mb-6 shadow-2xl relative overflow-hidden group hover:border-gray-500 transition-colors">
            <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity"><svg className="w-20 h-20" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd"></path></svg></div>
            <h2 className="text-[12px] text-gray-300 font-bold tracking-widest mb-3 uppercase flex items-center">
                <svg className="w-4 h-4 mr-2 text-neon-green" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path></svg>
                Where are you?
            </h2>
            <select 
                aria-label="Select your current location"
                className="w-full bg-stadium-dark border border-gray-600 text-white rounded-xl p-4 outline-none focus:border-neon-green focus:shadow-[0_0_15px_rgba(34,197,94,0.3)] font-mono z-10 relative cursor-pointer text-lg font-bold"
                value={userLoc}
                onChange={(e) => setUserLoc(e.target.value)}
            >
                <option value="" disabled>Select your location</option>
                <optgroup label="Lower Seats">
                    {Object.keys(zoneData).filter(k => zoneData[k].radiusLevel==='lower').map(k => <option key={k} value={k}>{k}</option>)}
                </optgroup>
                <optgroup label="Upper Seats">
                    {Object.keys(zoneData).filter(k => zoneData[k].radiusLevel==='upper').map(k => <option key={k} value={k}>{k}</option>)}
                </optgroup>
                <optgroup label="Gates">
                    {Object.keys(zoneData).filter(k => zoneData[k].type==='gate').map(k => <option key={k} value={k}>{k}</option>)}
                </optgroup>
                <optgroup label="Food Stalls">
                    {Object.keys(zoneData).filter(k => zoneData[k].type==='food').map(k => <option key={k} value={k}>{k}</option>)}
                </optgroup>
                <optgroup label="Washrooms">
                    {Object.keys(zoneData).filter(k => zoneData[k].type==='restroom').map(k => <option key={k} value={k}>{k}</option>)}
                </optgroup>
                <optgroup label="Reception">
                    {Object.keys(zoneData).filter(k => zoneData[k].type==='reception').map(k => <option key={k} value={k}>{k}</option>)}
                </optgroup>
            </select>
        </section>

        {/* Filters */}
        <div className="mb-6" role="tablist" aria-label="Amenity Filters">
            <div className="grid grid-cols-5 gap-2">
                {['all', 'gate', 'food', 'restroom', 'reception'].map(f => (
                    <button 
                        key={f}
                        role="tab"
                        aria-selected={filter === f}
                        onClick={() => { setFilter(f); setSelectedTarget(null); }}
                        className={`py-3 rounded-xl text-[10px] leading-tight font-black uppercase transition-all ${filter === f ? 'bg-neon-green text-stadium-dark shadow-[0_0_20px_rgba(34,197,94,0.4)] scale-[1.03] border border-neon-green' : 'bg-stadium-card text-gray-400 border border-gray-700 hover:text-white hover:border-gray-500'}`}
                    >
                        {f.substring(0,4)}
                    </button>
                ))}
            </div>
        </div>

        {/* BOX 1: Lowest Crowd (Shortest Queue) - Only shows if different from Smartest Route OR if Smartest Route is hidden */}
        {lowestWaitNode && filter !== 'all' && (
            (lowestWaitNode.name !== fastestTotalNode?.name) || (fastestTotalNode?.totalTime > 25)
        ) && (
            <div className="bg-stadium-card border-2 border-neon-yellow p-6 rounded-3xl mb-4 shadow-[0_0_20px_rgba(234,179,8,0.1)] relative overflow-hidden group">
                <div className="absolute top-0 right-0 bg-neon-yellow text-stadium-dark text-[11px] font-black px-4 py-1.5 rounded-bl-[20px] tracking-widest uppercase shadow">SHORTEST QUEUE</div>
                <h3 className="text-3xl font-black mb-1 relative z-10">{lowestWaitNode.name}</h3>
                <p className="text-gray-300 font-mono mb-4 text-sm flex items-center relative z-10 border-b border-gray-800 pb-4">
                    <span className="text-neon-yellow font-black text-2xl mr-3">{lowestWaitNode.waitTimeMins}m Wait</span> 
                     (Fastest Line)
                </p>
                <button 
                    onClick={() => { setSelectedTarget(lowestWaitNode.name); setView('map'); }}
                    className="w-full shadow-lg bg-neon-yellow hover:bg-yellow-400 text-stadium-dark font-black py-4 rounded-xl text-lg transition-all active:scale-[0.98] outline-none flex justify-center items-center relative z-10"
                >
                    NAVIGATE ME
                    <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
                </button>
            </div>
        )}

        {/* BOX 2: AI Smart Nudge - Only show if total time is NOT long (<25m) and there's a benefit to highlight */}
        {aiNudge && filter !== 'all' && fastestTotalNode?.totalTime <= 25 && (
            <div className="mb-6 bg-stadium-dark border border-gray-600 p-4 rounded-2xl flex items-start animate-in fade-in slide-in-from-bottom-4 duration-700 shadow-xl">
                <div className="w-8 h-8 bg-blue-500/20 text-blue-400 rounded-lg flex items-center justify-center mr-3 mt-1 flex-shrink-0 border border-blue-500/30">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                </div>
                <div>
                   <span className="text-[10px] font-black uppercase text-blue-400 tracking-widest mb-1 block">AI Strategic Insight</span>
                   <p className="text-sm text-gray-200 font-mono italic leading-relaxed">{typeof aiNudge === 'string' ? `"${aiNudge}"` : aiNudge}</p>
                </div>
            </div>
        )}

        {/* BOX 3: Smartest Route - Only show if total time is NOT long (<25m) */}
        {fastestTotalNode && filter !== 'all' && fastestTotalNode.totalTime <= 25 && (
            <div className="bg-stadium-dark border-2 border-neon-green p-6 rounded-3xl mb-8 shadow-[0_0_40px_rgba(34,197,94,0.2)] relative overflow-hidden group">
                <div className="absolute inset-0 bg-neon-green/5 group-hover:bg-neon-green/10 transition-colors"></div>
                <div className="absolute top-0 right-0 bg-neon-green text-stadium-dark text-[11px] font-black px-4 py-1.5 rounded-bl-[20px] tracking-widest uppercase shadow">SMARTEST ROUTE</div>
                <h3 className="text-3xl font-black mb-1 relative z-10">{fastestTotalNode.name}</h3>
                <p className="text-gray-300 font-mono mb-6 text-sm flex items-center relative z-10 border-b border-gray-800 pb-4">
                    <span className="text-neon-green font-black text-2xl mr-3">{fastestTotalNode.totalTime}m Total</span> 
                     ({fastestTotalNode.walkTime}m walk + {fastestTotalNode.waitTimeMins}m wait)
                </p>
                <button 
                    onClick={() => { setSelectedTarget(fastestTotalNode.name); setView('map'); }}
                    className="w-full shadow-2xl bg-neon-green hover:bg-green-400 text-stadium-dark font-black py-5 rounded-2xl text-xl transition-all active:scale-[0.98] outline-none hover:shadow-[0_0_30px_rgba(34,197,94,0.5)] flex justify-center items-center relative z-10"
                >
                    NAVIGATE ME
                    <svg className="w-6 h-6 ml-3 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
                </button>
            </div>
        )}


        <div className="space-y-4" role="list" aria-label="Available Locations">
            {displayNodes.map((node, i) => {
                let color = "text-neon-green"; let bgLine = "bg-neon-green";
                if(node.totalTime >= 15) { color = "text-neon-red"; bgLine = "bg-neon-red"; }
                else if(node.totalTime >= 8) { color = "text-neon-yellow"; bgLine = "bg-neon-yellow"; }

                return (
                    <div key={node.name} role="listitem" className="p-4 rounded-2xl bg-stadium-card border border-gray-800 flex justify-between items-center relative overflow-hidden active:scale-[0.98] transition-all hover:bg-stadium-card/80">
                        <div className={`absolute left-0 top-0 bottom-0 w-2.5 ${bgLine} opacity-90 block`}></div>
                        <div className="pl-4">
                            <span className="font-black text-white block leading-tight text-xl">{node.name}</span>
                            <span className="text-[10px] text-gray-400 font-mono uppercase tracking-widest bg-gray-900/50 px-2 py-0.5 rounded mt-1 inline-block">
                                {node.walkTime}m walk • {node.waitTimeMins}m wait
                            </span>
                        </div>
                        <div className="text-right flex items-center pr-1">
                            <span className={`font-mono text-3xl font-black mr-5 ${color} drop-shadow-md`}>{node.totalTime}<span className="text-sm font-bold text-gray-500">m</span></span>
                            <button 
                                onClick={() => { setSelectedTarget(node.name); setView('map'); }}
                                aria-label={`Navigate to ${node.name}`}
                                className={`w-12 h-12 rounded-full border-2 border-gray-600 bg-stadium-dark text-gray-400 hover:${bgLine} hover:border-${bgLine.split('-')[1]}-${bgLine.split('-')[2]} hover:text-white flex items-center justify-center transition-all shadow-xl group cursor-pointer`}
                            >
                                <svg className="w-6 h-6 group-hover:scale-125 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
                            </button>
                        </div>
                    </div>
                );
            })}
        </div>
    </div>
  );
}

export default App;
