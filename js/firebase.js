import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";

import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyCU-cFfdkTw4m3CBVW2Ng_pOXz8ivvIU4E",
  authDomain: "temperedlist.firebaseapp.com",
  projectId: "temperedlist",
  storageBucket: "temperedlist.firebasestorage.app",
  messagingSenderId: "191609705338",
  appId: "1:191609705338:web:293729cf40756d3e0dfcc3"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);

export const db = getFirestore(app);