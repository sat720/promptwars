const { GoogleGenerativeAI } = require("@google/generative-ai");
const { SecretManagerServiceClient } = require('@google-cloud/secret-manager');
const client = new SecretManagerServiceClient();

let cachedApiKey = process.env.GEMINI_API_KEY;

const fetchApiKey = async () => {
    if (cachedApiKey) return cachedApiKey;
    try {
        const name = "projects/promptwarsid/secrets/GEMINI_API_KEY/versions/latest";
        const [version] = await client.accessSecretVersion({ name });
        cachedApiKey = version.payload.data.toString();
        return cachedApiKey;
    } catch (err) {
        console.error("Failed to access Secret Manager:", err.message);
        return null;
    }
};

// Gemini Integration Logic
const getSmartNudge = async (arenaData, currentLocation) => {
    const apiKey = await fetchApiKey();
    
    // Fallback if no API key provided
    if (!apiKey) {
        return {
            nudgeText: null, // Return null to trigger frontend Math fallback (Option B)
            targetZone: "Fallback"
        };
    }

    try {
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const congestionSummary = Object.entries(arenaData)
            .filter(([_, d]) => d.type !== 'seat')
            .map(([name, d]) => `${name}: ${d.waitTimeMins}m wait`)
            .join(", ");

        const prompt = `
            You are a Stadium Crowd Orchestration AI.
            User is currently at: ${currentLocation || 'Unknown'}.
            Stadium Telemetry: ${congestionSummary}.
            
            TASK: Perform a "Stay vs. Go" analysis (Wait Time vs. Travel Time). 
            Consider that walking across the stadium (e.g. Blue to Green) takes 8-10 minutes. 
            If the wait time at the user's local amenities is similar or better than walking far away, suggest they STAY. 
            If a far-away amenity is empty enough to justify the walk, suggest they GO.
            Respond with ONE tactical nudge (max 20 words) explaining the time-saving logic.
        `;

        const result = await model.generateContent(prompt);
        const responseText = result.response.text().trim();

        return {
            nudgeText: responseText || null,
            targetZone: "Total Time Optimizer"
        };
const getTacticalBriefing = async (arenaData) => {
    const apiKey = await fetchApiKey();
    if (!apiKey) return "Autonomous Mode: Synchronizing venue nodes...";

    try {
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const stateSummary = Object.entries(arenaData)
            .filter(([_, d]) => d.type === 'gate' || d.status === 'Heavy')
            .map(([name, d]) => `${name}: ${d.waitTimeMins}m`)
            .join(", ");

        const prompt = `
            You are the "Stadium Command Intel" AI.
            Current Pressure Points: ${stateSummary || 'All systems normal.'}.
            
            TASK: Provide a 2-sentence tactical summary for the Admin Dashboard.
            Sentence 1: The current most critical bottleneck.
            Sentence 2: A proactive operational suggestion (e.g. divert traffic, open gate).
            Tone: Military, concise, authoritative.
        `;

        const result = await model.generateContent(prompt);
        return result.response.text().trim();
    } catch (error) {
        return "Intelligence Feed Interrupted. Standard protocols active.";
    }
};

module.exports = { getSmartNudge, getTacticalBriefing };
