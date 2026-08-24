require("dotenv").config();

const express = require("express");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { Pool } = require("pg");

const app = express();


// ======================================================
// MIDDLEWARE
// ======================================================

app.use(express.json());

app.use(
  cors({
    origin: [
      "https://ganesh-af34.onrender.com",
      "https://omkarphadtare53-lgtm.github.io"
    ],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
  })
);


// ======================================================
// DATABASE
// ======================================================

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});


// ======================================================
// PORT
// ======================================================

const PORT = process.env.PORT || 10000;


// ======================================================
// TEST BACKEND
// ======================================================

app.get("/", async (req, res) => {

  try {

    await pool.query("SELECT 1");

    res.json({
      success: true,
      database: "connected",
      message: "Ganesh backend is working!"
    });

  } catch (error) {

    console.error("DATABASE ERROR:", error);

    res.status(500).json({
      success: false,
      database: "disconnected",
      error: error.message
    });
  }
});


// ======================================================
// DATABASE TEST
// ======================================================

app.get("/api/db-test", async (req, res) => {

  try {

    await pool.query("SELECT 1");

    res.json({
      success: true,
      database: "connected"
    });

  } catch (error) {

    console.error("DB TEST ERROR:", error);

    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});


// ======================================================
// USERS TEST
// ======================================================

app.get("/api/users-test", async (req, res) => {

  try {

    const result = await pool.query(
      `SELECT id, name, email, mobile, role
       FROM users
       ORDER BY id`
    );

    res.json({
      success: true,
      users: result.rows
    });

  } catch (error) {

    console.error("USERS TEST ERROR:", error);

    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});


// ======================================================
// REGISTER
// ======================================================

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
        message:
          "Name, mobile/email and password are required"
      });

    }


    if (password.length < 8) {

      return res.status(400).json({
        message:
          "Password must be at least 8 characters"
      });

    }


    if (mobile && !/^[0-9]{10}$/.test(mobile)) {

      return res.status(400).json({
        message:
          "Mobile number must contain 10 digits"
      });

    }


    // Check email

    if (email) {

      const existingEmail = await pool.query(
        "SELECT id FROM users WHERE email = $1",
        [email.toLowerCase()]
      );

      if (existingEmail.rows.length > 0) {

        return res.status(409).json({
          message:
            "Email already registered"
        });

      }

    }


    // Check mobile

    if (mobile) {

      const existingMobile = await pool.query(
        "SELECT id FROM users WHERE mobile = $1",
        [mobile]
      );

      if (existingMobile.rows.length > 0) {

        return res.status(409).json({
          message:
            "Mobile number already registered"
        });

      }

    }


    const passwordHash =
      await bcrypt.hash(password, 12);


    const result = await pool.query(

      `INSERT INTO users
       (name, email, mobile, password_hash, role)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, name, email, mobile, role`,

      [
        name.trim(),
        email
          ? email.toLowerCase()
          : null,
        mobile || null,
        passwordHash,
        "user"
      ]

    );


    res.status(201).json({

      success: true,

      message:
        "Registration successful",

      user:
        result.rows[0]

    });


  } catch (error) {

    console.error(
      "REGISTER ERROR:",
      error
    );

    res.status(500).json({
      message:
        "Server error"
    });

  }

});


// ======================================================
// LOGIN
// ======================================================

app.post("/api/login", async (req, res) => {

  try {

    const {
      mobile,
      password
    } = req.body;


    if (!mobile || !password) {

      return res.status(400).json({
        message:
          "Mobile number and password are required"
      });

    }


    if (!/^[0-9]{10}$/.test(mobile)) {

      return res.status(400).json({
        message:
          "Invalid mobile number"
      });

    }


    const result = await pool.query(

      `SELECT
        id,
        name,
        email,
        mobile,
        password_hash,
        role
       FROM users
       WHERE mobile = $1`,

      [mobile]

    );


    if (result.rows.length === 0) {

      return res.status(401).json({
        message:
          "Invalid mobile number or password"
      });

    }


    const user =
      result.rows[0];


    // Password check

    const validPassword =
      await bcrypt.compare(
        password,
        user.password_hash
      );


    if (!validPassword) {

      return res.status(401).json({
        message:
          "Invalid mobile number or password"
      });

    }


    // Admin check

    if (user.role !== "admin") {

      return res.status(403).json({
        message:
          "Admin access required"
      });

    }


    // JWT

    if (!process.env.JWT_SECRET) {

      console.error(
        "JWT_SECRET is missing"
      );

      return res.status(500).json({
        message:
          "JWT_SECRET is not configured"
      });

    }


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

      message:
        "Admin login successful",

      token,

      user: {

        id: user.id,

        name: user.name,

        email: user.email,

        mobile: user.mobile,

        role: user.role

      }

    });


  } catch (error) {

    console.error(
      "LOGIN ERROR:",
      error
    );

    res.status(500).json({
      message:
        "Server error",
      error:
        error.message
    });

  }

});


// ======================================================
// AUTHENTICATION MIDDLEWARE
// ======================================================

function authenticateToken(
  req,
  res,
  next
) {

  const authHeader =
    req.headers.authorization;


  if (
    !authHeader ||
    !authHeader.startsWith("Bearer ")
  ) {

    return res.status(401).json({
      message:
        "Authentication required"
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

    req.user =
      decoded;

    next();


  } catch (error) {

    console.error(
      "TOKEN ERROR:",
      error.message
    );

    return res.status(401).json({
      message:
        "Invalid or expired token"
    });

  }

}


// ======================================================
// ADMIN MIDDLEWARE
// ======================================================

function requireAdmin(
  req,
  res,
  next
) {

  if (
   
