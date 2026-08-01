# KörperJa Freude-Code – Netlify-Deployment

## Warum es vorher nicht ging
Dein HTML-Tool hat die Anthropic-API direkt aus dem Browser heraus aufgerufen.
Das funktioniert aus zwei Gründen nicht:
1. Es wurde gar kein API-Schlüssel mitgeschickt (auf claude.ai übernimmt das
   die Plattform automatisch im Hintergrund – das geht aber nur dort).
2. Anthropic blockiert direkte Browser-Aufrufe an ihre API aus Sicherheitsgründen
   (CORS) – und selbst wenn es ginge, dürfte der Schlüssel niemals im
   Frontend-Code stehen, da ihn sonst jeder über "Seitenquelltext anzeigen"
   auslesen könnte.

## Die Lösung: eine Netlify Function als sicherer Vermittler
Diese Dateien sind bereits fertig aufgesetzt:
- `index.html` – dein Tool (ruft jetzt `/.netlify/functions/analyze` auf)
- `netlify/functions/analyze.js` – läuft serverseitig bei Netlify, hält den
  API-Schlüssel geheim und leitet die Anfrage an Anthropic weiter
- `netlify.toml` – sagt Netlify, wo die Function liegt

## Schritt-für-Schritt (WICHTIG: nicht per Drag & Drop!)

⚠️ Der 404-Fehler bei dir kam vermutlich genau daher: Netlifys einfaches
**Drag & Drop** im Dashboard veröffentlicht nur die statischen Dateien
(HTML/CSS/JS) – die `netlify/functions/analyze.js` wird dabei oft NICHT mit
eingerichtet. Das ist eine bekannte Einschränkung von Netlify, kein Fehler
von dir. Für Functions brauchst du einen der folgenden zwei Wege:

### Weg A – Netlify CLI (empfohlen, dauert ca. 5 Minuten)

1. Falls noch nicht vorhanden: [Node.js](https://nodejs.org) installieren.
2. Terminal öffnen (Mac: "Terminal"-App, Windows: "Eingabeaufforderung"),
   in den entpackten Ordner wechseln, z.B.:
   ```
   cd Downloads/koerperja-netlify
   ```
3. Netlify CLI installieren:
   ```
   npm install -g netlify-cli
   ```
4. Bei Netlify einloggen (öffnet den Browser):
   ```
   netlify login
   ```
5. Mit deiner bestehenden Netlify-Seite verknüpfen:
   ```
   netlify link
   ```
   (wähle deine bereits erstellte Seite aus der Liste aus)
6. Deployen:
   ```
   netlify deploy --prod
   ```
7. Im Terminal sollte jetzt auch "Functions" mit `analyze` aufgelistet werden
   – damit ist sichergestellt, dass sie wirklich mit hochgeladen wurde.

### Weg B – GitHub-Repository verbinden (Alternative)

1. Einen kostenlosen [GitHub](https://github.com)-Account anlegen (falls noch
   nicht vorhanden) und ein neues Repository erstellen.
2. Alle Dateien aus diesem Ordner (inkl. `netlify/`-Unterordner) dort
   hochladen ("Upload files" im Browser reicht).
3. Im Netlify-Dashboard: **Add new site → Import an existing project** und
   das GitHub-Repository auswählen. Netlify baut die Seite dann automatisch
   inkl. Functions.

### Nach Weg A oder B: API-Schlüssel hinterlegen

1. **API-Schlüssel als Umgebungsvariable hinterlegen** (NICHT im Code!):
   - Netlify-Dashboard → dein Projekt → **Site configuration** →
     **Environment variables** → **Add a variable**
   - Key: `ANTHROPIC_API_KEY`
   - Value: dein Schlüssel von console.anthropic.com (beginnt mit `sk-ant-...`)
   - Speichern

2. **Neu deployen** (Environment-Variablen greifen erst nach einem neuen
   Deploy) – bei Weg A einfach `netlify deploy --prod` erneut ausführen, bei
   Weg B im Dashboard "Trigger deploy" → "Deploy site".

3. Fertig – dein Tool läuft jetzt unter deiner Netlify-URL und die Analyse
   sollte sich erstellen lassen.

## Falls es weiterhin nicht klappt
Öffne die Browser-Konsole (Rechtsklick → "Untersuchen" → Tab "Console") und
schau nach einer Fehlermeldung – die neue Version zeigt jetzt eine genaue
Fehlermeldung im Tool selbst an, statt nur "etwas ist schiefgelaufen".
Häufigste Ursachen:
- Per Drag & Drop deployt statt über CLI oder GitHub (siehe oben)
- Umgebungsvariable falsch benannt (muss exakt `ANTHROPIC_API_KEY` heißen)
- Kein Guthaben/keine Zahlungsmethode im Anthropic-Konsole-Account hinterlegt
