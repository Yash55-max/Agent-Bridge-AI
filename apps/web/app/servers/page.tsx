"use client"
import { useEffect, useState } from "react"

export default function ServersPage(){
  const [servers, setServers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(()=>{
    async function load(){
      try{
        const r = await fetch('http://localhost:8000/api/v1/servers')
        const j = await r.json()
        setServers(j || [])
      }catch(e){
        console.error(e)
        setServers([])
      }finally{setLoading(false)}
    }
    load()
  },[])

  return (
    <main style={{padding:24}}>
      <h1>Servers</h1>
      {loading ? <p>Loading...</p> : (
        <ul>
          {servers.map(s=> (
            <li key={s.id} style={{marginBottom:12}}>
              <a href={`/servers/${s.id}`}>{s.name}</a> — <small>{s.status}</small>
            </li>
          ))}
        </ul>
      )}
    </main>
  )
}
