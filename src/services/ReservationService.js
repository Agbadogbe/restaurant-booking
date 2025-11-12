// src/services/ReservationService.js

const ReservationModel = require('../models/ReservationModel');

class ReservationService {
    
    /**
     * @description Crée une nouvelle réservation avec vérification de disponibilité
     */
    static async createReservation(reservationData) {
        const { userId, restaurantId, dateReservation, nombrePersonnes } = reservationData;

        // Vérifier la disponibilité
        const availability = await ReservationModel.checkAvailability(restaurantId, dateReservation);
        
        if (!availability) {
            const error = new Error('Restaurant non trouvé');
            error.status = 404;
            throw error;
        }

        const placesRestantes = availability.capacite_max - parseInt(availability.reservations_count);
        
        if (nombrePersonnes > placesRestantes) {
            const error = new Error(`Capacité insuffisante. Il reste ${placesRestantes} place(s) disponible(s) sur ${availability.capacite_max}`);
            error.status = 400;
            throw error;
        }

        // Vérifier si l'utilisateur a déjà une réservation à cette date
        const hasExistingReservation = await ReservationModel.hasUserReservationAtDate(userId, dateReservation);
        if (hasExistingReservation) {
            const error = new Error('Vous avez déjà une réservation à cette date');
            error.status = 400;
            throw error;
        }

        // Créer la réservation
        const reservation = await ReservationModel.create({
            userId,
            restaurantId,
            dateReservation,
            nombrePersonnes
        });

        return reservation;
    }

    /**
     * @description Récupère les réservations d'un utilisateur
     */
    static async getUserReservations(userId) {
        try {
            const reservations = await ReservationModel.findByUserId(userId);
            return reservations;
        } catch (error) {
            const serviceError = new Error(`Erreur lors de la récupération des réservations: ${error.message}`);
            serviceError.status = 500;
            throw serviceError;
        }
    }

    /**
     * @description Récupère les réservations d'un restaurant (pour le propriétaire/admin)
     */
    static async getRestaurantReservations(restaurantId) {
        try {
            const reservations = await ReservationModel.findByRestaurantId(restaurantId);
            return reservations;
        } catch (error) {
            const serviceError = new Error(`Erreur lors de la récupération des réservations du restaurant: ${error.message}`);
            serviceError.status = 500;
            throw serviceError;
        }
    }

    /**
     * @description Annule une réservation
     */
    static async cancelReservation(reservationId, userId, userRole) {
        try {
            const reservation = await ReservationModel.findById(reservationId);
            
            if (!reservation) {
                const error = new Error('Réservation non trouvée');
                error.status = 404;
                throw error;
            }

            // Vérifier les permissions
            if (userRole !== 'Admin' && reservation.id_user !== userId) {
                const error = new Error('Non autorisé à modifier cette réservation');
                error.status = 403;
                throw error;
            }

            // Vérifier si la réservation peut être annulée (au moins 2 heures avant)
            const reservationDate = new Date(reservation.date_reservation);
            const now = new Date();
            const timeDiff = reservationDate.getTime() - now.getTime();
            const hoursDiff = timeDiff / (1000 * 60 * 60);

            if (hoursDiff < 2 && userRole !== 'Admin') {
                const error = new Error('Impossible d\'annuler : la réservation est dans moins de 2 heures');
                error.status = 400;
                throw error;
            }

            const updatedReservation = await ReservationModel.updateStatut(reservationId, 'annulée');
            return updatedReservation;

        } catch (error) {
            if (error.status === 404 || error.status === 403 || error.status === 400) {
                throw error;
            }
            const serviceError = new Error(`Erreur lors de l'annulation de la réservation: ${error.message}`);
            serviceError.status = 500;
            throw serviceError;
        }
    }

    /**
     * @description Met à jour le statut d'une réservation (Admin seulement)
     */
    static async updateReservationStatus(reservationId, statut) {
        try {
            const reservation = await ReservationModel.findById(reservationId);
            
            if (!reservation) {
                const error = new Error('Réservation non trouvée');
                error.status = 404;
                throw error;
            }

            const statutsValides = ['confirmée', 'en attente', 'annulée', 'terminée'];
            if (!statutsValides.includes(statut)) {
                const error = new Error(`Statut invalide. Doit être: ${statutsValides.join(', ')}`);
                error.status = 400;
                throw error;
            }

            const updatedReservation = await ReservationModel.updateStatut(reservationId, statut);
            return updatedReservation;

        } catch (error) {
            if (error.status === 404 || error.status === 400) {
                throw error;
            }
            const serviceError = new Error(`Erreur lors de la mise à jour du statut: ${error.message}`);
            serviceError.status = 500;
            throw serviceError;
        }
    }

    /**
     * @description Vérifie la disponibilité d'un restaurant
     */
    static async checkAvailability(restaurantId, date) {
        try {
            const availability = await ReservationModel.checkAvailability(restaurantId, date);
            
            if (!availability) {
                const error = new Error('Restaurant non trouvé');
                error.status = 404;
                throw error;
            }

            return {
                capacite_max: availability.capacite_max,
                reservations_count: parseInt(availability.reservations_count),
                places_restantes: availability.capacite_max - availability.reservations_count,
                disponible: (availability.capacite_max - availability.reservations_count) > 0
            };

        } catch (error) {
            if (error.status === 404) {
                throw error;
            }
            const serviceError = new Error(`Erreur lors de la vérification de disponibilité: ${error.message}`);
            serviceError.status = 500;
            throw serviceError;
        }
    }

    /**
     * @description Récupère une réservation par son ID
     */
    static async getReservationById(reservationId) {
        try {
            const reservation = await ReservationModel.findById(reservationId);
            
            if (!reservation) {
                const error = new Error('Réservation non trouvée');
                error.status = 404;
                throw error;
            }

            return reservation;

        } catch (error) {
            if (error.status === 404) {
                throw error;
            }
            const serviceError = new Error(`Erreur lors de la récupération de la réservation: ${error.message}`);
            serviceError.status = 500;
            throw serviceError;
        }
    }

    /**
     * @description Récupère les réservations à venir d'un restaurant
     */
    static async getUpcomingRestaurantReservations(restaurantId, limit = 10) {
        try {
            const reservations = await ReservationModel.findUpcomingByRestaurant(restaurantId, limit);
            return reservations;

        } catch (error) {
            const serviceError = new Error(`Erreur lors de la récupération des réservations à venir: ${error.message}`);
            serviceError.status = 500;
            throw serviceError;
        }
    }

    /**
     * @description Récupère les statistiques des réservations
     */
    static async getReservationStats() {
        try {
            const stats = await ReservationModel.getStats();
            return stats;

        } catch (error) {
            const serviceError = new Error(`Erreur lors de la récupération des statistiques: ${error.message}`);
            serviceError.status = 500;
            throw serviceError;
        }
    }

    /**
     * @description Récupère les réservations par statut
     */
    static async getReservationsByStatus(statut) {
        try {
            const reservations = await ReservationModel.findByStatut(statut);
            return reservations;

        } catch (error) {
            const serviceError = new Error(`Erreur lors de la récupération des réservations par statut: ${error.message}`);
            serviceError.status = 500;
            throw serviceError;
        }
    }

    /**
     * @description Récupère les réservations avec pagination
     */
    static async getReservationsWithPagination(limit = 10, offset = 0) {
        try {
            const reservations = await ReservationModel.findWithPagination(limit, offset);
            return reservations;

        } catch (error) {
            const serviceError = new Error(`Erreur lors de la récupération paginée des réservations: ${error.message}`);
            serviceError.status = 500;
            throw serviceError;
        }
    }

    /**
     * @description Compte le nombre total de réservations
     */
    static async getReservationsCount() {
        try {
            const count = await ReservationModel.count();
            return count;

        } catch (error) {
            const serviceError = new Error(`Erreur lors du comptage des réservations: ${error.message}`);
            serviceError.status = 500;
            throw serviceError;
        }
    }

    /**
     * @description Supprime une réservation (Admin seulement)
     */
    static async deleteReservation(reservationId) {
        try {
            const reservation = await ReservationModel.findById(reservationId);
            
            if (!reservation) {
                const error = new Error('Réservation non trouvée');
                error.status = 404;
                throw error;
            }

            const result = await ReservationModel.delete(reservationId);
            return result;

        } catch (error) {
            if (error.status === 404) {
                throw error;
            }
            const serviceError = new Error(`Erreur lors de la suppression de la réservation: ${error.message}`);
            serviceError.status = 500;
            throw serviceError;
        }
    }
}

module.exports = ReservationService;