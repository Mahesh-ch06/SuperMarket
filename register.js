import { initializeApp } from "https://www.gstatic.com/firebasejs/11.8.1/firebase-app.js";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  RecaptchaVerifier,
  signInWithPhoneNumber
} from "https://www.gstatic.com/firebasejs/11.8.1/firebase-auth.js";

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyD1iij4QWlxQJJPS-yJrhSiCS79kS4dqaM",
  authDomain: "portfolio-56be7.firebaseapp.com",
  projectId: "portfolio-56be7",
  storageBucket: "portfolio-56be7.firebasestorage.app",
  messagingSenderId: "888511551571",
  appId: "1:888511551571:web:11e809e995377e9a4ccea6",
  measurementId: "G-X3CYL9YZR1"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Email Signup
document.getElementById('signupForm')?.addEventListener('submit', (e) => {
  e.preventDefault();
  const email = document.getElementById('signupEmail').value;
  const password = document.getElementById('signupPassword').value;

  createUserWithEmailAndPassword(auth, email, password)
    .then(() => {
      alert("Account created!");
      window.location.href = "https://mahesh06.me/chatbot/";
    })
    .catch((error) => {
      alert(error.message);
    });
});

// Email Login
document.getElementById('loginForm')?.addEventListener('submit', (e) => {
  e.preventDefault();
  const email = document.getElementById('loginEmail').value;
  const password = document.getElementById('loginPassword').value;

  signInWithEmailAndPassword(auth, email, password)
    .then(() => {
      alert("Logged in!");
      window.location.href = "https://mahesh06.me/chatbot/";
    })
    .catch((error) => {
      alert(error.message);
    });
});

// Google Login
document.getElementById('googleSignIn')?.addEventListener('click', () => {
  const provider = new GoogleAuthProvider();
  signInWithPopup(auth, provider)
    .then(() => {
      alert("Logged in with Google!");
      window.location.href = "https://mahesh06.me/chatbot/";
    })
    .catch((error) => {
      alert(error.message);
    });
});

// reCAPTCHA setup
window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
  'size': 'normal',
  'callback': (response) => {
    console.log("reCAPTCHA verified");
  },
  'expired-callback': () => {
    alert("reCAPTCHA expired, please try again.");
  }
});

// Phone Login - Send OTP
document.getElementById('sendOtp')?.addEventListener('click', () => {
  const phoneNumber = "+91" + document.getElementById('phoneNumber').value.trim();
  const appVerifier = window.recaptchaVerifier;

  signInWithPhoneNumber(auth, phoneNumber, appVerifier)
    .then((confirmationResult) => {
      window.confirmationResult = confirmationResult;
      alert("OTP sent");
    })
    .catch((error) => {
      alert(error.message);
    });
});

// Phone Login - Verify OTP
document.getElementById('verifyOtp')?.addEventListener('click', () => {
  const code = document.getElementById('otpCode').value.trim();

  if (!window.confirmationResult) {
    alert("Please request an OTP first.");
    return;
  }

  window.confirmationResult.confirm(code)
    .then(() => {
      alert("Phone login successful!");
      window.location.href = "https://mahesh06.me/chatbot/";
    })
    .catch((error) => {
      alert("Incorrect OTP: " + error.message);
    });
});
