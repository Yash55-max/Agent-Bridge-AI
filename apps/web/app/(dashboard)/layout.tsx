import React from 'react'

export default function DashboardLayout({children}:{children:React.ReactNode}){
  return (
    <div style={{display:'flex', minHeight:'100vh', background:'#07111f', color:'#e5eefc'}}>
      <aside style={{width:260, padding:20, borderRight:'1px solid rgba(148,163,184,.14)', background:'rgba(2,6,23,.78)'}}>
        <h2 style={{marginTop:0}}>AgentBridge</h2>
        <p style={{color:'#94a3b8', lineHeight:1.6}}>Navigation for the generation, deployment, and sandbox workflows.</p>
        <nav>
          <ul style={{listStyle:'none', padding:0, display:'grid', gap:10}}>
            <li><a href="/dashboard" style={{color:'#fff', textDecoration:'none'}}>Dashboard</a></li>
            <li><a href="/generator" style={{color:'#fff', textDecoration:'none'}}>Generator</a></li>
            <li><a href="/sandbox" style={{color:'#fff', textDecoration:'none'}}>Sandbox</a></li>
            <li><a href="/servers" style={{color:'#fff', textDecoration:'none'}}>Servers</a></li>
          </ul>
        </nav>
      </aside>
      <section style={{flex:1, padding:24}}>
        {children}
      </section>
    </div>
  )
}
