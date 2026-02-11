# Plant Production Dashboard - Backend Server

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- Access to local network (for LAN deployment)

### Installation

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Configure environment variables**
   ```bash
   # Copy the example file
   cp .env.example .env
   
   # Edit .env with your settings
   # IMPORTANT: Generate a secure API key (see below)
   ```

3. **Start the server**
   ```bash
   # Development mode (with auto-reload)
   npm run dev
   
   # Production mode
   npm start
   ```

---

## 🔐 Environment Configuration

### Required Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `NODE_ENV` | Environment mode | `development` or `production` |
| `PORT` | Server port | `5000` |
| `API_KEY` | Primary API authentication key | Generated secure key |
| `ALLOWED_API_KEYS` | Comma-separated list of valid API keys | `key1,key2,key3` |
| `CORS_ORIGIN` | Allowed frontend origins | `http://localhost:5173` |

### Generating Secure API Keys

**Method 1: Using Node.js**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

**Method 2: Using OpenSSL**
```bash
openssl rand -hex 32
```

**Method 3: Using PowerShell (Windows)**
```powershell
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Minimum 0 -Maximum 256 }))
```

Copy the generated key and add it to your `.env` file:
```env
API_KEY=your-generated-key-here
ALLOWED_API_KEYS=your-generated-key-here
```

---

## 🌐 CORS Configuration

### Development Setup
```env
CORS_ORIGIN=http://localhost:5173
```

### Production LAN Setup
For multiple frontend instances on the network:
```env
CORS_ORIGIN=http://192.168.1.100:5173,http://192.168.1.101:5173,http://192.168.1.102:5173
```

### IP Range Restrictions (Optional)
Restrict API access to specific IP ranges:
```env
ALLOWED_IP_RANGES=192.168.1.0/24,10.0.0.0/8
```

---

## 🔌 LabVIEW Integration

### Mock Data Mode (Default)
```env
USE_MOCK_DATA=true
```
Server will generate random mock data for development/testing.

### Real LabVIEW API Mode
```env
USE_MOCK_DATA=false
LABVIEW_API_URL=http://192.168.1.50:8080
LABVIEW_API_KEY=your-labview-api-key
LABVIEW_API_TIMEOUT=5000
```

**Note:** LabVIEW API integration is prepared but not yet active. Keep `USE_MOCK_DATA=true` until LabVIEW endpoints are ready.

---

## 📊 API Endpoints

### Health Check
```bash
GET /health
```
Returns server status and timestamp.

### Metadata
```bash
GET /api/meta
```
Returns plants, lines, stations, and shifts for filter dropdowns.

### Line Status
```bash
GET /api/line_status?plant=pune&line=fcpv&shift=all&dateRange=today
```
Returns line KPIs, station data, and SPC summary.

### Station Details
```bash
GET /api/station_status?id=op10
```
Returns detailed analytics for a specific station.

---

## 🔒 Security Features

### API Key Authentication
All `/api/*` endpoints require authentication via `X-API-Key` header:

```bash
curl -H "X-API-Key: your-api-key-here" http://localhost:5000/api/meta
```

### Rate Limiting
- **Default:** 100 requests per 15 minutes per IP
- Configure via `RATE_LIMIT_WINDOW_MS` and `RATE_LIMIT_MAX_REQUESTS`

### Request Logging
All API requests are logged with:
- Timestamp
- IP address
- Endpoint
- Response status
- Response time

Logs are stored in `./logs/app.log` (auto-rotated daily).

---

## 🧪 Testing

### Test Health Endpoint
```bash
curl http://localhost:5000/health
```

### Test API with Authentication
```bash
curl -H "X-API-Key: your-api-key-here" http://localhost:5000/api/meta
```

### Test CORS
Open browser console on `http://localhost:5173` and run:
```javascript
fetch('http://localhost:5000/api/meta', {
  headers: { 'X-API-Key': 'your-api-key-here' }
})
.then(r => r.json())
.then(console.log);
```

---

## 📁 Project Structure

```
server/
├── .env                    # Environment configuration (DO NOT COMMIT)
├── .env.example            # Environment template
├── server.js               # Express server entry point
├── package.json            # Dependencies
├── middleware/
│   ├── auth.js            # API key authentication
│   ├── errorHandler.js    # Error handling
│   └── validator.js       # Input validation
├── routes/
│   └── api.routes.js      # API endpoint definitions
├── services/
│   ├── labviewService.js  # LabVIEW API integration
│   └── calculationService.js
├── utils/
│   ├── logger.js          # Winston logger configuration
│   ├── mockDataGenerator.js
│   └── constants.js
└── logs/                  # Log files (auto-generated)
```

---

## 🚨 Troubleshooting

### Server won't start
- Check if port 5000 is already in use
- Verify `.env` file exists and is properly formatted
- Run `npm install` to ensure dependencies are installed

### CORS errors
- Verify `CORS_ORIGIN` in `.env` matches your frontend URL
- Check browser console for specific CORS error messages
- Ensure frontend is sending requests to correct backend URL

### Authentication failures
- Verify API key is correctly set in `.env`
- Check that frontend is sending `X-API-Key` header
- Ensure API key doesn't have extra spaces or newlines

### LabVIEW connection issues
- Verify `LABVIEW_API_URL` is correct
- Check network connectivity to LabVIEW machine
- Ensure LabVIEW API is running and accessible
- Check firewall settings

---

## 📝 Deployment Checklist

Before deploying to client LAN:

- [ ] Generate secure API key
- [ ] Update `CORS_ORIGIN` with production frontend URLs
- [ ] Set `NODE_ENV=production`
- [ ] Configure `ALLOWED_IP_RANGES` if needed
- [ ] Test all endpoints with authentication
- [ ] Verify logging is working
- [ ] Document API key for client
- [ ] Create backup of `.env` file (store securely)

---

## 🔄 Stage 1.5 vs Stage 2

**Stage 1.5 (Current):**
- ✅ Mock data generation
- ✅ API authentication
- ✅ CORS restrictions
- ✅ Request logging
- ✅ Rate limiting
- ⚠️ LabVIEW integration prepared (not active)

**Stage 2 (Future):**
- Real LabVIEW API integration
- WebSocket for real-time updates
- Database persistence
- Advanced caching strategies
- Production-grade monitoring

---

## 📞 Support

For issues or questions:
1. Check this README
2. Review `TROUBLESHOOTING.md` in project root
3. Check server logs in `./logs/app.log`
4. Review `.env.example` for configuration reference
