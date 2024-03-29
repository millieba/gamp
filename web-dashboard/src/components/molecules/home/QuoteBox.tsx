"use client";
import StatCard from "@/components/atoms/StatCard";
import { useEffect, useState } from "react";

interface Quote {
  text: string;
  source: string;
}

const QuoteBoxSkeleton = () => (
  <StatCard
    name="Quote of the Day"
    content={
      <div>
        <div className="animate-pulse bg-DarkNeutral300 rounded-full h-6 mb-1.5" />
        <div className="animate-pulse bg-DarkNeutral300 rounded-full h-6 w-28 mb-3" />

        <div className="animate-pulse bg-DarkNeutral300 rounded-full h-4 w-24" />
      </div>
    }
  />
);

const QuoteBox = () => {
  const [quote, setQuote] = useState<Quote>();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const res = await (await fetch("api/quote")).json();
      setQuote(res.quote);
      setIsLoading(false);
    };

    fetchData();
  }, []);

  return isLoading ? (
    <QuoteBoxSkeleton />
  ) : (
    <StatCard
      name="Quote of the Day"
      content={
        <div className="text-DarkNeutral1100">
          <p className="text-lg mb-3">{quote?.text}</p>
          {quote?.source && <p className="text-sm">- {quote.source}</p>}
        </div>
      }
    />
  );
};

export default QuoteBox;
