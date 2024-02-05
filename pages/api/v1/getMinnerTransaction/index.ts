import { NextApiRequest, NextApiResponse } from "next";
import instance from "../../dbClass";
import * as jwt from "jsonwebtoken";
import * as dotenv from "dotenv";
import Cookies from "cookies";
dotenv.config();

const JWT_SECRET=process.env.JWT_SECRET||""

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    res.status(405).json({code:401, message: "Method not allowed" });
  }
  const connection = await instance.getClient();
  const auth=new Cookies(req, res).get("auth")||""
  try {
    const verify=jwt.verify(auth,JWT_SECRET)
    if(typeof verify==="string"){
      return res.status(401).json({ code:401,message: "Unauthorized" });
    }
    const { page } = req.query;
    const limit = 10;
    const offset = page ? parseInt(page.toString()) * 10 : 0;
    const query = `SELECT transaction_table.id,transaction_table.created_at,transaction_table.amount,currency.currency_code,transaction_table.amount,transaction_table.status,transaction_table.payout_id FROM transaction_table LEFT JOIN currency ON currency.id = transaction_table.currency where minner_id =$3 ORDER BY id DESC LIMIT $1 OFFSET $2`;
    const values = [limit, offset,verify.id];
    const result = await connection.query(query, values);
    if (result.rows.length === 0) {
      return res
        .status(404)
        .json({ code: 404, message: "No transactions found" });
    }
    return res
      .status(200)
      .json({ code: 200, message: "Data found", data: result.rows });
  } catch (error: any) {
    console.log(error);
    return res.status(500).json({ message: error.message });
  } finally {
    await connection.release();
  }
}
