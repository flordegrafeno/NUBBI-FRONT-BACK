import { useState, useRef, useEffect, useCallback } from "preact/hooks";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { colors, fonts } from "../../tokens";
import { useAuth } from "../../providers/AuthProvider";
import {
  useMessages,
  useSendMessage,
  useTypingIndicator,
  type ChatMessage,
} from "../../providers/ChatProvider";

const formatTime = (iso: string) =>
  new Date(iso).toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit" });

const formatDateSeparator = (iso: string) => {
  const d = new Date(iso);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  if (d.toDateString() === today.toDateString()) return "Hoy";
  if (d.toDateString() === yesterday.toDateString()) return "Ayer";
  return d.toLocaleDateString("es-CO", { day: "numeric", month: "long" });
};

const shouldShowDateSeparator = (messages: ChatMessage[], index: number): boolean => {
  if (index === 0) return true;
  const curr = new Date(messages[index].created_at).toDateString();
  const prev = new Date(messages[index - 1].created_at).toDateString();
  return curr !== prev;
};

const shouldShowAvatar = (messages: ChatMessage[], index: number, myId: string): boolean => {
  const msg = messages[index];
  if (msg.profile_id === myId) return false;
  const next = messages[index + 1];
  return !next || next.profile_id !== msg.profile_id;
};

const getInitials = (name?: string) => {
  if (!name) return "?";
  return name.split(" ").slice(0, 2).map((n) => n[0]).join("").toUpperCase();
};

const avatarColors = [
  colors.blue, colors.teal, colors.pink, colors.orange, colors.pinkDark,
];
const getAvatarColor = (id: string) =>
  avatarColors[id.charCodeAt(0) % avatarColors.length];

interface MessageBubbleProps {
  msg: ChatMessage;
  isOwn: boolean;
  showAvatar: boolean;
  showName: boolean;
}

const MessageBubble = ({ msg, isOwn, showAvatar, showName }: MessageBubbleProps) => {
  const name = msg.profiles?.full_name ?? "Usuario";
  return (
    <div
      style={{
        display: "flex",
        flexDirection: isOwn ? "row-reverse" : "row",
        alignItems: "flex-end",
        gap: 8,
        marginBottom: 2,
      }}
    >
      {/* Avatar */}
      {!isOwn && (
        <div style={{ width: 32, flexShrink: 0 }}>
          {showAvatar ? (
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: "50%",
                background: getAvatarColor(msg.profile_id),
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "white",
                fontSize: 11,
                fontWeight: 800,
                fontFamily: fonts.body,
              }}
            >
              {getInitials(name)}
            </div>
          ) : null}
        </div>
      )}

      {/* Bubble */}
      <div
        style={{
          maxWidth: "72%",
          display: "flex",
          flexDirection: "column",
          alignItems: isOwn ? "flex-end" : "flex-start",
        }}
      >
        {showName && !isOwn && (
          <div
            style={{
              fontSize: 10,
              fontWeight: 700,
              color: getAvatarColor(msg.profile_id),
              fontFamily: fonts.body,
              marginBottom: 3,
              marginLeft: 10,
            }}
          >
            {name}
          </div>
        )}
        <div
          style={{
            background: isOwn ? "var(--color-own-bubble)" : "var(--color-other-bubble)",
            color: isOwn ? "var(--color-own-bubble-text)" : "var(--color-other-bubble-text)",
            borderRadius: isOwn ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
            padding: "9px 13px",
            fontSize: 13,
            fontFamily: fonts.body,
            lineHeight: 1.45,
            wordBreak: "break-word",
            boxShadow: isOwn
              ? "0 2px 8px rgba(15,118,110,0.2)"
              : "0 1px 4px rgba(0,0,0,0.08)",
          }}
        >
          {msg.content}
        </div>
        <div
          style={{
            fontSize: 10,
            color: colors.textLight,
            fontFamily: fonts.body,
            marginTop: 3,
            marginLeft: isOwn ? 0 : 10,
            marginRight: isOwn ? 4 : 0,
          }}
        >
          {formatTime(msg.created_at)}
        </div>
      </div>
    </div>
  );
};

export const ChatScreen = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const { auth } = useAuth();
  const myId = auth?.user.id ?? "";
  const myName = auth?.user.full_name ?? "Yo";
  const roomName = (location.state as { roomName?: string } | null)?.roomName ?? "Chat";

  const { messages, loading } = useMessages(roomId ?? null);
  const { sendMessage, sending } = useSendMessage();
  const { typingUsers, broadcastTyping } = useTypingIndicator(roomId ?? null, myId);

  const [text, setText] = useState("");
  const [showScrollBtn, setShowScrollBtn] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const isAtBottomRef = useRef(true);

  // Auto-scroll cuando llegan mensajes nuevos
  useEffect(() => {
    if (isAtBottomRef.current && listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [messages]);

  const handleScroll = () => {
    const el = listRef.current;
    if (!el) return;
    const atBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 60;
    isAtBottomRef.current = atBottom;
    setShowScrollBtn(!atBottom);
  };

  const scrollToBottom = () => {
    if (listRef.current) {
      listRef.current.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
    }
  };

  const handleSend = useCallback(async () => {
    if (!text.trim() || !roomId || sending) return;
    const content = text;
    setText("");
    isAtBottomRef.current = true;
    await sendMessage(roomId, myId, content);
    setTimeout(scrollToBottom, 50);
  }, [text, roomId, sending, myId, sendMessage]);

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleInput = (e: Event) => {
    const val = (e.target as HTMLTextAreaElement).value;
    setText(val);
    if (val.trim()) broadcastTyping(myName);
    // Auto resize textarea
    const ta = inputRef.current;
    if (ta) {
      ta.style.height = "auto";
      ta.style.height = Math.min(ta.scrollHeight, 120) + "px";
    }
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100dvh",
        background: "var(--color-bg)",
        overflow: "hidden",
      }}
    >
      {/* ── Header ──────────────────────────────────────────────────────── */}
      <div
        style={{
          background: "var(--color-surface)",
          borderBottom: "1px solid var(--color-border)",
          padding: "10px 16px",
          display: "flex",
          alignItems: "center",
          gap: 12,
          flexShrink: 0,
          boxShadow: "0 1px 8px var(--color-shadow)",
        }}
      >
        <button
          onClick={() => navigate(-1)}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            padding: "6px 8px 6px 0",
            fontSize: 18,
            color: colors.text,
            lineHeight: 1,
          }}
        >
          ←
        </button>

        <div
          style={{
            width: 40,
            height: 40,
            borderRadius: "50%",
            background: `linear-gradient(135deg, ${colors.blue}, ${colors.teal})`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "white",
            fontSize: 16,
            flexShrink: 0,
          }}
        >
          💬
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              fontWeight: 700,
              fontSize: 14,
              color: colors.text,
              fontFamily: fonts.body,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {roomName}
          </div>
          <div style={{ fontSize: 11, color: colors.textLight, fontFamily: fonts.body }}>
            {loading
              ? "Cargando…"
              : typingUsers.length > 0
              ? `${typingUsers.slice(0, 2).join(", ")} está escribiendo…`
              : `${messages.length} mensaje${messages.length !== 1 ? "s" : ""}`}
          </div>
        </div>
      </div>

      {/* ── Mensajes ─────────────────────────────────────────────────────── */}
      <div
        ref={listRef}
        onScroll={handleScroll}
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "12px 14px",
          display: "flex",
          flexDirection: "column",
          gap: 4,
          position: "relative",
        }}
      >
        {loading && (
          <div
            style={{
              textAlign: "center",
              color: colors.textLight,
              fontFamily: fonts.body,
              fontSize: 12,
              padding: 32,
            }}
          >
            Cargando mensajes…
          </div>
        )}

        {!loading && messages.length === 0 && (
          <div
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 10,
              padding: 40,
              textAlign: "center",
            }}
          >
            <div style={{ fontSize: 48 }}>💬</div>
            <div
              style={{
                fontWeight: 700,
                fontSize: 15,
                color: colors.text,
                fontFamily: fonts.body,
              }}
            >
              Nadie ha escrito aún
            </div>
            <div
              style={{
                fontSize: 12,
                color: colors.textLight,
                fontFamily: fonts.body,
                lineHeight: 1.5,
              }}
            >
              Sé el primero en escribir en este chat
            </div>
          </div>
        )}

        {messages.map((msg, i) => {
          const isOwn = msg.profile_id === myId;
          const showDate = shouldShowDateSeparator(messages, i);
          const showAvatar = shouldShowAvatar(messages, i, myId);
          const prevMsg = messages[i - 1];
          const showName = !isOwn && (!prevMsg || prevMsg.profile_id !== msg.profile_id || showDate);

          return (
            <div key={msg.id}>
              {showDate && (
                <div
                  style={{
                    textAlign: "center",
                    margin: "10px 0 8px",
                  }}
                >
                  <span
                    style={{
                      background: "var(--color-border)",
                      color: colors.textLight,
                      fontSize: 10,
                      fontWeight: 700,
                      fontFamily: fonts.body,
                      padding: "3px 10px",
                      borderRadius: 12,
                    }}
                  >
                    {formatDateSeparator(msg.created_at)}
                  </span>
                </div>
              )}
              <MessageBubble
                msg={msg}
                isOwn={isOwn}
                showAvatar={showAvatar}
                showName={showName}
              />
            </div>
          );
        })}

        {/* Typing indicator */}
        {typingUsers.length > 0 && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "4px 0",
            }}
          >
            <div
              style={{
                background: "var(--color-surface)",
                borderRadius: "18px 18px 18px 4px",
                padding: "8px 14px",
                display: "flex",
                gap: 4,
                alignItems: "center",
                boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
              }}
            >
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  style={{
                    width: 7,
                    height: 7,
                    borderRadius: "50%",
                    background: colors.textLight,
                    animation: `typingDot 1.2s ${i * 0.2}s ease-in-out infinite`,
                  }}
                />
              ))}
            </div>
            <style>{`
              @keyframes typingDot {
                0%, 60%, 100% { transform: translateY(0); opacity: 0.4; }
                30% { transform: translateY(-5px); opacity: 1; }
              }
            `}</style>
          </div>
        )}
      </div>

      {/* Botón scroll al fondo */}
      {showScrollBtn && (
        <button
          onClick={scrollToBottom}
          style={{
            position: "fixed",
            bottom: 90,
            right: 16,
            width: 40,
            height: 40,
            borderRadius: "50%",
            background: colors.blue,
            border: "none",
            color: "white",
            fontSize: 16,
            cursor: "pointer",
            boxShadow: "0 4px 14px rgba(0,0,0,0.25)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 10,
          }}
        >
          ↓
        </button>
      )}

      {/* ── Input ────────────────────────────────────────────────────────── */}
      <div
        style={{
          background: "var(--color-surface)",
          borderTop: "1px solid var(--color-border)",
          padding: "10px 12px",
          display: "flex",
          alignItems: "flex-end",
          gap: 10,
          flexShrink: 0,
          boxShadow: "0 -1px 8px var(--color-shadow)",
        }}
      >
        <div
          style={{
            flex: 1,
            background: "var(--color-bg)",
            borderRadius: 22,
            border: "1px solid var(--color-border)",
            padding: "8px 14px",
            display: "flex",
            alignItems: "flex-end",
            minHeight: 42,
          }}
        >
          <textarea
            ref={inputRef}
            value={text}
            onInput={handleInput}
            onKeyDown={handleKeyDown as any}
            placeholder="Escribe un mensaje…"
            rows={1}
            style={{
              flex: 1,
              background: "none",
              border: "none",
              outline: "none",
              resize: "none",
              fontSize: 13,
              fontFamily: fonts.body,
              color: colors.text,
              lineHeight: 1.45,
              maxHeight: 120,
              overflowY: "auto",
            }}
          />
        </div>

        <button
          onClick={handleSend}
          disabled={!text.trim() || sending}
          style={{
            width: 42,
            height: 42,
            borderRadius: "50%",
            background:
              text.trim() && !sending
                ? `linear-gradient(135deg, ${colors.teal}, ${colors.blue})`
                : colors.gray200,
            border: "none",
            cursor: text.trim() && !sending ? "pointer" : "not-allowed",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 18,
            flexShrink: 0,
            transition: "all 0.2s",
            boxShadow:
              text.trim() && !sending
                ? `0 4px 12px ${colors.teal}50`
                : "none",
          }}
        >
          {sending ? (
            <span style={{ fontSize: 12 }}>⏳</span>
          ) : (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path
                d="M22 2L11 13"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M22 2L15 22L11 13L2 9L22 2Z"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          )}
        </button>
      </div>
    </div>
  );
};