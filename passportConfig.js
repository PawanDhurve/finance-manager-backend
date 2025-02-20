const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const FacebookStrategy = require("passport-facebook").Strategy;
const TwitterStrategy = require("passport-twitter").Strategy;
const LinkedInStrategy = require("passport-linkedin-oauth2").Strategy;
const User = require("../models/userModel");
const jwt = require("jsonwebtoken");

const generateToken = (user) => {
  return jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1h" });
};

const handleOAuth = async (profile, done) => {
  try {
    let user = await User.findOne({ email: profile.emails[0].value });
    if (!user) {
      user = new User({ name: profile.displayName, email: profile.emails[0].value });
      await user.save();
    }
    const token = generateToken(user);
    return done(null, { user, token });
  } catch (err) {
    return done(err, null);
  }
};

// Google OAuth Strategy
passport.use(new GoogleStrategy(
  {
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "http://localhost:8080/api/auth/google/callback",
  },
  (accessToken, refreshToken, profile, done) => handleOAuth(profile, done)
));

// Facebook OAuth Strategy
passport.use(new FacebookStrategy(
  {
    clientID: process.env.FACEBOOK_CLIENT_ID,
    clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
    callbackURL: "http://localhost:8080/api/auth/facebook/callback",
    profileFields: ["id", "displayName", "emails"],
  },
  (accessToken, refreshToken, profile, done) => handleOAuth(profile, done)
));

// Twitter OAuth Strategy
passport.use(new TwitterStrategy(
  {
    consumerKey: process.env.TWITTER_CLIENT_ID,
    consumerSecret: process.env.TWITTER_CLIENT_SECRET,
    callbackURL: "http://localhost:8080/api/auth/twitter/callback",
    includeEmail: true,
  },
  (accessToken, refreshToken, profile, done) => handleOAuth(profile, done)
));

// LinkedIn OAuth Strategy
passport.use(new LinkedInStrategy(
  {
    clientID: process.env.LINKEDIN_CLIENT_ID,
    clientSecret: process.env.LINKEDIN_CLIENT_SECRET,
    callbackURL: "http://localhost:8080/api/auth/linkedin/callback",
    scope: ["r_emailaddress", "r_liteprofile"],
  },
  (accessToken, refreshToken, profile, done) => handleOAuth(profile, done)
));

passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((obj, done) => {
  done(null, obj);
});

module.exports = passport;
