const session = require('express-session');
const MySQLStore = require('express-mysql-session')(session);
const db = require('./database');

const sessionStoreOptions = {
    expiration: 21600000, // 6 hours in milliseconds
    createDatabaseTable: true,
    schema: {
        tableName: 'sessions',
        columnNames: {
            session_id: 'session_id',
            expires: 'expires',
            data: 'data'
        }
    }
};

const sessionStore = new MySQLStore(sessionStoreOptions, db);

const sessionMiddleware = session({
    secret: 'yashi',
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 6 * 60 * 60 * 1000 // 6 hours in milliseconds
    }
});

module.exports = {
    sessionStore,
    sessionMiddleware
};