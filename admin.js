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

// === Ambil Data ===
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
      Object.entries(data).forEach(([key, item], i) => {
        const row = `
          <tr data-id="${key}">
            <td>${i + 1}</td>
            <td contenteditable="true" class="editable" data-field="nama">${item.nama || ""}</td>
            <td contenteditable="true" class="editable" data-field="npm">${item.npm || ""}</td>
            <td contenteditable="true" class="editable" data-field="prodi">${item.prodi || ""}</td>
            <td contenteditable="true" class="editable" data-field="angkatan">${item.angkatan || ""}</td>
            <td contenteditable="true" class="editable" data-field="region">${item.region || ""}</td>
            <td contenteditable="true" class="editable" data-field="nohp">${item.nohp || ""}</td>
            <td contenteditable="true" class="editable" data-field="divisi1">${item.divisi1 || ""}</td>
            <td contenteditable="true" class="editable" data-field="alasan1">${item.alasan1 || ""}</td>
            <td contenteditable="true" class="editable" data-field="divisi2">${item.divisi2 || ""}</td>
            <td contenteditable="true" class="editable" data-field="alasan2">${item.alasan2 || ""}</td>
            <td><a href="${item.krsURL}" target="_blank">Lihat KRS</a></td>
            <td><button class="delete-btn">🗑️</button></td>
          </tr>`;
        tableBody.insertAdjacentHTML("beforeend", row);
      });

      addListeners();
    })
    .catch(err => {
      tableBody.innerHTML = `<tr><td colspan="13">❌ Gagal memuat data: ${err.message}</td></tr>`;
    });
}

// === Tombol Refresh ===
refreshBtn.addEventListener("click", loadData);

// === Edit Inline ===
function addListeners() {
  document.querySelectorAll(".editable").forEach(cell => {
    cell.addEventListener("blur", e => {
      const id = e.target.closest("tr").dataset.id;
      const field = e.target.dataset.field;
      const value = e.target.textContent.trim();
      db.ref("pendaftar/" + id + "/" + field).set(value);
      showToast("✅ Data diperbarui");
    });
  });

  document.querySelectorAll(".delete-btn").forEach(btn => {
    btn.addEventListener("click", e => {
      const id = e.target.closest("tr").dataset.id;
      if (confirm("Yakin mau hapus data ini?")) {
        db.ref("pendaftar/" + id).remove();
        e.target.closest("tr").remove();
        showToast("🗑️ Data dihapus");
      }
    });
  });
}

// === Download CSV ===
downloadBtn.addEventListener("click", () => {
  db.ref("pendaftar").once("value")
    .then(snapshot => {
      const data = snapshot.val();
      if (!data) return alert("Belum ada data untuk diunduh.");

      const rows = Object.values(data);
      let csv = "Nama,NPM,Prodi,Angkatan,Region,NoHP,Divisi1,Alasan1,Divisi2,Alasan2,LinkKRS\n";
      rows.forEach(item => {
        csv += `"${item.nama}","${item.npm}","${item.prodi}","${item.angkatan}","${item.region}","${item.nohp}","${item.divisi1}","${item.alasan1}","${item.divisi2}","${item.alasan2}","${item.krsURL}"\n`;
      });

      const blob = new Blob([csv], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "data_pendaftar_kmk_natal_2025.csv";
      document.body.appendChild(a);
      a.click();
      a.remove();
    });
});

// === Toast ===
function showToast(msg) {
  const toast = document.getElementById("toast");
  toast.textContent = msg;
  toast.className = "show";
  setTimeout(() => { toast.className = toast.className.replace("show", ""); }, 3000);
}
