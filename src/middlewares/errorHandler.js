// src/middlewares/errorHandler.js

/**
 * @description Middleware centralisé de gestion des erreurs.
 * Intercepte toutes les erreurs levées dans l'application et renvoie une réponse JSON standardisée.
 */
const errorHandler = (err, req, res, next) => {
    // 1. Détermine le statut HTTP
    // Utilise le statut défini sur l'erreur (ex: 400, 401, 403) ou 500 par défaut
    const status = err.status || 500;
    
    // 2. Détermine le message d'erreur
    let message = err.message || "Erreur interne du serveur.";
    
    // 3. Gestion spécifique des erreurs en environnement de production/développement
    // En production, il est crucial de ne pas exposer les détails internes (stack trace).
    const isDevelopment = process.env.NODE_ENV === 'development';
    
    // 4. Gestion des Erreurs Spécifiques
    let responseData = {
        success: false,
        status: status,
        message: message,
    };
    
    // Ajoute les détails de validation si l'erreur vient du middleware 'validator'
    if (status === 400 && err.details) {
        responseData.details = err.details;
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
    
    // 5. Envoi de la réponse JSON au client
    res.status(status).json(responseData);
};

module.exports = errorHandler;