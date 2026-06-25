# Wissensdatenbank · Reverse Mentoring Victor × Carsten

Eine Sammlung der Tools, Ansätze und Begriffe aus unseren Treffen (Jan–Jun 2026).
Struktur: `##` = Kategorie, `###` = Eintrag. Felder pro Eintrag als Bullets.

---

## KI-Assistenten & Coding-Tools

### Claude Code
- **Kurz:** Agentisches Coding-Tool für die Kommandozeile.
- **Erklärung:** Man beschreibt eine Aufgabe in normaler Sprache, und das Tool plant, schreibt und ändert Code selbstständig über mehrere Schritte. Mit dem Opus-Modell bis zu 1.000.000 Token Kontext – also sehr viel Projektwissen gleichzeitig.
- **Im Mentoring:** Mein tägliches Werkzeug; damit habe ich dir gezeigt, wie ich als Gründer in Echtzeit entwickle.
- **Link:** https://www.anthropic.com/claude-code
- **Tags:** coding, agenten, kontext

---

## Recherche & Daten

### Exa
- **Kurz:** KI-native Websuche bzw. Recherche-Schnittstelle.
- **Erklärung:** Sucht nicht nach Stichworten, sondern nach Bedeutung – gut, um für KI-Agenten schnell passende Quellen oder Frameworks zu finden.
- **Im Mentoring:** Von mir für schnelle, einfache Web-Recherche empfohlen.
- **Link:** https://exa.ai
- **Tags:** recherche, agenten

### PostHog
- **Kurz:** Produkt-Analytics – misst Nutzerverhalten.
- **Erklärung:** Zeigt, wie Anwender ein Produkt tatsächlich benutzen (Klicks, Wege, Abbrüche). Hilft zu verstehen, was wirklich gebraucht wird, statt es zu vermuten.
- **Im Mentoring:** Nutze ich selbst für meine Website; als Beispiel fürs systematische Sammeln von Nutzerverhalten.
- **Link:** https://posthog.com
- **Tags:** analytics, feedback

---

## Kontext & Erweiterung

### MCP-Server (Model Context Protocol)
- **Kurz:** Strukturierte Ablage von Kontext-Wissen, die man an KI-Tools anbindet.
- **Erklärung:** Statt der KI bei jeder Aufgabe alles neu zu erklären, hinterlegt man Wissen (Systeme, Prozesse, Regeln) zentral und bindet es an. Die KI startet dann nicht mehr bei null.
- **Im Mentoring:** Idee, KfW-spezifisches Wissen als MCP-Server bereitzustellen.
- **Link:** https://modelcontextprotocol.io
- **Tags:** kontext, integration

### skills.sh
- **Kurz:** Wiederverwendbare „Skills" / Ressourcen für KI-Agenten.
- **Erklärung:** Vordefinierte Bausteine, die ein KI-Agent nutzen kann. Man könnte eigene Skills mit den spezifischen Daten der KfW oder eines konkreten Systems bauen.
- **Im Mentoring:** Als Ansatz für den SAS2Python-Task und für wiederkehrende Aufgaben genannt.
- **Link:** https://skills.sh
- **Tags:** agenten, wiederverwendung

---

## Inferenz & Modelle

### Groq
- **Kurz:** Sehr schnelle KI-Inferenz mit großzügigem Free-Tier.
- **Erklärung:** Plattform, die offene Modelle (z. B. Llama) extrem schnell ausführt. Gut für Aufgaben wie das tägliche Zusammenfassen von Nachrichten.
- **Im Mentoring:** Vorgesehen als Motor für die News-Funktion dieser Website.
- **Link:** https://groq.com
- **Tags:** inferenz, modelle

### OpenRouter
- **Kurz:** Eine Schnittstelle für viele Modelle, inklusive kostenloser.
- **Erklärung:** Ein Zugang zu vielen Anbietern und Modellen über eine API – praktisch zum Vergleichen oder als kostengünstige Alternative.
- **Im Mentoring:** Als Inferenz-Option erwähnt.
- **Link:** https://openrouter.ai
- **Tags:** inferenz, modelle

### Open-Source-LLMs
- **Kurz:** Frei verfügbare Sprachmodelle, intern evaluierbar.
- **Erklärung:** Starke Modelle (z. B. Llama, Mistral, Qwen, DeepSeek), die man selbst hosten und prüfen kann – interessant, wenn Daten das Haus nicht verlassen sollen.
- **Im Mentoring:** Als Hinweis genannt, dass es neben den großen Anbietern starke offene Alternativen gibt.
- **Link:** https://huggingface.co/models
- **Tags:** modelle, open-source

---

## Ansätze & Vorgehen

### Prototyping in Loops
- **Kurz:** Beschreiben → generieren → in schnellen Schleifen verbessern.
- **Erklärung:** Man baut nicht wochenlang einen Prototyp, sondern beschreibt der KI, was man will, lässt einen ersten Wurf generieren und verbessert ihn in kurzen Runden.
- **Im Mentoring:** Kern meiner Arbeitsweise, die ich dir und dem Team gezeigt habe.
- **Tags:** vorgehen, prototyping

### Frameworks wiederverwenden
- **Kurz:** Wo möglich Bestehendes nutzen statt neu bauen.
- **Erklärung:** Vorhandene Frameworks und Bausteine wiederverwenden spart Zeit und reduziert Fehler.
- **Im Mentoring:** Als Teil des Entwicklungsvorgehens besprochen.
- **Tags:** vorgehen

### KI-gestützte Webrecherche
- **Kurz:** Passende Tools/Frameworks per KI-Recherche finden.
- **Erklärung:** Statt selbst lange zu googeln, die KI gezielt recherchieren lassen, welche Lösung zum Problem passt.
- **Im Mentoring:** Teil des Vorgehens; Beispiel-Tool: Exa.
- **Tags:** vorgehen, recherche

### Deep-Research-Agenten
- **Kurz:** Agenten für regelmäßige Tiefenrecherche.
- **Erklärung:** KI-Agenten, die selbstständig mehrstufig recherchieren und Ergebnisse zusammenfassen – auch mit ChatGPT möglich.
- **Im Mentoring:** Als wiederkehrender Anwendungsfall genannt.
- **Tags:** agenten, recherche

### Context-Window-Management
- **Kurz:** Token-Limits beachten – sonst sinkt die Qualität.
- **Erklärung:** Jedes Modell hat ein Kontextlimit. Ist es zu voll, werden die Ergebnisse schlechter. Abhilfe: Kontext komprimieren oder auf die konkrete Aufgabe eingrenzen.
- **Im Mentoring:** Beim Vergleich Copilot (250k) vs. Claude Code (1M) und beim SAS2Python-Task besprochen.
- **Tags:** kontext, qualitaet

### SAS2Python: erst 1:1, dann optimieren
- **Kurz:** Wörtlich übersetzen, dann den Python-Code verbessern.
- **Erklärung:** Modelle lesen Python besser als SAS. Daher zuerst SAS möglichst 1:1 nach Python übertragen, danach in einem zweiten Schritt den Python-Code optimieren.
- **Im Mentoring:** Konkreter Ansatz für euren Migrations-Use-Case (mit Boyan und Thomas).
- **Tags:** vorgehen, kfw, migration

### Nutzer-Feedback systematisch einsammeln
- **Kurz:** Größtes Problem abfragen, Antworten KI-gestützt auswerten.
- **Erklärung:** Anwender direkt nach ihrem größten Problem fragen, Antworten von der KI zusammenfassen lassen, Nutzerverhalten aufzeichnen und Feedback z. B. über soziale Medien einsammeln.
- **Im Mentoring:** Als Methode besprochen, nah an echten Bedürfnissen zu entwickeln.
- **Tags:** feedback, vorgehen

---

## Konzepte & Organisation

### Agent-Loop
- **Kurz:** Das Modell entscheidet selbst über die nächsten Schritte.
- **Erklärung:** Statt einer fest verdrahteten Abfolge wählt die KI in einer Schleife eigenständig, welche Werkzeuge sie wann aufruft – flexibler als eine starre Pipeline.
- **Im Mentoring:** Hintergrund zu modernen KI-Anwendungen.
- **Tags:** konzept, agenten

### KI-Champions / Reverse Mentoring
- **Kurz:** Junge Mitarbeitende beraten Führungskräfte zu KI.
- **Erklärung:** Gibt jungen Kolleg:innen Sichtbarkeit und Gestaltungsmacht und bringt KI-Wissen schneller in die Breite. Modernisierung und Mitarbeiterbindung zugleich.
- **Im Mentoring:** Genau das Format, in dem wir uns getroffen haben.
- **Tags:** organisation, attraktivitaet

### Attraktivität × KI
- **Kurz:** Moderne Tools = Modernisierung und Recruiting-Signal.
- **Erklärung:** Wer jungen Leuten moderne KI-Werkzeuge gibt und sie als Treiber einsetzt, signalisiert: Hier kannst du gestalten. Das macht gleichzeitig produktiver und attraktiver als Arbeitgeber.
- **Im Mentoring:** Die Brücke zwischen unseren beiden Hauptthemen.
- **Tags:** organisation, attraktivitaet
