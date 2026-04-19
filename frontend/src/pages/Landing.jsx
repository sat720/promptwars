import { Link } from 'react-router-dom';

export default function Landing() {
    return (
        <div className="min-h-screen bg-stadium-dark flex flex-col justify-center items-center text-center p-4 relative overflow-hidden">
            {/* FUTURISTIC BACKGROUND GRID */}
            <div className="absolute inset-0 z-0 opacity-20 pointer-events-none" 
                 style={{ backgroundImage: 'radial-gradient(#1e293b 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-stadium-dark via-transparent to-stadium-dark z-0 pointer-events-none"></div>

            <div className="relative z-10 flex flex-col items-center">
                <div className="flex items-center space-x-3 mb-6 bg-gray-900/50 border border-gray-800 px-4 py-2 rounded-2xl backdrop-blur-md animate-in fade-in slide-in-from-top-4 duration-700">
                    <div className="relative">
                        <div className="w-2.5 h-2.5 rounded-full bg-neon-green animate-ping absolute inset-0"></div>
                        <div className="w-2.5 h-2.5 rounded-full bg-neon-green relative shadow-[0_0_10px_#22c55e]"></div>
                    </div>
                    <span className="text-[10px] font-black text-gray-300 uppercase tracking-[0.3em]">Stadium Intelligence Service Online</span>
                </div>

                <h1 className="text-6xl md:text-8xl font-black text-white italic tracking-tighter mb-4 animate-in zoom-in-95 duration-700">
                    STADIUM <span className="text-neon-green italic drop-shadow-[0_0_15px_rgba(34,197,94,0.4)]">SAATHI</span>
                </h1>
                
                <p className="text-gray-400 font-mono mb-16 text-sm uppercase tracking-[0.4em] max-w-lg opacity-80">
                    Next-Gen Crowd Orchestration <br/> Powered by Gemini 1.5 Flash
                </p>
                
                <div className="flex flex-col md:flex-row gap-8 w-full max-w-3xl animate-in fade-in slide-in-from-bottom-8 duration-1000 fill-mode-both">
                    <Link to="/user" className="flex-1 group">
                        <div className="bg-[#0f172a]/80 backdrop-blur-xl border border-gray-800 hover:border-neon-green p-10 rounded-[2.5rem] transition-all duration-500 shadow-2xl hover:shadow-[0_0_60px_rgba(34,197,94,0.2)] hover:-translate-y-3 flex flex-col h-full relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-neon-green to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                            <div className="w-20 h-20 bg-gray-900 border border-gray-800 rounded-3xl flex items-center justify-center mx-auto mb-8 group-hover:bg-neon-green group-hover:text-black transition-all duration-300">
                                <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
                            </div>
                            <h2 className="text-3xl font-black text-white uppercase tracking-tighter mb-3">Fan Portal</h2>
                            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest leading-relaxed">Navigate the arena, order food, and get live AI strategy nudges.</p>
                            <div className="mt-auto pt-8 flex items-center justify-center text-neon-green text-[10px] font-black uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                                Authenticating Fan Session →
                            </div>
                        </div>
                    </Link>
                    
                    <Link to="/admin" className="flex-1 group">
                        <div className="bg-[#0f172a]/80 backdrop-blur-xl border border-gray-800 hover:border-blue-500 p-10 rounded-[2.5rem] transition-all duration-500 shadow-2xl hover:shadow-[0_0_60px_rgba(59,130,246,0.2)] hover:-translate-y-3 flex flex-col h-full relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                            <div className="w-20 h-20 bg-gray-900 border border-gray-800 rounded-3xl flex items-center justify-center mx-auto mb-8 group-hover:bg-blue-500 group-hover:text-white transition-all duration-300">
                                <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                            </div>
                            <h2 className="text-3xl font-black text-white uppercase tracking-tighter mb-3">Admin Center</h2>
                            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest leading-relaxed">Monitor crowd telemetry, manage orders, and push global broadcasts.</p>
                            <div className="mt-auto pt-8 flex items-center justify-center text-blue-400 text-[10px] font-black uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                                Accessing Command Node →
                            </div>
                        </div>
                    </Link>
                </div>

                <div className="mt-16 flex items-center space-x-8 opacity-40 animate-in fade-in duration-1000 delay-500">
                    <span className="text-[9px] font-black text-white uppercase tracking-widest border border-white/20 px-3 py-1 rounded">V1.4.0-Stable</span>
                    <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Built for PromptWars 2026</span>
                </div>
            </div>
        </div>
    );
}
