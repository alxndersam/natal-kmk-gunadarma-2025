// Inisialisasi Firebase
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  databaseURL: "https://kmk-natal-2025-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "kmk-natal-2025",
  storageBucket: "kmk-natal-2025.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID",
};

firebase.initializeApp(firebaseConfig);
const database = firebase.database();

// Referensi node pendaftar
const dataRef = database.ref("pendaftar");

// Fungsi render tabel
function renderTable(snapshot) {
  const tbody = document.getElementById("data-body");
  tbody.innerHTML = "";

  let index = 1;
  snapshot.forEach((childSnapshot) => {
    const item = childSnapshot.val();

    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${index++}</td>
      <td>${item.nama || "-"}</td>
      <td>${item.npm || "-"}</td>
      <td>${item.prodi || "-"}</td>
      <td>${item.angkatan || "-"}</td>
      <td>${item.telepon || "-"}</td>
      <td>${item.region || "-"}</td>
      <td>${item.divisi1 || "-"}</td>
      <td>${item.alasan1 || "-"}</td>
      <td>${item.divisi2 || "-"}</td>
      <td>${item.alasan2 || "-"}</td>
      <td><a href="${item.linkKRS || "#"}" target="_blank">Link</a></td>
      <td><button class="hapus-btn" data-id="${childSnapshot.key}">🗑</button></td>
    `;
    tbody.appendChild(row);
  });

  // tombol hapus
  document.querySelectorAll(".hapus-btn").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const id = e.target.getAttribute("data-id");
      if (confirm("Yakin mau hapus data ini?")) {
        dataRef.child(id).remove();
      }
    });
  });
}

// Ambil data real-time
dataRef.on("value", renderTable);

// Tombol muat ulang
document.getElementById("reloadBtn").addEventListener("click", () => {
  dataRef.once("value").then(renderTable);
});

// Tombol unduh CSV
document.getElementById("downloadCSV").addEventListener("click", () => {
  dataRef.once("value").then((snapshot) => {
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Nama,NPM,Prodi,Angkatan,Telepon,Region,Divisi1,Alasan1,Divisi2,Alasan2,Link KRS\n";

    snapshot.forEach((childSnapshot) => {
      const item = childSnapshot.val();
      const row = [
        item.nama,
        item.npm,
        item.prodi,
        item.angkatan,
        item.telepon,
        item.region,
        item.divisi1,
        item.alasan1,
        item.divisi2,
        item.alasan2,
        item.linkKRS,
      ]
        .map((v) => `"${v || "-"}"`)
        .join(",");
      csvContent += row + "\n";
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "data_pendaftar.csv");
    document.body.appendChild(link);
    link.click();
  });
});

// Tombol logout
document.getElementById("logoutBtn").addEventListener("click", () => {
  window.location.href = "index.html";
});
