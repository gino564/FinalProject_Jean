# Windows Setup Guide

This guide will help you set up and run the J'INK Tattoo Studio application on Windows.

## ✅ Fixed Windows Compatibility Issue

The original code used `better-sqlite3` which requires Visual Studio Build Tools on Windows. **This has been fixed!** The application now uses `sql.js`, a pure JavaScript implementation that works on all platforms without any C++ compilation.

## 🚀 Quick Start

### Step 1: Install Node.js

If you don't have Node.js installed:

1. Download from: https://nodejs.org/
2. Choose the LTS (Long Term Support) version
3. Run the installer
4. Verify installation by opening Command Prompt or PowerShell and running:
   ```powershell
   node --version
   npm --version
   ```

### Step 2: Navigate to Project Folder

Open Command Prompt or PowerShell and navigate to your project folder:

```powershell
cd "C:\Users\USER\Downloads\FinalProject_Jean-claude-tattoo-appointment-website-01YazDnhvTmQevwaMN9LgRkj\FinalProject_Jean-claude-tattoo-appointment-website-01YazDnhvTmQevwaMN9LgRkj"
```

### Step 3: Install Dependencies

```powershell
npm install
```

This should now work without any errors! The installation will download all required packages.

### Step 4: Start the Server

```powershell
npm start
```

You should see:
```
Database initialized successfully
Server running on http://localhost:3000
Default admin login - username: admin, password: admin123
```

### Step 5: Access the Application

Open your web browser and go to:
```
http://localhost:3000
```

## 🔐 Default Login Credentials

**Admin Account:**
- Username: `admin`
- Password: `admin123`

**⚠️ Important:** Change these credentials after first login!

## 🎯 What to Do After Installation

1. **Visit the Homepage**: Browse the landing page and see the design
2. **Create a User Account**: Click "Register" and create a regular user account
3. **Login as User**: Test the user features:
   - Browse tattoo gallery
   - Select tattoos (watch them change from grayscale to color!)
   - Book an appointment
   - View notifications
4. **Login as Admin**: Use the admin credentials to:
   - View dashboard analytics
   - Approve/decline appointments
   - Add tattoo designs
   - Manage artists

## 📁 Project Files

```
FinalProject_Jean/
├── public/               # Frontend files (HTML, CSS, JS)
│   ├── css/style.css    # Dark/gold theme styles
│   ├── js/              # JavaScript files
│   ├── images/          # Image assets
│   ├── index.html       # Landing page
│   ├── login.html       # Login page
│   ├── register.html    # Registration page
│   └── ...              # Other pages
├── server.js            # Express server + API
├── database.js          # SQLite database (now using sql.js!)
├── package.json         # Dependencies
└── .env                 # Configuration
```

## 🛠️ Troubleshooting

### Problem: Port 3000 is already in use

**Solution**: Edit the `.env` file and change the port:
```
PORT=3001
```

Then restart the server.

### Problem: Can't access http://localhost:3000

**Solutions**:
1. Make sure the server is running (you should see "Server running..." message)
2. Check if your firewall is blocking it
3. Try `http://127.0.0.1:3000` instead

### Problem: Images not showing

**Solution**: The placeholder images are SVG files. For better results:
1. Add real images to `public/images/`
2. Add tattoo images to `public/images/tattoos/`
3. Add artist photos to `public/images/artists/`

### Problem: Database errors

**Solution**: Delete the `tattoo_studio.db` file and restart the server. It will create a fresh database with sample data.

## 🎨 Customizing

### Change Colors

Edit `public/css/style.css`:

```css
:root {
  --gold: #d4af37;        /* Change to your preferred gold shade */
  --dark: #0a0a0a;        /* Change background color */
  --dark-gray: #1a1a1a;   /* Change card backgrounds */
}
```

### Add Your Own Images

1. **Hero Background**: Replace `public/images/hero-bg.jpg` with your image
2. **Form Background**: Replace `public/images/form-bg.jpg`
3. **Tattoo Designs**: Add to `public/images/tattoos/`
4. **Artist Photos**: Add to `public/images/artists/`

Then use the admin panel to add them to the database!

## 🌐 Deploying Online

To make your website accessible online, you can deploy to:

### Render (Free, Easy)

1. Create account at https://render.com
2. Connect your GitHub repository
3. Choose "Web Service"
4. Render will auto-detect Node.js
5. Set environment variables
6. Deploy!

### Heroku (Classic Option)

1. Create account at https://heroku.com
2. Install Heroku CLI
3. Run:
   ```powershell
   heroku login
   heroku create your-app-name
   git push heroku main
   ```

### Railway (Modern, Fast)

1. Create account at https://railway.app
2. Connect GitHub repo
3. One-click deploy

## 📞 Need Help?

If you encounter any issues:

1. Check that Node.js is installed correctly
2. Make sure you're in the right folder
3. Delete `node_modules` and `tattoo_studio.db` and try again:
   ```powershell
   rmdir /s node_modules
   del tattoo_studio.db
   npm install
   npm start
   ```

## ✅ Success Checklist

- [ ] Node.js installed
- [ ] npm install completed without errors
- [ ] Server starts with `npm start`
- [ ] Can access http://localhost:3000
- [ ] Can register a new user
- [ ] Can login as user
- [ ] Can browse tattoo gallery
- [ ] Can book an appointment
- [ ] Can login as admin
- [ ] Can approve appointments
- [ ] Can add new tattoos
- [ ] Can manage artists

## 🎉 You're All Set!

Enjoy your J'INK Tattoo Studio appointment system! The dark theme with gold accents looks amazing, and all features are working perfectly on Windows.

---

**Made with ❤️ for Windows users**
