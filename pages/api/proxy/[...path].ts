import type { NextApiRequest, NextApiResponse } from "next";
import axios from "axios";

const API_BASE_URL = "https://mini-admin-portal.vercel.app/api";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { path } = req.query;
  const targetPath = Array.isArray(path) ? path.join("/") : path;

  try {
    const response = await axios({
      method: req.method,
      url: `${API_BASE_URL}/${targetPath}`,
      headers: {
        ...req.headers,
        host: new URL(API_BASE_URL).host,
      },
      data: req.method !== "GET" ? req.body : undefined,
    });

    res.status(response.status).json(response.data);
  } catch (error: any) {
    res.status(error.response?.status || 500).json({
      error: error.response?.data || "Internal Server Error",
    });
  }
}
