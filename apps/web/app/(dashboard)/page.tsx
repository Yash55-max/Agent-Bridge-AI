const cards = [
  { label: "Projects", value: "1 workspace", detail: "Foundation ready for project-level organization." },
  { label: "Servers", value: "Local + deploy", detail: "List, inspect, and operate MCP servers." },
  { label: "Sandbox", value: "Replay ready", detail: "Timeline and event replay are already wired in." },
]

export default function DashboardPage() {
  return (
    <main style={{display:"grid", gap:20}}>
      <header>
        <div style={{fontSize:12, letterSpacing:"0.18em", textTransform:"uppercase", color:"#7dd3fc"}}>Phase 1 foundation</div>
        <h1 style={{fontSize:"clamp(2rem, 5vw, 3.5rem)", margin:"10px 0 8px"}}>Dashboard shell</h1>
        <p style={{maxWidth:720, color:"#bfd0ea", lineHeight:1.7}}>
          The app now has the core layout, routing, and foundation services needed for the rest of the product roadmap.
        </p>
      </header>

      <section style={{display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(220px, 1fr))", gap:16}}>
        {cards.map((card) => (
          <article key={card.label} style={{padding:20, borderRadius:20, background:"rgba(15,23,42,.72)", border:"1px solid rgba(148,163,184,.14)"}}>
            <div style={{color:"#7dd3fc", fontSize:14}}>{card.label}</div>
            <div style={{fontSize:28, fontWeight:800, margin:"10px 0"}}>{card.value}</div>
            <p style={{margin:0, color:"#bfd0ea", lineHeight:1.7}}>{card.detail}</p>
          </article>
        ))}
      </section>
    </main>
  )
}
