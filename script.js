// === FIREBASE CONFIG (pakai config kamu) ===
const firebaseConfig = {
  apiKey: "AIzaSyBwZNBcA78NJQUzUA-D1QaxblnrSKwQUhM",
  authDomain: "kmk-natal-2025.firebaseapp.com",
  databaseURL: "https://kmk-natal-2025-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "kmk-natal-2025",
  storageBucket: "kmk-natal-2025.firebasestorage.app",
  messagingSenderId: "662210467099",
  appId: "1:662210467099:web:8c5c61d5d9598498fd6fbe",
  measurementId: "G-1G2K8GSGMV"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.database();

const MAX_QUOTA = 35;
const form = document.getElementById("regForm");
const quotaStatus = document.getElementById("quotaStatus");

// Check quota and disable form if full
async function checkQuota() {
  try {
    const snapshot = await db.ref("pendaftar").once("value");
    const count = snapshot.numChildren();

    if (count >= MAX_QUOTA) {
      quotaStatus.textContent = "❌ Pendaftaran sudah ditutup (Kuota penuh)";
      form.querySelectorAll("input, select, textarea, button").forEach(el => el.disabled = true);
      form.classList.add("closed");
      document.body.classList.add("closed-bg");
    } else {
      quotaStatus.textContent = `Kuota tersisa: ${MAX_QUOTA - count} panitia`;
      form.classList.remove("closed");
      document.body.classList.remove("closed-bg");
    }
  } catch (err) {
    console.error("checkQuota error:", err);
  }
}

// Form submit
form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const f = form;

  // Collect values (by name)
  const data = {
    nama: f.nama.value.trim(),
    npm: f.npm.value.trim(),
    prodi: f.prodi.value.trim(),
    angkatan: f.angkatan.value,
    region: f.region.value,
    telepon: f.telepon.value.trim(),
    divisi1: f.divisi1.value,
    alasan1: f.alasan1.value.trim(),
    divisi2: f.divisi2.value,
    alasan2: f.alasan2.value.trim(),
    krsURL: f.krsURL.value.trim(),
    createdAt: Date.now()
  };

  // Basic validation
  if (!data.nama || !data.npm || !data.krsURL) {
    alert("Lengkapi nama, NPM, dan link KRS.");
    return;
  }

  // Re-check quota before push
  const snapshot = await db.ref("pendaftar").once("value");
  if (snapshot.numChildren() >= MAX_QUOTA) {
    quotaStatus.textContent = "❌ Maaf, kuota sudah penuh.";
    alert("Maaf, pendaftaran sudah penuh.");
    return;
  }

  try {
    await db.ref("pendaftar").push(data);
    alert("🎉 Pendaftaran berhasil dikirim!");
    form.reset();
    checkQuota();
  } catch (err) {
    console.error("submit error:", err);
    alert("Gagal mengirim data: " + err.message);
  }
});

// Scroll button
document.querySelectorAll(".scroll-btn").forEach(btn => {
  btn.addEventListener("click", (e) => {
    e.preventDefault();
    const target = document.querySelector(btn.getAttribute("href"));
    if (target) target.scrollIntoView({ behavior: "smooth" });
  });
});

// Snow effect (kept)
const canvas = document.getElementById("snow");
const ctx = canvas.getContext && canvas.getContext("2d");
let width = canvas.width = window.innerWidth;
let height = canvas.height = window.innerHeight;
const flakes = [];
for (let i = 0; i < 80; i++) flakes.push({ x: Math.random()*width, y: Math.random()*height, r: Math.random()*3+1, d: Math.random()+1 });
let angle = 0;
function drawSnow(){
  if (!ctx) return;
  ctx.clearRect(0,0,width,height);
  ctx.fillStyle = "rgba(255,255,255,0.9)";
  ctx.beginPath();
  for (let f of flakes) {
    ctx.moveTo(f.x, f.y);
    ctx.arc(f.x, f.y, f.r, 0, Math.PI*2);
  }
  ctx.fill();
  moveSnow();
}
function moveSnow(){
  angle += 0.01;
  for (let f of flakes) {
    f.y += Math.pow(f.d,2) + 1;
    f.x += Math.sin(angle) * 2;
    if (f.y > height) f.y = 0;
  }
}
setInterval(drawSnow, 33);
window.addEventListener("resize", () => {
  width = canvas.width = window.innerWidth;
  height = canvas.height = window.innerHeight;
});

// init
checkQuota();
