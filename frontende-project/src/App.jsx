import { useEffect, useState } from 'react'
import api from './services/api'
import LoginForm from './components/LoginForm'
import MenuBar from './components/MenuBar'
import SectionCard from './components/SectionCard'

const initialSpareForm = {
  spareName: '',
  category: '',
  unit: '',
  minimumQuantity: '',
}

const initialStockInForm = {
  sparePartId: '',
  quantity: '',
  supplier: '',
}

const initialStockOutForm = {
  sparePartId: '',
  quantity: '',
  destination: '',
}

const today = new Date().toISOString().slice(0, 10)

function App() {
  const [mode, setMode] = useState('login')
  const [authForm, setAuthForm] = useState({ username: '', password: '' })
  const [authError, setAuthError] = useState('')
  const [authLoading, setAuthLoading] = useState(false)
  const [token, setToken] = useState(localStorage.getItem('sims-token') || '')
  const [currentUser, setCurrentUser] = useState(
    localStorage.getItem('sims-username') || '',
  )
  const [activeView, setActiveView] = useState('spare-part')
  const [spareForm, setSpareForm] = useState(initialSpareForm)
  const [stockInForm, setStockInForm] = useState(initialStockInForm)
  const [stockOutForm, setStockOutForm] = useState(initialStockOutForm)
  const [editingStockOutId, setEditingStockOutId] = useState(null)
  const [message, setMessage] = useState('')
  const [spareParts, setSpareParts] = useState([])
  const [stockOutEntries, setStockOutEntries] = useState([])
  const [statusReport, setStatusReport] = useState([])
  const [stockOutReport, setStockOutReport] = useState([])
  const [reportDate, setReportDate] = useState(today)

  const isAuthenticated = Boolean(token)

  const updateAuthField = (event) => {
    const { name, value } = event.target
    setAuthForm((current) => ({ ...current, [name]: value }))
  }

  const updateSpareField = (event) => {
    const { name, value } = event.target
    setSpareForm((current) => ({ ...current, [name]: value }))
  }

  const updateStockInField = (event) => {
    const { name, value } = event.target
    setStockInForm((current) => ({ ...current, [name]: value }))
  }

  const updateStockOutField = (event) => {
    const { name, value } = event.target
    setStockOutForm((current) => ({ ...current, [name]: value }))
  }

  const saveSession = (nextToken, username) => {
    localStorage.setItem('sims-token', nextToken)
    localStorage.setItem('sims-username', username)
    setToken(nextToken)
    setCurrentUser(username)
  }

  const clearMessage = () => {
    window.clearTimeout(clearMessage.timer)
    clearMessage.timer = window.setTimeout(() => setMessage(''), 3000)
  }

  const showMessage = (text) => {
    setMessage(text)
    clearMessage()
  }

  const handleAuthSubmit = async (event) => {
    event.preventDefault()
    setAuthError('')
    setAuthLoading(true)

    try {
      const path = mode === 'login' ? '/auth/login' : '/auth/register'
      const { data } = await api.post(path, authForm)
      saveSession(data.token, data.user.username)
      showMessage(
        mode === 'login'
          ? 'Login successful.'
          : 'Account created successfully.',
      )
    } catch (error) {
      setAuthError(error.response?.data?.message || 'Authentication failed.')
    } finally {
      setAuthLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('sims-token')
    localStorage.removeItem('sims-username')
    setToken('')
    setCurrentUser('')
    setAuthForm({ username: '', password: '' })
    setActiveView('spare-part')
    showMessage('Logged out successfully.')
  }

  const loadSpareParts = async () => {
    const { data } = await api.get('/spare-parts')
    setSpareParts(data)
  }

  const loadStockOutEntries = async () => {
    const { data } = await api.get('/stock-out')
    setStockOutEntries(data)
  }

  const loadReports = async (selectedDate = reportDate) => {
    const [statusResponse, stockOutResponse] = await Promise.all([
      api.get(`/reports/daily-stock-status?date=${selectedDate}`),
      api.get(`/reports/daily-stock-out?date=${selectedDate}`),
    ])

    setStatusReport(statusResponse.data)
    setStockOutReport(stockOutResponse.data)
  }

  useEffect(() => {
    if (!isAuthenticated) {
      return
    }

    const loadDashboard = async () => {
      try {
        await Promise.all([loadSpareParts(), loadStockOutEntries(), loadReports()])
      } catch (error) {
        setAuthError(
          error.response?.data?.message || 'Failed to load dashboard data.',
        )
      }
    }

    loadDashboard()
  }, [isAuthenticated])

  const createSparePart = async (event) => {
    event.preventDefault()

    try {
      await api.post('/spare-parts', spareForm)
      setSpareForm(initialSpareForm)
      await loadSpareParts()
      await loadReports()
      showMessage('Spare part saved.')
    } catch (error) {
      showMessage(error.response?.data?.message || 'Failed to save spare part.')
    }
  }

  const createStockIn = async (event) => {
    event.preventDefault()

    try {
      await api.post('/stock-in', stockInForm)
      setStockInForm(initialStockInForm)
      await loadReports()
      showMessage('Stock-in saved.')
    } catch (error) {
      showMessage(error.response?.data?.message || 'Failed to save stock-in.')
    }
  }

  const submitStockOut = async (event) => {
    event.preventDefault()

    try {
      if (editingStockOutId) {
        await api.put(`/stock-out/${editingStockOutId}`, stockOutForm)
        showMessage('Stock-out updated.')
      } else {
        await api.post('/stock-out', stockOutForm)
        showMessage('Stock-out saved.')
      }

      setStockOutForm(initialStockOutForm)
      setEditingStockOutId(null)
      await Promise.all([loadStockOutEntries(), loadReports()])
    } catch (error) {
      showMessage(error.response?.data?.message || 'Failed to save stock-out.')
    }
  }

  const startEditStockOut = (entry) => {
    setEditingStockOutId(entry.id)
    setStockOutForm({
      sparePartId: String(entry.spare_part_id),
      quantity: String(entry.quantity),
      destination: entry.destination,
    })
    setActiveView('stock-out')
  }

  const deleteStockOut = async (id) => {
    try {
      await api.delete(`/stock-out/${id}`)
      await Promise.all([loadStockOutEntries(), loadReports()])
      showMessage('Stock-out deleted.')
    } catch (error) {
      showMessage(error.response?.data?.message || 'Failed to delete stock-out.')
    }
  }

  const refreshReports = async () => {
    try {
      await loadReports(reportDate)
      showMessage('Reports refreshed.')
    } catch (error) {
      showMessage(error.response?.data?.message || 'Failed to load reports.')
    }
  }

  if (!isAuthenticated) {
    return (
      <main className="flex min-h-screen items-center justify-center px-6 py-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_right,rgba(34,211,238,0.18),transparent_30%),radial-gradient(circle_at_top_left,rgba(59,130,246,0.18),transparent_35%)]" />
        <div className="relative grid w-full max-w-6xl gap-10 lg:grid-cols-[1.2fr_0.8fr]">
          <section className="flex items-center">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.4em] text-cyan-300">
                Spare Inventory Management System
              </p>
              <h2 className="mt-6 max-w-2xl text-5xl font-black leading-tight text-white">
                Track spare parts, stock movement, and daily reporting from one
                modern dashboard.
              </h2>
              <p className="mt-6 max-w-xl text-lg text-slate-300">
                This system supports secure login, stock-in, stock-out, spare
                part registration, and report generation for day-to-day stock
                monitoring.
              </p>
            </div>
          </section>
          <LoginForm
            mode={mode}
            form={authForm}
            error={authError}
            loading={authLoading}
            onChange={updateAuthField}
            onSubmit={handleAuthSubmit}
            onToggleMode={() =>
              setMode((current) => (current === 'login' ? 'register' : 'login'))
            }
          />
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-[280px_1fr]">
        <MenuBar
          activeView={activeView}
          onSelect={setActiveView}
          onLogout={handleLogout}
          currentUser={currentUser}
        />

        <div className="space-y-6">
          {message ? (
            <div className="rounded-2xl border border-cyan-500/30 bg-cyan-500/10 px-4 py-3 text-sm text-cyan-100">
              {message}
            </div>
          ) : null}

          {activeView === 'spare-part' ? (
            <SectionCard
              title="Spare-Part Form"
              subtitle="Insert new spare parts into the SIMS database."
            >
              <form className="grid gap-4 md:grid-cols-2" onSubmit={createSparePart}>
                <input
                  name="spareName"
                  value={spareForm.spareName}
                  onChange={updateSpareField}
                  placeholder="Spare name"
                  className="rounded-2xl border border-slate-700 bg-slate-900 px-4 py-3 text-slate-100"
                  required
                />
                <input
                  name="category"
                  value={spareForm.category}
                  onChange={updateSpareField}
                  placeholder="Category"
                  className="rounded-2xl border border-slate-700 bg-slate-900 px-4 py-3 text-slate-100"
                  required
                />
                <input
                  name="unit"
                  value={spareForm.unit}
                  onChange={updateSpareField}
                  placeholder="Unit"
                  className="rounded-2xl border border-slate-700 bg-slate-900 px-4 py-3 text-slate-100"
                  required
                />
                <input
                  name="minimumQuantity"
                  type="number"
                  min="0"
                  value={spareForm.minimumQuantity}
                  onChange={updateSpareField}
                  placeholder="Minimum quantity"
                  className="rounded-2xl border border-slate-700 bg-slate-900 px-4 py-3 text-slate-100"
                  required
                />
                <button
                  type="submit"
                  className="rounded-2xl bg-cyan-400 px-4 py-3 font-semibold text-slate-950 md:col-span-2"
                >
                  Save Spare Part
                </button>
              </form>
            </SectionCard>
          ) : null}

          {activeView === 'stock-in' ? (
            <SectionCard
              title="Stock-In Form"
              subtitle="Insert received stock for an existing spare part."
            >
              <form className="grid gap-4 md:grid-cols-2" onSubmit={createStockIn}>
                <select
                  name="sparePartId"
                  value={stockInForm.sparePartId}
                  onChange={updateStockInField}
                  className="rounded-2xl border border-slate-700 bg-slate-900 px-4 py-3 text-slate-100"
                  required
                >
                  <option value="">Select spare part</option>
                  {spareParts.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.spare_name}
                    </option>
                  ))}
                </select>
                <input
                  name="quantity"
                  type="number"
                  min="1"
                  value={stockInForm.quantity}
                  onChange={updateStockInField}
                  placeholder="Quantity"
                  className="rounded-2xl border border-slate-700 bg-slate-900 px-4 py-3 text-slate-100"
                  required
                />
                <input
                  name="supplier"
                  value={stockInForm.supplier}
                  onChange={updateStockInField}
                  placeholder="Supplier"
                  className="rounded-2xl border border-slate-700 bg-slate-900 px-4 py-3 text-slate-100 md:col-span-2"
                  required
                />
                <button
                  type="submit"
                  className="rounded-2xl bg-emerald-400 px-4 py-3 font-semibold text-slate-950 md:col-span-2"
                >
                  Save Stock-In
                </button>
              </form>
            </SectionCard>
          ) : null}

          {activeView === 'stock-out' ? (
            <SectionCard
              title="Stock-Out Form"
              subtitle="Insert, retrieve, update, and delete stock-out records."
            >
              <form className="grid gap-4 md:grid-cols-2" onSubmit={submitStockOut}>
                <select
                  name="sparePartId"
                  value={stockOutForm.sparePartId}
                  onChange={updateStockOutField}
                  className="rounded-2xl border border-slate-700 bg-slate-900 px-4 py-3 text-slate-100"
                  required
                >
                  <option value="">Select spare part</option>
                  {spareParts.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.spare_name}
                    </option>
                  ))}
                </select>
                <input
                  name="quantity"
                  type="number"
                  min="1"
                  value={stockOutForm.quantity}
                  onChange={updateStockOutField}
                  placeholder="Quantity"
                  className="rounded-2xl border border-slate-700 bg-slate-900 px-4 py-3 text-slate-100"
                  required
                />
                <input
                  name="destination"
                  value={stockOutForm.destination}
                  onChange={updateStockOutField}
                  placeholder="Destination"
                  className="rounded-2xl border border-slate-700 bg-slate-900 px-4 py-3 text-slate-100 md:col-span-2"
                  required
                />
                <div className="flex flex-wrap gap-3 md:col-span-2">
                  <button
                    type="submit"
                    className="rounded-2xl bg-amber-300 px-4 py-3 font-semibold text-slate-950"
                  >
                    {editingStockOutId ? 'Update Stock-Out' : 'Save Stock-Out'}
                  </button>
                  {editingStockOutId ? (
                    <button
                      type="button"
                      onClick={() => {
                        setEditingStockOutId(null)
                        setStockOutForm(initialStockOutForm)
                      }}
                      className="rounded-2xl border border-slate-700 px-4 py-3 font-semibold text-slate-200"
                    >
                      Cancel Edit
                    </button>
                  ) : null}
                </div>
              </form>

              <div className="mt-8 overflow-x-auto rounded-2xl border border-slate-800">
                <table className="min-w-full divide-y divide-slate-800 text-left text-sm">
                  <thead className="bg-slate-900/80 text-slate-300">
                    <tr>
                      <th className="px-4 py-3">Spare Name</th>
                      <th className="px-4 py-3">Quantity</th>
                      <th className="px-4 py-3">Destination</th>
                      <th className="px-4 py-3">Date</th>
                      <th className="px-4 py-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 bg-slate-950/50 text-slate-200">
                    {stockOutEntries.map((entry) => (
                      <tr key={entry.id}>
                        <td className="px-4 py-3">{entry.spare_name}</td>
                        <td className="px-4 py-3">{entry.quantity}</td>
                        <td className="px-4 py-3">{entry.destination}</td>
                        <td className="px-4 py-3">
                          {new Date(entry.stock_out_date).toLocaleString()}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() => startEditStockOut(entry)}
                              className="rounded-xl bg-cyan-400 px-3 py-2 text-xs font-semibold text-slate-950"
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => deleteStockOut(entry.id)}
                              className="rounded-xl bg-rose-500 px-3 py-2 text-xs font-semibold text-white"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </SectionCard>
          ) : null}

          {activeView === 'report' ? (
            <SectionCard
              title="Daily Reports"
              subtitle="Generate daily stock status and daily stock-out reports."
            >
              <div className="mb-6 flex flex-wrap items-center gap-3">
                <input
                  type="date"
                  value={reportDate}
                  onChange={(event) => setReportDate(event.target.value)}
                  className="rounded-2xl border border-slate-700 bg-slate-900 px-4 py-3 text-slate-100"
                />
                <button
                  type="button"
                  onClick={refreshReports}
                  className="rounded-2xl bg-cyan-400 px-4 py-3 font-semibold text-slate-950"
                >
                  Load Reports
                </button>
              </div>

              <div className="grid gap-6 xl:grid-cols-2">
                <div>
                  <h4 className="mb-3 text-lg font-semibold text-white">
                    Daily Stock Status
                  </h4>
                  <div className="overflow-x-auto rounded-2xl border border-slate-800">
                    <table className="min-w-full divide-y divide-slate-800 text-left text-sm">
                      <thead className="bg-slate-900 text-slate-300">
                        <tr>
                          <th className="px-4 py-3">Spare Name</th>
                          <th className="px-4 py-3">Stored Qty</th>
                          <th className="px-4 py-3">Stock-Out Qty</th>
                          <th className="px-4 py-3">Remaining Qty</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800 bg-slate-950/50 text-slate-200">
                        {statusReport.map((item) => (
                          <tr key={item.id}>
                            <td className="px-4 py-3">{item.spare_name}</td>
                            <td className="px-4 py-3">{item.stored_quantity}</td>
                            <td className="px-4 py-3">{item.stock_out_quantity}</td>
                            <td className="px-4 py-3">{item.remaining_quantity}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div>
                  <h4 className="mb-3 text-lg font-semibold text-white">
                    Daily Stock-Out Report
                  </h4>
                  <div className="overflow-x-auto rounded-2xl border border-slate-800">
                    <table className="min-w-full divide-y divide-slate-800 text-left text-sm">
                      <thead className="bg-slate-900 text-slate-300">
                        <tr>
                          <th className="px-4 py-3">Spare Name</th>
                          <th className="px-4 py-3">Quantity</th>
                          <th className="px-4 py-3">Destination</th>
                          <th className="px-4 py-3">Date</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800 bg-slate-950/50 text-slate-200">
                        {stockOutReport.map((item) => (
                          <tr key={item.id}>
                            <td className="px-4 py-3">{item.spare_name}</td>
                            <td className="px-4 py-3">{item.quantity}</td>
                            <td className="px-4 py-3">{item.destination}</td>
                            <td className="px-4 py-3">
                              {new Date(item.stock_out_date).toLocaleString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </SectionCard>
          ) : null}
        </div>
      </div>
    </main>
  )
}

export default App
