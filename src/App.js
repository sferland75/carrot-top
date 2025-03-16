import React, { useState } from 'react';
import './App.css';
import InventoryPage from './pages/InventoryPage';
import SalesPage from './pages/SalesPage';
import ReportingPage from './pages/ReportingPage';

function App() {
  const [currentPage, setCurrentPage] = useState('inventory');

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
      </header>
      
      <main className="App-main">
        {renderPage()}
      </main>
      
      <nav className="App-nav">
        <button 
          className={`nav-button ${currentPage === 'inventory' ? 'active' : ''}`}
          onClick={() => setCurrentPage('inventory')}
        >
          Inventory
        </button>
        <button 
          className={`nav-button ${currentPage === 'sales' ? 'active' : ''}`}
          onClick={() => setCurrentPage('sales')}
        >
          Sales
        </button>
        <button 
          className={`nav-button ${currentPage === 'reporting' ? 'active' : ''}`}
          onClick={() => setCurrentPage('reporting')}
        >
          Reports
        </button>
      </nav>
    </div>
  );
}

export default App;