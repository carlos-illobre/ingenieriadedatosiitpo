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
      <Link to="/catalog" className="nav-link">Catálogo</Link>
    </nav>
  );
};

export default Navbar;