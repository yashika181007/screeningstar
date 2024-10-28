const { Sequelize, DataTypes } = require('sequelize');
const config = require('../config');
const Users = require('../models/User');
const Client = require('../models/Client');
const Branch = require('../models/Branch');

const sequelize = new Sequelize(config.database.database, config.database.user, config.database.password, {
    host: config.database.host,
    dialect: 'mysql',
});

const CandidateManager = sequelize.define('candidatemanager', {
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
    branchId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Branch,
            key: 'id',
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
    },
    applicantName: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    organizationName: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    MobileNumber: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    emailId: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    employeeId: {
        type: DataTypes.STRING,
        allowNull: false,
    },

    services: {
        type: DataTypes.JSON,
        allowNull: true,
    },
}, {
    timestamps: true,
    paranoid: false,
});

sequelize.sync()
    .then(() => console.log('Candidate Manager table created successfully.'))
    .catch(error => {
        console.error('Error creating Candidate Manager table:', error);
    });

module.exports = CandidateManager;
