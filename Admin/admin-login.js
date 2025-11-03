// Admin Login Functionality
class AdminLogin {
    constructor() {
        this.init();
    }

    init() {
        console.log('Admin Login initialized');
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Desktop admin panel button
        const adminPanelBtn = document.getElementById('admin-panel-btn');
        const mobileAdminPanelBtn = document.getElementById('mobile-admin-panel-btn');
        const adminLoginModal = document.getElementById('admin-login-modal');
        const closeAdminLogin = document.getElementById('close-admin-login');
        const adminLoginForm = document.getElementById('admin-login-form');

        // Open admin login modal
        if (adminPanelBtn && adminLoginModal) {
            adminPanelBtn.addEventListener('click', (e) => {
                e.preventDefault();
                console.log('Admin panel button clicked');
                adminLoginModal.classList.remove('hidden');
            });
        }

        if (mobileAdminPanelBtn && adminLoginModal) {
            mobileAdminPanelBtn.addEventListener('click', (e) => {
                e.preventDefault();
                console.log('Mobile admin panel button clicked');
                adminLoginModal.classList.remove('hidden');
            });
        }

        // Close admin login modal
        if (closeAdminLogin && adminLoginModal) {
            closeAdminLogin.addEventListener('click', () => {
                adminLoginModal.classList.add('hidden');
            });
        }

        // Close modal when clicking outside
        if (adminLoginModal) {
            adminLoginModal.addEventListener('click', (e) => {
                if (e.target === adminLoginModal) {
                    adminLoginModal.classList.add('hidden');
                }
            });
        }

        // Admin login form submission
        if (adminLoginForm) {
            adminLoginForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                const email = document.getElementById('admin-email').value;
                const password = document.getElementById('admin-password').value;

                console.log('Admin login attempt:', email);

                // Simple admin credentials check
                const validAdmins = [
                    { email: 'admin@otomono.com', password: 'admin123', name: 'Admin User' },
                    { email: 'staff@otomono.com', password: 'staff123', name: 'Staff User' },
                    { email: 'miicrossoft@gmail.com', password: 'admin123', name: 'Admin User' }
                ];

                const admin = validAdmins.find(a => a.email === email && a.password === password);

                if (admin) {
                    console.log('Admin authentication successful:', admin);
                    
                    // Store admin session
                    localStorage.setItem('adminUser', JSON.stringify({
                        id: 'admin_' + Date.now(),
                        email: admin.email,
                        name: admin.name,
                        userType: 'admin',
                        loginTime: new Date().toISOString()
                    }));

                    // Show success message
                    const submitBtn = adminLoginForm.querySelector('button[type="submit"]');
                    const originalText = submitBtn.textContent;
                    submitBtn.textContent = 'Login Successful!';
                    submitBtn.classList.add('bg-green-600');
                    
                    setTimeout(() => {
                        window.location.href = 'admin-panel.html';
                    }, 1500);
                } else {
                    console.log('Admin authentication failed');
                    
                    // Show error message
                    const submitBtn = adminLoginForm.querySelector('button[type="submit"]');
                    const originalText = submitBtn.textContent;
                    submitBtn.textContent = 'Invalid Credentials';
                    submitBtn.classList.add('bg-red-600');
                    
                    setTimeout(() => {
                        submitBtn.textContent = originalText;
                        submitBtn.classList.remove('bg-red-600');
                    }, 2000);
                }
            });
        }
    }
}

// Initialize admin login when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    new AdminLogin();
});
