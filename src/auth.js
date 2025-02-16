import { signInWithEmailAndPassword, signOut } from "firebase/auth";
import { redisSet, redisGet, redisDel } from "./services/redis";
import { auth } from "./services/firebase";

export const login = async (email, password) => {
  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  const user = userCredential.user;

  // Guardar sesión en Redis
  await redisSet(`session:${user.uid}`, JSON.stringify({ email, lastLogin: Date.now() }));

  return user;
};

export const logout = async () => {
  const user = auth.currentUser;
  if (user) {
    await redisDel(`session:${user.uid}`);
  }
  await signOut(auth);
};

export const getSession = async (userId) => {
  const session = await redisGet(`session:${userId}`);
  return session ? JSON.parse(session) : null;
};
