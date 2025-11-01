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
const loginScreen = document.getElementById("login-screen");
const adminPanel = document.getElementById("admin-panel");
const loginBtn = document.getElementById("login-btn");
const logoutBtn = document.getElementById("logout");
const refreshBtn = document.getElementById("refresh");
const downloadBtn = document.getElementById("download");
const tableBody = document.getElementById("table-body");
const errorText = document.getElementById("login-error");

loginBtn.addEventListener("click", () => {
  const pass = document.getElementById("admin-pass").value.trim();
  if (pass === ADMIN_PASS) {
    loginScreen.classList.add("hidden");
    adminPanel.classList.remove("hidden");
    loadData();
  } else {
    errorText.textContent = "❌ Password salah!";
  }
});

logoutBtn.addEventListener("click", () => {
  adminPanel.classList.add("hidden");
  loginScreen.classList.remove("hidden");
});

function loadData() {
  tableBody.innerHTML = "<tr><td colspan='13'>⏳ Memuat data...</td></tr>";
  db.ref("pendaftar").once("value").then(snapshot => {
    const data = snapshot.val();
    if (!data) {
      tableBody.innerHTML = "<tr><td colspan='13'>Belum ada data.</td></tr>";
      return;
    }
    tableBody.innerHTML = "";
    Object.entries(data).forEach(([id, item], i) => {
      const row = `
        <tr>
          <td>${i + 1}</td>
          <td>${item.nama}</td>
          <td>${item.npm}</td>
          <td>${item.prodi}</td>
          <td>${item.angkatan}</td>
          <td>${item.region}</td>
          <td>${item.notelp}</td>
          <td>${item.divisi1}</td>
          <td>${item.alasan1}</td>
          <td>${item.divisi2}</td>
          <td>${item.alasan2}</td>
          <td><a href="${item.krsURL}" target="_blank">Lihat</a></td>
          <td><button class="delete-btn" onclick="hapusData('${id}')">Hapus</button></td>
        </tr>`;
      tableBody.insertAdjacentHTML("beforeend", row);
    });
  });
}

function hapusData(id) {
  if (confirm("Yakin ingin menghapus data ini?")) {
    db.ref("pendaftar/" + id).remove().then(loadData);
  }
}

refreshBtn.addEventListener("click", loadData);

downloadBtn.addEventListener("click", () => {
  db.ref("pendaftar").once("value").then(snapshot => {
    const data = snapshot.val();
    if (!data) return alert("Belum ada data.");
    let csv = "Nama,NPM,Prodi,Angkatan,Region,NoTelp,Divisi1,Alasan1,Divisi2,Alasan2,KRS\n";
    Object.values(data).forEach(d => {
      csv += `"${d.nama}","${d.npm}","${d.prodi}","${d.angkatan}","${d.region}","${d.notelp}","${d.divisi1}","${d.alasan1}","${d.divisi2}","${d.alasan2}","${d.krsURL}"\n`;
    });
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "data_pendaftar_kmk_natal_2025.csv";
    a.click();
  });
});
