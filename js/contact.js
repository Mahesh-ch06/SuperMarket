// Simplified Contact page JavaScript

// Generic Modal Functions
function openGeneralModal(message) {
    const generalModal = document.getElementById('generalModal');
    const generalModalMessage = document.getElementById('generalModalMessage');
    
    generalModalMessage.innerHTML = message;
    generalModal.classList.remove('hidden');
    setTimeout(() => generalModal.classList.add('show'), 10);
}

function closeGeneralModal() {
    const generalModal = document.getElementById('generalModal');
    
    generalModal.classList.remove('show');
    setTimeout(() => generalModal.classList.add('hidden'), 300);
}

// Initialize contact page
function initializeContactPage() {
    const generalModalOkBtn = document.getElementById('generalModalOkBtn');
    const generalModalCloseBtn = document.getElementById('generalModalCloseBtn');
    
    // Update cart count on page load
    window.FreshMartCommon.updateCartCount();

    // Mock user login state (adjust as per your actual login logic)
    const isLoggedIn = false; // Assume logged out for this static page unless told otherwise
    const loginLogoutBtn = document.getElementById('loginLogoutBtn');
    const profileBtn = document.getElementById('profileBtn');
    const myOrdersBtn = document.getElementById('myOrdersBtn');
    
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
            // Implement logout logic here
            openGeneralModal("Logout functionality would be implemented here.");
        } else {
            window.location.href = 'login.html';
        }
    });

    profileBtn.addEventListener('click', () => {
        window.location.href = 'profile.html'; // Assuming a profile page exists
    });

    myOrdersBtn.addEventListener('click', () => {
        window.location.href = 'my_orders.html'; // Assuming a my orders page exists
    });

    document.getElementById("cartBtn").addEventListener("click", function() {
        window.location.href = "cart.html";
    });

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
        window.location.href = "aboutus.html"; // Ensure this links to your actual about us page
    });
    
    // The Contact Us link itself is the current page, so no navigation needed for it.
    document.getElementById("navContactUs").addEventListener("click", function(event) {
        event.preventDefault();
        // Already on Contact Us page, maybe scroll to top or show message
        openGeneralModal("You are already on the Contact Us page!");
    });

    // Footer Links (using actual IDs for these now)
    document.getElementById("footerContactUs").addEventListener("click", function(event) {
        event.preventDefault();
        // Already on Contact Us page, maybe scroll to top or show message
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

    // Close modal on outside click
    document.getElementById('generalModal').addEventListener('click', function(e) {
        if (e.target === this) {
            closeGeneralModal();
        }
    });

    // The form submission is now handled directly by Web3Forms
    // No custom JavaScript event listener for 'submit' needed
    console.log('Contact page initialized - Web3Forms will handle form submission');
}

// Export for use in other modules
window.FreshMartContact = {
    openGeneralModal,
    closeGeneralModal,
    initializeContactPage
};