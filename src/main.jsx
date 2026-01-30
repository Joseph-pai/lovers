import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { AuthProvider } from './context/AuthContext'
import { SoundProvider } from './context/SoundContext'


createRoot(document.getElementById('root')).render(
    <StrictMode>
        <AuthProvider>
            <SoundProvider>
                <App />
            </SoundProvider>
        </AuthProvider>
    </StrictMode>,
)

// Register Service Worker for PWA
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/service-worker.js')
            .then((registration) => {
                console.log('SW registered: ', registration);
            })
            .catch((registrationError) => {
                console.log('SW registration failed: ', registrationError);
            });
    });
}
