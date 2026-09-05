function App() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-brand-50 p-8">
      <div className="bg-white rounded-xl shadow-lg p-8 max-w-md text-center">
        <h1 className="text-3xl font-bold text-brand-600 mb-2">Pokédex</h1>
        <p className="text-slate-600">
          Tailwind is working! <br />
          <span className="text-brand-400 font-semibold">#cc163a</span> is our brand colour.
        </p>
        <div className="mt-4 w-16 h-16 mx-auto rounded-full bg-brand-400" />
      </div>
    </div>
  );
}

export default App;