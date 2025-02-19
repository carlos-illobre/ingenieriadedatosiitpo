import React, { useState } from 'react';
import { auth } from '../services/firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { runQuery, logNeo4jQuery } from '../services/neo4j';
import { redisSet } from '../services/redis';

const RegisterPage = ({ addLog }) => {
  const [name, setName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [membership, setMembership] = useState('LOW'); // Valor por defecto
  const [error, setError] = useState('');

  const memberships = {
    TOP: 5000,
    MEDIUM: 3000,
    LOW: 1000
  };

  const handleRegister = async () => {
    try {
      const { user } = await createUserWithEmailAndPassword(auth, email, password);
      
      const query = logNeo4jQuery(
        `CREATE (u:User {
          name: $name, 
          lastName: $lastName, 
          email: $email,
          membership: $membership,
          membershipPrice: $membershipPrice
        }) RETURN u`
      );

      await runQuery(query, { 
        name, 
        lastName, 
        email,
        membership,
        membershipPrice: memberships[membership]
      });

      await redisSet('session', user.uid);
      addLog('Neo4j', query);
      addLog('Redis', `SET session ${user.uid}`);
      setError('');
      alert('Usuario registrado correctamente');
    } catch (error) {
      setError('Error en el registro. Inténtalo de nuevo.');
      console.error('Error en el registro:', error);
    }
  };

  return (
    <div className="app-container">
      <h1>Registro</h1>
      {error && <div className="error-message">{error}</div>}
      <input
        type="text"
        placeholder="Nombre"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <input
        type="text"
        placeholder="Apellido"
        value={lastName}
        onChange={(e) => setLastName(e.target.value)}
      />
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
      <div>
        <label>Membresía:</label>
        <select
          value={membership}
          onChange={(e) => setMembership(e.target.value)}
        >
          <option value="TOP">TOP ($5000)</option>
          <option value="MEDIUM">MEDIUM ($3000)</option>
          <option value="LOW">LOW (GRATIS)</option>
        </select>
      </div>
      <button onClick={handleRegister}>Registrar</button>
    </div>
  );
};

export default RegisterPage;