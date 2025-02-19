import React, { useState, useEffect } from 'react';
import { runQuery, logNeo4jQuery } from '../services/neo4j';
import { auth } from '../services/firebase';
import { redisGet, redisSet, redisDel } from '../services/redis'; // Importar redisSet

const UserOrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrderId, setSelectedOrderId] = useState(null); // ID del pedido seleccionado
  const [paymentMethod, setPaymentMethod] = useState(''); // Método de pago seleccionado

  // Obtener los pedidos del usuario al montar el componente
  useEffect(() => {
    const fetchOrders = async () => {
      const user = auth.currentUser;
      if (user) {
        const query = logNeo4jQuery(
          `MATCH (u:User {email: $email})-[:PEDIDO_DE]->(p:PEDIDO)
           RETURN p, id(p) AS orderId`
        );
        try {
          const result = await runQuery(query, { email: user.email });
          const ordersData = result.records.map((record) => {
            const pedido = record.get('p').properties;
            const orderId = record.get('orderId').low;
            return {
              ...pedido,
              productos: JSON.parse(pedido.productos), // Convertir el string JSON a un array de objetos
              orderId,
            };
          });
          setOrders(ordersData);
        } catch (error) {
          console.error('Error fetching orders:', error);
        }
      }
      setLoading(false);
    };

    fetchOrders();
  }, []);

  // Manejar la selección del método de pago
  const handlePaymentMethodChange = (e) => {
    setPaymentMethod(e.target.value);
  };

  // Confirmar el pago de un pedido
  const handleConfirmPayment = async (orderId) => {
    if (!paymentMethod) {
      alert('Por favor, selecciona un método de pago.');
      return;
    }

    const now = new Date();
    const fechaFacturacion = now.toISOString().split('T')[0];
    const horaFacturacion = now.toTimeString().split(' ')[0];

    try {
      // Actualizar el estado del pedido en Neo4j
      const updateOrderQuery = logNeo4jQuery(
        `MATCH (p:PEDIDO)
         WHERE id(p) = $orderId
         SET p.is_paid = true, p.paymentMethod = $paymentMethod,
             p.fechaFacturacion = $fechaFacturacion, p.horaFacturacion = $horaFacturacion
         RETURN p`
      );
      await runQuery(updateOrderQuery, {
        orderId,
        paymentMethod,
        fechaFacturacion,
        horaFacturacion,
      });

      // Actualizar la lista de pedidos en el estado
      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order.orderId === orderId
            ? { ...order, is_paid: true, paymentMethod, fechaFacturacion, horaFacturacion }
            : order
        )
      );

      // Limpiar el estado del método de pago y el pedido seleccionado
      setPaymentMethod('');
      setSelectedOrderId(null);

      alert('Pago confirmado correctamente.');
    } catch (error) {
      console.error('Error al confirmar el pago:', error);
      alert('Hubo un error al confirmar el pago. Inténtalo de nuevo.');
    }
  };

  // Repetir un pedido
  const handleRepeatOrder = async (productos) => {
    const user = auth.currentUser;
    if (!user) {
      alert('Debes iniciar sesión para repetir un pedido.');
      return;
    }

    try {
      // Guardar el carrito en Redis
      await redisSet(`shoppingCart:${user.uid}`, productos);
      alert('Pedido repetido. Los productos se han añadido al carrito.');
    } catch (error) {
      console.error('Error al repetir el pedido:', error);
      alert('Hubo un error al repetir el pedido. Inténtalo de nuevo.');
    }
  };

  if (loading) {
    return <div className="app-container">Cargando pedidos...</div>;
  }

  return (
    <div className="app-container">
      <h1>Mis Pedidos</h1>
      {orders.length === 0 ? (
        <p>No tienes pedidos registrados.</p>
      ) : (
        <div className="orders-list">
          {orders.map((order, index) => (
            <div key={index} className="order-card">
              <h2>Pedido #{index + 1}</h2>
              <p><strong>Total:</strong> ${order.total}</p>
              <p><strong>Estado de pago:</strong> {order.is_paid ? 'Pagado' : 'Pendiente'}</p>
              {order.paymentMethod && (
                <p><strong>Método de pago:</strong> {order.paymentMethod}</p>
              )}
              <h3>Productos:</h3>
              <table>
                <thead>
                  <tr>
                    <th>Producto</th>
                    <th>Cantidad</th>
                    <th>Precio por Unidad</th>
                    <th>Precio Total</th>
                  </tr>
                </thead>
                <tbody>
                  {order.productos.map((producto, idx) => (
                    <tr key={idx}>
                      <td>{producto.name}</td>
                      <td>{producto.quantity}</td>
                      <td>${producto.price}</td>
                      <td>${producto.price * producto.quantity}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {!order.is_paid && (
                <div className="payment-section">
                  {selectedOrderId === order.orderId ? (
                    <>
                      <select
                        value={paymentMethod}
                        onChange={handlePaymentMethodChange}
                      >
                        <option value="">Selecciona un método de pago</option>
                        <option value="transferencia">Transferencia</option>
                        <option value="tarjeta">Tarjeta</option>
                        <option value="efectivo">Efectivo</option>
                      </select>
                      <button onClick={() => handleConfirmPayment(order.orderId)}>
                        Confirmar Pago
                      </button>
                      <button onClick={() => setSelectedOrderId(null)}>
                        Cancelar
                      </button>
                    </>
                  ) : (
                    <button onClick={() => setSelectedOrderId(order.orderId)}>
                      Pagar Pedido
                    </button>
                  )}
                </div>
              )}

              {/* Botón para repetir el pedido */}
              <button
                onClick={() => handleRepeatOrder(order.productos)}
                className="repeat-order-button"
              >
                Repetir Pedido
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default UserOrdersPage;
