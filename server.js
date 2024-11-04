// Import dependencies
const express = require('express');
const cors = require('cors');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const mysql = require('mysql2/promise'); // Raw MySQL connection for session store
const MySQLStore = require('express-mysql-session')(session); // Session store for MySQL
require('dotenv').config();
const { Sequelize } = require('sequelize');
const config = require('./config');

const authRoutes = require('./routes/authRoutes');
const clientRoutes = require('./routes/clientRoutes');
const serviceRoutes = require('./routes/serviceRoutes');
const packageRoutes = require('./routes/packageRoutes');
const clientSpocRoutes = require('./routes/clientSpocRoutes');
const escalationmanagerRoutes = require('./routes/escalationmanagerRoutes');
const billingspocRoutes = require('./routes/billingspocRoutes');
const billingescalationRoutes = require('./routes/billingescalationRoutes');
const authorizeddetailsRoutes = require('./routes/authorizeddetailsRoutes');
const clientmanagerRoutes = require('./routes/clientmanagerRoutes');
const candidatemanagerRoutes = require('./routes/candidatemanagerRoutes');
const invoiceRoutes = require('./routes/invoiceRoutes');
const generateReportRoutes = require('./routes/generateReportRoutes');
const candidateportalRoutes = require('./routes/candidateportalRoutes');
const app = express();
app.use('/uploads', express.static('uploads'));

app.use(cors());
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const sequelize = new Sequelize(config.database.database, config.database.user, config.database.password, {
    host: config.database.host,
    dialect: 'mysql',
    pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000,
    },
});

(async () => {
    try {
        await sequelize.authenticate();
        console.log('Connection to the database has been established successfully.');
    } catch (error) {
        console.error('Unable to connect to the database:', error);
        process.exit(1); 
    }
})();

const sessionConnection = mysql.createPool({
    host: config.database.host,
    user: config.database.user,
    password: config.database.password,
    database: config.database.database
});

const sessionStoreOptions = {
    expiration: 21600000, 
    createDatabaseTable: true,
    schema: {
        tableName: 'sessions',
        columnNames: {
            session_id: 'session_id',
            expires: 'expires',
            data: 'data'
        },
    },
};

const sessionStore = new MySQLStore(sessionStoreOptions, sessionConnection);

app.use(session({
    secret: process.env.SESSION_SECRET || 'screeningstar@2024',
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 6 * 60 * 60 * 1000, // 6 hours in milliseconds
    },
}));

app.use('/Screeningstar', authRoutes);
app.use('/Screeningstar', clientRoutes);
app.use('/Screeningstar', serviceRoutes);
app.use('/Screeningstar', packageRoutes);
app.use('/Screeningstar', clientSpocRoutes);
app.use('/Screeningstar', escalationmanagerRoutes);
app.use('/Screeningstar', billingspocRoutes);
app.use('/Screeningstar', billingescalationRoutes);
app.use('/Screeningstar', authorizeddetailsRoutes);
app.use('/Screeningstar', clientmanagerRoutes);
app.use('/Screeningstar', candidatemanagerRoutes);
app.use('/Screeningstar', invoiceRoutes);
app.use('/Screeningstar', generateReportRoutes);
app.use('/Screeningstar', candidateportalRoutes);
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Something went wrong!', error: err.message });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
