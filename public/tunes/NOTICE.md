# Tune content licensing

The tune content in this directory (`{id}.json` metadata and `{id}.mid`
files) is **not** covered by the repository's root `LICENSE` (MIT), which
applies to the application code only. Each tune's `{id}.json` carries an
`attribution` block recording its specific terms; this file explains what
those terms mean.

## Categories

**`"license": "ODbl-1.0"` (or `"ODbl"`)** — the tune setting is sourced from
[The Session](https://thesession.org), whose tune database is licensed under
the [Open Database License](https://opendatacommons.org/licenses/odbl/1.0/).
Redistribution or derivative use must retain attribution and, if you
redistribute the derived database, remain share-alike under ODbl-compatible
terms.

**`"license": "used-with-permission"`** — the MIDI was transcribed by hand
from a copyrighted book, with the author's explicit permission to publish
the resulting MIDI on this site. The `permissionScope` field records the
scope of that permission:

- `"site-only"` — permission covers publishing on this site only. These
  files are **not licensed for reuse, redistribution, or republication
  elsewhere**; treat them as all-rights-reserved outside this project.

## Per-tune attribution

| Tune            | Source                                                      | License                         |
| --------------- | ----------------------------------------------------------- | ------------------------------- |
| The Kesh        | [The Session](https://thesession.org/tunes/55)              | ODbl-1.0                        |
| Old Man Dillon  | _300 Gems of Irish Music for All Instruments_ (Grey Larsen) | used-with-permission, site-only |
| The Black Rogue | _300 Gems of Irish Music for All Instruments_ (Grey Larsen) | used-with-permission, site-only |
| The Legacy      | _300 Gems of Irish Music for All Instruments_ (Grey Larsen) | used-with-permission, site-only |

If you add a tune without a resolved source, do not assume public domain —
confirm provenance and add an `attribution` block before publishing.
