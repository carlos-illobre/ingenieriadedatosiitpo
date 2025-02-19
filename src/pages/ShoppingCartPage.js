import React, { useState, useEffect } from 'react';
import { redisGet, redisSet, redisDel } from '../services/redis';
import { runQuery, logNeo4jQuery } from '../services/neo4j';
import { auth } from '../services/firebase';

const ShoppingCartPage = ({ cart, setCart }) => {
  const [loading, setLoading] = useState(true);
  const [stockError, setStockError] = useState(''); // Estado para manejar errores de stock

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

  // Finalizar la compra
  const handleFinalizePurchase = async () => {
    const user = auth.currentUser;
    if (!user) {
      alert('Debes iniciar sesión para finalizar la compra.');
      return;
    }

    // Verificar el stock de cada producto en el carrito
    try {
      for (const item of cart) {
        const query = logNeo4jQuery(
          `MATCH (p:Product {name: $name})-[:TIENE_LOTE]->(l:Lote)
           WHERE l.cantidad > 0
           WITH l ORDER BY l.fechaVencimiento ASC
           RETURN SUM(l.cantidad) AS totalCantidad`
        );
        const result = await runQuery(query, { name: item.name });
        const totalCantidad = result.records[0].get('totalCantidad').low;

        if (totalCantidad < item.quantity) {
          setStockError(`No hay suficiente stock para el producto: ${item.name}`);
          return; // Detener el proceso si no hay stock
        }
      }

      // Crear un nuevo nodo 'PEDIDO' en Neo4j
      const now = new Date();
      const pedido = {
        productos: JSON.stringify(cart.map(item => ({
          name: item.name,
          quantity: item.quantity,
          price: item.price, // Opcional: guardar el precio si es necesario
        }))), // Guardar como string en formato JSON
        total: calculateTotal(),
        is_paid: false, // Por defecto, el pedido no está pagado
        fechaCompra: now.toISOString().split('T')[0], // Fecha de compra (YYYY-MM-DD)
        horaCompra: now.toTimeString().split(' ')[0], // Hora de compra (HH:MM:SS)
        fechaFacturacion: '', // Inicializar vacío
        horaFacturacion: '', // Inicializar vacío
      };

      // Actualizar el stock de los productos en Neo4j
      for (const item of cart) {
        let remainingQuantity = item.quantity;

        // Obtener los lotes ordenados por fecha de vencimiento
        const getLotesQuery = logNeo4jQuery(
          `MATCH (p:Product {name: $name})-[:TIENE_LOTE]->(l:Lote)
           WHERE l.cantidad > 0
           WITH l ORDER BY l.fechaVencimiento ASC
           RETURN l`
        );
        const lotesResult = await runQuery(getLotesQuery, { name: item.name });

        // Reducir el stock de los lotes más antiguos primero
        for (const record of lotesResult.records) {
          const lote = record.get('l').properties;
          const loteId = record.get('l').identity.low;

          if (remainingQuantity <= 0) break;

          const cantidadAReducir = Math.min(remainingQuantity, lote.cantidad);
          remainingQuantity -= cantidadAReducir;

          if (remainingQuantity > 0) {
            setStockError(`No hay suficiente stock para el producto: ${item.name}`);
            return; // Detener el proceso si no hay suficiente stock
          }

          const updateLoteQuery = logNeo4jQuery(
            `MATCH (l:Lote)
             WHERE id(l) = $loteId
             SET l.cantidad = l.cantidad - $cantidadAReducir`
          );
          await runQuery(updateLoteQuery, {
            loteId,
            cantidadAReducir,
          });
        }

      }

      const createPedidoQuery = logNeo4jQuery(
        `MATCH (u:User {email: $email})
         CREATE (p:PEDIDO $pedido)
         CREATE (u)-[:PEDIDO_DE]->(p)
         RETURN p`
      );
      await runQuery(createPedidoQuery, {
        email: user.email,
        pedido,
      });

      // Eliminar el carrito de Redis
      await redisDel(`shoppingCart:${user.uid}`);
      setCart([]); // Vaciar el carrito en el estado

      // Mostrar mensaje de éxito
      alert('Compra finalizada correctamente. Se ha creado un nuevo pedido.');
      setStockError(''); // Limpiar el mensaje de error de stock
    } catch (error) {
      console.error('Error al finalizar la compra:', error);
      alert('Hubo un error al finalizar la compra. Inténtalo de nuevo.');
    }
  };

  if (loading) {
    return <div className="app-container">Cargando carrito...</div>;
  }

  return (
    <div className="app-container">
      <h1>Carrito de Compras</h1>
      {stockError && <div className="error-message">{stockError}</div>}
      {cart.length === 0 ? (
        <p>Tu carrito está vacío.</p>
      ) : (
        <>
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
          <button onClick={handleFinalizePurchase}>Finalizar Compra</button>
        </>
      )}
    </div>
  );
};

export default ShoppingCartPage;
