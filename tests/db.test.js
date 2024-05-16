import { expect, use, should } from 'chai';
import chaiHttp from 'chai-http';
import dbClient from '../utils/db';

use(chaiHttp);
should();

describe('Testing db', () => {
  describe('db Client', () => {
    before(async () => {
      await dbClient.usersCollection.deleteMany({});
      await dbClient.filesCollection.deleteMany({});
    });
    after(async () => {
      await dbClient.usersCollection.deleteMany({});
      await dbClient.filesCollection.deleteMany({});
    });

    it('is alive', () => {
      expect(dbClient.isAlive()).to.equal(true);
    });

    it('shows number of user documents', async () => {
      await dbClient.usersCollection.deleteMany({});
      expect(await dbClient.nbUsers()).to.equal(0);
      await dbClient.usersCollection.insertOne({ name: 'tonna' });
      await dbClient.usersCollection.insertOne({ name: 'kyle' });
      await dbClient.usersCollection.insertOne({ name: 'jimmy' });
      expect(await dbClient.nbUsers()).to.equal(3);
    });

    it('shows number of file documents', async () => {
      await dbClient.filesCollection.deleteMany({});
      expect(await dbClient.nbFiles()).to.equal(0);
      await dbClient.filesCollection.insertOne({ name: 'mle.txt' });
      expect(await dbClient.nbUsers()).to.equal(1);
    });
  });
});
