import { expect, use, should, request } from 'chai';
import chaiHttp from 'chai-http';
import app from '../server';
import dbClient from '../utils/db';

use(chaiHttp);
should();

describe('App testing', () => {
  describe('GET /status', () => {
    it('get status', async () => {
      const response = await request(app).get('/status').send();
      const body = JSON.parse(response.text);
      expect(body).to.eql({ redis: true, db: true });
      expect(response.statusCode).to.equal(200);
    });
  });

  describe('GET /stats', () => {
    before(async () => {
      await dbClient.usersCollection.deleteMany({});
      await dbClient.filesCollection.deleteMany({});
    });

    it('Zero files', async () => {
      const response = await request(app).get('/stats').send();
      const body = JSON.parse(response.text);
      expect(body).to.eql({ users: 0, files: 0 });
      expect(response.statusCode).to.equal(200);
    });

    it('Two users Three files', async () => {
      await dbClient.usersCollection.insertOne({ name: 'Jimmy' });
      await dbClient.filesCollection.insertOne({ name: 'onepiece1010.mp4' });
      await dbClient.filesCollection.insertOne({ name: 'onepiece1011.mp4' });
      await dbClient.usersCollection.insertOne({ name: 'Bob' });
      await dbClient.filesCollection.insertOne({ name: 'onepiece1012.mp4' });
      const response = await request(app).get('/stats').send();
      const body = JSON.parse(response.text);
      expect(body).to.eql({ users: 2, files: 3 });
      expect(response.statusCode).to.equal(200);
    });
  });
});
