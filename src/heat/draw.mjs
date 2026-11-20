// Shared deterministic 2D renderer: native Canvas master and Remotion use the same frames.
const W=720,H=1280,TAU=Math.PI*2;
const C={bg:'#0a1015',ink:'#f2eee5',muted:'#86949c',line:'#28363f',amber:'#ffbc42',cyan:'#7fd5ec',red:'#fb795f',wood:'#ae7649'};
const clamp=(x,a=0,b=1)=>Math.min(b,Math.max(a,x));
const ease=x=>1-(1-clamp(x))**3;
let assets;
function rr(c,x,y,w,h,r,fill,stroke){c.beginPath();c.roundRect(x,y,w,h,r);if(fill){c.fillStyle=fill;c.fill();}if(stroke){c.strokeStyle=stroke;c.stroke();}}
function line(c,x,y,X,Y,color=C.line,width=1){c.beginPath();c.moveTo(x,y);c.lineTo(X,Y);c.lineWidth=width;c.strokeStyle=color;c.stroke();}
function text(c,str,x,y,size=20,color=C.ink,font='PJS700',align='left'){c.font=`${size}px ${font}`;c.textAlign=align;c.textBaseline='alphabetic';c.fillStyle=color;c.fillText(str,x,y);}
function dot(c,x,y,r,color){c.beginPath();c.arc(x,y,r,0,TAU);c.fillStyle=color;c.fill();}
function arrow(c,x,y,X,Y,color=C.amber,width=3){line(c,x,y,X,Y,color,width);const a=Math.atan2(Y-y,X-x);line(c,X,Y,X-12*Math.cos(a-.48),Y-12*Math.sin(a-.48),color,width);line(c,X,Y,X-12*Math.cos(a+.48),Y-12*Math.sin(a+.48),color,width);}
function tag(c,str,x,y,color=C.muted){c.font='12px MONO6';const w=c.measureText(str).width+24;rr(c,x,y-21,w,30,5,'#101a20',color);text(c,str,x+12,y,12,color,'MONO6');}
function rand(i){const v=Math.sin(i*127.1+311.7)*43758.5453;return v-Math.floor(v);}
export function initAssets(makeCanvas){
  const paper=makeCanvas(W,H),p=paper.getContext('2d');
  p.fillStyle=C.bg;p.fillRect(0,0,W,H);
  const g=p.createRadialGradient(355,510,30,355,510,680);g.addColorStop(0,'#182731');g.addColorStop(1,C.bg);p.fillStyle=g;p.fillRect(0,0,W,H);
  for(let i=0;i<23000;i++){p.fillStyle=i%2?'rgba(210,226,231,.023)':'rgba(0,0,0,.07)';p.fillRect(rand(i)*W,rand(i+20000)*H,1,1);}
  for(let x=48;x<700;x+=24)for(let y=300;y<890;y+=24)dot(p,x,y,.6,'#2c3b43');
  const metal=makeCanvas(560,220),m=metal.getContext('2d');
  const mg=m.createLinearGradient(0,0,30,220);[[0,'#8a969a'],[.22,'#d0d8d6'],[.48,'#65747c'],[.7,'#a8b2b3'],[1,'#4e5d66']].forEach(([a,b])=>mg.addColorStop(a,b));m.fillStyle=mg;m.fillRect(0,0,560,220);
  for(let i=0;i<1400;i++){m.strokeStyle=`rgba(${i%2?'255,255,255':'0,0,0'},${.015+rand(i)*.08})`;m.lineWidth=.4;const y=rand(i+3000)*220;line(m,rand(i)*70,y,400+rand(i+5)*160,y,m.strokeStyle,.4);}
  const wood=makeCanvas(560,220),v=wood.getContext('2d');v.fillStyle='#906039';v.fillRect(0,0,560,220);
  for(let i=0;i<180;i++){v.beginPath();for(let x=0;x<=560;x+=8){const y=i*1.6+Math.sin(x/90+i*.32)*5+Math.sin(x/35+i*.12)*2;x?v.lineTo(x,y):v.moveTo(x,y);}v.strokeStyle=i%4===0?'rgba(45,21,13,.34)':'rgba(226,172,110,.21)';v.lineWidth=i%6===0?2:.7;v.stroke();}
  for(let i=0;i<11;i++){v.beginPath();v.ellipse(390,105,10+i*8,2+i*2.8,-.06,0,TAU);v.strokeStyle='rgba(50,26,15,.19)';v.stroke();}
  assets={paper,metal,wood};
}
function material(c,type,x,y,w,h){c.save();rr(c,x,y,w,h,12);c.clip();c.drawImage(assets[type],x,y,w,h);c.restore();rr(c,x,y,w,h,12,null,type==='metal'?'#95a7ae':'#c58a57');for(const X of[x+13,x+w-13])for(const Y of[y+13,y+h-13]){dot(c,X,Y,3,'#142029');line(c,X-2,Y,X+2,Y,'#64727a',.7);}}
function finger(c,x,y,color=C.amber){
  // Flat anatomical contact marker, not a 3D hand.
  c.save();c.translate(x,y);c.beginPath();c.moveTo(-45,-120);c.lineTo(-45,-44);c.bezierCurveTo(-45,15,45,15,45,-44);c.lineTo(45,-120);c.closePath();const g=c.createLinearGradient(0,-120,0,0);g.addColorStop(0,'#412d25');g.addColorStop(1,'#b36c45');c.fillStyle=g;c.fill();c.strokeStyle=color;c.lineWidth=1.5;c.stroke();rr(c,-29,-97,58,44,15,'#ce956f66','#e6bb8e55');for(let i=0;i<4;i++){c.beginPath();c.ellipse(0,-28,17+i*5,4+i*2,0,.1,Math.PI-.1);c.strokeStyle='#e9ad7655';c.lineWidth=.7;c.stroke();}c.restore();
}
function flow(c,x,y,X,Y,t,speed=1,count=9,color=C.amber){arrow(c,x,y,X,Y,color,2);for(let j=0;j<count;j++){const p=(t*speed*.24+j/count)%1;dot(c,x+(X-x)*p,y+(Y-y)*p,2.6,color);}}
function split(c,t,temps=true){
  for(let i=0;i<2;i++){const x=52+i*326;tag(c,i?'B / KAYU':'A / BESI',x,362,i?C.amber:C.cyan);material(c,i?'wood':'metal',x,440,290,210);if(temps)text(c,'25°C',x+145,745,66,C.ink,'IT800','center');}
  line(c,360,370,360,790,C.line);text(c,'=',360,725,28,C.muted,'PJS700','center');
}
function contact(c,t,isWood=false){
  const x=65,y=498,w=590,h=250;material(c,isWood?'wood':'metal',x,y,w,h);finger(c,170,y);text(c,'KULIT',170,320,15,C.amber,'MONO6','center');text(c,isWood?'KAYU':'BESI',545,790,18,isWood?C.amber:C.cyan,'MONO6','right');
  const speed=isWood?.18:1.3;
  for(let j=0;j<5;j++){const py=y+35+j*42;flow(c,170,py,isWood?240:600,py,t,speed,isWood?2:8,isWood?'#ffe2a0':C.amber);}
  c.save();const g=c.createRadialGradient(170,y,3,170,y,isWood?110:340);g.addColorStop(0,'#ffb34c88');g.addColorStop(1,'#ffb34c00');c.fillStyle=g;c.fillRect(x,y,w,h);c.restore();
  if(isWood){for(let i=0;i<28;i++){const xx=300+(i%7)*45,yy=532+Math.floor(i/7)*52;c.beginPath();c.ellipse(xx,yy,14,20,.2,0,TAU);c.strokeStyle='#3d291b80';c.lineWidth=1.5;c.stroke();}}
  else{for(let i=0;i<32;i++)dot(c,280+(i%8)*45,540+Math.floor(i/8)*53,4,'#1d303b88');}
  tag(c,isWood?'MENGHANGAT DI TITIK SENTUH':'ENERGI TERSEBAR KE DALAM BAHAN',65,845,isWood?C.amber:C.cyan);
}
function chart(c,t){
  const x=98,y=425,w=535,h=315;for(let i=0;i<5;i++){line(c,x,y+i*h/4,x+w,y+i*h/4,'#293942');}
  line(c,x,y,x,y+h,C.muted);line(c,x,y+h,x+w,y+h,C.muted);text(c,'LEBIH HANGAT',x,y-28,13,C.muted,'MONO6');text(c,'WAKTU KONTAK →',x+w,y+h+38,13,C.muted,'MONO6','right');text(c,'SUHU KULIT',x,y+h+85,15,C.amber,'MONO6');
  for(let j=0;j<2;j++){const color=j?C.amber:C.cyan,p=ease(t/3);c.beginPath();for(let i=0;i<=160*p;i++){const u=i/160,X=x+u*w,Y=y+36+(j?58:235)*(1-Math.exp(-u*(j?4:8)));i?c.lineTo(X,Y):c.moveTo(X,Y);}c.strokeStyle=color;c.lineWidth=4;c.stroke();const u=p;dot(c,x+u*w,y+36+(j?58:235)*(1-Math.exp(-u*(j?4:8))),6,color);}
  tag(c,'KAYU',465,480,C.amber);tag(c,'BESI',465,690,C.cyan);text(c,'SKEMA KUALITATIF · BUKAN DATA PENGUKURAN',98,885,11,C.muted,'MONO6');
}
function formula(c,t){
  text(c,'EFUSIVITAS TERMAL',55,385,17,C.amber,'MONO6');
  rr(c,52,420,616,170,18,'#101e26','#48616e');text(c,'e = √(k · ρ · c)',360,532,67,C.ink,'IT800','center');
  const rows=[['k','DAYA HANTAR PANAS',C.cyan],['ρ','MASSA JENIS',C.amber],['c','KAPASITAS PANAS SPESIFIK',C.red]];
  rows.forEach(([s,label,col],i)=>{const p=ease((t-.3-i*.3)/.8);c.save();c.globalAlpha=p;const Y=650+i*82;dot(c,84,Y-8,22,'#20323c');text(c,s,84,Y,26,col,'IT800','center');text(c,label,128,Y,17,C.ink,'MONO6');c.restore();});
  text(c,'SIFAT BAHAN YANG MEMENGARUHI SENTUHAN',55,940,11,C.muted,'MONO6');
}
function room(c,t){
  rr(c,52,365,616,430,16,'#0e1920','#42545c');text(c,'KONDISI AWAL · SETELAH CUKUP LAMA',80,402,12,C.muted,'MONO6');
  material(c,'metal',95,575,215,130);material(c,'wood',410,575,215,130);text(c,'BESI',202,748,16,C.cyan,'MONO6','center');text(c,'KAYU',517,748,16,C.amber,'MONO6','center');
  text(c,'25°C',360,525,92,C.ink,'IT800','center');line(c,360,555,360,720,C.line);for(let i=0;i<20;i++){const x=85+rand(i)*550,y=432+((rand(i+2)*300+t*9)%300);dot(c,x,y,1.6,'#8eb0c344');}
  tag(c,'TANPA MATAHARI / SUMBER PANAS LAIN',80,850,C.muted);
}
function direction(c,t,hot=false){
  material(c,'metal',435,435,215,270);finger(c,155,655);text(c,'KULIT',155,748,20,C.amber,'MONO6','center');text(c,hot?'LOGAM PANAS':'BENDA',543,748,20,hot?C.red:C.cyan,'MONO6','center');
  flow(c,hot?420:220,560,hot?220:420,560,t,1.5,7,hot?C.red:C.amber);
  text(c,hot?'PANAS MASUK':'PANAS KELUAR',355,390,23,hot?C.red:C.amber,'PJS700','center');
  if(hot){for(let i=0;i<4;i++){c.beginPath();for(let y=0;y<90;y++){const x=478+i*40+Math.sin(y*.09-t*3)*5;y?c.lineTo(x,420-y):c.moveTo(x,420-y);}c.strokeStyle='#fb795f77';c.lineWidth=2;c.stroke();}rr(c,65,830,590,82,10,'#391d1b','#a25742');text(c,'JANGAN UJI DENGAN BENDA PANAS',360,879,19,'#ffb6a0','PJS700','center');}
  else{tag(c,'ENERGI: DARI SUHU TINGGI KE RENDAH',65,845,C.amber);}
}
function summary(c,t){
  split(c,t,false);
  text(c,'25°C',197,740,60,C.ink,'IT800','center');text(c,'25°C',523,740,60,C.ink,'IT800','center');
  const p=ease(t/2);for(let i=0;i<2;i++){rr(c,65+i*326,795,265,9,4,'#24333b');rr(c,65+i*326,795,(i?62:265)*p,9,4,i?C.amber:C.cyan);text(c,i?'PANAS LEBIH LAMBAT':'PANAS LEBIH CEPAT',65+i*326,840,13,i?C.amber:C.cyan,'MONO6');}
  text(c,'PERPINDAHAN PANAS DARI KULIT',360,900,12,C.muted,'MONO6','center');
}
export function captionLayout(c,s){
  const words=s.text.split(/\s+/);const accents=new Set();
  for(const phrase of s.accent){const p=phrase.split(' ');for(let i=0;i<words.length;i++)if(p.every((w,j)=>w===words[i+j]))for(let j=0;j<p.length;j++)accents.add(i+j);}
  let lines,size;
  for(size=44;size>=34;size--){c.font=`${size}px PJS700`;lines=[];let row=[],width=0;for(let i=0;i<words.length;i++){const ww=c.measureText(words[i]).width,sp=c.measureText(' ').width;if(row.length&&width+ww+sp>614){lines.push({row,width});row=[];width=0;}if(row.length)width+=sp;row.push({text:words[i],width:ww,accent:accents.has(i)});width+=ww;}if(row.length)lines.push({row,width});if(lines.length<=3)break;}
  return {lines,size};
}
const captions=new Map();
export function draw(c,t,timeline){
  c.save();c.scale(2,2);c.drawImage(assets.paper,0,0);
  const s=timeline.scenes.find(s=>t>=s.start&&t<s.start+s.duration)||timeline.scenes.at(-1),local=clamp(t-s.start,0,s.duration);
  c.save();c.globalAlpha=.6;text(c,'▪ N A Y S I',52,59,15,C.ink);text(c,'FISIKA / SENTUHAN',668,59,11,C.muted,'MONO6','right');c.restore();
  const p=ease(local/.6);c.save();c.globalAlpha=p;c.translate(0,(1-p)*15);
  text(c,`${String(s.index+1).padStart(2,'0')} / ${s.label}`,52,132,12,C.amber,'MONO6');
  const titleSize=Math.max(s.a.length,s.b.length)>15?43:50;
  text(c,s.a,49,202,titleSize,C.ink,'IT800');text(c,s.b,49,257,titleSize,s.index===0||s.index===9?C.amber:C.ink,'IT800');
  line(c,52,293,668,293,C.line);
  switch(s.index){
    case 0:split(c,local);text(c,'SAMA DI TERMOMETER. BEDA DI TANGAN.',360,850,14,C.muted,'MONO6','center');break;
    case 1:direction(c,local);break;
    case 2:room(c,local);break;
    case 3:direction(c,local);break;
    case 4:contact(c,local,false);break;
    case 5:contact(c,local,true);break;
    case 6:chart(c,local);break;
    case 7:formula(c,local);break;
    case 8:direction(c,local,true);break;
    case 9:summary(c,local);break;
  }
  c.restore();
  // Phrase boundaries measured in the actual take; never evenly divided by text length.
  const cardIndex=s.cards.findIndex(card=>local>=card.from&&local<card.to);
  const card=s.cards[cardIndex];
  const alpha=card?clamp((local-card.from)/.07)*clamp((card.to-local)/.06):0;
  if(alpha>0){const key=`${s.id}-${cardIndex}`;if(!captions.has(key))captions.set(key,captionLayout(c,{...s,text:card.text}));const {lines,size}=captions.get(key);c.save();c.globalAlpha=alpha;
    const g=c.createLinearGradient(0,930,0,1170);g.addColorStop(0,'#0a101500');g.addColorStop(.25,'#0a1015ee');g.addColorStop(1,C.bg);c.fillStyle=g;c.fillRect(0,930,720,250);
    c.font=`${size}px PJS700`;const sp=c.measureText(' ').width;
    lines.forEach((l,i)=>{let x=360-l.width/2;const y=1090-(lines.length-1-i)*size*1.17;for(const w of l.row){text(c,w.text,x,y,size,w.accent?C.amber:C.ink);x+=w.width+sp;}});c.restore();
  }
  text(c,`${String(s.index+1).padStart(2,'0')} — ${s.label}`,52,1228,11,C.muted,'MONO6');
  for(let i=0;i<10;i++)rr(c,495+i*17,1220,11,3,1,i===s.index?C.amber:'#35434a');
  rr(c,0,1276,720,4,0,'#26343c');rr(c,0,1276,720*clamp(t/timeline.duration),4,0,C.amber);
  c.restore();
}
