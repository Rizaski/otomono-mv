// Firebase Database Management System
// This file provides comprehensive data management for the Otomono Jerseys application

// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyBNWEchdrKX9A2WdMa3VTnpbKgo0_eWqHE",
    authDomain: "otomono-c9938.firebaseapp.com",
    projectId: "otomono-c9938",
    storageBucket: "otomono-c9938.firebasestorage.app",
    messagingSenderId: "348906539551",
    appId: "1:348906539551:web:e249c40d0ae9e2964a632a",
    measurementId: "G-YVL497L1V3"
};

// Global Firebase instances
let app, auth, db, storage;

// Initialize Firebase
async function initializeFirebase() {
    try {
        if (app && db && storage) {
            console.log('Firebase already initialized');
            return true;
        }

        const {
            initializeApp
        } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js');
        const {
            getFirestore
        } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');
        const {
            getStorage
        } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-storage.js');
        const {
            getAuth
        } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js');

        app = initializeApp(firebaseConfig);
        db = getFirestore(app);
        storage = getStorage(app);
        auth = getAuth(app);

        console.log('Firebase Database initialized successfully');
        return true;
    } catch (error) {
        console.error('Firebase Database initialization failed:', error);
        return false;
    }
}

// Global Database Management Object
window.FirebaseDB = {
    // Initialize database
    async init() {
        return await initializeFirebase();
    },

    // User Management
    async createUserProfile(user) {
        try {
            await this.init();
            const {
                doc,
                setDoc
            } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');

            const userProfile = {
                uid: user.uid,
                email: user.email,
                displayName: user.displayName,
                photoURL: user.photoURL,
                createdAt: new Date().toISOString(),
                lastLogin: new Date().toISOString(),
                totalOrders: 0,
                totalSpent: 0,
                jerseysDesigned: 0,
                preferences: {
                    favoriteColors: [],
                    preferredSizes: [],
                    designStyle: 'modern'
                },
                isActive: true
            };

            await setDoc(doc(db, 'users', user.uid), userProfile);
            console.log('User profile created:', user.uid);
            return userProfile;
        } catch (error) {
            console.error('Error creating user profile:', error);
            throw error;
        }
    },

    async getUserProfile(uid) {
        try {
            await this.init();
            const {
                doc,
                getDoc
            } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');

            const userDoc = await getDoc(doc(db, 'users', uid));
            if (userDoc.exists()) {
                return userDoc.data();
            }
            return null;
        } catch (error) {
            console.error('Error getting user profile:', error);
            throw error;
        }
    },

    async updateUserProfile(uid, updates) {
        try {
            await this.init();
            const {
                doc,
                updateDoc
            } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');

            await updateDoc(doc(db, 'users', uid), {
                ...updates,
                lastUpdated: new Date().toISOString()
            });
            console.log('User profile updated:', uid);
        } catch (error) {
            console.error('Error updating user profile:', error);
            throw error;
        }
    },

    // Order Management
    async createOrder(orderData) {
        try {
            await this.init();
            const {
                collection,
                addDoc
            } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');

            const order = {
                ...orderData,
                orderId: this.generateOrderId(),
                createdAt: new Date().toISOString(),
                status: 'pending',
                totalAmount: orderData.items.reduce((sum, item) => sum + (item.price * item.quantity), 0),
                paymentStatus: 'pending'
            };

            const docRef = await addDoc(collection(db, 'orders'), order);
            console.log('Order created:', docRef.id);

            // Update user's order count
            await this.updateUserProfile(orderData.userId, {
                totalOrders: (await this.getUserProfile(orderData.userId)) ? .totalOrders + 1 || 1
            });

            return {
                id: docRef.id,
                ...order
            };
        } catch (error) {
            console.error('Error creating order:', error);
            throw error;
        }
    },

    async getUserOrders(uid) {
        try {
            await this.init();
            const {
                collection,
                query,
                where,
                getDocs,
                orderBy
            } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');

            const ordersQuery = query(
                collection(db, 'orders'),
                where('userId', '==', uid),
                orderBy('createdAt', 'desc')
            );

            const querySnapshot = await getDocs(ordersQuery);
            const orders = [];
            querySnapshot.forEach((doc) => {
                orders.push({
                    id: doc.id,
                    ...doc.data()
                });
            });

            return orders;
        } catch (error) {
            console.error('Error getting user orders:', error);
            throw error;
        }
    },

    async updateOrderStatus(orderId, status) {
        try {
            await this.init();
            const {
                doc,
                updateDoc
            } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');

            await updateDoc(doc(db, 'orders', orderId), {
                status: status,
                updatedAt: new Date().toISOString()
            });
            console.log('Order status updated:', orderId, status);
        } catch (error) {
            console.error('Error updating order status:', error);
            throw error;
        }
    },

    // Jersey Design Management
    async saveJerseyDesign(designData) {
        try {
            await this.init();
            const {
                collection,
                addDoc
            } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');

            const design = {
                ...designData,
                createdAt: new Date().toISOString(),
                isPublic: designData.isPublic || false,
                likes: 0,
                downloads: 0
            };

            const docRef = await addDoc(collection(db, 'jerseyDesigns'), design);
            console.log('Jersey design saved:', docRef.id);

            // Update user's design count
            await this.updateUserProfile(designData.userId, {
                jerseysDesigned: (await this.getUserProfile(designData.userId)) ? .jerseysDesigned + 1 || 1
            });

            return {
                id: docRef.id,
                ...design
            };
        } catch (error) {
            console.error('Error saving jersey design:', error);
            throw error;
        }
    },

    async getUserDesigns(uid) {
        try {
            await this.init();
            const {
                collection,
                query,
                where,
                getDocs,
                orderBy
            } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');

            const designsQuery = query(
                collection(db, 'jerseyDesigns'),
                where('userId', '==', uid),
                orderBy('createdAt', 'desc')
            );

            const querySnapshot = await getDocs(designsQuery);
            const designs = [];
            querySnapshot.forEach((doc) => {
                designs.push({
                    id: doc.id,
                    ...doc.data()
                });
            });

            return designs;
        } catch (error) {
            console.error('Error getting user designs:', error);
            throw error;
        }
    },

    async getPublicDesigns() {
        try {
            await this.init();
            const {
                collection,
                query,
                where,
                getDocs,
                orderBy,
                limit
            } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');

            const designsQuery = query(
                collection(db, 'jerseyDesigns'),
                where('isPublic', '==', true),
                orderBy('createdAt', 'desc'),
                limit(20)
            );

            const querySnapshot = await getDocs(designsQuery);
            const designs = [];
            querySnapshot.forEach((doc) => {
                designs.push({
                    id: doc.id,
                    ...doc.data()
                });
            });

            return designs;
        } catch (error) {
            console.error('Error getting public designs:', error);
            throw error;
        }
    },

    // Chat System
    async sendChatMessage(messageData) {
        try {
            await this.init();
            const {
                collection,
                addDoc
            } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');

            const message = {
                ...messageData,
                timestamp: new Date().toISOString(),
                isRead: false
            };

            const docRef = await addDoc(collection(db, 'chatMessages'), message);
            console.log('Chat message sent:', docRef.id);
            return {
                id: docRef.id,
                ...message
            };
        } catch (error) {
            console.error('Error sending chat message:', error);
            throw error;
        }
    },

    async getChatMessages(limit = 50) {
        try {
            await this.init();
            const {
                collection,
                query,
                orderBy,
                limit: firestoreLimit,
                getDocs
            } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');

            const messagesQuery = query(
                collection(db, 'chatMessages'),
                orderBy('timestamp', 'desc'),
                firestoreLimit(limit)
            );

            const querySnapshot = await getDocs(messagesQuery);
            const messages = [];
            querySnapshot.forEach((doc) => {
                messages.push({
                    id: doc.id,
                    ...doc.data()
                });
            });

            return messages.reverse(); // Return in chronological order
        } catch (error) {
            console.error('Error getting chat messages:', error);
            throw error;
        }
    },

    // Real-time Chat Listener
    async listenToChatMessages(callback) {
        try {
            await this.init();
            const {
                collection,
                query,
                orderBy,
                onSnapshot
            } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');

            const messagesQuery = query(
                collection(db, 'chatMessages'),
                orderBy('timestamp', 'desc')
            );

            return onSnapshot(messagesQuery, (snapshot) => {
                const messages = [];
                snapshot.forEach((doc) => {
                    messages.push({
                        id: doc.id,
                        ...doc.data()
                    });
                });
                callback(messages.reverse());
            });
        } catch (error) {
            console.error('Error setting up chat listener:', error);
            throw error;
        }
    },

    // Analytics
    async trackUserAction(userId, action, data = {}) {
        try {
            await this.init();
            const {
                collection,
                addDoc
            } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');

            const analyticsData = {
                userId: userId,
                action: action,
                data: data,
                timestamp: new Date().toISOString(),
                userAgent: navigator.userAgent,
                url: window.location.href
            };

            await addDoc(collection(db, 'analytics'), analyticsData);
            console.log('User action tracked:', action);
        } catch (error) {
            console.error('Error tracking user action:', error);
            // Don't throw error for analytics to avoid breaking user experience
        }
    },

    async getSiteAnalytics() {
        try {
            await this.init();
            const {
                collection,
                getDocs
            } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');

            const analyticsSnapshot = await getDocs(collection(db, 'analytics'));
            const analytics = [];
            analyticsSnapshot.forEach((doc) => {
                analytics.push({
                    id: doc.id,
                    ...doc.data()
                });
            });

            return analytics;
        } catch (error) {
            console.error('Error getting site analytics:', error);
            throw error;
        }
    },

    // Utility Functions
    generateOrderId() {
        return 'ORD-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9).toUpperCase();
    },

    // File Upload to Firebase Storage
    async uploadFile(file, path) {
        try {
            await this.init();
            const {
                ref,
                uploadBytes,
                getDownloadURL
            } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-storage.js');

            const storageRef = ref(storage, path);
            const snapshot = await uploadBytes(storageRef, file);
            const downloadURL = await getDownloadURL(snapshot.ref);

            console.log('File uploaded:', downloadURL);
            return downloadURL;
        } catch (error) {
            console.error('Error uploading file:', error);
            throw error;
        }
    },

    // Initialize on page load
    async initializeOnLoad() {
        try {
            await this.init();
            console.log('Firebase Database ready');

            // Set up real-time listeners if user is authenticated
            if (window.FirebaseAuth && window.FirebaseAuth.getCurrentUser()) {
                const user = window.FirebaseAuth.getCurrentUser();
                await this.trackUserAction(user.uid, 'page_visit', {
                    page: window.location.pathname
                });
            }
        } catch (error) {
            console.error('Error initializing Firebase Database:', error);
        }
    }
};

// Initialize Firebase Database when DOM is loaded
document.addEventListener('DOMContentLoaded', async () => {
    try {
        await window.FirebaseDB.initializeOnLoad();
    } catch (error) {
        console.error('Failed to initialize Firebase Database:', error);
    }
});

// Export for global use
window.FirebaseDB = window.FirebaseDB;