//this is some advanced security
function validateUsername(username) {
    return username.length > 4;
}

function validatePassword(password) {
    return password.length >= 6;
}


module.exports = {
    validateUsername,
    validatePassword
};
