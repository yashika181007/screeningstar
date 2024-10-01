const { Sequelize, DataTypes } = require('sequelize');
const config = require('../config');

const sequelize = new Sequelize(config.database.database, config.database.user, config.database.password, {
    host: config.database.host,
    dialect: 'mysql',
});

const Service = sequelize.define('Service', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'Users',   // References the Users table
            key: 'id'         // Foreign key for the Users table
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
    },
    serviceName: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    serviceDescription: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    createdAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    },
    updatedAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
        onUpdate: DataTypes.NOW
    }
}, {
    tableName: 'Service',
    timestamps: false
});

// Association between Service and Users
Service.belongsTo(Users, {
    foreignKey: 'user_id',
    as: 'User',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
});

// Sync the table with the database
Service.sync();

module.exports = Service;
