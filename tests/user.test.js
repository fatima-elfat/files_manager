import { expect, use, should, request } from 'chai';
import chaiHttp from 'chai-http';
import sinon from 'sinon';
import { ObjectId } from 'mongodb';
import app from '../server';
import dbClient from '../utils/db';
import redisClient from '../utils/redis';

use(chaiHttp);
should();
describe('User testing', () => {
  const credentials = 'Basic Ym9iQGR5bGFuLmNvbTp0b3RvMTIzNCE=';
  let token = '';
  let userId = '';
  const user = {
    email: 'luffy.d.monkey@kyky.com',
    password: 'onepiece',
  };

  const tk = 'X-Token';
  const as = 'ASYNC';

  before(async () => {
    await redisClient.client.flushall(as);
    await dbClient.usersCollection.deleteMany({});
    await dbClient.filesCollection.deleteMany({});
  });

  after(async () => {
    await redisClient.client.flushall(as);
    await dbClient.usersCollection.deleteMany({});
    await dbClient.filesCollection.deleteMany({});
  });

  describe('POST /users', () => {
    it('creates user', async () => {
      const response = await request(app).post('/users').send(user);
      const body = JSON.parse(response.text);
      expect(body.email).to.equal(user.email);
      expect(body).to.have.property('id');
      expect(response.statusCode).to.equal(201);
      userId = body.id;
      const userMongo = await dbClient.usersCollection.findOne({
        _id: ObjectId(body.id),
      });
      expect(userMongo).to.exist;
    });

    it('email is missing', async () => {
      const user = {
        password: 'onepiece',
      };
      const response = await request(app).post('/users').send(user);
      const body = JSON.parse(response.text);
      expect(body).to.eql({ error: 'Missing email' });
      expect(response.statusCode).to.equal(400);
    });

    it('password is missing', async () => {
      const user = {
        email: 'luffy.d.monkey@kyky.com',
      };
      const response = await request(app).post('/users').send(user);
      const body = JSON.parse(response.text);
      expect(body).to.eql({ error: 'Missing password' });
      expect(response.statusCode).to.equal(400);
    });

    it('user already exists', async () => {
      const user = {
        email: 'luffy.d.monkey@kyky.com',
        password: 'onepiece',
      };
      const response = await request(app).post('/users').send(user);
      const body = JSON.parse(response.text);
      expect(body).to.eql({ error: 'Already exist' });
      expect(response.statusCode).to.equal(400);
    });
  });

  describe('GET /connect', () => {
    it('no users', async () => {
      const response = await request(app).get('/connect').send();
      const body = JSON.parse(response.text);
      expect(body).to.eql({ error: 'Unauthorized' });
      expect(response.statusCode).to.equal(401);
    });

    it('token already exists', async () => {
      const redisToken = await redisClient.get(`auth_${token}`);
      expect(redisToken).to.exist;
    });

  describe('GET /disconnect', () => {
    after(async () => {
      await redisClient.client.flushall(as);
    });

    it('token doesn t exist', async () => {
      const redisToken = await redisClient.get(`auth_${token}`);
      expect(redisToken).to.not.exist;
    });

    it('user with no token', async () => {
      const response = await request(app).get('/disconnect').send();
      const body = JSON.parse(response.text);
      expect(body).to.eql({ error: 'Unauthorized' });
      expect(response.statusCode).to.equal(401);
    });

    it('sign out', async () => {
      const response = await request(app)
        .get('/disconnect')
        .set(tk, token)
        .send();
      expect(response.text).to.be.equal('');
      expect(response.statusCode).to.equal(204);
    });
  });

  describe('GET /users/me', () => {
    before(async () => {
      const response = await request(app)
        .get('/connect')
        .set('Authorization', credentials)
        .send();
      const body = JSON.parse(response.text);
      token = body.token;
    });

    it('user from token', async () => {
      const response = await request(app)
        .get('/users/me')
        .set(tk, token)
        .send();
      const body = JSON.parse(response.text);
      expect(body).to.be.eql({ id: userId, email: user.email });
      expect(response.statusCode).to.equal(200);
    });
  });
});
});
