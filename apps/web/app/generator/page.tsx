"use client"
import { useState } from "react"

export default function GeneratorPage(){
  const [desc, setDesc] = useState("")
  const [loading, setLoading] = useState(false)
  const [code, setCode] = useState("# Generated code will appear here")

  async function doGenerate(){
    setLoading(true)
    try{
      const res = await fetch("http://localhost:8000/api/v1/generate", {
        method: "POST",
        headers: {"Content-Type":"application/json"},
        body: JSON.stringify({description: desc})
      })
      const j = await res.json()
      setCode(j.generated_code || "# no code returned")
    }catch(e){
      setCode(`# error: ${e}`)
    }finally{
      setLoading(false)
    }
  }

  return (
    <main style={{padding:24}}>
      <h1>Generator</h1>
      <textarea value={desc} onChange={e=>setDesc(e.target.value)} rows={6} style={{width:'100%'}} placeholder="Describe the MCP server..." />
      <div style={{marginTop:8}}>
        <button onClick={doGenerate} disabled={loading}>{loading? 'Generating...':'Generate'}</button>
      </div>
      <h2 style={{marginTop:16}}>Preview</h2>
      <pre style={{background:'#0b1220', color:'#d1d5db', padding:12}}>{code}</pre>
    </main>
  )
}
