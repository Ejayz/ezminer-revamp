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
      "INSERT INTO transaction_table (amount,currency,to_user,status,hash_number,minner_id) values ($1,$2,$3,$4,$5,$6) ",
      [
        getCalculatedBalance,
        currency_id,
        user.rows[0].email,
        202,
        user.rows[0].balance_hash,
        verify.id,
      ]
    );
    if (insertWithdraw.rowCount == 0) {
      connection.query("ROLLBACK");
      return res
        .status(400)
        .json({ code: 400, message: "Withdraw fails . Please try again" });
    }
    let headersList = {
      Accept: "*/*",
      "User-Agent": "Thunder Client (https://www.thunderclient.com)",
      "X-API-ID": COIN_IMP_PUBLIC,
      "X-API-KEY": COIN_IMP_PRIVATE,
      "Content-Type": "application/x-www-form-urlencoded",
    };

    let bodyContent = `site-key=${SITE_KEY}&user=${verify.id}&amount=${user.rows[0].balance_hash}`;

    let response = await fetch("https://www.coinimp.com/api/v2/user/withdraw", {
      method: "POST",
      body: bodyContent,
      headers: headersList,
    });

    let data = await response.json();
    if (data.status=="failure") {
      connection.query("ROLLBACK");
      return res.status(400).json({
        code: 400,
        message:
          "Current balance is missed match from blockchain record. Please contact support.",
      });
    }
    connection.query("COMMIT");
    return res.status(200).json({
      code: 200,
      message:
        "Withdraw request was sent. It will be processed within 1-2 business day. Thank you and happy minning.",
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
