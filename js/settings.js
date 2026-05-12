import {
  collection,
  getDocs,
  updateDoc,
  doc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

import { db } from "./firebase.js";

// =========================
// SETTINGS PAGE
// =========================
window.openSettings = function () {

  document
    .getElementById("settingsPage")
    .classList.remove("hidden");

};

window.closeSettings = function () {

  document
    .getElementById("settingsPage")
    .classList.add("hidden");

};

// =========================
// MENU AKTIVASI AKUN
// =========================
window.openUserManagement = async function () {

  const container =
    document.getElementById("settingsContent");

  container.innerHTML = `
    <h2 class="text-xl font-bold mb-4">
      Aktivasi Akun
    </h2>

    <div id="userList"
    class="space-y-3">
    </div>
  `;

  loadUsers();

};

// =========================
// MENU STOK GUDANG
// =========================
window.openStockPage = function () {
  window.location.href = "stock.html";
};

// =========================
// LOAD USERS
// =========================
async function loadUsers() {

  const userList =
    document.getElementById("userList");

  const querySnapshot =
    await getDocs(collection(db, "users"));

  userList.innerHTML = "";

  querySnapshot.forEach((docSnap) => {

    const data = docSnap.data();

    userList.innerHTML += `
      <div class="bg-white dark:bg-gray-800 transition-colors duration-300 p-4 rounded-xl shadow flex justify-between items-center">

    <div>

      <p class="font-bold">
        ${data.email}
      </p>

      <p class="text-sm text-gray-500 dark:text-gray-300 ">
        ${data.role}
      </p>

      <p class="text-sm">
        Status:
        ${data.status || "pending"}
      </p>

    </div>

<div class="flex flex-col gap-2">

  <button
    onclick="approveUser('${docSnap.id}')"
    class="bg-green-500 text-white px-3 py-1 rounded">

    Approve

  </button>

  <select
    onchange="ubahRole('${docSnap.id}', this.value)"
    class="border px-2 py-1 rounded">

    <option value="karyawan"
      ${data.role === "karyawan" ? "selected" : ""}>
      Karyawan
    </option>

    <option value="administrator"
      ${data.role === "administrator" ? "selected" : ""}>
      Administrator
    </option>

  </select>

</div>

  </div>
    `;

  });
}

// =========================
// APPROVE USER
// =========================
window.approveUser = async function(uid) {

  try {

    await updateDoc(doc(db, "users", uid), {
      status: "active"
    });

    alert("User berhasil diapprove");

    loadUsers();

  } catch (e) {

    console.error(e);

    alert(e.message);

  };

}

// =========================
// UPDATE UI ROLE
// =========================
export function updateUIByRole(userRole) {

  const btn =
    document.getElementById("btnTambah");

  if (!btn) return;

  if (userRole === "administrator") {

    btn.style.display = "block";

  } else {

    btn.style.display = "none";

  }

}

// =========================
// UBAH ROLE
// =========================
window.ubahRole = async function(uid, roleBaru) {

  try {

    await updateDoc(doc(db, "users", uid), {
      role: roleBaru
    });

    alert("Role berhasil diupdate!");

    loadUsers();

  } catch (e) {

    console.error(e);

    alert(e.message);

  }

}