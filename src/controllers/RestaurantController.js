// src/controllers/RestaurantController.js

const RestaurantService = require('../services/RestaurantService');

class RestaurantController {

    /**
     * Gère la requête POST pour créer un nouveau restaurant.
     * @param {Object} req - Requête Express
     * @param {Object} res - Réponse Express
     * @param {Function} next - Fonction next Express
     */
    async createRestaurant(req, res, next) {
        try {
            const restaurant = await RestaurantService.createRestaurant(req.body);
            res.status(201).json({ 
                success: true,
                message: "Restaurant créé avec succès", 
                restaurant 
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Gère la requête GET pour récupérer tous les restaurants.
     * @param {Object} req - Requête Express
     * @param {Object} res - Réponse Express
     * @param {Function} next - Fonction next Express
     */
    async getAllRestaurants(req, res, next) {
        try {
            const restaurants = await RestaurantService.getAllRestaurants();
            res.status(200).json({
                success: true,
                message: "Restaurants récupérés avec succès",
                count: restaurants.length,
                restaurants
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Gère la requête GET pour récupérer un restaurant par son ID.
     * @param {Object} req - Requête Express
     * @param {Object} res - Réponse Express
     * @param {Function} next - Fonction next Express
     */
    async getRestaurantById(req, res, next) {
        try {
            const { id } = req.params;
            const restaurant = await RestaurantService.getRestaurantById(id);
            res.status(200).json({
                success: true,
                message: "Restaurant récupéré avec succès",
                restaurant
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Gère la requête PUT pour mettre à jour un restaurant.
     * @param {Object} req - Requête Express
     * @param {Object} res - Réponse Express
     * @param {Function} next - Fonction next Express
     */
    async updateRestaurant(req, res, next) {
        try {
            const { id } = req.params;
            const restaurant = await RestaurantService.updateRestaurant(id, req.body);
            res.status(200).json({
                success: true,
                message: "Restaurant mis à jour avec succès",
                restaurant
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Gère la requête DELETE pour supprimer un restaurant.
     * @param {Object} req - Requête Express
     * @param {Object} res - Réponse Express
     * @param {Function} next - Fonction next Express
     */
    async deleteRestaurant(req, res, next) {
        try {
            const { id } = req.params;
            await RestaurantService.deleteRestaurant(id);
            res.status(200).json({
                success: true,
                message: "Restaurant supprimé avec succès"
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Gère la requête GET pour rechercher des restaurants par nom.
     * @param {Object} req - Requête Express
     * @param {Object} res - Réponse Express
     * @param {Function} next - Fonction next Express
     */
    async searchRestaurants(req, res, next) {
        try {
            const { nom } = req.query;
            const restaurants = await RestaurantService.searchRestaurants(nom);
            res.status(200).json({
                success: true,
                message: "Recherche de restaurants effectuée avec succès",
                count: restaurants.length,
                restaurants
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Gère la requête GET pour récupérer les restaurants par capacité.
     * @param {Object} req - Requête Express
     * @param {Object} res - Réponse Express
     * @param {Function} next - Fonction next Express
     */
    async getRestaurantsByCapacity(req, res, next) {
        try {
            const { min, max } = req.query;
            const restaurants = await RestaurantService.getRestaurantsByCapacity(min, max);
            res.status(200).json({
                success: true,
                message: "Restaurants filtrés par capacité avec succès",
                count: restaurants.length,
                restaurants
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Gère la requête GET pour récupérer les statistiques des restaurants.
     * @param {Object} req - Requête Express
     * @param {Object} res - Réponse Express
     * @param {Function} next - Fonction next Express
     */
    async getRestaurantStats(req, res, next) {
        try {
            const stats = await RestaurantService.getRestaurantStats();
            res.status(200).json({
                success: true,
                message: "Statistiques des restaurants récupérées avec succès",
                stats
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Gère la requête PATCH pour mettre à jour partiellement un restaurant.
     * @param {Object} req - Requête Express
     * @param {Object} res - Réponse Express
     * @param {Function} next - Fonction next Express
     */
    async partialUpdateRestaurant(req, res, next) {
        try {
            const { id } = req.params;
            const restaurant = await RestaurantService.partialUpdateRestaurant(id, req.body);
            res.status(200).json({
                success: true,
                message: "Restaurant partiellement mis à jour avec succès",
                restaurant
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Gère la requête GET pour vérifier la disponibilité d'un restaurant.
     * @param {Object} req - Requête Express
     * @param {Object} res - Réponse Express
     * @param {Function} next - Fonction next Express
     */
    async checkAvailability(req, res, next) {
        try {
            const { id } = req.params;
            const { date, nombrePersonnes } = req.query;
            const availability = await RestaurantService.checkAvailability(id, date, nombrePersonnes);
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

// Export de la classe
module.exports = RestaurantController;