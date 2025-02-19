import React, { useState, useEffect } from 'react';
import { runQuery, logNeo4jQuery } from '../services/neo4j';

const LoteFormPage = ({ addLog }) => {
  const [productos, setProductos] = useState([]);
  const [selectedProducto, setSelectedProducto] = useState('');
  const [cantidad, setCantidad] = useState('');
  const [fechaVencimiento, setFechaVencimiento] = useState('');
  const [error, setError] = useState('');

  // Obtener la lista de productos desde Neo4j
  const fetchProductos = async () => {
    const query = logNeo4jQuery('MATCH (p:Product) RETURN p');
    try {
      const result = await runQuery(query);
      const productos = result.records.map((record) => record.get('p').properties);
      setProductos(productos);
      addLog('Neo4j', query);
    } catch (error) {
      console.error('Error fetching productos:', error);
    }
  };

  useEffect(() => {
    fetchProductos();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedProducto || !cantidad || !fechaVencimiento) {
      setError('Todos los campos son obligatorios.');
      return;
    }

    try {
      const query = logNeo4jQuery(
        `MATCH (p:Product {name: $productName})
         CREATE (l:Lote {cantidad: $cantidad, fechaVencimiento: $fechaVencimiento})
         CREATE (p)-[:TIENE_LOTE]->(l)
         RETURN l`
      );
      await runQuery(query, {
        productName: selectedProducto,
        cantidad: parseInt(cantidad),
        fechaVencimiento,
      });
      addLog('Neo4j', query);
      setError('');
      alert('Lote registrado correctamente');
      setSelectedProducto('');
      setCantidad('');
      setFechaVencimiento('');
    } catch (error) {
      setError('Error al registrar el lote. Inténtalo de nuevo.');
      console.error('Error en el registro:', error);
    }
  };
return (
  <div className="app-container">
    <h1>Alta de Lotes</h1>
    {error && <div className="error-message">{error}</div>}
    <form onSubmit={handleSubmit} className="lote-form">
      <select
        value={selectedProducto}
        onChange={(e) => setSelectedProducto(e.target.value)}
        required
      >
        <option value="">Selecciona un producto</option>
        {productos.map((producto, index) => (
          <option key={index} value={producto.name}>
            {producto.name}
          </option>
        ))}
      </select>
      <input
        type="number"
        placeholder="Cantidad"
        value={cantidad}
        onChange={(e) => setCantidad(e.target.value)}
        required
      />
      <input
        type="date"
        placeholder="Fecha de vencimiento"
        value={fechaVencimiento}
        onChange={(e) => setFechaVencimiento(e.target.value)}
        required
      />
      <button type="submit">Guardar Lote</button>
    </form>
  </div>
);
};

export default LoteFormPage;