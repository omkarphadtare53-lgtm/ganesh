require("dotenv").config();

const express = require("express");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { Pool } = require("pg");

const app = express();

const PORT = process.env.PORT || 10000;


// ==========================================
// MIDDLEWARE
// ==========================================

app.use(express.json());

app.use(
  cors({
    origin: [
      "https://omkarphadtare53-lgtm.github.io",
      "https://ganesh-af34.onrender.com",
      "http://localhost:3000",
      "http://127.0.0.1:5500"
    ],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
  })
);


// ==========================================
// DATABASE
// ==========================================

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

pool.query("SELECT NOW()")
  .then(() => {
    console.log("DATABASE CONNECTED");
  })
  .catch((err) => {
    console.error("DATABASE CONNECTION ERROR:", err.message);
  });


// ==========================================
// HOME
// ==========================================

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Ganesh backend is working!"
  });
});


// ==========================================
// DATABASE TEST
// ==========================================

app.get("/api/db-test", async (req, res) => {
  try {
    const result = await pool.query("SELECT NOW()");

    res.json({
      success: true,
      database: "connected",
      time: result.rows[0].now
    });

  } catch (error) {
    console.error("DB TEST ERROR:", error);

    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});


// ==========================================
// USERS TEST
// ==========================================

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
      message: error.message
    });
  }
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
        success: false,
        message: "Name, mobile/email and password are required"
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 8 characters"
      });
    }

    if (mobile && !/^[0-9]{10}$/.test(mobile)) {
      return res.status(400).json({
        success: false,
        message: "Mobile number must contain 10 digits"
      });
    }

    if (email) {
      const existingEmail = await pool.query(
        "SELECT id FROM users WHERE email = $1",
        [email.toLowerCase()]
      );

      if (existingEmail.rows.length > 0) {
        return res.status(409).json({
          success: false,
          message: "Email already registered"
        });
      }
    }

    if (mobile) {
      const existingMobile = await pool.query(
        "SELECT id FROM users WHERE mobile = $1",
        [mobile]
      );

      if (existingMobile.rows.length > 0) {
        return res.status(409).json({
          success: false,
          message: "Mobile number already registered"
        });
      }
    }

    const passwordHash = await bcrypt.hash(password, 12);

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
      success: false,
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
        success: false,
        message: "Mobile number and password are required"
      });
    }

    if (!/^[0-9]{10}$/.test(mobile)) {
      return res.status(400).json({
        success: false,
        message: "Invalid mobile number"
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
        success: false,
        message: "Invalid mobile number or password"
      });
    }

    const user = result.rows[0];

    const validPassword = await bcrypt.compare(
      password,
      user.password_hash
    );

    if (!validPassword) {
      return res.status(401).json({
        success: false,
        message: "Invalid mobile number or password"
      });
    }

    if (user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Admin access required"
      });
    }

    if (!process.env.JWT_SECRET) {
      return res.status(500).json({
        success: false,
        message: "JWT_SECRET is not configured"
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
      message: "Admin login successful",
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
    console.error("LOGIN ERROR:", error);

    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
});


// ==========================================
// AUTH MIDDLEWARE
// ==========================================

function authenticateToken(req, res, next) {

  const authHeader = req.headers.authorization;

  if (
    !authHeader ||
    !authHeader.startsWith("Bearer ")
  ) {
    return res.status(401).json({
      success: false,
      message: "Authentication required"
    });
  }

  const token = authHeader.substring(7);

  try {

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    req.user = decoded;

    next();

  } catch (error) {

    return res.status(401).json({
      success: false,
      message: "Invalid or expired token"
    });
  }
}


// ==========================================
// CURRENT USER
// ==========================================

app.get("/api/me", authenticateToken, async (req, res) => {

  try {

    const result = await pool.query(
      `SELECT id, name, email, mobile, role
       FROM users
       WHERE id = $1`,
      [req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    const user = result.rows[0];

    if (user.role !== "admin") {
      return res.status(403).json({
        success: false,
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
      success: false,
      message: "Server error"
    });
  }
});


// ==========================================
// LOGOUT
// ==========================================

app.post("/api/logout", authenticateToken, (req, res) => {

  res.json({
    success: true,
    message: "Logout successful"
  });

});


// ==========================================
// PROGRAMS - GET
// ==========================================

app.get("/api/programs", async (req, res) => {

  try {

    const result = await pool.query(
      `SELECT
        id,
        title,
        program_date,
        program_time,
        description,
        created_at
       FROM programs
       ORDER BY program_date ASC, program_time ASC`
    );

    res.json({
      success: true,
      programs: result.rows
    });

  } catch (error) {

    console.error("PROGRAMS GET ERROR:", error);

    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
});


// ==========================================
// PROGRAMS - ADD
// ==========================================

app.post(
  "/api/programs",
  authenticateToken,
  async (req, res) => {

    try {

      if (req.user.role !== "admin") {
        return res.status(403).json({
          success: false,
          message: "Admin access required"
        });
      }

      const {
        title,
        program_date,
        program_time,
        description
      } = req.body;

      if (!title || !program_date) {
        return res.status(400).json({
          success: false,
          message: "Title and program date are required"
        });
      }

      const result = await pool.query(
        `INSERT INTO programs
        (title, program_date, program_time, description)
        VALUES ($1, $2, $3, $4)
        RETURNING *`,
        [
          title.trim(),
          program_date,
          program_time || null,
          description || null
        ]
      );

      res.status(201).json({
        success: true,
        message: "Program added successfully",
        program: result.rows[0]
      });

    } catch (error) {

      console.error("PROGRAM ADD ERROR:", error);

      res.status(500).json({
        success: false,
        message: "Server error"
      });
    }
  }
);


// ==========================================
// PROGRAMS - DELETE
// ==========================================

app.delete(
  "/api/programs/:id",
  authenticateToken,
  async (req, res) => {

    try {

      if (req.user.role !== "admin") {
        return res.status(403).json({
          success: false,
          message: "Admin access required"
        });
      }

      const id = Number(req.params.id);

      if (!Number.isInteger(id)) {
        return res.status(400).json({
          success: false,
          message: "Invalid program ID"
        });
      }

      const result = await pool.query(
        `DELETE FROM programs
         WHERE id = $1
         RETURNING id`,
        [id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Program not found"
        });
      }

      res.json({
        success: true,
        message: "Program deleted successfully"
      });

    } catch (error) {

      console.error("PROGRAM DELETE ERROR:", error);

      res.status(500).json({
        success: false,
        message: "Server error"
      });
    }
  }
);


// =====================================================
// FINANCE - SUMMARY
// =====================================================

app.get(
  "/api/finance/summary",
  authenticateToken,
  async (req, res) => {

    try {

      if (req.user.role !== "admin") {
        return res.status(403).json({
          success: false,
          message: "Admin access required"
        });
      }

      const donations = await pool.query(
        `SELECT COALESCE(SUM(amount), 0) AS total
         FROM donations`
      );

      const expenses = await pool.query(
        `SELECT COALESCE(SUM(amount), 0) AS total
         FROM expenses`
      );

      const totalDonation =
        Number(donations.rows[0].total);

      const totalExpense =
        Number(expenses.rows[0].total);

      const balance =
        totalDonation - totalExpense;

      res.json({
        success: true,
        totalDonation,
        totalExpense,
        balance
      });

    } catch (error) {

      console.error(
        "FINANCE SUMMARY ERROR:",
        error
      );

      res.status(500).json({
        success: false,
        message: "Server error"
      });
    }
  }
);


// =====================================================
// DONATIONS - GET
// =====================================================

app.get(
  "/api/donations",
  authenticateToken,
  async (req, res) => {

    try {

      if (req.user.role !== "admin") {
        return res.status(403).json({
          success: false,
          message: "Admin access required"
        });
      }

      const result = await pool.query(
        `SELECT *
         FROM donations
         ORDER BY created_at DESC`
      );

      res.json({
        success: true,
        donations: result.rows
      });

    } catch (error) {

      console.error(
        "DONATIONS GET ERROR:",
        error
      );

      res.status(500).json({
        success: false,
        message: "Server error"
      });
    }
  }
);


// =====================================================
// DONATION - ADD
// =====================================================

app.post(
  "/api/donations",
  authenticateToken,
  async (req, res) => {

    try {

      if (req.user.role !== "admin") {
        return res.status(403).json({
          success: false,
          message: "Admin access required"
        });
      }

      const {
        donor_name,
        mobile,
        amount,
        payment_mode,
        note
      } = req.body;

      if (!donor_name || !amount) {
        return res.status(400).json({
          success: false,
          message: "Donor name and amount are required"
        });
      }

      const numericAmount = Number(amount);

      if (
        !Number.isFinite(numericAmount) ||
        numericAmount <= 0
      ) {
        return res.status(400).json({
          success: false,
          message: "Invalid amount"
        });
      }

      const result = await pool.query(
        `INSERT INTO donations
        (donor_name, mobile, amount, payment_mode, note)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING *`,
        [
          donor_name.trim(),
          mobile || null,
          numericAmount,
          payment_mode || "Cash",
          note || null
        ]
      );

      res.status(201).json({
        success: true,
        message: "Donation added successfully",
        donation: result.rows[0]
      });

    } catch (error) {

      console.error(
        "DONATION ADD ERROR:",
        error
      );

      res.status(500).json({
        success: false,
        message: "Server error"
      });
    }
  }
);


// =====================================================
// DONATION - DELETE
// =====================================================

app.delete(
  "/api/donations/:id",
  authenticateToken,
  async (req, res) => {

    try {

      if (req.user.role !== "admin") {
        return res.status(403).json({
          success: false,
          message: "Admin access required"
        });
      }

      const id = Number(req.params.id);

      const result = await pool.query(
        `DELETE FROM donations
         WHERE id = $1
         RETURNING id`,
        [id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Donation not found"
        });
      }

      res.json({
        success: true,
        message: "Donation deleted successfully"
      });

    } catch (error) {

      console.error(
        "DONATION DELETE ERROR:",
        error
      );

      res.status(500).json({
        success: false,
        message: "Server error"
      });
    }
  }
);


// =====================================================
// EXPENSES - GET
// =====================================================

app.get(
  "/api/expenses",
  authenticateToken,
  async (req, res) => {

    try {

      if (req.user.role !== "admin") {
        return res.status(403).json({
          success: false,
          message: "Admin access required"
        });
      }

      const result = await pool.query(
        `SELECT *
         FROM expenses
         ORDER BY created_at DESC`
      );

      res.json({
        success: true,
        expenses: result.rows
      });

    } catch (error) {

      console.error(
        "EXPENSES GET ERROR:",
        error
      );

      res.status(500).json({
        success: false,
        message: "Server error"
      });
    }
  }
);


// =====================================================
// EXPENSE - ADD
// =====================================================

app.post(
  "/api/expenses",
  authenticateToken,
  async (req, res) => {

    try {

      if (req.user.role !== "admin") {
        return res.status(403).json({
          success: false,
          message: "Admin access required"
        });
      }

      const {
        title,
        amount,
        payment_mode,
        note
      } = req.body;

      if (!title || !amount) {
        return res.status(400).json({
          success: false,
          message: "Title and amount are required"
        });
      }

      const numericAmount = Number(amount);

      if (
        !Number.isFinite(numericAmount) ||
        numericAmount <= 0
      ) {
        return res.status(400).json({
          success: false,
          message: "Invalid amount"
        });
      }

      const result = await pool.query(
        `INSERT INTO expenses
        (title, amount, payment_mode, note)
        VALUES ($1, $2, $3, $4)
        RETURNING *`,
        [
          title.trim(),
          numericAmount,
          payment_mode || "Cash",
          note || null
        ]
      );

      res.status(201).json({
        success: true,
        message: "Expense added successfully",
        expense: result.rows[0]
      });

    } catch (error) {

      console.error(
        "EXPENSE ADD ERROR:",
        error
      );

      res.status(500).json({
        success: false,
        message: "Server error"
      });
    }
  }
);


// =====================================================
// EXPENSE - DELETE
// =====================================================

app.delete(
  "/api/expenses/:id",
  authenticateToken,
  async (req, res) => {

    try {

      if (req.user.role !== "admin") {
        return res.status(403).json({
          success: false,
          message: "Admin access required"
        });
      }

      const id = Number(req.params.id);

      const result = await pool.query(
        `DELETE FROM expenses
         WHERE id = $1
         RETURNING id`,
        [id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Expense not found"
        });
      }

      res.json({
        success: true,
        message: "Expense deleted successfully"
      });

    } catch (error) {

      console.error(
        "EXPENSE DELETE ERROR:",
        error
      );

      res.status(500).json({
        success: false,
        message: "Server error"
      });
    }
  }
);


// ==========================================
// 404
// ==========================================

app.use((req, res) => {

  res.status(404).json({
    success: false,
    message: "Route not found",
    path: req.originalUrl
  });

});


// ==========================================
// ERROR HANDLER
// ==========================================

app.use((err, req, res, next) => {

  console.error("UNHANDLED ERROR:", err);

  res.status(500).json({
    success: false,
    message: "Internal server error"
  });

});


// ==========================================
// START
// ==========================================

app.listen(
  PORT,
  "0.0.0.0",
  () => {

    console.log(
      `Ganesh backend running on port ${PORT}`
    );

  }
);
