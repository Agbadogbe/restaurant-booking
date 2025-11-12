// src/controllers/ReservationController.js

const ReservationService = require('../services/ReservationService');

class ReservationController {
    
    /**
     * @description Crée une nouvelle réservation
     */
    static async createReservation(req, res, next) {
        try {
            const userId = req.user.id;
            const { restaurantId, dateReservation, nombrePersonnes } = req.body;

            const reservation = await ReservationService.createReservation({
                userId,
                restaurantId,
                dateReservation,
                nombrePersonnes
            });

            res.status(201).json({
                success: true,
                message: "Réservation créée avec succès",
                reservation
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * @description Récupère les réservations de l'utilisateur connecté
     */
    static async getMyReservations(req, res, next) {
        try {
            const userId = req.user.id;
            const reservations = await ReservationService.getUserReservations(userId);

            res.status(200).json({
                success: true,
                message: "Réservations récupérées avec succès",
                count: reservations.length,
                reservations
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * @description Récupère les réservations d'un restaurant (Admin/Propriétaire)
     */
    static async getRestaurantReservations(req, res, next) {
        try {
            const { restaurantId } = req.params;
            const reservations = await ReservationService.getRestaurantReservations(restaurantId);

            res.status(200).json({
                success: true,
                message: "Réservations du restaurant récupérées avec succès",
                count: reservations.length,
                reservations
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * @description Annule une réservation
     */
    static async cancelReservation(req, res, next) {
        try {
            const userId = req.user.id;
            const userRole = req.user.role;
            const { reservationId } = req.params;

            const reservation = await ReservationService.cancelReservation(reservationId, userId, userRole);

            res.status(200).json({
                success: true,
                message: "Réservation annulée avec succès",
                reservation
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * @description Met à jour le statut d'une réservation (Admin seulement)
     */
    static async updateReservationStatus(req, res, next) {
        try {
            const { reservationId } = req.params;
            const { statut } = req.body;

            const reservation = await ReservationService.updateReservationStatus(reservationId, statut);

            res.status(200).json({
                success: true,
                message: "Statut de la réservation mis à jour avec succès",
                reservation
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * @description Vérifie la disponibilité d'un restaurant
     */
    static async checkAvailability(req, res, next) {
        try {
            const { restaurantId } = req.params;
            const { date } = req.query;

            if (!date) {
                const error = new Error('La date est requise');
                error.status = 400;
                throw error;
            }

            const availability = await ReservationService.checkAvailability(restaurantId, date);

            res.status(200).json({
                success: true,
                message: "Disponibilité vérifiée avec succès",
                availability
            });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = ReservationController;