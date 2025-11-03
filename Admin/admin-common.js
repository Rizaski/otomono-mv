/**
 * Admin Panel Common Functions
 * Shared JavaScript file for all admin pages
 */

// Firebase configuration
const FIREBASE_CONFIG = {
    apiKey: "AIzaSyBNWEchdrKX9A2WdMa3VTnpbKgo0_eWqHE",
    authDomain: "otomono-c9938.firebaseapp.com",
    projectId: "otomono-c9938",
    storageBucket: "otomono-c9938.firebasestorage.app",
    messagingSenderId: "348906539551",
    appId: "1:348906539551:web:e249c40d0ae9e2964a632a",
    measurementId: "G-YVL497L1V3"
};

// Initialize Firebase
let firebaseInitialized = false;

async function initializeFirebase() {
    // If Firebase is already initialized from head section, use it
    if (window.firebaseDb && window.firebaseAuth && window.firebaseApp) {
        console.log('Firebase already initialized from head section');
        firebaseInitialized = true;

        // Ensure Firestore functions are available
        if (!window.collection || !window.getDocs) {
            try {
                const firestoreModule = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');
                window.collection = firestoreModule.collection;
                window.getDocs = firestoreModule.getDocs;
                window.addDoc = firestoreModule.addDoc;
                window.updateDoc = firestoreModule.updateDoc;
                window.deleteDoc = firestoreModule.deleteDoc;
                window.doc = firestoreModule.doc;
                window.query = firestoreModule.query;
                window.orderBy = firestoreModule.orderBy;
                window.where = firestoreModule.where;
                window.onSnapshot = firestoreModule.onSnapshot;
                window.setDoc = firestoreModule.setDoc;
                console.log('Firestore functions added to window object');
            } catch (error) {
                console.error('Error importing Firestore functions:', error);
            }
        }
        return;
    }

    // If not initialized, initialize it
    if (firebaseInitialized) {
        return;
    }

    try {
        const {
            initializeApp
        } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js');
        const {
            getAuth
        } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js');
        const {
            getFirestore
        } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');

        const app = initializeApp(FIREBASE_CONFIG);
        const auth = getAuth(app);
        const db = getFirestore(app);

        // Make Firebase available globally
        window.firebaseAuth = auth;
        window.firebaseApp = app;
        window.firebaseDb = db;

        // Import Firestore functions
        const firestoreModule = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');
        window.collection = firestoreModule.collection;
        window.getDocs = firestoreModule.getDocs;
        window.addDoc = firestoreModule.addDoc;
        window.updateDoc = firestoreModule.updateDoc;
        window.deleteDoc = firestoreModule.deleteDoc;
        window.doc = firestoreModule.doc;
        window.query = firestoreModule.query;
        window.orderBy = firestoreModule.orderBy;
        window.where = firestoreModule.where;
        window.onSnapshot = firestoreModule.onSnapshot;
        window.setDoc = firestoreModule.setDoc;

        firebaseInitialized = true;
        console.log('Firebase initialized successfully for admin panel');
        console.log('Firebase Db:', window.firebaseDb);
        console.log('Firestore functions available:', {
            collection: typeof window.collection,
            getDocs: typeof window.getDocs,
            onSnapshot: typeof window.onSnapshot
        });
    } catch (error) {
        console.error('Error initializing Firebase:', error);
        throw error;
    }
}

// Helper function to ensure Firebase is ready before data operations
async function ensureFirebaseReady() {
    // Wait for Firebase to be initialized
    let attempts = 0;
    const maxAttempts = 50;

    while (!window.firebaseDb && attempts < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, 100));
        attempts++;
    }

    if (!window.firebaseDb) {
        throw new Error('Firebase not initialized after waiting');
    }

    // Ensure Firestore functions are available
    if (!window.collection || !window.getDocs) {
        try {
            const firestoreModule = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');
            window.collection = window.collection || firestoreModule.collection;
            window.getDocs = window.getDocs || firestoreModule.getDocs;
            window.addDoc = window.addDoc || firestoreModule.addDoc;
            window.updateDoc = window.updateDoc || firestoreModule.updateDoc;
            window.deleteDoc = window.deleteDoc || firestoreModule.deleteDoc;
            window.doc = window.doc || firestoreModule.doc;
            window.query = window.query || firestoreModule.query;
            window.orderBy = window.orderBy || firestoreModule.orderBy;
            window.where = window.where || firestoreModule.where;
            window.onSnapshot = window.onSnapshot || firestoreModule.onSnapshot;
            window.setDoc = window.setDoc || firestoreModule.setDoc;
        } catch (error) {
            console.error('Error ensuring Firestore functions:', error);
        }
    }

    return true;
}

// Admin authentication check
function checkAdminAuth() {
    console.log('Checking admin authentication...');
    const adminUser = localStorage.getItem('adminUser');

    if (!adminUser) {
        console.log('No admin user found - redirecting to login');
        window.location.href = 'login.html';
        return false;
    }

    try {
        const adminData = JSON.parse(adminUser);
        console.log('Admin user found:', adminData);

        // Check if admin session is still valid (24 hours)
        const loginTime = new Date(adminData.loginTime);
        const now = new Date();
        const hoursDiff = (now - loginTime) / (1000 * 60 * 60);

        if (hoursDiff > 24) {
            console.log('Admin session expired - redirecting to login');
            localStorage.removeItem('adminUser');
            window.location.href = 'login.html';
            return false;
        }

        console.log('Admin authentication successful');
        return true;
    } catch (error) {
        console.error('Error parsing admin user data:', error);
        localStorage.removeItem('adminUser');
        window.location.href = 'login.html';
        return false;
    }
}

// Load header and sidebar components
async function loadAdminComponents() {
    // Load header
    const headerResponse = await fetch('admin-components/header.html');
    const headerHTML = await headerResponse.text();
    const headerPlaceholder = document.getElementById('admin-header-placeholder');
    if (headerPlaceholder) {
        headerPlaceholder.innerHTML = headerHTML;
    }

    // Load sidebar
    const sidebarResponse = await fetch('admin-components/sidebar.html');
    const sidebarHTML = await sidebarResponse.text();
    const sidebarPlaceholder = document.getElementById('admin-sidebar-placeholder');
    if (sidebarPlaceholder) {
        sidebarPlaceholder.innerHTML = sidebarHTML;
    }

    // Initialize mobile sidebar after loading
    setupMobileSidebar();
    setupHeaderActions();

    // Update active navigation link after components are loaded
    setTimeout(() => {
        updateActiveNavLink();
    }, 100);
}

// Mobile sidebar functionality
function setupMobileSidebar() {
    const sidebarToggle = document.getElementById('sidebar-toggle');
    const sidebar = document.getElementById('sidebar');
    const sidebarClose = document.getElementById('sidebar-close');
    const mobileOverlay = document.getElementById('mobileOverlay');

    function openSidebar() {
        if (sidebar) sidebar.classList.add('open');
        if (mobileOverlay) mobileOverlay.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    function closeSidebar() {
        if (sidebar) sidebar.classList.remove('open');
        if (mobileOverlay) mobileOverlay.classList.remove('active');
        document.body.style.overflow = '';
    }

    window.toggleSidebar = function() {
        if (sidebar && sidebar.classList.contains('open')) {
            closeSidebar();
        } else {
            openSidebar();
        }
    };

    if (sidebarToggle) {
        sidebarToggle.addEventListener('click', (e) => {
            e.preventDefault();
            openSidebar();
        });
    }

    if (sidebarClose) {
        sidebarClose.addEventListener('click', (e) => {
            e.preventDefault();
            closeSidebar();
        });
    }

    if (mobileOverlay) {
        mobileOverlay.addEventListener('click', closeSidebar);
    }

    // Close sidebar when clicking on navigation links (for mobile)
    if (sidebar) {
        const navLinks = sidebar.querySelectorAll('nav a');
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                if (window.innerWidth < 768) {
                    closeSidebar();
                }
            });
        });
    }

    // Close sidebar on window resize to desktop
    window.addEventListener('resize', () => {
        if (window.innerWidth >= 768) {
            closeSidebar();
        }
    });
}

// Setup header actions (notifications, user profile, refresh)
let headerActionsInitialized = false;
let sessionUpdateInterval = null;

function setupHeaderActions() {
    // Prevent duplicate initialization
    if (headerActionsInitialized) {
        console.log('Header actions already initialized, skipping...');
        return;
    }

    console.log('Setting up header actions...');
    setupNotifications();
    setupUserProfile();
    setupRefresh();
    loadAdminUserInfo();
    updateSessionDuration();

    // Update session duration every minute (only set once)
    if (!sessionUpdateInterval) {
        sessionUpdateInterval = setInterval(updateSessionDuration, 60000);
    }

    headerActionsInitialized = true;
    console.log('Header actions initialized successfully');
}

// Notification functionality
let notificationsInitialized = false;

function setupNotifications() {
    // Prevent duplicate event listeners
    if (notificationsInitialized) {
        return;
    }

    const notificationBtn = document.getElementById('notification-btn');
    const notificationCenter = document.getElementById('notification-center');
    const notificationCount = document.getElementById('notification-count');
    const notificationList = document.getElementById('notification-list');
    const clearAllBtn = document.getElementById('clear-all-notifications');

    if (notificationBtn && notificationCenter) {
        console.log('Setting up notification button:', notificationBtn);
        notificationBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            notificationCenter.classList.toggle('hidden');
            console.log('Notification center toggled');
        });

        // Close notification center when clicking outside
        document.addEventListener('click', (e) => {
            if (!notificationBtn.contains(e.target) && !notificationCenter.contains(e.target)) {
                notificationCenter.classList.add('hidden');
            }
        });
    } else {
        console.warn('Notification elements not found:', {
            notificationBtn,
            notificationCenter
        });
    }

    // Clear all notifications
    if (clearAllBtn) {
        clearAllBtn.addEventListener('click', (e) => {
            e.preventDefault();
            clearAllNotifications();
        });
    }

    notificationsInitialized = true;

    // Check if notifications were cleared
    const notificationsCleared = localStorage.getItem('notificationsCleared');
    const clearedTime = localStorage.getItem('notificationsClearedTime');

    if (notificationsCleared === 'true' && clearedTime) {
        // Check if cleared within last 24 hours
        const timeDiff = Date.now() - parseInt(clearedTime);
        const hoursDiff = timeDiff / (1000 * 60 * 60);

        if (hoursDiff < 24) {
            // Keep notifications cleared
            if (notificationCount) {
                notificationCount.classList.add('opacity-0', 'pointer-events-none');
                notificationCount.classList.remove('opacity-100');
            }
            if (notificationList) {
                notificationList.innerHTML = '<div class="p-4 text-center text-gray-400 font-rog-body">No notifications</div>';
            }
            return; // Don't load notifications
        } else {
            // Clear the stored state after 24 hours
            localStorage.removeItem('notificationsCleared');
            localStorage.removeItem('notificationsClearedTime');
        }
    }

    // Load notifications only if not cleared
    loadNotifications();
}

async function loadNotifications() {
    try {
        const notifications = [{
                id: 1,
                title: 'New Order Received',
                message: 'Order #ORD-001 has been placed',
                time: '2 minutes ago',
                type: 'order'
            },
            {
                id: 2,
                title: 'Customer Registration',
                message: 'New customer registered',
                time: '15 minutes ago',
                type: 'customer'
            },
            {
                id: 3,
                title: 'Low Stock Alert',
                message: 'Waffle material is running low',
                time: '1 hour ago',
                type: 'inventory'
            }
        ];

        renderNotifications(notifications);
        updateNotificationCount(notifications.length);
    } catch (error) {
        console.error('Error loading notifications:', error);
    }
}

function renderNotifications(notifications) {
    const notificationList = document.getElementById('notification-list');
    if (!notificationList) return;

    if (notifications.length === 0) {
        notificationList.innerHTML = '<div class="p-4 text-center text-gray-400 font-rog-body">No notifications</div>';
        return;
    }

    notificationList.innerHTML = notifications.map(notification => `
        <div class="p-4 border-b border-rog-gray/50 hover:bg-rog-gray/20 transition-colors duration-200">
            <div class="flex items-start space-x-3">
                <div class="w-2 h-2 bg-rog-red rounded-full mt-2 flex-shrink-0"></div>
                <div class="flex-1">
                    <h4 class="text-sm font-rog-heading font-semibold text-white">${notification.title}</h4>
                    <p class="text-xs text-gray-400 font-rog-body mt-1">${notification.message}</p>
                    <p class="text-xs text-gray-500 font-rog-body mt-1">${notification.time}</p>
                </div>
            </div>
        </div>
    `).join('');
}

function updateNotificationCount(count) {
    const notificationCount = document.getElementById('notification-count');
    if (notificationCount) {
        if (count > 0) {
            notificationCount.textContent = count;
            notificationCount.classList.remove('opacity-0', 'pointer-events-none');
            notificationCount.classList.add('opacity-100');
        } else {
            notificationCount.classList.add('opacity-0', 'pointer-events-none');
            notificationCount.classList.remove('opacity-100');
        }
    }
}

// Clear all notifications
function clearAllNotifications() {
    const notificationList = document.getElementById('notification-list');
    const notificationCount = document.getElementById('notification-count');

    if (notificationList) {
        notificationList.innerHTML = '<div class="p-4 text-center text-gray-400 font-rog-body">No notifications</div>';
    }

    if (notificationCount) {
        notificationCount.classList.add('opacity-0', 'pointer-events-none');
        notificationCount.classList.remove('opacity-100');
    }

    // Store cleared state in localStorage
    localStorage.setItem('notificationsCleared', 'true');
    localStorage.setItem('notificationsClearedTime', Date.now().toString());

    console.log('All notifications cleared');
}

// User profile dropdown functionality
let profileInitialized = false;

function setupUserProfile() {
    // Prevent duplicate event listeners
    if (profileInitialized) {
        return;
    }

    const userProfileBtn = document.getElementById('user-profile-btn');
    const userDropdown = document.getElementById('user-dropdown');

    if (userProfileBtn && userDropdown) {
        console.log('Setting up user profile button:', userProfileBtn);
        userProfileBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            userDropdown.classList.toggle('hidden');
            console.log('User dropdown toggled');
        });

        // Close dropdown when clicking outside
        document.addEventListener('click', (e) => {
            if (!userProfileBtn.contains(e.target) && !userDropdown.contains(e.target)) {
                userDropdown.classList.add('hidden');
            }
        });
    } else {
        console.warn('User profile elements not found:', {
            userProfileBtn,
            userDropdown
        });
    }

    profileInitialized = true;
}

// Load admin user information
function loadAdminUserInfo() {
    const adminUser = localStorage.getItem('adminUser');
    if (adminUser) {
        try {
            const adminData = JSON.parse(adminUser);
            const adminName = document.getElementById('admin-name');
            const adminEmail = document.getElementById('admin-email');
            const adminAvatar = document.getElementById('admin-avatar');

            if (adminName) adminName.textContent = adminData.name || 'Admin User';
            if (adminEmail) adminEmail.textContent = adminData.email || 'admin@otomono.mv';

            if (adminAvatar && adminData.name) {
                const initial = adminData.name.charAt(0).toUpperCase();
                adminAvatar.innerHTML = `<span class="text-white text-sm font-rog-heading font-bold">${initial}</span>`;
            }

            // Update page title with admin name
            document.title = `Admin Panel - ${adminData.name || 'Admin'}`;
        } catch (error) {
            console.error('Error loading admin user info:', error);
        }
    }
}

// Session duration tracking
function updateSessionDuration() {
    const adminUser = localStorage.getItem('adminUser');
    if (adminUser) {
        try {
            const adminData = JSON.parse(adminUser);
            const loginTime = new Date(adminData.loginTime);
            const now = new Date();
            const diffMs = now - loginTime;
            const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
            const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

            const sessionDuration = document.getElementById('session-duration');
            if (sessionDuration) {
                sessionDuration.textContent = `${diffHours}h ${diffMinutes}m`;
            }
        } catch (error) {
            console.error('Error updating session duration:', error);
        }
    }
}

// Refresh functionality
let refreshInitialized = false;

function setupRefresh() {
    // Prevent duplicate event listeners
    if (refreshInitialized) {
        return;
    }

    const refreshBtn = document.getElementById('refresh-btn');
    if (refreshBtn) {
        console.log('Setting up refresh button:', refreshBtn);
        refreshBtn.addEventListener('click', async (e) => {
            e.preventDefault();
            const icon = refreshBtn.querySelector('i');
            if (icon) {
                icon.classList.add('animate-spin');
            }

            try {
                // Get current page from URL
                const currentPage = window.location.pathname.split('/').pop() || window.location.href.split('/').pop();
                let pageId = 'dashboard';

                // Map page filenames to page identifiers
                const pageMap = {
                    'admin-dashboard.html': 'dashboard',
                    'admin-orders.html': 'orders',
                    'admin-customers.html': 'customers',
                    'admin-materials.html': 'materials',
                    'admin-analytics.html': 'analytics',
                    'admin-reports.html': 'reports',
                    'admin-settings.html': 'settings',
                    'admin.html': 'dashboard'
                };

                pageId = pageMap[currentPage] || currentPage.replace('.html', '').replace('admin-', '');

                // Call page-specific refresh function if available
                if (window.loadPageData && typeof window.loadPageData === 'function') {
                    await window.loadPageData(pageId);
                } else if (window.loadDashboardData && pageId === 'dashboard' && typeof window.loadDashboardData === 'function') {
                    await window.loadDashboardData();
                } else if (window.loadOrdersData && pageId === 'orders' && typeof window.loadOrdersData === 'function') {
                    await window.loadOrdersData();
                } else if (window.loadCustomersData && pageId === 'customers' && typeof window.loadCustomersData === 'function') {
                    await window.loadCustomersData();
                } else if (window.loadMaterialsData && pageId === 'materials' && typeof window.loadMaterialsData === 'function') {
                    await window.loadMaterialsData();
                } else if (window.loadAnalyticsData && pageId === 'analytics' && typeof window.loadAnalyticsData === 'function') {
                    await window.loadAnalyticsData();
                } else if (window.loadReportsData && pageId === 'reports' && typeof window.loadReportsData === 'function') {
                    await window.loadReportsData();
                } else if (window.loadSettingsData && pageId === 'settings' && typeof window.loadSettingsData === 'function') {
                    await window.loadSettingsData();
                } else {
                    // Fallback: reload page
                    location.reload();
                    return;
                }

                console.log('Data refreshed successfully from Firebase');
                if (window.showRogSuccess) {
                    window.showRogSuccess('Data refreshed successfully!', 'Refresh Complete');
                }
            } catch (error) {
                console.error('Error refreshing data:', error);
                if (window.showRogError) {
                    window.showRogError('Error refreshing data. Please try again.', 'Refresh Failed');
                }
            } finally {
                if (icon) {
                    setTimeout(() => {
                        icon.classList.remove('animate-spin');
                    }, 1000);
                }
            }
        });
    } else {
        console.warn('Refresh button not found');
    }

    refreshInitialized = true;
}

// Logout function
function logout() {
    showRogConfirm(
        'Are you sure you want to logout?',
        'Logout Confirmation',
        () => {
            localStorage.removeItem('adminUser');
            window.location.href = 'login.html';
        },
        () => {
            // User cancelled, do nothing
        }
    );
}

// Update active navigation link based on current page URL
function updateActiveNavLink() {
    // Get current page filename from URL
    const currentPage = window.location.pathname.split('/').pop() || window.location.href.split('/').pop();

    // Map page filenames to page identifiers
    const pageMap = {
        'admin-dashboard.html': 'dashboard',
        'admin-orders.html': 'orders',
        'admin-customers.html': 'customers',
        'admin-materials.html': 'materials',
        'admin-analytics.html': 'analytics',
        'admin-reports.html': 'reports',
        'admin-settings.html': 'settings',
        'designer-studio.html': 'design-studio',
        'admin.html': 'dashboard' // Default for admin.html (single page app)
    };

    // Get page identifier from current page
    const pageId = pageMap[currentPage] || currentPage.replace('.html', '').replace('admin-', '');

    // Find all navigation links
    const navLinks = document.querySelectorAll('.nav-link, nav a');

    navLinks.forEach(link => {
        // Remove active class from all links
        link.classList.remove('active');

        // Get the href and data-page attributes
        const href = link.getAttribute('href') || '';
        const dataPage = link.getAttribute('data-page') || '';

        // Check if this link matches the current page
        const matches =
            href === currentPage ||
            href.includes(pageId) ||
            dataPage === pageId ||
            (href.startsWith('#') && href.substring(1) === pageId) ||
            (currentPage === 'admin.html' && href.startsWith('#') && href.substring(1) === pageId);

        if (matches) {
            link.classList.add('active');
        }
    });

    console.log(`Active nav link updated for page: ${pageId}`);
}

// Navigation functions
function navigateToSettings() {
    window.location.href = 'admin-settings.html';
}

function navigateToOrders() {
    window.location.href = 'admin-orders.html';
}

function navigateToAnalytics() {
    window.location.href = 'admin-analytics.html';
}

function navigateToReports() {
    window.location.href = 'admin-reports.html';
}

// Utility Functions
function getStatusColor(status) {
    const colors = {
        'pending': 'bg-yellow-500/20 text-yellow-400',
        'processing': 'bg-blue-500/20 text-blue-400',
        'completed': 'bg-green-500/20 text-green-400',
        'cancelled': 'bg-red-500/20 text-red-400',
        'active': 'bg-green-500/20 text-green-400',
        'inactive': 'bg-gray-500/20 text-gray-400'
    };
    return colors[status] || 'bg-gray-500/20 text-gray-400';
}

function formatDate(dateString) {
    if (!dateString) return 'N/A';
    try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) {
            return 'N/A';
        }
        return date.toLocaleDateString();
    } catch (error) {
        console.warn('Date formatting error:', error);
        return 'N/A';
    }
}

// Branded Dialog System
function showRogDialog(options) {
    const {
        type = 'info',
            title = 'Notification',
            message = '',
            confirmText = 'OK',
            cancelText = 'Cancel',
            showCancel = false,
            onConfirm = null,
            onCancel = null
    } = options;

    const dialogId = 'rog-dialog-' + Date.now();
    const iconMap = {
        success: 'fas fa-check',
        warning: 'fas fa-exclamation-triangle',
        error: 'fas fa-times-circle',
        info: 'fas fa-info-circle'
    };

    const dialogHtml = `
        <div id="${dialogId}" class="rog-dialog">
            <div class="rog-dialog-content">
                <div class="rog-dialog-header">
                    <div class="rog-dialog-icon ${type}">
                        <i class="${iconMap[type]}"></i>
                    </div>
                    <div class="rog-dialog-title">${title}</div>
                </div>
                <div class="rog-dialog-message">${message}</div>
                <div class="rog-dialog-actions">
                    ${showCancel ? `<button class="rog-dialog-btn secondary" onclick="window.closeRogDialog('${dialogId}', false)">${cancelText}</button>` : ''}
                    <button class="rog-dialog-btn ${type === 'error' ? 'danger' : 'primary'}" onclick="window.closeRogDialog('${dialogId}', true)">${confirmText}</button>
                </div>
            </div>
        </div>
    `;

    document.body.insertAdjacentHTML('beforeend', dialogHtml);

    // Store callbacks
    window.rogDialogCallbacks = window.rogDialogCallbacks || {};
    window.rogDialogCallbacks[dialogId] = {
        onConfirm,
        onCancel
    };
}

function closeRogDialog(dialogId, confirmed) {
    const dialog = document.getElementById(dialogId);
    if (dialog) {
        dialog.style.animation = 'fadeOut 0.3s ease-out';
        setTimeout(() => {
            dialog.remove();
        }, 300);
    }

    // Execute callbacks
    if (window.rogDialogCallbacks && window.rogDialogCallbacks[dialogId]) {
        const callbacks = window.rogDialogCallbacks[dialogId];
        if (confirmed && callbacks.onConfirm) {
            callbacks.onConfirm();
        } else if (!confirmed && callbacks.onCancel) {
            callbacks.onCancel();
        }
        delete window.rogDialogCallbacks[dialogId];
    }
}

// Convenience functions
function showRogAlert(message, title = 'Notification', type = 'info') {
    showRogDialog({
        type,
        title,
        message,
        confirmText: 'OK'
    });
}

function showRogConfirm(message, title = 'Confirmation', onConfirm = null, onCancel = null) {
    showRogDialog({
        type: 'warning',
        title,
        message,
        confirmText: 'Yes',
        cancelText: 'No',
        showCancel: true,
        onConfirm,
        onCancel
    });
}

function showRogSuccess(message, title = 'Success') {
    showRogDialog({
        type: 'success',
        title,
        message,
        confirmText: 'OK'
    });
}

function showRogError(message, title = 'Error') {
    showRogDialog({
        type: 'error',
        title,
        message,
        confirmText: 'OK'
    });
}

// Initialize navigation on page load
function initializeNavigation() {
    // Update active nav link on page load
    updateActiveNavLink();

    // Update active nav link after a short delay to ensure DOM is ready
    setTimeout(() => {
        updateActiveNavLink();
    }, 200);

    // Listen for navigation changes (for single-page app behavior in admin.html)
    window.addEventListener('hashchange', () => {
        updateActiveNavLink();
    });

    // Listen for popstate (back/forward button)
    window.addEventListener('popstate', () => {
        updateActiveNavLink();
    });
}

// Export functions for use in pages
window.checkAdminAuth = checkAdminAuth;
window.initializeFirebase = initializeFirebase;
window.ensureFirebaseReady = ensureFirebaseReady;
window.loadAdminComponents = loadAdminComponents;
window.setupMobileSidebar = setupMobileSidebar;
window.setupHeaderActions = setupHeaderActions;
window.setupNotifications = setupNotifications;
window.setupUserProfile = setupUserProfile;
window.setupRefresh = setupRefresh;
window.loadAdminUserInfo = loadAdminUserInfo;
window.updateSessionDuration = updateSessionDuration;
window.loadNotifications = loadNotifications;
window.renderNotifications = renderNotifications;
window.updateNotificationCount = updateNotificationCount;
window.clearAllNotifications = clearAllNotifications;
window.logout = logout;
window.updateActiveNavLink = updateActiveNavLink;
window.initializeNavigation = initializeNavigation;
window.navigateToSettings = navigateToSettings;
window.navigateToOrders = navigateToOrders;
window.navigateToAnalytics = navigateToAnalytics;
window.navigateToReports = navigateToReports;
window.getStatusColor = getStatusColor;
window.formatDate = formatDate;
window.showRogDialog = showRogDialog;
window.closeRogDialog = closeRogDialog;
window.showRogAlert = showRogAlert;
window.showRogConfirm = showRogConfirm;
window.showRogSuccess = showRogSuccess;
window.showRogError = showRogError;

// Auto-initialize navigation when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeNavigation);
} else {
    initializeNavigation();
}