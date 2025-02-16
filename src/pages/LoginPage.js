import React, { useState } from 'react';
import { auth } from '../services/firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { redisSet } from '../services/redis';
import { useNavigate } from 'react-router-dom';

const LoginPage = ({ addLog }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      const { user } = await signInWithEmailAndPassword(auth, email, password);
      await redisSet('session', user.uid);
      addLog('Redis', `SET session ${user.uid}`);
      setError('');
      alert('Sesión iniciada correctamente');
      navigate('/users');
    } catch (error) {
      setError('Credenciales inválidas. Inténtalo de nuevo.');
      console.error('Error en el login:', error);
    }
  };

  return (
    <div className="app-container">
      <h1>Login</h1>
      {error && <div className="error-message">{error}</div>}
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        type="password"
        placeholder="Contraseña"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button onClick={handleLogin}>Login</button>
    </div>
  );
};

export default LoginPage;