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

function checkQuota() {
  db.ref("pendaftar").once("value", (snapshot) => {
    const count = snapshot.numChildren();
    if (count >= MAX_QUOTA) {
      quotaStatus.textContent = "❌ Kuota penuh!";
      form.querySelectorAll("input, select, textarea, button").forEach(e => e.disabled = true);
    } else {
      quotaStatus.textContent = `Kuota tersisa: ${MAX_QUOTA - count}`;
    }
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

// Modal bantuan KRS
const modal = document.getElementById("driveModal");
document.getElementById("helpDrive").onclick = () => modal.style.display = "flex";
document.getElementById("closeModal").onclick = () => modal.style.display = "none";
window.onclick = (e) => { if (e.target == modal) modal.style.display = "none"; };

// Scroll smooth
document.querySelector(".scroll-btn").onclick = (e) => {
  e.preventDefault();
  document.querySelector("#form").scrollIntoView({ behavior: "smooth" });
};

// Efek salju
const canvas = document.getElementById("snow");
const ctx = canvas.getContext("2d");
let w = (canvas.width = window.innerWidth);
let h = (canvas.height = window.innerHeight);
let flakes = [];
for (let i = 0; i < 80; i++) {
  flakes.push({ x: Math.random() * w, y: Math.random() * h, r: Math.random() * 3 + 1, d: Math.random() + 1 });
}
let angle = 0;
function drawSnow() {
  ctx.clearRect(0, 0, w, h);
  ctx.fillStyle = "white";
  ctx.beginPath();
  for (let f of flakes) {
    ctx.moveTo(f.x, f.y);
    ctx.arc(f.x, f.y, f.r, 0, Math.PI * 2);
  }
  ctx.fill();
  angle += 0.01;
  for (let f of flakes) {
    f.y += Math.pow(f.d, 2) + 1;
    f.x += Math.sin(angle) * 2;
    if (f.y > h) f.y = 0;
  }
}
setInterval(drawSnow, 33);
window.addEventListener("resize", () => {
  w = canvas.width = window.innerWidth;
  h = canvas.height = window.innerHeight;
});

checkQuota();
