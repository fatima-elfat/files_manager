/**
 * Task 5. First file.
 */

import { ObjectId } from 'mongodb';
import { v4 as uuidv4 } from 'uuid';

import Queue from 'bull';
import { promises as pr } from 'fs';
import dbClient from '../utils/db';
import redisClient from '../utils/redis';

/**
 * The relative path of this folder is given by the environment
 * variable folderP
 * If this variable is not present or empty,
 * use /tmp/files_manager as storing folder path
 */
const fileQueue = new Queue('fileQueue');
const folderP = process.env.folderP || '/tmp/files_manager';
const validU = {
  okId(id) {
    try {
      ObjectId(id);
    } catch (err) {
      return false;
    }
    return true;
  },
};
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
const bodyU = {
  async validateB(request) {
    const {
      name, type, isPublic = false, data,
    } = request.body;
    const typesAllowed = ['file', 'image', 'folder'];
    let { parentId = 0 } = request.body;
    let msg = null;
    if (parentId === '0') {
      parentId = 0;
    }
    if (!name) {
      msg = 'Missing name';
    } else if (!type || !typesAllowed.includes(type)) {
      msg = 'Missing type';
    } else if (!data && type !== 'folder') {
      msg = 'Missing data';
    } else if (parentId && parentId !== '0') {
      let file;
      if (validU.okId(parentId)) {
        file = await this.getFile({
          _id: ObjectId(parentId),
        });
      } else {
        file = null;
      }
      if (!file) {
        msg = 'Parent not found';
      } else if (file.type !== 'folder') {
        msg = 'Parent is not a folder';
      }
    }
    const rr = {
      error: msg,
      fileP: {
        name,
        type,
        parentId,
        isPublic,
        data,
      },
    };

    return rr;
  },
};
const fileyU = {
  async getFile(query) {
    const file = await dbClient.filesCollection.findOne(query);
    return file;
  },

  async saveFile(userId, fileP, folderP) {
    const {
      name, type, isPublic, data,
    } = fileP;
    let { parentId } = fileP;
    if (parentId !== 0) parentId = ObjectId(parentId);
    const query = {
      userId: ObjectId(userId),
      name,
      type,
      isPublic,
      parentId,
    };
    if (fileP.type !== 'folder') {
      const uuidF = uuidv4();
      const decodedF = Buffer.from(data, 'base64');
      const path = `${folderP}/${uuidF}`;
      query.localPath = path;

      try {
        await pr.mkdir(folderP, { recursive: true });
        await pr.writeFile(path, decodedF);
      } catch (err) {
        return { error: err.message, code: 400 };
      }
    }
    const result = await dbClient.filesCollection.insertOne(query);
    const file = this.processFile(query);
    const fileA = { id: result.insertedId, ...file };
    return { error: null, fileA };
  },

  async updateFile(query, set) {
    const upd = await dbClient.filesCollection.findOneAndUpdate(
      query,
      set,
      { returnOriginal: false },
    );
    return upd;
  },

  processFile(file) {
    const ff = { id: file._id, ...file };
    delete ff.localPath;
    delete ff._id;
    return ff;
  },

  async getFileP(query) {
    const fileList = await dbClient.filesCollection.aggregate(query);
    return fileList;
  },
};

class FilesController {
  /**
   * POST /files should create a new file in DB and in disk
   * @param {*} request
   * @param {*} response
   * @returns
   */
  static async postUpload(request, response) {
    //  Retrieve the user based on the token.
    const { userId } = await userRedis.getUserKI(request);
    // If not found, return an error Unauthorized with a status code 401
    if (!validU.okId(userId)) {
      return response.status(401).send({ error: 'Unauthorized' });
    }
    if (!userId && request.body.type === 'image') {
      await fileQueue.add({});
    }
    const user = await userRedis.getUser({
      _id: ObjectId(userId),
    });
    if (!user) {
      return response.status(401).send({ error: 'Unauthorized' });
    }
    const { error: validationError, fileP } = await bodyU.validateB(
      request,
    );
    if (validationError) {
      return response.status(400).send({ error: validationError });
    }
    if (fileP.parentId !== 0 && !validU.okId(fileP.parentId)) {
      return response.status(400).send({ error: 'Parent not found' });
    }
    const { error, code, fil } = await fileyU.saveFile(
      userId, fileP, folderP,
    );
    if (error) {
      if (response.body.type === 'image') await fileQueue.add({ userId });
      return response.status(code).send(error);
    }

    if (fileP.type === 'image') {
      await fileQueue.add({
        fileId: fil.id.toString(),
        userId: fil.userId.toString(),
      });
    }
    return response.status(201).send(fil);
  }

  /**
   * Retrieve the user based on the token:
   * If not found, return an error Unauthorized with
   * a status code 401
   * If no file document is linked to the user and the
   * ID passed as parameter, return an error Not
   * found with a status code 404
   * Otherwise, return the file document
   * @param {*} request
   * @param {*} response
   * @returns
   */
  static async getShow(request, response) {
    const fileId = request.params.id;
    const { userId } = await userRedis.getUserKI(request);
    const user = await userRedis.getUser({
      _id: ObjectId(userId),
    });
    if (!user) {
      return response.status(401).send({ error: 'Unauthorized' });
    }
    if (!bodyU.okId(fileId) || !bodyU.okId(userId)) {
      return response.status(404).send({ error: 'Not found' });
    }
    const result = await fileyU.getFile({
      _id: ObjectId(fileId),
      userId: ObjectId(userId),
    });

    if (!result) {
      return response.status(404).send({ error: 'Not found' });
    }
    const file = fileyU.processFile(result);
    return response.status(200).send(file);
  }

  /**
   * Task 6. Get and list file.
   * Retrieve the user based on the token:
   * If not found, return an error Unauthorized with a status code 401
   * Based on the query parameters parentId and page,
   * return the list of file document parentId
   */
  static async getIndex(request, response) {
    const { userId } = await userRedis.getUserKI(request);
    const user = await userRedis.getUser({
      _id: ObjectId(userId),
    });
    if (!user) {
      return response.status(401).send({ error: 'Unauthorized' });
    }
    let parentId = request.query.parentId || '0';
    if (parentId === '0') parentId = 0;
    let page = Number(request.query.page) || 0;
    if (Number.isNaN(page)) page = 0;
    if (parentId !== 0 && parentId !== '0') {
      if (!bodyU.okId(parentId))
        return response.status(401).send({ error: 'Unauthorized' });
      parentId = ObjectId(parentId);
      const folder = await fileyU.getFile({
        _id: ObjectId(parentId),
      });
      if (!folder || folder.type !== 'folder')
        return response.status(200).send([]);
    }
    const pp = [
      { $match: { parentId } },
      { $skip: page * 20 },
      { $limit: 20, },
    ];
    const cursor = await fileyU.getFileP(pp);
    const fileL = [];
    await cursor.forEach((doc) => {
      const document = fileyU.processFile(doc);
      fileL.push(document);
    });
    return response.status(200).send(fileL);
  }
}

export default FilesController;
