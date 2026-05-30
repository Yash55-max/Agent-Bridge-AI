export const metadata = {
  title: "AgentBridge AI",
  description: "Generate MCP servers and manage them from a modern dashboard.",
}

export default function RootLayout({children}:{children:React.ReactNode}){
  return (
    <html lang="en">
      <body style={{margin:0, background:"#07111f", color:"#e5eefc", fontFamily:"Inter, system-ui, sans-serif"}}>
        {children}
      </body>
    </html>
  )
}
