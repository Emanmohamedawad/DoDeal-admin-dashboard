import type { NextApiRequest, NextApiResponse } from "next";
import axios from "axios";

const API_URL = "https://mini-admin-portal.vercel.app/api/users";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { id } = req.query;
  const authToken = req.headers.authorization;

  if (!authToken) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  if (!id || typeof id !== "string") {
    return res.status(400).json({ error: "Invalid user ID" });
  }

  try {
    switch (req.method) {
      case "GET":
        const getResponse = await axios.get(`${API_URL}/${id}`, {
          headers: {
            Authorization: authToken,
          },
        });
        return res.status(200).json(getResponse.data);

      case "PUT":
        try {
          const putResponse = await axios.put(`${API_URL}/${id}`, req.body, {
            headers: {
              Authorization: authToken,
              "Content-Type": "application/json",
            },
          });
          return res.status(200).json(putResponse.data);
        } catch (error: any) {
          // Handle duplicate email error specifically
          if (error.response?.data?.error?.includes('duplicate key value violates unique constraint "users_email_key"')) {
            return res.status(409).json({
              error: "Email already exists",
              details: [{ field: "email", message: "This email is already registered" }]
            });
          }
          throw error; // Re-throw other errors
        }

      default:
        res.setHeader("Allow", ["GET", "PUT"]);
        return res.status(405).json({ error: `Method ${req.method} not allowed` });
    }
  } catch (error: any) {
    console.error("Proxy error:", error.response?.data || error.message);

    if (error.response) {
      // Handle specific API errors
      if (error.response.status === 404) {
        return res.status(404).json({ error: "User not found" });
      }
      // Forward other API errors
      return res.status(error.response.status).json({
        error: error.response.data?.error || "Error from external API",
        details: error.response.data?.details,
      });
    } else if (error.request) {
      return res.status(500).json({
        error: "Network error while connecting to the external API",
      });
    } else {
      return res.status(500).json({
        error: "Internal server error",
      });
    }
  }
}
