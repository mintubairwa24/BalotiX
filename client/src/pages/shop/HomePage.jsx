/**
 * src/pages/shop/HomePage.jsx
 *
 * WHY THIS FILE EXISTS:
 *   This is the Phase 4 storefront landing page entry point. It composes
 *   the full home experience from reusable marketing sections without
 *   introducing product/category APIs yet.
 *
 * WHY IT IS REUSABLE:
 *   The page is intentionally a composition shell. Each child section can
 *   be reordered, removed, or extended later without changing route logic
 *   or introducing coupling between sections.
 *
 * FUTURE PHASE CONNECTION:
 *   Phase 5+ will swap the static placeholder collections inside the
 *   section components for live backend data. This page will not need to
 *   change when that happens because it only orchestrates sections.
 *
 * PRODUCTION ARCHITECTURE NOTE:
 *   Keeping the page thin is the correct React architecture for startup
 *   storefronts: the page owns layout composition, while each section owns
 *   its own semantics, motion, and data contract.
 */

import { useQuery } from "@tanstack/react-query";
import { Hero } from "../../components/home/Hero";
import { CategoryPreview } from "../../components/home/CategoryPreview";
import { FeaturedProducts } from "../../components/home/FeaturedProducts";
import { PromoBanner } from "../../components/home/PromoBanner";
import { WhyChooseUs } from "../../components/home/WhyChooseUs";
import { Testimonials } from "../../components/home/Testimonials";
import { Newsletter } from "../../components/home/Newsletter";
import { getFeaturedProducts } from "../../services/product.service";
import { useCategories } from "../../hooks/useCategories";

export default function HomePage() {
  const { categories, isLoading: categoriesLoading } = useCategories();
  const featuredQuery = useQuery({
    queryKey: ["products", "featured"],
    queryFn: () => getFeaturedProducts(8).then((res) => res.data.data.products),
    staleTime: 1000 * 60 * 5,
    retry: 1,
  });

  return (
    <main
      className="min-h-screen overflow-hidden bg-white text-slate-900 dark:bg-gray-950 dark:text-white"
      aria-label="NexCart home page"
    >
      <Hero />
      <CategoryPreview
        categories={categories}
        isLoading={categoriesLoading}
      />
      <FeaturedProducts
        products={featuredQuery.data ?? []}
        isLoading={featuredQuery.isLoading}
      />
      <PromoBanner />
      <WhyChooseUs />
      <Testimonials />
      <Newsletter />
    </main>
  );
}
