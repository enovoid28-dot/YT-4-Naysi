import {C,clamp,lerp,ease,smooth,rand,TAU,path,line,rr,dot,txt,mono,pill,glow,arrow,trace,background,rock,crossSection,map,nucleus,neutron,paper,sample,stamp,machine,waveform,timeRing,title,leader} from './art.mjs';
const P=(t,at,d=.8)=>ease((t-at)/d);
export const norm=s=>s.toLowerCase().replace(/[^a-z0-9]/g,'');
export function wordTime(s,word,nth=0){let n=0;for(const c of s.cards)for(const w of c.words)if(norm(w.text)===norm(word)){if(n++===nth)return w.start;}throw Error(`missing word ${word} in ${s.id}`);}
function camera(c,t,s,fn,zoom=.035){const p=smooth(t/s.duration);c.save();c.translate(360,570);c.scale(1+p*zoom,1+p*zoom);c.translate(-360,-570);fn();c.restore();}
function switchShot(c,t,at,a,b){const p=smooth((t-at)/.55);if(p<.999){c.save();c.globalAlpha=1-p;a();c.restore();}if(p>.001){c.save();c.globalAlpha=p;b();c.restore();}}
function banner(c,s,col=C.jade,y=845){pill(c,s,55,y,col);}
function isotopeTile(c,x,y,value,sub,col=C.jade){rr(c,x,y,200,205,7,'#132d26',col);mono(c,'92',x+20,y+30,15,C.dim);txt(c,'U',x+100,y+115,83,col,'IT800','center');txt(c,value,x+100,y+157,22,C.ink,'MONO6','center');mono(c,sub,x+100,y+187,10,C.dim,'center');}
function fission(c,t,at,{chain=false}={}){
 const u=P(t,at,1.2);if(!chain){nucleus(c,360,505,85,{split:u});const ps=Array.from({length:45},(_,i)=>[80+i*4,505]);trace(c,ps,P(t,at-.6,.6),C.blue,2);dot(c,lerp(80,305,P(t,at-.6,.6)),505,5,C.blue);
 for(let j=0;j<3;j++){const a=(j-1)*.85,dist=u*230;line(c,360,505,360+Math.cos(a)*dist,505+Math.sin(a)*dist,C.amber+'77',1);neutron(c,360+Math.cos(a)*dist,505+Math.sin(a)*dist,5);}
 if(u>.5){mono(c,'INTI LEBIH RINGAN',140,700,12,C.dim);mono(c,'NEUTRON',500,680,12,C.amber);glow(c,360,505,230,C.amber,(1-u)*.8);}}
 else{const levels=[[[115,500]],[[345,370],[345,630]],[[600,270],[600,440],[600,610],[600,780]]];levels.forEach((lv,k)=>{for(let j=0;j<lv.length;j++){const [x,y]=lv[j],p=P(t,at+k*1.2+j*.12,.6);if(k){const [X,Y]=levels[k-1][Math.floor(j/2)];trace(c,[[X,Y],[x,y]],p,C.amber,1.3);const q=(t*.5+j*.2)%1;neutron(c,lerp(X,x,q),lerp(Y,y,q),2.7);}if(p>0){c.save();c.globalAlpha*=p;nucleus(c,x,y,k===0?50:36,{label:false,split:P(t,at+(k+1)*1.2,.8)});c.restore();}}});}
}
function diagramNote(c,s='SKEMA · TIDAK MENUNJUKKAN SKALA SEBENARNYA'){mono(c,s,360,908,10,C.dim,'center');}
function s1(c,t,s){
 const where=s.cards[4].from;
 background(c,t,t<where?'earth':'lab');
 switchShot(c,t,where,()=>camera(c,t,s,()=>{
  crossSection(c,t,{water:.7,heat:.28});
  title(c,'REAKTOR NUKLIR','SEBELUM MANUSIA',{y:164,size:45});
  const f=P(t,wordTime(s,'reaktor')-.2,.8);c.save();c.globalAlpha*=f;leader(c,'REAKSI DI DALAM BATU',55,795,345,610,C.jade);c.restore();
  if(t>s.cards[2].from){const p=P(t,s.cards[2].from,.5);c.save();c.globalAlpha=p;rr(c,446,322,202,70,4,'#14221cdd','#7f8c7066');mono(c,'BUKAN MESIN',547,350,14,C.ink,'center');mono(c,'BUKAN PERADABAN HILANG',547,375,9,C.dim,'center');line(c,462,337,632,382,C.red,1.4);c.restore();}
  diagramNote(c,'PENAMPANG ILUSTRATIF · WARNA PENANDA MINERAL');
 }),()=>{
  mono(c,'LOKASI PENEMUAN',55,155,12,C.amber);map(c,t,{close:false});title(c,'OKLO / GABON',null,{y:225,size:44});
  const p=P(t,s.cards[5].from,.8);txt(c,`${(2*p).toFixed(1).replace('.',',')}`,55,824,115,C.amber,'IT800');txt(c,'MILIAR TAHUN',244,822,35,C.ink,'IT800');mono(c,'USIA SEKITAR · BUKAN USIA PENEMUAN',58,860,10,C.dim);
 });
}
function s2(c,t,s){
 const at=s.cards[3].from;background(c,t,'lab');
 switchShot(c,t,at,()=>{
  txt(c,'1972',55,237,128,C.ink,'IT800');mono(c,'PIERRELATTE, PRANCIS · PEMERIKSAAN URANIUM',59,274,10,C.amber);
  machine(c,t,P(t,s.cards[1].from,3));
  const p=P(t,0,1);c.save();c.translate(0,(1-p)*60);sample(c,360,785,.85);c.restore();
  leader(c,'SAMPEL DARI GABON',65,910,265,787,C.jade);
 },()=>{
  paper(c,51,170,618,700);mono(c,'LABORATOIRE / ANALYSE ISOTOPIQUE',80,215,13,'#515b43');line(c,80,235,640,235,'#8d947b',1);
  txt(c,'ANGKA YANG',80,302,48,'#253c32','IT800');txt(c,'TIDAK COCOK.',80,356,48,'#253c32','IT800');
  mono(c,'PROPORSI U-235 DALAM URANIUM',80,405,13,'#59634c');
  txt(c,'0,720%',80,504,83,'#4c6958','IT800');mono(c,'NILAI ACUAN ALAM SAAT INI',83,540,11,'#59634c');
  const p=P(t,wordTime(s,'berkurang'),1);txt(c,'0,717%',80,656,83,p>.1?'#a14f35':'#788775','IT800');mono(c,'CONTOH SAMPEL AWAL OKLO',83,692,11,'#59634c');
  if(p>.01){c.save();c.globalAlpha=p;path(c,[[80,669],[420,669]]);c.strokeStyle='#ae4c32';c.lineWidth=2;c.stroke();stamp(c,'PERNAH TERPAKAI?',480,774,-.08);c.restore();}
  mono(c,'SUMBER: IAEA · ILUSTRASI LAPORAN, BUKAN ARSIP ASLI',80,843,9,'#59634c');
 });
}
function s3(c,t,s){
 const at=s.cards[3].from;background(c,t,'lab');
 switchShot(c,t,at,()=>{
  title(c,'SIDIK JARI ATOM',null,{y:185,size:48});
  if(t<s.cards[1].from){isotopeTile(c,58,330,'235','ISOTOP URANIUM');nucleus(c,455,525,123);leader(c,'INTI YANG DAPAT MEMBELAH',60,810,430,560,C.jade);}
  else{mono(c,'FISI = PEMBELAHAN INTI ATOM',55,272,15,C.jade);fission(c,t,wordTime(s,'pembelahan'),{});banner(c,'ENERGI + NEUTRON',C.amber,825);}
  diagramNote(c);
 },()=>{
  mono(c,'JEJAK YANG TERTINGGAL',55,170,12,C.amber);rock(c,355,485,245,t,{cut:true});
  const names=[['Nd','NEODIMIUM',105,710],['Ru','RUTENIUM',310,760],['Xe','XENON',525,710]];
  names.forEach(([sym,name,x,y],i)=>{const p=P(t,at+i*.4,1);line(c,360,530,x,y-40,C.jade+'66',1);c.save();c.globalAlpha=p;rr(c,x-64,y-40,128,104,5,'#15362c',C.jade+'99');txt(c,sym,x,y+8,39,C.ink,'IT800','center');mono(c,name,x,y+42,9,C.jade,'center');c.restore();});
  title(c,'BUKTI FISI',null,{y:255,size:62});banner(c,'POLA ISOTOP · BUKAN SEKADAR RADIASI',C.jade,885);diagramNote(c,'ILUSTRASI PRODUK DAN SIDIK JARI ISOTOP');
 });
}
function s4(c,t,s){
 background(c,t,'lab');title(c,'BAHAN BAKAR','YANG BERUBAH',{y:190,size:46});
 const p=P(t,s.cards[1].from,2),q=P(t,s.cards[3].from,1.4);
 // The grid is a visual comparison of abundance, not a physical arrangement.
 const x0=77,y0=365;
 for(let i=0;i<400;i++){const x=x0+(i%20)*29.6,y=y0+Math.floor(i/20)*18.8,chosen=i<12;dot(c,x,y,2.6,chosen&&i<Math.round(lerp(12,3,q))?C.jade:chosen?'#7a634b66':'#44615755');}
 txt(c,q<.5?'≈ 3%':'≈ 0,7%',55,855,106,q<.5?C.jade:C.amber,'IT800');
 mono(c,q<.5?'SEKITAR 2 MILIAR TAHUN LALU':'PROPORSI URANIUM ALAM SEKARANG',60,895,12,C.dim);
 rr(c,520,755,115,92,5,'#142a24','#526a54');mono(c,'U-235',577,788,14,C.jade,'center');mono(c,'BERKURANG',577,818,10,C.dim,'center');
 if(t>s.cards[4].from){const a=P(t,s.cards[4].from,.6);c.save();c.globalAlpha=a;arrow(c,80,312,630,312,C.amber,1.5);mono(c,'PELURUHAN RADIOAKTIF →',350,297,13,C.amber,'center');c.restore();}
}
function s5(c,t,s){
 const waterAt=s.cards[4].from,showWater=P(t,waterAt-1,2);background(c,t,'earth');
 camera(c,t,s,()=>{crossSection(c,t,{water:showWater,heat:.03});
  const p=P(t,s.cards[1].from,1);c.save();c.globalAlpha=p;
  line(c,100,725,620,725,C.amber,1);for(const x of[100,620])line(c,x,713,x,737,C.amber,1);mono(c,'BENTUK + UKURAN ENDAPAN',360,765,14,C.amber,'center');c.restore();
  leader(c,'ENDAPAN KAYA URANIUM',55,455,320,597,C.jade);
 });
 title(c,t>s.cards[3].from?'KOMPONEN':'BATUAN YANG',t>s.cards[3].from?'YANG HILANG':'TIDAK BIASA',{y:180,size:47});
 if(showWater>0){c.save();c.globalAlpha=showWater;pill(c,'AIR TANAH',454,389,C.blue);c.restore();}
 diagramNote(c,'PENAMPANG SKEMATIS · KONDISI GEOLOGI SALING MENDUKUNG');
}
function s6(c,t,s){
 const modAt=s.cards[2].from,chainAt=s.cards[4].from;background(c,t,'lab');
 title(c,t<modAt?'SATU INTI':'REAKSI',t<modAt?'MEMBELAH':'BERANTAI',{y:182,size:49});
 if(t<modAt){fission(c,t,s.cards[1].from-.8);banner(c,'ENERGI DILEPASKAN',C.amber,835);}
 else if(t<chainAt){
  const ps=[[65,500],[220,500],[290,410],[370,550],[465,500],[555,500],[625,500]];
  for(let i=0;i<3;i++){const [x,y]=ps[i+2];dot(c,x,y,30,'#204451');dot(c,x,y,10,C.blue);mono(c,'H',x,y+5,12,C.ink,'center');}
  path(c,ps);c.strokeStyle='#6d9fac77';c.lineWidth=1.5;c.stroke();
  for(let j=0;j<6;j++){const u=(t*.23+j/6)%1,k=Math.min(5,Math.floor(u*6)),f=u*6-k;neutron(c,lerp(ps[k][0],ps[k+1][0],f),lerp(ps[k][1],ps[k+1][1],f),4,C.amber);}
  nucleus(c,610,500,48,{label:false});arrow(c,70,680,260,680,C.amber,3);arrow(c,455,680,515,680,C.blue,3);mono(c,'LEBIH CEPAT',70,725,13,C.amber);mono(c,'DIPERLAMBAT AIR',410,725,13,C.blue);banner(c,'MODERATOR = MEMPERLAMBAT NEUTRON',C.blue,835);
 }else{fission(c,t,chainAt-.3,{chain:true});banner(c,'SATU → BERIKUTNYA → BERIKUTNYA',C.jade,860);}
 diagramNote(c);
}
function s7(c,t,s){
 background(c,t,'earth');let water=1,heat=.1,status='AIR MASUK',col=C.blue;
 const heatAt=s.cards[1].from,boilAt=s.cards[2].from,offAt=s.cards[4].from,coolAt=s.cards[5].from,returnAt=s.cards[6].from;
 if(t>=heatAt){heat=lerp(.1,.9,P(t,heatAt,boilAt-heatAt));status='REAKSI MEMANASKAN';col=C.amber;}
 if(t>=boilAt){water=1-P(t,boilAt,2.5);heat=.9;status='AIR MENDIDIH';col=C.red;}
 if(t>=offAt){water=.04;heat=.7*(1-P(t,offAt,coolAt-offAt+1));status='REAKSI MEREDA';col=C.dim;}
 if(t>=returnAt){water=P(t,returnAt,1.5);heat=.16;status='AIR KEMBALI';col=C.blue;}
 crossSection(c,t,{water,heat});
 title(c,'REM ALAMI',null,{y:195,size:67});pill(c,status,55,295,col);
 const x=605,y=410;rr(c,x,y,12,315,6,'#0a221d','#5b7e68');rr(c,x+2,y+313-heat*310,8,Math.max(2,heat*310),4,col);mono(c,'PANAS',610,770,10,col,'center');
 // State variables share the same value as the animated cross-section.
 rr(c,55,820,490,72,5,'#0a1b16dd','#5a766055');mono(c,'AIR CAIR',76,848,11,C.dim);rr(c,182,837,330,9,3,'#344940');rr(c,182,837,Math.max(1,330*water),9,3,C.blue);mono(c,'REAKSI',76,878,11,C.dim);rr(c,182,868,330,9,3,'#344940');rr(c,182,868,Math.max(1,330*heat*water),9,3,C.amber);
 diagramNote(c,'SIKLUS DISKEMATISKAN · BUKAN SUHU HASIL PENGUKURAN');
}
function s8(c,t,s){
 const at=s.cards[2].from;background(c,t,'lab');
 switchShot(c,t,at,()=>{
  mono(c,'REKONSTRUKSI DARI JEJAK MINERAL',55,165,12,C.amber);rock(c,340,455,210,t,{cut:true});
  c.save();const p=P(t,0,2);c.translate(500,660);c.scale(p,p);dot(c,0,0,125,'#153a31');c.beginPath();c.arc(0,0,125,0,TAU);c.strokeStyle=C.jade;c.lineWidth=1.5;c.stroke();for(let i=0;i<27;i++){const a=rand(i)*TAU,r=rand(i+20)*100;dot(c,Math.cos(a)*r,Math.sin(a)*r,3+i%3,C.amber);}txt(c,'Xe',0,20,62,C.ink,'IT800','center');c.restore();line(c,375,500,431,564,C.jade,1);
  title(c,'JAM DI DALAM BATU',null,{y:840,size:41});diagramNote(c,'POLA ISOTOP GAS XENON · PENELITIAN 2004');
 },()=>{
  title(c,'MENYALA.','LALU BERISTIRAHAT.',{y:180,size:43});
  const p=((t-at)/8)%1;timeRing(c,360,525,157,p,t);
  txt(c,'30',360,510,98,C.amber,'IT800','center');mono(c,'MENIT AKTIF',360,551,16,C.amber,'center');
  txt(c,'2,5 JAM',360,782,56,C.jade,'IT800','center');mono(c,'FASE DORMAN',360,813,14,C.dim,'center');
  waveform(c,70,850,580,45,P(t,at,3),3);
  diagramNote(c,'SALAH SATU POLA KERJA YANG DIREKONSTRUKSI · MESHIK DKK.');
 });
}
function plant(c,x,y){line(c,x,y,x+230,y,C.dim,1);for(let i=0;i<3;i++){const X=x+20+i*75;path(c,[[X,y],[X-6,y-90],[X+32,y-90],[X+26,y]],true);c.strokeStyle=C.dim;c.lineWidth=2;c.stroke();}path(c,[[x+8,y-90],[x+50,y-90],[x+50,y-130],[x+85,y-130],[x+85,y-90],[x+220,y-90]]);c.strokeStyle=C.dim;c.lineWidth=2;c.stroke();}
function s9(c,t,s){
 const at=s.cards[2].from;background(c,t,'lab');
 switchShot(c,t,at,()=>{
  title(c,'BUKAN PEMBANGKIT','LISTRIK PURBA.',{y:185,size:46});plant(c,235,610);
  for(let i=0;i<6;i++){const x=70+i*95;rr(c,x,735,50,65+rand(i)*45,0,null,'#4b6860');for(let j=0;j<6;j++)rr(c,x+8+(j%2)*22,748+Math.floor(j/2)*18,7,8,0,'#365047');}
  const p=P(t,s.cards[1].from,1);trace(c,[[140,760],[590,355]],p,C.red,4);mono(c,'REAKTOR ALAMI ≠ PEMBANGKIT LISTRIK',360,885,13,C.red,'center');
 },()=>{
  const p=P(t,at,1);rock(c,355,515,190,t,{cut:true});
  const items=[['URANIUM',C.jade,115,300],['AIR TANAH',C.blue,590,360],['GEOLOGI',C.amber,360,790]];
  items.forEach(([name,col,x,y],i)=>{const q=P(t,s.cards[3].from+i*.5,.7);line(c,x,y,355,515,col+'77',1);dot(c,x,y,48,'#112923');c.beginPath();c.arc(x,y,48,-Math.PI/2,-Math.PI/2+TAU*q);c.strokeStyle=col;c.lineWidth=2;c.stroke();mono(c,name,x,y+5,12,col,'center');});
  title(c,'KONDISI YANG PAS',null,{y:185,size:44});diagramNote(c,'TEMPAT + ZAMAN + BAHAN YANG MENDUKUNG');
 });
}
function s10(c,t,s){
 const at=s.cards[3].from;background(c,t,'lab');
 switchShot(c,t,at,()=>{
  sample(c,360,505,1.38);title(c,'REAKTORNYA PADAM.','BUKTINYA TERSIMPAN.',{y:225,size:44});
  line(c,75,760,645,760,C.line,1);for(const [x,label] of[[85,'~2 MILIAR TAHUN'],[570,'SEKARANG']]){dot(c,x,760,3,C.amber);mono(c,label,x,795,10,C.dim,x>400?'right':'left');}
  const p=P(t,s.cards[1].from,2);trace(c,[[85,760],[570,760]],p,C.amber,2);diagramNote(c,'BATUAN SEBAGAI ARSIP PROSES ALAM');
 },()=>{
  map(c,t,{close:true});
  c.fillStyle='#07151388';c.fillRect(0,130,720,770);
  if(t<s.cards[5].from){txt(c,'BUKAN SIAPA.',55,335,65,C.ink,'IT800');line(c,55,320,525,320,C.red,2);}
  else{title(c,'BAGAIMANA','ITU MUNGKIN?',{y:315,size:69,col:C.amber});}
  if(t>s.cards[6].from){const p=P(t,s.cards[6].from,.5);c.save();c.globalAlpha=p;rr(c,58,710,604,105,14,'#152d26','#82a58b');dot(c,100,760,22,C.jade);txt(c,'N',100,769,23,'#14392b','PJS800','center');txt(c,'Baru tahu tentang Oklo?',140,752,22,C.ink);mono(c,'TULIS DI KOMENTAR',140,785,12,C.amber);c.restore();}
  mono(c,'IAEA / MESHIK DKK., PHYSICAL REVIEW LETTERS',55,887,9,C.dim);
 });
}
export const SCENES=[s1,s2,s3,s4,s5,s6,s7,s8,s9,s10];
