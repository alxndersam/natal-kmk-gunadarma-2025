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

// === VALIDASI LINK GOOGLE DRIVE ===
function isValidDriveLink(link) {
  // regex untuk memastikan format-nya kayak: https://drive.google.com/file/d/xxxxx/view
  const pattern = /^https:\/\/drive\.google\.com\/file\/d\/[a-zA-Z0-9_-]+\/view(\?usp=sharing)?$/;
  return pattern.test(link.trim());
}

// === SUBMIT FORM ===
form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const formData = Object.fromEntries(new FormData(form).entries());
  const krsURL = formData.krsURL.trim();

  if (!isValidDriveLink(krsURL)) {
    alert("⚠️ Link KRS kamu belum sesuai format!\nGunakan link seperti: https://drive.google.com/file/d/ID/view?usp=sharing");
    return;
  }

  const snapshot = await db.ref("pendaftar").once("value");
  const count = snapshot.numChildren();
  if (count >= MAX_QUOTA) {
    quotaStatus.textContent = "❌ Maaf, kuota sudah penuh.";
    return;
  }

  await db.ref("pendaftar").push(formData);
  alert("🎉 Pendaftaran berhasil dikirim!");
  form.reset();
  checkQuota();
});

// === SCROLL ===
document.querySelector(".scroll-btn").addEventListener("click", (e) => {
  e.preventDefault();
  document.querySelector("#form").scrollIntoView({ behavior: "smooth" });
});

// === POPUP HELP ===
const modal = document.getElementById("driveModal");
const helpBtn = document.getElementById("helpDrive");
const closeModal = document.getElementById("closeModal");

helpBtn.onclick = () => modal.style.display = "flex";
closeModal.onclick = () => modal.style.display = "none";
window.onclick = (e) => { if (e.target == modal) modal.style.display = "none"; };

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

checkQuota();
