"use client";
import React from 'react';
import { useBadgesContext } from '@/contexts/BadgesContext';

const BadgesPage = () => {
  const { badges, isLoading } = useBadgesContext();

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
