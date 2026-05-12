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

  const savedName =
  localStorage.getItem("tg_name");

  const savedPhoto =
  localStorage.getItem("tg_photo");

  // MOBILE NAV
  const navProfileImage =
  document.getElementById("navProfileImage");

  const adminDropdownMenu =
  document.getElementById("adminDropdownMenu");

  const adminPopupMenu =
  document.getElementById("adminPopupMenu");

if (userRole === "administrator") {

  if (adminDropdownMenu) {
    adminDropdownMenu.classList.remove("hidden");
  }

  if (adminPopupMenu) {
    adminPopupMenu.classList.remove("hidden");
  }

}

  // DROPDOWN MOBILE
  const dropdownProfileImage =
    document.getElementById("dropdownProfileImage");

  const dropdownProfileName =
    document.getElementById("dropdownProfileName");

  const dropdownProfileRole =
    document.getElementById("dropdownProfileRole");

  // SIDEBAR DESKTOP
  const sidebarProfileImage =
    document.getElementById("sidebarProfileImage");

  const sidebarProfileName =
    document.getElementById("sidebarProfileName");

  const sidebarProfileRole =
    document.getElementById("sidebarProfileRole");

  // POPUP PROFILE
  const popupProfileImage =
    document.getElementById("popupProfileImage");

  const popupProfileName =
    document.getElementById("popupProfileName");

  const popupProfileRole =
    document.getElementById("popupProfileRole");

  // ======================
  // MOBILE NAV
  // ======================
  if (navProfileImage) {

    navProfileImage.src =
      savedPhoto ||
      user.photoURL ||
      "https://i.pravatar.cc/150"

  }

  // ======================
  // DROPDOWN
  // ======================
  if (dropdownProfileImage) {

    dropdownProfileImage.src =
      savedPhoto ||
      user.photoURL ||
      "https://i.pravatar.cc/150"

    dropdownProfileName.innerText =
      savedName || user.email;

    dropdownProfileRole.innerText =
      role;

  }

  // ======================
  // SIDEBAR
  // ======================
  if (sidebarProfileImage) {

    sidebarProfileImage.src =
      savedPhoto ||
      user.photoURL ||
      "https://i.pravatar.cc/150"

    sidebarProfileName.innerText =
      savedName || user.email;

    sidebarProfileRole.innerText =
      role;

  }

  // ======================
  // POPUP
  // ======================
  if (popupProfileImage) {

    popupProfileImage.src =
      savedPhoto ||
    user.photoURL ||
    "https://i.pravatar.cc/150"

    popupProfileName.innerText =
      savedName || user.email;

    popupProfileRole.innerText =
      role;

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

    <div class="bg-white dark:bg-gray-800 transition-colors duration-300 p-4 rounded-xl shadow-md mb-3">

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

  // buka form
  document
    .getElementById("inputData")
    .classList.remove("hidden");

  // ambil input
  const nama_hp =
    document.getElementById("nama_hp");

  const tipe =
    document.getElementById("tipe");

  const layar =
    document.getElementById("layar");

  const tempered =
    document.getElementById("tempered");

  // isi data lama
  nama_hp.value = namaLama;
  tipe.value = tipeLama;
  layar.value = layarLama;
  tempered.value = temperedLama;

  // tombol simpan
  const saveBtn =
    document.getElementById("saveBtn");

  saveBtn.innerText = "Update Data";

  saveBtn.onclick = async () => {

    try {

      await updateDoc(
        doc(db, "tempered_glass", id),
        {
          nama_hp: nama_hp.value,
          tipe: tipe.value,
          layar: layar.value,
          tempered: tempered.value
        }
      );

      alert("Data berhasil diupdate!");

      // reset form
      nama_hp.value = "";
      tipe.value = "";
      layar.value = "";
      tempered.value = "";

      saveBtn.innerText = "Simpan Data";

      saveBtn.onclick = tambahData;

      document
        .getElementById("inputData")
        .classList.add("hidden");

      loadData();

    } catch (e) {

      console.error(e);

      alert(e.message);

    }

  };

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

          ||

          item.layar
          .toLowerCase()
          .includes(keyword)

        );

      });

    renderData(filtered);

  });

}

// =========================
// PROFILE MENU
// =========================
window.toggleProfileMenu = function () {

  document
    .getElementById("profileDropdown")
    .classList.toggle("hidden");

};

window.openProfilePopup = function () {

  document
    .getElementById("profilePopup")
    .classList.remove("hidden");

};

window.closeProfilePopup = function () {

  document
    .getElementById("profilePopup")
    .classList.add("hidden");

};

// =========================
// PROFILE SETTING
// =========================
window.openProfileSetting = function () {

  const settingsContent =
    document.getElementById("settingsContent");

    if (!settingsContent) {
  console.error("settingsContent tidak ditemukan");
  return;
}

  settingsContent.innerHTML = `

    <div class="bg-white dark:bg-gray-800 transition-colors duration-300 rounded-xl p-4 shadow">

      <h2 class="text-xl font-bold mb-4">
        Profile Setting
      </h2>

      <div class="space-y-3">

        <input
        id="editName"
        type="text"
        value="${localStorage.getItem("tg_name") || ""}"
        placeholder="Nama"
        class="w-full border p-3 rounded-lg">

      <input
        id="editPhoto"
        type="text"
        value="${localStorage.getItem("tg_photo") || ""}"
        placeholder="URL Foto Profile"
        class="w-full border p-3 rounded-lg">

        <button
          onclick="saveProfilePopup()"
          class="w-full bg-blue-500 text-white py-3 rounded-lg">

          Simpan Profile

        </button>

      </div>

    </div>

  `;

  openSettings();

};


// =========================
// SAVE PROFILE
// =========================
window.saveProfileSetting = function () {

  const name =
    document.getElementById("editName").value;

  const photo =
    document.getElementById("editPhoto").value;

  // simpan local
  localStorage.setItem("tg_name", name);
  localStorage.setItem("tg_photo", photo);

  // update profile navbar
  const images = [

    "navProfileImage",
    "dropdownProfileImage",
    "sidebarProfileImage",
    "popupProfileImage",
    "profileImage"

  ];

  images.forEach((id) => {

    const img =
      document.getElementById(id);

    if (img && photo) {

      img.src = photo;

    }

  });

  const names = [

    "dropdownProfileName",
    "sidebarProfileName",
    "popupProfileName",
    "profileName"

  ];

  names.forEach((id) => {

    const el =
      document.getElementById(id);

    if (el && name) {

      el.innerText = name;

    }

  });

  alert("Profile berhasil diupdate!");

};


// =========================
// THEME
// =========================
window.openThemeSetting = function () {

  const settingsContent =
    document.getElementById("settingsContent");

if (!settingsContent) {
  console.error("settingsContent tidak ditemukan");
  return;
}

  settingsContent.innerHTML = `

    <div class="bg-white dark:bg-gray-800 transition-colors duration-300 rounded-xl p-4 shadow">

      <h2 class="text-xl font-bold mb-4">
        Theme
      </h2>

      <div class="space-y-3">

        <button
          onclick="setTheme('light')"
          class="w-full bg-gray-100 py-3 rounded-lg">

          ☀️ Light Mode

        </button>

        <button
          onclick="setTheme('dark')"
          class="w-full bg-gray-900 text-white py-3 rounded-lg">

          🌙 Dark Mode

        </button>

      </div>

    </div>

  `;

  openSettings();

};


// =========================
// LOAD THEME
// =========================
const savedTheme =
  localStorage.getItem("tg_theme");

if (savedTheme) {

  setTheme(savedTheme);

}
// =========================
// OPEN SETTINGS
// =========================
window.openSettings = function () {

  const settingsPage =
    document.getElementById("settingsPage");

  settingsPage.classList.remove("hidden");

};

// =========================
// CLOSE SETTINGS
// =========================
window.closeSettings = function () {

  const settingsPage =
    document.getElementById("settingsPage");

  settingsPage.classList.add("hidden");

};