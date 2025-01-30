const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const logger = require('./emitter/logger');

// Connect to SQLite database (or create it if it doesn't exist)
const db = new sqlite3.Database(path.join(__dirname, 'data', 'shrinklink.db'), (err) => {
    if (err) {
        logger.log('ERROR', `Database connection error: ${err.message}`);
    } else {
        logger.log('INFO', 'Connected to SQLite database.');
    }
});

// Create the "links" table if it doesn't exist
db.serialize(() => {
    db.run(`
        CREATE TABLE IF NOT EXISTS links (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            code TEXT UNIQUE NOT NULL,
            long_url TEXT NOT NULL
        )
    `);
});

// Add a new link to the database
const addLink = (code, longUrl, callback) => {
    db.run(`INSERT INTO links (code, long_url) VALUES (?, ?)`, [code, longUrl], (err) => {
        if (err) {
            logger.log('ERROR', `Failed to insert URL ${longUrl}: ${err.message}`);
        } else {
            logger.log('DB_WRITE', `New short URL created: ${code} -> ${longUrl}`);
        }
        callback(err);
    });
};

// Get the long URL
const getLink = (code, callback) => {
    db.get(`SELECT long_url FROM links WHERE code = ?`, [code], (err, row) => {
        if (err) {
            logger.log('ERROR', `Database read error: ${err.message}`);
        } else if (row) {
            logger.log('DB_READ', `Fetched URL for ${code}: ${row.long_url}`);
        } else {
            logger.log('DB_READ', `No record found for ${code}`);
        }
        callback(err, row ? row.long_url : null);
    });
};

module.exports = { addLink, getLink };
