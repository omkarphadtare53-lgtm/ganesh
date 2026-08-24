require("dotenv").config();

const express = require("express");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { Pool } = require("pg");

const app = express();


// =====================================================
// MIDDLEWARE
// =====================================================

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


// =====================================================
// DATABASE
// =====================================================

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});


// =====================================================
// PORT
// =====================================================

const PORT = process.env.PORT || 10000;


// =====================================================
// HOME / SERVER TEST
// =====================================================

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


// =====================================================
// DATABASE TEST
// =====================================================

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


// =====================================================
// USERS TEST
// =====================================================

app.get("/api/users-test", async (req, res) => {
  try {
    const result = await pool.query(
      `
      SELECT
        id,
        name,
        email,
        mobile,
        role
      FROM users
      ORDER BY id
      `
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


// =====================================================
// REGISTER
// =====================================================

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
        success: false,
        message:
          "Name, mobile/email and password are required"
      });
    }


    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message:
          "Password must be at least 8 characters"
      });
    }


    if (mobile && !/^[0-9]{10}$/.test(mobile)) {
      return res.status(400).json({
        success: false,
        message:
          "Mobile number must contain 10 digits"
      });
    }


    // ---------------------------------------------
    // CHECK EMAIL
    // ---------------------------------------------

    if (email) {

      const existingEmail =
        await pool.query(
          "SELECT id FROM users WHERE email = $1",
          [email.toLowerCase()]
        );


      if (existingEmail.rows.length > 0) {

        return res.status(409).json({
          success: false,
          message:
            "Email already registered"
        });

      }
    }


    // ---------------------------------------------
    // CHECK MOBILE
    // ---------------------------------------------

    if (mobile) {

      const existingMobile =
        await pool.query(
          "SELECT id FROM users WHERE mobile = $1",
          [mobile]
        );


      if (existingMobile.rows.length > 0) {

        return res.status(409).json({
          success: false,
          message:
            "Mobile number already registered"
        });

      }
    }


    // ---------------------------------------------
    // HASH PASSWORD
    // ---------------------------------------------

    const passwordHash =
      await bcrypt.hash(password, 12);


    // ---------------------------------------------
    // INSERT USER
    // ---------------------------------------------

    const result =
      await pool.query(
        `
        INSERT INTO users
        (
          name,
          email,
          mobile,
          password_hash,
          role
        )
        VALUES
        ($1, $2, $3, $4, $5)
        RETURNING
          id,
          name,
          email,
          mobile,
          role
        `,
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
       
