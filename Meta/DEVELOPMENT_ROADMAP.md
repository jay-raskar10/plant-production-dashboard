# Plant Production Dashboard - Development Roadmap
**Technical Development Plan - Internal Use Only**

> [!IMPORTANT]
> **Living Document**: This roadmap is updated in real-time as development progresses and requirements change. All stage modifications, feature additions, and architectural decisions are tracked here.

---

## 📊 Project Overview

**Project Name**: Plant Production Dashboard (Nexus Production Intelligence)  
**Purpose**: Real-time manufacturing line monitoring with SPC analytics  
**Tech Stack**: React (Frontend) + Node.js/Express (Backend) + SQL Server (Database)  
**Current Stage**: Stage 1.5 (LAN-Hardened Deployment)  
**Last Updated**: 2026-02-10

---

## 🎯 Stage Progression Summary

| Stage | Name | Status | Deployment Target | Completion |
|-------|------|--------|-------------------|------------|
| **Stage 0** | Prototype & Design | ✅ Complete | Local Dev | 100% |
| **Stage 1** | React Visualizer (Mock Data) | ✅ Complete | Local Dev | 100% |
| **Stage 1.5** | LAN-Hardened + LabVIEW API | 🟡 In Progress | Client LAN | 90% |
| **Stage 2** | Full LabVIEW Integration | ⏳ Planned | Production LAN | 0% |
| **Stage 3** | Independent SPC Engine | 🔮 Future | Production Cloud | 0% |

---

## 📁 Current Project Structure

```
PlantProductionDashboard/
├── src/                          # React Frontend
│   ├── components/
│   │   ├── dashboard/           # ProductionDashboard, SPCDashboard
│   │   ├── filters/             # FilterPanel, DateRangePicker
│   │   ├── cards/               # StationCard, KPICard
│   │   └── charts/              # SPCChart, TrendChart
│   ├── services/                # apiService.js (API client)
│   ├── hooks/                   # useApi.js, usePolling.js
│   ├── context/                 # FilterContext.jsx
│   └── config/                  # constants.js
│
├── server/                       # Node.js Backend
│   ├── config/                  # ✅ Configuration & Utilities
│   │   └── logger.js            # ✅ Winston logging setup
│   ├── middleware/
│   │   ├── auth.js              # ✅ API key authentication
│   │   ├── cors.js              # ✅ LAN IP restrictions
│   │   ├── validation.js        # ✅ Input sanitization
│   │   └── errorHandler.js      # Error handling
│   ├── routes/
│   │   └── api.routes.js        # API endpoints
│   ├── services/
│   │   └── mockDataGenerator.js # Mock data (Stage 1)
│   ├── utils/
│   │   └── cache.js             # ⏳ Response caching (pending)
│   ├── server.js                # Express server
│   ├── generate-api-key.js      # ✅ API key generator
│   ├── test-auth.js             # ✅ Auth test suite
│   ├── test-cors.js             # ✅ CORS test suite
│   ├── test-logging.js          # ✅ Logging test suite
│   └── test-validation.js       # ✅ Validation test suite
│
└── Meta/                         # Documentation (not in git)
    ├── DEVELOPMENT_ROADMAP.md   # This file
    ├── STAGE1_README.md
    ├── STAGE1.5_*.md            # Stage 1.5 implementation docs
    ├── Database_Dashboard_Analysis.md
    └── ProductResearchDoc.txt
```

---

## 🚀 Stage 0: Prototype & Design

### **Status**: ✅ Complete (Jan 2026)

### **Objectives**
- Define product requirements and UI/UX design
- Analyze database schema and data structure
- Create mockups and component hierarchy
- Establish project structure and tooling

### **Deliverables**
- ✅ Product Research Document (`ProductResearchDoc.txt`)
- ✅ Design Document (`DesignDoc.txt`)
- ✅ Database Analysis (`Database_Dashboard_Analysis.md`)
- ✅ UI/Data Mapping (`detailed_ui_data_map.md`)
- ✅ React project scaffolding (Vite + React)
- ✅ Component library setup (shadcn/ui)

### **Architecture**
```
Static UI Prototype
├── React Components (no data)
├── Mock layouts
└── Design system established
```

### **Key Decisions**
- **Frontend**: React + Vite (fast dev server)
- **UI Library**: shadcn/ui (customizable components)
- **Styling**: Tailwind CSS
- **State Management**: React Context API
- **Charts**: Recharts library

### **Git Branch**: `main` (initial commits)

---

## 🎨 Stage 1: React Visualizer with Mock Data

### **Status**: ✅ Complete (Feb 2026)

### **Objectives**
- Build fully functional React dashboard consuming API data
- Implement backend API server with mock data generation
- Establish API contract and data structures
- Implement core features: filtering, polling, data visualization

### **Deliverables**
- ✅ Production Dashboard with station cards and KPI ribbons
- ✅ SPC Dashboard with control charts and analytics
- ✅ Filter system (Plant, Line, Station, Shift, Date Range)
- ✅ Real-time polling mechanism (10-second intervals)
- ✅ Express.js backend with mock data API
- ✅ API endpoints: `/api/meta`, `/api/line_status`, `/api/station_status`
- ✅ Mock data generator matching LabVIEW structure

### **Architecture**
```
┌─────────────────┐
│  React Frontend │
│  - Dashboards   │
│  - Filters      │
│  - Charts       │
└────────┬────────┘
         │ HTTP (localhost:5000)
         ▼
┌─────────────────────────┐
│  Node.js Backend        │
│  - Express API          │
│  - Mock Data Generator  │
│  - No Authentication    │
│  - Permissive CORS      │
└─────────────────────────┘
```

### **API Endpoints**
- `GET /health` - Health check
- `GET /api/meta` - Metadata (plants, lines, stations, shifts)
- `GET /api/line_status` - Line KPI + Station statuses + SPC summary
- `GET /api/station_status` - Detailed station analytics

### **Key Features**
- ✅ Auto-refresh every 10 seconds
- ✅ Filter persistence in context
- ✅ Loading states and error handling
- ✅ Responsive design
- ✅ SPC control charts (UCL, LCL, mean)

### **Known Limitations**
- ❌ No authentication
- ❌ No input validation
- ❌ Permissive CORS (`*`)
- ❌ No logging
- ❌ Not production-ready

### **Git Branch**: `stage-1/react-visualizer-api`

### **Documentation**: `Meta/STAGE1_README.md`

---

## 🔐 Stage 1.5: LAN-Hardened Deployment

### **Status**: 🟡 In Progress (85% complete)

### **Objectives**
- Secure Stage 1 for client LAN deployment
- Integrate with LabVIEW Web Services API
- Implement minimal security hardening for internal use
- Prepare for pilot deployment to client site

### **Deliverables**

#### ✅ **Completed**
- ✅ Environment variable configuration (`.env`, `.env.example`)
- ✅ API key authentication middleware (`middleware/auth.js`)
- ✅ CORS restrictions for LAN IPs (`middleware/cors.js`)
- ✅ Input validation and sanitization (`middleware/validation.js`)
- ✅ API key generation utility (`generate-api-key.js`)
- ✅ Authentication test suite (`test-auth.js`)
- ✅ CORS test suite (`test-cors.js`)
- ✅ Validation test suite (`test-validation.js`)
- ✅ Frontend API key integration (`services/apiService.js`)
- ✅ Winston logger implementation (`config/logger.js`)
- ✅ Logging test suite (`test-logging.js`)
- ✅ Documentation for each security feature

#### ⏳ **In Progress**
- ⏳ LabVIEW service integration (`services/labviewService.js`)
- ⏳ Response caching layer (`utils/cache.js`)
- ⏳ LabVIEW API proxy in routes
- ⏳ End-to-end testing with LabVIEW data

#### 📋 **Pending**
- 📋 Deployment documentation (`DEPLOYMENT.md`)
- 📋 Client handoff guide
- 📋 Production build testing
- 📋 LabVIEW API error handling
- 📋 Fallback to cached data when LabVIEW is down

### **Architecture**
```
┌─────────────────┐
│  React Frontend │
│  + API Key      │
└────────┬────────┘
         │ HTTP + X-API-Key header
         ▼
┌─────────────────────────┐
│  Node.js Backend        │
│  ✅ Authentication      │
│  ✅ CORS (LAN IPs)      │
│  ✅ Input Validation    │
│  ⏳ Logging             │
│  ⏳ Caching             │
└────────┬────────────────┘
         │ HTTP (LabVIEW API)
         ▼
┌─────────────────────────┐
│  LabVIEW Web Services   │
│  - SPC Calculations     │
│  - Data Processing      │
│  - Data Cleaning        │
└─────────────────────────┘
```

### **Security Features**

#### **1. Authentication** ✅
- API key-based authentication
- `X-API-Key` header required for all `/api/*` endpoints
- Multiple API keys supported (comma-separated in `.env`)
- Health check endpoint exempt from auth

**Environment Variables**:
```bash
API_KEY=<primary-key>
ALLOWED_API_KEYS=<key1>,<key2>,<key3>
```

#### **2. CORS Restrictions** ✅
- Whitelist-based origin validation
- Support for multiple allowed origins
- IP range restrictions (e.g., `192.168.1.0/24`)
- Wildcard pattern matching (e.g., `http://192.168.1.*`)

**Environment Variables**:
```bash
CORS_ORIGIN=http://192.168.1.50,http://192.168.1.51
ALLOWED_IP_RANGES=192.168.1,10.0.0
CORS_DEV_MODE=false  # Set to true for development
```

#### **3. Input Validation** ✅
- Query parameter validation using `express-validator`
- SQL injection prevention
- XSS attack prevention
- Type checking and sanitization

**Validated Parameters**:
- `plant`: alphanumeric, max 50 chars
- `line`: alphanumeric, max 50 chars
- `station`: alphanumeric, max 50 chars
- `shift`: enum (A, B, C, General)
- `dateRange`: enum (today, week, month, custom)

#### **4. Request Logging** ✅
- Winston logger for all API requests
- Log format: `[timestamp] [IP] [method] [path] [status]` (standard format)
- Automated error-only logging for request duration/size
- Daily log rotation
- Separate error logs (`logs/error.log`) and Combined logs (`logs/combined.log`)

### **LabVIEW Integration Plan**

#### **LabVIEW API Configuration**
```bash
# .env
LABVIEW_API_URL=http://192.168.1.100:8080
LABVIEW_API_KEY=<labview-api-key>  # If LabVIEW requires auth
LABVIEW_TIMEOUT=10000  # 10 seconds
```

#### **Data Flow**
1. Frontend sends request to Node.js backend with API key
2. Backend validates authentication and input
3. Backend proxies request to LabVIEW API
4. LabVIEW processes data and returns response
5. Backend transforms data to frontend format
6. Backend caches response (optional)
7. Backend returns data to frontend

#### **Error Handling**
- **LabVIEW Down**: Return cached data with `status: 'degraded'`
- **LabVIEW Timeout**: Retry with exponential backoff (3 attempts)
- **LabVIEW Error**: Log error, return user-friendly message
- **Data Transformation Error**: Log error, return raw LabVIEW data

### **Testing Strategy**

#### **Security Tests** ✅
```bash
# Generate API key
node server/generate-api-key.js

# Test authentication
node server/test-auth.js

# Test CORS
node server/test-cors.js

# Test validation
node server/test-validation.js
```

#### **LabVIEW Integration Tests** ⏳
- [ ] Test connection to LabVIEW API
- [ ] Test data transformation
- [ ] Test error handling (LabVIEW down)
- [ ] Test caching mechanism
- [ ] Test retry logic

### **Deployment Checklist**

#### **Pre-Deployment**
- [ ] Generate production API keys
- [ ] Configure LAN IP addresses in `.env`
- [ ] Test all endpoints with authentication
- [ ] Test CORS from client machines
- [ ] Verify LabVIEW API connectivity
- [ ] Build production frontend (`npm run build`)
- [ ] Test production build locally

#### **Deployment**
- [ ] Copy project to client server
- [ ] Install Node.js dependencies (`npm install`)
- [ ] Configure `.env` with client-specific values
- [ ] Start backend server (`npm run dev` or `pm2 start`)
- [ ] Serve frontend (nginx or `serve dist/`)
- [ ] Verify health check endpoint
- [ ] Test end-to-end with client machines

#### **Post-Deployment**
- [ ] Monitor logs for errors
- [ ] Verify data accuracy with LabVIEW team
- [ ] Collect user feedback
- [ ] Document any issues or bugs
- [ ] Plan Stage 2 upgrade timeline

### **Known Limitations**
- ⚠️ **Pilot/Beta Quality**: Not production-grade
- ⚠️ **LAN Only**: Not suitable for internet deployment
- ⚠️ **Basic Auth**: API key only, no user management
- ⚠️ **No Rate Limiting**: Vulnerable to abuse
- ⚠️ **No HTTPS**: Unencrypted communication
- ⚠️ **No Database**: All data from LabVIEW API

### **Git Branch**: `stage-1/react-visualizer-api` (continuing from Stage 1)

### **Documentation**
- `Meta/STAGE1.5_ENVIRONMENT_SETUP_EXPLAINED.md`
- `Meta/STAGE1.5_AUTHENTICATION_EXPLAINED.md`
- `Meta/STAGE1.5_CORS_EXPLAINED.md`
- `Meta/STAGE1.5_VALIDATION_EXPLAINED.md`

### **Upgrade Path to Stage 2**
- Add rate limiting middleware
- Implement HTTPS/TLS
- Add user authentication (JWT)
- Add role-based access control (RBAC)
- Implement comprehensive logging and monitoring
- Add health checks for LabVIEW dependency
- Implement circuit breaker pattern
- Add API versioning

---

## 🏭 Stage 2: Full LabVIEW Integration (Production)

### **Status**: ⏳ Planned (0% complete)

### **Objectives**
- Production-ready deployment with enterprise-grade security
- Full LabVIEW Web Services integration
- Advanced features: caching, monitoring, alerting
- Multi-user support with authentication

### **Planned Deliverables**
- [ ] User authentication system (JWT-based)
- [ ] Role-based access control (Admin, Operator, Viewer)
- [ ] Rate limiting and DDoS protection
- [ ] HTTPS/TLS encryption
- [ ] Advanced logging and monitoring (ELK stack or similar)
- [ ] Health check dashboard for LabVIEW services
- [ ] Circuit breaker pattern for resilience
- [ ] API versioning (`/api/v1/`, `/api/v2/`)
- [ ] WebSocket support for real-time updates
- [ ] Export functionality (PDF, Excel reports)
- [ ] Alert system (email/SMS for critical events)
- [ ] Admin panel for configuration

### **Architecture**
```
┌─────────────────┐
│  React Frontend │
│  + JWT Auth     │
│  + WebSockets   │
└────────┬────────┘
         │ HTTPS + JWT
         ▼
┌─────────────────────────┐
│  Node.js Backend        │
│  ✅ JWT Authentication  │
│  ✅ RBAC                │
│  ✅ Rate Limiting       │
│  ✅ HTTPS/TLS           │
│  ✅ Advanced Logging    │
│  ✅ Circuit Breaker     │
│  ✅ WebSocket Server    │
└────────┬────────────────┘
         │ HTTP (LabVIEW API)
         ▼
┌─────────────────────────┐
│  LabVIEW Web Services   │
│  - SPC Calculations     │
│  - Data Processing      │
└─────────────────────────┘
```

### **Security Enhancements**
- **Authentication**: JWT tokens with refresh mechanism
- **Authorization**: Role-based permissions (Admin, Operator, Viewer)
- **Rate Limiting**: 100 requests/minute per user
- **HTTPS**: TLS 1.3 encryption
- **Input Validation**: Comprehensive sanitization
- **Audit Logging**: All user actions logged
- **Session Management**: Secure session handling
- **Password Policy**: Strong password requirements

### **Advanced Features**
- **Caching**: Redis for response caching (5-minute TTL)
- **Monitoring**: Prometheus + Grafana for metrics
- **Alerting**: Email/SMS alerts for critical events
- **Health Checks**: LabVIEW service health monitoring
- **Circuit Breaker**: Auto-failover when LabVIEW is down
- **WebSockets**: Real-time data push (no polling)
- **Export**: PDF/Excel report generation
- **Admin Panel**: User management, configuration

### **Database Integration** (Optional)
- **User Database**: Store user accounts, roles, sessions
- **Cache Database**: Redis for caching LabVIEW responses
- **Audit Database**: Log all user actions and API calls

### **Deployment Target**
- **Environment**: Production LAN or Cloud (Azure/AWS)
- **Containerization**: Docker + Docker Compose
- **Orchestration**: Kubernetes (optional for high availability)
- **Load Balancing**: Nginx reverse proxy
- **Process Management**: PM2 or systemd

### **Testing Requirements**
- [ ] Unit tests (Jest) - 80% coverage
- [ ] Integration tests (Supertest)
- [ ] End-to-end tests (Playwright)
- [ ] Load testing (Apache JMeter)
- [ ] Security testing (OWASP ZAP)
- [ ] Penetration testing

### **Git Branch**: `stage-2/labview-integration` (new branch from `main`)

### **Timeline**: 4-6 weeks after Stage 1.5 deployment

---

## 🧠 Stage 3: Independent SPC Engine

### **Status**: 🔮 Future (0% complete)

### **Objectives**
- Complete independence from LabVIEW
- Implement SPC calculations in Node.js
- Direct database access for raw data
- Full control over data processing and analytics

### **Planned Deliverables**
- [ ] SPC calculation engine in Node.js
  - [ ] Control charts (X-bar, R, p, c, u)
  - [ ] Process capability (Cp, Cpk, Pp, Ppk)
  - [ ] Statistical tests (normality, outliers)
  - [ ] Trend analysis and forecasting
- [ ] Direct SQL Server integration
- [ ] Data cleaning and preprocessing pipeline
- [ ] Custom analytics and reporting
- [ ] Machine learning integration (optional)
  - [ ] Anomaly detection
  - [ ] Predictive maintenance
  - [ ] Quality prediction

### **Architecture**
```
┌─────────────────┐
│  React Frontend │
└────────┬────────┘
         │ HTTPS + JWT
         ▼
┌─────────────────────────┐
│  Node.js Backend        │
│  ✅ SPC Engine          │
│  ✅ Data Processing     │
│  ✅ Analytics           │
│  ✅ ML Models (optional)│
└────────┬────────────────┘
         │ SQL Queries
         ▼
┌─────────────────────────┐
│  SQL Server Database    │
│  - Raw production data  │
│  - Historical data      │
└─────────────────────────┘
```

### **SPC Engine Components**
- **Data Acquisition**: SQL queries to fetch raw data
- **Data Cleaning**: Handle missing values, outliers
- **Statistical Calculations**: Mean, std dev, control limits
- **Chart Generation**: UCL, LCL, mean lines
- **Process Capability**: Cp, Cpk calculations
- **Alerting**: Out-of-control conditions
- **Reporting**: PDF/Excel reports with charts

### **Technology Stack**
- **SPC Library**: `simple-statistics` or custom implementation
- **Database**: `mssql` package for SQL Server
- **Data Processing**: `lodash`, `moment` for data manipulation
- **Charting**: Server-side chart generation (optional)
- **ML (Optional)**: TensorFlow.js or Python microservice

### **Advantages**
- ✅ No dependency on LabVIEW
- ✅ Full control over calculations
- ✅ Custom analytics and features
- ✅ Faster iteration and bug fixes
- ✅ Cost savings (no LabVIEW licenses)

### **Challenges**
- ❌ Complex SPC algorithm implementation
- ❌ Validation against LabVIEW results
- ❌ Performance optimization for large datasets
- ❌ Maintaining statistical accuracy

### **Git Branch**: `stage-3/independent-spc` (new branch from `main`)

### **Timeline**: 3-6 months after Stage 2 deployment

---

## 📝 Change Log

### **2026-02-10**
- ✅ Completed authentication middleware (Stage 1.5)
- ✅ Completed CORS restrictions (Stage 1.5)
- ✅ Completed input validation (Stage 1.5)
- ✅ Created test suites for auth, CORS, validation
- ✅ Updated frontend to send API key headers
- 📝 Created this development roadmap document

### **2026-02-09**
- ✅ Started Stage 1.5 security hardening
- ✅ Environment variable setup
- ✅ Created `.env.example` with all required variables
- ✅ Created API key generation utility

### **2026-02-07 - 2026-02-09**
- ✅ Completed Stage 1 (React visualizer with mock data)
- ✅ Fixed polling interval issues
- ✅ Integrated LabVIEW data structure into mock API
- ✅ Created `stage-1/react-visualizer-api` branch
- ✅ Pushed to remote repository

### **2026-01-27**
- ✅ Backend API development
- ✅ Database connection setup
- ✅ Mock data generator implementation

### **2026-01-21 - 2026-01-26**
- ✅ Stage 0 prototype development
- ✅ UI/UX design and component creation
- ✅ Database analysis and schema documentation

---

## 🎯 Current Focus (Stage 1.5)

### **Today's Tasks** (2026-02-10)
- [x] Authentication middleware
- [x] CORS restrictions
- [x] Input validation
- [x] Test suites
- [ ] Winston logger implementation
- [ ] LabVIEW service integration
- [ ] Response caching
- [ ] End-to-end testing

### **This Week**
- [ ] Complete LabVIEW API integration
- [ ] Test with real LabVIEW data
- [ ] Create deployment documentation
- [ ] Prepare for client pilot deployment

### **Next Week**
- [ ] Deploy to client LAN
- [ ] Monitor and collect feedback
- [ ] Fix any bugs or issues
- [ ] Plan Stage 2 timeline

---

## 🚧 Technical Debt & Future Improvements

### **Stage 1.5 Debt**
- ⚠️ No rate limiting (add in Stage 2)
- ⚠️ No HTTPS (add in Stage 2)
- ⚠️ Basic API key auth (upgrade to JWT in Stage 2)
- ⚠️ Console logging only (add Winston in current stage)
- ⚠️ No user management (add in Stage 2)

### **General Improvements**
- 📋 Add comprehensive error messages
- 📋 Improve loading states and UX
- 📋 Add dark mode support
- 📋 Mobile responsive design improvements
- 📋 Accessibility (WCAG 2.1 compliance)
- 📋 Internationalization (i18n)

---

## 📚 Documentation Index

### **Stage 0**
- `Meta/ProductResearchDoc.txt` - Product requirements
- `Meta/DesignDoc.txt` - UI/UX design
- `Meta/Database_Dashboard_Analysis.md` - Database schema analysis
- `Meta/detailed_ui_data_map.md` - UI to data mapping

### **Stage 1**
- `Meta/STAGE1_README.md` - Stage 1 implementation guide
- `Meta/git_diff_summary.md` - Git changes summary
- `Meta/ProjectFlow.md` - Project flow diagram

### **Stage 1.5**
- `Meta/STAGE1.5_ENVIRONMENT_SETUP_EXPLAINED.md`
- `Meta/STAGE1.5_AUTHENTICATION_EXPLAINED.md`
- `Meta/STAGE1.5_CORS_EXPLAINED.md`
- `Meta/STAGE1.5_VALIDATION_EXPLAINED.md`
- `Meta/DEVELOPMENT_ROADMAP.md` - This file

### **General**
- `README.md` - Project overview
- `TROUBLESHOOTING.md` - Common issues and solutions
- `server/README.md` - Backend API documentation

---

## 🔗 Related Resources

### **Internal**
- Git Repository: `d:\DAT\PlantProductionDashboard`
- Current Branch: `stage-1/react-visualizer-api`
- Remote: `origin/stage-1/react-visualizer-api`

### **External**
- React Documentation: https://react.dev
- Express.js: https://expressjs.com
- shadcn/ui: https://ui.shadcn.com
- Recharts: https://recharts.org

---

## 📞 Contacts & Stakeholders

### **Development Team**
- **Developer**: Jay Raskar
- **LabVIEW Team**: (Contact info TBD)
- **Client**: (Contact info TBD)

### **Deployment Schedule**
- **Stage 1.5 Pilot**: Week of 2026-02-10
- **Stage 2 Planning**: 2-3 weeks after pilot
- **Stage 2 Development**: 4-6 weeks
- **Stage 3 Planning**: TBD based on Stage 2 success

---

> [!NOTE]
> **Document Maintenance**: This roadmap should be updated whenever:
> - A stage is completed or status changes
> - New features are added or removed
> - Architecture decisions are made
> - Deployment dates are confirmed
> - Technical debt is identified or resolved

**Last Reviewed**: 2026-02-10 by Jay Raskar
