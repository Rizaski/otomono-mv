/**
 * Universal Authentication Handler
 * Ensures consistent profile button behavior across all pages
 */

// Global authentication state
window.AuthState = {
    isLoggedIn: false,
    currentUser: null,
    profileButton: null,
    loginButton: null,
    userProfileImage: null,
    dropdownProfileImage: null,
    dropdownUserName: null,
    dropdownUserEmail: null,
    mobileUserProfileImage: null,
    mobileUserName: null,
    mobileUserEmail: null
};

// Initialize authentication on page load
document.addEventListener('DOMContentLoaded', function() {
    console.log('Universal Auth: Initializing authentication...');

    // Wait for Firebase to be available
    const initAuth = () => {
        if (window.FirebaseAuth && window.FirebaseAuth.getCurrentUser) {
            console.log('Universal Auth: Firebase available, setting up authentication');
            setupAuthentication();
        } else {
            console.log('Universal Auth: Firebase not ready, retrying...');
            setTimeout(initAuth, 100);
        }
    };

    initAuth();
});

async function setupAuthentication() {
    try {
        console.log('Universal Auth: Setting up authentication handlers');

        // Get DOM elements
        getAuthElements();

        // Check current authentication state
        await checkAuthState();

        // Set up event listeners
        setupEventListeners();

        console.log('Universal Auth: Authentication setup complete');
    } catch (error) {
        console.error('Universal Auth: Setup error:', error);
    }
}

function getAuthElements() {
    console.log('Universal Auth: Getting DOM elements');

    window.AuthState.profileButton = document.getElementById('user-profile-btn');
    window.AuthState.loginButton = document.getElementById('login-btn');
    window.AuthState.userProfileImage = document.getElementById('user-profile-image');
    window.AuthState.dropdownProfileImage = document.getElementById('dropdown-profile-image');
    window.AuthState.dropdownUserName = document.getElementById('dropdown-user-name');
    window.AuthState.dropdownUserEmail = document.getElementById('dropdown-user-email');
    window.AuthState.mobileUserProfileImage = document.getElementById('mobile-user-profile-image');
    window.AuthState.mobileUserName = document.getElementById('mobile-user-name');
    window.AuthState.mobileUserEmail = document.getElementById('mobile-user-email');

    console.log('Universal Auth: Elements found:', {
        profileButton: !!window.AuthState.profileButton,
        loginButton: !!window.AuthState.loginButton,
        userProfileImage: !!window.AuthState.userProfileImage,
        dropdownProfileImage: !!window.AuthState.dropdownProfileImage,
        mobileUserProfileImage: !!window.AuthState.mobileUserProfileImage
    });
}

async function checkAuthState() {
    try {
        console.log('Universal Auth: Checking authentication state');

        // Wait for Firebase auth to be ready
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Get current user
        const user = await window.FirebaseAuth.restoreAuthState();
        console.log('Universal Auth: Current user:', user);

        if (user) {
            console.log('Universal Auth: User is logged in, updating UI');
            window.AuthState.isLoggedIn = true;
            window.AuthState.currentUser = user;
            updateUIForLoggedInUser(user);
        } else {
            console.log('Universal Auth: User is not logged in, showing login button');
            window.AuthState.isLoggedIn = false;
            window.AuthState.currentUser = null;
            updateUIForLoggedOutUser();
        }
    } catch (error) {
        console.error('Universal Auth: Error checking auth state:', error);
        updateUIForLoggedOutUser();
    }
}

function updateUIForLoggedInUser(user) {
    console.log('Universal Auth: Updating UI for logged in user:', user);

    // Show profile button, hide login button
    if (window.AuthState.profileButton) {
        window.AuthState.profileButton.classList.add('show');
        console.log('Universal Auth: Profile button shown');
    }

    if (window.AuthState.loginButton) {
        window.AuthState.loginButton.classList.add('hide');
        console.log('Universal Auth: Login button hidden');
    }

    // Update profile images
    updateProfileImages(user);

    // Update user information
    updateUserInformation(user);

    // Show mobile user profile section
    showMobileUserProfile();
}

function updateUIForLoggedOutUser() {
    console.log('Universal Auth: Updating UI for logged out user');

    // Show login button, hide profile button
    if (window.AuthState.loginButton) {
        window.AuthState.loginButton.classList.remove('hide');
        console.log('Universal Auth: Login button shown');
    }

    if (window.AuthState.profileButton) {
        window.AuthState.profileButton.classList.remove('show');
        console.log('Universal Auth: Profile button hidden');
    }

    // Hide mobile user profile section
    hideMobileUserProfile();
}

function updateProfileImages(user) {
    console.log('Universal Auth: Updating profile images for user:', user);

    // Get profile image URL
    let profileImage = user.photoURL;
    if (!profileImage) {
        const initial = (user.displayName || user.email || 'U').charAt(0).toUpperCase();
        profileImage = `https://via.placeholder.com/32/ff0040/ffffff?text=${initial}`;
    }

    console.log('Universal Auth: Profile image URL:', profileImage);

    // Update desktop profile image
    if (window.AuthState.userProfileImage) {
        window.AuthState.userProfileImage.src = profileImage;
        window.AuthState.userProfileImage.onerror = () => {
            console.log('Universal Auth: Desktop profile image failed, using fallback');
            const initial = (user.displayName || user.email || 'U').charAt(0).toUpperCase();
            window.AuthState.userProfileImage.src = `https://via.placeholder.com/32/ff0040/ffffff?text=${initial}`;
        };
        window.AuthState.userProfileImage.onload = () => {
            console.log('Universal Auth: Desktop profile image loaded');
        };
    }

    // Update dropdown profile image
    if (window.AuthState.dropdownProfileImage) {
        window.AuthState.dropdownProfileImage.src = profileImage;
        window.AuthState.dropdownProfileImage.onerror = () => {
            console.log('Universal Auth: Dropdown profile image failed, using fallback');
            const initial = (user.displayName || user.email || 'U').charAt(0).toUpperCase();
            window.AuthState.dropdownProfileImage.src = `https://via.placeholder.com/40/ff0040/ffffff?text=${initial}`;
        };
    }

    // Update mobile profile image
    if (window.AuthState.mobileUserProfileImage) {
        window.AuthState.mobileUserProfileImage.src = profileImage;
        window.AuthState.mobileUserProfileImage.onerror = () => {
            console.log('Universal Auth: Mobile profile image failed, using fallback');
            const initial = (user.displayName || user.email || 'U').charAt(0).toUpperCase();
            window.AuthState.mobileUserProfileImage.src = `https://via.placeholder.com/40/ff0040/ffffff?text=${initial}`;
        };
    }
}

function updateUserInformation(user) {
    console.log('Universal Auth: Updating user information:', user);

    const displayName = user.displayName || (user.email ? user.email.split('@')[0] : 'User');
    const email = user.email || 'user@example.com';

    // Update dropdown user info
    if (window.AuthState.dropdownUserName) {
        window.AuthState.dropdownUserName.textContent = displayName;
    }
    if (window.AuthState.dropdownUserEmail) {
        window.AuthState.dropdownUserEmail.textContent = email;
    }

    // Update mobile user info
    if (window.AuthState.mobileUserName) {
        window.AuthState.mobileUserName.textContent = displayName;
    }
    if (window.AuthState.mobileUserEmail) {
        window.AuthState.mobileUserEmail.textContent = email;
    }
}

function showMobileUserProfile() {
    console.log('Universal Auth: Showing mobile user profile');

    // Show mobile user profile section
    const mobileUserProfileSection = document.getElementById('mobile-user-profile-section');
    const mobileLoginSection = document.getElementById('mobile-login-section');

    if (mobileUserProfileSection) {
        mobileUserProfileSection.style.display = 'block';
    }
    if (mobileLoginSection) {
        mobileLoginSection.style.display = 'none';
    }
}

function hideMobileUserProfile() {
    console.log('Universal Auth: Hiding mobile user profile');

    // Hide mobile user profile section
    const mobileUserProfileSection = document.getElementById('mobile-user-profile-section');
    const mobileLoginSection = document.getElementById('mobile-login-section');

    if (mobileUserProfileSection) {
        mobileUserProfileSection.style.display = 'none';
    }
    if (mobileLoginSection) {
        mobileLoginSection.style.display = 'block';
    }
}

function setupEventListeners() {
    console.log('Universal Auth: Setting up event listeners');

    // Profile dropdown toggle
    if (window.AuthState.profileButton) {
        window.AuthState.profileButton.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            console.log('Universal Auth: Profile button clicked');

            const dropdown = document.getElementById('user-profile-dropdown');
            if (dropdown) {
                if (dropdown.classList.contains('hidden')) {
                    dropdown.classList.remove('hidden');
                    console.log('Universal Auth: Profile dropdown opened');
                } else {
                    dropdown.classList.add('hidden');
                    console.log('Universal Auth: Profile dropdown closed');
                }
            }
        });
    }

    // Close dropdown when clicking outside
    document.addEventListener('click', (e) => {
        const dropdown = document.getElementById('user-profile-dropdown');
        if (dropdown && !dropdown.classList.contains('hidden')) {
            if (!window.AuthState.profileButton.contains(e.target) && !dropdown.contains(e.target)) {
                dropdown.classList.add('hidden');
                console.log('Universal Auth: Profile dropdown closed by outside click');
            }
        }
    });

    // Sign out functionality
    const signOutBtn = document.getElementById('sign-out-btn');
    if (signOutBtn) {
        signOutBtn.addEventListener('click', async (e) => {
            e.preventDefault();
            console.log('Universal Auth: Sign out clicked');
            try {
                await window.FirebaseAuth.signOut();
                console.log('Universal Auth: Sign out successful');
                window.location.href = 'index.html';
            } catch (error) {
                console.error('Universal Auth: Sign out error:', error);
            }
        });
    }

    // Mobile sign out
    const mobileSignOutBtn = document.getElementById('mobile-sign-out');
    if (mobileSignOutBtn) {
        mobileSignOutBtn.addEventListener('click', async (e) => {
            e.preventDefault();
            console.log('Universal Auth: Mobile sign out clicked');
            try {
                await window.FirebaseAuth.signOut();
                console.log('Universal Auth: Mobile sign out successful');
                window.location.href = 'index.html';
            } catch (error) {
                console.error('Universal Auth: Mobile sign out error:', error);
            }
        });
    }
}

// Listen for authentication state changes
if (window.FirebaseAuth) {
    window.FirebaseAuth.onAuthStateChanged((user) => {
        console.log('Universal Auth: Auth state changed:', user);
        if (user) {
            window.AuthState.isLoggedIn = true;
            window.AuthState.currentUser = user;
            updateUIForLoggedInUser(user);
        } else {
            window.AuthState.isLoggedIn = false;
            window.AuthState.currentUser = null;
            updateUIForLoggedOutUser();
        }
    });
}

// Add CSS to ensure profile button is properly styled
const style = document.createElement('style');
style.textContent = `
    #user-profile-btn {
        display: none !important;
    }
    #user-profile-btn.show {
        display: flex !important;
    }
    #login-btn {
        display: flex !important;
    }
    #login-btn.hide {
        display: none !important;
    }
`;
document.head.appendChild(style);

console.log('Universal Auth: Script loaded');