// === FIREBASE CONFIG ===
const firebaseConfig = {
  apiKey: "AIzaSyBwZNBcA78NJQUzUA-D1QaxblnrSKwQUhM",
  authDomain: "kmk-natal-2025.firebaseapp.com",
  databaseURL: "https://kmk-natal-2025-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "kmk-natal-2025",
  storageBucket: "kmk-natal-2025.appspot.com",
  messagingSenderId: "662210467099",
  appId: "1:662210467099:web:8c5c61d5d9598498fd6fbe"
};

// === INIT FIREBASE ===
firebase.initializeApp(firebaseConfig);
const db = firebase.database();
const MAX_QUOTA = 34;

const form = document.getElementById("regForm");
const quotaStatus = document.getElementById("quotaStatus");

// === CEK KUOTA ===
function checkQuota() {
  db.ref("pendaftar").once("value", (snapshot) => {
    const count = snapshot.numChildren();
    if (count >= MAX_QUOTA) {
      quotaStatus.textContent = "❌ Pendaftaran sudah ditutup (Kuota penuh)";
      form.querySelectorAll("input, select, textarea, button").forEach(el => el.disabled = true);
    } else {
      quotaStatus.textContent = `Kuota tersisa: ${MAX_QUOTA - count} panitia`;
    }
  });
}

// === SUBMIT FORM ===
form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const formData = new FormData(form);
  const file = formData.get("krs");

  // Cek kuota
  const snapshot = await db.ref("pendaftar").once("value");
  const count = snapshot.numChildren();
  if (count >= MAX_QUOTA) {
    quotaStatus.textContent = "❌ Maaf, kuota sudah penuh.";
    return;
  }

  // Upload ke Google Apps Script (Drive)
  const scriptURL = "https://script.google.com/macros/s/AKfycbwSkGGCxvoJcqii47M58rjo3InhWWTY3Y5PqmYp2Yfx2x-yTSk8wfI9F657O2kSxo3EKQ/exec";
  const uploadData = new FormData();
  uploadData.append("file", file);

  try {
    const res = await fetch(scriptURL, { method: "POST", body: uploadData });
    const fileURL = await res.text();

    const data = Object.fromEntries(formData.entries());
    data.krsURL = fileURL.trim();

    await db.ref("pendaftar").push(data);
    alert("🎉 Pendaftaran berhasil dikirim!");
    form.reset();
    checkQuota();
  } catch (err) {
    console.error("Gagal kirim:", err);
    alert("Gagal kirim data, coba lagi ya!");
  }
});

// === SCROLL EFFECT ===
document.querySelector(".scroll-btn").addEventListener("click", (e) => {
  e.preventDefault();
  document.querySelector("#form").scrollIntoView({ behavior: "smooth" });
});

// === EFEK SALJU ===
const canvas = document.getElementById("snow");
const ctx = canvas.getContext("2d");
let width = (canvas.width = window.innerWidth);
let height = (canvas.height = window.innerHeight);
const flakes = [];
for (let i = 0; i < 80; i++) {
  flakes.push({ x: Math.random() * width, y: Math.random() * height, r: Math.random() * 3 + 1, d: Math.random() + 1 });
}
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

// === START ===
checkQuota();
