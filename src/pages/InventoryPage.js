import React, { useState } from 'react';
import './PageStyles.css';

function InventoryPage() {
  // Sample initial inventory
  const [inventory, setInventory] = useState([
    { id: 1, name: 'Cheesecake Bites', quantity: 12, price: 3.50 },
    { id: 2, name: 'Sourdough Bread', quantity: 5, price: 7.00 },
    { id: 3, name: 'Cake Squares', quantity: 8, price: 2.75 },
    { id: 4, name: 'Cinnamon Rolls', quantity: 6, price: 4.25 },
  ]);
  
  // State for new item form
  const [newItem, setNewItem] = useState({ name: '', quantity: 0, price: 0 });

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewItem({
      ...newItem,
      [name]: name === 'name' ? value : Number(value)
    });
  };

  // Add new item to inventory
  const addNewItem = (e) => {
    e.preventDefault();
    if (newItem.name && newItem.quantity > 0 && newItem.price > 0) {
      setInventory([
        ...inventory,
        {
          id: Date.now(), // Simple way to generate unique ID
          ...newItem
        }
      ]);
      setNewItem({ name: '', quantity: 0, price: 0 }); // Reset form
    } else {
      alert('Please fill out all fields correctly.');
    }
  };

  // Update item quantity
  const updateQuantity = (id, change) => {
    setInventory(inventory.map(item => {
      if (item.id === id) {
        const newQuantity = item.quantity + change;
        return {
          ...item,
          quantity: newQuantity >= 0 ? newQuantity : 0
        };
      }
      return item;
    }));
  };

  return (
    <div className="page inventory-page">
      <h2>Inventory Management</h2>
      
      <div className="inventory-list">
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
            <div className="item-actions">
              <button 
                className="quantity-btn decrease"
                onClick={() => updateQuantity(item.id, -1)}
              >
                -
              </button>
              <button 
                className="quantity-btn increase"
                onClick={() => updateQuantity(item.id, 1)}
              >
                +
              </button>
            </div>
          </div>
        ))}
      </div>
      
      <div className="add-item-form">
        <h3>Add New Item</h3>
        <form onSubmit={addNewItem}>
          <div className="form-group">
            <label htmlFor="name">Product Name:</label>
            <input
              type="text"
              id="name"
              name="name"
              value={newItem.name}
              onChange={handleInputChange}
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="quantity">Quantity:</label>
            <input
              type="number"
              id="quantity"
              name="quantity"
              min="0"
              value={newItem.quantity}
              onChange={handleInputChange}
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="price">Price ($):</label>
            <input
              type="number"
              id="price"
              name="price"
              min="0"
              step="0.01"
              value={newItem.price}
              onChange={handleInputChange}
              required
            />
          </div>
          
          <button type="submit" className="add-item-btn">
            Add to Inventory
          </button>
        </form>
      </div>
    </div>
  );
}

export default InventoryPage;