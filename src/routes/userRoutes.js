// src/routes/userRoutes.js

const express = require('express');
const router = express.Router();
const UserController = require('../controllers/UserController');
const validate = require('../middlewares/validator');
const { registerSchema, loginSchema } = require('../schemas/userSchema');
const { protect, authorize } = require('../middlewares/authMiddleware');
const { authRateLimiter } = require('../middlewares/rateLimiter');

/**
 * @swagger
 * tags:
 *   - name: Authentication
 *     description: Gestion de l'authentification des utilisateurs
 *   - name: Users
 *     description: Gestion des utilisateurs (Admin seulement)
 */

/**
 * @swagger
 * /api/users/register:
 *   post:
 *     summary: Inscription d'un nouvel utilisateur
 *     description: Crée un nouveau compte utilisateur avec le rôle "Client"
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *               - nom
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "john.doe@example.com"
 *                 description: "Adresse email valide"
 *               password:
 *                 type: string
 *                 format: password
 *                 example: "Password123"
 *                 description: "8 caractères minimum, 1 majuscule, 1 minuscule, 1 chiffre"
 *               nom:
 *                 type: string
 *                 example: "John Doe"
 *                 description: "Nom complet de l'utilisateur"
 *     responses:
 *       201:
 *         description: Utilisateur créé avec succès
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       409:
 *         description: L'utilisateur existe déjà
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               success: false
 *               status: 409
 *               message: "L'utilisateur existe déjà."
 *       429:
 *         $ref: '#/components/responses/RateLimitError'
 */
router.post('/register', 
    authRateLimiter,
    validate(registerSchema), 
    UserController.register
);

/**
 * @swagger
 * /api/users/login:
 *   post:
 *     summary: Connexion d'un utilisateur
 *     description: Authentifie un utilisateur et retourne les tokens JWT
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "john.doe@example.com"
 *               password:
 *                 type: string
 *                 format: password
 *                 example: "Password123"
 *     responses:
 *       200:
 *         description: Connexion réussie
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         description: Identifiants incorrects
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               success: false
 *               status: 401
 *               message: "Identifiants incorrects."
 *       429:
 *         $ref: '#/components/responses/RateLimitError'
 */
router.post('/login', 
    authRateLimiter,
    validate(loginSchema), 
    UserController.login
);

/**
 * @swagger
 * /api/users/refresh-token:
 *   post:
 *     summary: Rafraîchir le token d'accès
 *     description: Génère une nouvelle paire de tokens à partir d'un refresh token valide
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - refreshToken
 *             properties:
 *               refreshToken:
 *                 type: string
 *                 example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *                 description: "Refresh token JWT valide"
 *     responses:
 *       200:
 *         description: Tokens rafraîchis avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 accessToken:
 *                   type: string
 *                   description: "Nouveau token d'accès"
 *                 refreshToken:
 *                   type: string
 *                   description: "Nouveau refresh token"
 *       400:
 *         description: Refresh token manquant
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               success: false
 *               status: 400
 *               message: "Refresh token requis"
 *       403:
 *         description: Refresh token invalide ou expiré
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               success: false
 *               status: 403
 *               message: "Refresh token invalide."
 */
router.post('/refresh-token', 
    UserController.refreshToken
);

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Récupère la liste de tous les utilisateurs
 *     description: Accès réservé aux administrateurs
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Liste des utilisateurs récupérée avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Liste des utilisateurs récupérée."
 *                 count:
 *                   type: integer
 *                   example: 5
 *                 users:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/User'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 */
router.get('/', 
    protect,
    authorize('Admin'),
    UserController.getAllUsers
);

/**
 * @swagger
 * /api/users/profile:
 *   get:
 *     summary: Récupère le profil de l'utilisateur connecté
 *     description: Retourne les informations du profil de l'utilisateur authentifié
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Profil récupéré avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.get('/profile', 
    protect,
    UserController.getProfile
);

/**
 * @swagger
 * /api/users/logout:
 *   post:
 *     summary: Déconnexion de l'utilisateur
 *     description: Invalide le refresh token de l'utilisateur
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Déconnexion réussie
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Déconnexion réussie."
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.post('/logout', 
    protect,
    UserController.logout
);

module.exports = router;