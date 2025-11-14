// src/middlewares/errorHandler.js

/**
 * @description Middleware centralisé de gestion des erreurs.
 */
const errorHandler = (err, req, res, next) => {
    const status = err.status || 500;
    let message = err.message || "Erreur interne du serveur.";
    
    const isDevelopment = process.env.NODE_ENV === 'development';
    
    // 🔍 LOG pour debug des erreurs 500
    if (status === 500) {
        console.error('🔴 ERREUR 500:', {
            message: err.message,
            stack: err.stack,
            url: req.url,
            method: req.method,
            body: req.body
        });
    }
    
    let responseData = {
        success: false,
        status: status,
        message: message,
    };
    
    if (status === 400 && err.errors) {
        responseData.errors = err.errors;
        responseData.message = "Données invalides fournies.";
    }

    if (status === 500 && !isDevelopment) {
        responseData.message = "Erreur interne du serveur.";
    }

    if (isDevelopment && err.stack) {
        responseData.stack = err.stack;
    }
    
    res.status(status).json(responseData);
};

module.exports = errorHandler;