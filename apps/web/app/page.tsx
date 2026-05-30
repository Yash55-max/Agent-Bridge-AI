const features = [
  "Generate secure MCP servers from plain English",
  "Deploy, inspect, and stream logs from a single dashboard",
  "Replay sandbox events with a shared event timeline",
]

export default function Page() {
  return (
    <main style={{minHeight:"100vh", padding:"32px clamp(20px, 4vw, 56px)", background:"radial-gradient(circle at top left, rgba(59,130,246,.24), transparent 36%), linear-gradient(180deg, #07111f 0%, #0b1b33 100%)"}}>
      <section style={{maxWidth:1120, margin:"0 auto", display:"grid", gap:32}}>
        <div style={{display:"flex", justifyContent:"space-between", alignItems:"center", gap:16, flexWrap:"wrap"}}>
          <div>
            <div style={{fontSize:12, letterSpacing:"0.18em", textTransform:"uppercase", color:"#7dd3fc"}}>AgentBridge AI</div>
            <h1 style={{fontSize:"clamp(2.8rem, 8vw, 6rem)", lineHeight:0.95, margin:"14px 0 12px", maxWidth:10}}>Ship MCP servers faster.</h1>
            <p style={{maxWidth:680, fontSize:18, lineHeight:1.7, color:"#bfd0ea"}}>
              A monorepo foundation for generating, deploying, and operating secure MCP servers with a clean dashboard and a future-ready sandbox.
            </p>
          </div>
          <div style={{display:"flex", gap:12, flexWrap:"wrap"}}>
            <a href="/api/auth/signin" style={{padding:"12px 18px", borderRadius:999, background:"#38bdf8", color:"#04111f", textDecoration:"none", fontWeight:700}}>Sign in</a>
            <a href="/dashboard" style={{padding:"12px 18px", borderRadius:999, border:"1px solid rgba(148,163,184,.35)", color:"#e5eefc", textDecoration:"none", fontWeight:600}}>Open dashboard</a>
          </div>
        </div>

        <div style={{display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(220px, 1fr))", gap:18}}>
          {features.map((feature) => (
            <article key={feature} style={{padding:20, borderRadius:20, background:"rgba(15,23,42,.72)", border:"1px solid rgba(148,163,184,.14)", boxShadow:"0 24px 80px rgba(2,6,23,.25)"}}>
              <p style={{margin:0, color:"#f8fbff", fontSize:16, lineHeight:1.6}}>{feature}</p>
            </article>
          ))}
        </div>

        <div style={{display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(280px, 1fr))", gap:20}}>
          <section style={{padding:24, borderRadius:24, background:"rgba(2,6,23,.55)", border:"1px solid rgba(148,163,184,.14)"}}>
            <h2 style={{marginTop:0}}>Foundation complete</h2>
            <p style={{color:"#bfd0ea", lineHeight:1.7}}>
              The workspace now has a Next.js app shell, auth entry points, dashboard navigation, and backend infrastructure ready for local development.
            </p>
          </section>
          <section style={{padding:24, borderRadius:24, background:"rgba(2,6,23,.55)", border:"1px solid rgba(148,163,184,.14)"}}>
            <h2 style={{marginTop:0}}>What to do next</h2>
            <p style={{color:"#bfd0ea", lineHeight:1.7}}>
              Add a server, generate code, and watch the deployment and sandbox flows grow on top of this foundation.
            </p>
          </section>
        </div>
      </section>
    </main>
  )
}
