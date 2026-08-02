"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Send, Shield, AlertCircle, User } from "lucide-react";
import { sendMessage, getChatMessages, getChatRoom, blockChatRoom } from "@/app/actions/chat";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";

interface Message {
  id: string;
  senderType: "owner" | "finder";
  messageText: string;
  createdAt: Date;
}

interface ChatRoom {
  id: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  tag: {
    id: string;
    name: string;
    slug: string;
    ownerId: string;
  };
}

export default function ChatRoomPage() {
  const params = useParams();
  const router = useRouter();
  const roomId = params.roomId as string;

  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [room, setRoom] = useState<ChatRoom | null>(null);
  const [senderType, setSenderType] = useState<"owner" | "finder">("finder");

  // Load initial data
  useEffect(() => {
    const loadInitialData = async () => {
      const [roomResult, messagesResult] = await Promise.all([
        getChatRoom(roomId),
        getChatMessages(roomId),
      ]);

      if (roomResult.success && roomResult.room) {
        setRoom(roomResult.room);
        // Tentukan sender type berdasarkan sesi atau parameter URL
        const urlParams = new URLSearchParams(window.location.search);
        const senderParam = urlParams.get("as");
        if (senderParam === "owner" || senderParam === "finder") {
          setSenderType(senderParam as "owner" | "finder");
        }
      }

      if (messagesResult.success && messagesResult.messages) {
        setMessages(messagesResult.messages);
      }

      setIsLoading(false);
    };

    loadInitialData();
  }, [roomId]);

  // Setup polling untuk update pesan real-time (fallback untuk tanpa Supabase Realtime)
  useEffect(() => {
    if (!room?.isActive) return;

    const interval = setInterval(async () => {
      const result = await getChatMessages(roomId, 20);
      if (result.success && result.messages) {
        setMessages(result.messages);
      }
    }, 3000); // Poll setiap 3 detik

    return () => {
      clearInterval(interval);
    };
  }, [roomId, room?.isActive]);

  const handleSendMessage = async () => {
    if (!inputText.trim() || isSending) return;

    setIsSending(true);
    const result = await sendMessage({
      roomId,
      messageText: inputText,
      senderType,
    });

    if (result.success) {
      setInputText("");
      // Refresh pesan
      const messagesResult = await getChatMessages(roomId);
      if (messagesResult.success && messagesResult.messages) {
        setMessages(messagesResult.messages);
      }
    } else {
      toast.error(result.error || "Gagal mengirim pesan");
    }

    setIsSending(false);
  };

  const handleBlockChat = async () => {
    if (!confirm("Apakah Anda yakin ingin menutup obrolan ini? Penemu tidak akan bisa mengirim pesan lagi.")) {
      return;
    }

    const result = await blockChatRoom(roomId);
    if (result.success) {
      toast.success("Sesi chat telah ditutup");
      // Refresh room data
      const roomResult = await getChatRoom(roomId);
      if (roomResult.success && roomResult.room) {
        setRoom(roomResult.room);
      }
    } else {
      toast.error(result.error || "Gagal menutup obrolan");
    }
  };

  const formatTime = (date: Date) => {
    const d = new Date(date);
    return d.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900 mx-auto mb-4"></div>
          <p className="text-slate-600">Memuat obrolan...</p>
        </div>
      </div>
    );
  }

  if (!room) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
        <Alert variant="destructive" className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Ruang obrolan tidak ditemukan atau telah dihapus.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const isOwner = senderType === "owner";

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-slate-100 rounded-full transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="font-semibold text-slate-900">{room.tag.name}</h1>
            <p className="text-xs text-slate-500 flex items-center gap-1">
              {isOwner ? (
                <>
                  <Shield className="h-3 w-3" />
                  Pemilik
                </>
              ) : (
                <>
                  <User className="h-3 w-3" />
                  Penemu
                </>
              )}
            </p>
          </div>
        </div>

        {isOwner && room.isActive && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleBlockChat}
            className="text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            Tutup Obrolan
          </Button>
        )}
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {!room.isActive && (
          <Alert className="mb-4 bg-amber-50 border-amber-200 text-amber-900">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Sesi chat ini telah ditutup oleh pemilik. Anda tidak bisa mengirim pesan lagi.
            </AlertDescription>
          </Alert>
        )}

        {messages.length === 0 ? (
          <div className="text-center text-slate-500 py-12">
            <p className="mb-2">Belum ada pesan</p>
            <p className="text-sm text-slate-400">
              {isOwner
                ? "Tunggu penemu mengirim pesan..."
                : "Mulai percakapan dengan pemilik..."}
            </p>
          </div>
        ) : (
          messages.map((message) => {
            const isFromMe = message.senderType === senderType;
            return (
              <div
                key={message.id}
                className={`flex ${isFromMe ? "justify-end" : "justify-start"}`}
              >
                <Card
                  className={`max-w-[80%] px-4 py-2 ${
                    isFromMe
                      ? "bg-blue-600 text-white"
                      : "bg-white text-slate-900 border-slate-200"
                  }`}
                >
                  <p className="text-sm break-words">{message.messageText}</p>
                  <p
                    className={`text-xs mt-1 ${
                      isFromMe ? "text-blue-100" : "text-slate-500"
                    }`}
                  >
                    {formatTime(message.createdAt)}
                  </p>
                </Card>
              </div>
            );
          })
        )}
      </div>

      {/* Input */}
      {room.isActive && (
        <div className="bg-white border-t border-slate-200 p-4">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex gap-2"
          >
            <Input
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={isOwner ? "Tulis pesan..." : "Tulis pesan ke pemilik..."}
              maxLength={1000}
              disabled={isSending}
              className="flex-1"
            />
            <Button
              type="submit"
              disabled={!inputText.trim() || isSending}
              size="icon"
              className="shrink-0"
            >
              <Send className="h-4 w-4" />
            </Button>
          </form>
          <p className="text-xs text-slate-500 mt-2 text-center">
            {isOwner
              ? "Anda terverifikasi sebagai pemilik barang ini"
              : "Anda berchat sebagai penemu anonim"}
          </p>
        </div>
      )}
    </div>
  );
}
