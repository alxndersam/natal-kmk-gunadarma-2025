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

// Elemen DOM
const loginScreen = document.getElementById("login-screen");
const adminPanel = document.getElementById("admin-panel");
const loginBtn = document.getElementById("login-btn");
const logoutBtn = document.getElementById("logout");
const refreshBtn = document.getElementById("refresh");
const downloadBtn = document.getElementById("download");
const searchInput = document.getElementById("search");
const tableBody = document.getElementById("table-body");
const errorText = document.getElementById("login-error");

const ADMIN_PASS = "kmknatal2025";
let allData = {};

// === LOGIN ===
loginBtn.addEventListener("click", () => {
  const pass = document.getElementById("admin-pass").value.trim();
  if (pass === ADMIN_PASS) {
    loginScreen.classList.add("hidden");
    adminPanel.classList.remove("hidden");
    showToast("Login berhasil ✅");
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

// === LOAD DATA ===
function loadData() {
  tableBody.innerHTML = "<tr><td colspan='12'>⏳ Memuat data...</td></tr>";
  db.ref("pendaftar").on("value", (snapshot) => {
    const data = snapshot.val();
    allData = data || {};
    renderTable(allData);
  });
}

// === RENDER TABLE ===
function renderTable(data) {
  tableBody.innerHTML = "";
  const entries = Object.entries(data || {});
  if (entries.length === 0) {
    tableBody.innerHTML = "<tr><td colspan='12'>Belum ada data pendaftar.</td></tr>";
    return;
  }

  entries.forEach(([key, item], i) => {
    const row = `
      <tr data-id="${key}">
        <td>${i + 1}</td>
        <td contenteditable="true" class="editable" data-field="nama">${item.nama || ""}</td>
        <td contenteditable="true" class="editable" data-field="npm">${item.npm || ""}</td>
        <td contenteditable="true" class="editable" data-field="prodi">${item.prodi || ""}</td>
        <td contenteditable="true" class="editable" data-field="angkatan">${item.angkatan || ""}</td>
        <td contenteditable="true" class="editable" data-field="region">${item.region || ""}</td>
        <td contenteditable="true" class="editable" data-field="divisi1">${item.divisi1 || ""}</td>
        <td contenteditable="true" class="editable" data-field="alasan1">${item.alasan1 || ""}</td>
        <td contenteditable="true" class="editable" data-field="divisi2">${item.divisi2 || ""}</td>
        <td contenteditable="true" class="editable" data-field="alasan2">${item.alasan2 || ""}</td>
        <td><a href="${item.krsURL}" target="_blank">Lihat KRS</a></td>
        <td><button class="delete-btn">🗑️</button></td>
      </tr>`;
    tableBody.insertAdjacentHTML("beforeend", row);
  });

  // === DELETE BUTTON ===
  document.querySelectorAll(".delete-btn").forEach(btn => {
    btn.addEventListener("click", (e) => {
      const id = e.target.closest("tr").dataset.id;
      if (confirm("Yakin mau hapus data ini?")) {
        db.ref("pendaftar/" + id).remove()
          .then(() => showToast("Data berhasil dihapus 🗑️"))
          .catch(err => showToast("Gagal hapus: " + err.message));
      }
    });
  });

  // === EDITABLE FIELDS ===
  document.querySelectorAll(".editable").forEach(cell => {
    cell.addEventListener("blur", (e) => {
      const tr = e.target.closest("tr");
      const id = tr.dataset.id;
      const field = e.target.dataset.field;
      const value = e.target.textContent.trim();
      db.ref("pendaftar/" + id + "/" + field).set(value);
      showToast("Data diperbarui ✏️");
    });
  });
}

// === SEARCH ===
searchInput.addEventListener("input", (e) => {
  const keyword = e.target.value.toLowerCase();
  const filtered = Object.fromEntries(
    Object.entries(allData).filter(([_, v]) =>
      v.nama?.toLowerCase().includes(keyword) ||
      v.npm?.toLowerCase().includes(keyword)
    )
  );
  renderTable(filtered);
});

// === DOWNLOAD CSV ===
downloadBtn.addEventListener("click", () => {
  if (!allData || Object.keys(allData).length === 0)
    return showToast("Tidak ada data untuk diunduh!");

  let csv = "Nama,NPM,Prodi,Angkatan,Region,Divisi1,Alasan1,Divisi2,Alasan2,LinkKRS\n";
  Object.values(allData).forEach(item => {
    csv += `"${item.nama}","${item.npm}","${item.prodi}","${item.angkatan}","${item.region}","${item.divisi1}","${item.alasan1}","${item.divisi2}","${item.alasan2}","${item.krsURL}"\n`;
  });

  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "data_pendaftar_kmk_natal_2025.csv";
  a.click();
  showToast("CSV berhasil diunduh 📂");
});

// === REFRESH ===
refreshBtn.addEventListener("click", loadData);

// === TOAST ===
function showToast(msg) {
  const toast = document.getElementById("toast");
  toast.textContent = msg;
  toast.className = "show";
  setTimeout(() => toast.className = toast.className.replace("show", ""), 3000);
}
