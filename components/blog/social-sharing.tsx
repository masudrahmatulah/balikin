"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { MessageCircle, Share2, Link2, Check } from "lucide-react";

interface SocialSharingProps {
  url: string;
  title: string;
  summary: string;
}

export function BlogSocialSharing({ url, title, summary }: SocialSharingProps) {
  const [copied, setCopied] = useState(false);

  const shareUrls = {
    whatsapp: `https://wa.me/?text=${encodeURIComponent(`${title}\n\n${summary}\n\n${url}`)}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
    twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`,
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const handleShare = (platform: string, shareUrl: string) => {
    window.open(shareUrl, "_blank", "width=600,height=400");
  };

  return (
    <Card className="p-6 my-8">
      <h3 className="text-lg font-bold mb-4">Bagikan Artikel Ini</h3>
      <div className="flex flex-wrap gap-3">
        <Button
          variant="outline"
          size="lg"
          onClick={() => handleShare("whatsapp", shareUrls.whatsapp)}
          className="flex-1 min-w-[120px] bg-green-50 hover:bg-green-100 border-green-200 text-green-700"
        >
          <MessageCircle className="w-5 h-5 mr-2" />
          WhatsApp
        </Button>
        <Button
          variant="outline"
          size="lg"
          onClick={() => handleShare("facebook", shareUrls.facebook)}
          className="flex-1 min-w-[120px] bg-blue-50 hover:bg-blue-100 border-blue-200 text-blue-700"
        >
          <Share2 className="w-5 h-5 mr-2" />
          Facebook
        </Button>
        <Button
          variant="outline"
          size="lg"
          onClick={() => handleShare("linkedin", shareUrls.linkedin)}
          className="flex-1 min-w-[120px] bg-sky-50 hover:bg-sky-100 border-sky-200 text-sky-700"
        >
          <Share2 className="w-5 h-5 mr-2" />
          LinkedIn
        </Button>
        <Button
          variant="outline"
          size="lg"
          onClick={() => handleShare("twitter", shareUrls.twitter)}
          className="flex-1 min-w-[120px] bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700"
        >
          <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
          </svg>
          X
        </Button>
        <Button
          variant="outline"
          size="lg"
          onClick={handleCopyLink}
          className="min-w-[120px]"
        >
          {copied ? (
            <Check className="w-5 h-5 mr-2 text-green-600" />
          ) : (
            <Link2 className="w-5 h-5 mr-2" />
          )}
          {copied ? "Copied!" : "Copy Link"}
        </Button>
      </div>
    </Card>
  );
}
