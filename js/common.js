// Common JavaScript functions used across all pages

// Firebase Configuration
export const firebaseConfig = {
    apiKey: "AIzaSyD1iij4QWlxQJJPS-yJrhSiCS79kS4dqaM",
    authDomain: "portfolio-56be7.firebaseapp.com",
    projectId: "portfolio-56be7",
    storageBucket: "portfolio-56be7.firebasestorage.app",
    messagingSenderId: "888511551571",
    appId: "1:888511551571:web:11e809e995377e9a4ccea6",
    measurementId: "G-X3CYL9YZR1"
};

// Toast Notification System
export function showToast(message, type = 'info', duration = 4000) {
    const toastContainer = document.getElementById('toast-container');
    if (!toastContainer) return;
    
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    toastContainer.appendChild(toast);

    setTimeout(() => toast.classList.add('show'), 10);
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.parentNode?.removeChild(toast), 300);
    }, duration);
}

// Update cart count
export function updateCartCount() {
    const cartCountEl = document.getElementById("cartCount");
    const mobileCartCountEl = document.getElementById("mobileCartCount");
    
    if (!cartCountEl) return;
    
    const savedCart = localStorage.getItem('freshmartCart');
    const cartItems = savedCart ? JSON.parse(savedCart) : [];
    const totalCount = cartItems.reduce((sum, item) => sum + (item.quantity || 1), 0);
    
    cartCountEl.textContent = totalCount;
    if (mobileCartCountEl) {
        mobileCartCountEl.textContent = totalCount;
    }
}

// Mobile menu functions
export function openMobileMenu() {
    const mobileMenu = document.getElementById("mobileMenu");
    const mobileMenuOverlay = document.getElementById("mobileMenuOverlay");
    const menuBtn = document.getElementById("menuBtn");
    
    if (mobileMenu && mobileMenuOverlay && menuBtn) {
        mobileMenu.classList.add('open');
        mobileMenuOverlay.classList.remove('hidden');
        menuBtn.classList.add('open');
        document.body.style.overflow = 'hidden';
    }
}

export function closeMobileMenu() {
    const mobileMenu = document.getElementById("mobileMenu");
    const mobileMenuOverlay = document.getElementById("mobileMenuOverlay");
    const menuBtn = document.getElementById("menuBtn");
    
    if (mobileMenu && mobileMenuOverlay && menuBtn) {
        mobileMenu.classList.remove('open');
        mobileMenuOverlay.classList.add('hidden');
        menuBtn.classList.remove('open');
        document.body.style.overflow = '';
    }
}

// Update user interface based on auth state
export function updateUserInterface(user) {
    const loginBtn = document.getElementById("loginBtn");
    const mobileLoginBtn = document.getElementById("mobileLoginBtn");
    const mobileLoggedOut = document.getElementById("mobileLoggedOut");
    const mobileLoggedIn = document.getElementById("mobileLoggedIn");
    const mobileUserName = document.getElementById("mobileUserName");
    const mobileProfileBtn = document.getElementById("mobileProfileBtn");
    const mobileLogoutBtn = document.getElementById("mobileLogoutBtn");
    
    if (user) {
        // Desktop
        if (loginBtn) {
            loginBtn.textContent = 'Profile';
            loginBtn.onclick = () => window.location.href = 'profile.html';
        }
        
        // Mobile
        if (mobileLoggedOut && mobileLoggedIn && mobileUserName) {
            mobileLoggedOut.classList.add('hidden');
            mobileLoggedIn.classList.remove('hidden');
            mobileUserName.textContent = user.displayName || user.email || 'User';
        }
        
        if (mobileProfileBtn) {
            mobileProfileBtn.onclick = () => window.location.href = 'profile.html';
        }
        
        if (mobileLogoutBtn) {
            mobileLogoutBtn.onclick = async () => {
                try {
                    const { signOut } = await import("https://www.gstatic.com/firebasejs/11.8.1/firebase-auth.js");
                    const { getAuth } = await import("https://www.gstatic.com/firebasejs/11.8.1/firebase-auth.js");
                    const auth = getAuth();
                    await signOut(auth);
                    showToast('Logged out successfully!', 'success');
                    closeMobileMenu();
                } catch (error) {
                    showToast('Error logging out: ' + error.message, 'error');
                }
            };
        }
    } else {
        // Desktop
        if (loginBtn) {
            loginBtn.textContent = 'Login';
            loginBtn.onclick = () => window.location.href = 'login.html';
        }
        
        // Mobile
        if (mobileLoggedOut && mobileLoggedIn) {
            mobileLoggedOut.classList.remove('hidden');
            mobileLoggedIn.classList.add('hidden');
        }
        
        if (mobileLoginBtn) {
            mobileLoginBtn.onclick = () => window.location.href = 'login.html';
        }
    }
}

// Initialize common functionality
export function initializeCommon() {
    updateCartCount();
    
    // Mobile menu toggle
    const menuBtn = document.getElementById("menuBtn");
    const mobileMenuOverlay = document.getElementById("mobileMenuOverlay");
    const mobileMenu = document.getElementById("mobileMenu");
    
    if (menuBtn) {
        menuBtn.addEventListener('click', () => {
            if (mobileMenu && mobileMenu.classList.contains('open')) {
                closeMobileMenu();
            } else {
                openMobileMenu();
            }
        });
    }
    
    // Close mobile menu when clicking overlay
    if (mobileMenuOverlay) {
        mobileMenuOverlay.addEventListener('click', closeMobileMenu);
    }
    
    // Close mobile menu when clicking navigation links
    if (mobileMenu) {
        mobileMenu.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', closeMobileMenu);
        });
    }
    
    // Cart buttons
    const cartBtn = document.getElementById("cartBtn");
    const mobileCartBtn = document.getElementById("mobileCartBtn");
    
    if (cartBtn) {
        cartBtn.addEventListener('click', () => {
            window.location.href = 'cart.html';
        });
    }
    
    if (mobileCartBtn) {
        mobileCartBtn.addEventListener('click', () => {
            window.location.href = 'cart.html';
        });
    }
    
    // Handle window resize
    window.addEventListener('resize', () => {
        if (window.innerWidth >= 768) {
            closeMobileMenu();
        }
    });
}