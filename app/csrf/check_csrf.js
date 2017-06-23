module.exports = function (req, res, callback, change_csrf=true) {

    console.log(change_csrf);
    if(req.session._csrf !== req.body._csrf && change_csrf) {
        res.status(403).send("Forbidden");
        req.session._csrf = undefined;
        return false;
    }
    else if(change_csrf) {
        req.session._csrf = undefined;
    }

    callback();
};
