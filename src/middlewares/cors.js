// src/middlewares/cors.js

const cors = require('cors');

/**
 * @description Configuration CORS pour l'application.
 * Pour le développement, nous utilisons des paramètres larges.
 * En production, il faudrait lister les domaines autorisés (e.g., origin: ['https://monclient.com']).
 */
const corsOptions = {
    // * : Autorise toutes les origines (pour le développement)
    origin: '*', 
    // Liste des méthodes autorisées
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE', 
    // En-têtes autorisés (crucial pour le token d'autorisation)
    allowedHeaders: 'Content-Type,Authorization', 
    credentials: true,
    optionsSuccessStatus: 204
};

// Exporte le middleware CORS configuré
module.exports = cors(corsOptions);