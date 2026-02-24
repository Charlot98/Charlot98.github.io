const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["./D_1-nxex.js","./CrjFWsFK.js","./entry.X-LiZzJh.css","./iik6CYzq.js"])))=>i.map(i=>d[i]);
import{r as Pn,f as xt,g as wt,h as $t,i as On,j as Dt,k as Q,l as Ct,m as T,n as St,p as En,q as Mt,s as on,v as kt,x as Pt,y as C,z as Ot,A as sn,B as Tn,C as un,D as Et,E as Tt,F as Lt,G as Ln,H as At,T as $e,I as Rt,J as _t,K as Bt,L as It,M as O,o as x,N as L,O as S,P as M,Q as jt,R as Ye,S as Ze,w as _,U as zt,V as B,b as V,W as cn,a as q,X as An,c as E,d as ue,t as ce,Y as Xe,Z as ee,$ as Ut,a0 as Ht,a1 as Ft,a2 as De,a3 as Ce,a4 as Vt,a5 as Rn,a6 as Ie,a7 as qt,a8 as Wt,a9 as Nt,aa as Yt}from"./CrjFWsFK.js";import{f as _n,n as Zt}from"./iik6CYzq.js";import{c as dn}from"./BAUJC1Nx.js";import{_ as Xt}from"./Cf3UX3Qd.js";import{p as Kt,v as Jt,i as Gt,a as Bn,d as Qt,c as er,r as nr,b as tr,n as In,f as J,e as Ke,g as jn,s as rr,m as W,h as Z,j as fn,k as ar,l as pn,M as lr}from"./DRrFtsXe.js";function Oe(e,n){return e-n*Math.floor(e/n)}const zn=1721426;function ge(e,n,t,r){n=Je(e,n);let a=n-1,l=-2;return t<=2?l=0:be(n)&&(l=-1),zn-1+365*a+Math.floor(a/4)-Math.floor(a/100)+Math.floor(a/400)+Math.floor((367*t-362)/12+l+r)}function be(e){return e%4===0&&(e%100!==0||e%400===0)}function Je(e,n){return e==="BC"?1-n:n}function or(e){let n="AD";return e<=0&&(n="BC",e=1-e),[n,e]}const sr={standard:[31,28,31,30,31,30,31,31,30,31,30,31],leapyear:[31,29,31,30,31,30,31,31,30,31,30,31]};class ne{fromJulianDay(n){let t=n,r=t-zn,a=Math.floor(r/146097),l=Oe(r,146097),o=Math.floor(l/36524),s=Oe(l,36524),u=Math.floor(s/1461),d=Oe(s,1461),i=Math.floor(d/365),f=a*400+o*100+u*4+i+(o!==4&&i!==4?1:0),[h,g]=or(f),p=t-ge(h,g,1,1),b=2;t<ge(h,g,3,1)?b=0:be(g)&&(b=1);let m=Math.floor(((p+b)*12+373)/367),y=t-ge(h,g,m,1)+1;return new de(h,g,m,y)}toJulianDay(n){return ge(n.era,n.year,n.month,n.day)}getDaysInMonth(n){return sr[be(n.year)?"leapyear":"standard"][n.month-1]}getMonthsInYear(n){return 12}getDaysInYear(n){return be(n.year)?366:365}getMaximumMonthsInYear(){return 12}getMaximumDaysInMonth(){return 31}getYearsInEra(n){return 9999}getEras(){return["BC","AD"]}isInverseEra(n){return n.era==="BC"}balanceDate(n){n.year<=0&&(n.era=n.era==="BC"?"AD":"BC",n.year=1-n.year)}constructor(){this.identifier="gregory"}}function ir(e,n){var t,r,a,l;return(l=(a=(t=e.isEqual)===null||t===void 0?void 0:t.call(e,n))!==null&&a!==void 0?a:(r=n.isEqual)===null||r===void 0?void 0:r.call(n,e))!==null&&l!==void 0?l:e.identifier===n.identifier}function ur(e){return U(Date.now(),e)}function cr(e){return hr(ur(e))}function Un(e,n){return e.calendar.toJulianDay(e)-n.calendar.toJulianDay(n)}function dr(e,n){return hn(e)-hn(n)}function hn(e){return e.hour*36e5+e.minute*6e4+e.second*1e3+e.millisecond}let Ee=null;function Me(){return Ee==null&&(Ee=new Intl.DateTimeFormat().resolvedOptions().timeZone),Ee}function te(e){e=I(e,new ne);let n=Je(e.era,e.year);return Hn(n,e.month,e.day,e.hour,e.minute,e.second,e.millisecond)}function Hn(e,n,t,r,a,l,o){let s=new Date;return s.setUTCHours(r,a,l,o),s.setUTCFullYear(e,n-1,t),s.getTime()}function je(e,n){if(n==="UTC")return 0;if(e>0&&n===Me())return new Date(e).getTimezoneOffset()*-6e4;let{year:t,month:r,day:a,hour:l,minute:o,second:s}=Fn(e,n);return Hn(t,r,a,l,o,s,0)-Math.floor(e/1e3)*1e3}const mn=new Map;function Fn(e,n){let t=mn.get(n);t||(t=new Intl.DateTimeFormat("en-US",{timeZone:n,hour12:!1,era:"short",year:"numeric",month:"numeric",day:"numeric",hour:"numeric",minute:"numeric",second:"numeric"}),mn.set(n,t));let r=t.formatToParts(new Date(e)),a={};for(let l of r)l.type!=="literal"&&(a[l.type]=l.value);return{year:a.era==="BC"||a.era==="B"?-a.year+1:+a.year,month:+a.month,day:+a.day,hour:a.hour==="24"?0:+a.hour,minute:+a.minute,second:+a.second}}const gn=864e5;function fr(e,n,t,r){return(t===r?[t]:[t,r]).filter(l=>pr(e,n,l))}function pr(e,n,t){let r=Fn(t,n);return e.year===r.year&&e.month===r.month&&e.day===r.day&&e.hour===r.hour&&e.minute===r.minute&&e.second===r.second}function z(e,n,t="compatible"){let r=re(e);if(n==="UTC")return te(r);if(n===Me()&&t==="compatible"){r=I(r,new ne);let u=new Date,d=Je(r.era,r.year);return u.setFullYear(d,r.month-1,r.day),u.setHours(r.hour,r.minute,r.second,r.millisecond),u.getTime()}let a=te(r),l=je(a-gn,n),o=je(a+gn,n),s=fr(r,n,a-l,a-o);if(s.length===1)return s[0];if(s.length>1)switch(t){case"compatible":case"earlier":return s[0];case"later":return s[s.length-1];case"reject":throw new RangeError("Multiple possible absolute times found")}switch(t){case"earlier":return Math.min(a-l,a-o);case"compatible":case"later":return Math.max(a-l,a-o);case"reject":throw new RangeError("No such absolute time found")}}function Vn(e,n,t="compatible"){return new Date(z(e,n,t))}function U(e,n){let t=je(e,n),r=new Date(e+t),a=r.getUTCFullYear(),l=r.getUTCMonth()+1,o=r.getUTCDate(),s=r.getUTCHours(),u=r.getUTCMinutes(),d=r.getUTCSeconds(),i=r.getUTCMilliseconds();return new ae(a<1?"BC":"AD",a<1?-a+1:a,l,o,n,t,s,u,d,i)}function hr(e){return new de(e.calendar,e.era,e.year,e.month,e.day)}function re(e,n){let t=0,r=0,a=0,l=0;if("timeZone"in e)({hour:t,minute:r,second:a,millisecond:l}=e);else if("hour"in e&&!n)return e;return n&&({hour:t,minute:r,second:a,millisecond:l}=n),new fe(e.calendar,e.era,e.year,e.month,e.day,t,r,a,l)}function I(e,n){if(ir(e.calendar,n))return e;let t=n.fromJulianDay(e.calendar.toJulianDay(e)),r=e.copy();return r.calendar=n,r.era=t.era,r.year=t.year,r.month=t.month,r.day=t.day,N(r),r}function mr(e,n,t){if(e instanceof ae)return e.timeZone===n?e:yr(e,n);let r=z(e,n,t);return U(r,n)}function gr(e){let n=te(e)-e.offset;return new Date(n)}function yr(e,n){let t=te(e)-e.offset;return I(U(t,n),e.calendar)}const oe=36e5;function ke(e,n){let t=e.copy(),r="hour"in t?wr(t,n):0;ze(t,n.years||0),t.calendar.balanceYearMonth&&t.calendar.balanceYearMonth(t,e),t.month+=n.months||0,Ue(t),qn(t),t.day+=(n.weeks||0)*7,t.day+=n.days||0,t.day+=r,vr(t),t.calendar.balanceDate&&t.calendar.balanceDate(t),t.year<1&&(t.year=1,t.month=1,t.day=1);let a=t.calendar.getYearsInEra(t);if(t.year>a){var l,o;let u=(l=(o=t.calendar).isInverseEra)===null||l===void 0?void 0:l.call(o,t);t.year=a,t.month=u?1:t.calendar.getMonthsInYear(t),t.day=u?1:t.calendar.getDaysInMonth(t)}t.month<1&&(t.month=1,t.day=1);let s=t.calendar.getMonthsInYear(t);return t.month>s&&(t.month=s,t.day=t.calendar.getDaysInMonth(t)),t.day=Math.max(1,Math.min(t.calendar.getDaysInMonth(t),t.day)),t}function ze(e,n){var t,r;!((t=(r=e.calendar).isInverseEra)===null||t===void 0)&&t.call(r,e)&&(n=-n),e.year+=n}function Ue(e){for(;e.month<1;)ze(e,-1),e.month+=e.calendar.getMonthsInYear(e);let n=0;for(;e.month>(n=e.calendar.getMonthsInYear(e));)e.month-=n,ze(e,1)}function vr(e){for(;e.day<1;)e.month--,Ue(e),e.day+=e.calendar.getDaysInMonth(e);for(;e.day>e.calendar.getDaysInMonth(e);)e.day-=e.calendar.getDaysInMonth(e),e.month++,Ue(e)}function qn(e){e.month=Math.max(1,Math.min(e.calendar.getMonthsInYear(e),e.month)),e.day=Math.max(1,Math.min(e.calendar.getDaysInMonth(e),e.day))}function N(e){e.calendar.constrainDate&&e.calendar.constrainDate(e),e.year=Math.max(1,Math.min(e.calendar.getYearsInEra(e),e.year)),qn(e)}function Wn(e){let n={};for(let t in e)typeof e[t]=="number"&&(n[t]=-e[t]);return n}function Nn(e,n){return ke(e,Wn(n))}function Ge(e,n){let t=e.copy();return n.era!=null&&(t.era=n.era),n.year!=null&&(t.year=n.year),n.month!=null&&(t.month=n.month),n.day!=null&&(t.day=n.day),N(t),t}function Se(e,n){let t=e.copy();return n.hour!=null&&(t.hour=n.hour),n.minute!=null&&(t.minute=n.minute),n.second!=null&&(t.second=n.second),n.millisecond!=null&&(t.millisecond=n.millisecond),xr(t),t}function br(e){e.second+=Math.floor(e.millisecond/1e3),e.millisecond=ye(e.millisecond,1e3),e.minute+=Math.floor(e.second/60),e.second=ye(e.second,60),e.hour+=Math.floor(e.minute/60),e.minute=ye(e.minute,60);let n=Math.floor(e.hour/24);return e.hour=ye(e.hour,24),n}function xr(e){e.millisecond=Math.max(0,Math.min(e.millisecond,1e3)),e.second=Math.max(0,Math.min(e.second,59)),e.minute=Math.max(0,Math.min(e.minute,59)),e.hour=Math.max(0,Math.min(e.hour,23))}function ye(e,n){let t=e%n;return t<0&&(t+=n),t}function wr(e,n){return e.hour+=n.hours||0,e.minute+=n.minutes||0,e.second+=n.seconds||0,e.millisecond+=n.milliseconds||0,br(e)}function Qe(e,n,t,r){let a=e.copy();switch(n){case"era":{let s=e.calendar.getEras(),u=s.indexOf(e.era);if(u<0)throw new Error("Invalid era: "+e.era);u=H(u,t,0,s.length-1,r?.round),a.era=s[u],N(a);break}case"year":var l,o;!((l=(o=a.calendar).isInverseEra)===null||l===void 0)&&l.call(o,a)&&(t=-t),a.year=H(e.year,t,-1/0,9999,r?.round),a.year===-1/0&&(a.year=1),a.calendar.balanceYearMonth&&a.calendar.balanceYearMonth(a,e);break;case"month":a.month=H(e.month,t,1,e.calendar.getMonthsInYear(e),r?.round);break;case"day":a.day=H(e.day,t,1,e.calendar.getDaysInMonth(e),r?.round);break;default:throw new Error("Unsupported field "+n)}return e.calendar.balanceDate&&e.calendar.balanceDate(a),N(a),a}function Yn(e,n,t,r){let a=e.copy();switch(n){case"hour":{let l=e.hour,o=0,s=23;if(r?.hourCycle===12){let u=l>=12;o=u?12:0,s=u?23:11}a.hour=H(l,t,o,s,r?.round);break}case"minute":a.minute=H(e.minute,t,0,59,r?.round);break;case"second":a.second=H(e.second,t,0,59,r?.round);break;case"millisecond":a.millisecond=H(e.millisecond,t,0,999,r?.round);break;default:throw new Error("Unsupported field "+n)}return a}function H(e,n,t,r,a=!1){if(a){e+=Math.sign(n),e<t&&(e=r);let l=Math.abs(n);n>0?e=Math.ceil(e/l)*l:e=Math.floor(e/l)*l,e>r&&(e=t)}else e+=n,e<t?e=r-(t-e-1):e>r&&(e=t+(e-r-1));return e}function Zn(e,n){let t;if(n.years!=null&&n.years!==0||n.months!=null&&n.months!==0||n.weeks!=null&&n.weeks!==0||n.days!=null&&n.days!==0){let a=ke(re(e),{years:n.years,months:n.months,weeks:n.weeks,days:n.days});t=z(a,e.timeZone)}else t=te(e)-e.offset;t+=n.milliseconds||0,t+=(n.seconds||0)*1e3,t+=(n.minutes||0)*6e4,t+=(n.hours||0)*36e5;let r=U(t,e.timeZone);return I(r,e.calendar)}function $r(e,n){return Zn(e,Wn(n))}function Dr(e,n,t,r){switch(n){case"hour":{let a=0,l=23;if(r?.hourCycle===12){let p=e.hour>=12;a=p?12:0,l=p?23:11}let o=re(e),s=I(Se(o,{hour:a}),new ne),u=[z(s,e.timeZone,"earlier"),z(s,e.timeZone,"later")].filter(p=>U(p,e.timeZone).day===s.day)[0],d=I(Se(o,{hour:l}),new ne),i=[z(d,e.timeZone,"earlier"),z(d,e.timeZone,"later")].filter(p=>U(p,e.timeZone).day===d.day).pop(),f=te(e)-e.offset,h=Math.floor(f/oe),g=f%oe;return f=H(h,t,Math.floor(u/oe),Math.floor(i/oe),r?.round)*oe+g,I(U(f,e.timeZone),e.calendar)}case"minute":case"second":case"millisecond":return Yn(e,n,t,r);case"era":case"year":case"month":case"day":{let a=Qe(re(e),n,t,r),l=z(a,e.timeZone);return I(U(l,e.timeZone),e.calendar)}default:throw new Error("Unsupported field "+n)}}function Cr(e,n,t){let r=re(e),a=Se(Ge(r,n),n);if(a.compare(r)===0)return e;let l=z(a,e.timeZone,t);return I(U(l,e.timeZone),e.calendar)}function Sr(e){return`${String(e.hour).padStart(2,"0")}:${String(e.minute).padStart(2,"0")}:${String(e.second).padStart(2,"0")}${e.millisecond?String(e.millisecond/1e3).slice(1):""}`}function Xn(e){let n=I(e,new ne),t;return n.era==="BC"?t=n.year===1?"0000":"-"+String(Math.abs(1-n.year)).padStart(6,"00"):t=String(n.year).padStart(4,"0"),`${t}-${String(n.month).padStart(2,"0")}-${String(n.day).padStart(2,"0")}`}function Kn(e){return`${Xn(e)}T${Sr(e)}`}function Mr(e){let n=Math.sign(e)<0?"-":"+";e=Math.abs(e);let t=Math.floor(e/36e5),r=Math.floor(e%36e5/6e4),a=Math.floor(e%36e5%6e4/1e3),l=`${n}${String(t).padStart(2,"0")}:${String(r).padStart(2,"0")}`;return a!==0&&(l+=`:${String(a).padStart(2,"0")}`),l}function kr(e){return`${Kn(e)}${Mr(e.offset)}[${e.timeZone}]`}function Pr(e,n){if(n.has(e))throw new TypeError("Cannot initialize the same private elements twice on an object")}function en(e,n,t){Pr(e,n),n.set(e,t)}function nn(e){let n=typeof e[0]=="object"?e.shift():new ne,t;if(typeof e[0]=="string")t=e.shift();else{let o=n.getEras();t=o[o.length-1]}let r=e.shift(),a=e.shift(),l=e.shift();return[n,t,r,a,l]}var Or=new WeakMap;class de{copy(){return this.era?new de(this.calendar,this.era,this.year,this.month,this.day):new de(this.calendar,this.year,this.month,this.day)}add(n){return ke(this,n)}subtract(n){return Nn(this,n)}set(n){return Ge(this,n)}cycle(n,t,r){return Qe(this,n,t,r)}toDate(n){return Vn(this,n)}toString(){return Xn(this)}compare(n){return Un(this,n)}constructor(...n){en(this,Or,{writable:!0,value:void 0});let[t,r,a,l,o]=nn(n);this.calendar=t,this.era=r,this.year=a,this.month=l,this.day=o,N(this)}}var Er=new WeakMap;class fe{copy(){return this.era?new fe(this.calendar,this.era,this.year,this.month,this.day,this.hour,this.minute,this.second,this.millisecond):new fe(this.calendar,this.year,this.month,this.day,this.hour,this.minute,this.second,this.millisecond)}add(n){return ke(this,n)}subtract(n){return Nn(this,n)}set(n){return Ge(Se(this,n),n)}cycle(n,t,r){switch(n){case"era":case"year":case"month":case"day":return Qe(this,n,t,r);default:return Yn(this,n,t,r)}}toDate(n,t){return Vn(this,n,t)}toString(){return Kn(this)}compare(n){let t=Un(this,n);return t===0?dr(this,re(n)):t}constructor(...n){en(this,Er,{writable:!0,value:void 0});let[t,r,a,l,o]=nn(n);this.calendar=t,this.era=r,this.year=a,this.month=l,this.day=o,this.hour=n.shift()||0,this.minute=n.shift()||0,this.second=n.shift()||0,this.millisecond=n.shift()||0,N(this)}}var Tr=new WeakMap;class ae{copy(){return this.era?new ae(this.calendar,this.era,this.year,this.month,this.day,this.timeZone,this.offset,this.hour,this.minute,this.second,this.millisecond):new ae(this.calendar,this.year,this.month,this.day,this.timeZone,this.offset,this.hour,this.minute,this.second,this.millisecond)}add(n){return Zn(this,n)}subtract(n){return $r(this,n)}set(n,t){return Cr(this,n,t)}cycle(n,t,r){return Dr(this,n,t,r)}toDate(){return gr(this)}toString(){return kr(this)}toAbsoluteString(){return this.toDate().toISOString()}compare(n){return this.toDate().getTime()-mr(n,this.timeZone).toDate().getTime()}constructor(...n){en(this,Tr,{writable:!0,value:void 0});let[t,r,a,l,o]=nn(n),s=n.shift(),u=n.shift();this.calendar=t,this.era=r,this.year=a,this.month=l,this.day=o,this.timeZone=s,this.offset=u,this.hour=n.shift()||0,this.minute=n.shift()||0,this.second=n.shift()||0,this.millisecond=n.shift()||0,N(this)}}let Te=new Map;class F{format(n){return this.formatter.format(n)}formatToParts(n){return this.formatter.formatToParts(n)}formatRange(n,t){if(typeof this.formatter.formatRange=="function")return this.formatter.formatRange(n,t);if(t<n)throw new RangeError("End date must be >= start date");return`${this.formatter.format(n)} – ${this.formatter.format(t)}`}formatRangeToParts(n,t){if(typeof this.formatter.formatRangeToParts=="function")return this.formatter.formatRangeToParts(n,t);if(t<n)throw new RangeError("End date must be >= start date");let r=this.formatter.formatToParts(n),a=this.formatter.formatToParts(t);return[...r.map(l=>({...l,source:"startRange"})),{type:"literal",value:" – ",source:"shared"},...a.map(l=>({...l,source:"endRange"}))]}resolvedOptions(){let n=this.formatter.resolvedOptions();return Rr()&&(this.resolvedHourCycle||(this.resolvedHourCycle=_r(n.locale,this.options)),n.hourCycle=this.resolvedHourCycle,n.hour12=this.resolvedHourCycle==="h11"||this.resolvedHourCycle==="h12"),n.calendar==="ethiopic-amete-alem"&&(n.calendar="ethioaa"),n}constructor(n,t={}){this.formatter=Jn(n,t),this.options=t}}const Lr={true:{ja:"h11"},false:{}};function Jn(e,n={}){if(typeof n.hour12=="boolean"&&Ar()){n={...n};let a=Lr[String(n.hour12)][e.split("-")[0]],l=n.hour12?"h12":"h23";n.hourCycle=a??l,delete n.hour12}let t=e+(n?Object.entries(n).sort((a,l)=>a[0]<l[0]?-1:1).join():"");if(Te.has(t))return Te.get(t);let r=new Intl.DateTimeFormat(e,n);return Te.set(t,r),r}let Le=null;function Ar(){return Le==null&&(Le=new Intl.DateTimeFormat("en-US",{hour:"numeric",hour12:!1}).format(new Date(2020,2,3,0))==="24"),Le}let Ae=null;function Rr(){return Ae==null&&(Ae=new Intl.DateTimeFormat("fr",{hour:"numeric",hour12:!1}).resolvedOptions().hourCycle==="h12"),Ae}function _r(e,n){if(!n.timeStyle&&!n.hour)return;e=e.replace(/(-u-)?-nu-[a-zA-Z0-9]+/,""),e+=(e.includes("-u-")?"":"-u")+"-nu-latn";let t=Jn(e,{...n,timeZone:void 0}),r=parseInt(t.formatToParts(new Date(2020,2,3,0)).find(l=>l.type==="hour").value,10),a=parseInt(t.formatToParts(new Date(2020,2,3,23)).find(l=>l.type==="hour").value,10);if(r===0&&a===23)return"h23";if(r===24&&a===23)return"h24";if(r===0&&a===11)return"h11";if(r===12&&a===11)return"h12";throw new Error("Unexpected hour cycle result")}function se(e,n=Me()){return tn(e)?e.toDate():e.toDate(n)}function Br(e){return e instanceof fe}function tn(e){return e instanceof ae}function Ir(e){return Br(e)||tn(e)}function jr(e,n={}){const t=Pn(e);function r(){return t.value}function a(m){t.value=m}function l(m,y){return new F(t.value,{...n,...y}).format(m)}function o(m,y=!0){return Ir(m)&&y?l(se(m),{dateStyle:"long",timeStyle:"long"}):l(se(m),{dateStyle:"long"})}function s(m,y={}){return new F(t.value,{...n,month:"long",year:"numeric",...y}).format(m)}function u(m,y={}){return new F(t.value,{...n,month:"long",...y}).format(m)}function d(){const m=cr(Me());return[1,2,3,4,5,6,7,8,9,10,11,12].map(k=>({label:u(se(m.set({month:k}))),value:k}))}function i(m,y={}){return new F(t.value,{...n,year:"numeric",...y}).format(m)}function f(m,y){return tn(m)?new F(t.value,{...n,...y,timeZone:m.timeZone}).formatToParts(se(m)):new F(t.value,{...n,...y}).formatToParts(se(m))}function h(m,y="narrow"){return new F(t.value,{...n,weekday:y}).format(m)}function g(m){const k=new F(t.value,{...n,hour:"numeric",minute:"numeric"}).formatToParts(m).find(j=>j.type==="dayPeriod")?.value;return k==="PM"||k==="p.m."?"PM":"AM"}const p={year:"numeric",month:"numeric",day:"numeric",hour:"numeric",minute:"numeric",second:"numeric"};function b(m,y,k={}){const j={...p,...k},w=f(m,j).find(he=>he.type===y);return w?w.value:""}return{setLocale:a,getLocale:r,fullMonth:u,fullYear:i,fullMonthAndYear:s,toParts:f,custom:l,part:b,dayPeriod:g,selectedDate:o,dayOfWeek:h,getMonths:d}}const zr={trailing:!0};function Ur(e,n=25,t={}){if(t={...zr,...t},!Number.isFinite(n))throw new TypeError("Expected `wait` to be a finite number");let r,a,l=[],o,s;const u=(f,h)=>(o=Hr(e,f,h),o.finally(()=>{if(o=null,t.trailing&&s&&!a){const g=u(f,s);return s=null,g}}),o),d=function(...f){return t.trailing&&(s=f),o||new Promise(h=>{const g=!a&&t.leading;clearTimeout(a),a=setTimeout(()=>{a=null;const p=t.leading?r:u(this,f);s=null;for(const b of l)b(p);l=[]},n),g?(r=u(this,f),h(r)):l.push(h)})},i=f=>{f&&(clearTimeout(f),a=null)};return d.isPending=()=>!!a,d.cancel=()=>{i(a),l=[],s=null},d.flush=()=>{if(i(a),!s||o)return;const f=s;return s=null,u(this,f)},d}async function Hr(e,n,t){return await e.apply(n,t)}const Fr=Symbol.for("nuxt:client-only");function Vr(...e){const n=typeof e[e.length-1]=="string"?e.pop():void 0;qr(e[0],e[1])&&e.unshift(n);let[t,r,a={}]=e,l=!1;const o=T(()=>St(t));if(typeof o.value!="string")throw new TypeError("[nuxt] [useAsyncData] key must be a string.");if(typeof r!="function")throw new TypeError("[nuxt] [useAsyncData] handler must be a function.");const s=xt();a.server??=!0,a.default??=Nr,a.getCachedData??=Qn,a.lazy??=!1,a.immediate??=!0,a.deep??=wt.deep,a.dedupe??="cancel",a._functionName,s._asyncData[o.value];function u(){const p={cause:"initial",dedupe:a.dedupe};return s._asyncData[o.value]?._init||(p.cachedData=a.getCachedData(o.value,s,{cause:"initial"}),s._asyncData[o.value]=yn(s,o.value,r,a,p.cachedData)),()=>s._asyncData[o.value].execute(p)}const d=u(),i=s._asyncData[o.value];i._deps++;const f=a.server!==!1&&s.payload.serverRendered;{let p=function(D){const w=s._asyncData[D];w?._deps&&(w._deps--,w._deps===0&&w?._off())};const b=En();if(b&&f&&a.immediate&&!b.sp&&(b.sp=[]),b&&!b._nuxtOnBeforeMountCbs){b._nuxtOnBeforeMountCbs=[];const D=b._nuxtOnBeforeMountCbs;$t(()=>{D.forEach(w=>{w()}),D.splice(0,D.length)}),On(()=>D.splice(0,D.length))}const m=b&&(b._nuxtClientOnly||Dt(Fr,!1));f&&s.isHydrating&&(i.error.value||i.data.value!==void 0)?i.status.value=i.error.value?"error":"success":b&&(!m&&s.payload.serverRendered&&s.isHydrating||a.lazy)&&a.immediate?b._nuxtOnBeforeMountCbs.push(d):a.immediate&&i.status.value!=="success"&&d();const y=Mt(),k=Q(o,(D,w)=>{if((D||w)&&D!==w){l=!0;const he=s._asyncData[w]?.data.value!==void 0,bt=s._asyncDataPromises[w]!==void 0,ln={cause:"initial",dedupe:a.dedupe};if(!s._asyncData[D]?._init){let me;w&&he?me=s._asyncData[w].data.value:(me=a.getCachedData(D,s,{cause:"initial"}),ln.cachedData=me),s._asyncData[D]=yn(s,D,r,a,me)}s._asyncData[D]._deps++,w&&p(w),(a.immediate||he||bt)&&s._asyncData[D].execute(ln),sn(()=>{l=!1})}},{flush:"sync"}),j=a.watch?Q(a.watch,()=>{l||(s._asyncData[o.value]?._execute.isPending()&&sn(()=>{s._asyncData[o.value]?._execute.flush()}),s._asyncData[o.value]?._execute({cause:"watch",dedupe:a.dedupe}))}):()=>{};y&&Ct(()=>{k(),j(),p(o.value)})}const h={data:ve(()=>s._asyncData[o.value]?.data),pending:ve(()=>s._asyncData[o.value]?.pending),status:ve(()=>s._asyncData[o.value]?.status),error:ve(()=>s._asyncData[o.value]?.error),refresh:(...p)=>s._asyncData[o.value]?._init?s._asyncData[o.value].execute(...p):u()(),execute:(...p)=>h.refresh(...p),clear:()=>{const p=s._asyncData[o.value];if(p?._abortController)try{p._abortController.abort(new DOMException("AsyncData aborted by user.","AbortError"))}finally{p._abortController=void 0}Gn(s,o.value)}},g=Promise.resolve(s._asyncDataPromises[o.value]).then(()=>h);return Object.assign(g,h),g}function ve(e){return T({get(){return e()?.value},set(n){const t=e();t&&(t.value=n)}})}function qr(e,n){return!(typeof e=="string"||typeof e=="object"&&e!==null||typeof e=="function"&&typeof n=="function")}function Gn(e,n){n in e.payload.data&&(e.payload.data[n]=void 0),n in e.payload._errors&&(e.payload._errors[n]=void 0),e._asyncData[n]&&(e._asyncData[n].data.value=C(e._asyncData[n]._default()),e._asyncData[n].error.value=void 0,e._asyncData[n].status.value="idle"),n in e._asyncDataPromises&&(e._asyncDataPromises[n]=void 0)}function Wr(e,n){const t={};for(const r of n)t[r]=e[r];return t}function yn(e,n,t,r,a){e.payload._errors[n]??=void 0;const l=r.getCachedData!==Qn,o=t,s=r.deep?Pn:on,u=a!==void 0,d=e.hook("app:data:refresh",async f=>{(!f||f.includes(n))&&await i.execute({cause:"refresh:hook"})}),i={data:s(u?a:r.default()),pending:T(()=>i.status.value==="pending"),error:Ot(e.payload._errors,n),status:on("idle"),execute:(...f)=>{const[h,g=void 0]=f,p=h&&g===void 0&&typeof h=="object"?h:{};if(e._asyncDataPromises[n]&&(p.dedupe??r.dedupe)==="defer")return e._asyncDataPromises[n];{const y="cachedData"in p?p.cachedData:r.getCachedData(n,e,{cause:p.cause??"refresh:manual"});if(y!==void 0)return e.payload.data[n]=i.data.value=y,i.error.value=void 0,i.status.value="success",Promise.resolve(y)}i._abortController&&i._abortController.abort(new DOMException("AsyncData request cancelled by deduplication","AbortError")),i._abortController=new AbortController,i.status.value="pending";const b=new AbortController,m=new Promise((y,k)=>{try{const j=p.timeout??r.timeout,D=Yr([i._abortController?.signal,p?.signal],b.signal,j);if(D.aborted){const w=D.reason;k(w instanceof Error?w:new DOMException(String(w??"Aborted"),"AbortError"));return}return D.addEventListener("abort",()=>{const w=D.reason;k(w instanceof Error?w:new DOMException(String(w??"Aborted"),"AbortError"))},{once:!0,signal:b.signal}),Promise.resolve(o(e,{signal:D})).then(y,k)}catch(j){k(j)}}).then(async y=>{let k=y;r.transform&&(k=await r.transform(y)),r.pick&&(k=Wr(k,r.pick)),e.payload.data[n]=k,i.data.value=k,i.error.value=void 0,i.status.value="success"}).catch(y=>{if(e._asyncDataPromises[n]&&e._asyncDataPromises[n]!==m||i._abortController?.signal.aborted)return e._asyncDataPromises[n];if(typeof DOMException<"u"&&y instanceof DOMException&&y.name==="AbortError")return i.status.value="idle",e._asyncDataPromises[n];i.error.value=Pt(y),i.data.value=C(r.default()),i.status.value="error"}).finally(()=>{b.abort(),delete e._asyncDataPromises[n]});return e._asyncDataPromises[n]=m,e._asyncDataPromises[n]},_execute:Ur((...f)=>i.execute(...f),0,{leading:!0}),_default:r.default,_deps:0,_init:!0,_hash:void 0,_off:()=>{d(),e._asyncData[n]?._init&&(e._asyncData[n]._init=!1),l||kt(()=>{e._asyncData[n]?._init||(Gn(e,n),i.execute=()=>Promise.resolve())})}};return i}const Nr=()=>{},Qn=(e,n,t)=>{if(n.isHydrating)return n.payload.data[e];if(t.cause!=="refresh:manual"&&t.cause!=="refresh:hook")return n.static.data[e]};function Yr(e,n,t){const r=e.filter(o=>!!o);if(typeof t=="number"&&t>=0){const o=AbortSignal.timeout?.(t);o&&r.push(o)}if(AbortSignal.any)return AbortSignal.any(r);const a=new AbortController;for(const o of r)if(o.aborted){const s=o.reason??new DOMException("Aborted","AbortError");try{a.abort(s)}catch{a.abort()}return a.signal}const l=()=>{const s=r.find(u=>u.aborted)?.reason??new DOMException("Aborted","AbortError");try{a.abort(s)}catch{a.abort()}};for(const o of r)o.addEventListener?.("abort",l,{once:!0,signal:n});return a.signal}class pe{constructor(n,t,r){this.normal=t,this.property=n,r&&(this.space=r)}}pe.prototype.normal={};pe.prototype.property={};pe.prototype.space=void 0;function et(e,n){const t={},r={};for(const a of e)Object.assign(t,a.property),Object.assign(r,a.normal);return new pe(t,r,n)}function He(e){return e.toLowerCase()}class A{constructor(n,t){this.attribute=t,this.property=n}}A.prototype.attribute="";A.prototype.booleanish=!1;A.prototype.boolean=!1;A.prototype.commaOrSpaceSeparated=!1;A.prototype.commaSeparated=!1;A.prototype.defined=!1;A.prototype.mustUseProperty=!1;A.prototype.number=!1;A.prototype.overloadedBoolean=!1;A.prototype.property="";A.prototype.spaceSeparated=!1;A.prototype.space=void 0;let Zr=0;const v=Y(),P=Y(),Fe=Y(),c=Y(),$=Y(),G=Y(),R=Y();function Y(){return 2**++Zr}const Ve=Object.freeze(Object.defineProperty({__proto__:null,boolean:v,booleanish:P,commaOrSpaceSeparated:R,commaSeparated:G,number:c,overloadedBoolean:Fe,spaceSeparated:$},Symbol.toStringTag,{value:"Module"})),Re=Object.keys(Ve);class rn extends A{constructor(n,t,r,a){let l=-1;if(super(n,t),vn(this,"space",a),typeof r=="number")for(;++l<Re.length;){const o=Re[l];vn(this,Re[l],(r&Ve[o])===Ve[o])}}}rn.prototype.defined=!0;function vn(e,n,t){t&&(e[n]=t)}function le(e){const n={},t={};for(const[r,a]of Object.entries(e.properties)){const l=new rn(r,e.transform(e.attributes||{},r),a,e.space);e.mustUseProperty&&e.mustUseProperty.includes(r)&&(l.mustUseProperty=!0),n[r]=l,t[He(r)]=r,t[He(l.attribute)]=r}return new pe(n,t,e.space)}const nt=le({properties:{ariaActiveDescendant:null,ariaAtomic:P,ariaAutoComplete:null,ariaBusy:P,ariaChecked:P,ariaColCount:c,ariaColIndex:c,ariaColSpan:c,ariaControls:$,ariaCurrent:null,ariaDescribedBy:$,ariaDetails:null,ariaDisabled:P,ariaDropEffect:$,ariaErrorMessage:null,ariaExpanded:P,ariaFlowTo:$,ariaGrabbed:P,ariaHasPopup:null,ariaHidden:P,ariaInvalid:null,ariaKeyShortcuts:null,ariaLabel:null,ariaLabelledBy:$,ariaLevel:c,ariaLive:null,ariaModal:P,ariaMultiLine:P,ariaMultiSelectable:P,ariaOrientation:null,ariaOwns:$,ariaPlaceholder:null,ariaPosInSet:c,ariaPressed:P,ariaReadOnly:P,ariaRelevant:null,ariaRequired:P,ariaRoleDescription:$,ariaRowCount:c,ariaRowIndex:c,ariaRowSpan:c,ariaSelected:P,ariaSetSize:c,ariaSort:null,ariaValueMax:c,ariaValueMin:c,ariaValueNow:c,ariaValueText:null,role:null},transform(e,n){return n==="role"?n:"aria-"+n.slice(4).toLowerCase()}});function tt(e,n){return n in e?e[n]:n}function rt(e,n){return tt(e,n.toLowerCase())}const Xr=le({attributes:{acceptcharset:"accept-charset",classname:"class",htmlfor:"for",httpequiv:"http-equiv"},mustUseProperty:["checked","multiple","muted","selected"],properties:{abbr:null,accept:G,acceptCharset:$,accessKey:$,action:null,allow:null,allowFullScreen:v,allowPaymentRequest:v,allowUserMedia:v,alt:null,as:null,async:v,autoCapitalize:null,autoComplete:$,autoFocus:v,autoPlay:v,blocking:$,capture:null,charSet:null,checked:v,cite:null,className:$,cols:c,colSpan:null,content:null,contentEditable:P,controls:v,controlsList:$,coords:c|G,crossOrigin:null,data:null,dateTime:null,decoding:null,default:v,defer:v,dir:null,dirName:null,disabled:v,download:Fe,draggable:P,encType:null,enterKeyHint:null,fetchPriority:null,form:null,formAction:null,formEncType:null,formMethod:null,formNoValidate:v,formTarget:null,headers:$,height:c,hidden:Fe,high:c,href:null,hrefLang:null,htmlFor:$,httpEquiv:$,id:null,imageSizes:null,imageSrcSet:null,inert:v,inputMode:null,integrity:null,is:null,isMap:v,itemId:null,itemProp:$,itemRef:$,itemScope:v,itemType:$,kind:null,label:null,lang:null,language:null,list:null,loading:null,loop:v,low:c,manifest:null,max:null,maxLength:c,media:null,method:null,min:null,minLength:c,multiple:v,muted:v,name:null,nonce:null,noModule:v,noValidate:v,onAbort:null,onAfterPrint:null,onAuxClick:null,onBeforeMatch:null,onBeforePrint:null,onBeforeToggle:null,onBeforeUnload:null,onBlur:null,onCancel:null,onCanPlay:null,onCanPlayThrough:null,onChange:null,onClick:null,onClose:null,onContextLost:null,onContextMenu:null,onContextRestored:null,onCopy:null,onCueChange:null,onCut:null,onDblClick:null,onDrag:null,onDragEnd:null,onDragEnter:null,onDragExit:null,onDragLeave:null,onDragOver:null,onDragStart:null,onDrop:null,onDurationChange:null,onEmptied:null,onEnded:null,onError:null,onFocus:null,onFormData:null,onHashChange:null,onInput:null,onInvalid:null,onKeyDown:null,onKeyPress:null,onKeyUp:null,onLanguageChange:null,onLoad:null,onLoadedData:null,onLoadedMetadata:null,onLoadEnd:null,onLoadStart:null,onMessage:null,onMessageError:null,onMouseDown:null,onMouseEnter:null,onMouseLeave:null,onMouseMove:null,onMouseOut:null,onMouseOver:null,onMouseUp:null,onOffline:null,onOnline:null,onPageHide:null,onPageShow:null,onPaste:null,onPause:null,onPlay:null,onPlaying:null,onPopState:null,onProgress:null,onRateChange:null,onRejectionHandled:null,onReset:null,onResize:null,onScroll:null,onScrollEnd:null,onSecurityPolicyViolation:null,onSeeked:null,onSeeking:null,onSelect:null,onSlotChange:null,onStalled:null,onStorage:null,onSubmit:null,onSuspend:null,onTimeUpdate:null,onToggle:null,onUnhandledRejection:null,onUnload:null,onVolumeChange:null,onWaiting:null,onWheel:null,open:v,optimum:c,pattern:null,ping:$,placeholder:null,playsInline:v,popover:null,popoverTarget:null,popoverTargetAction:null,poster:null,preload:null,readOnly:v,referrerPolicy:null,rel:$,required:v,reversed:v,rows:c,rowSpan:c,sandbox:$,scope:null,scoped:v,seamless:v,selected:v,shadowRootClonable:v,shadowRootDelegatesFocus:v,shadowRootMode:null,shape:null,size:c,sizes:null,slot:null,span:c,spellCheck:P,src:null,srcDoc:null,srcLang:null,srcSet:null,start:c,step:null,style:null,tabIndex:c,target:null,title:null,translate:null,type:null,typeMustMatch:v,useMap:null,value:P,width:c,wrap:null,writingSuggestions:null,align:null,aLink:null,archive:$,axis:null,background:null,bgColor:null,border:c,borderColor:null,bottomMargin:c,cellPadding:null,cellSpacing:null,char:null,charOff:null,classId:null,clear:null,code:null,codeBase:null,codeType:null,color:null,compact:v,declare:v,event:null,face:null,frame:null,frameBorder:null,hSpace:c,leftMargin:c,link:null,longDesc:null,lowSrc:null,marginHeight:c,marginWidth:c,noResize:v,noHref:v,noShade:v,noWrap:v,object:null,profile:null,prompt:null,rev:null,rightMargin:c,rules:null,scheme:null,scrolling:P,standby:null,summary:null,text:null,topMargin:c,valueType:null,version:null,vAlign:null,vLink:null,vSpace:c,allowTransparency:null,autoCorrect:null,autoSave:null,disablePictureInPicture:v,disableRemotePlayback:v,prefix:null,property:null,results:c,security:null,unselectable:null},space:"html",transform:rt}),Kr=le({attributes:{accentHeight:"accent-height",alignmentBaseline:"alignment-baseline",arabicForm:"arabic-form",baselineShift:"baseline-shift",capHeight:"cap-height",className:"class",clipPath:"clip-path",clipRule:"clip-rule",colorInterpolation:"color-interpolation",colorInterpolationFilters:"color-interpolation-filters",colorProfile:"color-profile",colorRendering:"color-rendering",crossOrigin:"crossorigin",dataType:"datatype",dominantBaseline:"dominant-baseline",enableBackground:"enable-background",fillOpacity:"fill-opacity",fillRule:"fill-rule",floodColor:"flood-color",floodOpacity:"flood-opacity",fontFamily:"font-family",fontSize:"font-size",fontSizeAdjust:"font-size-adjust",fontStretch:"font-stretch",fontStyle:"font-style",fontVariant:"font-variant",fontWeight:"font-weight",glyphName:"glyph-name",glyphOrientationHorizontal:"glyph-orientation-horizontal",glyphOrientationVertical:"glyph-orientation-vertical",hrefLang:"hreflang",horizAdvX:"horiz-adv-x",horizOriginX:"horiz-origin-x",horizOriginY:"horiz-origin-y",imageRendering:"image-rendering",letterSpacing:"letter-spacing",lightingColor:"lighting-color",markerEnd:"marker-end",markerMid:"marker-mid",markerStart:"marker-start",navDown:"nav-down",navDownLeft:"nav-down-left",navDownRight:"nav-down-right",navLeft:"nav-left",navNext:"nav-next",navPrev:"nav-prev",navRight:"nav-right",navUp:"nav-up",navUpLeft:"nav-up-left",navUpRight:"nav-up-right",onAbort:"onabort",onActivate:"onactivate",onAfterPrint:"onafterprint",onBeforePrint:"onbeforeprint",onBegin:"onbegin",onCancel:"oncancel",onCanPlay:"oncanplay",onCanPlayThrough:"oncanplaythrough",onChange:"onchange",onClick:"onclick",onClose:"onclose",onCopy:"oncopy",onCueChange:"oncuechange",onCut:"oncut",onDblClick:"ondblclick",onDrag:"ondrag",onDragEnd:"ondragend",onDragEnter:"ondragenter",onDragExit:"ondragexit",onDragLeave:"ondragleave",onDragOver:"ondragover",onDragStart:"ondragstart",onDrop:"ondrop",onDurationChange:"ondurationchange",onEmptied:"onemptied",onEnd:"onend",onEnded:"onended",onError:"onerror",onFocus:"onfocus",onFocusIn:"onfocusin",onFocusOut:"onfocusout",onHashChange:"onhashchange",onInput:"oninput",onInvalid:"oninvalid",onKeyDown:"onkeydown",onKeyPress:"onkeypress",onKeyUp:"onkeyup",onLoad:"onload",onLoadedData:"onloadeddata",onLoadedMetadata:"onloadedmetadata",onLoadStart:"onloadstart",onMessage:"onmessage",onMouseDown:"onmousedown",onMouseEnter:"onmouseenter",onMouseLeave:"onmouseleave",onMouseMove:"onmousemove",onMouseOut:"onmouseout",onMouseOver:"onmouseover",onMouseUp:"onmouseup",onMouseWheel:"onmousewheel",onOffline:"onoffline",onOnline:"ononline",onPageHide:"onpagehide",onPageShow:"onpageshow",onPaste:"onpaste",onPause:"onpause",onPlay:"onplay",onPlaying:"onplaying",onPopState:"onpopstate",onProgress:"onprogress",onRateChange:"onratechange",onRepeat:"onrepeat",onReset:"onreset",onResize:"onresize",onScroll:"onscroll",onSeeked:"onseeked",onSeeking:"onseeking",onSelect:"onselect",onShow:"onshow",onStalled:"onstalled",onStorage:"onstorage",onSubmit:"onsubmit",onSuspend:"onsuspend",onTimeUpdate:"ontimeupdate",onToggle:"ontoggle",onUnload:"onunload",onVolumeChange:"onvolumechange",onWaiting:"onwaiting",onZoom:"onzoom",overlinePosition:"overline-position",overlineThickness:"overline-thickness",paintOrder:"paint-order",panose1:"panose-1",pointerEvents:"pointer-events",referrerPolicy:"referrerpolicy",renderingIntent:"rendering-intent",shapeRendering:"shape-rendering",stopColor:"stop-color",stopOpacity:"stop-opacity",strikethroughPosition:"strikethrough-position",strikethroughThickness:"strikethrough-thickness",strokeDashArray:"stroke-dasharray",strokeDashOffset:"stroke-dashoffset",strokeLineCap:"stroke-linecap",strokeLineJoin:"stroke-linejoin",strokeMiterLimit:"stroke-miterlimit",strokeOpacity:"stroke-opacity",strokeWidth:"stroke-width",tabIndex:"tabindex",textAnchor:"text-anchor",textDecoration:"text-decoration",textRendering:"text-rendering",transformOrigin:"transform-origin",typeOf:"typeof",underlinePosition:"underline-position",underlineThickness:"underline-thickness",unicodeBidi:"unicode-bidi",unicodeRange:"unicode-range",unitsPerEm:"units-per-em",vAlphabetic:"v-alphabetic",vHanging:"v-hanging",vIdeographic:"v-ideographic",vMathematical:"v-mathematical",vectorEffect:"vector-effect",vertAdvY:"vert-adv-y",vertOriginX:"vert-origin-x",vertOriginY:"vert-origin-y",wordSpacing:"word-spacing",writingMode:"writing-mode",xHeight:"x-height",playbackOrder:"playbackorder",timelineBegin:"timelinebegin"},properties:{about:R,accentHeight:c,accumulate:null,additive:null,alignmentBaseline:null,alphabetic:c,amplitude:c,arabicForm:null,ascent:c,attributeName:null,attributeType:null,azimuth:c,bandwidth:null,baselineShift:null,baseFrequency:null,baseProfile:null,bbox:null,begin:null,bias:c,by:null,calcMode:null,capHeight:c,className:$,clip:null,clipPath:null,clipPathUnits:null,clipRule:null,color:null,colorInterpolation:null,colorInterpolationFilters:null,colorProfile:null,colorRendering:null,content:null,contentScriptType:null,contentStyleType:null,crossOrigin:null,cursor:null,cx:null,cy:null,d:null,dataType:null,defaultAction:null,descent:c,diffuseConstant:c,direction:null,display:null,dur:null,divisor:c,dominantBaseline:null,download:v,dx:null,dy:null,edgeMode:null,editable:null,elevation:c,enableBackground:null,end:null,event:null,exponent:c,externalResourcesRequired:null,fill:null,fillOpacity:c,fillRule:null,filter:null,filterRes:null,filterUnits:null,floodColor:null,floodOpacity:null,focusable:null,focusHighlight:null,fontFamily:null,fontSize:null,fontSizeAdjust:null,fontStretch:null,fontStyle:null,fontVariant:null,fontWeight:null,format:null,fr:null,from:null,fx:null,fy:null,g1:G,g2:G,glyphName:G,glyphOrientationHorizontal:null,glyphOrientationVertical:null,glyphRef:null,gradientTransform:null,gradientUnits:null,handler:null,hanging:c,hatchContentUnits:null,hatchUnits:null,height:null,href:null,hrefLang:null,horizAdvX:c,horizOriginX:c,horizOriginY:c,id:null,ideographic:c,imageRendering:null,initialVisibility:null,in:null,in2:null,intercept:c,k:c,k1:c,k2:c,k3:c,k4:c,kernelMatrix:R,kernelUnitLength:null,keyPoints:null,keySplines:null,keyTimes:null,kerning:null,lang:null,lengthAdjust:null,letterSpacing:null,lightingColor:null,limitingConeAngle:c,local:null,markerEnd:null,markerMid:null,markerStart:null,markerHeight:null,markerUnits:null,markerWidth:null,mask:null,maskContentUnits:null,maskUnits:null,mathematical:null,max:null,media:null,mediaCharacterEncoding:null,mediaContentEncodings:null,mediaSize:c,mediaTime:null,method:null,min:null,mode:null,name:null,navDown:null,navDownLeft:null,navDownRight:null,navLeft:null,navNext:null,navPrev:null,navRight:null,navUp:null,navUpLeft:null,navUpRight:null,numOctaves:null,observer:null,offset:null,onAbort:null,onActivate:null,onAfterPrint:null,onBeforePrint:null,onBegin:null,onCancel:null,onCanPlay:null,onCanPlayThrough:null,onChange:null,onClick:null,onClose:null,onCopy:null,onCueChange:null,onCut:null,onDblClick:null,onDrag:null,onDragEnd:null,onDragEnter:null,onDragExit:null,onDragLeave:null,onDragOver:null,onDragStart:null,onDrop:null,onDurationChange:null,onEmptied:null,onEnd:null,onEnded:null,onError:null,onFocus:null,onFocusIn:null,onFocusOut:null,onHashChange:null,onInput:null,onInvalid:null,onKeyDown:null,onKeyPress:null,onKeyUp:null,onLoad:null,onLoadedData:null,onLoadedMetadata:null,onLoadStart:null,onMessage:null,onMouseDown:null,onMouseEnter:null,onMouseLeave:null,onMouseMove:null,onMouseOut:null,onMouseOver:null,onMouseUp:null,onMouseWheel:null,onOffline:null,onOnline:null,onPageHide:null,onPageShow:null,onPaste:null,onPause:null,onPlay:null,onPlaying:null,onPopState:null,onProgress:null,onRateChange:null,onRepeat:null,onReset:null,onResize:null,onScroll:null,onSeeked:null,onSeeking:null,onSelect:null,onShow:null,onStalled:null,onStorage:null,onSubmit:null,onSuspend:null,onTimeUpdate:null,onToggle:null,onUnload:null,onVolumeChange:null,onWaiting:null,onZoom:null,opacity:null,operator:null,order:null,orient:null,orientation:null,origin:null,overflow:null,overlay:null,overlinePosition:c,overlineThickness:c,paintOrder:null,panose1:null,path:null,pathLength:c,patternContentUnits:null,patternTransform:null,patternUnits:null,phase:null,ping:$,pitch:null,playbackOrder:null,pointerEvents:null,points:null,pointsAtX:c,pointsAtY:c,pointsAtZ:c,preserveAlpha:null,preserveAspectRatio:null,primitiveUnits:null,propagate:null,property:R,r:null,radius:null,referrerPolicy:null,refX:null,refY:null,rel:R,rev:R,renderingIntent:null,repeatCount:null,repeatDur:null,requiredExtensions:R,requiredFeatures:R,requiredFonts:R,requiredFormats:R,resource:null,restart:null,result:null,rotate:null,rx:null,ry:null,scale:null,seed:null,shapeRendering:null,side:null,slope:null,snapshotTime:null,specularConstant:c,specularExponent:c,spreadMethod:null,spacing:null,startOffset:null,stdDeviation:null,stemh:null,stemv:null,stitchTiles:null,stopColor:null,stopOpacity:null,strikethroughPosition:c,strikethroughThickness:c,string:null,stroke:null,strokeDashArray:R,strokeDashOffset:null,strokeLineCap:null,strokeLineJoin:null,strokeMiterLimit:c,strokeOpacity:c,strokeWidth:null,style:null,surfaceScale:c,syncBehavior:null,syncBehaviorDefault:null,syncMaster:null,syncTolerance:null,syncToleranceDefault:null,systemLanguage:R,tabIndex:c,tableValues:null,target:null,targetX:c,targetY:c,textAnchor:null,textDecoration:null,textRendering:null,textLength:null,timelineBegin:null,title:null,transformBehavior:null,type:null,typeOf:R,to:null,transform:null,transformOrigin:null,u1:null,u2:null,underlinePosition:c,underlineThickness:c,unicode:null,unicodeBidi:null,unicodeRange:null,unitsPerEm:c,values:null,vAlphabetic:c,vMathematical:c,vectorEffect:null,vHanging:c,vIdeographic:c,version:null,vertAdvY:c,vertOriginX:c,vertOriginY:c,viewBox:null,viewTarget:null,visibility:null,width:null,widths:null,wordSpacing:null,writingMode:null,x:null,x1:null,x2:null,xChannelSelector:null,xHeight:c,y:null,y1:null,y2:null,yChannelSelector:null,z:null,zoomAndPan:null},space:"svg",transform:tt}),at=le({properties:{xLinkActuate:null,xLinkArcRole:null,xLinkHref:null,xLinkRole:null,xLinkShow:null,xLinkTitle:null,xLinkType:null},space:"xlink",transform(e,n){return"xlink:"+n.slice(5).toLowerCase()}}),lt=le({attributes:{xmlnsxlink:"xmlns:xlink"},properties:{xmlnsXLink:null,xmlns:null},space:"xmlns",transform:rt}),ot=le({properties:{xmlBase:null,xmlLang:null,xmlSpace:null},space:"xml",transform(e,n){return"xml:"+n.slice(3).toLowerCase()}}),Jr=/[A-Z]/g,bn=/-[a-z]/g,Gr=/^data[-\w.:]+$/i;function Qr(e,n){const t=He(n);let r=n,a=A;if(t in e.normal)return e.property[e.normal[t]];if(t.length>4&&t.slice(0,4)==="data"&&Gr.test(n)){if(n.charAt(4)==="-"){const l=n.slice(5).replace(bn,na);r="data"+l.charAt(0).toUpperCase()+l.slice(1)}else{const l=n.slice(4);if(!bn.test(l)){let o=l.replace(Jr,ea);o.charAt(0)!=="-"&&(o="-"+o),n="data"+o}}a=rn}return new a(r,n)}function ea(e){return"-"+e.toLowerCase()}function na(e){return e.charAt(1).toUpperCase()}const ta=et([nt,Xr,at,lt,ot],"html"),wl=et([nt,Kr,at,lt,ot],"svg"),ra=new Set(["a","abbr","address","area","article","aside","audio","b","base","bdi","bdo","blockquote","body","br","button","canvas","caption","cite","code","col","colgroup","data","datalist","dd","del","details","dfn","dialog","div","dl","dt","em","embed","fieldset","figcaption","figure","footer","form","h1","h2","h3","h4","h5","h6","head","header","hgroup","hr","html","i","iframe","img","input","ins","kbd","label","legend","li","link","main","map","mark","math","menu","menuitem","meta","meter","nav","noscript","object","ol","optgroup","option","output","p","param","picture","pre","progress","q","rb","rp","rt","rtc","ruby","s","samp","script","section","select","slot","small","source","span","strong","style","sub","summary","sup","svg","table","tbody","td","template","textarea","tfoot","th","thead","time","title","tr","track","u","ul","var","video","wbr"]);function aa(e,n){return n.reduce((t,r)=>{const a=la(e,r);return a!==void 0&&(t[r]=a),t},{})}function la(e,n){return n.split(".").reduce((t,r)=>t&&t[r],e)}const qe="default",st=/^@|^v-on:/,it=/^:|^v-bind:/,oa=/^v-model/,sa=["select","textarea","input"],ia=new Set(["math","svg"]),ut=new Set,ua=Object.fromEntries(["p","a","blockquote","code","pre","code","em","h1","h2","h3","h4","h5","h6","hr","img","ul","ol","li","strong","table","thead","tbody","td","th","tr","script"].map(e=>[e,`prose-${e}`])),ca=["script","base"],da=Tn({name:"MDCRenderer",props:{body:{type:Object,required:!0},data:{type:Object,default:()=>({})},class:{type:[String,Object],default:void 0},tag:{type:[String,Boolean],default:void 0},prose:{type:Boolean,default:void 0},components:{type:Object,default:()=>({})},unwrap:{type:[Boolean,String],default:!1}},async setup(e){const t=En()?.appContext?.app?.$nuxt,r=t?.$route||t?._route,{mdc:a}=t?.$config?.public||{},l=a?.components?.customElements||a?.components?.custom;l&&l.forEach(i=>ut.add(i));const o=T(()=>({...a?.components?.prose&&e.prose!==!1?ua:{},...a?.components?.map||{},...Tt(e.data?.mdc?.components||{}),...e.components})),s=T(()=>{const i=(e.body?.children||[]).map(f=>f.tag||f.type).filter(f=>!an(f));return Array.from(new Set(i)).sort().join(".")}),u=Et({...e.data});Q(()=>e.data,i=>{Object.assign(u,i)}),await $a(e.body,{tags:o.value});function d(i,f){const h=i.split(".").length-1;return i.split(".").reduce((g,p,b)=>b==h&&g?(g[p]=f,g[p]):typeof g=="object"?g[p]:void 0,u)}return{tags:o,contentKey:s,route:r,runtimeData:u,updateRuntimeData:d}},render(e){const{tags:n,tag:t,body:r,data:a,contentKey:l,route:o,unwrap:s,runtimeData:u,updateRuntimeData:d}=e;if(!r)return null;const i={...a,tags:n,$route:o,runtimeData:u,updateRuntimeData:d},f=t!==!1?We(t||i.component?.name||i.component||"div"):void 0;return f?un(f,{...i.component?.props,class:e.class,...this.$attrs,key:l},{default:h}):h?.();function h(){const g=ct(r,un,{documentMeta:i,parentScope:i,resolveComponent:We});return g?.default?s?_n(g.default(),typeof s=="string"?s.split(" "):["*"]):g.default():null}}});function fa(e,n,t,r){const{documentMeta:a,parentScope:l,resolveComponent:o}=t;if(e.type==="text")return n($e,e.value);if(e.type==="comment")return n(Rt,null,e.value);const s=e.tag,u=ft(e,a.tags);if(e.tag==="binding")return pa(e,n,a,l);const d=dt(u)?h=>h:o;if(ca.includes(u))return n("pre",{class:"mdc-renderer-dangerous-tag"},"<"+u+">"+Zt(e)+"</"+u+">");const i=d(u);typeof i=="object"&&(i.tag=s);const f=ha(e,a);return r&&(f.key=r),n(i,f,ct(e,n,{documentMeta:a,parentScope:{...l,...f},resolveComponent:d}))}function ct(e,n,t){const{documentMeta:r,parentScope:a,resolveComponent:l}=t,s=(e.children||[]).reduce((d,i)=>{if(!xa(i))return d[qe].children.push(i),d;const f=ba(i);return d[f]=d[f]||{props:{},children:[]},i.type==="element"&&(d[f].props=i.props,d[f].children.push(...i.children||[])),d},{[qe]:{props:{},children:[]}});return Object.entries(s).reduce((d,[i,{props:f,children:h}])=>(h.length&&(d[i]=(g={})=>{const p=aa(g,Object.keys(f||{}));let b=h.map((m,y)=>fa(m,n,{documentMeta:r,parentScope:{...a,...p},resolveComponent:l},String(m.props?.key||y)));return f?.unwrap&&(b=_n(b,f.unwrap)),wa(b)}),d),{})}function pa(e,n,t,r={}){const a={...t.runtimeData,...r,$document:t,$doc:t},l=/\.|\[(\d+)\]/,s=(e.props?.value.trim().split(l).filter(Boolean)).reduce((d,i)=>{if(d&&i in d)return typeof d[i]=="function"?d[i]():d[i]},a),u=e.props?.defaultValue;return n($e,s??u??"")}function ha(e,n){const{tag:t="",props:r={}}=e;return Object.keys(r).reduce(function(a,l){if(l==="__ignoreMap")return a;const o=r[l];if(oa.test(l))return ma(l,o,a,n,{native:sa.includes(t)});if(l==="v-bind")return ga(l,o,a,n);if(st.test(l))return ya(l,o,a,n);if(it.test(l))return va(l,o,a,n);const{attribute:s}=Qr(ta,l);return Array.isArray(o)&&o.every(u=>typeof u=="string")?(a[s]=o.join(" "),a):(a[s]=o,a)},{})}function ma(e,n,t,r,{native:a}){const l=e.match(/^v-model:([^=]+)/)?.[1]||"modelValue",o=a?"value":l,s=a?"onInput":`onUpdate:${l}`;return t[o]=Pe(n,r.runtimeData),t[s]=u=>{r.updateRuntimeData(n,a?u.target?.value:u)},t}function ga(e,n,t,r){const a=Pe(n,r);return t=Object.assign(t,a),t}function ya(e,n,t,r){return e=e.replace(st,""),t.on=t.on||{},t.on[e]=()=>Pe(n,r),t}function va(e,n,t,r){return e=e.replace(it,""),t[e]=Pe(n,r),t}const We=e=>{if(typeof e=="string"){if(an(e))return e;const n=Lt(Ln(e),!1);return!e||n?.name==="AsyncComponentWrapper"||typeof n=="string"?n:"setup"in n?At(()=>new Promise(t=>t(n))):n}return e};function Pe(e,n){const t=e.split(".").reduce((r,a)=>typeof r=="object"?r[a]:void 0,n);return typeof t>"u"?Bt(e):t}function ba(e){let n="";for(const t of Object.keys(e.props||{}))if(!(!t.startsWith("#")&&!t.startsWith("v-slot:"))){n=t.split(/[:#]/,2)[1];break}return n||qe}function xa(e){return e.tag==="template"}function dt(e){return ia.has(e)}function wa(e){const n=[];for(const t of e){const r=n[n.length-1];t.type===$e&&r?.type===$e?r.children=r.children+t.children:n.push(t)}return n}async function $a(e,n){if(!e)return;const t=Array.from(new Set(r(e,n)));await Promise.all(t.map(async a=>{if(a?.render||a?.ssrRender||a?.__ssrInlineRender)return;const l=We(a);l?.__asyncLoader&&!l.__asyncResolved&&await l.__asyncLoader()}));function r(a,l){const o=a.tag;if(a.type==="text"||o==="binding"||a.type==="comment")return[];const s=ft(a,l.tags);if(dt(s))return[];const u=[];a.type!=="root"&&!an(s)&&u.push(s);for(const d of a.children||[])u.push(...r(d,l));return u}}function ft(e,n){const t=e.tag;return!t||typeof e.props?.__ignoreMap<"u"?t:n[t]||n[Ln(t)]||n[_t(e.tag)]||t}function an(e){return(typeof e=="string"?ut.has(e):!1)||ra.has(e)}const Da=Object.assign(da,{__name:"MDCRenderer"}),Ca={__name:"MDC",props:{tag:{type:[String,Boolean],default:"div"},value:{type:[String,Object],required:!0},excerpt:{type:Boolean,default:!1},parserOptions:{type:Object,default:()=>({})},class:{type:[String,Array,Object],default:""},unwrap:{type:[Boolean,String],default:!1},cacheKey:{type:String,default:void 0},partial:{type:Boolean,default:!0}},async setup(e){let n,t;const r=e,a=T(()=>r.cacheKey??d(r.value)),{data:l,refresh:o,error:s}=([n,t]=It(async()=>Vr(a.value,async()=>{if(typeof r.value!="string")return r.value;const{parseMarkdown:i}=await jt(async()=>{const{parseMarkdown:f}=await import("./D_1-nxex.js").then(h=>h.i);return{parseMarkdown:f}},__vite__mapDeps([0,1,2,3]),import.meta.url);return await i(r.value,{...r.parserOptions,toc:r.partial?!1:r.parserOptions?.toc,contentHeading:r.partial?!1:r.parserOptions?.contentHeading})})),n=await n,t(),n),u=T(()=>r.excerpt?l.value?.excerpt:l.value?.body);Q(()=>r.value,()=>{o()});function d(i){typeof i!="string"&&(i=JSON.stringify(i||""));let f=0;for(let h=0;h<i.length;h++){const g=i.charCodeAt(h);f=(f<<6)-f+g,f=f&f}return`mdc-${f===0?"0000":f.toString(36)}-key`}return(i,f)=>{const h=Da;return O(i.$slots,"default",{data:C(l)?.data,body:C(l)?.body,toc:C(l)?.toc,excerpt:C(l)?.excerpt,error:C(s)},()=>[u.value?(x(),L(h,{key:0,tag:r.tag,class:S(r.class),body:u.value,data:C(l)?.data,unwrap:r.unwrap},null,8,["tag","class","body","data","unwrap"])):M("",!0)])}}},Sa={slots:{root:"relative group/user",wrapper:"",name:"font-medium",description:"text-muted",avatar:"shrink-0"},variants:{orientation:{horizontal:{root:"flex items-center"},vertical:{root:"flex flex-col"}},to:{true:{name:["text-default peer-hover:text-highlighted peer-focus-visible:text-highlighted","transition-colors"],description:["peer-hover:text-toned peer-focus-visible:text-toned","transition-colors"],avatar:"transform transition-transform duration-200 group-hover/user:scale-115 group-has-focus-visible/user:scale-115"},false:{name:"text-highlighted",description:""}},size:{"3xs":{root:"gap-1",wrapper:"flex items-center gap-1",name:"text-xs",description:"text-xs"},"2xs":{root:"gap-1.5",wrapper:"flex items-center gap-1.5",name:"text-xs",description:"text-xs"},xs:{root:"gap-1.5",wrapper:"flex items-center gap-1.5",name:"text-xs",description:"text-xs"},sm:{root:"gap-2",name:"text-xs",description:"text-xs"},md:{root:"gap-2",name:"text-sm",description:"text-xs"},lg:{root:"gap-2.5",name:"text-sm",description:"text-sm"},xl:{root:"gap-2.5",name:"text-base",description:"text-sm"},"2xl":{root:"gap-3",name:"text-base",description:"text-base"},"3xl":{root:"gap-3",name:"text-lg",description:"text-base"}}},defaultVariants:{size:"md"}},Ma=Object.assign({inheritAttrs:!1},{__name:"UUser",props:{as:{type:null,required:!1},name:{type:String,required:!1},description:{type:String,required:!1},avatar:{type:Object,required:!1},chip:{type:[Boolean,Object],required:!1},size:{type:null,required:!1},orientation:{type:null,required:!1,default:"horizontal"},to:{type:null,required:!1},target:{type:[String,Object,null],required:!1},onClick:{type:Function,required:!1},class:{type:null,required:!1},ui:{type:null,required:!1}},setup(e){const n=e,t=Ye(),r=Ze(),a=T(()=>ee({extend:ee(Sa),...r.ui?.user||{}})({size:n.size,orientation:n.orientation,to:!!n.to||!!n.onClick}));return(l,o)=>(x(),L(C(Xe),{as:e.as,"data-orientation":e.orientation,"data-slot":"root",class:S(a.value.root({class:[n.ui?.root,n.class]})),onClick:e.onClick},{default:_(()=>[O(l.$slots,"avatar",{ui:a.value},()=>[e.chip&&e.avatar?(x(),L(zt,B({key:0,inset:""},typeof e.chip=="object"?e.chip:{},{size:e.size}),{default:_(()=>[V(cn,B({alt:e.name},e.avatar,{size:e.size,"data-slot":"avatar",class:a.value.avatar({class:n.ui?.avatar})}),null,16,["alt","size","class"])]),_:1},16,["size"])):e.avatar?(x(),L(cn,B({key:1,alt:e.name},e.avatar,{size:e.size,"data-slot":"avatar",class:a.value.avatar({class:n.ui?.avatar})}),null,16,["alt","size","class"])):M("",!0)]),q("div",{"data-slot":"wrapper",class:S(a.value.wrapper({class:n.ui?.wrapper}))},[e.to?(x(),L(An,B({key:0,"aria-label":e.name},{to:e.to,target:e.target,...l.$attrs},{class:"focus:outline-none peer",raw:""}),{default:_(()=>[...o[0]||(o[0]=[q("span",{class:"absolute inset-0","aria-hidden":"true"},null,-1)])]),_:1},16,["aria-label"])):M("",!0),O(l.$slots,"default",{},()=>[e.name||t.name?(x(),E("p",{key:0,"data-slot":"name",class:S(a.value.name({class:n.ui?.name}))},[O(l.$slots,"name",{},()=>[ue(ce(e.name),1)])],2)):M("",!0),e.description||t.description?(x(),E("p",{key:1,"data-slot":"description",class:S(a.value.description({class:n.ui?.description}))},[O(l.$slots,"description",{},()=>[ue(ce(e.description),1)])],2)):M("",!0)])],2)]),_:3},8,["as","data-orientation","class","onClick"]))}}),ka={slots:{root:"relative",container:"flex flex-col mx-auto max-w-2xl",header:"",meta:"flex items-center gap-3 mb-2",date:"text-sm/6 text-toned truncate",badge:"",title:"relative text-xl text-pretty font-semibold text-highlighted",description:"text-base text-pretty text-muted mt-1",imageWrapper:"relative overflow-hidden rounded-lg aspect-[16/9] mt-5 group/changelog-version-image",image:"object-cover object-top w-full h-full",authors:"flex flex-wrap gap-x-4 gap-y-1.5",footer:"border-t border-default pt-5 flex items-center justify-between",indicator:"absolute start-0 top-0 w-32 hidden lg:flex items-center justify-end gap-3 min-w-0",dot:"size-4 rounded-full bg-default ring ring-default flex items-center justify-center my-1",dotInner:"size-2 rounded-full bg-primary"},variants:{body:{false:{footer:"mt-5"}},badge:{false:{meta:"lg:hidden"}},to:{true:{title:["has-focus-visible:ring-2 has-focus-visible:ring-primary rounded-xs","transition"],image:"transform transition-transform duration-200 group-hover/changelog-version-image:scale-105 group-has-focus-visible/changelog-version-image:scale-105"}},hidden:{true:{date:"lg:hidden"}}}},Pa=["datetime"],pt=Object.assign({inheritAttrs:!1},{__name:"UChangelogVersion",props:{as:{type:null,required:!1,default:"article"},title:{type:String,required:!1},description:{type:String,required:!1},date:{type:[String,Date],required:!1},badge:{type:[String,Object],required:!1},authors:{type:Array,required:!1},image:{type:[String,Object],required:!1},indicator:{type:Boolean,required:!1,default:!0},to:{type:null,required:!1},target:{type:[String,Object,null],required:!1},onClick:{type:Function,required:!1},class:{type:null,required:!1},ui:{type:null,required:!1}},setup(e){const n=e,t=Ye(),{locale:r}=Ut(),a=Ze(),l=jr(r.value.code),[o,s]=dn(),[u,d]=dn({props:{hidden:{type:Boolean,default:!1}}}),i=T(()=>ee({extend:ee(ka),...a.ui?.changelogVersion||{}})({to:!!n.to||!!n.onClick})),f=T(()=>{if(n.date)try{return l.custom(new Date(n.date),{dateStyle:"medium"})}catch{return n.date}}),h=T(()=>{if(n.date)try{return new Date(n.date)?.toISOString()}catch{return}}),g=T(()=>(t.title&&Vt(t.title())||n.title||"Version link").trim());return(p,b)=>(x(),E(De,null,[V(C(o),null,{default:_(()=>[e.to?(x(),L(An,B({key:0,"aria-label":g.value},{to:e.to,target:e.target,...p.$attrs},{class:"focus:outline-none peer",raw:""}),{default:_(()=>[...b[0]||(b[0]=[q("span",{class:"absolute inset-0","aria-hidden":"true"},null,-1)])]),_:1},16,["aria-label"])):M("",!0)]),_:1}),V(C(u),null,{default:_(({hidden:m})=>[f.value?(x(),E("time",{key:0,datetime:h.value,"data-slot":"date",class:S(i.value.date({class:n.ui?.date,hidden:m}))},[O(p.$slots,"date",{},()=>[ue(ce(f.value),1)])],10,Pa)):M("",!0)]),_:3}),V(C(Xe),{as:e.as,"data-slot":"root",class:S(i.value.root({class:[n.ui?.root,n.class]})),onClick:e.onClick},{default:_(()=>[n.indicator||t.indicator?(x(),E("div",{key:0,"data-slot":"indicator",class:S(i.value.indicator({class:n.ui?.indicator}))},[O(p.$slots,"indicator",{ui:i.value},()=>[V(C(d)),q("div",{"data-slot":"dot",class:S(i.value.dot({class:n.ui?.dot}))},[q("div",{"data-slot":"dotInner",class:S(i.value.dotInner({class:n.ui?.dotInner}))},null,2)],2)])],2)):M("",!0),q("div",{"data-slot":"container",class:S(i.value.container({class:n.ui?.container}))},[t.header||f.value||t.date||e.badge||t.badge||e.title||t.title||e.description||t.description||e.image||t.image?(x(),E("div",{key:0,"data-slot":"header",class:S(i.value.header({class:n.ui?.header}))},[O(p.$slots,"header",{},()=>[f.value||t.date||e.badge||t.badge?(x(),E("div",{key:0,"data-slot":"meta",class:S(i.value.meta({class:n.ui?.meta,badge:!!e.badge||!!t.badge||!n.indicator}))},[O(p.$slots,"badge",{ui:i.value},()=>[e.badge?(x(),L(Xt,B({key:0,color:"neutral",variant:"solid"},typeof e.badge=="string"?{label:e.badge}:e.badge,{"data-slot":"badge",class:i.value.badge({class:n.ui?.badge})}),null,16,["class"])):M("",!0)]),V(C(d),{hidden:!!n.indicator},null,8,["hidden"])],2)):M("",!0),e.title||t.title?(x(),E("h2",{key:1,"data-slot":"title",class:S(i.value.title({class:n.ui?.title}))},[V(C(s)),O(p.$slots,"title",{},()=>[ue(ce(e.title),1)])],2)):M("",!0),e.description||t.description?(x(),E("div",{key:2,"data-slot":"description",class:S(i.value.description({class:n.ui?.description}))},[O(p.$slots,"description",{},()=>[ue(ce(e.description),1)])],2)):M("",!0),e.image||t.image?(x(),E("div",{key:3,"data-slot":"imageWrapper",class:S(i.value.imageWrapper({class:n.ui?.imageWrapper}))},[O(p.$slots,"image",{ui:i.value},()=>[e.image?(x(),L(Ht(C(Ft)),B({key:0},typeof e.image=="string"?{src:e.image,alt:e.title}:{alt:e.title,...e.image},{"data-slot":"image",class:i.value.image({class:n.ui?.image,to:!!e.to})}),null,16,["class"])):M("",!0)]),V(C(s))],2)):M("",!0)])],2)):M("",!0),O(p.$slots,"body"),t.footer||e.authors?.length||t.authors||t.actions?(x(),E("div",{key:1,"data-slot":"footer",class:S(i.value.footer({class:n.ui?.footer,body:!!t.body}))},[O(p.$slots,"footer",{},()=>[e.authors?.length||t.authors?(x(),E("div",{key:0,"data-slot":"authors",class:S(i.value.authors({class:n.ui?.authors}))},[O(p.$slots,"authors",{},()=>[(x(!0),E(De,null,Ce(e.authors,(m,y)=>(x(),L(Ma,B({key:y},{ref_for:!0},m),null,16))),128))])],2)):M("",!0),O(p.$slots,"actions")])],2)):M("",!0)],2)]),_:3},8,["as","class","onClick"])],64))}}),Oa=50,xn=()=>({current:0,offset:[],progress:0,scrollLength:0,targetOffset:0,targetLength:0,containerLength:0,velocity:0}),Ea=()=>({time:0,x:xn(),y:xn()}),Ta={x:{length:"Width",position:"Left"},y:{length:"Height",position:"Top"}};function wn(e,n,t,r){const a=t[n],{length:l,position:o}=Ta[n],s=a.current,u=t.time;a.current=e[`scroll${o}`],a.scrollLength=e[`scroll${l}`]-e[`client${l}`],a.offset.length=0,a.offset[0]=0,a.offset[1]=a.scrollLength,a.progress=Kt(0,a.scrollLength,a.current);const d=r-u;a.velocity=d>Oa?0:Jt(a.current-s,d)}function La(e,n,t){wn(e,"x",n,t),wn(e,"y",n,t),n.time=t}function Aa(e,n){const t={x:0,y:0};let r=e;for(;r&&r!==n;)if(Gt(r))t.x+=r.offsetLeft,t.y+=r.offsetTop,r=r.offsetParent;else if(r.tagName==="svg"){const a=r.getBoundingClientRect();r=r.parentElement;const l=r.getBoundingClientRect();t.x+=a.left-l.left,t.y+=a.top-l.top}else if(r instanceof SVGGraphicsElement){const{x:a,y:l}=r.getBBox();t.x+=a,t.y+=l;let o=null,s=r.parentNode;for(;!o;)s.tagName==="svg"&&(o=s),s=r.parentNode;r=o}else break;return t}const Ne={start:0,center:.5,end:1};function $n(e,n,t=0){let r=0;if(e in Ne&&(e=Ne[e]),typeof e=="string"){const a=parseFloat(e);e.endsWith("px")?r=a:e.endsWith("%")?e=a/100:e.endsWith("vw")?r=a/100*document.documentElement.clientWidth:e.endsWith("vh")?r=a/100*document.documentElement.clientHeight:e=a}return typeof e=="number"&&(r=n*e),t+r}const Ra=[0,0];function _a(e,n,t,r){let a=Array.isArray(e)?e:Ra,l=0,o=0;return typeof e=="number"?a=[e,e]:typeof e=="string"&&(e=e.trim(),e.includes(" ")?a=e.split(" "):a=[e,Ne[e]?e:"0"]),l=$n(a[0],t,r),o=$n(a[1],n),l-o}const Ba={All:[[0,0],[1,1]]},Ia={x:0,y:0};function ja(e){return"getBBox"in e&&e.tagName!=="svg"?e.getBBox():{width:e.clientWidth,height:e.clientHeight}}function za(e,n,t){const{offset:r=Ba.All}=t,{target:a=e,axis:l="y"}=t,o=l==="y"?"height":"width",s=a!==e?Aa(a,e):Ia,u=a===e?{width:e.scrollWidth,height:e.scrollHeight}:ja(a),d={width:e.clientWidth,height:e.clientHeight};n[l].offset.length=0;let i=!n[l].interpolate;const f=r.length;for(let h=0;h<f;h++){const g=_a(r[h],d[o],u[o],s[l]);!i&&g!==n[l].interpolatorOffsets[h]&&(i=!0),n[l].offset[h]=g}i&&(n[l].interpolate=Bn(n[l].offset,Qt(r),{clamp:!1}),n[l].interpolatorOffsets=[...n[l].offset]),n[l].progress=er(0,1,n[l].interpolate(n[l].current))}function Ua(e,n=e,t){if(t.x.targetOffset=0,t.y.targetOffset=0,n!==e){let r=n;for(;r&&r!==e;)t.x.targetOffset+=r.offsetLeft,t.y.targetOffset+=r.offsetTop,r=r.offsetParent}t.x.targetLength=n===e?n.scrollWidth:n.clientWidth,t.y.targetLength=n===e?n.scrollHeight:n.clientHeight,t.x.containerLength=e.clientWidth,t.y.containerLength=e.clientHeight}function Ha(e,n,t,r={}){return{measure:a=>{Ua(e,r.target,t),La(e,t,a),(r.offset||r.target)&&za(e,t,r)},notify:()=>n(t)}}const xe=new WeakMap;let X;const ht=(e,n,t)=>(r,a)=>a&&a[0]?a[0][e+"Size"]:tr(r)&&"getBBox"in r?r.getBBox()[n]:r[t],Fa=ht("inline","width","offsetWidth"),Va=ht("block","height","offsetHeight");function qa({target:e,borderBoxSize:n}){var t;(t=xe.get(e))==null||t.forEach(r=>{r(e,{get width(){return Fa(e,n)},get height(){return Va(e,n)}})})}function Wa(e){e.forEach(qa)}function Na(){typeof ResizeObserver>"u"||(X=new ResizeObserver(Wa))}function Ya(e,n){X||Na();const t=nr(e);return t.forEach(r=>{let a=xe.get(r);a||(a=new Set,xe.set(r,a)),a.add(n),X?.observe(r)}),()=>{t.forEach(r=>{const a=xe.get(r);a?.delete(n),a?.size||X?.unobserve(r)})}}const we=new Set;let K;function Za(){K=()=>{const e={get width(){return window.innerWidth},get height(){return window.innerHeight}};we.forEach(n=>n(e))},window.addEventListener("resize",K)}function Xa(e){return we.add(e),K||Za(),()=>{we.delete(e),!we.size&&typeof K=="function"&&(window.removeEventListener("resize",K),K=void 0)}}function Ka(e,n){return typeof e=="function"?Xa(e):Ya(e,n)}const ie=new WeakMap,Dn=new WeakMap,_e=new WeakMap,Cn=e=>e===document.scrollingElement?window:e;function mt(e,{container:n=document.scrollingElement,...t}={}){if(!n)return In;let r=_e.get(n);r||(r=new Set,_e.set(n,r));const a=Ea(),l=Ha(n,e,a,t);if(r.add(l),!ie.has(n)){const s=()=>{for(const f of r)f.measure(jn.timestamp);J.preUpdate(u)},u=()=>{for(const f of r)f.notify()},d=()=>J.read(s);ie.set(n,d);const i=Cn(n);window.addEventListener("resize",d,{passive:!0}),n!==document.documentElement&&Dn.set(n,Ka(n,d)),i.addEventListener("scroll",d,{passive:!0}),d()}const o=ie.get(n);return J.read(o,!1,!0),()=>{var s;Ke(o);const u=_e.get(n);if(!u||(u.delete(l),u.size))return;const d=ie.get(n);ie.delete(n),d&&(Cn(n).removeEventListener("scroll",d),(s=Dn.get(n))==null||s(),window.removeEventListener("resize",d))}}const Sn=new Map;function Ja(e){const n={value:0},t=mt(r=>{n.value=r[e.axis].progress*100},e);return{currentTime:n,cancel:t}}function gt({source:e,container:n,...t}){const{axis:r}=t;e&&(n=e);const a=Sn.get(n)??new Map;Sn.set(n,a);const l=t.target??"self",o=a.get(l)??{},s=r+(t.offset??[]).join(",");return o[s]||(o[s]=!t.target&&rr()?new ScrollTimeline({source:n,axis:r}):Ja({container:n,...t})),o[s]}function yt(e,n){let t;const r=()=>{const{currentTime:a}=n,o=(a===null?0:a.value)/100;t!==o&&e(o),t=o};return J.preUpdate(r,!0),()=>Ke(r)}function Ga(e,n){const t=gt(n);return e.attachTimeline({timeline:n.target?void 0:t,observe:r=>(r.pause(),yt(a=>{r.time=r.iterationDuration*a},t))})}function Qa(e){return e.length===2}function el(e,n){return Qa(e)?mt(t=>{e(t[n.axis].progress,t)},n):yt(e,gt(n))}function nl(e,{axis:n="y",container:t=document.scrollingElement,...r}={}){if(!t)return In;const a={axis:n,container:t,...r};return typeof e=="function"?el(e,a):Ga(e,a)}function Be(...e){const n=!Array.isArray(e[0]),t=n?0:-1,r=e[0+t],a=e[1+t],l=e[2+t],o=e[3+t],s=Bn(a,l,o);return n?s(r):s}function vt(e){const n=W(e()),t=()=>n.set(e()),r=()=>J.preRender(t,!1,!0);let a;const l=s=>{a=s.map(u=>u.on("change",r))},o=()=>{a.forEach(s=>s()),Ke(t)};return On(()=>{o()}),{subscribe:l,unsubscribe:o,value:n,updateValue:t}}function tl(e){Z.current=[];const{value:n,subscribe:t,unsubscribe:r,updateValue:a}=vt(e);return t(Z.current),Z.current=void 0,Rn(()=>{r(),Z.current=[],a(),t(Z.current),Z.current=void 0}),n}function rl(e,n,t,r){if(typeof e=="function")return tl(e);let a,l;if(Ie(n)){const o=W(0);let s=Be(n.value,t,r);Q(n,u=>{s=Be(u,t,r),o.set(o.get()+1)},{flush:"sync"}),l=u=>Array.isArray(u)?s(u[0]):s(u),a=Array.isArray(e)?[...e,o]:[e,o]}else l=Be(n,t,r),a=Array.isArray(e)?e:[e];return Array.isArray(e)?Mn(a,l):Mn(a,o=>l(o[0]))}function Mn(e,n){const t=[],r=()=>{t.length=0;const o=e.length;for(let s=0;s<o;s++)t[s]=e[s].get();return n(t)},{value:a,subscribe:l}=vt(r);return l(e),a}function kn(e){return typeof e=="number"?e:parseFloat(e)}function al(e,n={}){let t=null;const r=W(fn(e)?kn(e.get()):e);let a=r.get(),l=()=>{};const o=()=>{t&&(t.stop(),t=null)},s=()=>{const u=t;u?.time===0&&u.sample(jn.delta),o();const d=Ie(n)?n.value:n;t=ar({keyframes:[r.get(),a],velocity:r.getVelocity(),type:"spring",restDelta:.001,restSpeed:.01,...d,onUpdate:l})};return Q(()=>Ie(n)?n.value:n,()=>{r.attach((u,d)=>(a=u,l=d,J.update(s),r.get()),o)},{immediate:!0}),fn(e)&&e.on("change",u=>{r.set(kn(u))}),r}const ll=typeof window>"u";function ol(){return{scrollX:W(0),scrollY:W(0),scrollXProgress:W(0),scrollYProgress:W(0)}}function sl(e={}){const n=ol();return Rn(t=>{if(ll)return;const r=nl((a,{x:l,y:o})=>{n.scrollX.set(l.current),n.scrollXProgress.set(l.progress),n.scrollY.set(o.current),n.scrollYProgress.set(o.progress)},{offset:C(e.offset),axis:C(e.axis),container:pn(e.container),target:pn(e.target)});t(()=>{r()})},{flush:"post"}),n}const il={slots:{root:"relative",container:"flex flex-col gap-y-8 sm:gap-y-12 lg:gap-y-16",indicator:"absolute hidden lg:block overflow-hidden inset-y-3 start-32 h-full w-px bg-border -ms-[8.5px]",beam:"absolute start-0 top-0 w-full bg-primary will-change-[height]"}},ul={__name:"UChangelogVersions",props:{as:{type:null,required:!1},versions:{type:Array,required:!1},indicator:{type:[Boolean,Object],required:!1,default:!0},indicatorMotion:{type:[Boolean,Object],required:!1,default:!0},class:{type:null,required:!1},ui:{type:null,required:!1}},setup(e){const n=e,t=Ye(),r=()=>Nt(t,["default","indicator"]),a=Ze(),l=T(()=>Yt(typeof n.indicatorMotion=="object"?n.indicatorMotion:{},{damping:30,restDelta:.001})),o=T(()=>typeof n.indicator=="object"?n.indicator:{}),{scrollYProgress:s}=sl(o.value),u=al(s,l),d=rl(()=>`${u.get()*100}%`),i=T(()=>ee({extend:ee(il),...a.ui?.changelogVersions||{}})());return(f,h)=>(x(),L(C(Xe),{as:e.as,"data-slot":"root",class:S(i.value.root({class:[n.ui?.root,n.class]}))},{default:_(()=>[n.indicator||t.indicator?(x(),E("div",{key:0,"data-slot":"indicator",class:S(i.value.indicator({class:n.ui?.indicator}))},[O(f.$slots,"indicator",{},()=>[n.indicatorMotion?(x(),L(C(lr),{key:0,"data-slot":"beam",class:S(i.value.beam({class:n.ui?.beam})),style:qt({height:C(d)})},null,8,["class","style"])):M("",!0)])],2)):M("",!0),e.versions?.length||t.default?(x(),E("div",{key:1,"data-slot":"container",class:S(i.value.container({class:n.ui?.container}))},[O(f.$slots,"default",{},()=>[(x(!0),E(De,null,Ce(e.versions,(g,p)=>(x(),L(pt,B({key:p,indicator:!!n.indicator},{ref_for:!0},g),Wt({_:2},[Ce(r(),(b,m)=>({name:m,fn:_(y=>[O(f.$slots,m,B({ref_for:!0},y,{version:g}))])}))]),1040,["indicator"]))),128))])],2)):M("",!0)]),_:3},8,["as","class"]))}},cl=`---
tag: v0.1.1
title: V0.1.1（测试）
date: 2026-02-22
---

## 更新日志
- Changelog 数据源通过本地 \`content/*.md\` 手动更新。
- 后续只需在 \`content/\` 目录新增 Markdown 文件，即可持续更新发布记录。

## 常用图标 \`emoji\`
- [**标题**](https://getemoji.com/#symbols) ✨ 🚀  🛠 🥹 🔥 🌜 🪷 🐣
- [**异宠**](https://getemoji.com/#symbols) 🦜 🐢 🐿 🦔 🦨 🦩🪿
- [**犬猫**](https://getemoji.com/#symbols) 🐈‍⬛ 🐾 🐕‍🦺
- [**影像**](https://getemoji.com/#symbols) 🫀 🧠 🫁 🩺 🩻 ⚕️
- [**延伸**](https://emojipedia.org/nature)

## 颜色转换
- [OKLCH Color Picker & Converter](https://oklch.com/#0.9840000000000001,0.019,200.873,100)
  ![](/2/1.png)

## 主题色
- 自定义logo网站[iconify.design](https://icon-sets.iconify.design/?query=dog&search-page=1) 
- **logo（自适应尺寸）** <img class="vv-logo-inline" src="/VetVault-Logo.png" alt="VetVault Logo" /> 


`,dl=`---
tag: v0.1.2
title: V0.1.2 功能区块
date: 2026-02-23
---

## 功能区块

### \`折叠\`
::collapsible

| Prop    | Default   | Type                     |
|---------|-----------|--------------------------|
| \`name\`  |           | \`string\`{lang="ts-type"} |
| \`size\`  | \`md\`      | \`string\`{lang="ts-type"} |
| \`color\` | \`neutral\` | \`string\`{lang="ts-type"} |

::



### \`卡片显示\`
:::card-group

::card
---
title: Dashboard
icon: i-simple-icons-github
to: https://github.com/nuxt-ui-templates/dashboard
target: _blank
---
A dashboard with multi-column layout.
::

::card
---
title: SaaS
icon: i-simple-icons-github
to: https://github.com/nuxt-ui-templates/saas
target: _blank
---
A template with landing, pricing, docs and blog.
::

::card
---
title: Docs
icon: i-simple-icons-github
to: https://github.com/nuxt-ui-templates/docs
target: _blank
---
A documentation with \`@nuxt/content\`.
::

::card
---
title: Landing
icon: i-simple-icons-github
to: https://github.com/nuxt-ui-templates/landing
target: _blank
---
A landing page you can use as starting point.
::

:::

## 代码块

### \`基础代码显示\`
::code-preview
---
class: "[&>div]:*:my-0"
---
\`inline code\`
#code
\`\`\`mdc
\`inline code\`
\`\`\`
::

### \`代码块\`
::code-preview
---
class: "[&>div]:*:my-0 [&>div]:*:w-full"
---
\`\`\`ts
export default defineNuxtConfig({
  modules: ['@nuxt/ui']
})
\`\`\`

#code
\`\`\`\`mdc
\`\`\`ts
export default defineNuxtConfig({
  modules: ['@nuxt/ui']
})
\`\`\`
\`\`\`\`
::


### \`代码带链接\`   
::tip{to="https://ui.nuxt.com/getting-started/icons/nuxt#theme"}
tip默认图标，可通过 \`app.config.ts\`自定义图标:

\`\`\`ts [app.config.ts]
export default defineAppConfig({
  ui: {
    prose: {
      codeIcon: {
        terminal: 'i-ph-terminal-window-duotone'
      }
    }
  }
})
\`\`\`
::

## 进阶
### \`代码组\`

Group code blocks in tabs using \`code-group\`. \`code-group\` is perfect for showing code examples in multiple languages or package managers.

:::code-preview
---
class: "[&>div]:*:my-0 [&>div]:*:w-full"
---
  ::code-group{.w-full}
  \`\`\`bash [pnpm]
  pnpm add @nuxt/ui
  \`\`\`

  \`\`\`bash [yarn]
  yarn add @nuxt/ui
  \`\`\`

  \`\`\`bash [npm]
  npm install @nuxt/ui
  \`\`\`

  \`\`\`bash [bun]
  bun add @nuxt/ui
  \`\`\`
  ::

#code
\`\`\`\`mdc
::code-group

\`\`\`bash [pnpm]
pnpm add @nuxt/ui
\`\`\`

\`\`\`bash [yarn]
yarn add @nuxt/ui
\`\`\`

\`\`\`bash [npm]
npm install @nuxt/ui
\`\`\`

\`\`\`bash [bun]
bun add @nuxt/ui
\`\`\`

::
\`\`\`\`
:::

### 代码树

::code-preview
---
class: "[&>div]:*:my-0 [&>div]:*:w-full"
---
  :::code-tree{default-value="app/app.config.ts"}
  \`\`\`ts [nuxt.config.ts]
  export default defineNuxtConfig({
    modules: ['@nuxt/ui'],

    future: {
      compatibilityVersion: 4
    },

    css: ['~/assets/css/main.css']
  })

  \`\`\`

  \`\`\`css [app/assets/css/main.css]
  @import "tailwindcss";
  @import "@nuxt/ui";
  \`\`\`

  \`\`\`ts [app/app.config.ts]
  export default defineAppConfig({
    ui: {
      colors: {
        primary: 'sky',
        colors: 'slate'
      }
    }
  })
  \`\`\`

  \`\`\`vue [app/app.vue]
  <template>
    <UApp>
      <NuxtPage />
    </UApp>
  </template>
  \`\`\`

  \`\`\`json [package.json]
  {
    "name": "nuxt-app",
    "private": true,
    "type": "module",
    "scripts": {
      "build": "nuxt build",
      "dev": "nuxt dev",
      "generate": "nuxt generate",
      "preview": "nuxt preview",
      "postinstall": "nuxt prepare",
      "lint": "eslint .",
      "lint:fix": "eslint --fix ."
    },
    "dependencies": {
      "@iconify-json/lucide": "^1.2.18",
      "@nuxt/ui": "4.0.0-alpha.1",
      "nuxt": "^4.1.0"
    },
    "devDependencies": {
      "eslint": "^9.34.0",
      "typescript": "^5.9.3",
      "vue-tsc": "^3.0.6"
    }
  }
  \`\`\`

  \`\`\`json [tsconfig.json]
  {
    "extends": "./.nuxt/tsconfig.json"
  }
  \`\`\`

  \`\`\`\`md [README.md]
  # Nuxt 4 Minimal Starter

  Look at the [Nuxt 4 documentation](https://nuxt.com/docs/getting-started/introduction) to learn more.

  ## Setup

  Make sure to install the dependencies:

  \`\`\`bash
  # npm
  npm install

  # pnpm
  pnpm install

  # yarn
  yarn install

  # bun
  bun install
  \`\`\`

  ## Development Server

  Start the development server on \`http://localhost:3000\`:

  \`\`\`bash
  # npm
  npm run dev

  # pnpm
  pnpm run dev

  # yarn
  yarn dev

  # bun
  bun run dev
  \`\`\`

  ## Production

  Build the application for production:

  \`\`\`bash
  # npm
  npm run build

  # pnpm
  pnpm run build

  # yarn
  yarn build

  # bun
  bun run build
  \`\`\`

  Locally preview production build:

  \`\`\`bash
  # npm
  npm run preview

  # pnpm
  pnpm run preview

  # yarn
  yarn preview

  # bun
  bun run preview
  \`\`\`

  Check out the [deployment documentation](https://nuxt.com/docs/getting-started/deployment) for more information.
  \`\`\`\`
  :::
::

### \`代码预览\`

::code-preview
---
class: "[&>div]:*:my-0 [&>div]:*:w-full"
label: Preview
---
  :::code-preview
  ---
  class: "[&>div]:*:my-0"
  ---
  \`inline code\`

  #code
  \`\`\`mdc
  \`inline code\`
  \`\`\`
  :::

#code
\`\`\`\`mdc
::code-preview
\`inline code\`

#code
\`\`\`mdc
\`inline code\`
\`\`\`
::
\`\`\`\`
::

### \`代码折叠\`

使用\`code-collapse\`折叠过长的代码 .

::code-preview
---
class: "[&>div]:*:my-0 [&>div]:*:w-full"
---
  :::code-collapse
  ---
  class: "[&>div]:my-0"
  ---
  \`\`\`css [main.css]
  @import "tailwindcss";
  @import "@nuxt/ui";

  @theme {
    --font-sans: 'Public Sans', sans-serif;

    --breakpoint-3xl: 1920px;

    --color-green-50: #EFFDF5;
    --color-green-100: #D9FBE8;
    --color-green-200: #B3F5D1;
    --color-green-300: #75EDAE;
    --color-green-400: #00DC82;
    --color-green-500: #00C16A;
    --color-green-600: #00A155;
    --color-green-700: #007F45;
    --color-green-800: #016538;
    --color-green-900: #0A5331;
    --color-green-950: #052E16;
  }
  \`\`\`
  :::

#code
\`\`\`\`mdc
::code-collapse

\`\`\`css [main.css]
@import "tailwindcss";
@import "@nuxt/ui";

@theme {
--font-sans: 'Public Sans', sans-serif;

--breakpoint-3xl: 1920px;

--color-green-50: #EFFDF5;
--color-green-100: #D9FBE8;
--color-green-200: #B3F5D1;
--color-green-300: #75EDAE;
--color-green-400: #00DC82;
--color-green-500: #00C16A;
--color-green-600: #00A155;
--color-green-700: #007F45;
--color-green-800: #016538;
--color-green-900: #0A5331;
--color-green-950: #052E16;
}
\`\`\`

::
\`\`\`\`
::



`,fl=`---
tag: v0.1.3
title: V0.1.3
date: 2026-02-24
---

## 客制化

### 图片显示

::tabs
:::tabs-item{.my-5 icon="i-lucide-sun" label="浅色"}
![](/3/light.png)
:::

:::tabs-item{.my-5 icon="i-lucide-moon" label="深色"}
![dark](/3/dark.png)
:::
::

### 按键显示\`kbd\`

::code-preview
:kbd{value="meta"} :kbd{value="K"}
#code
\`\`\`
:kbd{value="meta"} :kbd{value="K"}
\`\`\`
::

### 字体色

<template>
  <span class="text-primary">Primary</span>
  <span class="text-secondary">Secondary</span>
  <span class="text-success">Success</span>
  <span class="text-info">Info</span>
  <span class="text-warning">Warning</span>
  <span class="text-error">Error</span>
</template>

### 背景色

<template>
  <div class="bg-default">Default</div>
  <div class="bg-muted">Muted</div>
  <div class="bg-elevated">Elevated</div>
  <div class="bg-accented">Accented</div>
  <div class="bg-inverted text-inverted">Inverted</div>
</template>

### \`进度条\`

  <div class="vv-progress-row">
    <span class="vv-progress-label">文献查阅</span>
    <div class="vv-progress-track">
      <div class="vv-progress-fill" style="width: 90%"></div>
    </div>
    <span class="vv-progress-value">90%</span>
  </div>

  <div class="vv-progress-row">
    <span class="vv-progress-label">病例库</span>
    <div class="vv-progress-track">
      <div class="vv-progress-fill" style="width: 0%"></div>
    </div>
    <span class="vv-progress-value">0%</span>
  </div>

  <div class="vv-progress-row">
    <span class="vv-progress-label">心超助手</span>
    <div class="vv-progress-track">
      <div class="vv-progress-fill" style="width: 100%"></div>
    </div>
    <span class="vv-progress-value">100%</span>
  </div>
</div>

<div class="vv-progress-list">
  <div class="vv-progress-row">
    <span class="vv-progress-label">知识库</span>
    <div class="vv-progress-track">
      <div class="vv-progress-fill" style="width: 25%"></div>
    </div>
    <span class="vv-progress-value">25%</span>
  </div>
`,pl=`---
tag: v1.1.1
title: V1.1.1
date: 2026-02-25
---

## 待办
- [ ] 部署至网页[charlot98.top](https://charlot98.top)
- [ ] 是
- [ ] 是`,hl={class:"w-full text-left vv-mdc-body"},ml=Tn({__name:"index",setup(e){const n=Object.assign({"../../content/1 test.md":cl,"../../content/2.md":dl,"../../content/3.md":fl,"../../content/4.md":pl});function t(a){const l=a.match(/^---\n([\s\S]*?)\n---\n?/);if(!l)return{meta:{},body:a};const o={},u=(l[1]||"").split(`
`);for(const i of u){const f=i.indexOf(":");if(f===-1)continue;const h=i.slice(0,f).trim(),g=i.slice(f+1).trim();h&&(o[h]=g)}const d=a.slice(l[0].length).trim();return{meta:o,body:d}}const r=T(()=>Object.entries(n).map(([l,o])=>{const{meta:s,body:u}=t(o),d=l.split("/").pop()?.replace(/\.md$/,"")||"untitled",i=d.split("-").slice(0,3).join("-");return{tag:s.tag||d,title:s.title||s.tag||d,date:s.date||i||"1970-01-01",markdown:u}}).sort((l,o)=>new Date(o.date).getTime()-new Date(l.date).getTime()));return(a,l)=>{const o=Ca,s=pt,u=ul;return x(),L(u,{as:"main","indicator-motion":!1,ui:{root:"py-16 sm:py-24 lg:py-32",indicator:"inset-y-0"}},{default:_(()=>[(x(!0),E(De,null,Ce(C(r),(d,i)=>(x(),L(s,B({key:`${d.tag}-${d.date}-${i}`},{ref_for:!0},d,{ui:{root:"flex items-start justify-start",container:"w-full max-w-2xl !ml-0 !mr-auto text-left pl-18 sm:pl-20",header:"border-b border-default pb-4 text-left",title:"text-3xl",date:"text-xs/9 text-highlighted font-mono text-left",indicator:"sticky top-0 pt-16 -mt-16 sm:pt-24 sm:-mt-24 lg:pt-32 lg:-mt-32"}}),{body:_(()=>[q("div",hl,[d.markdown?(x(),L(o,{key:0,value:d.markdown},null,8,["value"])):M("",!0)])]),_:2},1040))),128))]),_:1})}}}),$l=Object.freeze(Object.defineProperty({__proto__:null,default:ml},Symbol.toStringTag,{value:"Module"}));export{ra as a,Qr as f,ta as h,$l as i,He as n,wl as s};
