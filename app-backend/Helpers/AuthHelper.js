const jwt = require('jsonwebtoken');
const httpStatus = require('http-status-codes');
const dbConfig = require('../config/secret');

module.exports = {
    VerifyToken: (req, res, next) => {
        if (!req.headers.authorization) {
            return res.status(httpStatus.UNAUTHORIZED).json({
                message: "Action not authorzed"
            })
        }
        //check if token is present in cookies
        const token = req.cookies.auth || req.headers.authorization.split(' ')[1];

        //test debug
        // console.log(token);
        // console.log(req.headers);
        //if no token send message to user
        if (!token) {
            return res.status(httpStatus.FORBIDDEN).json({
                message: "No token provided."
            })
        }
        //verify valid token - pass in token and secret 
        return jwt.verify(token, dbConfig.secret, (err, decoded) => {
            if (err) {
                //make sure token isn't expired
                if (err.expiredAt < new Date()) {
                    return res
                        .status(httpStatus.INTERNAL_SERVER_ERROR)
                        .json({
                            message: "Your token has expired. Please login again.",
                            token: null
                        });

                }
                next();
            }
            //pass user info
            req.user = decoded.data;
            next();
        });
    }
}