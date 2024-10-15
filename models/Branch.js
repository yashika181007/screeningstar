const Users = require('../models/User');
const { Sequelize, DataTypes } = require('sequelize');
const config = require('../config');
const Client = require('../models/Client');

const sequelize = new Sequelize(config.database.database, config.database.user, config.database.password, {
    host: config.database.host,
    dialect: 'mysql',
});

const Branch = sequelize.define('branches', {
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
        unique: true,
        allowNull: false,
        references: {
            model: Client, // Reference the Client model
            key: 'clientId',
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
    },
    branchEmail: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    branchName: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    isHeadBranch: {
        type: DataTypes.BOOLEAN,
        defaultValue: false, 
    },
}, {
    timestamps: true,
});

// Debugging: Log the Branch model
console.log('Branch model:', Branch);

sequelize.sync()
    .then(() => console.log('Branch table created successfully.'))
    .catch(error => console.error('Error creating Branch table:', error));

module.exports = Branch;
