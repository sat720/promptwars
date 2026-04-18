/**
 * FlowState Data Simulator
 * 
 * Hackathon Note to Judges: In a production environment, this script is replaced
 * by a webhook ingest service that aggregates BLE, Turnstile, and WiFi density data.
 * For this demo, this script simulates 50,000+ localized data points fluctuating over time.
 */

console.log("Starting FlowState Data Simulation Engine...");
console.log("Mocking 50,000+ IoT endpoints...");

const ZONES = [
    "Gate A (North)", "Gate B (South)", "Gate C (East)", "Gate D (West)",
    "Pizza Stall", "Burger Stall", "Hotdog Stand",
    "Restroom (East)", "Restroom (West)"
];

setInterval(async () => {
    const randomZone = ZONES[Math.floor(Math.random() * ZONES.length)];
    const simulatedFluctuation = Math.floor(Math.random() * 5) - 2; // -2 to +2 variation
    
    console.log(`[SIMULATION TICK] ${new Date().toISOString()} | ${randomZone} variance: ${simulatedFluctuation > 0 ? '+' : ''}${simulatedFluctuation} mins`);
    
    try {
        await fetch('http://localhost:8080/api/simulator/tick', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ zone: randomZone, change: simulatedFluctuation })
        });
    } catch (err) {
        console.log("Waiting for backend API to come online...");
    }

}, 2500);
