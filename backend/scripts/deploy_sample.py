import urllib.request, json
url='http://127.0.0.1:8000/api/v1/preview/deploy'
payload={
  'server_name':'calculator',
  'generated_code':"from fastapi import FastAPI\napp=FastAPI()\n@app.post('/add')\ndef add(a: float,b: float):\n    return {'result': a+b}\n@app.post('/multiply')\ndef multiply(a: float,b: float):\n    return {'result': a*b}"
}
req=urllib.request.Request(url, data=json.dumps(payload).encode('utf-8'), headers={'Content-Type':'application/json'})
resp=urllib.request.urlopen(req)
print(resp.read().decode())
