import { auth, db } from "./firebase.js";
import { updateUIByRole } from "./settings.js";

import {
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

import {
  collection,
  addDoc,
  getDocs,
  getDoc,
  updateDoc,
  doc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

let currentUser = null;
let userRole = null;

// =========================
// LOGOUT
// =========================
window.logoutUser = async function () {

  await signOut(auth);

  window.location.href = "auth.html";

};


// =========================
// CEK LOGIN
// =========================
onAuthStateChanged(auth, async (user) => {

  const profile =
    document.getElementById("profileArea");

  currentUser = user;

  if (!user) {

    window.location.href = "auth.html";

    return;

  }

  try {

    const docRef =
      doc(db, "users", user.uid);

    const docSnap =
      await getDoc(docRef);

    if (docSnap.exists()) {

      userRole =
        docSnap.data().role;

    } else {

      userRole = "karyawan";

    }

    window.userRole = userRole;

    profile.innerHTML = `

      <img
      src="${
        user.photoURL ||
        "https://ui-avatars.com/api/?name=User"
      }"
      class="w-8 h-8 rounded-full">

    `;
 
    updateUIByRole(userRole);
    updateProfileUI(user, userRole);

    await loadData();
  } catch (e) {

    console.error(e);

    alert(e.message);

  }

});


// =========================
// PROFILE UI
// =========================
function updateProfileUI(user, role) {

  const profileImage =
    document.getElementById("profileImage");

  const profileName =
    document.getElementById("profileName");

  const profileRole =
    document.getElementById("profileRole");

  if (!profileImage) return;

  profileImage.src =
    user.photoURL ||
    "https://i.pravatar.cc/150";

  profileName.innerText =
    user.email;

  profileRole.innerText =
    role;

  if (role === "administrator") {

    document
      .getElementById("adminMenu")
      .classList.remove("hidden");
        
  }

}


// =========================
// TOGGLE FORM
// =========================
window.toggleForm = function () {

  document
    .getElementById("inputData")
    .classList.toggle("hidden");

};


// =========================
// LOAD DATA
// =========================
let allData = [];
async function loadData() {

  const querySnapshot =
    await getDocs(
      collection(db, "tempered_glass")
    );

  allData = [];

  querySnapshot.forEach((docSnap) => {

    const item = docSnap.data();

    allData.push({
      id: docSnap.id,
      ...item
    });

  });

  renderData(allData);

}

function renderData(data) {

  const container =
    document.getElementById("dataList");

  container.innerHTML = "";

  data.forEach((item) => {

    container.innerHTML += `

    <div class="bg-white p-4 rounded shadow mb-2">

      <h2 class="font-bold text-lg">
        ${item.nama_hp}
      </h2>

      <p>${item.tipe}</p>

      <p>${item.layar}</p>

      <p class="text-blue-500">
        ${item.tempered}
      </p>

      ${
        userRole === "administrator"
        ? `
        <button
        class="editBtn mt-3 bg-yellow-500 text-white px-3 py-1 rounded"
        data-id="${item.id}"
        data-nama="${item.nama_hp}"
        data-tipe="${item.tipe}"
        data-layar="${item.layar}"
        data-tempered="${item.tempered}">

        <i class="bi bi-pencil-fill"></i>

        </button>
        `
        : ""
      }

    </div>

    `;

  });

  document.querySelectorAll(".editBtn")
  .forEach((btn) => {

    btn.addEventListener("click", () => {

      window.editData(
        btn.dataset.id,
        btn.dataset.nama,
        btn.dataset.tipe,
        btn.dataset.layar,
        btn.dataset.tempered
      );

    });

  });

}

// =========================
// TOGGLE SEARCH
// =========================
window.toggleSearch = function () {

  const searchBox =
    document.getElementById("searchbox");

  const input =
    document.getElementById("searchInput");

  // buka
  if (searchBox.classList.contains("hidden")) {

    searchBox.classList.remove("hidden");

    setTimeout(() => {

      searchBox.classList.remove(
        "opacity-0",
        "-translate-y-5"
      );

    }, 10);

    // autofocus
    setTimeout(() => {

      input.focus();

    }, 200);

  }

  // tutup
  else {

    searchBox.classList.add(
      "opacity-0",
      "-translate-y-5"
    );

    setTimeout(() => {

      searchBox.classList.add("hidden");

    }, 300);

  }

};

// =========================
// TAMBAH DATA
// =========================
window.tambahData = async function () {

  if (!currentUser) {

    alert("Login dulu!");

    return;

  }

  if (userRole === "karyawan") {

    alert("Tidak punya akses!");

    return;

  }

  const nama_hp =
    document.getElementById("nama_hp").value;

  const tipe =
    document.getElementById("tipe").value;

  const layar =
    document.getElementById("layar").value;

  const tempered =
    document.getElementById("tempered").value;

  try {

    await addDoc(
      collection(db, "tempered_glass"),
      {
        nama_hp,
        tipe,
        layar,
        tempered
      }
    );

    alert("Data berhasil ditambahkan!");

    document.getElementById("nama_hp").value = "";
    document.getElementById("tipe").value = "";
    document.getElementById("layar").value = "";
    document.getElementById("tempered").value = "";

    
    document.getElementById("inputData")
  .classList.add("hidden");

  
  await loadData();

  } catch (e) {

    console.error(e);

    alert(e.message);

  }

}

window.editData = async function (
  id,
  namaLama,
  tipeLama,
  layarLama,
  temperedLama
) {

  const nama_hp =
    prompt("Nama HP", namaLama);

  const tipe =
    prompt("Tipe", tipeLama);

  const layar =
    prompt("Ukuran layar", layarLama);

  const tempered =
    prompt("Tempered Glass", temperedLama);

  if (
    !nama_hp ||
    !tipe ||
    !layar ||
    !tempered
  ) return;

  try {

    await updateDoc(
      doc(db, "tempered_glass", id),
      {
        nama_hp,
        tipe,
        layar,
        tempered
      }
    );

    alert("Data berhasil diupdate!");

    loadData();

  } catch (e) {

    console.error(e);

    alert(e.message);

  }

};

// =========================
// UPDATE ROLE
// =========================
window.ubahRole = async function(uid, roleBaru) {

  try {

    await updateDoc(doc(db, "users", uid), {
      role: roleBaru
    });

    alert("Role berhasil diubah!");

  } catch (e) {

    console.error(e);

  }

}

// =========================
// TOGGLE SEARCH MOBILE
// =========================
window.toggleSearch = function () {

  const searchBox =
    document.getElementById("searchbox");

  const input =
    document.getElementById("searchInput");

  // buka
  if (searchBox.classList.contains("hidden")) {

    searchBox.classList.remove("hidden");

    setTimeout(() => {

      searchBox.classList.remove(
        "opacity-0",
        "-translate-y-5"
      );

      searchBox.classList.add(
        "opacity-100",
        "translate-y-0"
      );

      input.focus();

    }, 10);

  }

  // tutup
  else {

    searchBox.classList.remove(
      "opacity-100",
      "translate-y-0"
    );

    searchBox.classList.add(
      "opacity-0",
      "-translate-y-5"
    );

    setTimeout(() => {

      searchBox.classList.add("hidden");

    }, 300);

  }

};


// =========================
// REALTIME SEARCH
// =========================
const searchInput =
  document.getElementById("searchInput");

if (searchInput) {

  searchInput.addEventListener("input", (e) => {

    const keyword =
      e.target.value.toLowerCase();

    const filtered =
      allData.filter((item) => {

        return (

          item.nama_hp
          .toLowerCase()
          .includes(keyword)

          ||

          item.tipe
          .toLowerCase()
          .includes(keyword)

          ||

          item.tempered
          .toLowerCase()
          .includes(keyword)

        );

      });

    renderData(filtered);

  });

}