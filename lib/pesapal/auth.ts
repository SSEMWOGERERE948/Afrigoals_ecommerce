import axios from "axios";

const BASE_URL = process.env.PESAPAL_BASE_URL!;

export async function getPesapalToken() {
  try {
    const response = await axios.post(
      `${BASE_URL}/Auth/RequestToken`,
      {
        consumer_key: process.env.PESAPAL_CONSUMER_KEY,
        consumer_secret: process.env.PESAPAL_CONSUMER_SECRET,
      },
      {
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      },
    );

    console.log("Pesapal auth response:", response.data);

    // Only validate the token
    if (!response.data?.token) {
      throw new Error(`Pesapal auth failed: ${JSON.stringify(response.data)}`);
    }

    return response.data.token;
  } catch (error) {
    console.error("Pesapal auth request failed:", error);
    throw error;
  }
}
