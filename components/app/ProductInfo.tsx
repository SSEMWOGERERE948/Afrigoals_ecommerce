"use client";

import Link from "next/link";
import { useState, useEffect, useCallback } from "react";
import { AddToCartButton } from "@/components/app/AddToCartButton";
import { AskAISimilarButton } from "@/components/app/AskAISimilarButton";
import { StockBadge } from "@/components/app/StockBadge";
import { formatPrice } from "@/lib/utils";
import type { PRODUCT_BY_SLUG_QUERYResult } from "@/sanity.types";

interface Review {
  _id: string;
  name: string;
  rating: number;
  comment: string;
  createdAt?: string;
}

interface SizeVariant {
  _key: string;
  size: string;
  stock: number;
}

interface ProductInfoProps {
  product: NonNullable<PRODUCT_BY_SLUG_QUERYResult>;
}

export function ProductInfo({ product }: ProductInfoProps) {
  const imageUrl = product.images?.[0]?.asset?.url;

  // ── Sizes ────────────────────────────────────────────────────────────────────
  // Cast until typegen picks up the new fields after schema + query update
  const hasSizes = (product as any).hasSizes as boolean | undefined;
  const rawSizes = ((product as any).sizes ?? []) as Array<{
    _key: string;
    size?: string | null;
    stock?: number | null;
  }>;

  const sizeVariants: SizeVariant[] = rawSizes.map((v) => ({
    _key: v._key,
    size: v.size ?? "M",
    stock: v.stock ?? 0,
  }));

  const [selectedSize, setSelectedSize] = useState<string | null>(
    sizeVariants.length > 0 ? sizeVariants[0].size : null
  );

  const selectedVariant = sizeVariants.find((v) => v.size === selectedSize);

  const effectiveStock =
    hasSizes && selectedVariant
      ? selectedVariant.stock
      : (product.stock ?? 0);

  const isSizeRequired = hasSizes && sizeVariants.length > 0;
  const canAddToCart = !isSizeRequired || !!selectedSize;

  // ── Reviews ──────────────────────────────────────────────────────────────────
  const [reviews, setReviews] = useState<Review[]>([]);
  const [averageRating, setAverageRating] = useState(0);
  const [name, setName] = useState("");
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetchingReviews, setFetchingReviews] = useState(true);
  const [submitMessage, setSubmitMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const fetchReviews = useCallback(async () => {
    try {
      setFetchingReviews(true);
      const res = await fetch(`/api/reviews?productId=${product._id}`, {
        cache: "no-store",
      });
      if (!res.ok) throw new Error("Failed to fetch reviews");
      const data = await res.json();
      const fetchedReviews: Review[] = data.reviews ?? [];
      setReviews(fetchedReviews);
      setAverageRating(
        fetchedReviews.length > 0
          ? fetchedReviews.reduce((sum, r) => sum + r.rating, 0) /
              fetchedReviews.length
          : 0
      );
    } catch (error) {
      console.error("Error fetching reviews:", error);
      setReviews([]);
      setAverageRating(0);
    } finally {
      setFetchingReviews(false);
    }
  }, [product._id]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  async function submitReview(e: React.FormEvent) {
    e.preventDefault();
    setSubmitMessage(null);
    if (!name.trim() || !comment.trim()) {
      setSubmitMessage({ type: "error", text: "Please fill in all fields" });
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: product._id,
          name,
          rating,
          comment,
        }),
      });
      if (!res.ok) throw new Error("Failed to submit review");
      setSubmitMessage({
        type: "success",
        text: "Review submitted successfully 🎉",
      });
      setName("");
      setRating(5);
      setComment("");
      await fetchReviews();
    } catch (error) {
      console.error(error);
      setSubmitMessage({
        type: "error",
        text: "Failed to submit review. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  }

  function renderStars(r: number) {
    return (
      <div className="flex text-yellow-400">
        {Array.from({ length: 5 }).map((_, i) => (
          <span key={i}>{i < r ? "★" : "☆"}</span>
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-col">

      {/* ── Category ──────────────────────────────────────────────────────────── */}
      {product.category && (
        <Link
          href={`/?category=${product.category.slug}`}
          className="text-sm text-muted-foreground hover:text-primary"
        >
          {product.category.title}
        </Link>
      )}

      {/* ── Name & price ──────────────────────────────────────────────────────── */}
      <h1 className="mt-2 text-3xl font-bold text-foreground">
        {product.name}
      </h1>

      <p className="mt-4 text-2xl font-semibold text-primary">
        {formatPrice(product.price)}
      </p>

      {product.description && (
        <p className="mt-4 text-muted-foreground">{product.description}</p>
      )}

      {/* ── Size selector ─────────────────────────────────────────────────────── */}
      {hasSizes && sizeVariants.length > 0 && (
        <div className="mt-6">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-semibold text-foreground uppercase tracking-wide">
              Select Size
            </p>
            {selectedSize && (
              <span className="text-sm text-muted-foreground">
                Selected:{" "}
                <span className="font-medium text-foreground">
                  {selectedSize}
                </span>
              </span>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            {sizeVariants.map((variant) => {
              const outOfStock = variant.stock === 0;
              const isLowStock = variant.stock > 0 && variant.stock <= 5;
              const isSelected = selectedSize === variant.size;

              return (
                <button
                  key={variant._key}
                  type="button"
                  disabled={outOfStock}
                  onClick={() => setSelectedSize(variant.size)}
                  title={
                    outOfStock
                      ? "Out of stock"
                      : isLowStock
                      ? `Only ${variant.stock} left`
                      : `${variant.stock} available`
                  }
                  className={[
                    "relative px-4 py-2 rounded-md border text-sm font-medium transition-all",
                    isSelected
                      ? "border-primary bg-primary text-primary-foreground shadow-sm"
                      : "border-border bg-card text-foreground hover:border-primary hover:bg-accent",
                    outOfStock ? "opacity-40 cursor-not-allowed" : "cursor-pointer",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                >
                  {/* Strikethrough for out-of-stock */}
                  {outOfStock && (
                    <span className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <span className="w-full border-t border-current opacity-60" />
                    </span>
                  )}

                  {variant.size}

                  {/* Low stock dot */}
                  {isLowStock && !outOfStock && (
                    <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-orange-400" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Per-size stock message */}
          <div className="mt-3 min-h-[20px]">
            {selectedVariant ? (
              <p
                className={[
                  "text-xs font-medium",
                  selectedVariant.stock === 0
                    ? "text-red-500"
                    : selectedVariant.stock <= 5
                    ? "text-orange-500"
                    : "text-green-600",
                ].join(" ")}
              >
                {selectedVariant.stock === 0
                  ? "Out of stock"
                  : selectedVariant.stock <= 5
                  ? `⚠ Only ${selectedVariant.stock} left in size ${selectedVariant.size}`
                  : `✓ In stock (${selectedVariant.stock} available)`}
              </p>
            ) : (
              isSizeRequired && (
                <p className="text-xs text-muted-foreground">
                  Please select a size to continue
                </p>
              )
            )}
          </div>
        </div>
      )}

      {/* ── Add to cart ───────────────────────────────────────────────────────── */}
      <div className="mt-6 flex flex-col gap-3">
        {!hasSizes && (
          <StockBadge productId={product._id} stock={product.stock ?? 0} />
        )}

        <AddToCartButton
          productId={product._id}
          name={product.name ?? "Unknown Product"}
          price={product.price ?? 0}
          image={imageUrl ?? undefined}
          stock={effectiveStock}
        />

        <AskAISimilarButton productName={product.name ?? "this product"} />
      </div>

      {/* ── Product details / attributes ──────────────────────────────────────── */}
      {(product.material ||
        product.color ||
        product.dimensions ||
        product.assemblyRequired ||
        (hasSizes && sizeVariants.length > 0)) && (
        <div className="mt-6 border-t border-border pt-6">
          <p className="text-sm font-semibold text-foreground uppercase tracking-wide mb-4">
            Product Details
          </p>

          <div className="space-y-3">
            {product.material && (
              <div className="flex gap-2 text-sm">
                <span className="text-muted-foreground w-28 shrink-0">
                  Material
                </span>
                <span className="text-foreground capitalize">
                  {product.material}
                </span>
              </div>
            )}

            {product.color && (
              <div className="flex gap-2 text-sm">
                <span className="text-muted-foreground w-28 shrink-0">
                  Color
                </span>
                <span className="text-foreground capitalize">
                  {product.color}
                </span>
              </div>
            )}

            {product.dimensions && (
              <div className="flex gap-2 text-sm">
                <span className="text-muted-foreground w-28 shrink-0">
                  Dimensions
                </span>
                <span className="text-foreground">{product.dimensions}</span>
              </div>
            )}

            {product.assemblyRequired && (
              <div className="flex gap-2 text-sm">
                <span className="text-muted-foreground w-28 shrink-0">
                  Assembly
                </span>
                <span className="text-foreground">Required</span>
              </div>
            )}

            {/* Available sizes row */}
            {hasSizes && sizeVariants.length > 0 && (
              <div className="flex gap-2 text-sm items-start">
                <span className="text-muted-foreground w-28 shrink-0 pt-0.5">
                  Available Sizes
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {sizeVariants.map((variant) => {
                    const outOfStock = variant.stock === 0;
                    const isLowStock = variant.stock > 0 && variant.stock <= 5;
                    return (
                      <span
                        key={variant._key}
                        title={
                          outOfStock
                            ? "Out of stock"
                            : isLowStock
                            ? `Only ${variant.stock} left`
                            : `${variant.stock} in stock`
                        }
                        className={[
                          "px-2 py-0.5 rounded border text-xs font-medium",
                          outOfStock
                            ? "border-border text-muted-foreground line-through opacity-50"
                            : isLowStock
                            ? "border-orange-300 text-orange-600 bg-orange-50 dark:bg-orange-950/20 dark:border-orange-800 dark:text-orange-400"
                            : "border-border text-foreground bg-card",
                        ]
                          .filter(Boolean)
                          .join(" ")}
                      >
                        {variant.size}
                      </span>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Reviews ───────────────────────────────────────────────────────────── */}
      <div className="mt-10 border-t border-border pt-8">
        <h2 className="text-xl font-semibold text-foreground">
          Customer Reviews
        </h2>

        {!fetchingReviews && (
          <div className="flex items-center gap-3 mt-2">
            {renderStars(Math.round(averageRating))}
            <span className="text-sm text-muted-foreground">
              {averageRating.toFixed(1)} / 5 ({reviews.length}{" "}
              {reviews.length === 1 ? "review" : "reviews"})
            </span>
          </div>
        )}

        <div className="mt-6 space-y-6">
          {fetchingReviews ? (
            <p className="text-sm text-muted-foreground">Loading reviews...</p>
          ) : reviews.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No reviews yet. Be the first to review!
            </p>
          ) : (
            reviews.map((review) => (
              <div key={review._id} className="border-b border-border pb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-medium text-foreground">
                      {review.name}
                    </span>
                    {review.createdAt && (
                      <p className="text-xs text-muted-foreground">
                        {new Date(review.createdAt).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                  {renderStars(review.rating)}
                </div>
                <p className="mt-2 text-sm text-muted-foreground">
                  {review.comment}
                </p>
              </div>
            ))
          )}
        </div>

        {/* Review form */}
        <form
          onSubmit={submitReview}
          className="mt-8 flex flex-col gap-4 border-t border-border pt-6"
        >
          <h3 className="text-lg font-semibold text-foreground">
            Leave a Review
          </h3>

          {submitMessage && (
            <div
              className={`p-3 rounded-md text-sm ${
                submitMessage.type === "success"
                  ? "bg-green-100 text-green-900"
                  : "bg-red-100 text-red-900"
              }`}
            >
              {submitMessage.text}
            </div>
          )}

          <input
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
            disabled={loading}
            className="bg-card border border-border rounded-md px-3 py-2"
          />

          <select
            value={rating}
            onChange={(e) => setRating(Number(e.target.value))}
            className="bg-card border border-border rounded-md px-3 py-2"
          >
            <option value={5}>★★★★★ - Excellent</option>
            <option value={4}>★★★★☆ - Good</option>
            <option value={3}>★★★☆☆ - Average</option>
            <option value={2}>★★☆☆☆ - Poor</option>
            <option value={1}>★☆☆☆☆ - Terrible</option>
          </select>

          <textarea
            required
            rows={3}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Write your review..."
            className="bg-card border border-border rounded-md px-3 py-2"
          />

          <button
            type="submit"
            disabled={loading}
            className="bg-primary text-primary-foreground px-4 py-2 rounded-md hover:opacity-90 transition"
          >
            {loading ? "Submitting..." : "Submit Review"}
          </button>
        </form>
      </div>
    </div>
  );
}