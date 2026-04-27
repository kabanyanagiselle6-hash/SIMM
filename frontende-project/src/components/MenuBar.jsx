const menuItems = [
  ['spare-part', 'Spare-Part'],
  ['stock-in', 'Stock-In'],
  ['stock-out', 'Stock-Out'],
  ['report', 'Report'],
]

function MenuBar({ activeView, onSelect, onLogout, currentUser }) {
  return (
    <aside className="rounded-3xl border border-slate-800 bg-slate-950/80 p-6 backdrop-blur">
      <div className="mb-8">
        <p className="text-xs font-semibold uppercase tracking-[0.35em] text-cyan-300">
          SIMS
        </p>
        <h2 className="mt-3 text-2xl font-bold text-white">Inventory Desk</h2>
        <p className="mt-2 text-sm text-slate-400">
          Logged in as <span className="text-slate-100">{currentUser}</span>
        </p>
      </div>

      <nav className="space-y-3">
        {menuItems.map(([key, label]) => (
          <button
            key={key}
            type="button"
            onClick={() => onSelect(key)}
            className={`w-full rounded-2xl px-4 py-3 text-left text-sm font-medium transition ${
              activeView === key
                ? 'bg-cyan-400 text-slate-950'
                : 'bg-slate-900 text-slate-200 hover:bg-slate-800'
            }`}
          >
            {label}
          </button>
        ))}
        <button
          type="button"
          onClick={onLogout}
          className="w-full rounded-2xl bg-rose-500/15 px-4 py-3 text-left text-sm font-medium text-rose-200 transition hover:bg-rose-500/25"
        >
          Logout
        </button>
      </nav>
    </aside>
  )
}

export default MenuBar
