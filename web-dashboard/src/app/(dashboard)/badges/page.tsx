"use client";
import OwlBadge from "../../../../public/badges/Night_Owl_Badge.svg"
import GoldMedal from "../../../../public/badges/Gold_Medal_Badge.svg"
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Badge } from "@/utils/types";

async function getBadges() {
  const res = await fetch("/api/badges");
  if (!res.ok) {
    throw new Error("Failed to fetch badges");
  }
  return res.json();
}

const BadgesPage = () => {
  const { data: session, status } = useSession();
  const [badges, setBadges] = useState<{ badges: Badge[] }>();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>();

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      const badges = await getBadges();
      setBadges(badges);
      setIsLoading(false);
    };
    fetchData();

  }, [session, status]);

  const [sizeOwl, setSizeOwl] = useState("150");
  const [sizeMedal, setSizeMedal] = useState("150");

  function interactiveBadgesOwl() {
    setSizeOwl("160");
  }

  function interactiveBadgesMedal() {
    setSizeMedal("160");
  }

  function interactiveBadgesOwlLeave() {
    setSizeOwl("150");
  }

  function interactiveBadgesMedalLeave() {
    setSizeMedal("150");
  }
  return (
    <>
      <h1 className="text-2xl">Badges</h1>
      <p>
        Here you can see some of the badges you can earn, and soon you will be
        able to see the badges you have earned so far.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:px-4 m-4">
        <div
          onMouseOver={interactiveBadgesOwl}
          onMouseLeave={interactiveBadgesOwlLeave}
        >
          <svg width={sizeOwl} height={sizeOwl} viewBox="0 0 950 900">
            <OwlBadge />
          </svg>
          <p className="ml-6">Night Owl</p>
        </div>
        <div
          onMouseOver={interactiveBadgesMedal}
          onMouseLeave={interactiveBadgesMedalLeave}
        >
          <svg width={sizeMedal} height={sizeMedal} viewBox="0 0 950 900">
            <GoldMedal />
          </svg>
          {/* {(badges && !isLoading) && (
            <img src={badges.badges[0].image} alt="Badge" width={sizeMedal} height={sizeMedal} />)} */}
          <p className="ml-6">Gold Medal</p>
        </div>
      </div>
    </>
  );
};

export default BadgesPage;
