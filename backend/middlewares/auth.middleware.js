const jwt = require("jsonwebtoken");

const verifyToken = (req, res, next) => {
    const token = req.headers.token;
    if (token) {
        const decoded = jwt.verify(token,process.env.secretKey);
        if (decoded) {
            req.body.userId = decoded.userId;
            next();
        } else res.status(400).send({ msg: "Token is expired" });
    } else  res.status(400).send({ msg: "Login required" });
}

module.exports = { verifyToken };