"use client";

import { getProduct } from "@/data/products";
import { REVIEWS, reviewLabel } from "@/data/reviews";
import { DyeZone } from "@/dyepack/react";
import { FEATURED_PRODUCT } from "@/store/setup-registry";

interface StoreViewProps {
  highlightedZone: string | null;
}

export function StoreView({ highlightedZone }: StoreViewProps) {
  const product = getProduct(FEATURED_PRODUCT)!;
  const reviews = REVIEWS.filter((r) => r.productId === FEATURED_PRODUCT);

  return (
    <div className="store-view">
      <header className="store-view__brand">
        <span className="store-view__mark">H&L</span>
        <div>
          <strong>Harbor &amp; Loom</strong>
          <span>home goods</span>
        </div>
      </header>

      <section className="store-view__product trust-zone">
        <p className="store-view__eyebrow">Trusted — site-authored</p>
        <h2>{product.name}</h2>
        <p className="store-view__price">${product.price}</p>
        <p className="store-view__desc">{product.description}</p>
      </section>

      <section className="store-view__reviews">
        <h3>Customer reviews</h3>
        <p className="store-view__eyebrow dye-eyebrow">Dyed — user-generated</p>
        <ul>
          {reviews.map((review, index) => (
            <li key={review.id}>
              <DyeZone zoneId={review.id} highlighted={highlightedZone === review.id}>
                <div className="review">
                  <div className="review__meta">
                    <strong>{review.author}</strong>
                    <span>{review.rating}/5</span>
                    <time>{review.date}</time>
                  </div>
                  <p>{review.text}</p>
                  <span className="review__tag">{reviewLabel(review, index)}</span>
                </div>
              </DyeZone>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
