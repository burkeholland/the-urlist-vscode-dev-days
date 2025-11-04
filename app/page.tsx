export default function Home() {
  return (
    <div className="mx-auto max-w-[960px] px-4 py-16 flex flex-col justify-center gap-10" style={{ minHeight: "calc(100vh - 3.5rem)" }}>
      <div className="text-center w-full">
          <h1 className="text-7xl md:text-8xl font-black mb-6 text-white drop-shadow-lg">
            The Urlist
          </h1>
          <p className="text-2xl md:text-3xl text-white/90 mb-16 font-medium">
            Your links deserve a beautiful home
          </p>
          
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-10">
            <p className="text-xl font-semibold text-white mb-8" id="url-input-description">
              Drop your first link and watch the magic happen ✨
            </p>
            <div className="bg-white rounded-2xl p-2">
              <input 
                type="url" 
                placeholder="https://your-awesome-link.com" 
                aria-label="Enter your URL to create a list"
                aria-describedby="url-input-description"
                className="w-full px-8 py-7 text-2xl rounded-xl outline-none border-2 border-transparent focus:border-blue-300 transition-colors"
              />
            </div>
            <button className="w-full mt-6 px-8 py-7 text-2xl font-bold text-gray-900 bg-white rounded-2xl hover:shadow-2xl transition-all duration-300 hover:scale-[1.02]">
              Create My List 🚀
            </button>
            
            <div className="mt-10 grid grid-cols-3 gap-6 text-white">
              <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl p-4">
                <div className="text-2xl font-bold mb-1">Free</div>
                <div className="text-sm text-white/80">No limits</div>
              </div>
              <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl p-4">
                <div className="text-2xl font-bold mb-1">Fast</div>
                <div className="text-sm text-white/80">Instant setup</div>
              </div>
              <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl p-4">
                <div className="text-2xl font-bold mb-1">Fun</div>
                <div className="text-sm text-white/80">Easy to use</div>
              </div>
            </div>
          </div>
        </div>
    </div>
  );
}
