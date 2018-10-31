const express = require('express');
const router = express.Router();

const PostCtrl = require('../controllers/posts');

const AuthHelper = require('../Helpers/AuthHelper');

router.post('/post/add-post', AuthHelper.VerifyToken, PostCtrl.AddPost);

router.get('/posts', AuthHelper.VerifyToken, PostCtrl.GetAllPosts);
router.post('/post/add-like', AuthHelper.VerifyToken, PostCtrl.AddLike)

module.exports = router;