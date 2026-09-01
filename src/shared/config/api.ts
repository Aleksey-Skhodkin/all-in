import axios from "axios";

export const API_BASE_URL = "http://localhost:3000";

export const jsonApiInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 5000,
  headers: { "X-Custom-Header": "foobar" },
});
