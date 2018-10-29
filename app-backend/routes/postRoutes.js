const express = require('express');
const router = express.Router();

const PostCtrl = require('../controllers/posts');

router.post('/posts/add-post', PostCtrl.AddPost);


module.exports = router;