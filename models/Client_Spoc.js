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
            key: 'id',
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
    },
    spocName: {
        type: DataTypes.STRING,
        allowNull: false,
        trim: true
    },
    designation: {
        type: DataTypes.STRING,
        allowNull: false,
        trim: true
    },
    contactNumber: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            isNumeric: true,
            len: {
                args: [10, 10],
                msg: 'Contact number must be 10 digits long'
            }
        }
    },
    emailId: {
        type: DataTypes.STRING,
        allowNull: false,
        trim: true,
        lowercase: true,
        validate: {
            isEmail: {
                msg: 'Please enter a valid email address'
            }
        }
    },
    emailId1: {
        type: DataTypes.STRING,
        allowNull: false,
        trim: true,
        lowercase: true,
        validate: {
            isEmail: {
                msg: 'Please enter a valid email address'
            }
        }
    },
    emailId2: {
        type: DataTypes.STRING,
        allowNull: false,
        trim: true,
        lowercase: true,
        validate: {
            isEmail: {
                msg: 'Please enter a valid email address'
            }
        }
    },
    emailId3: {
        type: DataTypes.STRING,
        allowNull: false,
        trim: true,
        lowercase: true,
        validate: {
            isEmail: {
                msg: 'Please enter a valid email address'
            }
        }
    },
    emailId4: {
        type: DataTypes.STRING,
        allowNull: false,
        trim: true,
        lowercase: true,
        validate: {
            isEmail: {
                msg: 'Please enter a valid email address'
            }
        }
    },
}, {
    timestamps: true
});

ClientSpoc.belongsTo(Users, {
    foreignKey: 'user_id',
    as: 'User',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
});

sequelize.sync()
    .then(() => console.log('ClientSpoc table created successfully.'))
    .catch(error => console.error('Error creating ClientSpoc table:', error));

module.exports = ClientSpoc;
