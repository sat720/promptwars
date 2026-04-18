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

const startSimulator = () => {
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
};

module.exports = {
    getArenaState: () => arenaState,
    startSimulator
};
