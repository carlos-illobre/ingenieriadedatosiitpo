import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client'; // Importar createRoot
import { runQuery, logNeo4jQuery } from '../services/neo4j';
import { auth } from '../services/firebase';
import { redisGet, redisSet, redisDel } from '../services/redis';
import { generatePdf } from '../utils/generatePdf';
import Invoice from '../components/Invoice';

const UserOrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('');

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
              productos: JSON.parse(pedido.productos),
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

  const handlePaymentMethodChange = (e) => {
    setPaymentMethod(e.target.value);
  };

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

      // Generar la factura en PDF
      const orderDetails = orders.find((order) => order.orderId === orderId);
      const invoiceData = {
        ...orderDetails,
        customerName: auth.currentUser.email, // Obtener el nombre del cliente desde Firebase
        paymentMethod,
        fechaFacturacion,
        horaFacturacion,
      };

      // Crear un div temporal en el DOM
      const tempDiv = document.createElement('div');
      document.body.appendChild(tempDiv);

      // Renderizar el componente de factura en el div temporal
      const root = createRoot(tempDiv); // Usar createRoot
      root.render(<Invoice orderDetails={invoiceData} />);

      // Esperar a que el componente se renderice
      setTimeout(() => {
        // Generar el PDF
        generatePdf('invoice', `factura_${orderId}`);

        // Limpiar el componente del DOM
        root.unmount(); // Desmontar el componente
        document.body.removeChild(tempDiv);
      }, 100); // Esperar 100ms para asegurar que el componente se haya renderizado

      // Limpiar el estado del método de pago y el pedido seleccionado
      setPaymentMethod('');
      setSelectedOrderId(null);

      alert('Pago confirmado correctamente. La factura se ha generado.');
    } catch (error) {
      console.error('Error al confirmar el pago:', error);
      alert('Hubo un error al confirmar el pago. Inténtalo de nuevo.');
    }
  };

  const handleRepeatOrder = async (productos) => {
    const user = auth.currentUser;
    if (!user) {
      alert('Debes iniciar sesión para repetir un pedido.');
      return;
    }

    try {
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