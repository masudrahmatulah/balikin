"use client";

import { ModuleCard } from "@/components/module-card";
import { getAllModules, type ModuleType } from "@/lib/admin-modules";

interface ModulesListWrapperProps {
  allModules: ReturnType<typeof getAllModules>;
  enabledModules: string[];
  pendingRequests: string[];
}

export function ModulesListWrapper({
  allModules,
  enabledModules,
  pendingRequests,
}: ModulesListWrapperProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {allModules.map((module) => (
        <ModuleCard
          key={module.type}
          moduleType={module.type}
          isEnabled={enabledModules.includes(module.type)}
          hasPendingRequest={pendingRequests.includes(module.type)}
          onModuleAccess={(moduleType) => {
            // Navigate to module-specific page
            // For now, just show alert
            alert(`Modul ${moduleType} akan segera tersedia!`);
          }}
        />
      ))}
    </div>
  );
}
