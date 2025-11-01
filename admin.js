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

firebase.initializeApp(firebaseConfig);
const db = firebase.database();

const ADMIN_PASS = "kmknatal2025";

// Elemen DOM
const loginScreen = document.getElementById("login-screen");
const adminPanel = document.getElementById("admin-panel");
const loginBtn = document.getElementById("login-btn");
const logoutBtn = document.getElementById("logoutBtn");
const reloadBtn = document.getElementById("reloadBtn");
const downloadBtn = document.getElementById("downloadCSV");
const tableBody = document.getElementById("data-body");
const errorText = document.getElementById("login-error");

// === LOGIN ===
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

// === LOGOUT ===
logoutBtn.addEventListener("click", () => {
  adminPanel.classList.add("hidden");
  loginScreen.classList.remove("hidden");
  document.getElementById("admin-pass").value = "";
});

// === AMBIL DATA ===
function loadData() {
  tableBody.innerHTML = "<tr><td colspan='13'>⏳ Memuat data...</td></tr>";

  db.ref("pendaftar").once("value")
    .then(snapshot => {
      const data = snapshot.val();
      if (!data) {
        tableBody.innerHTML = "<tr><td colspan='13'>Belum ada data pendaftar.</td></tr>";
        return;
      }

      tableBody.innerHTML = "";
      Object.entries(data).forEach(([id, item], i) => {
        const row = `
          <tr>
            <td>${i + 1}</td>
            <td>${item.nama || ""}</td>
            <td>${item.npm || ""}</td>
            <td>${item.prodi || ""}</td>
            <td>${item.angkatan || ""}</td>
            <td>${item.telepon || ""}</td>
            <td>${item.region || ""}</td>
            <td>${item.divisi1 || ""}</td>
            <td>${item.alasan1 || ""}</td>
            <td>${item.divisi2 || ""}</td>
            <td>${item.alasan2 || ""}</td>
            <td><a href="${item.krsURL}" target="_blank">Lihat</a></td>
            <td><button class="delete-btn" data-id="${id}">Hapus</button></td>
          </tr>`;
        tableBody.insertAdjacentHTML("beforeend", row);
      });

      document.querySelectorAll(".delete-btn").forEach(btn => {
        btn.addEventListener("click", e => {
          const id = e.target.getAttribute("data-id");
          if (confirm("Yakin ingin menghapus data ini?")) {
            db.ref("pendaftar/" + id).remove();
            loadData();
          }
        });
      });
    })
    .catch(err => {
      tableBody.innerHTML = `<tr><td colspan='13'>❌ Gagal memuat data: ${err.message}</td></tr>`;
    });
}

reloadBtn.addEventListener("click", loadData);

// === DOWNLOAD CSV ===
downloadBtn.addEventListener("click", () => {
  db.ref("pendaftar").once("value")
    .then(snapshot => {
      const data = snapshot.val();
      if (!data) return alert("Belum ada data untuk diunduh.");

      let csv = "Nama,NPM,Prodi,Angkatan,Telepon,Region,Divisi1,Alasan1,Divisi2,Alasan2,Link KRS\n";
      Object.values(data).forEach(item => {
        csv += `"${item.nama}","${item.npm}","${item.prodi}","${item.angkatan}","${item.telepon}","${item.region}","${item.divisi1}","${item.alasan1}","${item.divisi2}","${item.alasan2}","${item.krsURL}"\n`;
      });

      const blob = new Blob([csv], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "data_pendaftar_kmk_natal_2025.csv";
      a.click();
      a.remove();
    });
});
