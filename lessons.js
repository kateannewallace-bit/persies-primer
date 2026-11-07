// The first lessons of Alpha-Phonics (Samuel L. Blumenfeld), the short-a part of the book.
// Lesson numbers and titles follow the book's Order of Lessons, same as Tom's Primer.
// The practice words and sentences are written for this app, and each sentence uses only
// words taught by its lesson (node tools/check.js checks this).
//   words: new words for the lesson     irregular: shown boxed, like the book
//   sentences: practice sentences       (no pictures on purpose: Blumenfeld says pictures invite guessing)
window.LESSONS = [
  { n: 1, title: 'Short a; m, n, s, t, x', words: 'am an as at ax',
    note: 'Two sounds per word: the short a, then the consonant. Say a… t, at.' },
  { n: 2, title: 'New first letters: S, m, h, s, t', words: 'Sam ham man tan has hat mat sat Max tax',
    note: 'Add one letter to the front of a known word: am → Sam, at → hat. Names start with a capital letter.' },
  { n: 3, title: 'First sentences',
    sentences: ['Max sat.', 'Sam has ham.', 'Max has an ax.', 'Sam sat.', 'Max has ham.', 'Sam has an ax.'],
    note: 'A sentence starts with a capital letter and ends with a period. Point under each word as it is read.' },
  { n: 4, title: 'd, D, w', words: 'ad dad Dad had mad sad Dan wax',
    note: 'd and w added to words already known: ad → dad, ax → wax.' },
  { n: 5, title: 'Word building', words: 'Nan Tad dam', irregular: 'was',
    note: '"was" is the first irregular word (it sounds like "wuz"). It is shown in a box, like the book.' },
  { n: 6, title: 'Sentences and punctuation',
    sentences: ['Dad had ham.', 'Was Dan sad?', 'Max was mad!', 'Nan sat.', 'Tad has wax.', 'Was Sam mad at Max?'],
    note: 'A question ends with a question mark, and ! means said with feeling.' },
  { n: 7, title: 'nd; l', words: 'and hand land sand lad',
    sentences: ['Dad and Max sat.', 'Sam had sand.', 'Nan and Dan sat.', 'Tad had sand and wax.'],
    note: 'In a blend both sounds are heard: h-a-n-d.' },
  { n: 8, title: 'l, b, c, g, j, f', words: 'Al gal Hal Sal bad bag ban bat can cat cab gas jam jab fan fat fax nab nag',
    sentences: ['Dad can bat.', 'Sal had jam.', 'Al can fan Sal.', 'Can Nan nab Max?', 'Sal has jam and ham.'],
    note: 'c says k here (cat), g as in gas.' },
  { n: 9, title: 'p, r, v, y, z', words: 'pan pat pad pal Pam cap map nap lap tab tag tap ran rat rag ram van wag yam yap zap zag',
    sentences: ['Pam ran.', 'Pat has jam.', 'Can Dan bat?', 'Max ran and sat.', 'Pam and Pat ran.'],
    note: 'Say each consonant cleanly, with no extra "uh": p, not puh.' },
  { n: 10, title: 'Review of short a words',
    note: 'No new words: a mix of everything so far.' },
  { n: 11, title: 'ck; qu', words: 'back Jack pack rack sack tack quack',
    sentences: ['Jack ran back.', 'Jack has jam.', 'Quack!'],
    note: 'ck is two letters for one sound. qu is taught with quack.' },
  { n: 12, title: 'a as a word',
    sentences: ['Jack has a cat.', 'Sam has a bag.', 'A cat ran.', 'Dad has a van.', 'Pam has a hat and a bag.'],
    note: '"a" means the same as "an", but comes before a word that starts with a consonant: a cat, an ax.' },
  { n: 13, title: 'Sentences',
    sentences: ['Jack ran back.', 'Can a cat nap?', 'A rat ran at Jack!', 'Dad has a tan cap.', 'Max had a sack.', 'Dad and Jack ran back.'],
    note: 'These can be read and also written.' },
];
