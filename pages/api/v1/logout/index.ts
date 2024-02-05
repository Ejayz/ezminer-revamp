import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    res.status(405).json({ code: 401, message: "Method not allowed" });
  }
  try {
    res.setHeader(
      "Set-Cookie",
      `auth=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT;`
    );
    return res.status(200).json({ code: 200, message: "Logout successful" });
  } catch (error: any) {
    console.log(error);
    return res.status(500).json({ message: error.message });
  }
}
