import axios from "axios";

const API_BASE_URL = "http://127.0.0.1:8000";

export const registerCitizen = async (userData) => {
  const response = await axios.post(
    `${API_BASE_URL}/api/auth/register`,
    userData
  );
  return response.data;
};

export const loginCitizen = async (loginData) => {
  const formData = new URLSearchParams();
  formData.append("username", loginData.email);
  formData.append("password", loginData.password);

  const response = await axios.post(
    `${API_BASE_URL}/api/auth/login`,
    formData,
    {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    }
  );

  return response.data;
};
