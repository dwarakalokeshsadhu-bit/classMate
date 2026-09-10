import jwt from 'jsonwebtoken';

/**
 * Middleware to protect routes by verifying JWT session token.
 * Accepts token from httpOnly cookie 'token' or Authorization Bearer header.
 * Attaches decoded user payload ({ userId, email, role }) to req.user.
 */
export function requireAuth(req, res, next) {
  try {
    let token = req.cookies?.token;

    if (!token && req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required. No session token provided.'
      });
    }

    const secret = process.env.JWT_SECRET || 'classmate_fallback_secret_key_au28';

    try {
      const decoded = jwt.verify(token, secret);
      req.user = decoded;
      return next();
    } catch (jwtErr) {
      if (jwtErr.name === 'TokenExpiredError') {
        return res.status(401).json({
          success: false,
          error: 'Session expired. Please log in again.'
        });
      }
      return res.status(401).json({
        success: false,
        error: 'Invalid session token. Please log in again.'
      });
    }
  } catch (error) {
    console.error('requireAuth middleware unexpected error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to authenticate request.'
    });
  }
}

export default requireAuth;
