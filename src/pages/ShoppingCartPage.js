import React, { useState, useEffect } from 'react';
import { redisGet, redisSet } from '../services/redis';
import { auth } from '../services/firebase';

const ShoppingCartPage = ({ cart, setCart }) => {
  const [loading, setLoading] = useState(true);

  // Recuperar el carrito de compras al montar el componente
  useEffect(() => {
    const fetchCart = async () => {
      const user = auth.currentUser;
      if (user) {
        const savedCart = await redisGet(`shoppingCart:${user.uid}`);
        console.log('Carrito recuperado de Redis:', savedCart); // Debugging

        // Verificar que savedCart sea un array
        if (savedCart && Array.isArray(savedCart)) {
          setCart(savedCart);
        } else {
          setCart([]); // Si no es un array, inicializar como vacío
        }
      } else {
        console.log('Usuario no autenticado'); // Debugging
        setCart([]); // Si no hay usuario, inicializar como vacío
      }
      setLoading(false);
    };

    fetchCart();
  }, [setCart]);

  // Actualizar el carrito en Redis
  const updateRedisCart = async (newCart) => {
    const user = auth.currentUser;
    if (user) {
      await redisSet(`shoppingCart:${user.uid}`, newCart); // Guardar como array plano
      console.log('Carrito guardado en Redis:', newCart); // Debugging
    }
  };

  // Eliminar un producto del carrito
  const handleRemoveItem = (index) => {
    const newCart = [...cart];
    newCart.splice(index, 1);
    setCart(newCart);
    updateRedisCart(newCart);
  };

  // Cambiar la cantidad de un producto en el carrito
  const handleQuantityChange = (index, quantity) => {
    const newCart = [...cart];
    if (quantity < 1) quantity = 1; // Evita cantidades negativas o cero
    newCart[index].quantity = quantity;
    setCart(newCart);
    updateRedisCart(newCart);
  };

  // Calcular el total de la compra
  const calculateTotal = () => {
    return cart.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  if (loading) {
    return <div className="app-container">Cargando carrito...</div>;
  }

  return (
    <div className="app-container">
      <h1>Carrito de Compras</h1>
      {cart.length === 0 ? (
        <p>Tu carrito está vacío.</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Producto</th>
              <th>Cantidad</th>
              <th>Precio por Unidad</th>
              <th>Precio Total</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {cart.map((item, index) => (
              <tr key={index}>
                <td>{item.name}</td>
                <td>
                  <input
                    type="number"
                    value={item.quantity}
                    onChange={(e) => handleQuantityChange(index, parseInt(e.target.value))}
                    min="1"
                  />
                </td>
                <td>${item.price}</td>
                <td>${item.price * item.quantity}</td>
                <td>
                  <button onClick={() => handleRemoveItem(index)}>Eliminar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      <h2>Total de la Compra: ${calculateTotal()}</h2>
    </div>
  );
};

export default ShoppingCartPage;