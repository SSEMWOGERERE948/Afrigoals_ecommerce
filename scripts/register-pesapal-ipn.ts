import dotenv from "dotenv";
import axios from "axios";

dotenv.config({ path: ".env.local" });

const BASE_URL = process.env.PESAPAL_BASE_URL!;

async function getPesapalToken() {
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

  if (!response.data?.token) {
    throw new Error(`Pesapal auth failed: ${JSON.stringify(response.data)}`);
  }

  return response.data.token;
}

async function main() {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;

  console.log("Loaded NEXT_PUBLIC_BASE_URL:", baseUrl);

  if (!baseUrl) {
    throw new Error("NEXT_PUBLIC_BASE_URL is missing");
  }

  const token = await getPesapalToken();

  const payload = {
    url: `${baseUrl}/api/pesapal/ipn`,
    ipn_notification_type: "GET",
  };

  console.log("Registering IPN:", payload);

  const response = await axios.post(
    `${BASE_URL}/URLSetup/RegisterIPN`,
    payload,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    },
  );

  console.log("Pesapal IPN registration response:");
  console.log(JSON.stringify(response.data, null, 2));
}

main().catch((err) => {
  console.error(
    "Failed to register IPN:",
    err?.response?.data || err?.message || err,
  );
  process.exit(1);
});
