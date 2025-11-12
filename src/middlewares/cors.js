// src/middlewares/cors.js

const cors = require('cors');

/**
 * @description Configuration CORS pour l'application.
 */
const corsOptions = {
    origin: function (origin, callback) {
        // Autoriser toutes les origines en développement
        if (process.env.NODE_ENV === 'development') {
            return callback(null, true);
        }
        
        // En production, restreindre aux domaines autorisés
        const allowedOrigins = process.env.ALLOWED_ORIGINS ? 
            process.env.ALLOWED_ORIGINS.split(',') : 
            [];
            
        if (!origin || allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    allowedHeaders: 'Content-Type,Authorization,X-Requested-With',
    credentials: true,
    optionsSuccessStatus: 204,
    maxAge: 86400 // 24 heures
};

// Exporte le middleware CORS configuré
module.exports = cors(corsOptions);