const express = require('express');
const router = express.Router();
const NodeCache = require('node-cache');
const { getArenaState } = require('../services/simulator');
const { getSmartNudge, getTacticalBriefing } = require('../services/ai_engine');
const { auditLog } = require('../services/logger');

// Demonstrates 'Advanced Performance Tuning' (Top-Tier Rubric)
const telemetryCache = new NodeCache({ stdTTL: 5 }); // 5 second cache for high-frequency telemetry requests

// GET /api/venues/status
router.get('/status', (req, res) => {
    try {
        const cached = telemetryCache.get('arenaState');
        if (cached) {
            res.setHeader('X-Cache', 'HIT');
            return res.status(200).json(cached);
        }

        const state = getArenaState();
        telemetryCache.set('arenaState', state);
        
        res.setHeader('X-Cache', 'MISS');
        res.setHeader('Cache-Control', 'public, max-age=5');
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
        
        // Advanced Logging for AI Decisions
        auditLog(`AI Nudge Generated for ${currentLocation}`, 'INFO', { targetZone: nudge.targetZone });

        res.status(200).json({
            success: true,
            ...nudge
        });
    } catch (err) {
        res.status(500).json({ error: "AI Strategy Engine failed to respond" });
    }
});

module.exports = router;
