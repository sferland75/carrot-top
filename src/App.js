import React, { useState } from 'react';
import './App.css';
import InventoryPage from './pages/InventoryPage';
import SalesPage from './pages/SalesPage';
import ReportingPage from './pages/ReportingPage';
import { Package, ShoppingCart, BarChart2, Menu, ChevronRight, ChevronLeft } from 'lucide-react';

function App() {
  const [currentPage, setCurrentPage] = useState('inventory');
  const [sidebarExpanded, setSidebarExpanded] = useState(false);

  // Render the appropriate page based on currentPage state
  const renderPage = () => {
    switch(currentPage) {
      case 'inventory':
        return <InventoryPage />;
      case 'sales':
        return <SalesPage />;
      case 'reporting':
        return <ReportingPage />;
      default:
        return <InventoryPage />;
    }
  };

  // Toggle sidebar expansion
  const toggleSidebar = () => {
    setSidebarExpanded(!sidebarExpanded);
  };

  return (
    <div className="App">
      <aside className={`App-sidebar ${sidebarExpanded ? 'expanded' : ''}`}>
        <div className="sidebar-header">
          <div className="sidebar-logo-short">CT</div>
          <div className="sidebar-logo-full">Carrot-Top</div>
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
        </nav>
        
        <button className="sidebar-toggle" onClick={toggleSidebar}>
          {sidebarExpanded ? <ChevronLeft size={24} /> : <ChevronRight size={24} />}
        </button>
      </aside>
      
      <div className="App-content">
        <header className="App-header">
          <h1>Carrot-Top Bakery</h1>
          <button className="menu-btn">
            <Menu size={24} />
          </button>
        </header>
        
        <main className="App-main">
          {renderPage()}
        </main>
      </div>
    </div>
  );
}

export default App;