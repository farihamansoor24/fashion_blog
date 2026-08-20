import { auth,onAuthStateChanged,signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, signOut, GoogleAuthProvider, signInWithPopup } from './firebase.js';


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

// export function initAuth(userCallback) {

//   // Sync Auth State
//   onAuthStateChanged(auth, (user) => {
//     const navAuthBtns = document.getElementById("navAuthBtns");
// const navUserMenu = document.getElementById("navUserMenu");
// const userEmail = document.getElementById("userEmail");
//     if (user) {
//       // Logged In: Guest buttons chupayein aur User Menu flex dikhayein
//       if (navAuthBtns) navAuthBtns.classList.add("hidden");
//       if (navUserMenu) {
//         navUserMenu.classList.remove("hidden");
//         navUserMenu.classList.add("flex");
//       }
//       if (userEmail) userEmail.textContent = user.email;
//     } else {
//       // Logged Out: User Menu chupayein aur Guest buttons dikhayein
//       if (navUserMenu) {
//         navUserMenu.classList.add("hidden");
//         navUserMenu.classList.remove("flex");
//       }
//       if (navAuthBtns) navAuthBtns.classList.remove("hidden");
//     }
//   });
// }

export function initAuth(userCallback) {

  // Sync Auth State
  onAuthStateChanged(auth, (user) => {
    const navAuthBtns = document.getElementById("navAuthBtns");
    const navUserMenu = document.getElementById("navUserMenu");
    const userEmail = document.getElementById("userEmail");

    if (user) {
      // Logged In: Guest buttons chupayein aur User Menu flex dikhayein
      if (navAuthBtns) navAuthBtns.classList.add("hidden");
      if (navUserMenu) {
        navUserMenu.classList.remove("hidden");
        navUserMenu.classList.add("flex");
      }
      if (userEmail) userEmail.textContent = user.email;
    } else {
      // Logged Out: User Menu chupayein aur Guest buttons dikhayein
      if (navUserMenu) {
        navUserMenu.classList.add("hidden");
        navUserMenu.classList.remove("flex");
      }
      if (navAuthBtns) navAuthBtns.classList.remove("hidden");
    }

    // 🔴 CRITICAL FIX: userCallback ko call karein taaki main.js ke posts render ho sakein!
    if (typeof userCallback === 'function') {
      userCallback(user);
    }
  });
}
let isLoginMode = true;

const urlParams = new URLSearchParams(window.location.search);
if (urlParams.get('mode') === 'signup') {
  setMode(false);
}

const loginTab = document.getElementById("loginTab");
const signupTab = document.getElementById("signupTab");
const authForm = document.getElementById("authForm");
const authSubmitBtn = document.getElementById("authSubmitBtn");
const authSubtitle = document.getElementById("authSubtitle");
const authError = document.getElementById("authError");

loginTab?.addEventListener("click", () => setMode(true));
signupTab?.addEventListener("click", () => setMode(false));

function setMode(login) {
  isLoginMode = login;
  authError.classList.add("hidden");

  if (login) {
    loginTab.className = "w-1/2 pb-3 border-b-2 border-black text-black";
    signupTab.className = "w-1/2 pb-3 border-b-2 border-transparent text-slate-400";
    authSubmitBtn.textContent = "Log In";
    authSubtitle.textContent = "Welcome Back";
  } else {
    signupTab.className = "w-1/2 pb-3 border-b-2 border-black text-black";
    loginTab.className = "w-1/2 pb-3 border-b-2 border-transparent text-slate-400";
    authSubmitBtn.textContent = "Create Account";
    authSubtitle.textContent = "Join Luxe Club";
  }
}

authForm?.addEventListener("submit", async (e) => {
  e.preventDefault();
  authError.classList.add("hidden");

  const email = document.getElementById("authEmail").value;
  const password = document.getElementById("authPassword").value;

  try {
    if (isLoginMode) {
      await signInWithEmailAndPassword(auth, email, password);
    } else {
      await createUserWithEmailAndPassword(auth, email, password);
    }
    // Success - Redirect to home
    window.location.href = "index.html";
  } catch (err) {
    authError.textContent = "Email ID already in use!";
    authError.classList.remove("hidden");
  }
});

// ----------- Logout functionality
   const logoutBtn = document.getElementById("logoutBtn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => signOut(auth));
  }
