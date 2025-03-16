import React, { useState } from 'react';
import './PageStyles.css';
import { DollarSign, CreditCard, BarChart2, Save, Clock } from 'lucide-react';

function ReportingPage() {
  // In a real app, this would fetch from your database
  // For now, we'll use sample data
  const [salesData] = useState({
    dailySales: [
      { id: 1, timestamp: '2025-03-16T10:15:00Z', total: 17.50, hst: 2.28, paymentMethod: 'cash' },
      { id: 2, timestamp: '2025-03-16T11:30:00Z', total: 28.25, hst: 3.67, paymentMethod: 'e-transfer' },
      { id: 3, timestamp: '2025-03-16T14:45:00Z', total: 10.75, hst: 1.40, paymentMethod: 'cash' },
      { id: 4, timestamp: '2025-03-16T16:20:00Z', total: 42.00, hst: 5.46, paymentMethod: 'e-transfer' },
    ]
  });
  
  // Calculate totals
  const totalSales = salesData.dailySales.reduce((sum, sale) => sum + sale.total, 0);
  const totalHST = salesData.dailySales.reduce((sum, sale) => sum + sale.hst, 0);
  
  // Calculate payment method totals
  const cashSales = salesData.dailySales
    .filter(sale => sale.paymentMethod === 'cash')
    .reduce((sum, sale) => sum + sale.total, 0);
    
  const eTransferSales = salesData.dailySales
    .filter(sale => sale.paymentMethod === 'e-transfer')
    .reduce((sum, sale) => sum + sale.total, 0);
  
  // Format the date for display
  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  
  // Handle end of day
  const endDay = () => {
    // In a real app, this would finalize the day's sales
    // and perform any necessary database operations
    alert('Day successfully closed. Sales report has been saved.');
  };
  
  return (
    <div className="page reporting-page">
      <div className="section-header">
        <h2>Sales Reports</h2>
      </div>
      
      <div className="report-date">
        <h3>{today}</h3>
      </div>
      
      <div className="summary-cards">
        <div className="summary-card">
          <h4><BarChart2 size={16} style={{ marginRight: '5px' }} /> Total Sales</h4>
          <p className="card-value">${totalSales.toFixed(2)}</p>
        </div>
        
        <div className="summary-card">
          <h4>HST Collected</h4>
          <p className="card-value">${totalHST.toFixed(2)}</p>
        </div>
        
        <div className="summary-card">
          <h4><DollarSign size={16} style={{ marginRight: '5px' }} /> Cash Sales</h4>
          <p className="card-value">${cashSales.toFixed(2)}</p>
        </div>
        
        <div className="summary-card">
          <h4><CreditCard size={16} style={{ marginRight: '5px' }} /> E-Transfer</h4>
          <p className="card-value">${eTransferSales.toFixed(2)}</p>
        </div>
      </div>
      
      <div className="transactions-list">
        <div className="section-header">
          <h3 className="section-title">Today's Transactions</h3>
        </div>
        
        <div className="transaction-header">
          <span>Time</span>
          <span>Amount</span>
          <span>HST</span>
          <span>Payment</span>
        </div>
        
        {salesData.dailySales.map(sale => {
          const saleTime = new Date(sale.timestamp).toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit'
          });
          
          return (
            <div key={sale.id} className="transaction-item">
              <span><Clock size={14} style={{ marginRight: '5px', verticalAlign: 'middle' }} />{saleTime}</span>
              <span>${sale.total.toFixed(2)}</span>
              <span>${sale.hst.toFixed(2)}</span>
              <span className={`payment-${sale.paymentMethod}`}>
                {sale.paymentMethod === 'cash' ? 
                  <><DollarSign size={14} style={{ marginRight: '3px', verticalAlign: 'middle' }} /> Cash</> : 
                  <><CreditCard size={14} style={{ marginRight: '3px', verticalAlign: 'middle' }} /> E-Transfer</>
                }
              </span>
            </div>
          );
        })}
      </div>
      
      <div className="end-day-section">
        <button className="end-day-btn" onClick={endDay}>
          <Save size={16} style={{ marginRight: '8px' }} />
          Close Day & Generate Report
        </button>
        <p className="end-day-note">
          This will finalize today's sales and prepare the data for accounting.
        </p>
      </div>
    </div>
  );
}

export default ReportingPage;