document.addEventListener("DOMContentLoaded", () => {
  if (typeof gsap !== "undefined") {
    // 1. Initial Header Entry Animation
    gsap.timeline({ defaults: { ease: "power3.out" } })
      .from("#mainHeader", { y: -30, opacity: 0, duration: 0.8 })
      .from("#headerLogo", { x: -20, opacity: 0, duration: 0.5 }, "-=0.4")
      .from(".nav-item", { y: -15, opacity: 0, duration: 0.4, stagger: 0.1 }, "-=0.3")
      .from("#navRightSection", { x: 20, opacity: 0, duration: 0.5 }, "-=0.4");
  }

  // 2. Active Page Highlight Logic
  const currentPath = window.location.pathname.split("/").pop() || "index.html";
  const navLinks = document.querySelectorAll("#navLinks a");

  navLinks.forEach(link => {
    const href = link.getAttribute("href");
    if (href === currentPath) {
      link.classList.add("text-black", "active");
      link.classList.remove("text-slate-600");
    }
  });
});