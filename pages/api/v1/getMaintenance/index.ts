import { NextApiRequest, NextApiResponse } from "next";
import * as jwt from "jsonwebtoken";
import * as dotenv from "dotenv";
import instance from "../../dbClass";
import Cookies from "cookies";

const JWT_SECRET = process.env.JWT_SECRET || "";
const COIN_IMP_PUBLIC = process.env.COIN_IMP_PUBLIC || "";
const COIN_IMP_PRIVATE = process.env.COIN_IMP_PRIVATE || "";
const SITE_KEY = process.env.SITE_KEY || "";

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
    const getMaintenance = await connection.query(
      "select * from payment_manager_options where id=1 and is_exist=true"
    );
    return res
      .status(200)
      .json({ status: 200, data: {
        is_maintenance: getMaintenance.rows[0].maintenance_mode,
        is_auto_transaction: getMaintenance.rows[0].auto_transaction,
      } });
  } catch (error) {
    return res.status(401).json({ code: 401, message: "Unauthorized" });
  } finally {
    connection.release();
  }
}
