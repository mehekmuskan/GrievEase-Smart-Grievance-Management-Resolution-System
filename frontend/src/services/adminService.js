import axios from "axios";

import API_BASE_URL from "./api";

// Register a new administrator
export const registerAdmin = async (adminData) => {
  const response = await axios.post(
    `${API_BASE_URL}/api/admin/register`,
    adminData
  );

  return response.data;
};

// Login administrator
export const loginAdmin = async (loginData) => {
  const response = await axios.post(
    `${API_BASE_URL}/api/admin/login`,
    loginData
  );

  return response.data;
};
