require("dotenv").config();

const express = require("express");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { Pool } = require("pg");

const app = express();

app.use(express.json());

app.use(
  cors({
    origin: process.env.FRONTEND_URL
  })
);

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

const PORT = process.env.PORT || 10000;


// ==========================================
// TEST
// ==========================================

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Ekopa backend is working!"
  });
});


// ==========================================
// REGISTER
// ==========================================

app.post("/api/register", async (req, res) => {
  try {

    const {
      name,
      email,
      mobile,
      password
    } = req.body;

    if (!name || !password || (!email && !mobile)) {
      return res.status(400).json({
        message: "Name, mobile/email and password are required"
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        message: "Password must be at least 8 characters"
      });
    }

    // Check mobile format if provided
    if (mobile && !/^[0-9]{10}$/.test(mobile)) {
      return res.status(400).json({
        message: "Mobile number must contain 10 digits"
      });
    }

    // Check existing email
    if (email) {

      const existingEmail = await pool.query(
        "SELECT id FROM users WHERE email = $1",
        [email.toLowerCase()]
      );

      if (existingEmail.rows.length > 0) {
        return res.status(409).json({
          message: "Email already registered"
        });
      }
    }

    // Check existing mobile
    if (mobile) {

      const existingMobile = await pool.query(
        "SELECT id FROM users WHERE mobile = $1",
        [mobile]
      );

      if (existingMobile.rows.length > 0) {
        return res.status(409).json({
          message: "Mobile number already registered"
        });
      }
    }

    const passwordHash = await bcrypt.hash(
      password,
      12
    );

    const result = await pool.query(
      `INSERT INTO users
       (name, email, mobile, password_hash, role)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, name, email, mobile, role`,
      [
        name.trim(),
        email ? email.toLowerCase() : null,
        mobile || null,
        passwordHash,
        "user"
      ]
    );

    res.status(201).json({
      success: true,
      message: "Registration successful",
      user: result.rows[0]
    });

  } catch (error) {

    console.error("REGISTER ERROR:", error);

    res.status(500).json({
      message: "Server error"
    });
  }
});


// ==========================================
// LOGIN
// ==========================================

app.post("/api/login", async (req, res) => {

  try {

    const {
      mobile,
      password
    } = req.body;

    if (!mobile || !password) {
      return res.status(400).json({
        message: "Mobile number and password are required"
      });
    }

    // Validate mobile
    if (!/^[0-9]{10}$/.test(mobile)) {
      return res.status(400).json({
        message: "Invalid mobile number"
      });
    }

    // Find user
    const result = await pool.query(
      "SELECT * FROM users WHERE mobile = $1",
      [mobile]
    );

    if (result.rows.length === 0) {

      return res.status(401).json({
        message: "Invalid mobile number or password"
      });
    }

    const user = result.rows[0];

    // Check password
    const validPassword =
      await bcrypt.compare(
        password,
        user.password_hash
      );

    if (!validPassword) {

      return res.status(401).json({
        message: "Invalid mobile number or password"
      });
    }

    // IMPORTANT:
    // Only admin can access Admin Portal

    if (user.role !== "admin") {

      return res.status(403).json({
        message: "Admin access required"
      });
    }

    // Create JWT
    const token = jwt.sign(
      {
        id: user.id,
        mobile: user.mobile,
        role: user.role
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "1h"
      }
    );

    res.json({

      success: true,

      message: "Admin login successful",

      token,

      user: {
        id: user.id,
        name: user.name,
        mobile: user.mobile,
        role: user.role
      }

    });

  } catch (error) {

    console.error("LOGIN ERROR:", error);

    res.status(500).json({
      message: "Server error"
    });
  }
});


// ==========================================
// AUTHENTICATION MIDDLEWARE
// ==========================================

function authenticateToken(req, res, next) {

  const authHeader =
    req.headers.authorization;

  if (
    !authHeader ||
    !authHeader.startsWith("Bearer ")
  ) {

    return res.status(401).json({
      message: "Authentication required"
    });
  }

  const token =
    authHeader.substring(7);

  try {

    const decoded =
      jwt.verify(
        token,
        process.env.JWT_SECRET
      );

    req.user = decoded;

    next();

  } catch (error) {

    return res.status(401).json({
      message: "Invalid or expired token"
    });
  }
}


// ==========================================
// CURRENT USER
// ==========================================

app.get(
  "/api/me",
  authenticateToken,
  async (req, res) => {

    try {

      const result = await pool.query(
        `SELECT id, name, email, mobile, role
         FROM users
         WHERE id = $1`,
        [req.user.id]
      );

      if (result.rows.length === 0) {

        return res.status(404).json({
          message: "User not found"
        });
      }

      const user = result.rows[0];

      if (user.role !== "admin") {

        return res.status(403).json({
          message: "Admin access required"
        });
      }

      res.json({
        success: true,
        user
      });

    } catch (error) {

      console.error("ME ERROR:", error);

      res.status(500).json({
        message: "Server error"
      });
    }
  }
);


// ==========================================
// LOGOUT
// ==========================================

app.post(
  "/api/logout",
  authenticateToken,
  (req, res) => {

    res.json({
      success: true,
      message: "Logout successful"
    });

  }
);


// ==========================================
// START SERVER
// ==========================================

app.listen(
  PORT,
  "0.0.0.0",
  () => {
    console.log(
      `ganesh backend running on port ${PORT}`
    );
  }
);
