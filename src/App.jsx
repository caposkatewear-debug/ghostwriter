import { useState, useRef, useEffect } from "react";

const BASE_SYSTEM = `You write original rap lyrics in Playboi Carti's voice.

STYLE REFERENCE — learn the voice, do not copy these lines:
- keys to the phantom keys to the wraith
- my feet hurt yeah i been steppin on these niggas
- draco made it eat his face
- 7.62s yeah yeah hoppin out the truck
- i go tom cruise hol up bitch im on a mission
- i cant come to your party i might come just to hurt you
- bodeine brazy bitch its mud in my cup
- sippin that codeine til my heart stop i dont even fuck with my papa
- when i got my first check got my crib for mama
- homixide devil yeah bitch thats my next tat
- beno pop out flip the switch like a lamp

TARGET QUALITY — these are unreleased lines, this is the bar:
- wraith sport gon leave you dry this mf choppa got two meanings fly or die
- im in miami with a freaky lil bih bitch know im ATL niggas know im YVL
- brand new mille cost me a mille
- this 7.62 gon leave your motherfucking door red
- glock no mods i still killed that pussy ass nigga
- opps tryna run i killed em
- ima killer double O nigga got low
- blicky got shot
- nigga want a cross upside down i gave him a new one
- pendulum bitch i bet he a true one
- got shot down out the sky i thought i got 2 on em

RULES:
1. Specific nouns always — wraith sport not wraith, 7.62 not gun, blicky not pistol
2. Facts stated flat. Zero metaphors. Zero similes. Never "like a", never "im like"
3. Broken syntax, rushed, mid-thought — like a voice memo not a poem
4. Double meanings never explain themselves — write it and leave
5. Identity dropped as fact: "ima killer" not "i feel like a killer"
6. Small humble details hit harder than big claims: "glock no mods i still killed"
7. Lines do NOT connect to each other — each is isolated
8. Never explain, never conclude, never summarize
9. Lines can be 4 words. Shorter is harder
10. Do NOT write an outro that is just adlibs — the outro needs real lines too
11. CRITICAL: Every generation must be completely different. Never reuse structure, never reuse line patterns from previous outputs

BANNED FOREVER:
dripping, drip, we move like, in the field, on sight, no cap, real ones, like a king, like a god, like a demon, goated, different breed, built different, cold world, stay solid, loyalty, grinding, blessed, manifesting, elevating`;

const VIBES = [
  { id: "v1", label: "Music V1" },
  { id: "v2", label: "Music V2 / Cave Era" },
  { id: "v3", label: "Music V3" },
];

const VIBE_SYSTEM = {
  v1: `ERA: Music V1 — early raw Carti. Short choppy lines. Paranoid energy. Less polished. Simpler adlibs. More street, less vampire. Structure is looser — can skip bridge, can have a pre-chorus instead. Verse lines feel like stream of consciousness. Do NOT use King Vamp references — this predates that.`,
  v2: `ERA: Music V2 / Cave Era — peak cave Carti. King Vamp energy. Homixide gang. Gothic dark luxury. Lines are more confident and declarative. References: Vlone, Margiela, chrome hearts, SIG, Draco, Rolls. Structure has intro + hook + verse + hook. Adlibs are heavier and more frequent.`,
  v3: `ERA: Music V3 — final cave era. Most alien and ethereal. Lines are sparse and strange. Sometimes a line is just a sound or a feeling. References to stars, night, dark, cold. Cars are hypercars. Violence is very matter of fact. Structure is experimental — can have a refrain that isn't the title. Adlibs are minimal, just (uh) (yeah) mostly.`,
};

export default function Ghostwriter() {
  const [songTitle, setSongTitle] = useState("");
  const [vibe, setVibe] = useState("v2");
  const [swamp, setSwamp] = useState(true);
  const [lyrics, setLyrics] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [blockedWords, setBlockedWords] = useState(["dripping","drip","we move like","like a king","like a god","goated","built different","cold world","blessed","grinding"]);
  const [wantedWords, setWantedWords] = useState(["Homixide","schyeah","blicky","Margiela","zaza"]);
  const [blockInput, setBlockInput] = useState("");
  const [wantInput, setWantInput] = useState("");
  const lyricsRef = useRef(null);

  async function generate() {
    const title = songTitle.trim();
    if (!title) return;
    setLoading(true);
    setError("");
    setLyrics("");

    const swampNote = swamp
      ? `SWAMP IZZO ON: Include Swamp Izzo adlibs in parentheses scattered through the song — not on every single line, maybe every 2-4 lines. Vocab: (King Vamp lets go) (Homixide Homixide) (Young Guapo) (Schyeah) (Hahaha) (Mr Anti himself) (lets go back in) (Unstoppable) (Woah woah woah) (Thousand horsepower). Label sections with "& Swamp Izzo".`
      : `SWAMP IZZO OFF: No Swamp Izzo adlibs at all. Only occasional Carti self-adlibs: (uh) (yeah) (ah) (hol up) (schyeah). Keep adlibs sparse — not on every line.`;

    const blockNote = blockedWords.length > 0
      ? `BLOCKED WORDS — never use these: ${blockedWords.join(", ")}`
      : "";

    const wantNote = wantedWords.length > 0
      ? `WANTED WORDS/PHRASES — try to naturally work some of these in: ${wantedWords.join(", ")}`
      : "";

    const seed = Math.random().toString(36).slice(2, 8);

    const system = `${BASE_SYSTEM}\n\n${VIBE_SYSTEM[vibe]}\n\n${swampNote}\n\n${blockNote}\n\n${wantNote}\n\nVariation seed: ${seed} — use this to ensure this output is completely unique from any previous generation.\n\nOutput ONLY raw lyrics. Section labels in [brackets]. Adlibs in (parentheses). No explanations, no notes, no metadata.`;

    try {
      const resp = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-6",
          max_tokens: 1024,
          system,
          messages: [{
            role: "user",
            content: `Write a full original song called "${title}". Make the structure varied and authentic to the era. Every line must be completely fresh — no recycled patterns.`
          }],
        }),
      });

      if (!resp.ok) {
        const txt = await resp.text();
        setError(`API error ${resp.status}: ${txt.slice(0, 200)}`);
        setLoading(false);
        return;
      }

      const data = await resp.json();
      if (data.content?.[0]?.text) {
        setLyrics(data.content[0].text);
      } else {
        setError(`Unexpected: ${JSON.stringify(data).slice(0, 200)}`);
      }
    } catch (e) {
      setError(`Network error: ${e.message}`);
    }
    setLoading(false);
  }

  function copy() {
    if (!lyricsRef.current) return;
    const text = lyricsRef.current.innerText;
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    }).catch(() => {
      const ta = document.createElement("textarea");
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  }

  function addBlocked() {
    const w = blockInput.trim();
    if (w && !blockedWords.includes(w)) setBlockedWords([...blockedWords, w]);
    setBlockInput("");
  }

  function addWanted() {
    const w = wantInput.trim();
    if (w && !wantedWords.includes(w)) setWantedWords([...wantedWords, w]);
    setWantInput("");
  }

  const Tag = ({ word, onRemove, color }) => (
    <div style={{
      display: "inline-flex", alignItems: "center", gap: 6,
      background: color === "red" ? "rgba(160,40,40,0.12)" : "rgba(40,100,60,0.12)",
      border: `0.5px solid ${color === "red" ? "rgba(160,40,40,0.25)" : "rgba(40,140,70,0.25)"}`,
      borderRadius: 6, padding: "4px 10px", fontSize: 10,
      color: color === "red" ? "#a06060" : "#60a070",
      fontFamily: "'DM Mono', monospace", letterSpacing: "0.05em",
    }}>
      {word}
      <span onClick={onRemove} style={{ cursor: "pointer", opacity: 0.6, fontSize: 12, lineHeight: 1 }}>×</span>
    </div>
  );

  return (
    <div style={{
      minHeight: "100vh", background: "#050505",
      fontFamily: "'DM Mono', monospace", color: "#e0e0e0",
      padding: "48px 24px 80px", position: "relative", overflowX: "hidden",
    }}>
      <div style={{ position: "fixed", width: 600, height: 600, borderRadius: "50%", background: "#12122a", filter: "blur(130px)", opacity: 0.35, top: -200, left: -200, pointerEvents: "none", zIndex: 0 }} />
      <div style={{ position: "fixed", width: 400, height: 400, borderRadius: "50%", background: "#0a0a1a", filter: "blur(110px)", opacity: 0.3, bottom: -150, right: -150, pointerEvents: "none", zIndex: 0 }} />

      {/* settings panel */}
      <div style={{
        position: "fixed", top: 0, right: 0, width: settingsOpen ? 320 : 0,
        height: "100vh", background: "#0a0a12",
        borderLeft: "0.5px solid rgba(255,255,255,0.07)",
        zIndex: 100, overflow: "hidden",
        transition: "width 0.3s cubic-bezier(0.4,0,0.2,1)",
        display: "flex", flexDirection: "column",
      }}>
        <div style={{ padding: "24px 20px", overflowY: "auto", flex: 1, opacity: settingsOpen ? 1 : 0, transition: "opacity 0.2s" }}>
          <div style={{ fontSize: 9, letterSpacing: "0.3em", color: "#444", textTransform: "uppercase", marginBottom: 28 }}>Settings</div>

          {/* blocked words */}
          <div style={{ marginBottom: 24 }}>
            <div style={{ fontSize: 9, letterSpacing: "0.2em", color: "#a06060", textTransform: "uppercase", marginBottom: 12 }}>Blocked Words</div>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 10, minHeight: 28 }}>
              {blockedWords.map(w => (
                <Tag key={w} word={w} color="red" onRemove={() => setBlockedWords(blockedWords.filter(x => x !== w))} />
              ))}
            </div>
            <div style={{ display: "flex", gap: 6 }}>
              <input
                value={blockInput}
                onChange={e => setBlockInput(e.target.value)}
                onKeyDown={e => e.key === "Enter" && addBlocked()}
                placeholder="add word..."
                style={{
                  flex: 1, background: "rgba(255,255,255,0.03)",
                  border: "0.5px solid rgba(255,255,255,0.07)", borderRadius: 7,
                  padding: "7px 10px", fontFamily: "'DM Mono', monospace",
                  fontSize: 11, color: "#aaa", outline: "none",
                }}
              />
              <button onClick={addBlocked} style={{
                background: "rgba(160,40,40,0.15)", border: "0.5px solid rgba(160,40,40,0.3)",
                borderRadius: 7, padding: "7px 12px", fontFamily: "'DM Mono', monospace",
                fontSize: 10, color: "#a06060", cursor: "pointer",
              }}>+</button>
            </div>
          </div>

          {/* wanted words */}
          <div>
            <div style={{ fontSize: 9, letterSpacing: "0.2em", color: "#60a070", textTransform: "uppercase", marginBottom: 12 }}>Wanted Words</div>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 10, minHeight: 28 }}>
              {wantedWords.map(w => (
                <Tag key={w} word={w} color="green" onRemove={() => setWantedWords(wantedWords.filter(x => x !== w))} />
              ))}
            </div>
            <div style={{ display: "flex", gap: 6 }}>
              <input
                value={wantInput}
                onChange={e => setWantInput(e.target.value)}
                onKeyDown={e => e.key === "Enter" && addWanted()}
                placeholder="add word..."
                style={{
                  flex: 1, background: "rgba(255,255,255,0.03)",
                  border: "0.5px solid rgba(255,255,255,0.07)", borderRadius: 7,
                  padding: "7px 10px", fontFamily: "'DM Mono', monospace",
                  fontSize: 11, color: "#aaa", outline: "none",
                }}
              />
              <button onClick={addWanted} style={{
                background: "rgba(40,100,60,0.15)", border: "0.5px solid rgba(40,140,70,0.3)",
                borderRadius: 7, padding: "7px 12px", fontFamily: "'DM Mono', monospace",
                fontSize: 10, color: "#60a070", cursor: "pointer",
              }}>+</button>
            </div>
          </div>
        </div>
      </div>

      {/* gear button */}
      <div
        onClick={() => setSettingsOpen(!settingsOpen)}
        style={{
          position: "fixed", top: 20, right: 20, zIndex: 200,
          width: 36, height: 36, borderRadius: "50%",
          background: settingsOpen ? "rgba(255,255,255,0.08)" : "rgba(255,255,255,0.03)",
          border: `0.5px solid ${settingsOpen ? "rgba(255,255,255,0.15)" : "rgba(255,255,255,0.07)"}`,
          display: "flex", alignItems: "center", justifyContent: "center",
          cursor: "pointer", transition: "all 0.2s",
        }}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={settingsOpen ? "#c8c8d8" : "#444"} strokeWidth="1.5" style={{ transition: "all 0.3s", transform: settingsOpen ? "rotate(90deg)" : "rotate(0deg)" }}>
          <circle cx="12" cy="12" r="3"/>
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
        </svg>
      </div>

      <div style={{ position: "relative", zIndex: 1, maxWidth: 660, margin: "0 auto" }}>

        <div style={{ textAlign: "center", marginBottom: 52 }}>
          <div style={{ fontSize: 9, letterSpacing: "0.4em", color: "#333", textTransform: "uppercase", marginBottom: 10 }}>Ghostwriter</div>
          <div style={{ fontSize: 9, letterSpacing: "0.15em", color: "#2a2a2a", textTransform: "uppercase" }}>carti style</div>
        </div>

        <div style={{ marginBottom: 12 }}>
          <input
            value={songTitle}
            onChange={e => setSongTitle(e.target.value)}
            onKeyDown={e => e.key === "Enter" && generate()}
            placeholder="song title..."
            style={{
              width: "100%", background: "rgba(255,255,255,0.02)",
              border: "0.5px solid rgba(255,255,255,0.07)", borderRadius: 14,
              padding: "18px 22px", fontFamily: "'DM Mono', monospace",
              fontSize: 22, fontWeight: 700, color: "#e0e0e0",
              letterSpacing: "0.04em", outline: "none", transition: "border-color 0.2s",
            }}
            onFocus={e => e.target.style.borderColor = "rgba(255,255,255,0.15)"}
            onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.07)"}
          />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8, marginBottom: 12 }}>
          {VIBES.map(v => (
            <div key={v.id} onClick={() => setVibe(v.id)} style={{
              background: vibe === v.id ? "rgba(200,200,220,0.05)" : "rgba(255,255,255,0.02)",
              border: `0.5px solid ${vibe === v.id ? "rgba(200,200,220,0.18)" : "rgba(255,255,255,0.05)"}`,
              borderRadius: 10, padding: "11px 8px", cursor: "pointer", textAlign: "center",
              color: vibe === v.id ? "#c8c8d8" : "#383838",
              fontSize: 10, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase",
              transition: "all 0.15s", fontFamily: "'DM Mono', monospace",
            }}>
              {v.label}
            </div>
          ))}
        </div>

        <div onClick={() => setSwamp(!swamp)} style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          background: "rgba(255,255,255,0.02)",
          border: `0.5px solid ${swamp ? "rgba(255,255,255,0.12)" : "rgba(255,255,255,0.05)"}`,
          borderRadius: 12, padding: "13px 18px", cursor: "pointer",
          marginBottom: 12, transition: "all 0.2s",
        }}>
          <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: "0.15em", textTransform: "uppercase", color: swamp ? "#a0a0b8" : "#333", fontFamily: "'DM Mono', monospace", transition: "color 0.2s" }}>
            Swamp Izzo
          </div>
          <div style={{ width: 36, height: 20, background: swamp ? "rgba(200,200,220,0.2)" : "rgba(255,255,255,0.06)", borderRadius: 100, position: "relative", transition: "background 0.2s" }}>
            <div style={{ width: 13, height: 13, background: swamp ? "#c8c8d8" : "#333", borderRadius: "50%", position: "absolute", top: 3.5, left: swamp ? 20 : 3, transition: "left 0.2s, background 0.2s" }} />
          </div>
        </div>

        <button onClick={generate} disabled={loading || !songTitle.trim()} style={{
          width: "100%", padding: "15px",
          background: "rgba(255,255,255,0.04)", border: "0.5px solid rgba(255,255,255,0.09)",
          borderRadius: 13, fontFamily: "'DM Mono', monospace",
          fontSize: 11, fontWeight: 700, letterSpacing: "0.22em", textTransform: "uppercase",
          color: (loading || !songTitle.trim()) ? "#2a2a2a" : "#a0a0b8",
          cursor: (loading || !songTitle.trim()) ? "not-allowed" : "pointer", transition: "all 0.2s",
        }}>
          {loading ? "..." : "Generate"}
        </button>

        {error && (
          <div style={{ marginTop: 12, padding: "10px 14px", background: "rgba(160,40,40,0.08)", border: "0.5px solid rgba(160,40,40,0.2)", borderRadius: 10, fontSize: 10, color: "#a06060", fontFamily: "monospace", wordBreak: "break-all" }}>
            {error}
          </div>
        )}

        {(lyrics || loading) && (
          <div style={{ marginTop: 14, background: "rgba(255,255,255,0.015)", border: "0.5px solid rgba(255,255,255,0.06)", borderRadius: 16, overflow: "hidden" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "13px 18px", borderBottom: "0.5px solid rgba(255,255,255,0.04)" }}>
              <div style={{ fontSize: 9, letterSpacing: "0.22em", color: "#3a3a3a", textTransform: "uppercase" }}>
                {songTitle.toUpperCase()}
              </div>
              {lyrics && (
                <button onClick={copy} style={{
                  background: "none", border: "0.5px solid rgba(255,255,255,0.07)",
                  borderRadius: 6, padding: "4px 12px",
                  fontFamily: "'DM Mono', monospace", fontSize: 9,
                  color: copied ? "#6a8a6a" : "#3a3a3a",
                  cursor: "pointer", letterSpacing: "0.12em", textTransform: "uppercase", transition: "color 0.15s",
                }}>
                  {copied ? "copied" : "copy"}
                </button>
              )}
            </div>
            <div ref={lyricsRef} style={{ padding: "24px 20px", fontSize: 13, lineHeight: 2, color: "#686878", whiteSpace: "pre-wrap", minHeight: 160 }}>
              {loading
                ? <div style={{ display: "flex", gap: 5, paddingTop: 16 }}>
                    {[0,1,2].map(i => <div key={i} style={{ width: 4, height: 4, borderRadius: "50%", background: "#444", animation: "p 1.2s infinite", animationDelay: `${i*0.2}s` }} />)}
                  </div>
                : lyrics
              }
            </div>
          </div>
        )}
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500;700&display=swap');
        @keyframes p { 0%,80%,100%{opacity:0.2;transform:scale(0.7)} 40%{opacity:1;transform:scale(1)} }
        input::placeholder { color: #222; }
        button:hover:not(:disabled) { opacity: 0.8; }
      `}</style>
    </div>
  );
}
