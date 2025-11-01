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

const form = document.getElementById("pendaftaran-form");
const status = document.getElementById("status");

form.addEventListener("submit", e => {
  e.preventDefault();

  const data = {
    nama: nama.value,
    npm: npm.value,
    prodi: prodi.value,
    angkatan: angkatan.value,
    region: region.value,
    notelp: notelp.value,
    divisi1: divisi1.value,
    alasan1: alasan1.value,
    divisi2: divisi2.value,
    alasan2: alasan2.value,
    krsURL: krsURL.value
  };

  db.ref("pendaftar").push(data)
    .then(() => {
      status.textContent = "✅ Pendaftaran berhasil dikirim!";
      form.reset();
    })
    .catch(() => {
      status.textContent = "❌ Terjadi kesalahan. Coba lagi.";
    });
});
