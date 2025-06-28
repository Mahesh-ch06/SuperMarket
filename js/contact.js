// Enhanced Contact page JavaScript

// Form validation
class FormValidator {
    constructor() {
        this.rules = {
            fullName: {
                required: true,
                minLength: 2,
                pattern: /^[a-zA-Z\s]+$/,
                message: 'Please enter a valid name (letters only, minimum 2 characters)'
            },
            emailAddress: {
                required: true,
                pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                message: 'Please enter a valid email address'
            },
            phoneNumber: {
                required: true,
                pattern: /^[\+]?[1-9][\d]{0,15}$/,
                message: 'Please enter a valid phone number'
            },
            message: {
                required: true,
                minLength: 10,
                message: 'Please enter a message (minimum 10 characters)'
            }
        };
    }

    validateField(fieldName, value) {
        const rule = this.rules[fieldName];
        if (!rule) return { isValid: true };

        // Required check
        if (rule.required && (!value || value.trim() === '')) {
            return { isValid: false, message: `${fieldName.replace(/([A-Z])/g, ' $1').toLowerCase()} is required` };
        }

        // Skip other validations if field is empty and not required
        if (!value || value.trim() === '') {
            return { isValid: true };
        }

        // Pattern check
        if (rule.pattern && !rule.pattern.test(value)) {
            return { isValid: false, message: rule.message };
        }

        // Min length check
        if (rule.minLength && value.length < rule.minLength) {
            return { isValid: false, message: rule.message };
        }

        return { isValid: true };
    }

    showFieldError(fieldName, message) {
        const field = document.getElementById(fieldName);
        const errorElement = document.getElementById(fieldName + 'Error');
        
        if (field) {
            field.classList.add('error');
            field.classList.remove('success');
        }
        
        if (errorElement) {
            errorElement.textContent = message;
            errorElement.style.display = 'block';
        }
    }

    showFieldSuccess(fieldName) {
        const field = document.getElementById(fieldName);
        const errorElement = document.getElementById(fieldName + 'Error');
        
        if (field) {
            field.classList.add('success');
            field.classList.remove('error');
        }
        
        if (errorElement) {
            errorElement.style.display = 'none';
        }
    }

    clearFieldValidation(fieldName) {
        const field = document.getElementById(fieldName);
        const errorElement = document.getElementById(fieldName + 'Error');
        
        if (field) {
            field.classList.remove('error', 'success');
        }
        
        if (errorElement) {
            errorElement.style.display = 'none';
        }
    }
}

// Enhanced Modal Functions
function openGeneralModal(message, type = 'info') {
    const generalModal = document.getElementById('generalModal');
    const generalModalMessage = document.getElementById('generalModalMessage');
    const modalContent = generalModal.querySelector('.modal-content');
    
    // Add type-specific styling
    modalContent.className = `modal-content ${type}`;
    
    generalModalMessage.innerHTML = message;
    generalModal.classList.remove('hidden');
    setTimeout(() => generalModal.classList.add('show'), 10);
}

function closeGeneralModal() {
    const generalModal = document.getElementById('generalModal');
    
    generalModal.classList.remove('show');
    setTimeout(() => generalModal.classList.add('hidden'), 300);
}

// Enhanced form submission with better UX
async function handleFormSubmission(form) {
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    
    // Add loading state
    submitBtn.classList.add('loading');
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span>Sending...</span>';
    
    try {
        const formData = new FormData(form);
        const response = await fetch(form.action, {
            method: 'POST',
            body: formData
        });
        
        if (response.ok) {
            // Success animation
            submitBtn.classList.add('success-animation');
            submitBtn.innerHTML = '✓ Message Sent!';
            submitBtn.style.background = 'linear-gradient(135deg, #38a169 0%, #2f855a 100%)';
            
            // Show success modal
            openGeneralModal(`
                <div style="text-align: center;">
                    <div style="font-size: 3rem; margin-bottom: 1rem;">✅</div>
                    <h3 style="color: #38a169; margin-bottom: 1rem;">Message Sent Successfully!</h3>
                    <p>Thank you for contacting FreshMart. We'll get back to you within 24 hours.</p>
                </div>
            `, 'success');
            
            // Reset form after delay
            setTimeout(() => {
                form.reset();
                submitBtn.innerHTML = originalText;
                submitBtn.disabled = false;
                submitBtn.classList.remove('loading', 'success-animation');
                submitBtn.style.background = '';
            }, 3000);
            
        } else {
            throw new Error('Failed to send message');
        }
    } catch (error) {
        console.error('Form submission error:', error);
        openGeneralModal(`
            <div style="text-align: center;">
                <div style="font-size: 3rem; margin-bottom: 1rem;">❌</div>
                <h3 style="color: #e53e3e; margin-bottom: 1rem;">Failed to Send Message</h3>
                <p>There was an error sending your message. Please try again or contact us directly.</p>
            </div>
        `, 'error');
        
        // Reset button
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
        submitBtn.classList.remove('loading');
    }
}

// Enhanced contact info interactions
function initializeContactCards() {
    const contactCards = document.querySelectorAll('.contact-info-card');
    
    contactCards.forEach((card, index) => {
        // Add floating animation with delay
        card.style.animationDelay = `${index * 0.5}s`;
        card.classList.add('float-animation');
        
        // Add click interactions for mobile
        card.addEventListener('click', function() {
            const link = this.querySelector('a');
            if (link && window.innerWidth <= 768) {
                link.click();
            }
        });
    });
}

// Enhanced map interaction
function initializeMapPlaceholder() {
    const mapPlaceholder = document.querySelector('.map-placeholder');
    if (mapPlaceholder) {
        mapPlaceholder.addEventListener('click', function() {
            const mapLink = this.querySelector('a');
            if (mapLink) {
                window.open(mapLink.href, '_blank');
            }
        });
    }
}

// Real-time form validation
function initializeFormValidation() {
    const validator = new FormValidator();
    const form = document.getElementById('contactForm');
    
    if (!form) return;
    
    // Add error elements to form
    const fields = ['fullName', 'emailAddress', 'phoneNumber', 'message'];
    fields.forEach(fieldName => {
        const field = document.getElementById(fieldName);
        if (field) {
            const errorElement = document.createElement('div');
            errorElement.id = fieldName + 'Error';
            errorElement.className = 'error-message';
            field.parentNode.appendChild(errorElement);
            
            // Real-time validation
            field.addEventListener('blur', function() {
                const validation = validator.validateField(fieldName, this.value);
                if (validation.isValid) {
                    validator.showFieldSuccess(fieldName);
                } else {
                    validator.showFieldError(fieldName, validation.message);
                }
            });
            
            // Clear validation on focus
            field.addEventListener('focus', function() {
                validator.clearFieldValidation(fieldName);
            });
        }
    });
    
    // Form submission with validation
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        let isFormValid = true;
        const formData = new FormData(form);
        
        // Validate all fields
        fields.forEach(fieldName => {
            const value = formData.get(fieldName === 'emailAddress' ? 'email' : 
                                     fieldName === 'phoneNumber' ? 'Phone Number' : 
                                     fieldName === 'fullName' ? 'Full Name' : fieldName);
            const validation = validator.validateField(fieldName, value);
            
            if (!validation.isValid) {
                validator.showFieldError(fieldName, validation.message);
                isFormValid = false;
            } else {
                validator.showFieldSuccess(fieldName);
            }
        });
        
        if (isFormValid) {
            handleFormSubmission(form);
        } else {
            openGeneralModal(`
                <div style="text-align: center;">
                    <div style="font-size: 3rem; margin-bottom: 1rem;">⚠️</div>
                    <h3 style="color: #e53e3e; margin-bottom: 1rem;">Please Fix Form Errors</h3>
                    <p>Please correct the highlighted fields and try again.</p>
                </div>
            `, 'warning');
        }
    });
}

// Initialize contact page with enhanced features
function initializeContactPage() {
    const generalModalOkBtn = document.getElementById('generalModalOkBtn');
    const generalModalCloseBtn = document.getElementById('generalModalCloseBtn');
    
    // Update cart count on page load
    window.FreshMartCommon.updateCartCount();

    // Enhanced user interface
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

    // Enhanced navigation handlers
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

    // Enhanced navigation with smooth transitions
    const navLinks = {
        "navShop": "shop.html",
        "navDeals": "deals.html",
        "navAboutUs": "aboutus.html"
    };

    Object.entries(navLinks).forEach(([id, url]) => {
        const element = document.getElementById(id);
        if (element) {
            element.addEventListener("click", function(event) {
                event.preventDefault();
                // Add loading animation
                this.style.opacity = '0.7';
                setTimeout(() => {
                    window.location.href = url;
                }, 150);
            });
        }
    });

    document.getElementById("navRecipes").addEventListener("click", function(event) {
        event.preventDefault();
        openGeneralModal(`
            <div style="text-align: center;">
                <div style="font-size: 3rem; margin-bottom: 1rem;">🍳</div>
                <h3 style="color: #38a169; margin-bottom: 1rem;">Recipes Coming Soon!</h3>
                <p>We're working on an amazing recipe section. Stay tuned!</p>
            </div>
        `);
    });

    document.getElementById("navContactUs").addEventListener("click", function(event) {
        event.preventDefault();
        // Smooth scroll to top
        window.scrollTo({ top: 0, behavior: 'smooth' });
        openGeneralModal(`
            <div style="text-align: center;">
                <div style="font-size: 3rem; margin-bottom: 1rem;">📍</div>
                <h3 style="color: #38a169; margin-bottom: 1rem;">You're Already Here!</h3>
                <p>You're currently on the Contact Us page. Scroll down to send us a message!</p>
            </div>
        `);
    });

    // Enhanced footer interactions
    const footerLinks = {
        "footerContactUs": () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
            openGeneralModal("You're already on the Contact Us page!");
        },
        "footerPrivacyPolicy": () => openGeneralModal("Privacy Policy page coming soon!"),
        "footerTermsOfService": () => openGeneralModal("Terms of Service page coming soon!")
    };

    Object.entries(footerLinks).forEach(([id, handler]) => {
        const element = document.getElementById(id);
        if (element) {
            element.addEventListener("click", function(event) {
                event.preventDefault();
                handler();
            });
        }
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

    // Initialize enhanced features
    initializeFormValidation();
    initializeContactCards();
    initializeMapPlaceholder();

    // Welcome message with enhanced styling
    setTimeout(() => {
        window.FreshMartCommon.showToast('Welcome to FreshMart Contact! 📞', 'success', 3000);
    }, 500);
}

// Export for use in other modules
window.FreshMartContact = {
    openGeneralModal,
    closeGeneralModal,
    initializeContactPage,
    handleFormSubmission,
    FormValidator
};