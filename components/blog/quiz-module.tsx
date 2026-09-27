"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle2, AlertTriangle, Gift, ArrowRight, ClipboardCheck } from "lucide-react";

interface QuizQuestion {
  question: string;
  options: string[];
}

interface QuizModuleProps {
  quizId: string;
  rewardText: string;
  minScoreToWin: number;
  questions: QuizQuestion[];
  postId: string;
}

export function BlogQuizModule({ quizId, rewardText, minScoreToWin, questions, postId }: QuizModuleProps) {
  const [step, setStep] = useState<'intro' | 'active_quiz' | 'result_fail' | 'claim_form' | 'success'>('intro');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);

  const [formData, setFormData] = useState({ name: '', whatsapp: '', address: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGrading, setIsGrading] = useState(false);
  const [calculatedScore, setCalculatedScore] = useState(0);

  const currentQuestion = questions[currentQuestionIndex];

  const handleNext = async () => {
    if (selectedAnswer === null) return;

    const newAnswers = [...answers, selectedAnswer];
    setAnswers(newAnswers);
    setSelectedAnswer(null);

    if (currentQuestionIndex + 1 < questions.length) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      setIsGrading(true);
      try {
        const response = await fetch('/api/blog/quiz-grade', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ postId, quizId, answers: newAnswers }),
        });
        const result = await response.json();
        if (!response.ok) throw new Error(result.error || 'Jawaban kuis tidak dapat diperiksa.');

        setCalculatedScore(result.score);
        setStep(result.passed ? 'claim_form' : 'result_fail');
      } catch (error) {
        setAnswers(answers);
        setSelectedAnswer(newAnswers[newAnswers.length - 1] ?? null);
        console.error(error);
        alert(error instanceof Error ? error.message : 'Terjadi kesalahan saat memeriksa jawaban. Coba lagi.');
      } finally {
        setIsGrading(false);
      }
    }
  };

  const handleReset = () => {
    setCurrentQuestionIndex(0);
    setAnswers([]);
    setSelectedAnswer(null);
    setStep('active_quiz');
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const res = await fetch('/api/blog/giveaway-claim', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          postId,
          quizId,
          answers,
          fullName: formData.name,
          whatsappNumber: formData.whatsapp,
          shippingAddress: formData.address,
        })
      });

      if (res.ok) {
        setStep('success');
      } else {
        const error = await res.json();
        alert(error.error || "Terjadi kesalahan teknis. Coba beberapa saat lagi.");
      }
    } catch (err) {
      console.error(err);
      alert("Terjadi kesalahan koneksi.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="border-2 border-primary/20 bg-primary/5 rounded-2xl p-6 md:p-8 max-w-2xl mx-auto my-10 shadow-sm transition-all duration-300">
      {step === 'intro' && (
        <div className="text-center space-y-4">
          <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
            <Gift className="w-6 h-6 animate-bounce" />
          </div>
          <h3 className="text-xl md:text-2xl font-bold tracking-tight">Kuis Berhadiah BALIKIN!</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Yuk uji pemahamanmu dari materi artikel di atas! Jawab kuis singkat ini untuk berkesempatan mendapatkan <span className="font-semibold text-foreground underline decoration-primary decoration-2">{rewardText}</span>.
          </p>
          <div className="text-xs text-muted-foreground bg-card border py-2 px-4 rounded-full inline-block">
            Target kelulusan: minimal <span className="font-bold text-primary">{minScoreToWin}%</span> jawaban benar
          </div>
          <br/>
          <Button onClick={() => setStep('active_quiz')} className="px-6 font-semibold">Mulai Kuis <ArrowRight className="ml-2 w-4 h-4" /></Button>
        </div>
      )}

      {step === 'active_quiz' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center text-xs text-muted-foreground font-semibold">
            <span className="uppercase tracking-wider text-primary">Kuis Interaktif</span>
            <span>Pertanyaan {currentQuestionIndex + 1} dari {questions.length}</span>
          </div>

          <div className="w-full bg-muted rounded-full h-1.5">
            <div className="bg-primary h-1.5 rounded-full transition-all duration-300" style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}></div>
          </div>

          <h4 className="text-lg font-bold text-foreground">{currentQuestion.question}</h4>

          <RadioGroup value={selectedAnswer?.toString() || ""} onValueChange={(v) => setSelectedAnswer(parseInt(v))} className="space-y-3">
            {currentQuestion.options.map((option, idx) => (
              <div key={idx} className={`flex items-center space-x-3 border p-4 rounded-xl cursor-pointer transition-all hover:bg-card/50 ${selectedAnswer === idx ? 'border-primary bg-primary/5 ring-1 ring-primary' : 'border-border bg-card'}`}>
                <RadioGroupItem value={idx.toString()} id={`opt-${idx}`} />
                <Label htmlFor={`opt-${idx}`} className="w-full cursor-pointer text-sm font-medium text-foreground">{option}</Label>
              </div>
            ))}
          </RadioGroup>

          <Button onClick={handleNext} className="w-full py-6 font-semibold" disabled={selectedAnswer === null || isGrading}>
            {isGrading ? "Memeriksa jawaban..." : currentQuestionIndex + 1 === questions.length ? "Lihat Hasil Kuis" : "Lanjutkan Pertanyaan"}
          </Button>
        </div>
      )}

      {step === 'result_fail' && (
        <div className="text-center space-y-4 py-4">
          <div className="mx-auto w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center text-destructive">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold">Skor Kamu Belum Mencapai Target</h3>
          <p className="text-sm text-muted-foreground">
            Kamu mendapatkan skor <span className="font-bold text-destructive">{calculatedScore}%</span>. Sayang sekali, batas minimal kelulusan untuk klaim hadiah adalah <span className="font-semibold text-foreground">{minScoreToWin}%</span>.
          </p>
          <p className="text-xs text-muted-foreground">Tip: Baca kembali artikel di atas dengan teliti dan coba lagi!</p>
          <Button variant="outline" onClick={handleReset} className="mt-2">Coba Kuis Lagi</Button>
        </div>
      )}

      {step === 'claim_form' && (
        <form onSubmit={handleFormSubmit} className="space-y-4">
          <div className="text-center mb-4 space-y-1">
            <div className="mx-auto w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
              <ClipboardCheck className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-emerald-600">Luar Biasa, Kamu Lolos! 🎉</h3>
            <p className="text-xs text-muted-foreground">Skor kamu: <span className="font-bold">{calculatedScore}%</span>. Isi formulir di bawah untuk mengajukan klaim hadiah.</p>
          </div>

          <div className="grid gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="name" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Nama Lengkap Penerima</Label>
              <Input id="name" required value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} placeholder="Masukkan nama untuk label kurir" className="bg-card" />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="whatsapp" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">No. WhatsApp Aktif</Label>
              <Input id="whatsapp" type="tel" required value={formData.whatsapp} onChange={(e) => setFormData({...formData, whatsapp: e.target.value})} placeholder="Contoh: 081234567xxx (Untuk pengiriman info resi)" className="bg-card" />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="address" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Alamat Lengkap Pengiriman</Label>
              <Textarea id="address" required value={formData.address} onChange={(e) => setFormData({...formData, address: e.target.value})} placeholder="Nama jalan, Nomor rumah, RT/RW, Kelurahan, Kecamatan, Kabupaten/Kota, Kode Pos" className="bg-card min-h-[100px]" />
            </div>
          </div>

          <Button type="submit" className="w-full py-6 font-semibold mt-4" disabled={isSubmitting}>
            {isSubmitting ? "Sedang Mengirim..." : "Kirim Klaim Hadiah Saya"}
          </Button>
        </form>
      )}

      {step === 'success' && (
        <div className="text-center space-y-4 py-6">
          <div className="mx-auto w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <h3 className="text-2xl font-bold text-emerald-600">Data Pengiriman Tersimpan!</h3>
          <p className="text-sm text-muted-foreground leading-relaxed max-w-md mx-auto">
            Hore! Klaim hadiah Anda sudah tersimpan dan akan ditinjau oleh admin BALIKIN. Kami akan menghubungi Anda melalui WhatsApp terkait proses klaim. Terima kasih sudah ikut berpartisipasi!
          </p>
        </div>
      )}
    </div>
  );
}
