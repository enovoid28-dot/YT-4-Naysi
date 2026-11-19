#!/usr/bin/env python3
"""Word-level forced alignment of the Indonesian VO.

PocketSphinx (en-us acoustic model, bundled with the wheel) aligns each scene
take against its known text. Indonesian spelling is close to phonemic, so a
small rule set maps every word to the model's phone set; spelled letters
("A, B, AB, O") get their spoken names. Output: per scene, every VO word with
its start and end in take time (seconds).

usage: python scripts/align-words.py <voice-dir> <script-json> <out-json>
  script-json: {"s1": "vo text", ...}
"""
import json
import os
import re
import subprocess
import sys
import tempfile

from pocketsphinx import Decoder, get_model_path

FFMPEG = os.path.join(os.path.dirname(__file__), '..', 'node_modules', '@ffmpeg-installer', 'linux-x64', 'ffmpeg')

LETTERS = {
    'a': ['AA'], 'b': ['B', 'EY'], 'c': ['CH', 'EY'], 'd': ['D', 'EY'], 'e': ['EY'], 'f': ['EH', 'F'],
    'g': ['G', 'EY'], 'h': ['HH', 'AA'], 'i': ['IY'], 'j': ['JH', 'EY'], 'k': ['K', 'AA'], 'l': ['EH', 'L'],
    'm': ['EH', 'M'], 'n': ['EH', 'N'], 'o': ['OW'], 'p': ['P', 'EY'], 'r': ['EH', 'R'], 's': ['EH', 'S'],
    't': ['T', 'EY'], 'u': ['UW'], 'w': ['W', 'EY'], 'x': ['EH', 'K', 'S'], 'y': ['Y', 'EY'], 'z': ['Z', 'EH', 'T'],
}
VOWEL = {'a': 'AA', 'i': 'IY', 'u': 'UW', 'e': 'AH', 'o': 'OW'}
CONS = {
    'b': ['B'], 'c': ['CH'], 'd': ['D'], 'f': ['F'], 'g': ['G'], 'h': ['HH'], 'j': ['JH'], 'k': ['K'],
    'l': ['L'], 'm': ['M'], 'n': ['N'], 'p': ['P'], 'q': ['K'], 'r': ['R'], 's': ['S'], 't': ['T'],
    'v': ['F'], 'w': ['W'], 'x': ['K', 'S'], 'y': ['Y'], 'z': ['Z'],
}
DIGRAPH = {'ng': ['NG'], 'ny': ['N', 'Y'], 'sy': ['SH'], 'kh': ['HH'], 'rh': ['R'], 'ph': ['F'], 'th': ['T']}
DIPH = {'ai': ['AY'], 'au': ['AW'], 'oi': ['OY']}


def clean(word):
    return re.sub(r"[^a-z0-9\-]", '', word.lower())


# loanwords the letter rules would get wrong
EXCEPT = {'einstein': ['AY', 'N', 'S', 'T', 'AY', 'N']}


def g2p(word, spelled):
    # hyphenated words (HP-mu, gara-gara): each part on its own, acronyms spelled
    if '-' in word:
        out = []
        for part in [x for x in word.split('-') if x]:
            out += g2p(part, bool(re.fullmatch(r"[A-Z]{1,4}", part)))
        return out or ['AH']
    w = clean(word)
    if w in EXCEPT:
        return list(EXCEPT[w])
    if spelled and len(w) <= 4 and w.isalpha():
        out = []
        for ch in w:
            out += LETTERS[ch]
        return out
    out = []
    i = 0
    while i < len(w):
        two = w[i:i + 2]
        if two in DIGRAPH:
            out += DIGRAPH[two]
            i += 2
            continue
        # diphthongs only at the end of a word (pakai, pulau), else two syllables
        if two in DIPH and i + 2 == len(w):
            out += DIPH[two]
            i += 2
            continue
        ch = w[i]
        if ch in VOWEL:
            out.append(VOWEL[ch])
        elif ch in CONS:
            out += CONS[ch]
        i += 1
    return out or ['AH']


def tokens(text):
    """VO words in order, with a flag for spelled letters (A, B, AB, O)."""
    out = []
    for raw in text.split():
        core = re.sub(r"[^\w\-]", '', raw)
        if not core:
            continue
        spelled = bool(re.fullmatch(r"[A-Z]{1,4}", core))
        out.append((raw, core, spelled))
    return out


def pcm16k(path):
    return subprocess.run(
        [FFMPEG, '-v', 'error', '-i', path, '-ac', '1', '-ar', '16000', '-f', 's16le', '-'],
        check=True, capture_output=True,
    ).stdout


def align(voice, text):
    toks = tokens(text)
    words = []
    lex = {}
    for k, (raw, core, spelled) in enumerate(toks):
        key = f"w{k}"
        lex[key] = g2p(core, spelled)
        words.append(key)
    with tempfile.NamedTemporaryFile('w', suffix='.dict', delete=False) as fh:
        for key, ph in lex.items():
            fh.write(f"{key} {' '.join(ph)}\n")
        dict_path = fh.name
    pcm = pcm16k(voice)
    segs = []
    # a pause between words must be cheap enough to be modelled as silence,
    # or the search stretches a vowel across it and can lose the last words
    for silprob in (0.2, 0.05, 0.6):
        dec = Decoder(hmm=os.path.join(get_model_path(), 'en-us', 'en-us'), dict=dict_path, lm=None,
                      samprate=16000, loglevel='FATAL', silprob=silprob)
        dec.set_align_text(' '.join(words))
        dec.start_utt()
        dec.process_raw(pcm, full_utt=True)
        dec.end_utt()
        segs = [s for s in dec.seg() if s.word in lex]
        if len(segs) == len(toks):
            break
    os.unlink(dict_path)
    if len(segs) != len(toks):
        raise RuntimeError(f"{voice}: aligned {len(segs)} of {len(toks)} words")
    fr = 0.01
    return [
        {'text': toks[i][0], 'start': round(s.start_frame * fr, 3), 'end': round((s.end_frame + 1) * fr, 3)}
        for i, s in enumerate(segs)
    ]


def main():
    voice_dir, script_json, out_json = sys.argv[1:4]
    script = json.load(open(script_json))
    result = {}
    for sid, text in script.items():
        result[sid] = align(os.path.join(voice_dir, f"{sid}.mp3"), text)
    json.dump(result, open(out_json, 'w'), ensure_ascii=False, indent=1)


if __name__ == '__main__':
    main()
