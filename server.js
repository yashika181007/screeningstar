const express = require('express');
const cors = require('cors');
const session = require('express-session');
const cookieParser = require('cookie-parser');
require('dotenv').config();
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
const app = express();
app.use(cors());
app.use(cookieParser());
app.use(express.json()); 
app.use(express.urlencoded({ extended: true })); 

app.use(session({
    secret: process.env.SESSION_SECRET || 'screeningstar@2024',
    tore: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 6 * 60 * 60 * 1000 // 6 hours in milliseconds
    }
}));
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

const sessionStore = new MySQLStore(sessionStoreOptions, config);

app.use('/Screeningstar', authRoutes);
app.use('/Screeningstar', clientRoutes);
app.use('/Screeningstar', serviceRoutes);
app.use('/Screeningstar', packageRoutes);
app.use('/Screeningstar', clientSpocRoutes);
app.use('/Screeningstar', escalationmanagerRoutes);
app.use('/Screeningstar', billingspocRoutes);
app.use('/Screeningstar', billingescalationRoutes);
app.use('/Screeningstar', authorizeddetailsRoutes);
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Something went wrong!', error: err.message });
});

const PORT = process.env.PORT;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
