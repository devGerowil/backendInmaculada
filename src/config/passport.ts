/* eslint-disable @typescript-eslint/no-explicit-any */
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import passport from 'passport';
import dotenv from 'dotenv';

dotenv.config();

const googleClientID = process.env.GOOGLE_CLIENT_ID || '';
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET || '';
const googleCallbackURL = process.env.GOOGLE_CALLBACK_URL || '';

export interface GoogleUserProfile {
  id: string;
  displayName: string;
  emails: { value: string; verified: boolean }[];
  photos: { value: string }[];
}

export interface GoogleUser {
  googleId: string;
  email: string;
  name: string;
  picture?: string;
}

export const configureGooglePassport = () => {
  passport.use(new GoogleStrategy(
    {
      clientID: googleClientID,
      clientSecret: googleClientSecret,
      callbackURL: googleCallbackURL,
      scope: ['profile', 'email']
    },
    (
      _accessToken: string,
      _refreshToken: string,
      profile: any,
      done: (error: any, user?: any) => void
    ) => {
      try {
        const user: GoogleUser = {
          googleId: profile.id,
          email: profile.emails?.[0]?.value || '',
          name: profile.displayName,
          picture: profile.photos?.[0]?.value
        };
        done(null, user);
      } catch (error) {
        done(error, undefined);
      }
    }
  ));

  passport.serializeUser((user: any, done) => {
    done(null, user);
  });

  passport.deserializeUser((user: any, done) => {
    done(null, user);
  });
};

export default passport;
