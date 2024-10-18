const { Sequelize, DataTypes } = require('sequelize');
const config = require('../config');

const sequelize = new Sequelize(config.database.database, config.database.user, config.database.password, {
    host: config.database.host,
    dialect: 'mysql',
});

const AdminLoginLog = sequelize.define('AdminLoginLog', {
    email: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    status: {
        type: DataTypes.STRING, // 'Success' or 'Failed'
        allowNull: false,
    },
    message: {
        type: DataTypes.STRING,
        allowNull: true, // e.g., 'Invalid email or password'
    },
    ipAddress: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    timestamp: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
    },
}, {
    timestamps: false,
});
AdminLoginLog.sync({ alter: true })
    .then(() => {
        console.log('AdminLoginLog table created or updated.');
    })
    .catch((err) => {
        console.error('Error creating or updating AdminLoginLog table:', err);
    });
module.exports = AdminLoginLog;
