const CATEGORY_RULES = [
  ["电视柜", "电视柜"],
  ["茶几", "茶几"],
  ["斗柜", "斗柜"],
  ["酒柜", "酒柜"],
  ["角柜", "柜类"],
  ["柜", "柜类"],
  ["圆几", "茶几"],
];

export function inferCategory(name = "") {
  const text = String(name);
  const match = CATEGORY_RULES.find(([keyword]) => text.includes(keyword));
  return match ? match[1] : "其他";
}

export function normalizeProducts(rawProducts = []) {
  return rawProducts
    .filter((product) => product && product.active !== false && (product.name || product.image))
    .map((product, index) => ({
      id: product.id || `product-${index + 1}`,
      name: cleanText(product.name) || "未命名产品",
      category: product.category || inferCategory(product.name),
      image: product.image || "",
      thumb: product.thumb || product.image || "",
      size: cleanText(product.size),
      color: cleanText(product.color),
      price: cleanText(product.price),
      note: cleanText(product.note),
      tags: cleanText(product.tags),
      sort: Number.isFinite(Number(product.sort)) ? Number(product.sort) : index + 1,
      featured: product.featured === true,
      active: true,
      source: product.source || "",
    }))
    .sort((first, second) => first.sort - second.sort);
}

export function matchesProduct(product, query = "", category = "全部") {
  const selectedCategory = category || "全部";
  if (selectedCategory === "价格优势" && !isPriceAdvantage(product)) {
    return false;
  }

  if (
    selectedCategory !== "全部" &&
    selectedCategory !== "推荐" &&
    selectedCategory !== "价格优势" &&
    product.category !== selectedCategory
  ) {
    return false;
  }

  const normalizedQuery = cleanText(query).toLowerCase();
  if (!normalizedQuery) {
    return true;
  }

  return [product.name, product.size, product.color, product.price, product.note, product.category]
    .join(" ")
    .toLowerCase()
    .includes(normalizedQuery);
}

export function getStartingPrice(product) {
  const prices = extractPrices(product?.price);
  if (!prices.length) {
    return "询价";
  }
  return `¥${Math.min(...prices)}起`;
}

export function isPriceAdvantage(product) {
  const prices = extractPrices(product?.price);
  return prices.length > 0 && Math.min(...prices) <= 450;
}

export function selectFeaturedProducts(products = [], limit = 6) {
  const candidates = products.filter((product) => product.image && extractPrices(product.price).length);
  const manualFeatured = candidates.filter((product) => product.featured);
  const fallbackFeatured = candidates.filter((product) => !product.featured);
  return [...manualFeatured, ...fallbackFeatured]
    .sort((first, second) => scoreProduct(second) - scoreProduct(first))
    .slice(0, limit);
}

function cleanText(value = "") {
  return String(value ?? "").replace(/\r\n/g, "\n").trim();
}

function extractPrices(price = "") {
  return [...String(price).matchAll(/\d+(?:\.\d+)?/g)]
    .map((match) => Number(match[0]))
    .filter((value) => Number.isFinite(value) && value > 0);
}

function scoreProduct(product) {
  const prices = extractPrices(product.price);
  const lowestPrice = prices.length ? Math.min(...prices) : 9999;
  const categoryBoost = product.category === "电视柜" || product.category === "茶几" ? 18 : 0;
  const multiSizeBoost = String(product.size || "").includes("\n") ? 12 : 0;
  const priceBoost = Math.max(0, 900 - lowestPrice) / 10;
  const featuredBoost = product.featured ? 1000 : 0;
  return featuredBoost + categoryBoost + multiSizeBoost + priceBoost;
}
