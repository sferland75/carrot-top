import React, { useState, useEffect } from 'react';
import './PageStyles.css';
import { ShoppingCart, DollarSign, CreditCard, X, CheckCircle, AlertTriangle } from 'lucide-react';
import { useInventory } from '../context/InventoryContext';
import ApiService from '../services/ApiService';

function SalesPage() {
  const { 
    inventory, 
    updateQuantity, 
    dayStarted
  } = useInventory();
  
  // Current sale state
  const [cart, setCart] = useState([]);
  const [paymentInfo, setPaymentInfo] = useState({
    amount: '',
    method: 'cash'
  });

  // Sales data state
  const [salesData, setSalesData] = useState({
    dailySales: [],
    nextId: 1
  });

  // Load sales data
  useEffect(() => {
    loadSalesData();
  }, []);
  
  // Function to load sales data
  const loadSalesData = async () => {
    try {
      const data = await ApiService.getCurrentSales();
      setSalesData(data);
    } catch (error) {
      console.error('Error loading sales data:', error);
    }
  };
  
  // HST rate (13%)
  const HST_RATE = 0.13;
  
  // Calculate totals
  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const hst = subtotal * HST_RATE;
  const total = subtotal + hst;
  
  // Calculate change if paying by cash
  const change = paymentInfo.amount ? Number(paymentInfo.amount) - total : 0;
  
  // Add item to cart
  const addToCart = (item) => {
    if (!dayStarted) {
      alert('Please start the day before making sales');
      return;
    }

    if (item.quantity <= 0) {
      alert('Item out of stock');
      return;
    }
    
    // Check if item is already in cart
    const existingItem = cart.find(cartItem => cartItem.id === item.id);
    
    if (existingItem) {
      // Increment quantity if already in cart
      setCart(cart.map(cartItem => 
        cartItem.id === item.id 
          ? { ...cartItem, quantity: cartItem.quantity + 1 } 
          : cartItem
      ));
    } else {
      // Add new item to cart
      setCart([...cart, { ...item, quantity: 1 }]);
    }
    
    // Update inventory quantity
    updateQuantity(item.id, -1);
  };
  
  // Remove item from cart
  const removeFromCart = (itemId) => {
    const item = cart.find(cartItem => cartItem.id === itemId);
    
    if (item.quantity > 1) {
      // Decrement quantity if more than 1
      setCart(cart.map(cartItem => 
        cartItem.id === itemId 
          ? { ...cartItem, quantity: cartItem.quantity - 1 } 
          : cartItem
      ));
    } else {
      // Remove item if quantity is 1
      setCart(cart.filter(cartItem => cartItem.id !== itemId));
    }
    
    // Return item to inventory
    updateQuantity(itemId, 1);
  };
  
  // Complete sale
  const completeSale = async () => {
    if (!dayStarted) {
      alert('Please start the day before completing sales');
      return;
    }

    if (cart.length === 0) {
      alert('Cart is empty');
      return;
    }
    
    const payment = parseFloat(paymentInfo.amount);
    
    if (isNaN(payment) || payment < total) {
      alert('Invalid payment amount');
      return;
    }
    
    const change = payment - total;
    
    // Create sale record
    const saleData = {
      total: subtotal + hst,
      subtotal: subtotal,
      hst: hst,
      paymentMethod: paymentInfo.method,
      paymentAmount: payment, // Store the actual payment amount
      items: cart.map(item => ({
        id: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity
      }))
    };
    
    try {
      // Record the sale using ApiService
      await ApiService.addSale(saleData);
      
      // Reload sales data to ensure it's up to date
      await loadSalesData();
      
      alert(`Sale completed!\nTotal: $${total.toFixed(2)}\nPayment: $${payment.toFixed(2)}\nChange: $${change.toFixed(2)}`);
      
      // Reset cart and payment info
      setCart([]);
      setPaymentInfo({
        amount: '',
        method: 'cash'
      });
    } catch (error) {
      console.error('Error recording sale:', error);
      alert('Error recording sale. Please try again.');
    }
  };

  return (
    <div className="page sales-page">
      {!dayStarted && (
        <div className="day-not-started-warning">
          <AlertTriangle size={16} />
          <span>Day not started. Please start the day in the Inventory page before making sales.</span>
        </div>
      )}
      <div className="page-grid">
        <div className="main-column">
          <div className="section-card">
            <div className="section-header">
              <h3 className="section-title">Products</h3>
            </div>
            
            <div className="product-list">
              {inventory.map(item => (
                <button 
                  key={item.id} 
                  className={`product-item ${item.quantity <= 0 ? 'out-of-stock' : ''}`}
                  onClick={() => item.quantity > 0 && addToCart(item)}
                  disabled={item.quantity <= 0 || !dayStarted}
                >
                  <div className="product-name">
                    {item.name}
                  </div>
                  <div className="product-details">
                    <span className="product-price">${item.price.toFixed(2)}</span>
                    <span className="product-quantity">({item.quantity})</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
        
        <div className="side-column">
          <div className="section-card">
            <div className="section-header">
              <h3 className="section-title">
                <ShoppingCart size={18} style={{ marginRight: '5px' }} />
                Current Order
              </h3>
            </div>
            
            <div className="cart-items">
              {cart.length === 0 ? (
                <p className="empty-cart">No items in cart</p>
              ) : (
                cart.map((item, index) => (
                  <div key={index} className="cart-item">
                    <span className="cart-item-name">{item.name}</span>
                    <span className="cart-item-quantity">x{item.quantity}</span>
                    <span className="cart-item-price">${(item.price * item.quantity).toFixed(2)}</span>
                    <button 
                      className="remove-btn"
                      onClick={() => removeFromCart(item.id)}
                    >
                      <X size={16} />
                    </button>
                  </div>
                ))
              )}
            </div>
            
            <div className="cart-summary">
              <div className="summary-row">
                <span>Subtotal:</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="summary-row">
                <span>HST (13%):</span>
                <span>${hst.toFixed(2)}</span>
              </div>
              <div className="summary-row total">
                <span>Total:</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>
            
            <div className="payment-section">
              <div className="form-group">
                <label htmlFor="paymentAmount">Payment Amount</label>
                <input
                  type="number"
                  id="paymentAmount"
                  min={total}
                  step="0.01"
                  value={paymentInfo.amount}
                  onChange={(e) => setPaymentInfo({...paymentInfo, amount: e.target.value})}
                  placeholder="Enter payment amount"
                  disabled={!dayStarted}
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="paymentMethod">Payment Method</label>
                <select
                  id="paymentMethod"
                  value={paymentInfo.method}
                  onChange={(e) => setPaymentInfo({...paymentInfo, method: e.target.value})}
                  disabled={!dayStarted}
                >
                  <option value="cash">Cash</option>
                  <option value="card">Card</option>
                  <option value="mobile">Mobile Payment</option>
                </select>
              </div>
              
              {paymentInfo.method === 'cash' && (
                <div className="change-amount">
                  <CheckCircle size={16} style={{ marginRight: '5px' }} />
                  Change Due: ${change.toFixed(2)}
                </div>
              )}
              
              <button
                className="complete-sale-btn"
                onClick={completeSale}
                disabled={cart.length === 0 || !dayStarted}
              >
                <ShoppingCart size={16} style={{ marginRight: '8px' }} />
                Complete Sale
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SalesPage;