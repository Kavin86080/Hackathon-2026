# Hackathon-2026: ExplainGrade AI
> Kalasalingam Hackathon Project

**ExplainGrade AI** transforms descriptive answer evaluation: *From Marks to Meaningful Learning*. An AI-assisted descriptive answer evaluation & feedback system with deterministic rubric compliance, transparent gap analysis, and RAG knowledge grounding.

---

## 🚀 Overview

- **Intelligent Evaluation**: Evaluates descriptive answers using Google Gemini API against instructor-defined rubrics.
- **Transparent Gap Analysis**: Provides granular explanations, highlighting where points were earned or lost.
- **RAG Knowledge Grounding**: Answers and scoring are strictly grounded in textbook and syllabus reference materials.
- **Student & Teacher Portals**: Dedicated workflows for educators to configure rubrics/upload submissions and for students to review feedback.

---

## 🛠️ Tech Stack

- **Frontend**: React 19, Vite, Tailwind CSS, Lucide React, Motion
- **Backend**: Node.js / Express, TypeScript (`tsx`)
- **AI / LLM**: Google Gemini API (`@google/genai`)
- **Authentication & Security**: JWT, bcryptjs

---

## 💻 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- A Google Gemini API key

### Installation & Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Kavin86080/Hackathon-2026.git
   cd Hackathon-2026
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment Variables:**
   Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
   Add your Gemini API key and any other configurations:
   ```env
   GEMINI_API_KEY=your_gemini_api_key_here
   ```

4. **Start the Application:**
   ```bash
   npm run dev
   ```
   The application will start with the Express backend and Vite frontend.
