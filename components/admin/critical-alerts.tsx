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
    <div className="col-span-12 lg:col-span-4 space-y-8">
      {/* Heritage Alert Widget */}
      <div className="bg-primary text-surface p-8 rounded-lg shadow-lg relative overflow-hidden">
        <div className="flex items-center gap-6 mb-8 relative z-10">
          <div className="w-12 h-12 bg-tertiary rounded-sm flex items-center justify-center text-surface">
            <span className="material-symbols-outlined !text-[28px]" data-icon="inventory_2" style={{ fontVariationSettings: "'FILL' 1" }}>
              inventory_2
            </span>
          </div>
          <div>
            <h4 className="font-display text-xl font-bold tracking-tight">STOK KRITIS</h4>
            <p className="font-label text-[9px] text-surface/50 uppercase tracking-[0.2em] mt-1">Action required</p>
          </div>
        </div>
        <div className="space-y-4 relative z-10">
          {materials.map((material, index) => (
            <div key={index} className="flex justify-between items-center border-b border-surface/10 pb-3">
              <span className="font-body text-sm font-medium">{material.name}</span>
              <span className="font-display text-lg font-bold text-tertiary">{material.quantity} units</span>
            </div>
          ))}
        </div>
        <button className="w-full mt-8 bg-tertiary text-surface py-4 rounded-sm font-label text-[10px] uppercase tracking-[0.2em] font-bold hover:brightness-110 transition-all shadow-sm">
          Order Supplies Now
        </button>
      </div>

      {/* Heritage Recent Previews Card */}
      <div className="bg-surface p-8 rounded-lg border border-secondary/10 shadow-sm">
        <h4 className="font-label text-[10px] text-secondary uppercase tracking-[0.2em] font-bold mb-6 flex items-center gap-2">
          <span className="material-symbols-outlined text-tertiary !text-[18px]" data-icon="history">
            history
          </span>
          Recent VDP Previews
        </h4>
        <div className="grid grid-cols-2 gap-6">
          {[1, 2].map((i) => (
            <div
              key={i}
              className="aspect-square bg-neutral rounded-sm p-4 flex flex-col items-center justify-center group cursor-pointer border border-secondary/5 hover:border-tertiary/30 transition-all relative overflow-hidden"
            >
              <span className="material-symbols-outlined text-primary !text-[40px] opacity-40 group-hover:opacity-100 transition-all group-hover:scale-110" data-icon="qr_code_2">
                qr_code_2
              </span>
              <span className="font-data-mono text-[9px] text-secondary mt-3">#BK-991{i}</span>
              <div className="absolute inset-0 bg-primary/95 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all duration-300 translate-y-full group-hover:translate-y-0">
                <span className="text-surface font-label text-[9px] uppercase tracking-widest font-bold">Preview</span>
              </div>
            </div>
          ))}
        </div>
        <button className="w-full mt-8 border border-secondary/20 text-primary py-3 rounded-sm font-label text-[10px] uppercase tracking-widest font-bold hover:bg-neutral transition-all">
          Designer Tool
        </button>
      </div>

      {/* Status Legend / Quick Links */}
      <div className="bg-surface p-8 rounded-lg border border-secondary/10 shadow-sm">
        <h4 className="font-label text-[10px] text-secondary uppercase tracking-[0.2em] font-bold mb-6">Operational Status</h4>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="font-body text-xs text-primary">Production Line</span>
            <span className="font-label text-[9px] text-primary font-bold uppercase tracking-widest bg-neutral px-2 py-0.5 rounded-sm">Operational</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="font-body text-xs text-primary">API Gateway</span>
            <span className="font-label text-[9px] text-primary font-bold uppercase tracking-widest bg-neutral px-2 py-0.5 rounded-sm">99.9% Up</span>
          </div>
        </div>
      </div>
    </div>
  );
}
