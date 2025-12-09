# J'INK Tattoo Studio - Appointment Booking System

A complete tattoo appointment website system with a dark theme and gold accents. Built with Node.js, Express, SQLite, and vanilla JavaScript.

## 🎨 Design Features

- **Dark Theme with Gold Accents**: Professional black background with elegant gold (#d4af37) highlights
- **Graffiti-Style Typography**: Eye-catching handwritten font for headings
- **Glowing Effects**: Subtle gold glow on buttons, forms, and interactive elements
- **Grayscale to Color**: Tattoo images start grayscale and turn colored on hover/selection
- **Fully Responsive**: Works seamlessly on desktop, tablet, and mobile devices
- **Smooth Animations**: Fade transitions and hover effects throughout

## 🚀 Features

### User Side
- **Landing Page**: Full-screen hero image with bold welcome text and call-to-action buttons
- **User Registration**: Gold-outlined form with validation and character limits
- **User Login**: Centered glowing form box with graffiti title
- **User Dashboard**: Overview of recent appointments and quick actions
- **Tattoo Gallery**: Browse designs with category filters and grayscale-to-color selection
- **Appointment Booking**:
  - Choose from gallery designs or upload custom artwork
  - Select preferred artist
  - Pick date and time
  - Add special notes
- **My Appointments**: View and track all appointment requests with status badges
- **Notifications**: Real-time updates on appointment status changes

### Admin Side
- **Admin Dashboard**: Analytics and statistics overview
  - Today's appointments count
  - Pending approvals
  - Most popular tattoo category
  - Most booked artist
- **Appointments Management**:
  - View all customer appointments
  - Approve/decline requests
  - Mark appointments as completed
  - Filter by status
- **Tattoo Designs Management**: Full CRUD operations for tattoo gallery
- **Artists Management**: Full CRUD operations for artist profiles

## 📋 Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd FinalProject_Jean
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**

   The `.env` file is already configured with default values:
   ```
   PORT=3000
   JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
   SESSION_SECRET=your_session_secret_key_change_this
   ```

   **⚠️ IMPORTANT**: Change these secrets in production!

4. **Set up placeholder images** (Optional)
   ```bash
   chmod +x setup-images.sh
   ./setup-images.sh
   ```

   Or manually create the directories and add images:
   - `public/images/hero-bg.jpg` - Hero background image
   - `public/images/form-bg.jpg` - Login/Register background
   - `public/images/placeholder.jpg` - Default placeholder image

5. **Start the server**
   ```bash
   npm start
   ```

   For development with auto-reload:
   ```bash
   npm run dev
   ```

6. **Access the application**

   Open your browser and navigate to: `http://localhost:3000`

## 🔐 Default Admin Credentials

The system creates a default admin account on first run:

- **Username**: `admin`
- **Password**: `admin123`

**⚠️ Change these credentials immediately in production!**

## 📁 Project Structure

```
FinalProject_Jean/
├── public/                 # Static files
│   ├── css/
│   │   └── style.css      # Main stylesheet with dark/gold theme
│   ├── js/
│   │   ├── auth.js        # Authentication utilities
│   │   └── main.js        # General utilities
│   ├── images/            # Image assets
│   ├── uploads/           # User uploaded files (auto-created)
│   ├── index.html         # Landing page
│   ├── login.html         # Login page
│   ├── register.html      # Registration page
│   ├── user-dashboard.html
│   ├── gallery.html       # Tattoo gallery
│   ├── appointment.html   # Booking page
│   ├── my-appointments.html
│   ├── notifications.html
│   ├── admin-dashboard.html
│   ├── admin-appointments.html
│   ├── admin-tattoos.html
│   └── admin-artists.html
├── database.js            # Database schema and initialization
├── server.js              # Express server and API routes
├── package.json
├── .env                   # Environment variables
├── .gitignore
└── README.md
```

## 🎯 Usage Guide

### For Users

1. **Register an Account**
   - Navigate to the registration page
   - Fill in all required fields
   - Password must be at least 8 characters

2. **Browse Tattoos**
   - Visit the gallery to see available designs
   - Click on a tattoo to select it (grayscale → color)
   - Filter by category (Arm, Back, Chest, etc.)

3. **Book an Appointment**
   - Choose a tattoo from gallery OR upload custom design
   - Select your preferred artist
   - Pick a date and time
   - Add any special notes
   - Submit and wait for admin approval

4. **Track Appointments**
   - View all your appointments in "My Appointments"
   - Check status: Pending, Approved, Declined, or Completed
   - Receive notifications when status changes

### For Admins

1. **Login with Admin Account**
   - Use admin credentials to access admin panel

2. **Manage Appointments**
   - View all customer requests
   - Approve or decline appointments
   - Mark completed appointments

3. **Manage Tattoo Designs**
   - Add new tattoo designs with images
   - Edit existing designs
   - Delete outdated designs
   - Organize by category

4. **Manage Artists**
   - Add new artists with photos and bios
   - Update artist information
   - Remove artists when needed

## 🎨 Design Customization

### Color Scheme

The theme uses CSS custom properties defined in `public/css/style.css`:

```css
:root {
  --gold: #d4af37;
  --dark: #0a0a0a;
  --dark-gray: #1a1a1a;
  --light-gray: #2a2a2a;
  --white: #ffffff;
  --gold-glow: 0 0 20px rgba(212, 175, 55, 0.5);
  --gold-glow-strong: 0 0 30px rgba(212, 175, 55, 0.8);
}
```

Modify these values to change the color scheme throughout the site.

### Typography

The project uses:
- **Permanent Marker**: Graffiti-style headings
- **Poppins**: Body text and UI elements

Both are loaded from Google Fonts in `style.css`.

## 🔒 Security Features

- **Password Hashing**: bcrypt for secure password storage
- **JWT Authentication**: Secure token-based auth with HTTP-only cookies
- **SQL Injection Protection**: Prepared statements with better-sqlite3
- **File Upload Validation**: Type and size restrictions
- **Role-Based Access Control**: Separate user and admin permissions

## 🗄️ Database

The application uses SQLite with the following tables:

- **users**: User accounts and authentication
- **artists**: Tattoo artist profiles
- **tattoos**: Tattoo design catalog
- **appointments**: Booking records
- **notifications**: User notification system

Database is automatically initialized on first run with sample data.

## 📱 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user

### Tattoos
- `GET /api/tattoos` - Get all tattoos
- `GET /api/tattoos/:id` - Get single tattoo
- `POST /api/tattoos` - Create tattoo (admin)
- `PUT /api/tattoos/:id` - Update tattoo (admin)
- `DELETE /api/tattoos/:id` - Delete tattoo (admin)

### Artists
- `GET /api/artists` - Get all artists
- `POST /api/artists` - Create artist (admin)
- `PUT /api/artists/:id` - Update artist (admin)
- `DELETE /api/artists/:id` - Delete artist (admin)

### Appointments
- `POST /api/appointments` - Create appointment
- `GET /api/appointments/my` - Get user's appointments
- `GET /api/appointments` - Get all appointments (admin)
- `PUT /api/appointments/:id/status` - Update status (admin)

### Notifications
- `GET /api/notifications` - Get user notifications
- `PUT /api/notifications/:id/read` - Mark as read

### Admin Stats
- `GET /api/admin/stats` - Get dashboard statistics (admin)

## 🐛 Troubleshooting

### Port Already in Use
If port 3000 is busy, change it in `.env`:
```
PORT=3001
```

### Images Not Loading
1. Check that image directories exist
2. Run `./setup-images.sh` to create placeholders
3. Verify file permissions

### Database Issues
Delete `tattoo_studio.db` and restart to recreate the database.

### Login Issues
Clear browser cookies and try again, or use incognito mode.

## 🚀 Deployment

### Production Checklist

1. **Change Secret Keys** in `.env`
2. **Update Admin Password**
3. **Use Production Database** (PostgreSQL/MySQL recommended)
4. **Enable HTTPS**
5. **Set up proper file storage** (AWS S3, etc.)
6. **Configure CORS** if using separate frontend
7. **Enable rate limiting**
8. **Set up monitoring and logging**

## 📄 License

MIT License - feel free to use this project for personal or commercial purposes.

## 👨‍💻 Credits

Developed for J'INK Tattoo Studio
- Backend: Node.js + Express
- Database: SQLite (better-sqlite3)
- Frontend: Vanilla HTML/CSS/JavaScript
- Fonts: Google Fonts (Permanent Marker, Poppins)

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📞 Support

For issues or questions, please open an issue on the repository.

---

**Made with ❤️ for the tattoo community**
