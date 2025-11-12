// src/schemas/userSchema.js
const Joi = require('joi');

const registerSchema = Joi.object({
    email: Joi.string().email().required(), 
    password: Joi.string()
        .min(8)
        .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/)
        .required()
        .messages({
            'string.pattern.base': 'Le mot de passe doit contenir au moins 8 caractères, dont une majuscule, une minuscule et un chiffre.'
        }),
    nom: Joi.string().trim().required(), 
});

const loginSchema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
});

module.exports = {
    registerSchema,
    loginSchema,
};