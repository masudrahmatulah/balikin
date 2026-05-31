"use client";

import { useState } from "react";
import { Plus, List, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface QuickActionsBarProps {
  onCreateSingle?: () => void;
}

export function QuickActionsBar({ onCreateSingle }: QuickActionsBarProps) {
  const router = useRouter();
  const [showSingleTagModal, setShowSingleTagModal] = useState(false);

  const handleCreateSingle = () => {
    if (onCreateSingle) {
      onCreateSingle();
    } else {
      setShowSingleTagModal(true);
    }
  };

  return (
    <div className="flex items-center gap-3 p-4 bg-surface border border-secondary/10 rounded-sm">
      <div className="flex-1">
        <p className="font-body text-sm font-medium text-primary">Quick Actions</p>
        <p className="font-body text-xs text-secondary">Manage tags or create individual QR codes</p>
      </div>

      <button
        onClick={handleCreateSingle}
        className="inline-flex items-center gap-2 px-4 py-2 rounded-md border border-secondary/20 text-sm font-medium hover:bg-neutral/20 transition-colors h-9"
      >
        <Plus className="w-4 h-4" />
        Single Tag
      </button>

      <Link href="/admin/vdp-tool/manage">
        <button className="inline-flex items-center gap-2 px-4 py-2 rounded-md border border-secondary/20 text-sm font-medium hover:bg-neutral/20 transition-colors h-9">
          <List className="w-4 h-4" />
          All Tags
          <ArrowRight className="w-4 h-4" />
        </button>
      </Link>

      {/* Single Tag Modal - TODO */}
      {showSingleTagModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-surface rounded-lg p-6 max-w-md w-full">
            <p className="font-display text-lg font-bold text-primary mb-2">Create Single Tag</p>
            <p className="font-body text-sm text-secondary mb-4">This feature is coming soon.</p>
            <button
              onClick={() => setShowSingleTagModal(false)}
              className="inline-flex items-center justify-center px-4 py-2 rounded-md text-sm font-medium bg-tertiary text-surface hover:brightness-110"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}