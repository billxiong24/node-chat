function validateUsername(username) {
    return username.length > 4;
}

function validatePassword(password) {
    return password.length > 4;

}


module.exports = {
    validateUsername,
    validatePassword
};
