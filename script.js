// Firebase
const firebaseConfig = {
  apiKey: "AIzaSyBwZNBcA78NJQUzUA-D1QaxblnrSKwQUhM",
  authDomain: "kmk-natal-2025.firebaseapp.com",
  databaseURL: "https://kmk-natal-2025-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "kmk-natal-2025",
  storageBucket: "kmk-natal-2025.appspot.com",
  messagingSenderId: "662210467099",
  appId: "1:662210467099:web:8c5c61d5d9598498fd6fbe"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.database();
const form = document.getElementById("regForm");
const quotaStatus = document.getElementById("quotaStatus");
const MAX_QUOTA = 34;

// Kuota
function checkQuota() {
  db.ref("pendaftar").once("value", (snapshot) => {
    const count = snapshot.numChildren();
    quotaStatus.textContent = count >= MAX_QUOTA ?
      "❌ Kuota penuh!" :
      `Kuota tersisa: ${MAX_QUOTA - count} panitia`;
  });
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const data = Object.fromEntries(new FormData(form).entries());
  await db.ref("pendaftar").push(data);
  alert("🎉 Pendaftaran berhasil dikirim!");
  form.reset();
  checkQuota();
});

// Smooth scroll
document.querySelector(".scroll-btn").addEventListener("click", (e) => {
  e.preventDefault();
  document.querySelector("#form").scrollIntoView({ behavior: "smooth" });
});

// Snow
const canvas = document.getElementById("snow");
const ctx = canvas.getContext("2d");
let width = (canvas.width = window.innerWidth);
let height = (canvas.height = window.innerHeight);
const flakes = Array.from({ length: 120 }, () => ({
  x: Math.random() * width,
  y: Math.random() * height,
  r: Math.random() * 3 + 1,
  d: Math.random() + 1
}));
let angle = 0;
function drawSnow() {
  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = "white";
  ctx.beginPath();
  for (let f of flakes) {
    ctx.moveTo(f.x, f.y);
    ctx.arc(f.x, f.y, f.r, 0, Math.PI * 2);
  }
  ctx.fill();
  moveSnow();
}
function moveSnow() {
  angle += 0.01;
  for (let f of flakes) {
    f.y += Math.pow(f.d, 2) + 1;
    f.x += Math.sin(angle) * 2;
    if (f.y > height) f.y = 0;
  }
}
setInterval(drawSnow, 33);
window.addEventListener("resize", () => {
  width = canvas.width = window.innerWidth;
  height = canvas.height = window.innerHeight;
});

checkQuota();
