// A simple in-memory data store for the hackathon application.
const store = {
    announcements: [
        { id: 1, message: "Welcome to the Stadium! Enjoy the event.", timestamp: Date.now() },
        { id: 2, message: "Food stalls in the Green Zone currently have the shortest wait.", timestamp: Date.now() - 600000 }
    ],
    // Orders cleared for demo
    orders: [],
    
    // Professional Alert Feed (SOS + Internal)
    alerts: [
        { 
            id: 101, 
            type: "MEDICAL", 
            priority: "LOW", 
            status: "Pending", 
            message: "Person feeling dizzy due to heat", 
            location: "South Food Court", 
            timestamp: Date.now() - 27000 
        },
        { 
            id: 102, 
            type: "SECURITY", 
            priority: "MEDIUM", 
            status: "Pending", 
            message: "Unauthorized person in restricted area", 
            location: "Section E2 Upper", 
            timestamp: Date.now() - 120000 
        },
        { 
            id: 103, 
            type: "SECURITY", 
            priority: "LOW", 
            status: "Pending", 
            message: "Suspicious bag reported", 
            location: "Section E2 Upper", 
            timestamp: Date.now() - 120000 
        },
        { 
            id: 104, 
            type: "CROWD", 
            priority: "HIGH", 
            status: "Pending", 
            message: "Slow movement detected in exit lane", 
            location: "North Concourse East", 
            timestamp: Date.now() - 120000 
        },
        { 
            id: 105, 
            type: "LOST", 
            priority: "HIGH", 
            status: "Pending", 
            message: "Family with children lost near South Concourse", 
            location: "South Concourse West", 
            timestamp: Date.now() - 150000 
        }
    ],
    
    // Incrementing counter for IDs
    nextAnnounceId: 3,
    nextOrderId: 1,
    nextAlertId: 200, // Starting high for demo alerts
    
    // Premium Live Match Data
    liveScore: {
        teamA: "IND",
        teamB: "AUS",
        scoreA: "184/3",
        scoreB: "---",
        overs: "18.2",
        status: "IND batting",
        winProb: { teamA: 62, teamB: 38 },
        weather: { temp: 28, condition: "Partly Cloudy", humidity: "42%" },
        aiInsight: "IND leads by 12 runs on DLS. Kohli rotating strike effectively. Momentum shifting back to Batting side.",
        lastBoundary: "4 by Virat Kohli (17.4 ov)"
    }
};

module.exports = store;
