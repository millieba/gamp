"use client";
import React from 'react';
import { useSession } from 'next-auth/react';
import { useBadgesContext } from '@/contexts/BadgesContext';

const BadgesPage = () => {
  const { data: session, status } = useSession();
  const { badges, setBadges, isLoading } = useBadgesContext();

  return (
    <div>
      <h1 className="text-2xl">Badges</h1>
      {isLoading ? (
        <p>Loading...</p>
      ) : (
        <ul>
          {badges?.map((badge) => (
            <li key={badge.id}>
              {badge.name} - {badge.description}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default BadgesPage;
