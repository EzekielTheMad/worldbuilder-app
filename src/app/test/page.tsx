// src/app/test/page.tsx
// Test page to verify Tailwind v4 is working with all components

export default function TestPage() {
  return (
    <div className="container mx-auto py-8 space-y-8">
      <h1 className="text-4xl font-bold text-purple-500">Tailwind v4 Component Test</h1>
      
      {/* Test basic Tailwind utilities */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Basic Tailwind Classes</h2>
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-red-500 p-4 text-white rounded">bg-red-500</div>
          <div className="bg-green-500 p-4 text-white rounded">bg-green-500</div>
          <div className="bg-blue-500 p-4 text-white rounded">bg-blue-500</div>
        </div>
      </section>

      {/* Test your custom colors */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Custom Design System Colors</h2>
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-purple-500 p-4 text-white rounded">Primary</div>
          <div className="bg-yellow-500 p-4 text-black rounded">Gold</div>
          <div className="bg-red-600 p-4 text-white rounded">Crimson</div>
          <div className="bg-green-500 p-4 text-white rounded">Emerald</div>
        </div>
      </section>

      {/* Test typography */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Typography</h2>
        <p className="font-serif text-xl">Font Serif</p>
        <p className="font-sans text-lg">Font Sans</p>
        <p className="font-mono text-base">Font Mono</p>
      </section>

      {/* Test spacing */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Spacing</h2>
        <div className="flex gap-4">
          <div className="bg-gray-200 p-2 border">p-2</div>
          <div className="bg-gray-200 p-3 border">p-3</div>
          <div className="bg-gray-200 p-4 border">p-4</div>
          <div className="bg-gray-200 p-6 border">p-6</div>
          <div className="bg-gray-200 p-8 border">p-8</div>
        </div>
      </section>

      {/* Test animations */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Animations</h2>
        <div className="flex gap-4">
          <div className="bg-purple-500 p-4 text-white rounded animate-pulse">Pulse</div>
          <div className="bg-yellow-500 p-4 text-black rounded animate-spin">Spin</div>
          <div className="bg-red-600 p-4 text-white rounded animate-bounce">Bounce</div>
        </div>
      </section>

      {/* Test your custom utilities */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Custom Classes</h2>
        <div className="card p-6">
          <h3 className="text-xl font-semibold mb-2">Card Component</h3>
          <p>This uses the .card class from globals.css</p>
        </div>
        <div className="gradient-border p-6 bg-surface rounded-lg">
          <p>Gradient Border Utility</p>
        </div>
      </section>

      {/* Test grid layouts */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Grid Layouts</h2>
        <div className="campaign-grid">
          <div className="card p-4">Campaign 1</div>
          <div className="card p-4">Campaign 2</div>
          <div className="card p-4">Campaign 3</div>
        </div>
      </section>
    </div>
  )
}