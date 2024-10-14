const express = require('express');
const cors = require('cors');
const session = require('express-session');
const cookieParser = require('cookie-parser');
require('dotenv').config();
const MySQLStore = require('express-mysql-session')(session);
const config = require('./config');
const { Sequelize } = require('sequelize');

// Import your routes
const authRoutes = require('./routes/authRoutes');
const clientRoutes = require('./routes/clientRoutes');
const serviceRoutes = require('./routes/serviceRoutes');
const packageRoutes = require('./routes/packageRoutes');
const clientSpocRoutes = require('./routes/clientSpocRoutes');
const escalationmanagerRoutes = require('./routes/escalationmanagerRoutes');
const billingspocRoutes = require('./routes/billingspocRoutes');
const billingescalationRoutes = require('./routes/billingescalationRoutes');
const authorizeddetailsRoutes = require('./routes/authorizeddetailsRoutes');

const app = express();
app.use(cors());
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Set up Sequelize for MySQL
const sequelize = new Sequelize(config.database.database, config.database.user, config.database.password, {
    host: config.database.host,
    dialect: 'mysql',
    port: 3306, // Default MySQL port
    pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000,
    },
});

// Test the database connection
(async () => {
    try {
        await sequelize.authenticate();
        console.log('Connection to the database has been established successfully.');
    } catch (error) {
        console.error('Unable to connect to the database:', error);
        process.exit(1); // Exit the application if database connection fails
    }
})();

// Set up MySQL session store
const sessionStoreOptions = {
    expiration: 21600000, // 6 hours in milliseconds
    createDatabaseTable: true,
    schema: {
        tableName: 'sessions',
        columnNames: {
            session_id: 'session_id',
            expires: 'expires',
            data: 'data',
        },
    },
};

// Initialize session store
const sessionStore = new MySQLStore(sessionStoreOptions, sequelize);

app.use(session({
    secret: process.env.SESSION_SECRET || 'screeningstar@2024',
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 6 * 60 * 60 * 1000, // 6 hours in milliseconds
    },
}));

// Define routes
app.use('/Screeningstar', authRoutes);
app.use('/Screeningstar', clientRoutes);
app.use('/Screeningstar', serviceRoutes);
app.use('/Screeningstar', packageRoutes);
app.use('/Screeningstar', clientSpocRoutes);
app.use('/Screeningstar', escalationmanagerRoutes);
app.use('/Screeningstar', billingspocRoutes);
app.use('/Screeningstar', billingescalationRoutes);
app.use('/Screeningstar', authorizeddetailsRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Something went wrong!', error: err.message });
});

// Start the server
const PORT = process.env.PORT || 3000; // Fallback to 3000 if PORT is not defined
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
