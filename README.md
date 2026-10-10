# RouteShield — AI Logistics Disruption Prediction & Rerouting

RouteShield is an AI-powered logistics decision-support system designed to help identify shipment disruption risks, analyze routes, and support safer, more resilient transportation planning.

## Features

- **Disruption Prediction:** Uses an XGBoost model to estimate shipment disruption risk.
- **Route Analysis:** Analyzes origin and destination locations to support route planning.
- **Alternative Route Comparison:** Compares route options to help identify potential alternatives.
- **Driver Safety Monitor:** Provides a driver safety interface with location monitoring and demo GPS functionality.
- **Offline Routes:** Supports offline route-related functionality.
- **Knowledge Base Evidence:** Retrieves relevant passages from a demo knowledge base about weather risks, supply-chain resilience, and geopolitical risks.
- **Multi-Agent Suite:** Integrates logistics-related agent and route-optimization components.

## Technology Stack

**Frontend**
- React
- Vite
- Tailwind CSS

**Backend**
- Python
- Flask
- Flask-CORS

**Machine Learning**
- XGBoost
- Joblib

**Deployment**
- Frontend: Vercel
- Backend: Render

## Live Application

- **Frontend:** https://route-shield-eight.vercel.app
- **Backend Health Check:** https://routeshield-ker2.onrender.com/api/health

## Project Structure

```text
RouteShield/
├── backend/
│   ├── controllers/
│   ├── routes/
│   ├── services/
│   └── config/
├── frontend/
│   ├── public/
│   ├── src/
│   └── package.json
├── model/
├── tests/
└── README.md
```

## Run Locally

### 1. Clone the repository

```bash
git clone https://github.com/cloudvaishnavi/RouteShield.git
cd RouteShield
```

### 2. Start the backend

Install the Python dependencies:

```bash
pip install -r backend/requirements.txt
```

Start the backend using the project's configured Python entry point.

### 3. Start the frontend

```bash
cd frontend
npm install
npm run dev
```

Open the local URL printed by Vite in your terminal.

## Knowledge Base Note

The current knowledge base uses static demo evidence. Its retrieved passages are not live news or real-time disruption reports. AI-generated explanations require a configured LLM provider.

## Disclaimer

RouteShield is a decision-support and demonstration project. Route predictions and safety information should be independently verified before making real-world logistics or driver-safety decisions.

## Author

Developed as an AI-powered logistics disruption prediction and route optimization project.