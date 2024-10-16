const { Sequelize, DataTypes } = require('sequelize');
const config = require('../config');
const Users = require('../models/User'); 
const Client = require('../models/Client'); 

const sequelize = new Sequelize(config.database.database, config.database.user, config.database.password, {
    host: config.database.host,
    dialect: 'mysql',
});

const ClientManager = sequelize.define('clientmanager', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Users, 
            key: 'id',
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
    },
    clientId: {
        type: DataTypes.STRING,
        allowNull: false,
        references: {
            model: Client,
            key: 'clientId',
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
    },
    organizationName: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    applicantName: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    employeeId: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    location: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    spocClientManagered: {
        type: DataTypes.STRING,
        allowNull: true, 
    },
    groupManager: {
        type: DataTypes.STRING,
        allowNull: true, 
    },

    educationPG: {
        type: DataTypes.JSON, 
        allowNull: true,
    },
    educationUG: {
        type: DataTypes.JSON, 
        allowNull: true,
    },
    education12th: {
        type: DataTypes.JSON,
        allowNull: true,
    },
    education10th: {
        type: DataTypes.JSON, 
        allowNull: true,
    },
    educationDiploma: {
        type: DataTypes.JSON, 
        allowNull: true,
    },

    employmentDocuments: {
        type: DataTypes.JSON, 
        allowNull: true,
    },

    idProofs: {
        type: DataTypes.JSON, 
        allowNull: true,
    },

    addressProofs: {
        type: DataTypes.JSON, 
        allowNull: true,
    },
}, {
    timestamps: true, 
    paranoid: false,  
});

sequelize.sync()
    .then(() => console.log('ClientManager table created successfully.'))
    .catch(error => {
        console.error('Error creating ClientManager table:', error);
    });

module.exports = ClientManager;
