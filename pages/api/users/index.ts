import type { NextApiRequest, NextApiResponse } from "next";
import axios from "axios";
import { validateUserForm } from "../../../utils/validation";

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

    // Validate request body
    const validation = validateUserForm(req.body);
    if (!validation.success) {
      return res.status(400).json({
        error: "Validation failed",
        details: validation.errors,
      });
    }

    // Make request to external API
    const response = await axios.post(
      "https://mini-admin-portal.vercel.app/api/users",
      validation.data,
      {
        headers: {
          Authorization: authToken,
          "Content-Type": "application/json",
        },
      }
    );

    // Return the response from the external API
    return res.status(200).json(response.data);
  } catch (error: any) {
    console.error(
      "Error creating user:",
      error.response?.data || error.message
    );

    // Handle different types of errors
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      return res.status(error.response.status).json({
        error: error.response.data.error || "Error creating user",
        details: error.response.data.details || [],
      });
    } else if (error.request) {
      // The request was made but no response was received
      return res.status(500).json({
        error: "No response from server",
        details: ["The server did not respond to the request"],
      });
    } else {
      // Something happened in setting up the request that triggered an Error
      return res.status(500).json({
        error: "Error setting up request",
        details: [error.message],
      });
    }
  }
}
