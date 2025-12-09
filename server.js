require('dotenv').config();
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const db = require('./database');

const app = express();
const PORT = process.env.PORT || 3000;

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'public', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'design-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'));
    }
  }
});

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static('public'));

// Authentication middleware
function authenticateToken(req, res, next) {
  const token = req.cookies.token;
  if (!token) {
    return res.status(401).json({ error: 'Access denied. No token provided.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Invalid token.' });
  }
}

// Admin middleware
function isAdmin(req, res, next) {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Access denied. Admin only.' });
  }
  next();
}

// =============== AUTHENTICATION ROUTES ===============

// Register
app.post('/api/auth/register', (req, res) => {
  try {
    const { username, email, password, firstName, lastName } = req.body;

    // Validate input
    if (!username || !email || !password || !firstName || !lastName) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    // Check if user exists
    const existingUser = db.prepare('SELECT id FROM users WHERE username = ? OR email = ?').get(username, email);
    if (existingUser) {
      return res.status(400).json({ error: 'Username or email already exists' });
    }

    // Hash password
    const hashedPassword = bcrypt.hashSync(password, 10);

    // Insert user
    const result = db.prepare(`
      INSERT INTO users (username, email, password, first_name, last_name)
      VALUES (?, ?, ?, ?, ?)
    `).run(username, email, hashedPassword, firstName, lastName);

    res.status(201).json({ message: 'User registered successfully', userId: result.lastInsertRowid });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// Login
app.post('/api/auth/login', (req, res) => {
  try {
    const { username, password } = req.body;

    // Validate input
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }

    // Find user
    const user = db.prepare('SELECT * FROM users WHERE username = ?').get(username);
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Verify password
    const isValidPassword = bcrypt.compareSync(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Create token
    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Set cookie
    res.cookie('token', token, {
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    });

    res.json({
      message: 'Login successful',
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        role: user.role
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Login failed' });
  }
});

// Logout
app.post('/api/auth/logout', (req, res) => {
  res.clearCookie('token');
  res.json({ message: 'Logout successful' });
});

// Get current user
app.get('/api/auth/me', authenticateToken, (req, res) => {
  const user = db.prepare('SELECT id, username, email, first_name, last_name, role FROM users WHERE id = ?').get(req.user.id);
  res.json(user);
});

// =============== TATTOO ROUTES ===============

// Get all tattoos
app.get('/api/tattoos', (req, res) => {
  try {
    const tattoos = db.prepare('SELECT * FROM tattoos ORDER BY created_at DESC').all();
    res.json(tattoos);
  } catch (err) {
    console.error('Get tattoos error:', err);
    res.status(500).json({ error: 'Failed to fetch tattoos' });
  }
});

// Get tattoo by ID
app.get('/api/tattoos/:id', (req, res) => {
  try {
    const tattoo = db.prepare('SELECT * FROM tattoos WHERE id = ?').get(req.params.id);
    if (!tattoo) {
      return res.status(404).json({ error: 'Tattoo not found' });
    }
    res.json(tattoo);
  } catch (err) {
    console.error('Get tattoo error:', err);
    res.status(500).json({ error: 'Failed to fetch tattoo' });
  }
});

// Create tattoo (admin only)
app.post('/api/tattoos', authenticateToken, isAdmin, upload.single('image'), (req, res) => {
  try {
    const { title, category, description } = req.body;
    const imageUrl = req.file ? `/uploads/${req.file.filename}` : '/images/default-tattoo.jpg';

    const result = db.prepare(`
      INSERT INTO tattoos (title, category, description, image_url)
      VALUES (?, ?, ?, ?)
    `).run(title, category, description, imageUrl);

    res.status(201).json({ message: 'Tattoo created successfully', tattooId: result.lastInsertRowid });
  } catch (err) {
    console.error('Create tattoo error:', err);
    res.status(500).json({ error: 'Failed to create tattoo' });
  }
});

// Update tattoo (admin only)
app.put('/api/tattoos/:id', authenticateToken, isAdmin, upload.single('image'), (req, res) => {
  try {
    const { title, category, description } = req.body;
    const tattoo = db.prepare('SELECT * FROM tattoos WHERE id = ?').get(req.params.id);

    if (!tattoo) {
      return res.status(404).json({ error: 'Tattoo not found' });
    }

    const imageUrl = req.file ? `/uploads/${req.file.filename}` : tattoo.image_url;

    db.prepare(`
      UPDATE tattoos
      SET title = ?, category = ?, description = ?, image_url = ?
      WHERE id = ?
    `).run(title, category, description, imageUrl, req.params.id);

    res.json({ message: 'Tattoo updated successfully' });
  } catch (err) {
    console.error('Update tattoo error:', err);
    res.status(500).json({ error: 'Failed to update tattoo' });
  }
});

// Delete tattoo (admin only)
app.delete('/api/tattoos/:id', authenticateToken, isAdmin, (req, res) => {
  try {
    db.prepare('DELETE FROM tattoos WHERE id = ?').run(req.params.id);
    res.json({ message: 'Tattoo deleted successfully' });
  } catch (err) {
    console.error('Delete tattoo error:', err);
    res.status(500).json({ error: 'Failed to delete tattoo' });
  }
});

// =============== ARTIST ROUTES ===============

// Get all artists
app.get('/api/artists', (req, res) => {
  try {
    const artists = db.prepare('SELECT * FROM artists ORDER BY name').all();
    res.json(artists);
  } catch (err) {
    console.error('Get artists error:', err);
    res.status(500).json({ error: 'Failed to fetch artists' });
  }
});

// Create artist (admin only)
app.post('/api/artists', authenticateToken, isAdmin, upload.single('image'), (req, res) => {
  try {
    const { name, bio, specialization } = req.body;
    const imageUrl = req.file ? `/uploads/${req.file.filename}` : '/images/default-artist.jpg';

    const result = db.prepare(`
      INSERT INTO artists (name, bio, specialization, image_url)
      VALUES (?, ?, ?, ?)
    `).run(name, bio, specialization, imageUrl);

    res.status(201).json({ message: 'Artist created successfully', artistId: result.lastInsertRowid });
  } catch (err) {
    console.error('Create artist error:', err);
    res.status(500).json({ error: 'Failed to create artist' });
  }
});

// Update artist (admin only)
app.put('/api/artists/:id', authenticateToken, isAdmin, upload.single('image'), (req, res) => {
  try {
    const { name, bio, specialization } = req.body;
    const artist = db.prepare('SELECT * FROM artists WHERE id = ?').get(req.params.id);

    if (!artist) {
      return res.status(404).json({ error: 'Artist not found' });
    }

    const imageUrl = req.file ? `/uploads/${req.file.filename}` : artist.image_url;

    db.prepare(`
      UPDATE artists
      SET name = ?, bio = ?, specialization = ?, image_url = ?
      WHERE id = ?
    `).run(name, bio, specialization, imageUrl, req.params.id);

    res.json({ message: 'Artist updated successfully' });
  } catch (err) {
    console.error('Update artist error:', err);
    res.status(500).json({ error: 'Failed to update artist' });
  }
});

// Delete artist (admin only)
app.delete('/api/artists/:id', authenticateToken, isAdmin, (req, res) => {
  try {
    db.prepare('DELETE FROM artists WHERE id = ?').run(req.params.id);
    res.json({ message: 'Artist deleted successfully' });
  } catch (err) {
    console.error('Delete artist error:', err);
    res.status(500).json({ error: 'Failed to delete artist' });
  }
});

// =============== APPOINTMENT ROUTES ===============

// Create appointment
app.post('/api/appointments', authenticateToken, upload.single('customDesign'), (req, res) => {
  try {
    const { artistId, tattooId, appointmentDate, appointmentTime, notes } = req.body;
    const customDesignUrl = req.file ? `/uploads/${req.file.filename}` : null;

    const result = db.prepare(`
      INSERT INTO appointments (user_id, artist_id, tattoo_id, custom_design_url, appointment_date, appointment_time, notes)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(req.user.id, artistId, tattooId || null, customDesignUrl, appointmentDate, appointmentTime, notes);

    // Create notification for user
    db.prepare(`
      INSERT INTO notifications (user_id, message)
      VALUES (?, ?)
    `).run(req.user.id, 'Your appointment request has been submitted and is pending approval.');

    res.status(201).json({ message: 'Appointment created successfully', appointmentId: result.lastInsertRowid });
  } catch (err) {
    console.error('Create appointment error:', err);
    res.status(500).json({ error: 'Failed to create appointment' });
  }
});

// Get user appointments
app.get('/api/appointments/my', authenticateToken, (req, res) => {
  try {
    const appointments = db.prepare(`
      SELECT
        a.*,
        ar.name as artist_name,
        ar.specialization as artist_specialization,
        t.title as tattoo_title,
        t.image_url as tattoo_image
      FROM appointments a
      LEFT JOIN artists ar ON a.artist_id = ar.id
      LEFT JOIN tattoos t ON a.tattoo_id = t.id
      WHERE a.user_id = ?
      ORDER BY a.appointment_date DESC, a.appointment_time DESC
    `).all(req.user.id);

    res.json(appointments);
  } catch (err) {
    console.error('Get user appointments error:', err);
    res.status(500).json({ error: 'Failed to fetch appointments' });
  }
});

// Get all appointments (admin only)
app.get('/api/appointments', authenticateToken, isAdmin, (req, res) => {
  try {
    const appointments = db.prepare(`
      SELECT
        a.*,
        u.username,
        u.email,
        u.first_name,
        u.last_name,
        ar.name as artist_name,
        t.title as tattoo_title
      FROM appointments a
      JOIN users u ON a.user_id = u.id
      JOIN artists ar ON a.artist_id = ar.id
      LEFT JOIN tattoos t ON a.tattoo_id = t.id
      ORDER BY a.created_at DESC
    `).all();

    res.json(appointments);
  } catch (err) {
    console.error('Get all appointments error:', err);
    res.status(500).json({ error: 'Failed to fetch appointments' });
  }
});

// Update appointment status (admin only)
app.put('/api/appointments/:id/status', authenticateToken, isAdmin, (req, res) => {
  try {
    const { status } = req.body;

    if (!['pending', 'approved', 'declined', 'completed'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const appointment = db.prepare('SELECT user_id FROM appointments WHERE id = ?').get(req.params.id);
    if (!appointment) {
      return res.status(404).json({ error: 'Appointment not found' });
    }

    db.prepare('UPDATE appointments SET status = ? WHERE id = ?').run(status, req.params.id);

    // Create notification for user
    const statusMessages = {
      approved: 'Your appointment has been approved!',
      declined: 'Your appointment has been declined. Please contact us for more information.',
      completed: 'Your appointment has been marked as completed. Thank you!'
    };

    if (statusMessages[status]) {
      db.prepare(`
        INSERT INTO notifications (user_id, message)
        VALUES (?, ?)
      `).run(appointment.user_id, statusMessages[status]);
    }

    res.json({ message: 'Appointment status updated successfully' });
  } catch (err) {
    console.error('Update appointment status error:', err);
    res.status(500).json({ error: 'Failed to update appointment status' });
  }
});

// =============== NOTIFICATION ROUTES ===============

// Get user notifications
app.get('/api/notifications', authenticateToken, (req, res) => {
  try {
    const notifications = db.prepare(`
      SELECT * FROM notifications
      WHERE user_id = ?
      ORDER BY created_at DESC
      LIMIT 20
    `).all(req.user.id);

    res.json(notifications);
  } catch (err) {
    console.error('Get notifications error:', err);
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
});

// Mark notification as read
app.put('/api/notifications/:id/read', authenticateToken, (req, res) => {
  try {
    db.prepare('UPDATE notifications SET is_read = 1 WHERE id = ? AND user_id = ?').run(req.params.id, req.user.id);
    res.json({ message: 'Notification marked as read' });
  } catch (err) {
    console.error('Mark notification read error:', err);
    res.status(500).json({ error: 'Failed to mark notification as read' });
  }
});

// =============== ADMIN ANALYTICS ROUTES ===============

// Get dashboard statistics (admin only)
app.get('/api/admin/stats', authenticateToken, isAdmin, (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];

    const todayAppointments = db.prepare(`
      SELECT COUNT(*) as count FROM appointments
      WHERE DATE(appointment_date) = ?
    `).get(today).count;

    const pendingAppointments = db.prepare(`
      SELECT COUNT(*) as count FROM appointments
      WHERE status = 'pending'
    `).get().count;

    const popularCategory = db.prepare(`
      SELECT t.category, COUNT(*) as count
      FROM appointments a
      JOIN tattoos t ON a.tattoo_id = t.id
      WHERE a.tattoo_id IS NOT NULL
      GROUP BY t.category
      ORDER BY count DESC
      LIMIT 1
    `).get();

    const mostBookedArtist = db.prepare(`
      SELECT ar.name, COUNT(*) as count
      FROM appointments a
      JOIN artists ar ON a.artist_id = ar.id
      GROUP BY a.artist_id
      ORDER BY count DESC
      LIMIT 1
    `).get();

    res.json({
      todayAppointments,
      pendingAppointments,
      popularCategory: popularCategory ? popularCategory.category : 'N/A',
      mostBookedArtist: mostBookedArtist ? mostBookedArtist.name : 'N/A'
    });
  } catch (err) {
    console.error('Get stats error:', err);
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log('Default admin login - username: admin, password: admin123');
});
