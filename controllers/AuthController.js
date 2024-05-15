/**
 * Task 4. Authenticate a user.
 * AuthController.js that contains new endpoints.
 */
import sha1 from 'sha1';
import redisClient from '../utils/redis';
import { v4 as uuidv4 } from 'uuid';
import userUtils from '../utils/user';

class AuthController {
  /**
   * should sign-in the user by generating a new authentication token:
   * By using the header Authorization and the technique of the Basic auth
   * (Base64 of the <email>:<password>), find the user associate to this email and with
   * this password (reminder: we are storing the SHA1 of the password)
   * If no user has been found, return an error Unauthorized with a status code 401
   * Otherwise:
   * Generate a random string (using uuidv4) as token
   * Create a key: auth_<token>
   * Use this key for storing in Redis (by using the redisClient create previously)
   * the user ID for 24 hours
   * Return this token: { "token": "155342df-2399-41da-9e8c-458b6ac52a0c" }
   * with a status code 200
   * @param {request} request
   * @param {response} response
   * @returns 
   */
  static async getConnect(request, response) {
    const Authorization = request.header('Authorization') || '';
    const pwd = Authorization.split(' ')[1];

    if (!pwd) {
      return response.status(401).send({ error: 'Unauthorized' });
    }
    const pwdDecoded = Buffer.from(pwd, 'base64').toString(
      'utf-8'
    );
    const [email, password] = pwdDecoded.split(':');
    if (!email || !password) {
      return response.status(401).send({ error: 'Unauthorized' });
    }
    const pwdSha = sha1(password);
    const user = await userUtils.getUser({
      email,
      password: pwdSha,
    });
    const exp = 24 * 3600;
    const au = uuidv4();
    const key = `auth_${au}`;
    if (!user) {
        return response.status(401).send({ error: 'Unauthorized' });
    }
    await redisClient.set(key, user._id.toString(), exp);
    return response.status(200).send({ token });
  }

  /**
   * sign-out the user based on the token:
   * Retrieve the user based on the token:
   * If not found, return an error Unauthorized with
   * a status code 401
   * Otherwise, delete the token in Redis and
   * return nothing with a status code 204
   * @param {request} request
   * @param {response} response
   * @returns 
   */
  static async getDisconnect(request, response) {
    const { userId, key } = await userUtils.getUserIdAndKey(request);
    if (!userId) {
      return response.status(401).send({ error: 'Unauthorized' });
    }
    await redisClient.del(key);
    return response.status(204).send();
  }
}

export default AuthController;
