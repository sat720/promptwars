const express = require('express');
const router = express.Router();
const store = require('../services/store');

// --- Announcements API ---
router.get('/announcements', (req, res) => {
    const sorted = [...store.announcements].sort((a, b) => b.timestamp - a.timestamp);
    res.json(sorted);
});

router.post('/announcements', (req, res) => {
    const { message } = req.body;
    if (!message) return res.status(400).json({ error: "Message is required" });
    
    const newAnnouncement = {
        id: store.nextAnnounceId++,
        message,
        timestamp: Date.now()
    };
    store.announcements.push(newAnnouncement);
    res.status(201).json(newAnnouncement);
});

router.delete('/announcements/:id', (req, res) => {
    const id = parseInt(req.params.id);
    store.announcements = store.announcements.filter(a => a.id !== id);
    res.status(200).json({ success: true });
});

// --- Orders API ---
router.get('/orders', (req, res) => {
    const sorted = [...store.orders].sort((a, b) => b.timestamp - a.timestamp);
    res.json(sorted);
});

router.post('/orders', (req, res) => {
    const { items, seatInfo, totalAmount } = req.body;
    if (!items || !items.length || !seatInfo) {
        return res.status(400).json({ error: "Items and seat info required" });
    }
    
    const newOrder = {
        id: store.nextOrderId++,
        items,
        seatInfo,
        totalAmount: totalAmount || 0,
        status: "Pending", 
        timestamp: Date.now()
    };
    store.orders.push(newOrder);
    res.status(201).json(newOrder);
});

router.patch('/orders/:id/status', (req, res) => {
    const id = parseInt(req.params.id);
    const { status } = req.body;
    
    const order = store.orders.find(o => o.id === id);
    if (!order) return res.status(404).json({ error: "Order not found" });
    
    order.status = status;
    res.json(order);
});

// --- Alert Feed API (SOS + Internal) ---
router.get('/alerts', (req, res) => {
    const sorted = [...store.alerts].sort((a, b) => b.timestamp - a.timestamp);
    res.json(sorted);
});

router.patch('/alerts/:id/status', (req, res) => {
    const id = parseInt(req.params.id);
    const { status } = req.body;
    const alert = store.alerts.find(a => a.id === id);
    if (!alert) return res.status(404).json({ error: "Alert not found" });
    alert.status = status;
    res.json(alert);
});

// SOS API integrated into alerts
router.post('/sos', (req, res) => {
    const { name, mobile, location, landmarks } = req.body;
    
    // Create dual entry: One for SOS log (for compatibility) and one for Alert Feed
    const newAlert = {
        id: store.nextAlertId++,
        type: "SOS",
        priority: "HIGH",
        status: "Pending",
        message: `SOS Signal from ${name} (${mobile}).`,
        details: landmarks,
        location: location,
        timestamp: Date.now()
    };
    
    store.alerts.push(newAlert);
    res.status(201).json(newAlert);
});

// --- Live Score API ---
router.get('/score', (req, res) => {
    res.json(store.liveScore);
});

// --- System Utilities ---
router.post('/reset', (req, res) => {
    // Reset to initial state
    store.announcements = [
        { id: 1, message: "Welcome to the Stadium! Enjoy the event.", timestamp: Date.now() },
        { id: 2, message: "Food stalls in the Green Zone currently have the shortest wait.", timestamp: Date.now() - 600000 }
    ];
    store.orders = [];
    store.alerts = [
        { id: 101, type: "MEDICAL", priority: "LOW", status: "Pending", message: "Person feeling dizzy due to heat", location: "South Food Court", timestamp: Date.now() - 27000 },
        { id: 102, type: "SECURITY", priority: "MEDIUM", status: "Pending", message: "Unauthorized person in restricted area", location: "Section E2 Upper", timestamp: Date.now() - 120000 },
        { id: 103, type: "SECURITY", priority: "LOW", status: "Pending", message: "Suspicious bag reported", location: "Section E2 Upper", timestamp: Date.now() - 120000 },
        { id: 104, type: "CROWD", priority: "HIGH", status: "Pending", message: "Slow movement detected in exit lane", location: "North Concourse East", timestamp: Date.now() - 120000 },
        { id: 105, type: "LOST", priority: "HIGH", status: "Pending", message: "Family with children lost near South Concourse", location: "South Concourse West", timestamp: Date.now() - 150000 }
    ];
    store.nextAnnounceId = 3;
    store.nextOrderId = 1;
    store.nextAlertId = 200;
    
    res.json({ success: true, message: "Demo data reset to factory defaults." });
});

module.exports = router;
