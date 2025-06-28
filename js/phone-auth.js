// Phone authentication page specific JavaScript

// Initialize Firebase and reCAPTCHA
let app, auth, recaptchaVerifier, confirmationResult;
let countdownTimer = null;

// Debug helper
function updateDebugInfo(message) {
    const debugInfo = document.getElementById('debugInfo');
    if (debugInfo) {
        debugInfo.textContent = message;
    }
    console.log(message);
}

// Loading state
function setLoading(button, isLoading, originalText) {
    if (isLoading) {
        button.disabled = true;
        button.innerHTML = `
            <div class="spinner mr-2"></div>
            <span>Processing...</span>
        `;
    } else {
        button.disabled = false;
        button.innerHTML = `<span>${originalText}</span>`;
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

// Phone number validation
function isValidIndianPhone(phone) {
    return /^[6-9]\d{9}$/.test(phone);
}

// Step navigation
function goToStep(stepNumber) {
    const phoneStep = document.getElementById('phoneStep');
    const otpStep = document.getElementById('otpStep');
    const step1 = document.getElementById('step1');
    const step2 = document.getElementById('step2');
    const line1 = document.getElementById('line1');
    
    if (stepNumber === 1) {
        phoneStep.classList.remove('hidden');
        phoneStep.classList.add('active');
        otpStep.classList.add('hidden');
        otpStep.classList.remove('active');
        
        step1.classList.add('active');
        step1.classList.remove('completed');
        step2.classList.remove('active');
        line1.classList.remove('completed');
    } else if (stepNumber === 2) {
        phoneStep.classList.add('hidden');
        phoneStep.classList.remove('active');
        otpStep.classList.remove('hidden');
        otpStep.classList.add('active');
        
        step1.classList.remove('active');
        step1.classList.add('completed');
        step2.classList.add('active');
        line1.classList.add('completed');
    }
}

// Countdown timer
function startCountdown() {
    let seconds = 30;
    const resendOtpBtn = document.getElementById('resendOtpBtn');
    const countdown = document.getElementById('countdown');
    
    resendOtpBtn.disabled = true;
    
    countdownTimer = setInterval(() => {
        countdown.textContent = seconds;
        seconds--;
        
        if (seconds < 0) {
            clearInterval(countdownTimer);
            resendOtpBtn.disabled = false;
            resendOtpBtn.innerHTML = 'Resend OTP';
        }
    }, 1000);
}

// Initialize Firebase and reCAPTCHA
async function initializeFirebase() {
    try {
        const { initializeApp } = await import("https://www.gstatic.com/firebasejs/11.8.1/firebase-app.js");
        const { getAuth } = await import("https://www.gstatic.com/firebasejs/11.8.1/firebase-auth.js");
        
        // Get secure Firebase config from server
        const firebaseConfig = await window.FreshMartCommon.getFirebaseConfig();
        app = initializeApp(firebaseConfig);
        auth = getAuth(app);
        updateDebugInfo("Firebase initialized successfully");
        
        // Initialize reCAPTCHA
        setTimeout(initRecaptcha, 100);
        
    } catch (error) {
        updateDebugInfo("Firebase initialization error: " + error.message);
        window.FreshMartCommon.showToast('Failed to initialize authentication system', 'error');
    }
}

// Initialize reCAPTCHA
async function initRecaptcha() {
    try {
        const { RecaptchaVerifier } = await import("https://www.gstatic.com/firebasejs/11.8.1/firebase-auth.js");
        
        if (recaptchaVerifier) {
            recaptchaVerifier.clear();
        }
        
        recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
            'size': 'normal',
            'callback': (response) => {
                updateDebugInfo('reCAPTCHA solved - ready to send OTP');
                document.getElementById('sendOtpBtn').disabled = false;
            },
            'expired-callback': () => {
                updateDebugInfo('reCAPTCHA expired - please verify again');
                document.getElementById('sendOtpBtn').disabled = true;
                window.FreshMartCommon.showToast("reCAPTCHA expired, please verify again", 'error');
            }
        });

        recaptchaVerifier.render().then(widgetId => {
            updateDebugInfo('reCAPTCHA widget rendered successfully');
            window.recaptchaWidgetId = widgetId;
        }).catch(error => {
            updateDebugInfo('reCAPTCHA render error: ' + error.message);
            window.FreshMartCommon.showToast('reCAPTCHA failed to load: ' + error.message, 'error');
        });

    } catch (error) {
        updateDebugInfo('reCAPTCHA setup error: ' + error.message);
        window.FreshMartCommon.showToast('reCAPTCHA setup failed: ' + error.message, 'error');
    }
}

// Send OTP
async function sendOTP() {
    const phoneNumber = document.getElementById('phoneNumber');
    const sendOtpBtn = document.getElementById('sendOtpBtn');
    const displayPhoneNumber = document.getElementById('displayPhoneNumber');
    const otp = document.getElementById('otp');
    const verifyOtpBtn = document.getElementById('verifyOtpBtn');
    
    const phone = phoneNumber.value.trim();
    clearError('phone');

    if (!isValidIndianPhone(phone)) {
        showError('phone', 'Please enter a valid 10-digit Indian mobile number starting with 6-9');
        phoneNumber.focus();
        return;
    }

    if (!recaptchaVerifier) {
        window.FreshMartCommon.showToast("reCAPTCHA not ready. Please refresh the page.", 'error');
        return;
    }

    const fullPhoneNumber = "+91" + phone;
    updateDebugInfo(`Sending OTP to ${fullPhoneNumber}...`);
    setLoading(sendOtpBtn, true, 'Send OTP');

    try {
        const { signInWithPhoneNumber } = await import("https://www.gstatic.com/firebasejs/11.8.1/firebase-auth.js");
        
        const result = await signInWithPhoneNumber(auth, fullPhoneNumber, recaptchaVerifier);
        confirmationResult = result;
        
        updateDebugInfo("OTP sent successfully!");
        window.FreshMartCommon.showToast("OTP sent successfully!", 'success');
        
        // Update display and move to step 2
        displayPhoneNumber.textContent = `+91 ${phone}`;
        goToStep(2);
        startCountdown();
        verifyOtpBtn.disabled = false;
        otp.focus();
        
    } catch (error) {
        updateDebugInfo("OTP send error: " + error.message);
        window.FreshMartCommon.showToast("Error sending OTP: " + error.message, 'error');
        
        // Reset reCAPTCHA on error
        if (window.grecaptcha && window.recaptchaWidgetId !== undefined) {
            try {
                grecaptcha.reset(window.recaptchaWidgetId);
                sendOtpBtn.disabled = true;
            } catch (e) {
                console.log("Failed to reset reCAPTCHA:", e);
            }
        }
    } finally {
        setLoading(sendOtpBtn, false, 'Send OTP');
    }
}

// Verify OTP
async function verifyOTP() {
    const otp = document.getElementById('otp');
    const verifyOtpBtn = document.getElementById('verifyOtpBtn');
    
    const otpValue = otp.value.trim();
    clearError('otp');

    if (otpValue.length !== 6 || !/^\d{6}$/.test(otpValue)) {
        showError('otp', 'Please enter a valid 6-digit OTP');
        otp.focus();
        return;
    }

    if (!confirmationResult) {
        window.FreshMartCommon.showToast("Please send OTP first", 'error');
        goToStep(1);
        return;
    }

    updateDebugInfo("Verifying OTP...");
    setLoading(verifyOtpBtn, true, 'Verify & Sign In');

    try {
        const result = await confirmationResult.confirm(otpValue);
        updateDebugInfo("Phone login successful!");
        window.FreshMartCommon.showToast("Phone verification successful! Welcome to FreshMart!", 'success');
        
        // Redirect after success
        setTimeout(() => {
            window.location.href = "index.html";
        }, 1500);
        
    } catch (error) {
        updateDebugInfo("OTP verification error: " + error.message);
        showError('otp', 'Incorrect OTP. Please try again.');
        window.FreshMartCommon.showToast("Incorrect OTP or verification failed!", 'error');
        otp.value = '';
        otp.focus();
    } finally {
        setLoading(verifyOtpBtn, false, 'Verify & Sign In');
    }
}

// Initialize phone auth page
function initializePhoneAuthPage() {
    const phoneForm = document.getElementById('phoneForm');
    const otpForm = document.getElementById('otpForm');
    const phoneNumber = document.getElementById('phoneNumber');
    const otp = document.getElementById('otp');
    const resendOtpBtn = document.getElementById('resendOtpBtn');
    const changeNumberBtn = document.getElementById('changeNumberBtn');
    const backBtn = document.getElementById('backBtn');

    // Event Listeners
    phoneForm.addEventListener('submit', (e) => {
        e.preventDefault();
        sendOTP();
    });

    otpForm.addEventListener('submit', (e) => {
        e.preventDefault();
        verifyOTP();
    });

    // Phone number input formatting
    phoneNumber.addEventListener('input', (e) => {
        clearError('phone');
        // Remove any non-digit characters
        e.target.value = e.target.value.replace(/\D/g, '');
    });

    // OTP input formatting
    otp.addEventListener('input', (e) => {
        clearError('otp');
        // Remove any non-digit characters
        e.target.value = e.target.value.replace(/\D/g, '');
        
        // Auto-submit when 6 digits are entered
        if (e.target.value.length === 6) {
            setTimeout(() => verifyOTP(), 500);
        }
    });

    // Resend OTP
    resendOtpBtn.addEventListener('click', () => {
        if (countdownTimer) {
            clearInterval(countdownTimer);
        }
        goToStep(1);
        initRecaptcha();
        window.FreshMartCommon.showToast("Please complete reCAPTCHA verification again", 'info');
    });

    // Change number
    changeNumberBtn.addEventListener('click', () => {
        if (countdownTimer) {
            clearInterval(countdownTimer);
        }
        goToStep(1);
        phoneNumber.focus();
    });

    // Back button
    backBtn.addEventListener('click', () => {
        window.location.href = "login.html";
    });

    // Initialize Firebase
    initializeFirebase();
    window.FreshMartCommon.showToast('Enter your phone number to get started', 'info', 3000);
}

// Export for use in other modules
window.FreshMartPhoneAuth = {
    updateDebugInfo,
    setLoading,
    showError,
    clearError,
    isValidIndianPhone,
    goToStep,
    startCountdown,
    initializeFirebase,
    initRecaptcha,
    sendOTP,
    verifyOTP,
    initializePhoneAuthPage
};