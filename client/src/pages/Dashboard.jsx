import { useEffect, useMemo, useState } from 'react';

import CreateWebsiteModal from '../pages/CreateWebsite';
import WebsiteCard from '../pages/WebsiteBar';
import { login } from '../redux/userSlice';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';

const useWebsites = () => {
  const [websites, setWebsites] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchWebsites = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_BASE}/endpoints/`, {
        credentials: "include",
        method: "GET",
      });
      const data = await response.json();
      setWebsites(data.websites || []);
    } catch (err) {
      console.log('Error fetching websites:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWebsites();
  }, []);

  return {
    websites,
    loading,
    refreshWebsites: fetchWebsites,
  };
};

const Dashboard = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { websites, refreshWebsites } = useWebsites();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await fetch(`${import.meta.env.VITE_BASE}/auth/logout`, {
        method: 'POST',
        credentials: 'include',
      });
      navigate('/login');
      dispatch(login(null))  
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const processedWebsites = useMemo(() => {
    if (!Array.isArray(websites)) return [];

    return websites.map(website => {
      const sortedTicks = [...website.ticks].sort((a, b) =>
        new Date(b.createdAt) - new Date(a.createdAt)
      );

      const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);
      const recentTicks = sortedTicks.filter(tick =>
        new Date(tick.createdAt) > thirtyMinutesAgo
      );

      const windows = [];

      for (let i = 0; i < 10; i++) {
        const windowStart = new Date(Date.now() - (i + 1) * 3 * 60 * 1000);
        const windowEnd = new Date(Date.now() - i * 3 * 60 * 1000);

        const windowTicks = recentTicks.filter(tick => {
          const tickTime = new Date(tick.createdAt);
          return tickTime >= windowStart && tickTime < windowEnd;
        });

        const upTicks = windowTicks && windowTicks.filter(tick => tick.status === 'Good').length;
        windows[9 - i] = windowTicks.length === 0 ? 'unknown' : (upTicks / windowTicks.length) >= 0.5 ? 'good' : 'bad';
      }

      const totalTicks = sortedTicks.length;
      const upTicks = sortedTicks.filter(tick => tick.status === 'Good').length;
      const uptimePercentage = totalTicks === 0 ? 100 : (upTicks / totalTicks) * 100;
      const currentStatus = windows[windows.length - 1];
      const lastChecked = sortedTicks[0]
        ? new Date(sortedTicks[0].createdAt).toLocaleTimeString()
        : 'Never';

      return {
        id: website?.id,
        url: website?.url,
        status: currentStatus,
        uptimePercentage,
        lastChecked,
        uptimeTicks: windows,
      };
    });
  }, [websites]);

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-[#e5e5e5] transition-colors duration-200">
      <div className="max-w-4xl mx-auto py-8 px-4">

        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold">Uptime Monitor</h1>

          <div className='flex gap-4'>
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-[#f5f5f5] text-black rounded-lg hover:bg-[#1a1a1a] hover:text-white hover:border hover:border-white transition"
            >
              <span>Add Website</span>
            </button>

            <button
              onClick={handleLogout}
              className="flex items-center space-x-2 px-4 py-2 bg-[#1a1a1a] text-[#e5e5e5] rounded-lg hover:bg-[#2e2e2e] transition"
            >
              <span>Logout</span>
            </button>
          </div>
        </div>

        <div className="space-y-4">
          {processedWebsites && processedWebsites.map((website) => (
            <WebsiteCard key={website.id} website={website} />
          ))}
        </div>
      </div>

      <CreateWebsiteModal
        isOpen={isModalOpen}
        onClose={async (url) => {
          if (url === null) {
            setIsModalOpen(false);
            return;
          }

          setIsModalOpen(false);

          try {
            await fetch(`${import.meta.env.VITE_BASE}/endpoints/`, {
              method: "POST",
              credentials: "include",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ url }),
            });
            refreshWebsites();
          } catch (err) {
            console.error('Failed to create website', err);
          }
        }}
      />
    </div>
  );
};

export default Dashboard;
