import rimImage from "../assets/category-rim.png";
import tireImage from "../assets/category-tire.png";
import filterImage from "../assets/category-filter.png";
import headlightImage from "../assets/category-headlight.png";
import oilImage from "../assets/category-oil.png";
import sparkImage from "../assets/category-spark-plugs.png";

export const blue = "#27489f";

export const brands = [
  { id: "hyundai", name: "Hyundai", logo: "H" },
  { id: "bmw", name: "BMW", logo: "BMW" },
  { id: "geely", name: "Geely", logo: "G" },
  { id: "mercedes", name: "Mercedes", logo: "M" },
  { id: "byd", name: "BYD", logo: "BYD" },
  { id: "kia", name: "KIA", logo: "KIA" },
  { id: "skoda", name: "Skoda", logo: "S" },
  { id: "nissan", name: "Nissan", logo: "N" },
  { id: "toyota", name: "Toyota", logo: "T" },
  { id: "audi", name: "Audi", logo: "A" },
];

export const categories = [
  { id: "rims", title: "Rims", image: rimImage },
  { id: "tires", title: "Tires", image: tireImage },
  { id: "filters", title: "Filters", image: filterImage },
  { id: "headlights", title: "Headlights", image: headlightImage },
  { id: "oil", title: "Oils", image: oilImage },
  { id: "spark", title: "Spark plugs", image: sparkImage },
];

const baseProducts = [
  {
    categoryId: "rims",
    name: "Palisade Calligraphy",
    image: rimImage,
    description: '17" Hyundai Elantra Wheel Rim Factory OEM 71003 2021-2023 Machined Black.',
  },
  {
    categoryId: "tires",
    name: "Michelin Pilot Tire",
    image: tireImage,
    description: "High grip radial tire for daily comfort and stable highway driving.",
  },
  {
    categoryId: "filters",
    name: "Blue Oil Filter",
    image: filterImage,
    description: "Factory fit oil filter with clean flow protection for modern engines.",
  },
  {
    categoryId: "headlights",
    name: "LED Headlight Unit",
    image: headlightImage,
    description: "Bright replacement headlight unit with clear lens and strong housing.",
  },
  {
    categoryId: "oil",
    name: "Shell Helix Ultra",
    image: oilImage,
    description: "Full synthetic engine oil for smoother performance and heat protection.",
  },
  {
    categoryId: "spark",
    name: "Bosch Spark Plug",
    image: sparkImage,
    description: "Reliable ignition spark plug for quick starts and consistent combustion.",
  },
];

export const products = Array.from({ length: 30 }, (_, index) => {
  const base = baseProducts[index % baseProducts.length];
  return {
    id: `${base.categoryId}-${index + 1}`,
    ...base,
    price: index % 3 === 0 ? 3500 : index % 3 === 1 ? 2100 : 780,
    oldPrice: index % 3 === 0 ? 4200 : index % 3 === 1 ? 2550 : 950,
    rating: 4.5,
    colors: ["#ff8629", "#2ecc71", "#f4c542", "#ef473a", "#121212"],
    sizes: ["14", "15", "17", "18", "19"],
  };
});

export const onboardingSlides = [
  {
    id: "welcome",
    title: "Welcome to CarGo!",
    body: "Your car needs love! Mechanics and technicians from round around our governate will provide with hobby and expertise.",
    type: "service",
  },
  {
    id: "customize",
    title: "Choose Customize Order",
    body: "Explore thousands of car accessories and customize our selection with ease.",
    type: "parts",
  },
  {
    id: "upgrade",
    title: "Upgrade Your Car Experience",
    body: "Discover premium car accessories, wheels, and parts for your vehicle.",
    type: "upgrade",
  },
];

export const demoUser = {
  firstName: "Osama",
  lastName: "Abdulsalam",
  email: "osamaabdulsalam123@gmail.com",
  phone: "+1 (555) 123-4567",
  language: "English",
};
