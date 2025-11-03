/**
 * Firebase Authentication Wrapper
 * Provides a unified interface for authentication
 */

class FirebaseAuthWrapper {
    constructor() {
        this.auth = null;
        this.isInitialized = false;
        this.currentUser = null;
        this.authStateListeners = [];
    }

    async initialize() {
        if (this.isInitialized) {
            return true;
        }

        try {
            // Wait for Firebase to be available
            await this.waitForFirebase();

            if (window.firebase && window.firebase.auth) {
                this.auth = window.firebase.auth;
                this.isInitialized = true;

                // Set up auth state listener
                this.auth.onAuthStateChanged((user) => {
                    this.currentUser = user;
                    this.authStateListeners.forEach(callback => callback(user));
                });

                console.log('FirebaseAuth wrapper initialized successfully');
                return true;
            } else {
                console.error('Firebase not available');
                return false;
            }
        } catch (error) {
            console.error('Failed to initialize FirebaseAuth wrapper:', error);
            return false;
        }
    }

    async waitForFirebase() {
        let attempts = 0;
        const maxAttempts = 50; // 5 seconds max wait

        while (attempts < maxAttempts) {
            if (window.firebase && window.firebase.auth) {
                return true;
            }
            await new Promise(resolve => setTimeout(resolve, 100));
            attempts++;
        }

        throw new Error('Firebase not available after waiting');
    }

    async getCurrentUser() {
        if (!this.isInitialized) {
            await this.initialize();
        }

        if (this.auth) {
            return this.auth.currentUser;
        }
        return null;
    }

    async restoreAuthState() {
        if (!this.isInitialized) {
            await this.initialize();
        }

        if (this.auth) {
            return this.auth.currentUser;
        }
        return null;
    }

    onAuthStateChanged(callback) {
        this.authStateListeners.push(callback);

        // If already initialized and have a current user, call immediately
        if (this.isInitialized && this.currentUser) {
            callback(this.currentUser);
        }
    }

    async signOut() {
        if (!this.isInitialized) {
            await this.initialize();
        }

        if (this.auth && window.firebase && window.firebase.signOut) {
            await window.firebase.signOut();
            this.currentUser = null;
            return true;
        }
        return false;
    }

    async signInWithGoogle() {
        if (!this.isInitialized) {
            await this.initialize();
        }

        if (window.firebase && window.firebase.signInWithPopup && window.firebase.googleProvider) {
            try {
                const result = await window.firebase.signInWithPopup(this.auth, window.firebase.googleProvider);
                return result.user;
            } catch (error) {
                console.error('Google sign-in failed:', error);
                throw error;
            }
        }
        throw new Error('Google sign-in not available');
    }

    async signInWithEmailAndPassword(email, password) {
        if (!this.isInitialized) {
            await this.initialize();
        }

        if (window.firebase && window.firebase.signInWithEmailAndPassword) {
            try {
                const result = await window.firebase.signInWithEmailAndPassword(this.auth, email, password);
                return result.user;
            } catch (error) {
                console.error('Email sign-in failed:', error);
                throw error;
            }
        }
        throw new Error('Email sign-in not available');
    }

    async createUserWithEmailAndPassword(email, password) {
        if (!this.isInitialized) {
            await this.initialize();
        }

        if (window.firebase && window.firebase.createUserWithEmailAndPassword) {
            try {
                const result = await window.firebase.createUserWithEmailAndPassword(this.auth, email, password);
                return result.user;
            } catch (error) {
                console.error('User creation failed:', error);
                throw error;
            }
        }
        throw new Error('User creation not available');
    }
}

// Create global instance
window.FirebaseAuth = new FirebaseAuthWrapper();

// Auto-initialize when DOM is ready
document.addEventListener('DOMContentLoaded', async () => {
    try {
        await window.FirebaseAuth.initialize();
        console.log('FirebaseAuth auto-initialized');
    } catch (error) {
        console.error('FirebaseAuth auto-initialization failed:', error);
    }
});

console.log('FirebaseAuth wrapper loaded');