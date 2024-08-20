const express = require('express');
const path = require('path');
const urlRoutes = require('./routes/urlRoutes');

const app = express();
app.use(express.json());

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, '../public')));

// Use URL routes
app.use('/api', urlRoutes);

const { PORT } = require('./config');
app.listen(PORT, () => {
    console.log(`URL Shortener Service running on port ${PORT}`);
});
