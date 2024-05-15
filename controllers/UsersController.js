/**
 * Task 3. Create a new user.
 */

import dbClient from '../utils/db';
import Queue from 'bull';
import sha1 from 'sha1';

const userQueue = new Queue('userQueue');

class UsersController {
  const addUser = async (req, resp) => {
    const { email, password } = req.body;
  
    if (!email)
      return resp.status(400).send({ error: 'Missing email' });
    if (!password)
      return resp.status(400).send({ error: 'Missing password' });
    const em = await dbClient.usersCollection.findOne({ email });
    const pwd = sha1(password);
    let result;
    if (em)
      return resp.status(400).send({ error: 'Already exist' });
    try {
      result = await dbClient.usersCollection.insertOne({
      email,
      password: pwd,
    });} catch (err) {
      await userQueue.add({});
      return resp.status(500).send({ error: 'Error creating user' });
    }
  
    const user = { id: result.insertedId, email };
    await userQueue.add({
      userId: result.insertedId.toString(),
    });
    return resp.status(201).send(user);
    }
}

module.exports = {
  addUser,
};
