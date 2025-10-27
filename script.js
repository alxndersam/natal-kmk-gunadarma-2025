// === FIREBASE CONFIG ===
const firebaseConfig = {
  apiKey: "AIzaSyBwZNBcA78NJQUzUA-D1QaxblnrSKwQUhM",
  authDomain: "kmk-natal-2025.firebaseapp.com",
  databaseURL: "https://kmk-natal-2025-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "kmk-natal-2025",
  storageBucket: "kmk-natal-2025.firebasestorage.app",
  messagingSenderId: "662210467099",
  appId: "1:662210467099:web:8c5c61d5d9598498fd6fbe"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.database();
const storage = firebase.storage();

const MAX_QUOTA = 34;
const form = document.getElementById("regForm");
const quotaStatus = document.getElementById("quotaStatus");

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

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const formData = new FormData(form);
  const data = Object.fromEntries(formData.entries());
  const file = formData.get("krs");

  // Cek kuota dulu
  const snapshot = await db.ref("pendaftar").once("value");
  const count = snapshot.numChildren();
  if (count >= MAX_QUOTA) {
    quotaStatus.textContent = "❌ Maaf, kuota sudah penuh.";
    return;
  }

  // Upload file KRS ke Firebase Storage
  const storageRef = storage.ref("krs/" + Date.now() + "_" + file.name);
  const uploadTask = storageRef.put(file);

  uploadTask.on(
    "state_changed",
    null,
    (error) => {
      console.error("Upload gagal:", error);
      alert("Upload gagal. Coba lagi ya!");
    },
    async () => {
      const fileURL = await uploadTask.snapshot.ref.getDownloadURL();
      data.krsURL = fileURL;

      // Simpan ke Realtime Database
      await db.ref("pendaftar").push(data);

      // Kirim ke Formspree
      fetch("https://formspree.io/f/2857088604037970997", {
        method: "POST",
        headers: { "Accept": "application/json" },
        body: new URLSearchParams(data),
      });

      alert("🎉 Pendaftaran berhasil dikirim!");
      form.reset();
      checkQuota();
    }
  );
});

checkQuota();

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
