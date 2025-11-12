// src/middlewares/authMiddleware.js

const jwt = require('jsonwebtoken');

/**
 * @description Vérifie la validité du Token d'Accès JWT.
 * Le token est attendu dans l'en-tête "Authorization: Bearer <token>".
 */
exports.protect = (req, res, next) => {
    let token;

    // 1. Récupération du token
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {

        token = authHeader.split(' ')[1];
    }


    // 2. Vérification de la présence du token
    if (!token) {
        // Erreur 401: Non autorisé
        const err = new Error('Accès refusé. Token non fourni.');
        err.status = 401;
        return next(err);
    }

    try {
        // 3. Vérification de la validité et décodage du token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // 4. Ajout des données de l'utilisateur (id et rôle) à l'objet 'req'
        // Ces données seront utilisées par les controllers et les autres middlewares
        req.user = { 
            id: decoded.id, 
            role: decoded.role 
        };

        next(); // Poursuite vers le prochain middleware ou le contrôleur

    } catch (error) {
        // Erreur 403: Jeton invalide ou expiré
        const err = new Error('Token invalide ou expiré.');
        err.status = 403;
        return next(err);
    }
};

/**
 * @description Middleware pour restreindre l'accès en fonction des rôles.
 * @param {...string} allowedRoles - Liste des rôles autorisés (ex: 'Admin', 'Manager').
 */
exports.authorize = (...allowedRoles) => {
    return (req, res, next) => {
        // Vérifie si req.user.role (ajouté par le middleware protect) est inclus dans les rôles autorisés
        if (!req.user || !allowedRoles.includes(req.user.role)) {
            // Erreur 403: Interdit (l'utilisateur est connu, mais n'a pas la permission)
            const err = new Error('Accès refusé. Vous n\'avez pas les permissions nécessaires (' + allowedRoles.join(', ') + ').');
            err.status = 403;
            return next(err);
        }
        next(); // Poursuite si le rôle est autorisé
    };
};