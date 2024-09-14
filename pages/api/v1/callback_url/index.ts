import { NextApiRequest, NextApiResponse } from "next";
import instance from "../../dbClass";
import * as jwt from "jsonwebtoken";
import * as dotenv from "dotenv";

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || "";
const COIN_IMP_PUBLIC = process.env.COIN_IMP_PUBLIC || "";
const COIN_IMP_PRIVATE = process.env.COIN_IMP_PRIVATE || "";
const SITE_KEY = process.env.SITE_KEY || "";
const API_KEY = process.env.API_KEY || "";
const PAYMENT_MANAGER_API_KEY = process.env.PAYMENT_MANAGER_API_KEY || "";
const PAYMENT_MANAGER_SITE_KEY = process.env.PAYMENT_MANAGER_SITE_KEY || "";
const PAYMENT_MANAGER_URL = process.env.PAYMENT_MANAGER_URL || "";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ code: 405, message: "Method not allowed" });
  }

  const transaction_id = req.query.transaction_id as string;
  console.log(req.body);

  const {
    id,
    created_at,
    currency,
    to_user,
    current_balance,
    status,
    payout_user_hash,
    payout_id,
    refferal,
    user_id,
    hash_number,
    site_id,
    type,
    updated_at,
    is_exist,
    amount,
  } = req.body;

  const connection = await instance.getClient();
  try {
    await connection.query("BEGIN");

    if (status == "Declined") {
      const getTransaction = await connection.query(
        "select * from transaction_table where id=$1",
        [transaction_id]
      );
      if (getTransaction.rows.length == 0) {
        await connection.query("ROLLBACK");
        return res
          .status(400)
          .json({ code: 400, message: "Transaction not found" });
      }
      const getMinnerAccount = await connection.query(
        "select * from minners_account where id=$1",
        [getTransaction.rows[0].minner_id]
      );
      if (getMinnerAccount.rows.length == 0) {
        await connection.query("ROLLBACK");
        return res.status(400).json({ code: 400, message: "Minner not found" });
      }
      const getBalance = getMinnerAccount.rows[0].balance_hash;
      const getTransactionBalance = getTransaction.rows[0].hash_number;
      const newBalance = getBalance + getTransactionBalance;
      const updateBalance = await connection.query(
        "update minners_account set balance_hash=$1 where id=$2",
        [newBalance, getTransaction.rows[0].minner_id]
      );
      console.log("Update Balance",updateBalance);
      if (updateBalance.rowCount == 0) {
        await connection.query("ROLLBACK");
        return res
          .status(400)
          .json({ code: 400, message: "Balance not updated" });
      }
    }
    const transactionUpdate = await connection.query(
      "UPDATE transaction_table SET current_balance=$1, status=$2, payout_user_hash=$3, payout_id=$4 WHERE id=$5",
      [
        current_balance,
        status === "Pending" ? "202" : status === "Declined" ? "201" : "200",
        payout_user_hash,
        payout_id,
        transaction_id,
      ]
    );
    console.log(transactionUpdate);
    if (transactionUpdate.rowCount === 0) {
      await connection.query("ROLLBACK");
      return res
        .status(400)
        .json({ code: 400, message: "Transaction not found" });
    } else {
      await connection.query("COMMIT");
      return res
        .status(200)
        .json({ code: 200, message: "Transaction updated" });
    }
  } catch (error: any) {
    console.error("Database error:", error);
    if (error.message.includes("jwt")) {
      return res
        .status(401)
        .json({ code: 401, message: "Unauthorized: Invalid or expired token" });
    }
    return res.status(500).json({
      code: 500,
      message: "Internal server error",
      error: error.message,
    });
  } finally {
    connection.release();
  }
}
