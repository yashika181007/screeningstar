const { Sequelize, DataTypes } = require('sequelize');
const config = require('../config');

// Establish a connection to the database
const sequelize = new Sequelize(config.database.database, config.database.user, config.database.password, {
    host: config.database.host,
    dialect: 'mysql',
});

const Client = sequelize.define('Client', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    organizationName: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    clientId: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false,
    },
    registeredAddress: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    state: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    stateCode: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    gstNumber: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    clientLogo: {
        type: DataTypes.STRING, // Store the filename of the logo
    }
});

// Sync model with the database
Client.sync();

module.exports = Client;
