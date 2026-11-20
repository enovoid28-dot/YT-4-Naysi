// Original 2D illustration kit. All surfaces, strata, props and diagrams are drawn
// procedurally; Natural Earth is used only for factual map outlines.
export const C={bg:'#091516',dark:'#071113',paper:'#e9e0c9',ink:'#f1ecdf',dim:'#91a5a2',line:'#34504e',jade:'#81d6ac',deep:'#245747',amber:'#edb760',copper:'#be7049',blue:'#78bfd6',red:'#ec7a59'};
export const clamp=(v,a=0,b=1)=>Math.min(b,Math.max(a,v));
export const lerp=(a,b,p)=>a+(b-a)*p;
export const ease=p=>1-(1-clamp(p))**3;
export const smooth=p=>{p=clamp(p);return p*p*(3-2*p);};
export const rand=i=>{const v=Math.sin(i*127.13+71.82)*43758.5453;return v-Math.floor(v);};
export const TAU=Math.PI*2;
let A;
export function path(c,pts,close=false){c.beginPath();pts.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));if(close)c.closePath();}
export function line(c,x,y,X,Y,col=C.line,w=1){path(c,[[x,y],[X,Y]]);c.strokeStyle=col;c.lineWidth=w;c.stroke();}
export function rr(c,x,y,w,h,r=8,fill,stroke){c.beginPath();c.roundRect(x,y,w,h,r);if(fill){c.fillStyle=fill;c.fill();}if(stroke){c.lineWidth=1;c.strokeStyle=stroke;c.stroke();}}
export function dot(c,x,y,r,col){c.beginPath();c.arc(x,y,r,0,TAU);c.fillStyle=col;c.fill();}
export function txt(c,s,x,y,size=20,col=C.ink,font='PJS700',align='left'){c.font=`${size}px ${font}`;c.textAlign=align;c.textBaseline='alphabetic';c.fillStyle=col;c.fillText(s,x,y);}
export function mono(c,s,x,y,size=12,col=C.dim,align='left'){txt(c,s,x,y,size,col,'MONO6',align);}
export function pill(c,s,x,y,col=C.jade){c.font='12px MONO6';const w=c.measureText(s).width+24;rr(c,x,y-22,w,32,4,'#0c1a1b',col);mono(c,s,x+12,y,12,col);}
export function glow(c,x,y,r,col,alpha=.22){c.save();c.globalAlpha*=alpha;const g=c.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,col);g.addColorStop(1,col+'00');c.fillStyle=g;c.fillRect(x-r,y-r,2*r,2*r);c.restore();}
export function arrow(c,x,y,X,Y,col=C.amber,w=2){line(c,x,y,X,Y,col,w);const a=Math.atan2(Y-y,X-x);line(c,X,Y,X-10*Math.cos(a-.5),Y-10*Math.sin(a-.5),col,w);line(c,X,Y,X-10*Math.cos(a+.5),Y-10*Math.sin(a+.5),col,w);}
export function trace(c,pts,p,col=C.amber,w=2){const n=(pts.length-1)*clamp(p),k=Math.floor(n);if(k<0)return;const out=pts.slice(0,k+1);if(k+1<pts.length)out.push([lerp(pts[k][0],pts[k+1][0],n-k),lerp(pts[k][1],pts[k+1][1],n-k)]);path(c,out);c.strokeStyle=col;c.lineWidth=w;c.lineJoin='round';c.stroke();}
export function leader(c,s,x,y,X,Y,col=C.dim){line(c,x,y-4,X,Y,col,.8);dot(c,X,Y,2,col);mono(c,s,x,y-12,11,col);}
export function grain(c,seed=1,alpha=.06){c.save();c.globalAlpha=alpha;c.drawImage(A.noise,0,0,720,1280);c.restore();}
export function initArt(makeCanvas,geo){
 const noise=makeCanvas(720,1280),n=noise.getContext('2d');n.fillStyle='#80918a';n.fillRect(0,0,720,1280);for(let i=0;i<50000;i++){n.fillStyle=i%2?'#ffffff':'#000000';n.globalAlpha=.12+rand(i+400)*.3;n.fillRect(rand(i)*720,rand(i+10000)*1280,1,1);}
 const stone=makeCanvas(900,1100),s=stone.getContext('2d');s.fillStyle='#233731';s.fillRect(0,0,900,1100);
 for(let i=0;i<16000;i++){const x=rand(i+4)*900,y=rand(i+77)*1100,r=1+rand(i+99)*4;s.fillStyle=['#526153','#12241f','#7a7760','#3b4a3c'][i%4];s.globalAlpha=.07+rand(i+45)*.18;s.fillRect(x,y,r,r*.7);}
 for(let i=0;i<54;i++){s.beginPath();for(let k=0;k<34;k++){const x=rand(i*11+k)*900,y=i*23+Math.sin(k+i)*7;k?s.lineTo(x,y):s.moveTo(x,y);}s.strokeStyle='#b9c2a518';s.lineWidth=.5;s.stroke();}
 const paper=makeCanvas(720,1280),p=paper.getContext('2d');const pg=p.createLinearGradient(0,0,720,1280);pg.addColorStop(0,'#e8dfc5');pg.addColorStop(.5,'#f1ead9');pg.addColorStop(1,'#ccbea0');p.fillStyle=pg;p.fillRect(0,0,720,1280);p.globalAlpha=.07;p.drawImage(noise,0,0);
 const geoPlate=makeCanvas(720,1280),g=geoPlate.getContext('2d');g.fillStyle=C.bg;g.fillRect(0,0,720,1280);
 const colors=['#263d37','#32463a','#534a36','#374537','#233e38','#3e4b38','#6a5037','#2c3a30'];
 for(let i=0;i<14;i++){const pts=[];for(let x=-30;x<=760;x+=12)pts.push([x,180+i*76+Math.sin(x*.009+i*.8)*30+Math.sin(x*.035+i)*7]);pts.push([760,1350],[-30,1350]);path(g,pts,true);g.fillStyle=colors[i%colors.length];g.fill();path(g,pts.slice(0,-2));g.strokeStyle='#cfbb8b44';g.lineWidth=1;g.stroke();}
 g.globalAlpha=.28;g.drawImage(stone,0,0,720,1280);g.globalAlpha=.18;g.drawImage(noise,0,0);A={makeCanvas,noise,stone,paper,geoPlate,geo,cache:new Map()};
}
export function background(c,t,type='lab'){
 c.fillStyle=C.bg;c.fillRect(0,0,720,1280);
 if(type==='earth'){c.drawImage(A.geoPlate,0,0);c.fillStyle='#04110d70';c.fillRect(0,0,720,1280);}
 if(type==='paper'){c.drawImage(A.paper,0,0);return;}
 const g=c.createRadialGradient(370+Math.sin(t*.08)*30,520,10,360,560,720);g.addColorStop(0,type==='earth'?'#39745d25':'#285a533f');g.addColorStop(1,'#06111200');c.fillStyle=g;c.fillRect(0,0,720,1280);
 for(let i=0;i<42;i++){const x=rand(i)*720,y=(rand(i+100)*1300+t*(1+rand(i+200)*3))%1280;dot(c,x,y,.5+rand(i+1),`rgba(199,209,176,${.04+rand(i+50)*.13})`);}
 grain(c,1,.055);
}
export function rock(c,x,y,r,t=0,{cut=false,ore=true}={}){
 c.save();c.translate(x,y);const pts=[];for(let i=0;i<32;i++){const a=i/32*TAU,R=r*(.83+rand(i+11)*.17);pts.push([Math.cos(a)*R,Math.sin(a)*R*.82]);}
 path(c,pts,true);c.save();c.clip();c.drawImage(A.stone,-r,-r*.85,r*2,r*1.7);
 // Flat geological facets and branching mineral seams.
 for(let i=0;i<22;i++){const xx=(rand(i+500)-.5)*r*2,yy=(rand(i+700)-.5)*r*1.7;path(c,[[xx,yy],[xx+r*.5,yy+r*.1],[xx+r*.25,yy+r*.45]],true);c.fillStyle=i%2?'#a8b08a0d':'#00000020';c.fill();}
 if(ore)for(let i=0;i<7;i++){const ps=[];for(let k=0;k<17;k++)ps.push([-r+r*2*k/16,r*(-.55+i*.17)+Math.sin(k*.8+i)*r*.08+Math.sin(k*2+i)*r*.02]);path(c,ps);c.strokeStyle=i%2?'#b4c79988':'#69b58b99';c.lineWidth=2+i%3;c.stroke();for(let k=2;k<16;k+=3){const [X,Y]=ps[k];line(c,X,Y,X+r*.08,Y-r*.11,C.jade,.7);}}
 if(cut){c.fillStyle='#e1c78e18';c.fillRect(-r,0,r*2,r);for(let i=0;i<11;i++)line(c,-r,i*r/11,r,i*r/11,'#b8bd9e22',1);}
 c.restore();path(c,pts,true);c.strokeStyle='#a5af8c88';c.lineWidth=1.4;c.stroke();c.restore();
}
export function crossSection(c,t,{water=1,heat=0,ore=true,zoom=1}={}){
 c.save();c.translate(360,590);c.scale(zoom,zoom);c.translate(-360,-590);c.drawImage(A.geoPlate,0,180,720,770);
 // The ore is a lens within sandstone, not a manufactured vessel.
 const lens=[];for(let x=65;x<660;x+=8)lens.push([x,600+Math.sin((x-65)/595*Math.PI)*-65]);for(let x=660;x>=65;x-=8)lens.push([x,620+Math.sin((x-65)/595*Math.PI)*65]);
 path(c,lens,true);c.fillStyle='#1b3630';c.fill();c.save();c.clip();c.drawImage(A.stone,50,510,620,200);
 for(let i=0;i<160;i++){const x=65+rand(i)*595,y=540+rand(i+50)*150;dot(c,x,y,1+rand(i+500)*2,C.jade+'88');}
 if(heat>0)glow(c,350,610,310,C.red,heat*.65);c.restore();path(c,lens,true);c.strokeStyle=heat>.5?C.red:C.jade;c.lineWidth=2;c.stroke();
 const cracks=[[[105,250],[145,355],[119,434],[180,555]],[[550,230],[510,360],[555,438],[490,555]],[[340,230],[365,340],[322,422],[350,545]]];
 for(const ps of cracks){path(c,ps);c.strokeStyle='#061214';c.lineWidth=7;c.stroke();if(water>.02){trace(c,ps,water,C.blue,2.6);for(let j=0;j<6;j++){const u=(t*.14+j/6)%1,ii=Math.floor(u*(ps.length-1)),f=u*(ps.length-1)-ii;dot(c,lerp(ps[ii][0],ps[ii+1][0],f),lerp(ps[ii][1],ps[ii+1][1],f),2.3,C.blue);}}}
 // Surface topography, little trees and drill reference.
 const surface=[];for(let x=0;x<=720;x+=10)surface.push([x,242+Math.sin(x*.013)*13+Math.sin(x*.033)*6]);path(c,surface);c.strokeStyle='#bbbe9555';c.lineWidth=2;c.stroke();
 for(let i=0;i<8;i++){const x=40+i*91,y=235+Math.sin(x*.013)*13;line(c,x,y,x,y-27,'#a2b49777',1.3);path(c,[[x-12,y-12],[x,y-35],[x+12,y-12]],true);c.fillStyle='#1c3a2b';c.fill();}
 if(heat>.25)for(let i=0;i<18;i++){const u=(t*.23+rand(i))%1,x=170+rand(i+40)*380,y=570-u*260;dot(c,x+Math.sin(u*10+i)*8,y,2+u*4,`rgba(222,229,206,${(1-u)*heat*.3})`);}
 c.restore();
}
function project(lon,lat,view){return [view.x+(lon-view.lon)*view.scale,view.y-(lat-view.lat)*view.scale];}
export function map(c,t,{close=false}={}){
 const v=close?{x:360,y:550,lon:12,lat:0,scale:16}:{x:360,y:530,lon:19,lat:2,scale:6.6};
 c.save();c.beginPath();c.rect(35,170,650,715);c.clip();
 for(let lo=-30;lo<70;lo+=10){const [x]=project(lo,0,v);line(c,x,160,x,900,'#729a8c1f',.6);}for(let la=-40;la<50;la+=10){const [,y]=project(0,la,v);line(c,20,y,700,y,'#729a8c1f',.6);}
 for(const f of A.geo){const pol=f.geometry.type==='Polygon'?[f.geometry.coordinates]:f.geometry.coordinates;for(const p of pol){for(let ri=0;ri<p.length;ri++){const ring=p[ri];if(!ring.length)continue;path(c,ring.map(pt=>project(...pt,v)),true);c.fillStyle=f.name==='Gabon'?'#9bbf8b':'#29483f';c.fill();c.strokeStyle=f.name==='Gabon'?C.amber:'#87a68c77';c.lineWidth=f.name==='Gabon'?1.6:.65;c.stroke();}}}
 const [x,y]=project(13.17,-1.63,v);glow(c,x,y,55,C.amber,.2);dot(c,x,y,4,C.amber);for(let i=0;i<3;i++){const p=(t*.35+i/3)%1;c.beginPath();c.arc(x,y,7+p*32,0,TAU);c.strokeStyle=`rgba(237,183,96,${(1-p)*.6})`;c.lineWidth=1;c.stroke();}
 c.restore();leader(c,'OKLO · GABON',close?430:425,close?640:640,x,y,C.amber);mono(c,'OCÉAN ATLANTIQUE',75,690,10,'#8bb9b677');mono(c,'AFRIQUE',350,350,17,'#c6d6bd66','center');
}
export function nucleus(c,x,y,r,{split=0,seed=1,label=true,col=C.jade}={}){
 c.save();c.translate(x,y);
 for(let i=0;i<65;i++){const a=i*2.39996,R=Math.sqrt((i+.5)/65)*r*.85;let X=Math.cos(a)*R,Y=Math.sin(a)*R;if(split)X+=(X<0?-1:1)*split*r*1.4;dot(c,X,Y,r*.115,i%3===0?'#e8c081':i%2?'#6aaf8a':'#3b7766');}
 if(label&&split<.3)mono(c,'U-235',0,r+32,15,col,'center');c.restore();
}
export function neutron(c,x,y,r=4,col=C.amber){dot(c,x,y,r,col);}
export function paper(c,x,y,w,h,t=0){c.save();c.shadowColor='#00000066';c.shadowBlur=16;c.shadowOffsetY=12;rr(c,x,y,w,h,2,'#d7cdb0');c.restore();c.save();c.beginPath();c.rect(x,y,w,h);c.clip();c.drawImage(A.paper,x,y,w,h);for(let i=0;i<17;i++)line(c,x+20,y+55+i*22,x+w-20,y+55+i*22,'#5b604519',.6);c.restore();line(c,x+w*.47,y,x+w*.47,y+h,'#ffffff22',1);}
export function sample(c,x,y,scale=1){c.save();c.translate(x,y);c.scale(scale,scale);rr(c,-190,-70,380,140,8,'#9da599','#d1d2bd');rr(c,-178,-59,356,118,5,'#192e27');for(let i=0;i<6;i++){rock(c,-145+i*58,0,36,0,{cut:true});mono(c,String(i+1),-145+i*58,50,8,'#a7b9a4','center');}for(let i=0;i<32;i++)line(c,-180+i*11,75,-180+i*11,80+(i%5===0?8:0),C.dim,.7);c.restore();}
export function stamp(c,s,x,y,angle=-.1,col='#a84b36'){c.save();c.translate(x,y);c.rotate(angle);rr(c,-88,-24,176,48,3,null,col);txt(c,s,0,9,21,col,'MONO6','center');c.restore();}
export function machine(c,t,p=1){
 c.save();c.translate(70,350);rr(c,0,0,580,340,15,'#bcc4b4','#e1e4cc');rr(c,18,18,544,304,8,'#263d35');rr(c,37,40,345,220,8,'#071a17','#6a8b77');
 for(let x=50;x<375;x+=22)line(c,x,50,x,250,'#65a77a22',.7);for(let y=55;y<255;y+=22)line(c,45,y,370,y,'#65a77a22',.7);
 const pts=[];for(let x=0;x<320;x++){const signal=.4+Math.exp(-(((x-80)/7)**2))*110+Math.exp(-(((x-252)/8)**2))*152;pts.push([48+x,248-signal]);}trace(c,pts,p,C.jade,1.5);
 rr(c,412,46,128,62,4,'#14251f','#657765');txt(c,'U-235',476,87,21,C.jade,'MONO6','center');
 for(let i=0;i<3;i++){dot(c,436+i*43,154,13,'#71816d');line(c,436+i*43,154,442+i*43,145,'#182c22',2);}for(let i=0;i<12;i++)line(c,415,218+i*5,535,218+i*5,'#576e5c',1);
 mono(c,'ANALYSE ISOTOPIQUE',40,293,13,'#abb9a4');dot(c,535,294,4,p>.8?C.red:C.jade);c.restore();
}
export function waveform(c,x,y,w,h,p=1,cycles=3){for(let j=0;j<4;j++)line(c,x,y+j*h/3,x+w,y+j*h/3,C.line,.7);const pts=[];for(let i=0;i<=300;i++){const u=i/300,q=(u*cycles)%1,v=q<1/6?.84:.13;pts.push([x+u*w,y+h*(1-v)]);}trace(c,pts,p,C.amber,2.4);}
export function timeRing(c,x,y,r,p,t){c.beginPath();c.arc(x,y,r,0,TAU);c.strokeStyle='#42655a';c.lineWidth=18;c.stroke();c.beginPath();c.arc(x,y,r,-Math.PI/2,-Math.PI/2+TAU/6);c.strokeStyle=C.amber;c.lineWidth=18;c.stroke();for(let i=0;i<36;i++){const a=i/36*TAU-Math.PI/2;line(c,x+Math.cos(a)*(r+20),y+Math.sin(a)*(r+20),x+Math.cos(a)*(r+26+(i%6===0?5:0)),y+Math.sin(a)*(r+26+(i%6===0?5:0)),'#91a987',1);}const a=p*TAU-Math.PI/2;line(c,x,y,x+Math.cos(a)*(r-20),y+Math.sin(a)*(r-20),C.ink,2);dot(c,x,y,5,C.ink);}
export function title(c,a,b,{x=55,y=210,size=49,col=C.ink,sub=null}={}){txt(c,a,x,y,size,col,'IT800');if(b)txt(c,b,x,y+size*1.08,size,col,'IT800');if(sub)mono(c,sub,x,y+(b?size*1.08:0)+38,11,C.dim);}
