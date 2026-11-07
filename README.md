# Persie's Primer

A first reader for a three-year-old, played with a grown-up alongside. It follows Samuel Blumenfeld's **Alpha-Phonics** lesson by lesson (the short-a lessons, 1–13), starting from lesson 1: am, an, as, at, ax. Same rose chalkboard as [Persie's Chalkboard](https://github.com/kateannewallace-bit/persies-chalkboard).

- **Read it to me:** a word or sentence on the board; the child reads it aloud and the grown-up taps ✓ (or Help, which says the word for the child to say back).
- **Find the word:** the app says a word, the child taps it.
- **Finish the word:** the app says a word with a letter missing, the child picks the letter.

Only words from lessons already reached are used, and words never come with pictures (Blumenfeld: pictures invite guessing). Missed words come back for spaced review. Grown-ups move the lesson on; the app suggests it after 8 of the last 10 are read on the first try.

**The reward:** every word read, the little crab tries to eat the big lizard, and Froggy (the lizard's frog friend, riding on its back) shouts "Too big!". At the end of a round the lizard eats the crab. Gulp! Tap the beach on the home screen to watch the crab try again.

## Run it

Static site, no build step:

```bash
python3 -m http.server 8798
```

After changing files, bump `VERSION` in `sw.js`. `python3 tools/check.py` checks every sentence uses only words its lesson has taught. The icon is drawn by `tools/make_icon.py`. Sync uses the same Supabase functions as the other apps with a `persies-primer:` key prefix.
