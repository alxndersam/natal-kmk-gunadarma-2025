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

// === INIT FIREBASE ===
firebase.initializeApp(firebaseConfig);
const db = firebase.database();
const storage = firebase.storage();

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
  const data = Object.fromEntries(formData.entries());
  const file = formData.get("krs");

  // Cek kuota dulu
  const snapshot = await db.ref("pendaftar").once("value");
  const count = snapshot.numChildren();
  if (count >= MAX_QUOTA) {
    quotaStatus.textContent = "❌ Maaf, kuota sudah penuh.";
    return;
  }

  // Upload KRS ke Firebase Storage
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
      console.log("Data berhasil dikirim ke Firebase:", data);


      // Kirim juga ke Formspree
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

// === PANGGIL SAAT LOAD ===
checkQuota();
