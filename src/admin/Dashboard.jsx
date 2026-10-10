import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';

const COMING_NEXT = ['Leads', 'Site text'];

function Dashboard() {
  const { session, signOut } = useAuth();
  const navigate = useNavigate();
  const email = session?.user?.email || '';

  useEffect(() => {
    document.title = 'Admin | Lyfestyle Tattoos';
  }, []);

  async function handleSignOut() {
    await signOut();
    navigate('/admin/login', { replace: true });
  }

  return (
    <div className="admin-dashboard">
      <header className="admin-header">
        <div>
          <p className="admin-studio">Lyfestyle Tattoos</p>
          <p className="admin-email">{email}</p>
        </div>
        <button className="admin-button" type="button" onClick={handleSignOut}>
          Log out
        </button>
      </header>
      <main>
        <h1 className="admin-sr">Studio admin</h1>
        <div className="admin-cards">
          <article className="admin-card">
            <h2>Gallery</h2>
            <Link className="admin-card-link" to="/admin/upload">
              Add pieces
            </Link>
          </article>
          {COMING_NEXT.map((title) => (
            <article className="admin-card" key={title}>
              <h2>{title}</h2>
              <p>Coming next</p>
            </article>
          ))}
        </div>
      </main>
    </div>
  );
}

export default Dashboard;
