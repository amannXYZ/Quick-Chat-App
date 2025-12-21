const mongoose = require('mongoose');

// prefer CONN_STRING env, fall back to MONGO_URI if set
const CONN_STRING = process.env.CONN_STRING || process.env.MONGO_URI;

if (!CONN_STRING || typeof CONN_STRING !== 'string') {
    console.error('Missing MongoDB connection string. Set CONN_STRING in config.env');
    process.exit(1);
}

// connect to mongodb database
mongoose
    .connect(CONN_STRING, {
    })
    .then(() => {
        console.log('DB connection successful');
    })
    .catch((err) => {
        console.error('DB connection failed:', err && err.message ? err.message : err);
        process.exit(1);
    });

// connection state (still useful for events)
const db = mongoose.connection;
db.on('error', (err) => {
    console.error('db connection error', err);
});

module.exports = db;