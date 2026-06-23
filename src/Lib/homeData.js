import hyundaiLogo from "../assets/brand-hyundai.png";
import bmwLogo from "../assets/brand-bmw.png";
import geelyLogo from "../assets/brand-geely.png";
import mercedesLogo from "../assets/brand-mercedes.png";
import bydLogo from "../assets/brand-byd.png";
import kiaLogo from "../assets/brand-kia.png";
import skodaLogo from "../assets/brand-skoda.png";
import trendCar01 from "../assets/trend-car-01.png";
import trendCar02 from "../assets/trend-car-02.png";
import trendCar03 from "../assets/trend-car-03.png";
import palisadeWheel from "../assets/palisade-wheel.png";

export const brandLogos = {
  hyundai: hyundaiLogo,
  bmw: bmwLogo,
  geely: geelyLogo,
  mercedes: mercedesLogo,
  byd: bydLogo,
  kia: kiaLogo,
  skoda: skodaLogo,
};

export const companies = [
  { id: "hyundai-1", name: "Hyundai", logo: brandLogos.hyundai },
  { id: "bmw", name: "BMW", logo: brandLogos.bmw },
  { id: "geely-1", name: "Geely", logo: brandLogos.geely },
  { id: "mercedes-1", name: "Mercedes", logo: brandLogos.mercedes },
  { id: "byd", name: "BYD", logo: brandLogos.byd },
  { id: "hyundai-2", name: "Hyundai", logo: brandLogos.hyundai },
  { id: "kia", name: "KIA", logo: brandLogos.kia },
  { id: "mercedes-2", name: "Mercedes", logo: brandLogos.mercedes },
  { id: "geely-2", name: "Geely", logo: brandLogos.geely },
  { id: "skoda", name: "Skoda", logo: brandLogos.skoda },
  { id: "geely-3", name: "Geely", logo: brandLogos.geely },
];

export const trendCars = [
  { id: "steeda", image: trendCar01, alt: "Black sports car front view" },
  { id: "steeda-side", image: trendCar02, alt: "Sports car side view" },
  { id: "steeda-blue", image: trendCar03, alt: "Sports car cool toned front view" },
];

export const products = Array.from({ length: 24 }, (_, index) => ({
  id: `palisade-wheel-${index + 1}`,
  name: "Palisade Calligraphy",
  price: "EGP 3,500",
  oldPrice: "4200 EGP",
  review: "Review (4.5)",
  rating: 4.5,
  image: palisadeWheel,
  gallery: [palisadeWheel, palisadeWheel, palisadeWheel],
  colors: [
    { id: "orange", value: "#f59e0b" },
    { id: "mint", value: "#6ee7b7" },
    { id: "yellow", value: "#facc15" },
    { id: "red", value: "#ef4444" },
    { id: "black", value: "#111827" },
  ],
  sizes: ["14", "15", "17", "18", "19"],
  description: '17" Hyundai Elantra Wheel Rim Factory OEM 71003 2021-2023 Machined Black.',
}));
