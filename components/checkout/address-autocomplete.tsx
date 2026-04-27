// components/checkout/address-autocomplete.tsx
"use client";

import { useEffect, useRef } from "react";

declare global {
  interface Window {
    google: typeof google;
  }
}

interface AddressAutocompleteProps {
  onSelect: (payload: { address: string; lat: number; lng: number }) => void;
  placeholder?: string;
  defaultValue?: string;
  disabled?: boolean;
}

export function AddressAutocomplete({
  onSelect,
  placeholder = "Enter delivery address",
  defaultValue = "",
  disabled = false,
}: AddressAutocompleteProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (!window.google || !window.google.maps || !inputRef.current) return;

    const autocomplete = new window.google.maps.places.Autocomplete(
      inputRef.current,
      {
        fields: ["formatted_address", "geometry", "name"],
        componentRestrictions: { country: "ug" },
        types: ["geocode"],
      },
    );

    const listener = autocomplete.addListener("place_changed", () => {
      const place = autocomplete.getPlace();

      const lat = place.geometry?.location?.lat?.();
      const lng = place.geometry?.location?.lng?.();
      const address = place.formatted_address || place.name || "";

      if (!address || lat == null || lng == null) {
        return;
      }

      onSelect({
        address,
        lat,
        lng,
      });
    });

    return () => {
      if (listener) {
        window.google.maps.event.removeListener(listener);
      }
    };
  }, [onSelect]);

  return (
    <input
      ref={inputRef}
      type="text"
      defaultValue={defaultValue}
      placeholder={placeholder}
      disabled={disabled}
      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none ring-offset-background placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
    />
  );
}
