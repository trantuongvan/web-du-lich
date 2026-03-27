import { initializeApp } from "https://www.gstatic.com/firebasejs/10.10.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.10.0/firebase-auth.js";
const firebaseConfig = {
  apiKey: "AIzaSyCESBqO9VwF4BSQsTtoxkJQ0EIxuZ2XOf0",
  authDomain: "travlia.firebaseapp.com",
  projectId: "travlia",
  storageBucket: "travlia.firebasestorage.app",
  messagingSenderId: "623505134815",
  appId: "1:623505134815:web:a9061b53c6db2fcb4cc56a",
  measurementId: "G-X4YM89JF0S"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);