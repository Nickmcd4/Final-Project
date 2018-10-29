const Joi = require('joi');
const HttpStatus = require('http-status-codes');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const User = require('../models/userModels');
const Helpers = require('../Helpers/helpers');
const dbConfig = require('../config/secret')

module.exports = {
    async CreateUser(req, res) {
        //test debug
        // console.log(req.body);
        const schema = Joi.object().keys({
            username: Joi.string().min(5).max(10).required(),
            email: Joi.string().email().required(),
            password: Joi.string().min(5).required()
        })

        const {
            error,
            value
        } = Joi.validate(req.body, schema);
        console.log(value);
        if (error && error.details) {
            return res.status(HttpStatus.BAD_REQUEST).json({
                msg: error.details
            });
        }
        //checks if email already exits in database
        const userEmail = await User.findOne({
            email: Helpers.lowerCase(req.body.email)
        });
        if (userEmail) {
            return res.status(HttpStatus.CONFLICT).json({
                message: 'Email already exists!'
            })
        }
        //checks if username already exists in database
        const userName = await User.findOne({
            username: Helpers.firstUpper(req.body.username)
        })
        if (userName) {
            return res.status(HttpStatus.CONFLICT).json({
                message: 'Username already exists!'
            })
        }
        //password hashing
        return bcrypt.hash(value.password, 10, (err, hash) => {
            if (err) {
                return res.status(HttpStatus.CONFLICT).json({
                    message: "Error hashing password!"
                })
            }
            const body = {
                username: Helpers.firstUpper(value.username),
                email: Helpers.lowerCase(value.email),
                password: hash
            };
            //send new user to database
            User.create(body).then((user) => {
                const token = jwt.sign({
                    data: user
                }, dbConfig.secret, {
                    expiresIn: "1h"
                });
                //user must be authenticated to view specific routes
                res.cookie('auth', token);
                res.status(HttpStatus.CREATED).json({
                    message: 'User added to database',
                    user,
                    token
                }).catch(err => {
                    res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
                        message: 'Internal Error Ocurred.'
                    })
                })
            })
        });

    },

    async LoginUser(req, res) {
        if (!req.body.username || !req.body.password) {
            return res.status(HttpStatus.NOT_FOUND).json({
                message: 'No empty fields allowed'
            });
        }

        await User.findOne({
                username: Helpers.firstUpper(req.body.username)
            }).then(user => {
                //check if username exists
                if (!user) {
                    return res.status(HttpStatus.NOT_FOUND).json({
                        message: 'Username not found'
                    });
                }
                //compares password in form with password hashed in database
                return bcrypt.compare(req.body.password, user.password).then((result) => {
                    //check if password exists
                    if (!result) {
                        return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
                            message: "Password is incorrect!"
                        })
                    }
                    //if match, sign token and pass in user data
                    const token = jwt.sign({
                        data: user
                    }, dbConfig.secret, {
                        expiresIn: "1h"
                    })
                    //set cookie and return status code 200, pass in user object and token
                    res.cookie('auth', token);
                    return res.status(HttpStatus.OK).json({
                        message: 'Login successful',
                        user,
                        token
                    })
                })
            })
            .catch(err => {
                return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
                    message: 'Error occured'
                })
            })
    }
};