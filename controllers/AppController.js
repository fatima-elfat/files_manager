/**
 * Task 2. First API.
 * contains the definition of the 2 endpoints.
 */

import dbClient from '../utils/db';
import redisClient from '../utils/redis';

class AppController {
  /**
   * GET /status should return if Redis is alive and if the
   * DB is alive too by using the 2 utils created previously:
   * { "redis": true, "db": true } with a status code 200.
   * @param {request} request
   * @param {response} response
   */
  static getStatus(request, response) {
    const status = {
      db: dbClient.isAlive(),
      redis: redisClient.isAlive(),
    };
    response.status(200).send(status);
  }

  /**
   * GET /stats should return the number of users and files in DB:
   * { "users": 12, "files": 1231 } with a status code 200
   * @param {request} request
   * @param {response} response
   */
  static async getStats(request, response) {
    // users collection must be used for counting all users
    // files collection must be used for counting all files
    const stats = {
      users: await dbClient.nbUsers(),
      files: await dbClient.nbFiles(),
    };
    response.status(200).send(stats);
  }
}

export default AppController;
