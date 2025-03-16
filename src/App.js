import React, { useState, useEffect, createContext } from 'react';
import './App.css';
import InventoryPage from './pages/InventoryPage';
import SalesPage from './pages/SalesPage';
import ReportingPage from './pages/ReportingPage';
import SettingsPage from './pages/SettingsPage';
import { Package, ShoppingCart, BarChart2, Settings, Menu, ChevronRight, ChevronLeft } from 'lucide-react';
import CustomCarrotLogo from './components/CustomCarrotLogo';
import { InventoryProvider } from './context/InventoryContext';
import ApiService from './services/ApiService';

// Create a context for app-wide functions
export const AppContext = createContext({});

function App() {
  const [currentPage, setCurrentPage] = useState('inventory');
  const [sidebarExpanded, setSidebarExpanded] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);

  // Initialize ApiService
  useEffect(() => {
    const initializeApi = async () => {
      try {
        await ApiService.initialize();
        console.log('ApiService initialized successfully');
      } catch (error) {
        console.error('Error initializing ApiService:', error);
      } finally {
        setIsInitializing(false);
      }
    };

    initializeApi();
  }, []);

  // Render the appropriate page based on currentPage state
  const renderPage = () => {
    switch(currentPage) {
      case 'inventory':
        return <InventoryPage />;
      case 'sales':
        return <SalesPage />;
      case 'reporting':
        return <ReportingPage />;
      case 'settings':
        return <SettingsPage />;
      default:
        return <InventoryPage />;
    }
  };

  // Toggle sidebar expansion
  const toggleSidebar = () => {
    setSidebarExpanded(!sidebarExpanded);
  };

  return (
    <InventoryProvider>
      <div className="App">
        {isInitializing ? (
          <div className="loading-indicator">
            Initializing application...
          </div>
        ) : (
          <>
            <aside className={`App-sidebar ${sidebarExpanded ? 'expanded' : ''}`}>
              <div className="sidebar-header">
                <div className="sidebar-logo-short">
                  <CustomCarrotLogo size={64} />
                </div>
                <div className="sidebar-logo-full">Carrot Top Bakery Management Application</div>
              </div>
              
              <nav className="sidebar-nav">
                <button 
                  className={`nav-button ${currentPage === 'inventory' ? 'active' : ''}`}
                  onClick={() => setCurrentPage('inventory')}
                >
                  <Package className="nav-icon" size={24} />
                  <span className="nav-text">Inventory</span>
                </button>
                <button 
                  className={`nav-button ${currentPage === 'sales' ? 'active' : ''}`}
                  onClick={() => setCurrentPage('sales')}
                >
                  <ShoppingCart className="nav-icon" size={24} />
                  <span className="nav-text">Sales</span>
                </button>
                <button 
                  className={`nav-button ${currentPage === 'reporting' ? 'active' : ''}`}
                  onClick={() => setCurrentPage('reporting')}
                >
                  <BarChart2 className="nav-icon" size={24} />
                  <span className="nav-text">Reports</span>
                </button>
                <button 
                  className={`nav-button ${currentPage === 'settings' ? 'active' : ''}`}
                  onClick={() => setCurrentPage('settings')}
                >
                  <Settings className="nav-icon" size={24} />
                  <span className="nav-text">Settings</span>
                </button>
              </nav>
              
              <button className="sidebar-toggle" onClick={toggleSidebar}>
                {sidebarExpanded ? <ChevronLeft size={24} /> : <ChevronRight size={24} />}
              </button>
            </aside>
            
            <div className="App-content">
              <header className="App-header">
                <h1>Carrot Top Bakery Management Application</h1>
                <button className="menu-btn">
                  <Menu size={24} />
                </button>
              </header>
              
              <main className="App-main">
                {renderPage()}
              </main>
            </div>
          </>
        )}
      </div>
    </InventoryProvider>
  );
}

export default App;