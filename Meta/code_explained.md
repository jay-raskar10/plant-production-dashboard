# 🎓 Codebase Explained: "Bit-by-Bit"

This document breaks down your existing React Dashboard code into plain English. Use this to study **how** the application works so you can defend it technically.

---

## 1. The "Data Source" (`src/lib/data.js`)
Currently, your app is "static". It doesn't fetch data; it just reads a file.
*   **Concept:** "Mock Data".
*   **Why?** Allows UI development without a backend.
*   **Key Variable:** `KPI_DATA`
    *   It's just a Javascript Object (JSON) that holds numbers like `1250`, `85.5`.
    *   **The Switch:** When we allow the POC, we will delete this file and replace it with a `fetch()` call that gets this *exact same structure* from the LabVIEW API.

---

## 2. Production Dashboard (`ProductionDashboard.jsx`)
This is the main screen with the ribbon and the big chart.

### **A. Imports (Lines 1-8)**
```javascript
import { Card... } from '@/components/ui/card'; // UI building blocks (the white boxes)
import { Activity... } from 'lucide-react';     // The icons
import { AreaChart... } from 'recharts';        // The graphing library
```
*   **Explanation:** We stick together pre-made lego blocks (`Card`, `Icon`, `Chart`) to build the page. We don't write "draw a rectangle" code; we just import `<Card />`.

### **B. Helper Components (Lines 21-39)**
**`const KPICard = ({ title, value... }) => ...`**
*   **Concept:** "Props" (Properties).
*   **Analogy:** Imagine a generic ID badge template. `KPICard` is the template. `title` and `value` are the name and photo you stamp onto it.
*   **How it works:**
    *   It takes `title` ("Total Output") and `value` ("1250").
    *   It puts them inside a `<Card>` div.
    *   It checks `if (trend)` exists, and if so, shows the green arrow.

### **C. The Main Component (`export default function ProductionDashboard()`)**
This is the "Brain" of the page.

**1. The "Hooks" (Lines 165)**
```javascript
const { filters } = useFilters();
```
*   **Concept:** Context.
*   **Translation:** "Go check the global 'State' of the app to see which Plant/Line is selected."
*   If the user clicked "Chennai" in the sidebar, `filters.plant` becomes "Chennai" here automatically.

**2. The Rendering (The HTML part)**
It returns a `div` with a grid layout (`grid-cols-4`).

**The Magic "Map" Function (Line 249)**
```javascript
{displayStations.map((station) => (
    <StationCard key={station.id} station={station} />
))}
```
*   **Translation:** "Take the list of 10 stations. For *each* station, stamp out one `<StationCard />`."
*   **Why is this important?** You don't have to copy-paste code 10 times. If the API sends 50 stations, this code automatically draws 50 cards.
*   **`key={station.id}`**: React needs a unique ID for every item to track updates efficiently.

---

## 3. SPC Dashboard (`SPCDashboard.jsx`)
This file handles the quality charts. It works exactly like `ProductionDashboard` but uses different charts.

**The "State" (Line 31)**
```javascript
const [selectedParameter, setSelectedParameter] = useState('opening-pressure');
```
*   **Concept:** `useState`.
*   **Translation:** "This page has a memory."
*   It remembers that the user chose "Opening Pressure" in the dropdown.
*   **`setSelectedParameter`**: This is the "remote control" to change that memory. When the dropdown changes, we call this function, and React *re-runs* the page to show the new data.

---

## 4. The Upcoming POC Code (How it will differ)

When we build the POC, we will change **one** major thing:

**Current (Static):**
```javascript
// At the top of the file
import { KPI_DATA } from '@/lib/data'; // Loads instantly
```

**New (Dynamic/Async):**
```javascript
// Inside the component
const [data, setData] = useState(null); // Start with nothing

useEffect(() => {
    // Every 3 seconds...
    const interval = setInterval(async () => {
         const response = await fetch('http://labview-api...'); // Ask LabVIEW
         const json = await response.json(); // Read the letter
         setData(json); // Update the screen
    }, 3000);
}, []); // Do this once when page loads
```

*   **Key Takeaway:** The "UI Drawing" code (HTML/JSX) **does not change**. We only change *where the numbers come from* (replacing the import variable with the `data` state variable).

---

## 🛡️ Summary for the Meeting
*   **You:** "I built this using React Functional Components and Reusable UI primitives."
*   **You:** "The data flow is currently mocked via a constant file, but I have prepared a `useEffect` hook to poll your API and update the React State."
*   **You:** "The rendering logic uses `.map()` so it handles dynamic arrays (like variable number of stations) automatically."
