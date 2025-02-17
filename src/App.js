import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import RegisterPage from './pages/RegisterPage';
import LoginPage from './pages/LoginPage';
import UserListPage from './pages/UserListPage';
import ProductFormPage from './pages/ProductFormPage';
import ProductListPage from './pages/ProductListPage';
import ProductCatalogPage from './pages/ProductCatalogPage';
import LogsSection from './components/LogsSection';
import './App.css';

function App() {
  const [logs, setLogs] = useState([]);

  const addLog = (type, message) => {
    setLogs((prevLogs) => [...prevLogs, { type, message }]);
  };

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
            <Route path="/catalog" element={<ProductCatalogPage addLog={addLog} />} />
          </Routes>
        </div>
      </div>
      <LogsSection logs={logs} />
    </Router>
  );
}

export default App;