module.exports = function (req, res, callback) {
    if(req.session._csrf !== req.body._csrf) {
        res.status(403).send("Forbidden");
        req.session._csrf = undefined;
        return false;
    }
    req.session._csrf = undefined;

    callback();
};
