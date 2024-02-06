import { NextApiRequest, NextApiResponse } from "next";
import instance from "../../dbClass";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    res.status(405).json({ message: "Method not allowed" });
  }
  const connection = await instance.getClient();
  try {
    const { page } = req.query;
    const limit = 10;
    const offset = page ? parseInt(page.toString()) * 10 : 0;
    const query = `SELECT transaction_table.id,transaction_table.created_at,transaction_table.amount,currency.currency_code,transaction_table.amount,transaction_table.status,transaction_table.payout_id FROM transaction_table LEFT JOIN currency ON currency.id = transaction_table.currency ORDER BY id DESC LIMIT $1 OFFSET $2`;
    const values = [limit, offset];
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
    if(error.message==="jwt expired"){
      return res.status(401).json({ code: 401, message: "Unauthorized" });
    }
    else if(error.message==="jwt malformed"){
      return res.status(401).json({ code: 401, message: "Unauthorized" });
    }
    else if (error.message === "invalid signature") {
      return res.status(401).json({ code: 401, message: "Unauthorized" });
    }
    else if (error.message === "invalid token") {
      return res.status(401).json({ code: 401, message: "Unauthorized" });
    }
    return res.status(500).json({ message: error.message });
  } finally {
    await connection.release();
  }
}
