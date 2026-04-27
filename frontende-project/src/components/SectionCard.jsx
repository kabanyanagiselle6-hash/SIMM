function SectionCard({ title, subtitle, children }) {
  return (
    <section className="rounded-3xl border border-slate-800 bg-slate-950/80 p-6 backdrop-blur">
      <div className="mb-6">
        <h3 className="text-2xl font-bold text-white">{title}</h3>
        <p className="mt-2 text-sm text-slate-400">{subtitle}</p>
      </div>
      {children}
    </section>
  )
}

export default SectionCard
