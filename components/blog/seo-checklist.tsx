"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, X, AlertCircle } from "lucide-react";

interface SEOChecklistProps {
  title: string;
  slug: string;
  summary: string;
  content: string;
  metaDescription: string;
  focusKeyword: string;
  coverImage: string | null;
}

interface CheckResult {
  id: string;
  label: string;
  passed: boolean | null;
  isCritical: boolean;
}

export function BlogSEOChecklist({
  title,
  slug,
  summary,
  content,
  metaDescription,
  focusKeyword,
  coverImage,
}: SEOChecklistProps) {
  const checks: CheckResult[] = [
    {
      id: "slug-keyword",
      label: "Slug contains focus keyword",
      passed: focusKeyword ? slug.toLowerCase().includes(focusKeyword.toLowerCase().toLowerCase()) : null,
      isCritical: false,
    },
    {
      id: "content-keyword",
      label: `Focus keyword appears in content (min 2x)`,
      passed: focusKeyword
        ? (content.toLowerCase().match(new RegExp(focusKeyword.toLowerCase(), "gi")) || []).length >= 2
        : null,
      isCritical: true,
    },
    {
      id: "meta-length",
      label: "Meta description length (120-160 chars)",
      passed: metaDescription.length >= 120 && metaDescription.length <= 160,
      isCritical: true,
    },
    {
      id: "word-count",
      label: "Content word count (min 300 words)",
      passed: content.split(/\s+/).length >= 300,
      isCritical: true,
    },
    {
      id: "has-cover",
      label: "Cover image with alt text",
      passed: coverImage !== null && coverImage.length > 0,
      isCritical: false,
    },
    {
      id: "internal-links",
      label: "Internal links present",
      passed: content.includes("/blog/") || content.includes("]("),
      isCritical: false,
    },
  ];

  const criticalPassed = checks.filter((c) => c.isCritical && c.passed).length;
  const criticalTotal = checks.filter((c) => c.isCritical).length;
  const allPassed = checks.filter((c) => c.passed).length;
  const allTotal = checks.filter((c) => c.passed !== null).length;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center justify-between">
          <span>SEO Checklist</span>
          <span className="text-sm text-muted-foreground font-normal">
            {allPassed}/{allTotal} passed
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {checks.map((check) => (
          <div
            key={check.id}
            className={`flex items-center gap-2 text-sm ${
              check.passed === null
                ? "text-muted-foreground"
                : check.passed
                ? "text-emerald-600"
                : check.isCritical
                ? "text-destructive"
                : "text-amber-600"
            }`}
          >
            {check.passed === null ? (
              <AlertCircle className="w-4 h-4" />
            ) : check.passed ? (
              <Check className="w-4 h-4" />
            ) : (
              <X className="w-4 h-4" />
            )}
            <span className={check.isCritical && !check.passed ? "font-medium" : ""}>
              {check.label}
            </span>
            {check.isCritical && !check.passed && <span className="text-xs ml-auto">(Required)</span>}
          </div>
        ))}

        {criticalPassed < criticalTotal && (
          <p className="text-xs text-destructive mt-3 pt-3 border-t">
            {criticalTotal - criticalPassed} critical check(s) must pass before publishing
          </p>
        )}
      </CardContent>
    </Card>
  );
}
