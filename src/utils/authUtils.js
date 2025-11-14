const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { randomUUID } = require('crypto');

// ------------------------------------
// Fonctions de Hashing
// ------------------------------------

/**
 * @description Hashe un mot de passe en utilisant bcrypt.
 */
exports.hashPassword = async (password) => {
    const saltRounds = parseInt(process.env.SALT_ROUNDS, 10) || 10;
    return await bcrypt.hash(password, saltRounds);
};

/**
 * @description Compare un mot de passe en clair avec un hash.
 */
exports.comparePassword = async (password, hash) => {
    return await bcrypt.compare(password, hash);
};

// ------------------------------------
// Fonctions de Tokens JWT
// ------------------------------------

/**
 * @description Génère un token d'accès JWT unique à chaque login.
 */
exports.generateAccessToken = (payload) => {
    return jwt.sign(
        {
            ...payload,
            iat: Math.floor(Date.now() / 1000), // force un timestamp unique
            jti: randomUUID() // identifiant unique du token
        },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_ACCESS_EXPIRATION || '15m' }
    );
};

/**
 * @description Génère un token de rafraîchissement JWT.
 */
exports.generateRefreshToken = (payload) => {
    return jwt.sign(
        {
            ...payload,
            iat: Math.floor(Date.now() / 1000),
            jti: randomUUID()
        },
        process.env.JWT_REFRESH_SECRET,
        { expiresIn: process.env.JWT_REFRESH_EXPIRATION || '7d' }
    );
};
