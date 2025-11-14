// src/schemas/restaurantSchema.js

const Joi = require('joi');

const restaurantSchema = Joi.object({
    nom: Joi.string()
        .min(3)
        .max(100)
        .required()
        .messages({
            'string.base': 'Le nom doit être une chaîne de caractères.',
            'string.empty': 'Le nom est requis.',
            'string.min': 'Le nom doit contenir au moins {#limit} caractères.',
            'string.max': 'Le nom ne doit pas dépasser {#limit} caractères.',
            'any.required': 'Le nom est requis.'
        }),

    adresse: Joi.string()
        .max(255)
        .required()
        .messages({
            'string.base': 'L\'adresse doit être une chaîne de caractères.',
            'string.empty': 'L\'adresse est requise.',
            'string.max': 'L\'adresse ne doit pas dépasser {#limit} caractères.',
            'any.required': 'L\'adresse est requise.'
        }),
        
    description: Joi.string()
        .allow(null, '') 
        .max(500)
        .optional()
        .messages({
            'string.max': 'La description ne doit pas dépasser {#limit} caractères.'
        }), 

    capacite_max: Joi.number()
        .integer()
        .min(1)
        .max(1000)
        .required()
        .messages({
            'number.base': 'La capacité doit être un nombre entier.',
            'number.integer': 'La capacité doit être un nombre entier.',
            'number.min': 'La capacité maximale doit être d\'au moins {#limit} place.',
            'number.max': 'La capacité maximale ne peut pas dépasser {#limit} places.',
            'any.required': 'La capacité maximale est requise.'
        }),
});

module.exports = restaurantSchema;