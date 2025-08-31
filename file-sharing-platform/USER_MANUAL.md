# File Sharing Platform - User Manual

## 1. Introduction

Welcome to your new File Sharing Platform! This document provides all the necessary instructions to get the application's backend server up and running on your local machine for both Windows and Linux environments.

## 2. Prerequisites

Before you begin, ensure you have the following software installed on your system:

- **Node.js**: Version 16.x or higher is recommended. You can download it from [nodejs.org](https://nodejs.org/).
- **npm**: Node Package Manager, which comes bundled with Node.js.
- **Git**: A version control system for cloning the project. You can download it from [git-scm.com](https://git-scm.com/).

You can verify the installations by opening a terminal or command prompt and typing:
```sh
node -v
npm -v
```

## 3. Installation

Follow these steps to get the project set up:

**Step 1: Get the Project Files**

If you have received the project as a folder, simply navigate into that folder (`file-sharing-platform`) with your terminal. If you have a Git repository URL, clone it:

```sh
git clone <your-repository-url>
cd file-sharing-platform
```

**Step 2: Install Dependencies**

Once you are inside the project directory, run the following command to install all the necessary backend and frontend dependencies listed in `package.json`:

```sh
npm install
```
This command will create a `node_modules` folder containing all the required libraries.

## 4. Configuration

The application's configuration is managed through an environment file.

**Step 1: Create the `.env` File**

In the root of the project, you will find a file named `.env.example`. Make a copy of this file and rename it to `.env`.

- **On Linux/macOS:**
  ```sh
  cp .env.example .env
  ```
- **On Windows Command Prompt:**
  ```sh
  copy .env.example .env
  ```

**Step 2: Configure Your Settings**

Open the newly created `.env` file in a text editor.

- **`JWT_SECRET`**: This is the most critical variable to change. Replace the default value with a long, random, and secret string. This is used to sign authentication tokens.
- **`MAIL_HOST`, `MAIL_PORT`, etc.**: If you want to enable email sending for password resets and verifications, fill in the details for your SMTP mail server here. For development, a service like [Mailtrap.io](https://mailtrap.io/) is highly recommended.
- **Database**: By default, the application is configured to use SQLite, which requires no setup. If you wish to use MySQL, see the comments in the `.env.example` file for instructions.

## 5. Running the Application

The application comes with a web-based installer that will help you create the first administrator account.

**Step 1: Start the Development Server**

Run the following command to start the server. This will also watch your files for changes and automatically restart the server and rebuild the CSS.

```sh
npm run dev
```

You should see output indicating that the server is running, typically on port 3000.

**Step 2: Use the Web Installer**

Open your web browser and navigate to `http://localhost:3000`.

Because this is the first time you are running the application, you will be automatically redirected to the web-based installer.

1.  **Step 1 (Mail Configuration):** Enter your mail server details if you have them, or leave them blank to configure later. Click "Save and Continue".
2.  **Step 2 (Create Admin Account):** Fill in the form to create your primary administrator account.

**Step 3: Access the Application**

After completing the installer, you will be taken to a final screen. You can now access the main application at `http://localhost:3000`. The installer is now locked and will not appear again.

## 6. Production Mode

When you are ready to deploy the application to a live server:

1.  Make sure `NODE_ENV` in your `.env` file is set to `production`.
2.  Build the minified CSS file:
    ```sh
    npm run build:css
    ```
3.  Start the server using the production-ready command:
    ```sh
    npm start
    ```

This concludes the setup manual. You should now have a fully functional backend server for your File Sharing Platform.
