const express = require('express');
const cors = require('cors');
const session = require('express-session');
const cookieParser = require('cookie-parser');
require('dotenv').config();

const authRoutes = require('./routes/authRoutes');
const clientRoutes = require('./routes/clientRoutes');
const serviceRoutes = require('./routes/serviceRoutes');
const app = express();
app.use(cors());
app.use(cookieParser());
app.use(express.json()); 
app.use(express.urlencoded({ extended: true })); 

app.use('/uploads', express.static('uploads'));

app.use(session({
    secret: process.env.SESSION_SECRET || 'screeningstar@2024',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false, maxAge: 3600000 } 
}));

app.use('/Screeningstar', authRoutes);
app.use('/Screeningstar', clientRoutes);
app.use('/Screeningstar', serviceRoutes);

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Something went wrong!', error: err.message });
});

const PORT = process.env.PORT;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
