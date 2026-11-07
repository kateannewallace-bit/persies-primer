"""Checks that every sentence in lessons.js uses only words taught by its lesson: python3 tools/check.py"""
import os, re, sys
src = open(os.path.join(os.path.dirname(__file__), '..', 'lessons.js')).read()
known, bad = set(), 0
for block in re.findall(r'\{ n: (\d+),(.*?)note:', src, re.S):
    n, body = int(block[0]), block[1]
    for key in ('words', 'irregular'):
        m = re.search(key + r": '([^']*)'", body)
        if m: known |= {w.lower() for w in m.group(1).split()}
    if n >= 12: known.add('a')
    m = re.search(r"sentences: \[(.*?)\]", body, re.S)
    for s in re.findall(r"'([^']*)'", m.group(1)) if m else []:
        for w in re.findall(r'[a-z]+', s.lower()):
            if w not in known: bad += 1; print(f'Lesson {n}: "{w}" in "{s}" is not taught yet')
print(f'{bad} problems' if bad else 'All sentences use taught words.')
sys.exit(1 if bad else 0)
