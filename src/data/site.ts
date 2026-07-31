export const siteMeta = {
  name: "Pahal Hospital",
  url: "https://www.pahalhospital.com",
  defaultTitle: "Pahal Hospital | Multi Speciality Hospital in Surat",
  defaultDescription:
    "Pahal Hospital is a multi speciality hospital in Morabhagal, Surat offering maternity care, emergency support, surgery, pediatric care and general healthcare services.",
  keywords:
    "Pahal Hospital, multi speciality hospital in Surat, hospital in Morabhagal, maternity hospital Surat, emergency hospital Surat, gynecology hospital Surat",
  author: "Pahal Hospital",
  locale: "en_IN",
  logo: "/images/logo.webp",
  image: "/images/pahal_hospital.webp",
  phone: "+919879771477",
  landline: "+912612771477",
  email: "info@pahalhospital.com",
  address: {
    streetAddress: "Morabhagal Circle, Rander Bambakhana Road",
    addressLocality: "Surat",
    addressRegion: "Gujarat",
    postalCode: "395005",
    addressCountry: "IN"
  },
  sameAs: [
    "https://www.facebook.com/pahalhospital/",
    "https://www.instagram.com/Pahalhospital/",
    "https://g.page/pahalhospital?share",
    "https://www.youtube.com/@pahalhospital"
  ]
} as const;

export const seoPages = [
  { path: "/", priority: "1.0", changefreq: "weekly" },
  { path: "/about", priority: "0.8", changefreq: "monthly" },
  { path: "/about/our-hospital", priority: "0.7", changefreq: "monthly" },
  { path: "/about/our-team", priority: "0.7", changefreq: "monthly" },
  { path: "/services", priority: "0.8", changefreq: "monthly" },
  { path: "/testimonials", priority: "0.7", changefreq: "monthly" },
  { path: "/contact", priority: "0.9", changefreq: "monthly" },
  { path: "/privacy-policy", priority: "0.3", changefreq: "yearly" },
  { path: "/terms-and-conditions", priority: "0.3", changefreq: "yearly" },
  { path: "/medical-disclaimer", priority: "0.3", changefreq: "yearly" },
  { path: "/sitemap", priority: "0.2", changefreq: "monthly" }
] as const;

export function absoluteUrl(path = "/") {
  return new URL(path, siteMeta.url).toString();
}


