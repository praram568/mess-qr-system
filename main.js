const { app, BrowserWindow } = require('electron');
const path = require('path');
const url = require('url');
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();

// Keep a global reference of the window object
let mainWindow;

// Initialize Express server
function startExpressServer() {
  const server = express();
  
  // Middleware
  server.use(cors());
  server.use(bodyParser.json());
  server.use(bodyParser.urlencoded({ extended: true }));
  server.use(express.static(path.join(__dirname, 'public')));
  
  // Database connection
  const db = new sqlite3.Database(path.join(__dirname, 'students.db'));
  
  // Add your API routes here
  // Example:
  server.get('/api/students', (req, res) => {
    db.all('SELECT * FROM students', [], (err, rows) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json(rows);
    });
  });
  
  // Import all routes from your server.js
  // Note: You might need to modify your server.js to export routes
  
  // Start server
  const PORT = 5000;
  server.listen(PORT, () => {
    console.log(`Express server running on http://localhost:${PORT}`);
  });
  
  return server;
}

function createWindow() {
  // Start the Express server
  const server = startExpressServer();
  
  // Create the browser window
  mainWindow = new BrowserWindow({
    width: 1024,
    height: 768,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });
  
  // Load the app from the Express server
  mainWindow.loadURL('http://localhost:5000');
  
  // Open DevTools during development (optional)
  // mainWindow.webContents.openDevTools();
  
  // Handle window close
  mainWindow.on('closed', function() {
    mainWindow = null;
  });
}

// Create window when Electron is ready
app.on('ready', createWindow);

// Quit when all windows are closed
app.on('window-all-closed', function() {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', function() {
  if (mainWindow === null) {
    createWindow();
  }
});
