"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Card } from "@/components/ui/card";
import { BarChart3, CheckCircle2 } from "lucide-react";

interface PollModuleProps {
  pollId: string;
  question: string;
  options: string[];
  postId: string;
}

interface PollResults {
  pollId: string;
  options: string[];
  counts: number[];
  totalVotes: number;
}

export function BlogPollModule({ pollId, question, options, postId }: PollModuleProps) {
  const [hasVoted, setHasVoted] = useState(false);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [results, setResults] = useState<PollResults | null>(null);

  const handleVote = async () => {
    if (selectedOption === null || isSubmitting) return;

    setIsSubmitting(true);

    try {
      // Optimistic update - show results immediately
      setHasVoted(true);

      // Submit vote to server
      const res = await fetch("/api/blog/poll-vote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          postId,
          pollId,
          selectedOptionIndex: selectedOption,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setResults(data.results);
      } else {
        const error = await res.json();
        console.error("Vote failed:", error);
        // Reset on error
        setHasVoted(false);
        alert(error.error || "Gagal merekam suara Anda. Silakan coba lagi.");
      }
    } catch (err) {
      console.error(err);
      setHasVoted(false);
      alert("Terjadi kesalahan koneksi.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const fetchResults = async () => {
    try {
      const res = await fetch(`/api/blog/poll-results/${pollId}?postId=${postId}`);
      if (res.ok) {
        const data = await res.json();
        setResults(data);
      }
    } catch (err) {
      console.error("Failed to fetch results:", err);
    }
  };

  // Fetch results when hasVoted changes
  if (hasVoted && !results) {
    fetchResults();
  }

  if (hasVoted && results) {
    const totalVotes = results.totalVotes;
    const sortedOptions = options.map((opt, idx) => ({
      option: opt,
      count: results.counts[idx] || 0,
      percentage: totalVotes > 0 ? ((results.counts[idx] || 0) / totalVotes) * 100 : 0,
    })).sort((a, b) => b.count - a.count);

    return (
      <Card className="p-6 md:p-8 my-8">
        <div className="flex items-center gap-2 mb-4">
          <BarChart3 className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-bold">Hasil Polling</h3>
        </div>
        <p className="text-sm text-muted-foreground mb-4">{question}</p>
        <div className="space-y-3">
          {sortedOptions.map((item, idx) => (
            <div key={idx} className="space-y-1">
              <div className="flex justify-between text-sm">
                <span className="font-medium">{item.option}</span>
                <span className="text-muted-foreground">
                  {item.count} suara ({item.percentage.toFixed(1)}%)
                </span>
              </div>
              <Progress value={item.percentage} className="h-2" />
            </div>
          ))}
        </div>
        <p className="text-xs text-muted-foreground mt-4">
          Total: {totalVotes} suara
        </p>
      </Card>
    );
  }

  return (
    <Card className="p-6 md:p-8 my-8">
      <div className="flex items-center gap-2 mb-4">
        <BarChart3 className="w-5 h-5 text-primary" />
        <h3 className="text-lg font-bold">Polling Pembaca</h3>
      </div>
      <p className="text-sm text-muted-foreground mb-4">{question}</p>

      <RadioGroup value={selectedOption?.toString() || ""} onValueChange={(v) => setSelectedOption(parseInt(v))}>
        <div className="space-y-2">
          {options.map((option, idx) => (
            <div
              key={idx}
              className={`flex items-center space-x-3 border p-4 rounded-xl cursor-pointer transition-all hover:bg-accent/50 ${
                selectedOption === idx ? "border-primary bg-primary/5 ring-1 ring-primary" : "border-border bg-card"
              }`}
              onClick={() => setSelectedOption(idx)}
            >
              <RadioGroupItem value={idx.toString()} id={`poll-opt-${idx}`} />
              <Label htmlFor={`poll-opt-${idx}`} className="w-full cursor-pointer text-sm font-medium">
                {option}
              </Label>
            </div>
          ))}
        </div>
      </RadioGroup>

      <Button
        onClick={handleVote}
        disabled={selectedOption === null || isSubmitting}
        className="w-full mt-4"
      >
        {isSubmitting ? "Mengirim..." : "Kirim Suara"}
      </Button>
    </Card>
  );
}
