/**
 * API Service
 * 
 * This service provides API-like methods for data operations
 * while using the FileSystemService for actual storage.
 */

import FileSystemService from './FileSystemService';

// Simulate network delay
const SIMULATED_DELAY = 300; // milliseconds

// Storage keys
const STORAGE_KEYS = {
  INVENTORY: 'inventory',
  SALES: 'sales',
  SALES_HISTORY: 'sales_history',
  INVENTORY_HISTORY: 'inventory_history',
  DAY_STATUS: 'day_status'
};

/**
 * Simulate an API request with delay
 */
const simulateRequest = async (callback) => {
  return new Promise((resolve) => {
    setTimeout(async () => {
      const result = await callback();
      resolve(result);
    }, SIMULATED_DELAY);
  });
};

/**
 * API Service
 */
const ApiService = {
  // System operations
  initialize: async () => {
    return await FileSystemService.initialize();
  },
  
  isFileSystemSupported: () => {
    return FileSystemService.isSupported();
  },
  
  exportBackup: async () => {
    return await FileSystemService.exportBackup();
  },
  
  importBackup: async () => {
    return await FileSystemService.importBackup();
  },
  
  resetAllData: async () => {
    return simulateRequest(async () => {
      // Reset inventory
      await FileSystemService.saveToFile(STORAGE_KEYS.INVENTORY, []);
      
      // Reset sales
      await FileSystemService.saveToFile(STORAGE_KEYS.SALES, { dailySales: [], nextId: 1 });
      
      // Reset sales history
      await FileSystemService.saveToFile(STORAGE_KEYS.SALES_HISTORY, []);
      
      // Reset inventory history
      await FileSystemService.saveToFile(STORAGE_KEYS.INVENTORY_HISTORY, []);
      
      // Reset day status
      await FileSystemService.saveToFile(STORAGE_KEYS.DAY_STATUS, { 
        dayStarted: false, 
        dayStartTime: null 
      });
      
      return { success: true };
    });
  },
  
  resetInventoryOnly: async () => {
    return simulateRequest(async () => {
      // Reset inventory
      await FileSystemService.saveToFile(STORAGE_KEYS.INVENTORY, []);
      
      // Reset current sales
      await FileSystemService.saveToFile(STORAGE_KEYS.SALES, { dailySales: [], nextId: 1 });
      
      // Reset day status
      await FileSystemService.saveToFile(STORAGE_KEYS.DAY_STATUS, { 
        dayStarted: false, 
        dayStartTime: null 
      });
      
      return { success: true };
    });
  },
  
  // Inventory endpoints
  getInventory: async () => {
    return simulateRequest(async () => {
      return await FileSystemService.loadFromFile(STORAGE_KEYS.INVENTORY, []);
    });
  },
  
  updateInventory: async (inventory) => {
    return simulateRequest(async () => {
      return await FileSystemService.saveToFile(STORAGE_KEYS.INVENTORY, inventory);
    });
  },
  
  addProduct: async (product) => {
    return simulateRequest(async () => {
      const inventory = await FileSystemService.loadFromFile(STORAGE_KEYS.INVENTORY, []);
      const newId = inventory.length > 0 ? Math.max(...inventory.map(item => item.id)) + 1 : 1;
      const newProduct = { ...product, id: newId };
      
      inventory.push(newProduct);
      await FileSystemService.saveToFile(STORAGE_KEYS.INVENTORY, inventory);
      
      return newProduct;
    });
  },
  
  updateProduct: async (id, updates) => {
    return simulateRequest(async () => {
      const inventory = await FileSystemService.loadFromFile(STORAGE_KEYS.INVENTORY, []);
      const updatedInventory = inventory.map(item => 
        item.id === id ? { ...item, ...updates } : item
      );
      
      await FileSystemService.saveToFile(STORAGE_KEYS.INVENTORY, updatedInventory);
      return updatedInventory.find(item => item.id === id);
    });
  },
  
  deleteProduct: async (id) => {
    return simulateRequest(async () => {
      const inventory = await FileSystemService.loadFromFile(STORAGE_KEYS.INVENTORY, []);
      const updatedInventory = inventory.filter(item => item.id !== id);
      
      await FileSystemService.saveToFile(STORAGE_KEYS.INVENTORY, updatedInventory);
      return { success: true };
    });
  },
  
  // Sales endpoints
  getCurrentSales: async () => {
    return simulateRequest(async () => {
      return await FileSystemService.loadFromFile(STORAGE_KEYS.SALES, { dailySales: [], nextId: 1 });
    });
  },
  
  addSale: async (sale) => {
    return simulateRequest(async () => {
      const salesData = await FileSystemService.loadFromFile(STORAGE_KEYS.SALES, { dailySales: [], nextId: 1 });
      
      const newSale = {
        id: salesData.nextId,
        timestamp: new Date().toISOString(),
        ...sale
      };
      
      salesData.dailySales.push(newSale);
      salesData.nextId += 1;
      
      await FileSystemService.saveToFile(STORAGE_KEYS.SALES, salesData);
      return newSale;
    });
  },
  
  // Day status endpoints
  getDayStatus: async () => {
    return simulateRequest(async () => {
      return await FileSystemService.loadFromFile(STORAGE_KEYS.DAY_STATUS, { 
        dayStarted: false, 
        dayStartTime: null 
      });
    });
  },
  
  startDay: async () => {
    return simulateRequest(async () => {
      const dayStatus = { 
        dayStarted: true, 
        dayStartTime: new Date().toISOString() 
      };
      await FileSystemService.saveToFile(STORAGE_KEYS.DAY_STATUS, dayStatus);
      return dayStatus;
    });
  },
  
  endDay: async (inventorySnapshot) => {
    return simulateRequest(async () => {
      // Get current sales and history
      const salesData = await FileSystemService.loadFromFile(STORAGE_KEYS.SALES, { dailySales: [], nextId: 1 });
      const salesHistory = await FileSystemService.loadFromFile(STORAGE_KEYS.SALES_HISTORY, []);
      const inventoryHistory = await FileSystemService.loadFromFile(STORAGE_KEYS.INVENTORY_HISTORY, []);
      
      // Create history entry
      const historyEntry = {
        date: new Date().toISOString(),
        sales: [...salesData.dailySales],
        inventory: inventorySnapshot
      };
      
      // Add to history
      salesHistory.push(historyEntry);
      inventoryHistory.push({
        date: new Date().toISOString(),
        inventory: inventorySnapshot
      });
      
      // Reset sales for new day
      const newSalesData = { dailySales: [], nextId: 1 };
      
      // Reset day status
      const dayStatus = { dayStarted: false, dayStartTime: null };
      
      // Save all updates
      await FileSystemService.saveToFile(STORAGE_KEYS.SALES_HISTORY, salesHistory);
      await FileSystemService.saveToFile(STORAGE_KEYS.INVENTORY_HISTORY, inventoryHistory);
      await FileSystemService.saveToFile(STORAGE_KEYS.SALES, newSalesData);
      await FileSystemService.saveToFile(STORAGE_KEYS.DAY_STATUS, dayStatus);
      
      return { success: true };
    });
  },
  
  // History endpoints
  getSalesHistory: async () => {
    return simulateRequest(async () => {
      return await FileSystemService.loadFromFile(STORAGE_KEYS.SALES_HISTORY, []);
    });
  },
  
  getInventoryHistory: async () => {
    return simulateRequest(async () => {
      return await FileSystemService.loadFromFile(STORAGE_KEYS.INVENTORY_HISTORY, []);
    });
  }
};

export default ApiService; 