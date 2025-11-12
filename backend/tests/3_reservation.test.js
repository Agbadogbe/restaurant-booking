// 🗓️ tests/3_reservation.test.js
const { expect } = require('chai');

let reservationId = null;
const reservationData = {
    restaurantId: null,
    dateReservation: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    nombrePersonnes: 4
};

describe('🗓️ Tests d\'Intégration: Gestion des Réservations', () => {

    before(async () => {
        console.log('🧹 Nettoyage de la table "reservations"...');
        await global.pgPool.query('TRUNCATE TABLE reservations RESTART IDENTITY CASCADE;');
        
        // Créer un restaurant avec capacité très limitée pour le test
        const restaurantRes = await global.pgPool.query(`
            INSERT INTO restaurants (nom, adresse, capacite_max) 
            VALUES ($1, $2, $3) 
            RETURNING id_restaurant`,
            ['Petit Restaurant Test', '123 Test Street', 5] // ✅ Seulement 5 places
        );
        
        reservationData.restaurantId = restaurantRes.rows[0].id_restaurant;
        console.log('🍽️ Restaurant de test créé (capacité: 5 places)');
    });

    it('doit créer une réservation pour un client (201)', async () => {
        const res = await global.request
            .post('/api/reservations')
            .set('Authorization', `Bearer ${global.accessToken}`)
            .send(reservationData)
            .expect(201);

        expect(res.body.reservation).to.have.property('id_reservation');
        reservationId = res.body.reservation.id_reservation;
        console.log('✅ Réservation créée avec succès');
    });

    it('doit refuser une réservation avec capacité insuffisante (400)', async () => {
        // ✅ CORRECTION : Essayer de réserver plus que la capacité totale
        const invalidData = {
            ...reservationData,
            nombrePersonnes: 10 // ✅ Plus que la capacité totale de 5
        };

        const res = await global.request
            .post('/api/reservations')
            .set('Authorization', `Bearer ${global.accessToken}`)
            .send(invalidData)
            .expect(400);

        // ✅ Vérifier que c'est bien notre erreur métier
        expect(res.body.message).to.include('Capacité insuffisante');
        console.log('✅ Test capacité insuffisante réussi');
    });

    it('doit récupérer les réservations de l\'utilisateur (200)', async () => {
        const res = await global.request
            .get('/api/reservations/my-reservations')
            .set('Authorization', `Bearer ${global.accessToken}`)
            .expect(200);

        expect(res.body.reservations).to.be.an('array');
        expect(res.body.reservations.length).to.be.greaterThan(0);
    });

    it('doit annuler une réservation (200)', async () => {
        const res = await global.request
            .patch(`/api/reservations/${reservationId}/cancel`)
            .set('Authorization', `Bearer ${global.accessToken}`)
            .expect(200);

        expect(res.body.reservation.statut).to.equal('annulée');
        console.log('✅ Réservation annulée avec succès');
    });

    it('doit vérifier la disponibilité d\'un restaurant (200)', async () => {
        const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        
        const res = await global.request
            .get(`/api/reservations/availability/${reservationData.restaurantId}?date=${tomorrow}`)
            .set('Authorization', `Bearer ${global.accessToken}`)
            .expect(200);

        expect(res.body.availability).to.have.property('disponible');
        expect(res.body.availability).to.have.property('places_restantes');
        console.log('✅ Disponibilité vérifiée avec succès');
    });

    after(async () => {
        await global.pgPool.query('TRUNCATE TABLE reservations RESTART IDENTITY CASCADE;');
        console.log('🗑️ Nettoyage final de la table "reservations"');
    });
});