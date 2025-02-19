import React, { useState, useEffect } from 'react';
import { runQuery, logNeo4jQuery } from '../services/neo4j';

const LoteSearchPage = ({ addLog }) => {
  const [productos, setProductos] = useState([]);
  const [selectedProducto, setSelectedProducto] = useState('');
  const [lotes, setLotes] = useState([]);

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

  // Buscar lotes por producto
  const fetchLotes = async () => {
    if (!selectedProducto) return;

    const query = logNeo4jQuery(
      `MATCH (p:Product {name: $productName})-[:TIENE_LOTE]->(l:Lote)
       RETURN l`
    );
    try {
      const result = await runQuery(query, { productName: selectedProducto });
      const lotes = result.records.map((record) => record.get('l').properties);
      setLotes(lotes);
      addLog('Neo4j', query);
    } catch (error) {
      console.error('Error fetching lotes:', error);
    }
  };

  useEffect(() => {
    fetchProductos();
  }, []);

  useEffect(() => {
    fetchLotes();
  }, [selectedProducto]);
return (
  <div className="app-container">
    <h1>Búsqueda de Lotes</h1>
    <div className="lote-search">
      <select
        value={selectedProducto}
        onChange={(e) => setSelectedProducto(e.target.value)}
      >
        <option value="">Selecciona un producto</option>
        {productos.map((producto, index) => (
          <option key={index} value={producto.name}>
            {producto.name}
          </option>
        ))}
      </select>
      <table>
        <thead>
          <tr>
            <th>Cantidad</th>
            <th>Fecha de Vencimiento</th>
          </tr>
        </thead>
        <tbody>
          {lotes.map((lote, index) => (
            <tr key={index}>
              <td>{lote.cantidad}</td>
              <td>{lote.fechaVencimiento}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);
};

export default LoteSearchPage;