// src/routes/reservationRoutes.js

const express = require('express');
const router = express.Router();
const ReservationController = require('../controllers/ReservationController');
const validator = require('../middlewares/validator');
const { reservationSchema, updateStatusSchema } = require('../schemas/reservationSchema');
const { protect, authorize } = require('../middlewares/authMiddleware');

/**
 * @route POST /api/reservations
 * @description Créer une nouvelle réservation
 * @access Private (Client)
 */
router.post(
    '/',
    protect,
    validator(reservationSchema),
    ReservationController.createReservation
);

/**
 * @route GET /api/reservations/my-reservations
 * @description Récupérer les réservations de l'utilisateur connecté
 * @access Private (Client)
 */
router.get(
    '/my-reservations',
    protect,
    ReservationController.getMyReservations
);

/**
 * @route GET /api/reservations/restaurant/:restaurantId
 * @description Récupérer les réservations d'un restaurant (Admin/Propriétaire)
 * @access Private (Admin)
 */
router.get(
    '/restaurant/:restaurantId',
    protect,
    authorize('Admin'),
    ReservationController.getRestaurantReservations
);

/**
 * @route PATCH /api/reservations/:reservationId/cancel
 * @description Annuler une réservation
 * @access Private (Client propriétaire ou Admin)
 */
router.patch(
    '/:reservationId/cancel',
    protect,
    ReservationController.cancelReservation
);

/**
 * @route PATCH /api/reservations/:reservationId/status
 * @description Mettre à jour le statut d'une réservation (Admin seulement)
 * @access Private (Admin)
 */
router.patch(
    '/:reservationId/status',
    protect,
    authorize('Admin'),
    validator(updateStatusSchema),
    ReservationController.updateReservationStatus
);

/**
 * @route GET /api/reservations/availability/:restaurantId
 * @description Vérifier la disponibilité d'un restaurant à une date
 * @access Private
 */
router.get(
    '/availability/:restaurantId',
    protect,
    ReservationController.checkAvailability
);

module.exports = router;