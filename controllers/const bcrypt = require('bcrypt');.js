const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const generatePassword = (length = 12) => {
    const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+<>?';
    let password = '';
    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * charset.length);
        password += charset[randomIndex];
    }
    return password;
};

exports.createClient = async (req, res) => {
    const token = req.headers['authorization'];
    if (!token) {
        return res.status(401).json({ message: 'No token provided. Please log in.' });
    }

    const tokenParts = token.split(' ');
    const jwtToken = tokenParts[1];

    let decodedToken;
    try {
        decodedToken = jwt.verify(jwtToken, process.env.jwtSecret);
    } catch (err) {
        return res.status(401).json({ message: 'Invalid token. Please log in again.' });
    }

    const user_id = decodedToken.id;
    if (!user_id) {
        return res.status(401).json({ message: 'User not authenticated. Please log in.' });
    }

    const {
        clientLogo,
        organizationName,
        clientId,
        mobileNumber,
        email,
        registeredAddress,
        state,
        stateCode,
        gstNumber,
        tat,
        serviceAgreementDate,
        clientProcedure,
        agreementPeriod,
        customTemplate,
        accountManagement,
        packageOptions,
        scopeOfServices,
        pricingPackages,
        standardProcess,
        loginRequired,
        role,
        status = 'Active'
    } = req.body;


    const plainPassword = generatePassword();

    try {
        const hashedPassword = await bcrypt.hash(plainPassword, 10);

        const newClient = await Client.create({
            user_id,
            clientLogo,
            organizationName,
            clientId,
            mobileNumber,
            email,
            registeredAddress,
            state,
            stateCode,
            gstNumber,
            tat,
            serviceAgreementDate,
            clientProcedure,
            agreementPeriod,
            customTemplate,
            accountManagement,
            packageOptions,
            scopeOfServices,
            pricingPackages,
            standardProcess,
            loginRequired,
            role,
            status,
            password: hashedPassword 
        });

        req.session.clientId = newClient.clientId;

        res.status(201).json({ 
            message: 'Client created successfully', 
            client: newClient, 
            plainPassword: plainPassword  
        });
    } catch (error) {
        console.error('Database Error:', error);
        res.status(500).json({ message: 'Error creating client', error: error.message });
    }
};
