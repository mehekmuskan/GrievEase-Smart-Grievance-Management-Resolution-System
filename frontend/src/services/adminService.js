import axios from "axios";

const API_BASE_URL = "http://127.0.0.1:8000";

// Register a new administrator
export const registerAdmin = async (adminData) => {
  const response = await axios.post(
    `${API_BASE_URL}/api/admin/register`,
    adminData
  );

  return response.data;
};
