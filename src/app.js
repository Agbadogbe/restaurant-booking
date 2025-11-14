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

// Import Swagger
const { specs, swaggerUi } = require('./config/swagger');

// 1. Middlewares Globaux
app.use(express.json());
app.use(corsMiddleware);
app.use(apiRateLimiter);

// 2. Documentation Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs, {
  explorer: true,
  customCss: `
    .swagger-ui .topbar { display: none }
    .swagger-ui .info { margin: 20px 0 }
    .swagger-ui .btn.authorize { background-color: #10b981 }
  `,
  customSiteTitle: 'API Restaurant Booking - Documentation',
  swaggerOptions: {
    persistAuthorization: true,
    displayRequestDuration: true,
    filter: true
  }
}));

// 3. Définition des Routes
app.use('/api/users', userRoutes);
app.use('/api/restaurants', restaurantRoutes);
app.use('/api/reservations', reservationRoutes);

// 4. Route racine avec redirection vers la documentation
app.get('/', (req, res) => {
  res.redirect('/api-docs');
});

// 5. Middleware de gestion des erreurs (doit être le dernier)
app.use(errorHandler);

// Exportez l'objet 'app' brut pour Supertest et pour server.js
module.exports = app;