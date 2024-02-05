import { NextApiRequest, NextApiResponse } from "next";
import instance from "../../dbClass";
import * as jwt from "jsonwebtoken";
import * as bcrypt from "bcrypt";
import * as dotenv from "dotenv";

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || "";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method != "POST") {
    return res.status(405).json({ code: 405, message: "Method not allowed" });
  }
  const { email, password } = req.body;
  const connection = await instance.getClient();
  const hashedPassword = await bcrypt.hash(password, 10);
  try {
    connection.query("BEGIN");
    const checkUser = `SELECT * FROM minners_account WHERE email = $1 and is_exist = true;`;
    const checkUserValues = [email];
    const user = await connection.query(checkUser, checkUserValues)
    console.log(user)
    if (user.rowCount == null || user.rowCount > 0) {
      connection.query("ROLLBACK");
      return res
        .status(400)
        .json({ code: 400, message: "User already exists" });
    }
    const query = `INSERT INTO minners_account (email, password) VALUES ($1, $2)`;
    const values = [email, hashedPassword];
    const result = await connection.query(query, values);
    if (result.rowCount === 1) {
      connection.query("COMMIT");
      return res
        .status(200)
        .json({ code: 200, message: "User registered successfully" });
    }
    connection.query("ROLLBACK");
    return res
      .status(500)
      .json({ code: 500, message: "Internal Server Error" });
  } catch (error: any) {
    console.log(error);
    connection.query("ROLLBACK");
    return res
      .status(500)
      .json({ code: 500, message: "Internal Server Error" });
  } finally {
    connection.release();
  }
}
