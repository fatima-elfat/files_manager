/**
 * Task 3. Create a new user.
 */

import express from 'express';
import AppController from '../controllers/AppController';
import AuthController from '../controllers/AuthController';
import FilesController from '../controllers/FilesController';
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

  /**
   * Task 5. First file.
   * POST /files => FilesController.postUpload
   */
  router.post('/files', (req, res) => {
    FilesController.postUpload(req, res);
  });

  /**
   * Task 6. Get and list file.
   * GET /files/:id => FilesController.getShow
   */
  router.get('/files/:id', (req, res) => {
    FilesController.getShow(req, res);
  });

  /**
   * Task 6. Get and list file.
   * GET /files => FilesController.getIndex
   */
  router.get('/files', (req, res) => {
    FilesController.getIndex(req, res);
  });

  /**
   * Task 7. File publish/unpublish.
   * PUT /files/:id/publish => FilesController.putPublish
   */
  router.put('/files/:id/publish', (req, res) => {
    FilesController.putPublish(req, res);
  });

  /**
   * Task 7. File publish/unpublish.
   * PUT /files/:id/publish => FilesController.putUnpublish
   */
  router.put('/files/:id/unpublish', (req, res) => {
    FilesController.putUnpublish(req, res);
  });

  /**
   * Task 8. File data.
   * GET /files/:id/data => FilesController.getFile
   */
  router.get('/files/:id/data', (req, res) => {
    FilesController.getFile(req, res);
  });
}

export default controllerRouting;
