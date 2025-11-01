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
const tableBody = document.getElementById("dataBody");

// === Menampilkan data ===
function loadData() {
  db.ref("pendaftar").on("value", snapshot => {
    tableBody.innerHTML = "";
    snapshot.forEach(child => {
      const data = child.val();
      const id = child.key;

      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${data.nama}</td>
        <td>${data.npm}</td>
        <td>${data.prodi}</td>
        <td>${data.angkatan}</td>
        <td>${data.noTelp}</td>
        <td>${data.region}</td>
        <td>${data.divisi1}</td>
        <td>${data.alasan1}</td>
        <td>${data.divisi2}</td>
        <td>${data.alasan2}</td>
        <td><a href="${data.krsURL}" target="_blank">Link</a></td>
        <td><button class="deleteBtn" data-id="${id}">🗑️</button></td>
      `;
      tableBody.appendChild(row);
    });

    // Tambahkan event listener delete setelah render
    document.querySelectorAll(".deleteBtn").forEach(btn => {
      btn.addEventListener("click", e => {
        const id = e.target.dataset.id;
        if (confirm("Yakin mau hapus data ini?")) {
          db.ref("pendaftar/" + id).remove();
        }
      });
    });
  });
}

loadData();

// === Download CSV ===
document.getElementById("downloadCSV").addEventListener("click", () => {
  db.ref("pendaftar").once("value").then(snapshot => {
    const rows = [
      ["Nama", "NPM", "Prodi", "Angkatan", "No Telp", "Region", "Divisi1", "Alasan1", "Divisi2", "Alasan2", "Link KRS"]
    ];
    snapshot.forEach(child => {
      const d = child.val();
      rows.push([
        d.nama, d.npm, d.prodi, d.angkatan, d.noTelp, d.region,
        d.divisi1, d.alasan1, d.divisi2, d.alasan2, d.krsURL
      ]);
    });

    let csvContent = rows.map(e => e.map(x => `"${x}"`).join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "data_pendaftar.csv";
    link.click();
  });
});
