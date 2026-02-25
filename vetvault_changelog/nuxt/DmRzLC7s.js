const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["./TJQClhO4.js","./DfJW92iF.js","./entry.CNp6uKP3.css","./iik6CYzq.js"])))=>i.map(i=>d[i]);
import{r as Pn,f as xt,g as wt,h as $t,i as En,j as Dt,k as Q,l as Ct,m as T,n as St,p as On,q as Mt,s as on,v as kt,x as Pt,y as C,z as Et,A as sn,B as Tn,C as un,D as Ot,E as Tt,F as Lt,G as Ln,H as At,T as $e,I as Rt,J as _t,K as Bt,L as It,M as E,o as x,N as L,O as S,P as M,Q as jt,R as Ye,S as Ze,w as _,U as zt,V as B,b as V,W as cn,a as q,X as An,c as O,d as ue,t as ce,Y as Xe,Z as ee,$ as Ut,a0 as Ht,a1 as Ft,a2 as De,a3 as Ce,a4 as Vt,a5 as Rn,a6 as Ie,a7 as qt,a8 as Wt,a9 as Nt,aa as Yt}from"./DfJW92iF.js";import{f as _n,n as Zt}from"./iik6CYzq.js";import{c as dn}from"./Dc0Jtck8.js";import{_ as Xt}from"./Bz0-Hxq6.js";import{p as Kt,v as Jt,i as Gt,a as Bn,d as Qt,c as ea,r as na,b as ta,n as In,f as J,e as Ke,g as jn,s as aa,m as W,h as Z,j as fn,k as ra,l as hn,M as la}from"./BY5BiFod.js";function Ee(e,n){return e-n*Math.floor(e/n)}const zn=1721426;function ge(e,n,t,a){n=Je(e,n);let r=n-1,l=-2;return t<=2?l=0:be(n)&&(l=-1),zn-1+365*r+Math.floor(r/4)-Math.floor(r/100)+Math.floor(r/400)+Math.floor((367*t-362)/12+l+a)}function be(e){return e%4===0&&(e%100!==0||e%400===0)}function Je(e,n){return e==="BC"?1-n:n}function oa(e){let n="AD";return e<=0&&(n="BC",e=1-e),[n,e]}const ia={standard:[31,28,31,30,31,30,31,31,30,31,30,31],leapyear:[31,29,31,30,31,30,31,31,30,31,30,31]};class ne{fromJulianDay(n){let t=n,a=t-zn,r=Math.floor(a/146097),l=Ee(a,146097),o=Math.floor(l/36524),i=Ee(l,36524),u=Math.floor(i/1461),d=Ee(i,1461),s=Math.floor(d/365),f=r*400+o*100+u*4+s+(o!==4&&s!==4?1:0),[p,g]=oa(f),h=t-ge(p,g,1,1),b=2;t<ge(p,g,3,1)?b=0:be(g)&&(b=1);let m=Math.floor(((h+b)*12+373)/367),y=t-ge(p,g,m,1)+1;return new de(p,g,m,y)}toJulianDay(n){return ge(n.era,n.year,n.month,n.day)}getDaysInMonth(n){return ia[be(n.year)?"leapyear":"standard"][n.month-1]}getMonthsInYear(n){return 12}getDaysInYear(n){return be(n.year)?366:365}getMaximumMonthsInYear(){return 12}getMaximumDaysInMonth(){return 31}getYearsInEra(n){return 9999}getEras(){return["BC","AD"]}isInverseEra(n){return n.era==="BC"}balanceDate(n){n.year<=0&&(n.era=n.era==="BC"?"AD":"BC",n.year=1-n.year)}constructor(){this.identifier="gregory"}}function sa(e,n){var t,a,r,l;return(l=(r=(t=e.isEqual)===null||t===void 0?void 0:t.call(e,n))!==null&&r!==void 0?r:(a=n.isEqual)===null||a===void 0?void 0:a.call(n,e))!==null&&l!==void 0?l:e.identifier===n.identifier}function ua(e){return U(Date.now(),e)}function ca(e){return pa(ua(e))}function Un(e,n){return e.calendar.toJulianDay(e)-n.calendar.toJulianDay(n)}function da(e,n){return pn(e)-pn(n)}function pn(e){return e.hour*36e5+e.minute*6e4+e.second*1e3+e.millisecond}let Oe=null;function Me(){return Oe==null&&(Oe=new Intl.DateTimeFormat().resolvedOptions().timeZone),Oe}function te(e){e=I(e,new ne);let n=Je(e.era,e.year);return Hn(n,e.month,e.day,e.hour,e.minute,e.second,e.millisecond)}function Hn(e,n,t,a,r,l,o){let i=new Date;return i.setUTCHours(a,r,l,o),i.setUTCFullYear(e,n-1,t),i.getTime()}function je(e,n){if(n==="UTC")return 0;if(e>0&&n===Me())return new Date(e).getTimezoneOffset()*-6e4;let{year:t,month:a,day:r,hour:l,minute:o,second:i}=Fn(e,n);return Hn(t,a,r,l,o,i,0)-Math.floor(e/1e3)*1e3}const mn=new Map;function Fn(e,n){let t=mn.get(n);t||(t=new Intl.DateTimeFormat("en-US",{timeZone:n,hour12:!1,era:"short",year:"numeric",month:"numeric",day:"numeric",hour:"numeric",minute:"numeric",second:"numeric"}),mn.set(n,t));let a=t.formatToParts(new Date(e)),r={};for(let l of a)l.type!=="literal"&&(r[l.type]=l.value);return{year:r.era==="BC"||r.era==="B"?-r.year+1:+r.year,month:+r.month,day:+r.day,hour:r.hour==="24"?0:+r.hour,minute:+r.minute,second:+r.second}}const gn=864e5;function fa(e,n,t,a){return(t===a?[t]:[t,a]).filter(l=>ha(e,n,l))}function ha(e,n,t){let a=Fn(t,n);return e.year===a.year&&e.month===a.month&&e.day===a.day&&e.hour===a.hour&&e.minute===a.minute&&e.second===a.second}function z(e,n,t="compatible"){let a=ae(e);if(n==="UTC")return te(a);if(n===Me()&&t==="compatible"){a=I(a,new ne);let u=new Date,d=Je(a.era,a.year);return u.setFullYear(d,a.month-1,a.day),u.setHours(a.hour,a.minute,a.second,a.millisecond),u.getTime()}let r=te(a),l=je(r-gn,n),o=je(r+gn,n),i=fa(a,n,r-l,r-o);if(i.length===1)return i[0];if(i.length>1)switch(t){case"compatible":case"earlier":return i[0];case"later":return i[i.length-1];case"reject":throw new RangeError("Multiple possible absolute times found")}switch(t){case"earlier":return Math.min(r-l,r-o);case"compatible":case"later":return Math.max(r-l,r-o);case"reject":throw new RangeError("No such absolute time found")}}function Vn(e,n,t="compatible"){return new Date(z(e,n,t))}function U(e,n){let t=je(e,n),a=new Date(e+t),r=a.getUTCFullYear(),l=a.getUTCMonth()+1,o=a.getUTCDate(),i=a.getUTCHours(),u=a.getUTCMinutes(),d=a.getUTCSeconds(),s=a.getUTCMilliseconds();return new re(r<1?"BC":"AD",r<1?-r+1:r,l,o,n,t,i,u,d,s)}function pa(e){return new de(e.calendar,e.era,e.year,e.month,e.day)}function ae(e,n){let t=0,a=0,r=0,l=0;if("timeZone"in e)({hour:t,minute:a,second:r,millisecond:l}=e);else if("hour"in e&&!n)return e;return n&&({hour:t,minute:a,second:r,millisecond:l}=n),new fe(e.calendar,e.era,e.year,e.month,e.day,t,a,r,l)}function I(e,n){if(sa(e.calendar,n))return e;let t=n.fromJulianDay(e.calendar.toJulianDay(e)),a=e.copy();return a.calendar=n,a.era=t.era,a.year=t.year,a.month=t.month,a.day=t.day,N(a),a}function ma(e,n,t){if(e instanceof re)return e.timeZone===n?e:ya(e,n);let a=z(e,n,t);return U(a,n)}function ga(e){let n=te(e)-e.offset;return new Date(n)}function ya(e,n){let t=te(e)-e.offset;return I(U(t,n),e.calendar)}const oe=36e5;function ke(e,n){let t=e.copy(),a="hour"in t?wa(t,n):0;ze(t,n.years||0),t.calendar.balanceYearMonth&&t.calendar.balanceYearMonth(t,e),t.month+=n.months||0,Ue(t),qn(t),t.day+=(n.weeks||0)*7,t.day+=n.days||0,t.day+=a,va(t),t.calendar.balanceDate&&t.calendar.balanceDate(t),t.year<1&&(t.year=1,t.month=1,t.day=1);let r=t.calendar.getYearsInEra(t);if(t.year>r){var l,o;let u=(l=(o=t.calendar).isInverseEra)===null||l===void 0?void 0:l.call(o,t);t.year=r,t.month=u?1:t.calendar.getMonthsInYear(t),t.day=u?1:t.calendar.getDaysInMonth(t)}t.month<1&&(t.month=1,t.day=1);let i=t.calendar.getMonthsInYear(t);return t.month>i&&(t.month=i,t.day=t.calendar.getDaysInMonth(t)),t.day=Math.max(1,Math.min(t.calendar.getDaysInMonth(t),t.day)),t}function ze(e,n){var t,a;!((t=(a=e.calendar).isInverseEra)===null||t===void 0)&&t.call(a,e)&&(n=-n),e.year+=n}function Ue(e){for(;e.month<1;)ze(e,-1),e.month+=e.calendar.getMonthsInYear(e);let n=0;for(;e.month>(n=e.calendar.getMonthsInYear(e));)e.month-=n,ze(e,1)}function va(e){for(;e.day<1;)e.month--,Ue(e),e.day+=e.calendar.getDaysInMonth(e);for(;e.day>e.calendar.getDaysInMonth(e);)e.day-=e.calendar.getDaysInMonth(e),e.month++,Ue(e)}function qn(e){e.month=Math.max(1,Math.min(e.calendar.getMonthsInYear(e),e.month)),e.day=Math.max(1,Math.min(e.calendar.getDaysInMonth(e),e.day))}function N(e){e.calendar.constrainDate&&e.calendar.constrainDate(e),e.year=Math.max(1,Math.min(e.calendar.getYearsInEra(e),e.year)),qn(e)}function Wn(e){let n={};for(let t in e)typeof e[t]=="number"&&(n[t]=-e[t]);return n}function Nn(e,n){return ke(e,Wn(n))}function Ge(e,n){let t=e.copy();return n.era!=null&&(t.era=n.era),n.year!=null&&(t.year=n.year),n.month!=null&&(t.month=n.month),n.day!=null&&(t.day=n.day),N(t),t}function Se(e,n){let t=e.copy();return n.hour!=null&&(t.hour=n.hour),n.minute!=null&&(t.minute=n.minute),n.second!=null&&(t.second=n.second),n.millisecond!=null&&(t.millisecond=n.millisecond),xa(t),t}function ba(e){e.second+=Math.floor(e.millisecond/1e3),e.millisecond=ye(e.millisecond,1e3),e.minute+=Math.floor(e.second/60),e.second=ye(e.second,60),e.hour+=Math.floor(e.minute/60),e.minute=ye(e.minute,60);let n=Math.floor(e.hour/24);return e.hour=ye(e.hour,24),n}function xa(e){e.millisecond=Math.max(0,Math.min(e.millisecond,1e3)),e.second=Math.max(0,Math.min(e.second,59)),e.minute=Math.max(0,Math.min(e.minute,59)),e.hour=Math.max(0,Math.min(e.hour,23))}function ye(e,n){let t=e%n;return t<0&&(t+=n),t}function wa(e,n){return e.hour+=n.hours||0,e.minute+=n.minutes||0,e.second+=n.seconds||0,e.millisecond+=n.milliseconds||0,ba(e)}function Qe(e,n,t,a){let r=e.copy();switch(n){case"era":{let i=e.calendar.getEras(),u=i.indexOf(e.era);if(u<0)throw new Error("Invalid era: "+e.era);u=H(u,t,0,i.length-1,a?.round),r.era=i[u],N(r);break}case"year":var l,o;!((l=(o=r.calendar).isInverseEra)===null||l===void 0)&&l.call(o,r)&&(t=-t),r.year=H(e.year,t,-1/0,9999,a?.round),r.year===-1/0&&(r.year=1),r.calendar.balanceYearMonth&&r.calendar.balanceYearMonth(r,e);break;case"month":r.month=H(e.month,t,1,e.calendar.getMonthsInYear(e),a?.round);break;case"day":r.day=H(e.day,t,1,e.calendar.getDaysInMonth(e),a?.round);break;default:throw new Error("Unsupported field "+n)}return e.calendar.balanceDate&&e.calendar.balanceDate(r),N(r),r}function Yn(e,n,t,a){let r=e.copy();switch(n){case"hour":{let l=e.hour,o=0,i=23;if(a?.hourCycle===12){let u=l>=12;o=u?12:0,i=u?23:11}r.hour=H(l,t,o,i,a?.round);break}case"minute":r.minute=H(e.minute,t,0,59,a?.round);break;case"second":r.second=H(e.second,t,0,59,a?.round);break;case"millisecond":r.millisecond=H(e.millisecond,t,0,999,a?.round);break;default:throw new Error("Unsupported field "+n)}return r}function H(e,n,t,a,r=!1){if(r){e+=Math.sign(n),e<t&&(e=a);let l=Math.abs(n);n>0?e=Math.ceil(e/l)*l:e=Math.floor(e/l)*l,e>a&&(e=t)}else e+=n,e<t?e=a-(t-e-1):e>a&&(e=t+(e-a-1));return e}function Zn(e,n){let t;if(n.years!=null&&n.years!==0||n.months!=null&&n.months!==0||n.weeks!=null&&n.weeks!==0||n.days!=null&&n.days!==0){let r=ke(ae(e),{years:n.years,months:n.months,weeks:n.weeks,days:n.days});t=z(r,e.timeZone)}else t=te(e)-e.offset;t+=n.milliseconds||0,t+=(n.seconds||0)*1e3,t+=(n.minutes||0)*6e4,t+=(n.hours||0)*36e5;let a=U(t,e.timeZone);return I(a,e.calendar)}function $a(e,n){return Zn(e,Wn(n))}function Da(e,n,t,a){switch(n){case"hour":{let r=0,l=23;if(a?.hourCycle===12){let h=e.hour>=12;r=h?12:0,l=h?23:11}let o=ae(e),i=I(Se(o,{hour:r}),new ne),u=[z(i,e.timeZone,"earlier"),z(i,e.timeZone,"later")].filter(h=>U(h,e.timeZone).day===i.day)[0],d=I(Se(o,{hour:l}),new ne),s=[z(d,e.timeZone,"earlier"),z(d,e.timeZone,"later")].filter(h=>U(h,e.timeZone).day===d.day).pop(),f=te(e)-e.offset,p=Math.floor(f/oe),g=f%oe;return f=H(p,t,Math.floor(u/oe),Math.floor(s/oe),a?.round)*oe+g,I(U(f,e.timeZone),e.calendar)}case"minute":case"second":case"millisecond":return Yn(e,n,t,a);case"era":case"year":case"month":case"day":{let r=Qe(ae(e),n,t,a),l=z(r,e.timeZone);return I(U(l,e.timeZone),e.calendar)}default:throw new Error("Unsupported field "+n)}}function Ca(e,n,t){let a=ae(e),r=Se(Ge(a,n),n);if(r.compare(a)===0)return e;let l=z(r,e.timeZone,t);return I(U(l,e.timeZone),e.calendar)}function Sa(e){return`${String(e.hour).padStart(2,"0")}:${String(e.minute).padStart(2,"0")}:${String(e.second).padStart(2,"0")}${e.millisecond?String(e.millisecond/1e3).slice(1):""}`}function Xn(e){let n=I(e,new ne),t;return n.era==="BC"?t=n.year===1?"0000":"-"+String(Math.abs(1-n.year)).padStart(6,"00"):t=String(n.year).padStart(4,"0"),`${t}-${String(n.month).padStart(2,"0")}-${String(n.day).padStart(2,"0")}`}function Kn(e){return`${Xn(e)}T${Sa(e)}`}function Ma(e){let n=Math.sign(e)<0?"-":"+";e=Math.abs(e);let t=Math.floor(e/36e5),a=Math.floor(e%36e5/6e4),r=Math.floor(e%36e5%6e4/1e3),l=`${n}${String(t).padStart(2,"0")}:${String(a).padStart(2,"0")}`;return r!==0&&(l+=`:${String(r).padStart(2,"0")}`),l}function ka(e){return`${Kn(e)}${Ma(e.offset)}[${e.timeZone}]`}function Pa(e,n){if(n.has(e))throw new TypeError("Cannot initialize the same private elements twice on an object")}function en(e,n,t){Pa(e,n),n.set(e,t)}function nn(e){let n=typeof e[0]=="object"?e.shift():new ne,t;if(typeof e[0]=="string")t=e.shift();else{let o=n.getEras();t=o[o.length-1]}let a=e.shift(),r=e.shift(),l=e.shift();return[n,t,a,r,l]}var Ea=new WeakMap;class de{copy(){return this.era?new de(this.calendar,this.era,this.year,this.month,this.day):new de(this.calendar,this.year,this.month,this.day)}add(n){return ke(this,n)}subtract(n){return Nn(this,n)}set(n){return Ge(this,n)}cycle(n,t,a){return Qe(this,n,t,a)}toDate(n){return Vn(this,n)}toString(){return Xn(this)}compare(n){return Un(this,n)}constructor(...n){en(this,Ea,{writable:!0,value:void 0});let[t,a,r,l,o]=nn(n);this.calendar=t,this.era=a,this.year=r,this.month=l,this.day=o,N(this)}}var Oa=new WeakMap;class fe{copy(){return this.era?new fe(this.calendar,this.era,this.year,this.month,this.day,this.hour,this.minute,this.second,this.millisecond):new fe(this.calendar,this.year,this.month,this.day,this.hour,this.minute,this.second,this.millisecond)}add(n){return ke(this,n)}subtract(n){return Nn(this,n)}set(n){return Ge(Se(this,n),n)}cycle(n,t,a){switch(n){case"era":case"year":case"month":case"day":return Qe(this,n,t,a);default:return Yn(this,n,t,a)}}toDate(n,t){return Vn(this,n,t)}toString(){return Kn(this)}compare(n){let t=Un(this,n);return t===0?da(this,ae(n)):t}constructor(...n){en(this,Oa,{writable:!0,value:void 0});let[t,a,r,l,o]=nn(n);this.calendar=t,this.era=a,this.year=r,this.month=l,this.day=o,this.hour=n.shift()||0,this.minute=n.shift()||0,this.second=n.shift()||0,this.millisecond=n.shift()||0,N(this)}}var Ta=new WeakMap;class re{copy(){return this.era?new re(this.calendar,this.era,this.year,this.month,this.day,this.timeZone,this.offset,this.hour,this.minute,this.second,this.millisecond):new re(this.calendar,this.year,this.month,this.day,this.timeZone,this.offset,this.hour,this.minute,this.second,this.millisecond)}add(n){return Zn(this,n)}subtract(n){return $a(this,n)}set(n,t){return Ca(this,n,t)}cycle(n,t,a){return Da(this,n,t,a)}toDate(){return ga(this)}toString(){return ka(this)}toAbsoluteString(){return this.toDate().toISOString()}compare(n){return this.toDate().getTime()-ma(n,this.timeZone).toDate().getTime()}constructor(...n){en(this,Ta,{writable:!0,value:void 0});let[t,a,r,l,o]=nn(n),i=n.shift(),u=n.shift();this.calendar=t,this.era=a,this.year=r,this.month=l,this.day=o,this.timeZone=i,this.offset=u,this.hour=n.shift()||0,this.minute=n.shift()||0,this.second=n.shift()||0,this.millisecond=n.shift()||0,N(this)}}let Te=new Map;class F{format(n){return this.formatter.format(n)}formatToParts(n){return this.formatter.formatToParts(n)}formatRange(n,t){if(typeof this.formatter.formatRange=="function")return this.formatter.formatRange(n,t);if(t<n)throw new RangeError("End date must be >= start date");return`${this.formatter.format(n)} – ${this.formatter.format(t)}`}formatRangeToParts(n,t){if(typeof this.formatter.formatRangeToParts=="function")return this.formatter.formatRangeToParts(n,t);if(t<n)throw new RangeError("End date must be >= start date");let a=this.formatter.formatToParts(n),r=this.formatter.formatToParts(t);return[...a.map(l=>({...l,source:"startRange"})),{type:"literal",value:" – ",source:"shared"},...r.map(l=>({...l,source:"endRange"}))]}resolvedOptions(){let n=this.formatter.resolvedOptions();return Ra()&&(this.resolvedHourCycle||(this.resolvedHourCycle=_a(n.locale,this.options)),n.hourCycle=this.resolvedHourCycle,n.hour12=this.resolvedHourCycle==="h11"||this.resolvedHourCycle==="h12"),n.calendar==="ethiopic-amete-alem"&&(n.calendar="ethioaa"),n}constructor(n,t={}){this.formatter=Jn(n,t),this.options=t}}const La={true:{ja:"h11"},false:{}};function Jn(e,n={}){if(typeof n.hour12=="boolean"&&Aa()){n={...n};let r=La[String(n.hour12)][e.split("-")[0]],l=n.hour12?"h12":"h23";n.hourCycle=r??l,delete n.hour12}let t=e+(n?Object.entries(n).sort((r,l)=>r[0]<l[0]?-1:1).join():"");if(Te.has(t))return Te.get(t);let a=new Intl.DateTimeFormat(e,n);return Te.set(t,a),a}let Le=null;function Aa(){return Le==null&&(Le=new Intl.DateTimeFormat("en-US",{hour:"numeric",hour12:!1}).format(new Date(2020,2,3,0))==="24"),Le}let Ae=null;function Ra(){return Ae==null&&(Ae=new Intl.DateTimeFormat("fr",{hour:"numeric",hour12:!1}).resolvedOptions().hourCycle==="h12"),Ae}function _a(e,n){if(!n.timeStyle&&!n.hour)return;e=e.replace(/(-u-)?-nu-[a-zA-Z0-9]+/,""),e+=(e.includes("-u-")?"":"-u")+"-nu-latn";let t=Jn(e,{...n,timeZone:void 0}),a=parseInt(t.formatToParts(new Date(2020,2,3,0)).find(l=>l.type==="hour").value,10),r=parseInt(t.formatToParts(new Date(2020,2,3,23)).find(l=>l.type==="hour").value,10);if(a===0&&r===23)return"h23";if(a===24&&r===23)return"h24";if(a===0&&r===11)return"h11";if(a===12&&r===11)return"h12";throw new Error("Unexpected hour cycle result")}function ie(e,n=Me()){return tn(e)?e.toDate():e.toDate(n)}function Ba(e){return e instanceof fe}function tn(e){return e instanceof re}function Ia(e){return Ba(e)||tn(e)}function ja(e,n={}){const t=Pn(e);function a(){return t.value}function r(m){t.value=m}function l(m,y){return new F(t.value,{...n,...y}).format(m)}function o(m,y=!0){return Ia(m)&&y?l(ie(m),{dateStyle:"long",timeStyle:"long"}):l(ie(m),{dateStyle:"long"})}function i(m,y={}){return new F(t.value,{...n,month:"long",year:"numeric",...y}).format(m)}function u(m,y={}){return new F(t.value,{...n,month:"long",...y}).format(m)}function d(){const m=ca(Me());return[1,2,3,4,5,6,7,8,9,10,11,12].map(k=>({label:u(ie(m.set({month:k}))),value:k}))}function s(m,y={}){return new F(t.value,{...n,year:"numeric",...y}).format(m)}function f(m,y){return tn(m)?new F(t.value,{...n,...y,timeZone:m.timeZone}).formatToParts(ie(m)):new F(t.value,{...n,...y}).formatToParts(ie(m))}function p(m,y="narrow"){return new F(t.value,{...n,weekday:y}).format(m)}function g(m){const k=new F(t.value,{...n,hour:"numeric",minute:"numeric"}).formatToParts(m).find(j=>j.type==="dayPeriod")?.value;return k==="PM"||k==="p.m."?"PM":"AM"}const h={year:"numeric",month:"numeric",day:"numeric",hour:"numeric",minute:"numeric",second:"numeric"};function b(m,y,k={}){const j={...h,...k},w=f(m,j).find(pe=>pe.type===y);return w?w.value:""}return{setLocale:r,getLocale:a,fullMonth:u,fullYear:s,fullMonthAndYear:i,toParts:f,custom:l,part:b,dayPeriod:g,selectedDate:o,dayOfWeek:p,getMonths:d}}const za={trailing:!0};function Ua(e,n=25,t={}){if(t={...za,...t},!Number.isFinite(n))throw new TypeError("Expected `wait` to be a finite number");let a,r,l=[],o,i;const u=(f,p)=>(o=Ha(e,f,p),o.finally(()=>{if(o=null,t.trailing&&i&&!r){const g=u(f,i);return i=null,g}}),o),d=function(...f){return t.trailing&&(i=f),o||new Promise(p=>{const g=!r&&t.leading;clearTimeout(r),r=setTimeout(()=>{r=null;const h=t.leading?a:u(this,f);i=null;for(const b of l)b(h);l=[]},n),g?(a=u(this,f),p(a)):l.push(p)})},s=f=>{f&&(clearTimeout(f),r=null)};return d.isPending=()=>!!r,d.cancel=()=>{s(r),l=[],i=null},d.flush=()=>{if(s(r),!i||o)return;const f=i;return i=null,u(this,f)},d}async function Ha(e,n,t){return await e.apply(n,t)}const Fa=Symbol.for("nuxt:client-only");function Va(...e){const n=typeof e[e.length-1]=="string"?e.pop():void 0;qa(e[0],e[1])&&e.unshift(n);let[t,a,r={}]=e,l=!1;const o=T(()=>St(t));if(typeof o.value!="string")throw new TypeError("[nuxt] [useAsyncData] key must be a string.");if(typeof a!="function")throw new TypeError("[nuxt] [useAsyncData] handler must be a function.");const i=xt();r.server??=!0,r.default??=Na,r.getCachedData??=Qn,r.lazy??=!1,r.immediate??=!0,r.deep??=wt.deep,r.dedupe??="cancel",r._functionName,i._asyncData[o.value];function u(){const h={cause:"initial",dedupe:r.dedupe};return i._asyncData[o.value]?._init||(h.cachedData=r.getCachedData(o.value,i,{cause:"initial"}),i._asyncData[o.value]=yn(i,o.value,a,r,h.cachedData)),()=>i._asyncData[o.value].execute(h)}const d=u(),s=i._asyncData[o.value];s._deps++;const f=r.server!==!1&&i.payload.serverRendered;{let h=function(D){const w=i._asyncData[D];w?._deps&&(w._deps--,w._deps===0&&w?._off())};const b=On();if(b&&f&&r.immediate&&!b.sp&&(b.sp=[]),b&&!b._nuxtOnBeforeMountCbs){b._nuxtOnBeforeMountCbs=[];const D=b._nuxtOnBeforeMountCbs;$t(()=>{D.forEach(w=>{w()}),D.splice(0,D.length)}),En(()=>D.splice(0,D.length))}const m=b&&(b._nuxtClientOnly||Dt(Fa,!1));f&&i.isHydrating&&(s.error.value||s.data.value!==void 0)?s.status.value=s.error.value?"error":"success":b&&(!m&&i.payload.serverRendered&&i.isHydrating||r.lazy)&&r.immediate?b._nuxtOnBeforeMountCbs.push(d):r.immediate&&s.status.value!=="success"&&d();const y=Mt(),k=Q(o,(D,w)=>{if((D||w)&&D!==w){l=!0;const pe=i._asyncData[w]?.data.value!==void 0,bt=i._asyncDataPromises[w]!==void 0,ln={cause:"initial",dedupe:r.dedupe};if(!i._asyncData[D]?._init){let me;w&&pe?me=i._asyncData[w].data.value:(me=r.getCachedData(D,i,{cause:"initial"}),ln.cachedData=me),i._asyncData[D]=yn(i,D,a,r,me)}i._asyncData[D]._deps++,w&&h(w),(r.immediate||pe||bt)&&i._asyncData[D].execute(ln),sn(()=>{l=!1})}},{flush:"sync"}),j=r.watch?Q(r.watch,()=>{l||(i._asyncData[o.value]?._execute.isPending()&&sn(()=>{i._asyncData[o.value]?._execute.flush()}),i._asyncData[o.value]?._execute({cause:"watch",dedupe:r.dedupe}))}):()=>{};y&&Ct(()=>{k(),j(),h(o.value)})}const p={data:ve(()=>i._asyncData[o.value]?.data),pending:ve(()=>i._asyncData[o.value]?.pending),status:ve(()=>i._asyncData[o.value]?.status),error:ve(()=>i._asyncData[o.value]?.error),refresh:(...h)=>i._asyncData[o.value]?._init?i._asyncData[o.value].execute(...h):u()(),execute:(...h)=>p.refresh(...h),clear:()=>{const h=i._asyncData[o.value];if(h?._abortController)try{h._abortController.abort(new DOMException("AsyncData aborted by user.","AbortError"))}finally{h._abortController=void 0}Gn(i,o.value)}},g=Promise.resolve(i._asyncDataPromises[o.value]).then(()=>p);return Object.assign(g,p),g}function ve(e){return T({get(){return e()?.value},set(n){const t=e();t&&(t.value=n)}})}function qa(e,n){return!(typeof e=="string"||typeof e=="object"&&e!==null||typeof e=="function"&&typeof n=="function")}function Gn(e,n){n in e.payload.data&&(e.payload.data[n]=void 0),n in e.payload._errors&&(e.payload._errors[n]=void 0),e._asyncData[n]&&(e._asyncData[n].data.value=C(e._asyncData[n]._default()),e._asyncData[n].error.value=void 0,e._asyncData[n].status.value="idle"),n in e._asyncDataPromises&&(e._asyncDataPromises[n]=void 0)}function Wa(e,n){const t={};for(const a of n)t[a]=e[a];return t}function yn(e,n,t,a,r){e.payload._errors[n]??=void 0;const l=a.getCachedData!==Qn,o=t,i=a.deep?Pn:on,u=r!==void 0,d=e.hook("app:data:refresh",async f=>{(!f||f.includes(n))&&await s.execute({cause:"refresh:hook"})}),s={data:i(u?r:a.default()),pending:T(()=>s.status.value==="pending"),error:Et(e.payload._errors,n),status:on("idle"),execute:(...f)=>{const[p,g=void 0]=f,h=p&&g===void 0&&typeof p=="object"?p:{};if(e._asyncDataPromises[n]&&(h.dedupe??a.dedupe)==="defer")return e._asyncDataPromises[n];{const y="cachedData"in h?h.cachedData:a.getCachedData(n,e,{cause:h.cause??"refresh:manual"});if(y!==void 0)return e.payload.data[n]=s.data.value=y,s.error.value=void 0,s.status.value="success",Promise.resolve(y)}s._abortController&&s._abortController.abort(new DOMException("AsyncData request cancelled by deduplication","AbortError")),s._abortController=new AbortController,s.status.value="pending";const b=new AbortController,m=new Promise((y,k)=>{try{const j=h.timeout??a.timeout,D=Ya([s._abortController?.signal,h?.signal],b.signal,j);if(D.aborted){const w=D.reason;k(w instanceof Error?w:new DOMException(String(w??"Aborted"),"AbortError"));return}return D.addEventListener("abort",()=>{const w=D.reason;k(w instanceof Error?w:new DOMException(String(w??"Aborted"),"AbortError"))},{once:!0,signal:b.signal}),Promise.resolve(o(e,{signal:D})).then(y,k)}catch(j){k(j)}}).then(async y=>{let k=y;a.transform&&(k=await a.transform(y)),a.pick&&(k=Wa(k,a.pick)),e.payload.data[n]=k,s.data.value=k,s.error.value=void 0,s.status.value="success"}).catch(y=>{if(e._asyncDataPromises[n]&&e._asyncDataPromises[n]!==m||s._abortController?.signal.aborted)return e._asyncDataPromises[n];if(typeof DOMException<"u"&&y instanceof DOMException&&y.name==="AbortError")return s.status.value="idle",e._asyncDataPromises[n];s.error.value=Pt(y),s.data.value=C(a.default()),s.status.value="error"}).finally(()=>{b.abort(),delete e._asyncDataPromises[n]});return e._asyncDataPromises[n]=m,e._asyncDataPromises[n]},_execute:Ua((...f)=>s.execute(...f),0,{leading:!0}),_default:a.default,_deps:0,_init:!0,_hash:void 0,_off:()=>{d(),e._asyncData[n]?._init&&(e._asyncData[n]._init=!1),l||kt(()=>{e._asyncData[n]?._init||(Gn(e,n),s.execute=()=>Promise.resolve())})}};return s}const Na=()=>{},Qn=(e,n,t)=>{if(n.isHydrating)return n.payload.data[e];if(t.cause!=="refresh:manual"&&t.cause!=="refresh:hook")return n.static.data[e]};function Ya(e,n,t){const a=e.filter(o=>!!o);if(typeof t=="number"&&t>=0){const o=AbortSignal.timeout?.(t);o&&a.push(o)}if(AbortSignal.any)return AbortSignal.any(a);const r=new AbortController;for(const o of a)if(o.aborted){const i=o.reason??new DOMException("Aborted","AbortError");try{r.abort(i)}catch{r.abort()}return r.signal}const l=()=>{const i=a.find(u=>u.aborted)?.reason??new DOMException("Aborted","AbortError");try{r.abort(i)}catch{r.abort()}};for(const o of a)o.addEventListener?.("abort",l,{once:!0,signal:n});return r.signal}class he{constructor(n,t,a){this.normal=t,this.property=n,a&&(this.space=a)}}he.prototype.normal={};he.prototype.property={};he.prototype.space=void 0;function et(e,n){const t={},a={};for(const r of e)Object.assign(t,r.property),Object.assign(a,r.normal);return new he(t,a,n)}function He(e){return e.toLowerCase()}class A{constructor(n,t){this.attribute=t,this.property=n}}A.prototype.attribute="";A.prototype.booleanish=!1;A.prototype.boolean=!1;A.prototype.commaOrSpaceSeparated=!1;A.prototype.commaSeparated=!1;A.prototype.defined=!1;A.prototype.mustUseProperty=!1;A.prototype.number=!1;A.prototype.overloadedBoolean=!1;A.prototype.property="";A.prototype.spaceSeparated=!1;A.prototype.space=void 0;let Za=0;const v=Y(),P=Y(),Fe=Y(),c=Y(),$=Y(),G=Y(),R=Y();function Y(){return 2**++Za}const Ve=Object.freeze(Object.defineProperty({__proto__:null,boolean:v,booleanish:P,commaOrSpaceSeparated:R,commaSeparated:G,number:c,overloadedBoolean:Fe,spaceSeparated:$},Symbol.toStringTag,{value:"Module"})),Re=Object.keys(Ve);class an extends A{constructor(n,t,a,r){let l=-1;if(super(n,t),vn(this,"space",r),typeof a=="number")for(;++l<Re.length;){const o=Re[l];vn(this,Re[l],(a&Ve[o])===Ve[o])}}}an.prototype.defined=!0;function vn(e,n,t){t&&(e[n]=t)}function le(e){const n={},t={};for(const[a,r]of Object.entries(e.properties)){const l=new an(a,e.transform(e.attributes||{},a),r,e.space);e.mustUseProperty&&e.mustUseProperty.includes(a)&&(l.mustUseProperty=!0),n[a]=l,t[He(a)]=a,t[He(l.attribute)]=a}return new he(n,t,e.space)}const nt=le({properties:{ariaActiveDescendant:null,ariaAtomic:P,ariaAutoComplete:null,ariaBusy:P,ariaChecked:P,ariaColCount:c,ariaColIndex:c,ariaColSpan:c,ariaControls:$,ariaCurrent:null,ariaDescribedBy:$,ariaDetails:null,ariaDisabled:P,ariaDropEffect:$,ariaErrorMessage:null,ariaExpanded:P,ariaFlowTo:$,ariaGrabbed:P,ariaHasPopup:null,ariaHidden:P,ariaInvalid:null,ariaKeyShortcuts:null,ariaLabel:null,ariaLabelledBy:$,ariaLevel:c,ariaLive:null,ariaModal:P,ariaMultiLine:P,ariaMultiSelectable:P,ariaOrientation:null,ariaOwns:$,ariaPlaceholder:null,ariaPosInSet:c,ariaPressed:P,ariaReadOnly:P,ariaRelevant:null,ariaRequired:P,ariaRoleDescription:$,ariaRowCount:c,ariaRowIndex:c,ariaRowSpan:c,ariaSelected:P,ariaSetSize:c,ariaSort:null,ariaValueMax:c,ariaValueMin:c,ariaValueNow:c,ariaValueText:null,role:null},transform(e,n){return n==="role"?n:"aria-"+n.slice(4).toLowerCase()}});function tt(e,n){return n in e?e[n]:n}function at(e,n){return tt(e,n.toLowerCase())}const Xa=le({attributes:{acceptcharset:"accept-charset",classname:"class",htmlfor:"for",httpequiv:"http-equiv"},mustUseProperty:["checked","multiple","muted","selected"],properties:{abbr:null,accept:G,acceptCharset:$,accessKey:$,action:null,allow:null,allowFullScreen:v,allowPaymentRequest:v,allowUserMedia:v,alt:null,as:null,async:v,autoCapitalize:null,autoComplete:$,autoFocus:v,autoPlay:v,blocking:$,capture:null,charSet:null,checked:v,cite:null,className:$,cols:c,colSpan:null,content:null,contentEditable:P,controls:v,controlsList:$,coords:c|G,crossOrigin:null,data:null,dateTime:null,decoding:null,default:v,defer:v,dir:null,dirName:null,disabled:v,download:Fe,draggable:P,encType:null,enterKeyHint:null,fetchPriority:null,form:null,formAction:null,formEncType:null,formMethod:null,formNoValidate:v,formTarget:null,headers:$,height:c,hidden:Fe,high:c,href:null,hrefLang:null,htmlFor:$,httpEquiv:$,id:null,imageSizes:null,imageSrcSet:null,inert:v,inputMode:null,integrity:null,is:null,isMap:v,itemId:null,itemProp:$,itemRef:$,itemScope:v,itemType:$,kind:null,label:null,lang:null,language:null,list:null,loading:null,loop:v,low:c,manifest:null,max:null,maxLength:c,media:null,method:null,min:null,minLength:c,multiple:v,muted:v,name:null,nonce:null,noModule:v,noValidate:v,onAbort:null,onAfterPrint:null,onAuxClick:null,onBeforeMatch:null,onBeforePrint:null,onBeforeToggle:null,onBeforeUnload:null,onBlur:null,onCancel:null,onCanPlay:null,onCanPlayThrough:null,onChange:null,onClick:null,onClose:null,onContextLost:null,onContextMenu:null,onContextRestored:null,onCopy:null,onCueChange:null,onCut:null,onDblClick:null,onDrag:null,onDragEnd:null,onDragEnter:null,onDragExit:null,onDragLeave:null,onDragOver:null,onDragStart:null,onDrop:null,onDurationChange:null,onEmptied:null,onEnded:null,onError:null,onFocus:null,onFormData:null,onHashChange:null,onInput:null,onInvalid:null,onKeyDown:null,onKeyPress:null,onKeyUp:null,onLanguageChange:null,onLoad:null,onLoadedData:null,onLoadedMetadata:null,onLoadEnd:null,onLoadStart:null,onMessage:null,onMessageError:null,onMouseDown:null,onMouseEnter:null,onMouseLeave:null,onMouseMove:null,onMouseOut:null,onMouseOver:null,onMouseUp:null,onOffline:null,onOnline:null,onPageHide:null,onPageShow:null,onPaste:null,onPause:null,onPlay:null,onPlaying:null,onPopState:null,onProgress:null,onRateChange:null,onRejectionHandled:null,onReset:null,onResize:null,onScroll:null,onScrollEnd:null,onSecurityPolicyViolation:null,onSeeked:null,onSeeking:null,onSelect:null,onSlotChange:null,onStalled:null,onStorage:null,onSubmit:null,onSuspend:null,onTimeUpdate:null,onToggle:null,onUnhandledRejection:null,onUnload:null,onVolumeChange:null,onWaiting:null,onWheel:null,open:v,optimum:c,pattern:null,ping:$,placeholder:null,playsInline:v,popover:null,popoverTarget:null,popoverTargetAction:null,poster:null,preload:null,readOnly:v,referrerPolicy:null,rel:$,required:v,reversed:v,rows:c,rowSpan:c,sandbox:$,scope:null,scoped:v,seamless:v,selected:v,shadowRootClonable:v,shadowRootDelegatesFocus:v,shadowRootMode:null,shape:null,size:c,sizes:null,slot:null,span:c,spellCheck:P,src:null,srcDoc:null,srcLang:null,srcSet:null,start:c,step:null,style:null,tabIndex:c,target:null,title:null,translate:null,type:null,typeMustMatch:v,useMap:null,value:P,width:c,wrap:null,writingSuggestions:null,align:null,aLink:null,archive:$,axis:null,background:null,bgColor:null,border:c,borderColor:null,bottomMargin:c,cellPadding:null,cellSpacing:null,char:null,charOff:null,classId:null,clear:null,code:null,codeBase:null,codeType:null,color:null,compact:v,declare:v,event:null,face:null,frame:null,frameBorder:null,hSpace:c,leftMargin:c,link:null,longDesc:null,lowSrc:null,marginHeight:c,marginWidth:c,noResize:v,noHref:v,noShade:v,noWrap:v,object:null,profile:null,prompt:null,rev:null,rightMargin:c,rules:null,scheme:null,scrolling:P,standby:null,summary:null,text:null,topMargin:c,valueType:null,version:null,vAlign:null,vLink:null,vSpace:c,allowTransparency:null,autoCorrect:null,autoSave:null,disablePictureInPicture:v,disableRemotePlayback:v,prefix:null,property:null,results:c,security:null,unselectable:null},space:"html",transform:at}),Ka=le({attributes:{accentHeight:"accent-height",alignmentBaseline:"alignment-baseline",arabicForm:"arabic-form",baselineShift:"baseline-shift",capHeight:"cap-height",className:"class",clipPath:"clip-path",clipRule:"clip-rule",colorInterpolation:"color-interpolation",colorInterpolationFilters:"color-interpolation-filters",colorProfile:"color-profile",colorRendering:"color-rendering",crossOrigin:"crossorigin",dataType:"datatype",dominantBaseline:"dominant-baseline",enableBackground:"enable-background",fillOpacity:"fill-opacity",fillRule:"fill-rule",floodColor:"flood-color",floodOpacity:"flood-opacity",fontFamily:"font-family",fontSize:"font-size",fontSizeAdjust:"font-size-adjust",fontStretch:"font-stretch",fontStyle:"font-style",fontVariant:"font-variant",fontWeight:"font-weight",glyphName:"glyph-name",glyphOrientationHorizontal:"glyph-orientation-horizontal",glyphOrientationVertical:"glyph-orientation-vertical",hrefLang:"hreflang",horizAdvX:"horiz-adv-x",horizOriginX:"horiz-origin-x",horizOriginY:"horiz-origin-y",imageRendering:"image-rendering",letterSpacing:"letter-spacing",lightingColor:"lighting-color",markerEnd:"marker-end",markerMid:"marker-mid",markerStart:"marker-start",navDown:"nav-down",navDownLeft:"nav-down-left",navDownRight:"nav-down-right",navLeft:"nav-left",navNext:"nav-next",navPrev:"nav-prev",navRight:"nav-right",navUp:"nav-up",navUpLeft:"nav-up-left",navUpRight:"nav-up-right",onAbort:"onabort",onActivate:"onactivate",onAfterPrint:"onafterprint",onBeforePrint:"onbeforeprint",onBegin:"onbegin",onCancel:"oncancel",onCanPlay:"oncanplay",onCanPlayThrough:"oncanplaythrough",onChange:"onchange",onClick:"onclick",onClose:"onclose",onCopy:"oncopy",onCueChange:"oncuechange",onCut:"oncut",onDblClick:"ondblclick",onDrag:"ondrag",onDragEnd:"ondragend",onDragEnter:"ondragenter",onDragExit:"ondragexit",onDragLeave:"ondragleave",onDragOver:"ondragover",onDragStart:"ondragstart",onDrop:"ondrop",onDurationChange:"ondurationchange",onEmptied:"onemptied",onEnd:"onend",onEnded:"onended",onError:"onerror",onFocus:"onfocus",onFocusIn:"onfocusin",onFocusOut:"onfocusout",onHashChange:"onhashchange",onInput:"oninput",onInvalid:"oninvalid",onKeyDown:"onkeydown",onKeyPress:"onkeypress",onKeyUp:"onkeyup",onLoad:"onload",onLoadedData:"onloadeddata",onLoadedMetadata:"onloadedmetadata",onLoadStart:"onloadstart",onMessage:"onmessage",onMouseDown:"onmousedown",onMouseEnter:"onmouseenter",onMouseLeave:"onmouseleave",onMouseMove:"onmousemove",onMouseOut:"onmouseout",onMouseOver:"onmouseover",onMouseUp:"onmouseup",onMouseWheel:"onmousewheel",onOffline:"onoffline",onOnline:"ononline",onPageHide:"onpagehide",onPageShow:"onpageshow",onPaste:"onpaste",onPause:"onpause",onPlay:"onplay",onPlaying:"onplaying",onPopState:"onpopstate",onProgress:"onprogress",onRateChange:"onratechange",onRepeat:"onrepeat",onReset:"onreset",onResize:"onresize",onScroll:"onscroll",onSeeked:"onseeked",onSeeking:"onseeking",onSelect:"onselect",onShow:"onshow",onStalled:"onstalled",onStorage:"onstorage",onSubmit:"onsubmit",onSuspend:"onsuspend",onTimeUpdate:"ontimeupdate",onToggle:"ontoggle",onUnload:"onunload",onVolumeChange:"onvolumechange",onWaiting:"onwaiting",onZoom:"onzoom",overlinePosition:"overline-position",overlineThickness:"overline-thickness",paintOrder:"paint-order",panose1:"panose-1",pointerEvents:"pointer-events",referrerPolicy:"referrerpolicy",renderingIntent:"rendering-intent",shapeRendering:"shape-rendering",stopColor:"stop-color",stopOpacity:"stop-opacity",strikethroughPosition:"strikethrough-position",strikethroughThickness:"strikethrough-thickness",strokeDashArray:"stroke-dasharray",strokeDashOffset:"stroke-dashoffset",strokeLineCap:"stroke-linecap",strokeLineJoin:"stroke-linejoin",strokeMiterLimit:"stroke-miterlimit",strokeOpacity:"stroke-opacity",strokeWidth:"stroke-width",tabIndex:"tabindex",textAnchor:"text-anchor",textDecoration:"text-decoration",textRendering:"text-rendering",transformOrigin:"transform-origin",typeOf:"typeof",underlinePosition:"underline-position",underlineThickness:"underline-thickness",unicodeBidi:"unicode-bidi",unicodeRange:"unicode-range",unitsPerEm:"units-per-em",vAlphabetic:"v-alphabetic",vHanging:"v-hanging",vIdeographic:"v-ideographic",vMathematical:"v-mathematical",vectorEffect:"vector-effect",vertAdvY:"vert-adv-y",vertOriginX:"vert-origin-x",vertOriginY:"vert-origin-y",wordSpacing:"word-spacing",writingMode:"writing-mode",xHeight:"x-height",playbackOrder:"playbackorder",timelineBegin:"timelinebegin"},properties:{about:R,accentHeight:c,accumulate:null,additive:null,alignmentBaseline:null,alphabetic:c,amplitude:c,arabicForm:null,ascent:c,attributeName:null,attributeType:null,azimuth:c,bandwidth:null,baselineShift:null,baseFrequency:null,baseProfile:null,bbox:null,begin:null,bias:c,by:null,calcMode:null,capHeight:c,className:$,clip:null,clipPath:null,clipPathUnits:null,clipRule:null,color:null,colorInterpolation:null,colorInterpolationFilters:null,colorProfile:null,colorRendering:null,content:null,contentScriptType:null,contentStyleType:null,crossOrigin:null,cursor:null,cx:null,cy:null,d:null,dataType:null,defaultAction:null,descent:c,diffuseConstant:c,direction:null,display:null,dur:null,divisor:c,dominantBaseline:null,download:v,dx:null,dy:null,edgeMode:null,editable:null,elevation:c,enableBackground:null,end:null,event:null,exponent:c,externalResourcesRequired:null,fill:null,fillOpacity:c,fillRule:null,filter:null,filterRes:null,filterUnits:null,floodColor:null,floodOpacity:null,focusable:null,focusHighlight:null,fontFamily:null,fontSize:null,fontSizeAdjust:null,fontStretch:null,fontStyle:null,fontVariant:null,fontWeight:null,format:null,fr:null,from:null,fx:null,fy:null,g1:G,g2:G,glyphName:G,glyphOrientationHorizontal:null,glyphOrientationVertical:null,glyphRef:null,gradientTransform:null,gradientUnits:null,handler:null,hanging:c,hatchContentUnits:null,hatchUnits:null,height:null,href:null,hrefLang:null,horizAdvX:c,horizOriginX:c,horizOriginY:c,id:null,ideographic:c,imageRendering:null,initialVisibility:null,in:null,in2:null,intercept:c,k:c,k1:c,k2:c,k3:c,k4:c,kernelMatrix:R,kernelUnitLength:null,keyPoints:null,keySplines:null,keyTimes:null,kerning:null,lang:null,lengthAdjust:null,letterSpacing:null,lightingColor:null,limitingConeAngle:c,local:null,markerEnd:null,markerMid:null,markerStart:null,markerHeight:null,markerUnits:null,markerWidth:null,mask:null,maskContentUnits:null,maskUnits:null,mathematical:null,max:null,media:null,mediaCharacterEncoding:null,mediaContentEncodings:null,mediaSize:c,mediaTime:null,method:null,min:null,mode:null,name:null,navDown:null,navDownLeft:null,navDownRight:null,navLeft:null,navNext:null,navPrev:null,navRight:null,navUp:null,navUpLeft:null,navUpRight:null,numOctaves:null,observer:null,offset:null,onAbort:null,onActivate:null,onAfterPrint:null,onBeforePrint:null,onBegin:null,onCancel:null,onCanPlay:null,onCanPlayThrough:null,onChange:null,onClick:null,onClose:null,onCopy:null,onCueChange:null,onCut:null,onDblClick:null,onDrag:null,onDragEnd:null,onDragEnter:null,onDragExit:null,onDragLeave:null,onDragOver:null,onDragStart:null,onDrop:null,onDurationChange:null,onEmptied:null,onEnd:null,onEnded:null,onError:null,onFocus:null,onFocusIn:null,onFocusOut:null,onHashChange:null,onInput:null,onInvalid:null,onKeyDown:null,onKeyPress:null,onKeyUp:null,onLoad:null,onLoadedData:null,onLoadedMetadata:null,onLoadStart:null,onMessage:null,onMouseDown:null,onMouseEnter:null,onMouseLeave:null,onMouseMove:null,onMouseOut:null,onMouseOver:null,onMouseUp:null,onMouseWheel:null,onOffline:null,onOnline:null,onPageHide:null,onPageShow:null,onPaste:null,onPause:null,onPlay:null,onPlaying:null,onPopState:null,onProgress:null,onRateChange:null,onRepeat:null,onReset:null,onResize:null,onScroll:null,onSeeked:null,onSeeking:null,onSelect:null,onShow:null,onStalled:null,onStorage:null,onSubmit:null,onSuspend:null,onTimeUpdate:null,onToggle:null,onUnload:null,onVolumeChange:null,onWaiting:null,onZoom:null,opacity:null,operator:null,order:null,orient:null,orientation:null,origin:null,overflow:null,overlay:null,overlinePosition:c,overlineThickness:c,paintOrder:null,panose1:null,path:null,pathLength:c,patternContentUnits:null,patternTransform:null,patternUnits:null,phase:null,ping:$,pitch:null,playbackOrder:null,pointerEvents:null,points:null,pointsAtX:c,pointsAtY:c,pointsAtZ:c,preserveAlpha:null,preserveAspectRatio:null,primitiveUnits:null,propagate:null,property:R,r:null,radius:null,referrerPolicy:null,refX:null,refY:null,rel:R,rev:R,renderingIntent:null,repeatCount:null,repeatDur:null,requiredExtensions:R,requiredFeatures:R,requiredFonts:R,requiredFormats:R,resource:null,restart:null,result:null,rotate:null,rx:null,ry:null,scale:null,seed:null,shapeRendering:null,side:null,slope:null,snapshotTime:null,specularConstant:c,specularExponent:c,spreadMethod:null,spacing:null,startOffset:null,stdDeviation:null,stemh:null,stemv:null,stitchTiles:null,stopColor:null,stopOpacity:null,strikethroughPosition:c,strikethroughThickness:c,string:null,stroke:null,strokeDashArray:R,strokeDashOffset:null,strokeLineCap:null,strokeLineJoin:null,strokeMiterLimit:c,strokeOpacity:c,strokeWidth:null,style:null,surfaceScale:c,syncBehavior:null,syncBehaviorDefault:null,syncMaster:null,syncTolerance:null,syncToleranceDefault:null,systemLanguage:R,tabIndex:c,tableValues:null,target:null,targetX:c,targetY:c,textAnchor:null,textDecoration:null,textRendering:null,textLength:null,timelineBegin:null,title:null,transformBehavior:null,type:null,typeOf:R,to:null,transform:null,transformOrigin:null,u1:null,u2:null,underlinePosition:c,underlineThickness:c,unicode:null,unicodeBidi:null,unicodeRange:null,unitsPerEm:c,values:null,vAlphabetic:c,vMathematical:c,vectorEffect:null,vHanging:c,vIdeographic:c,version:null,vertAdvY:c,vertOriginX:c,vertOriginY:c,viewBox:null,viewTarget:null,visibility:null,width:null,widths:null,wordSpacing:null,writingMode:null,x:null,x1:null,x2:null,xChannelSelector:null,xHeight:c,y:null,y1:null,y2:null,yChannelSelector:null,z:null,zoomAndPan:null},space:"svg",transform:tt}),rt=le({properties:{xLinkActuate:null,xLinkArcRole:null,xLinkHref:null,xLinkRole:null,xLinkShow:null,xLinkTitle:null,xLinkType:null},space:"xlink",transform(e,n){return"xlink:"+n.slice(5).toLowerCase()}}),lt=le({attributes:{xmlnsxlink:"xmlns:xlink"},properties:{xmlnsXLink:null,xmlns:null},space:"xmlns",transform:at}),ot=le({properties:{xmlBase:null,xmlLang:null,xmlSpace:null},space:"xml",transform(e,n){return"xml:"+n.slice(3).toLowerCase()}}),Ja=/[A-Z]/g,bn=/-[a-z]/g,Ga=/^data[-\w.:]+$/i;function Qa(e,n){const t=He(n);let a=n,r=A;if(t in e.normal)return e.property[e.normal[t]];if(t.length>4&&t.slice(0,4)==="data"&&Ga.test(n)){if(n.charAt(4)==="-"){const l=n.slice(5).replace(bn,nr);a="data"+l.charAt(0).toUpperCase()+l.slice(1)}else{const l=n.slice(4);if(!bn.test(l)){let o=l.replace(Ja,er);o.charAt(0)!=="-"&&(o="-"+o),n="data"+o}}r=an}return new r(a,n)}function er(e){return"-"+e.toLowerCase()}function nr(e){return e.charAt(1).toUpperCase()}const tr=et([nt,Xa,rt,lt,ot],"html"),wl=et([nt,Ka,rt,lt,ot],"svg"),ar=new Set(["a","abbr","address","area","article","aside","audio","b","base","bdi","bdo","blockquote","body","br","button","canvas","caption","cite","code","col","colgroup","data","datalist","dd","del","details","dfn","dialog","div","dl","dt","em","embed","fieldset","figcaption","figure","footer","form","h1","h2","h3","h4","h5","h6","head","header","hgroup","hr","html","i","iframe","img","input","ins","kbd","label","legend","li","link","main","map","mark","math","menu","menuitem","meta","meter","nav","noscript","object","ol","optgroup","option","output","p","param","picture","pre","progress","q","rb","rp","rt","rtc","ruby","s","samp","script","section","select","slot","small","source","span","strong","style","sub","summary","sup","svg","table","tbody","td","template","textarea","tfoot","th","thead","time","title","tr","track","u","ul","var","video","wbr"]);function rr(e,n){return n.reduce((t,a)=>{const r=lr(e,a);return r!==void 0&&(t[a]=r),t},{})}function lr(e,n){return n.split(".").reduce((t,a)=>t&&t[a],e)}const qe="default",it=/^@|^v-on:/,st=/^:|^v-bind:/,or=/^v-model/,ir=["select","textarea","input"],sr=new Set(["math","svg"]),ut=new Set,ur=Object.fromEntries(["p","a","blockquote","code","pre","code","em","h1","h2","h3","h4","h5","h6","hr","img","ul","ol","li","strong","table","thead","tbody","td","th","tr","script"].map(e=>[e,`prose-${e}`])),cr=["script","base"],dr=Tn({name:"MDCRenderer",props:{body:{type:Object,required:!0},data:{type:Object,default:()=>({})},class:{type:[String,Object],default:void 0},tag:{type:[String,Boolean],default:void 0},prose:{type:Boolean,default:void 0},components:{type:Object,default:()=>({})},unwrap:{type:[Boolean,String],default:!1}},async setup(e){const t=On()?.appContext?.app?.$nuxt,a=t?.$route||t?._route,{mdc:r}=t?.$config?.public||{},l=r?.components?.customElements||r?.components?.custom;l&&l.forEach(s=>ut.add(s));const o=T(()=>({...r?.components?.prose&&e.prose!==!1?ur:{},...r?.components?.map||{},...Tt(e.data?.mdc?.components||{}),...e.components})),i=T(()=>{const s=(e.body?.children||[]).map(f=>f.tag||f.type).filter(f=>!rn(f));return Array.from(new Set(s)).sort().join(".")}),u=Ot({...e.data});Q(()=>e.data,s=>{Object.assign(u,s)}),await $r(e.body,{tags:o.value});function d(s,f){const p=s.split(".").length-1;return s.split(".").reduce((g,h,b)=>b==p&&g?(g[h]=f,g[h]):typeof g=="object"?g[h]:void 0,u)}return{tags:o,contentKey:i,route:a,runtimeData:u,updateRuntimeData:d}},render(e){const{tags:n,tag:t,body:a,data:r,contentKey:l,route:o,unwrap:i,runtimeData:u,updateRuntimeData:d}=e;if(!a)return null;const s={...r,tags:n,$route:o,runtimeData:u,updateRuntimeData:d},f=t!==!1?We(t||s.component?.name||s.component||"div"):void 0;return f?un(f,{...s.component?.props,class:e.class,...this.$attrs,key:l},{default:p}):p?.();function p(){const g=ct(a,un,{documentMeta:s,parentScope:s,resolveComponent:We});return g?.default?i?_n(g.default(),typeof i=="string"?i.split(" "):["*"]):g.default():null}}});function fr(e,n,t,a){const{documentMeta:r,parentScope:l,resolveComponent:o}=t;if(e.type==="text")return n($e,e.value);if(e.type==="comment")return n(Rt,null,e.value);const i=e.tag,u=ft(e,r.tags);if(e.tag==="binding")return hr(e,n,r,l);const d=dt(u)?p=>p:o;if(cr.includes(u))return n("pre",{class:"mdc-renderer-dangerous-tag"},"<"+u+">"+Zt(e)+"</"+u+">");const s=d(u);typeof s=="object"&&(s.tag=i);const f=pr(e,r);return a&&(f.key=a),n(s,f,ct(e,n,{documentMeta:r,parentScope:{...l,...f},resolveComponent:d}))}function ct(e,n,t){const{documentMeta:a,parentScope:r,resolveComponent:l}=t,i=(e.children||[]).reduce((d,s)=>{if(!xr(s))return d[qe].children.push(s),d;const f=br(s);return d[f]=d[f]||{props:{},children:[]},s.type==="element"&&(d[f].props=s.props,d[f].children.push(...s.children||[])),d},{[qe]:{props:{},children:[]}});return Object.entries(i).reduce((d,[s,{props:f,children:p}])=>(p.length&&(d[s]=(g={})=>{const h=rr(g,Object.keys(f||{}));let b=p.map((m,y)=>fr(m,n,{documentMeta:a,parentScope:{...r,...h},resolveComponent:l},String(m.props?.key||y)));return f?.unwrap&&(b=_n(b,f.unwrap)),wr(b)}),d),{})}function hr(e,n,t,a={}){const r={...t.runtimeData,...a,$document:t,$doc:t},l=/\.|\[(\d+)\]/,i=(e.props?.value.trim().split(l).filter(Boolean)).reduce((d,s)=>{if(d&&s in d)return typeof d[s]=="function"?d[s]():d[s]},r),u=e.props?.defaultValue;return n($e,i??u??"")}function pr(e,n){const{tag:t="",props:a={}}=e;return Object.keys(a).reduce(function(r,l){if(l==="__ignoreMap")return r;const o=a[l];if(or.test(l))return mr(l,o,r,n,{native:ir.includes(t)});if(l==="v-bind")return gr(l,o,r,n);if(it.test(l))return yr(l,o,r,n);if(st.test(l))return vr(l,o,r,n);const{attribute:i}=Qa(tr,l);return Array.isArray(o)&&o.every(u=>typeof u=="string")?(r[i]=o.join(" "),r):(r[i]=o,r)},{})}function mr(e,n,t,a,{native:r}){const l=e.match(/^v-model:([^=]+)/)?.[1]||"modelValue",o=r?"value":l,i=r?"onInput":`onUpdate:${l}`;return t[o]=Pe(n,a.runtimeData),t[i]=u=>{a.updateRuntimeData(n,r?u.target?.value:u)},t}function gr(e,n,t,a){const r=Pe(n,a);return t=Object.assign(t,r),t}function yr(e,n,t,a){return e=e.replace(it,""),t.on=t.on||{},t.on[e]=()=>Pe(n,a),t}function vr(e,n,t,a){return e=e.replace(st,""),t[e]=Pe(n,a),t}const We=e=>{if(typeof e=="string"){if(rn(e))return e;const n=Lt(Ln(e),!1);return!e||n?.name==="AsyncComponentWrapper"||typeof n=="string"?n:"setup"in n?At(()=>new Promise(t=>t(n))):n}return e};function Pe(e,n){const t=e.split(".").reduce((a,r)=>typeof a=="object"?a[r]:void 0,n);return typeof t>"u"?Bt(e):t}function br(e){let n="";for(const t of Object.keys(e.props||{}))if(!(!t.startsWith("#")&&!t.startsWith("v-slot:"))){n=t.split(/[:#]/,2)[1];break}return n||qe}function xr(e){return e.tag==="template"}function dt(e){return sr.has(e)}function wr(e){const n=[];for(const t of e){const a=n[n.length-1];t.type===$e&&a?.type===$e?a.children=a.children+t.children:n.push(t)}return n}async function $r(e,n){if(!e)return;const t=Array.from(new Set(a(e,n)));await Promise.all(t.map(async r=>{if(r?.render||r?.ssrRender||r?.__ssrInlineRender)return;const l=We(r);l?.__asyncLoader&&!l.__asyncResolved&&await l.__asyncLoader()}));function a(r,l){const o=r.tag;if(r.type==="text"||o==="binding"||r.type==="comment")return[];const i=ft(r,l.tags);if(dt(i))return[];const u=[];r.type!=="root"&&!rn(i)&&u.push(i);for(const d of r.children||[])u.push(...a(d,l));return u}}function ft(e,n){const t=e.tag;return!t||typeof e.props?.__ignoreMap<"u"?t:n[t]||n[Ln(t)]||n[_t(e.tag)]||t}function rn(e){return(typeof e=="string"?ut.has(e):!1)||ar.has(e)}const Dr=Object.assign(dr,{__name:"MDCRenderer"}),Cr={__name:"MDC",props:{tag:{type:[String,Boolean],default:"div"},value:{type:[String,Object],required:!0},excerpt:{type:Boolean,default:!1},parserOptions:{type:Object,default:()=>({})},class:{type:[String,Array,Object],default:""},unwrap:{type:[Boolean,String],default:!1},cacheKey:{type:String,default:void 0},partial:{type:Boolean,default:!0}},async setup(e){let n,t;const a=e,r=T(()=>a.cacheKey??d(a.value)),{data:l,refresh:o,error:i}=([n,t]=It(async()=>Va(r.value,async()=>{if(typeof a.value!="string")return a.value;const{parseMarkdown:s}=await jt(async()=>{const{parseMarkdown:f}=await import("./TJQClhO4.js").then(p=>p.i);return{parseMarkdown:f}},__vite__mapDeps([0,1,2,3]),import.meta.url);return await s(a.value,{...a.parserOptions,toc:a.partial?!1:a.parserOptions?.toc,contentHeading:a.partial?!1:a.parserOptions?.contentHeading})})),n=await n,t(),n),u=T(()=>a.excerpt?l.value?.excerpt:l.value?.body);Q(()=>a.value,()=>{o()});function d(s){typeof s!="string"&&(s=JSON.stringify(s||""));let f=0;for(let p=0;p<s.length;p++){const g=s.charCodeAt(p);f=(f<<6)-f+g,f=f&f}return`mdc-${f===0?"0000":f.toString(36)}-key`}return(s,f)=>{const p=Dr;return E(s.$slots,"default",{data:C(l)?.data,body:C(l)?.body,toc:C(l)?.toc,excerpt:C(l)?.excerpt,error:C(i)},()=>[u.value?(x(),L(p,{key:0,tag:a.tag,class:S(a.class),body:u.value,data:C(l)?.data,unwrap:a.unwrap},null,8,["tag","class","body","data","unwrap"])):M("",!0)])}}},Sr={slots:{root:"relative group/user",wrapper:"",name:"font-medium",description:"text-muted",avatar:"shrink-0"},variants:{orientation:{horizontal:{root:"flex items-center"},vertical:{root:"flex flex-col"}},to:{true:{name:["text-default peer-hover:text-highlighted peer-focus-visible:text-highlighted","transition-colors"],description:["peer-hover:text-toned peer-focus-visible:text-toned","transition-colors"],avatar:"transform transition-transform duration-200 group-hover/user:scale-115 group-has-focus-visible/user:scale-115"},false:{name:"text-highlighted",description:""}},size:{"3xs":{root:"gap-1",wrapper:"flex items-center gap-1",name:"text-xs",description:"text-xs"},"2xs":{root:"gap-1.5",wrapper:"flex items-center gap-1.5",name:"text-xs",description:"text-xs"},xs:{root:"gap-1.5",wrapper:"flex items-center gap-1.5",name:"text-xs",description:"text-xs"},sm:{root:"gap-2",name:"text-xs",description:"text-xs"},md:{root:"gap-2",name:"text-sm",description:"text-xs"},lg:{root:"gap-2.5",name:"text-sm",description:"text-sm"},xl:{root:"gap-2.5",name:"text-base",description:"text-sm"},"2xl":{root:"gap-3",name:"text-base",description:"text-base"},"3xl":{root:"gap-3",name:"text-lg",description:"text-base"}}},defaultVariants:{size:"md"}},Mr=Object.assign({inheritAttrs:!1},{__name:"UUser",props:{as:{type:null,required:!1},name:{type:String,required:!1},description:{type:String,required:!1},avatar:{type:Object,required:!1},chip:{type:[Boolean,Object],required:!1},size:{type:null,required:!1},orientation:{type:null,required:!1,default:"horizontal"},to:{type:null,required:!1},target:{type:[String,Object,null],required:!1},onClick:{type:Function,required:!1},class:{type:null,required:!1},ui:{type:null,required:!1}},setup(e){const n=e,t=Ye(),a=Ze(),r=T(()=>ee({extend:ee(Sr),...a.ui?.user||{}})({size:n.size,orientation:n.orientation,to:!!n.to||!!n.onClick}));return(l,o)=>(x(),L(C(Xe),{as:e.as,"data-orientation":e.orientation,"data-slot":"root",class:S(r.value.root({class:[n.ui?.root,n.class]})),onClick:e.onClick},{default:_(()=>[E(l.$slots,"avatar",{ui:r.value},()=>[e.chip&&e.avatar?(x(),L(zt,B({key:0,inset:""},typeof e.chip=="object"?e.chip:{},{size:e.size}),{default:_(()=>[V(cn,B({alt:e.name},e.avatar,{size:e.size,"data-slot":"avatar",class:r.value.avatar({class:n.ui?.avatar})}),null,16,["alt","size","class"])]),_:1},16,["size"])):e.avatar?(x(),L(cn,B({key:1,alt:e.name},e.avatar,{size:e.size,"data-slot":"avatar",class:r.value.avatar({class:n.ui?.avatar})}),null,16,["alt","size","class"])):M("",!0)]),q("div",{"data-slot":"wrapper",class:S(r.value.wrapper({class:n.ui?.wrapper}))},[e.to?(x(),L(An,B({key:0,"aria-label":e.name},{to:e.to,target:e.target,...l.$attrs},{class:"focus:outline-none peer",raw:""}),{default:_(()=>[...o[0]||(o[0]=[q("span",{class:"absolute inset-0","aria-hidden":"true"},null,-1)])]),_:1},16,["aria-label"])):M("",!0),E(l.$slots,"default",{},()=>[e.name||t.name?(x(),O("p",{key:0,"data-slot":"name",class:S(r.value.name({class:n.ui?.name}))},[E(l.$slots,"name",{},()=>[ue(ce(e.name),1)])],2)):M("",!0),e.description||t.description?(x(),O("p",{key:1,"data-slot":"description",class:S(r.value.description({class:n.ui?.description}))},[E(l.$slots,"description",{},()=>[ue(ce(e.description),1)])],2)):M("",!0)])],2)]),_:3},8,["as","data-orientation","class","onClick"]))}}),kr={slots:{root:"relative",container:"flex flex-col mx-auto max-w-2xl",header:"",meta:"flex items-center gap-3 mb-2",date:"text-sm/6 text-toned truncate",badge:"",title:"relative text-xl text-pretty font-semibold text-highlighted",description:"text-base text-pretty text-muted mt-1",imageWrapper:"relative overflow-hidden rounded-lg aspect-[16/9] mt-5 group/changelog-version-image",image:"object-cover object-top w-full h-full",authors:"flex flex-wrap gap-x-4 gap-y-1.5",footer:"border-t border-default pt-5 flex items-center justify-between",indicator:"absolute start-0 top-0 w-32 hidden lg:flex items-center justify-end gap-3 min-w-0",dot:"size-4 rounded-full bg-default ring ring-default flex items-center justify-center my-1",dotInner:"size-2 rounded-full bg-primary"},variants:{body:{false:{footer:"mt-5"}},badge:{false:{meta:"lg:hidden"}},to:{true:{title:["has-focus-visible:ring-2 has-focus-visible:ring-primary rounded-xs","transition"],image:"transform transition-transform duration-200 group-hover/changelog-version-image:scale-105 group-has-focus-visible/changelog-version-image:scale-105"}},hidden:{true:{date:"lg:hidden"}}}},Pr=["datetime"],ht=Object.assign({inheritAttrs:!1},{__name:"UChangelogVersion",props:{as:{type:null,required:!1,default:"article"},title:{type:String,required:!1},description:{type:String,required:!1},date:{type:[String,Date],required:!1},badge:{type:[String,Object],required:!1},authors:{type:Array,required:!1},image:{type:[String,Object],required:!1},indicator:{type:Boolean,required:!1,default:!0},to:{type:null,required:!1},target:{type:[String,Object,null],required:!1},onClick:{type:Function,required:!1},class:{type:null,required:!1},ui:{type:null,required:!1}},setup(e){const n=e,t=Ye(),{locale:a}=Ut(),r=Ze(),l=ja(a.value.code),[o,i]=dn(),[u,d]=dn({props:{hidden:{type:Boolean,default:!1}}}),s=T(()=>ee({extend:ee(kr),...r.ui?.changelogVersion||{}})({to:!!n.to||!!n.onClick})),f=T(()=>{if(n.date)try{return l.custom(new Date(n.date),{dateStyle:"medium"})}catch{return n.date}}),p=T(()=>{if(n.date)try{return new Date(n.date)?.toISOString()}catch{return}}),g=T(()=>(t.title&&Vt(t.title())||n.title||"Version link").trim());return(h,b)=>(x(),O(De,null,[V(C(o),null,{default:_(()=>[e.to?(x(),L(An,B({key:0,"aria-label":g.value},{to:e.to,target:e.target,...h.$attrs},{class:"focus:outline-none peer",raw:""}),{default:_(()=>[...b[0]||(b[0]=[q("span",{class:"absolute inset-0","aria-hidden":"true"},null,-1)])]),_:1},16,["aria-label"])):M("",!0)]),_:1}),V(C(u),null,{default:_(({hidden:m})=>[f.value?(x(),O("time",{key:0,datetime:p.value,"data-slot":"date",class:S(s.value.date({class:n.ui?.date,hidden:m}))},[E(h.$slots,"date",{},()=>[ue(ce(f.value),1)])],10,Pr)):M("",!0)]),_:3}),V(C(Xe),{as:e.as,"data-slot":"root",class:S(s.value.root({class:[n.ui?.root,n.class]})),onClick:e.onClick},{default:_(()=>[n.indicator||t.indicator?(x(),O("div",{key:0,"data-slot":"indicator",class:S(s.value.indicator({class:n.ui?.indicator}))},[E(h.$slots,"indicator",{ui:s.value},()=>[V(C(d)),q("div",{"data-slot":"dot",class:S(s.value.dot({class:n.ui?.dot}))},[q("div",{"data-slot":"dotInner",class:S(s.value.dotInner({class:n.ui?.dotInner}))},null,2)],2)])],2)):M("",!0),q("div",{"data-slot":"container",class:S(s.value.container({class:n.ui?.container}))},[t.header||f.value||t.date||e.badge||t.badge||e.title||t.title||e.description||t.description||e.image||t.image?(x(),O("div",{key:0,"data-slot":"header",class:S(s.value.header({class:n.ui?.header}))},[E(h.$slots,"header",{},()=>[f.value||t.date||e.badge||t.badge?(x(),O("div",{key:0,"data-slot":"meta",class:S(s.value.meta({class:n.ui?.meta,badge:!!e.badge||!!t.badge||!n.indicator}))},[E(h.$slots,"badge",{ui:s.value},()=>[e.badge?(x(),L(Xt,B({key:0,color:"neutral",variant:"solid"},typeof e.badge=="string"?{label:e.badge}:e.badge,{"data-slot":"badge",class:s.value.badge({class:n.ui?.badge})}),null,16,["class"])):M("",!0)]),V(C(d),{hidden:!!n.indicator},null,8,["hidden"])],2)):M("",!0),e.title||t.title?(x(),O("h2",{key:1,"data-slot":"title",class:S(s.value.title({class:n.ui?.title}))},[V(C(i)),E(h.$slots,"title",{},()=>[ue(ce(e.title),1)])],2)):M("",!0),e.description||t.description?(x(),O("div",{key:2,"data-slot":"description",class:S(s.value.description({class:n.ui?.description}))},[E(h.$slots,"description",{},()=>[ue(ce(e.description),1)])],2)):M("",!0),e.image||t.image?(x(),O("div",{key:3,"data-slot":"imageWrapper",class:S(s.value.imageWrapper({class:n.ui?.imageWrapper}))},[E(h.$slots,"image",{ui:s.value},()=>[e.image?(x(),L(Ht(C(Ft)),B({key:0},typeof e.image=="string"?{src:e.image,alt:e.title}:{alt:e.title,...e.image},{"data-slot":"image",class:s.value.image({class:n.ui?.image,to:!!e.to})}),null,16,["class"])):M("",!0)]),V(C(i))],2)):M("",!0)])],2)):M("",!0),E(h.$slots,"body"),t.footer||e.authors?.length||t.authors||t.actions?(x(),O("div",{key:1,"data-slot":"footer",class:S(s.value.footer({class:n.ui?.footer,body:!!t.body}))},[E(h.$slots,"footer",{},()=>[e.authors?.length||t.authors?(x(),O("div",{key:0,"data-slot":"authors",class:S(s.value.authors({class:n.ui?.authors}))},[E(h.$slots,"authors",{},()=>[(x(!0),O(De,null,Ce(e.authors,(m,y)=>(x(),L(Mr,B({key:y},{ref_for:!0},m),null,16))),128))])],2)):M("",!0),E(h.$slots,"actions")])],2)):M("",!0)],2)]),_:3},8,["as","class","onClick"])],64))}}),Er=50,xn=()=>({current:0,offset:[],progress:0,scrollLength:0,targetOffset:0,targetLength:0,containerLength:0,velocity:0}),Or=()=>({time:0,x:xn(),y:xn()}),Tr={x:{length:"Width",position:"Left"},y:{length:"Height",position:"Top"}};function wn(e,n,t,a){const r=t[n],{length:l,position:o}=Tr[n],i=r.current,u=t.time;r.current=e[`scroll${o}`],r.scrollLength=e[`scroll${l}`]-e[`client${l}`],r.offset.length=0,r.offset[0]=0,r.offset[1]=r.scrollLength,r.progress=Kt(0,r.scrollLength,r.current);const d=a-u;r.velocity=d>Er?0:Jt(r.current-i,d)}function Lr(e,n,t){wn(e,"x",n,t),wn(e,"y",n,t),n.time=t}function Ar(e,n){const t={x:0,y:0};let a=e;for(;a&&a!==n;)if(Gt(a))t.x+=a.offsetLeft,t.y+=a.offsetTop,a=a.offsetParent;else if(a.tagName==="svg"){const r=a.getBoundingClientRect();a=a.parentElement;const l=a.getBoundingClientRect();t.x+=r.left-l.left,t.y+=r.top-l.top}else if(a instanceof SVGGraphicsElement){const{x:r,y:l}=a.getBBox();t.x+=r,t.y+=l;let o=null,i=a.parentNode;for(;!o;)i.tagName==="svg"&&(o=i),i=a.parentNode;a=o}else break;return t}const Ne={start:0,center:.5,end:1};function $n(e,n,t=0){let a=0;if(e in Ne&&(e=Ne[e]),typeof e=="string"){const r=parseFloat(e);e.endsWith("px")?a=r:e.endsWith("%")?e=r/100:e.endsWith("vw")?a=r/100*document.documentElement.clientWidth:e.endsWith("vh")?a=r/100*document.documentElement.clientHeight:e=r}return typeof e=="number"&&(a=n*e),t+a}const Rr=[0,0];function _r(e,n,t,a){let r=Array.isArray(e)?e:Rr,l=0,o=0;return typeof e=="number"?r=[e,e]:typeof e=="string"&&(e=e.trim(),e.includes(" ")?r=e.split(" "):r=[e,Ne[e]?e:"0"]),l=$n(r[0],t,a),o=$n(r[1],n),l-o}const Br={All:[[0,0],[1,1]]},Ir={x:0,y:0};function jr(e){return"getBBox"in e&&e.tagName!=="svg"?e.getBBox():{width:e.clientWidth,height:e.clientHeight}}function zr(e,n,t){const{offset:a=Br.All}=t,{target:r=e,axis:l="y"}=t,o=l==="y"?"height":"width",i=r!==e?Ar(r,e):Ir,u=r===e?{width:e.scrollWidth,height:e.scrollHeight}:jr(r),d={width:e.clientWidth,height:e.clientHeight};n[l].offset.length=0;let s=!n[l].interpolate;const f=a.length;for(let p=0;p<f;p++){const g=_r(a[p],d[o],u[o],i[l]);!s&&g!==n[l].interpolatorOffsets[p]&&(s=!0),n[l].offset[p]=g}s&&(n[l].interpolate=Bn(n[l].offset,Qt(a),{clamp:!1}),n[l].interpolatorOffsets=[...n[l].offset]),n[l].progress=ea(0,1,n[l].interpolate(n[l].current))}function Ur(e,n=e,t){if(t.x.targetOffset=0,t.y.targetOffset=0,n!==e){let a=n;for(;a&&a!==e;)t.x.targetOffset+=a.offsetLeft,t.y.targetOffset+=a.offsetTop,a=a.offsetParent}t.x.targetLength=n===e?n.scrollWidth:n.clientWidth,t.y.targetLength=n===e?n.scrollHeight:n.clientHeight,t.x.containerLength=e.clientWidth,t.y.containerLength=e.clientHeight}function Hr(e,n,t,a={}){return{measure:r=>{Ur(e,a.target,t),Lr(e,t,r),(a.offset||a.target)&&zr(e,t,a)},notify:()=>n(t)}}const xe=new WeakMap;let X;const pt=(e,n,t)=>(a,r)=>r&&r[0]?r[0][e+"Size"]:ta(a)&&"getBBox"in a?a.getBBox()[n]:a[t],Fr=pt("inline","width","offsetWidth"),Vr=pt("block","height","offsetHeight");function qr({target:e,borderBoxSize:n}){var t;(t=xe.get(e))==null||t.forEach(a=>{a(e,{get width(){return Fr(e,n)},get height(){return Vr(e,n)}})})}function Wr(e){e.forEach(qr)}function Nr(){typeof ResizeObserver>"u"||(X=new ResizeObserver(Wr))}function Yr(e,n){X||Nr();const t=na(e);return t.forEach(a=>{let r=xe.get(a);r||(r=new Set,xe.set(a,r)),r.add(n),X?.observe(a)}),()=>{t.forEach(a=>{const r=xe.get(a);r?.delete(n),r?.size||X?.unobserve(a)})}}const we=new Set;let K;function Zr(){K=()=>{const e={get width(){return window.innerWidth},get height(){return window.innerHeight}};we.forEach(n=>n(e))},window.addEventListener("resize",K)}function Xr(e){return we.add(e),K||Zr(),()=>{we.delete(e),!we.size&&typeof K=="function"&&(window.removeEventListener("resize",K),K=void 0)}}function Kr(e,n){return typeof e=="function"?Xr(e):Yr(e,n)}const se=new WeakMap,Dn=new WeakMap,_e=new WeakMap,Cn=e=>e===document.scrollingElement?window:e;function mt(e,{container:n=document.scrollingElement,...t}={}){if(!n)return In;let a=_e.get(n);a||(a=new Set,_e.set(n,a));const r=Or(),l=Hr(n,e,r,t);if(a.add(l),!se.has(n)){const i=()=>{for(const f of a)f.measure(jn.timestamp);J.preUpdate(u)},u=()=>{for(const f of a)f.notify()},d=()=>J.read(i);se.set(n,d);const s=Cn(n);window.addEventListener("resize",d,{passive:!0}),n!==document.documentElement&&Dn.set(n,Kr(n,d)),s.addEventListener("scroll",d,{passive:!0}),d()}const o=se.get(n);return J.read(o,!1,!0),()=>{var i;Ke(o);const u=_e.get(n);if(!u||(u.delete(l),u.size))return;const d=se.get(n);se.delete(n),d&&(Cn(n).removeEventListener("scroll",d),(i=Dn.get(n))==null||i(),window.removeEventListener("resize",d))}}const Sn=new Map;function Jr(e){const n={value:0},t=mt(a=>{n.value=a[e.axis].progress*100},e);return{currentTime:n,cancel:t}}function gt({source:e,container:n,...t}){const{axis:a}=t;e&&(n=e);const r=Sn.get(n)??new Map;Sn.set(n,r);const l=t.target??"self",o=r.get(l)??{},i=a+(t.offset??[]).join(",");return o[i]||(o[i]=!t.target&&aa()?new ScrollTimeline({source:n,axis:a}):Jr({container:n,...t})),o[i]}function yt(e,n){let t;const a=()=>{const{currentTime:r}=n,o=(r===null?0:r.value)/100;t!==o&&e(o),t=o};return J.preUpdate(a,!0),()=>Ke(a)}function Gr(e,n){const t=gt(n);return e.attachTimeline({timeline:n.target?void 0:t,observe:a=>(a.pause(),yt(r=>{a.time=a.iterationDuration*r},t))})}function Qr(e){return e.length===2}function el(e,n){return Qr(e)?mt(t=>{e(t[n.axis].progress,t)},n):yt(e,gt(n))}function nl(e,{axis:n="y",container:t=document.scrollingElement,...a}={}){if(!t)return In;const r={axis:n,container:t,...a};return typeof e=="function"?el(e,r):Gr(e,r)}function Be(...e){const n=!Array.isArray(e[0]),t=n?0:-1,a=e[0+t],r=e[1+t],l=e[2+t],o=e[3+t],i=Bn(r,l,o);return n?i(a):i}function vt(e){const n=W(e()),t=()=>n.set(e()),a=()=>J.preRender(t,!1,!0);let r;const l=i=>{r=i.map(u=>u.on("change",a))},o=()=>{r.forEach(i=>i()),Ke(t)};return En(()=>{o()}),{subscribe:l,unsubscribe:o,value:n,updateValue:t}}function tl(e){Z.current=[];const{value:n,subscribe:t,unsubscribe:a,updateValue:r}=vt(e);return t(Z.current),Z.current=void 0,Rn(()=>{a(),Z.current=[],r(),t(Z.current),Z.current=void 0}),n}function al(e,n,t,a){if(typeof e=="function")return tl(e);let r,l;if(Ie(n)){const o=W(0);let i=Be(n.value,t,a);Q(n,u=>{i=Be(u,t,a),o.set(o.get()+1)},{flush:"sync"}),l=u=>Array.isArray(u)?i(u[0]):i(u),r=Array.isArray(e)?[...e,o]:[e,o]}else l=Be(n,t,a),r=Array.isArray(e)?e:[e];return Array.isArray(e)?Mn(r,l):Mn(r,o=>l(o[0]))}function Mn(e,n){const t=[],a=()=>{t.length=0;const o=e.length;for(let i=0;i<o;i++)t[i]=e[i].get();return n(t)},{value:r,subscribe:l}=vt(a);return l(e),r}function kn(e){return typeof e=="number"?e:parseFloat(e)}function rl(e,n={}){let t=null;const a=W(fn(e)?kn(e.get()):e);let r=a.get(),l=()=>{};const o=()=>{t&&(t.stop(),t=null)},i=()=>{const u=t;u?.time===0&&u.sample(jn.delta),o();const d=Ie(n)?n.value:n;t=ra({keyframes:[a.get(),r],velocity:a.getVelocity(),type:"spring",restDelta:.001,restSpeed:.01,...d,onUpdate:l})};return Q(()=>Ie(n)?n.value:n,()=>{a.attach((u,d)=>(r=u,l=d,J.update(i),a.get()),o)},{immediate:!0}),fn(e)&&e.on("change",u=>{a.set(kn(u))}),a}const ll=typeof window>"u";function ol(){return{scrollX:W(0),scrollY:W(0),scrollXProgress:W(0),scrollYProgress:W(0)}}function il(e={}){const n=ol();return Rn(t=>{if(ll)return;const a=nl((r,{x:l,y:o})=>{n.scrollX.set(l.current),n.scrollXProgress.set(l.progress),n.scrollY.set(o.current),n.scrollYProgress.set(o.progress)},{offset:C(e.offset),axis:C(e.axis),container:hn(e.container),target:hn(e.target)});t(()=>{a()})},{flush:"post"}),n}const sl={slots:{root:"relative",container:"flex flex-col gap-y-8 sm:gap-y-12 lg:gap-y-16",indicator:"absolute hidden lg:block overflow-hidden inset-y-3 start-32 h-full w-px bg-border -ms-[8.5px]",beam:"absolute start-0 top-0 w-full bg-primary will-change-[height]"}},ul={__name:"UChangelogVersions",props:{as:{type:null,required:!1},versions:{type:Array,required:!1},indicator:{type:[Boolean,Object],required:!1,default:!0},indicatorMotion:{type:[Boolean,Object],required:!1,default:!0},class:{type:null,required:!1},ui:{type:null,required:!1}},setup(e){const n=e,t=Ye(),a=()=>Nt(t,["default","indicator"]),r=Ze(),l=T(()=>Yt(typeof n.indicatorMotion=="object"?n.indicatorMotion:{},{damping:30,restDelta:.001})),o=T(()=>typeof n.indicator=="object"?n.indicator:{}),{scrollYProgress:i}=il(o.value),u=rl(i,l),d=al(()=>`${u.get()*100}%`),s=T(()=>ee({extend:ee(sl),...r.ui?.changelogVersions||{}})());return(f,p)=>(x(),L(C(Xe),{as:e.as,"data-slot":"root",class:S(s.value.root({class:[n.ui?.root,n.class]}))},{default:_(()=>[n.indicator||t.indicator?(x(),O("div",{key:0,"data-slot":"indicator",class:S(s.value.indicator({class:n.ui?.indicator}))},[E(f.$slots,"indicator",{},()=>[n.indicatorMotion?(x(),L(C(la),{key:0,"data-slot":"beam",class:S(s.value.beam({class:n.ui?.beam})),style:qt({height:C(d)})},null,8,["class","style"])):M("",!0)])],2)):M("",!0),e.versions?.length||t.default?(x(),O("div",{key:1,"data-slot":"container",class:S(s.value.container({class:n.ui?.container}))},[E(f.$slots,"default",{},()=>[(x(!0),O(De,null,Ce(e.versions,(g,h)=>(x(),L(ht,B({key:h,indicator:!!n.indicator},{ref_for:!0},g),Wt({_:2},[Ce(a(),(b,m)=>({name:m,fn:_(y=>[E(f.$slots,m,B({ref_for:!0},y,{version:g}))])}))]),1040,["indicator"]))),128))])],2)):M("",!0)]),_:3},8,["as","class"]))}},cl=`---
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



### 搭建

\`\`\`[npm]
cd /Users/charlot98/vetvault/changelog
npm run generate
cd .output && node ../scripts/preview-copy.cjs
\`\`\`
`,hl=`---
tag: v1.1.1
title: 🐣V1.1.1
date: 2026-02-25
---

### 新增
[更新日志](https://charlot98.github.io/vetvault_changelog/)
- [x] 手动部署更新日志至[charlot98.github.io/changelog](https://charlot98.github.io/vetvault_changelog/)
- [x] 添加项目[进度条]()
- [x] 界面客制化[nuxt changelog](https://changelog-template.nuxt.dev/) 

[Paperpile文献库](https://app.paperpile.com/)
- [x] Notes内添加中文标题、中文关键词、中文标签，便于检索。

[心超助手](https://charlot98.github.io/echocardiography/echocardiography.html)
- [x] 优化[心超助手界面](https://charlot98.github.io/echocardiography/echocardiography.html) 
- [x] 新增\`EDV\`、\`ESV\`、\`FS\`、\`EF\`自动计算，保留手动更改权限；
- [x] 新增\`spherical法\`计算EDV、ESV、EF，适用于心衰或心脏偏球形动物的计算；
- [x] 新增手动\`刷新\`按钮；
- [x] 新增\`选择体重参考范围\`功能，输入体重后，可依据动物体型，选择略大于或略小于体重的参考范围。
- [x] 新增\`提示\`功能。





### \`待办\`

- [ ] 报告对比demo优化
- [ ] oss标准存储，适用于病例库搭建
- [ ] NAS存储
- [ ] Highchart数据统计[demo库](https://highcharts.com.cn/demo/)`,pl={class:"w-full text-left vv-mdc-body"},ml=Tn({__name:"index",setup(e){const n=Object.assign({"../../content/1 test.md":cl,"../../content/2.md":dl,"../../content/3.md":fl,"../../content/4.md":hl});function t(r){const l=r.match(/^---\n([\s\S]*?)\n---\n?/);if(!l)return{meta:{},body:r};const o={},u=(l[1]||"").split(`
`);for(const s of u){const f=s.indexOf(":");if(f===-1)continue;const p=s.slice(0,f).trim(),g=s.slice(f+1).trim();p&&(o[p]=g)}const d=r.slice(l[0].length).trim();return{meta:o,body:d}}const a=T(()=>Object.entries(n).map(([l,o])=>{const{meta:i,body:u}=t(o),d=l.split("/").pop()?.replace(/\.md$/,"")||"untitled",s=d.split("-").slice(0,3).join("-");return{tag:i.tag||d,title:i.title||i.tag||d,date:i.date||s||"1970-01-01",markdown:u}}).sort((l,o)=>new Date(o.date).getTime()-new Date(l.date).getTime()));return(r,l)=>{const o=Cr,i=ht,u=ul;return x(),L(u,{as:"main","indicator-motion":!1,ui:{root:"py-16 sm:py-24 lg:py-32",indicator:"inset-y-0"}},{default:_(()=>[(x(!0),O(De,null,Ce(C(a),(d,s)=>(x(),L(i,B({key:`${d.tag}-${d.date}-${s}`},{ref_for:!0},d,{ui:{root:"flex items-start justify-start",container:"w-full max-w-2xl !ml-0 !mr-auto text-left pl-18 sm:pl-20",header:"border-b border-default pb-4 text-left",title:"text-3xl",date:"text-xs/9 text-highlighted font-mono text-left",indicator:"sticky top-0 pt-16 -mt-16 sm:pt-24 sm:-mt-24 lg:pt-32 lg:-mt-32"}}),{body:_(()=>[q("div",pl,[d.markdown?(x(),L(o,{key:0,value:d.markdown},null,8,["value"])):M("",!0)])]),_:2},1040))),128))]),_:1})}}}),$l=Object.freeze(Object.defineProperty({__proto__:null,default:ml},Symbol.toStringTag,{value:"Module"}));export{ar as a,Qa as f,tr as h,$l as i,He as n,wl as s};
