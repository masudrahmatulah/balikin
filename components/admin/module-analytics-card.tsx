import { getModuleDisplayName, getModuleIcon, getModuleColor, type ModuleType } from "@/lib/admin-modules";

interface ModuleAnalyticsCardProps {
  moduleType: ModuleType;
  activationCount: number;
  activeUsers: number;
}

export function ModuleAnalyticsCard({
  moduleType,
  activationCount,
  activeUsers,
}: ModuleAnalyticsCardProps) {
  const Icon = getModuleIcon(moduleType);
  const color = getModuleColor(moduleType);
  const name = getModuleDisplayName(moduleType);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-xl ${color} text-white`}>
          <Icon className="w-6 h-6" />
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {activationCount}
          </p>
          <p className="text-xs text-gray-600 dark:text-gray-400">
            Total Aktivasi
          </p>
        </div>
      </div>

      <div>
        <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
          {name}
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {activeUsers} user aktif
        </p>
      </div>

      {/* Progress Bar */}
      <div className="mt-4">
        <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400 mb-1">
          <span>Aktivasi</span>
          <span>{activationCount > 0 ? "Aktif" : "Belum ada"}</span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <div
            className={`h-2 rounded-full ${color} transition-all duration-500`}
            style={{ width: `${Math.min(activationCount * 10, 100)}%` }}
          />
        </div>
      </div>
    </div>
  );
}
