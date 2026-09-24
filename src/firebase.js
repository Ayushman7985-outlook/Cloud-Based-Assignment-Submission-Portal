import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyBAMa2PfTxdh-My967sS0Sn_WJQypqwA9M",
  authDomain: "cloud-assignment-portal.firebaseapp.com",
  projectId: "cloud-assignment-portal",
  storageBucket: "cloud-assignment-portal.firebasestorage.app",
  messagingSenderId: "84462101218",
  appId: "1:84462101218:web:8c158e89c15e6fc75e34bb",
  measurementId: "G-G9WL9JVK8P"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);