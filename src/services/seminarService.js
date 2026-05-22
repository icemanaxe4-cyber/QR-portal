// src/services/seminarService.js
import {
  collection, doc, addDoc, updateDoc, deleteDoc,
  getDoc, getDocs, query, where,
  serverTimestamp, increment,
} from 'firebase/firestore';
import { db } from '../firebase';

// ── Helpers ──────────────────────────────────────────────────────────────────

function slugify(str) {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

async function uniqueSlug(base) {
  const slug   = slugify(base);
  const snap   = await getDocs(query(collection(db, 'seminars'), where('slug', '==', slug)));
  if (snap.empty) return slug;
  const ts = Date.now().toString(36);
  return `${slug}-${ts}`;
}

// ── Seminars ─────────────────────────────────────────────────────────────────

export async function createSeminar(data, professorUid) {
  const slug = await uniqueSlug(data.title);

  const seminar = {
    ...data,
    slug,
    professorUid,
    registeredCount: 0,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  const docRef = await addDoc(collection(db, 'seminars'), seminar);
  return { id: docRef.id, ...seminar };
}

export async function updateSeminar(seminarId, data) {
  const updates = { ...data, updatedAt: serverTimestamp() };
  await updateDoc(doc(db, 'seminars', seminarId), updates);
}

export async function deleteSeminar(seminarId) {
  // Delete all registrations for this seminar
  const regSnap = await getDocs(query(collection(db, 'registrations'), where('seminarId', '==', seminarId)));
  for (const d of regSnap.docs) await deleteDoc(d.ref);

  await deleteDoc(doc(db, 'seminars', seminarId));
}

export async function getSeminar(seminarId) {
  const snap = await getDoc(doc(db, 'seminars', seminarId));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
}

export async function getSeminarBySlug(slug) {
  const q    = query(collection(db, 'seminars'), where('slug', '==', slug));
  const snap = await getDocs(q);
  if (snap.empty) return null;
  const d = snap.docs[0];
  return { id: d.id, ...d.data() };
}

export async function getSeminarsByProfessor(uid) {
  const q    = query(collection(db, 'seminars'), where('professorUid', '==', uid));
  const snap = await getDocs(q);
  return snap.docs
    .map(d => ({ id: d.id, ...d.data() }))
    .sort((a, b) => {
      const ta = a.createdAt?.toMillis?.() ?? 0;
      const tb = b.createdAt?.toMillis?.() ?? 0;
      return tb - ta;
    });
}

export async function getAllSeminars() {
  const snap = await getDocs(collection(db, 'seminars'));
  return snap.docs
    .map(d => ({ id: d.id, ...d.data() }))
    .sort((a, b) => {
      const ta = a.createdAt?.toMillis?.() ?? 0;
      const tb = b.createdAt?.toMillis?.() ?? 0;
      return tb - ta;
    });
}

// ── Registrations ─────────────────────────────────────────────────────────────

export async function registerForSeminar(seminarId, formData, userId) {
  // Check duplicate
  const dupQ = query(
    collection(db, 'registrations'),
    where('seminarId', '==', seminarId),
    where('email', '==', formData.email)
  );
  const dup = await getDocs(dupQ);
  if (!dup.empty) throw new Error('This email is already registered for this seminar.');

  // Check seat availability
  const semSnap = await getDoc(doc(db, 'seminars', seminarId));
  const sem     = semSnap.data();
  if (sem.maxSeats && sem.registeredCount >= parseInt(sem.maxSeats)) {
    throw new Error('This seminar is fully booked.');
  }

  const registration = {
    seminarId,
    userId: userId || null,
    ...formData,
    registeredAt: serverTimestamp(),
  };

  const docRef = await addDoc(collection(db, 'registrations'), registration);

  // Increment counter
  await updateDoc(doc(db, 'seminars', seminarId), {
    registeredCount: increment(1),
  });

  return { id: docRef.id, ...registration };
}

export async function getRegistrationsBySeminar(seminarId) {
  const q    = query(collection(db, 'registrations'), where('seminarId', '==', seminarId));
  const snap = await getDocs(q);
  return snap.docs
    .map(d => ({ id: d.id, ...d.data() }))
    .sort((a, b) => {
      const ta = a.registeredAt?.toMillis?.() ?? 0;
      const tb = b.registeredAt?.toMillis?.() ?? 0;
      return tb - ta;
    });
}

export async function getAllRegistrations() {
  const snap = await getDocs(collection(db, 'registrations'));
  return snap.docs
    .map(d => ({ id: d.id, ...d.data() }))
    .sort((a, b) => {
      const ta = a.registeredAt?.toMillis?.() ?? 0;
      const tb = b.registeredAt?.toMillis?.() ?? 0;
      return tb - ta;
    });
}

// ── Users (admin) ─────────────────────────────────────────────────────────────

export async function getAllUsers() {
  const snap = await getDocs(collection(db, 'users'));
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

export async function updateUserProfile(uid, updates) {
  await updateDoc(doc(db, 'users', uid), updates);
}

export async function deleteUserProfile(uid) {
  await deleteDoc(doc(db, 'users', uid));
}
