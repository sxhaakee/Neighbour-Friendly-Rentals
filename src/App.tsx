import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import Header from './components/Layout/Header';
import Footer from './components/Layout/Footer';
import { ScrollToTop } from './components/ScrollToTop';
import Home from './pages/Home';
import Listings from './pages/Listings';
import ItemDetails from './pages/ItemDetails';
import Dashboard from './pages/Dashboard';
import About from './pages/About';
import Login from './pages/Login';
import AddItem from './pages/AddItem';
import EditItem from './pages/EditItem';
import VerifyID from './pages/VerifyID';
import Admin from './pages/Admin';
import BookItem from './pages/BookItem';
import Properties from './pages/Properties';
import PropertyDetails from './pages/PropertyDetails';
import AddProperty from './pages/AddProperty';
import Terms from './pages/Legal/Terms';
import Privacy from './pages/Legal/Privacy';
import FAB from './components/Common/FAB';
import { ToastContainer } from './components/Common/Toast';
import { BookingNotification } from './components/Notifications/BookingNotification';
import Chat from './pages/Chat';
import Messages from './pages/Messages';
import { logPageView } from './utils/analytics';
import { analyticsService } from './services/analyticsService';

function AppContent() {
  const location = useLocation();

  useEffect(() => {
    logPageView(location.pathname + location.search);
    analyticsService.pageView(location.pathname);
  }, [location]);

  return (
    <div className="min-h-screen bg-neutral-50">
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
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/about" element={<About />} />
          <Route path="/login" element={<Login />} />
          <Route path="/add-item" element={<AddItem />} />
          <Route path="/edit-item/:id" element={<EditItem />} />
          <Route path="/verify-id" element={<VerifyID />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/messages" element={<Messages />} />
          <Route path="/messages/:conversationId" element={<Messages />} />
          <Route path="/chat" element={<Chat />} />
          <Route path="/chat/:conversationId" element={<Chat />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/privacy" element={<Privacy />} />
        </Routes>
      </main>
      <Footer />
      <FAB />
      <BookingNotification />
      <ToastContainer />
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