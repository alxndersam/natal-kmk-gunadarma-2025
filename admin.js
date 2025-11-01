// admin.js
// Firebase config - gunakan data yang udah lo kasih
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
const NODE = "pendaftar"; // pastikan node ini sesuai di Firebase

// DOM
const loginScreen = document.getElementById("login-screen");
const adminPanel = document.getElementById("admin-panel");
const loginBtn = document.getElementById("login-btn");
const logoutBtn = document.getElementById("logout");
const refreshBtn = document.getElementById("refresh");
const downloadBtn = document.getElementById("download");
const tableBody = document.getElementById("table-body");
const loginError = document.getElementById("login-error");
const searchInput = document.getElementById("search");
const toastEl = document.getElementById("toast");

const ADMIN_PASS = "kmknatal2025";
let allData = {}; // cache

// helper toast
function showToast(msg){
  toastEl.textContent = msg;
  toastEl.style.display = "block";
  toastEl.style.opacity = "1";
  setTimeout(()=>{ toastEl.style.transition = "opacity 0.4s"; toastEl.style.opacity = "0"; }, 2200);
  setTimeout(()=>{ toastEl.style.display = "none"; toastEl.style.transition = ""; }, 2600);
}

// login
loginBtn.addEventListener("click", () => {
  const pass = document.getElementById("admin-pass").value || "";
  if (pass.trim() === ADMIN_PASS) {
    loginScreen.classList.add("hidden");
    adminPanel.classList.remove("hidden");
    loadData();
    showToast("Login berhasil ✅");
  } else {
    loginError.textContent = "❌ Password salah!";
    setTimeout(()=> loginError.textContent = "", 3000);
  }
});

// logout
logoutBtn.addEventListener("click", () => {
  adminPanel.classList.add("hidden");
  loginScreen.classList.remove("hidden");
  document.getElementById("admin-pass").value = "";
  showToast("Logout sukses");
});

// load data (real-time)
function loadData(){
  tableBody.innerHTML = "<tr><td colspan='13'>⏳ Memuat data...</td></tr>";
  db.ref(NODE).on("value", snapshot => {
    const data = snapshot.val();
    allData = data || {};
    renderTable(allData);
  }, err => {
    tableBody.innerHTML = `<tr><td colspan="13">❌ Gagal memuat data: ${err.message}</td></tr>`;
  });
}

// render table from object
function renderTable(dataObj){
  tableBody.innerHTML = "";
  const entries = Object.entries(dataObj || {});
  if (entries.length === 0) {
    tableBody.innerHTML = "<tr><td colspan='13'>Belum ada data pendaftar.</td></tr>";
    return;
  }

  entries.forEach(([key, item], idx) => {
    const nama = item.nama || "";
    const npm = item.npm || "";
    const prodi = item.prodi || "";
    const angkatan = item.angkatan || "";
    const telp = item.telp || item.nomorTelp || item.nomor_telpon || item.nomor_tel || "";
    const region = item.region || "";
    const div1 = item.divisi1 || item.divisi_1 || "";
    const alasan1 = item.alasan1 || "";
    const div2 = item.divisi2 || item.divisi_2 || "";
    const alasan2 = item.alasan2 || "";
    const krs = item.krsURL || item.krs || "";

    const tr = document.createElement("tr");
    tr.dataset.id = key;
    tr.innerHTML = `
      <td>${idx+1}</td>
      <td contenteditable="true" class="editable" data-field="nama">${escapeHtml(nama)}</td>
      <td contenteditable="true" class="editable" data-field="npm">${escapeHtml(npm)}</td>
      <td contenteditable="true" class="editable" data-field="prodi">${escapeHtml(prodi)}</td>
      <td contenteditable="true" class="editable" data-field="angkatan">${escapeHtml(angkatan)}</td>
      <td contenteditable="true" class="editable" data-field="telp">${escapeHtml(telp)}</td>
      <td contenteditable="true" class="editable" data-field="region">${escapeHtml(region)}</td>
      <td contenteditable="true" class="editable" data-field="divisi1">${escapeHtml(div1)}</td>
      <td contenteditable="true" class="editable" data-field="alasan1">${escapeHtml(alasan1)}</td>
      <td contenteditable="true" class="editable" data-field="divisi2">${escapeHtml(div2)}</td>
      <td contenteditable="true" class="editable" data-field="alasan2">${escapeHtml(alasan2)}</td>
      <td><a class="table-link" href="${krs}" target="_blank" rel="noopener">Link</a></td>
      <td><button class="delete-btn" title="Hapus">🗑️</button></td>
    `;
    tableBody.appendChild(tr);
  });

  attachRowHandlers();
}

// attach delete + edit handlers
function attachRowHandlers(){
  // delete
  document.querySelectorAll(".delete-btn").forEach(btn => {
    btn.onclick = async (e) => {
      const tr = e.target.closest("tr");
      const id = tr.dataset.id;
      if (!confirm("Yakin mau hapus data ini?")) return;
      try {
        await db.ref(`${NODE}/${id}`).remove();
        showToast("Data berhasil dihapus 🗑️");
      } catch (err) {
        showToast("Gagal hapus: " + err.message);
      }
    }
  });

  // editable blur -> save
  document.querySelectorAll(".editable").forEach(cell => {
    cell.addEventListener("blur", (e) => {
      const tr = e.target.closest("tr");
      const id = tr.dataset.id;
      const field = e.target.dataset.field;
      const value = e.target.textContent.trim();
      // normalize field names for telp vs nomor
      const saveField = (field === "telp") ? "telp" : field;
      db.ref(`${NODE}/${id}/${saveField}`).set(value)
        .then(()=> showToast("Data diperbarui ✏️"))
        .catch(err => showToast("Gagal update: " + err.message));
    });
  });
}

// search
searchInput.addEventListener("input", (e) => {
  const q = (e.target.value || "").toLowerCase();
  if (!q) return renderTable(allData);
  const filtered = Object.fromEntries(Object.entries(allData || {}).filter(([k,v]) => {
    const s = `${v.nama||""} ${v.npm||""} ${v.telp||v.nomorTelp||""} ${v.region||""}`.toLowerCase();
    return s.includes(q);
  }));
  renderTable(filtered);
});

// refresh button (one-shot)
refreshBtn.addEventListener("click", () => {
  showToast("Memuat ulang ...");
  // detach and re-attach listener to force refresh
  db.ref(NODE).off();
  loadData();
});

// download CSV
downloadBtn.addEventListener("click", () => {
  if (!allData || Object.keys(allData).length === 0) return showToast("Tidak ada data untuk diunduh");
  let csv = "Nama,NPM,Prodi,Angkatan,NomorTelp,Region,Divisi1,Alasan1,Divisi2,Alasan2,LinkKRS\n";
  Object.values(allData).forEach(item => {
    const row = [
      item.nama||"",
      item.npm||"",
      item.prodi||"",
      item.angkatan||"",
      (item.telp||item.nomorTelp||""),
      item.region||"",
      item.divisi1||item.divisi_1||"",
      item.alasan1||"",
      item.divisi2||item.divisi_2||"",
      item.alasan2||"",
      item.krsURL||item.krs||""
    ];
    csv += row.map(r => `"${String(r).replace(/"/g,'""')}"`).join(",") + "\n";
  });
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = "data_pendaftar_kmk_natal_2025.csv"; document.body.appendChild(a); a.click(); a.remove();
  showToast("CSV berhasil diunduh 📂");
});

// util escape
function escapeHtml(str){
  if (!str) return "";
  return String(str).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");
}
