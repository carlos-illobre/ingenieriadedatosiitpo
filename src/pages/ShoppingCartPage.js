import React from 'react';
import { redisSet } from '../services/redis';
import { auth } from '../services/firebase';

const ShoppingCartPage = ({ cart, setCart }) => {
  const updateRedisCart = async (newCart) => {
    const user = auth.currentUser;
    if (user) {
      await redisSet(`shoppingCart:${user.uid}`, newCart);
    }
  };

  const handleRemoveItem = (index) => {
    const newCart = [...cart];
    newCart.splice(index, 1);
    setCart(newCart);
    updateRedisCart(newCart);
  };

  const handleQuantityChange = (index, quantity) => {
    const newCart = [...cart];
    newCart[index].quantity = quantity;
    setCart(newCart);
    updateRedisCart(newCart);
  };

  const calculateTotal = () => {
    return cart.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  return (
    <div className="app-container">
      <h1>Carrito de Compras</h1>
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
      <h2>Total de la Compra: ${calculateTotal()}</h2>
    </div>
  );
};

export default ShoppingCartPage;
