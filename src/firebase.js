// Firebase SDK'dan gerekli işlevleri içeri aktar
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore"; // Firestore entegrasyonu

// Firebase yapılandırması
const firebaseConfig = {
  apiKey: "AIzaSyBTCSPGFXgzXO7b3sTjniuQ9_uVrzsEKXU",
  authDomain: "siparis-form.firebaseapp.com",
  projectId: "siparis-form",
  storageBucket: "siparis-form.firebasestorage.app",
  messagingSenderId: "187236285725",
  appId: "1:187236285725:web:d959cf149ae5b56849f5f4"
};

// Firebase uygulamasını başlat
const app = initializeApp(firebaseConfig);

// Firestore veritabanını başlat ve dışa aktar
export const db = getFirestore(app);
