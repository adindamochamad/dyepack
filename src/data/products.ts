export interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  description: string;
  material: string;
}

export const PRODUCTS: Product[] = [
  {
    id: "ridgeline-mug",
    name: "Ridgeline Stoneware Mug",
    price: 38,
    category: "tableware",
    material: "stoneware",
    description:
      "340ml matte-glaze mug. Fired at 1240°C. Dishwasher-safe. The handle fits three fingers without crowding.",
  },
  {
    id: "loom-throw",
    name: "Loom Weave Throw",
    price: 89,
    category: "textiles",
    material: "merino-cotton blend",
    description:
      "180×140 cm. 420 gsm. Brushed on one side, flat on the other. Ships rolled, not folded.",
  },
  {
    id: "harbor-candle",
    name: "Harbor No. 3 Candle",
    price: 24,
    category: "scent",
    material: "soy wax",
    description:
      "45-hour burn. Notes: salt air, cedar plank, cold linen. Cotton wick. 190g.",
  },
  {
    id: "kelp-bowl",
    name: "Kelp Glaze Serving Bowl",
    price: 52,
    category: "tableware",
    material: "stoneware",
    description:
      "28 cm diameter, 8 cm deep. Reactive kelp glaze — each piece varies. Oven-safe to 220°C.",
  },
  {
    id: "draft-desk-lamp",
    name: "Draft Desk Lamp",
    price: 118,
    category: "lighting",
    material: "powder-coated steel",
    description:
      "Adjustable arm, 2700K LED, inline dimmer. Base weighted with river stone. 42 cm reach.",
  },
];

export function getProduct(id: string): Product | undefined {
  return PRODUCTS.find((p) => p.id === id);
}

export function searchProducts(query: string): Product[] {
  const q = query.toLowerCase();
  return PRODUCTS.filter(
    (p) =>
      p.name.toLowerCase().includes(q) ||
      p.category.includes(q) ||
      p.material.includes(q) ||
      p.description.toLowerCase().includes(q),
  );
}
