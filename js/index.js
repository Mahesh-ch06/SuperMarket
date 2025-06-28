import { initializeApp } from "https://www.gstatic.com/firebasejs/11.8.1/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/11.8.1/firebase-auth.js";
import { firebaseConfig, showToast, updateCartCount, updateUserInterface, initializeCommon } from './common.js';

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Navigation functions
window.navigateToShop = function(category) {
    window.location.href = `shop.html?category=${category}`;
};

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    initializeCommon();

    // Auth state listener
    onAuthStateChanged(auth, (user) => {
        updateUserInterface(user);
    });

    // Welcome message
    showToast('Welcome to FreshMart! 🛒', 'success', 3000);
});