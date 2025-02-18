import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import RegisterPage from './pages/RegisterPage';
import LoginPage from './pages/LoginPage';
import UserListPage from './pages/UserListPage';
import ProductFormPage from './pages/ProductFormPage';
import ProductListPage from './pages/ProductListPage';
import ProductCatalogPage from './pages/ProductCatalogPage';
import LoteFormPage from './pages/LoteFormPage';
import LoteSearchPage from './pages/LoteSearchPage';
import ShoppingCartPage from './pages/ShoppingCartPage';
import LogsSection from './components/LogsSection';
import { redisGet } from './services/redis';
import { auth } from './services/firebase';
import './App.css';

function App() {
  const [logs, setLogs] = useState([]);
  const [cart, setCart] = useState([]);

  // Función para agregar logs
  const addLog = (type, message) => {
    setLogs((prevLogs) => [...prevLogs, { type, message }]);
  };

  // Recuperar carrito de compras al iniciar sesión
  useEffect(() => {
    const fetchCart = async () => {
      const user = auth.currentUser;
      if (user) {
        const savedCart = await redisGet(`shoppingCart:${user.uid}`);
        if (savedCart) {
          setCart(savedCart);
        }
      }
    };
    fetchCart();
  }, []);

  return (
    <Router>
      <div className="app-layout">
        <Navbar />
        <div className="main-content">
          <Routes>
            <Route path="/register" element={<RegisterPage addLog={addLog} />} />
            <Route path="/login" element={<LoginPage addLog={addLog} />} />
            <Route path="/users" element={<UserListPage addLog={addLog} />} />
            <Route path="/products" element={<ProductFormPage addLog={addLog} />} />
            <Route path="/product-list" element={<ProductListPage addLog={addLog} />} />
            <Route path="/catalog" element={<ProductCatalogPage addLog={addLog} cart={cart} setCart={setCart} />} />
            <Route path="/lotes" element={<LoteFormPage addLog={addLog} />} />
            <Route path="/lotes-search" element={<LoteSearchPage addLog={addLog} />} />
            <Route path="/cart" element={<ShoppingCartPage cart={cart} setCart={setCart} />} />
          </Routes>
        </div>
      </div>
      <LogsSection logs={logs} /> {/* Mostrar la sección de logs */}
    </Router>
  );
}

export default App;
