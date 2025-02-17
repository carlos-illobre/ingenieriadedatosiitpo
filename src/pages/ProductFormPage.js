import React, { useState } from 'react';
import { runQuery, logNeo4jQuery } from '../services/neo4j';
import { uploadImage } from '../services/cloudinary';

const ProductFormPage = ({ addLog }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [image, setImage] = useState(null);
  const [error, setError] = useState('');

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
      if (allowedTypes.includes(file.type)) {
        setImage(file);
        setError('');
      } else {
        setError('Solo se permiten archivos de imagen (JPEG, PNG, GIF).');
        e.target.value = ''; // Limpia el input de archivo
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !description || !price || !image) {
      setError('Todos los campos son obligatorios.');
      return;
    }

    try {
      // Subir la imagen a Cloudinary
      const imageUrl = await uploadImage(image);

      // Guardar el producto en Neo4j con la URL de la imagen
      const query = logNeo4jQuery(
        `CREATE (p:Product {name: $name, description: $description, price: $price, imageUrl: $imageUrl}) RETURN p`
      );
      await runQuery(query, { name, description, price: parseFloat(price), imageUrl });
      addLog('Neo4j', query);
      setError('');
      alert('Producto registrado correctamente');
      setName('');
      setDescription('');
      setPrice('');
      setImage(null);
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
        <input
          type="file"
          onChange={handleImageChange}
          accept=".jpg, .jpeg, .png, .gif"
          required
        />
        <button type="submit">Guardar Producto</button>
      </form>
    </div>
  );
};

export default ProductFormPage;