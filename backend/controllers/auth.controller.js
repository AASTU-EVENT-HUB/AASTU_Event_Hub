const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const db = require("../config/db");

exports.register = async (req, res, next) => {
  try {
    const {
      name,
      email,
      studentId,
      department,
      password,
    } = req.body;

    if (
      !name ||
      !email ||
      !studentId ||
      !department ||
      !password
    ) {
      return res.status(400).json({
        success: false,
        message: "All fields required",
      });
    }

    const [existing] = await db.execute(
      "SELECT id FROM users WHERE email = ?",
      [email],
    );

    if (existing.length > 0) {
      return res.status(409).json({
        success: false,
        message: "Email already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(
      password,
      10,
    );

    const [result] = await db.execute(
      `
      INSERT INTO users
      (name, email, student_id, department, password)
      VALUES (?, ?, ?, ?, ?)
      `,
      [
        name,
        email,
        studentId,
        department,
        hashedPassword,
      ],
    );

    const token = jwt.sign(
      {
        id: result.insertId,
        role: "student",
        name,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
      },
    );

    res.status(201).json({
      success: true,
      token,
      user: {
        id: result.insertId,
        name,
        email,
        role: "student",
        department,
        isFirstLogin: true,
      },
    });
  } catch (error) {
    next(error);
  }
};
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password required",
      });
    }

    const [users] = await db.execute(
      "SELECT * FROM users WHERE email = ?",
      [email],
    );

    if (users.length === 0) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    const user = users[0];

    const validPassword =
      await bcrypt.compare(password, user.password);

    if (!validPassword) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    const token = jwt.sign(
      {
        id: user.id,
        role: user.role,
        name: user.name,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
      },
    );

    res.status(200).json({
      success: true,
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        isFirstLogin: user.is_first_login,
      },
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};