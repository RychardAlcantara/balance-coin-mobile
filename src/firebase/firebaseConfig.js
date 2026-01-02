// src/firebase/firebaseConfig.js
import AsyncStorage from "@react-native-async-storage/async-storage";
import { initializeApp } from "firebase/app";
import { getReactNativePersistence, initializeAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCQPerxJhyyyXfnUHp_kxVwDNQKl9Dt3OY",
  authDomain: "balance-coin-mobile.firebaseapp.com",
  projectId: "balance-coin-mobile",
  storageBucket: "balance-coin-mobile.firebasestorage.app",
  messagingSenderId: "824026242147",
  appId: "1:824026242147:web:36326acb3679e2d31a6c56"
};

const app = initializeApp(firebaseConfig);

// 👇 Inicializa o Auth com persistência no AsyncStorage
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});

const db = getFirestore(app);

export { app, auth, db };

