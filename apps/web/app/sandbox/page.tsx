"use client"
import { useState, useEffect, useRef } from "react"

export default function SandboxPage(){
  const [agents, setAgents] = useState([])
  const [agentName, setAgentName] = useState("")
  const [session, setSession] = useState(null)
  const [events, setEvents] = useState([])
  const wsRef = useRef(null)

  function addAgent(){
    if(!agentName) return
    setAgents(a=>[...a, {name: agentName, role:'', goal:''}])
    setAgentName("")
  }

  async function start(){
    const res = await fetch("http://localhost:8000/api/v1/sandbox/start", {
      method:'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({server_url: 'http://localhost:9000', agents})
    })
    const j = await res.json()
    setSession(j.session_id)
    // poll events
    const iv = setInterval(async ()=>{
      const r = await fetch(`http://localhost:8000/api/v1/sandbox/${j.session_id}/events`)
      const data = await r.json()
      setEvents(data.events || [])
    }, 800)
  }

  return (
    <main style={{padding:24}}>
      <h1>Sandbox (demo)</h1>
      <div>
        <input value={agentName} onChange={e=>setAgentName(e.target.value)} placeholder="Agent name" />
        <button onClick={addAgent}>Add agent</button>
      </div>
      <div style={{marginTop:12}}>
        <button onClick={start} disabled={agents.length===0}>Start Simulation</button>
      </div>
      <h3 style={{marginTop:16}}>Agents</h3>
      <ul>
        {agents.map((a, i)=> <li key={i}>{a.name}</li>)}
      </ul>
      <h3 style={{marginTop:16}}>Events</h3>
      <pre style={{background:'#0b1220', color:'#d1d5db', padding:12}}>{JSON.stringify(events, null, 2)}</pre>
    </main>
  )
}
