import type { NextApiRequest, NextApiResponse } from "next";
import axios from "axios";

interface EmailCheckResponse {
  exists: boolean;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<EmailCheckResponse | { error: string }>
) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { email } = req.query;
  const authToken = req.headers.authorization;

  if (!authToken) {
    return res.status(401).json({ error: "No authorization token provided" });
  }

  if (!email || typeof email !== "string") {
    return res.status(400).json({ error: "Email is required" });
  }

  try {
    // Call the external API to check email existence
    const response = await axios.get(
      `https://mini-admin-portal.vercel.app/api/users/check-email/${email}`,
      {
        headers: {
          Authorization: authToken,
          "Content-Type": "application/json",
        },
      }
    );

    // Forward the response
    res.status(200).json(response.data);
  } catch (error: any) {
    if (error.response?.status === 404) {
      // If user not found, email doesn't exist
      return res.status(200).json({ exists: false });
    }

    // Handle other errors
    res.status(error.response?.status || 500).json({
      error: error.response?.data?.message || "Error checking email existence",
    });
  }
}
