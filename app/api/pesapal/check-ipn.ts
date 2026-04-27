// app/api/pesapal/check-ipn/route.ts
// Debug route — check what IPN URLs are registered with Pesapal
// GET /api/pesapal/check-ipn
import { NextResponse } from "next/server";
import { getPesapalToken } from "@/lib/pesapal/auth";
import axios from "axios";

const BASE_URL = process.env.PESAPAL_BASE_URL!;

export async function GET() {
  try {
    const token = await getPesapalToken();

    // List all registered IPN URLs
    const response = await axios.get(`${BASE_URL}/URLSetup/GetIpnList`, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
    });

    return NextResponse.json({
      ipnList: response.data,
      env: {
        PESAPAL_IPN_ID: process.env.PESAPAL_IPN_ID,
        NEXT_PUBLIC_BASE_URL: process.env.NEXT_PUBLIC_BASE_URL,
        PESAPAL_BASE_URL: BASE_URL,
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message, detail: err?.response?.data },
      { status: 500 },
    );
  }
}
