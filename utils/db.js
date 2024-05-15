/**
 * Task 1. MongoDB utils
 * Inside the folder utils , create a file db.js that contains the class DBClient .
*/
import { MongoClient } from 'mongodb';
// host: from the environment variable DB_HOST or default: localhost
const DB_HOST = process.env.DB_HOST || 'localhost';
// port: from the environment variable DB_PORT or default: 27017
const DB_PORT = process.env.DB_PORT || 27017;
// database: from the environment variable DB_DATABASE or default: files_manager
const DB_DATABASE = process.env.DB_DATABASE || 'files_manager';
const DB_URL = `mongodb:// ${DB_HOST}:${DB_PORT}`;

class DBClient {
  /**
   * the constructor that creates a client to MongoDB.
   */
  constructor() {
    MongoClient.connect(
      DB_URL,
      { useUnifiedTopology: true },
      (error, client) => {
        if (!error) {
          this.db = client.db(DB_DATABASE);
          this.filesCollection = this.db.collection('files');
          this.usersCollection = this.db.collection('users');
        } else {
          console.log(error.message);
        this.db = false;
        }
      }
    );
  }

  /**
   * a function isAlive that returns true
   * when the connection to MongoDB is a success otherwise, false
   * @returns {boolean}
   */
  isAlive() {
    return !!this.db;
  }

  /**
   * an asynchronous function
   * nbUsers that returns the number
   * of documents in the collection users
   * @return {number}
   */
  async nbUsers() {
    const nbrUsers = this.usersCollection.countDocuments();
    return nbrUsers;
  }

  /**
   * an asynchronous function nbFiles that
   * returns the number of documents in the collection files
   * @return {number}
   */
  async nbFiles() {
    const nbrFiles = this.filesCollection.countDocuments();
    return nbrFiles;
  }
}

// After the class definition, create and export an instance of DBClient called dbClient .
const dbClient = new DBClient();
export default dbClient;
