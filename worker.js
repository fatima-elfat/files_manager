
import { promises as fs } from 'fs';
import DBClient from './utils/db';
import Queue from 'bull';
import { ObjectId } from 'mongodb';

const imageThumbnail = require('image-thumbnail');

const fileQueue = new Queue('fileQueue');
const userQueue = new Queue('userQueue');
// generate thumbnails with
const generateThumbnail = async (path, options) => {
  try {
    const th = await imageThumbnail(path, options);
    const pathTh = `${path}_${options.width}`;
    await fs.writeFileSync(pathTh, th);
  } catch (error) {
    console.log(error);
  }
};
// Task 9. Image Thumbnails
fileQueue.process(async (job) => {
  const { fileId } = job.data;
  if (!fileId) throw Error('Missing fileId');
  const { userId } = job.data;
  if (!userId) throw Error('Missing userId');
  const doc = await DBClient.db.collection('files').findOne({ _id: ObjectId(fileId), userId: ObjectId(userId) });
  if (!doc) throw Error('File not found');
  // By using the module image-thumbnail, generate 3 thumbnails
  // with width = 500, 250 and 100 - store each result on the
  // same location of the original file by appending _<width size>
  generateThumbnail(doc.localPath, { width: 500 });
  generateThumbnail(doc.localPath, { width: 250 });
  generateThumbnail(doc.localPath, { width: 100 });
});
// Task 11. New user - welcome email
userQueue.process(async (job) => {
  const { userId } = job.data;
  if (!userId) throw Error('Missing userId');
  const doc = await DBClient.db.collection('users').findOne({ _id: ObjectId(userId) });
  if (!doc) throw Error('User not found');

  console.log(`Welcome ${doc.email}`);
});
