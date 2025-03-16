# Carrot Top Bakery Management Application

A desktop application for managing bakery inventory and sales, built with React and Electron.

## Features

- Inventory management with freshness tracking
- Sales tracking and reporting
- Day management (start/end day)
- Data persistence with local storage
- Backup and restore functionality

## Installation

### For Users

1. Download the latest installer from the releases section
2. Run the installer and follow the prompts
3. Launch the application from your Start menu or desktop shortcut

### For Developers

1. Clone the repository
   ```
   git clone https://github.com/yourusername/carrot-top.git
   cd carrot-top
   ```

2. Install dependencies
   ```
   npm install
   ```

3. Run in development mode
   ```
   npm run electron-dev
   ```

4. Build the application
   ```
   npm run dist-win    # For Windows
   npm run dist-mac    # For macOS
   npm run dist-linux  # For Linux
   ```

## Usage

1. Start the day from the Inventory page
2. Add products to your inventory
3. Make sales on the Sales page
4. View reports on the Reporting page
5. End the day when finished
6. Use the Settings page to backup your data

## Data Storage

The application stores data locally on your device:
- On Windows/Mac/Linux: Data is stored in the application's user data directory
- On iOS devices (web version): Data is stored in the browser's localStorage

## License

MIT

```bash
# Pull the latest changes before starting work
git pull

# After making changes
git add .
git commit -m "Description of changes"
git push
```