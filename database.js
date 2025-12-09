const initSqlJs = require('sql.js');
const bcrypt = require('bcryptjs');
const path = require('path');
const fs = require('fs');

let db;
const dbPath = path.join(__dirname, 'tattoo_studio.db');

// Initialize database tables
async function initializeDatabase() {
  const SQL = await initSqlJs();

  // Load existing database or create new one
  let buffer;
  if (fs.existsSync(dbPath)) {
    buffer = fs.readFileSync(dbPath);
    db = new SQL.Database(buffer);
    console.log('Database loaded from file');
  } else {
    db = new SQL.Database();
    console.log('New database created');
  }
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
  const adminCheck = db.exec('SELECT id FROM users WHERE username = "admin"');
  if (adminCheck.length === 0 || adminCheck[0].values.length === 0) {
    const hashedPassword = bcrypt.hashSync('admin123', 10);
    db.run(
      'INSERT INTO users (username, email, password, first_name, last_name, role) VALUES (?, ?, ?, ?, ?, ?)',
      ['admin', 'admin@jinktattoo.com', hashedPassword, 'Admin', 'User', 'admin']
    );
    console.log('Default admin created (username: admin, password: admin123)');
  }

  // Insert sample artists
  const artistCheck = db.exec('SELECT COUNT(*) as count FROM artists');
  const artistCount = artistCheck[0]?.values[0]?.[0] || 0;

  if (artistCount === 0) {
    const artists = [
      ['Mike Shadow', 'Specialist in dark realism and portraits', 'Realism', '/images/artists/mike.jpg'],
      ['Sarah Ink', 'Expert in traditional Japanese and Asian styles', 'Japanese', '/images/artists/sarah.jpg'],
      ['Alex Storm', 'Master of geometric and abstract designs', 'Geometric', '/images/artists/alex.jpg'],
      ['Luna Rose', 'Specialist in fine line and watercolor tattoos', 'Watercolor', '/images/artists/luna.jpg']
    ];

    artists.forEach(artist => {
      db.run('INSERT INTO artists (name, bio, specialization, image_url) VALUES (?, ?, ?, ?)', artist);
    });
    console.log('Sample artists inserted');
  }

  // Insert sample tattoo designs
  const tattooCheck = db.exec('SELECT COUNT(*) as count FROM tattoos');
  const tattooCount = tattooCheck[0]?.values[0]?.[0] || 0;

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

    tattoos.forEach(tattoo => {
      db.run('INSERT INTO tattoos (title, category, description, image_url) VALUES (?, ?, ?, ?)', tattoo);
    });
    console.log('Sample tattoo designs inserted');
  }

  // Save database to file
  saveDatabase();

  console.log('Database initialized successfully');
}

// Save database to file
function saveDatabase() {
  if (db) {
    const data = db.export();
    const buffer = Buffer.from(data);
    fs.writeFileSync(dbPath, buffer);
  }
}

// Wrapper functions for compatibility with better-sqlite3 API
const dbWrapper = {
  prepare: (sql) => {
    return {
      run: (...params) => {
        const stmt = db.prepare(sql);
        stmt.bind(params);
        stmt.step();
        const lastInsertRowid = db.exec('SELECT last_insert_rowid()')[0]?.values[0]?.[0] || 0;
        stmt.free();
        saveDatabase();
        return { lastInsertRowid };
      },
      get: (...params) => {
        const stmt = db.prepare(sql);
        stmt.bind(params);
        const result = stmt.step() ? stmt.getAsObject() : null;
        stmt.free();
        return result;
      },
      all: (...params) => {
        const stmt = db.prepare(sql);
        stmt.bind(params);
        const results = [];
        while (stmt.step()) {
          results.push(stmt.getAsObject());
        }
        stmt.free();
        return results;
      }
    };
  },
  exec: (sql) => {
    db.run(sql);
    saveDatabase();
  }
};

// Initialize the database
let dbReady = false;
initializeDatabase().then(() => {
  dbReady = true;
}).catch(err => {
  console.error('Database initialization failed:', err);
  process.exit(1);
});

// Export a proxy that waits for database to be ready
module.exports = new Proxy({}, {
  get: (target, prop) => {
    if (!dbReady || !db) {
      throw new Error('Database not initialized yet. Please wait for initialization to complete.');
    }
    return dbWrapper[prop];
  }
});
