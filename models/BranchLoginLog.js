const { Sequelize, DataTypes } = require('sequelize');
const config = require('../config');

const sequelize = new Sequelize(config.database.database, config.database.user, config.database.password, {
    host: config.database.host,
    dialect: 'mysql',
});

const BranchLoginLog = sequelize.define('BranchLoginLog', {
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
BranchLoginLog.sync({ alter: true })
    .then(() => {
        console.log('BranchLoginLog table created or updated.');
    })
    .catch((err) => {
        console.error('Error creating or updating BranchLoginLog table:', err);
    });

module.exports = BranchLoginLog;
