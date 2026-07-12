const bcrypt = require("bcryptjs");
const User = require("../models/User");
const generateToken = require("../utils/generateToken");
const { successResponse, errorResponse } = require("../utils/responseHelper");

/**
 * @desc    Register a new user (always as Employee)
 * @route   POST /api/auth/register
 * @access  Public
 */
const register = async (req, res, next) => {
  try {
    const { full_name, email, password, confirm_password } = req.body;

    // --- Server-side validation ---

    // Required fields
    if (!full_name || !email || !password || !confirm_password) {
      return errorResponse(
        res,
        400,
        "All fields are required: full_name, email, password, confirm_password",
      );
    }

    // Full name length
    if (full_name.trim().length < 2) {
      return errorResponse(res, 400, "Full name must be at least 2 characters");
    }

    // Valid email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return errorResponse(res, 400, "Please enter a valid email address");
    }

    // Password strength: min 8 chars, uppercase, number, special char
    if (password.length < 8) {
      return errorResponse(
        res,
        400,
        "Password must be at least 8 characters long",
      );
    }
    if (!/[A-Z]/.test(password)) {
      return errorResponse(
        res,
        400,
        "Password must contain at least one uppercase letter",
      );
    }
    if (!/[0-9]/.test(password)) {
      return errorResponse(
        res,
        400,
        "Password must contain at least one number",
      );
    }
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
      return errorResponse(
        res,
        400,
        "Password must contain at least one special character",
      );
    }

    // Password match
    if (password !== confirm_password) {
      return errorResponse(res, 400, "Passwords do not match");
    }

    // Check email uniqueness
    const existingUser = await User.scope("withPassword").findOne({
      where: { email: email.toLowerCase() },
    });
    if (existingUser) {
      return errorResponse(
        res,
        409,
        "An account with this email already exists",
      );
    }

    // Hash password
    const salt = await bcrypt.genSalt(12);
    const password_hash = await bcrypt.hash(password, salt);

    // Create user — role is ALWAYS 'Employee', ignore any role from client
    const user = await User.create({
      full_name: full_name.trim(),
      email: email.toLowerCase().trim(),
      password_hash,
      role: "Employee", // Hardcoded — never from client
    });

    // Return sanitized user (no password_hash due to default scope)
    const safeUser = user.toSafeObject();

    return successResponse(res, 201, {
      message: "Account created successfully",
      user: safeUser,
    });
  } catch (err) {
    console.error("ERROR:", err);
    console.error("MESSAGE:", err.message);

    if (err.parent) {
      console.error("MYSQL:", err.parent.sqlMessage);
      console.error("CODE:", err.parent.code);
    }

    return res.status(500).json(err);
  }
};

/**
 * @desc    Log in user and return JWT
 * @route   POST /api/auth/login
 * @access  Public
 */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Required fields
    if (!email || !password) {
      return errorResponse(res, 400, "Email and password are required");
    }

    // Find user WITH password_hash for comparison
    const user = await User.scope("withPassword").findOne({
      where: { email: email.toLowerCase().trim() },
    });

    // Generic error — don't reveal if email or password was wrong
    if (!user) {
      return errorResponse(res, 401, "Invalid email or password");
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return errorResponse(res, 401, "Invalid email or password");
    }

    // Check if account is active
    if (user.status === "Inactive") {
      return errorResponse(
        res,
        403,
        "Account is inactive. Please contact your administrator.",
      );
    }

    // Generate JWT
    const token = generateToken(user);

    // Return token and sanitized user
    return successResponse(res, 200, {
      message: "Login successful",
      token,
      user: user.toSafeObject(),
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { register, login };
