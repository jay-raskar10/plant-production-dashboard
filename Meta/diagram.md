# Repository Dependency Diagram

This diagram visualizes the structure and dependencies of your React application.

```mermaid
graph TD
    %% Styling
    classDef page fill:#e1f5fe,stroke:#01579b,stroke-width:2px;
    classDef component fill:#fff9c4,stroke:#fbc02d,stroke-width:2px;
    classDef layout fill:#f3e5f5,stroke:#7b1fa2,stroke-width:2px;
    classDef ui fill:#e0f2f1,stroke:#00695c,stroke-width:2px;
    classDef core fill:#ffebee,stroke:#c62828,stroke-width:2px;
    classDef lib fill:#f5f5f5,stroke:#616161,stroke-width:2px;

    %% Nodes
    subgraph Core
        Main[main.jsx]:::core
        App[App.jsx]:::core
        FilterCtx[FilterContext.jsx]:::core
    end

    subgraph Pages
        Dash[Dashboard.jsx]:::page
        Station[StationAnalytics.jsx]:::page
    end

    subgraph Layout
        LayoutComp[Layout.jsx]:::layout
        Navbar[Navbar.jsx]:::layout
        Sidebar[Sidebar.jsx]:::layout
    end

    subgraph Dashboard_Components
        ProdDash[ProductionDashboard.jsx]:::component
        SPCDash[SPCDashboard.jsx]:::component
    end

    subgraph Charts
        CtrlChart[ControlChart.jsx]:::component
    end

    subgraph UI_Components
        Button[button.jsx]:::ui
        Card[card.jsx]:::ui
        Select[select.jsx]:::ui
    end

    subgraph Lib
        Data[data.js]:::lib
        Utils[utils.js]:::lib
    end

    %% Edges
    Main --> App
    Main --> FilterCtx

    App --> LayoutComp
    App --> Dash
    App --> Station

    LayoutComp --> Navbar
    LayoutComp --> Sidebar

    Navbar --> Select
    Navbar --> Button
    Navbar --> FilterCtx
    Navbar --> Data

    Sidebar --> Button
    Sidebar --> Utils

    Dash --> FilterCtx
    Dash --> ProdDash
    Dash --> SPCDash

    Station --> Button
    Station --> Card
    Station --> FilterCtx
    Station --> Data
    Station --> CtrlChart

    ProdDash --> Card
    ProdDash --> Utils
    ProdDash --> Data
    ProdDash --> FilterCtx

    SPCDash --> Card
    SPCDash --> Data
    SPCDash --> FilterCtx
    SPCDash --> CtrlChart

    CtrlChart --> Card

    Button --> Utils
    Card --> Utils
    Select --> Utils

```

## Legend
- **Core Files (Red)**: Entry points and Context providers.
- **Pages (Blue)**: Top-level route components.
- **Layout (Purple)**: Structural components like Layout, Navbar, Sidebar.
- **Components (Yellow)**: Functional widgets (Charts, Dashboards).
- **UI Components (Green)**: Reusable atomic elements (Button, Card).
- **Lib/Utils (Grey)**: Data constants and helper functions.
