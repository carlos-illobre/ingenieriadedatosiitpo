import React, { useState, useEffect } from 'react';
import { runQuery, logNeo4jQuery } from '../services/neo4j';

const UserListPage = ({ addLog }) => {
  const [users, setUsers] = useState([]);

  const fetchUsers = async () => {
    const query = logNeo4jQuery('MATCH (u:User) RETURN u');
    try {
      const result = await runQuery(query);
      const users = result.records.map((record) => record.get('u').properties);
      setUsers(users);
      addLog('Neo4j', query);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <div className="app-container">
      <h1>Listado de Usuarios</h1>
      <table>
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Apellido</th>
            <th>Email</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user, index) => (
            <tr key={index}>
              <td>{user.name}</td>
              <td>{user.lastName}</td>
              <td>{user.email}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default UserListPage;