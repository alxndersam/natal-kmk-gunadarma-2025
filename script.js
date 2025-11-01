// === Konfigurasi Firebase ===
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

// Inisialisasi Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.database();

// === Submit Form ===
document.getElementById("regForm").addEventListener("submit", e => {
  e.preventDefault();

  const data = {
    nama: document.getElementById("nama").value,
    npm: document.getElementById("npm").value,
    prodi: document.getElementById("prodi").value,
    angkatan: document.getElementById("angkatan").value,
    noTelp: document.getElementById("noTelp").value,
    region: document.getElementById("region").value,
    divisi1: document.getElementById("divisi1").value,
    alasan1: document.getElementById("alasan1").value,
    divisi2: document.getElementById("divisi2").value,
    alasan2: document.getElementById("alasan2").value,
    krsURL: document.getElementById("krsURL").value
  };

  db.ref("pendaftar").push(data)
    .then(() => {
      alert("🎉 Pendaftaran berhasil dikirim!");
      document.getElementById("regForm").reset();
    })
    .catch(err => {
      alert("❌ Gagal mengirim data: " + err.message);
    });
});
