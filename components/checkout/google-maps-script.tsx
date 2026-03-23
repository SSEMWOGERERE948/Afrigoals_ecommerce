// components/checkout/google-maps-script.tsx
"use client";

import Script from "next/script";

export function GoogleMapsScript() {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API;

  if (!apiKey) {
    console.error("NEXT_PUBLIC_GOOGLE_MAPS_API is missing");
    return null;
  }

  // Use the new Dynamic Library Import bootstrap URL.
  // Do NOT pass &libraries= here — importLibrary() loads them on demand.
  return (
    <Script
      id="google-maps-script"
      src={`https://maps.googleapis.com/maps/api/js?key=${apiKey}&v=weekly`}
      strategy="afterInteractive"
      onReady={() => {
        window.dispatchEvent(new Event("google-maps-ready"));
      }}
    />
  );
}