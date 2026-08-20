import { db, doc, getDoc, updateDoc, collection, addDoc, serverTimestamp,storage } from './firebase.js';
import { uploadToCloudinary } from './cloudinary.js';
import { initAuth } from './auth.js';
const editorForm = document.getElementById('editorForm');
const postTitle = document.getElementById('postTitle');
const postContent = document.getElementById('postContent');
const editPostIdInput = document.getElementById('editPostId');
const postImageFile = document.getElementById('postImageFile');
const submitBtn = document.getElementById('submitBtn');
const btnText = document.getElementById('btnText');
let currentUser = null;
// 1. URL se Edit Post ID nikalein
const urlParams = new URLSearchParams(window.location.search);
const editPostId = urlParams.get('edit');
// Auth Check: Directs non-logged-in users to auth.html
initAuth((user) => {
  if (!user) {
    window.location.href = "auth.html";
  } else {
    currentUser = user;
    loadPostDataForEdit();
  }
});
// 2. Agar Edit ID majood hai, toh Purana Data Fetch Karke Form Fill Karein
if (editPostId) {
  loadPostDataForEdit();
}



// 3. Form Submit Logic (Create + Edit Dono Handle Karega)
editorForm?.addEventListener('submit', async (e) => {
  e.preventDefault();
 const statusTxt = document.getElementById("uploadStatus");
  const id = editPostIdInput ? editPostIdInput.value : null;
  const title = postTitle.value.trim();
  const content = postContent.value.trim();
  const file = postImageFile.files[0]; // User dwara chuni gayi nayi file
  let finalImageUrl = document.getElementById('imagePreview').src || ''; // Default: jo preview mein hai
  try {
    // 1. Agar user ne Nayi Image File Select ki hai, toh pehle usse Upload karein
    if (file) {
        // finalImageUrl = await getDownloadURL(uploadTask.ref); // Naya uploaded URL
      finalImageUrl = await uploadToCloudinary(postImageFile.files[0]); // Cloudinary se URL lein
    }
    if (id) {
      // UPDATE EXISTING POST
      const docRef = doc(db, "fashion_posts", id);
      await updateDoc(docRef, {
        title: title,
        content: content,
        imageUrl: finalImageUrl, // Updated Image URL
        updatedAt: serverTimestamp()
      });
      alert("Story updated successfully!");
      // Redirect back to journal/home page
    window.location.href = "index.html";
    } else {
      // CREATE NEW POST
      await addDoc(collection(db, "fashion_posts"), {
        title:title,
         imageUrl: finalImageUrl,
         content:content,
         comments: [],
         authorId: currentUser.uid,
         authorEmail: currentUser.email,
         authorName: currentUser.displayName || "Unknown User",
         authorAvatar: currentUser.photoURL || "",
         createdAt: serverTimestamp()
      });
      alert("Story published successfully!");
    }

    // Index page par wapas le jayein
    window.location.href = "index.html";

  } catch (err) {
    console.log(err);
    // alert("Error saving story: " + err.message);
  } finally {
    if (statusTxt) statusTxt.classList.add("hidden");
  }
});
async function loadPostDataForEdit() {
  const id = editPostId;
  if (!id) return;
  try {
    // Firestore Collection Name Confirm Karein ('posts' ya 'fashion_posts')
    const docRef = doc(db, "fashion_posts", id); 
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      
      // Form Inputs fill karein
      if (postTitle) postTitle.value = data.title || "";
      if (postContent) postContent.value = data.content || "";
      if (editPostIdInput) editPostIdInput.value = id;
      // editor.js ke loadPostDataForEdit function mein:
// editor.js
if (data.imageUrl) {
  const imagePreview = document.getElementById('imagePreview');
  const previewContainer = document.getElementById('previewContainer');
  const uploadDropzone = document.getElementById('uploadDropzone');

  if (imagePreview && previewContainer && uploadDropzone) {
    imagePreview.src = data.imageUrl;
    previewContainer.classList.remove('hidden'); // Preview dikhayein
    uploadDropzone.classList.add('hidden');       // 🔴 Dashed Box Ko Hide Karein
  }
}
      // Button ka Text Change Karein
      if (btnText) btnText.textContent = "Update Story";
    } else {
      alert("Article nahi mila!");
    }
  } catch (err) {
    console.error("Error loading post for edit:", err);
  }
}