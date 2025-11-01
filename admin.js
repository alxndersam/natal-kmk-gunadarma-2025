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

const loginScreen = document.getElementById("login-screen");
const adminPanel = document.getElementById("admin-panel");
const loginBtn = document.getElementById("login-btn");
const logoutBtn = document.getElementById("logout");
const refreshBtn = document.getElementById("refresh");
const downloadBtn = document.getElementById("download");
const tableBody = document.getElementById("table-body");
const errorText = document.getElementById("login-error");
const searchInput = document.getElementById("search");

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
  tableBody.innerHTML = "<tr><td colspan='13'>⏳ Memuat data...</td></tr>";

  db.ref("pendaftar").once("value")
    .then(snapshot => {
      const data = snapshot.val();
      if (!data) {
        tableBody.innerHTML = "<tr><td colspan='13'>Belum ada data pendaftar.</td></tr>";
        return;
      }

      const rows = Object.values(data);
      renderTable(rows);

      // Search function
      searchInput.addEventListener("input", () => {
        const keyword = searchInput.value.toLowerCase();
        const filtered = rows.filter(item =>
          item.nama?.toLowerCase().includes(keyword) ||
          item.npm?.toLowerCase().includes(keyword) ||
          item.telp?.toLowerCase().includes(keyword)
        );
        renderTable(filtered);
      });
    })
    .catch(err => {
      tableBody.innerHTML = `<tr><td colspan="13">❌ Gagal memuat data: ${err.message}</td></tr>`;
    });
}

// === Render Table ===
function renderTable(rows) {
  tableBody.innerHTML = "";
  rows.forEach((item, i) => {
    const row = `
      <tr>
        <td>${i + 1}</td>
        <td>${item.nama || ""}</td>
        <td>${item.npm || ""}</td>
        <td>${item.prodi || ""}</td>
        <td>${item.angkatan || ""}</td>
        <td>${item.telp || "-"}</td>
        <td>${item.region || ""}</td>
        <td>${item.divisi1 || ""}</td>
        <td>${item.alasan1 || ""}</td>
        <td>${item.divisi2 || ""}</td>
        <td>${item.alasan2 || ""}</td>
        <td><a href="${item.krsURL}" target="_blank">Link</a></td>
        <td><button class="delete-btn" onclick="deleteData('${item.id}')">🗑️</button></td>
      </tr>`;
    tableBody.insertAdjacentHTML("beforeend", row);
  });
}

// === Hapus Data ===
function deleteData(id) {
  if (confirm("Yakin ingin menghapus data ini?")) {
    db.ref("pendaftar").orderByChild("id").equalTo(id).once("value", snapshot => {
      snapshot.forEach(child => child.ref.remove());
      showToast("✅ Data berhasil dihapus");
      loadData();
    });
  }
}

// === Tombol ===
refreshBtn.addEventListener("click", loadData);

// === Download CSV ===
downloadBtn.addEventListener("click", () => {
  db.ref("pendaftar").once("value")
    .then(snapshot => {
      const data = snapshot.val();
      if (!data) return alert("Belum ada data untuk diunduh.");

      const rows = Object.values(data);
      let csv = "Nama,NPM,Prodi,Angkatan,Nomor Telp,Region,Divisi1,Alasan1,Divisi2,Alasan2,LinkKRS\n";
      rows.forEach(item => {
        csv += `"${item.nama}","${item.npm}","${item.prodi}","${item.angkatan}","${item.telp || ""}","${item.region}","${item.divisi1}","${item.alasan1}","${item.divisi2}","${item.alasan2}","${item.krsURL}"\n`;
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

// === Toast ===
function showToast(msg) {
  const toast = document.getElementById("toast");
  toast.textContent = msg;
  toast.className = "show";
  setTimeout(() => toast.className = toast.className.replace("show", ""), 3000);
}
