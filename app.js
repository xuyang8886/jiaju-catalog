import {
  getStartingPrice,
  matchesProduct,
  normalizeProducts,
  selectFeaturedProducts,
} from "./src/catalog.js";
import { buildCatalogShareCopy, buildContactCopy, CONTACT, normalizePhone } from "./src/contact.js";

const state = {
  products: [],
  category: "全部",
  query: "",
};

const feed = document.querySelector("#productFeed");
const count = document.querySelector("#productCount");
const empty = document.querySelector("#emptyState");
const chips = document.querySelector("#categoryChips");
const search = document.querySelector("#searchInput");
const featuredStrip = document.querySelector("#featuredStrip");
const allProductCount = document.querySelector("#allProductCount");
const dialog = document.querySelector("#detailDialog");
const saveCatalog = document.querySelector("#saveCatalog");
const contactQuote = document.querySelector("#contactQuote");
const contactDialog = document.querySelector("#contactDialog");
const favoriteDialog = document.querySelector("#favoriteDialog");
const contactPhone = document.querySelector("#contactPhone");
const contactWechat = document.querySelector("#contactWechat");
const contactQr = document.querySelector("#contactQr");
const callContact = document.querySelector("#callContact");

const detail = {
  image: document.querySelector("#detailImage"),
  category: document.querySelector("#detailCategory"),
  name: document.querySelector("#detailName"),
  size: document.querySelector("#detailSize"),
  color: document.querySelector("#detailColor"),
  price: document.querySelector("#detailPrice"),
  note: document.querySelector("#detailNote"),
};

document.querySelector("#closeDetail").addEventListener("click", () => dialog.close());
document.querySelector("#closeContact").addEventListener("click", () => contactDialog.close());
document.querySelector("#closeFavorite").addEventListener("click", () => favoriteDialog.close());
dialog.addEventListener("click", (event) => {
  if (event.target === dialog) {
    dialog.close();
  }
});
saveCatalog.addEventListener("click", async () => {
  favoriteDialog.showModal();
});

contactQuote.addEventListener("click", async () => {
  openContact();
});
document.querySelector("#copyCatalogLink").addEventListener("click", async () => {
  await copyText(buildCatalogShareCopy(location.href));
  window.alert("画册链接已复制。");
});
document.querySelector("#copyContact").addEventListener("click", async () => {
  await copyText(buildContactCopy(CONTACT));
  window.alert("联系方式已复制。");
});

search.addEventListener("input", (event) => {
  state.query = event.target.value;
  renderProducts();
});

init();

async function init() {
  const response = await fetch("./data/products.json");
  state.products = normalizeProducts(await response.json());
  renderFeatured();
  renderCategories();
  renderProducts();
}

function renderCategories() {
  const categories = [
    "推荐",
    "价格优势",
    "电视柜",
    "茶几",
    "斗柜",
    "柜类",
    "全部",
    ...new Set(state.products.map((product) => product.category)),
  ].filter((category, index, list) => list.indexOf(category) === index);
  chips.replaceChildren(
    ...categories.map((category) => {
      const button = document.createElement("button");
      button.className = "chip";
      button.type = "button";
      button.textContent = category;
      button.setAttribute("aria-pressed", String(category === state.category));
      button.addEventListener("click", () => {
        state.category = category;
        renderCategories();
        renderProducts();
      });
      return button;
    }),
  );
}

function renderProducts() {
  const baseProducts =
    state.category === "推荐" ? selectFeaturedProducts(state.products, 12) : state.products;
  const products = baseProducts.filter((product) => matchesProduct(product, state.query, state.category));

  count.textContent = `${products.length} 款`;
  allProductCount.textContent = `${products.length} 款`;
  empty.hidden = products.length > 0;
  feed.replaceChildren(...products.map(createProductCard));
}

function renderFeatured() {
  featuredStrip.replaceChildren(...selectFeaturedProducts(state.products, 8).map(createFeaturedCard));
}

function createFeaturedCard(product) {
  const button = document.createElement("button");
  button.className = "featured-card";
  button.type = "button";
  button.innerHTML = `
    <img src="${product.image}" alt="${product.name}" loading="lazy">
    <div>
      <p>${product.name}</p>
      <strong>${getStartingPrice(product)}</strong>
    </div>
  `;
  button.addEventListener("click", () => openDetail(product));
  return button;
}

function createProductCard(product) {
  const button = document.createElement("button");
  button.className = "product-card";
  button.type = "button";
  const tags = product.tags
    ? `<div class="product-tags">${product.tags
        .split(/[,，]/)
        .filter(Boolean)
        .slice(0, 3)
        .map((tag) => `<span>${tag.trim()}</span>`)
        .join("")}</div>`
    : "";
  button.innerHTML = `
    <img src="${product.image}" alt="${product.name}" loading="lazy">
    <div class="product-info">
      <h2 class="product-name">${product.name}</h2>
      <div class="product-price">${getStartingPrice(product)}</div>
      <p class="product-size">${product.size || "尺寸待补充"}</p>
      <p class="product-note">${product.note || ""}</p>
      ${tags}
    </div>
  `;
  button.addEventListener("click", () => openDetail(product));
  return button;
}

function openDetail(product) {
  detail.image.src = product.image;
  detail.image.alt = product.name;
  detail.category.textContent = product.category;
  detail.name.textContent = product.name;
  detail.size.textContent = product.size || "待补充";
  detail.color.textContent = product.color || "待补充";
  detail.price.textContent = product.price || getStartingPrice(product);
  detail.note.textContent = product.note || "无";
  dialog.showModal();
}

function openContact() {
  const phone = normalizePhone(CONTACT.phone);
  contactPhone.textContent = phone;
  contactWechat.textContent = CONTACT.wechat;
  contactQr.src = CONTACT.qrImage;
  callContact.href = `tel:${phone}`;
  contactDialog.showModal();
}

async function copyText(text) {
  if (navigator.clipboard) {
    await navigator.clipboard.writeText(text);
  }
}
