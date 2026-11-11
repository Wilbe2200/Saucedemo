"use client";

import {
  useEffect,
  useRef,
  useState,
  useId,
  type FormEvent,
  type ReactNode,
} from "react";
import {
  ArrowDown,
  ArrowRight,
  Check,
  ChevronDown,
  Heart,
  HeartHandshake,
  Mail,
  MessageCircleHeart,
  Music2,
  Plus,
  Send,
  Sparkles,
  VolumeX,
  X,
} from "lucide-react";

type LoveLetter = {
  id: string;
  title: string;
  preview: string;
  message: string;
  date: string;
};

type LoveNote = {
  id: string;
  message: string;
  date: string;
};

type PendingLoveNote = LoveNote & { requestId: string };

type DatabaseStatus = "checking" | "connected" | "disconnected";

const STORAGE_KEY = "megan-love-notes-v3";
const MILO_J_VIDEO_ID = "aBSkvI0CkgU";

function isLoveLetter(value: unknown): value is LoveLetter {
  if (typeof value !== "object" || value === null) return false;
  return (
    "id" in value &&
    "title" in value &&
    "preview" in value &&
    "message" in value &&
    "date" in value &&
    typeof value.id === "string" &&
    typeof value.title === "string" &&
    typeof value.preview === "string" &&
    typeof value.message === "string" &&
    typeof value.date === "string"
  );
}

function isLoveNote(value: unknown): value is PendingLoveNote {
  if (typeof value !== "object" || value === null) return false;
  return (
    "id" in value &&
    "requestId" in value &&
    "message" in value &&
    "date" in value &&
    typeof value.id === "string" &&
    typeof value.requestId === "string" &&
    typeof value.message === "string" &&
    typeof value.date === "string"
  );
}

function displayLetterDate(date: string): string {
  const parsedDate = new Date(date);
  return Number.isNaN(parsedDate.getTime()) ? date : dateLabel(parsedDate);
}

const starterLetters: LoveLetter[] = [
  {
    id: "morning",
    title: "De tu novio, para mi amor",
    preview: "Un beso escrito para empezar el día…",
    message:
      "Buenos días, mi amor. Mientras el mundo despierta, yo ya tengo mi pensamiento favorito: tú. Qué suerte la mía poder ser tu novio y querer a una mujer tan hermosa por dentro y por fuera. Si hoy algo se complica, vuelve a estas líneas: estoy contigo, creo en ti y al final del día te espera todo mi cariño. Te amo, Megan.",
    date: "De tu novio, con un beso",
  },
  {
    id: "hug",
    title: "Ven a mis brazos, amor",
    preview: "Un abrazo largo de tu novio…",
    message:
      "Ven aquí, mi vida. Te abrazo fuerte, te acomodo contra mi pecho y por un ratito dejamos que el mundo espere afuera. No tienes que resolver nada ahora ni ser fuerte conmigo: eres mi novia, mi compañera y mi lugar favorito. Quédate todo el tiempo que quieras; mis brazos son tu casa.",
    date: "Ábreme cuando quieras un abrazo mío",
  },
  {
    id: "you",
    title: "La mujer de mis ojos",
    preview: "Lo que mi corazón ve en ti…",
    message:
      "Megan, para mí eres la mujer más hermosa del mundo, pero lo que más me enamora es la persona que eres: tu corazón generoso, tu manera de iluminar mis días y esa fuerza tan tuya. Me siento orgulloso de ser tu novio. Nunca tienes que ganarte mi amor; ya te quiero con todo lo que eres, incluso en los días en que tú no alcanzas a verlo.",
    date: "Ábreme cuando necesites recordar cuánto te amo",
  },
  {
    id: "later",
    title: "Elegirte, todos los días",
    preview: "No hace falta una fecha especial…",
    message:
      "No es nuestro aniversario ni hay una ocasión especial. Solo quería recordarte que vuelvo a elegirte en lo sencillo: en una conversación, en una risa, en cada plan y en los días tranquilos. Ser tu novio es una de mis cosas favoritas. Gracias por compartir tu vida conmigo, mi amor. Te quiero hoy, y mañana vuelvo a quererte.",
    date: "Ábreme cualquier día; siempre es buen momento",
  },
];

const boosts = [
  { quote: "Mi novia es la mujer más hermosa del mundo, y hoy quiero que se vea como yo la veo.", mood: "Tu novio, completamente enamorado" },
  { quote: "Megan, tienes una luz preciosa. Si hoy dudas de ti, déjame recordarte lo extraordinaria que eres.", mood: "Capibara orgulloso de mi amor" },
  { quote: "No tienes que poder con todo, mi vida. Ven conmigo: lo que pesa, lo cargamos juntos.", mood: "Un abrazo de tu novio" },
  { quote: "Tu sonrisa sigue siendo mi paisaje favorito y tu abrazo, mi lugar en el mundo.", mood: "Capibara guardando rosas para ti" },
  { quote: "Qué suerte la mía de amarte y poder llamarte mi novia. Te elegiría en todas mis vidas.", mood: "Tu novio, enamorado para siempre" },
];

const dateLabel = (date: Date = new Date()) =>
  new Intl.DateTimeFormat("es", { dateStyle: "medium" }).format(date);

function InteractiveCapybara({
  children,
  label,
  className = "",
}: {
  children: ReactNode;
  label: string;
  className?: string;
}) {
  const [reaction, setReaction] = useState(0);

  return (
    <button
      type="button"
      className={`love-capybara-moment ${className}`}
      aria-label={`${label}. Toca para enviarle corazones.`}
      onClick={() => setReaction((current) => current + 1)}
    >
      <span className="love-capybara-art">{children}</span>
      {reaction > 0 && (
        <span className="love-capybara-burst" key={reaction} aria-hidden="true">
          {["♥", "✿", "♥", "❀"].map((petal, index) => (
            <span key={index}>{petal}</span>
          ))}
        </span>
      )}
    </button>
  );
}

type CapybaraPose = "heart" | "rose" | "sign";

function KawaiiCapybara({
  className = "",
  pose = "heart",
  decorative = false,
}: {
  className?: string;
  pose?: CapybaraPose;
  decorative?: boolean;
}) {
  const instanceId = useId().replace(/:/g, "");
  const furId = `kawaii-fur-${instanceId}`;
  const faceId = `kawaii-face-${instanceId}`;
  const heartId = `kawaii-heart-${instanceId}`;
  const label =
    pose === "sign"
      ? "Capibara enamorado con un letrero que dice Para Megan, mi novia hermosa"
      : pose === "rose"
        ? "Capibara enamorado abrazando una rosa roja y un corazón"
        : "Capibara cupido enamorado abrazando un corazón";

  return (
    <svg
      className={`love-kawaii-capybara ${className}`}
      viewBox="0 0 320 270"
      fill="none"
      role={decorative ? undefined : "img"}
      aria-label={decorative ? undefined : label}
      aria-hidden={decorative || undefined}
    >
      <defs>
        <linearGradient id={furId} x1="79" x2="240" y1="77" y2="244" gradientUnits="userSpaceOnUse">
          <stop stopColor="#D8A87C" />
          <stop offset=".54" stopColor="#C58D62" />
          <stop offset="1" stopColor="#A96E4D" />
        </linearGradient>
        <linearGradient id={faceId} x1="117" x2="239" y1="92" y2="176" gradientUnits="userSpaceOnUse">
          <stop stopColor="#E4B68D" />
          <stop offset="1" stopColor="#C98D68" />
        </linearGradient>
        <linearGradient id={heartId} x1="118" x2="208" y1="157" y2="239" gradientUnits="userSpaceOnUse">
          <stop stopColor="#F05B70" />
          <stop offset=".5" stopColor="#D92F51" />
          <stop offset="1" stopColor="#A9163D" />
        </linearGradient>
      </defs>

      <g className="love-kawaii-floating-heart">
        <path d="M56 96c-13-12-1-25 10-14 11-11 23 2 10 14l-10 9-10-9Z" fill="#D96B7C" />
      </g>
      <g className="love-kawaii-floating-heart love-kawaii-floating-heart-two">
        <path d="M256 71c-10-9-1-19 8-11 8-8 17 2 7 11l-7 7-8-7Z" fill="#C84460" />
      </g>
      <path d="m274 119 3 7 7 3-7 3-3 7-3-7-7-3 7-3 3-7Z" fill="#D7A661" />
      <ellipse cx="162" cy="249" rx="103" ry="12" fill="#714333" opacity=".12" />

      {pose === "sign" && (
        <g className="love-sign-board">
          <rect x="41" y="12" width="238" height="78" rx="11" fill="#FFF6E9" stroke="#8A3546" strokeWidth="4" />
          <rect x="49" y="20" width="222" height="62" rx="7" fill="#F9E8DB" />
          <text x="160" y="46" fill="#813448" textAnchor="middle" fontFamily="Georgia, serif" fontSize="15" fontStyle="italic">Para Megan,</text>
          <text x="160" y="67" fill="#813448" textAnchor="middle" fontFamily="Georgia, serif" fontSize="15" fontStyle="italic">mi novia hermosa</text>
          <path d="M153 75c5-7 13-2 6 5-8-6 2-12 6-5" fill="#C23C55" />
        </g>
      )}

      <path
        d="M62 183c-3-48 21-89 66-100 11-32 43-39 58-10 20-30 53-18 53 12 28 15 43 43 39 83-5 48-40 77-105 77-63 0-106-21-111-62Z"
        fill={`url(#${furId})`}
        stroke="#956044"
        strokeWidth="3"
      />
      <path d="M119 92c-12-27-5-42 8-42 14 0 22 17 18 40m27-2c4-27 17-40 29-34 12 6 10 22 1 42" fill="#A86F4F" stroke="#88583F" strokeWidth="4" />
      <path d="M129 85c-6-13-2-21 4-21 7 0 11 9 9 22m45-4c3-12 9-18 14-15 6 3 4 11 0 20" fill="#E7B995" opacity=".8" />
      <path d="M105 126c5-11 17-14 27-9m40-1c10-6 22-3 28 7" stroke="#57392F" strokeWidth="4" strokeLinecap="round" />
      <path d="m108 120-7-6m16 2-3-8m59 4 4-8m9 12 7-5" stroke="#57392F" strokeWidth="2.5" strokeLinecap="round" />
      <ellipse cx="112" cy="145" rx="18" ry="9" fill="#EE8D98" opacity=".67" />
      <ellipse cx="192" cy="143" rx="18" ry="9" fill="#EE8D98" opacity=".67" />
      <path d="M131 150c7 5 14 5 21 0m-17 7c5 3 9 3 13 0" stroke="#8E5644" strokeWidth="2.3" strokeLinecap="round" />
      <path d="M202 125c12-8 29-6 39 3 9 9 8 23-2 31-10 8-27 8-40 0l3-34Z" fill={`url(#${faceId})`} stroke="#A56E50" strokeWidth="2" />
      <ellipse cx="233" cy="132" rx="9" ry="6" fill="#55362D" />
      <ellipse cx="230" cy="130" rx="2.5" ry="1.7" fill="#FFF2DF" />
      <path d="M214 153c8 5 16 5 23 0" stroke="#8E5644" strokeWidth="2" strokeLinecap="round" />

      <path d="M77 209c-5 15-2 28 8 32 10 5 22-2 31-14m128-16c8 15 6 28-4 33-10 5-21-2-31-13" fill="none" stroke="#A86D4D" strokeWidth="15" strokeLinecap="round" />
      <path d="M94 237v13m126-13v13" stroke="#86563E" strokeWidth="12" strokeLinecap="round" />
      <path d="M83 253h24m101 0h24" stroke="#704A37" strokeWidth="5" strokeLinecap="round" />
      <path className="love-kawaii-heart-pulse" d="M160 231c-13-12-48-36-48-59 0-17 20-24 34-11l14 14 14-14c14-13 34-6 34 11 0 23-35 47-48 59Z" fill={`url(#${heartId})`} stroke="#A9183D" strokeWidth="3" />
      <path d="M130 169c2-10 11-15 20-12" stroke="#FFB5B6" strokeWidth="5" strokeLinecap="round" opacity=".85" />
      <path d="M128 206c8 8 17 14 25 20" stroke="#FF9BA5" strokeWidth="3" strokeLinecap="round" opacity=".7" />
      <path d="M121 186c-7-9-15-6-13 2m79 5c8-10 16-6 13 2" fill="none" stroke="#D8A87C" strokeWidth="9" strokeLinecap="round" />
      <path d="M92 181c8 3 15 8 20 15m96-2c6-8 12-12 19-15" stroke="#E2B58C" strokeWidth="3" strokeLinecap="round" opacity=".75" />

      {pose === "rose" && (
        <g className="love-kawaii-rose">
          <path d="M238 121c2-14 8-24 17-34" stroke="#52774D" strokeWidth="3" strokeLinecap="round" />
          <path d="M247 103c-8-8-17-3-12 5-9 2-7 12 2 13 2 8 13 7 15-1 8 2 12-7 5-12 5-8-4-14-10-8 0-7-10-7-11 1-4-6-10-3-8 3" fill="#C62849" stroke="#97213A" strokeWidth="1.5" />
          <path d="M252 106c-4 4-5 9-2 13m-9-11c2 4 5 6 9 7" stroke="#F58992" strokeWidth="1.7" strokeLinecap="round" />
          <path d="m242 119-8-3 3 8m17-26 7-3-3 8" fill="#6F9859" stroke="#52774D" strokeWidth="1.5" strokeLinejoin="round" />
        </g>
      )}
    </svg>
  );
}

function CupidCapybara({ className = "" }: { className?: string }) {
  return <KawaiiCapybara className={className} pose="heart" />;
}

function RoseHugCapybara({ className = "" }: { className?: string }) {
  return <KawaiiCapybara className={className} pose="rose" />;
}

function SignCapybara({ className = "" }: { className?: string }) {
  return <KawaiiCapybara className={className} pose="sign" />;
}

function CapybaraStackIcon() {
  return <KawaiiCapybara className="love-stack-kawaii-capybara" decorative />;
}

function RosePetals() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    if (!canvas || !context) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let frame = 0;
    let width = 0;
    let height = 0;
    let previousFrameTime = 0;
    const petals = Array.from({ length: 42 }, () => ({
      x: Math.random(),
      y: Math.random(),
      size: 3 + Math.random() * 5,
      speed: 0.000012 + Math.random() * 0.000025,
      velocity: 0,
      acceleration: 0.0000005 + Math.random() * 0.0000006,
      sway: Math.random() * Math.PI * 2,
      rotation: Math.random() * Math.PI * 2,
      spin: (Math.random() - 0.5) * 0.025,
      wind: Math.random() * 0.45 + 0.15,
      alpha: 0.3 + Math.random() * 0.42,
    }));

    const resize = () => {
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width * ratio;
      canvas.height = height * ratio;
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
    };

    const draw = (timestamp: number) => {
      const delta = previousFrameTime === 0 ? 16.67 : Math.min(timestamp - previousFrameTime, 40);
      previousFrameTime = timestamp;
      const frameScale = delta / 16.67;
      context.clearRect(0, 0, width, height);
      for (const petal of petals) {
        const x = petal.x * width + Math.sin(petal.sway) * 20;
        const y = petal.y * height;
        context.save();
        context.translate(x, y);
        context.rotate(petal.rotation);
        context.globalAlpha = petal.alpha;
        context.fillStyle = "#b83c55";
        context.beginPath();
        context.ellipse(0, 0, petal.size * 0.68, petal.size, 0, 0, Math.PI * 2);
        context.fill();
        context.restore();

        if (!reducedMotion) {
          petal.velocity = Math.min(petal.velocity + petal.acceleration * frameScale, petal.speed);
          petal.y += petal.velocity * frameScale;
          petal.sway += 0.015 * frameScale * petal.wind;
          petal.x = (petal.x + Math.sin(petal.sway * 0.45) * 0.000025 * frameScale + 1) % 1;
          petal.rotation += petal.spin * frameScale;
          if (petal.y > 1.04) {
            petal.y = -0.04;
            petal.x = Math.random();
            petal.velocity = 0;
          }
        }
      }
      if (!reducedMotion) frame = window.requestAnimationFrame(draw);
    };

    resize();
    draw(performance.now());
    window.addEventListener("resize", resize);
    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return <canvas ref={canvasRef} className="love-petals" aria-hidden="true" />;
}

export function MeganPage() {
  const [letters, setLetters] = useState(starterLetters);
  const [notes, setNotes] = useState<LoveNote[]>([]);
  const [selectedLetter, setSelectedLetter] = useState<LoveLetter | null>(null);
  const [letterComposerOpen, setLetterComposerOpen] = useState(false);
  const [boostIndex, setBoostIndex] = useState(-1);
  const [meganHeight, setMeganHeight] = useState(165);
  const [capyHeight, setCapyHeight] = useState(48);
  const [message, setMessage] = useState("");
  const [letterTitle, setLetterTitle] = useState("");
  const [letterMessage, setLetterMessage] = useState("");
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [storageError, setStorageError] = useState("");
  const [letterError, setLetterError] = useState("");
  const [databaseStatus, setDatabaseStatus] = useState<DatabaseStatus>("checking");
  const [savingLetter, setSavingLetter] = useState(false);
  const [savingNote, setSavingNote] = useState(false);
  const [musicOpen, setMusicOpen] = useState(false);
  const noteInputRef = useRef<HTMLTextAreaElement>(null);
  const letterTitleRef = useRef<HTMLInputElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const letterRequestRef = useRef<{ id: string; title: string; message: string } | null>(null);
  const noteRequestRef = useRef<{ id: string; message: string } | null>(null);
  const musicPanelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const startMusicOnFirstInteraction = (event: Event) => {
      document.removeEventListener("pointerdown", startMusicOnFirstInteraction);
      document.removeEventListener("keydown", startMusicFromKeyboard);
      if (event.target instanceof Element && event.target.closest(".love-sound-button")) return;
      setSoundEnabled(true);
      setMusicOpen(true);
    };
    const startMusicFromKeyboard = (event: KeyboardEvent) => {
      if (
        event.repeat ||
        (event.key !== "Enter" && event.key !== " ") ||
        (event.target instanceof HTMLElement &&
          (event.target.isContentEditable ||
            event.target.matches("input, textarea, select")))
      ) {
        return;
      }
      startMusicOnFirstInteraction(event);
    };

    document.addEventListener("pointerdown", startMusicOnFirstInteraction, { passive: true });
    document.addEventListener("keydown", startMusicFromKeyboard);
    return () => {
      document.removeEventListener("pointerdown", startMusicOnFirstInteraction);
      document.removeEventListener("keydown", startMusicFromKeyboard);
    };
  }, []);

  useEffect(() => {
    let mounted = true;
    const lettersController = new AbortController();
    const notesController = new AbortController();
    const lettersTimeout = window.setTimeout(() => lettersController.abort(), 15_000);
    const notesTimeout = window.setTimeout(() => notesController.abort(), 15_000);

    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed: unknown = JSON.parse(stored);
        if (
          typeof parsed !== "object" ||
          parsed === null ||
          !("notes" in parsed) ||
          !Array.isArray(parsed.notes)
        ) {
          throw new Error("Las notas guardadas no tienen el formato esperado.");
        }
        const savedNotes = parsed.notes.filter(isLoveNote);
        setNotes(savedNotes);
      }
    } catch (error) {
      setStorageError(
        error instanceof Error ? error.message : "No se pudieron leer las notas guardadas.",
      );
    }

    void fetch("/api/love-letters", { cache: "no-store", signal: lettersController.signal })
      .then(async (response) => {
        const payload: unknown = await response.json();
        if (!response.ok) {
          const errorMessage =
            typeof payload === "object" &&
            payload !== null &&
            "error" in payload &&
            typeof payload.error === "string"
              ? payload.error
              : "No se pudieron cargar las cartitas de PostgreSQL.";
          throw new Error(errorMessage);
        }
        if (
          typeof payload !== "object" ||
          payload === null ||
          !("letters" in payload) ||
          !Array.isArray(payload.letters) ||
          !payload.letters.every(isLoveLetter)
        ) {
          throw new Error("La respuesta de PostgreSQL no tiene el formato esperado.");
        }
        if (mounted) {
          setLetters([...starterLetters, ...payload.letters]);
          setDatabaseStatus("connected");
          setLetterError("");
        }
      })
      .catch((error: unknown) => {
        if (mounted) {
          setDatabaseStatus("disconnected");
          setLetterError(
            lettersController.signal.aborted
              ? "Neon tardó demasiado en responder. Tus cartitas iniciales siguen disponibles; puedes reintentar en unos segundos."
              : error instanceof Error
                ? error.message
                : "No se pudo conectar con PostgreSQL.",
          );
        }
      })
      .finally(() => {
        window.clearTimeout(lettersTimeout);
      });

    void fetch("/api/love-notes", { cache: "no-store", signal: notesController.signal })
      .then(async (response) => {
        const payload: unknown = await response.json();
        if (!response.ok) {
          const errorMessage =
            typeof payload === "object" &&
            payload !== null &&
            "error" in payload &&
            typeof payload.error === "string"
              ? payload.error
              : "No se pudieron cargar las notitas de PostgreSQL.";
          throw new Error(errorMessage);
        }
        if (
          typeof payload !== "object" ||
          payload === null ||
          !("notes" in payload) ||
          !Array.isArray(payload.notes) ||
          !payload.notes.every(isLoveNote)
        ) {
          throw new Error("La respuesta de notitas de PostgreSQL no tiene el formato esperado.");
        }
        if (mounted) {
          setNotes(payload.notes);
          setStorageError("");
          setDatabaseStatus("connected");
        }
      })
      .catch((error: unknown) => {
        if (mounted) {
          setDatabaseStatus("disconnected");
          setStorageError(
            notesController.signal.aborted
              ? "Neon tardó demasiado en responder. Tus notas se conservan en el formulario para que puedas intentar de nuevo."
              : error instanceof Error
                ? error.message
                : "No se pudieron cargar las notitas de PostgreSQL.",
          );
        }
      })
      .finally(() => {
        window.clearTimeout(notesTimeout);
      });
    return () => {
      mounted = false;
      window.clearTimeout(lettersTimeout);
      window.clearTimeout(notesTimeout);
      lettersController.abort();
      notesController.abort();
    };
  }, []);

  useEffect(() => {
    if (!selectedLetter && !letterComposerOpen) return;
    if (selectedLetter) closeButtonRef.current?.focus();
    else letterTitleRef.current?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !savingLetter) {
        setSelectedLetter(null);
        setLetterComposerOpen(false);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [selectedLetter, letterComposerOpen, savingLetter]);

  useEffect(() => {
    if (!musicOpen) return;
    const closeOnOutsideClick = (event: PointerEvent) => {
      if (
        event.target instanceof Node &&
        !musicPanelRef.current?.contains(event.target) &&
        !(event.target instanceof Element && event.target.closest(".love-sound-button"))
      ) {
        setMusicOpen(false);
      }
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMusicOpen(false);
      }
    };
    document.addEventListener("pointerdown", closeOnOutsideClick);
    window.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("pointerdown", closeOnOutsideClick);
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [musicOpen]);

  const addMessage = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (savingNote) return;
    const cleanMessage = message.trim();
    if (!cleanMessage) return;
    if (!noteRequestRef.current || noteRequestRef.current.message !== cleanMessage) {
      noteRequestRef.current = { id: crypto.randomUUID(), message: cleanMessage };
    }

    setSavingNote(true);
    setStorageError("");
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 20_000);
    try {
      const response = await fetch("/api/love-notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ requestId: noteRequestRef.current.id, message: cleanMessage }),
        signal: controller.signal,
      });
      const payload: unknown = await response.json();
      if (!response.ok) {
        const errorMessage =
          typeof payload === "object" &&
          payload !== null &&
          "error" in payload &&
          typeof payload.error === "string"
            ? payload.error
            : "No se pudo guardar la notita en PostgreSQL.";
        throw new Error(errorMessage);
      }
      if (
        typeof payload !== "object" ||
        payload === null ||
        !("note" in payload) ||
        !isLoveNote(payload.note)
      ) {
        throw new Error("PostgreSQL devolvió una respuesta inválida al guardar la notita.");
      }
      const savedNote = payload.note;
      const updatedNotes = [savedNote, ...notes.filter((note) => note.id !== savedNote.id)];
      setNotes(updatedNotes);
      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ notes: updatedNotes }));
      } catch (error) {
        setStorageError(
          error instanceof Error
            ? `La notita se guardó en PostgreSQL, pero no se pudo actualizar la copia local: ${error.message}`
            : "La notita se guardó en PostgreSQL, pero no se pudo actualizar la copia local.",
        );
      }
      noteRequestRef.current = null;
      setMessage("");
      setDatabaseStatus("connected");
    } catch (error) {
      setStorageError(
        controller.signal.aborted
          ? "Neon está tardando más de lo esperado. Tu notita sigue escrita; vuelve a intentarlo sin perderla."
          : error instanceof Error
            ? error.message
            : "No se pudo guardar la notita en PostgreSQL.",
      );
    } finally {
      window.clearTimeout(timeout);
      setSavingNote(false);
    }
  };

  const addLetter = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (savingLetter) return;
    const title = letterTitle.trim();
    const content = letterMessage.trim();
    if (!title || !content) return;

    setSavingLetter(true);
    setLetterError("");
    if (
      !letterRequestRef.current ||
      letterRequestRef.current.title !== title ||
      letterRequestRef.current.message !== content
    ) {
      letterRequestRef.current = { id: crypto.randomUUID(), title, message: content };
    }
    const requestId = letterRequestRef.current.id;
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 20_000);
    try {
      const response = await fetch("/api/love-letters", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ requestId, title, message: content }),
        signal: controller.signal,
      });
      const payload: unknown = await response.json();
      if (!response.ok) {
        const errorMessage =
          typeof payload === "object" &&
          payload !== null &&
          "error" in payload &&
          typeof payload.error === "string"
            ? payload.error
            : "No se pudo guardar la cartita en PostgreSQL.";
        throw new Error(errorMessage);
      }
      if (
        typeof payload !== "object" ||
        payload === null ||
        !("letter" in payload) ||
        !isLoveLetter(payload.letter)
      ) {
        throw new Error("PostgreSQL guardó la cartita, pero devolvió una respuesta inválida.");
      }
      const savedLetter = payload.letter;
      setLetters((current) => [...current, savedLetter]);
      setDatabaseStatus("connected");
      setLetterTitle("");
      setLetterMessage("");
      letterRequestRef.current = null;
      setLetterComposerOpen(false);
    } catch (error) {
      setLetterError(
        controller.signal.aborted
          ? "Neon está tardando más de lo esperado. Tu cartita sigue aquí; puedes intentar guardarla de nuevo."
          : error instanceof Error
            ? error.message
            : "No se pudo guardar la cartita en PostgreSQL.",
      );
    } finally {
      window.clearTimeout(timeout);
      setSavingLetter(false);
    }
  };

  const openLetterComposer = () => setLetterComposerOpen(true);

  const scrollToComposer = () => {
    document.getElementById("notas")?.scrollIntoView({ behavior: "smooth" });
    window.setTimeout(() => noteInputRef.current?.focus(), 350);
  };

  const capybaraCount = meganHeight / capyHeight;
  const nearestStack = Math.max(1, Math.round(capybaraCount));
  const hugDifference = Math.abs(meganHeight - nearestStack * capyHeight);
  const currentBoost = boosts[Math.max(0, boostIndex) % boosts.length];

  return (
    <main className="love-page">
      <RosePetals />
      <div className="love-container">
        <header className="love-header flex items-center justify-between gap-4">
          <a className="love-wordmark" href="#inicio" aria-label="Megan, para ti">
            <span className="love-mark"><Heart size={17} fill="currentColor" /></span>
            <span>un rincón para Megan</span>
          </a>
          <div className="love-header-actions">
            <button
              className={`love-db-status love-db-status-button love-db-${databaseStatus}`}
              type="button"
              onClick={openLetterComposer}
              aria-label={`Neon PostgreSQL: ${databaseStatus === "connected" ? "conectada" : databaseStatus === "checking" ? "comprobando conexión" : "sin conexión"}. Añadir cartita`}
              title={letterError || "Haz clic para escribir una cartita que se guardará en PostgreSQL"}
            >
              <span className={`love-status-dot love-status-${databaseStatus}`} />
              <span className="love-db-status-text">
                {databaseStatus === "connected"
                  ? "Neon · Conectada"
                  : databaseStatus === "checking"
                    ? "Conectando Neon…"
                    : "Neon · Sin conexión"}
              </span>
              <Plus className="love-db-add-icon" size={14} />
            </button>
            <button
              className="love-icon-button love-sound-button"
              type="button"
              onClick={() => {
                const next = !soundEnabled;
                setSoundEnabled(next);
                setMusicOpen(next);
              }}
              aria-label={soundEnabled ? "Pausar música de Milo J" : "Reproducir música de Milo J"}
              aria-pressed={soundEnabled}
              title={soundEnabled ? "Silencio: pausar música de Milo J" : "Música activada: reproducir Milo J"}
            >
              {soundEnabled ? <Heart className="love-music-heart" size={17} fill="currentColor" /> : <VolumeX size={17} />}
              <span>{soundEnabled ? "Música activada" : "Silencio"}</span>
            </button>
            {(musicOpen || soundEnabled) && (
              <div
                className={`love-music-panel${musicOpen ? "" : " love-music-panel-background"}`}
                ref={musicPanelRef}
                role="dialog"
                aria-label="Reproductor de Milo J"
                aria-hidden={!musicOpen}
              >
                <div className="love-music-panel-heading">
                  <span className="love-music-art"><Music2 size={18} /></span>
                  <span><strong>MILO J · RARA VEZ</strong><small>Reproductor oficial de YouTube · en bucle</small></span>
                  <button
                    className="love-music-close"
                    type="button"
                    onClick={() => {
                      setMusicOpen(false);
                      setSoundEnabled(false);
                    }}
                    aria-label="Pausar y cerrar reproductor"
                  >
                    <X size={16} />
                  </button>
                </div>
                <iframe
                  src={`https://www.youtube-nocookie.com/embed/${MILO_J_VIDEO_ID}?autoplay=1&loop=1&playlist=${MILO_J_VIDEO_ID}&controls=1&rel=0&playsinline=1`}
                  title="Milo J - Rara Vez (reproductor oficial de YouTube)"
                  allow="autoplay; encrypted-media; picture-in-picture"
                  referrerPolicy="strict-origin-when-cross-origin"
                  allowFullScreen
                />
                <p>Si no inicia, toca reproducir y ajusta el volumen aquí o en tu dispositivo.</p>
              </div>
            )}
            <button className="love-add-button" type="button" onClick={scrollToComposer}>
              <Plus size={16} />
              <span>Dejar una notita</span>
            </button>
          </div>
        </header>

        <section className="love-hero" id="inicio">
          <div className="love-hero-copy">
            <span className="love-kicker"><Sparkles size={14} /> hecha con mucho amor, para ti</span>
            <h1>Hola, Megan<span className="love-title-heart">♥</span><br /><em>mi novia, mi amor.</em></h1>
            <p>
              Soy muy afortunado de ser tu novio. Este rincón es para recordarte cuánto te amo,
              lo hermosa que eres y que siempre tienes mis brazos esperándote.
            </p>
            <a className="love-primary-button" href="#cartitas">
              Hay cartitas para ti <ArrowDown size={16} />
            </a>
            <span className="love-hero-note"><Heart size={13} fill="currentColor" /> tu sonrisa es mi lugar favorito</span>
          </div>
          <div className="love-hero-art" aria-label="Ilustración de una capibara enamorada">
            <div className="love-art-halo" />
            <span className="love-float-heart love-float-heart-one">♥</span>
            <span className="love-float-heart love-float-heart-two">♥</span>
            <span className="love-float-sparkle">✳</span>
            <InteractiveCapybara
              className="love-capybara-hero-moment"
              label="Capibara cupido"
            >
              <CupidCapybara className="love-capybara-hero love-cupid-hero" />
            </InteractiveCapybara>
            <div className="love-capy-caption"><Heart size={14} fill="currentColor" /> capibara oficial de los abrazos</div>
          </div>
          <span className="love-hero-index">001 · un mensaje para ti</span>
        </section>

        <section className="love-letters-section" id="cartitas">
          <div className="love-section-heading">
            <div>
              <span className="love-kicker">abre cuando quieras</span>
              <h2>Unas cartitas <em>para ti</em></h2>
            </div>
            <p>Elige un sobre. Dentro hay un abrazo escondido.</p>
          </div>
          <div className="love-letter-grid">
            {letters.map((letter, index) => (
              <button
                type="button"
                className="love-letter-card"
                key={letter.id}
                onClick={() => {
                  setSelectedLetter(letter);
                }}
              >
                <span className="love-envelope">
                  <span className="love-envelope-back" />
                  <Mail className="love-envelope-icon" size={47} strokeWidth={1.15} />
                  <span className="love-envelope-stamp"><Heart size={11} fill="currentColor" /></span>
                  <span className="love-envelope-letter"><Heart size={22} fill="currentColor" /></span>
                </span>
                <span className="love-letter-copy">
                  <span className="love-letter-number">CARTITA {String(index + 1).padStart(2, "0")}</span>
                  <strong>{letter.title}</strong>
                  <span>{letter.preview}</span>
                  <span className="love-letter-open">abrir sobre <ArrowRight size={13} /></span>
                </span>
              </button>
            ))}
          </div>
        </section>

        <section className="love-height-section">
          <div className="love-height-intro">
            <span className="love-kicker"><Sparkles size={14} /> ciencia capibárica</span>
            <h2>La medida <em>perfecta</em><br />para un abrazo</h2>
            <p>Un experimento muy serio, hecho con capibaras imaginarios y mucho cariño.</p>
            <div className="love-height-illustration">
              <InteractiveCapybara label="Capibara abrazando una rosa">
                <RoseHugCapybara className="love-capybara-small" />
              </InteractiveCapybara>
              <span>equipo de medición oficial</span>
            </div>
          </div>
          <div className="love-height-calculator">
            <div className="love-calculator-top">
              <div><span className="love-kicker">calculadora de abrazos</span><h3>¿Cuántos capibaras mide Megan?</h3></div>
              <span className="love-calculator-icon"><HeartHandshake size={23} /></span>
            </div>
            <label className="love-slider-label" htmlFor="megan-height">
              <span>Estatura de Megan</span><strong>{meganHeight} <small>cm</small></strong>
            </label>
            <input id="megan-height" className="love-slider" type="range" min="140" max="195" value={meganHeight} onChange={(event) => setMeganHeight(Number(event.target.value))} />
            <div className="love-range-labels"><span>140 cm</span><span>195 cm</span></div>
            <label className="love-slider-label love-slider-second" htmlFor="capy-height">
              <span>Estatura del capibara</span><strong>{capyHeight} <small>cm</small></strong>
            </label>
            <input id="capy-height" className="love-slider love-slider-green" type="range" min="30" max="70" value={capyHeight} onChange={(event) => setCapyHeight(Number(event.target.value))} />
            <div className="love-range-labels"><span>30 cm</span><span>70 cm</span></div>
            <div className="love-calculation-result">
              <span className="love-result-label">Megan mide casi</span>
              <strong>{capybaraCount.toFixed(1)} <small>capibaras</small></strong>
              <span className="love-result-detail">
                Nos separan solo <b>{hugDifference} cm</b> de la altura perfecta para mi abrazo.
              </span>
              <div className="love-stack-row" aria-label={`${nearestStack} capibaras apilados`}>
                {Array.from({ length: Math.min(nearestStack, 5) }, (_, index) => (
                  <span className="love-stack-capy" key={index}><CapybaraStackIcon /></span>
                ))}
                {nearestStack > 5 && <span className="love-stack-extra">+{nearestStack - 5}</span>}
                <span className="love-stack-label">apilados con mucho cuidado</span>
              </div>
              <div className="love-calculator-capy" aria-hidden="true">
                <InteractiveCapybara label="Capibara abrazando una rosa">
                  <RoseHugCapybara />
                </InteractiveCapybara>
                <span>abrazos con rosa incluida</span>
              </div>
            </div>
          </div>
        </section>

        <section className="love-dedication-section" aria-labelledby="love-dedication-title">
          <div className="love-dedication-copy">
            <span className="love-kicker"><Heart size={14} fill="currentColor" /> mi persona favorita</span>
            <h2 id="love-dedication-title">Megan, <em>mi todo.</em></h2>
            <p>Qué bonito es caminar por la vida sabiendo que eres mi novia. Te amo por quien eres, por cómo haces más cálidos mis días y por la suerte inmensa de poder llamarte mi amor.</p>
            <span className="love-dedication-signoff">Con todo mi amor, tu novio ♥</span>
          </div>
          <InteractiveCapybara
            className="love-sign-capybara-moment"
            label="Capibara con un letrero para Megan"
          >
            <SignCapybara className="love-sign-capybara" />
          </InteractiveCapybara>
        </section>

        <section className="love-boost-section" aria-labelledby="boost-title">
          <div className="love-boost-card">
            <div className="love-boost-decor love-boost-decor-left">✳</div>
            <span className="love-kicker">un recordatorio para tu corazón</span>
            <h2 id="boost-title">Tu pequeño <em>boost</em> de amor</h2>
            <p className="love-boost-quote" aria-live="polite">
              {boostIndex < 0 ? "Toca el corazón. Hay algo bonito esperándote." : `“${currentBoost.quote}”`}
            </p>
            <button
              type="button"
              className="love-boost-heart"
              aria-label="Dame una frase de amor y motivación"
              onClick={() => {
                setBoostIndex((index) => index + 1);
              }}
            >
              <Heart size={31} fill="currentColor" />
              <span>para ti</span>
            </button>
            <span className="love-boost-mood" aria-live="polite">
              <span className="love-mood-dot" />
              {boostIndex < 0 ? "Capibara cargando cariñitos" : currentBoost.mood}
            </span>
            <div className="love-boost-decor love-boost-decor-right">♡</div>
          </div>
        </section>

        <section className="love-notes-section" id="notas">
          <div className="love-notes-heading">
            <div>
              <span className="love-kicker"><MessageCircleHeart size={14} /> mensajitos que se quedan</span>
              <h2>Un rinconcito <em>nuestro</em></h2>
            </div>
            <button
              className={`love-server-pill love-db-${databaseStatus}`}
              type="button"
              onClick={openLetterComposer}
              aria-label="Añadir una cartita a Neon PostgreSQL"
            >
              <span className={`love-status-dot love-status-${databaseStatus}`} />
              {databaseStatus === "connected"
                ? "PostgreSQL activo · añadir cartita"
                : databaseStatus === "checking"
                  ? "Comprobando PostgreSQL…"
                  : "PostgreSQL sin conexión · ver cartitas"}
            </button>
          </div>
          <div className="love-notes-layout">
            <form className="love-note-form" onSubmit={addMessage}>
              <label htmlFor="love-message">¿Qué te gustaría dejarle a Megan?</label>
              <textarea
                ref={noteInputRef}
                id="love-message"
                maxLength={500}
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                placeholder="Un te quiero, una frase bonita, un abrazo en palabras…"
                required
              />
              <div className="love-form-bottom"><span className="love-local-note"><Check size={12} /> Se guarda en Neon PostgreSQL.</span><span className="love-char-count">{message.length}/500</span></div>
              <button className="love-submit-button" type="submit" disabled={savingNote || !message.trim()}>
                {savingNote ? "Guardando en Neon…" : "Guardar notita"} <Send size={14} />
              </button>
              {storageError && <p className="love-storage-error" role="alert">{storageError}</p>}
            </form>
            <div className="love-note-list">
              <div className="love-note-list-heading">
                <span>LO QUE LE HEMOS DEJADO</span><span>{notes.length} {notes.length === 1 ? "mensajito" : "mensajitos"}</span>
              </div>
              {notes.length === 0 ? (
                <div className="love-empty-notes">
                  <div className="love-empty-icon"><Heart size={21} /></div>
                  <p>Todavía no hay notitas. ¿Le dejamos la primera?</p>
                  <ChevronDown size={16} />
                </div>
              ) : (
                <div className="love-note-items">
                  {notes.map((note) => (
                    <article className="love-note-item" key={note.id}>
                      <span className="love-note-heart"><Heart size={15} fill="currentColor" /></span>
                      <div><span className="love-note-date">una notita · {displayLetterDate(note.date)}</span><p>{note.message}</p></div>
                    </article>
                  ))}
                </div>
              )}
              <div className="love-db-caption">
                <span className="love-db-mini-icon"><Sparkles size={14} /></span>
                <span>
                  <strong>{databaseStatus === "connected" ? "Cartas y notas en PostgreSQL" : databaseStatus === "checking" ? "Conectando con PostgreSQL" : "PostgreSQL no disponible"}</strong><br />
                  {databaseStatus === "connected"
                    ? "Tus cartitas y notitas se guardan en la base de datos y aparecen enseguida."
                    : databaseStatus === "checking"
                      ? "Comprobando la conexión de la base de datos."
                      : "Revisa DATABASE_URL y aplica las migraciones de Prisma para guardar cartitas y notitas."}
                </span>
              </div>
            </div>
          </div>
        </section>

        <footer className="love-footer">
          <span>hecho pensando en ti <Heart size={13} fill="currentColor" /></span>
          <span>para Megan, con todo mi cariño</span>
          <a href="#inicio" aria-label="Volver arriba">volver arriba <ArrowRight size={13} /></a>
        </footer>
      </div>

      {selectedLetter && (
        <div
          className="love-modal-backdrop"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setSelectedLetter(null);
          }}
        >
          <section className="love-letter-modal" role="dialog" aria-modal="true" aria-labelledby="love-modal-title">
            <button
              ref={closeButtonRef}
              className="love-modal-close"
              type="button"
              onClick={() => setSelectedLetter(null)}
              aria-label="Cerrar cartita"
            >
              <X size={19} />
            </button>
            <span className="love-modal-stamp"><Heart size={16} fill="currentColor" /></span>
            <span className="love-kicker">una cartita, solo para ti</span>
            <h2 id="love-modal-title">{selectedLetter.title}</h2>
            <span className="love-modal-date">{displayLetterDate(selectedLetter.date)}</span>
            <div className="love-modal-divider"><span />♥<span /></div>
            <p>{selectedLetter.message}</p>
            <RoseHugCapybara className="love-modal-capybara" />
            <span className="love-modal-signoff">con mucho, mucho cariño <Heart size={13} fill="currentColor" /></span>
          </section>
        </div>
      )}

      {letterComposerOpen && (
        <div
          className="love-modal-backdrop"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && !savingLetter) setLetterComposerOpen(false);
          }}
        >
          <section className="love-letter-modal love-compose-modal" role="dialog" aria-modal="true" aria-labelledby="love-compose-title">
            <button
              className="love-modal-close"
              type="button"
              onClick={() => setLetterComposerOpen(false)}
              aria-label="Cerrar formulario de cartita"
              disabled={savingLetter}
            >
              <X size={19} />
            </button>
            <span className="love-modal-stamp"><Mail size={17} /></span>
            <span className="love-kicker">una carta nueva para Megan</span>
            <h2 id="love-compose-title">Escríbele algo bonito</h2>
            <p className="love-compose-description">
              Se guardará en Neon PostgreSQL y aparecerá en los sobres para abrirla cuando quiera.
            </p>
            <form className="love-compose-form" onSubmit={addLetter}>
              <label htmlFor="love-letter-title">Título de la cartita</label>
              <input
                ref={letterTitleRef}
                id="love-letter-title"
                maxLength={80}
                value={letterTitle}
                onChange={(event) => setLetterTitle(event.target.value)}
                placeholder="Por ejemplo: Para un día especial"
                required
              />
              <label htmlFor="love-letter-message">Tu mensaje para Megan</label>
              <textarea
                id="love-letter-message"
                maxLength={1000}
                value={letterMessage}
                onChange={(event) => setLetterMessage(event.target.value)}
                placeholder="Escribe aquí tu abrazo en palabras…"
                required
              />
              {letterError && <p className="love-storage-error" role="alert">{letterError}</p>}
              <button className="love-submit-button" type="submit" disabled={savingLetter}>
                {savingLetter ? "Guardando en PostgreSQL…" : "Guardar cartita"} <Send size={14} />
              </button>
              <span className="love-compose-footnote"><span className={`love-status-dot love-status-${databaseStatus}`} />{databaseStatus === "connected" ? "Conectada a PostgreSQL" : databaseStatus === "checking" ? "Comprobando la conexión…" : "La conexión se comprobará al guardar"}</span>
            </form>
          </section>
        </div>
      )}
    </main>
  );
}
