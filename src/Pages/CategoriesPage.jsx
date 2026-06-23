import CategoryCard from "../Components/CategoryCard";

export default function CategoriesPage({ categories, onOpen }) {
  return (
    <div className="mx-auto w-[min(1280px,calc(100%-80px))] pb-16 pt-10 max-sm:w-[calc(100%-32px)]">
      <h1 className="text-[30px] font-bold">All Categories</h1>
      <div className="mt-7 grid grid-cols-2 gap-6 md:grid-cols-3 lg:grid-cols-6">
        {Array.from({ length: 18 }, (_, index) => categories[index % categories.length]).map((category, index) => (
          <CategoryCard key={`${category.id}-${index}`} category={category} onOpen={onOpen} />
        ))}
      </div>
      <div className="mt-9 flex justify-center">
        <button type="button" className="h-11 w-[300px] rounded-full bg-[#27489f] font-bold text-white">Load More..</button>
      </div>
    </div>
  );
}
