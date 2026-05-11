import { auth, db } from "./firebase.js";

import { 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

import { 
  doc, 
  setDoc,
  getDoc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyCU-cFfdkTw4m3CBVW2Ng_pOXz8ivvIU4E",
  authDomain: "temperedlist.firebaseapp.com",
  projectId: "temperedlist"
};

const provider = new GoogleAuthProvider();


// ================= AUTO REDIRECT =================
onAuthStateChanged(auth, async (user) => {

  if (!user) return;

  try {

    const userRef = doc(db, "users", user.uid);

    const snap = await getDoc(userRef);

    if (!snap.exists()) return;

    const data = snap.data();

    // 🚫 belum disetujui admin
    if (data.status !== "active") {

      alert("Akun belum diverifikasi admin!");

      await signOut(auth);

      return;
    }

    // ✅ boleh masuk
    window.location.href = "index.html";

  } catch (e) {

    console.error(e);

  }

});


// ================= LOGIN EMAIL =================
window.login = async function () {

  try {

    const email = loginEmail.value.trim();

    const pass = loginPassword.value.trim();

    if (!email || !pass) {
      alert("Isi email & password!");
      return;
    }

    await signInWithEmailAndPassword(auth, email, pass);

  } catch (e) {

    console.error(e);

    alert(e.message);

  }

};


// ================= REGISTER =================
window.register = async function () {

  try {

    const email = regEmail.value.trim();

    const pass = regPassword.value.trim();

    if (!email || !pass) {

      alert("Email & Password wajib diisi!");

      return;

    }

    // buat akun auth
    const res = await createUserWithEmailAndPassword(
      auth,
      email,
      pass
    );

    // simpan firestore
    await setDoc(doc(db, "users", res.user.uid), {

      email: email,

      role: "karyawan",

      status: "pending",

      createdAt: new Date()

    });

    alert("Daftar berhasil! Tunggu approval admin.");

    showLogin();

  } catch (e) {

    console.error(e);

    alert(e.message);

  }

};


// ================= LOGIN GOOGLE =================
window.loginGoogle = async function () {

  try {

    const res = await signInWithPopup(auth, provider);

    const userRef = doc(db, "users", res.user.uid);

    const snap = await getDoc(userRef);

    // user baru
    if (!snap.exists()) {

      await setDoc(userRef, {

        email: res.user.email,

        role: "karyawan",

        status: "pending",

        createdAt: new Date()

      });

      alert("Akun dibuat! Tunggu approval admin.");

      await signOut(auth);

      return;

    }

    const data = snap.data();

    if (data.status !== "active") {

      alert("Akun belum diverifikasi admin!");

      await signOut(auth);

      return;

    }

    window.location.href = "index.html";

  } catch (e) {

    console.error(e);

    alert(e.message);

  }

};


// ================= UI =================
window.showRegister = () => {

  loginForm.classList.add("hidden");

  registerForm.classList.remove("hidden");

  title.innerText = "Daftar";

};

window.showLogin = () => {

  loginForm.classList.remove("hidden");

  registerForm.classList.add("hidden");

  title.innerText = "Login";

}