const { Sequelize, DataTypes } = require('sequelize');
const config = require('../config');

const sequelize = new Sequelize(config.database.database, config.database.user, config.database.password, {
    host: config.database.host,
    dialect: 'mysql',
});

const User = sequelize.define('Users', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    employeePhoto: {
        type: DataTypes.STRING, 
        allowNull: true,
    },
    employeeName: {
        type: DataTypes.STRING(100),
        allowNull: false,
    },
    employeeMobile: {
        type: DataTypes.STRING(15),
        allowNull: true,
    },
    email: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: true,
    },
    designation: {
        type: DataTypes.STRING(50),
        allowNull: true,
    },
    password: {
        type: DataTypes.STRING(255),  
        allowNull: false,
    },
    role: {
        type: DataTypes.ENUM('admin', 'user', 'sub_user', 'super_user'),
        allowNull: false,
    }, status: {
        type: DataTypes.ENUM('Active', 'In Active'),
        allowNull: false,
    }
}, {
    tableName: 'Users', 
    timestamps: true,  
});

sequelize.sync();

module.exports = User;
