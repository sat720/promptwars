import { useState, useEffect } from 'react';

const MENU_ITEMS = [
    { id: 1, name: "Neon Slice Pizza", price: 6.50, prep: 5 },
    { id: 2, name: "Stadium Hot Dog", price: 5.00, prep: 3 },
    { id: 3, name: "Electric Soda", price: 3.50, prep: 1 },
    { id: 4, name: "Pretzel Bites", price: 4.50, prep: 2 },
];

const MOCK_API_URL = window.location.origin.includes('localhost') 
  ? 'http://localhost:8080/api' 
  : '/api';

export default function FoodOrder() {
    const [cart, setCart] = useState({});
    const [seat, setSeat] = useState('');
    const [status, setStatus] = useState('');
    const [allSeats, setAllSeats] = useState([]);

    useEffect(() => {
        fetch(`${MOCK_API_URL}/venues/status`)
            .then(res => res.json())
            .then(data => {
                const seats = Object.keys(data).filter(k => data[k].type === 'seat');
                setAllSeats(seats);
                if (seats.length > 0) setSeat(seats[0]);
            })
            .catch(() => {});
    }, []);

    const addToCart = (id) => {
        setCart(prev => ({ ...prev, [id]: (prev[id] || 0) + 1 }));
    };

    const total = MENU_ITEMS.reduce((sum, item) => sum + (cart[item.id] || 0) * item.price, 0);

    const submitOrder = async () => {
        if (total === 0) return;
        setStatus('Sending order...');
        
        const itemsList = Object.entries(cart).filter(([_,qty])=>qty>0).map(([id, qty]) => {
            const item = MENU_ITEMS.find(i => i.id == id);
            return { name: item.name, quantity: qty };
        });

        try {
            const res = await fetch(`${MOCK_API_URL}/platform/orders`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ items: itemsList, seatInfo: seat, totalAmount: total })
            });
            if (res.ok) {
                setCart({});
                setStatus('Order placed successfully! It will be delivered to your seat.');
                setTimeout(() => setStatus(''), 5000);
            }
        } catch (e) {
            setStatus('Failed to place order.');
        }
    };

    return (
        <div className="p-4 md:p-8 animate-in fade-in relative">
            <h2 className="text-3xl font-black text-neon-yellow mb-6 border-b border-gray-700 pb-2 uppercase pt-4 md:pt-0">Food Delivery</h2>
            
            {status && (
                <div className="mb-6 p-4 rounded-xl bg-gray-800 border border-green-500 text-green-400 font-mono text-sm">
                    {status}
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                    <h3 className="text-xl font-bold mb-4 text-gray-300">Menu</h3>
                    <div className="space-y-4">
                        {MENU_ITEMS.map(item => (
                            <div key={item.id} className="bg-stadium-card border border-gray-700 p-4 rounded-2xl flex justify-between items-center group hover:border-gray-500 transition-colors">
                                <div>
                                    <h4 className="font-bold text-lg text-white">{item.name}</h4>
                                    <p className="text-xs text-gray-400 font-mono">${item.price.toFixed(2)} • Est. {item.prep} min</p>
                                </div>
                                <button onClick={() => addToCart(item.id)} className="w-10 h-10 rounded-full bg-gray-800 text-neon-yellow hover:bg-neon-yellow hover:text-black font-black text-xl transition-colors shadow flex items-center justify-center">
                                    +
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                <div>
                    <div className="bg-stadium-card border border-neon-yellow/30 p-6 rounded-3xl sticky top-24 shadow-2xl">
                        <h3 className="text-xl font-bold mb-4 uppercase tracking-wider text-gray-300">Your Cart</h3>
                        
                        {total === 0 ? (
                            <p className="text-gray-500 font-mono text-sm mb-6">Cart is empty.</p>
                        ) : (
                            <div className="space-y-2 mb-6 border-b border-gray-700 pb-4">
                                {MENU_ITEMS.map(item => cart[item.id] > 0 && (
                                    <div key={item.id} className="flex justify-between text-sm font-mono text-gray-300">
                                        <span>{cart[item.id]}x {item.name}</span>
                                        <span>${(cart[item.id] * item.price).toFixed(2)}</span>
                                    </div>
                                ))}
                            </div>
                        )}

                        <div className="flex justify-between items-end mb-6">
                            <span className="text-gray-400 font-bold uppercase text-sm">Total</span>
                            <span className="text-3xl font-black text-neon-yellow">${total.toFixed(2)}</span>
                        </div>

                        <div className="mb-6">
                            <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Delivery Seat</label>
                            <select 
                                value={seat}
                                onChange={(e) => setSeat(e.target.value)}
                                className="w-full bg-gray-900 border border-gray-600 rounded-xl p-3 text-white font-mono outline-none focus:border-neon-yellow transition-colors relative z-10 appearance-none shadow-lg cursor-pointer"
                            >
                                {allSeats.map(s => <option key={s} value={s}>{s}</option>)}
                                {allSeats.length === 0 && <option value="" disabled>Loading seats...</option>}
                            </select>
                            <div className="text-[10px] text-gray-500 mt-1 italic leading-tight">Deliver straight to your chair.</div>
                        </div>

                        <button 
                            onClick={submitOrder}
                            disabled={total === 0}
                            className="w-full py-4 rounded-xl font-black text-lg uppercase transition-all bg-neon-yellow text-black hover:bg-yellow-400 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Place Order
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
