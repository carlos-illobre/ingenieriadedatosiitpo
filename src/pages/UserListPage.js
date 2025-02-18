import React, { useState, useEffect } from 'react';
import { runQuery, logNeo4jQuery } from '../services/neo4j';

const UserListPage = ({ addLog }) => {
  const [users, setUsers] = useState([]);

  const memberships = {
    TOP: 5000,
    MEDIUM: 3000,
    LOW: 0
  };

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

  const handleMembershipChange = async (email, newMembership) => {
    const query = logNeo4jQuery(`
      MATCH (u:User {email: $email})
      SET u.membership = $membership,
          u.membershipPrice = $membershipPrice
      RETURN u
    `);

    try {
      await runQuery(query, {
        email,
        membership: newMembership,
        membershipPrice: memberships[newMembership]
      });
      addLog('Neo4j', query);
      alert('Membresía actualizada correctamente');
      fetchUsers(); // Recargar la lista de usuarios
    } catch (error) {
      console.error('Error updating membership:', error);
      alert('Error al actualizar la membresía');
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
            <th>Membresía</th>
            <th>Precio</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user, index) => (
            <tr key={index}>
              <td>{user.name}</td>
              <td>{user.lastName}</td>
              <td>{user.email}</td>
              <td>
                <select
                  value={user.membership || 'LOW'}
                  onChange={(e) => handleMembershipChange(user.email, e.target.value)}
                >
                  <option value="TOP">TOP</option>
                  <option value="MEDIUM">MEDIUM</option>
                  <option value="LOW">LOW</option>
                </select>
              </td>
              <td>${user.membershipPrice || memberships['LOW']}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default UserListPage;