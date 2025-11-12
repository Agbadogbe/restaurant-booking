// src/routes/userRoutes.js

const express = require('express');
const router = express.Router();
const UserController = require('../controllers/UserController');
const validate = require('../middlewares/validator');
const { registerSchema, loginSchema } = require('../schemas/userSchema');
const { protect, authorize } = require('../middlewares/authMiddleware');
const { authRateLimiter } = require('../middlewares/rateLimiter');

/**
 * @route POST /api/users/register
 * @description Inscription d'un nouvel utilisateur.
 * @access Public
 */
router.post('/register', 
    authRateLimiter,
    validate(registerSchema), 
    UserController.register
);

/**
 * @route POST /api/users/login
 * @description Connexion d'un utilisateur existant.
 * @access Public
 */
router.post('/login', 
    authRateLimiter,
    validate(loginSchema), 
    UserController.login
);

/**
 * @route POST /api/users/refresh-token
 * @description Rafraîchir le token d'accès.
 * @access Public
 */
router.post('/refresh-token', 
    UserController.refreshToken
);

/**
 * @route GET /api/users
 * @description Récupère la liste de tous les utilisateurs.
 * @access Private (Admin seulement)
 */
router.get('/', 
    protect,
    authorize('Admin'),
    UserController.getAllUsers
);

/**
 * @route GET /api/users/profile
 * @description Récupère le profil de l'utilisateur connecté.
 * @access Private
 */
router.get('/profile', 
    protect,
    UserController.getProfile
);

/**
 * @route POST /api/users/logout
 * @description Déconnexion de l'utilisateur.
 * @access Private
 */
router.post('/logout', 
    protect,
    UserController.logout
);

module.exports = router;