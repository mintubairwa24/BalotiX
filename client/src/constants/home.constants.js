/**
 * src/constants/home.constants.js
 *
 * PURPOSE:
 *   Static data that drives every section of the HomePage.
 *   All home section components import from here instead of hardcoding
 *   data inline — making the replacement path to live API data trivial:
 *   just swap the import for a React Query hook.
 *
 * FUTURE API MAPPING:
 *   MOCK_CATEGORIES    → GET /categories?flat=false&status=active
 *   MOCK_PRODUCTS      → GET /products/featured?limit=8
 *   NEW_ARRIVALS       → GET /products?sortBy=createdAt&sortOrder=desc&limit=8
 *   BEST_SELLERS       → GET /products?sortBy=totalReviews&sortOrder=desc&limit=8
 *   TRENDING_PRODUCTS  → GET /products?isFeatured=true&limit=8
 *   TESTIMONIALS       → static forever (or a future reviews endpoint)
 *
 * SCALABILITY:
 *   Every field here mirrors the exact shape returned by the backend
 *   (see PROJECT_CONTEXT.md Part 4). When Phase 5 wires the Product API,
 *   these mock objects can be deleted without changing any component JSX.
 */

import {
  Smartphone, Laptop, Headphones, Watch, Camera,
  Shirt, Home as HomeIcon, Dumbbell, BookOpen, Gamepad2,
  Truck, Shield, RefreshCw, Headset,
} from "lucide-react";

// ─── Categories ───────────────────────────────────────────────────────────────

/**
 * NOTE: This mock data is aligned with `server/src/scripts/seed/categories.data.js`.
 * The `productCount` is illustrative and will be replaced by live API data.
 * The `icon` mapping is based on the category names.
 */
export const MOCK_CATEGORIES = [
  {
    _id: "cat_01",
    name: "Electronics",
    slug: "electronics",
    icon: Smartphone,
    productCount: 1240,
    gradient: "from-violet-500 to-indigo-600",
    bgLight: "bg-violet-50",
    bgDark: "dark:bg-violet-950",
  },
  {
    _id: "cat_02",
    name: "Fashion",
    slug: "fashion",
    icon: Shirt,
    productCount: 3800,
    gradient: "from-fuchsia-500 to-purple-600",
    bgLight: "bg-fuchsia-50",
    bgDark: "dark:bg-fuchsia-950",
  },
  {
    _id: "cat_03",
    name: "Home & Kitchen",
    slug: "home-kitchen",
    icon: HomeIcon,
    productCount: 1560,
    gradient: "from-lime-500 to-green-600",
    bgLight: "bg-lime-50",
    bgDark: "dark:bg-lime-950",
  },
  {
    _id: "cat_04",
    name: "Sports & Fitness",
    slug: "sports-fitness",
    icon: Dumbbell,
    productCount: 890,
    gradient: "from-red-500 to-orange-600",
    bgLight: "bg-red-50",
    bgDark: "dark:bg-red-950",
  },
  {
    _id: "cat_05",
    name: "Books",
    slug: "books",
    icon: BookOpen,
    productCount: 4200,
    gradient: "from-sky-500 to-blue-600",
    bgLight: "bg-sky-50",
    bgDark: "dark:bg-sky-950",
  },
  {
    _id: "cat_06",
    name: "Beauty & Personal Care",
    slug: "beauty-personal-care",
    // Assuming you have an icon for this, like a lotion bottle.
    // Using 'Headphones' as a placeholder from the available imports.
    icon: Headphones,
    productCount: 950,
    gradient: "from-pink-500 to-rose-600",
    bgLight: "bg-pink-50",
    bgDark: "dark:bg-pink-950",
  },
];

// ─── Mock Products ─────────────────────────────────────────────────────────────
// Shape mirrors backend Product object (PROJECT_CONTEXT.md Part 4).
// effectivePrice is the virtual field — use this for display, never raw `price`.

const generateProducts = (prefix, count) =>
  Array.from({ length: count }, (_, i) => ({
    _id: `${prefix}_${i + 1}`,
    name: ["iPhone 15 Pro", "Samsung Galaxy S24", "MacBook Air M3", "Sony WH-1000XM5",
           "Apple Watch Series 9", "iPad Pro M4", "Canon EOS R50", "JBL Flip 6",
           "Bose QuietComfort 45", "OnePlus 12", "Dell XPS 15", "Logitech MX Keys"][i % 12],
    slug: `product-slug-${prefix}-${i + 1}`,
    brand: ["Apple", "Samsung", "Apple", "Sony", "Apple", "Apple", "Canon", "JBL",
            "Bose", "OnePlus", "Dell", "Logitech"][i % 12],
    price: [134900, 79999, 114900, 29990, 41900, 109900, 55990, 11999,
            24990, 64999, 149900, 9995][i % 12],
    salePrice: [119900, 72999, null, 24990, null, 99900, null, 9999,
                19990, 59999, 134900, null][i % 12],
    isOnSale: [true, true, false, true, false, true, false, true,
               true, true, true, false][i % 12],
    effectivePrice: [119900, 72999, 114900, 24990, 41900, 99900, 55990, 9999,
                     19990, 59999, 134900, 9995][i % 12],
    discountPercentage: [11, 9, 0, 17, 0, 9, 0, 17, 20, 8, 10, 0][i % 12],
    averageRating: [4.8, 4.6, 4.7, 4.5, 4.3, 4.9, 4.4, 4.2, 4.6, 4.5, 4.7, 4.3][i % 12],
    totalReviews: [2841, 1923, 756, 3120, 654, 412, 289, 1876, 2234, 1456, 534, 789][i % 12],
    isInStock: true,
    isLowStock: [false, false, false, true, false, false, true, false, false, false, true, false][i % 12],
    thumbnail: `https://picsum.photos/seed/${prefix}_${i + 1}/400/400`, // deterministic real-style image per product
    currency: "INR",
  }));

export const MOCK_FEATURED_PRODUCTS = generateProducts("feat", 8);
export const MOCK_NEW_ARRIVALS = generateProducts("new", 8);
export const MOCK_BEST_SELLERS = generateProducts("best", 8);
export const MOCK_TRENDING_PRODUCTS = generateProducts("trend", 8);

// ─── Why Choose NexCart ────────────────────────────────────────────────────────

export const WHY_CHOOSE_FEATURES = [
  {
    id: "shipping",
    icon: Truck,
    title: "Free Shipping",
    description: "Free delivery on all orders above ₹499. Same-day delivery available in 20+ cities.",
    highlight: "On orders above ₹499",
    gradient: "from-blue-500 to-indigo-600",
    bgLight: "bg-blue-50 dark:bg-blue-950/50",
    iconColor: "text-blue-600 dark:text-blue-400",
  },
  {
    id: "payments",
    icon: Shield,
    title: "Secure Payments",
    description: "100% secure checkout. Your payment data is encrypted end-to-end via Razorpay.",
    highlight: "256-bit SSL Encryption",
    gradient: "from-emerald-500 to-teal-600",
    bgLight: "bg-emerald-50 dark:bg-emerald-950/50",
    iconColor: "text-emerald-600 dark:text-emerald-400",
  },
  {
    id: "returns",
    icon: RefreshCw,
    title: "Easy Returns",
    description: "Not satisfied? Return any product within 7 days, no questions asked.",
    highlight: "7-day hassle-free returns",
    gradient: "from-amber-500 to-orange-600",
    bgLight: "bg-amber-50 dark:bg-amber-950/50",
    iconColor: "text-amber-600 dark:text-amber-400",
  },
  {
    id: "support",
    icon: Headset,
    title: "24/7 Support",
    description: "Our customer support team is available round the clock to help you.",
    highlight: "Always here for you",
    gradient: "from-violet-500 to-purple-600",
    bgLight: "bg-violet-50 dark:bg-violet-950/50",
    iconColor: "text-violet-600 dark:text-violet-400",
  },
];

// ─── Testimonials ─────────────────────────────────────────────────────────────

export const TESTIMONIALS = [
  {
    id: "t1",
    name: "Priya Sharma",
    location: "Mumbai, Maharashtra",
    avatar: "PS",
    avatarGradient: "from-pink-400 to-rose-500",
    rating: 5,
    review: "BalotiX has completely changed how I shop online. The delivery was super fast and the product quality is exactly as described. Love the easy return policy too!",
    product: "iPhone 15 Pro",
    verified: true,
  },
  {
    id: "t2",
    name: "Rahul Mehta",
    location: "Bengaluru, Karnataka",
    avatar: "RM",
    avatarGradient: "from-blue-400 to-indigo-500",
    rating: 5,
    review: "Best e-commerce platform in India, period. Got my laptop delivered in 2 days and the price was significantly lower than other platforms. Will definitely shop again.",
    product: "MacBook Air M3",
    verified: true,
  },
  {
    id: "t3",
    name: "Anjali Patel",
    location: "Ahmedabad, Gujarat",
    avatar: "AP",
    avatarGradient: "from-emerald-400 to-teal-500",
    rating: 5,
    review: "The interface is so clean and smooth. Finding products is effortless and the checkout process took less than 2 minutes. Finally an Indian platform that gets UX right.",
    product: "Sony WH-1000XM5",
    verified: true,
  },
  {
    id: "t4",
    name: "Karthik Rajan",
    location: "Chennai, Tamil Nadu",
    avatar: "KR",
    avatarGradient: "from-amber-400 to-orange-500",
    rating: 4,
    review: "Great product selection and prices. Customer support was very helpful when I had a query about my order. The notification system keeps you well updated on delivery status.",
    product: "Samsung Galaxy S24",
    verified: true,
  },
  {
    id: "t5",
    name: "Sneha Gupta",
    location: "Delhi, NCR",
    avatar: "SG",
    avatarGradient: "from-violet-400 to-purple-500",
    rating: 5,
    review: "Ordered during a sale and got amazing discounts. The coupon system is transparent — you see exactly how much you're saving before checkout. Highly recommend!",
    product: "Apple Watch Series 9",
    verified: true,
  },
  {
    id: "t6",
    name: "Vikram Singh",
    location: "Jaipur, Rajasthan",
    avatar: "VS",
    avatarGradient: "from-cyan-400 to-sky-500",
    rating: 5,
    review: "I was skeptical at first but BalotiX delivered on every promise. Premium products, honest reviews, and a seamless mobile experience. This is what online shopping should feel like.",
    product: "iPad Pro M4",
    verified: true,
  },
];

// ─── Hero Stats ────────────────────────────────────────────────────────────────

export const HERO_STATS = [
  { value: "10L+", label: "Happy Customers" },
  { value: "50K+", label: "Products Listed" },
  { value: "4.8★", label: "Average Rating" },
];

// ─── Promotional Banner ────────────────────────────────────────────────────────

export const PROMO_BANNER = {
  badge: "Limited Time Offer",
  headline: "Up to 40% Off",
  subheadline: "on Premium Electronics",
  description: "Shop the biggest sale of the season. Premium brands, unbeatable prices. Ends Sunday midnight.",
  ctaLabel: "Shop the Sale",
  ctaPath: "/products?sale=true",
  secondaryCtaLabel: "View All Deals",
  secondaryCtaPath: "/products",
};