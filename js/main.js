import { db, collection, query, orderBy, onSnapshot, where, getDocs, doc, deleteDoc,onAuthStateChanged,auth,signOut } from './firebase.js';
import { initAuth } from './auth.js';
import { toggleSavePost } from './saved.js';

const postsGrid = document.getElementById("postsGrid");
let currentUser = null;
let userBookmarks = [];

// const navAuthBtns = document.getElementById("navAuthBtns");
// const navUserMenu = document.getElementById("navUserMenu");
// const userEmail = document.getElementById("userEmail");
const logoutBtn = document.getElementById("logoutBtn");


// Logout Handler
if (logoutBtn) {
  logoutBtn.addEventListener("click", async () => {
    try {
      await signOut(auth);
      window.location.reload();
    } catch (err) {
      console.error("Logout error:", err);
    }
  });
}
initAuth(async (user) => {
  currentUser = user;
  if (user) {
    await fetchUserBookmarks(user.uid);
  } else {
    userBookmarks = [];
  }
  listenToPosts();
});

async function fetchUserBookmarks(userId) {
  try {
    const q = query(collection(db, "bookmarks"), where("userId", "==", userId));
    const snap = await getDocs(q);
    userBookmarks = snap.docs.map(doc => doc.data().postId);
  } catch (err) {
    console.error("Error fetching bookmarks:", err);
  }
}

function listenToPosts() {
  const q = query(collection(db, "fashion_posts"), orderBy("createdAt", "desc"));

  onSnapshot(q, (snapshot) => {
    postsGrid.innerHTML = "";
    if (snapshot.empty) {
      postsGrid.innerHTML = `<p class="col-span-full text-center text-slate-400">No stories found.</p>`;
      return;
    }

    snapshot.docs.forEach((docSnap) => {
      const post = docSnap.data();
      const id = docSnap.id;
      const isBookmarked = userBookmarks.includes(id);

      // Check if logged-in user is the author
      const isAuthor = currentUser && (currentUser.uid === post.authorId);

      const card = document.createElement("article");
      card.className = "fashion-card bg-white rounded-xl overflow-hidden border border-slate-100 shadow-sm flex flex-col justify-between opacity-0 translate-y-4";
      
      card.innerHTML = `
        <div>
          <div class="relative h-56 bg-slate-100 overflow-hidden">
            <img src="${post.imageUrl || 'https://images.unsplash.com/photo-1483985988355-763728e1935b'}" class="blog-card-img w-full h-full object-cover cursor-pointer hover:scale-105 transition-transform duration-300">
            <button data-id="${id}" class="bookmark-btn absolute top-3 right-3 bg-white/80 p-2 rounded-full text-slate-700 hover:scale-110 transition">
              <i class="${isBookmarked ? 'fa-solid text-amber-600' : 'fa-regular'} fa-bookmark"></i>
            </button>
          </div>
          <div class="p-6">
            <span class="text-[10px] font-bold uppercase text-amber-600 tracking-widest">By ${(post.authorEmail || 'Guest').split('@')[0]}</span>
            <h2 class="font-serif text-xl font-bold my-2 line-clamp-2"><a href="article.html?id=${id}">${post.title}</a></h2>
            <p class="text-slate-500 text-xs line-clamp-3">${post.content}</p>
          </div>
        </div>
        
        <div class="px-6 py-4 border-t flex justify-between items-center text-xs">
          <a href="article.html?id=${id}" class="font-bold text-black hover:text-amber-600">Read Article &rarr;</a>
          
          <!-- Edit/Delete Action Buttons (Only for Author) -->
          ${isAuthor ? `
            <div class="flex items-center gap-3">
              <a href="create.html?edit=${id}" class="text-slate-600 font-bold hover:text-black">
                <i class="fa-regular fa-pen-to-square"></i> Edit
              </a>
              <button data-delete-id="${id}" class="delete-post-btn text-rose-600 font-bold hover:underline">
                <i class="fa-regular fa-trash-can"></i> Delete
              </button>
            </div>
          ` : ''}
        </div>
      `;
      postsGrid.appendChild(card);
    });

    gsap.to(".fashion-card", { opacity: 1, y: 0, duration: 0.5, stagger: 0.1 });

    // Bookmark Event Listeners
    document.querySelectorAll(".bookmark-btn").forEach(btn => {
      btn.addEventListener("click", async (e) => {
        e.preventDefault();
        const postId = e.currentTarget.dataset.id;
        const icon = e.currentTarget.querySelector("i");
        
        btn.disabled = true;
        try {
          const isSaved = await toggleSavePost(postId);
          if (isSaved) {
            userBookmarks.push(postId);
            icon.className = "fa-solid fa-bookmark text-amber-600";
          } else {
            userBookmarks = userBookmarks.filter(bId => bId !== postId);
            icon.className = "fa-regular fa-bookmark";
          }
        } catch (err) {
          console.error("Bookmark failed:", err);
        } finally {
          btn.disabled = false;
        }
      });
    });

    // Delete Event Listeners
    document.querySelectorAll(".delete-post-btn").forEach(btn => {
      btn.addEventListener("click", async (e) => {
        const postId = e.currentTarget.dataset.deleteId;
        if (confirm("Are you sure you want to delete this blog permanently?")) {
          try {
            await deleteDoc(doc(db, "fashion_posts", postId));
          } catch (err) {
            alert("Delete failed: " + err.message);
          }
        }
      });
    });

  });
}
// Image Modal Elements
const imageModal = document.getElementById("imageModal");
const modalImg = document.getElementById("modalImg");
const closeImgModal = document.getElementById("closeImgModal");

// Event Delegation for dynamically loaded blog card images
document.addEventListener("click", (e) => {
  if (e.target && e.target.classList.contains("blog-card-img")) {
    const imgSrc = e.target.getAttribute("src");
    
    if (imgSrc && modalImg && imageModal) {
      modalImg.src = imgSrc;
      imageModal.classList.remove("hidden");
      imageModal.classList.add("flex");
      
      // GSAP Zoom-In Effect (optional)
      if (typeof gsap !== "undefined") {
        gsap.fromTo(modalImg, { scale: 0.8, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.3, ease: "power2.out" });
      }
    }
  }
});

// Modal Close Handlers
const hideImageModal = () => {
  if (imageModal) {
    imageModal.classList.add("hidden");
    imageModal.classList.remove("flex");
    if (modalImg) modalImg.src = "";
  }
};

closeImgModal?.addEventListener("click", hideImageModal);

// Close Modal when clicking outside the image
imageModal?.addEventListener("click", (e) => {
  if (e.target === imageModal) {
    hideImageModal();
  }
});

// Close Modal on pressing ESC key
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && imageModal && !imageModal.classList.contains("hidden")) {
    hideImageModal();
  }
});