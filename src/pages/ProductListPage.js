import React, { useState, useEffect } from 'react';
import { runQuery, logNeo4jQuery } from '../services/neo4j';

const ProductListPage = ({ addLog }) => {
  const [products, setProducts] = useState([]);
  const [editingProduct, setEditingProduct] = useState(null); // Producto en edición
  const [newPrice, setNewPrice] = useState(''); // Nuevo precio

  // Obtener la lista de productos
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

  // Actualizar el precio de un producto
  const updateProductPrice = async (productName) => {
    if (!newPrice) {
      alert('Por favor, ingresa un precio válido.');
      return;
    }

    const query = logNeo4jQuery(
      `MATCH (p:Product {name: $productName})
       SET p.price = $newPrice
       RETURN p`
    );
    try {
      await runQuery(query, { productName, newPrice: parseFloat(newPrice) });
      addLog('Neo4j', query);
      alert('Precio actualizado correctamente');
      setEditingProduct(null); // Cerrar el formulario de edición
      setNewPrice(''); // Limpiar el campo de nuevo precio
      fetchProducts(); // Actualizar la lista de productos
    } catch (error) {
      console.error('Error updating product price:', error);
      alert('Error al actualizar el precio. Inténtalo de nuevo.');
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
            <th>Imagen</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {products.map((product, index) => (
            <tr key={index}>
              <td>{product.name}</td>
              <td>{product.description}</td>
              <td>${product.price}</td>
              <td>
                {product.imageUrl && (
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    style={{ width: '100px', height: 'auto' }}
                  />
                )}
              </td>
              <td>
                {editingProduct === product.name ? (
                  <div>
                    <input
                      type="number"
                      placeholder="Nuevo precio"
                      value={newPrice}
                      onChange={(e) => setNewPrice(e.target.value)}
                      style={{ width: '100px', marginRight: '10px' }}
                    />
                    <button onClick={() => updateProductPrice(product.name)}>Guardar</button>
                    <button onClick={() => setEditingProduct(null)}>Cancelar</button>
                  </div>
                ) : (
                  <button onClick={() => setEditingProduct(product.name)}>Actualizar Precio</button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ProductListPage;