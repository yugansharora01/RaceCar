import Scene from "@/components/Three/Scene";

export default function Home() {
  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-blue-500/30">
      <main className="max-w-7xl mx-auto px-6 py-12 flex flex-col gap-12">
        {/* Header */}
        <header className="flex flex-col gap-4">
          <h1 className="text-5xl md:text-7xl font-bold tracking-tighter bg-gradient-to-r from-white to-white/40 bg-clip-text text-transparent">
            RACE CAR <br /> EXPERIENCE
          </h1>
          <p className="text-zinc-400 text-lg max-w-xl leading-relaxed">
            A high-performance 3D visualization built with Next.js, Three.js, and React Three Fiber. 
            Place your GLB model in <code className="text-blue-400">public/models/car.glb</code> to see it in action.
          </p>
        </header>

        {/* 3D Scene Container */}
        <section className="relative w-full aspect-video md:aspect-[21/9] group">
          <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-2xl blur opacity-20 group-hover:opacity-30 transition duration-1000"></div>
          <div className="relative h-full border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
            <Scene />
          </div>
        </section>

        {/* Info Grid */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-6 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
            <h3 className="text-xl font-semibold mb-2 text-blue-400">Next.js 15</h3>
            <p className="text-zinc-400 text-sm">
              Leveraging the latest App Router features for optimal performance and SEO.
            </p>
          </div>
          <div className="p-6 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
            <h3 className="text-xl font-semibold mb-2 text-cyan-400">Three.js</h3>
            <p className="text-zinc-400 text-sm">
              Advanced 3D rendering with React Three Fiber and Drei components.
            </p>
          </div>
          <div className="p-6 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
            <h3 className="text-xl font-semibold mb-2 text-purple-400">Premium Design</h3>
            <p className="text-zinc-400 text-sm">
              Sleek dark mode interface with smooth transitions and glassmorphism.
            </p>
          </div>
        </section>

        {/* Footer */}
        <footer className="mt-auto pt-12 border-t border-white/10 flex justify-between items-center text-zinc-500 text-sm">
          <p>© 2026 Race Car Studio</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-white transition-colors">Documentation</a>
            <a href="#" className="hover:text-white transition-colors">GitHub</a>
          </div>
        </footer>
      </main>
    </div>
  );
}
