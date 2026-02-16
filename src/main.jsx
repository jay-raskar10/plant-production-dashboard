import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { FilterProvider } from './context/FilterContext.jsx'
import { DisplayModeProvider } from './context/DisplayModeContext.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <DisplayModeProvider>
      <FilterProvider>
        <App />
      </FilterProvider>
    </DisplayModeProvider>
  </StrictMode>,
)
