// src/routes/reservationRoutes.js

const express = require('express');
const router = express.Router();
const ReservationController = require('../controllers/ReservationController');
const validator = require('../middlewares/validator');
const { reservationSchema, updateStatusSchema } = require('../schemas/reservationSchema');
const { protect, authorize } = require('../middlewares/authMiddleware');

/**
 * @swagger
 * tags:
 *   - name: Reservations
 *     description: Gestion des réservations de restaurants
 */

/**
 * @swagger
 * /api/reservations:
 *   post:
 *     summary: Créer une nouvelle réservation
 *     description: |-
 *       Crée une réservation pour l'utilisateur connecté.
 *       Vérifications automatiques :
 *       - Disponibilité du restaurant à la date demandée
 *       - Capacité suffisante
 *       - Absence de réservation existante à la même date
 *     tags: [Reservations]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - restaurantId
 *               - dateReservation
 *               - nombrePersonnes
 *             properties:
 *               restaurantId:
 *                 type: integer
 *                 example: 1
 *                 description: ID du restaurant
 *               dateReservation:
 *                 type: string
 *                 format: date-time
 *                 example: "2024-02-01T20:00:00.000Z"
 *                 description: Date et heure de la réservation (doit être dans le futur)
 *               nombrePersonnes:
 *                 type: integer
 *                 example: 4
 *                 minimum: 1
 *                 maximum: 20
 *                 description: Nombre de personnes (max 20)
 *     responses:
 *       201:
 *         description: Réservation créée avec succès
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
 *                   example: "Réservation créée avec succès"
 *                 reservation:
 *                   $ref: '#/components/schemas/Reservation'
 *       400:
 *         description: |-
 *           Erreurs possibles :
 *           - Données de validation invalides
 *           - Capacité insuffisante
 *           - Réservation déjà existante à cette date
 *           - Date dans le passé
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         description: Restaurant non trouvé
 */
router.post(
    '/',
    protect,
    validator(reservationSchema),
    ReservationController.createReservation
);

/**
 * @swagger
 * /api/reservations/my-reservations:
 *   get:
 *     summary: Récupérer les réservations de l'utilisateur connecté
 *     description: Retourne l'historique des réservations de l'utilisateur authentifié
 *     tags: [Reservations]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Réservations récupérées avec succès
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
 *                   example: "Réservations récupérées avec succès"
 *                 count:
 *                   type: integer
 *                   example: 3
 *                 reservations:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Reservation'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.get(
    '/my-reservations',
    protect,
    ReservationController.getMyReservations
);

/**
 * @swagger
 * /api/reservations/restaurant/{restaurantId}:
 *   get:
 *     summary: Récupérer les réservations d'un restaurant
 *     description: Accès réservé aux administrateurs
 *     tags: [Reservations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: restaurantId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID du restaurant
 *     responses:
 *       200:
 *         description: Réservations du restaurant récupérées avec succès
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
 *                   example: "Réservations du restaurant récupérées avec succès"
 *                 count:
 *                   type: integer
 *                   example: 15
 *                 reservations:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Reservation'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       404:
 *         description: Restaurant non trouvé
 */
router.get(
    '/restaurant/:restaurantId',
    protect,
    authorize('Admin'),
    ReservationController.getRestaurantReservations
);

/**
 * @swagger
 * /api/reservations/{reservationId}/cancel:
 *   patch:
 *     summary: Annuler une réservation
 *     description: |-
 *       Annule une réservation. Conditions :
 *       - Le client peut annuler sa propre réservation jusqu'à 2 heures avant
 *       - L'admin peut annuler n'importe quelle réservation à tout moment
 *     tags: [Reservations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: reservationId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la réservation à annuler
 *     responses:
 *       200:
 *         description: Réservation annulée avec succès
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
 *                   example: "Réservation annulée avec succès"
 *                 reservation:
 *                   $ref: '#/components/schemas/Reservation'
 *       400:
 *         description: |-
 *           Erreurs possibles :
 *           - Impossible d'annuler (moins de 2 heures avant)
 *           - Réservation déjà annulée
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         description: Non autorisé à modifier cette réservation
 *       404:
 *         description: Réservation non trouvée
 */
router.patch(
    '/:reservationId/cancel',
    protect,
    ReservationController.cancelReservation
);

/**
 * @swagger
 * /api/reservations/{reservationId}/status:
 *   patch:
 *     summary: Mettre à jour le statut d'une réservation
 *     description: Accès réservé aux administrateurs
 *     tags: [Reservations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: reservationId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la réservation
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - statut
 *             properties:
 *               statut:
 *                 type: string
 *                 enum: [confirmée, en attente, annulée, terminée]
 *                 example: "annulée"
 *                 description: Nouveau statut de la réservation
 *     responses:
 *       200:
 *         description: Statut de la réservation mis à jour avec succès
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
 *                   example: "Statut de la réservation mis à jour avec succès"
 *                 reservation:
 *                   $ref: '#/components/schemas/Reservation'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       404:
 *         description: Réservation non trouvée
 */
router.patch(
    '/:reservationId/status',
    protect,
    authorize('Admin'),
    validator(updateStatusSchema),
    ReservationController.updateReservationStatus
);

/**
 * @swagger
 * /api/reservations/availability/{restaurantId}:
 *   get:
 *     summary: Vérifier la disponibilité d'un restaurant
 *     description: Vérifie le nombre de places disponibles pour un restaurant à une date donnée
 *     tags: [Reservations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: restaurantId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID du restaurant
 *       - in: query
 *         name: date
 *         required: true
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Date à vérifier (format ISO)
 *         example: "2024-02-01T20:00:00.000Z"
 *     responses:
 *       200:
 *         description: Disponibilité vérifiée avec succès
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
 *                   example: "Disponibilité vérifiée avec succès"
 *                 availability:
 *                   $ref: '#/components/schemas/Availability'
 *       400:
 *         description: Date manquante ou invalide
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         description: Restaurant non trouvé
 */
router.get(
    '/availability/:restaurantId',
    protect,
    ReservationController.checkAvailability
);

module.exports = router;