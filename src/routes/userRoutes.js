// src/routes/userRoutes.js

const express = require('express');
const router = express.Router();
const UserController = require('../controllers/UserController');
const validate = require('../middlewares/validator'); 
const { registerSchema, loginSchema } = require('../schemas/userSchema');
const authMiddleware = require('../middlewares/authMiddleware'); // Middleware d'Auth JWT
const { authRateLimiter } = require('../middlewares/rateLimiter'); // Limiteur strict

/**
 * @route POST /api/users/register
 * @description Inscription d'un nouvel utilisateur (rôle 'Client' par défaut).
 * @access Public
 */
router.post('/register', 
    authRateLimiter, // Sécurité : Limite les tentatives d'inscription
    validate(registerSchema), 
    UserController.register
);

/**
 * @route POST /api/users/login
 * @description Connexion d'un utilisateur existant.
 * @access Public
 */
router.post('/login', 
    authRateLimiter, // Sécurité : Limite les tentatives de connexion
    validate(loginSchema), 
    UserController.login
);

/**
 * @route GET /api/users
 * @description Récupère la liste de tous les utilisateurs (Exemple de route protégée).
 * @access Private (réservé aux Administrateurs)
 * CORRECTION: Cette route a été la source du TypeError (UserController.getAllUsers était undefined).
 */
router.get('/', 
    authMiddleware.protect, // 1. Vérifie si l'utilisateur est connecté et le token valide
    authMiddleware.authorize('Admin'), // 2. Vérifie si le rôle est 'Admin'
    UserController.getAllUsers // Contrôleur implémenté
);

// Route pour le Refresh Token (à implémenter)
// router.post('/refresh', UserController.refreshToken); 

// Route pour le Profil Utilisateur (à implémenter)
// router.get('/profile', authMiddleware.protect, UserController.getProfile); 

module.exports = router;