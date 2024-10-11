const Users = require('../models/User');
const { Sequelize, DataTypes } = require('sequelize');
const config = require('../config');

const sequelize = new Sequelize(config.database.database, config.database.user, config.database.password, {
    host: config.database.host,
    dialect: 'mysql',
});

const Client = sequelize.define('client', {
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
    organizationName: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    clientId: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false,
    },
    mobileNumber: {
        type: DataTypes.STRING,
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
       
    },
    registeredAddress: {
        type: DataTypes.STRING,
    },
    state: {
        type: DataTypes.STRING,
    },
    stateCode: {
        type: DataTypes.STRING,
    },
    gstNumber: {
        type: DataTypes.STRING,
    },
    tat: {
        type: DataTypes.STRING,
    },
    serviceAgreementDate: {
        type: DataTypes.DATE,
    },
    clientProcedure: {
        type: DataTypes.TEXT,
    },
    agreementPeriod: {
        type: DataTypes.STRING,
    },
    customTemplate: {
        type: DataTypes.TEXT,
    },
    clientLogo: {
        type: DataTypes.STRING,
    },
    accountManagement: {
        type: DataTypes.STRING,
    },
    packageOptions: {
        type: DataTypes.TEXT,
    },
    scopeOfServices: {
        type: DataTypes.TEXT,
    },
    pricingPackages: {
        type: DataTypes.TEXT,
    },
    standardProcess: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
    loginRequired: {
        type: DataTypes.ENUM('yes', 'no'),
    },
    role: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
    status: {
        type: DataTypes.ENUM('Active', 'In Active'),
        allowNull: false,
    },
});

Client.belongsTo(Users, {
    foreignKey: 'user_id',
    as: 'User',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
});

sequelize.sync()
    .then(() => console.log('Client table created successfully.'))
    .catch(error => console.error('Error creating Client table:', error));

module.exports = Client;
