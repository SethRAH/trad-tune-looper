---
disclosure-default: ai-assisted
models-used:
  - claude-sonnet-5
providers:
  - Anthropic
scope: |
  Application code (the Vite site, web components including <tune-looper>,
  and build/deploy tooling) is ai-assisted: authored with Claude Code and
  reviewed by a human before commit. Some scaffolding may be ai-generated.

  Musical content is NOT covered by the default. All tune data —
  score transcriptions and the MIDI files exported from them — is
  human-authored (disclosure: none). It was hand-transcribed from
  notation into MuseScore and exported to MIDI by a human. No musical
  content was AI-generated, and no score or MIDI file was passed through
  an AI pipeline. See per-file / per-directory headers for overrides.
last-updated: 2026-07-12
---

# AI Disclosure

This repository follows the
[ai-disclosure convention](https://github.com/ggfevans/ai-disclosure)
(W3C AI Content Disclosure vocabulary + SPDX line-tags).

**Code:** `ai-assisted` by default — written with Claude Code, human-reviewed
before commit. Individual files may carry a `SPDX-AI-Disclosure:` header that
overrides this default.

**Music:** all tune data is `none` — human-authored. The scores were
hand-transcribed from notation in MuseScore and exported to MIDI by a human.
No musical content was AI-generated or run through any AI system. This is a
positive assertion of human authorship, not merely an absence of disclosure.

Disclosure follows a nearest-ancestor model: a file's own `SPDX-AI-Disclosure:`
header wins; otherwise the `disclosure-default` above applies. Absence of any
tag means "unknown", not "none".
