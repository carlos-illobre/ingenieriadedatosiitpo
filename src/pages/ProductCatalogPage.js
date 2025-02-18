import React, { useState, useEffect } from 'react';
import { runQuery, logNeo4jQuery } from '../services/neo4j';
import { redisSet } from '../services/redis';
import { auth } from '../services/firebase';

const ProductCatalogPage = ({ addLog, cart, setCart }) => {
  const [products, setProducts] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5); // Número de productos por página

  // Función para convertir un objeto {low, high} a número
  const convertNeo4jNumber = (value) => {
    if (value && typeof value === 'object' && 'low' in value && 'high' in value) {
      return value.low; // O value.high si es necesario
    }
    return value; // Si ya es un número, devolverlo tal cual
  };

  // Obtener los productos y calcular la cantidad total de lotes
  const fetchProducts = async () => {
    const query = logNeo4jQuery(
      `MATCH (p:Product)
       OPTIONAL MATCH (p)-[:TIENE_LOTE]->(l:Lote)
       RETURN p, SUM(l.cantidad) AS totalCantidad
       ORDER BY p.name`
    );
    try {
      const result = await runQuery(query);
      const productsWithQuantity = result.records.map((record) => {
        const product = record.get('p').properties;
        const totalCantidad = convertNeo4jNumber(record.get('totalCantidad')) || 0; // Convertir a número
        return {
          ...product,
          price: convertNeo4jNumber(product.price), // Convertir el precio a número
          totalCantidad,
        };
      });
      setProducts(productsWithQuantity);
      addLog('Neo4j', query);
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  const handleAddToCart = (product) => {
    const newCart = [...cart];
    const existingItem = newCart.find((item) => item.name === product.name);

    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      newCart.push({ ...product, quantity: 1 });
    }

    setCart(newCart);
    const user = auth.currentUser;
    if (user) {
      redisSet(`shoppingCart:${user.uid}`, newCart);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // Calcular los índices para la paginación
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentProducts = products.slice(indexOfFirstItem, indexOfLastItem);

  // Cambiar de página
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <div className="app-container">
      <h1>Catálogo de Productos</h1>
      <div className="product-grid">
        {currentProducts.map((product, index) => (
          <div key={index} className="product-card">
            {product.imageUrl && (
              <img
                src={product.imageUrl}
                alt={product.name}
                className="product-image"
              />
            )}
            <div className="product-details">
              <h2>{product.name}</h2>
              <p>{product.description}</p>
              <p><strong>Precio:</strong> ${product.price}</p>
              <p><strong>Cantidad Total:</strong> {product.totalCantidad}</p> {/* Mostrar la cantidad total */}
              <button onClick={() => handleAddToCart(product)}>Agregar al Carrito</button>
            </div>
          </div>
        ))}
      </div>

      {/* Paginación */}
      <div className="pagination">
        {Array.from({ length: Math.ceil(products.length / itemsPerPage) }, (_, i) => (
          <button key={i + 1} onClick={() => paginate(i + 1)}>
            {i + 1}
          </button>
        ))}
      </div>
    </div>
  );
};

export default ProductCatalogPage;
