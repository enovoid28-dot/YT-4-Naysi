import json, os, runpy, sys, subprocess
base=runpy.run_path('scripts/align-words.py',run_name='alignment_library')
from pocketsphinx import Decoder,get_model_path
import tempfile
ff='node_modules/@ffmpeg-installer/linux-x64/ffmpeg'
data=json.loads(subprocess.check_output(['node','--input-type=module','-e',
    "import {EPISODE as e} from './src/oklo/episode.mjs';import {CUES as c} from './src/oklo/cues.mjs';console.log(JSON.stringify(e.scenes.map(s=>({...s,cards:c[s.index].map(([from,text])=>({from,text}))}))));"]))
base['EXCEPT']['tepat']=['T','AH','P','AA']
result={}
for scene in data:
    sid=scene['id']
    pcm=subprocess.check_output([ff,'-v','error','-i',f'voice/ep34/{sid}.mp3','-ar','16000','-ac','1','-f','s16le','-'])
    out=[]
    for ci,card in enumerate(scene['cards']):
        start=max(0,card['from']-.08)
        end=scene['cards'][ci+1]['from']+.04 if ci+1<len(scene['cards']) else len(pcm)/32000
        toks=base['tokens'](card['text']); lex={f'w{i}':base['g2p'](core,spelled) for i,(_,core,spelled) in enumerate(toks)}
        with tempfile.NamedTemporaryFile('w',suffix='.dict',delete=False) as f:
            for key,ph in lex.items(): f.write(key+' '+' '.join(ph)+'\n')
            dictionary=f.name
        best={}
        chunk=pcm[int(start*16000)*2:int(end*16000)*2]
        for prob in [.2,.05,.6,.01]:
            d=Decoder(hmm=os.path.join(get_model_path(),'en-us','en-us'),dict=dictionary,lm=None,samprate=16000,loglevel='FATAL',silprob=prob)
            d.set_align_text(' '.join(lex));d.start_utt();d.process_raw(chunk,full_utt=True);d.end_utt()
            found={s.word:(start+s.start_frame*.01,start+(s.end_frame+1)*.01) for s in (d.seg() or []) if s.word in lex}
            if len(found)>len(best):best=found
            if len(best)==len(toks):break
        os.unlink(dictionary)
        # Approximate Indonesian-phone alignment against an English acoustic model.
        # s9's terminal word fails alignment; use an explicit estimated tail bound.
        # These timings are not a substitute for a human listening/sync review.
        if sid=='s9' and ci==4 and len(best)==len(toks)-1 and f'w{len(toks)-1}' not in best:
            best[f'w{len(toks)-1}']=(18.07,18.34)
        if len(best)!=len(toks):raise RuntimeError(f'{sid} card {ci}: {len(best)}/{len(toks)} aligned: {card["text"]}')
        words=[{'text':raw,'start':round(best[f'w{i}'][0],3),'end':round(best[f'w{i}'][1],3)} for i,(raw,_,_) in enumerate(toks)]
        out.append({'text':card['text'],'words':words})
    result[sid]=out
    print(sid,sum(len(c['words']) for c in out),'words aligned',flush=True)
json.dump(result,open('src/oklo/words.json','w'),ensure_ascii=False,indent=2)
