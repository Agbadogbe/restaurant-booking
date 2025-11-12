// src/middlewares/errorHandler.js

/**
 * @description Middleware centralisé de gestion des erreurs.
 */
const errorHandler = (err, req, res, next) => {
    const status = err.status || 500;
    let message = err.message || "Erreur interne du serveur.";
    
    const isDevelopment = process.env.NODE_ENV === 'development';
    
    let responseData = {
        success: false,
        status: status,
        message: message,
    };
    
    // ✅ CORRECTION : Utiliser 'errors' au lieu de 'details'
    if (status === 400 && err.errors) {
        responseData.errors = err.errors; // ✅ Changé de 'details' à 'errors'
        responseData.message = "Données invalides fournies.";
    }

    // Si c'est une erreur 500 en production, on cache le message détaillé
    if (status === 500 && !isDevelopment) {
        responseData.message = "Erreur interne du serveur.";
    }

    // Ajoute la stack trace uniquement en mode développement pour le débogage
    if (isDevelopment && err.stack) {
        responseData.stack = err.stack;
    }
    
    res.status(status).json(responseData);
};

module.exports = errorHandler;