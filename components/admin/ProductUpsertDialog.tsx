"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import type { ApiProduct } from "@/lib/api/types";
import { formatPrice } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type UploadResult = { url: string; key: string };

type PendingFile = {
  id: string;
  file: File;
  previewUrl: string;
};

function slugify(input: string) {
  return input
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "create" | "edit";
  product?: ApiProduct | null;
  onSaved: () => Promise<void> | void;
};

export function ProductUpsertDialog({
  open,
  onOpenChange,
  mode,
  product,
  onSaved,
}: Props) {
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const pendingIdRef = useRef(0);

  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [currency, setCurrency] = useState("UGX");
  const [price, setPrice] = useState("0");
  const [stock, setStock] = useState("0");
  const [images, setImages] = useState<string[]>([]);
  const [imageUrl, setImageUrl] = useState("");
  const [pendingFiles, setPendingFiles] = useState<PendingFile[]>([]);

  const priceNumber = useMemo(
    () => Number(price.replaceAll(",", "")) || 0,
    [price],
  );
  const stockNumber = useMemo(
    () => Number(stock.replaceAll(",", "")) || 0,
    [stock],
  );

  useEffect(() => {
    if (!open) return;

    setError(null);
    setSaving(false);
    setUploading(false);
    // Reset any pending file previews when opening.
    setPendingFiles((prev) => {
      for (const p of prev) URL.revokeObjectURL(p.previewUrl);
      return [];
    });

    if (mode === "edit" && product) {
      setName(product.name ?? "");
      setSlug(product.slug ?? "");
      setDescription(product.description ?? "");
      setCurrency((product.currency || "UGX").toUpperCase());
      setPrice(String(product.price ?? 0));
      setStock(String(product.stock ?? 0));
      setImages(product.images ?? []);
      setImageUrl("");
      return;
    }

    // create
    setName("");
    setSlug("");
    setDescription("");
    setCurrency("UGX");
    setPrice("0");
    setStock("0");
    setImages([]);
    setImageUrl("");
  }, [open, mode, product]);

  useEffect(() => {
    if (open) return;
    // Cleanup previews when closing the dialog.
    setPendingFiles((prev) => {
      for (const p of prev) URL.revokeObjectURL(p.previewUrl);
      return [];
    });
  }, [open]);

  function addFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    setError(null);

    const next: PendingFile[] = [];
    for (const file of Array.from(files)) {
      const previewUrl = URL.createObjectURL(file);
      const id = `pending_${Date.now()}_${pendingIdRef.current++}`;
      next.push({ id, file, previewUrl });
    }
    setPendingFiles((prev) => [...prev, ...next]);
  }

  function removePending(id: string) {
    setPendingFiles((prev) => {
      const found = prev.find((p) => p.id === id);
      if (found) URL.revokeObjectURL(found.previewUrl);
      return prev.filter((p) => p.id !== id);
    });
  }

  function addImageUrl() {
    const url = imageUrl.trim();
    if (!url) return;
    setImages((prev) => [...prev, url]);
    setImageUrl("");
  }

  function removeImage(url: string) {
    setImages((prev) => prev.filter((u) => u !== url));
  }

  async function uploadPendingFiles(): Promise<string[] | null> {
    if (pendingFiles.length === 0) return [];

    setUploading(true);
    try {
      const uploadedUrls: string[] = [];
      for (const pending of pendingFiles) {
        const fd = new FormData();
        fd.append("file", pending.file);
        const res = await fetch("/api/admin/uploads", {
          method: "POST",
          body: fd,
        });
        const data = (await res
          .json()
          .catch(() => null)) as UploadResult | null;
        if (!res.ok || !data?.url) {
          setError((data as any)?.error || "Upload failed");
          return null;
        }
        uploadedUrls.push(data.url);
      }
      return uploadedUrls;
    } catch {
      setError("Upload failed");
      return null;
    } finally {
      setUploading(false);
    }
  }

  async function save() {
    if (!name.trim()) {
      setError("Name is required.");
      return;
    }

    setSaving(true);
    setError(null);
    try {
      const uploadedUrls = await uploadPendingFiles();
      if (uploadedUrls == null) return;

      const finalImages = [...images, ...uploadedUrls];
      if (finalImages.length === 0) {
        setError("Please add at least one product image.");
        return;
      }

      const payload = {
        name: name.trim(),
        slug: slug.trim(),
        description: description.trim(),
        currency: currency.trim(),
        price: priceNumber,
        images: finalImages,
        stock: Math.max(0, stockNumber),
      };

      const res =
        mode === "edit" && product?.id
          ? await fetch(`/api/admin/products/${product.id}`, {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(payload),
            })
          : await fetch("/api/admin/products", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(payload),
            });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError((data as any)?.error || "Save failed");
        return;
      }

      // cleanup pending previews after a successful save
      setPendingFiles((prev) => {
        for (const p of prev) URL.revokeObjectURL(p.previewUrl);
        return [];
      });

      await onSaved();
      onOpenChange(false);
    } catch {
      setError("Save failed");
    } finally {
      setSaving(false);
    }
  }

  const title = mode === "edit" ? "Edit product" : "New product";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="product-name">Name</Label>
            <Input
              id="product-name"
              value={name}
              onChange={(e) => {
                const next = e.target.value;
                setName(next);
                if (mode === "create" && !slug.trim()) {
                  setSlug(slugify(next));
                }
              }}
              placeholder="e.g., New Shirt"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="product-slug">Slug</Label>
            <Input
              id="product-slug"
              value={slug}
              onChange={(e) => setSlug(slugify(e.target.value))}
              placeholder="e.g., new-shirt (optional)"
            />
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Used for the product URL. Leave blank to auto-generate.
            </p>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="product-description">Description</Label>
            <Textarea
              id="product-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What is this product?"
              rows={4}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="grid gap-2">
              <Label htmlFor="product-currency">Currency</Label>
              <Input
                id="product-currency"
                value={currency}
                onChange={(e) =>
                  setCurrency(
                    e.target.value
                      .toUpperCase()
                      .replace(/[^A-Z]/g, "")
                      .slice(0, 3),
                  )
                }
                placeholder="UGX"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="product-price">Price</Label>
              <Input
                id="product-price"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="50000"
                inputMode="decimal"
              />
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Preview: {formatPrice(priceNumber, currency)}
              </p>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="product-stock">Stock</Label>
              <Input
                id="product-stock"
                value={stock}
                onChange={(e) => setStock(e.target.value)}
                placeholder="0"
                inputMode="numeric"
              />
            </div>
          </div>

          <div className="grid gap-2">
            <Label>Images</Label>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <Input
                type="file"
                accept="image/*"
                multiple
                onChange={(e) => {
                  addFiles(e.target.files);
                  e.currentTarget.value = "";
                }}
                disabled={uploading || saving}
              />
              <div className="flex gap-2">
                <Input
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="Paste image URL"
                  disabled={uploading || saving}
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={addImageUrl}
                  disabled={!imageUrl.trim() || uploading || saving}
                >
                  Add
                </Button>
              </div>
            </div>

            {images.length > 0 || pendingFiles.length > 0 ? (
              <div className="mt-2 grid grid-cols-3 gap-3 sm:grid-cols-6">
                {images.map((url) => (
                  <div
                    key={url}
                    className="group relative aspect-square overflow-hidden rounded-md border"
                  >
                    <Image
                      src={url}
                      alt="Product"
                      fill
                      className="object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(url)}
                      className="absolute right-1 top-1 rounded bg-black/60 px-2 py-1 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100"
                    >
                      Remove
                    </button>
                  </div>
                ))}
                {pendingFiles.map((p) => (
                  <div
                    key={p.id}
                    className="group relative aspect-square overflow-hidden rounded-md border"
                  >
                    <img
                      src={p.previewUrl}
                      alt={p.file.name || "Pending upload"}
                      className="h-full w-full object-cover"
                    />
                    <div className="absolute left-1 top-1 rounded bg-amber-500/80 px-2 py-1 text-[10px] font-medium text-white">
                      Pending
                    </div>
                    <button
                      type="button"
                      onClick={() => removePending(p.id)}
                      className="absolute right-1 top-1 rounded bg-black/60 px-2 py-1 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Add at least one image for the store carousel/product page.
              </p>
            )}
          </div>
        </div>

        {error ? (
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        ) : null}

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={saving}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={save}
            disabled={saving || uploading || !name.trim()}
          >
            {uploading
              ? "Uploading..."
              : saving
                ? "Saving..."
                : mode === "edit"
                  ? "Save changes"
                  : "Create product"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
