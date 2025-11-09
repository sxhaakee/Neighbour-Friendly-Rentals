import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { initGA, trackPageView } from './utils/googleAnalytics';
import Header from './components/Layout/Header';
import Footer from './components/Layout/Footer';
import { ScrollToTop } from './components/ScrollToTop';
import Home from './pages/Home';
import Listings from './pages/Listings';
import ItemDetails from './pages/ItemDetails';
import Dashboard from './pages/DashboardNew';
import About from './pages/About';
import Login from './pages/Login';
import AddItem from './pages/AddItem';
import EditItem from './pages/EditItem';
import EditService from './pages/EditService';
import EditProperty from './pages/EditProperty';
import VerifyID from './pages/VerifyID';
import Admin from './pages/Admin';
import BookItem from './pages/BookItem';
import Properties from './pages/Properties';
import PropertyDetails from './pages/PropertyDetails';
import AddProperty from './pages/AddProperty';
import Services from './pages/Services';
import ServiceDetails from './pages/ServiceDetails';
import AddService from './pages/AddService';
import Terms from './pages/Terms';
import Privacy from './pages/Privacy';
import Premium from './pages/Premium';
import Profile from './pages/Profile';
import FAB from './components/Common/FAB';
import { ToastContainer } from './components/Common/Toast';
import { AIChatbot } from './components/AIChatbot';
import Chat from './pages/Chat';
import Messages from './pages/Messages';
import { logPageView } from './utils/analytics';
import { analyticsService } from './services/analyticsService';
import { Analytics } from '@vercel/analytics/react';

function AppContent() {
  const location = useLocation();

  useEffect(() => {
    // Initialize Google Analytics on mount
    initGA();
  }, []);

  useEffect(() => {
    // Track page views
    logPageView(location.pathname + location.search);
    analyticsService.pageView(location.pathname);
    trackPageView(location.pathname + location.search);
  }, [location]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50/30 via-white to-yellow-50/30">
      <ScrollToTop />
      <Header />
      <main className="pt-16">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/listings" element={<Listings />} />
          <Route path="/item/:id" element={<ItemDetails />} />
          <Route path="/book/:id" element={<BookItem />} />
          <Route path="/properties" element={<Properties />} />
          <Route path="/properties/:id" element={<PropertyDetails />} />
          <Route path="/add-property" element={<AddProperty />} />
          <Route path="/services" element={<Services />} />
          <Route path="/services/:id" element={<ServiceDetails />} />
          <Route path="/add-service" element={<AddService />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/about" element={<About />} />
          <Route path="/login" element={<Login />} />
          <Route path="/add-item" element={<AddItem />} />
          <Route path="/edit-item/:id" element={<EditItem />} />
          <Route path="/edit-service/:id" element={<EditService />} />
          <Route path="/edit-property/:id" element={<EditProperty />} />
          <Route path="/verify-id" element={<VerifyID />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/messages" element={<Messages />} />
          <Route path="/messages/:conversationId" element={<Messages />} />
          <Route path="/chat" element={<Chat />} />
          <Route path="/chat/:conversationId" element={<Chat />} />
          <Route path="/premium" element={<Premium />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/privacy" element={<Privacy />} />
        </Routes>
      </main>
      <Footer />
      <FAB />
      <AIChatbot />
      <ToastContainer />
      <Analytics />
    </div>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;