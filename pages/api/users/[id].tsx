import type { NextApiRequest, NextApiResponse } from "next";
import axios from "axios";

interface UserResponse {
  id: string;
  gender?: string;
  phone?: string;
  [key: string]: any; // Allow other fields
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<UserResponse | { error: string }>
) {
  const { id } = req.query;

  // Get the auth token from the request headers
  const authToken = req.headers.authorization;

  if (!authToken) {
    return res.status(401).json({ error: "No authorization token provided" });
  }

  try {
    const response = await axios.get<UserResponse>(
      `https://mini-admin-portal.vercel.app/api/users/${id}`,
      {
        headers: {
          Authorization: authToken,
          "Content-Type": "application/json",
        },
      }
    );

    // Extract the relevant fields from the response
    const userData = {
      id: response.data.id,
      gender: response.data.gender,
      phone: response.data.phone,
      ...response.data, // Include all other fields
    };

    // Forward the response data
    res.status(200).json(userData);
  } catch (error: any) {
    // Handle different types of errors
    if (error.response) {
      // Forward the error status and message from the external API
      res.status(error.response.status).json({
        error: error.response.data?.message || "Error fetching user details",
      });
    } else if (error.request) {
      // Handle network errors
      res.status(500).json({
        error: "Network error while connecting to the external API",
      });
    } else {
      // Handle other errors
      res.status(500).json({
        error: "Internal server error",
      });
    }
  }
}
