import React, { useState } from 'react';
import { runQuery, logNeo4jQuery } from '../services/neo4j';

const ProductFormPage = ({ addLog }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const query = logNeo4jQuery(
        `CREATE (p:Product {name: $name, description: $description, price: $price}) RETURN p`
      );
      await runQuery(query, { name, description, price });
      addLog('Neo4j', query);
      setError('');
      alert('Producto registrado correctamente');
      setName('');
      setDescription('');
      setPrice('');
    } catch (error) {
      setError('Error al registrar el producto. Inténtalo de nuevo.');
      console.error('Error en el registro:', error);
    }
  };

  return (
    <div className="app-container">
      <h1>Alta de Productos</h1>
      {error && <div className="error-message">{error}</div>}
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Nombre del producto"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="Descripción"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
        />
        <input
          type="number"
          placeholder="Precio"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          required
        />
        <button type="submit">Guardar Producto</button>
      </form>
    </div>
  );
};

export default ProductFormPage;