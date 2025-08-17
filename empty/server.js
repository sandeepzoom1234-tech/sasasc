const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Import routers
const publicApiRoutes = require('./routes/public');
const adminApiRoutes = require('./routes/admin');

// Middleware
app.use(cors());
app.use(express.json()); // For parsing application/json
app.use(express.static(path.join(__dirname, 'public')));

// --- API Routes ---

// Public API
app.use('/api', publicApiRoutes);

// Admin API
app.use('/api/admin', adminApiRoutes);

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
