const getStatusLabel = (time) => {
    if (time >= 15) return "Heavy";
    if (time >= 7) return "Moderate";
    if (time >= 3) return "Light";
    return "Empty";
};

const generateInitialData = () => {
    const data = {};
    const zones = [
        { color: 'Blue', centerAngle: 0 },
        { color: 'Red', centerAngle: 90 },
        { color: 'Green', centerAngle: 180 },
        { color: 'Yellow', centerAngle: 270 }
    ];

    zones.forEach(z => {
        data[`${z.color.charAt(0)}L1`] = { type: 'seat', status: 'Light', waitTimeMins: 0, angle: z.centerAngle - 20, radiusLevel: 'lower', zone: z.color };
        data[`${z.color.charAt(0)}L2`] = { type: 'seat', status: 'Light', waitTimeMins: 0, angle: z.centerAngle + 20, radiusLevel: 'lower', zone: z.color };
        
        data[`${z.color.charAt(0)}U1`] = { type: 'seat', status: 'Empty', waitTimeMins: 0, angle: z.centerAngle - 30, radiusLevel: 'upper', zone: z.color };
        data[`${z.color.charAt(0)}U2`] = { type: 'seat', status: 'Empty', waitTimeMins: 0, angle: z.centerAngle - 10, radiusLevel: 'upper', zone: z.color };
        data[`${z.color.charAt(0)}U3`] = { type: 'seat', status: 'Empty', waitTimeMins: 0, angle: z.centerAngle + 10, radiusLevel: 'upper', zone: z.color };
        data[`${z.color.charAt(0)}U4`] = { type: 'seat', status: 'Empty', waitTimeMins: 0, angle: z.centerAngle + 30, radiusLevel: 'upper', zone: z.color };

        data[`${z.color} Pizza Stall`] = { type: 'food', status: 'Moderate', waitTimeMins: Math.floor(Math.random()*15), angle: z.centerAngle - 25, radiusLevel: 'concourse', zone: z.color };
        data[`${z.color} Beverage Bar`] = { type: 'food', status: 'Light', waitTimeMins: Math.floor(Math.random()*10), angle: z.centerAngle + 25, radiusLevel: 'concourse', zone: z.color };

        data[`${z.color} Mens Room`] = { type: 'restroom', status: 'Light', waitTimeMins: Math.floor(Math.random()*8), angle: z.centerAngle - 10, radiusLevel: 'concourse', zone: z.color };
        data[`${z.color} Womens Room`] = { type: 'restroom', status: 'Heavy', waitTimeMins: Math.floor(Math.random()*20), angle: z.centerAngle + 10, radiusLevel: 'concourse', zone: z.color };
    });

    data[`Gate East`] = { type: 'gate', status: 'Heavy', waitTimeMins: Math.floor(Math.random()*25), angle: 0, radiusLevel: 'gate' };
    data[`Gate South`] = { type: 'gate', status: 'Moderate', waitTimeMins: Math.floor(Math.random()*15), angle: 90, radiusLevel: 'gate' };
    data[`Gate West`] = { type: 'gate', status: 'Light', waitTimeMins: Math.floor(Math.random()*5), angle: 180, radiusLevel: 'gate' };
    data[`Gate North`] = { type: 'gate', status: 'Empty', waitTimeMins: 0, angle: 270, radiusLevel: 'gate' };

    data[`Main Reception`] = { type: 'reception', status: 'Empty', waitTimeMins: 0, angle: 225, radiusLevel: 'concourse' };

    return data;
};

let arenaState = generateInitialData();

const store = require('./store');

const startSimulator = () => {
    // --- Existing IoT Zone Simulation ---
    setInterval(() => {
        const keys = Object.keys(arenaState);
        const randomKey = keys[Math.floor(Math.random() * keys.length)];
        if (arenaState[randomKey].type === 'seat') return;

        const change = Math.floor(Math.random() * 7) - 3; 
        let newTime = arenaState[randomKey].waitTimeMins + change;
        
        if (newTime < 0) newTime = 0;
        if (newTime > 45) newTime = 45;
        
        arenaState[randomKey].waitTimeMins = newTime;
        arenaState[randomKey].status = getStatusLabel(newTime);
    }, 1500);

    // --- Live Cricket Score Simulation ---
    setInterval(() => {
        if (!store.liveScore) return;
        
        // Update overs logic
        let overParts = store.liveScore.overs.split('.').map(Number);
        
        // Check for 50 Over Reset
        if (overParts[0] >= 50) {
            store.liveScore.scoreA = "0/0";
            store.liveScore.scoreB = "---";
            store.liveScore.overs = "0.0";
            store.liveScore.status = "New Match Started";
            return;
        }

        // Randomly update runs
        const runsArr = [0, 0, 1, 1, 1, 2, 4, 6];
        const addedRuns = runsArr[Math.floor(Math.random() * runsArr.length)];
        
        let [runs, wickets] = store.liveScore.scoreA.split('/').map(Number);
        runs += addedRuns;
        
        // Randomly add wicket (low chance)
        if (Math.random() > 0.98 && wickets < 10) {
            wickets += 1;
        }
        
        store.liveScore.scoreA = `${runs}/${wickets}`;
        
        overParts[1] += 1;
        if (overParts[1] >= 6) {
            overParts[0] += 1;
            overParts[1] = 0;
        }
        store.liveScore.overs = `${overParts[0]}.${overParts[1]}`;
        
        // Update status for variety
        if (wickets >= 10) {
            store.liveScore.status = "Innings Over";
            overParts[0] = 50; // Force reset next interval
        } else {
            store.liveScore.status = "IND batting";
        }
    }, 4000);

    // --- Periodic Platform Refresh (Every 3 Hours) ---
    setInterval(() => {
        console.log("Auto-resetting platform for new event cycle...");
        store.orders = [];
        store.announcements = [
            { id: 1, message: "Welcome to the Stadium! Please follow floor markings.", timestamp: Date.now() },
            { id: 2, message: "Match starting soon. Security checks in progress.", timestamp: Date.now() }
        ];
        store.alerts = store.alerts.filter(a => a.type === 'LOST' || a.type === 'MEDICAL'); // Keep some persistent types if needed, or wipe all
        store.alerts = [
            { id: 101, type: 'CROWD', message: 'Heavy congestion at Gate 4. Use Gate 2 for faster entry.', location: 'Gate 4', status: 'Pending', priority: 'MEDIUM', timestamp: Date.now() },
            { id: 102, type: 'SECURITY', message: 'Baggage scanners at North Stand are operational.', location: 'North Stand', status: 'Pending', priority: 'LOW', timestamp: Date.now() }
        ];
    }, 3 * 60 * 60 * 1000); 
};

const triggerScenario = (type) => {
    switch (type) {
        case 'INNING_BREAK':
            Object.keys(arenaState).forEach(k => {
                if (arenaState[k].type === 'food') arenaState[k].waitTimeMins = 35;
                if (arenaState[k].type === 'restroom') arenaState[k].waitTimeMins = 40;
            });
            break;
        case 'GATE_CLOSURE':
            arenaState['Gate East'].waitTimeMins = 50;
            arenaState['Gate South'].waitTimeMins = 45;
            break;
        case 'NORMAL':
            arenaState = generateInitialData();
            break;
    }
};

module.exports = {
    getArenaState: () => arenaState,
    startSimulator,
    triggerScenario
};
