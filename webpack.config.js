module.exports = {
    entry: {
        chat_bundle: './public/javascripts/chat_render.js' ,
        home_bundle: './public/javascripts/js/home-setup.js',
        signup_bundle: './public/javascripts/signupValidate.js',
        signup_success_bundle: './public/javascripts/js/signup_success.js',
        settings_bundle: './public/javascripts/settings.js'
    },

    output: {
        path: __dirname + '/public/javascripts/bundle',
        filename: '[name].js'
    }

};
