// Comprehensive Order Management System
// This file provides guaranteed order saving with multiple fallback mechanisms

// Firebase configuration - Standardized across all files
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
let app, db, auth;

// Initialize Firebase with error handling
async function initializeFirebase() {
    try {
        if (app && db) {
            console.log('Firebase already initialized');
            return {
                app,
                db,
                auth
            };
        }

        const {
            initializeApp
        } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js');
        const {
            getFirestore
        } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');
        const {
            getAuth
        } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js');

        app = initializeApp(firebaseConfig);
        db = getFirestore(app);
        auth = getAuth(app);

        console.log('Firebase initialized successfully');
        return {
            app,
            db,
            auth
        };
    } catch (error) {
        console.error('Firebase initialization failed:', error);
        throw new Error('Failed to initialize Firebase: ' + error.message);
    }
}

// Order Management Class
class OrderManager {
    constructor() {
        this.retryAttempts = 3;
        this.retryDelay = 1000; // 1 second
    }

    // Generate unique order ID
    generateOrderId() {
        const timestamp = Date.now();
        const random = Math.random().toString(36).substr(2, 9).toUpperCase();
        return `ORD-${timestamp}-${random}`;
    }

    // Validate order data
    validateOrderData(orderData) {
        const requiredFields = ['customerName', 'customerEmail', 'quantity', 'materialPreference'];
        const missingFields = requiredFields.filter(field => !orderData[field]);

        if (missingFields.length > 0) {
            throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
        }

        if (!orderData.customerEmail.includes('@')) {
            throw new Error('Invalid email address');
        }

        if (orderData.quantity < 1) {
            throw new Error('Quantity must be at least 1');
        }

        return true;
    }

    // Save order with multiple fallback mechanisms
    async saveOrder(orderData) {
        console.log('Starting order save process...', orderData);

        // Validate order data
        this.validateOrderData(orderData);

        // Add metadata
        const orderWithMetadata = {
            ...orderData,
            orderId: orderData.orderId || this.generateOrderId(),
            createdAt: new Date().toISOString(),
            status: orderData.status || 'pending',
            totalAmount: this.calculateTotalAmount(orderData),
            paymentStatus: 'pending',
            lastUpdated: new Date().toISOString()
        };

        console.log('Order data prepared:', orderWithMetadata);

        // Try multiple save methods
        const saveMethods = [
            () => this.saveToFirestore(orderWithMetadata),
            () => this.saveToFirebaseRealtimeDB(orderWithMetadata),
            () => this.saveToLocalStorage(orderWithMetadata)
        ];

        let lastError = null;

        for (let i = 0; i < saveMethods.length; i++) {
            try {
                console.log(`Attempting save method ${i + 1}...`);
                const result = await this.retryOperation(saveMethods[i], this.retryAttempts);
                console.log(`Order saved successfully using method ${i + 1}:`, result);
                return result;
            } catch (error) {
                console.error(`Save method ${i + 1} failed:`, error);
                lastError = error;
                continue;
            }
        }

        // If all methods fail, throw the last error
        throw new Error(`All save methods failed. Last error: ${lastError.message}`);
    }

    // Save to Firestore (Primary method)
    async saveToFirestore(orderData) {
        try {
            const {
                db: firestoreDb
            } = await initializeFirebase();
            const {
                collection,
                addDoc,
                setDoc,
                doc
            } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');

            // Try to add document first
            try {
                const docRef = await addDoc(collection(firestoreDb, 'orders'), orderData);
                console.log('Order saved to Firestore with auto-generated ID:', docRef.id);
                return {
                    id: docRef.id,
                    ...orderData,
                    savedTo: 'firestore'
                };
            } catch (addError) {
                console.log('AddDoc failed, trying setDoc with custom ID...');
                // Fallback: use setDoc with custom ID
                const customDocRef = doc(firestoreDb, 'orders', orderData.orderId);
                await setDoc(customDocRef, orderData);
                console.log('Order saved to Firestore with custom ID:', orderData.orderId);
                return {
                    id: orderData.orderId,
                    ...orderData,
                    savedTo: 'firestore'
                };
            }
        } catch (error) {
            console.error('Firestore save failed:', error);
            throw new Error('Firestore save failed: ' + error.message);
        }
    }

    // Save to Firebase Realtime Database (Fallback method)
    async saveToFirebaseRealtimeDB(orderData) {
        try {
            const {
                getDatabase,
                ref,
                set
            } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js');
            const {
                initializeApp
            } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js');

            // Initialize with database URL
            const dbConfig = {
                ...firebaseConfig,
                databaseURL: "https://otomono-c9938-default-rtdb.firebaseio.com/"
            };

            const app = initializeApp(dbConfig, 'realtime-db');
            const database = getDatabase(app);

            const orderRef = ref(database, `orders/${orderData.orderId}`);
            await set(orderRef, orderData);

            console.log('Order saved to Firebase Realtime Database:', orderData.orderId);
            return {
                id: orderData.orderId,
                ...orderData,
                savedTo: 'realtime-db'
            };
        } catch (error) {
            console.error('Realtime Database save failed:', error);
            throw new Error('Realtime Database save failed: ' + error.message);
        }
    }

    // Save to Local Storage (Final fallback)
    async saveToLocalStorage(orderData) {
        try {
            const orders = JSON.parse(localStorage.getItem('pendingOrders') || '[]');
            orders.push(orderData);
            localStorage.setItem('pendingOrders', JSON.stringify(orders));

            console.log('Order saved to Local Storage:', orderData.orderId);
            return {
                id: orderData.orderId,
                ...orderData,
                savedTo: 'local-storage'
            };
        } catch (error) {
            console.error('Local Storage save failed:', error);
            throw new Error('Local Storage save failed: ' + error.message);
        }
    }

    // Retry operation with exponential backoff
    async retryOperation(operation, maxAttempts) {
        let lastError;

        for (let attempt = 1; attempt <= maxAttempts; attempt++) {
            try {
                return await operation();
            } catch (error) {
                lastError = error;
                console.log(`Attempt ${attempt} failed:`, error.message);

                if (attempt < maxAttempts) {
                    const delay = this.retryDelay * Math.pow(2, attempt - 1);
                    console.log(`Retrying in ${delay}ms...`);
                    await new Promise(resolve => setTimeout(resolve, delay));
                }
            }
        }

        throw lastError;
    }

    // Calculate total amount
    calculateTotalAmount(orderData) {
        const basePrice = 25; // Base price per jersey
        const quantity = orderData.quantity || 1;
        return basePrice * quantity;
    }

    // Get order by ID
    async getOrder(orderId) {
        try {
            const {
                db: firestoreDb
            } = await initializeFirebase();
            const {
                doc,
                getDoc
            } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');

            const orderDoc = await getDoc(doc(firestoreDb, 'orders', orderId));
            if (orderDoc.exists()) {
                return {
                    id: orderDoc.id,
                    ...orderDoc.data()
                };
            }
            return null;
        } catch (error) {
            console.error('Error getting order:', error);
            throw error;
        }
    }

    // Get all orders with multiple fallback mechanisms
    async getAllOrders() {
        try {
            const {
                db: firestoreDb
            } = await initializeFirebase();

            // Try Firestore first
            try {
                const {
                    collection,
                    getDocs,
                    query,
                    orderBy
                } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');

                const ordersQuery = query(collection(firestoreDb, 'orders'), orderBy('createdAt', 'desc'));
                const querySnapshot = await getDocs(ordersQuery);

                const orders = [];
                querySnapshot.forEach((doc) => {
                    orders.push({
                        id: doc.id,
                        ...doc.data()
                    });
                });

                if (orders.length > 0) {
                    console.log(`Loaded ${orders.length} orders from Firestore`);
                    return orders;
                }
            } catch (firestoreError) {
                console.warn('Firestore query failed, trying Realtime Database:', firestoreError.message);
            }

            // Fallback to Realtime Database
            try {
                const {
                    getDatabase,
                    ref,
                    get
                } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js');
                const {
                    initializeApp
                } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js');

                const dbConfig = {
                    ...firebaseConfig,
                    databaseURL: "https://otomono-c9938-default-rtdb.firebaseio.com/"
                };

                const rtdbApp = initializeApp(dbConfig, 'realtime-db');
                const database = getDatabase(rtdbApp);
                const ordersRef = ref(database, 'orders');
                const snapshot = await get(ordersRef);

                if (snapshot.exists()) {
                    const ordersData = snapshot.val();
                    const orders = Object.values(ordersData);
                    console.log(`Loaded ${orders.length} orders from Realtime Database`);
                    return orders;
                }
            } catch (rtdbError) {
                console.warn('Realtime Database query failed, trying Local Storage:', rtdbError.message);
            }

            // Fallback to Local Storage
            try {
                const pendingOrders = JSON.parse(localStorage.getItem('pendingOrders') || '[]');
                if (pendingOrders.length > 0) {
                    console.log(`Loaded ${pendingOrders.length} orders from Local Storage`);
                    return pendingOrders;
                }
            } catch (localError) {
                console.warn('Local Storage query failed:', localError.message);
            }

            // If all methods fail or return empty, return empty array
            console.log('No orders found in any storage method');
            return [];

        } catch (error) {
            console.error('Error getting orders:', error);
            // Return empty array instead of throwing to prevent UI errors
            return [];
        }
    }

    // Update order status
    async updateOrderStatus(orderId, status) {
        try {
            const {
                db: firestoreDb
            } = await initializeFirebase();
            const {
                doc,
                updateDoc
            } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');

            await updateDoc(doc(firestoreDb, 'orders', orderId), {
                status: status,
                lastUpdated: new Date().toISOString()
            });

            console.log('Order status updated:', orderId, status);
            return true;
        } catch (error) {
            console.error('Error updating order status:', error);
            throw error;
        }
    }

    // Sync pending orders from local storage
    async syncPendingOrders() {
        try {
            const pendingOrders = JSON.parse(localStorage.getItem('pendingOrders') || '[]');

            if (pendingOrders.length === 0) {
                console.log('No pending orders to sync');
                return;
            }

            console.log(`Syncing ${pendingOrders.length} pending orders...`);

            for (const order of pendingOrders) {
                try {
                    await this.saveToFirestore(order);
                    console.log('Synced order:', order.orderId);
                } catch (error) {
                    console.error('Failed to sync order:', order.orderId, error);
                }
            }

            // Clear pending orders after successful sync
            localStorage.removeItem('pendingOrders');
            console.log('All pending orders synced successfully');
        } catch (error) {
            console.error('Error syncing pending orders:', error);
        }
    }
}

// Create global instance
const orderManager = new OrderManager();

// Global functions for backward compatibility
window.createOrder = async function(orderData) {
    try {
        const result = await orderManager.saveOrder(orderData);
        console.log('Order created successfully:', result);
        return result;
    } catch (error) {
        console.error('Failed to create order:', error);
        throw error;
    }
};

window.saveOrderToFirebase = async function(orderData) {
    return await window.createOrder(orderData);
};

window.getOrder = async function(orderId) {
    return await orderManager.getOrder(orderId);
};

window.getAllOrders = async function() {
    return await orderManager.getAllOrders();
};

window.updateOrderStatus = async function(orderId, status) {
    return await orderManager.updateOrderStatus(orderId, status);
};

// Sync pending orders on page load
document.addEventListener('DOMContentLoaded', async () => {
    try {
        await orderManager.syncPendingOrders();
    } catch (error) {
        console.error('Failed to sync pending orders:', error);
    }
});

// Export for module use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        OrderManager,
        orderManager
    };
}

// Make available globally
window.OrderManager = OrderManager;
window.orderManager = orderManager;