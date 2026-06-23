import PageHeader from "../Components/PageHeader";
import ChatButton from "../Components/ChatButton";
import { Icon } from "../Components/Icon";
import { money } from "../utils/format";

export default function CartPage({ items, onBack, onQty, onDeleteAll, onBuy, onFavorite, onChat }) {
  const empty = items.length === 0;
  return (
    <main className="min-h-screen bg-[#f7f7f8] pb-8">
      <PageHeader title="My Cart" onBack={onBack} />
      <section className="mx-auto w-[min(1280px,calc(100%-80px))] max-sm:w-[calc(100%-32px)]">
        {empty ? (
          <div className="grid min-h-[610px] place-items-center text-center">
            <div>
              <Icon name="cart" className="mx-auto h-32 w-32 text-[#27489f]" />
              <h2 className="mt-4 text-[30px] font-bold text-slate-700">No Cart Is Empty!</h2>
              <p className="mt-1 text-lg text-slate-600">When you add products, they will appear here.</p>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {items.map((item) => (
              <article key={item.lineId} className="grid grid-cols-[320px_1fr_auto] gap-6 max-lg:grid-cols-1">
                <img src={item.product.image} alt={item.product.name} className="h-[180px] w-full rounded-[10px] bg-white object-contain p-4" />
                <div>
                  <h2 className="text-2xl font-bold">{item.product.name}</h2>
                  <p className="text-slate-500">Review <span className="text-[#27489f]">({item.product.rating})</span></p>
                  <p className="mt-20 text-[30px] font-bold text-[#27489f] max-lg:mt-6">{money(item.product.price)}</p>
                </div>
                <div className="flex flex-col items-end justify-between max-lg:flex-row">
                  <button type="button" onClick={() => onFavorite(item.product.id)} className="grid h-9 w-9 place-items-center rounded-full bg-white text-[#27489f] shadow"><Icon name="heart" /></button>
                  <div className="flex items-center gap-4">
                    <button type="button" onClick={() => onQty(item.lineId, 1)} className="grid h-8 w-8 place-items-center rounded-full bg-white text-[#27489f] shadow"><Icon name="plus" className="h-4 w-4" /></button>
                    <span className="font-bold text-[#27489f]">{item.qty}</span>
                    <button type="button" onClick={() => onQty(item.lineId, -1)} className="grid h-8 w-8 place-items-center rounded-full bg-white shadow"><Icon name="minus" className="h-4 w-4" /></button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
      <div className="fixed bottom-6 left-0 right-0 z-20 mx-auto w-[min(1280px,calc(100%-80px))] space-y-6 max-sm:w-[calc(100%-32px)]">
        {!empty ? <button type="button" onClick={onDeleteAll} className="h-11 w-full rounded-full border border-red-500 font-bold text-red-500">Delete All</button> : null}
        <button type="button" onClick={onBuy} className="h-11 w-full rounded-full bg-[#27489f] font-bold text-white">Buy Now</button>
      </div>
      <ChatButton onClick={onChat} />
    </main>
  );
}
