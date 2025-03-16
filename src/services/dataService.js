/**
 * Data Service for Carrot-Top Bakery App
 * 
 * This service provides functions for working with local storage
 * to persist data between app sessions.
 */

// Key constants
const INVENTORY_KEY = 'carrot-top-inventory';
const SALES_KEY = 'carrot-top-sales';
const DAILY_SALES_KEY = 'carrot-top-daily-sales';

/**
 * Save inventory to local storage
 * @param {Array} inventory - Array of inventory items
 */
export const saveInventory = (inventory) => {
  localStorage.setItem(INVENTORY_KEY, JSON.stringify(inventory));
};

/**
 * Load inventory from local storage
 * @returns {Array} - Array of inventory items, or default if not found
 */
export const loadInventory = () => {
  const saved = localStorage.getItem(INVENTORY_KEY);
  
  if (saved) {
    return JSON.parse(saved);
  }
  
  // Default inventory if nothing is saved
  return [
    { id: 1, name: 'Cheesecake Bites', quantity: 12, price: 3.50 },
    { id: 2, name: 'Sourdough Bread', quantity: 5, price: 7.00 },
    { id: 3, name: 'Cake Squares', quantity: 8, price: 2.75 },
    { id: 4, name: 'Cinnamon Rolls', quantity: 6, price: 4.25 },
  ];
};

/**
 * Save a completed sale
 * @param {Object} sale - Sale object with items, totals, etc.
 */
export const saveSale = (sale) => {
  // Add to overall sales history
  const sales = loadSales();
  sales.push(sale);
  localStorage.setItem(SALES_KEY, JSON.stringify(sales));
  
  // Add to today's sales
  const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
  const dailySalesKey = `${DAILY_SALES_KEY}-${today}`;
  
  const dailySales = loadDailySales();
  dailySales.push(sale);
  localStorage.setItem(dailySalesKey, JSON.stringify(dailySales));
};

/**
 * Load all sales history
 * @returns {Array} - Array of all sales
 */
export const loadSales = () => {
  const saved = localStorage.getItem(SALES_KEY);
  return saved ? JSON.parse(saved) : [];
};

/**
 * Load today's sales
 * @returns {Array} - Array of today's sales
 */
export const loadDailySales = () => {
  const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
  const dailySalesKey = `${DAILY_SALES_KEY}-${today}`;
  
  const saved = localStorage.getItem(dailySalesKey);
  return saved ? JSON.parse(saved) : [];
};

/**
 * Close the day and archive daily sales
 * @returns {Object} - Summary of day's sales
 */
export const closeDay = () => {
  const dailySales = loadDailySales();
  
  // Calculate summary
  const summary = {
    date: new Date().toISOString(),
    totalSales: dailySales.reduce((sum, sale) => sum + sale.total, 0),
    totalHST: dailySales.reduce((sum, sale) => sum + sale.hst, 0),
    cashSales: dailySales
      .filter(sale => sale.paymentMethod === 'cash')
      .reduce((sum, sale) => sum + sale.total, 0),
    eTransferSales: dailySales
      .filter(sale => sale.paymentMethod === 'e-transfer')
      .reduce((sum, sale) => sum + sale.total, 0),
    saleCount: dailySales.length,
    items: dailySales.flatMap(sale => sale.items)
  };
  
  // In a real app, you would send this to a server
  // For now, just save to local storage with a different key
  const today = new Date().toISOString().split('T')[0];
  localStorage.setItem(`carrot-top-daily-summary-${today}`, JSON.stringify(summary));
  
  return summary;
};

/**
 * Clear all app data (for testing purposes)
 */
export const clearAllData = () => {
  localStorage.removeItem(INVENTORY_KEY);
  localStorage.removeItem(SALES_KEY);
  
  // Clear all daily sales keys
  Object.keys(localStorage).forEach(key => {
    if (key.startsWith(DAILY_SALES_KEY) || key.startsWith('carrot-top-daily-summary')) {
      localStorage.removeItem(key);
    }
  });
};