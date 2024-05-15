/**
 * Task 3. Create a new user.
 */

import express from 'express';
import UsersController from '../controllers/UsersController';

function controllerRouting(app) {
  const router = express.Router();
  app.use('/', router);
  /**
   * Task 2. First API.
   * GET /status => AppController.getStatus
   */
  router.get('/status', (req, res) => {
    AppController.getStatus(req, res);
  });

  /**
   * Task 2. First API.
   * GET /stats => AppController.getStats
   */
  router.get('/stats', (req, res) => {
    AppController.getStats(req, res);
  });

  /**
   * Task 3. Create a new user.
   * POST /users => UsersController.postNew
   */
  router.post('/users', (req, res) => {
    UsersController.addUser(req, res);
  });
}

export default controllerRouting;
