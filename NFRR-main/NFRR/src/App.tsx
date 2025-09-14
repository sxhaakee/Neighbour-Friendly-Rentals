import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Header from './components/Layout/Header';
import Footer from './components/Layout/Footer';
import Home from './pages/Home';
import Listings from './pages/Listings';
import ItemDetails from './pages/ItemDetails';
import Dashboard from './pages/Dashboard';
import About from './pages/About';
import Login from './pages/Login';
import FAB from './components/Common/FAB';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-neutral-50">
          <Header />
          <main className="pt-16">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/listings" element={<Listings />} />
              <Route path="/item/:id" element={<ItemDetails />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/about" element={<About />} />
              <Route path="/login" element={<Login />} />
            </Routes>
          </main>
          <Footer />
          <FAB />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
