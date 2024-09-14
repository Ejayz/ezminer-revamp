import { NextApiRequest, NextApiResponse } from "next";
import instance from "../../dbClass";
import Cookies from "cookies";
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

export default async function hander(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method != "POST") {
    res.status(405).json({ code: 405, message: "Method not allowed" });
  }
  const { currency_id } = req.body;
  const connection = await instance.getClient();
  const auth = new Cookies(req, res).get("auth") || "";
  try {
    const verify = jwt.verify(auth, JWT_SECRET);
    if (typeof verify == "string") {
      return res.status(401).json({ code: 401, message: "Unauthorized" });
    }
    connection.query("BEGIN");
    const selectUser =
      "SELECT * FROM minners_account where id=$1 and is_exist=true";
    const user = await connection.query(selectUser, [verify.id]);

    if (user.rows.length == 0) {
      connection.query("ROLLBACK");
      return res.status(400).json({ code: 400, message: "User not found" });
    }
    const selectCurrency =
      "SELECT * FROM currency where id=$1 and is_exist=true";
    const currency = await connection.query(selectCurrency, [currency_id]);
    if (currency.rows.length == 0) {
      connection.query("ROLLBACK");
      return res.status(400).json({ code: 400, message: "Currency not found" });
    }
    const check_bal = await check_balance(
      currency.rows[0].per_hash,
      user.rows[0].balance
    );
    if (check_bal == false) {
      connection.query("ROLLBACK");
      return res
        .status(400)
        .json({ code: 400, message: "Insufficient balance" });
    }
    const getCalculatedBalance = await calculate_balance(
      currency.rows[0].rate,
      user.rows[0].balance_hash,
      currency.rows[0].per_hash
    );

    if (Number(getCalculatedBalance) == 0) {
      connection.query("ROLLBACK");
      return res
        .status(400)
        .json({ code: 400, message: "Minimum withdrawal limit is 1" });
    }
    const updateBalance = await connection.query(
      "UPDATE minners_account SET balance_hash=0 WHERE id=$1 and is_exist=true",
      [verify.id]
    );

    if (updateBalance.rowCount == 0) {
      connection.query("ROLLBACK");
      return res
        .status(400)
        .json({ code: 400, message: "Balance not updated" });
    }

    const insertWithdraw = await connection.query(
      "INSERT INTO transaction_table (amount,currency,to_user,status,hash_number,minner_id) values ($1,$2,$3,$4,$5,$6) RETURNING id",
      [
        getCalculatedBalance,
        currency_id,
        user.rows[0].email,
        202,
        user.rows[0].balance_hash,
        verify.id,
      ]
    );

    const insertID = insertWithdraw.rows[0].id;

    if (insertWithdraw.rowCount == 0) {
      connection.query("ROLLBACK");
      return res
        .status(400)
        .json({ code: 400, message: "Withdraw fails . Please try again" });
    } else {
      connection.query("COMMIT");

      let headersList = {
        Accept: "*/*",
        "User-Agent": "Thunder Client (https://www.thunderclient.com)",
        "Content-Type": "application/json",
        referer: `${req.headers.origin}`,
      };

      let bodyContent = JSON.stringify({
        amount: getCalculatedBalance.toString(),
        currency_code: currency.rows[0].currency_code,
        refferal: false,
        wallet_address: user.rows[0].email,
        callback_url: `${req.headers.origin}/api/v1/callback_url?transaction_id=${insertID}`,
      });

      let response = await fetch(
        `${PAYMENT_MANAGER_URL}/api/v1/external/sendtransaction?api_key=${PAYMENT_MANAGER_API_KEY}&site_id=${PAYMENT_MANAGER_SITE_KEY}`,
        {
          method: "POST",
          body: bodyContent,
          headers: headersList,
        }
      );

      let data = await response.json();
      console.log(data);
      if (response.status != 200) {
        const getTransaction = await connection.query(
          "select * from transaction_table where id=$1",
          [insertID]
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
          return res
            .status(400)
            .json({ code: 400, message: "Minner not found" });
        }
        const getBalance = getMinnerAccount.rows[0].balance_hash;
        const getTransactionBalance = getTransaction.rows[0].hash_number;
        const newBalance = getBalance + getTransactionBalance;
        const updateBalance = await connection.query(
          "update minners_account set balance_hash=$1 where id=$2",
          [newBalance, getTransaction.rows[0].minner_id]
        );
        if (updateBalance.rowCount == 0) {
          await connection.query("ROLLBACK");
          return res
            .status(400)
            .json({ code: 400, message: "Balance not updated" });
        }
        const removeWithdraw = await connection.query(
          "DELETE FROM transaction_table where id=$1",
          [insertID]
        );

        return res.status(400).json({
          code: 400,
          message: data.error,
        });
      } else {
        return res.status(200).json({
          code: 200,
          message:
            "Withdraw request was sent. It will be processed within 1-2 business day. Thank you and happy minning.",
        });
      }
    }
  } catch (error: any) {
    if (error.message === "jwt expired") {
      return res.status(401).json({ code: 401, message: "Unauthorized" });
    } else if (error.message === "jwt malformed") {
      return res.status(401).json({ code: 401, message: "Unauthorized" });
    } else if (error.message === "invalid signature") {
      return res.status(401).json({ code: 401, message: "Unauthorized" });
    } else if (error.message === "invalid token") {
      return res.status(401).json({ code: 401, message: "Unauthorized" });
    }
    return res
      .status(500)
      .json({ code: 500, message: "Internal server error" });
  } finally {
    connection.release();
  }
}

async function check_balance(per_hash: any, balance: any) {
  if (per_hash > balance) {
    return false;
  } else {
    return true;
  }
}
async function calculate_balance(rate: any, balance: any, per_hash: any) {
  return Math.round(Number(rate) * (Number(balance) / Number(per_hash)));
}
