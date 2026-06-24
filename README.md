# CausalFunnel Analytics Platform

> **Production-quality User Analytics Application** — Track visitor behavior, analyze session journeys, and visualize click heatmaps in real time.

![CausalFunnel Banner](https://img.shields.io/badge/CausalFunnel-Analytics-6366f1?style=for-the-badge&logo=data:image/svg+xml;base64,PHN2ZyB4bWxucz0naHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnIHZpZXdCb3g9JzAgMCAyNCAyNCc+PHBhdGggZmlsbD0nd2hpdGUnIGQ9J00xMyAxMHYySDl2LTJoNHptMCA0djJIOXYtMmg0em0tNi00djJIMnYtMmg1em0wIDR2Mkgydi0yaDV6Jy8+PC9zdmc+)
[![Node.js](https://img.shields.io/badge/Node.js-18-339933?style=flat-square&logo=node.js)](https://nodejs.org)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react)](https://reactjs.org)
[![MongoDB](https://img.shields.io/badge/MongoDB-6.0-47A248?style=flat-square&logo=mongodb)](https://mongodb.com)
[![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?style=flat-square&logo=docker)](https://docker.com)

---

## 📋 Table of Contents

1. [Project Overview](#-project-overview)
2. [Architecture Diagram](#-architecture-diagram)
3. [Tech Stack](#-tech-stack)
4. [Folder Structure](#-folder-structure)
5. [Setup Instructions](#-setup-instructions)
6. [Docker Setup](#-docker-setup)
7. [Environment Variables](#-environment-variables)
8. [API Documentation](#-api-documentation)
9. [Screenshots](#-screenshots)
10. [Future Improvements](#-future-improvements)
11. [Assumptions](#-assumptions)
12. [Tradeoffs](#-tradeoffs)

---

## 🎯 Project Overview

**CausalFunnel Analytics** is a full-stack analytics platform that lets businesses track user behavior on their websites. It captures:

- **Page views** — when users visit a page
- **Click events** — where on the page users click (with X/Y coordinates)
- **Sessions** — unique visitor journeys from start to finish
- **Heatmaps** — density visualizations of click patterns

The system consists of three core services:

| Service  | Technology       | Purpose                              |
|----------|-----------------|--------------------------------------|
| Tracker  | Vanilla JS      | Embeddable script that captures events |
| Backend  | Node.js/Express | REST API that stores events          |
| Frontend | React 19 + Vite | Dashboard to visualize analytics     |
| Database | MongoDB         | Persistent event storage             |

---

## 🏗 Architecture Diagram

```
Website Visitor
      │
      ▼
┌─────────────┐
│  tracker.js │  ← Embeddable script (<script src="...">)
│             │    - Generates session UUID (localStorage)
│             │    - Tracks page_view on load
│             │    - Tracks clicks with X/Y coords
└──────┬──────┘
       │ POST /api/events
       ▼
┌─────────────────────┐
│   Express Backend   │  ← Node.js + Mongoose
│   (port 5000/5500)  │    - Validates & stores events
│                     │    - Aggregates session data
│                     │    - Serves tracker.js + demo.html
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│     MongoDB 6.0     │  ← Event collection with indexes
│    (port 27017)     │    - Compound indexes for performance
└─────────────────────┘
           │
           ▼
┌─────────────────────┐
│  React Dashboard    │  ← Vite + TailwindCSS + Lucide
│   (port 3000)       │    - Overview / Sessions / Heatmaps
└─────────────────────┘
```

**In Docker (production):**
```
Internet → Nginx (port 3000) → React SPA
                             ↘ /api/* → backend:5000 → MongoDB
```

---

## 🛠 Tech Stack

### Frontend
| Technology    | Version | Purpose                     |
|--------------|---------|------------------------------|
| React        | 19.x    | UI Component library         |
| Vite         | 5.x     | Build tool & dev server      |
| React Router | 6.x     | Client-side routing          |
| Axios        | 1.x     | HTTP client with interceptors|
| TailwindCSS  | 3.x     | Utility-first CSS framework  |
| Lucide React | Latest  | Icon library                 |

### Backend
| Technology  | Version | Purpose                  |
|------------|---------|--------------------------|
| Node.js    | 18.x    | JavaScript runtime       |
| Express.js | 4.x     | HTTP server framework    |
| Mongoose   | 8.x     | MongoDB ODM              |
| Morgan     | 1.x     | HTTP request logging     |
| dotenv     | 16.x    | Environment variable mgmt|
| cors       | 2.x     | Cross-origin resource sharing |

### DevOps
| Technology     | Purpose                    |
|---------------|----------------------------|
| Docker         | Service containerization   |
| Docker Compose | Multi-service orchestration|
| Nginx          | Static file serving + proxy|
| MongoDB 6.0    | Database                   |

---

## 📁 Folder Structure

```
user-analytics/
├── docker-compose.yml          # Multi-service orchestration
│
├── tracker/
│   ├── tracker.js              # Embeddable tracking script
│   └── demo.html               # Demo website with tracker embedded
│
├── backend/
│   ├── Dockerfile
│   ├── .env                    # Local environment variables
│   ├── .env.example            # Template for environment variables
│   ├── package.json
│   └── src/
│       ├── config/
│       │   └── db.js           # MongoDB connection
│       ├── models/
│       │   └── Event.js        # Mongoose schema + indexes
│       ├── controllers/
│       │   └── analyticsController.js  # Business logic
│       ├── routes/
│       │   └── analyticsRoutes.js      # Express route definitions
│       └── server.js           # App entry point + middleware
│
├── frontend/
│   ├── Dockerfile
│   ├── nginx.conf              # Production Nginx config
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── index.html
│   └── src/
│       ├── api/
│       │   └── index.js        # Axios instance + API methods
│       ├── components/
│       │   ├── Navbar.jsx      # Collapsible sidebar navigation
│       │   ├── AnalyticsCards.jsx  # Animated stat cards
│       │   ├── SessionTable.jsx    # Sortable sessions table
│       │   ├── EventTimeline.jsx   # Chronological event feed
│       │   └── HeatmapCanvas.jsx   # Density-based click heatmap
│       ├── pages/
│       │   ├── Dashboard.jsx   # Overview + integration guide
│       │   ├── SessionsPage.jsx       # Session list
│       │   ├── SessionDetailsPage.jsx # Session journey
│       │   └── HeatmapPage.jsx        # Heatmap visualization
│       ├── App.jsx
│       ├── main.jsx
│       └── index.css           # Global styles + animations
│
└── README.md
```

---

## 🚀 Setup Instructions

### Prerequisites

- **Node.js** 18+ and **npm**
- **MongoDB** (local or Docker)
- **Docker** + **Docker Compose** (for containerized setup)

---

### Option A: Local Development

#### 1. Start MongoDB

```bash
# Using Docker for MongoDB only
docker run -d -p 27017:27017 --name mongo mongo:6.0

# Or use a local MongoDB installation
mongod --dbpath ./data/db
```

#### 2. Start the Backend

```bash
cd backend
npm install
npm run dev      # Runs with nodemon on port 5000
```

#### 3. Start the Frontend

```bash
cd frontend
npm install --legacy-peer-deps
npm run dev      # Vite dev server on port 3000
```

#### 4. Open in Browser

| URL                              | Service              |
|----------------------------------|----------------------|
| http://localhost:3000            | React Dashboard      |
| http://localhost:5000/demo.html  | Tracker Demo Site    |
| http://localhost:5000/health     | Backend Health Check |
| http://localhost:5000/api/sessions | API Example        |

---

### Option B: Docker (Recommended)

See the Docker section below.

---

## 🐳 Docker Setup

### Prerequisites
- Docker Desktop installed and running
- Ports 3000, 5500, and 27017 must be free

### One-Command Start

```bash
# From the project root
docker compose up --build
```

This will:
1. Pull MongoDB 6.0
2. Build and start the Express backend (port 5500)
3. Build the React app and serve via Nginx (port 3000)

### Access Points (Docker)

| URL                               | Service                         |
|-----------------------------------|---------------------------------|
| http://localhost:3000             | React Dashboard (Nginx)         |
| http://localhost:5500/demo.html   | Tracker Demo Website            |
| http://localhost:5500/tracker.js  | Tracker Script                  |
| http://localhost:5500/health      | Backend Health Check            |
| http://localhost:27017            | MongoDB (direct access)         |

### Stop Services

```bash
docker compose down

# Remove volumes too (clears MongoDB data)
docker compose down -v
```

### View Logs

```bash
# All services
docker compose logs -f

# Individual services
docker compose logs -f backend
docker compose logs -f frontend
docker compose logs -f mongodb
```

---

## 🔐 Environment Variables

### Backend (`backend/.env`)

| Variable      | Default                                     | Description                  |
|--------------|---------------------------------------------|------------------------------|
| `PORT`        | `5000`                                      | Backend server port          |
| `MONGODB_URI` | `mongodb://localhost:27017/causalfunnel`    | MongoDB connection string    |
| `NODE_ENV`    | `development`                               | Runtime environment          |

### Frontend (optional)

| Variable       | Default | Description                      |
|---------------|---------|----------------------------------|
| `VITE_API_URL` | `/api`  | Override API base URL            |

---

## 📖 API Documentation

All endpoints return JSON with this envelope:
```json
{
  "success": true,
  "data": { ... },
  "count": 0,
  "message": "..."
}
```

---

### `POST /api/events`
Track a user event.

**Request Body:**
```json
{
  "sessionId": "uuid-v4",
  "eventType": "page_view | click",
  "pageUrl": "/products",
  "timestamp": "2025-01-01T10:00:00.000Z",
  "x": 340,
  "y": 220
}
```

**Response:** `201 Created`
```json
{
  "success": true,
  "message": "Event tracked successfully",
  "data": { "_id": "...", "sessionId": "...", ... }
}
```

---

### `GET /api/sessions`
List all sessions with event counts.

**Response:** `200 OK`
```json
{
  "success": true,
  "count": 5,
  "data": [
    {
      "sessionId": "abc-123",
      "totalEvents": 14,
      "lastActivity": "2025-01-01T12:00:00.000Z"
    }
  ]
}
```

---

### `GET /api/sessions/:sessionId`
Get all events for a session in chronological order.

**Response:** `200 OK`
```json
{
  "success": true,
  "count": 14,
  "data": [
    { "eventType": "page_view", "pageUrl": "/", "timestamp": "..." },
    { "eventType": "click", "x": 120, "y": 340, "timestamp": "..." }
  ]
}
```

---

### `GET /api/heatmap?url=/products`
Get click coordinates for a specific URL.

**Response:** `200 OK`
```json
{
  "success": true,
  "count": 42,
  "data": [
    { "x": 120, "y": 450 },
    { "x": 330, "y": 220 }
  ]
}
```

---

### `GET /api/pages`
Get all distinct tracked page URLs.

**Response:** `200 OK`
```json
{
  "success": true,
  "count": 4,
  "data": ["/", "/?page=products", "/?page=pricing", "/?page=about"]
}
```

---

### `GET /api/analytics/summary`
High-level dashboard metrics.

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "totalSessions": 12,
    "totalEvents": 156,
    "totalClicks": 98,
    "totalPageViews": 58
  }
}
```

---

### `GET /health`
Backend health check (used by Docker Compose).

**Response:** `200 OK`
```json
{
  "status": "ok",
  "service": "CausalFunnel Backend",
  "timestamp": "2025-01-01T12:00:00.000Z"
}
```

---

## 📸 Screenshots

> After running the application, add screenshots here showing:
> - Overview Dashboard with analytics cards
> - Sessions table with session list
> - Session Journey timeline
> - Click Heatmap with density visualization

---

## 🔮 Future Improvements

| Feature                      | Priority | Description                                             |
|-----------------------------|----------|---------------------------------------------------------|
| **User Authentication**     | High     | Login/register for multi-tenant analytics               |
| **Real-time WebSocket**     | High     | Live event streaming without polling                    |
| **Scroll Depth Tracking**   | Medium   | Track how far users scroll on each page                 |
| **Funnel Analysis**         | High     | Visualize conversion funnels step by step               |
| **Session Recording**       | Medium   | Replay user sessions as videos                          |
| **A/B Testing Support**     | Medium   | Track variant performance across experiments            |
| **CSV/PDF Export**          | Low      | Export analytics data for reporting                     |
| **Email Alerts**            | Medium   | Notify on traffic spikes or anomalies                   |
| **Retention Analytics**     | High     | Daily/weekly user return metrics                        |
| **Custom Event Types**      | Medium   | Beyond page_view and click                              |
| **Geo-location**            | Low      | Map visitors by country/city using IP                   |
| **Redis Caching**           | Medium   | Cache analytics aggregations for faster response        |
| **Rate Limiting**           | High     | Protect `/api/events` from spam                         |
| **Data Retention Policy**   | Medium   | Auto-purge events older than N days                     |
| **Mobile App SDK**          | Low      | Extend tracking to iOS/Android apps                     |

---

## 💡 Assumptions

1. **Single database**: All events are stored in one MongoDB collection. Multi-tenant isolation is not implemented.
2. **localStorage**: Sessions are tied to `localStorage`, meaning they're per-browser and cleared if the user clears site data.
3. **Absolute coordinates**: Click X/Y positions are absolute page coordinates (accounting for scroll), not viewport-relative.
4. **Demo URL simulation**: The demo site uses query parameters (`?page=products`) to simulate page navigation without a real router.
5. **No auth**: The dashboard is publicly accessible — no login required.
6. **English locale**: Date/time formatting uses the browser's default locale.

---

## ⚖️ Tradeoffs

| Decision                           | Chosen Approach                                  | Alternative Considered                    |
|-----------------------------------|--------------------------------------------------|-------------------------------------------|
| **Frontend framework**            | React 19 + Vite (fast DX)                        | Next.js (more complex for this use case)  |
| **CSS framework**                 | TailwindCSS (as per spec)                        | Vanilla CSS (more control but slower)     |
| **API design**                    | REST (simple, widely understood)                 | GraphQL (more flexible but overkill here) |
| **Heatmap rendering**             | DOM-based dots (simple, fast for < 10k points)   | Canvas API (better for 100k+ points)      |
| **Session persistence**           | localStorage (easy, no server state)             | Cookies or server sessions (complex)      |
| **Aggregation**                   | MongoDB `$facet` pipeline (powerful)             | Application-level aggregation (slower)    |
| **Tracker delivery**              | Backend serves `tracker.js` (simple setup)       | CDN (better for production scale)         |
| **State management**              | React `useState`/`useEffect` (simple enough)     | Zustand or Redux (overkill for this scope)|
| **Docker health checks**          | `wget` (built into alpine)                       | `curl` (requires extra install in alpine) |

---

## 👨‍💻 Engineering Notes

- **SOLID Principles**: Single Responsibility (each controller method handles one concern), Open/Closed (new event types can be added to the schema's `enum` without changing controller logic).
- **MVC Architecture**: Clear separation between Models (`Event.js`), Controllers (`analyticsController.js`), and Views (React pages/components).
- **Error Handling**: All async functions wrapped in try/catch. Tracker fails silently to never crash host pages. Frontend shows graceful error/empty states.
- **Performance**: MongoDB compound indexes on `{sessionId, timestamp}` and `{pageUrl, eventType}` optimize the most frequent queries.
- **Reusability**: `AnalyticsCards`, `SessionTable`, `EventTimeline`, and `HeatmapCanvas` are all standalone, reusable components.

---

*Built with ❤️ by CausalFunnel Engineering Team*
