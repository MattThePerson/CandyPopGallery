// import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom';

// import './index.css'
import App from './App.tsx'

/* ROOT */
createRoot(document.getElementById('root')!).render(
    // <StrictMode>
    <BrowserRouter>
        <Routes>
            <Route path="/home" element={<App />} />
            <Route path="/settings" element={<h2>Settings page!</h2>} />
        </Routes>
    </BrowserRouter>
    // <App />
    // </StrictMode>
)
