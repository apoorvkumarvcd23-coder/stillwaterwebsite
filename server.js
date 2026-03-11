require('dotenv').config();
const express = require('express');
const session = require('express-session');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const path = require('path');
const fs = require('fs');
const sqlite3 = require('sqlite3').verbose();
const SQLiteStore = require('connect-sqlite3')(session);

const app = express();
const PORT = process.env.PORT || 3000;

// === DATABASE CONFIGURATION ===
// Use persistent path in production if available (e.g., /data/stillwater.sqlite on Render)
const DB_PATH = process.env.DB_PATH || './stillwater.sqlite';

// Ensure the directory for the database exists (critical for Render persistent disk on first boot)
const DB_DIR = path.dirname(DB_PATH);
if (!fs.existsSync(DB_DIR)) {
  fs.mkdirSync(DB_DIR, { recursive: true });
  console.log(`Created database directory: ${DB_DIR}`);
}

const db = new sqlite3.Database(DB_PATH, (err) => {
  if (err) {
    console.error('Error opening database', err.message);
  } else {
    // Create users table if it doesn't exist
    // Includes a default 'customer' role
    db.run(`CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT,
      email TEXT,
      role TEXT DEFAULT 'customer'
    )`);

    // Create a generic settings table to store application state like fundraising amount
    db.run(`CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT
    )`, () => {
      // Seed the default fundraising amount if it doesn't exist
      db.run(`INSERT OR IGNORE INTO settings (key, value) VALUES ('fundraising_amount', '1250000')`);
      db.run(`INSERT OR IGNORE INTO settings (key, value) VALUES ('waitlist_count', '842')`);
      
      // Trust Indicators
      db.run(`INSERT OR IGNORE INTO settings (key, value) VALUES ('centres_count', '40K+')`);
      db.run(`INSERT OR IGNORE INTO settings (key, value) VALUES ('tourists_count', '600K')`);
      db.run(`INSERT OR IGNORE INTO settings (key, value) VALUES ('providers_count', '4')`);
      db.run(`INSERT OR IGNORE INTO settings (key, value) VALUES ('authenticity_pct', '100%')`);
    });
  }
});

// Middleware for parsing URL-encoded form data
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Session Configuration
app.use(session({
  store: new SQLiteStore({
    db: path.basename(DB_PATH), // The filename part
    table: 'sessions',       
    dir: path.dirname(DB_PATH)  // The directory part
  }),
  secret: process.env.SESSION_SECRET || 'stillwater-digital-sanctuary-secret',
  resave: false,
  saveUninitialized: false, // Don't create sessions until something is stored
  cookie: {
    maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days in milliseconds
  }
}));

// Passport Configuration
app.use(passport.initialize());
app.use(passport.session());

// Serialize user ID to the session
passport.serializeUser((user, done) => {
  done(null, user.id);
});

// Deserialize user from the database by ID
passport.deserializeUser((id, done) => {
  db.get("SELECT * FROM users WHERE id = ?", [id], (err, row) => {
    done(err, row);
  });
});

// Avoid crashes if Google OAuth credentials aren't set up yet
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "/auth/google/callback"
  },
  function(accessToken, refreshToken, profile, cb) {
    const email = profile.emails && profile.emails.length > 0 ? profile.emails[0].value : null;
    const adminEmail = process.env.ADMIN_EMAIL;

    // Check if user already exists in the SQLite database
    db.get("SELECT * FROM users WHERE id = ?", [profile.id], (err, row) => {
      if (err) return cb(err);

      if (row) {
        // User exists. Bootstrap rule: check if their email matches the env ADMIN_EMAIL
        // If it matches and they aren't admin yet, immediately escalate their privileges.
        if (email === adminEmail && row.role !== 'admin') {
          db.run("UPDATE users SET role = 'admin' WHERE id = ?", [profile.id], (updateErr) => {
            if (updateErr) return cb(updateErr);
            row.role = 'admin'; // Update local object
            return cb(null, row);
          });
        } else {
          return cb(null, row); // Proceed with current role
        }
      } else {
        // New user. Bootstrap check determines initial role.
        const role = (email === adminEmail) ? 'admin' : 'customer';
        const user = {
          id: profile.id,
          name: profile.displayName,
          email: email,
          role: role
        };

        db.run("INSERT INTO users (id, name, email, role) VALUES (?, ?, ?, ?)", 
          [user.id, user.name, user.email, user.role], (insertErr) => {
            if (insertErr) return cb(insertErr);
            
            // Increment the waitlist count asynchronously for new users
            db.run("UPDATE settings SET value = CAST(value AS INTEGER) + 1 WHERE key = 'waitlist_count'");
            
            return cb(null, user);
        });
      }
    });

  }));
} else {
  console.warn("WARNING: GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET is missing. OAuth will not work.");
}

// === RBAC MIDDLEWARE ===

// Check for specific role, preventing access otherwise with a 403 Forbidden.
const requireRole = (role) => {
  return (req, res, next) => {
    if (!req.isAuthenticated()) {
      return res.redirect('/auth.html');
    }
    if (req.user.role !== role) {
      return res.status(403).send(`
        <div style="font-family: 'Inter', sans-serif; text-align: center; margin-top: 10rem;">
          <h2 style="color: #031418; font-size: 3rem;">403 Forbidden</h2>
          <p style="color: #666; margin-bottom: 2rem;">You do not have administrative privileges to access The Bridge.</p>
          <a href="/portal.html" style="background:#00E5FF; color:#031418; padding: 1rem 2rem; text-decoration: none; border-radius: 4px; font-weight: 500;">Return to Portal</a>
        </div>
      `);
    }
    next();
  };
};

// Standard login check
const requireAuth = (req, res, next) => {
  if (!req.isAuthenticated()) {
    return res.redirect('/auth.html');
  }
  next();
};

// === PROTECTED ROUTES ===

// These must be defined before express.static so that it intercepts the file delivery
app.get('/admin.html', requireRole('admin'), (req, res) => {
  res.sendFile(path.join(__dirname, 'admin.html'));
});

// Route to handle the manual fund update from the Admin dashboard
app.post('/admin/update-funds', requireRole('admin'), (req, res) => {
  const newAmount = req.body.fundAmount;
  if (!newAmount || isNaN(newAmount)) {
    return res.status(400).send("Invalid fund amount provided.");
  }
  
  db.run("UPDATE settings SET value = ? WHERE key = 'fundraising_amount'", [newAmount.toString()], (err) => {
    if (err) {
      console.error("Failed to update fundraising amount:", err);
      return res.status(500).send("Internal Server Error");
    }
    res.redirect('/admin.html');
  });
});

// Route to handle the manual waitlist count update from the Admin dashboard
app.post('/admin/update-waitlist', requireRole('admin'), (req, res) => {
  const newCount = req.body.waitlistCount;
  if (!newCount || isNaN(newCount)) {
    return res.status(400).send("Invalid waitlist count provided.");
  }
  
  db.run("UPDATE settings SET value = ? WHERE key = 'waitlist_count'", [newCount.toString()], (err) => {
    if (err) {
      console.error("Failed to update waitlist count:", err);
      return res.status(500).send("Internal Server Error");
    }
    res.redirect('/admin.html');
  });
});

// Route to handle trust indicators update from the Admin dashboard
app.post('/admin/update-trust-stats', requireRole('admin'), (req, res) => {
  const { centresCount, touristsCount, providersCount, authenticityPct } = req.body;
  
  // Basic validation to ensure fields exist
  if (!centresCount || !touristsCount || !providersCount || !authenticityPct) {
    return res.status(400).send("All trust indicator fields are required.");
  }
  
  db.serialize(() => {
    db.run("UPDATE settings SET value = ? WHERE key = 'centres_count'", [centresCount]);
    db.run("UPDATE settings SET value = ? WHERE key = 'tourists_count'", [touristsCount]);
    db.run("UPDATE settings SET value = ? WHERE key = 'providers_count'", [providersCount]);
    db.run("UPDATE settings SET value = ? WHERE key = 'authenticity_pct'", [authenticityPct], (err) => {
      if (err) {
        console.error("Failed to update trust stats:", err);
        return res.status(500).send("Internal Server Error");
      }
      res.redirect('/admin.html');
    });
  });
});

app.get('/portal.html', requireAuth, (req, res) => {
  res.sendFile(path.join(__dirname, 'portal.html'));
});

// === API ROUTES ===
app.get('/api/funds', (req, res) => {
  db.get("SELECT value FROM settings WHERE key = 'fundraising_amount'", (err, row) => {
    if (err) {
      return res.status(500).json({ error: "Failed to fetch funds" });
    }
    const amount = row ? parseInt(row.value, 10) : 1250000;
    res.json({ amount: amount });
  });
});

app.get('/api/waitlist', (req, res) => {
  db.get("SELECT value FROM settings WHERE key = 'waitlist_count'", (err, row) => {
    if (err) {
      return res.status(500).json({ error: "Failed to fetch waitlist count" });
    }
    const count = row ? parseInt(row.value, 10) : 842;
    res.json({ count: count });
  });
});

app.get('/api/trust-stats', (req, res) => {
  db.all("SELECT key, value FROM settings WHERE key IN ('centres_count', 'tourists_count', 'providers_count', 'authenticity_pct')", (err, rows) => {
    if (err) {
      return res.status(500).json({ error: "Failed to fetch trust stats" });
    }
    
    // Default fallback values
    const stats = {
      centres: '40K+',
      tourists: '600K',
      providers: '4',
      authenticity: '100%'
    };

    if (rows) {
      rows.forEach(row => {
        if (row.key === 'centres_count') stats.centres = row.value;
        if (row.key === 'tourists_count') stats.tourists = row.value;
        if (row.key === 'providers_count') stats.providers = row.value;
        if (row.key === 'authenticity_pct') stats.authenticity = row.value;
      });
    }
    
    res.json(stats);
  });
});

// === STATIC & PUBLIC ROUTES ===

// Serve Static Assets (HTML/CSS/JS/Images)
app.use(express.static(path.join(__dirname)));

// Fallback for root
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Google OAuth Login Route
app.get('/auth/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

// Google OAuth Callback Route
app.get('/auth/google/callback', 
  passport.authenticate('google', { failureRedirect: '/auth.html' }),
  (req, res) => {
    // Determine redirect solely based on persistent DB role
    if (req.user.role === 'admin') {
      console.log(`[AUTH] Admin authenticated: ${req.user.email}`);
      res.redirect('/admin.html');
    } else {
      console.log(`[AUTH] Customer authenticated: ${req.user.email}`);
      res.redirect('/portal.html');
    }
  }
);

// Logout Route
app.get('/logout', (req, res, next) => {
  req.logout((err) => {
    if (err) { return next(err); }
    res.redirect('/');
  });
});

// Start Server
app.listen(PORT, () => {
  console.log(`🌊 Stillwater Digital Sanctuary running on http://localhost:${PORT}`);
});
