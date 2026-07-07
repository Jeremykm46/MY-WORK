require('dotenv').config();
const { mongoose, connect } = require('../config/database');
const models = require('../models');

(async () => {
  console.log('⏳ Connecting to MongoDB...');
  await connect();

  console.log('⏳ Building indexes...');
  await Promise.all(Object.values(models).map((model) => model.init()));

  console.log('✅ Migration complete — collections and indexes are ready.');
  await mongoose.connection.close();
})().catch((err) => {
  console.error('Migration failed:', err.message);
  process.exit(1);
});
