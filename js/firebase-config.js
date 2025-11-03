/**
 * Firebase Configuration Loader
 * This file loads the appropriate Firebase configuration based on environment
 */

// Auto-load Firebase configuration based on environment
document.addEventListener('DOMContentLoaded', async function() {
    console.log('Firebase Config: Starting initialization...');

    try {
        // Check if we're in production (Vercel) or development
        const isProduction = window.location.hostname.includes('vercel.app') ||
            window.location.hostname !== 'localhost';

        console.log('Firebase Config: Environment detected:', isProduction ? 'Production' : 'Development');

        if (isProduction) {
            // Load environment-based configuration for production
            console.log('Firebase Config: Loading environment configuration...');
            if (typeof initializeFirebaseWithEnv === 'function') {
                await initializeFirebaseWithEnv();
            } else {
                console.warn('Firebase Config: Environment configuration not available, falling back to simple config');
                if (typeof initializeFirebaseSimple === 'function') {
                    await initializeFirebaseSimple();
                }
            }
        } else {
            // Load simple configuration for development
            console.log('Firebase Config: Loading simple configuration...');
            if (typeof initializeFirebaseSimple === 'function') {
                await initializeFirebaseSimple();
            } else if (typeof initializeFirebaseRobust === 'function') {
                await initializeFirebaseRobust();
            }
        }

        // Initialize FirebaseAuth wrapper after Firebase is ready
        if (window.FirebaseAuth) {
            console.log('Firebase Config: Initializing FirebaseAuth wrapper...');
            await window.FirebaseAuth.initialize();
        }

        console.log('Firebase Config: Initialization complete');

    } catch (error) {
        console.error('Firebase Config: Initialization failed:', error);

        // Try fallback configurations
        try {
            console.log('Firebase Config: Trying fallback configuration...');
            if (typeof initializeFirebaseSimple === 'function') {
                await initializeFirebaseSimple();
            }
        } catch (fallbackError) {
            console.error('Firebase Config: All configurations failed:', fallbackError);
        }
    }
});

console.log('Firebase Config: Script loaded');