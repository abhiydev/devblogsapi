const jwt = require("jsonwebtoken");

const verifyToken = (req, res, next) => {
    // Check for token in cookies or in the Authorization header
    const token = req.cookies.token || req.headers.authorization?.split(" ")[1];

    if (!token) {
        return res.status(401).json({ error: "❌ You are not authenticated. Token missing!" });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            const errorMessage = err.name === "TokenExpiredError" ? "❌ Token has expired." : "❌ Token is invalid.";
            return res.status(403).json({ error: errorMessage, details: err });
        }

        // Store userId in request to be used in the next steps
        req.userId = decoded._id; // Ensure `_id` exists in payload
        next();
    });
};

module.exports = verifyToken;
