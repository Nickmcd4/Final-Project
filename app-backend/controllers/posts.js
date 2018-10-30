module.exports = {
    AddPost(req, res) {
        console.log(req.body);
        //test debug
        console.log(req.cookies)
        console.log(req.user);
    }
};