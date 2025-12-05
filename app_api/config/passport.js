const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;  // .Strategy 빠짐없이 명시
const mongoose = require('mongoose');
const User = mongoose.model('User');

passport.use(new LocalStrategy({
    usernameField: 'email'
},
    async (username, password, done) => {  // async 추가
        try {
            const user = await User.findOne({ email: username });  // 콜백 제거, await 사용
            if (!user) {
                return done(null, false, { message: 'Incorrect username.' });
            }
            if (!user.validPassword(password)) {
                return done(null, false, { message: 'Incorrect password.' });
            }
            return done(null, user);
        } catch (err) {
            return done(err);
        }
    }
));
