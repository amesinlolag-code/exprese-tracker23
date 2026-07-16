import jwt from "jsonwebtoken";

const getJwtSecret = () => {
  const secret = process.env.JWT_SECRET || "dev_jwt_secret";
  return secret;
};

const generateToken = (res, userId) => {
  const token = jwt.sign({ userId }, getJwtSecret(), {
    expiresIn: "30d",
  });

  const isProduction = process.env.NODE_ENV === "production";

  res.cookie("jwt", token, {
    httpOnly: true,
    secure: isProduction, // cookie only sent over HTTPS in production
    // "none" is required for cross-domain cookies (frontend on vercel.app, backend on
    // render.com/railway.app are different domains). "lax" is fine for local dev where
    // both run on localhost.
    sameSite: isProduction ? "none" : "lax",
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
  });

  return token;
};

export default generateToken;
