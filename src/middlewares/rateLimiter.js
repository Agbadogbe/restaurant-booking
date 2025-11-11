// src/middlewares/rateLimiter.js

const rateLimit = require('express-rate-limit');

// ----------------------------------------------------
// Configuration du Limiteur d'Accès Global (Très Strict)
// Appliqué aux routes publiques critiques comme /login et /register
// ----------------------------------------------------

/**
 * @description Limiteur strict pour les routes sensibles (login, register).
 * Limite à 5 requêtes par adresse IP toutes les 10 minutes.
 * Renvoie une erreur 429 "Too Many Requests".
 */
const authRateLimiter = rateLimit({
    windowMs: 10 * 60 * 1000, // Fenêtre de 10 minutes
    max: 5,                   // Limite chaque IP à 5 requêtes par fenêtre
    message: {
        success: false,
        status: 429,
        message: "Trop de tentatives d'authentification ou d'inscription. Veuillez réessayer dans 10 minutes.",
    },
    standardHeaders: true, // Renvoie les headers RateLimit-*
    legacyHeaders: false,  // Désactive les headers X-RateLimit-*
});

// ----------------------------------------------------
// Configuration du Limiteur par Défaut (Moins Strict)
// Appliqué à toutes les autres routes API
// ----------------------------------------------------

/**
 * @description Limiteur par défaut pour les routes standard (GET, POST sur la plupart des ressources).
 * Limite à 100 requêtes par adresse IP toutes les 15 minutes.
 */
const apiRateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // Fenêtre de 15 minutes
    max: 100,                 // Limite chaque IP à 100 requêtes par fenêtre
    message: {
        success: false,
        status: 429,
        message: "Trop de requêtes effectuées depuis cette IP, veuillez réessayer plus tard.",
    },
    standardHeaders: true,
    legacyHeaders: false,
});

module.exports = {
    authRateLimiter,
    apiRateLimiter,
};