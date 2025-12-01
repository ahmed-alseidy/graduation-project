import axios, { AxiosError } from "axios";
import { BACKEND_URL } from "./contants";
import { createSession } from "./session";

export const loginUser = async (email: string, password: string) => {
  try {
    const response = await axios.post(`${BACKEND_URL}/auth/login`, {
      email,
      password,
    });

    const data = response.data.data;
    console.log(data);

    await createSession({
      user: {
        id: data.user.id,
        name: data.user.name,
      },
      token: data.token,
    });

    return data;
  } catch (error) {
    if (error instanceof AxiosError) {
      return {
        error: error.response?.data.error,
      };
    }

    return {
      error: "Failed to login, please try again.",
    };
  }
};

export const registerUser = async (
  name: string,
  email: string,
  password: string
) => {
  const response = await axios.post(`${BACKEND_URL}/auth/register`, {
    name,
    email,
    password,
  });
  return response.data;
};
