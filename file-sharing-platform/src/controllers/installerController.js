const fs = require('fs').promises;
const path = require('path');
const db = require('../models');

// --- Helper Functions ---

async function createAdminUser(admin) {
    const { User } = db;
    return User.create({
        username: admin.username,
        email: admin.email,
        password: admin.password,
        is_admin: true,
        email_verified: true, // Auto-verify the first admin
    });
}

async function lockInstaller() {
    const lockPath = path.join(__dirname, '..', '..', 'install.lock');
    await fs.writeFile(lockPath, `Installation completed on ${new Date().toISOString()}`);
}

// --- Controller Methods ---

// This is now the first step of the installer.
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
            return res.status(400).send('Please provide all admin details.');
        }

        // The DB connection should be configured in the .env file before running.
        // We sync the database here to create the tables.
        await db.sequelize.sync({ force: true }); // force:true ensures a clean slate
        await createAdminUser(admin);

        // This should be uncommented and run in a live environment.
        // It creates the lock file to prevent the installer from running again.
        // await lockInstaller();

        res.redirect('/install/finish');
    } catch (error) {
        console.error(error);
        res.status(500).send('Error creating admin user. Please check your database connection and try again.');
    }
};

exports.showFinish = (req, res) => {
    res.sendFile(path.resolve('public/install/finish.html'));
};
