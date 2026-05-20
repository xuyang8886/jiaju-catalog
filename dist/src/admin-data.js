import { inferCategory } from "./catalog.js";

export function createEmptyProduct(nextNumber = 1) {
  return {
    id: `product-${nextNumber}`,
    name: "",
    category: "其他",
    image: "",
    size: "",
    color: "白胚",
    price: "",
    note: "",
    tags: "",
    sort: nextNumber,
    active: true,
    featured: false,
    source: "后台新增",
  };
}

export function prepareProductsForSave(products = []) {
  return products
    .map((product, index) => normalizeAdminProduct(product, index))
    .filter((product) => product.name || product.image)
    .sort((first, second) => first.sort - second.sort);
}

export function updateProduct(products = [], id, patch = {}) {
  return products.map((product) => (product.id === id ? normalizeAdminProduct({ ...product, ...patch }) : product));
}

function normalizeAdminProduct(product = {}, index = 0) {
  return {
    id: clean(product.id) || `product-${index + 1}`,
    name: clean(product.name),
    category: clean(product.category) || inferCategory(product.name),
    image: clean(product.image),
    size: clean(product.size),
    color: clean(product.color),
    price: clean(product.price),
    note: clean(product.note),
    tags: clean(product.tags),
    sort: Number.isFinite(Number(product.sort)) ? Number(product.sort) : index + 1,
    active: product.active !== false,
    featured: product.featured === true,
    source: clean(product.source),
  };
}

function clean(value = "") {
  return String(value ?? "").trim();
}
