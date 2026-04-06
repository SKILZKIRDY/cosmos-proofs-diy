export default function Hero() {
  const scrollTo = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="relative bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 opacity-10">
          <img 
            src="https://d64gsuwffb70l.cloudfront.net/6921b905a44250e318108d2c_1763817799291_6451f265.webp"
            alt="Horizon"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-slate-900/50" />
        {/* Decorative grid */}
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)',
          backgroundSize: '60px 60px'
        }} />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 py-24 sm:py-32">
        <div className="text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-cyan-500/20 border border-cyan-400/30 rounded-full text-cyan-300 text-sm font-medium mb-6 backdrop-blur-sm">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z" />
            </svg>
            Open Source Research Platform
          </div>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-6 leading-tight tracking-tight">
            Discover Truth Through<br />
            <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
              Direct Observation
            </span>
          </h1>
          <p className="text-xl sm:text-2xl text-gray-300 mb-10 max-w-3xl mx-auto leading-relaxed">
            Perform repeatable experiments, explore documented evidence, and verify 
            cosmological claims yourself. Science is about observation, not belief.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button 
              onClick={() => scrollTo('experiments')}
              className="px-8 py-4 bg-cyan-500 hover:bg-cyan-600 text-white font-bold rounded-xl transition-all text-lg shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 hover:-translate-y-0.5"
            >
              Explore Experiments
            </button>
            <button 
              onClick={() => scrollTo('calculators')}
              className="px-8 py-4 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl transition-all text-lg shadow-lg shadow-purple-600/25 hover:shadow-purple-600/40 hover:-translate-y-0.5"
            >
              Try Calculators
            </button>
            <button 
              onClick={() => scrollTo('evidence')}
              className="px-8 py-4 bg-white/10 backdrop-blur-sm border-2 border-white/30 hover:bg-white hover:text-slate-900 text-white font-bold rounded-xl transition-all text-lg hover:-translate-y-0.5"
            >
              Evidence Library
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="mt-20 grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
          <div className="bg-white/5 backdrop-blur-sm rounded-xl p-5 border border-white/10">
            <div className="text-3xl sm:text-4xl font-bold text-cyan-400 mb-1">12+</div>
            <div className="text-gray-400 text-sm">Verified Experiments</div>
          </div>
          <div className="bg-white/5 backdrop-blur-sm rounded-xl p-5 border border-white/10">
            <div className="text-3xl sm:text-4xl font-bold text-cyan-400 mb-1">24+</div>
            <div className="text-gray-400 text-sm">Evidence Entries</div>
          </div>
          <div className="bg-white/5 backdrop-blur-sm rounded-xl p-5 border border-white/10">
            <div className="text-3xl sm:text-4xl font-bold text-cyan-400 mb-1">4</div>
            <div className="text-gray-400 text-sm">Calculation Tools</div>
          </div>
          <div className="bg-white/5 backdrop-blur-sm rounded-xl p-5 border border-white/10">
            <div className="text-3xl sm:text-4xl font-bold text-cyan-400 mb-1">100%</div>
            <div className="text-gray-400 text-sm">Repeatable Results</div>
          </div>
        </div>
      </div>
    </div>
  );
}
