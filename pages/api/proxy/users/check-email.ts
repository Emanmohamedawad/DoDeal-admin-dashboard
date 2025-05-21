import type { NextApiRequest, NextApiResponse } from "next";
import axios from "axios";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    // Get auth token from headers
    const authToken = req.headers.authorization;
    if (!authToken) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    // Validate email in request body
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({
        error: "Email is required",
      });
    }

    // Make request to external API to check email
    try {
      await axios.post(
        "https://mini-admin-portal.vercel.app/api/users/check-email",
        { email },
        {
          headers: {
            Authorization: authToken,
            "Content-Type": "application/json",
          },
        }
      );

      // If we get here, the email is available
      return res.status(200).json({ available: true });
    } catch (error: any) {
      // If the API returns a duplicate email error
      if (error.response?.status === 409) {
        return res.status(409).json({
          error: "Email already exists",
        });
      }
      throw error; // Re-throw other errors
    }
  } catch (error: any) {
    console.error(
      "Error checking email:",
      error.response?.data || error.message
    );

    // Handle different types of errors
    if (error.response) {
      return res.status(error.response.status).json({
        error: error.response.data.error || "Error checking email",
        details: error.response.data.details || [],
      });
    } else if (error.request) {
      return res.status(500).json({
        error: "No response from server",
        details: ["The server did not respond to the request"],
      });
    } else {
      return res.status(500).json({
        error: "Error setting up request",
        details: [error.message],
      });
    }
  }
}
