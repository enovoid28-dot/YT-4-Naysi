import {initArt,C,clamp,ease,rr,txt,mono} from './art.mjs';
import {SCENES} from './scenes.mjs';
const layouts=new Map();
export function initAssets(makeCanvas,geo){initArt(makeCanvas,geo);layouts.clear();}
export function captionLayout(c,card){
 let pick;
 for(let size=44;size>=34;size--){c.font=`${size}px PJS700`;const space=c.measureText(' ').width*1.13,lines=[];let row=[],width=0;
  for(const w of card.words){const ww=c.measureText(w.text).width;if(row.length&&width+space+ww>610){lines.push({row,width});row=[];width=0;}if(row.length)width+=space;row.push({...w,width:ww});width+=ww;}if(row.length)lines.push({row,width});pick={size,space,lines};if(lines.length<=3)break;
 }
 return pick;
}
export function draw(c,t,tl){
 c.save();c.scale(2,2);const s=tl.scenes.find(s=>t>=s.start&&t<s.start+s.duration)||tl.scenes.at(-1),local=clamp(t-s.start,0,s.duration);
 SCENES[s.index](c,local,s);
 // Consistent house chrome; no permanent title box occupying the illustration.
 const top=c.createLinearGradient(0,0,0,145);top.addColorStop(0,'#041010bb');top.addColorStop(1,'#04101000');c.fillStyle=top;c.fillRect(0,0,720,145);
 mono(c,'▪ N A Y S I',52,57,14,'#d8ddc9b0');mono(c,'BUMI / ARSIP ATOM',668,57,10,'#c0cfbb88','right');
 const ci=s.cards.findIndex(card=>local>=card.from&&local<card.to),card=s.cards[ci];
 if(card){const key=`${s.id}:${ci}`;if(!layouts.has(key))layouts.set(key,captionLayout(c,card));const {size,space,lines}=layouts.get(key);const alpha=clamp((local-card.from)/.055)*clamp((card.to-local)/.055);
  const g=c.createLinearGradient(0,900,0,1170);g.addColorStop(0,'#06111200');g.addColorStop(.32,'#061112e8');g.addColorStop(1,'#061112');c.fillStyle=g;c.fillRect(0,900,720,285);
  c.save();c.globalAlpha=alpha;for(let i=0;i<lines.length;i++){const l=lines[i];let x=360-l.width/2;const y=1065-(lines.length-1-i)*size*1.13;
   for(const w of l.row){const active=local>=w.start-.025&&local<w.end+.025,past=local>=w.end+.025;const bright=active?1:past?.96:.37;
    c.globalAlpha=alpha*bright;const rise=local<w.start?Math.min(4,(w.start-local)*7):0;
    txt(c,w.text,x,y+rise,size,active?C.amber:C.ink);x+=w.width+space;
   }
  }c.restore();
 }
 const bottom=c.createLinearGradient(0,1140,0,1280);bottom.addColorStop(0,'#06111200');bottom.addColorStop(1,'#061112');c.fillStyle=bottom;c.fillRect(0,1140,720,140);
 mono(c,`${String(s.index+1).padStart(2,'0')} — ${s.label}`,52,1223,10,'#91a79999');for(let i=0;i<10;i++)rr(c,495+i*17,1216,11,3,1,i===s.index?C.amber:'#3c554a');
 rr(c,0,1276,720,4,0,'#2e443a');rr(c,0,1276,720*clamp(t/tl.duration),4,0,C.amber);
 // Short optical dip at chapter boundaries. Continuous actions live inside shots.
 const dip=(1-clamp(local/.17))*.3;if(dip>.001){c.fillStyle=`rgba(3,10,9,${dip})`;c.fillRect(0,80,720,1100);}
 c.restore();
}
