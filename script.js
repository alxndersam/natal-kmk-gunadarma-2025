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

// === INISIALISASI FIREBASE ===
firebase.initializeApp(firebaseConfig);
const db = firebase.database();

const form = document.getElementById("regForm");
const quotaStatus = document.getElementById("quotaStatus");

const MAX_QUOTA = 34;
const GDRIVE_UPLOAD_URL = "https://script.google.com/macros/s/AKfycbwSkGGCxvoJcqii47M58rjo3InhWWTY3Y5PqmYp2Yfx2x-yTSk8wfI9F657O2kSxo3EKQ/exec";
const GDRIVE_FOLDER_ID = "1GOJu72WGw8VX97EjbGsosTZCHbhJgrC8";

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
  const file = document.getElementById("krsFile").files[0];

  const snapshot = await db.ref("pendaftar").once("value");
  const count = snapshot.numChildren();
  if (count >= MAX_QUOTA) {
    quotaStatus.textContent = "❌ Maaf, kuota sudah penuh.";
    return;
  }

  try {
    // === Upload ke Google Drive ===
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = async () => {
      const fileData = reader.result;

      const uploadRes = await fetch(GDRIVE_UPLOAD_URL, {
        method: "POST",
        body: new URLSearchParams({
          folderId: GDRIVE_FOLDER_ID,
          fileName: file.name,
          fileType: file.type,
          fileData: fileData
        }),
      });

      const uploadResult = await uploadRes.json();
      if (!uploadResult.fileUrl) throw new Error("Upload gagal ke Google Drive");

      const data = Object.fromEntries(formData.entries());
      data.krsURL = uploadResult.fileUrl;
      data.timestamp = new Date().toISOString();

      await db.ref("pendaftar").push(data);

      alert("🎉 Pendaftaran berhasil dikirim!");
      form.reset();
      checkQuota();
    };
  } catch (err) {
    console.error("Error:", err);
    alert("Terjadi kesalahan. Coba lagi.");
  }
});

// === SAAT HALAMAN DIMUAT ===
checkQuota();
