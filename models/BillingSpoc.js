const Users = require('../models/User');
const { Sequelize, DataTypes } = require('sequelize');
const config = require('../config');

const sequelize = new Sequelize(config.database.database, config.database.user, config.database.password, {
    host: config.database.host,
    dialect: 'mysql',
});

const BillingSpoc = sequelize.define('billing_spoc', {
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
}, {
    timestamps: true,
});
sequelize.sync()
    .then(() => console.log('Database & tables created!'))
    .catch(error => console.error('Error creating database:', error));
    
    module.exports = BillingSpoc;
