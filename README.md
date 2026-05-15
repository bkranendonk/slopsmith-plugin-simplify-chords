# Simplify Chords Slopsmith Plugin

A plugin for [Slopsmith](https://github.com/byrongamatos/slopsmith) that strips chord modifiers from the note highway, making songs easier to follow for beginners.

## What it does

Adds a **Simplify** button to the player controls. When active, complex chord names are replaced with their simpler equivalents:

| Original | Simplified |
|----------|-----------|
| Am7      | Am        |
| Cadd9    | C         |
| Gmaj7    | G         |
| Dsus4    | D         |
| Adim     | A         |

Originals are restored when you toggle it off or switch songs.

## Settings

Three toggles control which chord types are simplified:

- **Disable 7ths & extensions** (on by default) — strips numeric suffixes: `Am7 → Am`, `Cadd9 → C`, `Gmaj7 → G`
- **Disable Suspended chords** (on by default) — strips sus qualifiers: `Dsus4 → D`, `Asus2 → A`
- **Disable Diminished & augmented** (off by default) — strips dim/aug qualifiers: `Adim → A`, `Gaug → G`

Settings persist across browser sessions.
