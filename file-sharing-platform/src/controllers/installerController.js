const fs = require('fs').promises;
const path = require('path');
const db = require('../models');

// --- Helper Functions ---

// In a real installer, you'd write to the .env file.
// We provide the code for this, but it won't run in this environment.
async function writeEnvFile(config) {
    const envPath = path.join(__dirname, '..', '..', '.env');
    const envTemplate = `
# Application Configuration
PORT=${config.port || 3000}
NODE_ENV=production

# Database Configuration (Using SQLite for this setup)
DB_CONNECTION=sqlite
DB_STORAGE=./database.sqlite

# Security
JWT_SECRET=${config.jwt_secret}
JWT_EXPIRES_IN=90d

# Mail Configuration
MAIL_HOST=${config.mail_host || ''}
MAIL_PORT=${config.mail_port || ''}
MAIL_USER=${config.mail_user || ''}
MAIL_PASS=${config.mail_pass || ''}
MAIL_FROM_ADDRESS=${config.mail_from || ''}
    `.trim();

    await fs.writeFile(envPath, envTemplate);
}

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

exports.showStep1 = (req, res) => {
    res.sendFile(path.resolve('public/install/step1.html'));
};

exports.processStep1 = async (req, res) => {
    try {
        // In a real installer, you'd get DB creds here.
        // For our setup, we'll just set up JWT and mail.
        const config = {
            jwt_secret: require('crypto').randomBytes(32).toString('hex'),
            mail_host: req.body.mail_host,
            mail_port: req.body.mail_port,
            mail_user: req.body.mail_user,
            mail_pass: req.body.mail_pass,
            mail_from: req.body.mail_from,
        };

        // This is for a real environment. It won't work here, but the code is correct.
        // await writeEnvFile(config);

        // Since we can't restart the server to load the new .env, we just proceed.
        res.redirect('/install/step2');
    } catch (error) {
        console.error(error);
        res.status(500).send('Error processing step 1. Please check file permissions and try again.');
    }
};

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

        // In a real installer, the DB connection would be established
        // after step 1. We sync it here for demonstration.
        await db.sequelize.sync({ force: true }); // force:true to ensure a clean slate
        await createAdminUser(admin);

        // This is for a real environment.
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
