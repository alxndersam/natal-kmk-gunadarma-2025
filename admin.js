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

// Elemen DOM
const loginScreen = document.getElementById("login-screen");
const adminPanel = document.getElementById("admin-panel");
const loginBtn = document.getElementById("login-btn");
const logoutBtn = document.getElementById("logout");
const refreshBtn = document.getElementById("refresh");
const downloadBtn = document.getElementById("download");
const tableBody = document.getElementById("table-body");
const errorText = document.getElementById("login-error");

const ADMIN_PASS = "kmknatal2025";

// === Login ===
loginBtn.addEventListener("click", () => {
  const inputPass = document.getElementById("admin-pass").value.trim();
  if (inputPass === ADMIN_PASS) {
    loginScreen.classList.add("hidden");
    adminPanel.classList.remove("hidden");
    loadData();
  } else {
    errorText.textContent = "❌ Password salah!";
  }
});

// === Logout ===
logoutBtn.addEventListener("click", () => {
  adminPanel.classList.add("hidden");
  loginScreen.classList.remove("hidden");
  document.getElementById("admin-pass").value = "";
});

// === Ambil Data dari Firebase ===
function loadData() {
  tableBody.innerHTML = "<tr><td colspan='11'>⏳ Memuat data...</td></tr>";

  db.ref("pendaftar").on("value", (snapshot) => {
    const data = snapshot.val();
    if (!data) {
      tableBody.innerHTML = "<tr><td colspan='11'>Belum ada data pendaftar.</td></tr>";
      return;
    }

    const rows = Object.values(data);
    tableBody.innerHTML = "";
    rows.forEach((item, i) => {
      const row = `
        <tr>
          <td>${i + 1}</td>
          <td>${item.nama || ""}</td>
          <td>${item.npm || ""}</td>
          <td>${item.prodi || ""}</td>
          <td>${item.angkatan || ""}</td>
          <td>${item.region || ""}</td>
          <td>${item.divisi1 || ""}</td>
          <td>${item.alasan1 || ""}</td>
          <td>${item.divisi2 || ""}</td>
          <td>${item.alasan2 || ""}</td>
          <td><a href="${item.krsURL || '#'}" target="_blank">Lihat KRS</a></td>
        </tr>`;
      tableBody.insertAdjacentHTML("beforeend", row);
    });
  }, (error) => {
    tableBody.innerHTML = `<tr><td colspan='11'>❌ Gagal memuat data: ${error.message}</td></tr>`;
  });
}

// Tombol Refresh
refreshBtn.addEventListener("click", loadData);

// === Download CSV ===
downloadBtn.addEventListener("click", () => {
  db.ref("pendaftar").once("value") // ✅ pakai node yang benar
    .then(snapshot => {
      const data = snapshot.val();
      if (!data) return alert("Belum ada data untuk diunduh.");

      const rows = Object.values(data);
      let csv = "Nama,NPM,Prodi,Angkatan,Region,Divisi1,Alasan1,Divisi2,Alasan2,LinkKRS\n";
      rows.forEach(item => {
        csv += `"${item.nama}","${item.npm}","${item.prodi}","${item.angkatan}","${item.region}","${item.divisi1}","${item.alasan1}","${item.divisi2}","${item.alasan2}","${item.krsURL}"\n`;
      });

      const blob = new Blob([csv], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "data_pendaftar_kmk_natal_2025.csv";
      document.body.appendChild(a);
      a.click();
      a.remove();
    })
    .catch(err => alert("❌ Gagal mengunduh data: " + err.message));
});
