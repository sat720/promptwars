const express = require('express');
const router = express.Router();
const { getArenaState } = require('../services/simulator');
const { getSmartNudge } = require('../services/ai_engine');

// GET /api/venues/status
router.get('/status', (req, res) => {
    try {
        const state = getArenaState();
        res.status(200).json(state);
    } catch (err) {
        res.status(500).json({ error: "Failed to retrieve stadium telemetry" });
    }
});

// POST /api/recommendation/nudge (Now AI-Powered and Location-Aware)
router.post('/nudge', async (req, res) => {
    try {
        const { currentLocation } = req.body;
        const state = getArenaState();
        const nudge = await getSmartNudge(state, currentLocation);
        res.status(200).json({
            success: true,
            ...nudge
        });
    } catch (err) {
        res.status(500).json({ error: "AI Strategy Engine failed to respond" });
    }
});

module.exports = router;
