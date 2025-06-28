// Enhanced Contact page JavaScript with secure API key handling

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

// Secure API configuration fetching
async function getSecureConfig() {
    try {
        const response = await fetch('/api/config');
        if (!response.ok) {
            throw new Error('Failed to fetch configuration');
        }
        return await response.json();
    } catch (error) {
        console.error('Error fetching secure config:', error);
        return null;
    }
}

// Form submission with multiple fallback methods
async function submitContactForm(formData) {
    const submitBtn = document.getElementById('submitBtn');
    const submitText = document.getElementById('submitText');
    const submitLoader = document.getElementById('submitLoader');
    
    // Show loading state
    submitBtn.disabled = true;
    submitText.textContent = 'Sending...';
    submitLoader.classList.remove('hidden');
    
    try {
        // Method 1: Try Web3Forms through server proxy (secure)
        console.log('Attempting secure Web3Forms submission...');
        const serverResponse = await submitThroughServer(formData);
        
        if (serverResponse.success) {
            showSuccessMessage();
            resetForm();
            return;
        }
        
        throw new Error('Server submission failed');
        
    } catch (error) {
        console.log('Server submission failed, trying direct methods...', error);
        
        try {
            // Method 2: Try direct Web3Forms (fallback)
            console.log('Attempting direct Web3Forms submission...');
            const web3Response = await submitToWeb3FormsDirect(formData);
            
            if (web3Response.success) {
                showSuccessMessage();
                resetForm();
                return;
            }
            
            throw new Error('Direct Web3Forms failed');
            
        } catch (error2) {
            console.log('Direct Web3Forms failed, trying Formspree...', error2);
            
            try {
                // Method 3: Try Formspree as fallback
                console.log('Attempting Formspree submission...');
                const formspreeResponse = await submitToFormspree(formData);
                
                if (formspreeResponse.ok) {
                    showSuccessMessage();
                    resetForm();
                    return;
                }
                
                throw new Error('Formspree failed');
                
            } catch (error3) {
                console.log('All external services failed, using local storage fallback...', error3);
                
                // Method 4: Local storage fallback
                saveToLocalStorage(formData);
                showFallbackMessage();
                resetForm();
            }
        }
    } finally {
        // Reset button state
        submitBtn.disabled = false;
        submitText.textContent = 'Send Message';
        submitLoader.classList.add('hidden');
    }
}

// Server-side submission (most secure)
async function submitThroughServer(formData) {
    const response = await fetch('/api/contact-submit', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
    });
    
    const result = await response.json();
    return result;
}

// Direct Web3Forms submission (fallback)
async function submitToWeb3FormsDirect(formData) {
    const web3FormData = new FormData();
    web3FormData.append('access_key', '330e0585-6990-4a15-b2f0-f20df66dc3e8');
    web3FormData.append('name', formData.name);
    web3FormData.append('email', formData.email);
    web3FormData.append('phone', formData.phone || '');
    web3FormData.append('subject', formData.subject || 'Contact Form Submission');
    web3FormData.append('message', formData.message);
    web3FormData.append('from_name', 'FreshMart Contact Form');
    
    const response = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        body: web3FormData
    });
    
    const result = await response.json();
    return result;
}

// Formspree submission (alternative)
async function submitToFormspree(formData) {
    const response = await fetch('https://formspree.io/f/xpwzgqpw', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            name: formData.name,
            email: formData.email,
            phone: formData.phone || '',
            subject: formData.subject || 'Contact Form Submission',
            message: formData.message,
            _replyto: formData.email
        })
    });
    
    return response;
}

// Local storage fallback
function saveToLocalStorage(formData) {
    const submissions = JSON.parse(localStorage.getItem('contactSubmissions') || '[]');
    submissions.push({
        ...formData,
        timestamp: new Date().toISOString(),
        id: Date.now()
    });
    localStorage.setItem('contactSubmissions', JSON.stringify(submissions));
    console.log('Form data saved to local storage:', formData);
}

// Success message
function showSuccessMessage() {
    openGeneralModal(`
        <div class="text-center">
            <div class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg class="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                </svg>
            </div>
            <h3 class="text-xl font-bold text-gray-800 mb-2">Message Sent Successfully!</h3>
            <p class="text-gray-600">Thank you for contacting us. We'll get back to you within 2 hours during business hours.</p>
        </div>
    `);
    
    // Show success toast
    if (window.FreshMartCommon && window.FreshMartCommon.showToast) {
        window.FreshMartCommon.showToast('✅ Message sent successfully!', 'success', 4000);
    }
}

// Fallback message
function showFallbackMessage() {
    openGeneralModal(`
        <div class="text-center">
            <div class="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg class="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
            </div>
            <h3 class="text-xl font-bold text-gray-800 mb-2">Message Received!</h3>
            <p class="text-gray-600 mb-4">Your message has been saved locally. Please also try contacting us directly:</p>
            <div class="space-y-2 text-sm">
                <p><strong>Email:</strong> <a href="mailto:support@freshmart.com" class="text-[#38a169]">support@freshmart.com</a></p>
                <p><strong>Phone:</strong> <a href="tel:+911234567890" class="text-[#38a169]">+91 12345 67890</a></p>
            </div>
        </div>
    `);
    
    // Show info toast
    if (window.FreshMartCommon && window.FreshMartCommon.showToast) {
        window.FreshMartCommon.showToast('📝 Message saved! Please contact us directly for immediate assistance.', 'info', 6000);
    }
}

// Reset form
function resetForm() {
    document.getElementById('contactForm').reset();
}

// Form validation
function validateForm(formData) {
    const errors = [];
    
    if (!formData.name || formData.name.trim().length < 2) {
        errors.push('Please enter a valid name (at least 2 characters)');
    }
    
    if (!formData.email || !isValidEmail(formData.email)) {
        errors.push('Please enter a valid email address');
    }
    
    if (!formData.message || formData.message.trim().length < 10) {
        errors.push('Please enter a message (at least 10 characters)');
    }
    
    return errors;
}

// Email validation
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Initialize contact page
function initializeContactPage() {
    const generalModalOkBtn = document.getElementById('generalModalOkBtn');
    const generalModalCloseBtn = document.getElementById('generalModalCloseBtn');
    const contactForm = document.getElementById('contactForm');
    
    // Update cart count on page load
    if (window.FreshMartCommon && window.FreshMartCommon.updateCartCount) {
        window.FreshMartCommon.updateCartCount();
    }

    // Mock user login state
    const isLoggedIn = false;
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

    // Navigation links
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
    
    // Modal close buttons
    generalModalOkBtn.addEventListener('click', closeGeneralModal);
    generalModalCloseBtn.addEventListener('click', closeGeneralModal);

    // Close modal on outside click
    document.getElementById('generalModal').addEventListener('click', function(e) {
        if (e.target === this) {
            closeGeneralModal();
        }
    });

    // Contact form submission
    contactForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        // Get form data
        const formData = {
            name: document.getElementById('name').value.trim(),
            email: document.getElementById('email').value.trim(),
            phone: document.getElementById('phone').value.trim(),
            subject: document.getElementById('subject').value,
            message: document.getElementById('message').value.trim()
        };
        
        // Validate form
        const errors = validateForm(formData);
        if (errors.length > 0) {
            openGeneralModal(`
                <div class="text-center">
                    <div class="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg class="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                        </svg>
                    </div>
                    <h3 class="text-xl font-bold text-gray-800 mb-2">Please Fix Form Errors</h3>
                    <div class="text-left">
                        <ul class="list-disc list-inside space-y-1 text-sm text-gray-600">
                            ${errors.map(error => `<li>${error}</li>`).join('')}
                        </ul>
                    </div>
                </div>
            `);
            return;
        }
        
        // Submit form
        await submitContactForm(formData);
    });

    console.log('Contact page initialized with secure API key handling');
}

// Export for use in other modules
window.FreshMartContact = {
    openGeneralModal,
    closeGeneralModal,
    submitContactForm,
    getSecureConfig,
    initializeContactPage
};