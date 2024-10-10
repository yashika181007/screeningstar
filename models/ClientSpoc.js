const Users = require('../models/User');
const { Sequelize, DataTypes } = require('sequelize');
const config = require('../config');

const sequelize = new Sequelize(config.database.database, config.database.user, config.database.password, {
    host: config.database.host,
    dialect: 'mysql',
});

const ClientSpoc = sequelize.define('clientspoc', {
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
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
    },
    spocName: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    designation: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    contactNumber: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            isNumeric: true,
            len: [10, 10],
        }
    },
    emailId: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            isEmail: true,
        }
    },
    emailId1: {
        type: DataTypes.STRING,
        validate: {
            isEmail: true,
        }
    },
    emailId2: {
        type: DataTypes.STRING,
        validate: {
            isEmail: true,
        }
    },
    emailId3: {
        type: DataTypes.STRING,
        validate: {
            isEmail: true,
        }
    },
    emailId4: {
        type: DataTypes.STRING,
        validate: {
            isEmail: true,
        }
    },
}, {
    timestamps: true,
});
