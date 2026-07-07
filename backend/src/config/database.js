const mongoose = require('mongoose');
const logger = require('../utils/logger');

mongoose.set('strictQuery', true);

const getUri = () => process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/School_attendance';

const connect = async () => {
  if (mongoose.connection.readyState === 1) return mongoose.connection;
  await mongoose.connect(getUri());
  return mongoose.connection;
};

const testConnection = async () => {
  await connect();
  logger.info('✅ MongoDB connected successfully');
};

let transactionsSupported = null;

/** Only replica sets / mongos report a replica set name in `hello` — a standalone mongod never does. */
const supportsTransactions = async () => {
  if (transactionsSupported !== null) return transactionsSupported;
  await connect();
  const info = await mongoose.connection.db.admin().command({ hello: 1 });
  transactionsSupported = !!info.setName;
  return transactionsSupported;
};

/**
 * Run `fn(session)` inside a transaction. Falls back to a plain (non-atomic)
 * call when the server is a standalone mongod (the default for a local
 * install) since multi-document transactions require a replica set.
 */
const withTransaction = async (fn) => {
  if (!(await supportsTransactions())) return fn(null);

  const session = await mongoose.startSession();
  try {
    session.startTransaction();
    const result = await fn(session);
    await session.commitTransaction();
    return result;
  } catch (err) {
    try {
      await session.abortTransaction();
    } catch {
      // no transaction was actually started — nothing to abort
    }
    throw err;
  } finally {
    session.endSession();
  }
};

module.exports = { mongoose, connect, testConnection, withTransaction };
