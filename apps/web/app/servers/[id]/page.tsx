"use client"
import { useEffect, useState } from "react"

export default function ServerDetailPage(){
  const [server, setServer] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [toolName, setToolName] = useState("")
  const [toolArgs, setToolArgs] = useState("{}")
  const [toolResult, setToolResult] = useState<any>(null)

  useEffect(()=>{
    const parts = window.location.pathname.split('/')
    const id = parts[parts.length-1]
    async function load(){
      try{
        const r = await fetch(`http://localhost:8000/api/v1/servers/${id}`)
        if(r.status===200){
          const j = await r.json()
          setServer(j)
        }else{
          setServer(null)
        }
      }catch(e){
        console.error(e)
      }finally{setLoading(false)}
    }
    load()
  },[])

  async function callTool(){
    if(!server) return
    try{
      const payload = JSON.parse(toolArgs)
      const r = await fetch(`http://localhost:8000/api/v1/servers/${server.id}/test-tool`, {
        method:'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify(payload)
      })
      const j = await r.json()
      setToolResult(j)
    }catch(e){
      setToolResult({error: String(e)})
    }
  }

  return (
    <main style={{padding:24}}>
      <h1>Server</h1>
      {loading && <p>Loading...</p>}
      {!loading && !server && <p>Server not found.</p>}
      {server && (
        <div>
          <h2>{server.name}</h2>
          <p>Status: {server.status}</p>
          <h3>Generated code</h3>
          <pre style={{background:'#0b1220', color:'#d1d5db', padding:12, whiteSpace:'pre-wrap'}}>{server.generated_code}</pre>

          <h3 style={{marginTop:16}}>Tool Console (manual)</h3>
          <div>
            <label>Tool args (JSON)</label>
            <textarea value={toolArgs} onChange={e=>setToolArgs(e.target.value)} rows={6} style={{width:'100%'}} />
            <div style={{marginTop:8}}>
              <button onClick={callTool}>Invoke tool</button>
            </div>
            <h4 style={{marginTop:12}}>Result</h4>
            <pre style={{background:'#0b1220', color:'#d1d5db', padding:12}}>{JSON.stringify(toolResult, null, 2)}</pre>
          </div>
        </div>
      )}
    </main>
  )
}
