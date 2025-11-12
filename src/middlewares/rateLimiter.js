const rateLimit = require('express-rate-limit');

/**
 * @description Limiteur strict pour les routes sensibles (login, register).
 * Limite à 5 requêtes par adresse IP toutes les 10 minutes.
 */
const authRateLimiter = rateLimit({
    windowMs: 10 * 60 * 1000, // Fenêtre de 10 minutes
    max: 20, // ✅ AUGMENTÉ pour les tests (était 5)
    message: {
        success: false,
        status: 429,
        message: "Trop de tentatives d'authentification. Veuillez réessayer dans 10 minutes.",
    },
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: true, // ✅ NE PAS compter les requêtes réussies
    skip: (req, res) => {
        // ✅ Ne pas compter les tentatives échouées (401, 400)
        return res.statusCode === 401 || res.statusCode === 400 || res.statusCode === 422;
    }
});

/**
 * @description Limiteur modéré pour l'API générale.
 * Limite à 100 requêtes par IP toutes les 15 minutes.
 */
const apiRateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // Fenêtre de 15 minutes
    max: 200, // ✅ AUGMENTÉ pour les tests
    message: {
        success: false,
        status: 429,
        message: "Trop de requêtes. Veuillez réessayer plus tard.",
    },
    standardHeaders: true,
    legacyHeaders: false,
});

module.exports = {
    authRateLimiter,
    apiRateLimiter,
};