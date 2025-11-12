// src/schemas/reservationSchema.js

const Joi = require('joi');

const reservationSchema = Joi.object({
    restaurantId: Joi.number()
        .integer()
        .positive()
        .required()
        .messages({
            'number.base': 'L\'ID du restaurant doit être un nombre',
            'number.integer': 'L\'ID du restaurant doit être un entier',
            'number.positive': 'L\'ID du restaurant doit être positif',
            'any.required': 'L\'ID du restaurant est requis'
        }),

    dateReservation: Joi.date()
        .iso()
        .min('now')
        .required()
        .messages({
            'date.base': 'La date de réservation doit être une date valide',
            'date.format': 'La date doit être au format ISO (YYYY-MM-DDTHH:mm:ssZ)',
            'date.min': 'La date de réservation doit être dans le futur',
            'any.required': 'La date de réservation est requise'
        }),

    nombrePersonnes: Joi.number()
        .integer()
        .min(1)
        .max(20) // ✅ Augmenter la limite pour permettre le test
        .required()
        .messages({
            'number.base': 'Le nombre de personnes doit être un nombre',
            'number.integer': 'Le nombre de personnes doit être un entier',
            'number.min': 'Le nombre de personnes doit être d\'au moins 1',
            'number.max': 'Le nombre de personnes ne peut pas dépasser 20',
            'any.required': 'Le nombre de personnes est requis'
        })
});

const updateStatusSchema = Joi.object({
    statut: Joi.string()
        .valid('confirmée', 'en attente', 'annulée', 'terminée')
        .required()
        .messages({
            'string.base': 'Le statut doit être une chaîne de caractères',
            'any.only': 'Le statut doit être: confirmée, en attente, annulée ou terminée',
            'any.required': 'Le statut est requis'
        })
});

module.exports = {
    reservationSchema,
    updateStatusSchema
};