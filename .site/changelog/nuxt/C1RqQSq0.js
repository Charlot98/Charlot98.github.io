const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["./BiiwaKmo.js","./BeTkB5bD.js","./entry.Bx4BjbGE.css","./iik6CYzq.js"])))=>i.map(i=>d[i]);
import{r as Je,f as $t,g as Dt,h as Ct,i as Tn,j as St,k as kt,l as le,m as Mt,n as A,p as Ln,q as Pt,s as dn,v as _t,x as Et,y as S,z as Ot,A as Tt,B as fn,C as Lt,D as An,E as Pe,F as At,G as Rt,o as b,H as L,w as R,b as z,I as ze,J as M,K as q,L as Bt,M as Rn,N as pn,O as It,P as jt,Q as Bn,R as qt,T as ke,S as zt,U as Ut,V as Ft,W as Vt,X as Ht,Y as T,Z as E,$ as Wt,a0 as Ge,a1 as Nt,a2 as hn,a as U,a3 as Qe,c as _,d as K,t as Y,a4 as en,a5 as oe,a6 as Yt,a7 as Zt,a8 as Z,a9 as te,aa as Xt,ab as In,ac as Ue,ad as Kt,ae as Jt,af as Gt,ag as Qt,ah as ea}from"./BeTkB5bD.js";import{f as jn,n as na}from"./iik6CYzq.js";import{c as mn}from"./CFKLxKh3.js";import{_ as ta}from"./KJiMv_uu.js";import{p as aa,v as ra,i as la,a as qn,d as oa,c as sa,r as ia,b as ua,n as zn,f as ae,e as nn,g as Un,s as ca,m as X,h as Q,j as gn,k as da,l as yn,M as fa}from"./BVDTZ7FS.js";function Te(e,n){return e-n*Math.floor(e/n)}const Fn=1721426;function xe(e,n,t,a){n=tn(e,n);let r=n-1,l=-2;return t<=2?l=0:De(n)&&(l=-1),Fn-1+365*r+Math.floor(r/4)-Math.floor(r/100)+Math.floor(r/400)+Math.floor((367*t-362)/12+l+a)}function De(e){return e%4===0&&(e%100!==0||e%400===0)}function tn(e,n){return e==="BC"?1-n:n}function pa(e){let n="AD";return e<=0&&(n="BC",e=1-e),[n,e]}const ha={standard:[31,28,31,30,31,30,31,31,30,31,30,31],leapyear:[31,29,31,30,31,30,31,31,30,31,30,31]};class se{fromJulianDay(n){let t=n,a=t-Fn,r=Math.floor(a/146097),l=Te(a,146097),o=Math.floor(l/36524),s=Te(l,36524),u=Math.floor(s/1461),p=Te(s,1461),i=Math.floor(p/365),d=r*400+o*100+u*4+i+(o!==4&&i!==4?1:0),[y,v]=pa(d),f=t-xe(y,v,1,1),m=2;t<xe(y,v,3,1)?m=0:De(v)&&(m=1);let h=Math.floor(((f+m)*12+373)/367),g=t-xe(y,v,h,1)+1;return new me(y,v,h,g)}toJulianDay(n){return xe(n.era,n.year,n.month,n.day)}getDaysInMonth(n){return ha[De(n.year)?"leapyear":"standard"][n.month-1]}getMonthsInYear(n){return 12}getDaysInYear(n){return De(n.year)?366:365}getMaximumMonthsInYear(){return 12}getMaximumDaysInMonth(){return 31}getYearsInEra(n){return 9999}getEras(){return["BC","AD"]}isInverseEra(n){return n.era==="BC"}balanceDate(n){n.year<=0&&(n.era=n.era==="BC"?"AD":"BC",n.year=1-n.year)}constructor(){this.identifier="gregory"}}function ma(e,n){var t,a,r,l;return(l=(r=(t=e.isEqual)===null||t===void 0?void 0:t.call(e,n))!==null&&r!==void 0?r:(a=n.isEqual)===null||a===void 0?void 0:a.call(n,e))!==null&&l!==void 0?l:e.identifier===n.identifier}function ga(e){return H(Date.now(),e)}function ya(e){return wa(ga(e))}function Vn(e,n){return e.calendar.toJulianDay(e)-n.calendar.toJulianDay(n)}function va(e,n){return vn(e)-vn(n)}function vn(e){return e.hour*36e5+e.minute*6e4+e.second*1e3+e.millisecond}let Le=null;function _e(){return Le==null&&(Le=new Intl.DateTimeFormat().resolvedOptions().timeZone),Le}function ie(e){e=F(e,new se);let n=tn(e.era,e.year);return Hn(n,e.month,e.day,e.hour,e.minute,e.second,e.millisecond)}function Hn(e,n,t,a,r,l,o){let s=new Date;return s.setUTCHours(a,r,l,o),s.setUTCFullYear(e,n-1,t),s.getTime()}function Fe(e,n){if(n==="UTC")return 0;if(e>0&&n===_e())return new Date(e).getTimezoneOffset()*-6e4;let{year:t,month:a,day:r,hour:l,minute:o,second:s}=Wn(e,n);return Hn(t,a,r,l,o,s,0)-Math.floor(e/1e3)*1e3}const bn=new Map;function Wn(e,n){let t=bn.get(n);t||(t=new Intl.DateTimeFormat("en-US",{timeZone:n,hour12:!1,era:"short",year:"numeric",month:"numeric",day:"numeric",hour:"numeric",minute:"numeric",second:"numeric"}),bn.set(n,t));let a=t.formatToParts(new Date(e)),r={};for(let l of a)l.type!=="literal"&&(r[l.type]=l.value);return{year:r.era==="BC"||r.era==="B"?-r.year+1:+r.year,month:+r.month,day:+r.day,hour:r.hour==="24"?0:+r.hour,minute:+r.minute,second:+r.second}}const xn=864e5;function ba(e,n,t,a){return(t===a?[t]:[t,a]).filter(l=>xa(e,n,l))}function xa(e,n,t){let a=Wn(t,n);return e.year===a.year&&e.month===a.month&&e.day===a.day&&e.hour===a.hour&&e.minute===a.minute&&e.second===a.second}function V(e,n,t="compatible"){let a=ue(e);if(n==="UTC")return ie(a);if(n===_e()&&t==="compatible"){a=F(a,new se);let u=new Date,p=tn(a.era,a.year);return u.setFullYear(p,a.month-1,a.day),u.setHours(a.hour,a.minute,a.second,a.millisecond),u.getTime()}let r=ie(a),l=Fe(r-xn,n),o=Fe(r+xn,n),s=ba(a,n,r-l,r-o);if(s.length===1)return s[0];if(s.length>1)switch(t){case"compatible":case"earlier":return s[0];case"later":return s[s.length-1];case"reject":throw new RangeError("Multiple possible absolute times found")}switch(t){case"earlier":return Math.min(r-l,r-o);case"compatible":case"later":return Math.max(r-l,r-o);case"reject":throw new RangeError("No such absolute time found")}}function Nn(e,n,t="compatible"){return new Date(V(e,n,t))}function H(e,n){let t=Fe(e,n),a=new Date(e+t),r=a.getUTCFullYear(),l=a.getUTCMonth()+1,o=a.getUTCDate(),s=a.getUTCHours(),u=a.getUTCMinutes(),p=a.getUTCSeconds(),i=a.getUTCMilliseconds();return new ce(r<1?"BC":"AD",r<1?-r+1:r,l,o,n,t,s,u,p,i)}function wa(e){return new me(e.calendar,e.era,e.year,e.month,e.day)}function ue(e,n){let t=0,a=0,r=0,l=0;if("timeZone"in e)({hour:t,minute:a,second:r,millisecond:l}=e);else if("hour"in e&&!n)return e;return n&&({hour:t,minute:a,second:r,millisecond:l}=n),new ge(e.calendar,e.era,e.year,e.month,e.day,t,a,r,l)}function F(e,n){if(ma(e.calendar,n))return e;let t=n.fromJulianDay(e.calendar.toJulianDay(e)),a=e.copy();return a.calendar=n,a.era=t.era,a.year=t.year,a.month=t.month,a.day=t.day,J(a),a}function $a(e,n,t){if(e instanceof ce)return e.timeZone===n?e:Ca(e,n);let a=V(e,n,t);return H(a,n)}function Da(e){let n=ie(e)-e.offset;return new Date(n)}function Ca(e,n){let t=ie(e)-e.offset;return F(H(t,n),e.calendar)}const fe=36e5;function Ee(e,n){let t=e.copy(),a="hour"in t?Pa(t,n):0;Ve(t,n.years||0),t.calendar.balanceYearMonth&&t.calendar.balanceYearMonth(t,e),t.month+=n.months||0,He(t),Yn(t),t.day+=(n.weeks||0)*7,t.day+=n.days||0,t.day+=a,Sa(t),t.calendar.balanceDate&&t.calendar.balanceDate(t),t.year<1&&(t.year=1,t.month=1,t.day=1);let r=t.calendar.getYearsInEra(t);if(t.year>r){var l,o;let u=(l=(o=t.calendar).isInverseEra)===null||l===void 0?void 0:l.call(o,t);t.year=r,t.month=u?1:t.calendar.getMonthsInYear(t),t.day=u?1:t.calendar.getDaysInMonth(t)}t.month<1&&(t.month=1,t.day=1);let s=t.calendar.getMonthsInYear(t);return t.month>s&&(t.month=s,t.day=t.calendar.getDaysInMonth(t)),t.day=Math.max(1,Math.min(t.calendar.getDaysInMonth(t),t.day)),t}function Ve(e,n){var t,a;!((t=(a=e.calendar).isInverseEra)===null||t===void 0)&&t.call(a,e)&&(n=-n),e.year+=n}function He(e){for(;e.month<1;)Ve(e,-1),e.month+=e.calendar.getMonthsInYear(e);let n=0;for(;e.month>(n=e.calendar.getMonthsInYear(e));)e.month-=n,Ve(e,1)}function Sa(e){for(;e.day<1;)e.month--,He(e),e.day+=e.calendar.getDaysInMonth(e);for(;e.day>e.calendar.getDaysInMonth(e);)e.day-=e.calendar.getDaysInMonth(e),e.month++,He(e)}function Yn(e){e.month=Math.max(1,Math.min(e.calendar.getMonthsInYear(e),e.month)),e.day=Math.max(1,Math.min(e.calendar.getDaysInMonth(e),e.day))}function J(e){e.calendar.constrainDate&&e.calendar.constrainDate(e),e.year=Math.max(1,Math.min(e.calendar.getYearsInEra(e),e.year)),Yn(e)}function Zn(e){let n={};for(let t in e)typeof e[t]=="number"&&(n[t]=-e[t]);return n}function Xn(e,n){return Ee(e,Zn(n))}function an(e,n){let t=e.copy();return n.era!=null&&(t.era=n.era),n.year!=null&&(t.year=n.year),n.month!=null&&(t.month=n.month),n.day!=null&&(t.day=n.day),J(t),t}function Me(e,n){let t=e.copy();return n.hour!=null&&(t.hour=n.hour),n.minute!=null&&(t.minute=n.minute),n.second!=null&&(t.second=n.second),n.millisecond!=null&&(t.millisecond=n.millisecond),Ma(t),t}function ka(e){e.second+=Math.floor(e.millisecond/1e3),e.millisecond=we(e.millisecond,1e3),e.minute+=Math.floor(e.second/60),e.second=we(e.second,60),e.hour+=Math.floor(e.minute/60),e.minute=we(e.minute,60);let n=Math.floor(e.hour/24);return e.hour=we(e.hour,24),n}function Ma(e){e.millisecond=Math.max(0,Math.min(e.millisecond,1e3)),e.second=Math.max(0,Math.min(e.second,59)),e.minute=Math.max(0,Math.min(e.minute,59)),e.hour=Math.max(0,Math.min(e.hour,23))}function we(e,n){let t=e%n;return t<0&&(t+=n),t}function Pa(e,n){return e.hour+=n.hours||0,e.minute+=n.minutes||0,e.second+=n.seconds||0,e.millisecond+=n.milliseconds||0,ka(e)}function rn(e,n,t,a){let r=e.copy();switch(n){case"era":{let s=e.calendar.getEras(),u=s.indexOf(e.era);if(u<0)throw new Error("Invalid era: "+e.era);u=W(u,t,0,s.length-1,a?.round),r.era=s[u],J(r);break}case"year":var l,o;!((l=(o=r.calendar).isInverseEra)===null||l===void 0)&&l.call(o,r)&&(t=-t),r.year=W(e.year,t,-1/0,9999,a?.round),r.year===-1/0&&(r.year=1),r.calendar.balanceYearMonth&&r.calendar.balanceYearMonth(r,e);break;case"month":r.month=W(e.month,t,1,e.calendar.getMonthsInYear(e),a?.round);break;case"day":r.day=W(e.day,t,1,e.calendar.getDaysInMonth(e),a?.round);break;default:throw new Error("Unsupported field "+n)}return e.calendar.balanceDate&&e.calendar.balanceDate(r),J(r),r}function Kn(e,n,t,a){let r=e.copy();switch(n){case"hour":{let l=e.hour,o=0,s=23;if(a?.hourCycle===12){let u=l>=12;o=u?12:0,s=u?23:11}r.hour=W(l,t,o,s,a?.round);break}case"minute":r.minute=W(e.minute,t,0,59,a?.round);break;case"second":r.second=W(e.second,t,0,59,a?.round);break;case"millisecond":r.millisecond=W(e.millisecond,t,0,999,a?.round);break;default:throw new Error("Unsupported field "+n)}return r}function W(e,n,t,a,r=!1){if(r){e+=Math.sign(n),e<t&&(e=a);let l=Math.abs(n);n>0?e=Math.ceil(e/l)*l:e=Math.floor(e/l)*l,e>a&&(e=t)}else e+=n,e<t?e=a-(t-e-1):e>a&&(e=t+(e-a-1));return e}function Jn(e,n){let t;if(n.years!=null&&n.years!==0||n.months!=null&&n.months!==0||n.weeks!=null&&n.weeks!==0||n.days!=null&&n.days!==0){let r=Ee(ue(e),{years:n.years,months:n.months,weeks:n.weeks,days:n.days});t=V(r,e.timeZone)}else t=ie(e)-e.offset;t+=n.milliseconds||0,t+=(n.seconds||0)*1e3,t+=(n.minutes||0)*6e4,t+=(n.hours||0)*36e5;let a=H(t,e.timeZone);return F(a,e.calendar)}function _a(e,n){return Jn(e,Zn(n))}function Ea(e,n,t,a){switch(n){case"hour":{let r=0,l=23;if(a?.hourCycle===12){let f=e.hour>=12;r=f?12:0,l=f?23:11}let o=ue(e),s=F(Me(o,{hour:r}),new se),u=[V(s,e.timeZone,"earlier"),V(s,e.timeZone,"later")].filter(f=>H(f,e.timeZone).day===s.day)[0],p=F(Me(o,{hour:l}),new se),i=[V(p,e.timeZone,"earlier"),V(p,e.timeZone,"later")].filter(f=>H(f,e.timeZone).day===p.day).pop(),d=ie(e)-e.offset,y=Math.floor(d/fe),v=d%fe;return d=W(y,t,Math.floor(u/fe),Math.floor(i/fe),a?.round)*fe+v,F(H(d,e.timeZone),e.calendar)}case"minute":case"second":case"millisecond":return Kn(e,n,t,a);case"era":case"year":case"month":case"day":{let r=rn(ue(e),n,t,a),l=V(r,e.timeZone);return F(H(l,e.timeZone),e.calendar)}default:throw new Error("Unsupported field "+n)}}function Oa(e,n,t){let a=ue(e),r=Me(an(a,n),n);if(r.compare(a)===0)return e;let l=V(r,e.timeZone,t);return F(H(l,e.timeZone),e.calendar)}function Ta(e){return`${String(e.hour).padStart(2,"0")}:${String(e.minute).padStart(2,"0")}:${String(e.second).padStart(2,"0")}${e.millisecond?String(e.millisecond/1e3).slice(1):""}`}function Gn(e){let n=F(e,new se),t;return n.era==="BC"?t=n.year===1?"0000":"-"+String(Math.abs(1-n.year)).padStart(6,"00"):t=String(n.year).padStart(4,"0"),`${t}-${String(n.month).padStart(2,"0")}-${String(n.day).padStart(2,"0")}`}function Qn(e){return`${Gn(e)}T${Ta(e)}`}function La(e){let n=Math.sign(e)<0?"-":"+";e=Math.abs(e);let t=Math.floor(e/36e5),a=Math.floor(e%36e5/6e4),r=Math.floor(e%36e5%6e4/1e3),l=`${n}${String(t).padStart(2,"0")}:${String(a).padStart(2,"0")}`;return r!==0&&(l+=`:${String(r).padStart(2,"0")}`),l}function Aa(e){return`${Qn(e)}${La(e.offset)}[${e.timeZone}]`}function Ra(e,n){if(n.has(e))throw new TypeError("Cannot initialize the same private elements twice on an object")}function ln(e,n,t){Ra(e,n),n.set(e,t)}function on(e){let n=typeof e[0]=="object"?e.shift():new se,t;if(typeof e[0]=="string")t=e.shift();else{let o=n.getEras();t=o[o.length-1]}let a=e.shift(),r=e.shift(),l=e.shift();return[n,t,a,r,l]}var Ba=new WeakMap;class me{copy(){return this.era?new me(this.calendar,this.era,this.year,this.month,this.day):new me(this.calendar,this.year,this.month,this.day)}add(n){return Ee(this,n)}subtract(n){return Xn(this,n)}set(n){return an(this,n)}cycle(n,t,a){return rn(this,n,t,a)}toDate(n){return Nn(this,n)}toString(){return Gn(this)}compare(n){return Vn(this,n)}constructor(...n){ln(this,Ba,{writable:!0,value:void 0});let[t,a,r,l,o]=on(n);this.calendar=t,this.era=a,this.year=r,this.month=l,this.day=o,J(this)}}var Ia=new WeakMap;class ge{copy(){return this.era?new ge(this.calendar,this.era,this.year,this.month,this.day,this.hour,this.minute,this.second,this.millisecond):new ge(this.calendar,this.year,this.month,this.day,this.hour,this.minute,this.second,this.millisecond)}add(n){return Ee(this,n)}subtract(n){return Xn(this,n)}set(n){return an(Me(this,n),n)}cycle(n,t,a){switch(n){case"era":case"year":case"month":case"day":return rn(this,n,t,a);default:return Kn(this,n,t,a)}}toDate(n,t){return Nn(this,n,t)}toString(){return Qn(this)}compare(n){let t=Vn(this,n);return t===0?va(this,ue(n)):t}constructor(...n){ln(this,Ia,{writable:!0,value:void 0});let[t,a,r,l,o]=on(n);this.calendar=t,this.era=a,this.year=r,this.month=l,this.day=o,this.hour=n.shift()||0,this.minute=n.shift()||0,this.second=n.shift()||0,this.millisecond=n.shift()||0,J(this)}}var ja=new WeakMap;class ce{copy(){return this.era?new ce(this.calendar,this.era,this.year,this.month,this.day,this.timeZone,this.offset,this.hour,this.minute,this.second,this.millisecond):new ce(this.calendar,this.year,this.month,this.day,this.timeZone,this.offset,this.hour,this.minute,this.second,this.millisecond)}add(n){return Jn(this,n)}subtract(n){return _a(this,n)}set(n,t){return Oa(this,n,t)}cycle(n,t,a){return Ea(this,n,t,a)}toDate(){return Da(this)}toString(){return Aa(this)}toAbsoluteString(){return this.toDate().toISOString()}compare(n){return this.toDate().getTime()-$a(n,this.timeZone).toDate().getTime()}constructor(...n){ln(this,ja,{writable:!0,value:void 0});let[t,a,r,l,o]=on(n),s=n.shift(),u=n.shift();this.calendar=t,this.era=a,this.year=r,this.month=l,this.day=o,this.timeZone=s,this.offset=u,this.hour=n.shift()||0,this.minute=n.shift()||0,this.second=n.shift()||0,this.millisecond=n.shift()||0,J(this)}}let Ae=new Map;class N{format(n){return this.formatter.format(n)}formatToParts(n){return this.formatter.formatToParts(n)}formatRange(n,t){if(typeof this.formatter.formatRange=="function")return this.formatter.formatRange(n,t);if(t<n)throw new RangeError("End date must be >= start date");return`${this.formatter.format(n)} – ${this.formatter.format(t)}`}formatRangeToParts(n,t){if(typeof this.formatter.formatRangeToParts=="function")return this.formatter.formatRangeToParts(n,t);if(t<n)throw new RangeError("End date must be >= start date");let a=this.formatter.formatToParts(n),r=this.formatter.formatToParts(t);return[...a.map(l=>({...l,source:"startRange"})),{type:"literal",value:" – ",source:"shared"},...r.map(l=>({...l,source:"endRange"}))]}resolvedOptions(){let n=this.formatter.resolvedOptions();return Ua()&&(this.resolvedHourCycle||(this.resolvedHourCycle=Fa(n.locale,this.options)),n.hourCycle=this.resolvedHourCycle,n.hour12=this.resolvedHourCycle==="h11"||this.resolvedHourCycle==="h12"),n.calendar==="ethiopic-amete-alem"&&(n.calendar="ethioaa"),n}constructor(n,t={}){this.formatter=et(n,t),this.options=t}}const qa={true:{ja:"h11"},false:{}};function et(e,n={}){if(typeof n.hour12=="boolean"&&za()){n={...n};let r=qa[String(n.hour12)][e.split("-")[0]],l=n.hour12?"h12":"h23";n.hourCycle=r??l,delete n.hour12}let t=e+(n?Object.entries(n).sort((r,l)=>r[0]<l[0]?-1:1).join():"");if(Ae.has(t))return Ae.get(t);let a=new Intl.DateTimeFormat(e,n);return Ae.set(t,a),a}let Re=null;function za(){return Re==null&&(Re=new Intl.DateTimeFormat("en-US",{hour:"numeric",hour12:!1}).format(new Date(2020,2,3,0))==="24"),Re}let Be=null;function Ua(){return Be==null&&(Be=new Intl.DateTimeFormat("fr",{hour:"numeric",hour12:!1}).resolvedOptions().hourCycle==="h12"),Be}function Fa(e,n){if(!n.timeStyle&&!n.hour)return;e=e.replace(/(-u-)?-nu-[a-zA-Z0-9]+/,""),e+=(e.includes("-u-")?"":"-u")+"-nu-latn";let t=et(e,{...n,timeZone:void 0}),a=parseInt(t.formatToParts(new Date(2020,2,3,0)).find(l=>l.type==="hour").value,10),r=parseInt(t.formatToParts(new Date(2020,2,3,23)).find(l=>l.type==="hour").value,10);if(a===0&&r===23)return"h23";if(a===24&&r===23)return"h24";if(a===0&&r===11)return"h11";if(a===12&&r===11)return"h12";throw new Error("Unexpected hour cycle result")}function pe(e,n=_e()){return sn(e)?e.toDate():e.toDate(n)}function Va(e){return e instanceof ge}function sn(e){return e instanceof ce}function Ha(e){return Va(e)||sn(e)}function Wa(e,n={}){const t=Je(e);function a(){return t.value}function r(h){t.value=h}function l(h,g){return new N(t.value,{...n,...g}).format(h)}function o(h,g=!0){return Ha(h)&&g?l(pe(h),{dateStyle:"long",timeStyle:"long"}):l(pe(h),{dateStyle:"long"})}function s(h,g={}){return new N(t.value,{...n,month:"long",year:"numeric",...g}).format(h)}function u(h,g={}){return new N(t.value,{...n,month:"long",...g}).format(h)}function p(){const h=ya(_e());return[1,2,3,4,5,6,7,8,9,10,11,12].map(D=>({label:u(pe(h.set({month:D}))),value:D}))}function i(h,g={}){return new N(t.value,{...n,year:"numeric",...g}).format(h)}function d(h,g){return sn(h)?new N(t.value,{...n,...g,timeZone:h.timeZone}).formatToParts(pe(h)):new N(t.value,{...n,...g}).formatToParts(pe(h))}function y(h,g="narrow"){return new N(t.value,{...n,weekday:g}).format(h)}function v(h){const D=new N(t.value,{...n,hour:"numeric",minute:"numeric"}).formatToParts(h).find(P=>P.type==="dayPeriod")?.value;return D==="PM"||D==="p.m."?"PM":"AM"}const f={year:"numeric",month:"numeric",day:"numeric",hour:"numeric",minute:"numeric",second:"numeric"};function m(h,g,D={}){const P={...f,...D},x=d(h,P).find(C=>C.type===g);return x?x.value:""}return{setLocale:r,getLocale:a,fullMonth:u,fullYear:i,fullMonthAndYear:s,toParts:d,custom:l,part:m,dayPeriod:v,selectedDate:o,dayOfWeek:y,getMonths:p}}const Na={trailing:!0};function Ya(e,n=25,t={}){if(t={...Na,...t},!Number.isFinite(n))throw new TypeError("Expected `wait` to be a finite number");let a,r,l=[],o,s;const u=(d,y)=>(o=Za(e,d,y),o.finally(()=>{if(o=null,t.trailing&&s&&!r){const v=u(d,s);return s=null,v}}),o),p=function(...d){return t.trailing&&(s=d),o||new Promise(y=>{const v=!r&&t.leading;clearTimeout(r),r=setTimeout(()=>{r=null;const f=t.leading?a:u(this,d);s=null;for(const m of l)m(f);l=[]},n),v?(a=u(this,d),y(a)):l.push(y)})},i=d=>{d&&(clearTimeout(d),r=null)};return p.isPending=()=>!!r,p.cancel=()=>{i(r),l=[],s=null},p.flush=()=>{if(i(r),!s||o)return;const d=s;return s=null,u(this,d)},p}async function Za(e,n,t){return await e.apply(n,t)}function Xa(...e){const n=typeof e[e.length-1]=="string"?e.pop():void 0;Ka(e[0],e[1])&&e.unshift(n);let[t,a,r={}]=e,l=!1;const o=A(()=>Tt(t));if(typeof o.value!="string")throw new TypeError("[nuxt] [useAsyncData] key must be a string.");if(typeof a!="function")throw new TypeError("[nuxt] [useAsyncData] handler must be a function.");const s=$t();r.server??=!0,r.default??=Ga,r.getCachedData??=tt,r.lazy??=!1,r.immediate??=!0,r.deep??=Dt.deep,r.dedupe??="cancel",r._functionName,s._asyncData[o.value];function u(){const f={cause:"initial",dedupe:r.dedupe};return s._asyncData[o.value]?._init||(f.cachedData=r.getCachedData(o.value,s,{cause:"initial"}),s._asyncData[o.value]=wn(s,o.value,a,r,f.cachedData)),()=>s._asyncData[o.value].execute(f)}const p=u(),i=s._asyncData[o.value];i._deps++;const d=r.server!==!1&&s.payload.serverRendered;{let f=function($){const x=s._asyncData[$];x?._deps&&(x._deps--,x._deps===0&&x?._off())};const m=Ln();if(m&&d&&r.immediate&&!m.sp&&(m.sp=[]),m&&!m._nuxtOnBeforeMountCbs){m._nuxtOnBeforeMountCbs=[];const $=m._nuxtOnBeforeMountCbs;Ct(()=>{$.forEach(x=>{x()}),$.splice(0,$.length)}),Tn(()=>$.splice(0,$.length))}const h=m&&(m._nuxtClientOnly||St(kt,!1));d&&s.isHydrating&&(i.error.value||i.data.value!==void 0)?i.status.value=i.error.value?"error":"success":m&&(!h&&s.payload.serverRendered&&s.isHydrating||r.lazy)&&r.immediate?m._nuxtOnBeforeMountCbs.push(p):r.immediate&&i.status.value!=="success"&&p();const g=Pt(),D=le(o,($,x)=>{if(($||x)&&$!==x){l=!0;const C=s._asyncData[x]?.data.value!==void 0,j=s._asyncDataPromises[x]!==void 0,ve={cause:"initial",dedupe:r.dedupe};if(!s._asyncData[$]?._init){let be;x&&C?be=s._asyncData[x].data.value:(be=r.getCachedData($,s,{cause:"initial"}),ve.cachedData=be),s._asyncData[$]=wn(s,$,a,r,be)}s._asyncData[$]._deps++,x&&f(x),(r.immediate||C||j)&&s._asyncData[$].execute(ve),fn(()=>{l=!1})}},{flush:"sync"}),P=r.watch?le(r.watch,()=>{l||(s._asyncData[o.value]?._execute.isPending()&&fn(()=>{s._asyncData[o.value]?._execute.flush()}),s._asyncData[o.value]?._execute({cause:"watch",dedupe:r.dedupe}))}):()=>{};g&&Mt(()=>{D(),P(),f(o.value)})}const y={data:$e(()=>s._asyncData[o.value]?.data),pending:$e(()=>s._asyncData[o.value]?.pending),status:$e(()=>s._asyncData[o.value]?.status),error:$e(()=>s._asyncData[o.value]?.error),refresh:(...f)=>s._asyncData[o.value]?._init?s._asyncData[o.value].execute(...f):u()(),execute:(...f)=>y.refresh(...f),clear:()=>{const f=s._asyncData[o.value];if(f?._abortController)try{f._abortController.abort(new DOMException("AsyncData aborted by user.","AbortError"))}finally{f._abortController=void 0}nt(s,o.value)}},v=Promise.resolve(s._asyncDataPromises[o.value]).then(()=>y);return Object.assign(v,y),v}function $e(e){return A({get(){return e()?.value},set(n){const t=e();t&&(t.value=n)}})}function Ka(e,n){return!(typeof e=="string"||typeof e=="object"&&e!==null||typeof e=="function"&&typeof n=="function")}function nt(e,n){n in e.payload.data&&(e.payload.data[n]=void 0),n in e.payload._errors&&(e.payload._errors[n]=void 0),e._asyncData[n]&&(e._asyncData[n].data.value=S(e._asyncData[n]._default()),e._asyncData[n].error.value=void 0,e._asyncData[n].status.value="idle"),n in e._asyncDataPromises&&(e._asyncDataPromises[n]=void 0)}function Ja(e,n){const t={};for(const a of n)t[a]=e[a];return t}function wn(e,n,t,a,r){e.payload._errors[n]??=void 0;const l=a.getCachedData!==tt,o=t,s=a.deep?Je:dn,u=r!==void 0,p=e.hook("app:data:refresh",async d=>{(!d||d.includes(n))&&await i.execute({cause:"refresh:hook"})}),i={data:s(u?r:a.default()),pending:A(()=>i.status.value==="pending"),error:Ot(e.payload._errors,n),status:dn("idle"),execute:(...d)=>{const[y,v=void 0]=d,f=y&&v===void 0&&typeof y=="object"?y:{};if(e._asyncDataPromises[n]&&(f.dedupe??a.dedupe)==="defer")return e._asyncDataPromises[n];{const g="cachedData"in f?f.cachedData:a.getCachedData(n,e,{cause:f.cause??"refresh:manual"});if(g!==void 0)return e.payload.data[n]=i.data.value=g,i.error.value=void 0,i.status.value="success",Promise.resolve(g)}i._abortController&&i._abortController.abort(new DOMException("AsyncData request cancelled by deduplication","AbortError")),i._abortController=new AbortController,i.status.value="pending";const m=new AbortController,h=new Promise((g,D)=>{try{const P=f.timeout??a.timeout,$=Qa([i._abortController?.signal,f?.signal],m.signal,P);if($.aborted){const x=$.reason;D(x instanceof Error?x:new DOMException(String(x??"Aborted"),"AbortError"));return}return $.addEventListener("abort",()=>{const x=$.reason;D(x instanceof Error?x:new DOMException(String(x??"Aborted"),"AbortError"))},{once:!0,signal:m.signal}),Promise.resolve(o(e,{signal:$})).then(g,D)}catch(P){D(P)}}).then(async g=>{let D=g;a.transform&&(D=await a.transform(g)),a.pick&&(D=Ja(D,a.pick)),e.payload.data[n]=D,i.data.value=D,i.error.value=void 0,i.status.value="success"}).catch(g=>{if(e._asyncDataPromises[n]&&e._asyncDataPromises[n]!==h||i._abortController?.signal.aborted)return e._asyncDataPromises[n];if(typeof DOMException<"u"&&g instanceof DOMException&&g.name==="AbortError")return i.status.value="idle",e._asyncDataPromises[n];i.error.value=Et(g),i.data.value=S(a.default()),i.status.value="error"}).finally(()=>{m.abort(),delete e._asyncDataPromises[n]});return e._asyncDataPromises[n]=h,e._asyncDataPromises[n]},_execute:Ya((...d)=>i.execute(...d),0,{leading:!0}),_default:a.default,_deps:0,_init:!0,_hash:void 0,_off:()=>{p(),e._asyncData[n]?._init&&(e._asyncData[n]._init=!1),l||_t(()=>{e._asyncData[n]?._init||(nt(e,n),i.execute=()=>Promise.resolve())})}};return i}const Ga=()=>{},tt=(e,n,t)=>{if(n.isHydrating)return n.payload.data[e];if(t.cause!=="refresh:manual"&&t.cause!=="refresh:hook")return n.static.data[e]};function Qa(e,n,t){const a=e.filter(o=>!!o);if(typeof t=="number"&&t>=0){const o=AbortSignal.timeout?.(t);o&&a.push(o)}if(AbortSignal.any)return AbortSignal.any(a);const r=new AbortController;for(const o of a)if(o.aborted){const s=o.reason??new DOMException("Aborted","AbortError");try{r.abort(s)}catch{r.abort()}return r.signal}const l=()=>{const s=a.find(u=>u.aborted)?.reason??new DOMException("Aborted","AbortError");try{r.abort(s)}catch{r.abort()}};for(const o of a)o.addEventListener?.("abort",l,{once:!0,signal:n});return r.signal}const er=()=>Lt("color-mode").value,nr=Object.assign({inheritAttrs:!1},{__name:"UColorModeButton",props:{color:{type:null,required:!1,default:"neutral"},variant:{type:null,required:!1,default:"ghost"},label:{type:String,required:!1},activeColor:{type:null,required:!1},activeVariant:{type:null,required:!1},size:{type:null,required:!1},square:{type:Boolean,required:!1},block:{type:Boolean,required:!1},loadingAuto:{type:Boolean,required:!1},onClick:{type:[Function,Array],required:!1},class:{type:null,required:!1},ui:{type:null,required:!1},icon:{type:null,required:!1},avatar:{type:Object,required:!1},leading:{type:Boolean,required:!1},leadingIcon:{type:null,required:!1},trailing:{type:Boolean,required:!1},trailingIcon:{type:null,required:!1},loading:{type:Boolean,required:!1},loadingIcon:{type:null,required:!1},as:{type:null,required:!1},type:{type:null,required:!1},disabled:{type:Boolean,required:!1},exactActiveClass:{type:String,required:!1},viewTransition:{type:Boolean,required:!1}},setup(e){const n=e,{t}=An(),a=er(),r=Pe(),l=At(Rt(n,"icon")),o=A({get(){return a.value==="dark"},set(s){a.preference=s?"dark":"light"}});return(s,u)=>(b(),L(Bt,q({...S(l),"aria-label":o.value?S(t)("colorMode.switchToLight"):S(t)("colorMode.switchToDark"),...s.$attrs},{onClick:u[0]||(u[0]=p=>o.value=!o.value)}),{leading:R(({ui:p})=>[z(ze,{class:M(p.leadingIcon({class:[n.ui?.leadingIcon,"hidden dark:inline-block"]})),name:S(r).ui.icons.dark},null,8,["class","name"]),z(ze,{class:M(p.leadingIcon({class:[n.ui?.leadingIcon,"dark:hidden"]})),name:S(r).ui.icons.light},null,8,["class","name"])]),_:1},16))}});class ye{constructor(n,t,a){this.normal=t,this.property=n,a&&(this.space=a)}}ye.prototype.normal={};ye.prototype.property={};ye.prototype.space=void 0;function at(e,n){const t={},a={};for(const r of e)Object.assign(t,r.property),Object.assign(a,r.normal);return new ye(t,a,n)}function We(e){return e.toLowerCase()}class B{constructor(n,t){this.attribute=t,this.property=n}}B.prototype.attribute="";B.prototype.booleanish=!1;B.prototype.boolean=!1;B.prototype.commaOrSpaceSeparated=!1;B.prototype.commaSeparated=!1;B.prototype.defined=!1;B.prototype.mustUseProperty=!1;B.prototype.number=!1;B.prototype.overloadedBoolean=!1;B.prototype.property="";B.prototype.spaceSeparated=!1;B.prototype.space=void 0;let tr=0;const w=G(),O=G(),Ne=G(),c=G(),k=G(),re=G(),I=G();function G(){return 2**++tr}const Ye=Object.freeze(Object.defineProperty({__proto__:null,boolean:w,booleanish:O,commaOrSpaceSeparated:I,commaSeparated:re,number:c,overloadedBoolean:Ne,spaceSeparated:k},Symbol.toStringTag,{value:"Module"})),Ie=Object.keys(Ye);class un extends B{constructor(n,t,a,r){let l=-1;if(super(n,t),$n(this,"space",r),typeof a=="number")for(;++l<Ie.length;){const o=Ie[l];$n(this,Ie[l],(a&Ye[o])===Ye[o])}}}un.prototype.defined=!0;function $n(e,n,t){t&&(e[n]=t)}function de(e){const n={},t={};for(const[a,r]of Object.entries(e.properties)){const l=new un(a,e.transform(e.attributes||{},a),r,e.space);e.mustUseProperty&&e.mustUseProperty.includes(a)&&(l.mustUseProperty=!0),n[a]=l,t[We(a)]=a,t[We(l.attribute)]=a}return new ye(n,t,e.space)}const rt=de({properties:{ariaActiveDescendant:null,ariaAtomic:O,ariaAutoComplete:null,ariaBusy:O,ariaChecked:O,ariaColCount:c,ariaColIndex:c,ariaColSpan:c,ariaControls:k,ariaCurrent:null,ariaDescribedBy:k,ariaDetails:null,ariaDisabled:O,ariaDropEffect:k,ariaErrorMessage:null,ariaExpanded:O,ariaFlowTo:k,ariaGrabbed:O,ariaHasPopup:null,ariaHidden:O,ariaInvalid:null,ariaKeyShortcuts:null,ariaLabel:null,ariaLabelledBy:k,ariaLevel:c,ariaLive:null,ariaModal:O,ariaMultiLine:O,ariaMultiSelectable:O,ariaOrientation:null,ariaOwns:k,ariaPlaceholder:null,ariaPosInSet:c,ariaPressed:O,ariaReadOnly:O,ariaRelevant:null,ariaRequired:O,ariaRoleDescription:k,ariaRowCount:c,ariaRowIndex:c,ariaRowSpan:c,ariaSelected:O,ariaSetSize:c,ariaSort:null,ariaValueMax:c,ariaValueMin:c,ariaValueNow:c,ariaValueText:null,role:null},transform(e,n){return n==="role"?n:"aria-"+n.slice(4).toLowerCase()}});function lt(e,n){return n in e?e[n]:n}function ot(e,n){return lt(e,n.toLowerCase())}const ar=de({attributes:{acceptcharset:"accept-charset",classname:"class",htmlfor:"for",httpequiv:"http-equiv"},mustUseProperty:["checked","multiple","muted","selected"],properties:{abbr:null,accept:re,acceptCharset:k,accessKey:k,action:null,allow:null,allowFullScreen:w,allowPaymentRequest:w,allowUserMedia:w,alt:null,as:null,async:w,autoCapitalize:null,autoComplete:k,autoFocus:w,autoPlay:w,blocking:k,capture:null,charSet:null,checked:w,cite:null,className:k,cols:c,colSpan:null,content:null,contentEditable:O,controls:w,controlsList:k,coords:c|re,crossOrigin:null,data:null,dateTime:null,decoding:null,default:w,defer:w,dir:null,dirName:null,disabled:w,download:Ne,draggable:O,encType:null,enterKeyHint:null,fetchPriority:null,form:null,formAction:null,formEncType:null,formMethod:null,formNoValidate:w,formTarget:null,headers:k,height:c,hidden:Ne,high:c,href:null,hrefLang:null,htmlFor:k,httpEquiv:k,id:null,imageSizes:null,imageSrcSet:null,inert:w,inputMode:null,integrity:null,is:null,isMap:w,itemId:null,itemProp:k,itemRef:k,itemScope:w,itemType:k,kind:null,label:null,lang:null,language:null,list:null,loading:null,loop:w,low:c,manifest:null,max:null,maxLength:c,media:null,method:null,min:null,minLength:c,multiple:w,muted:w,name:null,nonce:null,noModule:w,noValidate:w,onAbort:null,onAfterPrint:null,onAuxClick:null,onBeforeMatch:null,onBeforePrint:null,onBeforeToggle:null,onBeforeUnload:null,onBlur:null,onCancel:null,onCanPlay:null,onCanPlayThrough:null,onChange:null,onClick:null,onClose:null,onContextLost:null,onContextMenu:null,onContextRestored:null,onCopy:null,onCueChange:null,onCut:null,onDblClick:null,onDrag:null,onDragEnd:null,onDragEnter:null,onDragExit:null,onDragLeave:null,onDragOver:null,onDragStart:null,onDrop:null,onDurationChange:null,onEmptied:null,onEnded:null,onError:null,onFocus:null,onFormData:null,onHashChange:null,onInput:null,onInvalid:null,onKeyDown:null,onKeyPress:null,onKeyUp:null,onLanguageChange:null,onLoad:null,onLoadedData:null,onLoadedMetadata:null,onLoadEnd:null,onLoadStart:null,onMessage:null,onMessageError:null,onMouseDown:null,onMouseEnter:null,onMouseLeave:null,onMouseMove:null,onMouseOut:null,onMouseOver:null,onMouseUp:null,onOffline:null,onOnline:null,onPageHide:null,onPageShow:null,onPaste:null,onPause:null,onPlay:null,onPlaying:null,onPopState:null,onProgress:null,onRateChange:null,onRejectionHandled:null,onReset:null,onResize:null,onScroll:null,onScrollEnd:null,onSecurityPolicyViolation:null,onSeeked:null,onSeeking:null,onSelect:null,onSlotChange:null,onStalled:null,onStorage:null,onSubmit:null,onSuspend:null,onTimeUpdate:null,onToggle:null,onUnhandledRejection:null,onUnload:null,onVolumeChange:null,onWaiting:null,onWheel:null,open:w,optimum:c,pattern:null,ping:k,placeholder:null,playsInline:w,popover:null,popoverTarget:null,popoverTargetAction:null,poster:null,preload:null,readOnly:w,referrerPolicy:null,rel:k,required:w,reversed:w,rows:c,rowSpan:c,sandbox:k,scope:null,scoped:w,seamless:w,selected:w,shadowRootClonable:w,shadowRootDelegatesFocus:w,shadowRootMode:null,shape:null,size:c,sizes:null,slot:null,span:c,spellCheck:O,src:null,srcDoc:null,srcLang:null,srcSet:null,start:c,step:null,style:null,tabIndex:c,target:null,title:null,translate:null,type:null,typeMustMatch:w,useMap:null,value:O,width:c,wrap:null,writingSuggestions:null,align:null,aLink:null,archive:k,axis:null,background:null,bgColor:null,border:c,borderColor:null,bottomMargin:c,cellPadding:null,cellSpacing:null,char:null,charOff:null,classId:null,clear:null,code:null,codeBase:null,codeType:null,color:null,compact:w,declare:w,event:null,face:null,frame:null,frameBorder:null,hSpace:c,leftMargin:c,link:null,longDesc:null,lowSrc:null,marginHeight:c,marginWidth:c,noResize:w,noHref:w,noShade:w,noWrap:w,object:null,profile:null,prompt:null,rev:null,rightMargin:c,rules:null,scheme:null,scrolling:O,standby:null,summary:null,text:null,topMargin:c,valueType:null,version:null,vAlign:null,vLink:null,vSpace:c,allowTransparency:null,autoCorrect:null,autoSave:null,disablePictureInPicture:w,disableRemotePlayback:w,prefix:null,property:null,results:c,security:null,unselectable:null},space:"html",transform:ot}),rr=de({attributes:{accentHeight:"accent-height",alignmentBaseline:"alignment-baseline",arabicForm:"arabic-form",baselineShift:"baseline-shift",capHeight:"cap-height",className:"class",clipPath:"clip-path",clipRule:"clip-rule",colorInterpolation:"color-interpolation",colorInterpolationFilters:"color-interpolation-filters",colorProfile:"color-profile",colorRendering:"color-rendering",crossOrigin:"crossorigin",dataType:"datatype",dominantBaseline:"dominant-baseline",enableBackground:"enable-background",fillOpacity:"fill-opacity",fillRule:"fill-rule",floodColor:"flood-color",floodOpacity:"flood-opacity",fontFamily:"font-family",fontSize:"font-size",fontSizeAdjust:"font-size-adjust",fontStretch:"font-stretch",fontStyle:"font-style",fontVariant:"font-variant",fontWeight:"font-weight",glyphName:"glyph-name",glyphOrientationHorizontal:"glyph-orientation-horizontal",glyphOrientationVertical:"glyph-orientation-vertical",hrefLang:"hreflang",horizAdvX:"horiz-adv-x",horizOriginX:"horiz-origin-x",horizOriginY:"horiz-origin-y",imageRendering:"image-rendering",letterSpacing:"letter-spacing",lightingColor:"lighting-color",markerEnd:"marker-end",markerMid:"marker-mid",markerStart:"marker-start",navDown:"nav-down",navDownLeft:"nav-down-left",navDownRight:"nav-down-right",navLeft:"nav-left",navNext:"nav-next",navPrev:"nav-prev",navRight:"nav-right",navUp:"nav-up",navUpLeft:"nav-up-left",navUpRight:"nav-up-right",onAbort:"onabort",onActivate:"onactivate",onAfterPrint:"onafterprint",onBeforePrint:"onbeforeprint",onBegin:"onbegin",onCancel:"oncancel",onCanPlay:"oncanplay",onCanPlayThrough:"oncanplaythrough",onChange:"onchange",onClick:"onclick",onClose:"onclose",onCopy:"oncopy",onCueChange:"oncuechange",onCut:"oncut",onDblClick:"ondblclick",onDrag:"ondrag",onDragEnd:"ondragend",onDragEnter:"ondragenter",onDragExit:"ondragexit",onDragLeave:"ondragleave",onDragOver:"ondragover",onDragStart:"ondragstart",onDrop:"ondrop",onDurationChange:"ondurationchange",onEmptied:"onemptied",onEnd:"onend",onEnded:"onended",onError:"onerror",onFocus:"onfocus",onFocusIn:"onfocusin",onFocusOut:"onfocusout",onHashChange:"onhashchange",onInput:"oninput",onInvalid:"oninvalid",onKeyDown:"onkeydown",onKeyPress:"onkeypress",onKeyUp:"onkeyup",onLoad:"onload",onLoadedData:"onloadeddata",onLoadedMetadata:"onloadedmetadata",onLoadStart:"onloadstart",onMessage:"onmessage",onMouseDown:"onmousedown",onMouseEnter:"onmouseenter",onMouseLeave:"onmouseleave",onMouseMove:"onmousemove",onMouseOut:"onmouseout",onMouseOver:"onmouseover",onMouseUp:"onmouseup",onMouseWheel:"onmousewheel",onOffline:"onoffline",onOnline:"ononline",onPageHide:"onpagehide",onPageShow:"onpageshow",onPaste:"onpaste",onPause:"onpause",onPlay:"onplay",onPlaying:"onplaying",onPopState:"onpopstate",onProgress:"onprogress",onRateChange:"onratechange",onRepeat:"onrepeat",onReset:"onreset",onResize:"onresize",onScroll:"onscroll",onSeeked:"onseeked",onSeeking:"onseeking",onSelect:"onselect",onShow:"onshow",onStalled:"onstalled",onStorage:"onstorage",onSubmit:"onsubmit",onSuspend:"onsuspend",onTimeUpdate:"ontimeupdate",onToggle:"ontoggle",onUnload:"onunload",onVolumeChange:"onvolumechange",onWaiting:"onwaiting",onZoom:"onzoom",overlinePosition:"overline-position",overlineThickness:"overline-thickness",paintOrder:"paint-order",panose1:"panose-1",pointerEvents:"pointer-events",referrerPolicy:"referrerpolicy",renderingIntent:"rendering-intent",shapeRendering:"shape-rendering",stopColor:"stop-color",stopOpacity:"stop-opacity",strikethroughPosition:"strikethrough-position",strikethroughThickness:"strikethrough-thickness",strokeDashArray:"stroke-dasharray",strokeDashOffset:"stroke-dashoffset",strokeLineCap:"stroke-linecap",strokeLineJoin:"stroke-linejoin",strokeMiterLimit:"stroke-miterlimit",strokeOpacity:"stroke-opacity",strokeWidth:"stroke-width",tabIndex:"tabindex",textAnchor:"text-anchor",textDecoration:"text-decoration",textRendering:"text-rendering",transformOrigin:"transform-origin",typeOf:"typeof",underlinePosition:"underline-position",underlineThickness:"underline-thickness",unicodeBidi:"unicode-bidi",unicodeRange:"unicode-range",unitsPerEm:"units-per-em",vAlphabetic:"v-alphabetic",vHanging:"v-hanging",vIdeographic:"v-ideographic",vMathematical:"v-mathematical",vectorEffect:"vector-effect",vertAdvY:"vert-adv-y",vertOriginX:"vert-origin-x",vertOriginY:"vert-origin-y",wordSpacing:"word-spacing",writingMode:"writing-mode",xHeight:"x-height",playbackOrder:"playbackorder",timelineBegin:"timelinebegin"},properties:{about:I,accentHeight:c,accumulate:null,additive:null,alignmentBaseline:null,alphabetic:c,amplitude:c,arabicForm:null,ascent:c,attributeName:null,attributeType:null,azimuth:c,bandwidth:null,baselineShift:null,baseFrequency:null,baseProfile:null,bbox:null,begin:null,bias:c,by:null,calcMode:null,capHeight:c,className:k,clip:null,clipPath:null,clipPathUnits:null,clipRule:null,color:null,colorInterpolation:null,colorInterpolationFilters:null,colorProfile:null,colorRendering:null,content:null,contentScriptType:null,contentStyleType:null,crossOrigin:null,cursor:null,cx:null,cy:null,d:null,dataType:null,defaultAction:null,descent:c,diffuseConstant:c,direction:null,display:null,dur:null,divisor:c,dominantBaseline:null,download:w,dx:null,dy:null,edgeMode:null,editable:null,elevation:c,enableBackground:null,end:null,event:null,exponent:c,externalResourcesRequired:null,fill:null,fillOpacity:c,fillRule:null,filter:null,filterRes:null,filterUnits:null,floodColor:null,floodOpacity:null,focusable:null,focusHighlight:null,fontFamily:null,fontSize:null,fontSizeAdjust:null,fontStretch:null,fontStyle:null,fontVariant:null,fontWeight:null,format:null,fr:null,from:null,fx:null,fy:null,g1:re,g2:re,glyphName:re,glyphOrientationHorizontal:null,glyphOrientationVertical:null,glyphRef:null,gradientTransform:null,gradientUnits:null,handler:null,hanging:c,hatchContentUnits:null,hatchUnits:null,height:null,href:null,hrefLang:null,horizAdvX:c,horizOriginX:c,horizOriginY:c,id:null,ideographic:c,imageRendering:null,initialVisibility:null,in:null,in2:null,intercept:c,k:c,k1:c,k2:c,k3:c,k4:c,kernelMatrix:I,kernelUnitLength:null,keyPoints:null,keySplines:null,keyTimes:null,kerning:null,lang:null,lengthAdjust:null,letterSpacing:null,lightingColor:null,limitingConeAngle:c,local:null,markerEnd:null,markerMid:null,markerStart:null,markerHeight:null,markerUnits:null,markerWidth:null,mask:null,maskContentUnits:null,maskUnits:null,mathematical:null,max:null,media:null,mediaCharacterEncoding:null,mediaContentEncodings:null,mediaSize:c,mediaTime:null,method:null,min:null,mode:null,name:null,navDown:null,navDownLeft:null,navDownRight:null,navLeft:null,navNext:null,navPrev:null,navRight:null,navUp:null,navUpLeft:null,navUpRight:null,numOctaves:null,observer:null,offset:null,onAbort:null,onActivate:null,onAfterPrint:null,onBeforePrint:null,onBegin:null,onCancel:null,onCanPlay:null,onCanPlayThrough:null,onChange:null,onClick:null,onClose:null,onCopy:null,onCueChange:null,onCut:null,onDblClick:null,onDrag:null,onDragEnd:null,onDragEnter:null,onDragExit:null,onDragLeave:null,onDragOver:null,onDragStart:null,onDrop:null,onDurationChange:null,onEmptied:null,onEnd:null,onEnded:null,onError:null,onFocus:null,onFocusIn:null,onFocusOut:null,onHashChange:null,onInput:null,onInvalid:null,onKeyDown:null,onKeyPress:null,onKeyUp:null,onLoad:null,onLoadedData:null,onLoadedMetadata:null,onLoadStart:null,onMessage:null,onMouseDown:null,onMouseEnter:null,onMouseLeave:null,onMouseMove:null,onMouseOut:null,onMouseOver:null,onMouseUp:null,onMouseWheel:null,onOffline:null,onOnline:null,onPageHide:null,onPageShow:null,onPaste:null,onPause:null,onPlay:null,onPlaying:null,onPopState:null,onProgress:null,onRateChange:null,onRepeat:null,onReset:null,onResize:null,onScroll:null,onSeeked:null,onSeeking:null,onSelect:null,onShow:null,onStalled:null,onStorage:null,onSubmit:null,onSuspend:null,onTimeUpdate:null,onToggle:null,onUnload:null,onVolumeChange:null,onWaiting:null,onZoom:null,opacity:null,operator:null,order:null,orient:null,orientation:null,origin:null,overflow:null,overlay:null,overlinePosition:c,overlineThickness:c,paintOrder:null,panose1:null,path:null,pathLength:c,patternContentUnits:null,patternTransform:null,patternUnits:null,phase:null,ping:k,pitch:null,playbackOrder:null,pointerEvents:null,points:null,pointsAtX:c,pointsAtY:c,pointsAtZ:c,preserveAlpha:null,preserveAspectRatio:null,primitiveUnits:null,propagate:null,property:I,r:null,radius:null,referrerPolicy:null,refX:null,refY:null,rel:I,rev:I,renderingIntent:null,repeatCount:null,repeatDur:null,requiredExtensions:I,requiredFeatures:I,requiredFonts:I,requiredFormats:I,resource:null,restart:null,result:null,rotate:null,rx:null,ry:null,scale:null,seed:null,shapeRendering:null,side:null,slope:null,snapshotTime:null,specularConstant:c,specularExponent:c,spreadMethod:null,spacing:null,startOffset:null,stdDeviation:null,stemh:null,stemv:null,stitchTiles:null,stopColor:null,stopOpacity:null,strikethroughPosition:c,strikethroughThickness:c,string:null,stroke:null,strokeDashArray:I,strokeDashOffset:null,strokeLineCap:null,strokeLineJoin:null,strokeMiterLimit:c,strokeOpacity:c,strokeWidth:null,style:null,surfaceScale:c,syncBehavior:null,syncBehaviorDefault:null,syncMaster:null,syncTolerance:null,syncToleranceDefault:null,systemLanguage:I,tabIndex:c,tableValues:null,target:null,targetX:c,targetY:c,textAnchor:null,textDecoration:null,textRendering:null,textLength:null,timelineBegin:null,title:null,transformBehavior:null,type:null,typeOf:I,to:null,transform:null,transformOrigin:null,u1:null,u2:null,underlinePosition:c,underlineThickness:c,unicode:null,unicodeBidi:null,unicodeRange:null,unitsPerEm:c,values:null,vAlphabetic:c,vMathematical:c,vectorEffect:null,vHanging:c,vIdeographic:c,version:null,vertAdvY:c,vertOriginX:c,vertOriginY:c,viewBox:null,viewTarget:null,visibility:null,width:null,widths:null,wordSpacing:null,writingMode:null,x:null,x1:null,x2:null,xChannelSelector:null,xHeight:c,y:null,y1:null,y2:null,yChannelSelector:null,z:null,zoomAndPan:null},space:"svg",transform:lt}),st=de({properties:{xLinkActuate:null,xLinkArcRole:null,xLinkHref:null,xLinkRole:null,xLinkShow:null,xLinkTitle:null,xLinkType:null},space:"xlink",transform(e,n){return"xlink:"+n.slice(5).toLowerCase()}}),it=de({attributes:{xmlnsxlink:"xmlns:xlink"},properties:{xmlnsXLink:null,xmlns:null},space:"xmlns",transform:ot}),ut=de({properties:{xmlBase:null,xmlLang:null,xmlSpace:null},space:"xml",transform(e,n){return"xml:"+n.slice(3).toLowerCase()}}),lr=/[A-Z]/g,Dn=/-[a-z]/g,or=/^data[-\w.:]+$/i;function sr(e,n){const t=We(n);let a=n,r=B;if(t in e.normal)return e.property[e.normal[t]];if(t.length>4&&t.slice(0,4)==="data"&&or.test(n)){if(n.charAt(4)==="-"){const l=n.slice(5).replace(Dn,ur);a="data"+l.charAt(0).toUpperCase()+l.slice(1)}else{const l=n.slice(4);if(!Dn.test(l)){let o=l.replace(lr,ir);o.charAt(0)!=="-"&&(o="-"+o),n="data"+o}}r=un}return new r(a,n)}function ir(e){return"-"+e.toLowerCase()}function ur(e){return e.charAt(1).toUpperCase()}const cr=at([rt,ar,st,it,ut],"html"),Vl=at([rt,rr,st,it,ut],"svg"),dr=new Set(["a","abbr","address","area","article","aside","audio","b","base","bdi","bdo","blockquote","body","br","button","canvas","caption","cite","code","col","colgroup","data","datalist","dd","del","details","dfn","dialog","div","dl","dt","em","embed","fieldset","figcaption","figure","footer","form","h1","h2","h3","h4","h5","h6","head","header","hgroup","hr","html","i","iframe","img","input","ins","kbd","label","legend","li","link","main","map","mark","math","menu","menuitem","meta","meter","nav","noscript","object","ol","optgroup","option","output","p","param","picture","pre","progress","q","rb","rp","rt","rtc","ruby","s","samp","script","section","select","slot","small","source","span","strong","style","sub","summary","sup","svg","table","tbody","td","template","textarea","tfoot","th","thead","time","title","tr","track","u","ul","var","video","wbr"]);function fr(e,n){return n.reduce((t,a)=>{const r=pr(e,a);return r!==void 0&&(t[a]=r),t},{})}function pr(e,n){return n.split(".").reduce((t,a)=>t&&t[a],e)}const Ze="default",ct=/^@|^v-on:/,dt=/^:|^v-bind:/,hr=/^v-model/,mr=["select","textarea","input"],gr=new Set(["math","svg"]),ft=new Set,yr=Object.fromEntries(["p","a","blockquote","code","pre","code","em","h1","h2","h3","h4","h5","h6","hr","img","ul","ol","li","strong","table","thead","tbody","td","th","tr","script"].map(e=>[e,`prose-${e}`])),vr=["script","base"],br=Rn({name:"MDCRenderer",props:{body:{type:Object,required:!0},data:{type:Object,default:()=>({})},class:{type:[String,Object],default:void 0},tag:{type:[String,Boolean],default:void 0},prose:{type:Boolean,default:void 0},components:{type:Object,default:()=>({})},unwrap:{type:[Boolean,String],default:!1}},async setup(e){const t=Ln()?.appContext?.app?.$nuxt,a=t?.$route||t?._route,{mdc:r}=t?.$config?.public||{},l=r?.components?.customElements||r?.components?.custom;l&&l.forEach(i=>ft.add(i));const o=A(()=>({...r?.components?.prose&&e.prose!==!1?yr:{},...r?.components?.map||{},...Vt(e.data?.mdc?.components||{}),...e.components})),s=A(()=>{const i=(e.body?.children||[]).map(d=>d.tag||d.type).filter(d=>!cn(d));return Array.from(new Set(i)).sort().join(".")}),u=It({...e.data});le(()=>e.data,i=>{Object.assign(u,i)}),await Er(e.body,{tags:o.value});function p(i,d){const y=i.split(".").length-1;return i.split(".").reduce((v,f,m)=>m==y&&v?(v[f]=d,v[f]):typeof v=="object"?v[f]:void 0,u)}return{tags:o,contentKey:s,route:a,runtimeData:u,updateRuntimeData:p}},render(e){const{tags:n,tag:t,body:a,data:r,contentKey:l,route:o,unwrap:s,runtimeData:u,updateRuntimeData:p}=e;if(!a)return null;const i={...r,tags:n,$route:o,runtimeData:u,updateRuntimeData:p},d=t!==!1?Xe(t||i.component?.name||i.component||"div"):void 0;return d?pn(d,{...i.component?.props,class:e.class,...this.$attrs,key:l},{default:y}):y?.();function y(){const v=pt(a,pn,{documentMeta:i,parentScope:i,resolveComponent:Xe});return v?.default?s?jn(v.default(),typeof s=="string"?s.split(" "):["*"]):v.default():null}}});function xr(e,n,t,a){const{documentMeta:r,parentScope:l,resolveComponent:o}=t;if(e.type==="text")return n(ke,e.value);if(e.type==="comment")return n(zt,null,e.value);const s=e.tag,u=mt(e,r.tags);if(e.tag==="binding")return wr(e,n,r,l);const p=ht(u)?y=>y:o;if(vr.includes(u))return n("pre",{class:"mdc-renderer-dangerous-tag"},"<"+u+">"+na(e)+"</"+u+">");const i=p(u);typeof i=="object"&&(i.tag=s);const d=$r(e,r);return a&&(d.key=a),n(i,d,pt(e,n,{documentMeta:r,parentScope:{...l,...d},resolveComponent:p}))}function pt(e,n,t){const{documentMeta:a,parentScope:r,resolveComponent:l}=t,s=(e.children||[]).reduce((p,i)=>{if(!Pr(i))return p[Ze].children.push(i),p;const d=Mr(i);return p[d]=p[d]||{props:{},children:[]},i.type==="element"&&(p[d].props=i.props,p[d].children.push(...i.children||[])),p},{[Ze]:{props:{},children:[]}});return Object.entries(s).reduce((p,[i,{props:d,children:y}])=>(y.length&&(p[i]=(v={})=>{const f=fr(v,Object.keys(d||{}));let m=y.map((h,g)=>xr(h,n,{documentMeta:a,parentScope:{...r,...f},resolveComponent:l},String(h.props?.key||g)));return d?.unwrap&&(m=jn(m,d.unwrap)),_r(m)}),p),{})}function wr(e,n,t,a={}){const r={...t.runtimeData,...a,$document:t,$doc:t},l=/\.|\[(\d+)\]/,s=(e.props?.value.trim().split(l).filter(Boolean)).reduce((p,i)=>{if(p&&i in p)return typeof p[i]=="function"?p[i]():p[i]},r),u=e.props?.defaultValue;return n(ke,s??u??"")}function $r(e,n){const{tag:t="",props:a={}}=e;return Object.keys(a).reduce(function(r,l){if(l==="__ignoreMap")return r;const o=a[l];if(hr.test(l))return Dr(l,o,r,n,{native:mr.includes(t)});if(l==="v-bind")return Cr(l,o,r,n);if(ct.test(l))return Sr(l,o,r,n);if(dt.test(l))return kr(l,o,r,n);const{attribute:s}=sr(cr,l);return Array.isArray(o)&&o.every(u=>typeof u=="string")?(r[s]=o.join(" "),r):(r[s]=o,r)},{})}function Dr(e,n,t,a,{native:r}){const l=e.match(/^v-model:([^=]+)/)?.[1]||"modelValue",o=r?"value":l,s=r?"onInput":`onUpdate:${l}`;return t[o]=Oe(n,a.runtimeData),t[s]=u=>{a.updateRuntimeData(n,r?u.target?.value:u)},t}function Cr(e,n,t,a){const r=Oe(n,a);return t=Object.assign(t,r),t}function Sr(e,n,t,a){return e=e.replace(ct,""),t.on=t.on||{},t.on[e]=()=>Oe(n,a),t}function kr(e,n,t,a){return e=e.replace(dt,""),t[e]=Oe(n,a),t}const Xe=e=>{if(typeof e=="string"){if(cn(e))return e;const n=jt(Bn(e),!1);return!e||n?.name==="AsyncComponentWrapper"||typeof n=="string"?n:"setup"in n?qt(()=>new Promise(t=>t(n))):n}return e};function Oe(e,n){const t=e.split(".").reduce((a,r)=>typeof a=="object"?a[r]:void 0,n);return typeof t>"u"?Ft(e):t}function Mr(e){let n="";for(const t of Object.keys(e.props||{}))if(!(!t.startsWith("#")&&!t.startsWith("v-slot:"))){n=t.split(/[:#]/,2)[1];break}return n||Ze}function Pr(e){return e.tag==="template"}function ht(e){return gr.has(e)}function _r(e){const n=[];for(const t of e){const a=n[n.length-1];t.type===ke&&a?.type===ke?a.children=a.children+t.children:n.push(t)}return n}async function Er(e,n){if(!e)return;const t=Array.from(new Set(a(e,n)));await Promise.all(t.map(async r=>{if(r?.render||r?.ssrRender||r?.__ssrInlineRender)return;const l=Xe(r);l?.__asyncLoader&&!l.__asyncResolved&&await l.__asyncLoader()}));function a(r,l){const o=r.tag;if(r.type==="text"||o==="binding"||r.type==="comment")return[];const s=mt(r,l.tags);if(ht(s))return[];const u=[];r.type!=="root"&&!cn(s)&&u.push(s);for(const p of r.children||[])u.push(...a(p,l));return u}}function mt(e,n){const t=e.tag;return!t||typeof e.props?.__ignoreMap<"u"?t:n[t]||n[Bn(t)]||n[Ut(e.tag)]||t}function cn(e){return(typeof e=="string"?ft.has(e):!1)||dr.has(e)}const Or=Object.assign(br,{__name:"MDCRenderer"}),Tr={__name:"MDC",props:{tag:{type:[String,Boolean],default:"div"},value:{type:[String,Object],required:!0},excerpt:{type:Boolean,default:!1},parserOptions:{type:Object,default:()=>({})},class:{type:[String,Array,Object],default:""},unwrap:{type:[Boolean,String],default:!1},cacheKey:{type:String,default:void 0},partial:{type:Boolean,default:!0}},async setup(e){let n,t;const a=e,r=A(()=>a.cacheKey??p(a.value)),{data:l,refresh:o,error:s}=([n,t]=Ht(async()=>Xa(r.value,async()=>{if(typeof a.value!="string")return a.value;const{parseMarkdown:i}=await Wt(async()=>{const{parseMarkdown:d}=await import("./BiiwaKmo.js").then(y=>y.i);return{parseMarkdown:d}},__vite__mapDeps([0,1,2,3]),import.meta.url);return await i(a.value,{...a.parserOptions,toc:a.partial?!1:a.parserOptions?.toc,contentHeading:a.partial?!1:a.parserOptions?.contentHeading})})),n=await n,t(),n),u=A(()=>a.excerpt?l.value?.excerpt:l.value?.body);le(()=>a.value,()=>{o()});function p(i){typeof i!="string"&&(i=JSON.stringify(i||""));let d=0;for(let y=0;y<i.length;y++){const v=i.charCodeAt(y);d=(d<<6)-d+v,d=d&d}return`mdc-${d===0?"0000":d.toString(36)}-key`}return(i,d)=>{const y=Or;return T(i.$slots,"default",{data:S(l)?.data,body:S(l)?.body,toc:S(l)?.toc,excerpt:S(l)?.excerpt,error:S(s)},()=>[u.value?(b(),L(y,{key:0,tag:a.tag,class:M(a.class),body:u.value,data:S(l)?.data,unwrap:a.unwrap},null,8,["tag","class","body","data","unwrap"])):E("",!0)])}}},Lr={slots:{root:"relative group/user",wrapper:"",name:"font-medium",description:"text-muted",avatar:"shrink-0"},variants:{orientation:{horizontal:{root:"flex items-center"},vertical:{root:"flex flex-col"}},to:{true:{name:["text-default peer-hover:text-highlighted peer-focus-visible:text-highlighted","transition-colors"],description:["peer-hover:text-toned peer-focus-visible:text-toned","transition-colors"],avatar:"transform transition-transform duration-200 group-hover/user:scale-115 group-has-focus-visible/user:scale-115"},false:{name:"text-highlighted",description:""}},size:{"3xs":{root:"gap-1",wrapper:"flex items-center gap-1",name:"text-xs",description:"text-xs"},"2xs":{root:"gap-1.5",wrapper:"flex items-center gap-1.5",name:"text-xs",description:"text-xs"},xs:{root:"gap-1.5",wrapper:"flex items-center gap-1.5",name:"text-xs",description:"text-xs"},sm:{root:"gap-2",name:"text-xs",description:"text-xs"},md:{root:"gap-2",name:"text-sm",description:"text-xs"},lg:{root:"gap-2.5",name:"text-sm",description:"text-sm"},xl:{root:"gap-2.5",name:"text-base",description:"text-sm"},"2xl":{root:"gap-3",name:"text-base",description:"text-base"},"3xl":{root:"gap-3",name:"text-lg",description:"text-base"}}},defaultVariants:{size:"md"}},Ar=Object.assign({inheritAttrs:!1},{__name:"UUser",props:{as:{type:null,required:!1},name:{type:String,required:!1},description:{type:String,required:!1},avatar:{type:Object,required:!1},chip:{type:[Boolean,Object],required:!1},size:{type:null,required:!1},orientation:{type:null,required:!1,default:"horizontal"},to:{type:null,required:!1},target:{type:[String,Object,null],required:!1},onClick:{type:Function,required:!1},class:{type:null,required:!1},ui:{type:null,required:!1}},setup(e){const n=e,t=Ge(),a=Pe(),r=A(()=>oe({extend:oe(Lr),...a.ui?.user||{}})({size:n.size,orientation:n.orientation,to:!!n.to||!!n.onClick}));return(l,o)=>(b(),L(S(en),{as:e.as,"data-orientation":e.orientation,"data-slot":"root",class:M(r.value.root({class:[n.ui?.root,n.class]})),onClick:e.onClick},{default:R(()=>[T(l.$slots,"avatar",{ui:r.value},()=>[e.chip&&e.avatar?(b(),L(Nt,q({key:0,inset:""},typeof e.chip=="object"?e.chip:{},{size:e.size}),{default:R(()=>[z(hn,q({alt:e.name},e.avatar,{size:e.size,"data-slot":"avatar",class:r.value.avatar({class:n.ui?.avatar})}),null,16,["alt","size","class"])]),_:1},16,["size"])):e.avatar?(b(),L(hn,q({key:1,alt:e.name},e.avatar,{size:e.size,"data-slot":"avatar",class:r.value.avatar({class:n.ui?.avatar})}),null,16,["alt","size","class"])):E("",!0)]),U("div",{"data-slot":"wrapper",class:M(r.value.wrapper({class:n.ui?.wrapper}))},[e.to?(b(),L(Qe,q({key:0,"aria-label":e.name},{to:e.to,target:e.target,...l.$attrs},{class:"focus:outline-none peer",raw:""}),{default:R(()=>[...o[0]||(o[0]=[U("span",{class:"absolute inset-0","aria-hidden":"true"},null,-1)])]),_:1},16,["aria-label"])):E("",!0),T(l.$slots,"default",{},()=>[e.name||t.name?(b(),_("p",{key:0,"data-slot":"name",class:M(r.value.name({class:n.ui?.name}))},[T(l.$slots,"name",{},()=>[K(Y(e.name),1)])],2)):E("",!0),e.description||t.description?(b(),_("p",{key:1,"data-slot":"description",class:M(r.value.description({class:n.ui?.description}))},[T(l.$slots,"description",{},()=>[K(Y(e.description),1)])],2)):E("",!0)])],2)]),_:3},8,["as","data-orientation","class","onClick"]))}}),Rr={slots:{root:"relative",container:"flex flex-col mx-auto max-w-2xl",header:"",meta:"flex items-center gap-3 mb-2",date:"text-sm/6 text-toned truncate",badge:"",title:"relative text-xl text-pretty font-semibold text-highlighted",description:"text-base text-pretty text-muted mt-1",imageWrapper:"relative overflow-hidden rounded-lg aspect-[16/9] mt-5 group/changelog-version-image",image:"object-cover object-top w-full h-full",authors:"flex flex-wrap gap-x-4 gap-y-1.5",footer:"border-t border-default pt-5 flex items-center justify-between",indicator:"absolute start-0 top-0 w-32 hidden lg:flex items-center justify-end gap-3 min-w-0",dot:"size-4 rounded-full bg-default ring ring-default flex items-center justify-center my-1",dotInner:"size-2 rounded-full bg-primary"},variants:{body:{false:{footer:"mt-5"}},badge:{false:{meta:"lg:hidden"}},to:{true:{title:["has-focus-visible:ring-2 has-focus-visible:ring-primary rounded-xs","transition"],image:"transform transition-transform duration-200 group-hover/changelog-version-image:scale-105 group-has-focus-visible/changelog-version-image:scale-105"}},hidden:{true:{date:"lg:hidden"}}}},Br=["datetime"],gt=Object.assign({inheritAttrs:!1},{__name:"UChangelogVersion",props:{as:{type:null,required:!1,default:"article"},title:{type:String,required:!1},description:{type:String,required:!1},date:{type:[String,Date],required:!1},badge:{type:[String,Object],required:!1},authors:{type:Array,required:!1},image:{type:[String,Object],required:!1},indicator:{type:Boolean,required:!1,default:!0},to:{type:null,required:!1},target:{type:[String,Object,null],required:!1},onClick:{type:Function,required:!1},class:{type:null,required:!1},ui:{type:null,required:!1}},setup(e){const n=e,t=Ge(),{locale:a}=An(),r=Pe(),l=Wa(a.value.code),[o,s]=mn(),[u,p]=mn({props:{hidden:{type:Boolean,default:!1}}}),i=A(()=>oe({extend:oe(Rr),...r.ui?.changelogVersion||{}})({to:!!n.to||!!n.onClick})),d=A(()=>{if(n.date)try{return l.custom(new Date(n.date),{dateStyle:"medium"})}catch{return n.date}}),y=A(()=>{if(n.date)try{return new Date(n.date)?.toISOString()}catch{return}}),v=A(()=>(t.title&&Xt(t.title())||n.title||"Version link").trim());return(f,m)=>(b(),_(Z,null,[z(S(o),null,{default:R(()=>[e.to?(b(),L(Qe,q({key:0,"aria-label":v.value},{to:e.to,target:e.target,...f.$attrs},{class:"focus:outline-none peer",raw:""}),{default:R(()=>[...m[0]||(m[0]=[U("span",{class:"absolute inset-0","aria-hidden":"true"},null,-1)])]),_:1},16,["aria-label"])):E("",!0)]),_:1}),z(S(u),null,{default:R(({hidden:h})=>[d.value?(b(),_("time",{key:0,datetime:y.value,"data-slot":"date",class:M(i.value.date({class:n.ui?.date,hidden:h}))},[T(f.$slots,"date",{},()=>[K(Y(d.value),1)])],10,Br)):E("",!0)]),_:3}),z(S(en),{as:e.as,"data-slot":"root",class:M(i.value.root({class:[n.ui?.root,n.class]})),onClick:e.onClick},{default:R(()=>[n.indicator||t.indicator?(b(),_("div",{key:0,"data-slot":"indicator",class:M(i.value.indicator({class:n.ui?.indicator}))},[T(f.$slots,"indicator",{ui:i.value},()=>[z(S(p)),U("div",{"data-slot":"dot",class:M(i.value.dot({class:n.ui?.dot}))},[U("div",{"data-slot":"dotInner",class:M(i.value.dotInner({class:n.ui?.dotInner}))},null,2)],2)])],2)):E("",!0),U("div",{"data-slot":"container",class:M(i.value.container({class:n.ui?.container}))},[t.header||d.value||t.date||e.badge||t.badge||e.title||t.title||e.description||t.description||e.image||t.image?(b(),_("div",{key:0,"data-slot":"header",class:M(i.value.header({class:n.ui?.header}))},[T(f.$slots,"header",{},()=>[d.value||t.date||e.badge||t.badge?(b(),_("div",{key:0,"data-slot":"meta",class:M(i.value.meta({class:n.ui?.meta,badge:!!e.badge||!!t.badge||!n.indicator}))},[T(f.$slots,"badge",{ui:i.value},()=>[e.badge?(b(),L(ta,q({key:0,color:"neutral",variant:"solid"},typeof e.badge=="string"?{label:e.badge}:e.badge,{"data-slot":"badge",class:i.value.badge({class:n.ui?.badge})}),null,16,["class"])):E("",!0)]),z(S(p),{hidden:!!n.indicator},null,8,["hidden"])],2)):E("",!0),e.title||t.title?(b(),_("h2",{key:1,"data-slot":"title",class:M(i.value.title({class:n.ui?.title}))},[z(S(s)),T(f.$slots,"title",{},()=>[K(Y(e.title),1)])],2)):E("",!0),e.description||t.description?(b(),_("div",{key:2,"data-slot":"description",class:M(i.value.description({class:n.ui?.description}))},[T(f.$slots,"description",{},()=>[K(Y(e.description),1)])],2)):E("",!0),e.image||t.image?(b(),_("div",{key:3,"data-slot":"imageWrapper",class:M(i.value.imageWrapper({class:n.ui?.imageWrapper}))},[T(f.$slots,"image",{ui:i.value},()=>[e.image?(b(),L(Yt(S(Zt)),q({key:0},typeof e.image=="string"?{src:e.image,alt:e.title}:{alt:e.title,...e.image},{"data-slot":"image",class:i.value.image({class:n.ui?.image,to:!!e.to})}),null,16,["class"])):E("",!0)]),z(S(s))],2)):E("",!0)])],2)):E("",!0),T(f.$slots,"body"),t.footer||e.authors?.length||t.authors||t.actions?(b(),_("div",{key:1,"data-slot":"footer",class:M(i.value.footer({class:n.ui?.footer,body:!!t.body}))},[T(f.$slots,"footer",{},()=>[e.authors?.length||t.authors?(b(),_("div",{key:0,"data-slot":"authors",class:M(i.value.authors({class:n.ui?.authors}))},[T(f.$slots,"authors",{},()=>[(b(!0),_(Z,null,te(e.authors,(h,g)=>(b(),L(Ar,q({key:g},{ref_for:!0},h),null,16))),128))])],2)):E("",!0),T(f.$slots,"actions")])],2)):E("",!0)],2)]),_:3},8,["as","class","onClick"])],64))}}),Ir=50,Cn=()=>({current:0,offset:[],progress:0,scrollLength:0,targetOffset:0,targetLength:0,containerLength:0,velocity:0}),jr=()=>({time:0,x:Cn(),y:Cn()}),qr={x:{length:"Width",position:"Left"},y:{length:"Height",position:"Top"}};function Sn(e,n,t,a){const r=t[n],{length:l,position:o}=qr[n],s=r.current,u=t.time;r.current=e[`scroll${o}`],r.scrollLength=e[`scroll${l}`]-e[`client${l}`],r.offset.length=0,r.offset[0]=0,r.offset[1]=r.scrollLength,r.progress=aa(0,r.scrollLength,r.current);const p=a-u;r.velocity=p>Ir?0:ra(r.current-s,p)}function zr(e,n,t){Sn(e,"x",n,t),Sn(e,"y",n,t),n.time=t}function Ur(e,n){const t={x:0,y:0};let a=e;for(;a&&a!==n;)if(la(a))t.x+=a.offsetLeft,t.y+=a.offsetTop,a=a.offsetParent;else if(a.tagName==="svg"){const r=a.getBoundingClientRect();a=a.parentElement;const l=a.getBoundingClientRect();t.x+=r.left-l.left,t.y+=r.top-l.top}else if(a instanceof SVGGraphicsElement){const{x:r,y:l}=a.getBBox();t.x+=r,t.y+=l;let o=null,s=a.parentNode;for(;!o;)s.tagName==="svg"&&(o=s),s=a.parentNode;a=o}else break;return t}const Ke={start:0,center:.5,end:1};function kn(e,n,t=0){let a=0;if(e in Ke&&(e=Ke[e]),typeof e=="string"){const r=parseFloat(e);e.endsWith("px")?a=r:e.endsWith("%")?e=r/100:e.endsWith("vw")?a=r/100*document.documentElement.clientWidth:e.endsWith("vh")?a=r/100*document.documentElement.clientHeight:e=r}return typeof e=="number"&&(a=n*e),t+a}const Fr=[0,0];function Vr(e,n,t,a){let r=Array.isArray(e)?e:Fr,l=0,o=0;return typeof e=="number"?r=[e,e]:typeof e=="string"&&(e=e.trim(),e.includes(" ")?r=e.split(" "):r=[e,Ke[e]?e:"0"]),l=kn(r[0],t,a),o=kn(r[1],n),l-o}const Hr={All:[[0,0],[1,1]]},Wr={x:0,y:0};function Nr(e){return"getBBox"in e&&e.tagName!=="svg"?e.getBBox():{width:e.clientWidth,height:e.clientHeight}}function Yr(e,n,t){const{offset:a=Hr.All}=t,{target:r=e,axis:l="y"}=t,o=l==="y"?"height":"width",s=r!==e?Ur(r,e):Wr,u=r===e?{width:e.scrollWidth,height:e.scrollHeight}:Nr(r),p={width:e.clientWidth,height:e.clientHeight};n[l].offset.length=0;let i=!n[l].interpolate;const d=a.length;for(let y=0;y<d;y++){const v=Vr(a[y],p[o],u[o],s[l]);!i&&v!==n[l].interpolatorOffsets[y]&&(i=!0),n[l].offset[y]=v}i&&(n[l].interpolate=qn(n[l].offset,oa(a),{clamp:!1}),n[l].interpolatorOffsets=[...n[l].offset]),n[l].progress=sa(0,1,n[l].interpolate(n[l].current))}function Zr(e,n=e,t){if(t.x.targetOffset=0,t.y.targetOffset=0,n!==e){let a=n;for(;a&&a!==e;)t.x.targetOffset+=a.offsetLeft,t.y.targetOffset+=a.offsetTop,a=a.offsetParent}t.x.targetLength=n===e?n.scrollWidth:n.clientWidth,t.y.targetLength=n===e?n.scrollHeight:n.clientHeight,t.x.containerLength=e.clientWidth,t.y.containerLength=e.clientHeight}function Xr(e,n,t,a={}){return{measure:r=>{Zr(e,a.target,t),zr(e,t,r),(a.offset||a.target)&&Yr(e,t,a)},notify:()=>n(t)}}const Ce=new WeakMap;let ee;const yt=(e,n,t)=>(a,r)=>r&&r[0]?r[0][e+"Size"]:ua(a)&&"getBBox"in a?a.getBBox()[n]:a[t],Kr=yt("inline","width","offsetWidth"),Jr=yt("block","height","offsetHeight");function Gr({target:e,borderBoxSize:n}){var t;(t=Ce.get(e))==null||t.forEach(a=>{a(e,{get width(){return Kr(e,n)},get height(){return Jr(e,n)}})})}function Qr(e){e.forEach(Gr)}function el(){typeof ResizeObserver>"u"||(ee=new ResizeObserver(Qr))}function nl(e,n){ee||el();const t=ia(e);return t.forEach(a=>{let r=Ce.get(a);r||(r=new Set,Ce.set(a,r)),r.add(n),ee?.observe(a)}),()=>{t.forEach(a=>{const r=Ce.get(a);r?.delete(n),r?.size||ee?.unobserve(a)})}}const Se=new Set;let ne;function tl(){ne=()=>{const e={get width(){return window.innerWidth},get height(){return window.innerHeight}};Se.forEach(n=>n(e))},window.addEventListener("resize",ne)}function al(e){return Se.add(e),ne||tl(),()=>{Se.delete(e),!Se.size&&typeof ne=="function"&&(window.removeEventListener("resize",ne),ne=void 0)}}function rl(e,n){return typeof e=="function"?al(e):nl(e,n)}const he=new WeakMap,Mn=new WeakMap,je=new WeakMap,Pn=e=>e===document.scrollingElement?window:e;function vt(e,{container:n=document.scrollingElement,...t}={}){if(!n)return zn;let a=je.get(n);a||(a=new Set,je.set(n,a));const r=jr(),l=Xr(n,e,r,t);if(a.add(l),!he.has(n)){const s=()=>{for(const d of a)d.measure(Un.timestamp);ae.preUpdate(u)},u=()=>{for(const d of a)d.notify()},p=()=>ae.read(s);he.set(n,p);const i=Pn(n);window.addEventListener("resize",p,{passive:!0}),n!==document.documentElement&&Mn.set(n,rl(n,p)),i.addEventListener("scroll",p,{passive:!0}),p()}const o=he.get(n);return ae.read(o,!1,!0),()=>{var s;nn(o);const u=je.get(n);if(!u||(u.delete(l),u.size))return;const p=he.get(n);he.delete(n),p&&(Pn(n).removeEventListener("scroll",p),(s=Mn.get(n))==null||s(),window.removeEventListener("resize",p))}}const _n=new Map;function ll(e){const n={value:0},t=vt(a=>{n.value=a[e.axis].progress*100},e);return{currentTime:n,cancel:t}}function bt({source:e,container:n,...t}){const{axis:a}=t;e&&(n=e);const r=_n.get(n)??new Map;_n.set(n,r);const l=t.target??"self",o=r.get(l)??{},s=a+(t.offset??[]).join(",");return o[s]||(o[s]=!t.target&&ca()?new ScrollTimeline({source:n,axis:a}):ll({container:n,...t})),o[s]}function xt(e,n){let t;const a=()=>{const{currentTime:r}=n,o=(r===null?0:r.value)/100;t!==o&&e(o),t=o};return ae.preUpdate(a,!0),()=>nn(a)}function ol(e,n){const t=bt(n);return e.attachTimeline({timeline:n.target?void 0:t,observe:a=>(a.pause(),xt(r=>{a.time=a.iterationDuration*r},t))})}function sl(e){return e.length===2}function il(e,n){return sl(e)?vt(t=>{e(t[n.axis].progress,t)},n):xt(e,bt(n))}function ul(e,{axis:n="y",container:t=document.scrollingElement,...a}={}){if(!t)return zn;const r={axis:n,container:t,...a};return typeof e=="function"?il(e,r):ol(e,r)}function qe(...e){const n=!Array.isArray(e[0]),t=n?0:-1,a=e[0+t],r=e[1+t],l=e[2+t],o=e[3+t],s=qn(r,l,o);return n?s(a):s}function wt(e){const n=X(e()),t=()=>n.set(e()),a=()=>ae.preRender(t,!1,!0);let r;const l=s=>{r=s.map(u=>u.on("change",a))},o=()=>{r.forEach(s=>s()),nn(t)};return Tn(()=>{o()}),{subscribe:l,unsubscribe:o,value:n,updateValue:t}}function cl(e){Q.current=[];const{value:n,subscribe:t,unsubscribe:a,updateValue:r}=wt(e);return t(Q.current),Q.current=void 0,In(()=>{a(),Q.current=[],r(),t(Q.current),Q.current=void 0}),n}function dl(e,n,t,a){if(typeof e=="function")return cl(e);let r,l;if(Ue(n)){const o=X(0);let s=qe(n.value,t,a);le(n,u=>{s=qe(u,t,a),o.set(o.get()+1)},{flush:"sync"}),l=u=>Array.isArray(u)?s(u[0]):s(u),r=Array.isArray(e)?[...e,o]:[e,o]}else l=qe(n,t,a),r=Array.isArray(e)?e:[e];return Array.isArray(e)?En(r,l):En(r,o=>l(o[0]))}function En(e,n){const t=[],a=()=>{t.length=0;const o=e.length;for(let s=0;s<o;s++)t[s]=e[s].get();return n(t)},{value:r,subscribe:l}=wt(a);return l(e),r}function On(e){return typeof e=="number"?e:parseFloat(e)}function fl(e,n={}){let t=null;const a=X(gn(e)?On(e.get()):e);let r=a.get(),l=()=>{};const o=()=>{t&&(t.stop(),t=null)},s=()=>{const u=t;u?.time===0&&u.sample(Un.delta),o();const p=Ue(n)?n.value:n;t=da({keyframes:[a.get(),r],velocity:a.getVelocity(),type:"spring",restDelta:.001,restSpeed:.01,...p,onUpdate:l})};return le(()=>Ue(n)?n.value:n,()=>{a.attach((u,p)=>(r=u,l=p,ae.update(s),a.get()),o)},{immediate:!0}),gn(e)&&e.on("change",u=>{a.set(On(u))}),a}const pl=typeof window>"u";function hl(){return{scrollX:X(0),scrollY:X(0),scrollXProgress:X(0),scrollYProgress:X(0)}}function ml(e={}){const n=hl();return In(t=>{if(pl)return;const a=ul((r,{x:l,y:o})=>{n.scrollX.set(l.current),n.scrollXProgress.set(l.progress),n.scrollY.set(o.current),n.scrollYProgress.set(o.progress)},{offset:S(e.offset),axis:S(e.axis),container:yn(e.container),target:yn(e.target)});t(()=>{a()})},{flush:"post"}),n}const gl={slots:{root:"relative",container:"flex flex-col gap-y-8 sm:gap-y-12 lg:gap-y-16",indicator:"absolute hidden lg:block overflow-hidden inset-y-3 start-32 h-full w-px bg-border -ms-[8.5px]",beam:"absolute start-0 top-0 w-full bg-primary will-change-[height]"}},yl={__name:"UChangelogVersions",props:{as:{type:null,required:!1},versions:{type:Array,required:!1},indicator:{type:[Boolean,Object],required:!1,default:!0},indicatorMotion:{type:[Boolean,Object],required:!1,default:!0},class:{type:null,required:!1},ui:{type:null,required:!1}},setup(e){const n=e,t=Ge(),a=()=>Gt(t,["default","indicator"]),r=Pe(),l=A(()=>Qt(typeof n.indicatorMotion=="object"?n.indicatorMotion:{},{damping:30,restDelta:.001})),o=A(()=>typeof n.indicator=="object"?n.indicator:{}),{scrollYProgress:s}=ml(o.value),u=fl(s,l),p=dl(()=>`${u.get()*100}%`),i=A(()=>oe({extend:oe(gl),...r.ui?.changelogVersions||{}})());return(d,y)=>(b(),L(S(en),{as:e.as,"data-slot":"root",class:M(i.value.root({class:[n.ui?.root,n.class]}))},{default:R(()=>[n.indicator||t.indicator?(b(),_("div",{key:0,"data-slot":"indicator",class:M(i.value.indicator({class:n.ui?.indicator}))},[T(d.$slots,"indicator",{},()=>[n.indicatorMotion?(b(),L(S(fa),{key:0,"data-slot":"beam",class:M(i.value.beam({class:n.ui?.beam})),style:Kt({height:S(p)})},null,8,["class","style"])):E("",!0)])],2)):E("",!0),e.versions?.length||t.default?(b(),_("div",{key:1,"data-slot":"container",class:M(i.value.container({class:n.ui?.container}))},[T(d.$slots,"default",{},()=>[(b(!0),_(Z,null,te(e.versions,(v,f)=>(b(),L(gt,q({key:f,indicator:!!n.indicator},{ref_for:!0},v),Jt({_:2},[te(a(),(m,h)=>({name:h,fn:R(g=>[T(d.$slots,h,q({ref_for:!0},g,{version:v}))])}))]),1040,["indicator"]))),128))])],2)):E("",!0)]),_:3},8,["as","class"]))}},vl=`---
date: 2026-02-25
---

## 🐣 [v0.1.0](https://charlot98.github.io/charts/)

### 新增
- highcharts数据统计，优化显示按入职时间排序、人员颜色差异
- Highchart数据统计demo库
`,bl=`---
date: 2026-05-31
---

## v0.1.2
### 新增
- 新增超声造影统计，数据更新至2026.05`,xl=`---
date: 2026-07-31
---

## 🚀  [v0.5.0](https://charlot98.github.io/charts/)
### 新增
- 新增实验功能[个人查询](https://charlot98.github.io/charts/pages/experiment/personal.html)查询

![](/2/2.png)

![](/2/3.jpg)

- 更新数据至2026.7.30
- 个人查询支持医生搜索，并按等级分行密集展示医生名单
- 新增CT、MRI、X线、超声的\`项目数\`统计，远程依据报告内容，自动纳入对应项目统计，所有的“非正式”报告不纳入统计
- 新增CT、MRI、X线、超声\`病例数堆叠图\`

### 优化
- 登录安全优化，登录方案改为接入第三方[Auth0](https://auth0.auth0.com/)
- 显示界面优化，优化全局字体显示
- 简化左侧栏显示，全局统一医生选择框
- 超声工作量、CT 项目与审核统计改为报告与审核堆叠显示
- 报告统计排除非正式“所见/结论”内容，并重新生成相关统计数据
- 统一入职时长的选择时长设定为入职1月、3月、6月、1年、2年、3年、全部

### 待办
- [ ] 剔除无用报告（可考虑手动剔除/报告所见字数＜10个字）
- [ ] 优化各统计图标题
- [ ] 简化排版
- [ ] 个人添加项目、报告内容关键词频率气泡图
- [ ] 删除之前无用的代码`,wl="---\ndate: 2026-02-25\n---\n\n## 🐣 心超助手更新\n\n### 新增\n- [x] 优化[心超助手界面](https://charlot98.github.io/echocardiography/echocardiography.html)\n- [x] 新增`EDV`、`ESV`、`FS`、`EF`自动计算，保留手动更改权限\n- [x] 新增`spherical法`计算EDV、ESV、EF，适用于心衰或心脏偏球形动物的计算\n- [x] 新增手动`刷新`按钮\n- [x] 新增`选择体重参考范围`功能\n- [x] 新增`提示`功能\n\n### 修复\n- 更正EDV、ESV、FS、EF显示错误\n",$l=`---
date: 2026-07-30
---

## v0.6.0

### 新增
- 新增\`左心高阶\`快速标记、结论自动生成
- 新增MMVD的\`MINE\`评分
- 新增\`右心高阶\`指标
- 新增猫的\`LAD max指标\`


### 优化
- 优化界面排布，删除
`,Dl=`---
date: 2026-02-25
---

## 知识库初始化

### 待办
- [ ] 添加基础心超扫查流程图
- [ ] 添加摆位流程图
- [ ] 添加心杂音音频
- [ ] 添加心电图识别

`,Cl=`---
date: 2026-02-22
---

## V0.1.1（测试）

### 更新日志
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


`,Sl=`---
date: 2026-02-23
---

## V0.1.2 功能区块

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



`,kl=`---
date: 2026-02-24
---

## V0.1.3

### 客制化

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



### 搭建

\`\`\`[npm]
cd /Users/charlot98/vetvault/changelog
npm run generate
cd .output && node ../scripts/preview-copy.cjs
\`\`\`
`,Ml=`---
date: 2026-07-31
---

## v0.1.4
### 优化
- 顶栏分区显示

::tabs
:::tabs-item{.my-5 icon="i-lucide-moon" label="深色"}
![](/4/1.png)
:::

:::tabs-item{.my-5 icon="i-lucide-sun" label="浅色"}
![dark](/4/2.png)
:::
::`,Pl=`---
date: 2026-02-25
---

## 文献查阅

### 更新
- [x] Paperpile文献库 Notes 内添加中文标题、中文关键词、中文标签，便于检索
`,_l=`---
date: 2026-02-25
---

## 语音助手初始化

### 规划
- 语音助手功能规划中
`,El={class:"sticky top-0 z-10 bg-default/80 backdrop-blur border-b border-default px-4 sm:px-6 xl:ms-30 xl:px-6"},Ol={class:"flex items-center gap-1 overflow-x-auto -mb-px"},Tl=["onClick"],Ll=["src","alt"],Al={key:1},Rl={class:"w-full text-left vv-mdc-body"},Bl={key:0,class:"text-center text-muted py-20"},Il=Rn({__name:"index",setup(e){const{app:n}=ea(),t=n.baseURL,a=[{key:"echo",label:"心超助手",icon:`${t}3/heart.png`},{key:"knowledge",label:"知识库",icon:`${t}VetVault-Logo.png`},{key:"voice",label:"语音助手",iconClass:"i-lucide-mic"},{key:"paper",label:"文献查阅",icon:`${t}3/paperpile4.png`},{key:"charts",label:"统计看板",icon:`${t}5/statistics.png`},{key:"nuxtjs",label:"nuxtjs",icon:`${t}4/nuxtjs-light.png`}],r=Je("echo"),l=Object.assign({"../../content/charts/1.md":vl,"../../content/charts/2.md":bl,"../../content/charts/3.md":xl,"../../content/echo/1.md":wl,"../../content/echo/2.md":$l,"../../content/knowledge/1.md":Dl,"../../content/nuxtjs/1.md":Cl,"../../content/nuxtjs/2.md":Sl,"../../content/nuxtjs/3.md":kl,"../../content/nuxtjs/4.md":Ml,"../../content/paper/1.md":Pl,"../../content/voice/1.md":_l});function o(f){const m=f.match(/^---\n([\s\S]*?)\n---\n?/);if(!m)return{meta:{},body:f};const h={},D=(m[1]||"").split(`
`);for(const $ of D){const x=$.indexOf(":");if(x===-1)continue;const C=$.slice(0,x).trim(),j=$.slice(x+1).trim();C&&(h[C]=j)}const P=f.slice(m[0].length).trim();return{meta:h,body:P}}function s(f){const m=f.replace(/^.*\/content\//,"").split("/");return m.length>1&&m[0]||"all"}function u(f){return f.replace(/!\[([^\]]*)\]\([^)]*\)/g,"$1").replace(/\[([^\]]+)\]\([^)]*\)/g,"$1").replace(/<[^>]+>/g,"").replace(/[`*_~]/g,"").replace(/&amp;/g,"&").replace(/&lt;/g,"<").replace(/&gt;/g,">").replace(/&quot;/g,'"').replace(/&#39;/g,"'")}function p(f){const m=[],h=/\[([^\]]+)\]\(\s*(?:<([^>]+)>|([^\s)]+))(?:\s+["'][^"']*["'])?\s*\)/g;let g=0;for(const P of f.matchAll(h)){const $=P.index,x=u(f.slice(g,$)),C=u(P[1]||""),j=P[2]||P[3];x&&m.push({text:x}),C.trim()&&j&&m.push({text:C,href:j}),g=$+P[0].length}const D=u(f.slice(g));return D&&m.push({text:D}),m}function i(f,m){const h=f.match(/^ {0,3}##(?!#)[\t ]+(.+?)[\t ]*\r?$/m);if(!h||h.index===void 0)return{title:m,titleParts:[{text:m}],body:f};const g=(h[1]||"").replace(/[\t ]+#+[\t ]*$/,"").trim(),D=p(g),P=D.map(C=>C.text).join("").trim()||m,$=h.index+h[0].length,x=f.slice($).match(/^\r?\n/)?.[0].length||0;return{title:P,titleParts:D.length?D:[{text:m}],body:`${f.slice(0,h.index)}${f.slice($+x)}`.trim()}}const d=A(()=>Object.entries(l).map(([m,h])=>{const{meta:g,body:D}=o(h),P=m.split("/").pop()?.replace(/\.md$/,"")||"untitled",$=P.match(/^\d{4}-\d{2}-\d{2}/)?.[0],x=i(D,P);return{id:m,title:x.title,titleParts:x.titleParts,date:g.date||$||"1970-01-01",markdown:x.body,category:s(m)}}).sort((m,h)=>h.date.localeCompare(m.date))),y=A(()=>d.value.filter(f=>f.category===r.value));function v(f){r.value!==f&&(r.value=f,window.scrollTo({top:0,behavior:"auto"}))}return(f,m)=>{const h=ze,g=nr,D=Qe,P=Tr,$=gt,x=yl;return b(),_("div",null,[U("nav",El,[U("div",Ol,[(b(),_(Z,null,te(a,C=>U("button",{key:C.key,class:M(["shrink-0 px-3 py-3 text-sm transition-colors border-b border-default inline-flex items-center gap-1.5",S(r)===C.key?"border-primary text-highlighted font-medium":"text-muted hover:text-highlighted"]),onClick:j=>v(C.key)},[C.icon?(b(),_("img",{key:0,src:C.icon,alt:C.label,class:"size-4 object-contain"},null,8,Ll)):C.iconClass?(b(),L(h,{key:1,name:C.iconClass,class:"size-4"},null,8,["name"])):E("",!0),K(" "+Y(C.label),1)],10,Tl)),64)),z(g,{size:"xs",class:"shrink-0 ml-auto"})])]),(b(),L(x,{key:S(r),as:"main","indicator-motion":!1,ui:{root:"py-8 sm:py-12 lg:py-16",indicator:"inset-y-0"}},{default:R(()=>[(b(!0),_(Z,null,te(S(y),C=>(b(),L($,q({key:C.id},{ref_for:!0},{title:C.title,date:C.date},{ui:{root:"flex items-start justify-start",container:"w-full max-w-2xl !ml-0 !mr-auto text-left pl-18 sm:pl-20",header:"border-b border-default pb-4 text-left",title:"text-3xl",date:"text-xs/9 text-highlighted font-mono text-left",indicator:"sticky top-12 pt-8 -mt-8 sm:pt-12 sm:-mt-12 lg:pt-16 lg:-mt-16"}}),{title:R(()=>[(b(!0),_(Z,null,te(C.titleParts,(j,ve)=>(b(),_(Z,{key:`${C.id}-title-${ve}`},[j.href?(b(),L(D,{key:0,to:j.href,class:"text-primary hover:underline"},{default:R(()=>[K(Y(j.text),1)]),_:2},1032,["to"])):(b(),_("span",Al,Y(j.text),1))],64))),128))]),body:R(()=>[U("div",Rl,[C.markdown?(b(),L(P,{key:0,value:C.markdown,"cache-key":C.id},null,8,["value","cache-key"])):E("",!0)])]),_:2},1040))),128)),S(y).length===0?(b(),_("div",Bl," 暂无更新记录 ")):E("",!0)]),_:1}))])}}}),Hl=Object.freeze(Object.defineProperty({__proto__:null,default:Il},Symbol.toStringTag,{value:"Module"}));export{dr as a,sr as f,cr as h,Hl as i,We as n,Vl as s};
