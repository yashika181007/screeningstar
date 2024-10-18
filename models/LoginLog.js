const Users = require('../models/User');
const { Sequelize, DataTypes } = require('sequelize');
const config = require('../config');
const Client = require('../models/Client');

const sequelize = new Sequelize(config.database.database, config.database.user, config.database.password, {
    host: config.database.host,
    dialect: 'mysql',
});

const LoginLog = sequelize.define('LoginLog', {
    branchEmail: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    status: {
        type: DataTypes.STRING, 
        allowNull: false,
    },
    message: {
        type: DataTypes.STRING,
        allowNull: true, 
    },
    timestamp: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
    },
}, {
    timestamps: false,
});
LoginLog.sync({ alter: true })
    .then(() => {
        console.log('LoginLog table created or updated.');
    })
    .catch((err) => {
        console.error('Error creating or updating LoginLog table:', err);
    });

module.exports = LoginLog;
