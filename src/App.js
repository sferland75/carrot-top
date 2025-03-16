import React, { useState } from 'react';
import './App.css';
import InventoryPage from './pages/InventoryPage';
import SalesPage from './pages/SalesPage';
import ReportingPage from './pages/ReportingPage';
import { Package, ShoppingCart, BarChart2, Menu } from 'lucide-react';

function App() {
  const [currentPage, setCurrentPage] = useState('inventory');
  const [menuOpen, setMenuOpen] = useState(false);

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

  return (
    <div className="App">
      <header className="App-header">
        <h1>Carrot-Top Bakery</h1>
        <button className="menu-btn" onClick={() => setMenuOpen(!menuOpen)}>
          <Menu size={24} />
        </button>
      </header>
      
      <main className="App-main">
        {renderPage()}
      </main>
      
      <nav className="App-nav">
        <button 
          className={`nav-button ${currentPage === 'inventory' ? 'active' : ''}`}
          onClick={() => setCurrentPage('inventory')}
        >
          <Package className="nav-icon" size={24} />
          <span>Inventory</span>
        </button>
        <button 
          className={`nav-button ${currentPage === 'sales' ? 'active' : ''}`}
          onClick={() => setCurrentPage('sales')}
        >
          <ShoppingCart className="nav-icon" size={24} />
          <span>Sales</span>
        </button>
        <button 
          className={`nav-button ${currentPage === 'reporting' ? 'active' : ''}`}
          onClick={() => setCurrentPage('reporting')}
        >
          <BarChart2 className="nav-icon" size={24} />
          <span>Reports</span>
        </button>
      </nav>
    </div>
  );
}

export default App;