import React, { useState, useEffect } from "react";
import { auth } from "./firebase";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "firebase/auth";
import { redisSet, redisGet, redisDel } from "./redis";
import "./App.css";

function App() {
  const [user, setUser] = useState(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [session, setSession] = useState(null);
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        const sessionData = await redisGet(`session:${currentUser.uid}`);
        setSession(sessionData ? JSON.parse(sessionData) : null);
        addLog(`GET session:${currentUser.uid}`);
      }
    });
    return () => unsubscribe();
  }, []);

  const addLog = (message) => {
    setLogs((prevLogs) => [...prevLogs, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const handleRegister = async () => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      await redisSet(`session:${user.uid}`, JSON.stringify({ email, createdAt: Date.now() }));
      addLog(`SET session:${user.uid}`);
    } catch (error) {
      alert(error.message);
    }
  };

  const handleLogin = async () => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      await redisSet(`session:${user.uid}`, JSON.stringify({ email, lastLogin: Date.now() }));
      addLog(`SET session:${user.uid}`);
    } catch (error) {
      alert(error.message);
    }
  };

  const handleLogout = async () => {
    if (user) {
      await redisDel(`session:${user.uid}`);
      addLog(`DEL session:${user.uid}`);
    }
    await signOut(auth);
  };

  return (
    <div className="container">
      <div className="auth-box">
        <h2>{user ? "Bienvenido" : "Iniciar Sesión / Registrarse"}</h2>
        {!user ? (
          <>
            <input type="email" placeholder="Email" onChange={(e) => setEmail(e.target.value)} />
            <input type="password" placeholder="Contraseña" onChange={(e) => setPassword(e.target.value)} />
            <button onClick={handleLogin}>Iniciar Sesión</button>
            <button onClick={handleRegister}>Registrarse</button>
          </>
        ) : (
          <>
            <p>{user.email}</p>
            {session && <p className="session-info">Último inicio: {new Date(session.lastLogin || session.createdAt).toLocaleString()}</p>}
            <button onClick={handleLogout}>Cerrar Sesión</button>
          </>
        )}
      </div>
      <div className="logs-container">
        <h3>Logs de Redis:</h3>
        <div className="logs-box">
          {logs.map((log, index) => (
            <p key={index}>{log}</p>
          ))}
        </div>
      </div>
    </div>
  );
}

export default App;