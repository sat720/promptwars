import { Link } from 'react-router-dom';

export default function Landing() {
    return (
        <div className="min-h-screen bg-stadium-dark flex flex-col justify-center items-center text-center p-4">
            <h1 className="text-6xl font-black text-white italic tracking-tighter shadow-text mb-4">
                STADIUM <span className="text-neon-green">SAATHI</span>
            </h1>
            <p className="text-gray-400 font-mono mb-12 text-sm uppercase tracking-widest">
                Choose your role to enter the platform
            </p>
            
            <div className="flex flex-col md:flex-row gap-6 w-full max-w-2xl">
                <Link to="/user" className="flex-1 group">
                    <div className="bg-stadium-card border-2 border-gray-700 hover:border-neon-green p-8 rounded-3xl transition-all duration-300 shadow-2xl hover:shadow-[0_0_40px_rgba(34,197,94,0.3)] hover:-translate-y-2">
                        <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-neon-green/20">
                            <svg className="w-8 h-8 text-white group-hover:text-neon-green transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
                        </div>
                        <h2 className="text-2xl font-black text-white uppercase tracking-wider mb-2">Fan Portal</h2>
                        <p className="text-sm font-mono text-gray-400">Navigate the arena, order food, and get live updates.</p>
                    </div>
                </Link>
                
                <Link to="/admin" className="flex-1 group">
                    <div className="bg-stadium-card border-2 border-gray-700 hover:border-blue-500 p-8 rounded-3xl transition-all duration-300 shadow-2xl hover:shadow-[0_0_40px_rgba(59,130,246,0.3)] hover:-translate-y-2">
                        <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-blue-500/20">
                            <svg className="w-8 h-8 text-white group-hover:text-blue-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                        </div>
                        <h2 className="text-2xl font-black text-white uppercase tracking-wider mb-2">Admin Center</h2>
                        <p className="text-sm font-mono text-gray-400">View orders, manage crowds, and push broadcasts.</p>
                    </div>
                </Link>
            </div>
        </div>
    );
}
