// 🚀 tests/1_user.test.js
const { expect } = require('chai');

const loginClient = { email: '', password: 'Password1' };
const loginAdmin = { email: '', password: 'Password2' };

let initialAccessToken = '';
let initialRefreshToken = '';
let userId = null;
let adminToken = '';

describe('🚀 Tests d\'Intégration: Authentification Utilisateur', () => {

    before(async () => {
        console.log('🧹 Nettoyage de la table "users"...');
        await global.pgPool.query('TRUNCATE TABLE users RESTART IDENTITY CASCADE;');
        console.log('✅ Table "users" propre.');

        // Génération d'e-mails uniques
        loginClient.email = `client_${Date.now()}@yopmail.com`;
        loginAdmin.email = `admin_${Date.now()}@yopmail.com`;

        // Création d'un Admin
        const res = await global.request
            .post('/api/users/register')
            .send({ ...loginAdmin, nom: 'AdminTest' })
            .expect(201);

        // Promotion en admin
        await global.pgPool.query('UPDATE users SET role = $1 WHERE email = $2', ['Admin', loginAdmin.email]);
        console.log('👑 Admin créé.');

        // Connexion Admin → récup token
        const adminLoginRes = await global.request
            .post('/api/users/login')
            .send(loginAdmin)
            .expect(200);

        adminToken = adminLoginRes.body.accessToken;
        global.adminToken = adminToken;
    });

    it('inscription client → doit retourner tokens + user', async () => {
        const res = await global.request
            .post('/api/users/register')
            .send({ ...loginClient, nom: 'ClientTest' })
            .expect(201);

        expect(res.body.user).to.include.keys('id', 'email', 'role');
        expect(res.body.accessToken).to.be.a('string').that.is.not.empty;
        expect(res.body.refreshToken).to.be.a('string').that.is.not.empty;
        expect(res.body.user.role).to.equal('Client');

        initialAccessToken = res.body.accessToken;
        initialRefreshToken = res.body.refreshToken;
        userId = res.body.user.id;

        global.accessToken = initialAccessToken;
        console.log(`✅ Client créé : ${res.body.user.email}`);
    });

    it('doit refuser un mot de passe non conforme (400)', async () => {
        await global.request
            .post('/api/users/register')
            .send({ email: 'bad@user.com', password: 'court', nom: 'CourtNom' })
            .expect(400);
    });

    it('connexion client → doit retourner un nouveau token', async () => {
        const res = await global.request
            .post('/api/users/login')
            .send(loginClient)
            .expect(200);

        const newAccessToken = res.body.accessToken;
        expect(newAccessToken).to.be.a('string').that.is.not.empty;
        expect(newAccessToken).to.not.equal(initialAccessToken);

        global.accessToken = newAccessToken;
        console.log('🔐 Connexion client réussie.');
    });

    it('doit refuser une connexion avec mauvais mot de passe (401)', async () => {
        // ⏱️ Attendre pour éviter le rate limit
        await new Promise(resolve => setTimeout(resolve, 2000));

        await global.request
            .post('/api/users/login')
            .send({ email: loginClient.email, password: 'fauxmotdepasse' })
            .expect(401);
    });

    it('doit refuser l\'accès sans token (401)', async () => {
        await global.request.get('/api/users').expect(401);
    });

    it('doit refuser si rôle != Admin (403)', async () => {
        await global.request
            .get('/api/users')
            .set('Authorization', `Bearer ${global.accessToken}`)
            .expect(403);
    });

    it('doit autoriser un Admin (200)', async () => {
        const res = await global.request
            .get('/api/users')
            .set('Authorization', `Bearer ${global.adminToken}`)
            .expect(200);

        expect(res.body.users).to.be.an('array').that.is.not.empty;
        console.log('✅ Accès Admin confirmé.');
    });

    after(async () => {
        console.log('✅ Tests utilisateurs terminés.');
    });
});