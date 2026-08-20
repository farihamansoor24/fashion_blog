import { db, collection, query, where, getDocs, addDoc, deleteDoc, doc, getDoc } from './firebase.js';
import { initAuth } from './auth.js';

const savedContainer = document.getElementById("savedContainer");
const loadingState = document.getElementById("loadingState");
const emptyState = document.getElementById("emptyState");

let currentUser = null;

// Auth Sync: Keeps track of current logged-in user
initAuth((user) => {
  currentUser = user;
  if (savedContainer) {
    if (user) {
      loadUserSavedPosts(user.uid);
    } else {
      if (loadingState) loadingState.classList.add("hidden");
      if (emptyState) {
        emptyState.classList.remove("hidden");
        const msg = emptyState.querySelector("p");
        if (msg) msg.textContent = "Please log in to view your saved stories.";
      }
    }
  }
});

// 1. Exported Toggle Bookmark Function
export async function toggleSavePost(postId) {
  if (!currentUser) {
    alert("Please log in to save articles.");
    window.location.href = "auth.html";
    return false;
  }

  const userId = currentUser.uid;
  const bookmarksRef = collection(db, "bookmarks");

  try {
    // Check if already bookmarked
    const q = query(bookmarksRef, where("userId", "==", userId), where("postId", "==", postId));
    const querySnap = await getDocs(q);

    if (!querySnap.empty) {
      // Already saved -> Remove bookmark
      const bookmarkDocId = querySnap.docs[0].id;
      await deleteDoc(doc(db, "bookmarks", bookmarkDocId));
      return false; // Unsaved
    } else {
      // Not saved -> Add bookmark with userId & postId
      await addDoc(bookmarksRef, {
        userId: userId,
        postId: postId,
        savedAt: new Date()
      });
      return true; // Saved
    }
  } catch (err) {
    console.error("Error toggling bookmark:", err);
    throw err;
  }
}

// 2. Fetch User's Saved Posts List
async function loadUserSavedPosts(userId) {
  if (!loadingState || !emptyState || !savedContainer) return;

  loadingState.classList.remove("hidden");
  emptyState.classList.add("hidden");
  savedContainer.innerHTML = "";

  try {
    const q = query(collection(db, "bookmarks"), where("userId", "==", userId));
    const bookmarkSnap = await getDocs(q);

 // Agar user ka koi saved bookmark nahi milta
    if (bookmarkSnap.empty) {
      loadingState.classList.add("hidden");
      emptyState.classList.remove("hidden"); // Message container show karein
      const msg = emptyState.querySelector("p");
      if (msg) msg.textContent = "You haven't saved any stories yet.";
      return;
    }
    // Bookmarks fetch aur render karne ki loop
    let validPostsCount = 0;
    for (const bookmarkDoc of bookmarkSnap.docs) {
      const postId = bookmarkDoc.data().postId;
      const postRef = doc(db, "fashion_posts", postId);
      const postSnap = await getDoc(postRef);

     if (postSnap.exists()) {
        renderSavedCard({ id: postSnap.id, ...postSnap.data() }, bookmarkDoc.id);
        validPostsCount++;
      }
    }
    // Agar bookmarks collection me record tha lekin woh original posts delete ho chuki hon
    if (validPostsCount === 0) {
      emptyState.classList.remove("hidden");
      const msg = emptyState.querySelector("p");
      if (msg) msg.textContent = "You haven't saved any stories yet.";
    }
  } catch (err) {
    console.error("Error loading saved posts:", err);
  } finally {
    loadingState.classList.add("hidden");
  }
}

// 3. Render Card in saved.html
function renderSavedCard(post, bookmarkDocId) {
  const card = document.createElement("article");
  card.className = "bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden flex flex-col justify-between";

  const imageUrl = post.imageUrl || "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=800";
  const isAuthor = currentUser && (currentUser.uid === post.authorId);

  card.innerHTML = `
    <div>
      <div class="relative">
        <img src="${imageUrl}" alt="${post.title}" class="w-full h-48 object-cover">
        <button data-bookmark-id="${bookmarkDocId}" class="remove-bookmark-btn absolute top-3 right-3 bg-white/90 hover:bg-white p-2 rounded-full text-rose-500 text-xs font-bold shadow">
          ✕
        </button>
      </div>
      <div class="p-6">
        <h2 class="font-serif text-xl font-bold mb-2 line-clamp-2">${post.title}</h2>
        <p class="text-slate-500 text-xs line-clamp-3 mb-4">${post.content}</p>
      </div>
    </div>

    <div class="px-6 pb-6 pt-4 border-t border-slate-50 flex items-center justify-between text-xs">
      <a href="article.html?id=${post.id}" class="font-bold uppercase tracking-widest text-amber-600 hover:underline">Read Story</a>
      
      ${isAuthor ? `
        <div class="flex items-center gap-3">
          <a href="create.html?edit=${post.id}" class="font-bold text-slate-600 hover:text-black">Edit</a>
          <button data-delete-id="${post.id}" class="delete-saved-post-btn font-bold text-rose-600 hover:underline">Delete</button>
        </div>
      ` : ''}
    </div>
  `;

  savedContainer.appendChild(card);
}

// Event Delegation for Delete and Remove Actions
if (savedContainer) {
  savedContainer.addEventListener("click", async (e) => {
    // Unsave/Remove Bookmark
    if (e.target.classList.contains("remove-bookmark-btn")) {
      const bookmarkDocId = e.target.getAttribute("data-bookmark-id");
      try {
        await deleteDoc(doc(db, "bookmarks", bookmarkDocId));
        if (currentUser) loadUserSavedPosts(currentUser.uid);
      } catch (err) {
        alert("Remove failed: " + err.message);
      }
    }

    // Delete Blog Post Permanently
    if (e.target.classList.contains("delete-saved-post-btn")) {
      const postId = e.target.getAttribute("data-delete-id");
      if (confirm("Delete this story permanently from database?")) {
        try {
          await deleteDoc(doc(db, "fashion_posts", postId));
          if (currentUser) loadUserSavedPosts(currentUser.uid);
        } catch (err) {
          alert("Delete failed: " + err.message);
        }
      }
    }
  });
}