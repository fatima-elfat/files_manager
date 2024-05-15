/**
 * Task 0. Redis utils.
 * Inside the folder utils , create a file redis.js that
 * contains the class RedisClient .
 */
import redis from 'redis';
import { promisify } from 'util';

class RedisClient {
  /**
   * the constructor that creates a client to Redis:
   * any error of the redis client must be displayed in
   * the console (you should use on('error') of the redis client)
   */
  constructor() {
    this.client = redis.createClient();
   this.getAsync = promisify(this.client.get).bind(this.client);
   this.client.on('error', (err) => {
      console.log(`Redis client not connected to the server: ${err.message}`);
    });
  }

  /**
  * function isAlive that returns true when the connection
  * to Redis is a success otherwise, false
   * @returns boolran.
   */
  isAlive() {
    return this.client.connected;
  }

  /**
   * an asynchronous function get that takes a string key as argument
   * @param {string} key
   * @returns the Redis value stored for this key
   */
  async get(key) {
    const redisVal = await this.getAsync(key);
    return redisVal;
  }

  /**
   * an asynchronous function set that takes a string key,
   * a value and a duration in second as arguments to store it
   * in Redis (with an expiration set by the duration argument)
   * @param {string} key
   * @param {string} value
   * @param {*} duration
   */
  async set(key, value, duration) {
    this.client.setex(key, duration, value);
  }

  /**
   * an asynchronous function del that takes a string key as
   * argument and remove the value in Redis for this key
   * @param {string} key
   */
  async del(key) {
    this.client.del(key);
  }
}

/**
 * After the class definition, create and export
 * an instance of RedisClient called redisClient .
 */
const redisClient = new RedisClient();
export default redisClient;
