import { db } from "./firebase.js";

import {
  collection,
  addDoc,
  getDocs,
  updateDoc,
  doc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";


// LOAD DATA
async function loadStock() {

  const stockList =
    document.getElementById("stockList");

  stockList.innerHTML = "";

  const querySnapshot =
    await getDocs(collection(db, "stock"));

    querySnapshot.forEach((docSnap) => {

        const item = docSnap.data();

        stockList.innerHTML += `

        <div class="bg-white p-4 rounded shadow mb-3">

            <h2 class="font-bold text-lg">
            ${item.nama_tempered}
            </h2>

            <p>
            Jenis:
            ${item.jenis}
            </p>

            <p>
            Jumlah:
            ${item.jumlah}
            </p>

            <button
            class="editBtn mt-3 bg-yellow-500 text-white px-3 py-1 rounded"
            data-id="${docSnap.id}"
            data-nama="${item.nama_tempered}"
            data-jenis="${item.jenis}"
            data-jumlah="${item.jumlah}">

            Edit

            </button>

        </div>

        `;

    });
    document.querySelectorAll(".editBtn")
    .forEach((btn) => {

        btn.addEventListener("click", () => {

            window.editStock(
            btn.dataset.id,
            btn.dataset.nama,
            btn.dataset.jenis,
            btn.dataset.jumlah
            );

        });

    });
}


// TAMBAH
window.tambahStock = async function () {

  const nama_tempered =
    document.getElementById("nama_tempered").value;

  const jenis =
    document.getElementById("jenis").value;

  const jumlah =
    document.getElementById("jumlah").value;

  if (!nama_tempered || !jenis || !jumlah) {

    alert("Isi semua data!");

    return;

  }

  await addDoc(collection(db, "stock"), {

    nama_tempered,
    jenis,
    jumlah

  });

  document.getElementById("nama_tempered").value = "";
  document.getElementById("jenis").value = "";
  document.getElementById("jumlah").value = "";

  loadStock();

};

// EDIT
window.editStock = async function (
  id,
  namaLama,
  jenisLama,
  jumlahLama
) {

  const nama_tempered =
    document.getElementById("nama_tempered");

  const jenis =
    document.getElementById("jenis");

  const jumlah =
    document.getElementById("jumlah");

  nama_tempered.value = namaLama;
  jenis.value = jenisLama;
  jumlah.value = jumlahLama;

  // ubah tombol tambah jadi update
  const btn =
    document.getElementById("btnSaveStock");

  btn.innerText = "Update Stock";

  btn.onclick = async () => {

    await updateDoc(doc(db, "stock", id), {

      nama_tempered: nama_tempered.value,
      jenis: jenis.value,
      jumlah: jumlah.value

    });

    alert("Stock berhasil diupdate!");

    nama_tempered.value = "";
    jenis.value = "";
    jumlah.value = "";

    btn.innerText = "Tambah Stock";

    btn.onclick = tambahStock;

    loadStock();

  };

};

loadStock();