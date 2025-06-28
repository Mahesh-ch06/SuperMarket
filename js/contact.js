import { showToast, updateCartCount } from './common.js';

// DOM Elements
const cartCountEl = document.getElementById("cartCount");
const loginLogoutBtn = document.getElementById("loginLogoutBtn");
const profileBtn = document.getElementById("profileBtn");
const myOrdersBtn = document.getElementById("myOrdersBtn");

const generalModal = document.getElementById('generalModal');
const generalModalMessage = document.getElementById('generalModalMessage');
const generalModalOkBtn = document.getElementById('generalModalOkBtn');
const generalModalCloseBtn = document.getElementById('generalModalCloseBtn');

const contactForm = document.getElementById('contactForm');

// Generic Modal Functions
function openGeneralModal(message) {
    generalModalMessage.textContent = message;
    generalModal.classList.remove('hidden');
    setTimeout(() => generalModal.classList.add('show'), 10);
}

function closeGeneralModal() {
    generalModal.classList.remove('show');
    setTimeout(() => generalModal.classList.add('hidden'), 300);
}

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    updateCartCount();

    // Mock user login state
    const isLoggedIn = false;
    if (isLoggedIn) {
        loginLogoutBtn.textContent = 'Logout';
        loginLogoutBtn.classList.remove('bg-[#38a169]', 'text-white', 'hover:bg-[#2f855a]');
        loginLogoutBtn.classList.add('bg-gray-200', 'text-[#111813]', 'hover:bg-gray-300');
    } else {
        loginLogoutBtn.textContent = 'Login';
        loginLogoutBtn.classList.remove('bg-gray-200', 'text-[#111813]', 'hover:bg-gray-300');
        loginLogoutBtn.classList.add('bg-[#38a169]', 'text-white', 'hover:bg-[#2f855a]');
    }

    // Header Navigation & Actions
    loginLogoutBtn.addEventListener('click', async () => {
        if (isLoggedIn) {
            openGeneralModal("Logout functionality would be implemented here.");
        } else {
            window.location.href = 'login.html';
        }
    });

    profileBtn.addEventListener('click', () => {
        window.location.href = 'profile.html';
    });

    myOrdersBtn.addEventListener('click', () => {
        window.location.href = 'my_orders.html';
    });

    document.getElementById("cartBtn").addEventListener("click", function() {
        window.location.href = "cart.html";
    });

    // Navigation event listeners
    document.getElementById("navShop").addEventListener("click", function(event) {
        event.preventDefault();
        window.location.href = "shop.html";
    });
    
    document.getElementById("navDeals").addEventListener("click", function(event) {
        event.preventDefault();
        window.location.href = "deals.html";
    });
    
    document.getElementById("navRecipes").addEventListener("click", function(event) {
        event.preventDefault();
        openGeneralModal("Navigating to Recipes page (placeholder)!");
    });
    
    document.getElementById("navAboutUs").addEventListener("click", function(event) {
        event.preventDefault();
        window.location.href = "aboutus.html";
    });
    
    document.getElementById("navContactUs").addEventListener("click", function(event) {
        event.preventDefault();
        openGeneralModal("You are already on the Contact Us page!");
    });

    // Footer Links
    document.getElementById("footerContactUs").addEventListener("click", function(event) {
        event.preventDefault();
        openGeneralModal("You are already on the Contact Us page!");
    });

    document.getElementById("footerPrivacyPolicy").addEventListener("click", function(event) {
        event.preventDefault();
        openGeneralModal("Navigating to Privacy Policy page!");
    });

    document.getElementById("footerTermsOfService").addEventListener("click", function(event) {
        event.preventDefault();
        openGeneralModal("Navigating to Terms of Service page!");
    });
    
    // Global Modal Close Buttons
    generalModalOkBtn.addEventListener('click', closeGeneralModal);
    generalModalCloseBtn.addEventListener('click', closeGeneralModal);
});