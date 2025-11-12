// src/app.js (L'application Express nue)

const express = require('express');
const app = express();

// Import des Middlewares (doivent être des fonctions !)
const corsMiddleware = require('./middlewares/cors');
const { apiRateLimiter } = require('./middlewares/rateLimiter');
const errorHandler = require('./middlewares/errorHandler'); 

// Importation des routes
const userRoutes = require('./routes/userRoutes');
const restaurantRoutes = require('./routes/restaurantRoutes');
const reservationRoutes = require('./routes/reservationRoutes');

// 1. Middlewares Globaux
app.use(express.json());
app.use(corsMiddleware);
app.use(apiRateLimiter);

// 2. Définition des Routes
app.use('/api/users', userRoutes);
app.use('/api/restaurants', restaurantRoutes);
app.use('/api/reservations', reservationRoutes);

// 3. Middleware de gestion des erreurs (doit être le dernier)
app.use(errorHandler);

// Exportez l'objet 'app' brut pour Supertest et pour server.js
module.exports = app;