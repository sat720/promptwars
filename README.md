# 🏟️ Stadium Saathi: AI-Powered Crowd Orchestration

**Stadium Saathi** is an advanced intelligence system designed to optimize the attendee experience at large-scale sporting venues. By moving away from static heatmaps, it provides personalized, tactical "Smart Nudget" that balance venue load and slash waiting times.

---

## 🧠 The Problem & Solving Strategy

In a crowd of 50,000, **the shortest line is not always the fastest route.** Attendees often waste time walking across a stadium only to find the "shorter" line has filled up by the time they arrive.

**Stadium Saathi** solves this using a **Hybrid Intelligence Engine**:

1.  **Wait-Time Telemetry:** Real-time monitoring of 44 stadium nodes (Food, Gates, Washrooms).
2.  **Navigation Math:** Calculates physical walking distance between the user and any destination.
3.  **Strategic Analysis:** Uses AI to determine if the "Time Saved" in a queue is worth the "Time Spent" walking there.

---

## 🖥️ The Human-Centric Interface

The dashboard is designed for high-stress, high-density environments. When a user selects a filter (e.g., "Food"), the app presents a three-layer insight:

1.  **📦 BOX 1: SHORTEST QUEUE (Yellow)**
    - Identifies the place with the absolute lowest crowd density. Useful for users who are already nearby or don't mind the walk.
2.  **📦 BOX 2: AI STRATEGIC INSIGHT (Blue)**
    - Powered by **Gemini 1.5 Flash**. It contextually explains the trade-off.
    - _Example: "Take the route to Gate North to save time. Although Stall B has a shorter line, walking there takes longer than the time you'd save."_
3.  **📦 BOX 3: SMARTEST ROUTE (Green)**
    - The mathematical "Gold Medal" choice. This node has the lowest **Total Estimated Time** (Walk + Wait).

---

## 🗺️ Advanced Physical Navigation

Unlike standard maps that draw "straight lines" through walls, Stadium Saathi uses **A\* Polar Pathfinding**:

- **Radial Geometry:** Navigation is mapped to the stadium's circular tiers (Lower, Upper, Concourse).
- **Physical Constraints:** Routes are forced through designated sector stairwells and entrance/exit corridors.
- **Visual Clarity:** Users see a realistic path following the actual architecture of the arena.

---

## 🛡️ Reliability: The Hybrid Fail-Safe

To ensure the app never "breaks" during a massive event where cell signal might be weak:

- **Option A (AI Mode):** Uses the Gemini 1.5 Flash API for human-like strategic advice.
- **Option B (Math Mode):** If the network is lost or the API is unavailable, the system instantly reverts to its internal **Deterministic Math Engine**. The user still gets a smart recommendation based on local calculations.

---

## 🚀 Technical Stack

- **Frontend:** React 18, Vite, Tailwind CSS (Custom Neon-Noir Theme)
- **Backend:** Node.js, Express.js
- **AI:** Google Generative AI (Gemini 1.5 Flash)
- **Simulation:** Real-time 44-Node Arena Matrix Simulator

---

Created for the **PromptWars/Hackathon** | _Real-time. Real-Physical. Real-Intelligence._
