// src/models/StatsModel.js

const mongoose = require('mongoose');

// Schéma pour les logs d'activité
const activityLogSchema = new mongoose.Schema({
    action: {
        type: String,
        required: true,
        enum: ['LOGIN', 'LOGOUT', 'REGISTER', 'CREATE_RESERVATION', 'CANCEL_RESERVATION', 'CREATE_RESTAURANT', 'UPDATE_RESTAURANT']
    },
    userId: {
        type: Number,
        required: false // Peut être null pour les actions non authentifiées
    },
    userEmail: {
        type: String,
        required: false
    },
    resourceId: {
        type: Number, // ID de la ressource concernée (restaurant, réservation, etc.)
        required: false
    },
    resourceType: {
        type: String,
        enum: ['USER', 'RESTAURANT', 'RESERVATION', 'MENU'],
        required: false
    },
    ipAddress: {
        type: String,
        required: false
    },
    userAgent: {
        type: String,
        required: false
    },
    metadata: {
        type: mongoose.Schema.Types.Mixed, // Données supplémentaires
        default: {}
    },
    timestamp: {
        type: Date,
        default: Date.now,
        index: true
    }
}, {
    timestamps: true
});

// Schéma pour les statistiques quotidiennes
const dailyStatsSchema = new mongoose.Schema({
    date: {
        type: Date,
        required: true,
        unique: true,
        index: true
    },
    // Statistiques utilisateurs
    users: {
        total: { type: Number, default: 0 },
        new: { type: Number, default: 0 },
        active: { type: Number, default: 0 }
    },
    // Statistiques restaurants
    restaurants: {
        total: { type: Number, default: 0 },
        new: { type: Number, default: 0 }
    },
    // Statistiques réservations
    reservations: {
        total: { type: Number, default: 0 },
        new: { type: Number, default: 0 },
        confirmed: { type: Number, default: 0 },
        cancelled: { type: Number, default: 0 },
        averagePartySize: { type: Number, default: 0 }
    },
    // Performance
    responseTime: {
        average: { type: Number, default: 0 },
        max: { type: Number, default: 0 }
    }
}, {
    timestamps: true
});

// Index pour les recherches par date
dailyStatsSchema.index({ date: -1 });

// Méthode statique pour obtenir les stats d'une date spécifique
dailyStatsSchema.statics.findByDate = function(date) {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);
    
    return this.findOne({
        date: {
            $gte: startOfDay,
            $lte: endOfDay
        }
    });
};

// Méthode statique pour obtenir les stats d'une période
dailyStatsSchema.statics.findByDateRange = function(startDate, endDate) {
    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);
    
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);
    
    return this.find({
        date: {
            $gte: start,
            $lte: end
        }
    }).sort({ date: 1 });
};

const ActivityLog = mongoose.model('ActivityLog', activityLogSchema);
const DailyStats = mongoose.model('DailyStats', dailyStatsSchema);

module.exports = {
    ActivityLog,
    DailyStats
};