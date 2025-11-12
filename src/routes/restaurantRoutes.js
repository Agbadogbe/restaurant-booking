// src/routes/restaurantRoutes.js

const express = require('express');
const router = express.Router();
const RestaurantController = require('../controllers/RestaurantController');
const validator = require('../middlewares/validator');
const createRestaurantSchema = require('../schemas/restaurantSchema');
const { protect, authorize } = require('../middlewares/authMiddleware');

const restaurantController = new RestaurantController();

// Route POST pour créer un restaurant (réservée aux Admins)
router.post(
    '/', 
    protect, 
    authorize('Admin'),
    validator(createRestaurantSchema), 
    (req, res, next) => restaurantController.createRestaurant(req, res, next)
);

// Route GET pour lister les restaurants (ouverte aux Clients et Admins)
router.get(
    '/', 
    protect,
    (req, res, next) => restaurantController.getAllRestaurants(req, res, next)
);

// Route GET pour récupérer un restaurant spécifique
router.get(
    '/:id', 
    protect,
    (req, res, next) => restaurantController.getRestaurantById(req, res, next)
);

// Route PUT pour mettre à jour un restaurant (Admin seulement)
router.put(
    '/:id', 
    protect, 
    authorize('Admin'),
    validator(createRestaurantSchema),
    (req, res, next) => restaurantController.updateRestaurant(req, res, next)
);

// Route DELETE pour supprimer un restaurant (Admin seulement)
router.delete(
    '/:id', 
    protect, 
    authorize('Admin'),
    (req, res, next) => restaurantController.deleteRestaurant(req, res, next)
);

module.exports = router;