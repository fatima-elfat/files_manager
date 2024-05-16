import { expect, use, should } from 'chai';
import chaiHttp from 'chai-http';
import { promisify } from 'util';
import dbClient from '../utils/db';
import redisClient from '../utils/redis';

use(chaiHttp);
should();

describe('Testing redis', () => {
  describe('redis', () => {
    before(async () => {
      await redisClient.client.flushall('ASYNC');
    });

    after(async () => {
      await redisClient.client.flushall('ASYNC');
    });

    it('is alive', async () => {
      expect(redisClient.isAlive()).to.equal(true);
    });

    it('key does not exist', async () => {
      expect(await redisClient.get('kiki')).to.equal(null);
    });

    it('key is called', async () => {
      expect(await redisClient.set('kiki', 10, 2)).to.equal(undefined);
    });

    it('keyexpired', async () => {
      const timeout = promisify(setTimeout);
      await timeout(2300);
      expect(await redisClient.get('kiki')).to.equal(null);
    });
  });
});