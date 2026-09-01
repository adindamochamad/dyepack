import { getProduct } from "@/data/products";
import { REVIEWS, reviewLabel, reviewsForProduct } from "@/data/reviews";
import type { DyePack } from "@/dyepack/interceptor";

const FEATURED_PRODUCT = "ridgeline-mug";

/** Wire trusted product copy and dyed review zones into a DyePack registry. */
export function setupStoreRegistry(dp: DyePack, intent: string): void {
  dp.registry.setIntent(intent);

  for (const product of [getProduct(FEATURED_PRODUCT)!]) {
    dp.registry.trust(
      product.id,
      `${product.name}. ${product.description} Price $${product.price}.`,
    );
  }

  const reviews = reviewsForProduct(FEATURED_PRODUCT);
  reviews.forEach((review, index) => {
    dp.registry.dye({
      id: review.id,
      label: reviewLabel(review, index),
      origin: "ugc:review",
      text: review.text,
    });
  });
}

export { FEATURED_PRODUCT, REVIEWS };
