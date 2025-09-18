const mongoose = require('mongoose');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/cv';

mongoose
  .connect(MONGO_URI)
  .then(() => console.log('Connected to DB'))
  .catch((err) => console.log('DB connection error:', err));

module.exports = mongoose;
