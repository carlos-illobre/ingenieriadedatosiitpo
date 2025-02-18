import React from 'react';
import { Link } from 'react-router-dom';
import './Navbar.css';

const Navbar = () => {
  return (
    <nav className="navbar">
      <Link to="/register" className="nav-link">Registro</Link>
      <Link to="/login" className="nav-link">Login</Link>
      <Link to="/users" className="nav-link">Usuarios</Link>
      <Link to="/products" className="nav-link">Productos</Link>
      <Link to="/product-list" className="nav-link">Listado de Productos</Link>
      <Link to="/lotes" className="nav-link">Lotes</Link>
      <Link to="/lotes-search" className="nav-link">Buscar Lotes</Link>
      <Link to="/catalog" className="nav-link">Catálogo</Link>
      <Link to="/cart" className="nav-link">Carrito de Compras</Link> {/* Enlace al carrito */}
    </nav>
  );
};

export default Navbar;
