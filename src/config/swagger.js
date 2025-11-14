// src/config/swagger.js
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API Restaurant Booking',
      version: '1.0.0',
      description: 'API complète de réservation de restaurants avec authentification JWT',
      contact: {
        name: 'Support API',
        email: 'support@restaurant-booking.com'
      },
    },
    servers: [
      {
        url: 'http://localhost:3000/api',
        description: 'Serveur de développement'
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              description: 'ID unique de l\'utilisateur'
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'Email de l\'utilisateur'
            },
            nom: {
              type: 'string',
              description: 'Nom de l\'utilisateur'
            },
            role: {
              type: 'string',
              enum: ['Client', 'Admin'],
              description: 'Rôle de l\'utilisateur'
            }
          }
        },
        Restaurant: {
          type: 'object',
          properties: {
            id_restaurant: {
              type: 'integer',
              description: 'ID unique du restaurant'
            },
            nom: {
              type: 'string',
              description: 'Nom du restaurant'
            },
            adresse: {
              type: 'string',
              description: 'Adresse du restaurant'
            },
            description: {
              type: 'string',
              description: 'Description du restaurant'
            },
            capacite_max: {
              type: 'integer',
              description: 'Capacité maximale du restaurant'
            }
          }
        },
        Reservation: {
          type: 'object',
          properties: {
            id_reservation: {
              type: 'integer',
              description: 'ID unique de la réservation'
            },
            id_user: {
              type: 'integer',
              description: 'ID de l\'utilisateur'
            },
            id_restaurant: {
              type: 'integer',
              description: 'ID du restaurant'
            },
            date_reservation: {
              type: 'string',
              format: 'date-time',
              description: 'Date et heure de la réservation'
            },
            nombre_personnes: {
              type: 'integer',
              description: 'Nombre de personnes'
            },
            statut: {
              type: 'string',
              enum: ['confirmée', 'en attente', 'annulée', 'terminée'],
              description: 'Statut de la réservation'
            }
          }
        },
        Error: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: false
            },
            status: {
              type: 'integer',
              example: 400
            },
            message: {
              type: 'string',
              example: 'Erreur de validation des données'
            },
            errors: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  field: {
                    type: 'string',
                    example: 'email'
                  },
                  message: {
                    type: 'string',
                    example: 'L\'email doit être une adresse valide'
                  }
                }
              }
            }
          }
        }
      }
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ['./src/routes/*.js', './src/controllers/*.js'], // Chemins vers vos fichiers de routes
};

const specs = swaggerJsdoc(options);

module.exports = {
  specs,
  swaggerUi
};