import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import RegisterPage from './pages/RegisterPage';
import LoginPage from './pages/LoginPage';
import UserListPage from './pages/UserListPage';
import ProductFormPage from './pages/ProductFormPage';
import ProductListPage from './pages/ProductListPage';
import LogsSection from './components/LogsSection';
import './App.css';

function App() {
  const [logs, setLogs] = useState([]);

  const addLog = (type, message) => {
    setLogs((prevLogs) => [...prevLogs, { type, message }]);
  };

  return (
    <Router>
      <Navbar />
      <div className="app-container">
        <Routes>
          <Route
            path="/register"
            element={<RegisterPage addLog={addLog} />}
          />
          <Route
            path="/login"
            element={<LoginPage addLog={addLog} />}
          />
          <Route
            path="/users"
            element={<UserListPage addLog={addLog} />}
          />
          <Route
            path="/products"
            element={<ProductFormPage addLog={addLog} />}
          />
          <Route
            path="/product-list"
            element={<ProductListPage addLog={addLog} />}
          />
        </Routes>
      </div>
      <LogsSection logs={logs} />
    </Router>
  );
}

export default App;