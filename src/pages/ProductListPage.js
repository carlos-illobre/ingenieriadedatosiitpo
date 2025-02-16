import React, { useState, useEffect } from 'react';
import { runQuery, logNeo4jQuery } from '../services/neo4j';

const ProductListPage = ({ addLog }) => {
  const [products, setProducts] = useState([]);

  const fetchProducts = async () => {
    const query = logNeo4jQuery('MATCH (p:Product) RETURN p');
    try {
      const result = await runQuery(query);
      const products = result.records.map((record) => record.get('p').properties);
      setProducts(products);
      addLog('Neo4j', query);
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  return (
    <div className="app-container">
      <h1>Listado de Productos</h1>
      <table>
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Descripción</th>
            <th>Precio</th>
          </tr>
        </thead>
        <tbody>
          {products.map((product, index) => (
            <tr key={index}>
              <td>{product.name}</td>
              <td>{product.description}</td>
              <td>${product.price}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ProductListPage;