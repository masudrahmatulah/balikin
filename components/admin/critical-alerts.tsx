"use client";

interface MaterialAlert {
  name: string;
  quantity: number;
}

interface CriticalAlertsProps {
  materials?: MaterialAlert[];
}

const defaultMaterials: MaterialAlert[] = [
  { name: "Acrylic QR Tags (L)", quantity: 12 },
  { name: "Sticker Vinyl Roll", quantity: 2 },
];

export function CriticalAlerts({ materials = defaultMaterials }: CriticalAlertsProps) {
  return (
    <div className="col-span-12 lg:col-span-4 space-y-6">
      {/* Critical Alert Widget */}
      <div className="bg-surface-container-high border-2 border-status-critical animate-pulse p-6 rounded-xl shadow-[0_0_15px_rgba(255,77,77,0.2)]">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-12 h-12 bg-status-critical/20 rounded flex items-center justify-center text-status-critical">
            <span className="material-symbols-outlined !text-[32px]" data-icon="inventory_2" style={{ fontVariationSettings: "'FILL' 1" }}>
              inventory_2
            </span>
          </div>
          <div>
            <h4 className="font-bold text-status-critical text-headline-md">Stok Material Kritis</h4>
            <p className="text-on-surface-variant text-sm">Action required immediately</p>
          </div>
        </div>
        <div className="space-y-3">
          {materials.map((material, index) => (
            <div key={index} className="flex justify-between items-center bg-surface-deep/40 p-3 rounded">
              <span className="text-sm font-medium">{material.name}</span>
              <span className="text-status-critical font-bold">{material.quantity} units</span>
            </div>
          ))}
        </div>
        <button className="w-full mt-4 bg-status-critical text-white py-3 rounded font-bold hover:brightness-110 transition-all">
          Order Supplies Now
        </button>
      </div>

      {/* Material Logs Small Card */}
      <div className="bg-surface-container p-6 rounded-xl border border-white/5">
        <h4 className="font-bold text-on-surface mb-4 flex items-center gap-2">
          <span className="material-symbols-outlined text-balikin-gold !text-[20px]" data-icon="history">
            history
          </span>
          Recent VDP Previews
        </h4>
        <div className="grid grid-cols-2 gap-4">
          {[1, 2].map((i) => (
            <div
              key={i}
              className="aspect-square bg-white rounded p-2 flex flex-col items-center justify-center group cursor-pointer overflow-hidden relative"
            >
              <span className="material-symbols-outlined text-black !text-[48px]" data-icon="qr_code_2">
                qr_code_2
              </span>
              <span className="text-[10px] text-black/40 font-bold mt-1">#BK-991{i}</span>
              <div className="absolute inset-0 bg-balikin-gold/80 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                <span className="text-on-primary font-bold text-xs">Preview</span>
              </div>
            </div>
          ))}
        </div>
        <button className="w-full mt-4 border border-outline-variant text-on-surface py-2 rounded text-sm hover:bg-surface-variant transition-all">
          Launch Designer Tool
        </button>
      </div>

      {/* Quick Stats Footer */}
      <div className="bg-gradient-to-br from-surface-container-high to-surface-deep p-6 rounded-xl border border-balikin-gold/20 flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <span className="material-symbols-outlined text-balikin-gold !text-[24px]" data-icon="verified" style={{ fontVariationSettings: "'FILL' 1" }}>
            verified
          </span>
          <span className="text-on-surface font-bold">Premium Conversion</span>
        </div>
        <div className="flex items-end gap-2">
          <span className="text-3xl font-bold text-on-surface">34.2%</span>
          <span className="text-status-resolved text-xs font-bold pb-1">+2.4%</span>
        </div>
        <div className="h-1 bg-surface-variant rounded-full overflow-hidden">
          <div className="h-full bg-balikin-gold w-[34.2%] shadow-[0_0_8px_#FFD700]"></div>
        </div>
      </div>
    </div>
  );
}
