import storage from "./storage";
import { useState, useEffect } from "react";

// ── Palette ───────────────────────────────────────────────────────────────────
const C = {
  bg: "#080810", surface: "#0f0f1a", card: "#13131f", border: "#1f1f32",
  accent: "#5b5aff", accent2: "#9b59ff", green: "#00e5a0", orange: "#ff6b35",
  yellow: "#ffc542", text: "#e8e8f4", muted: "#6b6b90", dim: "#9898b8",
};

// ── Helpers ───────────────────────────────────────────────────────────────────
const hash = (str) => btoa(unescape(encodeURIComponent(str))).slice(0, 20);

const Input = ({ label, type = "text", value, onChange, placeholder, icon }) => (
  <div style={{ marginBottom: 16 }}>
    {label && <div style={{ fontSize: 12, color: C.dim, marginBottom: 6, fontWeight: 500 }}>{label}</div>}
    <div style={{ position: "relative" }}>
      {icon && <span style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", fontSize: 16, opacity: 0.5 }}>{icon}</span>}
      <input
        type={type} value={value} onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        style={{
          width: "100%", background: C.surface, border: `1px solid ${C.border}`,
          borderRadius: 10, padding: icon ? "12px 14px 12px 40px" : "12px 14px",
          color: C.text, fontSize: 14, outline: "none", boxSizing: "border-box",
          transition: "border-color 0.2s", fontFamily: "inherit",
        }}
        onFocus={e => e.target.style.borderColor = C.accent}
        onBlur={e => e.target.style.borderColor = C.border}
      />
    </div>
  </div>
);

const Btn = ({ children, onClick, variant = "primary", full, disabled, small }) => (
  <button onClick={onClick} disabled={disabled} style={{
    width: full ? "100%" : "auto",
    padding: small ? "8px 16px" : "13px 24px",
    borderRadius: 10, border: "none", cursor: disabled ? "not-allowed" : "pointer",
    fontWeight: 600, fontSize: small ? 13 : 14, fontFamily: "inherit",
    background: disabled ? C.border :
      variant === "primary" ? `linear-gradient(135deg, ${C.accent}, ${C.accent2})` :
      variant === "ghost" ? "transparent" : C.surface,
    color: variant === "ghost" ? C.dim : "white",
    border: variant === "ghost" ? `1px solid ${C.border}` : "none",
    transition: "all 0.2s",
    boxShadow: variant === "primary" && !disabled ? `0 0 30px rgba(91,90,255,0.25)` : "none",
    opacity: disabled ? 0.6 : 1,
  }}>{children}</button>
);

// ── Storage helpers ────────────────────────────────────────────────────────────
const store = {
  async get(key) {
    try { const r = await storage.get(key); return r ? JSON.parse(r.value) : null; }
    catch { return null; }
  },
  async set(key, val) {
    try { await storage.set(key, JSON.stringify(val)); return true; }
    catch { return false; }
  },
};

// ── Demo clients data ─────────────────────────────────────────────────────────
const demoClients = [
  { id: 1, name: "Lucas Martin", age: 28, goal: "Prise de masse", sessions: 24, progress: 78, nextSession: "Aujourd'hui 18h", status: "actif", avatar: "LM", color: C.accent },
  { id: 2, name: "Sophie Durand", age: 34, goal: "Perte de poids", sessions: 16, progress: 62, nextSession: "Demain 9h", status: "actif", avatar: "SD", color: C.green },
  { id: 3, name: "Karim Benali", age: 22, goal: "Performance", sessions: 31, progress: 85, nextSession: "Jeu. 17h", status: "actif", avatar: "KB", color: C.orange },
];

const weekRevenue = [1200, 1450, 1100, 1800, 1650, 2100, 1920];
const weekDays = ["L", "M", "M", "J", "V", "S", "D"];

// ══════════════════════════════════════════════════════════════════════════════
// AUTH SCREENS
// ══════════════════════════════════════════════════════════════════════════════
function AuthScreen({ onLogin }) {
  const [mode, setMode] = useState("login"); // login | register
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [animIn, setAnimIn] = useState(false);

  useEffect(() => { setTimeout(() => setAnimIn(true), 50); }, []);
  useEffect(() => { setError(""); }, [mode]);

  const handleLogin = async () => {
    if (!email || !password) return setError("Remplis tous les champs.");
    setLoading(true);
    const users = await store.get("cp_users") || {};
    const key = email.toLowerCase().trim();
    if (!users[key]) { setLoading(false); return setError("Aucun compte trouvé avec cet email."); }
    if (users[key].passwordHash !== hash(password)) { setLoading(false); return setError("Mot de passe incorrect."); }
    await store.set("cp_session", { email: key, name: users[key].name, loginAt: Date.now() });
    setLoading(false);
    onLogin({ email: key, name: users[key].name });
  };

  const handleRegister = async () => {
    if (!name || !email || !password) return setError("Remplis tous les champs.");
    if (password.length < 6) return setError("Mot de passe trop court (6 caractères min).");
    if (!email.includes("@")) return setError("Email invalide.");
    setLoading(true);
    const users = await store.get("cp_users") || {};
    const key = email.toLowerCase().trim();
    if (users[key]) { setLoading(false); return setError("Un compte existe déjà avec cet email."); }
    users[key] = { name: name.trim(), passwordHash: hash(password), createdAt: Date.now() };
    await store.set("cp_users", users);
    await store.set("cp_session", { email: key, name: name.trim(), loginAt: Date.now() });
    setLoading(false);
    onLogin({ email: key, name: name.trim() });
  };

  return (
    <div style={{
      minHeight: "100vh", background: C.bg, display: "flex",
      alignItems: "center", justifyContent: "center",
      fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
      position: "relative", overflow: "hidden",
    }}>
      {/* Blobs */}
      {[
        { w: 500, h: 500, top: "-150px", left: "-150px", color: "rgba(91,90,255,0.12)" },
        { w: 400, h: 400, bottom: "-100px", right: "-100px", color: "rgba(155,89,255,0.1)" },
      ].map((b, i) => (
        <div key={i} style={{
          position: "absolute", width: b.w, height: b.h,
          top: b.top, left: b.left, bottom: b.bottom, right: b.right,
          background: `radial-gradient(circle, ${b.color}, transparent 70%)`,
          borderRadius: "50%", filter: "blur(60px)", pointerEvents: "none",
        }} />
      ))}

      <div style={{
        width: "100%", maxWidth: 420, padding: "0 24px",
        opacity: animIn ? 1 : 0, transform: animIn ? "translateY(0)" : "translateY(20px)",
        transition: "all 0.5s ease",
      }}>
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <div style={{
            width: 52, height: 52, borderRadius: 16, margin: "0 auto 14px",
            background: `linear-gradient(135deg, ${C.accent}, ${C.accent2})`,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 22, fontWeight: 900, color: "white",
            boxShadow: `0 0 40px rgba(91,90,255,0.4)`,
          }}>C</div>
          <div style={{ fontSize: 22, fontWeight: 800, letterSpacing: "-0.5px" }}>CoachPro</div>
          <div style={{ fontSize: 13, color: C.muted, marginTop: 4 }}>
            {mode === "login" ? "Bon retour 👋" : "Crée ton compte gratuitement"}
          </div>
        </div>

        {/* Card */}
        <div style={{
          background: C.card, border: `1px solid ${C.border}`,
          borderRadius: 20, padding: 32,
          boxShadow: "0 20px 60px rgba(0,0,0,0.4)",
        }}>
          {/* Tabs */}
          <div style={{
            display: "flex", background: C.surface, borderRadius: 10,
            padding: 4, marginBottom: 28,
          }}>
            {["login", "register"].map(m => (
              <button key={m} onClick={() => setMode(m)} style={{
                flex: 1, padding: "9px", borderRadius: 8, border: "none",
                background: mode === m ? C.accent : "transparent",
                color: mode === m ? "white" : C.muted,
                fontWeight: mode === m ? 600 : 400,
                cursor: "pointer", fontSize: 13, fontFamily: "inherit",
                transition: "all 0.2s",
              }}>
                {m === "login" ? "Connexion" : "Inscription"}
              </button>
            ))}
          </div>

          {mode === "register" && (
            <Input label="Ton prénom et nom" value={name} onChange={setName}
              placeholder="Jean Dupont" icon="👤" />
          )}
          <Input label="Email" type="email" value={email} onChange={setEmail}
            placeholder="coach@exemple.fr" icon="✉" />
          <Input label="Mot de passe" type="password" value={password} onChange={setPassword}
            placeholder={mode === "register" ? "6 caractères minimum" : "••••••••"} icon="🔒" />

          {error && (
            <div style={{
              background: "rgba(255,107,53,0.1)", border: "1px solid rgba(255,107,53,0.3)",
              borderRadius: 8, padding: "10px 14px", fontSize: 13, color: C.orange,
              marginBottom: 16,
            }}>{error}</div>
          )}

          <Btn
            full
            disabled={loading}
            onClick={mode === "login" ? handleLogin : handleRegister}
          >
            {loading ? "Chargement..." : mode === "login" ? "Se connecter →" : "Créer mon compte →"}
          </Btn>

          {mode === "login" && (
            <div style={{ textAlign: "center", marginTop: 16 }}>
              <button onClick={() => {
                setEmail("demo@coachpro.fr"); setPassword("demo123");
              }} style={{
                background: "none", border: "none", color: C.dim,
                fontSize: 12, cursor: "pointer", textDecoration: "underline",
              }}>
                Utiliser le compte démo
              </button>
            </div>
          )}
        </div>

        <div style={{ textAlign: "center", marginTop: 20, fontSize: 12, color: C.muted }}>
          ✓ Gratuit · ✓ Sans carte bancaire · ✓ Données sécurisées
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// PROFILE SCREEN
// ══════════════════════════════════════════════════════════════════════════════
function ProfileScreen({ user, onUpdate, onLogout }) {
  const [name, setName] = useState(user.name);
  const [specialty, setSpecialty] = useState(user.specialty || "");
  const [city, setCity] = useState(user.city || "");
  const [saved, setSaved] = useState(false);

  const save = async () => {
    const users = await store.get("cp_users") || {};
    if (users[user.email]) {
      users[user.email] = { ...users[user.email], name, specialty, city };
      await store.set("cp_users", users);
      await store.set("cp_session", { ...user, name, specialty, city, loginAt: Date.now() });
      onUpdate({ ...user, name, specialty, city });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }
  };

  const initials = name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2);

  return (
    <div style={{ maxWidth: 560, margin: "0 auto", padding: "32px 24px" }}>
      <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 6 }}>Mon profil</h1>
      <p style={{ color: C.muted, fontSize: 14, marginBottom: 32 }}>Tes informations de compte</p>

      {/* Avatar */}
      <div style={{ display: "flex", alignItems: "center", gap: 20, marginBottom: 32 }}>
        <div style={{
          width: 72, height: 72, borderRadius: 20,
          background: `linear-gradient(135deg, ${C.accent}, ${C.accent2})`,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 24, fontWeight: 800, color: "white",
          boxShadow: `0 0 30px rgba(91,90,255,0.3)`,
        }}>{initials}</div>
        <div>
          <div style={{ fontWeight: 700, fontSize: 18 }}>{name}</div>
          <div style={{ color: C.muted, fontSize: 13 }}>{user.email}</div>
          <div style={{ color: C.green, fontSize: 12, marginTop: 4 }}>● Compte actif</div>
        </div>
      </div>

      <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, padding: 24 }}>
        <Input label="Nom complet" value={name} onChange={setName} placeholder="Jean Dupont" icon="👤" />
        <Input label="Spécialité" value={specialty} onChange={setSpecialty} placeholder="Musculation, Fitness, CrossFit..." icon="💪" />
        <Input label="Ville" value={city} onChange={setCity} placeholder="Paris, Lyon, Marseille..." icon="📍" />

        <div style={{ display: "flex", gap: 12, marginTop: 8 }}>
          <Btn onClick={save}>{saved ? "✓ Sauvegardé !" : "Sauvegarder"}</Btn>
          <Btn variant="ghost" onClick={onLogout}>Se déconnecter</Btn>
        </div>
      </div>

      <div style={{
        marginTop: 20, background: C.card, border: `1px solid ${C.border}`,
        borderRadius: 12, padding: 16,
      }}>
        <div style={{ fontSize: 12, color: C.muted, marginBottom: 10, fontWeight: 600 }}>INFOS DU COMPTE</div>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
          <span style={{ color: C.dim }}>Email</span>
          <span>{user.email}</span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginTop: 8 }}>
          <span style={{ color: C.dim }}>Plan</span>
          <span style={{ color: C.green, fontWeight: 600 }}>Starter (Gratuit)</span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginTop: 8 }}>
          <span style={{ color: C.dim }}>Membre depuis</span>
          <span>{new Date().toLocaleDateString("fr-FR")}</span>
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// MAIN DASHBOARD
// ══════════════════════════════════════════════════════════════════════════════
export default function CoachPro() {
  const [authState, setAuthState] = useState("loading"); // loading | auth | app
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [selectedClient, setSelectedClient] = useState(null);
  const [generatedPlan, setGeneratedPlan] = useState(null);
  const [generating, setGenerating] = useState(false);
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiResponse, setAiResponse] = useState("");
  const [loadingAi, setLoadingAi] = useState(false);

  // Check session on load
  useEffect(() => {
    (async () => {
      // Ensure demo account exists
      const users = await store.get("cp_users") || {};
      if (!users["demo@coachpro.fr"]) {
        users["demo@coachpro.fr"] = { name: "Coach Démo", passwordHash: hash("demo123"), createdAt: Date.now() };
        await store.set("cp_users", users);
      }
      const session = await store.get("cp_session");
      if (session && session.email) {
        setUser(session);
        setAuthState("app");
      } else {
        setAuthState("auth");
      }
    })();
  }, []);

  const handleLogin = (userData) => { setUser(userData); setAuthState("app"); };
  const handleLogout = async () => {
    await store.set("cp_session", null);
    setUser(null); setAuthState("auth"); setActiveTab("dashboard");
  };
  const handleUpdateUser = (updated) => setUser(updated);

  const generatePlan = async (client) => {
    setGenerating(true);
    await new Promise(r => setTimeout(r, 1600));
    setGeneratedPlan({
      client: client.name,
      plan: client.goal.includes("masse") || client.goal.includes("Muscu") ? [
        { day: "Lundi", focus: "Chest & Triceps", exercises: ["Développé couché 4×8", "Incliné haltères 3×10", "Dips lestés 3×12", "Pushdown 4×12"] },
        { day: "Mercredi", focus: "Back & Biceps", exercises: ["Tractions lestées 4×6", "Rowing barre 4×8", "Tirage poulie 3×12", "Curl haltères 3×12"] },
        { day: "Vendredi", focus: "Legs & Shoulders", exercises: ["Squat barre 5×5", "Presse 45° 3×12", "Overhead press 4×8", "Élévations lat. 4×15"] },
      ] : [
        { day: "Lundi", focus: "HIIT Cardio", exercises: ["Burpees 4×15", "Jump squats 4×20", "Mountain climbers 3×30s", "Sprint 8×20s"] },
        { day: "Mercredi", focus: "Full Body", exercises: ["Squat goblet 3×15", "Fentes marchées 3×20", "Rowing haltères 3×15", "Gainage 3×45s"] },
        { day: "Vendredi", focus: "Cardio & Core", exercises: ["Elliptique 25min", "Crunchs 4×20", "Planche lat. 3×30s", "Relevés de jambes 3×15"] },
      ]
    });
    setGenerating(false);
  };

  const askAI = async () => {
    if (!aiPrompt.trim()) return;
    setLoadingAi(true); setAiResponse("");
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514", max_tokens: 1000,
          system: "Tu es un assistant expert en coaching sportif fitness et musculation. Tu aides les coachs indépendants à gérer leurs clients, créer des programmes, et optimiser leur business. Réponds de façon concise et pratique en français.",
          messages: [{ role: "user", content: aiPrompt }]
        })
      });
      const data = await res.json();
      setAiResponse(data.content?.find(b => b.type === "text")?.text || "Erreur.");
    } catch { setAiResponse("Erreur de connexion."); }
    setLoadingAi(false);
  };

  const initials = user ? user.name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2) : "?";
  const maxRev = Math.max(...weekRevenue);

  // ── Loading ──────────────────────────────────────────────────────────────────
  if (authState === "loading") return (
    <div style={{
      minHeight: "100vh", background: C.bg, display: "flex",
      alignItems: "center", justifyContent: "center",
      fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
    }}>
      <div style={{ textAlign: "center" }}>
        <div style={{
          width: 48, height: 48, borderRadius: 14, margin: "0 auto 16px",
          background: `linear-gradient(135deg, ${C.accent}, ${C.accent2})`,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 20, fontWeight: 900, color: "white",
          animation: "pulse 1.5s ease-in-out infinite",
        }}>C</div>
        <div style={{ color: C.muted, fontSize: 14 }}>Chargement...</div>
      </div>
      <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.5}}`}</style>
    </div>
  );

  // ── Auth ─────────────────────────────────────────────────────────────────────
  if (authState === "auth") return <AuthScreen onLogin={handleLogin} />;

  // ── App ──────────────────────────────────────────────────────────────────────
  const navItems = [
    { id: "dashboard", icon: "⬡", label: "Vue d'ensemble" },
    { id: "clients", icon: "◈", label: "Mes clients" },
    { id: "programs", icon: "✦", label: "Programmes IA" },
    { id: "assistant", icon: "◉", label: "Assistant IA" },
    { id: "profile", icon: "👤", label: "Mon profil" },
  ];

  return (
    <div style={{
      minHeight: "100vh", background: C.bg,
      fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
      color: C.text, display: "flex",
    }}>
      {/* Sidebar */}
      <div style={{
        width: 220, background: C.surface, borderRight: `1px solid ${C.border}`,
        display: "flex", flexDirection: "column", padding: "24px 0",
        position: "fixed", top: 0, left: 0, bottom: 0, zIndex: 10,
      }}>
        <div style={{ padding: "0 20px 24px", borderBottom: `1px solid ${C.border}` }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{
              width: 34, height: 34, borderRadius: 10,
              background: `linear-gradient(135deg, ${C.accent}, ${C.accent2})`,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 15, fontWeight: 900, color: "white",
            }}>C</div>
            <div>
              <div style={{ fontWeight: 800, fontSize: 15 }}>CoachPro</div>
              <div style={{ fontSize: 10, color: C.muted }}>Dashboard</div>
            </div>
          </div>
        </div>

        <nav style={{ flex: 1, padding: "14px 12px" }}>
          {navItems.map(item => (
            <button key={item.id}
              onClick={() => { setActiveTab(item.id); setSelectedClient(null); setGeneratedPlan(null); }}
              style={{
                width: "100%", display: "flex", alignItems: "center", gap: 10,
                padding: "10px 12px", borderRadius: 10, border: "none",
                background: activeTab === item.id ? "rgba(91,90,255,0.12)" : "transparent",
                color: activeTab === item.id ? "#9b9bff" : C.dim,
                cursor: "pointer", fontSize: 13, fontWeight: activeTab === item.id ? 600 : 400,
                marginBottom: 2, transition: "all 0.2s", textAlign: "left",
                borderLeft: activeTab === item.id ? `2px solid ${C.accent}` : "2px solid transparent",
                fontFamily: "inherit",
              }}>
              <span style={{ fontSize: 15 }}>{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>

        {/* User pill */}
        <div style={{ padding: "14px 16px", borderTop: `1px solid ${C.border}` }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{
              width: 32, height: 32, borderRadius: "50%",
              background: `linear-gradient(135deg, ${C.accent}, ${C.green})`,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 11, fontWeight: 800, color: "white", flexShrink: 0,
            }}>{initials}</div>
            <div style={{ overflow: "hidden" }}>
              <div style={{ fontSize: 12, fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{user?.name}</div>
              <div style={{ fontSize: 10, color: C.green }}>● Actif</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main */}
      <div style={{ marginLeft: 220, flex: 1, padding: "32px" }}>

        {/* DASHBOARD */}
        {activeTab === "dashboard" && (
          <div>
            <div style={{ marginBottom: 28 }}>
              <h1 style={{ fontSize: 24, fontWeight: 800, margin: 0 }}>Bonjour, {user?.name?.split(" ")[0]} 👋</h1>
              <p style={{ color: C.muted, margin: "4px 0 0", fontSize: 13 }}>Voici un résumé de ton activité</p>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14, marginBottom: 20 }}>
              {[
                { label: "Clients actifs", value: "3", color: C.accent },
                { label: "Séances ce mois", value: "24", color: C.green },
                { label: "Revenus (mois)", value: "2 100€", color: C.yellow },
                { label: "Rétention", value: "94%", color: C.orange },
              ].map((k, i) => (
                <div key={i} style={{ background: C.card, borderRadius: 14, padding: 18, border: `1px solid ${C.border}` }}>
                  <div style={{ fontSize: 11, color: C.muted, marginBottom: 6 }}>{k.label}</div>
                  <div style={{ fontSize: 26, fontWeight: 800, color: k.color }}>{k.value}</div>
                </div>
              ))}
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1.6fr 1fr", gap: 14 }}>
              <div style={{ background: C.card, borderRadius: 14, padding: 22, border: `1px solid ${C.border}` }}>
                <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 18 }}>Revenus cette semaine</div>
                <div style={{ display: "flex", alignItems: "flex-end", gap: 8, height: 100 }}>
                  {weekRevenue.map((v, i) => (
                    <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 5 }}>
                      <div style={{ fontSize: 9, color: C.muted }}>{v}€</div>
                      <div style={{
                        width: "100%", borderRadius: "5px 5px 0 0",
                        height: `${(v / maxRev) * 80}px`,
                        background: i === 6 ? `linear-gradient(180deg, ${C.accent}, ${C.accent2})` : C.border,
                      }} />
                      <div style={{ fontSize: 9, color: C.muted }}>{weekDays[i]}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ background: C.card, borderRadius: 14, padding: 22, border: `1px solid ${C.border}` }}>
                <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 14 }}>Clients récents</div>
                {demoClients.slice(0, 3).map(c => (
                  <div key={c.id} style={{
                    display: "flex", alignItems: "center", gap: 10, padding: "8px 0",
                    borderBottom: `1px solid ${C.border}`,
                  }}>
                    <div style={{
                      width: 30, height: 30, borderRadius: 8,
                      background: `${c.color}22`, display: "flex",
                      alignItems: "center", justifyContent: "center",
                      fontSize: 10, fontWeight: 800, color: c.color,
                    }}>{c.avatar}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 12, fontWeight: 600 }}>{c.name}</div>
                      <div style={{ fontSize: 10, color: C.muted }}>{c.goal}</div>
                    </div>
                    <div style={{ fontSize: 11, fontWeight: 700, color: c.color }}>{c.progress}%</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* CLIENTS */}
        {activeTab === "clients" && !selectedClient && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 28 }}>
              <div>
                <h1 style={{ fontSize: 24, fontWeight: 800, margin: 0 }}>Mes clients</h1>
                <p style={{ color: C.muted, margin: "4px 0 0", fontSize: 13 }}>{demoClients.length} clients</p>
              </div>
              <Btn small>+ Nouveau client</Btn>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 14 }}>
              {demoClients.map(c => (
                <div key={c.id} onClick={() => setSelectedClient(c)} style={{
                  background: C.card, borderRadius: 14, padding: 20,
                  border: `1px solid ${C.border}`, cursor: "pointer", transition: "all 0.2s",
                }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = C.accent}
                  onMouseLeave={e => e.currentTarget.style.borderColor = C.border}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
                    <div style={{
                      width: 44, height: 44, borderRadius: 12,
                      background: `${c.color}22`, border: `2px solid ${c.color}44`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 13, fontWeight: 800, color: c.color,
                    }}>{c.avatar}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700, fontSize: 14 }}>{c.name}</div>
                      <div style={{ fontSize: 12, color: C.muted }}>{c.age} ans · {c.goal}</div>
                    </div>
                    <div style={{
                      fontSize: 10, padding: "3px 8px", borderRadius: 6,
                      background: "rgba(0,229,160,0.1)", color: C.green, fontWeight: 600,
                    }}>{c.status}</div>
                  </div>
                  <div style={{ marginBottom: 10 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                      <span style={{ fontSize: 11, color: C.muted }}>Progression</span>
                      <span style={{ fontSize: 11, fontWeight: 700, color: c.color }}>{c.progress}%</span>
                    </div>
                    <div style={{ height: 4, borderRadius: 2, background: C.border, overflow: "hidden" }}>
                      <div style={{ height: "100%", width: `${c.progress}%`, borderRadius: 2, background: c.color }} />
                    </div>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ fontSize: 11, color: C.muted }}>{c.sessions} séances</span>
                    <span style={{ fontSize: 11, color: C.accent }}>🗓 {c.nextSession}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* CLIENT DETAIL */}
        {activeTab === "clients" && selectedClient && (
          <div>
            <button onClick={() => { setSelectedClient(null); setGeneratedPlan(null); }} style={{
              background: "none", border: `1px solid ${C.border}`, borderRadius: 8,
              color: C.dim, cursor: "pointer", padding: "7px 14px", marginBottom: 24,
              fontSize: 12, fontFamily: "inherit",
            }}>← Retour</button>

            <div style={{ display: "flex", gap: 16, alignItems: "center", marginBottom: 24 }}>
              <div style={{
                width: 56, height: 56, borderRadius: 16,
                background: `${selectedClient.color}22`, border: `2px solid ${selectedClient.color}`,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 18, fontWeight: 800, color: selectedClient.color,
              }}>{selectedClient.avatar}</div>
              <div>
                <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800 }}>{selectedClient.name}</h1>
                <div style={{ color: C.muted, fontSize: 13 }}>{selectedClient.age} ans · {selectedClient.goal}</div>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12, marginBottom: 18 }}>
              {[
                { label: "Séances", value: selectedClient.sessions },
                { label: "Progression", value: `${selectedClient.progress}%` },
                { label: "Prochaine séance", value: selectedClient.nextSession },
              ].map((s, i) => (
                <div key={i} style={{ background: C.card, borderRadius: 12, padding: 16, border: `1px solid ${C.border}` }}>
                  <div style={{ fontSize: 11, color: C.muted, marginBottom: 5 }}>{s.label}</div>
                  <div style={{ fontSize: 18, fontWeight: 800, color: selectedClient.color }}>{s.value}</div>
                </div>
              ))}
            </div>

            <div style={{ background: C.card, borderRadius: 14, padding: 22, border: `1px solid ${C.border}` }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
                <div style={{ fontWeight: 700, fontSize: 15 }}>Programme IA</div>
                <Btn small onClick={() => generatePlan(selectedClient)} disabled={generating}>
                  {generating ? "Génération..." : "✦ Générer"}
                </Btn>
              </div>
              {!generatedPlan && !generating && (
                <div style={{ textAlign: "center", padding: 28, color: C.muted, fontSize: 13 }}>
                  Clique sur "Générer" pour créer un programme personnalisé
                </div>
              )}
              {generating && (
                <div style={{ textAlign: "center", padding: 28 }}>
                  <div style={{ fontSize: 13, color: "#9b9bff" }}>✦ Création du programme en cours...</div>
                </div>
              )}
              {generatedPlan && (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10 }}>
                  {generatedPlan.plan.map((day, i) => (
                    <div key={i} style={{ background: C.surface, borderRadius: 10, padding: 14, border: `1px solid ${C.border}` }}>
                      <div style={{ fontSize: 12, fontWeight: 700, color: C.accent, marginBottom: 3 }}>{day.day}</div>
                      <div style={{ fontSize: 10, color: C.muted, marginBottom: 10 }}>{day.focus}</div>
                      {day.exercises.map((ex, j) => (
                        <div key={j} style={{
                          fontSize: 11, padding: "5px 8px", borderRadius: 5,
                          background: C.card, marginBottom: 4, color: C.dim,
                        }}>• {ex}</div>
                      ))}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* PROGRAMS */}
        {activeTab === "programs" && (
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 6 }}>Programmes IA</h1>
            <p style={{ color: C.muted, fontSize: 13, marginBottom: 24 }}>Génère des programmes personnalisés en un clic</p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 14 }}>
              {demoClients.map(c => (
                <div key={c.id} style={{ background: C.card, borderRadius: 14, padding: 20, border: `1px solid ${C.border}` }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
                    <div style={{
                      width: 38, height: 38, borderRadius: 10,
                      background: `${c.color}22`, border: `1px solid ${c.color}44`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 12, fontWeight: 800, color: c.color,
                    }}>{c.avatar}</div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 13 }}>{c.name}</div>
                      <div style={{ fontSize: 11, color: C.muted }}>{c.goal}</div>
                    </div>
                  </div>
                  <button onClick={() => { setSelectedClient(c); setActiveTab("clients"); generatePlan(c); }}
                    style={{
                      width: "100%", background: `rgba(91,90,255,0.1)`,
                      border: `1px solid rgba(91,90,255,0.3)`, borderRadius: 8,
                      color: "#9b9bff", padding: "9px", fontSize: 12,
                      cursor: "pointer", fontWeight: 600, fontFamily: "inherit",
                    }}>✦ Générer programme</button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ASSISTANT */}
        {activeTab === "assistant" && (
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 6 }}>Assistant IA ✦</h1>
            <p style={{ color: C.muted, fontSize: 13, marginBottom: 24 }}>Pose toutes tes questions coaching</p>

            <div style={{ background: C.card, borderRadius: 14, padding: 20, border: `1px solid ${C.border}`, marginBottom: 14 }}>
              <div style={{ fontSize: 12, color: C.muted, marginBottom: 10 }}>Suggestions :</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {["Comment améliorer la rétention client ?", "Programme débutant perte de poids", "Comment fixer mes tarifs ?", "Exercices pour renforcer le dos"].map((q, i) => (
                  <button key={i} onClick={() => setAiPrompt(q)} style={{
                    background: C.surface, border: `1px solid ${C.border}`,
                    borderRadius: 8, padding: "7px 12px", color: C.dim,
                    cursor: "pointer", fontSize: 12, fontFamily: "inherit",
                  }}>{q}</button>
                ))}
              </div>
            </div>

            <div style={{ background: C.card, borderRadius: 14, padding: 20, border: `1px solid ${C.border}` }}>
              <textarea value={aiPrompt} onChange={e => setAiPrompt(e.target.value)}
                placeholder="Pose ta question..."
                style={{
                  width: "100%", minHeight: 80, background: C.surface,
                  border: `1px solid ${C.border}`, borderRadius: 10,
                  color: C.text, padding: 12, fontSize: 13, resize: "vertical",
                  outline: "none", boxSizing: "border-box", fontFamily: "inherit",
                }} />
              <Btn onClick={askAI} disabled={loadingAi || !aiPrompt.trim()} style={{ marginTop: 10 }}>
                {loadingAi ? "Réflexion..." : "✦ Demander"}
              </Btn>
              {aiResponse && (
                <div style={{
                  marginTop: 16, padding: 16, background: C.surface,
                  borderRadius: 10, border: `1px solid rgba(91,90,255,0.3)`,
                  fontSize: 13, lineHeight: 1.7, whiteSpace: "pre-wrap",
                }}>
                  <div style={{ fontSize: 11, color: "#9b9bff", marginBottom: 8, fontWeight: 600 }}>✦ Réponse</div>
                  {aiResponse}
                </div>
              )}
            </div>
          </div>
        )}

        {/* PROFILE */}
        {activeTab === "profile" && (
          <ProfileScreen user={user} onUpdate={handleUpdateUser} onLogout={handleLogout} />
        )}

      </div>
    </div>
  );
}
