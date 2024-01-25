"use client";
import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { Badge } from '@/utils/types';
import { useBadgesContext } from '@/contexts/BadgesContext';

async function getBadges() {
  const res = await fetch('/api/badges');
  if (!res.ok) {
    throw new Error('Failed to fetch badges');
  }
  return res.json();
}

const BadgesPage = () => {
  const { data: session, status } = useSession();
  const { badges: badgesContext, setBadges } = useBadgesContext();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>();

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);

      try {
        if (!badgesContext || badgesContext.length === 0) {
          console.log('Fetching badges because badgesContext is empty');
          const badgesData = await getBadges();
          setBadges(badgesData.badges);
          // console.log('badgesContext after: ', badgesContext);
        }
      } catch (error) {
        console.error(error);
        setError('Failed to fetch badges');
      } finally {
        setIsLoading(false);
      }
      console.log("Badges context: ", badgesContext)
    };

    fetchData();
  }, [session, status, badgesContext, setBadges]);

  return (
    <div>
      <h1 className="text-2xl">Badges</h1>
      {isLoading ? (
        <p>Loading...</p>
      ) : (
        <ul>
          {badgesContext?.map((badge) => (
            <li key={badge.id}>
              {badge.name} - {badge.description}
            </li>
          ))}
        </ul>
      )}
      {error && <p>Error: {error}</p>}
    </div>
  );
};

export default BadgesPage;