import { betterAuth } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { jwt } from "better-auth/plugins/jwt";
import { MongoClient } from "mongodb";

// Next.js reloads modules on every edit in dev; reuse one client so we don't
// leak a connection pool per reload.
if (!process.env.MONGODB_URI) {
  throw new Error(
    "MONGODB_URI is missing. Create re-sell-client/.env.local (see .env.local.example) and restart `npm run dev`."
  );
}

const cached = globalThis.__mongoClient;
const client = cached ?? new MongoClient(process.env.MONGODB_URI);
if (process.env.NODE_ENV !== "production") globalThis.__mongoClient = client;

// Self-signup may choose buyer or seller, never admin — escalation guard.
const signupRole = {
  "~standard": {
    version: 1,
    validate: (value) =>
      value === "buyer" || value === "seller"
        ? { value }
        : { issues: [{ message: "role must be buyer or seller" }] },
  },
};

export const auth = betterAuth({
  database: mongodbAdapter(client.db()),
  secret: process.env.BETTER_AUTH_SECRET,
  baseURL: process.env.BETTER_AUTH_URL,
  emailAndPassword: { enabled: true, minPasswordLength: 8 },
  socialProviders:
    process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
      ? {
          google: {
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          },
        }
      : {},
  user: {
    additionalFields: {
      role: {
        type: "string",
        required: false,
        defaultValue: "buyer",
        input: true,
        validator: { input: signupRole },
      },
      phone: { type: "string", required: false },
      location: { type: "string", required: false },
      bio: { type: "string", required: false },
      // server-controlled: never accepted from the client
      status: {
        type: "string",
        required: false,
        defaultValue: "active",
        input: false,
      },
      isVerifiedSeller: {
        type: "boolean",
        required: false,
        defaultValue: false,
        input: false,
      },
    },
  },
  // Publishes /api/auth/jwks and /api/auth/token for the Express API.
  // issuer/audience stay unset on both sides: the signature + exp check is what
  // matters, and a mismatch here is the classic "everything 401s in prod" bug.
  plugins: [jwt()],
  trustedOrigins: [process.env.BETTER_AUTH_URL].filter(Boolean),
});
