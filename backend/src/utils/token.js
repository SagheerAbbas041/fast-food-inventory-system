import jwt from "jsonwebtoken";

export const makeToken = (user) =>
  jwt.sign(
    { id: user._id, username: user.username, role: user.role, name: user.name },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
