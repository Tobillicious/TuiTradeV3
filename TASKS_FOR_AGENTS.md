# 🛠️ Tasks for AI Agents (Claude, Gemini, etc.)

This file lists small, well-scoped tasks that can be picked up and completed by AI agents working in the terminal. Each task references a file and line number, and describes the improvement or refactor needed.

---

## Example Agentic Tasks

- **src/components/pages/HomePage.js: Line 18**
  - `AGENT_TASK: Extract context destructuring and validation into a custom hook for reuse.`

- **src/lib/utils.js: Line 7**
  - `AGENT_TASK: Add unit tests for CATEGORIES and related utility functions.`

- **src/components/ui/PerformanceOptimizer.js: Line 1**
  - `AGENT_TASK: Refactor PerformanceOptimizer class to support plugin-based metrics.`

- **src/components/social/UserProfile.js: Line 25**
  - `AGENT_TASK: Replace mockUser with Firestore integration (see AI_AGENT_GUIDE.md).`

- **src/lib/analytics.js: Line 132**
  - `AGENT_TASK: Replace localStorage analytics with real backend integration.`

---

## How to Add a New AGENT_TASK
- Add a comment in the code: `// AGENT_TASK: <description>`
- Add an entry here with file, line, and description.
- Keep tasks small and focused for easy agentic completion.

---

Happy hacking, AI whānau! 🚀 