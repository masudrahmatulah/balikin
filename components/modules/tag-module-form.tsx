"use client";

import { useState, useTransition } from "react";
import { Car, Check, Leaf } from "lucide-react";
import type { OtomotifData, PertanianData } from "@/db/schema";
import { updateOtomotifData, updatePertanianData } from "@/app/actions/modules";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type ModuleFormProps =
  | { moduleType: "otomotif"; tagId: string; initialData: OtomotifData | null }
  | { moduleType: "pertanian"; tagId: string; initialData: PertanianData | null };

export function TagModuleForm(props: ModuleFormProps) {
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function submit(formData: FormData) {
    setMessage(null);
    setError(null);
    startTransition(async () => {
      try {
        if (props.moduleType === "otomotif") {
          await updateOtomotifData({
            tagId: props.tagId,
            stnkNumber: String(formData.get("stnkNumber") || ""),
            stnkExpiryDate: formData.get("stnkExpiryDate") ? new Date(String(formData.get("stnkExpiryDate"))) : undefined,
            oilChangeSchedule: String(formData.get("oilChangeSchedule") || ""),
            serviceHistory: String(formData.get("serviceHistory") || ""),
            insuranceNumber: String(formData.get("insuranceNumber") || ""),
            insuranceProvider: String(formData.get("insuranceProvider") || ""),
          });
        } else {
          await updatePertanianData({
            tagId: props.tagId,
            hstCalculator: String(formData.get("hstCalculator") || ""),
            fertilizerSchedule: String(formData.get("fertilizerSchedule") || ""),
            harvestLog: String(formData.get("harvestLog") || ""),
            laborCostNotes: String(formData.get("laborCostNotes") || ""),
          });
        }
        setMessage("Data berhasil disimpan.");
      } catch (err) {
        setError(err instanceof Error ? err.message : "Data gagal disimpan.");
      }
    });
  }

  const isOtomotif = props.moduleType === "otomotif";
  const Icon = isOtomotif ? Car : Leaf;

  return (
    <form action={submit} className="space-y-5 rounded-2xl border border-red-100 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900">
      <div className="flex items-center gap-3">
        <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-red/10 text-brand-red">
          <Icon className="h-6 w-6" aria-hidden="true" />
        </span>
        <div>
          <h2 className="font-semibold text-slate-900 dark:text-white">{isOtomotif ? "Data Kendaraan" : "Data Pertanian"}</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">Data ini tersimpan khusus untuk tag yang sedang dibuka.</p>
        </div>
      </div>

      {isOtomotif ? (
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Nomor STNK" name="stnkNumber" defaultValue={props.initialData?.stnkNumber || ""} placeholder="B 1234 ABC" />
          <Field label="Jatuh Tempo STNK" name="stnkExpiryDate" type="date" defaultValue={props.initialData?.stnkExpiryDate ? new Date(props.initialData.stnkExpiryDate).toISOString().slice(0, 10) : ""} />
          <Field label="Jadwal Ganti Oli" name="oilChangeSchedule" defaultValue={props.initialData?.oilChangeSchedule || ""} placeholder="Setiap 5.000 km" />
          <Field label="Nomor Asuransi" name="insuranceNumber" defaultValue={props.initialData?.insuranceNumber || ""} />
          <Field label="Provider Asuransi" name="insuranceProvider" defaultValue={props.initialData?.insuranceProvider || ""} />
          <TextArea label="Riwayat Servis" name="serviceHistory" defaultValue={props.initialData?.serviceHistory || ""} />
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          <TextArea label="Kalkulator HST" name="hstCalculator" defaultValue={props.initialData?.hstCalculator || ""} placeholder="Catat tanggal tanam dan target panen" />
          <TextArea label="Jadwal Pemupukan" name="fertilizerSchedule" defaultValue={props.initialData?.fertilizerSchedule || ""} />
          <TextArea label="Catatan Panen" name="harvestLog" defaultValue={props.initialData?.harvestLog || ""} />
          <TextArea label="Biaya Tenaga Kerja" name="laborCostNotes" defaultValue={props.initialData?.laborCostNotes || ""} />
        </div>
      )}

      {error && <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700 dark:bg-red-950/30 dark:text-red-300" role="alert">{error}</p>}
      {message && <p className="flex items-center gap-2 rounded-lg bg-green-50 p-3 text-sm text-green-700 dark:bg-green-950/30 dark:text-green-300" role="status"><Check className="h-4 w-4" />{message}</p>}
      <Button type="submit" disabled={isPending} className="bg-brand-red text-white hover:bg-brand-red-dark">
        {isPending ? "Menyimpan..." : "Simpan Data"}
      </Button>
    </form>
  );
}

function Field({ label, name, defaultValue, placeholder, type = "text" }: { label: string; name: string; defaultValue: string; placeholder?: string; type?: string }) {
  return <div className="space-y-2"><Label htmlFor={name}>{label}</Label><Input id={name} name={name} type={type} defaultValue={defaultValue} placeholder={placeholder} /></div>;
}

function TextArea({ label, name, defaultValue, placeholder }: { label: string; name: string; defaultValue: string; placeholder?: string }) {
  return <div className="space-y-2"><Label htmlFor={name}>{label}</Label><textarea id={name} name={name} defaultValue={defaultValue} placeholder={placeholder} rows={4} className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none ring-offset-background placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring" /></div>;
}
