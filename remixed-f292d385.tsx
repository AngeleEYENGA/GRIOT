import React, { useState, useMemo, useEffect } from "react";
import {
  Home, UserPlus, LayoutDashboard, GitBranch, User, MapPin, BookOpen,
  Landmark, Palette, ChevronRight, ChevronLeft, Camera, FileText, Mic,
  Plus, Search, Bell, Check, Music, ScrollText, Utensils, Users, ZoomIn,
  ZoomOut, ArrowRight, Sparkles, Globe, Share2, MessageCircle, Video,
  Play, Pause, Clock, Package, Archive, Volume2, Image,
  X, Send, UserCheck
} from "lucide-react";

/* ---------------------------------------------------------
   TOKENS — sampled from the GRIOT mark: cream ground, deep
   bark-brown ink, hand-turned gold, terracotta bead, olive.
--------------------------------------------------------- */
const C = {
  cream: "#F6EFE1",
  paper: "#FFFBF3",
  ink: "#2B1B12",
  inkSoft: "#5B4636",
  gold: "#C9932E",
  goldDeep: "#A9782A",
  terracotta: "#B5502A",
  terracottaDeep: "#8F3E20",
  olive: "#4B5D3B",
  line: "#E3D5B8",
};

const serif = "'Fraunces', 'Georgia', serif";
const sans = "'Work Sans', 'Helvetica Neue', sans-serif";

const FONT_LINK = "https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600;9..144,700&family=Work+Sans:wght@400;500;600;700&display=swap";

/* ---------------------------------------------------------
   MOCK DATA
--------------------------------------------------------- */
const PEOPLE = {
  root: { id: "root", name: "Jean Mvondo", years: "1945 – 2020", village: "Nkolbisson", role: "root" },
  parents: [
    { id: "p1", name: "Paul Mvondo", years: "1918 – 1979", village: "Nkolbisson" },
    { id: "p2", name: "Marie Ateba", years: "1922 – 1988", village: "Mbalmayo" },
  ],
  grandparents: [
    { id: "g1", name: "Amos Mvondo", years: "1889 – 1951", village: "Nkolbisson" },
    { id: "g2", name: "Elise Owona", years: "1893 – 1960", village: "Nkolbisson" },
    { id: "g3", name: "Étienne Ateba", years: "1890 – 1955", village: "Mbalmayo" },
    { id: "g4", name: "Ngo Bella", years: "1895 – 1962", village: "Mbalmayo" },
    { id: "g5", name: "Joseph Ateba", years: "1887 – 1949", village: "Mbalmayo" },
  ],
  children: [
    { id: "c1", name: "Marie Mvondo", years: "1970 –", village: "Yaoundé" },
    { id: "c2", name: "Paul Mvondo Jr.", years: "1972 –", village: "Douala" },
    { id: "c3", name: "Sylvie Mvondo", years: "1975 –", village: "Yaoundé" },
    { id: "c4", name: "André Mvondo", years: "1978 –", village: "Libreville" },
    { id: "c5", name: "Christine Mvondo", years: "1981 –", village: "Yaoundé" },
  ],
};

const SCREENS = [
  { id: "accueil", label: "Accueil", icon: Home, frame: "phone" },
  { id: "compte", label: "Créer un compte", icon: UserPlus, frame: "phone" },
  { id: "dashboard", label: "Tableau de bord", icon: LayoutDashboard, frame: "phone" },
  { id: "arbre", label: "Arbre généalogique", icon: GitBranch, frame: "phone" },
  { id: "fiche", label: "Fiche personne", icon: User, frame: "phone" },
  { id: "carte", label: "Carte des origines", icon: MapPin, frame: "phone" },
  { id: "memoire", label: "Mémoire familiale", icon: BookOpen, frame: "phone" },
  { id: "chefferie", label: "Espace chefferie", icon: Landmark, frame: "desktop" },
  { id: "style", label: "Charte graphique", icon: Palette, frame: "panel" },
];

const PLATFORM_STATS = [
  { value: "15 000", label: "familles" },
  { value: "280 000", label: "personnes" },
  { value: "12", label: "pays" },
  { value: "320", label: "traditions sauvegardées" },
];

const SEARCH_RESULTS = [
  { name: "Famille Mvondo", members: 128, country: "Cameroun", public: true },
  { name: "Famille Mvondo de Libreville", members: 34, country: "Gabon", public: true },
  { name: "Branche Mvondo-Essomba", members: 67, country: "Cameroun", public: true },
  { name: "Famille Mvondo-Ngono", members: 19, country: "Congo", public: true },
];

const STORIES = [
  {
    id: 1, title: "Le grand manguier de Nkolbisson", author: "Sylvie Mvondo",
    duration: "4:32", category: "Histoire", plays: 48,
    excerpt: "Chaque dimanche, grand-père Jean rassemblait toute la famille sous l'arbre sacré...",
    comments: 6, verified: "famille",
  },
  {
    id: 2, title: "La migration vers le Gabon", author: "Paul Mvondo Jr.",
    duration: "7:15", category: "Migration", plays: 31,
    excerpt: "En 1962, trois frères partirent à pied vers Libreville, portant seulement leurs souvenirs...",
    comments: 12, verified: "chefferie",
  },
  {
    id: 3, title: "Proverbes des ancêtres Ewondo", author: "Marie Ateba",
    duration: "2:48", category: "Proverbes", plays: 89,
    excerpt: "« Celui qui ne connaît pas son passé ne peut comprendre son avenir. »",
    comments: 4, verified: "archive",
  },
];

const AI_SUGGESTIONS = [
  "Qui était mon arrière-grand-père ?",
  "Résume-moi cette branche.",
  "Trouve les cousins installés au Gabon.",
  "Quels sont les proverbes liés à mon ethnie ?",
  "Explique les migrations de ma famille.",
];

const COLLABORATORS = [
  { name: "Marie Mvondo", role: "Cousine", status: "active", avatar: "M" },
  { name: "Tante Antoinette", role: "Tante", status: "active", avatar: "A" },
  { name: "Chefferie Nkolbisson", role: "Institution", status: "pending", avatar: "C" },
  { name: "Dr. Njoya", role: "Historien", status: "invited", avatar: "N" },
];

const ANCESTOR_NAMES = ["Amos Mvondo", "Elise Owona", "Étienne Ateba", "Ngo Bella", "Joseph Ateba", "Paul Mvondo", "Marie Ateba"];

/* ---------------------------------------------------------
   ANIMATIONS CSS
--------------------------------------------------------- */
const ANIM_STYLES = `
@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
@keyframes fadeInUp { from { opacity: 0; transform: translateY(24px); } to { opacity: 1; transform: translateY(0); } }
@keyframes zoomIn { from { opacity: 0; transform: scale(0.3); } to { opacity: 1; transform: scale(1); } }
@keyframes treeGrow { from { transform: scaleY(0); opacity: 0; } to { transform: scaleY(1); opacity: 1; } }
@keyframes pulseGlow { 0%, 100% { opacity: 0.4; } 50% { opacity: 1; } }
@keyframes ancestorAppear { from { opacity: 0; transform: scale(0); } to { opacity: 1; transform: scale(1); } }
@keyframes countUp { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
@keyframes shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }
`;

/* ---------------------------------------------------------
   SMALL UI ATOMS
--------------------------------------------------------- */
function VerifiedBadge({ type }) {
  const config = {
    famille: { label: "Vérifié par la famille", color: C.olive, icon: UserCheck },
    chefferie: { label: "Vérifié par une chefferie", color: C.gold, icon: Landmark },
    archive: { label: "Vérifié par archive", color: C.terracotta, icon: Archive },
  };
  const c = config[type] || config.famille;
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 4,
      fontFamily: sans, fontSize: 10, fontWeight: 700, color: c.color,
      background: `${c.color}15`, borderRadius: 999, padding: "4px 8px",
    }}>
      <c.icon size={11} /> {c.label}
    </span>
  );
}

function GriotAIButton({ onClick, compact }) {
  return (
    <button onClick={onClick} style={{
      display: "inline-flex", alignItems: "center", gap: 6,
      fontFamily: sans, fontSize: compact ? 11 : 12.5, fontWeight: 700,
      color: C.goldDeep, background: `linear-gradient(135deg, ${C.gold}22, ${C.terracotta}15)`,
      border: `1.5px solid ${C.gold}`, borderRadius: 999,
      padding: compact ? "6px 12px" : "9px 16px", cursor: "pointer",
    }}>
      <Sparkles size={compact ? 13 : 15} /> Demander à GRIOT
    </button>
  );
}

function GlobalSearchBar({ value, onChange, onFocus, placeholder }) {
  return (
    <div style={{ position: "relative" }}>
      <Search size={15} color={C.inkSoft} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)" }} />
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={onFocus}
        placeholder={placeholder || "Rechercher une famille, un nom, un village..."}
        style={{
          width: "100%", fontFamily: sans, fontSize: 13, color: C.ink,
          padding: "11px 12px 11px 36px", borderRadius: 12,
          border: `1px solid ${C.line}`, background: C.paper, outline: "none",
          boxSizing: "border-box",
        }}
      />
      <Globe size={14} color={C.inkSoft} style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)" }} />
    </div>
  );
}

function GriotAIPanel({ onClose }) {
  const [query, setQuery] = useState("");
  const [response, setResponse] = useState(null);
  const ask = (q) => {
    setQuery(q);
    setResponse("D'après votre arbre, votre arrière-grand-père Amos Mvondo (1889–1951) était cultivateur à Nkolbisson. Il est mentionné dans les archives de la chefferie et dans 3 témoignages audio de la famille.");
  };
  return (
    <div style={{
      position: "absolute", inset: 0, background: "rgba(43,27,18,0.55)", zIndex: 50,
      display: "flex", alignItems: "flex-end", animation: "fadeIn 0.3s ease",
    }} onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} style={{
        width: "100%", background: C.paper, borderRadius: "20px 20px 0 0",
        padding: "20px 20px 28px", maxHeight: "85%", overflow: "auto",
        animation: "fadeInUp 0.35s ease",
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Sparkles size={18} color={C.gold} />
            <span style={{ fontFamily: serif, fontSize: 17, fontWeight: 700, color: C.ink }}>Assistant GRIOT</span>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer" }}><X size={18} color={C.inkSoft} /></button>
        </div>
        <div style={{ fontFamily: sans, fontSize: 12.5, color: C.inkSoft, marginBottom: 14, lineHeight: 1.5 }}>
          Votre assistant généalogique intelligent. Posez une question sur votre histoire familiale.
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 16 }}>
          {AI_SUGGESTIONS.map((s) => (
            <button key={s} onClick={() => ask(s)} style={{
              fontFamily: sans, fontSize: 11, fontWeight: 600, color: C.ink,
              background: C.cream, border: `1px solid ${C.line}`, borderRadius: 999,
              padding: "7px 12px", cursor: "pointer", textAlign: "left",
            }}>{s}</button>
          ))}
        </div>
        <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Posez votre question..."
            style={{ flex: 1, fontFamily: sans, fontSize: 13, padding: "11px 13px", borderRadius: 10, border: `1px solid ${C.line}`, background: C.cream, outline: "none" }} />
          <button onClick={() => query && ask(query)} style={{ ...btnPrimary, padding: "11px 16px", borderRadius: 10 }}><Send size={15} /></button>
        </div>
        {response && (
          <div style={{
            fontFamily: sans, fontSize: 13, color: C.ink, lineHeight: 1.6,
            background: C.cream, borderRadius: 12, padding: "14px 16px",
            borderLeft: `3px solid ${C.gold}`, animation: "fadeInUp 0.4s ease",
          }}>{response}</div>
        )}
      </div>
    </div>
  );
}

function SearchResultsPanel({ query, onClose, onSelect }) {
  const results = query.length > 1 ? SEARCH_RESULTS.filter((r) => r.name.toLowerCase().includes(query.toLowerCase())) : [];
  return (
    <div style={{
      position: "absolute", inset: 0, background: "rgba(43,27,18,0.45)", zIndex: 50,
      display: "flex", alignItems: "flex-start", paddingTop: 60, animation: "fadeIn 0.25s ease",
    }} onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} style={{
        width: "100%", margin: "0 16px", background: C.paper, borderRadius: 14,
        padding: "14px 16px", maxHeight: 380, overflow: "auto", animation: "fadeInUp 0.3s ease",
      }}>
        <div style={{ fontFamily: sans, fontSize: 11, fontWeight: 700, color: C.inkSoft, letterSpacing: 0.5, marginBottom: 10 }}>
          RECHERCHE MONDIALE · {results.length} branche{results.length > 1 ? "s" : ""} publique{results.length > 1 ? "s" : ""}
        </div>
        {results.length === 0 ? (
          <div style={{ fontFamily: sans, fontSize: 13, color: C.inkSoft, padding: "20px 0", textAlign: "center" }}>
            Tapez un nom de famille pour explorer les branches publiques
          </div>
        ) : results.map((r) => (
          <div key={r.name} onClick={() => onSelect && onSelect(r)} style={{
            display: "flex", alignItems: "center", gap: 12, padding: "12px 0",
            borderBottom: `1px solid ${C.line}`, cursor: "pointer",
          }}>
            <div style={{
              width: 40, height: 40, borderRadius: 10, background: C.gold,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontFamily: serif, fontWeight: 700, fontSize: 14, color: C.paper,
            }}>{r.name.split(" ")[1]?.[0] || "M"}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: serif, fontSize: 14, fontWeight: 600, color: C.ink }}>{r.name}</div>
              <div style={{ fontFamily: sans, fontSize: 11.5, color: C.inkSoft }}>{r.members} personnes · {r.country}</div>
            </div>
            <ChevronRight size={16} color={C.inkSoft} />
          </div>
        ))}
      </div>
    </div>
  );
}
function Pill({ children, active, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        fontFamily: sans,
        fontSize: 12.5,
        fontWeight: 600,
        letterSpacing: 0.2,
        padding: "7px 14px",
        borderRadius: 999,
        border: `1px solid ${active ? C.ink : C.line}`,
        background: active ? C.ink : "transparent",
        color: active ? C.paper : C.inkSoft,
        whiteSpace: "nowrap",
        cursor: "pointer",
      }}
    >
      {children}
    </button>
  );
}

function Avatar({ initials, size = 44, tone = C.gold, ring = true }) {
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        background: `linear-gradient(155deg, ${tone}, ${C.terracottaDeep})`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: C.paper,
        fontFamily: serif,
        fontWeight: 600,
        fontSize: size * 0.34,
        border: ring ? `2px solid ${C.paper}` : "none",
        boxShadow: "0 2px 6px rgba(43,27,18,0.25)",
        flexShrink: 0,
      }}
    >
      {initials}
    </div>
  );
}

function ScreenHeader({ title, subtitle, onBack }) {
  return (
    <div style={{ padding: "18px 20px 10px", display: "flex", alignItems: "center", gap: 10 }}>
      {onBack && (
        <button onClick={onBack} style={{ background: "none", border: "none", cursor: "pointer", color: C.ink, padding: 0 }}>
          <ChevronLeft size={20} />
        </button>
      )}
      <div>
        <div style={{ fontFamily: serif, fontSize: 19, fontWeight: 600, color: C.ink }}>{title}</div>
        {subtitle && <div style={{ fontFamily: sans, fontSize: 12.5, color: C.inkSoft, marginTop: 1 }}>{subtitle}</div>}
      </div>
    </div>
  );
}

function BottomNav({ active, onNav }) {
  const items = [
    { id: "dashboard", icon: LayoutDashboard, label: "Accueil" },
    { id: "arbre", icon: GitBranch, label: "Arbre" },
    { id: "carte", icon: MapPin, label: "Carte" },
    { id: "memoire", icon: BookOpen, label: "Mémoire" },
  ];
  return (
    <div style={{
      display: "flex", justifyContent: "space-around", alignItems: "center",
      padding: "10px 6px 14px", borderTop: `1px solid ${C.line}`, background: C.paper,
    }}>
      {items.map((it) => {
        const isActive = active === it.id;
        return (
          <button key={it.id} onClick={() => onNav(it.id)} style={{
            background: "none", border: "none", cursor: "pointer",
            display: "flex", flexDirection: "column", alignItems: "center", gap: 3,
            color: isActive ? C.terracotta : C.inkSoft,
          }}>
            <it.icon size={19} strokeWidth={isActive ? 2.4 : 1.8} />
            <span style={{ fontFamily: sans, fontSize: 10, fontWeight: isActive ? 700 : 500 }}>{it.label}</span>
          </button>
        );
      })}
    </div>
  );
}

/* ---------------------------------------------------------
   1. ACCUEIL — moment "Waouh" + stats + positionnement
--------------------------------------------------------- */
function AccueilScreen({ go }) {
  const [phase, setPhase] = useState("intro");
  const [visibleAncestors, setVisibleAncestors] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [showAI, setShowAI] = useState(false);

  useEffect(() => {
    if (phase === "intro") {
      const t = setTimeout(() => setPhase("zoom"), 2200);
      return () => clearTimeout(t);
    }
    if (phase === "zoom") {
      const timers = ANCESTOR_NAMES.map((_, i) =>
        setTimeout(() => setVisibleAncestors(i + 1), 400 + i * 350)
      );
      const t = setTimeout(() => setPhase("tree"), 400 + ANCESTOR_NAMES.length * 350 + 800);
      return () => { timers.forEach(clearTimeout); clearTimeout(t); };
    }
    if (phase === "tree") {
      const t = setTimeout(() => setPhase("main"), 2800);
      return () => clearTimeout(t);
    }
  }, [phase]);

  if (phase !== "main") {
    return (
      <div style={{ height: "100%", display: "flex", flexDirection: "column", background: C.ink, position: "relative", overflow: "hidden" }}>
        {phase === "intro" && (
          <div style={{
            flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: 32,
            animation: "fadeIn 1.2s ease",
          }}>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontFamily: serif, fontSize: 26, fontWeight: 600, color: C.gold, marginBottom: 12, animation: "fadeInUp 1s ease" }}>
                Découvrez votre histoire.
              </div>
              <div style={{ fontFamily: sans, fontSize: 13, color: "rgba(246,239,225,0.6)", animation: "fadeInUp 1.2s ease" }}>
                La mémoire numérique des peuples africains
              </div>
            </div>
          </div>
        )}

        {phase === "zoom" && (
          <div style={{ flex: 1, position: "relative", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div style={{
              position: "absolute", width: 200, height: 200, borderRadius: "50%",
              border: `1px solid ${C.gold}44`, animation: "pulseGlow 2s infinite",
            }} />
            <div style={{
              position: "absolute", width: 320, height: 320, borderRadius: "50%",
              border: `1px solid ${C.gold}22`, animation: "pulseGlow 2.5s infinite",
            }} />
            {ANCESTOR_NAMES.slice(0, visibleAncestors).map((name, i) => {
              const angle = (i / ANCESTOR_NAMES.length) * Math.PI * 2 - Math.PI / 2;
              const r = 100 + (i % 3) * 30;
              const x = Math.cos(angle) * r;
              const y = Math.sin(angle) * r;
              return (
                <div key={name} style={{
                  position: "absolute", left: `calc(50% + ${x}px)`, top: `calc(50% + ${y}px)`,
                  transform: "translate(-50%, -50%)", textAlign: "center",
                  animation: "ancestorAppear 0.6s ease",
                }}>
                  <div style={{
                    width: 10, height: 10, borderRadius: "50%", background: C.gold,
                    margin: "0 auto 6px", boxShadow: `0 0 12px ${C.gold}`,
                  }} />
                  <div style={{ fontFamily: sans, fontSize: 9, color: C.gold, fontWeight: 600, whiteSpace: "nowrap" }}>{name}</div>
                </div>
              );
            })}
            <div style={{ fontFamily: serif, fontSize: 14, color: "rgba(246,239,225,0.5)", position: "absolute", bottom: 60, animation: "fadeIn 1s ease" }}>
              Vos ancêtres apparaissent...
            </div>
          </div>
        )}

        {phase === "tree" && (
          <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
            <div style={{ animation: "zoomIn 2s ease", transformOrigin: "center bottom" }}>
              <TreeMotif size={180} />
            </div>
            <div style={{ fontFamily: serif, fontSize: 15, color: C.gold, marginTop: 20, animation: "fadeInUp 1.5s ease" }}>
              Votre arbre prend vie
            </div>
          </div>
        )}

        <button onClick={() => setPhase("main")} style={{
          position: "absolute", bottom: 24, right: 24, background: "none", border: "none",
          fontFamily: sans, fontSize: 12, color: "rgba(246,239,225,0.5)", cursor: "pointer",
        }}>Passer →</button>
      </div>
    );
  }

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", background: C.cream, position: "relative" }}>
      {showAI && <GriotAIPanel onClose={() => setShowAI(false)} />}
      {showSearch && <SearchResultsPanel query={searchQuery} onClose={() => setShowSearch(false)} />}

      <div style={{ padding: "16px 20px 0" }}>
        <GlobalSearchBar value={searchQuery} onChange={setSearchQuery} onFocus={() => setShowSearch(true)} placeholder="Mvondo, un village, une ethnie..." />
      </div>

      <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "20px 28px 0" }}>
        <div style={{ animation: "fadeInUp 0.8s ease" }}><TreeMotif size={130} /></div>
        <div style={{ fontFamily: serif, fontSize: 34, fontWeight: 700, color: C.ink, letterSpacing: 1, marginTop: 10, animation: "fadeInUp 0.9s ease" }}>GRIOT</div>
        <div style={{ fontFamily: serif, fontStyle: "italic", fontSize: 14, color: C.terracottaDeep, textAlign: "center", marginTop: 10, lineHeight: 1.5, animation: "fadeInUp 1s ease" }}>
          La mémoire numérique<br />des peuples africains
        </div>
        <div style={{ fontFamily: sans, fontSize: 11.5, color: C.inkSoft, textAlign: "center", marginTop: 8, maxWidth: 260, lineHeight: 1.4 }}>
          Pas un concurrent de MyHeritage.<br />Une ambition : préserver ce qui ne s'écrit pas toujours.
        </div>
      </div>

      <div style={{ padding: "12px 24px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
        {PLATFORM_STATS.map((s, i) => (
          <div key={s.label} style={{
            textAlign: "center", padding: "10px 6px", background: C.paper,
            borderRadius: 10, border: `1px solid ${C.line}`,
            animation: `countUp 0.5s ease ${i * 0.1}s both`,
          }}>
            <div style={{ fontFamily: serif, fontSize: 18, fontWeight: 700, color: C.terracottaDeep }}>{s.value}</div>
            <div style={{ fontFamily: sans, fontSize: 10, color: C.inkSoft, fontWeight: 600 }}>{s.label}</div>
          </div>
        ))}
      </div>

      <div style={{ padding: "0 24px 20px", display: "flex", flexDirection: "column", gap: 9 }}>
        <button onClick={() => go("compte")} style={btnPrimary}>Créer mon arbre</button>
        <button onClick={() => go("memoire")} style={btnGhost}>Explorer les histoires</button>
        <button onClick={() => go("dashboard")} style={{ ...btnGhost, border: "none", color: C.inkSoft }}>Se connecter</button>
        <div style={{ display: "flex", justifyContent: "center", marginTop: 4 }}>
          <GriotAIButton onClick={() => setShowAI(true)} compact />
        </div>
      </div>
    </div>
  );
}

function TreeMotif({ size = 120 }) {
  // echoes the GRIOT mark: a trunk with gold ancestor beads above, terracotta descendant beads below
  const topAngles = [-58, -30, 0, 30, 58];
  const botAngles = [-58, -30, 0, 30, 58];
  const R = size * 0.42;
  return (
    <svg width={size} height={size * 1.3} viewBox="0 0 100 130">
      <line x1="50" y1="38" x2="50" y2="92" stroke={C.ink} strokeWidth="3" />
      {topAngles.map((a, i) => {
        const rad = (a * Math.PI) / 180;
        const x = 50 + Math.sin(rad) * 32;
        const y = 38 - Math.cos(rad) * 30;
        return <g key={"t" + i}>
          <line x1="50" y1="38" x2={x} y2={y} stroke={C.ink} strokeWidth="2.5" />
          <circle cx={x} cy={y} r={i === 2 ? 8 : 6.5} fill={C.gold} stroke={C.ink} strokeWidth="2" />
        </g>;
      })}
      {botAngles.map((a, i) => {
        const rad = (a * Math.PI) / 180;
        const x = 50 + Math.sin(rad) * 32;
        const y = 92 + Math.cos(rad) * 30;
        return <g key={"b" + i}>
          <line x1="50" y1="92" x2={x} y2={y} stroke={C.ink} strokeWidth="2.5" />
          <circle cx={x} cy={y} r={i === 2 ? 8 : 6.5} fill={C.terracotta} stroke={C.ink} strokeWidth="2" />
        </g>;
      })}
    </svg>
  );
}

const btnPrimary = {
  fontFamily: sans, fontWeight: 700, fontSize: 14.5, color: C.paper,
  background: C.ink, border: "none", borderRadius: 12, padding: "14px 0", cursor: "pointer",
};
const btnGhost = {
  fontFamily: sans, fontWeight: 600, fontSize: 14, color: C.ink,
  background: "transparent", border: `1.5px solid ${C.ink}`, borderRadius: 12, padding: "13px 0", cursor: "pointer",
};

/* ---------------------------------------------------------
   2. CRÉATION DE COMPTE
--------------------------------------------------------- */
function CompteScreen({ go }) {
  const [step, setStep] = useState(1);
  const fields = {
    1: [["Nom", "Mvondo"], ["Prénom", "Jean"], ["Date de naissance", "12/04/1978"], ["Pays", "Cameroun"]],
    2: [["Village d'origine", "Nkolbisson"], ["Ethnie (optionnelle)", ""], ["Langue familiale", "Ewondo"], ["Région", "Centre"]],
  };
  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", background: C.paper }}>
      <ScreenHeader title="Créer mon compte" subtitle={`Étape ${step} sur 3`} onBack={() => go("accueil")} />
      <div style={{ padding: "0 20px", display: "flex", gap: 6, marginBottom: 6 }}>
        {[1, 2, 3].map((s) => (
          <div key={s} style={{ height: 4, flex: 1, borderRadius: 4, background: s <= step ? C.terracotta : C.line }} />
        ))}
      </div>
      <div style={{ flex: 1, overflow: "auto", padding: "16px 20px" }}>
        {step < 3 ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {fields[step].map(([label, val]) => (
              <label key={label} style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <span style={{ fontFamily: sans, fontSize: 12, fontWeight: 600, color: C.inkSoft }}>{label}</span>
                <input defaultValue={val} style={{
                  fontFamily: sans, fontSize: 14.5, color: C.ink, padding: "12px 13px",
                  borderRadius: 10, border: `1px solid ${C.line}`, background: C.cream, outline: "none",
                }} />
              </label>
            ))}
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", paddingTop: 20, gap: 12 }}>
            <div style={{
              width: 64, height: 64, borderRadius: "50%", border: `2px dashed ${C.gold}`,
              display: "flex", alignItems: "center", justifyContent: "center", color: C.goldDeep,
            }}><Plus size={24} /></div>
            <div style={{ fontFamily: serif, fontSize: 17, fontWeight: 600, color: C.ink }}>Ajouter un premier parent</div>
            <div style={{ fontFamily: sans, fontSize: 13, color: C.inkSoft, maxWidth: 240 }}>
              Le point de départ de votre arbre. Vous pourrez ajouter le reste de la famille ensuite.
            </div>
          </div>
        )}
      </div>
      <div style={{ padding: "10px 20px 26px" }}>
        <button
          style={btnPrimary}
          onClick={() => (step < 3 ? setStep(step + 1) : go("dashboard"))}
        >
          {step < 3 ? "Continuer" : "Terminer l'inscription"}
        </button>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------
   3. TABLEAU DE BORD
--------------------------------------------------------- */
function DashboardScreen({ go }) {
  const [showAI, setShowAI] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);

  const actions = [
    { icon: Plus, label: "Ajouter une personne", target: "arbre" },
    { icon: Mic, label: "Raconter une histoire", target: "memoire" },
    { icon: FileText, label: "Ajouter un document", target: "fiche" },
  ];
  const activity = [
    { who: "Marie", what: "a ajouté une photo", when: "il y a 2 h" },
    { who: "Paul", what: "a complété une naissance", when: "hier" },
    { who: "Sylvie", what: "a raconté un souvenir", when: "il y a 3 jours" },
    { who: "Dr. Njoya", what: "a rejoint l'arbre", when: "il y a 5 jours" },
  ];
  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", background: C.cream, position: "relative" }}>
      {showAI && <GriotAIPanel onClose={() => setShowAI(false)} />}
      {showSearch && <SearchResultsPanel query={searchQuery} onClose={() => setShowSearch(false)} />}

      <div style={{ padding: "16px 20px 6px" }}>
        <GlobalSearchBar value={searchQuery} onChange={setSearchQuery} onFocus={() => setShowSearch(true)} />
      </div>

      <div style={{ padding: "8px 20px 4px", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <div style={{ fontFamily: serif, fontSize: 15, fontStyle: "italic", color: C.terracottaDeep, marginBottom: 2 }}>
            Votre histoire continue.
          </div>
          <div style={{ fontFamily: sans, fontSize: 12.5, color: C.inkSoft }}>Bienvenue chez vous,</div>
          <div style={{ fontFamily: serif, fontSize: 22, fontWeight: 700, color: C.ink }}>Jean 👋</div>
        </div>
        <Bell size={19} color={C.inkSoft} />
      </div>

      <div style={{ flex: 1, overflow: "auto", padding: "8px 20px 0" }}>
        <div onClick={() => go("arbre")} style={{
          background: `linear-gradient(135deg, ${C.ink}, #40291B)`, borderRadius: 16, padding: "18px 18px",
          color: C.paper, cursor: "pointer", marginBottom: 14, position: "relative", overflow: "hidden",
        }}>
          <div style={{ fontFamily: sans, fontSize: 11.5, opacity: 0.75, marginBottom: 4 }}>VOTRE ARBRE</div>
          <div style={{ fontFamily: serif, fontSize: 19, fontWeight: 600, marginBottom: 4 }}>128 personnes</div>
          <VerifiedBadge type="famille" />
          <div style={{ display: "inline-flex", alignItems: "center", gap: 5, fontFamily: sans, fontSize: 12.5, fontWeight: 600, color: C.gold, marginTop: 10 }}>
            Voir mon arbre <ArrowRight size={13} />
          </div>
          <div style={{ position: "absolute", right: -10, top: -10, opacity: 0.5 }}><TreeMotif size={70} /></div>
        </div>

        <div style={{ display: "flex", gap: 10, marginBottom: 14 }}>
          <div style={{ flex: 1, background: C.paper, borderRadius: 12, padding: "12px 14px", border: `1px solid ${C.line}` }}>
            <div style={{ fontFamily: sans, fontSize: 11, color: C.inkSoft, marginBottom: 3 }}>ORIGINES</div>
            <div style={{ fontFamily: serif, fontSize: 14.5, color: C.ink, fontWeight: 600 }}>Cameroun 🇨🇲</div>
            <div style={{ fontFamily: sans, fontSize: 12, color: C.inkSoft }}>Région du Mbam</div>
          </div>
          <div style={{ flex: 1, background: C.paper, borderRadius: 12, padding: "12px 14px", border: `1px solid ${C.line}` }}>
            <div style={{ fontFamily: sans, fontSize: 11, color: C.inkSoft, marginBottom: 3 }}>COLLABORATION</div>
            <div style={{ fontFamily: serif, fontSize: 14.5, color: C.ink, fontWeight: 600 }}>4 contributeurs</div>
            <div style={{ fontFamily: sans, fontSize: 12, color: C.olive, fontWeight: 600 }}>2 en attente</div>
          </div>
        </div>

        <div style={{ marginBottom: 14 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
            <div style={{ fontFamily: sans, fontSize: 11.5, fontWeight: 700, color: C.inkSoft, letterSpacing: 0.5 }}>COLLABORATEURS</div>
            <button style={{ fontFamily: sans, fontSize: 11, fontWeight: 700, color: C.terracotta, background: "none", border: "none", cursor: "pointer" }}>+ Inviter</button>
          </div>
          <div style={{ display: "flex", gap: 8, overflow: "auto", paddingBottom: 4 }}>
            {COLLABORATORS.map((c) => (
              <div key={c.name} style={{
                flexShrink: 0, display: "flex", flexDirection: "column", alignItems: "center", gap: 4,
                background: C.paper, border: `1px solid ${C.line}`, borderRadius: 12, padding: "10px 12px", minWidth: 72,
              }}>
                <Avatar initials={c.avatar} size={32} tone={c.status === "active" ? C.olive : C.gold} />
                <div style={{ fontFamily: sans, fontSize: 9.5, fontWeight: 600, color: C.ink, textAlign: "center", lineHeight: 1.2 }}>{c.name.split(" ")[0]}</div>
                <div style={{ fontFamily: sans, fontSize: 8.5, color: C.inkSoft }}>{c.role}</div>
                {c.status !== "active" && (
                  <span style={{ fontFamily: sans, fontSize: 8, fontWeight: 700, color: C.gold, background: `${C.gold}18`, borderRadius: 999, padding: "2px 6px" }}>
                    {c.status === "pending" ? "En attente" : "Invité"}
                  </span>
                )}
              </div>
            ))}
            <button style={{
              flexShrink: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 4,
              background: "transparent", border: `1.5px dashed ${C.line}`, borderRadius: 12, padding: "10px 12px",
              minWidth: 72, cursor: "pointer", color: C.inkSoft,
            }}>
              <UserPlus size={18} />
              <span style={{ fontFamily: sans, fontSize: 9, fontWeight: 600 }}>Inviter</span>
            </button>
          </div>
          <div style={{ display: "flex", gap: 6, marginTop: 8, flexWrap: "wrap" }}>
            {["Un cousin", "Une tante", "Une chefferie", "Un historien"].map((label) => (
              <span key={label} style={{
                fontFamily: sans, fontSize: 10, fontWeight: 600, color: C.inkSoft,
                background: C.cream, border: `1px solid ${C.line}`, borderRadius: 999, padding: "5px 10px",
              }}>+ {label}</span>
            ))}
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "center", marginBottom: 14 }}>
          <GriotAIButton onClick={() => setShowAI(true)} />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 18 }}>
          {actions.map((a) => (
            <button key={a.label} onClick={() => go(a.target)} style={{
              display: "flex", flexDirection: "column", alignItems: "center", gap: 6,
              background: C.paper, border: `1px solid ${C.line}`, borderRadius: 12, padding: "12px 6px", cursor: "pointer",
            }}>
              <a.icon size={17} color={C.terracottaDeep} />
              <span style={{ fontFamily: sans, fontSize: 10.5, fontWeight: 600, color: C.ink, textAlign: "center", lineHeight: 1.2 }}>{a.label}</span>
            </button>
          ))}
        </div>

        <div style={{ fontFamily: sans, fontSize: 11.5, fontWeight: 700, color: C.inkSoft, letterSpacing: 0.5, marginBottom: 8 }}>ACTIVITÉS RÉCENTES</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10, paddingBottom: 10 }}>
          {activity.map((a, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <Avatar initials={a.who[0]} size={32} tone={i % 2 ? C.olive : C.gold} />
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: sans, fontSize: 12.5, color: C.ink }}><b>{a.who}</b> {a.what}</div>
                <div style={{ fontFamily: sans, fontSize: 10.5, color: C.inkSoft }}>{a.when}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <BottomNav active="dashboard" onNav={go} />
    </div>
  );
}

/* ---------------------------------------------------------
   4. ARBRE GÉNÉALOGIQUE
--------------------------------------------------------- */
function ArbreScreen({ go, onSelectPerson }) {
  const [filter, setFilter] = useState("branche");
  const [showAI, setShowAI] = useState(false);
  const showAsc = filter !== "descendants";
  const showDesc = filter !== "ascendants";

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", background: C.cream, position: "relative" }}>
      {showAI && <GriotAIPanel onClose={() => setShowAI(false)} />}
      <ScreenHeader title="Arbre généalogique" subtitle="128 personnes · 4 générations" onBack={() => go("dashboard")} />
      <div style={{ padding: "0 20px 6px", display: "flex", justifyContent: "center" }}>
        <GriotAIButton onClick={() => setShowAI(true)} compact />
      </div>
      <div style={{ display: "flex", gap: 8, padding: "0 20px 10px", overflow: "auto" }}>
        <Pill active={filter === "branche"} onClick={() => setFilter("branche")}>Branche familiale</Pill>
        <Pill active={filter === "ascendants"} onClick={() => setFilter("ascendants")}>Ascendants</Pill>
        <Pill active={filter === "descendants"} onClick={() => setFilter("descendants")}>Descendants</Pill>
      </div>

      <div style={{ flex: 1, position: "relative", overflow: "auto", background: `radial-gradient(circle at 50% 45%, ${C.paper}, ${C.cream})` }}>
        <svg width="100%" height="560" viewBox="0 0 360 560">
          {/* trunk */}
          <line x1="180" y1={showAsc ? 175 : 260} x2="180" y2={showDesc ? 385 : 300} stroke={C.ink} strokeWidth="2.5" />

          {showAsc && PEOPLE.grandparents.map((g, i) => {
            const xs = [40, 110, 180, 250, 320];
            const x = xs[i], y = 60;
            return (
              <g key={g.id}>
                <line x1="180" y1="175" x2={x} y2={y + 14} stroke={C.line} strokeWidth="1.8" />
                <circle cx={x} cy={y} r="14" fill={C.gold} stroke={C.ink} strokeWidth="1.5" />
              </g>
            );
          })}
          {showAsc && PEOPLE.parents.map((p, i) => {
            const x = i === 0 ? 120 : 240, y = 175;
            return (
              <g key={p.id} onClick={() => { onSelectPerson(p); go("fiche"); }} style={{ cursor: "pointer" }}>
                <line x1="180" y1="220" x2={x} y2={y + 18} stroke={C.line} strokeWidth="2" />
                <circle cx={x} cy={y} r="20" fill={C.gold} stroke={C.ink} strokeWidth="2" />
                <text x={x} y={y + 34} textAnchor="middle" style={{ fontFamily: sans, fontSize: 9, fill: C.inkSoft }}>{p.name.split(" ")[0]}</text>
              </g>
            );
          })}

          {/* root */}
          <g onClick={() => { onSelectPerson(PEOPLE.root); go("fiche"); }} style={{ cursor: "pointer" }}>
            <circle cx="180" cy="260" r="28" fill={C.terracotta} stroke={C.ink} strokeWidth="2.5" />
            <text x="180" y="264" textAnchor="middle" style={{ fontFamily: serif, fontSize: 12, fontWeight: 700, fill: C.paper }}>JM</text>
            <text x="180" y="300" textAnchor="middle" style={{ fontFamily: sans, fontSize: 11, fontWeight: 700, fill: C.ink }}>Jean Mvondo</text>
            <text x="180" y="313" textAnchor="middle" style={{ fontFamily: sans, fontSize: 9.5, fill: C.inkSoft }}>1945 – 2020</text>
          </g>

          {showDesc && PEOPLE.children.map((c, i) => {
            const xs = [40, 110, 180, 250, 320];
            const x = xs[i], y = 470;
            return (
              <g key={c.id} onClick={() => { onSelectPerson(c); go("fiche"); }} style={{ cursor: "pointer" }}>
                <line x1="180" y1="385" x2={x} y2={y - 16} stroke={C.line} strokeWidth="1.8" />
                <circle cx={x} cy={y} r="16" fill={C.terracotta} stroke={C.ink} strokeWidth="1.6" />
                <text x={x} y={y + 30} textAnchor="middle" style={{ fontFamily: sans, fontSize: 9, fill: C.inkSoft }}>{c.name.split(" ")[0]}</text>
              </g>
            );
          })}
        </svg>
      </div>

      <div style={{ position: "absolute", right: 16, bottom: 96, display: "flex", flexDirection: "column", gap: 6 }}>
        <button style={zoomBtn}><ZoomIn size={15} color={C.ink} /></button>
        <button style={zoomBtn}><ZoomOut size={15} color={C.ink} /></button>
      </div>
      <BottomNav active="arbre" onNav={go} />
    </div>
  );
}
const zoomBtn = {
  width: 32, height: 32, borderRadius: 9, background: C.paper, border: `1px solid ${C.line}`,
  display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", boxShadow: "0 2px 6px rgba(43,27,18,0.12)",
};

/* ---------------------------------------------------------
   5. FICHE PERSONNE — Wikipédia familial
--------------------------------------------------------- */
function FicheScreen({ go, person }) {
  const [tab, setTab] = useState("bio");
  const [showAI, setShowAI] = useState(false);
  const [playing, setPlaying] = useState(false);
  const p = person || PEOPLE.root;

  const tabs = [
    { id: "bio", label: "Bio", icon: User },
    { id: "media", label: "Médias", icon: Image },
    { id: "voix", label: "Voix", icon: Volume2 },
    { id: "docs", label: "Docs", icon: FileText },
    { id: "carte", label: "Carte", icon: MapPin },
    { id: "liens", label: "Liens", icon: Users },
    { id: "chrono", label: "Chrono", icon: Clock },
    { id: "objets", label: "Objets", icon: Package },
  ];

  const timeline = [
    { year: "1945", event: "Naissance à Nkolbisson" },
    { year: "1968", event: "Mariage avec Antoinette Bella" },
    { year: "1970", event: "Naissance de Marie, première enfant" },
    { year: "1985", event: "Nommé conseiller du village" },
    { year: "2005", event: "Enregistrement des proverbes ancestraux" },
    { year: "2020", event: "Décès, inhumé au cimetière familial" },
  ];

  const mediaItems = [
    { type: "photo", label: "Portrait officiel", count: 14 },
    { type: "video", label: "Cérémonie de mariage", count: 3 },
    { type: "audio", label: "Témoignages", count: 7 },
  ];

  const objects = [
    { name: "Canne du grand-père Amos", desc: "Bois sculpté, transmis depuis 1890" },
    { name: "Tambour de cérémonie", desc: "Utilisé lors des fêtes des ancêtres" },
    { name: "Livre de proverbes", desc: "Manuscrit en langue Ewondo" },
  ];

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", background: C.paper, position: "relative" }}>
      {showAI && <GriotAIPanel onClose={() => setShowAI(false)} />}
      <ScreenHeader title="Fiche personne" onBack={() => go("arbre")} />

      <div style={{ padding: "0 20px", marginBottom: 10 }}>
        <div style={{
          height: 120, borderRadius: 14, background: `linear-gradient(135deg, ${C.ink}, ${C.terracottaDeep})`,
          position: "relative", overflow: "hidden", marginBottom: -30,
        }}>
          <div style={{ position: "absolute", inset: 0, opacity: 0.15 }}>
            <TreeMotif size={200} />
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "flex-end", gap: 14, paddingLeft: 4, position: "relative", zIndex: 2 }}>
          <Avatar initials={p.name.split(" ").map((w) => w[0]).join("").slice(0, 2)} size={72} />
          <div style={{ paddingBottom: 6 }}>
            <div style={{ fontFamily: serif, fontSize: 20, fontWeight: 700, color: C.ink }}>{p.name}</div>
            <div style={{ fontFamily: sans, fontSize: 12.5, color: C.inkSoft }}>{p.years} · {p.village}</div>
            <div style={{ marginTop: 6, display: "flex", gap: 6, flexWrap: "wrap" }}>
              <VerifiedBadge type="famille" />
              <VerifiedBadge type="chefferie" />
            </div>
          </div>
        </div>
      </div>

      <div style={{ display: "flex", justifyContent: "center", padding: "8px 20px" }}>
        <GriotAIButton onClick={() => setShowAI(true)} compact />
      </div>

      <div style={{ display: "flex", gap: 6, padding: "4px 16px 8px", overflow: "auto" }}>
        {tabs.map((t) => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{
            display: "flex", alignItems: "center", gap: 4, flexShrink: 0,
            fontFamily: sans, fontSize: 11, fontWeight: tab === t.id ? 700 : 500,
            color: tab === t.id ? C.paper : C.inkSoft,
            background: tab === t.id ? C.ink : C.cream,
            border: `1px solid ${tab === t.id ? C.ink : C.line}`,
            borderRadius: 999, padding: "6px 11px", cursor: "pointer",
          }}>
            <t.icon size={12} /> {t.label}
          </button>
        ))}
      </div>

      <div style={{ flex: 1, overflow: "auto", padding: "4px 20px 20px" }}>
        {tab === "bio" && (
          <>
            <div style={{
              fontFamily: serif, fontSize: 14, color: C.ink, lineHeight: 1.7,
              background: C.cream, borderRadius: 12, padding: "16px 18px", marginBottom: 14,
              borderLeft: `3px solid ${C.gold}`,
            }}>
              <p style={{ margin: "0 0 10px" }}>
                <b>{p.name}</b> était une figure respectée de la communauté de {p.village}. Reconnu pour sa sagesse et son sens de la communauté, il consacra sa vie à la transmission des traditions Ewondo.
              </p>
              <p style={{ margin: 0, fontStyle: "italic" }}>
                « Chaque dimanche, il rassemblait la famille sous le grand manguier du village pour raconter l'histoire des ancêtres. »
              </p>
            </div>
            <InfoRow label="Né(e)" value={p.years.split("–")[0].trim() || "—"} />
            <InfoRow label="Lieu" value={p.village} />
            <InfoRow label="Ethnie" value="Ewondo" />
            <InfoRow label="Profession" value="Cultivateur · Conseiller du village" />
          </>
        )}

        {tab === "media" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {mediaItems.map((m) => (
              <div key={m.label} style={{
                display: "flex", alignItems: "center", gap: 12, padding: "14px",
                border: `1px solid ${C.line}`, borderRadius: 12, background: C.cream,
              }}>
                <div style={{
                  width: 48, height: 48, borderRadius: 10, background: C.terracotta,
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  {m.type === "photo" ? <Camera size={20} color={C.paper} /> :
                   m.type === "video" ? <Video size={20} color={C.paper} /> :
                   <Mic size={20} color={C.paper} />}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: serif, fontSize: 14, fontWeight: 600, color: C.ink }}>{m.label}</div>
                  <div style={{ fontFamily: sans, fontSize: 11.5, color: C.inkSoft }}>{m.count} fichiers</div>
                </div>
                <ChevronRight size={16} color={C.inkSoft} />
              </div>
            ))}
          </div>
        )}

        {tab === "voix" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {["Témoignage de Sylvie (2023)", "Proverbes racontés par Jean (2018)", "Chant funéraire traditionnel"].map((title, i) => (
              <div key={title} style={{
                display: "flex", alignItems: "center", gap: 12, padding: "14px",
                border: `1px solid ${C.line}`, borderRadius: 12, background: C.cream,
              }}>
                <button onClick={() => setPlaying(!playing)} style={{
                  width: 40, height: 40, borderRadius: "50%", background: C.gold, border: "none",
                  display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer",
                }}>
                  {playing && i === 0 ? <Pause size={16} color={C.paper} /> : <Play size={16} color={C.paper} />}
                </button>
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: sans, fontSize: 13, fontWeight: 600, color: C.ink }}>{title}</div>
                  <div style={{ fontFamily: sans, fontSize: 11, color: C.inkSoft }}>{["4:32", "7:15", "2:48"][i]}</div>
                </div>
                <Volume2 size={16} color={C.inkSoft} />
              </div>
            ))}
          </div>
        )}

        {tab === "docs" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {[
              { icon: FileText, label: "Acte de naissance", verified: "archive" },
              { icon: FileText, label: "Certificat de mariage", verified: "chefferie" },
              { icon: Mic, label: "Témoignage audio transcrit", verified: "famille" },
              { icon: Camera, label: "Album photos (14)", verified: "famille" },
            ].map((d) => (
              <div key={d.label} style={{ padding: "12px", border: `1px solid ${C.line}`, borderRadius: 10 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                  <d.icon size={16} color={C.terracottaDeep} />
                  <span style={{ fontFamily: sans, fontSize: 13, color: C.ink, fontWeight: 600 }}>{d.label}</span>
                </div>
                <VerifiedBadge type={d.verified} />
              </div>
            ))}
          </div>
        )}

        {tab === "carte" && (
          <div style={{ borderRadius: 12, overflow: "hidden", border: `1px solid ${C.line}`, marginBottom: 12 }}>
            <svg width="100%" height="160" viewBox="0 0 300 160">
              <rect width="300" height="160" fill={C.cream} />
              <circle cx="150" cy="80" r="6" fill={C.terracotta} stroke={C.ink} strokeWidth="1.5" />
              <text x="162" y="84" style={{ fontFamily: sans, fontSize: 11, fontWeight: 700, fill: C.ink }}>{p.village}</text>
              <circle cx="120" cy="60" r="4" fill={C.gold} />
              <text x="90" y="55" style={{ fontFamily: sans, fontSize: 9, fill: C.inkSoft }}>Mbalmayo</text>
              <line x1="150" y1="80" x2="120" y2="60" stroke={C.line} strokeWidth="1.5" strokeDasharray="4 3" />
            </svg>
          </div>
        )}

        {tab === "liens" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <div style={{ fontFamily: sans, fontSize: 11, fontWeight: 700, color: C.inkSoft, marginBottom: 4 }}>PARENTS</div>
            {PEOPLE.parents.map((par) => (
              <div key={par.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 0", borderBottom: `1px solid ${C.line}` }}>
                <Avatar initials={par.name[0]} size={32} tone={C.gold} />
                <div>
                  <div style={{ fontFamily: sans, fontSize: 13, fontWeight: 600, color: C.ink }}>{par.name}</div>
                  <div style={{ fontFamily: sans, fontSize: 11, color: C.inkSoft }}>{par.years}</div>
                </div>
              </div>
            ))}
            <div style={{ fontFamily: sans, fontSize: 11, fontWeight: 700, color: C.inkSoft, margin: "8px 0 4px" }}>ENFANTS</div>
            {PEOPLE.children.map((c) => (
              <div key={c.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 0", borderBottom: `1px solid ${C.line}` }}>
                <Avatar initials={c.name[0]} size={32} tone={C.terracotta} />
                <div>
                  <div style={{ fontFamily: sans, fontSize: 13, fontWeight: 600, color: C.ink }}>{c.name}</div>
                  <div style={{ fontFamily: sans, fontSize: 11, color: C.inkSoft }}>{c.village}</div>
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === "chrono" && (
          <div style={{ position: "relative", paddingLeft: 20 }}>
            {timeline.map((t, i) => (
              <div key={t.year} style={{ position: "relative", paddingBottom: 18, paddingLeft: 16 }}>
                <div style={{
                  position: "absolute", left: -6, top: 4, width: 10, height: 10, borderRadius: "50%",
                  background: i === 0 ? C.gold : i === timeline.length - 1 ? C.terracotta : C.olive,
                  border: `2px solid ${C.paper}`,
                }} />
                {i < timeline.length - 1 && (
                  <div style={{ position: "absolute", left: -1, top: 14, width: 2, height: "calc(100% - 4px)", background: C.line }} />
                )}
                <div style={{ fontFamily: serif, fontSize: 14, fontWeight: 700, color: C.terracottaDeep }}>{t.year}</div>
                <div style={{ fontFamily: sans, fontSize: 12.5, color: C.ink, marginTop: 2 }}>{t.event}</div>
              </div>
            ))}
          </div>
        )}

        {tab === "objets" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {objects.map((o) => (
              <div key={o.name} style={{
                padding: "14px", border: `1px solid ${C.line}`, borderRadius: 12, background: C.cream,
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                  <Package size={16} color={C.terracottaDeep} />
                  <span style={{ fontFamily: serif, fontSize: 14, fontWeight: 600, color: C.ink }}>{o.name}</span>
                </div>
                <div style={{ fontFamily: sans, fontSize: 12, color: C.inkSoft }}>{o.desc}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
function InfoRow({ label, value }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: `1px solid ${C.line}` }}>
      <span style={{ fontFamily: sans, fontSize: 12.5, color: C.inkSoft }}>{label}</span>
      <span style={{ fontFamily: sans, fontSize: 12.5, color: C.ink, fontWeight: 600 }}>{value}</span>
    </div>
  );
}

/* ---------------------------------------------------------
   6. CARTE INTERACTIVE DES ORIGINES
--------------------------------------------------------- */
function CarteScreen({ go }) {
  const stops = [
    { name: "Cameroun", cx: 155, cy: 210 },
    { name: "Gabon", cx: 160, cy: 280 },
    { name: "Congo", cx: 190, cy: 320 },
  ];
  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", background: C.cream }}>
      <ScreenHeader title="Carte des origines" subtitle="Villages et migrations familiales" onBack={() => go("dashboard")} />
      <div style={{ flex: 1, position: "relative", overflow: "hidden" }}>
        <svg width="100%" height="100%" viewBox="0 0 340 460" style={{ position: "absolute", inset: 0 }}>
          {/* simplified continent silhouette */}
          <path d="M150 40 C210 45 250 70 260 120 C270 160 250 175 265 210 C280 245 260 270 240 300 C225 325 230 360 205 390 C185 415 165 400 160 375 C155 345 130 335 120 305 C108 270 120 245 100 215 C82 188 90 155 105 120 C118 88 115 55 150 40 Z"
            fill={C.paper} stroke={C.line} strokeWidth="2" />
          {stops.map((s, i) => (
            <g key={s.name}>
              {i > 0 && (
                <line x1={stops[i - 1].cx} y1={stops[i - 1].cy} x2={s.cx} y2={s.cy}
                  stroke={C.terracotta} strokeWidth="2" strokeDasharray="5 4" markerEnd="url(#arrow)" />
              )}
              <circle cx={s.cx} cy={s.cy} r="9" fill={i === 0 ? C.gold : C.terracotta} stroke={C.ink} strokeWidth="1.6" />
              <text x={s.cx + 16} y={s.cy + 4} style={{ fontFamily: sans, fontSize: 11, fontWeight: 700, fill: C.ink }}>{s.name}</text>
            </g>
          ))}
          <defs>
            <marker id="arrow" markerWidth="8" markerHeight="8" refX="4" refY="4" orient="auto">
              <path d="M0,0 L8,4 L0,8 Z" fill={C.terracotta} />
            </marker>
          </defs>
        </svg>
      </div>
      <div style={{ padding: "14px 20px 8px", background: C.paper, borderTop: `1px solid ${C.line}` }}>
        <div style={{ fontFamily: sans, fontSize: 11.5, fontWeight: 700, color: C.inkSoft, letterSpacing: 0.5, marginBottom: 8 }}>PARCOURS FAMILIAL</div>
        <div style={{ display: "flex", alignItems: "center", gap: 6, fontFamily: sans, fontSize: 13, color: C.ink, flexWrap: "wrap" }}>
          <span style={{ fontWeight: 700 }}>Cameroun</span><ArrowRight size={13} color={C.inkSoft} />
          <span>Gabon</span><ArrowRight size={13} color={C.inkSoft} />
          <span>Congo</span>
        </div>
      </div>
      <BottomNav active="carte" onNav={go} />
    </div>
  );
}

/* ---------------------------------------------------------
   7. MÉMOIRE FAMILIALE — interface riche
--------------------------------------------------------- */
function MemoireScreen({ go }) {
  const [view, setView] = useState("stories");
  const [playing, setPlaying] = useState(null);
  const [showAI, setShowAI] = useState(false);
  const [expandedStory, setExpandedStory] = useState(null);

  const categories = [
    { icon: Mic, title: "Histoires racontées", count: "12 récits", tone: C.terracotta },
    { icon: Music, title: "Chants traditionnels", count: "8 enregistrements", tone: C.olive },
    { icon: ScrollText, title: "Proverbes", count: "24 proverbes", tone: C.gold },
    { icon: Utensils, title: "Recettes", count: "6 recettes", tone: C.terracottaDeep },
    { icon: Users, title: "Cérémonies", count: "5 archives", tone: C.goldDeep },
  ];

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", background: C.cream, position: "relative" }}>
      {showAI && <GriotAIPanel onClose={() => setShowAI(false)} />}
      <ScreenHeader title="Mémoire familiale" subtitle="Un espace pour préserver ce qui ne s'écrit pas toujours" onBack={() => go("dashboard")} />

      <div style={{ padding: "0 20px 8px", display: "flex", gap: 8 }}>
        <Pill active={view === "stories"} onClick={() => setView("stories")}>Histoires</Pill>
        <Pill active={view === "categories"} onClick={() => setView("categories")}>Catégories</Pill>
      </div>

      <div style={{ display: "flex", justifyContent: "center", padding: "0 20px 8px" }}>
        <GriotAIButton onClick={() => setShowAI(true)} compact />
      </div>

      <div style={{ flex: 1, overflow: "auto", padding: "4px 20px 16px" }}>
        {view === "stories" && STORIES.map((story) => (
          <div key={story.id} style={{
            background: C.paper, border: `1px solid ${C.line}`, borderRadius: 14,
            padding: "14px 16px", marginBottom: 12,
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
              <div>
                <div style={{ fontFamily: serif, fontSize: 15, fontWeight: 600, color: C.ink }}>{story.title}</div>
                <div style={{ fontFamily: sans, fontSize: 11, color: C.inkSoft, marginTop: 2 }}>
                  Par {story.author} · {story.category}
                </div>
              </div>
              <VerifiedBadge type={story.verified} />
            </div>

            <div style={{ fontFamily: sans, fontSize: 12.5, color: C.ink, lineHeight: 1.5, marginBottom: 12 }}>
              {expandedStory === story.id ? story.excerpt + " Les enfants s'asseyaient en cercle, les yeux grands ouverts, pendant que les anciens transmettaient les récits qui ne figuraient dans aucun livre." : story.excerpt}
              {story.excerpt.length > 60 && (
                <button onClick={() => setExpandedStory(expandedStory === story.id ? null : story.id)} style={{
                  background: "none", border: "none", fontFamily: sans, fontSize: 11, fontWeight: 700,
                  color: C.terracotta, cursor: "pointer", marginLeft: 4,
                }}>{expandedStory === story.id ? "Réduire" : "Lire plus"}</button>
              )}
            </div>

            <div style={{
              display: "flex", alignItems: "center", gap: 12, padding: "10px 12px",
              background: C.cream, borderRadius: 10, marginBottom: 10,
            }}>
              <button onClick={() => setPlaying(playing === story.id ? null : story.id)} style={{
                width: 36, height: 36, borderRadius: "50%", background: C.terracotta, border: "none",
                display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0,
              }}>
                {playing === story.id ? <Pause size={14} color={C.paper} /> : <Play size={14} color={C.paper} />}
              </button>
              <div style={{ flex: 1 }}>
                <div style={{ height: 4, background: C.line, borderRadius: 2, overflow: "hidden" }}>
                  <div style={{
                    height: "100%", width: playing === story.id ? "45%" : "0%",
                    background: C.terracotta, borderRadius: 2, transition: "width 0.3s",
                  }} />
                </div>
                <div style={{ fontFamily: sans, fontSize: 10, color: C.inkSoft, marginTop: 4 }}>
                  {story.duration} · {story.plays} écoutes
                </div>
              </div>
            </div>

            <div style={{ display: "flex", gap: 16 }}>
              <button style={{ display: "flex", alignItems: "center", gap: 4, background: "none", border: "none", cursor: "pointer", fontFamily: sans, fontSize: 11, fontWeight: 600, color: C.inkSoft }}>
                <MessageCircle size={14} /> {story.comments} commentaires
              </button>
              <button style={{ display: "flex", alignItems: "center", gap: 4, background: "none", border: "none", cursor: "pointer", fontFamily: sans, fontSize: 11, fontWeight: 600, color: C.inkSoft }}>
                <Share2 size={14} /> Partager
              </button>
            </div>
          </div>
        ))}

        {view === "categories" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {categories.map((it) => (
              <div key={it.title} onClick={() => setView("stories")} style={{
                display: "flex", alignItems: "center", gap: 12, background: C.paper,
                border: `1px solid ${C.line}`, borderRadius: 13, padding: "13px 14px", cursor: "pointer",
              }}>
                <div style={{
                  width: 38, height: 38, borderRadius: 10, background: it.tone,
                  display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                }}>
                  <it.icon size={17} color={C.paper} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: serif, fontSize: 14.5, fontWeight: 600, color: C.ink }}>{it.title}</div>
                  <div style={{ fontFamily: sans, fontSize: 11.5, color: C.inkSoft }}>{it.count}</div>
                </div>
                <ChevronRight size={16} color={C.inkSoft} />
              </div>
            ))}
          </div>
        )}

        <button style={{ ...btnGhost, marginTop: 6 }}>+ Ajouter un souvenir</button>
      </div>
      <BottomNav active="memoire" onNav={go} />
    </div>
  );
}

/* ---------------------------------------------------------
   8. ESPACE CHEFFERIES (web admin — desktop frame)
--------------------------------------------------------- */
function ChefferieScreen() {
  const stats = [
    { label: "Population enregistrée", value: "12 540" },
    { label: "Villages associés", value: "45" },
    { label: "Archives", value: "320 documents" },
    { label: "Arbres validés", value: "860" },
  ];
  const nav = [
    { icon: LayoutDashboard, label: "Tableau de bord", active: true },
    { icon: Users, label: "Utilisateurs" },
    { icon: Check, label: "Validation des données" },
    { icon: Landmark, label: "Gestion des chefferies" },
    { icon: FileText, label: "Statistiques" },
  ];
  return (
    <div style={{ display: "flex", height: "100%", background: C.paper }}>
      <div style={{ width: 200, background: C.ink, padding: "22px 14px", display: "flex", flexDirection: "column", gap: 4, flexShrink: 0 }}>
        <div style={{ fontFamily: serif, fontSize: 17, color: C.paper, fontWeight: 700, marginBottom: 18, paddingLeft: 8 }}>GRIOT · Admin</div>
        {nav.map((n) => (
          <div key={n.label} style={{
            display: "flex", alignItems: "center", gap: 9, padding: "9px 8px", borderRadius: 8,
            background: n.active ? "rgba(201,147,46,0.18)" : "transparent",
            color: n.active ? C.gold : "rgba(246,239,225,0.75)",
          }}>
            <n.icon size={15} />
            <span style={{ fontFamily: sans, fontSize: 12.5, fontWeight: n.active ? 700 : 500 }}>{n.label}</span>
          </div>
        ))}
      </div>
      <div style={{ flex: 1, overflow: "auto", padding: "26px 30px" }}>
        <div style={{ fontFamily: sans, fontSize: 12, color: C.inkSoft, marginBottom: 3 }}>COMPTE INSTITUTIONNEL</div>
        <div style={{ fontFamily: serif, fontSize: 25, fontWeight: 700, color: C.ink, marginBottom: 20 }}>Chefferie de Nkolbisson</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 14, marginBottom: 26 }}>
          {stats.map((s) => (
            <div key={s.label} style={{ background: C.cream, border: `1px solid ${C.line}`, borderRadius: 12, padding: "16px 16px" }}>
              <div style={{ fontFamily: serif, fontSize: 22, fontWeight: 700, color: C.terracottaDeep }}>{s.value}</div>
              <div style={{ fontFamily: sans, fontSize: 11.5, color: C.inkSoft, marginTop: 4 }}>{s.label}</div>
            </div>
          ))}
        </div>
        <div style={{ background: C.cream, border: `1px solid ${C.line}`, borderRadius: 12, padding: "18px 20px" }}>
          <div style={{ fontFamily: sans, fontSize: 12, fontWeight: 700, color: C.inkSoft, letterSpacing: 0.4, marginBottom: 12 }}>ARBRES EN ATTENTE DE VALIDATION</div>
          {[
            { name: "Famille Ateba — 24 membres", badges: ["famille"] },
            { name: "Famille Owona — 11 membres", badges: ["famille", "chefferie"] },
            { name: "Famille Bella — 37 membres", badges: ["archive"] },
          ].map((r) => (
            <div key={r.name} style={{ padding: "10px 0", borderBottom: `1px solid ${C.line}` }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                <span style={{ fontFamily: sans, fontSize: 13, color: C.ink }}>{r.name}</span>
                <span style={{ fontFamily: sans, fontSize: 11.5, fontWeight: 700, color: C.olive }}>Valider</span>
              </div>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {r.badges.map((b) => <VerifiedBadge key={b} type={b} />)}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------
   9. CHARTE GRAPHIQUE (bonus reference panel)
--------------------------------------------------------- */
function StyleScreen() {
  const swatches = [
    ["Terre cuite", C.terracotta, "héritage africain"],
    ["Or", C.gold, "noblesse · transmission"],
    ["Vert", C.olive, "nature · vie"],
    ["Noir profond", C.ink, "profondeur historique"],
    ["Blanc cassé", C.cream, "modernité"],
  ];
  return (
    <div style={{ height: "100%", overflow: "auto", background: C.paper, padding: "30px 34px" }}>
      <div style={{ fontFamily: sans, fontSize: 12, color: C.inkSoft, marginBottom: 3 }}>IDENTITÉ VISUELLE</div>
      <div style={{ fontFamily: serif, fontSize: 26, fontWeight: 700, color: C.ink, marginBottom: 22 }}>Charte graphique GRIOT</div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 14, marginBottom: 30 }}>
        {swatches.map(([name, color, note]) => (
          <div key={name}>
            <div style={{ height: 70, borderRadius: 10, background: color, border: `1px solid ${C.line}` }} />
            <div style={{ fontFamily: sans, fontSize: 12.5, fontWeight: 700, color: C.ink, marginTop: 8 }}>{name}</div>
            <div style={{ fontFamily: sans, fontSize: 11, color: C.inkSoft }}>{note}</div>
          </div>
        ))}
      </div>

      <div style={{ display: "flex", gap: 40, marginBottom: 30 }}>
        <div>
          <div style={{ fontFamily: sans, fontSize: 11.5, fontWeight: 700, color: C.inkSoft, letterSpacing: 0.4, marginBottom: 8 }}>TITRES — FRAUNCES</div>
          <div style={{ fontFamily: serif, fontSize: 30, fontWeight: 700, color: C.ink }}>Racines & Mémoire</div>
        </div>
        <div>
          <div style={{ fontFamily: sans, fontSize: 11.5, fontWeight: 700, color: C.inkSoft, letterSpacing: 0.4, marginBottom: 8 }}>TEXTE — WORK SANS</div>
          <div style={{ fontFamily: sans, fontSize: 15, color: C.ink, maxWidth: 320 }}>Moderne, lisible, chaleureux. Utilisé pour l'interface et les contenus longs.</div>
        </div>
      </div>

      <div style={{ fontFamily: sans, fontSize: 11.5, fontWeight: 700, color: C.inkSoft, letterSpacing: 0.4, marginBottom: 8 }}>DIRECTION</div>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 20 }}>
        {["Premium", "Moderne", "Africain sans clichés", "Spotify × Google Maps × arbre généalogique × musée numérique"].map((t) => (
          <span key={t} style={{ fontFamily: sans, fontSize: 12, fontWeight: 600, color: C.ink, background: C.cream, border: `1px solid ${C.line}`, borderRadius: 999, padding: "7px 13px" }}>{t}</span>
        ))}
      </div>
      <div style={{
        background: C.cream, border: `1px solid ${C.line}`, borderRadius: 12, padding: "18px 20px",
        borderLeft: `4px solid ${C.gold}`,
      }}>
        <div style={{ fontFamily: sans, fontSize: 11, fontWeight: 700, color: C.inkSoft, letterSpacing: 0.4, marginBottom: 6 }}>POSITIONNEMENT</div>
        <div style={{ fontFamily: serif, fontSize: 16, fontWeight: 600, color: C.ink, lineHeight: 1.5 }}>
          GRIOT n'est pas un concurrent de MyHeritage. C'est la mémoire numérique des peuples africains — une ambition que les investisseurs comprennent immédiatement.
        </div>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------
   FRAMES
--------------------------------------------------------- */
function PhoneFrame({ children }) {
  return (
    <div style={{
      width: 340, height: 700, borderRadius: 38, background: "#0f0a07",
      padding: 10, boxShadow: "0 25px 60px rgba(43,27,18,0.35)", position: "relative", flexShrink: 0,
    }}>
      <div style={{
        position: "absolute", top: 10, left: "50%", transform: "translateX(-50%)",
        width: 110, height: 22, background: "#0f0a07", borderRadius: 12, zIndex: 5,
      }} />
      <div style={{ width: "100%", height: "100%", borderRadius: 28, overflow: "hidden", background: C.cream, position: "relative" }}>
        {children}
      </div>
    </div>
  );
}
function DesktopFrame({ children }) {
  return (
    <div style={{
      width: 860, height: 560, borderRadius: 14, overflow: "hidden", background: C.paper,
      boxShadow: "0 25px 60px rgba(43,27,18,0.28)", border: `1px solid ${C.line}`, flexShrink: 0,
    }}>
      <div style={{ height: 34, background: "#EDE3CC", display: "flex", alignItems: "center", gap: 6, padding: "0 12px" }}>
        {["#D98A63", "#E8C468", "#87A06C"].map((c) => (
          <div key={c} style={{ width: 10, height: 10, borderRadius: "50%", background: c }} />
        ))}
      </div>
      <div style={{ height: "calc(100% - 34px)" }}>{children}</div>
    </div>
  );
}
function PanelFrame({ children }) {
  return (
    <div style={{
      width: 860, height: 560, borderRadius: 14, overflow: "hidden",
      boxShadow: "0 25px 60px rgba(43,27,18,0.28)", border: `1px solid ${C.line}`, flexShrink: 0,
    }}>
      {children}
    </div>
  );
}

/* ---------------------------------------------------------
   APP
--------------------------------------------------------- */
export default function App() {
  const [screen, setScreen] = useState("accueil");
  const [person, setPerson] = useState(PEOPLE.root);

  const go = (id) => setScreen(id);

  const content = useMemo(() => {
    switch (screen) {
      case "accueil": return <AccueilScreen go={go} />;
      case "compte": return <CompteScreen go={go} />;
      case "dashboard": return <DashboardScreen go={go} />;
      case "arbre": return <ArbreScreen go={go} onSelectPerson={setPerson} />;
      case "fiche": return <FicheScreen go={go} person={person} />;
      case "carte": return <CarteScreen go={go} />;
      case "memoire": return <MemoireScreen go={go} />;
      case "chefferie": return <ChefferieScreen />;
      case "style": return <StyleScreen />;
      default: return null;
    }
  }, [screen, person]);

  const meta = SCREENS.find((s) => s.id === screen);

  return (
    <div style={{ minHeight: "100vh", background: "#EDE3CC", display: "flex", fontFamily: sans }}>
      <link rel="stylesheet" href={FONT_LINK} />
      <style>{ANIM_STYLES}</style>

      {/* Left rail — prototype navigator */}
      <div style={{ width: 232, background: C.ink, padding: "24px 14px", flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 22, paddingLeft: 6 }}>
          <TreeMotif size={26} />
          <div>
            <div style={{ fontFamily: serif, fontSize: 15, fontWeight: 700, color: C.paper }}>GRIOT</div>
            <div style={{ fontFamily: sans, fontSize: 9.5, color: "rgba(246,239,225,0.6)" }}>Mémoire numérique · Prototype</div>
          </div>
        </div>
        {SCREENS.map((s, i) => {
          const isActive = screen === s.id;
          return (
            <button key={s.id} onClick={() => go(s.id)} style={{
              width: "100%", display: "flex", alignItems: "center", gap: 10,
              background: isActive ? "rgba(201,147,46,0.18)" : "transparent", border: "none",
              borderRadius: 9, padding: "10px 10px", marginBottom: 3, cursor: "pointer", textAlign: "left",
            }}>
              <s.icon size={15} color={isActive ? C.gold : "rgba(246,239,225,0.65)"} />
              <span style={{ fontFamily: sans, fontSize: 12.5, fontWeight: isActive ? 700 : 500, color: isActive ? C.gold : "rgba(246,239,225,0.85)" }}>{s.label}</span>
            </button>
          );
        })}
      </div>

      {/* Stage */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 30, position: "relative" }}>
        <div style={{ fontFamily: sans, fontSize: 11.5, fontWeight: 700, color: C.inkSoft, letterSpacing: 0.5, marginBottom: 16, textTransform: "uppercase" }}>
          {meta?.label}
        </div>
        {meta?.frame === "phone" && <PhoneFrame>{content}</PhoneFrame>}
        {meta?.frame === "desktop" && <DesktopFrame>{content}</DesktopFrame>}
        {meta?.frame === "panel" && <PanelFrame>{content}</PanelFrame>}
      </div>
    </div>
  );
}
