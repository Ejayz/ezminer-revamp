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
  if (req.method !== "GET") {
    return res.status(405).json({ code: 405, message: "Method not allowed" });
  }
  const auth = new Cookies(req, res).get("auth") || "";
  const connection = await instance.getClient();
  try {
    const verify = jwt.verify(auth, JWT_SECRET);
    if (typeof verify === "string") {
      return res.status(401).json({ code: 401, message: verify });
    }
    const query =
      "SELECT minners_account.total_hashes,minners_account.balance_hash,updated_at FROM minners_account where id= $1 and is_exist = true";
    const values = [verify.id];
    const result = await connection.query(query, values);

    const getLatestTransactionQuery =
      "SELECT * FROM transaction_table WHERE minner_id = $1 ORDER BY created_at DESC LIMIT 1";
    const getLatestTransactionValues = [verify.id];
    const latestTransaction = await connection.query(
      getLatestTransactionQuery,
      getLatestTransactionValues
    );
    console.log(latestTransaction.rows);
    if (result.rowCount === 0) {
      return res.status(404).json({ code: 404, message: "No minners found" });
    }
    console.log(result.rows[0]);
    const data = {
      total_hashes: {
        hashes: result.rows[0].total_hashes,
        date: result.rows[0].updated_at
          ? result.rows[0].updated_at
          : "Not Available",
      },
      balance_hash: {
        hashes: result.rows[0].balance_hash,
        date: result.rows[0].updated_at
          ? result.rows[0].updated_at
          : "Not Available",
      },
      latest_transaction:
        latestTransaction.rows.length == 0
          ? false
          : {
              hashes:
                latestTransaction.rowCount !== 0
                  ? latestTransaction.rows[0].hash_number
                  : 0,
              date:
                latestTransaction.rowCount !== 0
                  ? latestTransaction.rows[0].created_at
                  : "Not Available",
            },
    };
    return res.status(200).json({ code: 200, message: "Success", data: data });
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
    return res.status(500).json({ code: 500, message: error.message });
  } finally {
    connection.release();
  }
}
