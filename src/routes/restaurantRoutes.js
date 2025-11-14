// src/routes/restaurantRoutes.js

const express = require('express');
const router = express.Router();
const RestaurantController = require('../controllers/RestaurantController');
const validator = require('../middlewares/validator');
const createRestaurantSchema = require('../schemas/restaurantSchema');
const { protect, authorize } = require('../middlewares/authMiddleware');

// ✅ CORRECTION : Créer une instance du contrôleur
const restaurantController = new RestaurantController();

/**
 * @swagger
 * tags:
 *   - name: Restaurants
 *     description: Gestion des restaurants
 */

/**
 * @swagger
 * /api/restaurants:
 *   post:
 *     summary: Créer un nouveau restaurant
 *     description: Accès réservé aux administrateurs
 *     tags: [Restaurants]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nom
 *               - adresse
 *               - capacite_max
 *             properties:
 *               nom:
 *                 type: string
 *                 example: "Le Gourmet Parisien"
 *                 minLength: 3
 *                 maxLength: 100
 *               adresse:
 *                 type: string
 *                 example: "123 Avenue des Champs-Élysées, 75008 Paris"
 *                 maxLength: 255
 *               description:
 *                 type: string
 *                 example: "Restaurant gastronomique proposant une cuisine française traditionnelle"
 *                 maxLength: 500
 *               capacite_max:
 *                 type: integer
 *                 example: 50
 *                 minimum: 1
 *                 maximum: 1000
 *     responses:
 *       201:
 *         description: Restaurant créé avec succès
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
 *                   example: "Restaurant créé avec succès"
 *                 restaurant:
 *                   $ref: '#/components/schemas/Restaurant'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       409:
 *         description: Un restaurant avec ce nom existe déjà
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               success: false
 *               status: 409
 *               message: "Un restaurant avec ce nom existe déjà"
 */
router.post(
    '/', 
    protect, 
    authorize('Admin'),
    validator(createRestaurantSchema), 
    (req, res, next) => restaurantController.createRestaurant(req, res, next)
);

/**
 * @swagger
 * /api/restaurants:
 *   get:
 *     summary: Lister tous les restaurants
 *     description: Accès autorisé à tous les utilisateurs authentifiés
 *     tags: [Restaurants]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Liste des restaurants récupérée avec succès
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
 *                   example: "Restaurants récupérés avec succès"
 *                 count:
 *                   type: integer
 *                   example: 10
 *                 restaurants:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Restaurant'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.get(
    '/', 
    protect,
    (req, res, next) => restaurantController.getAllRestaurants(req, res, next)
);

/**
 * @swagger
 * /api/restaurants/{id}:
 *   get:
 *     summary: Récupérer un restaurant par son ID
 *     tags: [Restaurants]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID du restaurant
 *     responses:
 *       200:
 *         description: Restaurant récupéré avec succès
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
 *                   example: "Restaurant récupéré avec succès"
 *                 restaurant:
 *                   $ref: '#/components/schemas/Restaurant'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
router.get(
    '/:id', 
    protect,
    (req, res, next) => restaurantController.getRestaurantById(req, res, next)
);

/**
 * @swagger
 * /api/restaurants/{id}:
 *   put:
 *     summary: Mettre à jour un restaurant
 *     description: Accès réservé aux administrateurs
 *     tags: [Restaurants]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID du restaurant
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nom
 *               - adresse
 *               - capacite_max
 *             properties:
 *               nom:
 *                 type: string
 *                 example: "Le Gourmet Parisien - Nouveau Nom"
 *               adresse:
 *                 type: string
 *                 example: "456 Rue de la Paix, 75002 Paris"
 *               description:
 *                 type: string
 *                 example: "Nouvelle description du restaurant"
 *               capacite_max:
 *                 type: integer
 *                 example: 60
 *     responses:
 *       200:
 *         description: Restaurant mis à jour avec succès
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
 *                   example: "Restaurant mis à jour avec succès"
 *                 restaurant:
 *                   $ref: '#/components/schemas/Restaurant'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *       409:
 *         description: Un restaurant avec ce nom existe déjà
 */
router.put(
    '/:id', 
    protect, 
    authorize('Admin'),
    validator(createRestaurantSchema),
    (req, res, next) => restaurantController.updateRestaurant(req, res, next)
);

/**
 * @swagger
 * /api/restaurants/{id}:
 *   delete:
 *     summary: Supprimer un restaurant
 *     description: |-
 *       Accès réservé aux administrateurs. 
 *       Attention : supprime aussi les réservations associées
 *     tags: [Restaurants]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID du restaurant
 *     responses:
 *       200:
 *         description: Restaurant supprimé avec succès
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
 *                   example: "Restaurant supprimé avec succès"
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *       409:
 *         description: Impossible de supprimer - des réservations sont associées
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               success: false
 *               status: 409
 *               message: "Impossible de supprimer le restaurant : des réservations ou menus y sont associés"
 */
router.delete(
    '/:id', 
    protect, 
    authorize('Admin'),
    (req, res, next) => restaurantController.deleteRestaurant(req, res, next)
);

/**
 * @swagger
 * /api/restaurants/search:
 *   get:
 *     summary: Rechercher des restaurants par nom
 *     tags: [Restaurants]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: nom
 *         schema:
 *           type: string
 *         required: true
 *         description: Nom ou partie du nom du restaurant à rechercher
 *     responses:
 *       200:
 *         description: Recherche effectuée avec succès
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
 *                   example: "Recherche de restaurants effectuée avec succès"
 *                 count:
 *                   type: integer
 *                   example: 3
 *                 restaurants:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Restaurant'
 *       400:
 *         description: Paramètre de recherche manquant
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.get(
    '/search',
    protect,
    (req, res, next) => restaurantController.searchRestaurants(req, res, next)
);

/**
 * @swagger
 * /api/restaurants/capacity:
 *   get:
 *     summary: Filtrer les restaurants par capacité
 *     tags: [Restaurants]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: min
 *         schema:
 *           type: integer
 *         required: false
 *         description: Capacité minimale
 *       - in: query
 *         name: max
 *         schema:
 *           type: integer
 *         required: false
 *         description: Capacité maximale
 *     responses:
 *       200:
 *         description: Restaurants filtrés avec succès
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
 *                   example: "Restaurants filtrés par capacité avec succès"
 *                 count:
 *                   type: integer
 *                   example: 5
 *                 restaurants:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Restaurant'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.get(
    '/capacity',
    protect,
    (req, res, next) => restaurantController.getRestaurantsByCapacity(req, res, next)
);

module.exports = router;