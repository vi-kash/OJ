import dotenv from "dotenv";
dotenv.config();
import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { Strategy as GitHubStrategy } from "passport-github";
import User from "../models/User.js";
import axios from "axios";

passport.use(
    new GoogleStrategy(
        {
            clientID: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            callbackURL: "https://backend.online-judge.site/auth/google/callback",
        },
        async (accessToken, refreshToken, profile, done) => {
            try {
                const email = profile.emails[0].value;
                let user = await User.findOne({ email });

                if (user) {
                    // If user exists, update with Google ID if not already linked
                    if (!user.googleId) {
                        user.googleId = profile.id;
                        user.isOAuthUser = true;
                        await user.save();
                    }
                } else {
                    // If user does not exist, create a new user
                    user = await User.create({
                        googleId: profile.id,
                        name: profile.displayName,
                        email: email,
                        username: email.split("@")[0],
                        isOAuthUser: true
                    });
                }
                done(null, user);
            } catch (error) {
                done(error, null);
            }
        }
    )
);

passport.use(
    new GitHubStrategy(
        {
            clientID: process.env.GITHUB_CLIENT_ID,
            clientSecret: process.env.GITHUB_CLIENT_SECRET,
            callbackURL: "https://backend.online-judge.site/auth/github/callback",
        },
        async (accessToken, refreshToken, profile, done) => {
            try {
                // If email is not provided in the profile, fetch it using the /user/emails endpoint
                let email;
                if (profile.emails && profile.emails.length > 0) {
                    email = profile.emails[0].value;
                } else {
                    const emailResponse = await axios.get("https://api.github.com/user/emails", {
                        headers: { Authorization: `token ${accessToken}` },
                    });
                    const primaryEmail = emailResponse.data.find(e => e.primary && e.verified);
                    email = primaryEmail ? primaryEmail.email : null;
                }

                if (!email) {
                    throw new Error("No email found for GitHub user");
                }

                let user = await User.findOne({ email });

                if (user) {
                    // If user exists, update with GitHub ID if not already linked
                    if (!user.githubId) {
                        user.githubId = profile.id;
                        user.isOAuthUser = true;
                        await user.save();
                    }
                } else {
                    // If user does not exist, create a new user
                    user = await User.create({
                        githubId: profile.id,
                        name: profile.displayName,
                        email: email,
                        username: profile.username,
                        isOAuthUser: true
                    });
                }
                done(null, user);
            } catch (error) {
                done(error, null);
            }
        }
    )
);

passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findById(id);
        done(null, user);
    } catch (error) {
        done(error, null);
    }
});
