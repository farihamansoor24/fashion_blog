import { db, doc, getDoc, updateDoc } from './firebase.js';
import { initAuth } from './auth.js';
// import { doc, getDoc, updateDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

let userRef = null;
initAuth((user) => { userRef = user; });

const urlParams = new URLSearchParams(window.location.search);
const postId = urlParams.get('id');

const articleBody = document.getElementById("articleBody");
const commentsList = document.getElementById("commentsList");

if (!postId) {
  window.location.href = "index.html";
}

let postData = null;

async function loadArticle() {
  const docRef = doc(db, "fashion_posts", postId);
  const docSnap = await getDoc(docRef);

  if (!docSnap.exists()) {
    articleBody.innerHTML = "<p>Story not found.</p>";
    return;
  }

  postData = docSnap.data();
  articleBody.innerHTML = `
    <span class="text-xs font-bold text-amber-600 uppercase tracking-widest">By ${postData.authorEmail.split('@')[0]}</span>
    <h1 class="font-serif text-3xl font-bold my-4">${postData.title}</h1>
    <img src="${postData.imageUrl || 'https://images.unsplash.com/photo-1483985988355-763728e1935b'}" class="w-full h-80 object-cover rounded-lg mb-6">
    <p class="text-slate-700 leading-relaxed whitespace-pre-line text-sm">${postData.content}</p>
  `;

  renderComments(postData.comments || []);
}

function renderComments(comments) {
  commentsList.innerHTML = comments.length === 0
    ? `<p class="text-xs text-slate-400 italic">No comments yet.</p>`
    : comments.map(c => `
        <div class="bg-slate-50 p-4 rounded text-xs border">
          <div class="flex justify-between font-bold text-slate-800 mb-1">
            <span>${c.user}</span>
            <span class="text-[10px] text-slate-400 font-normal">${c.date}</span>
          </div>
          <p class="text-slate-600">${c.text}</p>
        </div>
      `).join('');
}

document.getElementById("commentForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  if (!userRef) return alert("Please log in to comment.");

  const text = document.getElementById("commentText").value;
  const newComment = {
    user: userRef.email.split('@')[0],
    text: text,
    date: new Date().toLocaleDateString()
  };

  const updatedComments = [...(postData.comments || []), newComment];
  await updateDoc(doc(db, "fashion_posts", postId), { comments: updatedComments });

  document.getElementById("commentText").value = "";
  postData.comments = updatedComments;
  renderComments(updatedComments);
});

loadArticle();