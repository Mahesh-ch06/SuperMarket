// Login page specific JavaScript

// Password toggle function
function togglePassword(fieldId, button) {
    const field = document.getElementById(fieldId);
    const isPassword = field.type === 'password';
    field.type = isPassword ? 'text' : 'password';
    
    const icon = button.querySelector('svg');
    if (isPassword) {
        icon.innerHTML = `
            <path stroke-linecap="round" stroke-linejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
        `;
    } else {
        icon.innerHTML = `
            <path stroke-linecap="round" stroke-linejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
            <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        `;
    }
}

// Tab switching
function switchTab(tab) {
    const loginTab = document.getElementById('loginTab');
    const signupTab = document.getElementById('signupTab');
    const loginForm = document.getElementById('loginForm');
    const signupForm = document.getElementById('signupForm');
    
    if (tab === 'login') {
        loginTab.classList.add('active');
        signupTab.classList.remove('active');
        loginForm.classList.remove('hidden');
        loginForm.classList.add('active');
        signupForm.classList.add('hidden');
        signupForm.classList.remove('active');
    } else {
        signupTab.classList.add('active');
        loginTab.classList.remove('active');
        signupForm.classList.remove('hidden');
        signupForm.classList.add('active');
        loginForm.classList.add('hidden');
        loginForm.classList.remove('active');
    }
}

// Error handling
function showError(fieldId, message) {
    const errorElement = document.getElementById(fieldId + 'Error');
    if (errorElement) {
        errorElement.textContent = message;
        errorElement.classList.remove('hidden');
    }
}

function clearError(fieldId) {
    const errorElement = document.getElementById(fieldId + 'Error');
    if (errorElement) {
        errorElement.classList.add('hidden');
    }
}

function clearAllErrors() {
    document.querySelectorAll('[id$="Error"]').forEach(el => {
        el.classList.add('hidden');
    });
}

// Loading state
function setLoading(button, isLoading) {
    const span = button.querySelector('span');
    if (isLoading) {
        button.disabled = true;
        button.innerHTML = `
            <div class="spinner mr-2"></div>
            <span>Processing...</span>
        `;
    } else {
        button.disabled = false;
        button.innerHTML = `<span>${span.textContent}</span>`;
    }
}

// Validation
function validateEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validatePassword(password) {
    return password.length >= 6;
}

// Initialize login page
function initializeLoginPage() {
    const loginTab = document.getElementById('loginTab');
    const signupTab = document.getElementById('signupTab');
    const loginFormElement = document.getElementById('loginFormElement');
    const signupFormElement = document.getElementById('signupFormElement');
    const resetPasswordModal = document.getElementById('resetPasswordModal');
    const resetPasswordForm = document.getElementById('resetPasswordForm');
    const forgotPasswordBtn = document.getElementById('forgotPasswordBtn');
    const cancelResetBtn = document.getElementById('cancelResetBtn');
    const googleSignInBtn = document.getElementById('googleSignInBtn');
    const phoneSignInBtn = document.getElementById('phoneSignInBtn');

    // Tab switching
    loginTab.addEventListener('click', () => switchTab('login'));
    signupTab.addEventListener('click', () => switchTab('signup'));

    // Clear errors on input
    document.querySelectorAll('input').forEach(input => {
        input.addEventListener('input', () => {
            clearError(input.id);
        });
    });

    // Login form submission
    loginFormElement.addEventListener('submit', async (e) => {
        e.preventDefault();
        clearAllErrors();

        const email = document.getElementById('loginEmail').value.trim();
        const password = document.getElementById('loginPassword').value;
        const submitBtn = document.getElementById('loginSubmitBtn');

        // Validation
        if (!validateEmail(email)) {
            showError('loginEmail', 'Please enter a valid email address');
            return;
        }

        if (!validatePassword(password)) {
            showError('loginPassword', 'Password must be at least 6 characters');
            return;
        }

        setLoading(submitBtn, true);

        try {
            const { signInWithEmailAndPassword } = await import("https://www.gstatic.com/firebasejs/11.8.1/firebase-auth.js");
            const { getAuth } = await import("https://www.gstatic.com/firebasejs/11.8.1/firebase-auth.js");
            const { initializeApp } = await import("https://www.gstatic.com/firebasejs/11.8.1/firebase-app.js");
            
            // Get secure Firebase config from server
            const firebaseConfig = await window.FreshMartCommon.getFirebaseConfig();
            const app = initializeApp(firebaseConfig);
            const auth = getAuth(app);
            
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            window.FreshMartCommon.showToast('Login successful! Welcome back!', 'success');
            
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1500);
            
        } catch (error) {
            console.error('Login error:', error);
            let errorMessage = 'Login failed. Please try again.';
            
            switch (error.code) {
                case 'auth/user-not-found':
                case 'auth/wrong-password':
                case 'auth/invalid-credential':
                    errorMessage = 'Invalid email or password';
                    showError('loginEmail', errorMessage);
                    showError('loginPassword', errorMessage);
                    break;
                case 'auth/invalid-email':
                    errorMessage = 'Invalid email format';
                    showError('loginEmail', errorMessage);
                    break;
                case 'auth/too-many-requests':
                    errorMessage = 'Too many failed attempts. Please try again later.';
                    break;
                default:
                    errorMessage = error.message;
            }
            
            window.FreshMartCommon.showToast(errorMessage, 'error');
        } finally {
            setLoading(submitBtn, false);
        }
    });

    // Signup form submission
    signupFormElement.addEventListener('submit', async (e) => {
        e.preventDefault();
        clearAllErrors();

        const name = document.getElementById('signupName').value.trim();
        const email = document.getElementById('signupEmail').value.trim();
        const password = document.getElementById('signupPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        const agreeTerms = document.getElementById('agreeTerms').checked;
        const submitBtn = document.getElementById('signupSubmitBtn');

        // Validation
        if (!name) {
            showError('signupName', 'Full name is required');
            return;
        }

        if (!validateEmail(email)) {
            showError('signupEmail', 'Please enter a valid email address');
            return;
        }

        if (!validatePassword(password)) {
            showError('signupPassword', 'Password must be at least 6 characters');
            return;
        }

        if (password !== confirmPassword) {
            showError('confirmPassword', 'Passwords do not match');
            return;
        }

        if (!agreeTerms) {
            window.FreshMartCommon.showToast('Please agree to the Terms of Service and Privacy Policy', 'error');
            return;
        }

        setLoading(submitBtn, true);

        try {
            const { createUserWithEmailAndPassword, updateProfile, sendEmailVerification } = await import("https://www.gstatic.com/firebasejs/11.8.1/firebase-auth.js");
            const { getAuth } = await import("https://www.gstatic.com/firebasejs/11.8.1/firebase-auth.js");
            const { initializeApp } = await import("https://www.gstatic.com/firebasejs/11.8.1/firebase-app.js");
            
            // Get secure Firebase config from server
            const firebaseConfig = await window.FreshMartCommon.getFirebaseConfig();
            const app = initializeApp(firebaseConfig);
            const auth = getAuth(app);
            
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            
            // Update user profile with name
            await updateProfile(userCredential.user, {
                displayName: name
            });

            // Send email verification
            await sendEmailVerification(userCredential.user);
            
            window.FreshMartCommon.showToast('Account created successfully! Please check your email to verify your account.', 'success', 6000);
            
            // Switch to login tab
            setTimeout(() => {
                switchTab('login');
                signupFormElement.reset();
            }, 2000);
            
        } catch (error) {
            console.error('Signup error:', error);
            let errorMessage = 'Account creation failed. Please try again.';
            
            switch (error.code) {
                case 'auth/email-already-in-use':
                    errorMessage = 'An account with this email already exists';
                    showError('signupEmail', errorMessage);
                    break;
                case 'auth/invalid-email':
                    errorMessage = 'Invalid email format';
                    showError('signupEmail', errorMessage);
                    break;
                case 'auth/weak-password':
                    errorMessage = 'Password is too weak. Please choose a stronger password.';
                    showError('signupPassword', errorMessage);
                    break;
                default:
                    errorMessage = error.message;
            }
            
            window.FreshMartCommon.showToast(errorMessage, 'error');
        } finally {
            setLoading(submitBtn, false);
        }
    });

    // Google Sign In
    googleSignInBtn.addEventListener('click', async () => {
        setLoading(googleSignInBtn, true);
        
        try {
            const { signInWithPopup, GoogleAuthProvider } = await import("https://www.gstatic.com/firebasejs/11.8.1/firebase-auth.js");
            const { getAuth } = await import("https://www.gstatic.com/firebasejs/11.8.1/firebase-auth.js");
            const { initializeApp } = await import("https://www.gstatic.com/firebasejs/11.8.1/firebase-app.js");
            
            // Get secure Firebase config from server
            const firebaseConfig = await window.FreshMartCommon.getFirebaseConfig();
            const app = initializeApp(firebaseConfig);
            const auth = getAuth(app);
            const googleProvider = new GoogleAuthProvider();
            
            const result = await signInWithPopup(auth, googleProvider);
            window.FreshMartCommon.showToast(`Welcome ${result.user.displayName}!`, 'success');
            
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1500);
            
        } catch (error) {
            console.error('Google sign-in error:', error);
            let errorMessage = 'Google sign-in failed. Please try again.';
            
            if (error.code === 'auth/popup-closed-by-user') {
                errorMessage = 'Sign-in cancelled';
            } else if (error.code === 'auth/network-request-failed') {
                errorMessage = 'Network error. Please check your connection.';
            }
            
            window.FreshMartCommon.showToast(errorMessage, 'error');
        } finally {
            setLoading(googleSignInBtn, false);
        }
    });

    // Phone Sign In
    phoneSignInBtn.addEventListener('click', () => {
        window.location.href = 'phone-auth.html';
    });

    // Forgot Password
    forgotPasswordBtn.addEventListener('click', () => {
        resetPasswordModal.classList.remove('hidden');
    });

    cancelResetBtn.addEventListener('click', () => {
        resetPasswordModal.classList.add('hidden');
        document.getElementById('resetEmail').value = '';
        clearError('resetEmail');
    });

    // Reset Password Form
    resetPasswordForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        clearError('resetEmail');

        const email = document.getElementById('resetEmail').value.trim();
        const submitBtn = document.getElementById('resetSubmitBtn');

        if (!validateEmail(email)) {
            showError('resetEmail', 'Please enter a valid email address');
            return;
        }

        setLoading(submitBtn, true);

        try {
            const { sendPasswordResetEmail } = await import("https://www.gstatic.com/firebasejs/11.8.1/firebase-auth.js");
            const { getAuth } = await import("https://www.gstatic.com/firebasejs/11.8.1/firebase-auth.js");
            const { initializeApp } = await import("https://www.gstatic.com/firebasejs/11.8.1/firebase-app.js");
            
            // Get secure Firebase config from server
            const firebaseConfig = await window.FreshMartCommon.getFirebaseConfig();
            const app = initializeApp(firebaseConfig);
            const auth = getAuth(app);
            
            await sendPasswordResetEmail(auth, email);
            window.FreshMartCommon.showToast('Password reset email sent! Please check your inbox.', 'success', 6000);
            resetPasswordModal.classList.add('hidden');
            document.getElementById('resetEmail').value = '';
            
        } catch (error) {
            console.error('Password reset error:', error);
            let errorMessage = 'Failed to send reset email. Please try again.';
            
            if (error.code === 'auth/user-not-found') {
                errorMessage = 'No account found with this email address';
                showError('resetEmail', errorMessage);
            } else if (error.code === 'auth/invalid-email') {
                errorMessage = 'Invalid email format';
                showError('resetEmail', errorMessage);
            }
            
            window.FreshMartCommon.showToast(errorMessage, 'error');
        } finally {
            setLoading(submitBtn, false);
        }
    });

    // Close modal when clicking outside
    resetPasswordModal.addEventListener('click', (e) => {
        if (e.target === resetPasswordModal) {
            resetPasswordModal.classList.add('hidden');
        }
    });

    // Check if user is already logged in
    (async () => {
        try {
            const { onAuthStateChanged, getAuth } = await import("https://www.gstatic.com/firebasejs/11.8.1/firebase-auth.js");
            const { initializeApp } = await import("https://www.gstatic.com/firebasejs/11.8.1/firebase-app.js");
            
            // Get secure Firebase config from server
            const firebaseConfig = await window.FreshMartCommon.getFirebaseConfig();
            const app = initializeApp(firebaseConfig);
            const auth = getAuth(app);
            
            onAuthStateChanged(auth, (user) => {
                if (user && user.emailVerified) {
                    window.location.href = 'index.html';
                }
            });
        } catch (error) {
            console.error('Auth state check error:', error);
        }
    })();

    window.FreshMartCommon.showToast('Welcome to FreshMart! Please sign in to continue.', 'info', 3000);
}

// Make togglePassword globally available
window.togglePassword = togglePassword;

// Export for use in other modules
window.FreshMartLogin = {
    togglePassword,
    switchTab,
    showError,
    clearError,
    clearAllErrors,
    setLoading,
    validateEmail,
    validatePassword,
    initializeLoginPage
};