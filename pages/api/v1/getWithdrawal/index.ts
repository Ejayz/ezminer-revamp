import { NextApiRequest, NextApiResponse } from "next";
import * as jwt from "jsonwebtoken";
import * as dotenv from "dotenv";
import instance from "../../dbClass";
import Cookies from "cookies";

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || "";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method != "GET") {
    return res.status(405).json({ code: 405, message: "Method not allowed" });
  }
  const auth = new Cookies(req, res).get("auth") || "";
  const connection = await instance.getClient();
  try {
    const verify = jwt.verify(auth, JWT_SECRET);
    if (typeof verify === "string") {
      return res.status(401).json({ code: 401, message: "Unauthorized" });
    }

    const selectUser = await connection.query(
      "SELECT * FROM minners_account WHERE id=$1 and is_exist=TRUE",
      [verify.id]
    );

    const SelectCurrency = await connection.query(
      "SELECT * FROM currency WHERE is_exist=true"
    );
    const data = {
      users: {
        minners: selectUser.rows[0].id,
        balance: selectUser.rows[0].balance_hash,
      },
      currency: SelectCurrency.rows,
    };
    return res.status(200).json({ code: 200, message: "Success", data: data });
  } catch (error: any) {
    console.log(error);
    return res
      .status(500)
      .json({ code: 500, message: "Internal server error" });
  } finally {
    connection.release();
  }
}
