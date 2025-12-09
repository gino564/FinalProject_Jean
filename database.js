const Database = require('better-sqlite3');
const bcrypt = require('bcryptjs');
const path = require('path');

const db = new Database(path.join(__dirname, 'tattoo_studio.db'));

// Enable foreign keys
db.pragma('foreign_keys = ON');

// Initialize database tables
function initializeDatabase() {
  // Users table
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      first_name TEXT NOT NULL,
      last_name TEXT NOT NULL,
      role TEXT DEFAULT 'user' CHECK(role IN ('user', 'admin')),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Artists table
  db.exec(`
    CREATE TABLE IF NOT EXISTS artists (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      bio TEXT,
      specialization TEXT,
      image_url TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Tattoo designs table
  db.exec(`
    CREATE TABLE IF NOT EXISTS tattoos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      category TEXT NOT NULL,
      description TEXT,
      image_url TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Appointments table
  db.exec(`
    CREATE TABLE IF NOT EXISTS appointments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      artist_id INTEGER NOT NULL,
      tattoo_id INTEGER,
      custom_design_url TEXT,
      appointment_date DATE NOT NULL,
      appointment_time TEXT NOT NULL,
      notes TEXT,
      status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'approved', 'declined', 'completed')),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (artist_id) REFERENCES artists(id) ON DELETE CASCADE,
      FOREIGN KEY (tattoo_id) REFERENCES tattoos(id) ON DELETE SET NULL
    )
  `);

  // Notifications table
  db.exec(`
    CREATE TABLE IF NOT EXISTS notifications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      message TEXT NOT NULL,
      is_read INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  // Insert default admin user (password: admin123)
  const adminExists = db.prepare('SELECT id FROM users WHERE username = ?').get('admin');
  if (!adminExists) {
    const hashedPassword = bcrypt.hashSync('admin123', 10);
    db.prepare(`
      INSERT INTO users (username, email, password, first_name, last_name, role)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run('admin', 'admin@jinktattoo.com', hashedPassword, 'Admin', 'User', 'admin');
    console.log('Default admin created (username: admin, password: admin123)');
  }

  // Insert sample artists
  const artistCount = db.prepare('SELECT COUNT(*) as count FROM artists').get().count;
  if (artistCount === 0) {
    const artists = [
      ['Mike Shadow', 'Specialist in dark realism and portraits', 'Realism', '/images/artists/mike.jpg'],
      ['Sarah Ink', 'Expert in traditional Japanese and Asian styles', 'Japanese', '/images/artists/sarah.jpg'],
      ['Alex Storm', 'Master of geometric and abstract designs', 'Geometric', '/images/artists/alex.jpg'],
      ['Luna Rose', 'Specialist in fine line and watercolor tattoos', 'Watercolor', '/images/artists/luna.jpg']
    ];

    const insertArtist = db.prepare('INSERT INTO artists (name, bio, specialization, image_url) VALUES (?, ?, ?, ?)');
    artists.forEach(artist => insertArtist.run(...artist));
    console.log('Sample artists inserted');
  }

  // Insert sample tattoo designs
  const tattooCount = db.prepare('SELECT COUNT(*) as count FROM tattoos').get().count;
  if (tattooCount === 0) {
    const tattoos = [
      ['Dragon Sleeve', 'Arm', 'Traditional Japanese dragon design for full sleeve', '/images/tattoos/dragon.jpg'],
      ['Phoenix Back', 'Back', 'Large phoenix rising from ashes', '/images/tattoos/phoenix.jpg'],
      ['Geometric Wolf', 'Arm', 'Modern geometric wolf design', '/images/tattoos/wolf.jpg'],
      ['Rose Shoulder', 'Shoulder', 'Realistic rose with thorns', '/images/tattoos/rose.jpg'],
      ['Skull Chest', 'Chest', 'Detailed skull with ornate details', '/images/tattoos/skull.jpg'],
      ['Mandala Forearm', 'Arm', 'Intricate mandala pattern', '/images/tattoos/mandala.jpg'],
      ['Lion Portrait', 'Chest', 'Majestic lion face portrait', '/images/tattoos/lion.jpg'],
      ['Butterfly Wrist', 'Wrist', 'Delicate butterfly design', '/images/tattoos/butterfly.jpg']
    ];

    const insertTattoo = db.prepare('INSERT INTO tattoos (title, category, description, image_url) VALUES (?, ?, ?, ?)');
    tattoos.forEach(tattoo => insertTattoo.run(...tattoo));
    console.log('Sample tattoo designs inserted');
  }

  console.log('Database initialized successfully');
}

// Initialize the database
initializeDatabase();

module.exports = db;
