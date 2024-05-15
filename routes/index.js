/**
 * Task 3. Create a new user.
 */

import express from 'express';
import UsersController from '../controllers/UsersController';

function controllerRouting(app) {
  const router = express.Router();
  app.use('/', router);
  /**
   * Task 3. Create a new user.
   * POST /users => UsersController.postNew
   */
  router.post('/users', (req, res) => {
    UsersController.addUser(req, res);
  });
}

export default controllerRouting;
