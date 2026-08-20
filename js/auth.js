import { 
  auth, 
  db, 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  GoogleAuthProvider, 
  signInWithPopup, 
  doc, 
  setDoc, 
  serverTimestamp ,
  sendPasswordResetEmail
} from './firebase.js';


// Random Profile Images List
const avatarImages = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&auto=format&fit=crop&q=80'
];


// Google Login Handler
const googleAuthBtn = document.getElementById("googleAuthBtn");
if (googleAuthBtn) {
  googleAuthBtn.addEventListener("click", async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      window.location.href = "index.html";
    } catch (err) {
      const authError = document.getElementById("authError");
      if (authError) {
        authError.textContent = err.message;
        authError.classList.remove("hidden");
      }
    }
  });
}


// DOM Elements
const openForgotModal = document.getElementById("openForgotModal");
const closeForgotModal = document.getElementById("closeForgotModal");
const cancelForgotBtn = document.getElementById("cancelForgotBtn");
const forgotModal = document.getElementById("forgotModal");
const forgotForm = document.getElementById("forgotForm");
const forgotEmail = document.getElementById("forgotEmail");
const forgotAlert = document.getElementById("forgotAlert");


// Auth State Listener
export function initAuth(userCallback) {
  onAuthStateChanged(auth, (user) => {
    const navAuthBtns = document.getElementById("navAuthBtns");
    const navUserMenu = document.getElementById("navUserMenu");
     const navLinks = document.getElementById("navLinks");
    const userName = document.getElementById("userName");
    const userEmail = document.getElementById("userEmail");
    const userAvatar = document.getElementById("userAvatar");

    if (user) {
      if(navLinks){
        navLinks.classList.add("md:flex");
        navLinks.classList.remove("hidden");
      }
      if (navAuthBtns) navAuthBtns.classList.add("hidden");
      //  Random Image Set Karein
      if (userAvatar) {
        const randomImg = avatarImages[Math.floor(Math.random() * avatarImages.length)];
        userAvatar.innerHTML = `<img src="${randomImg}" alt="Avatar" class="w-full h-full object-cover rounded-full">`;
      }
      if (navUserMenu) {
        navUserMenu.classList.remove("hidden");
        navUserMenu.classList.add("flex");
      }
      if (userName) userName.textContent = user.displayName || user.email.split('@')[0];
    } else {
      if (navUserMenu) {
        navUserMenu.classList.add("hidden");
        navUserMenu.classList.remove("flex");
      }
      if (navAuthBtns) navAuthBtns.classList.remove("hidden");
    }

    if (typeof userCallback === 'function') {
      userCallback(user);
    }
  });
}

// Tab Switching & Mode Setup
let isLoginMode = true;

const loginTab = document.getElementById("loginTab");
const signupTab = document.getElementById("signupTab");
const authForm = document.getElementById("authForm");
const authSubmitBtn = document.getElementById("authSubmitBtn");
const authSubtitle = document.getElementById("authSubtitle");
const authError = document.getElementById("authError");
const btnSpinner = document.getElementById('btnSpinner');
const btnText = document.getElementById('btnText');
const urlParams = new URLSearchParams(window.location.search);
if (urlParams.get('mode') === 'signup') {
  setMode(false);
}


// Helper: Show/Hide Loader State
function setLoading(isLoading) { 
  if (isLoading) {
    authSubmitBtn.disabled = true;
    authSubmitBtn.classList.add('opacity-70', 'cursor-not-allowed');
    btnSpinner?.classList.remove('hidden');
    if(btnText)btnText.textContent = "Processing...";
  } else {
    authSubmitBtn.disabled = false;
    authSubmitBtn.classList.remove('opacity-70', 'cursor-not-allowed');
    btnSpinner?.classList.add('hidden');
     if(btnText)btnText.textContent = "Login";
  }
}
loginTab?.addEventListener("click", () => setMode(true));
signupTab?.addEventListener("click", () => setMode(false));

function setMode(login) {
  isLoginMode = login;
  if (authError) authError.classList.add("hidden");

  const usernameGroup = document.getElementById('usernameGroup');
  const contactGroup = document.getElementById('contactGroup');
  const countryGroup = document.getElementById('countryGroup');

  if (login) {
    if (loginTab) loginTab.className = "w-1/2 pb-3 border-b-2 border-black text-black font-bold";
    if (signupTab) signupTab.className = "w-1/2 pb-3 border-b-2 border-transparent text-slate-400";
    if (authSubmitBtn) authSubmitBtn.textContent = "Log In";
    if (authSubtitle) authSubtitle.textContent = "Welcome Back";

    // Hide extra signup fields
    usernameGroup?.classList.add('hidden');
    contactGroup?.classList.add('hidden');
    countryGroup?.classList.add('hidden');
  } else {
    if (signupTab) signupTab.className = "w-1/2 pb-3 border-b-2 border-black text-black font-bold";
    if (loginTab) loginTab.className = "w-1/2 pb-3 border-b-2 border-transparent text-slate-400";
    if (authSubmitBtn) authSubmitBtn.textContent = "Create Account";
    if (authSubtitle) authSubtitle.textContent = "Join Luxe Club";

    // Show extra signup fields
    usernameGroup?.classList.remove('hidden');
    contactGroup?.classList.remove('hidden');
    countryGroup?.classList.remove('hidden');
  }
}

// Form Submit Handler
authForm?.addEventListener("submit", async (e) => {
  e.preventDefault();

  if (authError) authError.classList.add("hidden");

  const email = document.getElementById("authEmail")?.value.trim();
  const password = document.getElementById("authPassword")?.value;
  const username = document.getElementById("authUsername")?.value.trim();
  const contact = document.getElementById("authContact")?.value.trim();
  const country = document.getElementById("authCountry")?.value.trim();

  try {
      // 1. Loader Start Karein
  setLoading(true);
    if (isLoginMode) {
      // LOG IN
      await signInWithEmailAndPassword(auth, email, password);
    } else {
      // SIGN UP
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      await setDoc(doc(db, "users", user.uid), {
        username: username || "",
        email: email,
        contact: contact || "",
        country: country || "",
        createdAt: serverTimestamp()
      });
    }

    // Success - Redirect to home page
    window.location.href = "index.html";

  } catch (err) {
    if (authError) {
      authError.textContent = err.message;
      authError.classList.remove("hidden");
    }
  }
  finally {
    // 4. Loader Stop Karein
    setLoading(false);
  }
});
// Modal Show/Hide Handlers
openForgotModal?.addEventListener("click", () => {
  forgotModal?.classList.remove("hidden");
  forgotModal?.classList.add("flex");
});

const hideModal = () => {
  forgotModal?.classList.add("hidden");
  forgotModal?.classList.remove("flex");
  if (forgotAlert) forgotAlert.classList.add("hidden");
  if (forgotForm) forgotForm.reset();
};

closeForgotModal?.addEventListener("click", hideModal);
cancelForgotBtn?.addEventListener("click", hideModal);

// Password Reset Email Send Logic
forgotForm?.addEventListener("submit", async (e) => {
  e.preventDefault();
  const email = forgotEmail.value.trim();

  if (!email) return;

  try {
    await sendPasswordResetEmail(auth, email);
    
    showForgotAlert("Password reset email sent! Check your inbox.", "success");
    
    setTimeout(() => {
      hideModal();
    }, 2500);

  } catch (error) {
    console.error("Reset Password Error:", error);
    let msg = "Failed to send reset email.";
    if (error.code === 'auth/user-not-found') {
      msg = "No account found with this email.";
    } else if (error.code === 'auth/invalid-email') {
      msg = "Please enter a valid email address.";
    }
    showForgotAlert(msg, "error");
  }
});

function showForgotAlert(message, type) {
  if (!forgotAlert) return;
  forgotAlert.textContent = message;
  forgotAlert.classList.remove("hidden", "bg-emerald-50", "text-emerald-600", "border-emerald-200", "bg-rose-50", "text-rose-600", "border-rose-200");

  if (type === "success") {
    forgotAlert.classList.add("bg-emerald-50", "text-emerald-600", "border-emerald-200");
  } else {
    forgotAlert.classList.add("bg-rose-50", "text-rose-600", "border-rose-200");
  }
}
// Logout Handler
const logoutBtn = document.getElementById("logoutBtn");
if (logoutBtn) {
  logoutBtn.addEventListener("click", () => signOut(auth));
}