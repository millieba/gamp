"use client";
import StatCard from "@/components/atoms/StatCard";
import { useEffect, useState } from "react";
import Button from "@/components/atoms/Button";
import { Quote } from "../../../../prisma/seed";

const QuoteBoxSkeleton = () => (
  <StatCard
    name={null}
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
  const [tooltipVisible, setTooltipVisible] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      const res = await (await fetch("api/quote")).json();
      setQuote(res);
      setIsLoading(false);
    };

    fetchData();
  }, []);

  const handleSkipQuote = async () => {
    setIsLoading(true);
    const res = await (await fetch("api/quote/skip")).json();
    if (res?.error) {
      setIsLoading(false);
      return;
    }
    setQuote(res);
    setIsLoading(false);
  };

  return isLoading || quote?.skippedQuotes === undefined ? (
    <QuoteBoxSkeleton />
  ) : (
    <StatCard
      name={
        quote?.type === "quote"
          ? "Quote of the Day"
          : quote?.type === "affirmation"
          ? "Affirmation of the Day"
          : "Tip of the Day"
      }
      content={
        <div className="text-DarkNeutral1100">
          <p className="text-lg mb-3">{quote?.text}</p>
          {quote?.source && <p className="text-sm mb-3">- {quote.source}</p>}
          <div
            onMouseEnter={() => setTooltipVisible(true)}
            onMouseLeave={() => setTooltipVisible(false)}
            className="relative w-fit"
          >
            <Button label="Skip Quote" clickHandler={handleSkipQuote} isDisabled={quote?.skippedQuotes >= 3} />
            {tooltipVisible && quote?.skippedQuotes >= 3 && (
              <div className="absolute bg-DarkNeutral400 text-DarkNeutral1000 p-2 w-44 rounded-md shadow-lg z-10 -bottom-2 left-36 mr-2">
                You've skipped 3 quotes today. Come back tomorrow for a new quote!
              </div>
            )}
          </div>
        </div>
      }
    />
  );
};

export default QuoteBox;
