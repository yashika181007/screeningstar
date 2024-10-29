const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../config'); // Assuming your database config is here

const DigitalAV = sequelize.define('digital_av', {
    company_name: { type: DataTypes.STRING },
    candidate_name: { type: DataTypes.STRING, allowNull: false },
    employee_id: { type: DataTypes.STRING, allowNull: true },
    mob_no: { type: DataTypes.STRING, allowNull: false },
    email_id: { type: DataTypes.STRING, allowNull: false },
    candidate_address: { type: DataTypes.TEXT, allowNull: true },
    candidate_location: { type: DataTypes.STRING, allowNull: true },
    latitude: { type: DataTypes.STRING, allowNull: true },
    longitude: { type: DataTypes.STRING, allowNull: true },
    aadhaar_number: { type: DataTypes.STRING, allowNull: true },
    dob: { type: DataTypes.DATE, allowNull: true },
    father_name: { type: DataTypes.STRING, allowNull: true },
    husband_name: { type: DataTypes.STRING, allowNull: true },
    gender: { type: DataTypes.ENUM('male', 'female'), allowNull: false },
    m_status: { type: DataTypes.ENUM('married', 'unmarried', 'divorced', 'widower'), allowNull: false },
    pincode: { type: DataTypes.STRING, allowNull: true },
    state: { type: DataTypes.STRING, allowNull: true },
    landmark: { type: DataTypes.STRING, allowNull: true },
    police_station: { type: DataTypes.STRING, allowNull: true },
    nof_yrs_staying: { type: DataTypes.INTEGER, allowNull: true },
    from_date: { type: DataTypes.DATE, allowNull: true },
    to_date: { type: DataTypes.DATE, allowNull: true },
    id_type: { type: DataTypes.STRING, allowNull: true },
    id_proof: { type: DataTypes.STRING, allowNull: true },
    home_photos: { type: DataTypes.STRING, allowNull: true },
    locality_proof: { type: DataTypes.STRING, allowNull: true },
}, {
    timestamps: true,
    paranoid: false,
});

sequelize.sync()
    .then(() => console.log('DigitalAV table created successfully.'))
    .catch(error => console.error('Error creating DigitalAV table:', error));

module.exports = DigitalAV;
