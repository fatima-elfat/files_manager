import { expect, use, should, request } from 'chai';
import chaiHttp from 'chai-http';
import { exec } from 'child_process';
import app from '../server';
import dbClient from '../utils/db';
import redisClient from '../utils/redis';

use(chaiHttp);
should();

describe('File testing', () => {
  const credentials = 'Basic Ym9iQGR5bGFuLmNvbTp0b3RvMTIzNCE=';
  let token = '';
  const tk = 'X-Token';
  const as = 'ASYNC';

  const user = {
    email: 'luffy.d.monkey@kyky.com',
    password: 'onepiece',
  };

  before(async () => {
    await redisClient.client.flushall(as);
    await dbClient.usersCollection.deleteMany({});
    await dbClient.filesCollection.deleteMany({});

    let response, body;

    response = await request(app).post('/users').send(user);
    body = JSON.parse(response.text);

    userId = body.id;

    response = await request(app)
      .get('/connect')
      .set('Authorization', credentials)
      .send();
    body = JSON.parse(response.text);

    token = body.token;
  });

  after(async () => {
    await redisClient.client.flushall(as);
    await dbClient.usersCollection.deleteMany({});
    await dbClient.filesCollection.deleteMany({});
    exec('rm -rf /tmp/files_manager', (error, stdout, stderr) => {
      if (error) {
        return;
      }
      if (stderr) {
        return;
      }
    });
  });

  describe('POST /files', () => {
    it('token missing', async () => {
      const infoF = {
        name: 'onepiece1010.vlc',
        type: 'video',
        data: 'drJTBGDQ==',
      };
      const response = await request(app).post('/files').send(infoF);
      const body = JSON.parse(response.text);
      expect(body).to.eql({ error: 'Unauthorized' });
      expect(response.statusCode).to.equal(401);
    });

    it('name missing', async () => {
      const infoF = {
        type: 'video',
        data: 'drJTBGDQ==',
      };

      const response = await request(app)
        .post('/files')
        .set(tk, token)
        .send(infoF);

      const body = JSON.parse(response.text);

      expect(body).to.eql({ error: 'Missing name' });
      expect(response.statusCode).to.equal(400);
    });

    it('type missing', async () => {
      const infoF = {
        name: 'onepiece1010.vlc',
        data: 'drJTBGDQ==',
      };

      const response = await request(app)
        .post('/files')
        .set(tk, token)
        .send(infoF);
      const body = JSON.parse(response.text);
      expect(body).to.eql({ error: 'Missing type' });
      expect(response.statusCode).to.equal(400);
    });

    it('type wrong', async () => {
      const infoF = {
        name: 'onepiece1010.vlc',
        type: 'r',
        data: 'drJTBGDQ==',
      };

      const response = await request(app)
        .post('/files')
        .set(tk, token)
        .send(infoF);
      const body = JSON.parse(response.text);
      expect(body).to.eql({ error: 'Missing type' });
      expect(response.statusCode).to.equal(400);
    });
  });
});
