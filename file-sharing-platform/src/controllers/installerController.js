const fs = require('fs').promises;
const path = require('path');
const db = require('../models');

async function createAdminUser(admin) {
    const { User } = db;
    return User.create({
        username: admin.username,
        email: admin.email,
        password: admin.password,
        is_admin: true,
        email_verified: true,
    });
}

async function lockInstaller() {
    const lockPath = path.join(__dirname, '..', '..', 'install.lock');
    await fs.writeFile(lockPath, `Installation completed on ${new Date().toISOString()}`);
}

exports.showStep2 = (req, res) => {
    res.sendFile(path.resolve('public/install/step2.html'));
};

exports.processStep2 = async (req, res) => {
    try {
        const admin = {
            username: req.body.username,
            email: req.body.email,
            password: req.body.password,
        };

        if (!admin.username || !admin.email || !admin.password) {
            return res.status(400).send('Admin username, email, and password are required.');
        }

        // Step 1: Explicitly test the database connection
        await db.sequelize.authenticate();

        // Step 2: Sync database schema (safely, without force=true)
        await db.sequelize.sync();

        // Step 3: Create Admin User
        await createAdminUser(admin);

        // Step 4: Lock the installer to prevent it from running again
        await lockInstaller();

        res.redirect('/install/finish');

    } catch (error) {
        console.error('INSTALLATION ERROR:', error);
        let errorMessage = 'An unexpected error occurred during installation. Please check the server logs.';
        if (error.name === 'SequelizeConnectionError' || error.message.includes('connect ECONNREFUSED')) {
            errorMessage = 'Could not connect to the database. Please check your .env file settings (DB_HOST, DB_PORT, DB_DATABASE) and ensure your MySQL server is running.';
        } else if (error.name === 'SequelizeAccessDeniedError') {
            errorMessage = 'Database access denied. Please check the username and password in your .env file (DB_USERNAME, DB_PASSWORD).';
        } else if (error.name === 'SequelizeUniqueConstraintError') {
            errorMessage = 'An admin user with that email or username may already exist in the database.';
        } else if (error.message.includes('Unknown database')) {
            errorMessage = `The database specified in your .env file does not exist. Please create it in phpMyAdmin first. Database name: ${db.sequelize.config.database}`;
        }

        res.status(500).send(`
            <div style="font-family: sans-serif; padding: 2em; border: 1px solid #ccc; border-radius: 5px; margin: 2em;">
                <h1 style="color: #c00;">Installation Failed</h1>
                <p>There was a problem setting up the application. This is likely a database connection issue.</p>
                <p><strong>Please check the following:</strong></p>
                <ul style="line-height: 1.6;">
                    <li>Is your XAMPP MySQL server running?</li>
                    <li>Are the credentials in your <strong>.env</strong> file correct?</li>
                    <li>Did you create the database in phpMyAdmin?</li>
                </ul>
                <hr style="margin: 1.5em 0;" />
                <p><strong>Error Details:</strong></p>
                <pre style="background-color: #f0f0f0; padding: 1em; border-radius: 5px; white-space: pre-wrap; color: #333;">${errorMessage}</pre>
            </div>
        `);
    }
};

exports.showFinish = (req, res) => {
    res.sendFile(path.resolve('public/install/finish.html'));
};
