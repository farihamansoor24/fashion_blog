
  // Import the functions you need from the SDKs you need
  import { initializeApp } from "https://www.gstatic.com/firebasejs/12.17.1/firebase-app.js";
  import { getAnalytics } from "https://www.gstatic.com/firebasejs/12.17.1/firebase-analytics.js";
  import { getFirestore, collection, query, orderBy, onSnapshot, doc, addDoc, updateDoc,getDoc, deleteDoc, serverTimestamp, where, getDocs } from "https://www.gstatic.com/firebasejs/12.17.1/firebase-firestore.js";
  import{ getAuth, onAuthStateChanged, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, GoogleAuthProvider, signInWithPopup } from "https://www.gstatic.com/firebasejs/12.17.1/firebase-auth.js";
  import { getStorage } from "https://www.gstatic.com/firebasejs/12.17.1/firebase-storage.js";
  // TODO: Add SDKs for Firebase products that you want to use
  // https://firebase.google.com/docs/web/setup#available-libraries

  // Your web app's Firebase configuration
  // For Firebase JS SDK v7.20.0 and later, measurementId is optional
  const firebaseConfig = {
    apiKey: "AIzaSyBldP4RDI565OM6VUIrYjkVKa--ei8Tln8",
    authDomain: "my-blogging-app-f951b.firebaseapp.com",
    projectId: "my-blogging-app-f951b",
    storageBucket: "my-blogging-app-f951b.firebasestorage.app",
    messagingSenderId: "710041075062",
    appId: "1:710041075062:web:abeeab1d38ee6eb8080e57",
    measurementId: "G-403QSMZWEN"
  };

  // Initialize Firebase
  const app = initializeApp(firebaseConfig);
  const analytics = getAnalytics(app);
  const db = getFirestore(app);
  const auth = getAuth(app);
  const storage = getStorage(app);
  export { app, analytics, db, auth , getAuth, onAuthStateChanged, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, collection, query, orderBy, onSnapshot,doc, addDoc,serverTimestamp, updateDoc, deleteDoc, getDoc, where, getDocs, GoogleAuthProvider, signInWithPopup,storage };
