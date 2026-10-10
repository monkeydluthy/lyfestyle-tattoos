import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';

function Dashboard() {
  const { session, signOut } = useAuth();
  const navigate = useNavigate();
  const email = session?.user?.email || '';
  const [newLeadCount, setNewLeadCount] = useState(null);

  useEffect(() => {
    document.title = 'Admin | Lyfestyle Tattoos';
  }, []);

  useEffect(() => {
    let cancelled = false;
    async function loadCount() {
      if (!supabase) return;
      const { count, error } = await supabase
        .from('leads')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'new');
      if (!cancelled && !error) setNewLeadCount(count ?? 0);
    }
    loadCount();
    return () => {
      cancelled = true;
    };
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
            <div className="admin-card-links">
              <Link className="admin-card-link" to="/admin/upload">
                Add pieces
              </Link>
              <Link className="admin-card-link" to="/admin/works">
                Manage pieces
              </Link>
              <Link className="admin-card-link" to="/admin/content">
                Pricing & policies
              </Link>
            </div>
          </article>
          <article className="admin-card">
            <h2>
              Leads
              {newLeadCount === null ? null : (
                <span className="admin-count" aria-label={`${newLeadCount} new`}>
                  {newLeadCount}
                </span>
              )}
            </h2>
            <Link className="admin-card-link" to="/admin/leads">
              Open inbox
            </Link>
          </article>
        </div>
      </main>
    </div>
  );
}

export default Dashboard;
