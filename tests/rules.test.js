import { beforeAll, afterAll, it } from "vitest";
import {
  initializeTestEnvironment,
  assertSucceeds,
  assertFails,
} from "@firebase/rules-unit-testing";
import { readFileSync } from "node:fs";
import {
  doc,
  setDoc,
  getDoc,
  getDocs,
  collection,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  Timestamp,
  writeBatch,
} from "firebase/firestore";
import { blankProject } from "../src/model";
let env, alice, bob, anon;
beforeAll(async () => {
  env = await initializeTestEnvironment({
    projectId: "demo-registry",
    firestore: {
      host: "127.0.0.1",
      port: 8080,
      rules: readFileSync("firestore.rules", "utf8"),
    },
  });
  alice = env.authenticatedContext("alice").firestore();
  bob = env.authenticatedContext("bob").firestore();
  anon = env.unauthenticatedContext().firestore();
}, 30000);
afterAll(async () => {
  await env?.cleanup();
});
const payload = () => {
  const { members, ...data } = blankProject();
  return {
    ...data,
    name: "Private project",
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };
};
it("allows owner CRUD and listing while denying other users and guests", async () => {
  const path = "users/alice/projects/one";
  await assertSucceeds(setDoc(doc(alice, path), payload()));
  await assertSucceeds(getDoc(doc(alice, path)));
  await assertSucceeds(getDocs(collection(alice, "users/alice/projects")));
  for (const db of [bob, anon]) {
    await assertFails(getDoc(doc(db, path)));
    await assertFails(getDocs(collection(db, "users/alice/projects")));
    await assertFails(setDoc(doc(db, path), payload()));
    await assertFails(deleteDoc(doc(db, path)));
  }
  await assertSucceeds(
    updateDoc(doc(alice, path), {
      name: "Updated",
      updatedAt: serverTimestamp(),
    }),
  );
  await assertSucceeds(deleteDoc(doc(alice, path)));
});
it("rejects unknown fields, timestamp tampering and unsafe URLs", async () => {
  for (const patch of [
    { token: "bad" },
    { productionUrl: "javascript:alert(1)" },
    { createdAt: Timestamp.fromMillis(0) },
    { name: 42 },
  ])
    await assertFails(
      setDoc(doc(alice, "users/alice/projects/invalid"), {
        ...payload(),
        ...patch,
      }),
    );
  const ref = doc(alice, "users/alice/projects/timestamps");
  await assertSucceeds(setDoc(ref, payload()));
  await assertFails(
    updateDoc(ref, {
      createdAt: Timestamp.fromMillis(0),
      updatedAt: serverTimestamp(),
    }),
  );
});
it("atomically creates twelve mappings; rejects malformed, orphan and foreign mappings; deletes all", async () => {
  const project = doc(alice, "users/alice/projects/members");
  const batch = writeBatch(alice);
  batch.set(project, payload());
  const member = (i) => ({
    name: "A",
    email: "a@example.com",
    role: "Custom",
    notes: "",
    projectId: "members",
    position: i,
  });
  for (let i = 0; i < 12; i++)
    batch.set(doc(alice, `users/alice/mappings/members_${i}`), member(i));
  await assertSucceeds(batch.commit());
  const path = "users/alice/mappings/members_11";
  await assertSucceeds(getDoc(doc(alice, path)));
  for (const patch of [
    { email: "bad" },
    { password: "secret" },
    { position: 12 },
    { projectId: "missing" },
  ])
    await assertFails(setDoc(doc(alice, path), { ...member(11), ...patch }));
  for (const db of [bob, anon]) {
    await assertFails(getDoc(doc(db, path)));
    await assertFails(getDocs(collection(db, "users/alice/mappings")));
    await assertFails(setDoc(doc(db, path), member(11)));
    await assertFails(deleteDoc(doc(db, path)));
  }
  const deletion = writeBatch(alice);
  deletion.delete(project);
  for (let i = 0; i < 12; i++)
    deletion.delete(doc(alice, `users/alice/mappings/members_${i}`));
  await assertSucceeds(deletion.commit());
});
