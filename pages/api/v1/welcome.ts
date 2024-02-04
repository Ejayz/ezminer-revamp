import { NextApiRequest, NextApiResponse } from "next";
import instance from "../dbClass";
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const connection = await instance.getClient();
return res.status(200).json({ message: "Welcome to the API" });
}
