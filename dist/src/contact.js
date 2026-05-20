export const CONTACT = {
  phone: "13800008888",
  wechat: "jiaju888",
  qrImage: "assets/contact-qr.svg",
};

export function normalizePhone(phone = "") {
  return String(phone).replace(/\D/g, "");
}

export function buildContactCopy(contact = CONTACT) {
  return `电话：${normalizePhone(contact.phone)}\n微信：${contact.wechat}`;
}

export function buildCatalogShareCopy(url) {
  return `展销会产品画册：${url}`;
}
