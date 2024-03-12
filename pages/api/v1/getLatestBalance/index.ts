import { NextApiRequest, NextApiResponse } from "next";
import * as jwt from "jsonwebtoken";
import * as dotenv from "dotenv";
import instance from "../../dbClass";
import Cookies, { connect } from "cookies";
import { Coiny } from "next/font/google";

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || "";
const COIN_IMP_PUBLIC = process.env.COIN_IMP_PUBLIC || "";
const COIN_IMP_PRIVATE = process.env.COIN_IMP_PRIVATE || "";
const SITE_KEY = process.env.SITE_KEY || "";
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method != "POST") {
    return res.status(405).json({ code: 405, message: "Method not allowed" });
  }
  const auth = new Cookies(req, res).get("auth") || "";
  const connection = await instance.getClient();
  try {
    const verify = jwt.verify(auth, JWT_SECRET);
    if (typeof verify === "string") {
      return res.status(401).json({ code: 401, message: "Unauthorized" });
    }
    connection.query("BEGIN");
    const selectUser = await connection.query(
      "SELECT * FROM minners_account WHERE id=$1 and is_exist=true",
      [verify.id]
    );
    if (selectUser.rows.length === 0) {
      connection.query("ROLLBACK");
      return res.status(401).json({ code: 401, message: "Unauthorized" });
    }
    let headersList = {
      Accept: "*/*",
      "User-Agent": "Thunder Client (https://www.thunderclient.com)",
      "X-API-ID": COIN_IMP_PUBLIC,
      "X-API-KEY": COIN_IMP_PRIVATE,
    };

    let response = await fetch(
      `https://www.coinimp.com/api/v2/user/balance?site-key=${SITE_KEY}&user=${verify.id}`,
      {
        method: "GET",
        headers: headersList,
      }
    );

    let data = await response.json();
    console.log(data);
    if (data.status == "error" || data.status == "failure") {
      connection.query("ROLLBACK");
      return res.status(500).json({ code: 500, message: data.message });
    }

if(data.message.pending==0){
  connection.query("ROLLBACK");
  return res.status(200).json({ code: 200, message: "Currently no balance on minner. Please mine more or wait for a while before updating your balance again ." });
}



    const UpdateBalanceQuery =
      "UPDATE minners_account SET total_hashes=$1 , balance_hash=$2,updated_at=now() where id=$3";
    const calculateTotalBalance =
      parseFloat(selectUser.rows[0].balance_hash) +
      parseFloat(data.message.pending);
    const UpdateBalanceValues = [
      data.message.hashes,
      calculateTotalBalance,
      verify.id,
    ];
    const UpdateBalance = await connection.query(
      UpdateBalanceQuery,
      UpdateBalanceValues
    );
    if (UpdateBalance.rowCount === 0) {
      connection.query("ROLLBACK");
      return res
        .status(500)
        .json({ code: 500, message: "Internal Server Error" });
    }
    let headerssList = {
      Accept: "*/*",
      "User-Agent": "Thunder Client (https://www.thunderclient.com)",
      "X-API-ID": COIN_IMP_PUBLIC,
      "X-API-KEY": COIN_IMP_PRIVATE,
      "Content-Type": "application/x-www-form-urlencoded",
    };

    let bodysContent = `site-key=${SITE_KEY}&user=${verify.id}&amount=${data.message.pending}`;

    let responses = await fetch(
      "https://www.coinimp.com/api/v2/user/withdraw",
      {
        method: "POST",
        body: bodysContent,
        headers: headerssList,
      }
    );

    let datas = await responses.json();
    console.log(datas);
    if (datas.status == "failure") {
      connection.query("ROLLBACK");
      return res.status(400).json({
        code: 400,
        message:
          "Current balance is missed match from blockchain record. Please contact support.",
      });
    }
    connection.query("COMMIT");
    return res
      .status(200)
      .json({ code: 200, message: "Balance Updated Successfully" });
  } catch (error: any) {
    console.log(error);
    if (error.message === "jwt expired") {
      return res.status(401).json({ code: 401, message: "Unauthorized" });
    } else if (error.message === "jwt malformed") {
      return res.status(401).json({ code: 401, message: "Unauthorized" });
    } else if (error.message === "invalid signature") {
      return res.status(401).json({ code: 401, message: "Unauthorized" });
    } else if (error.message === "invalid token") {
      return res.status(401).json({ code: 401, message: "Unauthorized" });
    }
    return res.status(500).json({ code: 500, message: error.message });
  } finally {
    connection.release();
  }
}
