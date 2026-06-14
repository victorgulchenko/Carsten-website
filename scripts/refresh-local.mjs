// Stößt den Tages-Refresh lokal an (Dev-Server muss laufen: npm run dev).
// Aufruf: npm run refresh
const base = process.env.BASE_URL || 'http://localhost:3000'
try {
  const res = await fetch(`${base}/api/refresh`)
  const text = await res.text()
  console.log(`→ ${base}/api/refresh  [${res.status}]`)
  console.log(text)
} catch (err) {
  console.error(`Konnte ${base}/api/refresh nicht erreichen. Läuft "npm run dev"?`)
  console.error(String(err))
  process.exit(1)
}
