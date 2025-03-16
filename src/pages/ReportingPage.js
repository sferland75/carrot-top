import React, { useState, useEffect } from 'react';
import './PageStyles.css';
import { DollarSign, CreditCard, BarChart2, Save, Clock, FileText, Download, Eye, ShoppingBag, AlertTriangle, Calendar, ChevronDown, ChevronUp } from 'lucide-react';
import { useInventory } from '../context/InventoryContext';
import ApiService from '../services/ApiService';

function ReportingPage() {
  const { 
    inventory, 
    dayStarted, 
    dayStartTime, 
    endDay
  } = useInventory();

  // Track sales transactions
  const [salesData, setSalesData] = useState({
    dailySales: [],
    nextId: 1
  });

  // Track historical sales data
  const [salesHistory, setSalesHistory] = useState([]);
  
  // Selected date for historical view
  const [selectedDate, setSelectedDate] = useState(null);
  
  // Show/hide historical data
  const [showHistory, setShowHistory] = useState(false);
  
  // Loading state
  const [isLoading, setIsLoading] = useState(true);

  // Load sales data and history
  useEffect(() => {
    loadData();
  }, []);
  
  // Function to load sales data
  const loadData = async () => {
    setIsLoading(true);
    try {
      // Load current sales data
      const currentSales = await ApiService.getCurrentSales();
      setSalesData(currentSales);
      
      // Load sales history
      const history = await ApiService.getSalesHistory();
      setSalesHistory(history);
      
      if (history.length > 0) {
        setSelectedDate(history[history.length - 1].date);
      } else {
        setSelectedDate(null);
      }
    } catch (error) {
      console.error('Error loading sales data:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Show/hide report preview
  const [showReportPreview, setShowReportPreview] = useState(false);
  
  // Calculate totals
  const totalSales = salesData.dailySales.reduce((sum, sale) => sum + sale.total, 0);
  const totalHST = salesData.dailySales.reduce((sum, sale) => sum + sale.hst, 0);
  
  // Calculate payment method totals
  const cashSales = salesData.dailySales
    .filter(sale => sale.paymentMethod === 'cash')
    .reduce((sum, sale) => sum + sale.total, 0);
    
  const cardSales = salesData.dailySales
    .filter(sale => sale.paymentMethod === 'card')
    .reduce((sum, sale) => sum + sale.total, 0);

  const mobileSales = salesData.dailySales
    .filter(sale => sale.paymentMethod === 'mobile')
    .reduce((sum, sale) => sum + sale.total, 0);
  
  // Format the date for display
  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  
  // Handle end of day
  const handleEndDay = async () => {
    if (!dayStarted) {
      alert('Day is not started');
      return;
    }
    
    try {
      // Call the endDay function from context
      await endDay();
      
      // Reload data after ending the day
      const currentSales = await ApiService.getCurrentSales();
      setSalesData(currentSales);
      
      const history = await ApiService.getSalesHistory();
      setSalesHistory(history);
      
      if (history.length > 0) {
        setSelectedDate(history[history.length - 1].date);
      }
      
      alert('Day successfully closed. Sales report has been saved to history.');
    } catch (error) {
      console.error('Error ending day:', error);
      alert('Error ending day. Please try again.');
    }
  };
  
  // Preview report
  const previewReport = () => {
    setShowReportPreview(true);
  };
  
  // Download report
  const downloadReport = () => {
    // Create report content
    const reportContent = generateReportContent();
    
    // Create blob and download link
    const blob = new Blob([reportContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `sales-report-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    alert('Report downloaded successfully!');
  };
  
  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };
  
  // Toggle history view
  const toggleHistory = () => {
    setShowHistory(!showHistory);
    if (!showHistory && salesHistory.length > 0 && !selectedDate) {
      setSelectedDate(salesHistory[salesHistory.length - 1].date);
    }
  };
  
  // Get selected history entry
  const getSelectedHistoryEntry = () => {
    if (!selectedDate) return null;
    return salesHistory.find(entry => entry.date === selectedDate);
  };
  
  // Generate report content
  const generateReportContent = () => {
    return `
CARROT-TOP BAKERY
DAILY SALES REPORT
${today}
----------------------------------------

SUMMARY
----------------------------------------
Total Sales: $${totalSales.toFixed(2)}
Total HST: $${totalHST.toFixed(2)}
Grand Total: $${(totalSales + totalHST).toFixed(2)}

PAYMENT METHODS
----------------------------------------
Cash Sales: $${cashSales.toFixed(2)}
Card Sales: $${cardSales.toFixed(2)}
Mobile Payment Sales: $${mobileSales.toFixed(2)}

TRANSACTION DETAILS
----------------------------------------
${salesData.dailySales.map(sale => {
  const saleTime = new Date(sale.timestamp).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit'
  });
  const paymentAmount = sale.paymentAmount ? sale.paymentAmount.toFixed(2) : sale.total.toFixed(2);
  return `${saleTime} - Total: $${sale.total.toFixed(2)} - Payment: $${paymentAmount} - ${sale.paymentMethod.toUpperCase()}`;
}).join('\n')}

INVENTORY STATUS
----------------------------------------
${inventory.map(item => {
  return `${item.name} - Qty: ${item.quantity} - $${item.price.toFixed(2)}`;
}).join('\n')}

----------------------------------------
Report generated on ${new Date().toLocaleString()}
    `;
  };
  
  if (isLoading) {
    return (
      <div className="page reporting-page">
        <div className="loading-indicator">Loading sales data...</div>
      </div>
    );
  }
  
  return (
    <div className="page reporting-page">
      {!dayStarted && (
        <div className="day-not-started-warning">
          <AlertTriangle size={16} />
          <span>Day not started. Please start the day in the Inventory page before viewing reports.</span>
        </div>
      )}
      
      <div className="page-grid">
        <div className="main-column">
          <div className="section-card">
            <div className="section-header">
              <h3 className="section-title">Sales Summary</h3>
              <span>{dayStarted ? `Day Started: ${dayStartTime.toLocaleTimeString()}` : 'Day Not Started'}</span>
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
                <h4><CreditCard size={16} style={{ marginRight: '5px' }} /> Card Sales</h4>
                <p className="card-value">${cardSales.toFixed(2)}</p>
              </div>
            </div>
          </div>
          
          <div className="section-card">
            <div className="section-header">
              <h3 className="section-title">Today's Transactions</h3>
            </div>
            
            {salesData.dailySales.length === 0 ? (
              <div className="empty-transactions">
                <p>No transactions recorded today</p>
              </div>
            ) : (
              <>
                <div className="transaction-header">
                  <span>Time</span>
                  <span>Amount</span>
                  <span>HST</span>
                  <span>Payment</span>
                  <span>Method</span>
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
                      <span>${sale.paymentAmount ? sale.paymentAmount.toFixed(2) : sale.total.toFixed(2)}</span>
                      <span className={`payment-${sale.paymentMethod}`}>
                        {sale.paymentMethod === 'cash' ? 
                          <><DollarSign size={14} style={{ marginRight: '3px', verticalAlign: 'middle' }} /> Cash</> : 
                          sale.paymentMethod === 'card' ?
                          <><CreditCard size={14} style={{ marginRight: '3px', verticalAlign: 'middle' }} /> Card</> :
                          <><CreditCard size={14} style={{ marginRight: '3px', verticalAlign: 'middle' }} /> Mobile</>
                        }
                      </span>
                    </div>
                  );
                })}
              </>
            )}
          </div>

          <div className="section-card">
            <div className="section-header">
              <h3 className="section-title">Current Inventory Status</h3>
            </div>
            
            {inventory.length === 0 ? (
              <div className="empty-inventory">
                <p>No inventory items available</p>
              </div>
            ) : (
              <>
                <div className="inventory-header">
                  <span>Product</span>
                  <span>Quantity</span>
                  <span>Price</span>
                </div>
                
                {inventory.map(item => (
                  <div key={item.id} className="inventory-item">
                    <span className="item-name">{item.name}</span>
                    <span className="item-quantity">{item.quantity}</span>
                    <span className="item-price">${item.price.toFixed(2)}</span>
                  </div>
                ))}
              </>
            )}
          </div>
          
          {/* Historical Sales Section */}
          <div className="section-card">
            <div className="section-header history-header" onClick={toggleHistory}>
              <h3 className="section-title">
                <Calendar size={16} style={{ marginRight: '5px' }} />
                Historical Sales Data
              </h3>
              <button className="toggle-history-btn">
                {showHistory ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>
            </div>
            
            {showHistory && (
              <div className="history-content">
                {salesHistory.length === 0 ? (
                  <div className="empty-history">
                    <p>No historical data available yet</p>
                  </div>
                ) : (
                  <>
                    <div className="history-date-selector">
                      <label htmlFor="historyDate">Select Date:</label>
                      <select 
                        id="historyDate" 
                        value={selectedDate || ''} 
                        onChange={(e) => setSelectedDate(e.target.value)}
                      >
                        {salesHistory.map((entry, index) => (
                          <option key={index} value={entry.date}>
                            {formatDate(entry.date)}
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    {getSelectedHistoryEntry() && (
                      <div className="history-details">
                        <div className="history-summary">
                          <h4>Summary for {formatDate(getSelectedHistoryEntry().date)}</h4>
                          <div className="history-summary-grid">
                            <div className="history-summary-item">
                              <span>Total Sales:</span>
                              <span>${getSelectedHistoryEntry().totals?.totalSales?.toFixed(2) || '0.00'}</span>
                            </div>
                            <div className="history-summary-item">
                              <span>HST Collected:</span>
                              <span>${getSelectedHistoryEntry().totals?.totalHST?.toFixed(2) || '0.00'}</span>
                            </div>
                            <div className="history-summary-item">
                              <span>Cash Sales:</span>
                              <span>${getSelectedHistoryEntry().totals?.cashSales?.toFixed(2) || '0.00'}</span>
                            </div>
                            <div className="history-summary-item">
                              <span>Card Sales:</span>
                              <span>${getSelectedHistoryEntry().totals?.cardSales?.toFixed(2) || '0.00'}</span>
                            </div>
                          </div>
                        </div>
                        
                        <h4>Transactions</h4>
                        {!getSelectedHistoryEntry().sales || getSelectedHistoryEntry().sales.length === 0 ? (
                          <p>No transactions on this day</p>
                        ) : (
                          <>
                            <div className="transaction-header">
                              <span>Time</span>
                              <span>Amount</span>
                              <span>HST</span>
                              <span>Payment</span>
                              <span>Method</span>
                            </div>
                            
                            {getSelectedHistoryEntry().sales.map((sale, index) => {
                              const saleTime = new Date(sale.timestamp).toLocaleTimeString('en-US', {
                                hour: '2-digit',
                                minute: '2-digit'
                              });
                              
                              return (
                                <div key={index} className="transaction-item">
                                  <span><Clock size={14} style={{ marginRight: '5px', verticalAlign: 'middle' }} />{saleTime}</span>
                                  <span>${sale.total.toFixed(2)}</span>
                                  <span>${sale.hst.toFixed(2)}</span>
                                  <span>${sale.paymentAmount ? sale.paymentAmount.toFixed(2) : sale.total.toFixed(2)}</span>
                                  <span className={`payment-${sale.paymentMethod}`}>
                                    {sale.paymentMethod === 'cash' ? 
                                      <><DollarSign size={14} style={{ marginRight: '3px', verticalAlign: 'middle' }} /> Cash</> : 
                                      sale.paymentMethod === 'card' ?
                                      <><CreditCard size={14} style={{ marginRight: '3px', verticalAlign: 'middle' }} /> Card</> :
                                      <><CreditCard size={14} style={{ marginRight: '3px', verticalAlign: 'middle' }} /> Mobile</>
                                    }
                                  </span>
                                </div>
                              );
                            })}
                          </>
                        )}
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
          </div>
        </div>
        
        <div className="side-column">
          <div className="end-day-section">
            <h3 className="section-title">End of Day</h3>
            <p>When you're ready to close for the day, generate your daily sales report.</p>
            
            <div className="report-actions">
              <button 
                className="preview-report-btn" 
                onClick={previewReport}
                disabled={!dayStarted}
              >
                <Eye size={16} style={{ marginRight: '8px' }} />
                Preview Report
              </button>
              
              <button 
                className="download-report-btn" 
                onClick={downloadReport}
                disabled={!dayStarted}
              >
                <Download size={16} style={{ marginRight: '8px' }} />
                Download Report
              </button>
              
              <button 
                className="end-day-btn" 
                onClick={handleEndDay}
                disabled={!dayStarted}
              >
                <Save size={16} style={{ marginRight: '8px' }} />
                Close Day
              </button>
            </div>
            
            <p className="end-day-note">
              This will finalize today's sales and save them to history.
            </p>
          </div>
          
          {showReportPreview && (
            <div className="report-preview-section">
              <div className="section-header">
                <h3 className="section-title">
                  <FileText size={16} style={{ marginRight: '5px' }} />
                  Report Preview
                </h3>
                <button 
                  className="close-preview-btn"
                  onClick={() => setShowReportPreview(false)}
                >
                  ×
                </button>
              </div>
              <pre className="report-preview-content">
                {generateReportContent()}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ReportingPage;