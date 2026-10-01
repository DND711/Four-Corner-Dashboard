# Four Corner — Real Estate Intelligence Dashboard

A real-time administrative and intelligence dashboard for Four Corner. Tracks registered buyer intent, property inventories, transparent cost breakdowns, and market validation metrics across Hyderabad micro-markets.

## Core Features

- **Buyer Pipeline & Readiness Tracking**:
  - Monitors registered buyers with multi-factor intent scoring.
  - Classifies buyer readiness: High Intent, Active Evaluator, Active Searcher, and Casual Browser.
  - Profiles shortlisted properties, direct booking inquiries, and site visit schedules.

- **Property Inventory & Cost Analysis**:
  - Live inventory search filtered by micro-market, budget ceiling, BHK, and layout attributes.
  - Itemized cost inspection showing base rate, floor rise, corner charges, parking, amenities, infrastructure, and statutory 5% GST.

- **Property Registration (Manual Entry)**:
  - Form interface to register verified projects and units into the database.
  - Real-time financial calculations (out-the-door pricing, carpet efficiency percentage, statutory taxes).
  - Submits directly to the backend database service via `POST /api/v1/properties/add`.

- **Downloadable Data Sheets**:
  - Clean CSV exports for Buyer Pipeline, Property Inventory, Individual Buyer Profiles, and Market Awareness Reports.

- **Market Validation Analytics**:
  - High-level tracking of usable carpet area verification, peak commute measurements, total cost scrutiny, and TS-RERA compliance.
  - Micro-market demand distribution across Tellapur, Kokapet, Financial District, and Puppalguda.

## Technology Stack

- **Frontend**: Vanilla HTML5, JavaScript (ES6+), Tailwind CSS (CDN).
- **Backend API**: Four Corner MCP service (`https://four-corner-mcp.onrender.com` or local `http://127.0.0.1:8000`).
- **Database**: PostgreSQL (Supabase) with SQLite fallback.

## Running Locally

Serve the directory with any standard static file server:

```bash
# Using Python
python3 -m http.server 3000

# Using Node.js
npx serve .
```

Open `http://localhost:3000` in your browser.

## Deployment

This dashboard can be hosted as a static site on GitHub Pages, Cloudflare Pages, Vercel, or Netlify.
