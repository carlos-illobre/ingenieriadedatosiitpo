import React from 'react';

const Invoice = ({ orderDetails }) => {
  return (
    <div id="invoice" style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>Factura</h1>
      <p>Número de orden: {orderDetails.orderId}</p>
      <p>Fecha: {orderDetails.fechaFacturacion}</p>
      <p>Hora: {orderDetails.horaFacturacion}</p>
      <p>Cliente: {orderDetails.customerName}</p>
      <p>Método de pago: {orderDetails.paymentMethod}</p>
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
          {orderDetails.productos.map((producto, idx) => (
            <tr key={idx}>
              <td>{producto.name}</td>
              <td>{producto.quantity}</td>
              <td>${producto.price}</td>
              <td>${producto.price * producto.quantity}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p><strong>Total:</strong> ${orderDetails.total}</p>
      <p>Gracias por su compra.</p>
    </div>
  );
};

export default Invoice;