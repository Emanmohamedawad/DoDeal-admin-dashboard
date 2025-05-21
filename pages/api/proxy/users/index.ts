import type { NextApiRequest, NextApiResponse } from "next";
import axios from "axios";

const API_URL = "https://mini-admin-portal.vercel.app/api/users";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Get auth token from headers
  const authToken = req.headers.authorization;
  if (!authToken) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    switch (req.method) {
      case "GET":
        const getResponse = await axios.get(API_URL, {
          headers: {
            Authorization: authToken,
          },
        });
        return res.status(200).json(getResponse.data);

      case "POST":
        try {
          // Log the request data
          console.log("POST request data:", req.body);

          const postResponse = await axios.post(API_URL, req.body, {
            headers: {
              Authorization: authToken,
              "Content-Type": "application/json",
            },
          });

          // Log the response
          console.log("POST response:", postResponse.data);

          return res.status(200).json(postResponse.data);
        } catch (error: any) {
          // Log the error details
          console.error("POST error details:", {
            status: error.response?.status,
            data: error.response?.data,
            message: error.message,
          });

          // Handle duplicate email error specifically
          if (
            error.response?.data?.error?.includes(
              'duplicate key value violates unique constraint "users_email_key"'
            )
          ) {
            return res.status(409).json({
              error: "Email already exists",
              details: [
                { field: "email", message: "This email is already registered" },
              ],
            });
          }
          throw error; // Re-throw other errors
        }

      default:
        res.setHeader("Allow", ["GET", "POST"]);
        return res
          .status(405)
          .json({ error: `Method ${req.method} not allowed` });
    }
  } catch (error: any) {
    console.error("Proxy error:", error.response?.data || error.message);

    if (error.response) {
      // Forward the error status and message from the external API
      return res.status(error.response.status).json({
        error: error.response.data?.error || "Error from external API",
        details: error.response.data?.details,
      });
    } else if (error.request) {
      // Handle network errors
      return res.status(500).json({
        error: "Network error while connecting to the external API",
      });
    } else {
      // Handle other errors
      return res.status(500).json({
        error: "Internal server error",
      });
    }
  }
}
