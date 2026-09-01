import { getProduct, type Product } from "@/data/products";

export interface CartLine {
  productId: string;
  quantity: number;
}

export interface CheckoutResult {
  orderId: string;
  total: number;
  shippingAddress: string;
  coupon: string | null;
}

export class StoreEngine {
  private lines: CartLine[] = [];
  private coupon: string | null = null;
  private shippingAddress: string | null = null;
  private checkedOut = false;

  reset(): void {
    this.lines = [];
    this.coupon = null;
    this.shippingAddress = null;
    this.checkedOut = false;
  }

  addToCart(productId: string, quantity = 1): string {
    const product = getProduct(productId);
    if (!product) return `Unknown product: ${productId}`;
    const existing = this.lines.find((l) => l.productId === productId);
    if (existing) existing.quantity += quantity;
    else this.lines.push({ productId, quantity });
    return `Added ${quantity}× ${product.name} to cart.`;
  }

  removeFromCart(productId: string): string {
    const before = this.lines.length;
    this.lines = this.lines.filter((l) => l.productId !== productId);
    return before === this.lines.length
      ? `No line for ${productId} in cart.`
      : `Removed ${productId} from cart.`;
  }

  applyCoupon(code: string): string {
    this.coupon = code.toUpperCase();
    if (this.coupon === "HARBOR10") return `Coupon HARBOR10 applied — 10% off.`;
    if (this.coupon === "DRAIN40") return `Coupon DRAIN40 applied — 40% off.`;
    return `Coupon ${this.coupon} applied (unrecognized code, no discount).`;
  }

  setShippingAddress(address: string): string {
    this.shippingAddress = address;
    return `Shipping address set.`;
  }

  viewCart(): string {
    if (this.lines.length === 0) return "Cart is empty.";
    const rows = this.lines.map((l) => {
      const p = getProduct(l.productId);
      return `${l.quantity}× ${p?.name ?? l.productId} @ $${p?.price ?? "?"}`;
    });
    return [
      ...rows,
      this.coupon ? `Coupon: ${this.coupon}` : null,
      this.shippingAddress ? `Ship to: ${this.shippingAddress}` : null,
    ]
      .filter(Boolean)
      .join("\n");
  }

  subtotal(): number {
    return this.lines.reduce((sum, l) => {
      const p = getProduct(l.productId);
      return sum + (p?.price ?? 0) * l.quantity;
    }, 0);
  }

  total(): number {
    let t = this.subtotal();
    if (this.coupon === "HARBOR10") t *= 0.9;
    if (this.coupon === "DRAIN40") t *= 0.6;
    return Math.round(t * 100) / 100;
  }

  checkout(shippingAddress?: string): CheckoutResult | string {
    if (this.checkedOut) return "Order already placed.";
    if (this.lines.length === 0) return "Cart is empty — nothing to checkout.";
    const addr = shippingAddress ?? this.shippingAddress;
    if (!addr) return "No shipping address. Call set_shipping_address first.";
    this.shippingAddress = addr;
    this.checkedOut = true;
    const orderId = `HL-${Date.now().toString(36).toUpperCase()}`;
    return {
      orderId,
      total: this.total(),
      shippingAddress: addr,
      coupon: this.coupon,
    };
  }

  cartLines(): readonly CartLine[] {
    return this.lines;
  }

  isCheckedOut(): boolean {
    return this.checkedOut;
  }
}

export function formatProduct(p: Product): string {
  return `${p.name}. ${p.description} $${p.price}.`;
}
