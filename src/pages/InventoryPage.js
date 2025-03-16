import React, { useState } from 'react';
import { Plus, Trash2, RefreshCw } from 'lucide-react';
import './PageStyles.css';
import { useInventory } from '../context/InventoryContext';

function InventoryPage() {
  const { 
    inventory, 
    updateQuantity, 
    addProduct,
    deleteProduct,
    dayStarted,
    startDay,
    endDay,
    dayStartTime,
    resetInventoryOnly
  } = useInventory();

  const [newProduct, setNewProduct] = useState({
    name: '',
    quantity: '',
    price: ''
  });

  const handleAddProduct = (e) => {
    e.preventDefault();
    if (!newProduct.name || !newProduct.quantity || !newProduct.price) {
      alert('Please fill in all fields');
      return;
    }

    addProduct({
      name: newProduct.name,
      quantity: parseInt(newProduct.quantity),
      price: parseFloat(newProduct.price)
    });

    // Reset form
    setNewProduct({
      name: '',
      quantity: '',
      price: ''
    });
  };

  // Handle delete product
  const handleDeleteProduct = async (id) => {
    const success = await deleteProduct(id);
    if (success) {
      // Product was successfully deleted
      // No need to update state as it's handled in the context
    }
  };
  
  // Handle reset inventory
  const handleResetInventory = async () => {
    if (window.confirm('Are you sure you want to reset the inventory? This will delete all current inventory items and reset the day status. Sales history will be preserved.')) {
      const success = await resetInventoryOnly();
      if (success) {
        alert('Inventory has been reset successfully. Sales history is preserved.');
      } else {
        alert('Failed to reset inventory. Please try again.');
      }
    }
  };

  return (
    <div className="page inventory-page">
      <div className="page-grid">
        <div className="main-column">
          <div className="section-card">
            <div className="section-header">
              <h3 className="section-title">Current Inventory</h3>
              <div className="day-controls">
                {!dayStarted ? (
                  <button 
                    className="btn btn-primary"
                    onClick={startDay}
                  >
                    Start Day
                  </button>
                ) : (
                  <>
                    <span className="day-status">
                      Day Started: {dayStartTime.toLocaleTimeString()}
                    </span>
                    <button 
                      className="btn btn-outline"
                      onClick={endDay}
                    >
                      End Day
                    </button>
                  </>
                )}
                
                <button 
                  className="btn reset-inventory-btn"
                  onClick={handleResetInventory}
                  title="Reset inventory while preserving sales history"
                >
                  <RefreshCw size={16} style={{ marginRight: '8px' }} />
                  Reset Inventory
                </button>
              </div>
            </div>
            
            {inventory.length === 0 ? (
              <div className="empty-inventory">
                <p>No inventory items available. Add your first product!</p>
              </div>
            ) : (
              <>
                <div className="inventory-header">
                  <span>Product</span>
                  <span>Quantity</span>
                  <span>Price</span>
                  <span>Actions</span>
                </div>
                
                {inventory.map(item => (
                  <div key={item.id} className="inventory-item">
                    <span className="item-name">{item.name}</span>
                    <span className="item-quantity">{item.quantity}</span>
                    <span className="item-price">${item.price.toFixed(2)}</span>
                    <span className="item-actions">
                      <button 
                        className="quantity-btn decrease"
                        onClick={() => updateQuantity(item.id, -1)}
                        disabled={item.quantity <= 0 || !dayStarted}
                      >
                        -
                      </button>
                      <button 
                        className="quantity-btn increase"
                        onClick={() => updateQuantity(item.id, 1)}
                        disabled={!dayStarted}
                      >
                        +
                      </button>
                      <button 
                        className="delete-btn"
                        onClick={() => handleDeleteProduct(item.id)}
                        disabled={!dayStarted}
                        title="Delete product"
                      >
                        <Trash2 size={16} />
                      </button>
                    </span>
                  </div>
                ))}
              </>
            )}
          </div>
        </div>
        
        <div className="side-column">
          <div className="add-item-form">
            <h3>Add New Product</h3>
            <form onSubmit={handleAddProduct}>
              <div className="form-group">
                <label htmlFor="productName">Product Name</label>
                <input
                  type="text"
                  id="productName"
                  value={newProduct.name}
                  onChange={(e) => setNewProduct({...newProduct, name: e.target.value})}
                  placeholder="Enter product name"
                  disabled={!dayStarted}
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="productQuantity">Quantity</label>
                <input
                  type="number"
                  id="productQuantity"
                  min="1"
                  value={newProduct.quantity}
                  onChange={(e) => setNewProduct({...newProduct, quantity: e.target.value})}
                  placeholder="Enter quantity"
                  disabled={!dayStarted}
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="productPrice">Price ($)</label>
                <input
                  type="number"
                  id="productPrice"
                  min="0.01"
                  step="0.01"
                  value={newProduct.price}
                  onChange={(e) => setNewProduct({...newProduct, price: e.target.value})}
                  placeholder="Enter price"
                  disabled={!dayStarted}
                />
              </div>
              
              <button 
                type="submit" 
                className="add-item-btn"
                disabled={!dayStarted}
              >
                <Plus size={16} style={{ marginRight: '8px' }} />
                Add Product
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default InventoryPage;