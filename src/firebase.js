import { initializeApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";
import {
  getFirestore,
  collection,
  doc,
  onSnapshot,
  writeBatch,
  serverTimestamp,
} from "firebase/firestore";
const e = import.meta.env;
export const configured = !!(
  e.VITE_FIREBASE_API_KEY &&
  e.VITE_FIREBASE_AUTH_DOMAIN &&
  e.VITE_FIREBASE_PROJECT_ID &&
  e.VITE_FIREBASE_APP_ID
);
const app = configured
  ? initializeApp({
      apiKey: e.VITE_FIREBASE_API_KEY,
      authDomain: e.VITE_FIREBASE_AUTH_DOMAIN,
      projectId: e.VITE_FIREBASE_PROJECT_ID,
      appId: e.VITE_FIREBASE_APP_ID,
    })
  : null;
const auth = app ? getAuth(app) : null;
const db = app ? getFirestore(app) : null;
export const watchAuth = (cb) =>
  auth ? onAuthStateChanged(auth, cb) : () => {};
export async function login() {
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: "select_account" });
  return signInWithPopup(auth, provider);
}
export const logout = () => signOut(auth);
export function watchProjects(uid, cb, error) {
  let projects = null,
    mappings = null;
  const emit = () => {
    if (projects && mappings)
      cb(
        projects.map((p) => ({
          ...p,
          members: mappings
            .filter((m) => m.projectId === p.id)
            .sort((a, b) => a.position - b.position)
            .map(({ name, role, email, notes }) => ({
              name,
              role,
              email,
              notes,
            })),
        })),
      );
  };
  const offProjects = onSnapshot(
    collection(db, "users", uid, "projects"),
    (s) => {
      projects = s.docs.map((d) => ({ ...d.data(), id: d.id }));
      emit();
    },
    error,
  );
  const offMappings = onSnapshot(
    collection(db, "users", uid, "mappings"),
    (s) => {
      mappings = s.docs.map((d) => d.data());
      emit();
    },
    error,
  );
  return () => {
    offProjects();
    offMappings();
  };
}
// Stable slots make replacement and deletion atomic without additional reads.
export async function saveProject(uid, project, id) {
  const ref = id
    ? doc(db, "users", uid, "projects", id)
    : doc(collection(db, "users", uid, "projects"));
  const { members, ...data } = project;
  const batch = writeBatch(db);
  batch.set(
    ref,
    {
      ...data,
      updatedAt: serverTimestamp(),
      ...(!id ? { createdAt: serverTimestamp() } : {}),
    },
    { merge: !!id },
  );
  for (let position = 0; position < 12; position++) {
    const mapping = doc(db, "users", uid, "mappings", `${ref.id}_${position}`);
    if (members[position])
      batch.set(mapping, { ...members[position], projectId: ref.id, position });
    else batch.delete(mapping);
  }
  await batch.commit();
  return ref.id;
}
export async function removeProject(uid, id) {
  const batch = writeBatch(db);
  batch.delete(doc(db, "users", uid, "projects", id));
  for (let i = 0; i < 12; i++)
    batch.delete(doc(db, "users", uid, "mappings", `${id}_${i}`));
  await batch.commit();
}
