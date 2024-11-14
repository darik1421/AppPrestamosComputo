import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";


const firebaseConfig = {
    apiKey: "AIzaSyB87YNA4hpvRPF-sLeWZ0KGNvoHqf7FxvY",
    authDomain: "appprestamoscomputo.firebaseapp.com",
    projectId: "appprestamoscomputo",
    storageBucket: "appprestamoscomputo.firebasestorage.app",
    messagingSenderId: "183301413509",
    appId: "1:183301413509:web:6c21f13d18f1b5e45b67ec",
    measurementId: "G-RCH8ZEHRYS"
};

// Initialize Firebase
let app;
if (getApps().length === 0) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApp();
}

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);