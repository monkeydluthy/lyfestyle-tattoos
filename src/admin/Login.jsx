import { useEffect, useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';

const GENERIC_ERROR = "Email or password didn't work";

function nextPath(from) {
  if (
    typeof from === 'string' &&
    from.startsWith('/admin') &&
    from !== '/admin/login'
  ) {
    return from;
  }
  return '/admin';
}

function Login() {
  const { session, loading, signIn } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const destination = nextPath(location.state?.from);

  useEffect(() => {
    document.title = 'Log in | Lyfestyle Tattoos';
  }, []);

  if (loading) {
    return (
      <div className="admin-loading" role="status">
        <span className="admin-spinner" aria-hidden="true" />
        <span className="admin-sr">Loading</span>
      </div>
    );
  }
  if (session) {
    return <Navigate to={destination} replace />;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (submitting) return;
    setError('');
    setSubmitting(true);
    try {
      const { error: signInError } = await signIn(email, password);
      if (signInError) {
        setError(GENERIC_ERROR);
        return;
      }
      navigate(destination, { replace: true });
    } catch {
      setError(GENERIC_ERROR);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="admin-login">
      <h1>Lyfestyle Tattoos</h1>
      <p className="admin-lead">Studio login</p>
      <form onSubmit={handleSubmit} noValidate>
        <label htmlFor="admin-email">Email</label>
        <input
          id="admin-email"
          className="admin-input"
          type="email"
          name="email"
          autoComplete="username"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
        />
        <label htmlFor="admin-password">Password</label>
        <input
          id="admin-password"
          className="admin-input"
          type="password"
          name="password"
          autoComplete="current-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          required
        />
        {error ? (
          <p className="admin-error" role="alert">
            {error}
          </p>
        ) : null}
        <button className="admin-button" type="submit" disabled={submitting}>
          {submitting ? 'Signing in' : 'Log in'}
        </button>
      </form>
    </main>
  );
}

export default Login;
