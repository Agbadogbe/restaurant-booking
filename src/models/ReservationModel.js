// src/models/ReservationModel.js

const { getPgPool } = require('../config');

class ReservationModel {
    
    /**
     * @description Crée une nouvelle réservation
     */
    static async create({ userId, restaurantId, dateReservation, nombrePersonnes, statut = 'confirmée' }) {
        const pgPool = getPgPool();
        const query = `
            INSERT INTO reservations (id_user, id_restaurant, date_reservation, nombre_personnes, statut)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING id_reservation, id_user, id_restaurant, date_reservation, nombre_personnes, statut, created_at;
        `;
        const values = [userId, restaurantId, dateReservation, nombrePersonnes, statut];
        const result = await pgPool.query(query, values);
        return result.rows[0];
    }

    /**
     * @description Récupère les réservations d'un utilisateur
     */
    static async findByUserId(userId) {
        const pgPool = getPgPool();
        const query = `
            SELECT 
                r.*, 
                res.nom as restaurant_nom, 
                res.adresse as restaurant_adresse,
                res.capacite_max as restaurant_capacite
            FROM reservations r
            JOIN restaurants res ON r.id_restaurant = res.id_restaurant
            WHERE r.id_user = $1
            ORDER BY r.date_reservation DESC;
        `;
        const result = await pgPool.query(query, [userId]);
        return result.rows;
    }

    /**
     * @description Récupère les réservations d'un restaurant
     */
    static async findByRestaurantId(restaurantId) {
        const pgPool = getPgPool();
        const query = `
            SELECT 
                r.*, 
                u.email as user_email, 
                u.nom as user_nom
            FROM reservations r
            JOIN users u ON r.id_user = u.id_user
            WHERE r.id_restaurant = $1
            ORDER BY r.date_reservation DESC;
        `;
        const result = await pgPool.query(query, [restaurantId]);
        return result.rows;
    }

    /**
     * @description Vérifie la disponibilité d'un restaurant à une date
     */
    static async checkAvailability(restaurantId, dateReservation) {
        const pgPool = getPgPool();
        const query = `
            SELECT 
                res.capacite_max,
                COALESCE(SUM(r.nombre_personnes), 0) as reservations_count
            FROM restaurants res
            LEFT JOIN reservations r ON res.id_restaurant = r.id_restaurant 
                AND DATE(r.date_reservation) = DATE($1)
                AND r.statut IN ('confirmée', 'en attente')
            WHERE res.id_restaurant = $2
            GROUP BY res.id_restaurant, res.capacite_max;
        `;
        const result = await pgPool.query(query, [dateReservation, restaurantId]);
        return result.rows[0];
    }

    /**
     * @description Met à jour le statut d'une réservation
     */
    static async updateStatut(reservationId, statut) {
        const pgPool = getPgPool();
        const query = `
            UPDATE reservations 
            SET statut = $1, updated_at = CURRENT_TIMESTAMP
            WHERE id_reservation = $2
            RETURNING *;
        `;
        const result = await pgPool.query(query, [statut, reservationId]);
        return result.rows[0];
    }

    /**
     * @description Supprime une réservation
     */
    static async delete(reservationId) {
        const pgPool = getPgPool();
        const query = `
            DELETE FROM reservations 
            WHERE id_reservation = $1
            RETURNING id_reservation;
        `;
        const result = await pgPool.query(query, [reservationId]);
        return result.rows[0];
    }

    /**
     * @description Récupère une réservation par son ID
     */
    static async findById(reservationId) {
        const pgPool = getPgPool();
        const query = `
            SELECT 
                r.*, 
                res.nom as restaurant_nom, 
                res.adresse as restaurant_adresse,
                u.email as user_email,
                u.nom as user_nom
            FROM reservations r
            JOIN restaurants res ON r.id_restaurant = res.id_restaurant
            JOIN users u ON r.id_user = u.id_user
            WHERE r.id_reservation = $1;
        `;
        const result = await pgPool.query(query, [reservationId]);
        return result.rows[0];
    }

    /**
     * @description Récupère les réservations par statut
     */
    static async findByStatut(statut) {
        const pgPool = getPgPool();
        const query = `
            SELECT 
                r.*,
                res.nom as restaurant_nom,
                u.email as user_email
            FROM reservations r
            JOIN restaurants res ON r.id_restaurant = res.id_restaurant
            JOIN users u ON r.id_user = u.id_user
            WHERE r.statut = $1
            ORDER BY r.date_reservation ASC;
        `;
        const result = await pgPool.query(query, [statut]);
        return result.rows;
    }

    /**
     * @description Récupère les réservations à venir d'un restaurant
     */
    static async findUpcomingByRestaurant(restaurantId, limit = 10) {
        const pgPool = getPgPool();
        const query = `
            SELECT 
                r.*,
                u.nom as user_nom,
                u.email as user_email
            FROM reservations r
            JOIN users u ON r.id_user = u.id_user
            WHERE r.id_restaurant = $1 
            AND r.date_reservation >= CURRENT_TIMESTAMP
            AND r.statut IN ('confirmée', 'en attente')
            ORDER BY r.date_reservation ASC
            LIMIT $2;
        `;
        const result = await pgPool.query(query, [restaurantId, limit]);
        return result.rows;
    }

    /**
     * @description Récupère les statistiques des réservations
     */
    static async getStats() {
        const pgPool = getPgPool();
        const query = `
            SELECT 
                COUNT(*) as total_reservations,
                COUNT(CASE WHEN statut = 'confirmée' THEN 1 END) as confirmées,
                COUNT(CASE WHEN statut = 'en attente' THEN 1 END) as en_attente,
                COUNT(CASE WHEN statut = 'annulée' THEN 1 END) as annulées,
                COUNT(CASE WHEN statut = 'terminée' THEN 1 END) as terminées,
                AVG(nombre_personnes) as moyenne_personnes,
                MAX(nombre_personnes) as max_personnes
            FROM reservations;
        `;
        const result = await pgPool.query(query);
        return result.rows[0];
    }

    /**
     * @description Vérifie si un utilisateur a déjà une réservation à cette date
     */
    static async hasUserReservationAtDate(userId, dateReservation) {
        const pgPool = getPgPool();
        const query = `
            SELECT 1 FROM reservations 
            WHERE id_user = $1 
            AND DATE(date_reservation) = DATE($2)
            AND statut IN ('confirmée', 'en attente')
            LIMIT 1;
        `;
        const result = await pgPool.query(query, [userId, dateReservation]);
        return result.rows.length > 0;
    }

    /**
     * @description Récupère les réservations avec pagination
     */
    static async findWithPagination(limit = 10, offset = 0) {
        const pgPool = getPgPool();
        const query = `
            SELECT 
                r.*,
                res.nom as restaurant_nom,
                u.email as user_email
            FROM reservations r
            JOIN restaurants res ON r.id_restaurant = res.id_restaurant
            JOIN users u ON r.id_user = u.id_user
            ORDER BY r.created_at DESC
            LIMIT $1 OFFSET $2;
        `;
        const result = await pgPool.query(query, [limit, offset]);
        return result.rows;
    }

    /**
     * @description Compte le nombre total de réservations
     */
    static async count() {
        const pgPool = getPgPool();
        const query = 'SELECT COUNT(*) FROM reservations';
        const result = await pgPool.query(query);
        return parseInt(result.rows[0].count);
    }
}

module.exports = ReservationModel;