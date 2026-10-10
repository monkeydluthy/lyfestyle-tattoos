import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';

const CARDS = ['Gallery', 'Leads', 'Site text'];

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
          {CARDS.map((title) => (
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
