import React, { useState, useEffect } from 'react';
import './PageStyles.css';
import { ShoppingCart, DollarSign, CreditCard, X, CheckCircle } from 'lucide-react';

function SalesPage() {
  // Sample inventory (in a real app, this would be shared state with InventoryPage)
  const [inventory, setInventory] = useState([
    { id: 1, name: 'Cheesecake Bites', quantity: 12, price: 3.50 },
    { id: 2, name: 'Sourdough Bread', quantity: 5, price: 7.00 },
    { id: 3, name: 'Cake Squares', quantity: 8, price: 2.75 },
    { id: 4, name: 'Cinnamon Rolls', quantity: 6, price: 4.25 },
  ]);
  
  // Current sale state
  const [cart, setCart] = useState([]);
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [amountTendered, setAmountTendered] = useState('');
  
  // HST rate (13%)
  const HST_RATE = 0.13;
  
  // Calculate totals
  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const hst = subtotal * HST_RATE;
  const total = subtotal + hst;
  
  // Calculate change if paying by cash
  const change = amountTendered ? Number(amountTendered) - total : 0;
  
  // Add item to cart
  const addToCart = (inventoryItem) => {
    if (inventoryItem.quantity <= 0) {
      alert('This item is out of stock!');
      return;
    }
    
    // Check if item is already in cart
    const existingItem = cart.find(item => item.id === inventoryItem.id);
    
    if (existingItem) {
      // Increment quantity if already in cart
      setCart(cart.map(item => 
        item.id === inventoryItem.id 
          ? { ...item, quantity: item.quantity + 1 } 
          : item
      ));
    } else {
      // Add new item to cart
      setCart([...cart, { ...inventoryItem, quantity: 1 }]);
    }
    
    // Update inventory
    setInventory(inventory.map(item => 
      item.id === inventoryItem.id 
        ? { ...item, quantity: item.quantity - 1 } 
        : item
    ));
  };
  
  // Remove item from cart
  const removeFromCart = (cartItem) => {
    // If quantity is 1, remove the item
    if (cartItem.quantity === 1) {
      setCart(cart.filter(item => item.id !== cartItem.id));
    } else {
      // Otherwise decrement quantity
      setCart(cart.map(item => 
        item.id === cartItem.id 
          ? { ...item, quantity: item.quantity - 1 } 
          : item
      ));
    }
    
    // Return item to inventory
    setInventory(inventory.map(item => 
      item.id === cartItem.id 
        ? { ...item, quantity: item.quantity + 1 } 
        : item
    ));
  };
  
  // Complete sale
  const completeSale = () => {
    if (cart.length === 0) {
      alert('Cart is empty. Please add items before completing sale.');
      return;
    }
    
    if (paymentMethod === 'cash' && (!amountTendered || Number(amountTendered) < total)) {
      alert('Please enter a valid amount tendered.');
      return;
    }
    
    // Here you would normally save the sale to your database
    const sale = {
      id: Date.now(),
      items: [...cart],
      subtotal,
      hst,
      total,
      paymentMethod,
      amountTendered: paymentMethod === 'cash' ? Number(amountTendered) : total,
      change: paymentMethod === 'cash' ? change : 0,
      timestamp: new Date().toISOString()
    };
    
    // For now, just log the sale and reset
    console.log('Sale completed:', sale);
    alert(`Sale completed! ${paymentMethod === 'cash' ? 'Change: $' + change.toFixed(2) : 'E-transfer received.'}`);
    
    // Reset cart and payment info
    setCart([]);
    setPaymentMethod('cash');
    setAmountTendered('');
  };
  
  return (
    <div className="page sales-page">
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
                  onClick={() => addToCart(item)}
                  disabled={item.quantity <= 0}
                >
                  <div className="product-name">{item.name}</div>
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
                      onClick={() => removeFromCart(item)}
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
              <div className="payment-methods">
                <button 
                  className={`payment-btn ${paymentMethod === 'cash' ? 'active' : ''}`}
                  onClick={() => setPaymentMethod('cash')}
                >
                  <DollarSign size={16} style={{ marginRight: '5px' }} />
                  Cash
                </button>
                <button 
                  className={`payment-btn ${paymentMethod === 'e-transfer' ? 'active' : ''}`}
                  onClick={() => setPaymentMethod('e-transfer')}
                >
                  <CreditCard size={16} style={{ marginRight: '5px' }} />
                  E-Transfer
                </button>
              </div>
              
              {paymentMethod === 'cash' && (
                <div className="cash-payment">
                  <div className="form-group">
                    <label htmlFor="amountTendered">Amount Received ($):</label>
                    <input
                      type="number"
                      id="amountTendered"
                      min={total}
                      step="0.01"
                      value={amountTendered}
                      onChange={(e) => setAmountTendered(e.target.value)}
                      className="form-control"
                      placeholder="Enter amount received"
                    />
                  </div>
                  
                  {amountTendered && Number(amountTendered) >= total && (
                    <div className="change-amount">
                      <CheckCircle size={16} style={{ marginRight: '5px' }} />
                      Change Due: ${change.toFixed(2)}
                    </div>
                  )}
                </div>
              )}
              
              <button 
                className="complete-sale-btn"
                onClick={completeSale}
                disabled={cart.length === 0}
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