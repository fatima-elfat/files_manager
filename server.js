import express from 'express';
import controllerRouting from './routes/index';

/**
 * Task 2. First API.
 * create the Express server
 */

const app = express();
//  listen on the port set by the
//  environment variable PORT or by default 5000
const ENV_PORT = process.env.PORT || 5000;
app.use(express.json());
//  load all routes from the file routes/index.js.
controllerRouting(app);
app.listen(ENV_PORT, () => {
  console.log(`Server running on port ${ENV_PORT}`);
});

export default app;
