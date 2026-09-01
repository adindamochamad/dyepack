import { reviewsForProduct } from "@/data/reviews";
import { getProduct, searchProducts } from "@/data/products";
import { formatProduct, type StoreEngine } from "@/store/engine";
import type { WebMCPTool } from "@/dyepack/interceptor";
import type { Blast } from "@/dyepack/types";

export interface ToolSpec {
  blast: Blast;
  tool: WebMCPTool;
}

export function buildStoreTools(engine: StoreEngine): ToolSpec[] {
  return [
    {
      blast: "read",
      tool: {
        name: "search_products",
        description: "Search the Harbor & Loom catalog by keyword.",
        inputSchema: {
          type: "object",
          properties: { query: { type: "string", description: "Search terms" } },
          required: ["query"],
        },
        execute: ({ query }) => {
          const hits = searchProducts(String(query ?? ""));
          if (hits.length === 0) return { content: [{ type: "text", text: "No products found." }] };
          return {
            content: [{ type: "text", text: hits.map((p) => `${p.id}: ${p.name} — $${p.price}`).join("\n") }],
          };
        },
      },
    },
    {
      blast: "read",
      tool: {
        name: "get_product",
        description: "Get full details for one product by id.",
        inputSchema: {
          type: "object",
          properties: { productId: { type: "string" } },
          required: ["productId"],
        },
        execute: ({ productId }) => {
          const p = getProduct(String(productId));
          if (!p) return { content: [{ type: "text", text: `Unknown product: ${productId}` }], isError: true };
          return { content: [{ type: "text", text: formatProduct(p) }] };
        },
      },
    },
    {
      blast: "read",
      tool: {
        name: "read_reviews",
        description: "Read customer reviews for a product.",
        inputSchema: {
          type: "object",
          properties: { productId: { type: "string" } },
          required: ["productId"],
        },
        execute: ({ productId }) => {
          const reviews = reviewsForProduct(String(productId));
          const text = reviews
            .map((r, i) => `#${i + 1} ${r.author} (${r.rating}/5): ${r.text.trim()}`)
            .join("\n\n");
          return { content: [{ type: "text", text: text || "No reviews." }] };
        },
      },
    },
    {
      blast: "read",
      tool: {
        name: "view_cart",
        description: "View the current shopping cart.",
        inputSchema: { type: "object", properties: {} },
        execute: () => ({ content: [{ type: "text", text: engine.viewCart() }] }),
      },
    },
    {
      blast: "reversible",
      tool: {
        name: "add_to_cart",
        description: "Add a product to the cart.",
        inputSchema: {
          type: "object",
          properties: {
            productId: { type: "string" },
            quantity: { type: "number" },
          },
          required: ["productId"],
        },
        execute: ({ productId, quantity }) => ({
          content: [{ type: "text", text: engine.addToCart(String(productId), Number(quantity) || 1) }],
        }),
      },
    },
    {
      blast: "reversible",
      tool: {
        name: "remove_from_cart",
        description: "Remove a product from the cart.",
        inputSchema: {
          type: "object",
          properties: { productId: { type: "string" } },
          required: ["productId"],
        },
        execute: ({ productId }) => ({
          content: [{ type: "text", text: engine.removeFromCart(String(productId)) }],
        }),
      },
    },
    {
      blast: "reversible",
      tool: {
        name: "apply_coupon",
        description: "Apply a discount coupon code.",
        inputSchema: {
          type: "object",
          properties: { code: { type: "string" } },
          required: ["code"],
        },
        execute: ({ code }) => ({
          content: [{ type: "text", text: engine.applyCoupon(String(code)) }],
        }),
      },
    },
    {
      blast: "irreversible",
      tool: {
        name: "set_shipping_address",
        description: "Set the shipping address for checkout.",
        inputSchema: {
          type: "object",
          properties: { address: { type: "string" } },
          required: ["address"],
        },
        execute: ({ address }) => ({
          content: [{ type: "text", text: engine.setShippingAddress(String(address)) }],
        }),
      },
    },
    {
      blast: "irreversible",
      tool: {
        name: "checkout",
        description: "Place the order and charge the card on file.",
        inputSchema: {
          type: "object",
          properties: { shippingAddress: { type: "string" } },
        },
        execute: ({ shippingAddress }) => {
          const result = engine.checkout(shippingAddress ? String(shippingAddress) : undefined);
          if (typeof result === "string") {
            return { content: [{ type: "text", text: result }], isError: true };
          }
          return {
            content: [
              {
                type: "text",
                text: `Order ${result.orderId} placed. Total: $${result.total}. Shipped to ${result.shippingAddress}.`,
              },
            ],
          };
        },
      },
    },
  ];
}

/** OpenAI-compatible tool schemas (no execute). */
export function toolSchemasForApi(specs: ToolSpec[]) {
  return specs.map(({ tool }) => ({
    type: "function" as const,
    function: {
      name: tool.name,
      description: tool.description,
      parameters: tool.inputSchema,
    },
  }));
}
