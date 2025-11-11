// src/middlewares/validator.js

/**
 * @description Middleware générique pour valider le corps d'une requête HTTP.
 * @param {object} schema - Le schéma Joi à utiliser pour la validation.
 */
const validate = (schema) => (req, res, next) => {
    const { error, value } = schema.validate(req.body, {
        abortEarly: false,
        stripUnknown: true
    });

    if (error) {
        const validationError = new Error("Erreur de validation des données.");
        validationError.status = 400; 
        validationError.details = error.details.map(detail => ({
            field: detail.context.key,
            message: detail.message.replace(/['"]/g, ''),
        }));
        
        return next(validationError);
    }
    
    req.body = value;
    next();
};

module.exports = validate;