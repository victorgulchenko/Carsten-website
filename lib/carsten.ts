/**
 * Carstens Kontext für die Relevanz-Einschätzung.
 * Quelle: das Reverse Mentoring (Jan–Jun 2026) und knowledge.md.
 * Wird an Groq übergeben, damit die "Für Carsten"-Spalte gezielt urteilt.
 */
export const CARSTEN_CONTEXT = `Carsten arbeitet im Model Risk Management der KfW (regulierte Förderbank).
Seine zentralen Prozesse:
- Modellvalidierung: unabhängige Prüfung von Risikomodellen auf Korrektheit, Stabilität, Annahmen.
- SAS→Python-Migration: bestehende SAS-Modelle nach Python überführen (Use-Case mit Boyan und Thomas; Ansatz: erst 1:1 übersetzen, dann optimieren).
- Modell-Dokumentation: nachvollziehbare, prüfbare Doku für Validierung und Aufsicht.

Rahmenbedingungen, die für ihn zählen:
- Reguliertes Umfeld: Nachvollziehbarkeit, Reproduzierbarkeit, Governance, Audit-Tauglichkeit.
- Datenschutz/Sicherheit: Daten sollen möglichst im Haus bleiben ("bleibt in unserer VPC"); On-Prem/VPC-Hosting, Open-Source-LLMs und AWS Bedrock sind deshalb interessant.
- Aktuelles Werkzeug: GitHub Copilot (Kontextlimit ~250k Token); Kontext-Management ist ein wiederkehrendes Thema.

Was nützlich ist: konkrete Tools, Modelle, Methoden oder Releases, die einem dieser Prozesse oder Rahmenbedingungen direkt helfen.
Was NICHT relevant ist: allgemeiner KI-Hype, Consumer-Gadgets, Themen ohne Bezug zu Modellrisiko, Validierung, Migration, Dokumentation oder reguliertem Betrieb.`

/** Erlaubte Prozess-Labels für die Carsten-Notizen. */
export const CARSTEN_PROCESSES = [
  'Modellvalidierung',
  'SAS→Python',
  'Dokumentation',
  'Governance & Aufsicht',
  'Sicheres Hosting',
  'Kontext-Management',
] as const
