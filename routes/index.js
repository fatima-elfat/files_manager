/**
 * Task 3. Create a new user.
 */

import express from 'express';
import AppController from '../controllers/AppController';
import AuthController from '../controllers/AuthController';
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
   * Task 4. Authenticate a user.
   * GET /users/me => UserController.getMe
   */
  router.get('/users/me', (req, res) => {
    UsersController.getMe(req, res);
  });

  /**
   * Task 3. Create a new user.
   * POST /users => UsersController.postNew
   */
  router.post('/users', (req, res) => {
    UsersController.postNew(req, res);
  });

  /**
   * Task 4. Authenticate a user.
   * GET /connect => AuthController.getConnect
   */
  router.get('/connect', (req, res) => {
    AuthController.getConnect(req, res);
  });

  /**
   * Task 4. Authenticate a user.
   * GET /disconnect => AuthController.getDisconnect
   */
  router.get('/disconnect', (req, res) => {
    AuthController.getDisconnect(req, res);
  });
}

export default controllerRouting;
