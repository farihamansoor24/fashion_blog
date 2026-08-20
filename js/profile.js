import { 
  auth, 
  db, 
  onAuthStateChanged, 
  doc, 
  getDoc, 
  setDoc, // 👈 setDoc use karein
  serverTimestamp 
} from './firebase.js';

const profUsername = document.getElementById('profUsername');
const profEmail = document.getElementById('profEmail');
const profContact = document.getElementById('profContact');
const profCountry = document.getElementById('profCountry');
const profileForm = document.getElementById('profileForm');
const profAlert = document.getElementById('profAlert');
const profileAvatar = document.getElementById('profileAvatar');

let currentUser = null;

// 1. Auth Check & Data Load
onAuthStateChanged(auth, async (user) => {
  if (user) {
    currentUser = user;
    if (profEmail) profEmail.value = user.email;

    try {
      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        const data = userSnap.data();
        if (profUsername) profUsername.value = data.username || "";
        if (profContact) profContact.value = data.contact || "";
        if (profCountry) profCountry.value = data.country || "";

        if (profileAvatar && data.username) {
          profileAvatar.textContent = data.username.charAt(0).toUpperCase();
        }
      } else {
        // Fallback Name for Google User / New User
        const defaultName = user.displayName || user.email.split('@')[0];
        if (profUsername) profUsername.value = defaultName;
        if (profileAvatar) profileAvatar.textContent = defaultName.charAt(0).toUpperCase();
      }
    } catch (err) {
      console.error("Error fetching user details:", err);
    }
  } else {
    window.location.href = "auth.html";
  }
});

// 2. Profile Save Event Fix (Using setDoc + merge)
profileForm?.addEventListener('submit', async (e) => {
  e.preventDefault();

  if (!currentUser) return;

  const username = profUsername.value.trim();
  const contact = profContact.value.trim();
  const country = profCountry.value.trim();

  try {
    const userRef = doc(db, "users", currentUser.uid);

    // 🔴 setDoc with merge: true will create document if missing, or update if exists
    await setDoc(userRef, {
      username: username,
      email: currentUser.email,
      contact: contact,
      country: country,
      updatedAt: serverTimestamp()
    }, { merge: true });

    showAlert("Profile updated successfully!", "success");

    setTimeout(() => {
      window.location.href = "index.html";
    }, 1200);

  } catch (err) {
    console.error("Error updating profile:", err);
    showAlert("Failed to update profile: " + err.message, "error");
  }
});

function showAlert(message, type) {
  if (!profAlert) return;
  profAlert.textContent = message;
  profAlert.classList.remove("hidden", "bg-emerald-50", "text-emerald-600", "border-emerald-200", "bg-rose-50", "text-rose-600", "border-rose-200");

  if (type === "success") {
    profAlert.classList.add("bg-emerald-50", "text-emerald-600", "border-emerald-200");
  } else {
    profAlert.classList.add("bg-rose-50", "text-rose-600", "border-rose-200");
  }
}