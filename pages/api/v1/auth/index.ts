import { NextApiRequest, NextApiResponse } from "next";
import instance from "../../dbClass";
import jwt from "jsonwebtoken";
import * as bcrypt from "bcrypt";
import * as dotenv from "dotenv";
dotenv.config();
import cookie from "cookie";
const JWT_SECRET = process.env.JWT_SECRET || "";
const SITE_KEY=process.env.SITE_KEY || "";
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method != "POST") {
    return res.status(405).json({ code: 405, message: "Method not allowed" });
  }
  const { email, password, remember_me } = req.body;
  if (!email || !password) {
    return res.status(400).json({ code: 400, message: "Bad request" });
  }
  const connection = await instance.getClient();

  try {
    const query = `SELECT * FROM minners_account WHERE email = $1 and is_exist=true`;
    const params = [email];
    const result = await connection.query(query, params);
    if (result.rowCount == 0) {
      return res
        .status(401)
        .json({ code: 401, message: "Invalid email or password" });
    }
    const user = result.rows[0];
    const isPasswordMatch = await bcrypt.compare(password, user.password);
    if (!isPasswordMatch) {
      return res
        .status(401)
        .json({ code: 401, message: "Invalid email or password" });
    }
    const token = jwt.sign({ id: user.id }, JWT_SECRET, {
      expiresIn: remember_me ? "7d" : "1d",
    });
    return res
      .setHeader(
        "Set-Cookie",
        cookie.serialize("auth", token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "strict",
          maxAge: remember_me ? 60 * 60 * 24 * 7 : 60 * 60 * 24 * 1,
          path: "/",
        })
      )
      .status(200)
      .json({
        code: 200,
        message: "Welcome back to EZ Minner . Happy Minning!",
        data: {
          user: {
            id: user.id,
            email: user.email,
            site_key:SITE_KEY
          },
        },
      });
  } catch (error: any) {
    console.log(error);
    return res
      .status(500)
      .json({ code: 500, message: "Internal server error" });
  } finally {
    connection.release();
  }
}
