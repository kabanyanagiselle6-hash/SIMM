function LoginForm({
  mode,
  form,
  error,
  loading,
  onChange,
  onSubmit,
  onToggleMode,
}) {
  return (
    <div className="w-full max-w-md rounded-3xl border border-slate-800 bg-slate-950/80 p-8 shadow-2xl shadow-cyan-950/30 backdrop-blur">
      <p className="text-sm font-semibold uppercase tracking-[0.35em] text-cyan-300">
        SIMS Portal
      </p>
      <h1 className="mt-4 text-3xl font-bold text-white">
        {mode === 'login' ? 'Sign in to continue' : 'Create a user account'}
      </h1>
      <p className="mt-3 text-sm text-slate-300">
        Manage spare parts, stock movement, and daily reports in one place.
      </p>

      <form className="mt-8 space-y-4" onSubmit={onSubmit}>
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-200">
            Username
          </label>
          <input
            name="username"
            value={form.username}
            onChange={onChange}
            className="w-full rounded-2xl border border-slate-700 bg-slate-900 px-4 py-3 text-slate-100 placeholder:text-slate-500"
            placeholder="Enter username"
            required
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-200">
            Password
          </label>
          <input
            name="password"
            type="password"
            value={form.password}
            onChange={onChange}
            className="w-full rounded-2xl border border-slate-700 bg-slate-900 px-4 py-3 text-slate-100 placeholder:text-slate-500"
            placeholder="Enter password"
            required
          />
        </div>

        {error ? (
          <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
            {error}
          </div>
        ) : null}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-2xl bg-cyan-400 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading
            ? 'Please wait...'
            : mode === 'login'
              ? 'Login'
              : 'Create Account'}
        </button>
      </form>

      <button
        type="button"
        onClick={onToggleMode}
        className="mt-5 text-sm text-cyan-300 transition hover:text-cyan-200"
      >
        {mode === 'login'
          ? 'Need an account? Create one'
          : 'Already have an account? Login'}
      </button>
    </div>
  )
}

export default LoginForm
