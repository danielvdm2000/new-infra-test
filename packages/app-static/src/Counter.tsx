import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";

export function Counter() {
  const [count, setCount] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch initial count on mount
  useEffect(() => {
    fetchCount();
  }, []);

  const fetchCount = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch("/api/count");
      if (!response.ok) {
        throw new Error("Failed to fetch count");
      }
      const data = await response.json();
      setCount(data.count);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch count");
    } finally {
      setLoading(false);
    }
  };

  const incrementCount = async () => {
    try {
      setError(null);
      const response = await fetch("/api/count/increment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (!response.ok) {
        throw new Error("Failed to increment count");
      }
      const data = await response.json();
      setCount(data.count);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to increment count");
    }
  };

  return (
    <div className="flex flex-col gap-4">
      {loading ? (
        <p className="text-muted-foreground">Loading count...</p>
      ) : error ? (
        <div className="flex flex-col gap-2">
          <p className="text-destructive">Error: {error}</p>
          <Button onClick={fetchCount} variant="outline">
            Retry
          </Button>
        </div>
      ) : (
        <Button onClick={incrementCount} size="lg">
          count is {count}
        </Button>
      )}
    </div>
  );
}

