import React, { createContext, useState, useContext, useEffect } from 'react';
import ApiService from '../services/ApiService';

const InventoryContext = createContext();

export const InventoryProvider = ({ children }) => {
  const [inventory, setInventory] = useState([]);
  const [dayStarted, setDayStarted] = useState(false);
  const [dayStartTime, setDayStartTime] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize the API service and load initial data
  useEffect(() => {
    const initializeApp = async () => {
      setIsLoading(true);
      
      try {
        // Initialize file system if supported
        if (ApiService.isFileSystemSupported()) {
          await ApiService.initialize();
        }
        
        // Load day status
        const dayStatus = await ApiService.getDayStatus();
        setDayStarted(dayStatus.dayStarted);
        setDayStartTime(dayStatus.dayStartTime ? new Date(dayStatus.dayStartTime) : null);
        
        // Load inventory
        const inventoryData = await ApiService.getInventory();
        setInventory(inventoryData);
        
        setIsInitialized(true);
      } catch (error) {
        console.error('Error initializing app:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    initializeApp();
  }, []);

  // Save inventory whenever it changes
  useEffect(() => {
    if (isInitialized) {
      ApiService.updateInventory(inventory);
    }
  }, [inventory, isInitialized]);

  // Save day status whenever it changes
  useEffect(() => {
    if (isInitialized) {
      if (dayStarted) {
        ApiService.startDay();
      }
    }
  }, [dayStarted, isInitialized]);

  const startDay = async () => {
    if (!dayStarted) {
      const newDayStartTime = new Date();
      setDayStarted(true);
      setDayStartTime(newDayStartTime);
      
      await ApiService.startDay();
    }
  };

  const endDay = async () => {
    // Create inventory snapshot for history
    const inventorySnapshot = inventory.map(item => ({
      id: item.id,
      name: item.name,
      quantity: item.quantity,
      price: item.price
    }));
    
    // Keep items with remaining quantity
    const updatedInventory = inventory
      .filter(item => item.quantity > 0)
      .map(item => ({
        ...item,
        dayEndQuantity: item.quantity
      }));

    setInventory(updatedInventory);
    setDayStarted(false);
    setDayStartTime(null);
    
    // Call API to end day and save history
    await ApiService.endDay(inventorySnapshot);
  };

  const addProduct = async (product) => {
    if (!dayStarted) {
      alert('Please start the day before adding products');
      return;
    }

    const newProduct = {
      ...product,
      dayEndQuantity: 0 // Initialize day end quantity
    };
    
    const addedProduct = await ApiService.addProduct(newProduct);
    setInventory([...inventory, addedProduct]);
  };

  const updateQuantity = async (id, change) => {
    if (!dayStarted && change > 0) {
      alert('Please start the day before updating inventory');
      return;
    }

    const item = inventory.find(item => item.id === id);
    if (!item) return;
    
    const newQuantity = Math.max(0, item.quantity + change);
    
    await ApiService.updateProduct(id, { quantity: newQuantity });
    
    setInventory(inventory.map(item =>
      item.id === id
        ? { ...item, quantity: newQuantity }
        : item
    ));
  };
  
  // Delete a product from inventory
  const deleteProduct = async (id) => {
    if (!dayStarted) {
      alert('Please start the day before deleting products');
      return false;
    }
    
    if (window.confirm('Are you sure you want to delete this product? This action cannot be undone.')) {
      try {
        // Call the API to delete the product
        const result = await ApiService.deleteProduct(id);
        
        if (result.success) {
          // Filter out the product with the given id
          const updatedInventory = inventory.filter(item => item.id !== id);
          
          // Update the inventory state
          setInventory(updatedInventory);
          
          return true;
        }
        
        return false;
      } catch (error) {
        console.error('Error deleting product:', error);
        return false;
      }
    }
    
    return false;
  };
  
  // Export backup
  const exportBackup = async () => {
    return await ApiService.exportBackup();
  };
  
  // Import backup
  const importBackup = async () => {
    const result = await ApiService.importBackup();
    
    if (result) {
      // Reload data after import
      await reloadData();
    }
    
    return result;
  };

  // Reload all data
  const reloadData = async () => {
    try {
      // Load day status
      const dayStatus = await ApiService.getDayStatus();
      setDayStarted(dayStatus.dayStarted);
      setDayStartTime(dayStatus.dayStartTime ? new Date(dayStatus.dayStartTime) : null);
      
      // Load inventory
      const inventoryData = await ApiService.getInventory();
      setInventory(inventoryData);
      
      return true;
    } catch (error) {
      console.error('Error reloading data:', error);
      return false;
    }
  };
  
  // Reset inventory only
  const resetInventoryOnly = async () => {
    try {
      const result = await ApiService.resetInventoryOnly();
      
      if (result.success) {
        // Reload data after reset
        await reloadData();
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error resetting inventory:', error);
      return false;
    }
  };

  return (
    <InventoryContext.Provider value={{ 
      inventory, 
      addProduct, 
      updateQuantity,
      deleteProduct,
      dayStarted,
      startDay,
      endDay,
      dayStartTime,
      isLoading,
      exportBackup,
      importBackup,
      reloadData,
      resetInventoryOnly
    }}>
      {children}
    </InventoryContext.Provider>
  );
};

export const useInventory = () => {
  const context = useContext(InventoryContext);
  if (!context) {
    throw new Error('useInventory must be used within an InventoryProvider');
  }
  return context;
}; 