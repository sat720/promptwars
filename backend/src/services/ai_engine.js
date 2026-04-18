const { GoogleGenerativeAI } = require("@google/generative-ai");

// Gemini Integration Logic
const getSmartNudge = async (arenaData, currentLocation) => {
    const apiKey = process.env.GEMINI_API_KEY;
    
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
    } catch (error) {
        console.error("Gemini AI Engine Error:", error);
        return { nudgeText: null, targetZone: "Error Fallback" };
    }
};

module.exports = { getSmartNudge };
