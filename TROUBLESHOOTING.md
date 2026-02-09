# 🔧 Troubleshooting Guide: API Integration Issues

## Issue Detected
- **Production Page**: Stuck on "Loading..."
- **SPC Page**: Shows static data only

## Root Cause
The frontend was missing the `.env` file to configure the API base URL.

## ✅ Fix Applied
Created `.env` file with proper configuration:
```
VITE_API_BASE_URL=http://localhost:5000
VITE_POLLING_INTERVAL=3000
VITE_API_TIMEOUT=10000
```

## 📋 Verification Steps

### 1. **Check if Servers are Running**

**Backend Server** (should be on port 5000):
- Open browser: http://localhost:5000
- You should see API endpoints documentation

**Frontend Server** (should be on port 5173):
- Should restart automatically after .env file creation
- If not, manually restart with `npm run dev`

### 2. **Open Browser Developer Tools**

Press `F12` in your browser and check:

**Console Tab:**
- Look for any red error messages
- Common errors to check:
  - CORS errors (Cross-Origin Resource Sharing)
  - Network errors (Failed to fetch)
  - 404 errors (endpoint not found)

**Network Tab:**
- Filter by "Fetch/XHR"
- Look for requests to `localhost:5000/api/`
- Check if they return **200 OK** (green) or errors (red)
- Click on each request to see:
  - **Request URL**: Should be `http://localhost:5000/api/meta` or `/api/line_status`
  - **Status**: Should be `200`
  - **Response**: Should show JSON data

### 3. **Test API Endpoints Directly**

Open these URLs in your browser:

1. **Metadata**: http://localhost:5000/api/meta
   - Should show plants, lines, stations, shifts

2. **Line Status**: http://localhost:5000/api/line_status?plant=pune&line=fcpv
   - Should show KPIs, charts, stations data

3. **Health Check**: http://localhost:5000/health
   - Should show `{"status":"ok"}`

### 4. **Check Production Dashboard**

Once frontend restarts:
1. Open http://localhost:5173
2. **FilterBar** (top): Dropdowns should populate with data from API
3. **KPI Cards**: Should show numbers (not 0)
4. **Chart**: Should display velocity graph
5. **Stations**: Should show station cards with status

### 5. **Check SPC Dashboard**

1. Click "📈 SPC Dashboard" in filter bar
2. Should show control charts and metrics
3. If still showing static data, SPC integration is next task

## 🐛 Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| **Still showing "Loading..."** | 1. Check browser console for errors<br>2. Verify API base URL in network tab<br>3. Hard refresh browser (Ctrl+Shift+R) |
| **CORS Error in console** | Backend CORS is configured for `localhost:5173`<br>Ensure frontend is on exactly this port |
| **404 Not Found** | Restart backend server<br>Verify routes are loaded |
| **Empty data (0 values)** | API is connected but returning empty objects<br>Check backend mock data generator |
| **Filters not populating** | FilterContext not loading metadata<br>Check `/api/meta` endpoint |

## 🔍 What to Look For

### In Browser Console (F12 → Console):
```
✅ Good: No errors, or only warnings
❌ Bad: Red errors about "Failed to fetch" or "CORS"
```

### In Network Tab (F12 → Network → Fetch/XHR):
```
✅ Good: Requests to /api/* with Status 200
❌ Bad: Red status codes (404, 500) or no requests at all
```

### On Production Dashboard:
```
✅ Good: Live data updating every 3 seconds (numbers change slightly)
❌ Bad: All zeros, or stuck on same values
```

## 🎯 Next Steps After Verification

Once Production Dashboard shows live data:
1. ✅ Mark "Production Dashboard integration" as complete
2. 🔄 Move to SPC Dashboard integration
3. 🔄 Then Station Analytics integration

## 📞 If Still Having Issues

Check these in order:
1. Browser console for specific error message
2. Network tab to see which API call is failing
3. Backend terminal to see if requests are being received
4. Verify both servers are running on correct ports
