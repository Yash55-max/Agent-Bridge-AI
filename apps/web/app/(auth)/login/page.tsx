const buttonStyle = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "12px 16px",
  borderRadius: 14,
  textDecoration: "none",
  fontWeight: 700,
} as const

export default function LoginPage(){
  return (
    <main style={{minHeight:"100vh", display:"grid", placeItems:"center", padding:24, background:"linear-gradient(180deg, #07111f 0%, #0b1b33 100%)"}}>
      <section style={{width:"min(100%, 540px)", padding:28, borderRadius:28, background:"rgba(15,23,42,.9)", border:"1px solid rgba(148,163,184,.18)", boxShadow:"0 30px 100px rgba(2,6,23,.35)"}}>
        <div style={{fontSize:12, letterSpacing:"0.18em", textTransform:"uppercase", color:"#7dd3fc"}}>AgentBridge AI</div>
        <h1 style={{fontSize:"clamp(2rem, 5vw, 3rem)", margin:"12px 0 10px"}}>Sign in to continue</h1>
        <p style={{margin:0, color:"#bfd0ea", lineHeight:1.7}}>
          NextAuth is wired for GitHub and Google provider entry points. Configure the client secrets in your environment to enable full OAuth flow.
        </p>
        <div style={{display:"grid", gap:12, marginTop:24}}>
          <a href="/api/auth/signin/github" style={{...buttonStyle, background:"#24292f", color:"#fff"}}>Continue with GitHub</a>
          <a href="/api/auth/signin/google" style={{...buttonStyle, background:"#fff", color:"#111827"}}>Continue with Google</a>
        </div>
      </section>
    </main>
  )
}
