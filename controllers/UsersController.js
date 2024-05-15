/**
 * Task 3. Create a new user.
 */

import { ObjectId } from 'mongodb';
import Queue from 'bull';
import sha1 from 'sha1';
import redisClient from '../utils/redis';
import dbClient from '../utils/db';
const userQueue = new Queue('userQueue');

const userRedis = {

  async getUser(query) {
    const user = await dbClient.usersCollection.findOne(query);
    return user;
  },

  async getUserKI(request) {
    const tt = 'X-Token';
    const user = { userId: null, key: null };
    const tk = request.header(tt);
    if (!tk) return user;
    user.key = `auth_${tk}`;
    user.userId = await redisClient.get(user.key);
    return user;
  },
};
class UsersController {
  static async postNew(req, resp) {
    const { email, password } = req.body;
    if (!email) {
      return resp.status(400).send({ error: 'Missing email' });
    }
    if (!password) {
      return resp.status(400).send({ error: 'Missing password' });
    }
    const em = await dbClient.usersCollection.findOne({ email });
    const pwd = sha1(password);
    let result;
    if (em) {
      return resp.status(400).send({ error: 'Already exist' });
    }
    try {
      result = await dbClient.usersCollection.insertOne({
        email,
        password: pwd,
      });
    } catch (err) {
      await userQueue.add({});
      return resp.status(500).send({ error: 'Error creating user' });
    }
    const user = { id: result.insertedId, email };
    await userQueue.add({
      userId: result.insertedId.toString(),
    });
    return resp.status(201).send(user);
  }

  /**
   * Retrieve the user based on the token:
   * If not found, return an error Unauthorized with a status code 401
   * Otherwise, return the user object (email and id only)
   * @param {*} request
   * @param {*} response
   * @returns
   */
  static async getMe(request, response) {
    const { id } = await userRedis.getUserKI(request);
    const user = await userRedis.getUser({
      theId: ObjectId(id),
    });

    if (!user) {
      return response.status(401).send({ error: 'Unauthorized' });
    }
    const userR = { id: user.theId, ...user };
    delete userR._id;
    delete userR.password;
    return response.status(200).send(userR);
  }
}

export default UsersController;
