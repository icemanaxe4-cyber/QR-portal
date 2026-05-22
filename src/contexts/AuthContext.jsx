// src/contexts/AuthContext.jsx
import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  GoogleAuthProvider,
  signInWithPopup,
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../firebase';

const googleProvider = new GoogleAuthProvider();

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [userProfile, setUserProfile]   = useState(null);
  const [loading, setLoading]           = useState(true);

  // ── Sign Up ────────────────────────────────────────────────────────────────
  async function signup(email, password, displayName) {
    const credential = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(credential.user, { displayName });

    const profileData = {
      uid:         credential.user.uid,
      email,
      displayName,
      role:        'professor',
      approved:    true,           // all users auto-approved
      createdAt:   serverTimestamp(),
    };

    await setDoc(doc(db, 'users', credential.user.uid), profileData);
    return credential;
  }

  // ── Sign In ────────────────────────────────────────────────────────────────
  async function login(email, password) {
    return signInWithEmailAndPassword(auth, email, password);
  }

  // ── Google Sign-In ─────────────────────────────────────────────────────────
  async function loginWithGoogle() {
    const credential = await signInWithPopup(auth, googleProvider);
    const user = credential.user;

    const snap = await getDoc(doc(db, 'users', user.uid));
    if (!snap.exists()) {
      await setDoc(doc(db, 'users', user.uid), {
        uid:         user.uid,
        email:       user.email,
        displayName: user.displayName || user.email,
        role:        'professor',
        approved:    true,
        createdAt:   serverTimestamp(),
        provider:    'google',
      });
    }
    return credential;
  }

  // ── Sign Out ───────────────────────────────────────────────────────────────
  function logout() {
    return signOut(auth);
  }

  // ── Fetch Firestore profile ────────────────────────────────────────────────
  async function fetchProfile(uid) {
    const snap = await getDoc(doc(db, 'users', uid));
    if (snap.exists()) {
      setUserProfile(snap.data());
    }
  }

  // ── Auth state listener ────────────────────────────────────────────────────
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        await fetchProfile(user.uid);
      } else {
        setUserProfile(null);
      }
      setLoading(false);
    });
    return unsub;
  }, []);

  const value = {
    currentUser,
    userProfile,
    isApproved: true,            // everyone is approved
    signup,
    login,
    loginWithGoogle,
    logout,
    refreshProfile: () => currentUser && fetchProfile(currentUser.uid),
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
