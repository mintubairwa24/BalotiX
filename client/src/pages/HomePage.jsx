export default function HomePage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex items-center justify-center px-4 py-12">
      <div className="max-w-xl w-full bg-white shadow-xl rounded-3xl p-10 text-center">
        <p className="text-sm uppercase tracking-[0.3em] text-indigo-600 font-semibold">
          Welcome
        </p>
        <h1 className="mt-4 text-4xl font-bold text-slate-900">NextCart Dashboard</h1>
        <p className="mt-4 text-slate-600 leading-7">
          Your protected homepage is working. Tailwind CSS is now loaded and the root route is available.
        </p>
      </div>
    </div>
  );
}
