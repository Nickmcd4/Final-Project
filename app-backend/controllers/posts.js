const Joi = require('joi');
const HttpStatus = require('http-status-codes')
const Post = require('../models/postModels');
const User = require('../models/userModels')
module.exports = {
    AddPost(req, res) {
        //test debug
        // console.log(req.body);
        // console.log(req.cookies)
        // console.log(req.user);
        const schema = Joi.object().keys({
            post: Joi.string().required()
        });
        const {
            error
        } = Joi.validate(req.body, schema);
        if (error && error.details) {
            return res.status(HttpStatus.BAD_REQUEST).json({
                msg: error.details
            });
        }
        const body = {
            user: req.user._id,
            username: req.user.username,
            post: req.body.post,
            created: new Date()
        }

        Post.create(body)
            //if post is successfully added return message, else return error
            .then(async (post) => {
                //update user post array 
                await User.update({
                        _id: req.user._id
                    }, {
                        $push: {
                            posts: {
                                postId: post._id,
                                post: req.body.post,
                                created: new Date()
                            }
                        }
                    }),
                    res.status(HttpStatus.OK).json({
                        message: "Post created!",
                        post
                    }).catch(err => {
                        res
                            .status(HttpStatus.INTERNAL_SERVER_ERROR)
                            .json({
                                message: 'Error occured'
                            })
                    });
            });
    },

    async GetAllPosts(req, res) {
        try {
            const posts = await Post.find({})
                .populate('user')
                .sort({
                    created: -1
                });

            return res.status(HttpStatus.OK).json({
                message: 'Successfully retrieved all posts',
                posts
            })
        } catch (err) {
            return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
                message: "Failed to retrieve posts"
            })
        }
    }
};