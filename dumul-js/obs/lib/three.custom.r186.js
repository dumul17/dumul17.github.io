var ha="186";var Zl=0,ua=1,Jl=2;var $i=1,$l=2,Ei=3,Ai=0,Ne=1,$e=2,Ke=0,Ki=1,Ws=2,da=3,fa=4,pa=5;var Hn=100,Kl=101,Ql=102,jl=103,tc=104,ec=200,ma=201,nc=202,ic=203,sc=204,ga=205,rc=206,ac=207,oc=208,lc=209,cc=210,hc=211,uc=212,dc=213,fc=214,pc=0,mc=1,gc=2,_a=3,_c=4,xc=5,vc=6,yc=7,Sc=0,Mc=1,bc=2,Qe=0,xa=1,va=2,ya=3,Xs=4,Sa=5,Ma=6,ba=7;var wi=301,Vn=302,qs=303,Ys=304,Qi=306,Ta=1000,Zs=1001,Tc=1002,In=1003,Ec=1004;var ji=1005;var De=1006,Js=1007;var Wn=1008;var je=1009,Ac=1010,wc=1011,ts=1012,Ea=1013,Pn=1014,yn=1015,ln=1016,Aa=1017,wa=1018,Ci=1020,Cc=35902,Rc=35899,Ic=1021,Pc=1022,tn=1023,Xn=1026,qn=1027,Lc=1028,Ca=1029,Yn=1030,Ra=1031;var Ia=1033,$s=33776,Ks=33777,Qs=33778,js=33779,Pa=35840,La=35841,Na=35842,Da=35843,Ua=36196,Fa=37492,Oa=37496,Ba=37488,za=37489,tr=37490,Ga=37491,ka=37808,Ha=37809,Va=37810,Wa=37811,Xa=37812,qa=37813,Ya=37814,Za=37815,Ja=37816,$a=37817,Ka=37818,Qa=37819,ja=37820,to=37821,eo=36492,no=36494,io=36495,so=36283,ro=36284,er=36285,ao=36286;var oo=0,Nc=1,Zn="",lo="srgb",co="srgb-linear",ho="linear",de="srgb";var Dc=512,Uc=513,Fc=514,nr=515,Oc=516,Bc=517,ir=518,zc=519;var Gc=35048;var uo="300 es",fo=2000;function Xh(t){for(let e=t.length-1;e>=0;--e)if(t[e]>=65535)return!0;return!1}function qh(t){return ArrayBuffer.isView(t)&&!(t instanceof DataView)}function Wi(t){return document.createElementNS("http://www.w3.org/1999/xhtml",t)}function kc(){let t=Wi("canvas");return t.style.display="block",t}var vl={},bi=null;function Xi(...t){let e="THREE."+t.shift();if(bi)bi("log",e,...t);else console.log(e,...t)}function Hc(t){let e=t[0];if(typeof e==="string"&&e.startsWith("TSL:")){let n=t[1];if(n&&n.isStackTrace)t[0]+=" "+n.getLocation();else t[1]='Stack trace not available. Enable "THREE.Node.captureStackTrace" to capture stack traces.'}return t}function zt(...t){t=Hc(t);let e="THREE."+t.shift();if(bi)bi("warn",e,...t);else{let n=t[0];if(n&&n.isStackTrace)console.warn(n.getError(e));else console.warn(e,...t)}}function Bt(...t){t=Hc(t);let e="THREE."+t.shift();if(bi)bi("error",e,...t);else{let n=t[0];if(n&&n.isStackTrace)console.error(n.getError(e));else console.error(e,...t)}}function Gn(...t){let e=t.join(" ");if(e in vl)return;vl[e]=!0,zt(...t)}function Vc(t,e,n){return new Promise(function(i,s){function r(){switch(t.clientWaitSync(e,t.SYNC_FLUSH_COMMANDS_BIT,0)){case t.WAIT_FAILED:s();break;case t.TIMEOUT_EXPIRED:setTimeout(r,n);break;default:i()}}setTimeout(r,n)})}var Wc={[0]:1,[2]:6,[4]:7,[3]:5,[1]:0,[6]:2,[7]:4,[5]:3};class Sn{addEventListener(t,e){if(this._listeners===void 0)this._listeners={};let n=this._listeners;if(n[t]===void 0)n[t]=[];if(n[t].indexOf(e)===-1)n[t].push(e)}hasEventListener(t,e){let n=this._listeners;if(n===void 0)return!1;return n[t]!==void 0&&n[t].indexOf(e)!==-1}removeEventListener(t,e){let n=this._listeners;if(n===void 0)return;let i=n[t];if(i!==void 0){let s=i.indexOf(e);if(s!==-1)i.splice(s,1)}}dispatchEvent(t){let e=this._listeners;if(e===void 0)return;let n=e[t.type];if(n!==void 0){t.target=this;let i=n.slice(0);for(let s=0,r=i.length;s<r;s++)i[s].call(this,t);t.target=null}}}var Ce=["00","01","02","03","04","05","06","07","08","09","0a","0b","0c","0d","0e","0f","10","11","12","13","14","15","16","17","18","19","1a","1b","1c","1d","1e","1f","20","21","22","23","24","25","26","27","28","29","2a","2b","2c","2d","2e","2f","30","31","32","33","34","35","36","37","38","39","3a","3b","3c","3d","3e","3f","40","41","42","43","44","45","46","47","48","49","4a","4b","4c","4d","4e","4f","50","51","52","53","54","55","56","57","58","59","5a","5b","5c","5d","5e","5f","60","61","62","63","64","65","66","67","68","69","6a","6b","6c","6d","6e","6f","70","71","72","73","74","75","76","77","78","79","7a","7b","7c","7d","7e","7f","80","81","82","83","84","85","86","87","88","89","8a","8b","8c","8d","8e","8f","90","91","92","93","94","95","96","97","98","99","9a","9b","9c","9d","9e","9f","a0","a1","a2","a3","a4","a5","a6","a7","a8","a9","aa","ab","ac","ad","ae","af","b0","b1","b2","b3","b4","b5","b6","b7","b8","b9","ba","bb","bc","bd","be","bf","c0","c1","c2","c3","c4","c5","c6","c7","c8","c9","ca","cb","cc","cd","ce","cf","d0","d1","d2","d3","d4","d5","d6","d7","d8","d9","da","db","dc","dd","de","df","e0","e1","e2","e3","e4","e5","e6","e7","e8","e9","ea","eb","ec","ed","ee","ef","f0","f1","f2","f3","f4","f5","f6","f7","f8","f9","fa","fb","fc","fd","fe","ff"];var Ur=Math.PI/180,ks=180/Math.PI;function xn(){let t=Math.random()*4294967295|0,e=Math.random()*4294967295|0,n=Math.random()*4294967295|0,i=Math.random()*4294967295|0;return(Ce[t&255]+Ce[t>>8&255]+Ce[t>>16&255]+Ce[t>>24&255]+"-"+Ce[e&255]+Ce[e>>8&255]+"-"+Ce[e>>16&15|64]+Ce[e>>24&255]+"-"+Ce[n&63|128]+Ce[n>>8&255]+"-"+Ce[n>>16&255]+Ce[n>>24&255]+Ce[i&255]+Ce[i>>8&255]+Ce[i>>16&255]+Ce[i>>24&255]).toLowerCase()}function Qt(t,e,n){return Math.max(e,Math.min(n,t))}function Yh(t,e){return(t%e+e)%e}function Fr(t,e,n){return(1-n)*t+n*e}function an(t,e){switch(e.constructor){case Float32Array:return t;case Uint32Array:return t/4294967295;case Uint16Array:return t/65535;case Uint8Array:case Uint8ClampedArray:return t/255;case Int32Array:return Math.max(t/2147483647,-1);case Int16Array:return Math.max(t/32767,-1);case Int8Array:return Math.max(t/127,-1);default:throw Error("THREE.MathUtils: Invalid component type.")}}function ce(t,e){switch(e.constructor){case Float32Array:return t;case Uint32Array:return Math.round(t*4294967295);case Uint16Array:return Math.round(t*65535);case Uint8Array:case Uint8ClampedArray:return Math.round(t*255);case Int32Array:return Math.round(t*2147483647);case Int16Array:return Math.round(t*32767);case Int8Array:return Math.round(t*127);default:throw Error("THREE.MathUtils: Invalid component type.")}}class lt{static{lt.prototype.isVector2=!0}constructor(t=0,e=0){this.x=t,this.y=e}get width(){return this.x}set width(t){this.x=t}get height(){return this.y}set height(t){this.y=t}set(t,e){return this.x=t,this.y=e,this}setScalar(t){return this.x=t,this.y=t,this}setX(t){return this.x=t,this}setY(t){return this.y=t,this}setComponent(t,e){switch(t){case 0:this.x=e;break;case 1:this.y=e;break;default:throw Error("THREE.Vector2: index is out of range: "+t)}return this}getComponent(t){switch(t){case 0:return this.x;case 1:return this.y;default:throw Error("THREE.Vector2: index is out of range: "+t)}}clone(){return new this.constructor(this.x,this.y)}copy(t){return this.x=t.x,this.y=t.y,this}add(t){return this.x+=t.x,this.y+=t.y,this}addScalar(t){return this.x+=t,this.y+=t,this}addVectors(t,e){return this.x=t.x+e.x,this.y=t.y+e.y,this}addScaledVector(t,e){return this.x+=t.x*e,this.y+=t.y*e,this}sub(t){return this.x-=t.x,this.y-=t.y,this}subScalar(t){return this.x-=t,this.y-=t,this}subVectors(t,e){return this.x=t.x-e.x,this.y=t.y-e.y,this}multiply(t){return this.x*=t.x,this.y*=t.y,this}multiplyScalar(t){return this.x*=t,this.y*=t,this}divide(t){return this.x/=t.x,this.y/=t.y,this}divideScalar(t){return this.multiplyScalar(1/t)}applyMatrix3(t){let e=this.x,n=this.y,i=t.elements;return this.x=i[0]*e+i[3]*n+i[6],this.y=i[1]*e+i[4]*n+i[7],this}min(t){return this.x=Math.min(this.x,t.x),this.y=Math.min(this.y,t.y),this}max(t){return this.x=Math.max(this.x,t.x),this.y=Math.max(this.y,t.y),this}clamp(t,e){return this.x=Qt(this.x,t.x,e.x),this.y=Qt(this.y,t.y,e.y),this}clampScalar(t,e){return this.x=Qt(this.x,t,e),this.y=Qt(this.y,t,e),this}clampLength(t,e){let n=this.length();return this.divideScalar(n||1).multiplyScalar(Qt(n,t,e))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this}negate(){return this.x=-this.x,this.y=-this.y,this}dot(t){return this.x*t.x+this.y*t.y}cross(t){return this.x*t.y-this.y*t.x}lengthSq(){return this.x*this.x+this.y*this.y}length(){return Math.sqrt(this.x*this.x+this.y*this.y)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)}normalize(){return this.divideScalar(this.length()||1)}angle(){return Math.atan2(-this.y,-this.x)+Math.PI}angleTo(t){let e=Math.sqrt(this.lengthSq()*t.lengthSq());if(e===0)return Math.PI/2;let n=this.dot(t)/e;return Math.acos(Qt(n,-1,1))}distanceTo(t){return Math.sqrt(this.distanceToSquared(t))}distanceToSquared(t){let e=this.x-t.x,n=this.y-t.y;return e*e+n*n}manhattanDistanceTo(t){return Math.abs(this.x-t.x)+Math.abs(this.y-t.y)}setLength(t){return this.normalize().multiplyScalar(t)}lerp(t,e){return this.x+=(t.x-this.x)*e,this.y+=(t.y-this.y)*e,this}lerpVectors(t,e,n){return this.x=t.x+(e.x-t.x)*n,this.y=t.y+(e.y-t.y)*n,this}equals(t){return t.x===this.x&&t.y===this.y}fromArray(t,e=0){return this.x=t[e],this.y=t[e+1],this}toArray(t=[],e=0){return t[e]=this.x,t[e+1]=this.y,t}fromBufferAttribute(t,e){return this.x=t.getX(e),this.y=t.getY(e),this}rotateAround(t,e){let n=Math.cos(e),i=Math.sin(e),s=this.x-t.x,r=this.y-t.y;return this.x=s*n-r*i+t.x,this.y=s*i+r*n+t.y,this}random(){return this.x=Math.random(),this.y=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y}}class cn{constructor(t=0,e=0,n=0,i=1){this.isQuaternion=!0,this._x=t,this._y=e,this._z=n,this._w=i}static slerpFlat(t,e,n,i,s,r,a){let o=n[i+0],l=n[i+1],c=n[i+2],u=n[i+3],f=s[r+0],h=s[r+1],m=s[r+2],v=s[r+3];if(u!==v||o!==f||l!==h||c!==m){let T=o*f+l*h+c*m+u*v;if(T<0)f=-f,h=-h,m=-m,v=-v,T=-T;let p=1-a;if(T<0.9995){let d=Math.acos(T),E=Math.sin(d);p=Math.sin(p*d)/E,a=Math.sin(a*d)/E,o=o*p+f*a,l=l*p+h*a,c=c*p+m*a,u=u*p+v*a}else{o=o*p+f*a,l=l*p+h*a,c=c*p+m*a,u=u*p+v*a;let d=1/Math.sqrt(o*o+l*l+c*c+u*u);o*=d,l*=d,c*=d,u*=d}}t[e]=o,t[e+1]=l,t[e+2]=c,t[e+3]=u}static multiplyQuaternionsFlat(t,e,n,i,s,r){let a=n[i],o=n[i+1],l=n[i+2],c=n[i+3],u=s[r],f=s[r+1],h=s[r+2],m=s[r+3];return t[e]=a*m+c*u+o*h-l*f,t[e+1]=o*m+c*f+l*u-a*h,t[e+2]=l*m+c*h+a*f-o*u,t[e+3]=c*m-a*u-o*f-l*h,t}get x(){return this._x}set x(t){this._x=t,this._onChangeCallback()}get y(){return this._y}set y(t){this._y=t,this._onChangeCallback()}get z(){return this._z}set z(t){this._z=t,this._onChangeCallback()}get w(){return this._w}set w(t){this._w=t,this._onChangeCallback()}set(t,e,n,i){return this._x=t,this._y=e,this._z=n,this._w=i,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._w)}copy(t){return this._x=t.x,this._y=t.y,this._z=t.z,this._w=t.w,this._onChangeCallback(),this}setFromEuler(t,e=!0){let{_x:n,_y:i,_z:s,_order:r}=t,{cos:a,sin:o}=Math,l=a(n/2),c=a(i/2),u=a(s/2),f=o(n/2),h=o(i/2),m=o(s/2);switch(r){case"XYZ":this._x=f*c*u+l*h*m,this._y=l*h*u-f*c*m,this._z=l*c*m+f*h*u,this._w=l*c*u-f*h*m;break;case"YXZ":this._x=f*c*u+l*h*m,this._y=l*h*u-f*c*m,this._z=l*c*m-f*h*u,this._w=l*c*u+f*h*m;break;case"ZXY":this._x=f*c*u-l*h*m,this._y=l*h*u+f*c*m,this._z=l*c*m+f*h*u,this._w=l*c*u-f*h*m;break;case"ZYX":this._x=f*c*u-l*h*m,this._y=l*h*u+f*c*m,this._z=l*c*m-f*h*u,this._w=l*c*u+f*h*m;break;case"YZX":this._x=f*c*u+l*h*m,this._y=l*h*u+f*c*m,this._z=l*c*m-f*h*u,this._w=l*c*u-f*h*m;break;case"XZY":this._x=f*c*u-l*h*m,this._y=l*h*u-f*c*m,this._z=l*c*m+f*h*u,this._w=l*c*u+f*h*m;break;default:zt("Quaternion: .setFromEuler() encountered an unknown order: "+r)}if(e===!0)this._onChangeCallback();return this}setFromAxisAngle(t,e){let n=e/2,i=Math.sin(n);return this._x=t.x*i,this._y=t.y*i,this._z=t.z*i,this._w=Math.cos(n),this._onChangeCallback(),this}setFromRotationMatrix(t){let e=t.elements,n=e[0],i=e[4],s=e[8],r=e[1],a=e[5],o=e[9],l=e[2],c=e[6],u=e[10],f=n+a+u;if(f>0){let h=0.5/Math.sqrt(f+1);this._w=0.25/h,this._x=(c-o)*h,this._y=(s-l)*h,this._z=(r-i)*h}else if(n>a&&n>u){let h=2*Math.sqrt(1+n-a-u);this._w=(c-o)/h,this._x=0.25*h,this._y=(i+r)/h,this._z=(s+l)/h}else if(a>u){let h=2*Math.sqrt(1+a-n-u);this._w=(s-l)/h,this._x=(i+r)/h,this._y=0.25*h,this._z=(o+c)/h}else{let h=2*Math.sqrt(1+u-n-a);this._w=(r-i)/h,this._x=(s+l)/h,this._y=(o+c)/h,this._z=0.25*h}return this._onChangeCallback(),this}setFromUnitVectors(t,e){let n=t.dot(e)+1;if(n<0.00000001)if(n=0,Math.abs(t.x)>Math.abs(t.z))this._x=-t.y,this._y=t.x,this._z=0,this._w=n;else this._x=0,this._y=-t.z,this._z=t.y,this._w=n;else this._x=t.y*e.z-t.z*e.y,this._y=t.z*e.x-t.x*e.z,this._z=t.x*e.y-t.y*e.x,this._w=n;return this.normalize()}angleTo(t){return 2*Math.acos(Math.abs(Qt(this.dot(t),-1,1)))}rotateTowards(t,e){let n=this.angleTo(t);if(n===0)return this;let i=Math.min(1,e/n);return this.slerp(t,i),this}identity(){return this.set(0,0,0,1)}invert(){return this.conjugate()}conjugate(){return this._x*=-1,this._y*=-1,this._z*=-1,this._onChangeCallback(),this}dot(t){return this._x*t._x+this._y*t._y+this._z*t._z+this._w*t._w}lengthSq(){return this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w}length(){return Math.sqrt(this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w)}normalize(){let t=this.length();if(t===0)this._x=0,this._y=0,this._z=0,this._w=1;else t=1/t,this._x=this._x*t,this._y=this._y*t,this._z=this._z*t,this._w=this._w*t;return this._onChangeCallback(),this}multiply(t){return this.multiplyQuaternions(this,t)}premultiply(t){return this.multiplyQuaternions(t,this)}multiplyQuaternions(t,e){let{_x:n,_y:i,_z:s,_w:r}=t,{_x:a,_y:o,_z:l,_w:c}=e;return this._x=n*c+r*a+i*l-s*o,this._y=i*c+r*o+s*a-n*l,this._z=s*c+r*l+n*o-i*a,this._w=r*c-n*a-i*o-s*l,this._onChangeCallback(),this}slerp(t,e){let{_x:n,_y:i,_z:s,_w:r}=t,a=this.dot(t);if(a<0)n=-n,i=-i,s=-s,r=-r,a=-a;let o=1-e;if(a<0.9995){let l=Math.acos(a),c=Math.sin(l);o=Math.sin(o*l)/c,e=Math.sin(e*l)/c,this._x=this._x*o+n*e,this._y=this._y*o+i*e,this._z=this._z*o+s*e,this._w=this._w*o+r*e,this._onChangeCallback()}else this._x=this._x*o+n*e,this._y=this._y*o+i*e,this._z=this._z*o+s*e,this._w=this._w*o+r*e,this.normalize();return this}slerpQuaternions(t,e,n){return this.copy(t).slerp(e,n)}random(){let t=2*Math.PI*Math.random(),e=2*Math.PI*Math.random(),n=Math.random(),i=Math.sqrt(1-n),s=Math.sqrt(n);return this.set(i*Math.sin(t),i*Math.cos(t),s*Math.sin(e),s*Math.cos(e))}equals(t){return t._x===this._x&&t._y===this._y&&t._z===this._z&&t._w===this._w}fromArray(t,e=0){return this._x=t[e],this._y=t[e+1],this._z=t[e+2],this._w=t[e+3],this._onChangeCallback(),this}toArray(t=[],e=0){return t[e]=this._x,t[e+1]=this._y,t[e+2]=this._z,t[e+3]=this._w,t}fromBufferAttribute(t,e){return this._x=t.getX(e),this._y=t.getY(e),this._z=t.getZ(e),this._w=t.getW(e),this._onChangeCallback(),this}toJSON(){return this.toArray()}_onChange(t){return this._onChangeCallback=t,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._w}}class P{static{P.prototype.isVector3=!0}constructor(t=0,e=0,n=0){this.x=t,this.y=e,this.z=n}set(t,e,n){if(n===void 0)n=this.z;return this.x=t,this.y=e,this.z=n,this}setScalar(t){return this.x=t,this.y=t,this.z=t,this}setX(t){return this.x=t,this}setY(t){return this.y=t,this}setZ(t){return this.z=t,this}setComponent(t,e){switch(t){case 0:this.x=e;break;case 1:this.y=e;break;case 2:this.z=e;break;default:throw Error("THREE.Vector3: index is out of range: "+t)}return this}getComponent(t){switch(t){case 0:return this.x;case 1:return this.y;case 2:return this.z;default:throw Error("THREE.Vector3: index is out of range: "+t)}}clone(){return new this.constructor(this.x,this.y,this.z)}copy(t){return this.x=t.x,this.y=t.y,this.z=t.z,this}add(t){return this.x+=t.x,this.y+=t.y,this.z+=t.z,this}addScalar(t){return this.x+=t,this.y+=t,this.z+=t,this}addVectors(t,e){return this.x=t.x+e.x,this.y=t.y+e.y,this.z=t.z+e.z,this}addScaledVector(t,e){return this.x+=t.x*e,this.y+=t.y*e,this.z+=t.z*e,this}sub(t){return this.x-=t.x,this.y-=t.y,this.z-=t.z,this}subScalar(t){return this.x-=t,this.y-=t,this.z-=t,this}subVectors(t,e){return this.x=t.x-e.x,this.y=t.y-e.y,this.z=t.z-e.z,this}multiply(t){return this.x*=t.x,this.y*=t.y,this.z*=t.z,this}multiplyScalar(t){return this.x*=t,this.y*=t,this.z*=t,this}multiplyVectors(t,e){return this.x=t.x*e.x,this.y=t.y*e.y,this.z=t.z*e.z,this}applyEuler(t){return this.applyQuaternion(yl.setFromEuler(t))}applyAxisAngle(t,e){return this.applyQuaternion(yl.setFromAxisAngle(t,e))}applyMatrix3(t){let e=this.x,n=this.y,i=this.z,s=t.elements;return this.x=s[0]*e+s[3]*n+s[6]*i,this.y=s[1]*e+s[4]*n+s[7]*i,this.z=s[2]*e+s[5]*n+s[8]*i,this}applyNormalMatrix(t){return this.applyMatrix3(t).normalize()}applyMatrix4(t){let e=this.x,n=this.y,i=this.z,s=t.elements,r=1/(s[3]*e+s[7]*n+s[11]*i+s[15]);return this.x=(s[0]*e+s[4]*n+s[8]*i+s[12])*r,this.y=(s[1]*e+s[5]*n+s[9]*i+s[13])*r,this.z=(s[2]*e+s[6]*n+s[10]*i+s[14])*r,this}applyQuaternion(t){let e=this.x,n=this.y,i=this.z,{x:s,y:r,z:a,w:o}=t,l=2*(r*i-a*n),c=2*(a*e-s*i),u=2*(s*n-r*e);return this.x=e+o*l+r*u-a*c,this.y=n+o*c+a*l-s*u,this.z=i+o*u+s*c-r*l,this}project(t){return this.applyMatrix4(t.matrixWorldInverse).applyMatrix4(t.projectionMatrix)}unproject(t){return this.applyMatrix4(t.projectionMatrixInverse).applyMatrix4(t.matrixWorld)}transformDirection(t){let e=this.x,n=this.y,i=this.z,s=t.elements;return this.x=s[0]*e+s[4]*n+s[8]*i,this.y=s[1]*e+s[5]*n+s[9]*i,this.z=s[2]*e+s[6]*n+s[10]*i,this.normalize()}divide(t){return this.x/=t.x,this.y/=t.y,this.z/=t.z,this}divideScalar(t){return this.multiplyScalar(1/t)}min(t){return this.x=Math.min(this.x,t.x),this.y=Math.min(this.y,t.y),this.z=Math.min(this.z,t.z),this}max(t){return this.x=Math.max(this.x,t.x),this.y=Math.max(this.y,t.y),this.z=Math.max(this.z,t.z),this}clamp(t,e){return this.x=Qt(this.x,t.x,e.x),this.y=Qt(this.y,t.y,e.y),this.z=Qt(this.z,t.z,e.z),this}clampScalar(t,e){return this.x=Qt(this.x,t,e),this.y=Qt(this.y,t,e),this.z=Qt(this.z,t,e),this}clampLength(t,e){let n=this.length();return this.divideScalar(n||1).multiplyScalar(Qt(n,t,e))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this}dot(t){return this.x*t.x+this.y*t.y+this.z*t.z}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)}normalize(){return this.divideScalar(this.length()||1)}setLength(t){return this.normalize().multiplyScalar(t)}lerp(t,e){return this.x+=(t.x-this.x)*e,this.y+=(t.y-this.y)*e,this.z+=(t.z-this.z)*e,this}lerpVectors(t,e,n){return this.x=t.x+(e.x-t.x)*n,this.y=t.y+(e.y-t.y)*n,this.z=t.z+(e.z-t.z)*n,this}cross(t){return this.crossVectors(this,t)}crossVectors(t,e){let{x:n,y:i,z:s}=t,{x:r,y:a,z:o}=e;return this.x=i*o-s*a,this.y=s*r-n*o,this.z=n*a-i*r,this}projectOnVector(t){let e=t.lengthSq();if(e===0)return this.set(0,0,0);let n=t.dot(this)/e;return this.copy(t).multiplyScalar(n)}projectOnPlane(t){return Or.copy(this).projectOnVector(t),this.sub(Or)}reflect(t){return this.sub(Or.copy(t).multiplyScalar(2*this.dot(t)))}angleTo(t){let e=Math.sqrt(this.lengthSq()*t.lengthSq());if(e===0)return Math.PI/2;let n=this.dot(t)/e;return Math.acos(Qt(n,-1,1))}distanceTo(t){return Math.sqrt(this.distanceToSquared(t))}distanceToSquared(t){let e=this.x-t.x,n=this.y-t.y,i=this.z-t.z;return e*e+n*n+i*i}manhattanDistanceTo(t){return Math.abs(this.x-t.x)+Math.abs(this.y-t.y)+Math.abs(this.z-t.z)}setFromSpherical(t){return this.setFromSphericalCoords(t.radius,t.phi,t.theta)}setFromSphericalCoords(t,e,n){let i=Math.sin(e)*t;return this.x=i*Math.sin(n),this.y=Math.cos(e)*t,this.z=i*Math.cos(n),this}setFromCylindrical(t){return this.setFromCylindricalCoords(t.radius,t.theta,t.y)}setFromCylindricalCoords(t,e,n){return this.x=t*Math.sin(e),this.y=n,this.z=t*Math.cos(e),this}setFromMatrixPosition(t){let e=t.elements;return this.x=e[12],this.y=e[13],this.z=e[14],this}setFromMatrixScale(t){let e=this.setFromMatrixColumn(t,0).length(),n=this.setFromMatrixColumn(t,1).length(),i=this.setFromMatrixColumn(t,2).length();return this.x=e,this.y=n,this.z=i,this}setFromMatrixColumn(t,e){return this.fromArray(t.elements,e*4)}setFromMatrix3Column(t,e){return this.fromArray(t.elements,e*3)}setFromEuler(t){return this.x=t._x,this.y=t._y,this.z=t._z,this}setFromColor(t){return this.x=t.r,this.y=t.g,this.z=t.b,this}equals(t){return t.x===this.x&&t.y===this.y&&t.z===this.z}fromArray(t,e=0){return this.x=t[e],this.y=t[e+1],this.z=t[e+2],this}toArray(t=[],e=0){return t[e]=this.x,t[e+1]=this.y,t[e+2]=this.z,t}fromBufferAttribute(t,e){return this.x=t.getX(e),this.y=t.getY(e),this.z=t.getZ(e),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this}randomDirection(){let t=Math.random()*Math.PI*2,e=Math.random()*2-1,n=Math.sqrt(1-e*e);return this.x=n*Math.cos(t),this.y=e,this.z=n*Math.sin(t),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z}}var Or=new P,yl=new cn;class Gt{static{Gt.prototype.isMatrix3=!0}constructor(t,e,n,i,s,r,a,o,l){if(this.elements=[1,0,0,0,1,0,0,0,1],t!==void 0)this.set(t,e,n,i,s,r,a,o,l)}set(t,e,n,i,s,r,a,o,l){let c=this.elements;return c[0]=t,c[1]=i,c[2]=a,c[3]=e,c[4]=s,c[5]=o,c[6]=n,c[7]=r,c[8]=l,this}identity(){return this.set(1,0,0,0,1,0,0,0,1),this}copy(t){let e=this.elements,n=t.elements;return e[0]=n[0],e[1]=n[1],e[2]=n[2],e[3]=n[3],e[4]=n[4],e[5]=n[5],e[6]=n[6],e[7]=n[7],e[8]=n[8],this}extractBasis(t,e,n){return t.setFromMatrix3Column(this,0),e.setFromMatrix3Column(this,1),n.setFromMatrix3Column(this,2),this}setFromMatrix4(t){let e=t.elements;return this.set(e[0],e[4],e[8],e[1],e[5],e[9],e[2],e[6],e[10]),this}multiply(t){return this.multiplyMatrices(this,t)}premultiply(t){return this.multiplyMatrices(t,this)}multiplyMatrices(t,e){let n=t.elements,i=e.elements,s=this.elements,r=n[0],a=n[3],o=n[6],l=n[1],c=n[4],u=n[7],f=n[2],h=n[5],m=n[8],v=i[0],T=i[3],p=i[6],d=i[1],E=i[4],A=i[7],x=i[2],b=i[5],C=i[8];return s[0]=r*v+a*d+o*x,s[3]=r*T+a*E+o*b,s[6]=r*p+a*A+o*C,s[1]=l*v+c*d+u*x,s[4]=l*T+c*E+u*b,s[7]=l*p+c*A+u*C,s[2]=f*v+h*d+m*x,s[5]=f*T+h*E+m*b,s[8]=f*p+h*A+m*C,this}multiplyScalar(t){let e=this.elements;return e[0]*=t,e[3]*=t,e[6]*=t,e[1]*=t,e[4]*=t,e[7]*=t,e[2]*=t,e[5]*=t,e[8]*=t,this}determinant(){let t=this.elements,e=t[0],n=t[1],i=t[2],s=t[3],r=t[4],a=t[5],o=t[6],l=t[7],c=t[8];return e*r*c-e*a*l-n*s*c+n*a*o+i*s*l-i*r*o}invert(){let t=this.elements,e=t[0],n=t[1],i=t[2],s=t[3],r=t[4],a=t[5],o=t[6],l=t[7],c=t[8],u=c*r-a*l,f=a*o-c*s,h=l*s-r*o,m=e*u+n*f+i*h;if(m===0)return this.set(0,0,0,0,0,0,0,0,0);let v=1/m;return t[0]=u*v,t[1]=(i*l-c*n)*v,t[2]=(a*n-i*r)*v,t[3]=f*v,t[4]=(c*e-i*o)*v,t[5]=(i*s-a*e)*v,t[6]=h*v,t[7]=(n*o-l*e)*v,t[8]=(r*e-n*s)*v,this}transpose(){let t,e=this.elements;return t=e[1],e[1]=e[3],e[3]=t,t=e[2],e[2]=e[6],e[6]=t,t=e[5],e[5]=e[7],e[7]=t,this}getNormalMatrix(t){return this.setFromMatrix4(t).invert().transpose()}transposeIntoArray(t){let e=this.elements;return t[0]=e[0],t[1]=e[3],t[2]=e[6],t[3]=e[1],t[4]=e[4],t[5]=e[7],t[6]=e[2],t[7]=e[5],t[8]=e[8],this}setUvTransform(t,e,n,i,s,r,a){let o=Math.cos(s),l=Math.sin(s);return this.set(n*o,n*l,-n*(o*r+l*a)+r+t,-i*l,i*o,-i*(-l*r+o*a)+a+e,0,0,1),this}scale(t,e){return Gn("Matrix3: .scale() is deprecated. Use .makeScale() instead."),this.premultiply(Br.makeScale(t,e)),this}rotate(t){return Gn("Matrix3: .rotate() is deprecated. Use .makeRotation() instead."),this.premultiply(Br.makeRotation(-t)),this}translate(t,e){return Gn("Matrix3: .translate() is deprecated. Use .makeTranslation() instead."),this.premultiply(Br.makeTranslation(t,e)),this}makeTranslation(t,e){if(t.isVector2)this.set(1,0,t.x,0,1,t.y,0,0,1);else this.set(1,0,t,0,1,e,0,0,1);return this}makeRotation(t){let e=Math.cos(t),n=Math.sin(t);return this.set(e,-n,0,n,e,0,0,0,1),this}makeScale(t,e){return this.set(t,0,0,0,e,0,0,0,1),this}equals(t){let e=this.elements,n=t.elements;for(let i=0;i<9;i++)if(e[i]!==n[i])return!1;return!0}fromArray(t,e=0){for(let n=0;n<9;n++)this.elements[n]=t[n+e];return this}toArray(t=[],e=0){let n=this.elements;return t[e]=n[0],t[e+1]=n[1],t[e+2]=n[2],t[e+3]=n[3],t[e+4]=n[4],t[e+5]=n[5],t[e+6]=n[6],t[e+7]=n[7],t[e+8]=n[8],t}clone(){return new this.constructor().fromArray(this.elements)}}var Br=new Gt,Sl=new Gt().set(0.4123908,0.3575843,0.1804808,0.212639,0.7151687,0.0721923,0.0193308,0.1191948,0.9505322),Ml=new Gt().set(3.2409699,-1.5373832,-0.4986108,-0.9692436,1.8759675,0.0415551,0.0556301,-0.203977,1.0569715);function Zh(){let t={enabled:!0,workingColorSpace:"srgb-linear",spaces:{},convert:function(s,r,a){if(this.enabled===!1||r===a||!r||!a)return s;if(this.spaces[r].transfer==="srgb")s.r=vn(s.r),s.g=vn(s.g),s.b=vn(s.b);if(this.spaces[r].primaries!==this.spaces[a].primaries)s.applyMatrix3(this.spaces[r].toXYZ),s.applyMatrix3(this.spaces[a].fromXYZ);if(this.spaces[a].transfer==="srgb")s.r=Mi(s.r),s.g=Mi(s.g),s.b=Mi(s.b);return s},workingToColorSpace:function(s,r){return this.convert(s,this.workingColorSpace,r)},colorSpaceToWorking:function(s,r){return this.convert(s,r,this.workingColorSpace)},getPrimaries:function(s){return this.spaces[s].primaries},getTransfer:function(s){if(s==="")return"linear";return this.spaces[s].transfer},getToneMappingMode:function(s){return this.spaces[s].outputColorSpaceConfig.toneMappingMode||"standard"},getLuminanceCoefficients:function(s,r=this.workingColorSpace){return s.fromArray(this.spaces[r].luminanceCoefficients)},define:function(s){Object.assign(this.spaces,s)},_getMatrix:function(s,r,a){return s.copy(this.spaces[r].toXYZ).multiply(this.spaces[a].fromXYZ)},_getDrawingBufferColorSpace:function(s){return this.spaces[s].outputColorSpaceConfig.drawingBufferColorSpace},_getUnpackColorSpace:function(s=this.workingColorSpace){return this.spaces[s].workingColorSpaceConfig.unpackColorSpace},fromWorkingColorSpace:function(s,r){return Gn("ColorManagement: .fromWorkingColorSpace() has been renamed to .workingToColorSpace()."),t.workingToColorSpace(s,r)},toWorkingColorSpace:function(s,r){return Gn("ColorManagement: .toWorkingColorSpace() has been renamed to .colorSpaceToWorking()."),t.colorSpaceToWorking(s,r)}},e=[0.64,0.33,0.3,0.6,0.15,0.06],n=[0.2126,0.7152,0.0722],i=[0.3127,0.329];return t.define({["srgb-linear"]:{primaries:e,whitePoint:i,transfer:"linear",toXYZ:Sl,fromXYZ:Ml,luminanceCoefficients:n,workingColorSpaceConfig:{unpackColorSpace:"srgb"},outputColorSpaceConfig:{drawingBufferColorSpace:"srgb"}},["srgb"]:{primaries:e,whitePoint:i,transfer:"srgb",toXYZ:Sl,fromXYZ:Ml,luminanceCoefficients:n,outputColorSpaceConfig:{drawingBufferColorSpace:"srgb"}}}),t}var Kt=Zh();function vn(t){return t<0.04045?t*0.0773993808:Math.pow(t*0.9478672986+0.0521327014,2.4)}function Mi(t){return t<0.0031308?t*12.92:1.055*Math.pow(t,0.41666)-0.055}var ri;class po{static getDataURL(t,e="image/png"){if(/^data:/i.test(t.src))return t.src;if(typeof HTMLCanvasElement>"u")return t.src;let n;if(t instanceof HTMLCanvasElement)n=t;else{if(ri===void 0)ri=Wi("canvas");ri.width=t.width,ri.height=t.height;let i=ri.getContext("2d");if(t instanceof ImageData)i.putImageData(t,0,0);else i.drawImage(t,0,0,t.width,t.height);n=ri}return n.toDataURL(e)}static sRGBToLinear(t){if(typeof HTMLImageElement<"u"&&t instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&t instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&t instanceof ImageBitmap){let e=Wi("canvas");e.width=t.width,e.height=t.height;let n=e.getContext("2d");n.drawImage(t,0,0,t.width,t.height);let i=n.getImageData(0,0,t.width,t.height),s=i.data;for(let r=0;r<s.length;r++)s[r]=vn(s[r]/255)*255;return n.putImageData(i,0,0),e}else if(t.data){let e=t.data.slice(0);for(let n=0;n<e.length;n++)if(e instanceof Uint8Array||e instanceof Uint8ClampedArray)e[n]=Math.floor(vn(e[n]/255)*255);else e[n]=vn(e[n]);return{data:e,width:t.width,height:t.height}}else return zt("ImageUtils.sRGBToLinear(): Unsupported image type. No color space conversion applied."),t}}var Jh=0;class es{constructor(t=null){this.isTextureSource=!0,Object.defineProperty(this,"id",{value:Jh++}),this.uuid=xn(),this.data=t,this.dataReady=!0,this.version=0}getSize(t){let e=this.data;if(typeof HTMLVideoElement<"u"&&e instanceof HTMLVideoElement)t.set(e.videoWidth,e.videoHeight,0);else if(typeof VideoFrame<"u"&&e instanceof VideoFrame)t.set(e.displayWidth,e.displayHeight,0);else if(e!==null)t.set(e.width,e.height,e.depth||0);else t.set(0,0,0);return t}set needsUpdate(t){if(t===!0)this.version++}toJSON(t){let e=t===void 0||typeof t==="string";if(!e&&t.images[this.uuid]!==void 0)return t.images[this.uuid];let n={uuid:this.uuid,url:""},i=this.data;if(i!==null){let s;if(Array.isArray(i)){s=[];for(let r=0,a=i.length;r<a;r++)if(i[r].isDataTexture)s.push(zr(i[r].image));else s.push(zr(i[r]))}else s=zr(i);n.url=s}if(!e)t.images[this.uuid]=n;return n}}function zr(t){if(typeof HTMLImageElement<"u"&&t instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&t instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&t instanceof ImageBitmap)return po.getDataURL(t);else if(t.data)return{data:Array.from(t.data),width:t.width,height:t.height,type:t.data.constructor.name};else return zt("Texture: Unable to serialize Texture."),{}}var $h=0,Gr=new P;class Ae extends Sn{constructor(t=Ae.DEFAULT_IMAGE,e=Ae.DEFAULT_MAPPING,n=1001,i=1001,s=1006,r=1008,a=1023,o=1009,l=Ae.DEFAULT_ANISOTROPY,c=""){super();this.isTexture=!0,Object.defineProperty(this,"id",{value:$h++}),this.uuid=xn(),this.name="",this.source=new es(t),this.mipmaps=[],this.mapping=e,this.channel=0,this.wrapS=n,this.wrapT=i,this.magFilter=s,this.minFilter=r,this.anisotropy=l,this.format=a,this.internalFormat=null,this.type=o,this.offset=new lt(0,0),this.repeat=new lt(1,1),this.center=new lt(0,0),this.rotation=0,this.matrixAutoUpdate=!0,this.matrix=new Gt,this.generateMipmaps=!0,this.premultiplyAlpha=!1,this.flipY=!0,this.unpackAlignment=4,this.colorSpace=c,this.userData={},this.updateRanges=[],this.version=0,this.onUpdate=null,this.renderTarget=null,this.isRenderTargetTexture=!1,this.isArrayTexture=t&&t.depth&&t.depth>1?!0:!1,this.pmremVersion=0,this.normalized=!1}get width(){return this.source.getSize(Gr).x}get height(){return this.source.getSize(Gr).y}get depth(){return this.source.getSize(Gr).z}get image(){return this.source.data}set image(t){this.source.data=t}updateMatrix(){this.matrix.setUvTransform(this.offset.x,this.offset.y,this.repeat.x,this.repeat.y,this.rotation,this.center.x,this.center.y)}addUpdateRange(t,e){this.updateRanges.push({start:t,count:e})}clearUpdateRanges(){this.updateRanges.length=0}clone(){return new this.constructor().copy(this)}copy(t){return this.name=t.name,this.source=t.source,this.mipmaps=t.mipmaps.slice(0),this.mapping=t.mapping,this.channel=t.channel,this.wrapS=t.wrapS,this.wrapT=t.wrapT,this.magFilter=t.magFilter,this.minFilter=t.minFilter,this.anisotropy=t.anisotropy,this.format=t.format,this.internalFormat=t.internalFormat,this.type=t.type,this.normalized=t.normalized,this.offset.copy(t.offset),this.repeat.copy(t.repeat),this.center.copy(t.center),this.rotation=t.rotation,this.matrixAutoUpdate=t.matrixAutoUpdate,this.matrix.copy(t.matrix),this.generateMipmaps=t.generateMipmaps,this.premultiplyAlpha=t.premultiplyAlpha,this.flipY=t.flipY,this.unpackAlignment=t.unpackAlignment,this.colorSpace=t.colorSpace,this.renderTarget=t.renderTarget,this.isRenderTargetTexture=t.isRenderTargetTexture,this.isArrayTexture=t.isArrayTexture,this.userData=JSON.parse(JSON.stringify(t.userData)),this.needsUpdate=!0,this}setValues(t){for(let e in t){let n=t[e];if(n===void 0){zt(`Texture.setValues(): parameter '${e}' has value of undefined.`);continue}let i=this[e];if(i===void 0){zt(`Texture.setValues(): property '${e}' does not exist.`);continue}if(i&&n&&(i.isVector2&&n.isVector2))i.copy(n);else if(i&&n&&(i.isVector3&&n.isVector3))i.copy(n);else if(i&&n&&(i.isMatrix3&&n.isMatrix3))i.copy(n);else this[e]=n}}toJSON(t){let e=t===void 0||typeof t==="string";if(!e&&t.textures[this.uuid]!==void 0)return t.textures[this.uuid];let n={metadata:{version:4.7,type:"Texture",generator:"Texture.toJSON"},uuid:this.uuid,name:this.name,image:this.source.toJSON(t).uuid,mapping:this.mapping,channel:this.channel,repeat:[this.repeat.x,this.repeat.y],offset:[this.offset.x,this.offset.y],center:[this.center.x,this.center.y],rotation:this.rotation,wrap:[this.wrapS,this.wrapT],format:this.format,internalFormat:this.internalFormat,type:this.type,normalized:this.normalized,colorSpace:this.colorSpace,minFilter:this.minFilter,magFilter:this.magFilter,anisotropy:this.anisotropy,flipY:this.flipY,generateMipmaps:this.generateMipmaps,premultiplyAlpha:this.premultiplyAlpha,unpackAlignment:this.unpackAlignment};if(Object.keys(this.userData).length>0)n.userData=this.userData;if(!e)t.textures[this.uuid]=n;return n}dispose(){this.dispatchEvent({type:"dispose"})}transformUv(t){if(this.mapping!==300)return t;if(t.applyMatrix3(this.matrix),t.x<0||t.x>1)switch(this.wrapS){case 1000:t.x=t.x-Math.floor(t.x);break;case 1001:t.x=t.x<0?0:1;break;case 1002:if(Math.abs(Math.floor(t.x)%2)===1)t.x=Math.ceil(t.x)-t.x;else t.x=t.x-Math.floor(t.x);break}if(t.y<0||t.y>1)switch(this.wrapT){case 1000:t.y=t.y-Math.floor(t.y);break;case 1001:t.y=t.y<0?0:1;break;case 1002:if(Math.abs(Math.floor(t.y)%2)===1)t.y=Math.ceil(t.y)-t.y;else t.y=t.y-Math.floor(t.y);break}if(this.flipY)t.y=1-t.y;return t}set needsUpdate(t){if(t===!0)this.version++,this.source.needsUpdate=!0}set needsPMREMUpdate(t){if(t===!0)this.pmremVersion++}}Ae.DEFAULT_IMAGE=null;Ae.DEFAULT_MAPPING=300;Ae.DEFAULT_ANISOTROPY=1;class ge{static{ge.prototype.isVector4=!0}constructor(t=0,e=0,n=0,i=1){this.x=t,this.y=e,this.z=n,this.w=i}get width(){return this.z}set width(t){this.z=t}get height(){return this.w}set height(t){this.w=t}set(t,e,n,i){return this.x=t,this.y=e,this.z=n,this.w=i,this}setScalar(t){return this.x=t,this.y=t,this.z=t,this.w=t,this}setX(t){return this.x=t,this}setY(t){return this.y=t,this}setZ(t){return this.z=t,this}setW(t){return this.w=t,this}setComponent(t,e){switch(t){case 0:this.x=e;break;case 1:this.y=e;break;case 2:this.z=e;break;case 3:this.w=e;break;default:throw Error("THREE.Vector4: index is out of range: "+t)}return this}getComponent(t){switch(t){case 0:return this.x;case 1:return this.y;case 2:return this.z;case 3:return this.w;default:throw Error("THREE.Vector4: index is out of range: "+t)}}clone(){return new this.constructor(this.x,this.y,this.z,this.w)}copy(t){return this.x=t.x,this.y=t.y,this.z=t.z,this.w=t.w!==void 0?t.w:1,this}add(t){return this.x+=t.x,this.y+=t.y,this.z+=t.z,this.w+=t.w,this}addScalar(t){return this.x+=t,this.y+=t,this.z+=t,this.w+=t,this}addVectors(t,e){return this.x=t.x+e.x,this.y=t.y+e.y,this.z=t.z+e.z,this.w=t.w+e.w,this}addScaledVector(t,e){return this.x+=t.x*e,this.y+=t.y*e,this.z+=t.z*e,this.w+=t.w*e,this}sub(t){return this.x-=t.x,this.y-=t.y,this.z-=t.z,this.w-=t.w,this}subScalar(t){return this.x-=t,this.y-=t,this.z-=t,this.w-=t,this}subVectors(t,e){return this.x=t.x-e.x,this.y=t.y-e.y,this.z=t.z-e.z,this.w=t.w-e.w,this}multiply(t){return this.x*=t.x,this.y*=t.y,this.z*=t.z,this.w*=t.w,this}multiplyScalar(t){return this.x*=t,this.y*=t,this.z*=t,this.w*=t,this}applyMatrix4(t){let e=this.x,n=this.y,i=this.z,s=this.w,r=t.elements;return this.x=r[0]*e+r[4]*n+r[8]*i+r[12]*s,this.y=r[1]*e+r[5]*n+r[9]*i+r[13]*s,this.z=r[2]*e+r[6]*n+r[10]*i+r[14]*s,this.w=r[3]*e+r[7]*n+r[11]*i+r[15]*s,this}divide(t){return this.x/=t.x,this.y/=t.y,this.z/=t.z,this.w/=t.w,this}divideScalar(t){return this.multiplyScalar(1/t)}setAxisAngleFromQuaternion(t){this.w=2*Math.acos(t.w);let e=Math.sqrt(1-t.w*t.w);if(e<0.0001)this.x=1,this.y=0,this.z=0;else this.x=t.x/e,this.y=t.y/e,this.z=t.z/e;return this}setAxisAngleFromRotationMatrix(t){let e,n,i,s,r=0.01,a=0.1,o=t.elements,l=o[0],c=o[4],u=o[8],f=o[1],h=o[5],m=o[9],v=o[2],T=o[6],p=o[10];if(Math.abs(c-f)<0.01&&Math.abs(u-v)<0.01&&Math.abs(m-T)<0.01){if(Math.abs(c+f)<0.1&&Math.abs(u+v)<0.1&&Math.abs(m+T)<0.1&&Math.abs(l+h+p-3)<0.1)return this.set(1,0,0,0),this;e=Math.PI;let E=(l+1)/2,A=(h+1)/2,x=(p+1)/2,b=(c+f)/4,C=(u+v)/4,w=(m+T)/4;if(E>A&&E>x)if(E<0.01)n=0,i=0.707106781,s=0.707106781;else n=Math.sqrt(E),i=b/n,s=C/n;else if(A>x)if(A<0.01)n=0.707106781,i=0,s=0.707106781;else i=Math.sqrt(A),n=b/i,s=w/i;else if(x<0.01)n=0.707106781,i=0.707106781,s=0;else s=Math.sqrt(x),n=C/s,i=w/s;return this.set(n,i,s,e),this}let d=Math.sqrt((T-m)*(T-m)+(u-v)*(u-v)+(f-c)*(f-c));if(Math.abs(d)<0.001)d=1;return this.x=(T-m)/d,this.y=(u-v)/d,this.z=(f-c)/d,this.w=Math.acos((l+h+p-1)/2),this}setFromMatrixPosition(t){let e=t.elements;return this.x=e[12],this.y=e[13],this.z=e[14],this.w=e[15],this}min(t){return this.x=Math.min(this.x,t.x),this.y=Math.min(this.y,t.y),this.z=Math.min(this.z,t.z),this.w=Math.min(this.w,t.w),this}max(t){return this.x=Math.max(this.x,t.x),this.y=Math.max(this.y,t.y),this.z=Math.max(this.z,t.z),this.w=Math.max(this.w,t.w),this}clamp(t,e){return this.x=Qt(this.x,t.x,e.x),this.y=Qt(this.y,t.y,e.y),this.z=Qt(this.z,t.z,e.z),this.w=Qt(this.w,t.w,e.w),this}clampScalar(t,e){return this.x=Qt(this.x,t,e),this.y=Qt(this.y,t,e),this.z=Qt(this.z,t,e),this.w=Qt(this.w,t,e),this}clampLength(t,e){let n=this.length();return this.divideScalar(n||1).multiplyScalar(Qt(n,t,e))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this.w=Math.floor(this.w),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this.w=Math.ceil(this.w),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this.w=Math.round(this.w),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this.w=Math.trunc(this.w),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this.w=-this.w,this}dot(t){return this.x*t.x+this.y*t.y+this.z*t.z+this.w*t.w}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)+Math.abs(this.w)}normalize(){return this.divideScalar(this.length()||1)}setLength(t){return this.normalize().multiplyScalar(t)}lerp(t,e){return this.x+=(t.x-this.x)*e,this.y+=(t.y-this.y)*e,this.z+=(t.z-this.z)*e,this.w+=(t.w-this.w)*e,this}lerpVectors(t,e,n){return this.x=t.x+(e.x-t.x)*n,this.y=t.y+(e.y-t.y)*n,this.z=t.z+(e.z-t.z)*n,this.w=t.w+(e.w-t.w)*n,this}equals(t){return t.x===this.x&&t.y===this.y&&t.z===this.z&&t.w===this.w}fromArray(t,e=0){return this.x=t[e],this.y=t[e+1],this.z=t[e+2],this.w=t[e+3],this}toArray(t=[],e=0){return t[e]=this.x,t[e+1]=this.y,t[e+2]=this.z,t[e+3]=this.w,t}fromBufferAttribute(t,e){return this.x=t.getX(e),this.y=t.getY(e),this.z=t.getZ(e),this.w=t.getW(e),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this.w=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z,yield this.w}}class mo extends Sn{constructor(t=1,e=1,n={}){super();n=Object.assign({generateMipmaps:!1,internalFormat:null,minFilter:1006,depthBuffer:!0,stencilBuffer:!1,resolveColorBuffer:!0,resolveDepthBuffer:!0,resolveStencilBuffer:!0,storeMultisampledColorBuffer:!0,storeMultisampledDepthBuffer:!0,storeMultisampledStencilBuffer:!0,depthTexture:null,samples:0,count:1,depth:1,multiview:!1,useArrayDepthTexture:!1},n),this.isRenderTarget=!0,this.width=t,this.height=e,this.depth=n.depth,this.scissor=new ge(0,0,t,e),this.scissorTest=!1,this.viewport=new ge(0,0,t,e),this.textures=[];let i={width:t,height:e,depth:n.depth},s=new Ae(i),r=n.count;for(let a=0;a<r;a++)this.textures[a]=s.clone(),this.textures[a].isRenderTargetTexture=!0,this.textures[a].renderTarget=this;this._setTextureOptions(n),this.depthBuffer=n.depthBuffer,this.stencilBuffer=n.stencilBuffer,this.resolveColorBuffer=n.resolveColorBuffer,this.resolveDepthBuffer=n.resolveDepthBuffer,this.resolveStencilBuffer=n.resolveStencilBuffer,this.storeMultisampledColorBuffer=n.storeMultisampledColorBuffer,this.storeMultisampledDepthBuffer=n.storeMultisampledDepthBuffer,this.storeMultisampledStencilBuffer=n.storeMultisampledStencilBuffer,this._depthTexture=null,this.depthTexture=n.depthTexture,this.samples=n.samples,this.multiview=n.multiview,this.useArrayDepthTexture=n.useArrayDepthTexture}_setTextureOptions(t={}){let e={minFilter:1006,generateMipmaps:!1,flipY:!1,internalFormat:null};if(t.mapping!==void 0)e.mapping=t.mapping;if(t.wrapS!==void 0)e.wrapS=t.wrapS;if(t.wrapT!==void 0)e.wrapT=t.wrapT;if(t.wrapR!==void 0)e.wrapR=t.wrapR;if(t.magFilter!==void 0)e.magFilter=t.magFilter;if(t.minFilter!==void 0)e.minFilter=t.minFilter;if(t.format!==void 0)e.format=t.format;if(t.type!==void 0)e.type=t.type;if(t.anisotropy!==void 0)e.anisotropy=t.anisotropy;if(t.colorSpace!==void 0)e.colorSpace=t.colorSpace;if(t.flipY!==void 0)e.flipY=t.flipY;if(t.generateMipmaps!==void 0)e.generateMipmaps=t.generateMipmaps;if(t.internalFormat!==void 0)e.internalFormat=t.internalFormat;for(let n=0;n<this.textures.length;n++)this.textures[n].setValues(e)}get texture(){return this.textures[0]}set texture(t){this.textures[0]=t}set depthTexture(t){if(this._depthTexture!==null&&this._depthTexture.renderTarget===this)this._depthTexture.renderTarget=null;if(t!==null&&t.renderTarget===null)t.renderTarget=this;this._depthTexture=t}get depthTexture(){return this._depthTexture}setSize(t,e,n=1){if(this.width!==t||this.height!==e||this.depth!==n){this.width=t,this.height=e,this.depth=n;for(let i=0,s=this.textures.length;i<s;i++)if(this.textures[i].image.width=t,this.textures[i].image.height=e,this.textures[i].image.depth=n,this.textures[i].isData3DTexture!==!0)this.textures[i].isArrayTexture=this.textures[i].image.depth>1;this.dispose()}this.viewport.set(0,0,t,e),this.scissor.set(0,0,t,e)}clone(){return new this.constructor().copy(this)}copy(t){this.width=t.width,this.height=t.height,this.depth=t.depth,this.scissor.copy(t.scissor),this.scissorTest=t.scissorTest,this.viewport.copy(t.viewport),this.textures.length=0;for(let e=0,n=t.textures.length;e<n;e++){this.textures[e]=t.textures[e].clone(),this.textures[e].isRenderTargetTexture=!0,this.textures[e].renderTarget=this;let i=Object.assign({},t.textures[e].image);this.textures[e].source=new es(i)}if(this.depthBuffer=t.depthBuffer,this.stencilBuffer=t.stencilBuffer,this.resolveColorBuffer=t.resolveColorBuffer,this.resolveDepthBuffer=t.resolveDepthBuffer,this.resolveStencilBuffer=t.resolveStencilBuffer,this.storeMultisampledColorBuffer=t.storeMultisampledColorBuffer,this.storeMultisampledDepthBuffer=t.storeMultisampledDepthBuffer,this.storeMultisampledStencilBuffer=t.storeMultisampledStencilBuffer,t.depthTexture!==null)if(t.depthTexture.renderTarget===t){let e=t.depthTexture.clone();e.renderTarget=null,this.depthTexture=e}else this.depthTexture=t.depthTexture;return this.samples=t.samples,this.multiview=t.multiview,this.useArrayDepthTexture=t.useArrayDepthTexture,this}dispose(){this.dispatchEvent({type:"dispose"})}}class Ge extends mo{constructor(t=1,e=1,n={}){super(t,e,n);this.isWebGLRenderTarget=!0}}class sr extends Ae{constructor(t=null,e=1,n=1,i=1){super(null);this.isDataArrayTexture=!0,this.image={data:t,width:e,height:n,depth:i},this.magFilter=1003,this.minFilter=1003,this.wrapR=1001,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1,this.layerUpdates=new Set}copy(t){return super.copy(t),this.wrapR=t.wrapR,this}addLayerUpdate(t){this.layerUpdates.add(t)}clearLayerUpdates(){this.layerUpdates.clear()}}class go extends Ae{constructor(t=null,e=1,n=1,i=1){super(null);this.isData3DTexture=!0,this.image={data:t,width:e,height:n,depth:i},this.magFilter=1003,this.minFilter=1003,this.wrapR=1001,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}copy(t){return super.copy(t),this.wrapR=t.wrapR,this}}class ue{static{ue.prototype.isMatrix4=!0}constructor(t,e,n,i,s,r,a,o,l,c,u,f,h,m,v,T){if(this.elements=[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1],t!==void 0)this.set(t,e,n,i,s,r,a,o,l,c,u,f,h,m,v,T)}set(t,e,n,i,s,r,a,o,l,c,u,f,h,m,v,T){let p=this.elements;return p[0]=t,p[4]=e,p[8]=n,p[12]=i,p[1]=s,p[5]=r,p[9]=a,p[13]=o,p[2]=l,p[6]=c,p[10]=u,p[14]=f,p[3]=h,p[7]=m,p[11]=v,p[15]=T,this}identity(){return this.set(1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1),this}clone(){return new ue().fromArray(this.elements)}copy(t){let e=this.elements,n=t.elements;return e[0]=n[0],e[1]=n[1],e[2]=n[2],e[3]=n[3],e[4]=n[4],e[5]=n[5],e[6]=n[6],e[7]=n[7],e[8]=n[8],e[9]=n[9],e[10]=n[10],e[11]=n[11],e[12]=n[12],e[13]=n[13],e[14]=n[14],e[15]=n[15],this}copyPosition(t){let e=this.elements,n=t.elements;return e[12]=n[12],e[13]=n[13],e[14]=n[14],this}setFromMatrix3(t){let e=t.elements;return this.set(e[0],e[3],e[6],0,e[1],e[4],e[7],0,e[2],e[5],e[8],0,0,0,0,1),this}extractBasis(t,e,n){if(this.determinantAffine()===0)return t.set(1,0,0),e.set(0,1,0),n.set(0,0,1),this;return t.setFromMatrixColumn(this,0),e.setFromMatrixColumn(this,1),n.setFromMatrixColumn(this,2),this}makeBasis(t,e,n){return this.set(t.x,e.x,n.x,0,t.y,e.y,n.y,0,t.z,e.z,n.z,0,0,0,0,1),this}extractRotation(t){if(t.determinantAffine()===0)return this.identity();let e=this.elements,n=t.elements,i=1/ai.setFromMatrixColumn(t,0).length(),s=1/ai.setFromMatrixColumn(t,1).length(),r=1/ai.setFromMatrixColumn(t,2).length();return e[0]=n[0]*i,e[1]=n[1]*i,e[2]=n[2]*i,e[3]=0,e[4]=n[4]*s,e[5]=n[5]*s,e[6]=n[6]*s,e[7]=0,e[8]=n[8]*r,e[9]=n[9]*r,e[10]=n[10]*r,e[11]=0,e[12]=0,e[13]=0,e[14]=0,e[15]=1,this}makeRotationFromEuler(t){let e=this.elements,{x:n,y:i,z:s}=t,r=Math.cos(n),a=Math.sin(n),o=Math.cos(i),l=Math.sin(i),c=Math.cos(s),u=Math.sin(s);if(t.order==="XYZ"){let f=r*c,h=r*u,m=a*c,v=a*u;e[0]=o*c,e[4]=-o*u,e[8]=l,e[1]=h+m*l,e[5]=f-v*l,e[9]=-a*o,e[2]=v-f*l,e[6]=m+h*l,e[10]=r*o}else if(t.order==="YXZ"){let f=o*c,h=o*u,m=l*c,v=l*u;e[0]=f+v*a,e[4]=m*a-h,e[8]=r*l,e[1]=r*u,e[5]=r*c,e[9]=-a,e[2]=h*a-m,e[6]=v+f*a,e[10]=r*o}else if(t.order==="ZXY"){let f=o*c,h=o*u,m=l*c,v=l*u;e[0]=f-v*a,e[4]=-r*u,e[8]=m+h*a,e[1]=h+m*a,e[5]=r*c,e[9]=v-f*a,e[2]=-r*l,e[6]=a,e[10]=r*o}else if(t.order==="ZYX"){let f=r*c,h=r*u,m=a*c,v=a*u;e[0]=o*c,e[4]=m*l-h,e[8]=f*l+v,e[1]=o*u,e[5]=v*l+f,e[9]=h*l-m,e[2]=-l,e[6]=a*o,e[10]=r*o}else if(t.order==="YZX"){let f=r*o,h=r*l,m=a*o,v=a*l;e[0]=o*c,e[4]=v-f*u,e[8]=m*u+h,e[1]=u,e[5]=r*c,e[9]=-a*c,e[2]=-l*c,e[6]=h*u+m,e[10]=f-v*u}else if(t.order==="XZY"){let f=r*o,h=r*l,m=a*o,v=a*l;e[0]=o*c,e[4]=-u,e[8]=l*c,e[1]=f*u+v,e[5]=r*c,e[9]=h*u-m,e[2]=m*u-h,e[6]=a*c,e[10]=v*u+f}return e[3]=0,e[7]=0,e[11]=0,e[12]=0,e[13]=0,e[14]=0,e[15]=1,this}makeRotationFromQuaternion(t){return this.compose(Kh,t,Qh)}lookAt(t,e,n){let i=this.elements;if(Fe.subVectors(t,e),Fe.lengthSq()===0)Fe.z=1;if(Fe.normalize(),En.crossVectors(n,Fe),En.lengthSq()===0){if(Math.abs(n.z)===1)Fe.x+=0.0001;else Fe.z+=0.0001;Fe.normalize(),En.crossVectors(n,Fe)}return En.normalize(),_s.crossVectors(Fe,En),i[0]=En.x,i[4]=_s.x,i[8]=Fe.x,i[1]=En.y,i[5]=_s.y,i[9]=Fe.y,i[2]=En.z,i[6]=_s.z,i[10]=Fe.z,this}multiply(t){return this.multiplyMatrices(this,t)}premultiply(t){return this.multiplyMatrices(t,this)}multiplyMatrices(t,e){let n=t.elements,i=e.elements,s=this.elements,r=n[0],a=n[4],o=n[8],l=n[12],c=n[1],u=n[5],f=n[9],h=n[13],m=n[2],v=n[6],T=n[10],p=n[14],d=n[3],E=n[7],A=n[11],x=n[15],b=i[0],C=i[4],w=i[8],g=i[12],S=i[1],O=i[5],N=i[9],F=i[13],Z=i[2],I=i[6],G=i[10],J=i[14],k=i[3],rt=i[7],W=i[11],Q=i[15];return s[0]=r*b+a*S+o*Z+l*k,s[4]=r*C+a*O+o*I+l*rt,s[8]=r*w+a*N+o*G+l*W,s[12]=r*g+a*F+o*J+l*Q,s[1]=c*b+u*S+f*Z+h*k,s[5]=c*C+u*O+f*I+h*rt,s[9]=c*w+u*N+f*G+h*W,s[13]=c*g+u*F+f*J+h*Q,s[2]=m*b+v*S+T*Z+p*k,s[6]=m*C+v*O+T*I+p*rt,s[10]=m*w+v*N+T*G+p*W,s[14]=m*g+v*F+T*J+p*Q,s[3]=d*b+E*S+A*Z+x*k,s[7]=d*C+E*O+A*I+x*rt,s[11]=d*w+E*N+A*G+x*W,s[15]=d*g+E*F+A*J+x*Q,this}multiplyScalar(t){let e=this.elements;return e[0]*=t,e[4]*=t,e[8]*=t,e[12]*=t,e[1]*=t,e[5]*=t,e[9]*=t,e[13]*=t,e[2]*=t,e[6]*=t,e[10]*=t,e[14]*=t,e[3]*=t,e[7]*=t,e[11]*=t,e[15]*=t,this}determinant(){let t=this.elements,e=t[0],n=t[4],i=t[8],s=t[12],r=t[1],a=t[5],o=t[9],l=t[13],c=t[2],u=t[6],f=t[10],h=t[14],m=t[3],v=t[7],T=t[11],p=t[15],d=o*h-l*f,E=a*h-l*u,A=a*f-o*u,x=r*h-l*c,b=r*f-o*c,C=r*u-a*c;return e*(v*d-T*E+p*A)-n*(m*d-T*x+p*b)+i*(m*E-v*x+p*C)-s*(m*A-v*b+T*C)}determinantAffine(){let t=this.elements,e=t[0],n=t[4],i=t[8],s=t[1],r=t[5],a=t[9],o=t[2],l=t[6],c=t[10];return e*(r*c-a*l)-n*(s*c-a*o)+i*(s*l-r*o)}transpose(){let t=this.elements,e;return e=t[1],t[1]=t[4],t[4]=e,e=t[2],t[2]=t[8],t[8]=e,e=t[6],t[6]=t[9],t[9]=e,e=t[3],t[3]=t[12],t[12]=e,e=t[7],t[7]=t[13],t[13]=e,e=t[11],t[11]=t[14],t[14]=e,this}setPosition(t,e,n){let i=this.elements;if(t.isVector3)i[12]=t.x,i[13]=t.y,i[14]=t.z;else i[12]=t,i[13]=e,i[14]=n;return this}invert(){let t=this.elements,e=t[0],n=t[1],i=t[2],s=t[3],r=t[4],a=t[5],o=t[6],l=t[7],c=t[8],u=t[9],f=t[10],h=t[11],m=t[12],v=t[13],T=t[14],p=t[15],d=e*a-n*r,E=e*o-i*r,A=e*l-s*r,x=n*o-i*a,b=n*l-s*a,C=i*l-s*o,w=c*v-u*m,g=c*T-f*m,S=c*p-h*m,O=u*T-f*v,N=u*p-h*v,F=f*p-h*T,Z=d*F-E*N+A*O+x*S-b*g+C*w;if(Z===0)return this.set(0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0);let I=1/Z;return t[0]=(a*F-o*N+l*O)*I,t[1]=(i*N-n*F-s*O)*I,t[2]=(v*C-T*b+p*x)*I,t[3]=(f*b-u*C-h*x)*I,t[4]=(o*S-r*F-l*g)*I,t[5]=(e*F-i*S+s*g)*I,t[6]=(T*A-m*C-p*E)*I,t[7]=(c*C-f*A+h*E)*I,t[8]=(r*N-a*S+l*w)*I,t[9]=(n*S-e*N-s*w)*I,t[10]=(m*b-v*A+p*d)*I,t[11]=(u*A-c*b-h*d)*I,t[12]=(a*g-r*O-o*w)*I,t[13]=(e*O-n*g+i*w)*I,t[14]=(v*E-m*x-T*d)*I,t[15]=(c*x-u*E+f*d)*I,this}scale(t){let e=this.elements,{x:n,y:i,z:s}=t;return e[0]*=n,e[4]*=i,e[8]*=s,e[1]*=n,e[5]*=i,e[9]*=s,e[2]*=n,e[6]*=i,e[10]*=s,e[3]*=n,e[7]*=i,e[11]*=s,this}getMaxScaleOnAxis(){let t=this.elements,e=t[0]*t[0]+t[1]*t[1]+t[2]*t[2],n=t[4]*t[4]+t[5]*t[5]+t[6]*t[6],i=t[8]*t[8]+t[9]*t[9]+t[10]*t[10];return Math.sqrt(Math.max(e,n,i))}makeTranslation(t,e,n){if(t.isVector3)this.set(1,0,0,t.x,0,1,0,t.y,0,0,1,t.z,0,0,0,1);else this.set(1,0,0,t,0,1,0,e,0,0,1,n,0,0,0,1);return this}makeRotationX(t){let e=Math.cos(t),n=Math.sin(t);return this.set(1,0,0,0,0,e,-n,0,0,n,e,0,0,0,0,1),this}makeRotationY(t){let e=Math.cos(t),n=Math.sin(t);return this.set(e,0,n,0,0,1,0,0,-n,0,e,0,0,0,0,1),this}makeRotationZ(t){let e=Math.cos(t),n=Math.sin(t);return this.set(e,-n,0,0,n,e,0,0,0,0,1,0,0,0,0,1),this}makeRotationAxis(t,e){let n=Math.cos(e),i=Math.sin(e),s=1-n,{x:r,y:a,z:o}=t,l=s*r,c=s*a;return this.set(l*r+n,l*a-i*o,l*o+i*a,0,l*a+i*o,c*a+n,c*o-i*r,0,l*o-i*a,c*o+i*r,s*o*o+n,0,0,0,0,1),this}makeScale(t,e,n){return this.set(t,0,0,0,0,e,0,0,0,0,n,0,0,0,0,1),this}makeShear(t,e,n,i,s,r){return this.set(1,n,s,0,t,1,r,0,e,i,1,0,0,0,0,1),this}compose(t,e,n){let i=this.elements,{_x:s,_y:r,_z:a,_w:o}=e,l=s+s,c=r+r,u=a+a,f=s*l,h=s*c,m=s*u,v=r*c,T=r*u,p=a*u,d=o*l,E=o*c,A=o*u,{x,y:b,z:C}=n;return i[0]=(1-(v+p))*x,i[1]=(h+A)*x,i[2]=(m-E)*x,i[3]=0,i[4]=(h-A)*b,i[5]=(1-(f+p))*b,i[6]=(T+d)*b,i[7]=0,i[8]=(m+E)*C,i[9]=(T-d)*C,i[10]=(1-(f+v))*C,i[11]=0,i[12]=t.x,i[13]=t.y,i[14]=t.z,i[15]=1,this}decompose(t,e,n){let i=this.elements;t.x=i[12],t.y=i[13],t.z=i[14];let s=this.determinantAffine();if(s===0)return n.set(1,1,1),e.identity(),this;let r=ai.set(i[0],i[1],i[2]).length(),a=ai.set(i[4],i[5],i[6]).length(),o=ai.set(i[8],i[9],i[10]).length();if(s<0)r=-r;Ye.copy(this);let l=1/r,c=1/a,u=1/o;return Ye.elements[0]*=l,Ye.elements[1]*=l,Ye.elements[2]*=l,Ye.elements[4]*=c,Ye.elements[5]*=c,Ye.elements[6]*=c,Ye.elements[8]*=u,Ye.elements[9]*=u,Ye.elements[10]*=u,e.setFromRotationMatrix(Ye),n.x=r,n.y=a,n.z=o,this}makePerspective(t,e,n,i,s,r,a=2000,o=!1){let l=this.elements,c=2*s/(e-t),u=2*s/(n-i),f=(e+t)/(e-t),h=(n+i)/(n-i),m,v;if(o)m=s/(r-s),v=r*s/(r-s);else if(a===2000)m=-(r+s)/(r-s),v=-2*r*s/(r-s);else if(a===2001)m=-r/(r-s),v=-r*s/(r-s);else throw Error("THREE.Matrix4.makePerspective(): Invalid coordinate system: "+a);return l[0]=c,l[4]=0,l[8]=f,l[12]=0,l[1]=0,l[5]=u,l[9]=h,l[13]=0,l[2]=0,l[6]=0,l[10]=m,l[14]=v,l[3]=0,l[7]=0,l[11]=-1,l[15]=0,this}makeOrthographic(t,e,n,i,s,r,a=2000,o=!1){let l=this.elements,c=2/(e-t),u=2/(n-i),f=-(e+t)/(e-t),h=-(n+i)/(n-i),m,v;if(o)m=1/(r-s),v=r/(r-s);else if(a===2000)m=-2/(r-s),v=-(r+s)/(r-s);else if(a===2001)m=-1/(r-s),v=-s/(r-s);else throw Error("THREE.Matrix4.makeOrthographic(): Invalid coordinate system: "+a);return l[0]=c,l[4]=0,l[8]=0,l[12]=f,l[1]=0,l[5]=u,l[9]=0,l[13]=h,l[2]=0,l[6]=0,l[10]=m,l[14]=v,l[3]=0,l[7]=0,l[11]=0,l[15]=1,this}equals(t){let e=this.elements,n=t.elements;for(let i=0;i<16;i++)if(e[i]!==n[i])return!1;return!0}fromArray(t,e=0){for(let n=0;n<16;n++)this.elements[n]=t[n+e];return this}toArray(t=[],e=0){let n=this.elements;return t[e]=n[0],t[e+1]=n[1],t[e+2]=n[2],t[e+3]=n[3],t[e+4]=n[4],t[e+5]=n[5],t[e+6]=n[6],t[e+7]=n[7],t[e+8]=n[8],t[e+9]=n[9],t[e+10]=n[10],t[e+11]=n[11],t[e+12]=n[12],t[e+13]=n[13],t[e+14]=n[14],t[e+15]=n[15],t}}var ai=new P,Ye=new ue,Kh=new P(0,0,0),Qh=new P(1,1,1),En=new P,_s=new P,Fe=new P,bl=new ue,Tl=new cn;class on{constructor(t=0,e=0,n=0,i=on.DEFAULT_ORDER){this.isEuler=!0,this._x=t,this._y=e,this._z=n,this._order=i}get x(){return this._x}set x(t){this._x=t,this._onChangeCallback()}get y(){return this._y}set y(t){this._y=t,this._onChangeCallback()}get z(){return this._z}set z(t){this._z=t,this._onChangeCallback()}get order(){return this._order}set order(t){this._order=t,this._onChangeCallback()}set(t,e,n,i=this._order){return this._x=t,this._y=e,this._z=n,this._order=i,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._order)}copy(t){return this._x=t._x,this._y=t._y,this._z=t._z,this._order=t._order,this._onChangeCallback(),this}setFromRotationMatrix(t,e=this._order,n=!0){let i=t.elements,s=i[0],r=i[4],a=i[8],o=i[1],l=i[5],c=i[9],u=i[2],f=i[6],h=i[10];switch(e){case"XYZ":if(this._y=Math.asin(Qt(a,-1,1)),Math.abs(a)<0.9999999)this._x=Math.atan2(-c,h),this._z=Math.atan2(-r,s);else this._x=Math.atan2(f,l),this._z=0;break;case"YXZ":if(this._x=Math.asin(-Qt(c,-1,1)),Math.abs(c)<0.9999999)this._y=Math.atan2(a,h),this._z=Math.atan2(o,l);else this._y=Math.atan2(-u,s),this._z=0;break;case"ZXY":if(this._x=Math.asin(Qt(f,-1,1)),Math.abs(f)<0.9999999)this._y=Math.atan2(-u,h),this._z=Math.atan2(-r,l);else this._y=0,this._z=Math.atan2(o,s);break;case"ZYX":if(this._y=Math.asin(-Qt(u,-1,1)),Math.abs(u)<0.9999999)this._x=Math.atan2(f,h),this._z=Math.atan2(o,s);else this._x=0,this._z=Math.atan2(-r,l);break;case"YZX":if(this._z=Math.asin(Qt(o,-1,1)),Math.abs(o)<0.9999999)this._x=Math.atan2(-c,l),this._y=Math.atan2(-u,s);else this._x=0,this._y=Math.atan2(a,h);break;case"XZY":if(this._z=Math.asin(-Qt(r,-1,1)),Math.abs(r)<0.9999999)this._x=Math.atan2(f,l),this._y=Math.atan2(a,s);else this._x=Math.atan2(-c,h),this._y=0;break;default:zt("Euler: .setFromRotationMatrix() encountered an unknown order: "+e)}if(this._order=e,n===!0)this._onChangeCallback();return this}setFromQuaternion(t,e,n){return bl.makeRotationFromQuaternion(t),this.setFromRotationMatrix(bl,e,n)}setFromVector3(t,e=this._order){return this.set(t.x,t.y,t.z,e)}reorder(t){return Tl.setFromEuler(this),this.setFromQuaternion(Tl,t)}equals(t){return t._x===this._x&&t._y===this._y&&t._z===this._z&&t._order===this._order}fromArray(t){if(this._x=t[0],this._y=t[1],this._z=t[2],t[3]!==void 0)this._order=t[3];return this._onChangeCallback(),this}toArray(t=[],e=0){return t[e]=this._x,t[e+1]=this._y,t[e+2]=this._z,t[e+3]=this._order,t}_onChange(t){return this._onChangeCallback=t,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._order}}on.DEFAULT_ORDER="XYZ";class rr{constructor(){this.mask=1}set(t){this.mask=(1<<t|0)>>>0}enable(t){this.mask|=1<<t|0}enableAll(){this.mask=-1}toggle(t){this.mask^=1<<t|0}disable(t){this.mask&=~(1<<t|0)}disableAll(){this.mask=0}test(t){return(this.mask&t.mask)!==0}isEnabled(t){return(this.mask&(1<<t|0))!==0}}var jh=0,El=new P,oi=new cn,fn=new ue,xs=new P,Di=new P,tu=new P,eu=new cn,Al=new P(1,0,0),wl=new P(0,1,0),Cl=new P(0,0,1),Rl={type:"added"},nu={type:"removed"},li={type:"childadded",child:null},kr={type:"childremoved",child:null};class Me extends Sn{constructor(){super();this.isObject3D=!0,Object.defineProperty(this,"id",{value:jh++}),this.uuid=xn(),this.name="",this.type="Object3D",this.parent=null,this.children=[],this.up=Me.DEFAULT_UP.clone();let t=new P,e=new on,n=new cn,i=new P(1,1,1);function s(){n.setFromEuler(e,!1)}function r(){e.setFromQuaternion(n,void 0,!1)}e._onChange(s),n._onChange(r),Object.defineProperties(this,{position:{configurable:!0,enumerable:!0,value:t},rotation:{configurable:!0,enumerable:!0,value:e},quaternion:{configurable:!0,enumerable:!0,value:n},scale:{configurable:!0,enumerable:!0,value:i},modelViewMatrix:{value:new ue},normalMatrix:{value:new Gt}}),this.matrix=new ue,this.matrixWorld=new ue,this.matrixAutoUpdate=Me.DEFAULT_MATRIX_AUTO_UPDATE,this.matrixWorldAutoUpdate=Me.DEFAULT_MATRIX_WORLD_AUTO_UPDATE,this.matrixWorldNeedsUpdate=!1,this.layers=new rr,this.visible=!0,this.castShadow=!1,this.receiveShadow=!1,this.frustumCulled=!0,this.renderOrder=0,this.animations=[],this.customDepthMaterial=void 0,this.customDistanceMaterial=void 0,this.static=!1,this.userData={},this.pivot=null}onBeforeShadow(){}onAfterShadow(){}onBeforeRender(){}onAfterRender(){}applyMatrix4(t){if(this.matrixAutoUpdate)this.updateMatrix();this.matrix.premultiply(t),this.matrix.decompose(this.position,this.quaternion,this.scale)}applyQuaternion(t){return this.quaternion.premultiply(t),this}setRotationFromAxisAngle(t,e){this.quaternion.setFromAxisAngle(t,e)}setRotationFromEuler(t){this.quaternion.setFromEuler(t,!0)}setRotationFromMatrix(t){this.quaternion.setFromRotationMatrix(t)}setRotationFromQuaternion(t){this.quaternion.copy(t)}rotateOnAxis(t,e){return oi.setFromAxisAngle(t,e),this.quaternion.multiply(oi),this}rotateOnWorldAxis(t,e){return oi.setFromAxisAngle(t,e),this.quaternion.premultiply(oi),this}rotateX(t){return this.rotateOnAxis(Al,t)}rotateY(t){return this.rotateOnAxis(wl,t)}rotateZ(t){return this.rotateOnAxis(Cl,t)}translateOnAxis(t,e){return El.copy(t).applyQuaternion(this.quaternion),this.position.add(El.multiplyScalar(e)),this}translateX(t){return this.translateOnAxis(Al,t)}translateY(t){return this.translateOnAxis(wl,t)}translateZ(t){return this.translateOnAxis(Cl,t)}localToWorld(t){return this.updateWorldMatrix(!0,!1),t.applyMatrix4(this.matrixWorld)}worldToLocal(t){return this.updateWorldMatrix(!0,!1),t.applyMatrix4(fn.copy(this.matrixWorld).invert())}lookAt(t,e,n){if(t.isVector3)xs.copy(t);else xs.set(t,e,n);let i=this.parent;if(this.updateWorldMatrix(!0,!1),Di.setFromMatrixPosition(this.matrixWorld),this.isCamera||this.isLight)fn.lookAt(Di,xs,this.up);else fn.lookAt(xs,Di,this.up);if(this.quaternion.setFromRotationMatrix(fn),i)fn.extractRotation(i.matrixWorld),oi.setFromRotationMatrix(fn),this.quaternion.premultiply(oi.invert())}add(t){if(arguments.length>1){for(let e=0;e<arguments.length;e++)this.add(arguments[e]);return this}if(t===this)return Bt("Object3D.add: object can't be added as a child of itself.",t),this;if(t&&t.isObject3D)t.removeFromParent(),t.parent=this,this.children.push(t),t.dispatchEvent(Rl),li.child=t,this.dispatchEvent(li),li.child=null;else Bt("Object3D.add: object not an instance of THREE.Object3D.",t);return this}remove(t){if(arguments.length>1){for(let n=0;n<arguments.length;n++)this.remove(arguments[n]);return this}let e=this.children.indexOf(t);if(e!==-1)t.parent=null,this.children.splice(e,1),t.dispatchEvent(nu),kr.child=t,this.dispatchEvent(kr),kr.child=null;return this}removeFromParent(){let t=this.parent;if(t!==null)t.remove(this);return this}clear(){return this.remove(...this.children)}attach(t){if(this.updateWorldMatrix(!0,!1),fn.copy(this.matrixWorld).invert(),t.parent!==null)t.parent.updateWorldMatrix(!0,!1),fn.multiply(t.parent.matrixWorld);return t.applyMatrix4(fn),t.removeFromParent(),t.parent=this,this.children.push(t),t.updateWorldMatrix(!1,!0),t.dispatchEvent(Rl),li.child=t,this.dispatchEvent(li),li.child=null,this}getObjectById(t){return this.getObjectByProperty("id",t)}getObjectByName(t){return this.getObjectByProperty("name",t)}getObjectByProperty(t,e){if(this[t]===e)return this;for(let n=0,i=this.children.length;n<i;n++){let r=this.children[n].getObjectByProperty(t,e);if(r!==void 0)return r}return}getObjectsByProperty(t,e,n=[]){if(this[t]===e)n.push(this);let i=this.children;for(let s=0,r=i.length;s<r;s++)i[s].getObjectsByProperty(t,e,n);return n}getWorldPosition(t){return this.updateWorldMatrix(!0,!1),t.setFromMatrixPosition(this.matrixWorld)}getWorldQuaternion(t){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(Di,t,tu),t}getWorldScale(t){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(Di,eu,t),t}getWorldDirection(t){this.updateWorldMatrix(!0,!1);let e=this.matrixWorld.elements;return t.set(e[8],e[9],e[10]).normalize()}raycast(){}intersectsFrustum(){}traverse(t){t(this);let e=this.children;for(let n=0,i=e.length;n<i;n++)e[n].traverse(t)}traverseVisible(t){if(this.visible===!1)return;t(this);let e=this.children;for(let n=0,i=e.length;n<i;n++)e[n].traverseVisible(t)}traverseAncestors(t){let e=this.parent;if(e!==null)t(e),e.traverseAncestors(t)}updateMatrix(){this.matrix.compose(this.position,this.quaternion,this.scale);let t=this.pivot;if(t!==null){let{x:e,y:n,z:i}=t,s=this.matrix.elements;s[12]+=e-s[0]*e-s[4]*n-s[8]*i,s[13]+=n-s[1]*e-s[5]*n-s[9]*i,s[14]+=i-s[2]*e-s[6]*n-s[10]*i}this.matrixWorldNeedsUpdate=!0}updateMatrixWorld(t){if(this.matrixAutoUpdate)this.updateMatrix();if(this.matrixWorldNeedsUpdate||t){if(this.matrixWorldAutoUpdate===!0)if(this.parent===null)this.matrixWorld.copy(this.matrix);else this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix);this.matrixWorldNeedsUpdate=!1,t=!0}let e=this.children;for(let n=0,i=e.length;n<i;n++)e[n].updateMatrixWorld(t)}updateWorldMatrix(t,e,n=!1){let i=this.parent;if(t===!0&&i!==null)i.updateWorldMatrix(!0,!1);if(this.matrixAutoUpdate)this.updateMatrix();if(this.matrixWorldNeedsUpdate||n){if(this.matrixWorldAutoUpdate===!0)if(this.parent===null)this.matrixWorld.copy(this.matrix);else this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix);this.matrixWorldNeedsUpdate=!1,n=!0}if(e===!0){let s=this.children;for(let r=0,a=s.length;r<a;r++)s[r].updateWorldMatrix(!1,!0,n)}}toJSON(t){let e=t===void 0||typeof t==="string",n={};if(e)t={geometries:{},materials:{},textures:{},images:{},shapes:{},skeletons:{},animations:{},nodes:{}},n.metadata={version:4.7,type:"Object",generator:"Object3D.toJSON"};let i={};if(i.uuid=this.uuid,i.type=this.type,i.name=this.name,i.castShadow=this.castShadow,i.receiveShadow=this.receiveShadow,i.visible=this.visible,i.frustumCulled=this.frustumCulled,i.renderOrder=this.renderOrder,i.static=this.static,i.matrixAutoUpdate=this.matrixAutoUpdate,Object.keys(this.userData).length>0)i.userData=this.userData;if(i.layers=this.layers.mask,i.matrix=this.matrix.toArray(),i.up=this.up.toArray(),this.pivot!==null)i.pivot=this.pivot.toArray();if(this.morphTargetDictionary!==void 0)i.morphTargetDictionary=Object.assign({},this.morphTargetDictionary);if(this.morphTargetInfluences!==void 0)i.morphTargetInfluences=this.morphTargetInfluences.slice();if(this.isInstancedMesh){if(i.type="InstancedMesh",i.count=this.count,i.instanceMatrix=this.instanceMatrix.toJSON(),this.instanceColor!==null)i.instanceColor=this.instanceColor.toJSON()}if(this.isBatchedMesh){if(i.type="BatchedMesh",i.perObjectFrustumCulled=this.perObjectFrustumCulled,i.sortObjects=this.sortObjects,i.drawRanges=this._drawRanges,i.reservedRanges=this._reservedRanges,i.geometryInfo=this._geometryInfo.map((a)=>({...a,boundingBox:a.boundingBox?a.boundingBox.toJSON():void 0,boundingSphere:a.boundingSphere?a.boundingSphere.toJSON():void 0})),i.instanceInfo=this._instanceInfo.map((a)=>({...a})),i.availableInstanceIds=this._availableInstanceIds.slice(),i.availableGeometryIds=this._availableGeometryIds.slice(),i.nextIndexStart=this._nextIndexStart,i.nextVertexStart=this._nextVertexStart,i.geometryCount=this._geometryCount,i.maxInstanceCount=this._maxInstanceCount,i.maxVertexCount=this._maxVertexCount,i.maxIndexCount=this._maxIndexCount,i.geometryInitialized=this._geometryInitialized,i.matricesTexture=this._matricesTexture.toJSON(t),i.indirectTexture=this._indirectTexture.toJSON(t),this._colorsTexture!==null)i.colorsTexture=this._colorsTexture.toJSON(t);if(this.boundingSphere!==null)i.boundingSphere=this.boundingSphere.toJSON();if(this.boundingBox!==null)i.boundingBox=this.boundingBox.toJSON()}function s(a,o){if(a[o.uuid]===void 0)a[o.uuid]=o.toJSON(t);return o.uuid}if(this.isScene){if(this.background){if(this.background.isColor)i.background=this.background.toJSON();else if(this.background.isTexture)i.background=this.background.toJSON(t).uuid}if(this.environment&&this.environment.isTexture&&this.environment.isRenderTargetTexture!==!0)i.environment=this.environment.toJSON(t).uuid}else if(this.isMesh||this.isLine||this.isPoints){i.geometry=s(t.geometries,this.geometry);let a=this.geometry.parameters;if(a!==void 0&&a.shapes!==void 0){let o=a.shapes;if(Array.isArray(o))for(let l=0,c=o.length;l<c;l++){let u=o[l];s(t.shapes,u)}else s(t.shapes,o)}}if(this.isSkinnedMesh){if(i.bindMode=this.bindMode,i.bindMatrix=this.bindMatrix.toArray(),this.skeleton!==void 0)s(t.skeletons,this.skeleton),i.skeleton=this.skeleton.uuid}if(this.material!==void 0)if(Array.isArray(this.material)){let a=[];for(let o=0,l=this.material.length;o<l;o++)a.push(s(t.materials,this.material[o]));i.material=a}else i.material=s(t.materials,this.material);if(this.children.length>0){i.children=[];for(let a=0;a<this.children.length;a++)i.children.push(this.children[a].toJSON(t).object)}if(this.animations.length>0){i.animations=[];for(let a=0;a<this.animations.length;a++){let o=this.animations[a];i.animations.push(s(t.animations,o))}}if(e){let a=r(t.geometries),o=r(t.materials),l=r(t.textures),c=r(t.images),u=r(t.shapes),f=r(t.skeletons),h=r(t.animations),m=r(t.nodes);if(a.length>0)n.geometries=a;if(o.length>0)n.materials=o;if(l.length>0)n.textures=l;if(c.length>0)n.images=c;if(u.length>0)n.shapes=u;if(f.length>0)n.skeletons=f;if(h.length>0)n.animations=h;if(m.length>0)n.nodes=m}return n.object=i,n;function r(a){let o=[];for(let l in a){let c=a[l];delete c.metadata,o.push(c)}return o}}clone(t){return new this.constructor().copy(this,t)}copy(t,e=!0){if(this.name=t.name,this.up.copy(t.up),this.position.copy(t.position),this.rotation.order=t.rotation.order,this.quaternion.copy(t.quaternion),this.scale.copy(t.scale),this.pivot=t.pivot!==null?t.pivot.clone():null,this.matrix.copy(t.matrix),this.matrixWorld.copy(t.matrixWorld),this.matrixAutoUpdate=t.matrixAutoUpdate,this.matrixWorldAutoUpdate=t.matrixWorldAutoUpdate,this.matrixWorldNeedsUpdate=t.matrixWorldNeedsUpdate,this.layers.mask=t.layers.mask,this.visible=t.visible,this.castShadow=t.castShadow,this.receiveShadow=t.receiveShadow,this.frustumCulled=t.frustumCulled,this.renderOrder=t.renderOrder,this.static=t.static,this.animations=t.animations.slice(),this.userData=JSON.parse(JSON.stringify(t.userData)),e===!0)for(let n=0;n<t.children.length;n++){let i=t.children[n];this.add(i.clone())}return this}dispose(){this.dispatchEvent({type:"dispose"})}}Me.DEFAULT_UP=new P(0,1,0);Me.DEFAULT_MATRIX_AUTO_UPDATE=!0;Me.DEFAULT_MATRIX_WORLD_AUTO_UPDATE=!0;class Bn extends Me{constructor(){super();this.isGroup=!0,this.type="Group"}}var iu={type:"move"};class ns{constructor(){this._targetRay=null,this._grip=null,this._hand=null}getHandSpace(){if(this._hand===null)this._hand=new Bn,this._hand.matrixAutoUpdate=!1,this._hand.visible=!1,this._hand.joints={},this._hand.inputState={pinching:!1};return this._hand}getTargetRaySpace(){if(this._targetRay===null)this._targetRay=new Bn,this._targetRay.matrixAutoUpdate=!1,this._targetRay.visible=!1,this._targetRay.hasLinearVelocity=!1,this._targetRay.linearVelocity=new P,this._targetRay.hasAngularVelocity=!1,this._targetRay.angularVelocity=new P;return this._targetRay}getGripSpace(){if(this._grip===null)this._grip=new Bn,this._grip.matrixAutoUpdate=!1,this._grip.visible=!1,this._grip.hasLinearVelocity=!1,this._grip.linearVelocity=new P,this._grip.hasAngularVelocity=!1,this._grip.angularVelocity=new P,this._grip.eventsEnabled=!1;return this._grip}dispatchEvent(t){if(this._targetRay!==null)this._targetRay.dispatchEvent(t);if(this._grip!==null)this._grip.dispatchEvent(t);if(this._hand!==null)this._hand.dispatchEvent(t);return this}connect(t){if(t&&t.hand){let e=this._hand;if(e)for(let n of t.hand.values())this._getHandJoint(e,n)}return this.dispatchEvent({type:"connected",data:t}),this}disconnect(t){if(this.dispatchEvent({type:"disconnected",data:t}),this._targetRay!==null)this._targetRay.visible=!1;if(this._grip!==null)this._grip.visible=!1;if(this._hand!==null)this._hand.visible=!1;return this}update(t,e,n){let i=null,s=null,r=null,a=this._targetRay,o=this._grip,l=this._hand;if(t&&e.session.visibilityState!=="visible-blurred"){if(l&&t.hand){r=!0;for(let v of t.hand.values()){let T=e.getJointPose(v,n),p=this._getHandJoint(l,v);if(T!==null)p.matrix.fromArray(T.transform.matrix),p.matrix.decompose(p.position,p.rotation,p.scale),p.matrixWorldNeedsUpdate=!0,p.jointRadius=T.radius;p.visible=T!==null}let c=l.joints["index-finger-tip"],u=l.joints["thumb-tip"],f=c.position.distanceTo(u.position),h=0.02,m=0.005;if(l.inputState.pinching&&f>h+m)l.inputState.pinching=!1,this.dispatchEvent({type:"pinchend",handedness:t.handedness,target:this});else if(!l.inputState.pinching&&f<=h-m)l.inputState.pinching=!0,this.dispatchEvent({type:"pinchstart",handedness:t.handedness,target:this})}else if(o!==null&&t.gripSpace){if(s=e.getPose(t.gripSpace,n),s!==null){if(o.matrix.fromArray(s.transform.matrix),o.matrix.decompose(o.position,o.rotation,o.scale),o.matrixWorldNeedsUpdate=!0,s.linearVelocity)o.hasLinearVelocity=!0,o.linearVelocity.copy(s.linearVelocity);else o.hasLinearVelocity=!1;if(s.angularVelocity)o.hasAngularVelocity=!0,o.angularVelocity.copy(s.angularVelocity);else o.hasAngularVelocity=!1;if(o.eventsEnabled)o.dispatchEvent({type:"gripUpdated",data:t,target:this})}}if(a!==null){if(i=e.getPose(t.targetRaySpace,n),i===null&&s!==null)i=s;if(i!==null){if(a.matrix.fromArray(i.transform.matrix),a.matrix.decompose(a.position,a.rotation,a.scale),a.matrixWorldNeedsUpdate=!0,i.linearVelocity)a.hasLinearVelocity=!0,a.linearVelocity.copy(i.linearVelocity);else a.hasLinearVelocity=!1;if(i.angularVelocity)a.hasAngularVelocity=!0,a.angularVelocity.copy(i.angularVelocity);else a.hasAngularVelocity=!1;this.dispatchEvent(iu)}}}if(a!==null)a.visible=i!==null;if(o!==null)o.visible=s!==null;if(l!==null)l.visible=r!==null;return this}_getHandJoint(t,e){if(t.joints[e.jointName]===void 0){let n=new Bn;n.matrixAutoUpdate=!1,n.visible=!1,t.joints[e.jointName]=n,t.add(n)}return t.joints[e.jointName]}}var Xc={aliceblue:15792383,antiquewhite:16444375,aqua:65535,aquamarine:8388564,azure:15794175,beige:16119260,bisque:16770244,black:0,blanchedalmond:16772045,blue:255,blueviolet:9055202,brown:10824234,burlywood:14596231,cadetblue:6266528,chartreuse:8388352,chocolate:13789470,coral:16744272,cornflowerblue:6591981,cornsilk:16775388,crimson:14423100,cyan:65535,darkblue:139,darkcyan:35723,darkgoldenrod:12092939,darkgray:11119017,darkgreen:25600,darkgrey:11119017,darkkhaki:12433259,darkmagenta:9109643,darkolivegreen:5597999,darkorange:16747520,darkorchid:10040012,darkred:9109504,darksalmon:15308410,darkseagreen:9419919,darkslateblue:4734347,darkslategray:3100495,darkslategrey:3100495,darkturquoise:52945,darkviolet:9699539,deeppink:16716947,deepskyblue:49151,dimgray:6908265,dimgrey:6908265,dodgerblue:2003199,firebrick:11674146,floralwhite:16775920,forestgreen:2263842,fuchsia:16711935,gainsboro:14474460,ghostwhite:16316671,gold:16766720,goldenrod:14329120,gray:8421504,green:32768,greenyellow:11403055,grey:8421504,honeydew:15794160,hotpink:16738740,indianred:13458524,indigo:4915330,ivory:16777200,khaki:15787660,lavender:15132410,lavenderblush:16773365,lawngreen:8190976,lemonchiffon:16775885,lightblue:11393254,lightcoral:15761536,lightcyan:14745599,lightgoldenrodyellow:16448210,lightgray:13882323,lightgreen:9498256,lightgrey:13882323,lightpink:16758465,lightsalmon:16752762,lightseagreen:2142890,lightskyblue:8900346,lightslategray:7833753,lightslategrey:7833753,lightsteelblue:11584734,lightyellow:16777184,lime:65280,limegreen:3329330,linen:16445670,magenta:16711935,maroon:8388608,mediumaquamarine:6737322,mediumblue:205,mediumorchid:12211667,mediumpurple:9662683,mediumseagreen:3978097,mediumslateblue:8087790,mediumspringgreen:64154,mediumturquoise:4772300,mediumvioletred:13047173,midnightblue:1644912,mintcream:16121850,mistyrose:16770273,moccasin:16770229,navajowhite:16768685,navy:128,oldlace:16643558,olive:8421376,olivedrab:7048739,orange:16753920,orangered:16729344,orchid:14315734,palegoldenrod:15657130,palegreen:10025880,paleturquoise:11529966,palevioletred:14381203,papayawhip:16773077,peachpuff:16767673,peru:13468991,pink:16761035,plum:14524637,powderblue:11591910,purple:8388736,rebeccapurple:6697881,red:16711680,rosybrown:12357519,royalblue:4286945,saddlebrown:9127187,salmon:16416882,sandybrown:16032864,seagreen:3050327,seashell:16774638,sienna:10506797,silver:12632256,skyblue:8900331,slateblue:6970061,slategray:7372944,slategrey:7372944,snow:16775930,springgreen:65407,steelblue:4620980,tan:13808780,teal:32896,thistle:14204888,tomato:16737095,turquoise:4251856,violet:15631086,wheat:16113331,white:16777215,whitesmoke:16119285,yellow:16776960,yellowgreen:10145074},An={h:0,s:0,l:0},vs={h:0,s:0,l:0};function Hr(t,e,n){if(n<0)n+=1;if(n>1)n-=1;if(n<0.16666666666666666)return t+(e-t)*6*n;if(n<0.5)return e;if(n<0.6666666666666666)return t+(e-t)*6*(0.6666666666666666-n);return t}class Zt{constructor(t,e,n){return this.isColor=!0,this.r=1,this.g=1,this.b=1,this.set(t,e,n)}set(t,e,n){if(e===void 0&&n===void 0){let i=t;if(i&&i.isColor)this.copy(i);else if(typeof i==="number")this.setHex(i);else if(typeof i==="string")this.setStyle(i)}else this.setRGB(t,e,n);return this}setScalar(t){return this.r=t,this.g=t,this.b=t,this}setHex(t,e="srgb"){return t=Math.floor(t),this.r=(t>>16&255)/255,this.g=(t>>8&255)/255,this.b=(t&255)/255,Kt.colorSpaceToWorking(this,e),this}setRGB(t,e,n,i=Kt.workingColorSpace){return this.r=t,this.g=e,this.b=n,Kt.colorSpaceToWorking(this,i),this}setHSL(t,e,n,i=Kt.workingColorSpace){if(t=Yh(t,1),e=Qt(e,0,1),n=Qt(n,0,1),e===0)this.r=this.g=this.b=n;else{let s=n<=0.5?n*(1+e):n+e-n*e,r=2*n-s;this.r=Hr(r,s,t+0.3333333333333333),this.g=Hr(r,s,t),this.b=Hr(r,s,t-0.3333333333333333)}return Kt.colorSpaceToWorking(this,i),this}setStyle(t,e="srgb"){function n(s){if(s===void 0)return;if(parseFloat(s)<1)zt("Color: Alpha component of "+t+" will be ignored.")}let i;if(i=/^(\w+)\(([^\)]*)\)/.exec(t)){let s,r=i[1],a=i[2];switch(r){case"rgb":case"rgba":if(s=/^\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(a))return n(s[4]),this.setRGB(Math.min(255,parseInt(s[1],10))/255,Math.min(255,parseInt(s[2],10))/255,Math.min(255,parseInt(s[3],10))/255,e);if(s=/^\s*(\d+)\%\s*,\s*(\d+)\%\s*,\s*(\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(a))return n(s[4]),this.setRGB(Math.min(100,parseInt(s[1],10))/100,Math.min(100,parseInt(s[2],10))/100,Math.min(100,parseInt(s[3],10))/100,e);break;case"hsl":case"hsla":if(s=/^\s*(\d*\.?\d+)\s*,\s*(\d*\.?\d+)\%\s*,\s*(\d*\.?\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(a))return n(s[4]),this.setHSL(parseFloat(s[1])/360,parseFloat(s[2])/100,parseFloat(s[3])/100,e);break;default:zt("Color: Unknown color model "+t)}}else if(i=/^\#([A-Fa-f\d]+)$/.exec(t)){let s=i[1],r=s.length;if(r===3)return this.setRGB(parseInt(s.charAt(0),16)/15,parseInt(s.charAt(1),16)/15,parseInt(s.charAt(2),16)/15,e);else if(r===6)return this.setHex(parseInt(s,16),e);else zt("Color: Invalid hex color "+t)}else if(t&&t.length>0)return this.setColorName(t,e);return this}setColorName(t,e="srgb"){let n=Xc[t.toLowerCase()];if(n!==void 0)this.setHex(n,e);else zt("Color: Unknown color "+t);return this}clone(){return new this.constructor(this.r,this.g,this.b)}copy(t){return this.r=t.r,this.g=t.g,this.b=t.b,this}copySRGBToLinear(t){return this.r=vn(t.r),this.g=vn(t.g),this.b=vn(t.b),this}copyLinearToSRGB(t){return this.r=Mi(t.r),this.g=Mi(t.g),this.b=Mi(t.b),this}convertSRGBToLinear(){return this.copySRGBToLinear(this),this}convertLinearToSRGB(){return this.copyLinearToSRGB(this),this}getHex(t="srgb"){return Kt.workingToColorSpace(Re.copy(this),t),Math.round(Qt(Re.r*255,0,255))*65536+Math.round(Qt(Re.g*255,0,255))*256+Math.round(Qt(Re.b*255,0,255))}getHexString(t="srgb"){return("000000"+this.getHex(t).toString(16)).slice(-6)}getHSL(t,e=Kt.workingColorSpace){Kt.workingToColorSpace(Re.copy(this),e);let{r:n,g:i,b:s}=Re,r=Math.max(n,i,s),a=Math.min(n,i,s),o,l,c=(a+r)/2;if(a===r)o=0,l=0;else{let u=r-a;switch(l=c<=0.5?u/(r+a):u/(2-r-a),r){case n:o=(i-s)/u+(i<s?6:0);break;case i:o=(s-n)/u+2;break;case s:o=(n-i)/u+4;break}o/=6}return t.h=o,t.s=l,t.l=c,t}getRGB(t,e=Kt.workingColorSpace){return Kt.workingToColorSpace(Re.copy(this),e),t.r=Re.r,t.g=Re.g,t.b=Re.b,t}getStyle(t="srgb"){Kt.workingToColorSpace(Re.copy(this),t);let{r:e,g:n,b:i}=Re;if(t!=="srgb")return`color(${t} ${e.toFixed(3)} ${n.toFixed(3)} ${i.toFixed(3)})`;return`rgb(${Math.round(e*255)},${Math.round(n*255)},${Math.round(i*255)})`}offsetHSL(t,e,n){return this.getHSL(An),this.setHSL(An.h+t,An.s+e,An.l+n)}add(t){return this.r+=t.r,this.g+=t.g,this.b+=t.b,this}addColors(t,e){return this.r=t.r+e.r,this.g=t.g+e.g,this.b=t.b+e.b,this}addScalar(t){return this.r+=t,this.g+=t,this.b+=t,this}sub(t){return this.r=Math.max(0,this.r-t.r),this.g=Math.max(0,this.g-t.g),this.b=Math.max(0,this.b-t.b),this}multiply(t){return this.r*=t.r,this.g*=t.g,this.b*=t.b,this}multiplyScalar(t){return this.r*=t,this.g*=t,this.b*=t,this}lerp(t,e){return this.r+=(t.r-this.r)*e,this.g+=(t.g-this.g)*e,this.b+=(t.b-this.b)*e,this}lerpColors(t,e,n){return this.r=t.r+(e.r-t.r)*n,this.g=t.g+(e.g-t.g)*n,this.b=t.b+(e.b-t.b)*n,this}lerpHSL(t,e){this.getHSL(An),t.getHSL(vs);let n=Fr(An.h,vs.h,e),i=Fr(An.s,vs.s,e),s=Fr(An.l,vs.l,e);return this.setHSL(n,i,s),this}setFromVector3(t){return this.r=t.x,this.g=t.y,this.b=t.z,this}applyMatrix3(t){let e=this.r,n=this.g,i=this.b,s=t.elements;return this.r=s[0]*e+s[3]*n+s[6]*i,this.g=s[1]*e+s[4]*n+s[7]*i,this.b=s[2]*e+s[5]*n+s[8]*i,this}equals(t){return t.r===this.r&&t.g===this.g&&t.b===this.b}fromArray(t,e=0){return this.r=t[e],this.g=t[e+1],this.b=t[e+2],this}toArray(t=[],e=0){return t[e]=this.r,t[e+1]=this.g,t[e+2]=this.b,t}fromBufferAttribute(t,e){return this.r=t.getX(e),this.g=t.getY(e),this.b=t.getZ(e),this}toJSON(){return this.getHex()}*[Symbol.iterator](){yield this.r,yield this.g,yield this.b}}var Re=new Zt;Zt.NAMES=Xc;class _o extends Me{constructor(){super();if(this.isScene=!0,this.type="Scene",this.background=null,this.environment=null,this.fog=null,this.backgroundBlurriness=0,this.backgroundIntensity=1,this.backgroundRotation=new on,this.environmentIntensity=1,this.environmentRotation=new on,this.overrideMaterial=null,typeof __THREE_DEVTOOLS__<"u")__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}copy(t,e){if(super.copy(t,e),t.background!==null)this.background=t.background.clone();if(t.environment!==null)this.environment=t.environment.clone();if(t.fog!==null)this.fog=t.fog.clone();if(this.backgroundBlurriness=t.backgroundBlurriness,this.backgroundIntensity=t.backgroundIntensity,this.backgroundRotation.copy(t.backgroundRotation),this.environmentIntensity=t.environmentIntensity,this.environmentRotation.copy(t.environmentRotation),t.overrideMaterial!==null)this.overrideMaterial=t.overrideMaterial.clone();return this.matrixAutoUpdate=t.matrixAutoUpdate,this}toJSON(t){let e=super.toJSON(t);if(this.fog!==null)e.object.fog=this.fog.toJSON();return e.object.backgroundBlurriness=this.backgroundBlurriness,e.object.backgroundIntensity=this.backgroundIntensity,e.object.backgroundRotation=this.backgroundRotation.toArray(),e.object.environmentIntensity=this.environmentIntensity,e.object.environmentRotation=this.environmentRotation.toArray(),e}}var Ze=new P,pn=new P,Vr=new P,mn=new P,ci=new P,hi=new P,Il=new P,Wr=new P,Xr=new P,qr=new P,Yr=new ge,Zr=new ge,Jr=new ge;class ze{constructor(t=new P,e=new P,n=new P){this.a=t,this.b=e,this.c=n}static getNormal(t,e,n,i){i.subVectors(n,e),Ze.subVectors(t,e),i.cross(Ze);let s=i.lengthSq();if(s>0)return i.multiplyScalar(1/Math.sqrt(s));return i.set(0,0,0)}static getBarycoord(t,e,n,i,s){Ze.subVectors(i,e),pn.subVectors(n,e),Vr.subVectors(t,e);let r=Ze.dot(Ze),a=Ze.dot(pn),o=Ze.dot(Vr),l=pn.dot(pn),c=pn.dot(Vr),u=r*l-a*a;if(u===0)return s.set(0,0,0),null;let f=1/u,h=(l*o-a*c)*f,m=(r*c-a*o)*f;return s.set(1-h-m,m,h)}static containsPoint(t,e,n,i){if(this.getBarycoord(t,e,n,i,mn)===null)return!1;return mn.x>=0&&mn.y>=0&&mn.x+mn.y<=1}static getInterpolation(t,e,n,i,s,r,a,o){if(this.getBarycoord(t,e,n,i,mn)===null){if(o.x=0,o.y=0,"z"in o)o.z=0;if("w"in o)o.w=0;return null}return o.setScalar(0),o.addScaledVector(s,mn.x),o.addScaledVector(r,mn.y),o.addScaledVector(a,mn.z),o}static getInterpolatedAttribute(t,e,n,i,s,r){return Yr.setScalar(0),Zr.setScalar(0),Jr.setScalar(0),Yr.fromBufferAttribute(t,e),Zr.fromBufferAttribute(t,n),Jr.fromBufferAttribute(t,i),r.setScalar(0),r.addScaledVector(Yr,s.x),r.addScaledVector(Zr,s.y),r.addScaledVector(Jr,s.z),r}static isFrontFacing(t,e,n,i){return Ze.subVectors(n,e),pn.subVectors(t,e),Ze.cross(pn).dot(i)<0}set(t,e,n){return this.a.copy(t),this.b.copy(e),this.c.copy(n),this}setFromPointsAndIndices(t,e,n,i){return this.a.copy(t[e]),this.b.copy(t[n]),this.c.copy(t[i]),this}setFromAttributeAndIndices(t,e,n,i){return this.a.fromBufferAttribute(t,e),this.b.fromBufferAttribute(t,n),this.c.fromBufferAttribute(t,i),this}clone(){return new this.constructor().copy(this)}copy(t){return this.a.copy(t.a),this.b.copy(t.b),this.c.copy(t.c),this}getArea(){return Ze.subVectors(this.c,this.b),pn.subVectors(this.a,this.b),Ze.cross(pn).length()*0.5}getMidpoint(t){return t.addVectors(this.a,this.b).add(this.c).multiplyScalar(0.3333333333333333)}getNormal(t){return ze.getNormal(this.a,this.b,this.c,t)}getPlane(t){return t.setFromCoplanarPoints(this.a,this.b,this.c)}getBarycoord(t,e){return ze.getBarycoord(t,this.a,this.b,this.c,e)}getInterpolation(t,e,n,i,s){return ze.getInterpolation(t,this.a,this.b,this.c,e,n,i,s)}containsPoint(t){return ze.containsPoint(t,this.a,this.b,this.c)}isFrontFacing(t){return ze.isFrontFacing(this.a,this.b,this.c,t)}intersectsBox(t){return t.intersectsTriangle(this)}closestPointToPoint(t,e){let n=this.a,i=this.b,s=this.c,r,a;ci.subVectors(i,n),hi.subVectors(s,n),Wr.subVectors(t,n);let o=ci.dot(Wr),l=hi.dot(Wr);if(o<=0&&l<=0)return e.copy(n);Xr.subVectors(t,i);let c=ci.dot(Xr),u=hi.dot(Xr);if(c>=0&&u<=c)return e.copy(i);let f=o*u-c*l;if(f<=0&&o>=0&&c<=0)return r=o/(o-c),e.copy(n).addScaledVector(ci,r);qr.subVectors(t,s);let h=ci.dot(qr),m=hi.dot(qr);if(m>=0&&h<=m)return e.copy(s);let v=h*l-o*m;if(v<=0&&l>=0&&m<=0)return a=l/(l-m),e.copy(n).addScaledVector(hi,a);let T=c*m-h*u;if(T<=0&&u-c>=0&&h-m>=0)return Il.subVectors(s,i),a=(u-c)/(u-c+(h-m)),e.copy(i).addScaledVector(Il,a);let p=1/(T+v+f);return r=v*p,a=f*p,e.copy(n).addScaledVector(ci,r).addScaledVector(hi,a)}equals(t){return t.a.equals(this.a)&&t.b.equals(this.b)&&t.c.equals(this.c)}}class Jn{constructor(t=new P(1/0,1/0,1/0),e=new P(-1/0,-1/0,-1/0)){this.isBox3=!0,this.min=t,this.max=e}set(t,e){return this.min.copy(t),this.max.copy(e),this}setFromArray(t){this.makeEmpty();for(let e=0,n=t.length;e<n;e+=3)this.expandByPoint(Je.fromArray(t,e));return this}setFromBufferAttribute(t){this.makeEmpty();for(let e=0,n=t.count;e<n;e++)this.expandByPoint(Je.fromBufferAttribute(t,e));return this}setFromPoints(t){this.makeEmpty();for(let e=0,n=t.length;e<n;e++)this.expandByPoint(t[e]);return this}setFromCenterAndSize(t,e){let n=Je.copy(e).multiplyScalar(0.5);return this.min.copy(t).sub(n),this.max.copy(t).add(n),this}setFromObject(t,e=!1){return this.makeEmpty(),this.expandByObject(t,e)}clone(){return new this.constructor().copy(this)}copy(t){return this.min.copy(t.min),this.max.copy(t.max),this}makeEmpty(){return this.min.x=this.min.y=this.min.z=1/0,this.max.x=this.max.y=this.max.z=-1/0,this}isEmpty(){return this.max.x<this.min.x||this.max.y<this.min.y||this.max.z<this.min.z}getCenter(t){return this.isEmpty()?t.set(0,0,0):t.addVectors(this.min,this.max).multiplyScalar(0.5)}getSize(t){return this.isEmpty()?t.set(0,0,0):t.subVectors(this.max,this.min)}expandByPoint(t){return this.min.min(t),this.max.max(t),this}expandByVector(t){return this.min.sub(t),this.max.add(t),this}expandByScalar(t){return this.min.addScalar(-t),this.max.addScalar(t),this}expandByObject(t,e=!1){t.updateWorldMatrix(!1,!1);let n=t.geometry;if(n!==void 0){let s=n.getAttribute("position");if(e===!0&&s!==void 0&&t.isInstancedMesh!==!0)for(let r=0,a=s.count;r<a;r++){if(t.isMesh===!0)t.getVertexPosition(r,Je);else Je.fromBufferAttribute(s,r);Je.applyMatrix4(t.matrixWorld),this.expandByPoint(Je)}else{if(t.boundingBox!==void 0){if(t.boundingBox===null)t.computeBoundingBox();ys.copy(t.boundingBox)}else{if(n.boundingBox===null)n.computeBoundingBox();ys.copy(n.boundingBox)}ys.applyMatrix4(t.matrixWorld),this.union(ys)}}let i=t.children;for(let s=0,r=i.length;s<r;s++)this.expandByObject(i[s],e);return this}containsPoint(t){return t.x>=this.min.x&&t.x<=this.max.x&&t.y>=this.min.y&&t.y<=this.max.y&&t.z>=this.min.z&&t.z<=this.max.z}containsBox(t){return this.min.x<=t.min.x&&t.max.x<=this.max.x&&this.min.y<=t.min.y&&t.max.y<=this.max.y&&this.min.z<=t.min.z&&t.max.z<=this.max.z}getParameter(t,e){return e.set((t.x-this.min.x)/(this.max.x-this.min.x),(t.y-this.min.y)/(this.max.y-this.min.y),(t.z-this.min.z)/(this.max.z-this.min.z))}intersectsBox(t){return t.max.x>=this.min.x&&t.min.x<=this.max.x&&t.max.y>=this.min.y&&t.min.y<=this.max.y&&t.max.z>=this.min.z&&t.min.z<=this.max.z}intersectsSphere(t){return this.clampPoint(t.center,Je),Je.distanceToSquared(t.center)<=t.radius*t.radius}intersectsPlane(t){let e,n;if(t.normal.x>0)e=t.normal.x*this.min.x,n=t.normal.x*this.max.x;else e=t.normal.x*this.max.x,n=t.normal.x*this.min.x;if(t.normal.y>0)e+=t.normal.y*this.min.y,n+=t.normal.y*this.max.y;else e+=t.normal.y*this.max.y,n+=t.normal.y*this.min.y;if(t.normal.z>0)e+=t.normal.z*this.min.z,n+=t.normal.z*this.max.z;else e+=t.normal.z*this.max.z,n+=t.normal.z*this.min.z;return e<=-t.constant&&n>=-t.constant}intersectsTriangle(t){if(this.isEmpty())return!1;this.getCenter(Ui),Ss.subVectors(this.max,Ui),ui.subVectors(t.a,Ui),di.subVectors(t.b,Ui),fi.subVectors(t.c,Ui),wn.subVectors(di,ui),Cn.subVectors(fi,di),Dn.subVectors(ui,fi);let e=[0,-wn.z,wn.y,0,-Cn.z,Cn.y,0,-Dn.z,Dn.y,wn.z,0,-wn.x,Cn.z,0,-Cn.x,Dn.z,0,-Dn.x,-wn.y,wn.x,0,-Cn.y,Cn.x,0,-Dn.y,Dn.x,0];if(!$r(e,ui,di,fi,Ss))return!1;if(e=[1,0,0,0,1,0,0,0,1],!$r(e,ui,di,fi,Ss))return!1;return Ms.crossVectors(wn,Cn),e=[Ms.x,Ms.y,Ms.z],$r(e,ui,di,fi,Ss)}clampPoint(t,e){return e.copy(t).clamp(this.min,this.max)}distanceToPoint(t){return this.clampPoint(t,Je).distanceTo(t)}getBoundingSphere(t){if(this.isEmpty())t.makeEmpty();else this.getCenter(t.center),t.radius=this.getSize(Je).length()*0.5;return t}intersect(t){if(this.min.max(t.min),this.max.min(t.max),this.isEmpty())this.makeEmpty();return this}union(t){return this.min.min(t.min),this.max.max(t.max),this}applyMatrix4(t){if(this.isEmpty())return this;return gn[0].set(this.min.x,this.min.y,this.min.z).applyMatrix4(t),gn[1].set(this.min.x,this.min.y,this.max.z).applyMatrix4(t),gn[2].set(this.min.x,this.max.y,this.min.z).applyMatrix4(t),gn[3].set(this.min.x,this.max.y,this.max.z).applyMatrix4(t),gn[4].set(this.max.x,this.min.y,this.min.z).applyMatrix4(t),gn[5].set(this.max.x,this.min.y,this.max.z).applyMatrix4(t),gn[6].set(this.max.x,this.max.y,this.min.z).applyMatrix4(t),gn[7].set(this.max.x,this.max.y,this.max.z).applyMatrix4(t),this.setFromPoints(gn),this}translate(t){return this.min.add(t),this.max.add(t),this}equals(t){return t.min.equals(this.min)&&t.max.equals(this.max)}toJSON(){return{min:this.min.toArray(),max:this.max.toArray()}}fromJSON(t){return this.min.fromArray(t.min),this.max.fromArray(t.max),this}}var gn=[new P,new P,new P,new P,new P,new P,new P,new P],Je=new P,ys=new Jn,ui=new P,di=new P,fi=new P,wn=new P,Cn=new P,Dn=new P,Ui=new P,Ss=new P,Ms=new P,Un=new P;function $r(t,e,n,i,s){for(let r=0,a=t.length-3;r<=a;r+=3){Un.fromArray(t,r);let o=s.x*Math.abs(Un.x)+s.y*Math.abs(Un.y)+s.z*Math.abs(Un.z),l=e.dot(Un),c=n.dot(Un),u=i.dot(Un);if(Math.max(-Math.max(l,c,u),Math.min(l,c,u))>o)return!1}return!0}var Se=new P,bs=new lt,su=0;class Ue extends Sn{constructor(t,e,n=!1){super();if(Array.isArray(t))throw TypeError("THREE.BufferAttribute: array should be a Typed Array.");this.isBufferAttribute=!0,Object.defineProperty(this,"id",{value:su++}),this.name="",this.array=t,this.itemSize=e,this.count=t!==void 0?t.length/e:0,this.normalized=n,this.usage=35044,this.updateRanges=[],this.gpuType=1015,this.version=0}onUploadCallback(){}set needsUpdate(t){if(t===!0)this.version++}setUsage(t){return this.usage=t,this}addUpdateRange(t,e){this.updateRanges.push({start:t,count:e})}clearUpdateRanges(){this.updateRanges.length=0}copy(t){return this.name=t.name,this.array=new t.array.constructor(t.array),this.itemSize=t.itemSize,this.count=t.count,this.normalized=t.normalized,this.usage=t.usage,this.gpuType=t.gpuType,this}copyAt(t,e,n){t*=this.itemSize,n*=e.itemSize;for(let i=0,s=this.itemSize;i<s;i++)this.array[t+i]=e.array[n+i];return this}copyArray(t){return this.array.set(t),this}applyMatrix3(t){if(this.itemSize===2)for(let e=0,n=this.count;e<n;e++)bs.fromBufferAttribute(this,e),bs.applyMatrix3(t),this.setXY(e,bs.x,bs.y);else if(this.itemSize===3)for(let e=0,n=this.count;e<n;e++)Se.fromBufferAttribute(this,e),Se.applyMatrix3(t),this.setXYZ(e,Se.x,Se.y,Se.z);return this}applyMatrix4(t){for(let e=0,n=this.count;e<n;e++)Se.fromBufferAttribute(this,e),Se.applyMatrix4(t),this.setXYZ(e,Se.x,Se.y,Se.z);return this}applyNormalMatrix(t){for(let e=0,n=this.count;e<n;e++)Se.fromBufferAttribute(this,e),Se.applyNormalMatrix(t),this.setXYZ(e,Se.x,Se.y,Se.z);return this}transformDirection(t){for(let e=0,n=this.count;e<n;e++)Se.fromBufferAttribute(this,e),Se.transformDirection(t),this.setXYZ(e,Se.x,Se.y,Se.z);return this}set(t,e=0){return this.array.set(t,e),this}getComponent(t,e){let n=this.array[t*this.itemSize+e];if(this.normalized)n=an(n,this.array);return n}setComponent(t,e,n){if(this.normalized)n=ce(n,this.array);return this.array[t*this.itemSize+e]=n,this}getX(t){let e=this.array[t*this.itemSize];if(this.normalized)e=an(e,this.array);return e}setX(t,e){if(this.normalized)e=ce(e,this.array);return this.array[t*this.itemSize]=e,this}getY(t){let e=this.array[t*this.itemSize+1];if(this.normalized)e=an(e,this.array);return e}setY(t,e){if(this.normalized)e=ce(e,this.array);return this.array[t*this.itemSize+1]=e,this}getZ(t){let e=this.array[t*this.itemSize+2];if(this.normalized)e=an(e,this.array);return e}setZ(t,e){if(this.normalized)e=ce(e,this.array);return this.array[t*this.itemSize+2]=e,this}getW(t){let e=this.array[t*this.itemSize+3];if(this.normalized)e=an(e,this.array);return e}setW(t,e){if(this.normalized)e=ce(e,this.array);return this.array[t*this.itemSize+3]=e,this}setXY(t,e,n){if(t*=this.itemSize,this.normalized)e=ce(e,this.array),n=ce(n,this.array);return this.array[t+0]=e,this.array[t+1]=n,this}setXYZ(t,e,n,i){if(t*=this.itemSize,this.normalized)e=ce(e,this.array),n=ce(n,this.array),i=ce(i,this.array);return this.array[t+0]=e,this.array[t+1]=n,this.array[t+2]=i,this}setXYZW(t,e,n,i,s){if(t*=this.itemSize,this.normalized)e=ce(e,this.array),n=ce(n,this.array),i=ce(i,this.array),s=ce(s,this.array);return this.array[t+0]=e,this.array[t+1]=n,this.array[t+2]=i,this.array[t+3]=s,this}onUpload(t){return this.onUploadCallback=t,this}clone(){return new this.constructor(this.array,this.itemSize).copy(this)}toJSON(){let t={itemSize:this.itemSize,type:this.array.constructor.name,array:Array.from(this.array),normalized:this.normalized};return t.name=this.name,t.usage=this.usage,t.gpuType=this.gpuType,t}dispose(){this.dispatchEvent({type:"dispose"})}}class is extends Ue{constructor(t,e,n){super(new Uint16Array(t),e,n)}}class ss extends Ue{constructor(t,e,n){super(new Uint32Array(t),e,n)}}class jt extends Ue{constructor(t,e,n){super(new Float32Array(t),e,n)}}var ru=new Jn,Fi=new P,Kr=new P;class rs{constructor(t=new P,e=-1){this.isSphere=!0,this.center=t,this.radius=e}set(t,e){return this.center.copy(t),this.radius=e,this}setFromPoints(t,e){let n=this.center;if(e!==void 0)n.copy(e);else ru.setFromPoints(t).getCenter(n);let i=0;for(let s=0,r=t.length;s<r;s++)i=Math.max(i,n.distanceToSquared(t[s]));return this.radius=Math.sqrt(i),this}copy(t){return this.center.copy(t.center),this.radius=t.radius,this}isEmpty(){return this.radius<0}makeEmpty(){return this.center.set(0,0,0),this.radius=-1,this}containsPoint(t){return t.distanceToSquared(this.center)<=this.radius*this.radius}distanceToPoint(t){return t.distanceTo(this.center)-this.radius}intersectsSphere(t){let e=this.radius+t.radius;return t.center.distanceToSquared(this.center)<=e*e}intersectsBox(t){return t.intersectsSphere(this)}intersectsPlane(t){return Math.abs(t.distanceToPoint(this.center))<=this.radius}clampPoint(t,e){let n=this.center.distanceToSquared(t);if(e.copy(t),n>this.radius*this.radius)e.sub(this.center).normalize(),e.multiplyScalar(this.radius).add(this.center);return e}getBoundingBox(t){if(this.isEmpty())return t.makeEmpty(),t;return t.set(this.center,this.center),t.expandByScalar(this.radius),t}applyMatrix4(t){return this.center.applyMatrix4(t),this.radius=this.radius*t.getMaxScaleOnAxis(),this}translate(t){return this.center.add(t),this}expandByPoint(t){if(this.isEmpty())return this.center.copy(t),this.radius=0,this;Fi.subVectors(t,this.center);let e=Fi.lengthSq();if(e>this.radius*this.radius){let n=Math.sqrt(e),i=(n-this.radius)*0.5;this.center.addScaledVector(Fi,i/n),this.radius+=i}return this}union(t){if(t.isEmpty())return this;if(this.isEmpty())return this.copy(t),this;if(this.center.equals(t.center)===!0)this.radius=Math.max(this.radius,t.radius);else Kr.subVectors(t.center,this.center).setLength(t.radius),this.expandByPoint(Fi.copy(t.center).add(Kr)),this.expandByPoint(Fi.copy(t.center).sub(Kr));return this}equals(t){return t.center.equals(this.center)&&t.radius===this.radius}clone(){return new this.constructor().copy(this)}toJSON(){return{radius:this.radius,center:this.center.toArray()}}fromJSON(t){return this.radius=t.radius,this.center.fromArray(t.center),this}}var au=0,Ve=new ue,Qr=new Me,pi=new P,Oe=new Jn,Oi=new Jn,Ee=new P;class ve extends Sn{constructor(){super();this.isBufferGeometry=!0,Object.defineProperty(this,"id",{value:au++}),this.uuid=xn(),this.name="",this.type="BufferGeometry",this.index=null,this.indirect=null,this.indirectOffset=0,this.attributes={},this.morphAttributes={},this.morphTargetsRelative=!1,this.groups=[],this.boundingBox=null,this.boundingSphere=null,this.drawRange={start:0,count:1/0},this.userData={},this._transformed=!1}getIndex(){return this.index}setIndex(t){if(Array.isArray(t))this.index=new((Xh(t))?ss:is)(t,1);else this.index=t;return this}setIndirect(t,e=0){return this.indirect=t,this.indirectOffset=e,this}getIndirect(){return this.indirect}getAttribute(t){return this.attributes[t]}setAttribute(t,e){return this.attributes[t]=e,this}deleteAttribute(t){return delete this.attributes[t],this}hasAttribute(t){return this.attributes[t]!==void 0}addGroup(t,e,n=0){this.groups.push({start:t,count:e,materialIndex:n})}clearGroups(){this.groups=[]}setDrawRange(t,e){this.drawRange.start=t,this.drawRange.count=e}applyMatrix4(t){let e=this.attributes.position;if(e!==void 0)e.applyMatrix4(t),e.needsUpdate=!0;let n=this.attributes.normal;if(n!==void 0){let s=new Gt().getNormalMatrix(t);n.applyNormalMatrix(s),n.needsUpdate=!0}let i=this.attributes.tangent;if(i!==void 0)i.transformDirection(t),i.needsUpdate=!0;if(this.boundingBox!==null)this.computeBoundingBox();if(this.boundingSphere!==null)this.computeBoundingSphere();return this._transformed=!0,this}applyQuaternion(t){return Ve.makeRotationFromQuaternion(t),this.applyMatrix4(Ve),this}rotateX(t){return Ve.makeRotationX(t),this.applyMatrix4(Ve),this}rotateY(t){return Ve.makeRotationY(t),this.applyMatrix4(Ve),this}rotateZ(t){return Ve.makeRotationZ(t),this.applyMatrix4(Ve),this}translate(t,e,n){return Ve.makeTranslation(t,e,n),this.applyMatrix4(Ve),this}scale(t,e,n){return Ve.makeScale(t,e,n),this.applyMatrix4(Ve),this}lookAt(t){return Qr.lookAt(t),Qr.updateMatrix(),this.applyMatrix4(Qr.matrix),this}center(){return this.computeBoundingBox(),this.boundingBox.getCenter(pi).negate(),this.translate(pi.x,pi.y,pi.z),this}setFromPoints(t){let e=this.getAttribute("position");if(e===void 0){let n=[];for(let i=0,s=t.length;i<s;i++){let r=t[i];n.push(r.x,r.y,r.z||0)}this.setAttribute("position",new jt(n,3))}else{let n=Math.min(t.length,e.count);for(let i=0;i<n;i++){let s=t[i];e.setXYZ(i,s.x,s.y,s.z||0)}if(t.length>e.count)zt("BufferGeometry: Buffer size too small for points data. Use .dispose() and create a new geometry.");e.needsUpdate=!0}return this}computeBoundingBox(){if(this.boundingBox===null)this.boundingBox=new Jn;let t=this.attributes.position,e=this.morphAttributes.position;if(t&&t.isGLBufferAttribute){Bt("BufferGeometry.computeBoundingBox(): GLBufferAttribute requires a manual bounding box.",this),this.boundingBox.set(new P(-1/0,-1/0,-1/0),new P(1/0,1/0,1/0));return}if(t!==void 0){if(this.boundingBox.setFromBufferAttribute(t),e)for(let n=0,i=e.length;n<i;n++){let s=e[n];if(Oe.setFromBufferAttribute(s),this.morphTargetsRelative)Ee.addVectors(this.boundingBox.min,Oe.min),this.boundingBox.expandByPoint(Ee),Ee.addVectors(this.boundingBox.max,Oe.max),this.boundingBox.expandByPoint(Ee);else this.boundingBox.expandByPoint(Oe.min),this.boundingBox.expandByPoint(Oe.max)}}else this.boundingBox.makeEmpty();if(isNaN(this.boundingBox.min.x)||isNaN(this.boundingBox.min.y)||isNaN(this.boundingBox.min.z))Bt('BufferGeometry.computeBoundingBox(): Computed min/max have NaN values. The "position" attribute is likely to have NaN values.',this)}computeBoundingSphere(){if(this.boundingSphere===null)this.boundingSphere=new rs;let t=this.attributes.position,e=this.morphAttributes.position;if(t&&t.isGLBufferAttribute){Bt("BufferGeometry.computeBoundingSphere(): GLBufferAttribute requires a manual bounding sphere.",this),this.boundingSphere.set(new P,1/0);return}if(t){let n=this.boundingSphere.center;if(Oe.setFromBufferAttribute(t),e)for(let s=0,r=e.length;s<r;s++){let a=e[s];if(Oi.setFromBufferAttribute(a),this.morphTargetsRelative)Ee.addVectors(Oe.min,Oi.min),Oe.expandByPoint(Ee),Ee.addVectors(Oe.max,Oi.max),Oe.expandByPoint(Ee);else Oe.expandByPoint(Oi.min),Oe.expandByPoint(Oi.max)}Oe.getCenter(n);let i=0;for(let s=0,r=t.count;s<r;s++)Ee.fromBufferAttribute(t,s),i=Math.max(i,n.distanceToSquared(Ee));if(e)for(let s=0,r=e.length;s<r;s++){let a=e[s],o=this.morphTargetsRelative;for(let l=0,c=a.count;l<c;l++){if(Ee.fromBufferAttribute(a,l),o)pi.fromBufferAttribute(t,l),Ee.add(pi);i=Math.max(i,n.distanceToSquared(Ee))}}if(this.boundingSphere.radius=Math.sqrt(i),isNaN(this.boundingSphere.radius))Bt('BufferGeometry.computeBoundingSphere(): Computed radius is NaN. The "position" attribute is likely to have NaN values.',this)}}computeTangents(){let t=this.index,e=this.attributes;if(t===null||e.position===void 0||e.normal===void 0||e.uv===void 0){Bt("BufferGeometry: .computeTangents() failed. Missing required attributes (index, position, normal or uv)");return}let{position:n,normal:i,uv:s}=e,r=this.getAttribute("tangent");if(r===void 0||r.count!==n.count)r=new Ue(new Float32Array(4*n.count),4),this.setAttribute("tangent",r);let a=[],o=[];for(let w=0;w<n.count;w++)a[w]=new P,o[w]=new P;let l=new P,c=new P,u=new P,f=new lt,h=new lt,m=new lt,v=new P,T=new P;function p(w,g,S){l.fromBufferAttribute(n,w),c.fromBufferAttribute(n,g),u.fromBufferAttribute(n,S),f.fromBufferAttribute(s,w),h.fromBufferAttribute(s,g),m.fromBufferAttribute(s,S),c.sub(l),u.sub(l),h.sub(f),m.sub(f);let O=1/(h.x*m.y-m.x*h.y);if(!isFinite(O))return;v.copy(c).multiplyScalar(m.y).addScaledVector(u,-h.y).multiplyScalar(O),T.copy(u).multiplyScalar(h.x).addScaledVector(c,-m.x).multiplyScalar(O),a[w].add(v),a[g].add(v),a[S].add(v),o[w].add(T),o[g].add(T),o[S].add(T)}let d=this.groups;if(d.length===0)d=[{start:0,count:t.count}];for(let w=0,g=d.length;w<g;++w){let S=d[w],{start:O,count:N}=S;for(let F=O,Z=O+N;F<Z;F+=3)p(t.getX(F+0),t.getX(F+1),t.getX(F+2))}let E=new P,A=new P,x=new P,b=new P;function C(w){x.fromBufferAttribute(i,w),b.copy(x);let g=a[w];E.copy(g),E.sub(x.multiplyScalar(x.dot(g))).normalize(),A.crossVectors(b,g);let O=A.dot(o[w])<0?-1:1;r.setXYZW(w,E.x,E.y,E.z,O)}for(let w=0,g=d.length;w<g;++w){let S=d[w],{start:O,count:N}=S;for(let F=O,Z=O+N;F<Z;F+=3)C(t.getX(F+0)),C(t.getX(F+1)),C(t.getX(F+2))}this._transformed=!0}computeVertexNormals(){let t=this.index,e=this.getAttribute("position");if(e!==void 0){let n=this.getAttribute("normal");if(n===void 0||n.count!==e.count)n=new Ue(new Float32Array(e.count*3),3),this.setAttribute("normal",n);else for(let f=0,h=n.count;f<h;f++)n.setXYZ(f,0,0,0);let i=new P,s=new P,r=new P,a=new P,o=new P,l=new P,c=new P,u=new P;if(t)for(let f=0,h=t.count;f<h;f+=3){let m=t.getX(f+0),v=t.getX(f+1),T=t.getX(f+2);i.fromBufferAttribute(e,m),s.fromBufferAttribute(e,v),r.fromBufferAttribute(e,T),c.subVectors(r,s),u.subVectors(i,s),c.cross(u),a.fromBufferAttribute(n,m),o.fromBufferAttribute(n,v),l.fromBufferAttribute(n,T),a.add(c),o.add(c),l.add(c),n.setXYZ(m,a.x,a.y,a.z),n.setXYZ(v,o.x,o.y,o.z),n.setXYZ(T,l.x,l.y,l.z)}else for(let f=0,h=e.count;f<h;f+=3)i.fromBufferAttribute(e,f+0),s.fromBufferAttribute(e,f+1),r.fromBufferAttribute(e,f+2),c.subVectors(r,s),u.subVectors(i,s),c.cross(u),n.setXYZ(f+0,c.x,c.y,c.z),n.setXYZ(f+1,c.x,c.y,c.z),n.setXYZ(f+2,c.x,c.y,c.z);this.normalizeNormals(),n.needsUpdate=!0}}normalizeNormals(){let t=this.attributes.normal;for(let e=0,n=t.count;e<n;e++)Ee.fromBufferAttribute(t,e),Ee.normalize(),t.setXYZ(e,Ee.x,Ee.y,Ee.z)}toNonIndexed(){function t(a,o){let{array:l,itemSize:c,normalized:u}=a,f=new l.constructor(o.length*c),h=0,m=0;for(let v=0,T=o.length;v<T;v++){if(a.isInterleavedBufferAttribute)h=o[v]*a.data.stride+a.offset;else h=o[v]*c;for(let p=0;p<c;p++)f[m++]=l[h++]}return new Ue(f,c,u)}if(this.index===null)return zt("BufferGeometry.toNonIndexed(): BufferGeometry is already non-indexed."),this;let e=new ve,n=this.index.array,i=this.attributes;for(let a in i){let o=i[a],l=t(o,n);e.setAttribute(a,l)}let s=this.morphAttributes;for(let a in s){let o=[],l=s[a];for(let c=0,u=l.length;c<u;c++){let f=l[c],h=t(f,n);o.push(h)}e.morphAttributes[a]=o}e.morphTargetsRelative=this.morphTargetsRelative;let r=this.groups;for(let a=0,o=r.length;a<o;a++){let l=r[a];e.addGroup(l.start,l.count,l.materialIndex)}return e}toJSON(){let t={metadata:{version:4.7,type:"BufferGeometry",generator:"BufferGeometry.toJSON"}};if(t.uuid=this.uuid,t.type=this.parameters!==void 0&&this._transformed===!0?"BufferGeometry":this.type,t.name=this.name,Object.keys(this.userData).length>0)t.userData=this.userData;if(this.parameters!==void 0&&this._transformed!==!0){let o=this.parameters;for(let l in o)if(o[l]!==void 0)t[l]=o[l];return t}t.data={attributes:{}};let e=this.index;if(e!==null)t.data.index={type:e.array.constructor.name,array:Array.prototype.slice.call(e.array)};let n=this.attributes;for(let o in n){let l=n[o];t.data.attributes[o]=l.toJSON(t.data)}let i={},s=!1;for(let o in this.morphAttributes){let l=this.morphAttributes[o],c=[];for(let u=0,f=l.length;u<f;u++){let h=l[u];c.push(h.toJSON(t.data))}if(c.length>0)i[o]=c,s=!0}if(s)t.data.morphAttributes=i,t.data.morphTargetsRelative=this.morphTargetsRelative;let r=this.groups;if(r.length>0)t.data.groups=JSON.parse(JSON.stringify(r));let a=this.boundingSphere;if(a!==null)t.data.boundingSphere=a.toJSON();return t}clone(){return new this.constructor().copy(this)}copy(t){this.index=null,this.attributes={},this.morphAttributes={},this.groups=[],this.boundingBox=null,this.boundingSphere=null;let e={};this.name=t.name;let n=t.index;if(n!==null)this.setIndex(n.clone());let i=t.attributes;for(let l in i){let c=i[l];this.setAttribute(l,c.clone(e))}let s=t.morphAttributes;for(let l in s){let c=[],u=s[l];for(let f=0,h=u.length;f<h;f++)c.push(u[f].clone(e));this.morphAttributes[l]=c}this.morphTargetsRelative=t.morphTargetsRelative;let r=t.groups;for(let l=0,c=r.length;l<c;l++){let u=r[l];this.addGroup(u.start,u.count,u.materialIndex)}let a=t.boundingBox;if(a!==null)this.boundingBox=a.clone();let o=t.boundingSphere;if(o!==null)this.boundingSphere=o.clone();return this.drawRange.start=t.drawRange.start,this.drawRange.count=t.drawRange.count,this.userData=t.userData,this._transformed=t._transformed,this}dispose(){this.dispatchEvent({type:"dispose"})}}class xo{constructor(t,e){this.isInterleavedBuffer=!0,this.array=t,this.stride=e,this.count=t!==void 0?t.length/e:0,this.usage=35044,this.updateRanges=[],this.version=0,this.uuid=xn()}onUploadCallback(){}set needsUpdate(t){if(t===!0)this.version++}setUsage(t){return this.usage=t,this}addUpdateRange(t,e){this.updateRanges.push({start:t,count:e})}clearUpdateRanges(){this.updateRanges.length=0}copy(t){return this.array=new t.array.constructor(t.array),this.count=t.count,this.stride=t.stride,this.usage=t.usage,this}copyAt(t,e,n){t*=this.stride,n*=e.stride;for(let i=0,s=this.stride;i<s;i++)this.array[t+i]=e.array[n+i];return this}set(t,e=0){return this.array.set(t,e),this}clone(t){if(t.arrayBuffers===void 0)t.arrayBuffers={};if(this.array.buffer._uuid===void 0)this.array.buffer._uuid=xn();if(t.arrayBuffers[this.array.buffer._uuid]===void 0)t.arrayBuffers[this.array.buffer._uuid]=this.array.slice(0).buffer;let e=new this.array.constructor(t.arrayBuffers[this.array.buffer._uuid]),n=new this.constructor(e,this.stride);return n.setUsage(this.usage),n}onUpload(t){return this.onUploadCallback=t,this}toJSON(t){if(t.arrayBuffers===void 0)t.arrayBuffers={};if(this.array.buffer._uuid===void 0)this.array.buffer._uuid=xn();if(t.arrayBuffers[this.array.buffer._uuid]===void 0)t.arrayBuffers[this.array.buffer._uuid]=Array.from(new Uint32Array(this.array.buffer));let e={uuid:this.uuid,buffer:this.array.buffer._uuid,type:this.array.constructor.name,stride:this.stride};return e.usage=this.usage,e}}var Le=new P;class qi{constructor(t,e,n,i=!1){this.isInterleavedBufferAttribute=!0,this.name="",this.data=t,this.itemSize=e,this.offset=n,this.normalized=i}get count(){return this.data.count}get array(){return this.data.array}set needsUpdate(t){this.data.needsUpdate=t}applyMatrix4(t){for(let e=0,n=this.data.count;e<n;e++)Le.fromBufferAttribute(this,e),Le.applyMatrix4(t),this.setXYZ(e,Le.x,Le.y,Le.z);return this}applyNormalMatrix(t){for(let e=0,n=this.count;e<n;e++)Le.fromBufferAttribute(this,e),Le.applyNormalMatrix(t),this.setXYZ(e,Le.x,Le.y,Le.z);return this}transformDirection(t){for(let e=0,n=this.count;e<n;e++)Le.fromBufferAttribute(this,e),Le.transformDirection(t),this.setXYZ(e,Le.x,Le.y,Le.z);return this}getComponent(t,e){let n=this.array[t*this.data.stride+this.offset+e];if(this.normalized)n=an(n,this.array);return n}setComponent(t,e,n){if(this.normalized)n=ce(n,this.array);return this.data.array[t*this.data.stride+this.offset+e]=n,this}setX(t,e){if(this.normalized)e=ce(e,this.array);return this.data.array[t*this.data.stride+this.offset]=e,this}setY(t,e){if(this.normalized)e=ce(e,this.array);return this.data.array[t*this.data.stride+this.offset+1]=e,this}setZ(t,e){if(this.normalized)e=ce(e,this.array);return this.data.array[t*this.data.stride+this.offset+2]=e,this}setW(t,e){if(this.normalized)e=ce(e,this.array);return this.data.array[t*this.data.stride+this.offset+3]=e,this}getX(t){let e=this.data.array[t*this.data.stride+this.offset];if(this.normalized)e=an(e,this.array);return e}getY(t){let e=this.data.array[t*this.data.stride+this.offset+1];if(this.normalized)e=an(e,this.array);return e}getZ(t){let e=this.data.array[t*this.data.stride+this.offset+2];if(this.normalized)e=an(e,this.array);return e}getW(t){let e=this.data.array[t*this.data.stride+this.offset+3];if(this.normalized)e=an(e,this.array);return e}setXY(t,e,n){if(t=t*this.data.stride+this.offset,this.normalized)e=ce(e,this.array),n=ce(n,this.array);return this.data.array[t+0]=e,this.data.array[t+1]=n,this}setXYZ(t,e,n,i){if(t=t*this.data.stride+this.offset,this.normalized)e=ce(e,this.array),n=ce(n,this.array),i=ce(i,this.array);return this.data.array[t+0]=e,this.data.array[t+1]=n,this.data.array[t+2]=i,this}setXYZW(t,e,n,i,s){if(t=t*this.data.stride+this.offset,this.normalized)e=ce(e,this.array),n=ce(n,this.array),i=ce(i,this.array),s=ce(s,this.array);return this.data.array[t+0]=e,this.data.array[t+1]=n,this.data.array[t+2]=i,this.data.array[t+3]=s,this}clone(t){if(t===void 0){Xi("InterleavedBufferAttribute.clone(): Cloning an interleaved buffer attribute will de-interleave buffer data.");let e=[];for(let n=0;n<this.count;n++){let i=n*this.data.stride+this.offset;for(let s=0;s<this.itemSize;s++)e.push(this.data.array[i+s])}return new Ue(new this.array.constructor(e),this.itemSize,this.normalized)}else{if(t.interleavedBuffers===void 0)t.interleavedBuffers={};if(t.interleavedBuffers[this.data.uuid]===void 0)t.interleavedBuffers[this.data.uuid]=this.data.clone(t);return new qi(t.interleavedBuffers[this.data.uuid],this.itemSize,this.offset,this.normalized)}}toJSON(t){if(t===void 0){Xi("InterleavedBufferAttribute.toJSON(): Serializing an interleaved buffer attribute will de-interleave buffer data.");let e=[];for(let n=0;n<this.count;n++){let i=n*this.data.stride+this.offset;for(let s=0;s<this.itemSize;s++)e.push(this.data.array[i+s])}return{itemSize:this.itemSize,type:this.array.constructor.name,array:e,normalized:this.normalized}}else{if(t.interleavedBuffers===void 0)t.interleavedBuffers={};if(t.interleavedBuffers[this.data.uuid]===void 0)t.interleavedBuffers[this.data.uuid]=this.data.toJSON(t);return{isInterleavedBufferAttribute:!0,itemSize:this.itemSize,data:this.data.uuid,offset:this.offset,normalized:this.normalized}}}}var jr=new P,ou=new P,lu=new Gt;class rn{constructor(t=new P(1,0,0),e=0){this.isPlane=!0,this.normal=t,this.constant=e}set(t,e){return this.normal.copy(t),this.constant=e,this}setComponents(t,e,n,i){return this.normal.set(t,e,n),this.constant=i,this}setFromNormalAndCoplanarPoint(t,e){return this.normal.copy(t),this.constant=-e.dot(this.normal),this}setFromCoplanarPoints(t,e,n){let i=jr.subVectors(n,e).cross(ou.subVectors(t,e)).normalize();return this.setFromNormalAndCoplanarPoint(i,t),this}copy(t){return this.normal.copy(t.normal),this.constant=t.constant,this}normalize(){let t=1/this.normal.length();return this.normal.multiplyScalar(t),this.constant*=t,this}negate(){return this.constant*=-1,this.normal.negate(),this}distanceToPoint(t){return this.normal.dot(t)+this.constant}distanceToSphere(t){return this.distanceToPoint(t.center)-t.radius}projectPoint(t,e){return e.copy(t).addScaledVector(this.normal,-this.distanceToPoint(t))}intersectLine(t,e,n=!0){let i=t.delta(jr),s=this.normal.dot(i);if(s===0){if(this.distanceToPoint(t.start)===0)return e.copy(t.start);return null}let r=-(t.start.dot(this.normal)+this.constant)/s;if(n===!0&&(r<0||r>1))return null;return e.copy(t.start).addScaledVector(i,r)}intersectsLine(t){let e=this.distanceToPoint(t.start),n=this.distanceToPoint(t.end);return e<0&&n>0||n<0&&e>0}intersectsBox(t){return t.intersectsPlane(this)}intersectsSphere(t){return t.intersectsPlane(this)}coplanarPoint(t){return t.copy(this.normal).multiplyScalar(-this.constant)}applyMatrix4(t,e){let n=e||lu.getNormalMatrix(t),i=this.coplanarPoint(jr).applyMatrix4(t),s=this.normal.applyMatrix3(n).normalize();return this.constant=-i.dot(s),this}translate(t){return this.constant-=t.dot(this.normal),this}equals(t){return t.normal.equals(this.normal)&&t.constant===this.constant}clone(){return new this.constructor().copy(this)}toJSON(){return{normal:this.normal.toArray(),constant:this.constant}}fromJSON(t){return this.normal.fromArray(t.normal),this.constant=t.constant,this}}var cu=0;class Ln extends Sn{constructor(){super();this.isMaterial=!0,Object.defineProperty(this,"id",{value:cu++}),this.uuid=xn(),this.name="",this.type="Material",this.blending=1,this.side=0,this.vertexColors=!1,this.opacity=1,this.transparent=!1,this.alphaHash=!1,this.blendSrc=204,this.blendDst=205,this.blendEquation=100,this.blendSrcAlpha=null,this.blendDstAlpha=null,this.blendEquationAlpha=null,this.blendColor=new Zt(0,0,0),this.blendAlpha=0,this.depthFunc=3,this.depthTest=!0,this.depthWrite=!0,this.stencilWriteMask=255,this.stencilFunc=519,this.stencilRef=0,this.stencilFuncMask=255,this.stencilFail=7680,this.stencilZFail=7680,this.stencilZPass=7680,this.stencilWrite=!1,this.clippingPlanes=null,this.clipIntersection=!1,this.clipShadows=!1,this.shadowSide=null,this.colorWrite=!0,this.precision=null,this.polygonOffset=!1,this.polygonOffsetFactor=0,this.polygonOffsetUnits=0,this.dithering=!1,this.alphaToCoverage=!1,this.premultipliedAlpha=!1,this.forceSinglePass=!1,this.allowOverride=!0,this.visible=!0,this.toneMapped=!0,this.userData={},this.version=0,this._alphaTest=0}get alphaTest(){return this._alphaTest}set alphaTest(t){if(this._alphaTest>0!==t>0)this.version++;this._alphaTest=t}onBeforeRender(){}onBeforeCompile(){}customProgramCacheKey(){return this.onBeforeCompile.toString()}setValues(t){if(t===void 0)return;for(let e in t){let n=t[e];if(n===void 0){zt(`Material: parameter '${e}' has value of undefined.`);continue}let i=this[e];if(i===void 0){zt(`Material: '${e}' is not a property of THREE.${this.type}.`);continue}if(i&&i.isColor)i.set(n);else if(i&&i.isVector2&&(n&&n.isVector2)||i&&i.isEuler&&(n&&n.isEuler)||i&&i.isVector3&&(n&&n.isVector3))i.copy(n);else this[e]=n}}toJSON(t){let e=t===void 0||typeof t==="string";if(e)t={textures:{},images:{}};let n={metadata:{version:4.7,type:"Material",generator:"Material.toJSON"}};if(n.uuid=this.uuid,n.type=this.type,n.blending=this.blending,n.side=this.side,n.shadowSide=this.shadowSide,n.vertexColors=this.vertexColors,n.opacity=this.opacity,n.transparent=this.transparent,n.blendSrc=this.blendSrc,n.blendDst=this.blendDst,n.blendEquation=this.blendEquation,n.blendSrcAlpha=this.blendSrcAlpha,n.blendDstAlpha=this.blendDstAlpha,n.blendEquationAlpha=this.blendEquationAlpha,n.blendColor=this.blendColor.getHex(),n.blendAlpha=this.blendAlpha,n.depthFunc=this.depthFunc,n.depthTest=this.depthTest,n.depthWrite=this.depthWrite,n.colorWrite=this.colorWrite,n.clipIntersection=this.clipIntersection,n.clipShadows=this.clipShadows,n.stencilWriteMask=this.stencilWriteMask,n.stencilFunc=this.stencilFunc,n.stencilRef=this.stencilRef,n.stencilFuncMask=this.stencilFuncMask,n.stencilFail=this.stencilFail,n.stencilZFail=this.stencilZFail,n.stencilZPass=this.stencilZPass,n.stencilWrite=this.stencilWrite,n.polygonOffset=this.polygonOffset,n.polygonOffsetFactor=this.polygonOffsetFactor,n.polygonOffsetUnits=this.polygonOffsetUnits,n.dithering=this.dithering,n.alphaTest=this.alphaTest,n.alphaHash=this.alphaHash,n.alphaToCoverage=this.alphaToCoverage,n.premultipliedAlpha=this.premultipliedAlpha,n.forceSinglePass=this.forceSinglePass,n.allowOverride=this.allowOverride,n.visible=this.visible,n.toneMapped=this.toneMapped,n.name=this.name,this.color&&this.color.isColor)n.color=this.color.getHex();if(this.roughness!==void 0)n.roughness=this.roughness;if(this.metalness!==void 0)n.metalness=this.metalness;if(this.sheen!==void 0)n.sheen=this.sheen;if(this.sheenColor&&this.sheenColor.isColor)n.sheenColor=this.sheenColor.getHex();if(this.sheenRoughness!==void 0)n.sheenRoughness=this.sheenRoughness;if(this.emissive&&this.emissive.isColor)n.emissive=this.emissive.getHex();if(this.emissiveIntensity!==void 0)n.emissiveIntensity=this.emissiveIntensity;if(this.specular&&this.specular.isColor)n.specular=this.specular.getHex();if(this.specularIntensity!==void 0)n.specularIntensity=this.specularIntensity;if(this.specularColor&&this.specularColor.isColor)n.specularColor=this.specularColor.getHex();if(this.shininess!==void 0)n.shininess=this.shininess;if(this.clearcoat!==void 0)n.clearcoat=this.clearcoat;if(this.clearcoatRoughness!==void 0)n.clearcoatRoughness=this.clearcoatRoughness;if(this.clearcoatMap&&this.clearcoatMap.isTexture)n.clearcoatMap=this.clearcoatMap.toJSON(t).uuid;if(this.clearcoatRoughnessMap&&this.clearcoatRoughnessMap.isTexture)n.clearcoatRoughnessMap=this.clearcoatRoughnessMap.toJSON(t).uuid;if(this.clearcoatNormalMap&&this.clearcoatNormalMap.isTexture)n.clearcoatNormalMap=this.clearcoatNormalMap.toJSON(t).uuid,n.clearcoatNormalScale=this.clearcoatNormalScale.toArray();if(this.sheenColorMap&&this.sheenColorMap.isTexture)n.sheenColorMap=this.sheenColorMap.toJSON(t).uuid;if(this.sheenRoughnessMap&&this.sheenRoughnessMap.isTexture)n.sheenRoughnessMap=this.sheenRoughnessMap.toJSON(t).uuid;if(this.dispersion!==void 0)n.dispersion=this.dispersion;if(this.retroreflectivity!==void 0)n.retroreflectivity=this.retroreflectivity;if(this.iridescence!==void 0)n.iridescence=this.iridescence;if(this.iridescenceIOR!==void 0)n.iridescenceIOR=this.iridescenceIOR;if(this.iridescenceThicknessRange!==void 0)n.iridescenceThicknessRange=this.iridescenceThicknessRange;if(this.iridescenceMap&&this.iridescenceMap.isTexture)n.iridescenceMap=this.iridescenceMap.toJSON(t).uuid;if(this.iridescenceThicknessMap&&this.iridescenceThicknessMap.isTexture)n.iridescenceThicknessMap=this.iridescenceThicknessMap.toJSON(t).uuid;if(this.anisotropy!==void 0)n.anisotropy=this.anisotropy;if(this.anisotropyRotation!==void 0)n.anisotropyRotation=this.anisotropyRotation;if(this.anisotropyMap&&this.anisotropyMap.isTexture)n.anisotropyMap=this.anisotropyMap.toJSON(t).uuid;if(this.map&&this.map.isTexture)n.map=this.map.toJSON(t).uuid;if(this.matcap&&this.matcap.isTexture)n.matcap=this.matcap.toJSON(t).uuid;if(this.alphaMap&&this.alphaMap.isTexture)n.alphaMap=this.alphaMap.toJSON(t).uuid;if(this.lightMap&&this.lightMap.isTexture)n.lightMap=this.lightMap.toJSON(t).uuid,n.lightMapIntensity=this.lightMapIntensity;if(this.aoMap&&this.aoMap.isTexture)n.aoMap=this.aoMap.toJSON(t).uuid,n.aoMapIntensity=this.aoMapIntensity;if(this.bumpMap&&this.bumpMap.isTexture)n.bumpMap=this.bumpMap.toJSON(t).uuid,n.bumpScale=this.bumpScale;if(this.normalMap&&this.normalMap.isTexture)n.normalMap=this.normalMap.toJSON(t).uuid,n.normalMapType=this.normalMapType,n.normalScale=this.normalScale.toArray();if(this.displacementMap&&this.displacementMap.isTexture)n.displacementMap=this.displacementMap.toJSON(t).uuid,n.displacementScale=this.displacementScale,n.displacementBias=this.displacementBias;if(this.roughnessMap&&this.roughnessMap.isTexture)n.roughnessMap=this.roughnessMap.toJSON(t).uuid;if(this.metalnessMap&&this.metalnessMap.isTexture)n.metalnessMap=this.metalnessMap.toJSON(t).uuid;if(this.emissiveMap&&this.emissiveMap.isTexture)n.emissiveMap=this.emissiveMap.toJSON(t).uuid;if(this.specularMap&&this.specularMap.isTexture)n.specularMap=this.specularMap.toJSON(t).uuid;if(this.specularIntensityMap&&this.specularIntensityMap.isTexture)n.specularIntensityMap=this.specularIntensityMap.toJSON(t).uuid;if(this.specularColorMap&&this.specularColorMap.isTexture)n.specularColorMap=this.specularColorMap.toJSON(t).uuid;if(this.envMap&&this.envMap.isTexture){if(n.envMap=this.envMap.toJSON(t).uuid,this.combine!==void 0)n.combine=this.combine}if(this.envMapRotation!==void 0)n.envMapRotation=this.envMapRotation.toArray();if(this.envMapIntensity!==void 0)n.envMapIntensity=this.envMapIntensity;if(this.reflectivity!==void 0)n.reflectivity=this.reflectivity;if(this.refractionRatio!==void 0)n.refractionRatio=this.refractionRatio;if(this.gradientMap&&this.gradientMap.isTexture)n.gradientMap=this.gradientMap.toJSON(t).uuid;if(this.transmission!==void 0)n.transmission=this.transmission;if(this.transmissionMap&&this.transmissionMap.isTexture)n.transmissionMap=this.transmissionMap.toJSON(t).uuid;if(this.thickness!==void 0)n.thickness=this.thickness;if(this.thicknessMap&&this.thicknessMap.isTexture)n.thicknessMap=this.thicknessMap.toJSON(t).uuid;if(this.attenuationDistance!==void 0)n.attenuationDistance=this.attenuationDistance;if(this.attenuationColor!==void 0)n.attenuationColor=this.attenuationColor.getHex();if(this.size!==void 0)n.size=this.size;if(this.sizeAttenuation!==void 0)n.sizeAttenuation=this.sizeAttenuation;if(Array.isArray(this.clippingPlanes)&&this.clippingPlanes.length>0)n.clippingPlanes=this.clippingPlanes.map((s)=>s.toJSON());if(this.rotation!==void 0)n.rotation=this.rotation;if(this.depthPacking!==void 0)n.depthPacking=this.depthPacking;if(this.linewidth!==void 0)n.linewidth=this.linewidth;if(this.linecap!==void 0)n.linecap=this.linecap;if(this.linejoin!==void 0)n.linejoin=this.linejoin;if(this.dashSize!==void 0)n.dashSize=this.dashSize;if(this.gapSize!==void 0)n.gapSize=this.gapSize;if(this.scale!==void 0)n.scale=this.scale;if(this.wireframe!==void 0)n.wireframe=this.wireframe;if(this.wireframeLinewidth!==void 0)n.wireframeLinewidth=this.wireframeLinewidth;if(this.wireframeLinecap!==void 0)n.wireframeLinecap=this.wireframeLinecap;if(this.wireframeLinejoin!==void 0)n.wireframeLinejoin=this.wireframeLinejoin;if(this.flatShading!==void 0)n.flatShading=this.flatShading;if(this.fog!==void 0)n.fog=this.fog;if(Object.keys(this.userData).length>0)n.userData=this.userData;function i(s){let r=[];for(let a in s){let o=s[a];delete o.metadata,r.push(o)}return r}if(e){let s=i(t.textures),r=i(t.images);if(s.length>0)n.textures=s;if(r.length>0)n.images=r}return n}fromJSON(t,e){if(t.uuid!==void 0)this.uuid=t.uuid;if(t.name!==void 0)this.name=t.name;if(t.color!==void 0&&this.color!==void 0)this.color.setHex(t.color);if(t.roughness!==void 0)this.roughness=t.roughness;if(t.metalness!==void 0)this.metalness=t.metalness;if(t.sheen!==void 0)this.sheen=t.sheen;if(t.sheenColor!==void 0)this.sheenColor=new Zt().setHex(t.sheenColor);if(t.sheenRoughness!==void 0)this.sheenRoughness=t.sheenRoughness;if(t.emissive!==void 0&&this.emissive!==void 0)this.emissive.setHex(t.emissive);if(t.specular!==void 0&&this.specular!==void 0)this.specular.setHex(t.specular);if(t.specularIntensity!==void 0)this.specularIntensity=t.specularIntensity;if(t.specularColor!==void 0&&this.specularColor!==void 0)this.specularColor.setHex(t.specularColor);if(t.shininess!==void 0)this.shininess=t.shininess;if(t.clearcoat!==void 0)this.clearcoat=t.clearcoat;if(t.clearcoatRoughness!==void 0)this.clearcoatRoughness=t.clearcoatRoughness;if(t.dispersion!==void 0)this.dispersion=t.dispersion;if(t.retroreflectivity!==void 0)this.retroreflectivity=t.retroreflectivity;if(t.iridescence!==void 0)this.iridescence=t.iridescence;if(t.iridescenceIOR!==void 0)this.iridescenceIOR=t.iridescenceIOR;if(t.iridescenceThicknessRange!==void 0)this.iridescenceThicknessRange=t.iridescenceThicknessRange;if(t.transmission!==void 0)this.transmission=t.transmission;if(t.thickness!==void 0)this.thickness=t.thickness;if(t.attenuationDistance!==void 0)this.attenuationDistance=t.attenuationDistance;if(t.attenuationColor!==void 0&&this.attenuationColor!==void 0)this.attenuationColor.setHex(t.attenuationColor);if(t.anisotropy!==void 0)this.anisotropy=t.anisotropy;if(t.anisotropyRotation!==void 0)this.anisotropyRotation=t.anisotropyRotation;if(t.fog!==void 0)this.fog=t.fog;if(t.flatShading!==void 0)this.flatShading=t.flatShading;if(t.blending!==void 0)this.blending=t.blending;if(t.combine!==void 0)this.combine=t.combine;if(t.side!==void 0)this.side=t.side;if(t.shadowSide!==void 0)this.shadowSide=t.shadowSide;if(t.opacity!==void 0)this.opacity=t.opacity;if(t.transparent!==void 0)this.transparent=t.transparent;if(t.alphaTest!==void 0)this.alphaTest=t.alphaTest;if(t.alphaHash!==void 0)this.alphaHash=t.alphaHash;if(t.depthFunc!==void 0)this.depthFunc=t.depthFunc;if(t.depthTest!==void 0)this.depthTest=t.depthTest;if(t.depthWrite!==void 0)this.depthWrite=t.depthWrite;if(t.colorWrite!==void 0)this.colorWrite=t.colorWrite;if(t.clippingPlanes!==void 0)this.clippingPlanes=t.clippingPlanes.map((n)=>new rn().fromJSON(n));if(t.clipIntersection!==void 0)this.clipIntersection=t.clipIntersection;if(t.clipShadows!==void 0)this.clipShadows=t.clipShadows;if(t.depthPacking!==void 0)this.depthPacking=t.depthPacking;if(t.blendSrc!==void 0)this.blendSrc=t.blendSrc;if(t.blendDst!==void 0)this.blendDst=t.blendDst;if(t.blendEquation!==void 0)this.blendEquation=t.blendEquation;if(t.blendSrcAlpha!==void 0)this.blendSrcAlpha=t.blendSrcAlpha;if(t.blendDstAlpha!==void 0)this.blendDstAlpha=t.blendDstAlpha;if(t.blendEquationAlpha!==void 0)this.blendEquationAlpha=t.blendEquationAlpha;if(t.blendColor!==void 0&&this.blendColor!==void 0)this.blendColor.setHex(t.blendColor);if(t.blendAlpha!==void 0)this.blendAlpha=t.blendAlpha;if(t.stencilWriteMask!==void 0)this.stencilWriteMask=t.stencilWriteMask;if(t.stencilFunc!==void 0)this.stencilFunc=t.stencilFunc;if(t.stencilRef!==void 0)this.stencilRef=t.stencilRef;if(t.stencilFuncMask!==void 0)this.stencilFuncMask=t.stencilFuncMask;if(t.stencilFail!==void 0)this.stencilFail=t.stencilFail;if(t.stencilZFail!==void 0)this.stencilZFail=t.stencilZFail;if(t.stencilZPass!==void 0)this.stencilZPass=t.stencilZPass;if(t.stencilWrite!==void 0)this.stencilWrite=t.stencilWrite;if(t.wireframe!==void 0)this.wireframe=t.wireframe;if(t.wireframeLinewidth!==void 0)this.wireframeLinewidth=t.wireframeLinewidth;if(t.wireframeLinecap!==void 0)this.wireframeLinecap=t.wireframeLinecap;if(t.wireframeLinejoin!==void 0)this.wireframeLinejoin=t.wireframeLinejoin;if(t.rotation!==void 0)this.rotation=t.rotation;if(t.linewidth!==void 0)this.linewidth=t.linewidth;if(t.linecap!==void 0)this.linecap=t.linecap;if(t.linejoin!==void 0)this.linejoin=t.linejoin;if(t.dashSize!==void 0)this.dashSize=t.dashSize;if(t.gapSize!==void 0)this.gapSize=t.gapSize;if(t.scale!==void 0)this.scale=t.scale;if(t.polygonOffset!==void 0)this.polygonOffset=t.polygonOffset;if(t.polygonOffsetFactor!==void 0)this.polygonOffsetFactor=t.polygonOffsetFactor;if(t.polygonOffsetUnits!==void 0)this.polygonOffsetUnits=t.polygonOffsetUnits;if(t.dithering!==void 0)this.dithering=t.dithering;if(t.alphaToCoverage!==void 0)this.alphaToCoverage=t.alphaToCoverage;if(t.premultipliedAlpha!==void 0)this.premultipliedAlpha=t.premultipliedAlpha;if(t.forceSinglePass!==void 0)this.forceSinglePass=t.forceSinglePass;if(t.allowOverride!==void 0)this.allowOverride=t.allowOverride;if(t.visible!==void 0)this.visible=t.visible;if(t.toneMapped!==void 0)this.toneMapped=t.toneMapped;if(t.userData!==void 0)this.userData=t.userData;if(t.vertexColors!==void 0)if(typeof t.vertexColors==="number")this.vertexColors=t.vertexColors>0;else this.vertexColors=t.vertexColors;if(t.size!==void 0)this.size=t.size;if(t.sizeAttenuation!==void 0)this.sizeAttenuation=t.sizeAttenuation;if(t.map!==void 0)this.map=e[t.map]||null;if(t.matcap!==void 0)this.matcap=e[t.matcap]||null;if(t.alphaMap!==void 0)this.alphaMap=e[t.alphaMap]||null;if(t.bumpMap!==void 0)this.bumpMap=e[t.bumpMap]||null;if(t.bumpScale!==void 0)this.bumpScale=t.bumpScale;if(t.normalMap!==void 0)this.normalMap=e[t.normalMap]||null;if(t.normalMapType!==void 0)this.normalMapType=t.normalMapType;if(t.normalScale!==void 0){let n=t.normalScale;if(Array.isArray(n)===!1)n=[n,n];this.normalScale=new lt().fromArray(n)}if(t.displacementMap!==void 0)this.displacementMap=e[t.displacementMap]||null;if(t.displacementScale!==void 0)this.displacementScale=t.displacementScale;if(t.displacementBias!==void 0)this.displacementBias=t.displacementBias;if(t.roughnessMap!==void 0)this.roughnessMap=e[t.roughnessMap]||null;if(t.metalnessMap!==void 0)this.metalnessMap=e[t.metalnessMap]||null;if(t.emissiveMap!==void 0)this.emissiveMap=e[t.emissiveMap]||null;if(t.emissiveIntensity!==void 0)this.emissiveIntensity=t.emissiveIntensity;if(t.specularMap!==void 0)this.specularMap=e[t.specularMap]||null;if(t.specularIntensityMap!==void 0)this.specularIntensityMap=e[t.specularIntensityMap]||null;if(t.specularColorMap!==void 0)this.specularColorMap=e[t.specularColorMap]||null;if(t.envMap!==void 0)this.envMap=e[t.envMap]||null;if(t.envMapRotation!==void 0)this.envMapRotation.fromArray(t.envMapRotation);if(t.envMapIntensity!==void 0)this.envMapIntensity=t.envMapIntensity;if(t.reflectivity!==void 0)this.reflectivity=t.reflectivity;if(t.refractionRatio!==void 0)this.refractionRatio=t.refractionRatio;if(t.lightMap!==void 0)this.lightMap=e[t.lightMap]||null;if(t.lightMapIntensity!==void 0)this.lightMapIntensity=t.lightMapIntensity;if(t.aoMap!==void 0)this.aoMap=e[t.aoMap]||null;if(t.aoMapIntensity!==void 0)this.aoMapIntensity=t.aoMapIntensity;if(t.gradientMap!==void 0)this.gradientMap=e[t.gradientMap]||null;if(t.clearcoatMap!==void 0)this.clearcoatMap=e[t.clearcoatMap]||null;if(t.clearcoatRoughnessMap!==void 0)this.clearcoatRoughnessMap=e[t.clearcoatRoughnessMap]||null;if(t.clearcoatNormalMap!==void 0)this.clearcoatNormalMap=e[t.clearcoatNormalMap]||null;if(t.clearcoatNormalScale!==void 0)this.clearcoatNormalScale=new lt().fromArray(t.clearcoatNormalScale);if(t.iridescenceMap!==void 0)this.iridescenceMap=e[t.iridescenceMap]||null;if(t.iridescenceThicknessMap!==void 0)this.iridescenceThicknessMap=e[t.iridescenceThicknessMap]||null;if(t.transmissionMap!==void 0)this.transmissionMap=e[t.transmissionMap]||null;if(t.thicknessMap!==void 0)this.thicknessMap=e[t.thicknessMap]||null;if(t.anisotropyMap!==void 0)this.anisotropyMap=e[t.anisotropyMap]||null;if(t.sheenColorMap!==void 0)this.sheenColorMap=e[t.sheenColorMap]||null;if(t.sheenRoughnessMap!==void 0)this.sheenRoughnessMap=e[t.sheenRoughnessMap]||null;return this}clone(){return new this.constructor().copy(this)}copy(t){this.name=t.name,this.blending=t.blending,this.side=t.side,this.vertexColors=t.vertexColors,this.opacity=t.opacity,this.transparent=t.transparent,this.blendSrc=t.blendSrc,this.blendDst=t.blendDst,this.blendEquation=t.blendEquation,this.blendSrcAlpha=t.blendSrcAlpha,this.blendDstAlpha=t.blendDstAlpha,this.blendEquationAlpha=t.blendEquationAlpha,this.blendColor.copy(t.blendColor),this.blendAlpha=t.blendAlpha,this.depthFunc=t.depthFunc,this.depthTest=t.depthTest,this.depthWrite=t.depthWrite,this.stencilWriteMask=t.stencilWriteMask,this.stencilFunc=t.stencilFunc,this.stencilRef=t.stencilRef,this.stencilFuncMask=t.stencilFuncMask,this.stencilFail=t.stencilFail,this.stencilZFail=t.stencilZFail,this.stencilZPass=t.stencilZPass,this.stencilWrite=t.stencilWrite;let e=t.clippingPlanes,n=null;if(e!==null){let i=e.length;n=Array(i);for(let s=0;s!==i;++s)n[s]=e[s].clone()}return this.clippingPlanes=n,this.clipIntersection=t.clipIntersection,this.clipShadows=t.clipShadows,this.shadowSide=t.shadowSide,this.colorWrite=t.colorWrite,this.precision=t.precision,this.polygonOffset=t.polygonOffset,this.polygonOffsetFactor=t.polygonOffsetFactor,this.polygonOffsetUnits=t.polygonOffsetUnits,this.dithering=t.dithering,this.alphaTest=t.alphaTest,this.alphaHash=t.alphaHash,this.alphaToCoverage=t.alphaToCoverage,this.premultipliedAlpha=t.premultipliedAlpha,this.forceSinglePass=t.forceSinglePass,this.allowOverride=t.allowOverride,this.visible=t.visible,this.toneMapped=t.toneMapped,this.userData=JSON.parse(JSON.stringify(t.userData)),this}dispose(){this.dispatchEvent({type:"dispose"})}set needsUpdate(t){if(t===!0)this.version++}}class ar extends Ln{constructor(t){super();this.isSpriteMaterial=!0,this.type="SpriteMaterial",this.color=new Zt(16777215),this.map=null,this.alphaMap=null,this.rotation=0,this.sizeAttenuation=!0,this.transparent=!0,this.fog=!0,this.setValues(t)}copy(t){return super.copy(t),this.color.copy(t.color),this.map=t.map,this.alphaMap=t.alphaMap,this.rotation=t.rotation,this.sizeAttenuation=t.sizeAttenuation,this.fog=t.fog,this}}var mi,Bi=new P,gi=new P,_i=new P,xi=new lt,zi=new lt,qc=new ue,Ts=new P,Gi=new P,Es=new P,Pl=new lt,ta=new lt,Ll=new lt;class vo extends Me{constructor(t=new ar){super();if(this.isSprite=!0,this.type="Sprite",mi===void 0){mi=new ve;let e=new Float32Array([-0.5,-0.5,0,0,0,0.5,-0.5,0,1,0,0.5,0.5,0,1,1,-0.5,0.5,0,0,1]),n=new xo(e,5);mi.setIndex([0,1,2,0,2,3]),mi.setAttribute("position",new qi(n,3,0,!1)),mi.setAttribute("uv",new qi(n,2,3,!1))}this.geometry=mi,this.material=t,this.center=new lt(0.5,0.5),this.count=1}intersectsFrustum(t){return t.intersectsSprite(this)}raycast(t,e){if(t.camera===null)Bt('Sprite: "Raycaster.camera" needs to be set in order to raycast against sprites.');if(gi.setFromMatrixScale(this.matrixWorld),qc.copy(t.camera.matrixWorld),this.modelViewMatrix.multiplyMatrices(t.camera.matrixWorldInverse,this.matrixWorld),_i.setFromMatrixPosition(this.modelViewMatrix),t.camera.isPerspectiveCamera&&this.material.sizeAttenuation===!1)gi.multiplyScalar(-_i.z);let n=this.material.rotation,i,s;if(n!==0)s=Math.cos(n),i=Math.sin(n);let r=this.center;As(Ts.set(-0.5,-0.5,0),_i,r,gi,i,s),As(Gi.set(0.5,-0.5,0),_i,r,gi,i,s),As(Es.set(0.5,0.5,0),_i,r,gi,i,s),Pl.set(0,0),ta.set(1,0),Ll.set(1,1);let a=t.ray.intersectTriangle(Ts,Gi,Es,!1,Bi);if(a===null){if(As(Gi.set(-0.5,0.5,0),_i,r,gi,i,s),ta.set(0,1),a=t.ray.intersectTriangle(Ts,Es,Gi,!1,Bi),a===null)return}let o=t.ray.origin.distanceTo(Bi);if(o<t.near||o>t.far)return;e.push({distance:o,point:Bi.clone(),uv:ze.getInterpolation(Bi,Ts,Gi,Es,Pl,ta,Ll,new lt),face:null,object:this})}copy(t,e){if(super.copy(t,e),t.center!==void 0)this.center.copy(t.center);return this.material=t.material,this}}function As(t,e,n,i,s,r){if(xi.subVectors(t,n).addScalar(0.5).multiply(i),s!==void 0)zi.x=r*xi.x-s*xi.y,zi.y=s*xi.x+r*xi.y;else zi.copy(xi);t.copy(e),t.x+=zi.x,t.y+=zi.y,t.applyMatrix4(qc)}var _n=new P,ea=new P,ws=new P,Cs=new P;class yo{constructor(t=new P,e=new P(0,0,-1)){this.origin=t,this.direction=e}set(t,e){return this.origin.copy(t),this.direction.copy(e),this}copy(t){return this.origin.copy(t.origin),this.direction.copy(t.direction),this}at(t,e){return e.copy(this.origin).addScaledVector(this.direction,t)}lookAt(t){return this.direction.copy(t).sub(this.origin).normalize(),this}recast(t){return this.origin.copy(this.at(t,_n)),this}closestPointToPoint(t,e){e.subVectors(t,this.origin);let n=e.dot(this.direction);if(n<0)return e.copy(this.origin);return e.copy(this.origin).addScaledVector(this.direction,n)}distanceToPoint(t){return Math.sqrt(this.distanceSqToPoint(t))}distanceSqToPoint(t){let e=_n.subVectors(t,this.origin).dot(this.direction);if(e<0)return this.origin.distanceToSquared(t);return _n.copy(this.origin).addScaledVector(this.direction,e),_n.distanceToSquared(t)}distanceSqToSegment(t,e,n,i){ea.copy(t).add(e).multiplyScalar(0.5),ws.copy(e).sub(t).normalize(),Cs.copy(this.origin).sub(ea);let s=t.distanceTo(e)*0.5,r=-this.direction.dot(ws),a=Cs.dot(this.direction),o=-Cs.dot(ws),l=Cs.lengthSq(),c=Math.abs(1-r*r),u,f,h,m;if(c>0)if(u=r*o-a,f=r*a-o,m=s*c,u>=0)if(f>=-m)if(f<=m){let v=1/c;u*=v,f*=v,h=u*(u+r*f+2*a)+f*(r*u+f+2*o)+l}else f=s,u=Math.max(0,-(r*f+a)),h=-u*u+f*(f+2*o)+l;else f=-s,u=Math.max(0,-(r*f+a)),h=-u*u+f*(f+2*o)+l;else if(f<=-m)u=Math.max(0,-(-r*s+a)),f=u>0?-s:Math.min(Math.max(-s,-o),s),h=-u*u+f*(f+2*o)+l;else if(f<=m)u=0,f=Math.min(Math.max(-s,-o),s),h=f*(f+2*o)+l;else u=Math.max(0,-(r*s+a)),f=u>0?s:Math.min(Math.max(-s,-o),s),h=-u*u+f*(f+2*o)+l;else f=r>0?-s:s,u=Math.max(0,-(r*f+a)),h=-u*u+f*(f+2*o)+l;if(n)n.copy(this.origin).addScaledVector(this.direction,u);if(i)i.copy(ea).addScaledVector(ws,f);return h}intersectSphere(t,e){if(t.radius<0)return null;_n.subVectors(t.center,this.origin);let n=_n.dot(this.direction),i=_n.dot(_n)-n*n,s=t.radius*t.radius;if(i>s)return null;let r=Math.sqrt(s-i),a=n-r,o=n+r;if(o<0)return null;if(a<0)return this.at(o,e);return this.at(a,e)}intersectsSphere(t){if(t.radius<0)return!1;return this.distanceSqToPoint(t.center)<=t.radius*t.radius}distanceToPlane(t){let e=t.normal.dot(this.direction);if(e===0){if(t.distanceToPoint(this.origin)===0)return 0;return null}let n=-(this.origin.dot(t.normal)+t.constant)/e;return n>=0?n:null}intersectPlane(t,e){let n=this.distanceToPlane(t);if(n===null)return null;return this.at(n,e)}intersectsPlane(t){let e=t.distanceToPoint(this.origin);if(e===0)return!0;if(t.normal.dot(this.direction)*e<0)return!0;return!1}intersectBox(t,e){let n,i,s,r,a,o,l=1/this.direction.x,c=1/this.direction.y,u=1/this.direction.z,f=this.origin;if(l>=0)n=(t.min.x-f.x)*l,i=(t.max.x-f.x)*l;else n=(t.max.x-f.x)*l,i=(t.min.x-f.x)*l;if(c>=0)s=(t.min.y-f.y)*c,r=(t.max.y-f.y)*c;else s=(t.max.y-f.y)*c,r=(t.min.y-f.y)*c;if(n>r||s>i)return null;if(s>n||isNaN(n))n=s;if(r<i||isNaN(i))i=r;if(u>=0)a=(t.min.z-f.z)*u,o=(t.max.z-f.z)*u;else a=(t.max.z-f.z)*u,o=(t.min.z-f.z)*u;if(n>o||a>i)return null;if(a>n||n!==n)n=a;if(o<i||i!==i)i=o;if(i<0)return null;return this.at(n>=0?n:i,e)}intersectsBox(t){return this.intersectBox(t,_n)!==null}intersectTriangle(t,e,n,i,s){let r=this.origin,a=this.direction,{x:o,y:l,z:c}=a,u=t.x-r.x,f=t.y-r.y,h=t.z-r.z,m=e.x-r.x,v=e.y-r.y,T=e.z-r.z,p=n.x-r.x,d=n.y-r.y,E=n.z-r.z,A=Math.abs(o),x=Math.abs(l),b=Math.abs(c),C,w,g,S,O,N,F,Z,I,G,J,k;if(A>=x&&A>=b)if(g=o,N=u,I=m,k=p,o>=0)C=l,w=c,S=f,O=h,F=v,Z=T,G=d,J=E;else C=c,w=l,S=h,O=f,F=T,Z=v,G=E,J=d;else if(x>=b)if(g=l,N=f,I=v,k=d,l>=0)C=c,w=o,S=h,O=u,F=T,Z=m,G=E,J=p;else C=o,w=c,S=u,O=h,F=m,Z=T,G=p,J=E;else if(g=c,N=h,I=T,k=E,c>=0)C=o,w=l,S=u,O=f,F=m,Z=v,G=p,J=d;else C=l,w=o,S=f,O=u,F=v,Z=m,G=d,J=p;if(g===0)return null;let rt=C/g,W=w/g,Q=1/g,nt=S-rt*N,Pt=O-W*N,Lt=F-rt*I,se=Z-W*I,Wt=G-rt*k,q=J-W*k,ot=Wt*se-q*Lt,st=nt*q-Pt*Wt,Nt=Lt*Pt-se*nt;if(i){if(ot<0||st<0||Nt<0)return null}else if((ot<0||st<0||Nt<0)&&(ot>0||st>0||Nt>0))return null;let Ft=ot+st+Nt;if(Ft===0)return null;let Et=Q*(ot*N+st*I+Nt*k);if(Ft>0?Et<0:Et>0)return null;return this.at(Et/Ft,s)}applyMatrix4(t){return this.origin.applyMatrix4(t),this.direction.transformDirection(t),this}equals(t){return t.origin.equals(this.origin)&&t.direction.equals(this.direction)}clone(){return new this.constructor().copy(this)}}class as extends Ln{constructor(t){super();this.isMeshBasicMaterial=!0,this.type="MeshBasicMaterial",this.color=new Zt(16777215),this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.specularMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new on,this.combine=0,this.reflectivity=1,this.refractionRatio=0.98,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.fog=!0,this.setValues(t)}copy(t){return super.copy(t),this.color.copy(t.color),this.map=t.map,this.lightMap=t.lightMap,this.lightMapIntensity=t.lightMapIntensity,this.aoMap=t.aoMap,this.aoMapIntensity=t.aoMapIntensity,this.specularMap=t.specularMap,this.alphaMap=t.alphaMap,this.envMap=t.envMap,this.envMapRotation.copy(t.envMapRotation),this.combine=t.combine,this.reflectivity=t.reflectivity,this.refractionRatio=t.refractionRatio,this.wireframe=t.wireframe,this.wireframeLinewidth=t.wireframeLinewidth,this.wireframeLinecap=t.wireframeLinecap,this.wireframeLinejoin=t.wireframeLinejoin,this.fog=t.fog,this}}var Nl=new ue,Fn=new yo,Rs=new rs,Dl=new P,Is=new P,Ps=new P,Ls=new P,na=new P,Ns=new P,Ul=new P,Ds=new P;class We extends Me{constructor(t=new ve,e=new as){super();this.isMesh=!0,this.type="Mesh",this.geometry=t,this.material=e,this.morphTargetDictionary=void 0,this.morphTargetInfluences=void 0,this.count=1,this.updateMorphTargets()}copy(t,e){if(super.copy(t,e),t.morphTargetInfluences!==void 0)this.morphTargetInfluences=t.morphTargetInfluences.slice();if(t.morphTargetDictionary!==void 0)this.morphTargetDictionary=Object.assign({},t.morphTargetDictionary);return this.material=Array.isArray(t.material)?t.material.slice():t.material,this.geometry=t.geometry,this}updateMorphTargets(){let e=this.geometry.morphAttributes,n=Object.keys(e);if(n.length>0){let i=e[n[0]];if(i!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let s=0,r=i.length;s<r;s++){let a=i[s].name||String(s);this.morphTargetInfluences.push(0),this.morphTargetDictionary[a]=s}}}}getVertexPosition(t,e){let n=this.geometry,i=n.attributes.position,s=n.morphAttributes.position,r=n.morphTargetsRelative;e.fromBufferAttribute(i,t);let a=this.morphTargetInfluences;if(s&&a){Ns.set(0,0,0);for(let o=0,l=s.length;o<l;o++){let c=a[o],u=s[o];if(c===0)continue;if(na.fromBufferAttribute(u,t),r)Ns.addScaledVector(na,c);else Ns.addScaledVector(na.sub(e),c)}e.add(Ns)}return e}intersectsFrustum(t){return t.intersectsObject(this)}raycast(t,e){let n=this.geometry,i=this.material,s=this.matrixWorld;if(i===void 0)return;if(n.boundingSphere===null)n.computeBoundingSphere();if(Rs.copy(n.boundingSphere),Rs.applyMatrix4(s),Fn.copy(t.ray).recast(t.near),Rs.containsPoint(Fn.origin)===!1){if(Fn.intersectSphere(Rs,Dl)===null)return;if(Fn.origin.distanceToSquared(Dl)>(t.far-t.near)**2)return}if(Nl.copy(s).invert(),Fn.copy(t.ray).applyMatrix4(Nl),n.boundingBox!==null){if(Fn.intersectsBox(n.boundingBox)===!1)return}this._computeIntersections(t,e,Fn)}_computeIntersections(t,e,n){let i,s=this.geometry,r=this.material,a=s.index,o=s.attributes.position,l=s.attributes.uv,c=s.attributes.uv1,u=s.attributes.normal,{groups:f,drawRange:h}=s;if(a!==null)if(Array.isArray(r))for(let m=0,v=f.length;m<v;m++){let T=f[m],p=r[T.materialIndex],d=Math.max(T.start,h.start),E=Math.min(a.count,Math.min(T.start+T.count,h.start+h.count));for(let A=d,x=E;A<x;A+=3){let b=a.getX(A),C=a.getX(A+1),w=a.getX(A+2);if(i=Us(this,p,t,n,l,c,u,b,C,w),i)i.faceIndex=Math.floor(A/3),i.face.materialIndex=T.materialIndex,e.push(i)}}else{let m=Math.max(0,h.start),v=Math.min(a.count,h.start+h.count);for(let T=m,p=v;T<p;T+=3){let d=a.getX(T),E=a.getX(T+1),A=a.getX(T+2);if(i=Us(this,r,t,n,l,c,u,d,E,A),i)i.faceIndex=Math.floor(T/3),e.push(i)}}else if(o!==void 0)if(Array.isArray(r))for(let m=0,v=f.length;m<v;m++){let T=f[m],p=r[T.materialIndex],d=Math.max(T.start,h.start),E=Math.min(o.count,Math.min(T.start+T.count,h.start+h.count));for(let A=d,x=E;A<x;A+=3){let b=A,C=A+1,w=A+2;if(i=Us(this,p,t,n,l,c,u,b,C,w),i)i.faceIndex=Math.floor(A/3),i.face.materialIndex=T.materialIndex,e.push(i)}}else{let m=Math.max(0,h.start),v=Math.min(o.count,h.start+h.count);for(let T=m,p=v;T<p;T+=3){let d=T,E=T+1,A=T+2;if(i=Us(this,r,t,n,l,c,u,d,E,A),i)i.faceIndex=Math.floor(T/3),e.push(i)}}}}function hu(t,e,n,i,s,r,a,o){let l;if(e.side===1)l=i.intersectTriangle(a,r,s,!0,o);else l=i.intersectTriangle(s,r,a,e.side===0,o);if(l===null)return null;Ds.copy(o),Ds.applyMatrix4(t.matrixWorld);let c=n.ray.origin.distanceTo(Ds);if(c<n.near||c>n.far)return null;return{distance:c,point:Ds.clone(),object:t}}function Us(t,e,n,i,s,r,a,o,l,c){t.getVertexPosition(o,Is),t.getVertexPosition(l,Ps),t.getVertexPosition(c,Ls);let u=hu(t,e,n,i,Is,Ps,Ls,Ul);if(u){let f=new P;if(ze.getBarycoord(Ul,Is,Ps,Ls,f),s)u.uv=ze.getInterpolatedAttribute(s,o,l,c,f,new lt);if(r)u.uv1=ze.getInterpolatedAttribute(r,o,l,c,f,new lt);if(a){if(u.normal=ze.getInterpolatedAttribute(a,o,l,c,f,new P),u.normal.dot(i.direction)>0)u.normal.multiplyScalar(-1)}let h={a:o,b:l,c,normal:new P,materialIndex:0};ze.getNormal(Is,Ps,Ls,h.normal),u.face=h,u.barycoord=f}return u}class or extends Ae{constructor(t=null,e=1,n=1,i,s,r,a,o,l=1003,c=1003,u,f){super(null,r,a,o,l,c,i,s,u,f);this.isDataTexture=!0,this.image={data:t,width:e,height:n},this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}}class So extends Ue{constructor(t,e,n,i=1){super(t,e,n);this.isInstancedBufferAttribute=!0,this.meshPerAttribute=i}copy(t){return super.copy(t),this.meshPerAttribute=t.meshPerAttribute,this}toJSON(){let t=super.toJSON();return t.meshPerAttribute=this.meshPerAttribute,t.isInstancedBufferAttribute=!0,t}}var On=new rs,uu=new lt(0.5,0.5),Fs=new P;class os{constructor(t=new rn,e=new rn,n=new rn,i=new rn,s=new rn,r=new rn){this.planes=[t,e,n,i,s,r]}set(t,e,n,i,s,r){let a=this.planes;return a[0].copy(t),a[1].copy(e),a[2].copy(n),a[3].copy(i),a[4].copy(s),a[5].copy(r),this}copy(t){let e=this.planes;for(let n=0;n<6;n++)e[n].copy(t.planes[n]);return this}setFromProjectionMatrix(t,e=2000,n=!1){let i=this.planes,s=t.elements,r=s[0],a=s[1],o=s[2],l=s[3],c=s[4],u=s[5],f=s[6],h=s[7],m=s[8],v=s[9],T=s[10],p=s[11],d=s[12],E=s[13],A=s[14],x=s[15];if(i[0].setComponents(l-r,h-c,p-m,x-d).normalize(),i[1].setComponents(l+r,h+c,p+m,x+d).normalize(),i[2].setComponents(l+a,h+u,p+v,x+E).normalize(),i[3].setComponents(l-a,h-u,p-v,x-E).normalize(),n)i[4].setComponents(o,f,T,A).normalize(),i[5].setComponents(l-o,h-f,p-T,x-A).normalize();else if(i[4].setComponents(l-o,h-f,p-T,x-A).normalize(),e===2000)i[5].setComponents(l+o,h+f,p+T,x+A).normalize();else if(e===2001)i[5].setComponents(o,f,T,A).normalize();else throw Error("THREE.Frustum.setFromProjectionMatrix(): Invalid coordinate system: "+e);return this}intersectsObject(t){if(t.boundingSphere!==void 0){if(t.boundingSphere===null)t.computeBoundingSphere();On.copy(t.boundingSphere).applyMatrix4(t.matrixWorld)}else{let e=t.geometry;if(e.boundingSphere===null)e.computeBoundingSphere();On.copy(e.boundingSphere).applyMatrix4(t.matrixWorld)}return this.intersectsSphere(On)}intersectsSprite(t){On.center.set(0,0,0);let e=uu.distanceTo(t.center);return On.radius=0.7071067811865476+e,On.applyMatrix4(t.matrixWorld),this.intersectsSphere(On)}intersectsSphere(t){let e=this.planes,n=t.center,i=-t.radius;for(let s=0;s<6;s++)if(e[s].distanceToPoint(n)<i)return!1;return!0}intersectsBox(t){let e=this.planes;for(let n=0;n<6;n++){let i=e[n];if(Fs.x=i.normal.x>0?t.max.x:t.min.x,Fs.y=i.normal.y>0?t.max.y:t.min.y,Fs.z=i.normal.z>0?t.max.z:t.min.z,i.distanceToPoint(Fs)<0)return!1}return!0}containsPoint(t){let e=this.planes;for(let n=0;n<6;n++)if(e[n].distanceToPoint(t)<0)return!1;return!0}clone(){return new this.constructor().copy(this)}}class lr extends Ae{constructor(t=[],e=301,n,i,s,r,a,o,l,c){super(t,e,n,i,s,r,a,o,l,c);this.isCubeTexture=!0,this.flipY=!1}get images(){return this.image}set images(t){this.image=t}}class Mo extends Ae{constructor(t,e,n,i,s,r,a,o,l){super(t,e,n,i,s,r,a,o,l);this.isCanvasTexture=!0,this.needsUpdate=!0}}class $n extends Ae{constructor(t,e,n=1014,i,s,r,a=1003,o=1003,l,c=1026,u=1){if(c!==1026&&c!==1027)throw Error("THREE.DepthTexture: format must be either THREE.DepthFormat or THREE.DepthStencilFormat");let f={width:t,height:e,depth:u};super(f,i,s,r,a,o,c,n,l);this.isDepthTexture=!0,this.flipY=!1,this.generateMipmaps=!1,this.compareFunction=null}copy(t){return super.copy(t),this.source=new es(Object.assign({},t.image)),this.compareFunction=t.compareFunction,this}toJSON(t){let e=super.toJSON(t);return e.compareFunction=this.compareFunction,e}}class bo extends $n{constructor(t,e=1014,n=301,i,s,r=1003,a=1003,o,l=1026){let c={width:t,height:t,depth:1},u=[c,c,c,c,c,c];super(t,t,e,n,i,s,r,a,o,l);this.image=u,this.isCubeDepthTexture=!0,this.isCubeTexture=!0}get images(){return this.image}set images(t){this.image=t}}class cr extends Ae{constructor(t=null){super();this.sourceTexture=t,this.isExternalTexture=!0}copy(t){return super.copy(t),this.sourceTexture=t.sourceTexture,this}}class Kn extends ve{constructor(t=1,e=1,n=1,i=1,s=1,r=1){super();this.type="BoxGeometry",this.parameters={width:t,height:e,depth:n,widthSegments:i,heightSegments:s,depthSegments:r};let a=this;i=Math.floor(i),s=Math.floor(s),r=Math.floor(r);let o=[],l=[],c=[],u=[],f=0,h=0;m("z","y","x",-1,-1,n,e,t,r,s,0),m("z","y","x",1,-1,n,e,-t,r,s,1),m("x","z","y",1,1,t,n,e,i,r,2),m("x","z","y",1,-1,t,n,-e,i,r,3),m("x","y","z",1,-1,t,e,n,i,s,4),m("x","y","z",-1,-1,t,e,-n,i,s,5),this.setIndex(o),this.setAttribute("position",new jt(l,3)),this.setAttribute("normal",new jt(c,3)),this.setAttribute("uv",new jt(u,2));function m(v,T,p,d,E,A,x,b,C,w,g){let S=A/C,O=x/w,N=A/2,F=x/2,Z=b/2,I=C+1,G=w+1,J=0,k=0,rt=new P;for(let W=0;W<G;W++){let Q=W*O-F;for(let nt=0;nt<I;nt++){let Pt=nt*S-N;rt[v]=Pt*d,rt[T]=Q*E,rt[p]=Z,l.push(rt.x,rt.y,rt.z),rt[v]=0,rt[T]=0,rt[p]=b>0?1:-1,c.push(rt.x,rt.y,rt.z),u.push(nt/C),u.push(1-W/w),J+=1}}for(let W=0;W<w;W++)for(let Q=0;Q<C;Q++){let nt=f+Q+I*W,Pt=f+Q+I*(W+1),Lt=f+(Q+1)+I*(W+1),se=f+(Q+1)+I*W;o.push(nt,Pt,se),o.push(Pt,Lt,se),k+=6}a.addGroup(h,k,g),h+=k,f+=J}}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new Kn(t.width,t.height,t.depth,t.widthSegments,t.heightSegments,t.depthSegments)}}class hr extends ve{constructor(t=1,e=32,n=0,i=Math.PI*2){super();this.type="CircleGeometry",this.parameters={radius:t,segments:e,thetaStart:n,thetaLength:i},e=Math.max(3,e);let s=[],r=[],a=[],o=[],l=new P,c=new lt;r.push(0,0,0),a.push(0,0,1),o.push(0.5,0.5);for(let u=0,f=3;u<=e;u++,f+=3){let h=n+u/e*i;l.x=t*Math.cos(h),l.y=t*Math.sin(h),r.push(l.x,l.y,l.z),a.push(0,0,1),c.x=(r[f]/t+1)/2,c.y=(r[f+1]/t+1)/2,o.push(c.x,c.y)}for(let u=1;u<=e;u++)s.push(u,u+1,0);this.setIndex(s),this.setAttribute("position",new jt(r,3)),this.setAttribute("normal",new jt(a,3)),this.setAttribute("uv",new jt(o,2))}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new hr(t.radius,t.segments,t.thetaStart,t.thetaLength)}}class ls extends ve{constructor(t=1,e=1,n=1,i=32,s=1,r=!1,a=0,o=Math.PI*2){super();this.type="CylinderGeometry",this.parameters={radiusTop:t,radiusBottom:e,height:n,radialSegments:i,heightSegments:s,openEnded:r,thetaStart:a,thetaLength:o};let l=this;i=Math.floor(i),s=Math.floor(s);let c=[],u=[],f=[],h=[],m=0,v=[],T=n/2,p=0;if(d(),r===!1){if(t>0)E(!0);if(e>0)E(!1)}this.setIndex(c),this.setAttribute("position",new jt(u,3)),this.setAttribute("normal",new jt(f,3)),this.setAttribute("uv",new jt(h,2));function d(){let A=new P,x=new P,b=0,C=(e-t)/n;for(let w=0;w<=s;w++){let g=[],S=w/s,O=S*(e-t)+t;for(let N=0;N<=i;N++){let F=N/i,Z=F*o+a,I=Math.sin(Z),G=Math.cos(Z);x.x=O*I,x.y=-S*n+T,x.z=O*G,u.push(x.x,x.y,x.z),A.set(I,C,G).normalize(),f.push(A.x,A.y,A.z),h.push(F,1-S),g.push(m++)}v.push(g)}for(let w=0;w<i;w++)for(let g=0;g<s;g++){let S=v[g][w],O=v[g+1][w],N=v[g+1][w+1],F=v[g][w+1];if(t>0||g!==0)c.push(S,O,F),b+=3;if(e>0||g!==s-1)c.push(O,N,F),b+=3}l.addGroup(p,b,0),p+=b}function E(A){let x=m,b=new lt,C=new P,w=0,g=A===!0?t:e,S=A===!0?1:-1;for(let N=1;N<=i;N++)u.push(0,T*S,0),f.push(0,S,0),h.push(0.5,0.5),m++;let O=m;for(let N=0;N<=i;N++){let Z=N/i*o+a,I=Math.cos(Z),G=Math.sin(Z);C.x=g*G,C.y=T*S,C.z=g*I,u.push(C.x,C.y,C.z),f.push(0,S,0),b.x=I*0.5+0.5,b.y=G*0.5*S+0.5,h.push(b.x,b.y),m++}for(let N=0;N<i;N++){let F=x+N,Z=O+N;if(A===!0)c.push(Z,Z+1,F);else c.push(Z+1,Z,F);w+=3}l.addGroup(p,w,A===!0?1:2),p+=w}}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new ls(t.radiusTop,t.radiusBottom,t.height,t.radialSegments,t.heightSegments,t.openEnded,t.thetaStart,t.thetaLength)}}class ur extends ls{constructor(t=1,e=1,n=32,i=1,s=!1,r=0,a=Math.PI*2){super(0,t,e,n,i,s,r,a);this.type="ConeGeometry",this.parameters={radius:t,height:e,radialSegments:n,heightSegments:i,openEnded:s,thetaStart:r,thetaLength:a}}static fromJSON(t){return new ur(t.radius,t.height,t.radialSegments,t.heightSegments,t.openEnded,t.thetaStart,t.thetaLength)}}class dr extends ve{constructor(t=[],e=[],n=1,i=0){super();this.type="PolyhedronGeometry",this.parameters={vertices:t,indices:e,radius:n,detail:i};let s=[],r=[];if(a(i),l(n),c(),this.setAttribute("position",new jt(s,3)),this.setAttribute("normal",new jt(s.slice(),3)),this.setAttribute("uv",new jt(r,2)),i===0)this.computeVertexNormals();else this.normalizeNormals();function a(d){let E=new P,A=new P,x=new P;for(let b=0;b<e.length;b+=3)h(e[b+0],E),h(e[b+1],A),h(e[b+2],x),o(E,A,x,d)}function o(d,E,A,x){let b=x+1,C=[];for(let w=0;w<=b;w++){C[w]=[];let g=d.clone().lerp(A,w/b),S=E.clone().lerp(A,w/b),O=b-w;for(let N=0;N<=O;N++)if(N===0&&w===b)C[w][N]=g;else C[w][N]=g.clone().lerp(S,N/O)}for(let w=0;w<b;w++)for(let g=0;g<2*(b-w)-1;g++){let S=Math.floor(g/2);if(g%2===0)f(C[w][S+1]),f(C[w+1][S]),f(C[w][S]);else f(C[w][S+1]),f(C[w+1][S+1]),f(C[w+1][S])}}function l(d){let E=new P;for(let A=0;A<s.length;A+=3)E.x=s[A+0],E.y=s[A+1],E.z=s[A+2],E.normalize().multiplyScalar(d),s[A+0]=E.x,s[A+1]=E.y,s[A+2]=E.z}function c(){let d=new P;for(let E=0;E<s.length;E+=3){d.x=s[E+0],d.y=s[E+1],d.z=s[E+2];let A=T(d)/2/Math.PI+0.5,x=p(d)/Math.PI+0.5;r.push(A,1-x)}m(),u()}function u(){for(let d=0;d<r.length;d+=6){let E=r[d+0],A=r[d+2],x=r[d+4],b=Math.max(E,A,x),C=Math.min(E,A,x);if(b>0.9&&C<0.1){if(E<0.2)r[d+0]+=1;if(A<0.2)r[d+2]+=1;if(x<0.2)r[d+4]+=1}}}function f(d){s.push(d.x,d.y,d.z)}function h(d,E){let A=d*3;E.x=t[A+0],E.y=t[A+1],E.z=t[A+2]}function m(){let d=new P,E=new P,A=new P,x=new P,b=new lt,C=new lt,w=new lt;for(let g=0,S=0;g<s.length;g+=9,S+=6){d.set(s[g+0],s[g+1],s[g+2]),E.set(s[g+3],s[g+4],s[g+5]),A.set(s[g+6],s[g+7],s[g+8]),b.set(r[S+0],r[S+1]),C.set(r[S+2],r[S+3]),w.set(r[S+4],r[S+5]),x.copy(d).add(E).add(A).divideScalar(3);let O=T(x);v(b,S+0,d,O),v(C,S+2,E,O),v(w,S+4,A,O)}}function v(d,E,A,x){if(x<0&&d.x===1)r[E]=d.x-1;if(A.x===0&&A.z===0)r[E]=x/2/Math.PI+0.5}function T(d){return Math.atan2(d.z,-d.x)}function p(d){return Math.atan2(-d.y,Math.sqrt(d.x*d.x+d.z*d.z))}}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new dr(t.vertices,t.indices,t.radius,t.detail)}}class Xe{constructor(){this.type="Curve",this.arcLengthDivisions=200,this.needsUpdate=!1,this.cacheArcLengths=null}getPoint(){zt("Curve: .getPoint() not implemented.")}getPointAt(t,e){let n=this.getUtoTmapping(t);return this.getPoint(n,e)}getPoints(t=5){let e=[];for(let n=0;n<=t;n++)e.push(this.getPoint(n/t));return e}getSpacedPoints(t=5){let e=[];for(let n=0;n<=t;n++)e.push(this.getPointAt(n/t));return e}getLength(){let t=this.getLengths();return t[t.length-1]}getLengths(t=this.arcLengthDivisions){if(this.cacheArcLengths&&this.cacheArcLengths.length===t+1&&!this.needsUpdate)return this.cacheArcLengths;this.needsUpdate=!1;let e=[],n,i=this.getPoint(0),s=0;e.push(0);for(let r=1;r<=t;r++)n=this.getPoint(r/t),s+=n.distanceTo(i),e.push(s),i=n;return this.cacheArcLengths=e,e}updateArcLengths(){this.needsUpdate=!0,this.getLengths()}getUtoTmapping(t,e=null){let n=this.getLengths(),i=0,s=n.length,r;if(e)r=e;else r=t*n[s-1];let a=0,o=s-1,l;while(a<=o)if(i=Math.floor(a+(o-a)/2),l=n[i]-r,l<0)a=i+1;else if(l>0)o=i-1;else{o=i;break}if(i=o,n[i]===r)return i/(s-1);let c=n[i],f=n[i+1]-c,h=(r-c)/f;return(i+h)/(s-1)}getTangent(t,e){let i=t-0.0001,s=t+0.0001;if(i<0)i=0;if(s>1)s=1;let r=this.getPoint(i),a=this.getPoint(s),o=e||(r.isVector2?new lt:new P);return o.copy(a).sub(r).normalize(),o}getTangentAt(t,e){let n=this.getUtoTmapping(t);return this.getTangent(n,e)}computeFrenetFrames(t,e=!1){let n=new P,i=[],s=[],r=[],a=new P,o=new ue;for(let h=0;h<=t;h++){let m=h/t;i[h]=this.getTangentAt(m,new P)}s[0]=new P,r[0]=new P;let l=Number.MAX_VALUE,c=Math.abs(i[0].x),u=Math.abs(i[0].y),f=Math.abs(i[0].z);if(c<=l)l=c,n.set(1,0,0);if(u<=l)l=u,n.set(0,1,0);if(f<=l)n.set(0,0,1);a.crossVectors(i[0],n).normalize(),s[0].crossVectors(i[0],a),r[0].crossVectors(i[0],s[0]);for(let h=1;h<=t;h++){if(s[h]=s[h-1].clone(),r[h]=r[h-1].clone(),a.crossVectors(i[h-1],i[h]),a.length()>Number.EPSILON){a.normalize();let m=Math.acos(Qt(i[h-1].dot(i[h]),-1,1));s[h].applyMatrix4(o.makeRotationAxis(a,m))}r[h].crossVectors(i[h],s[h])}if(e===!0){let h=Math.acos(Qt(s[0].dot(s[t]),-1,1));if(h/=t,i[0].dot(a.crossVectors(s[0],s[t]))>0)h=-h;for(let m=1;m<=t;m++)s[m].applyMatrix4(o.makeRotationAxis(i[m],h*m)),r[m].crossVectors(i[m],s[m])}return{tangents:i,normals:s,binormals:r}}clone(){return new this.constructor().copy(this)}copy(t){return this.arcLengthDivisions=t.arcLengthDivisions,this}toJSON(){let t={metadata:{version:4.7,type:"Curve",generator:"Curve.toJSON"}};return t.arcLengthDivisions=this.arcLengthDivisions,t.type=this.type,t}fromJSON(t){return this.arcLengthDivisions=t.arcLengthDivisions,this}}class cs extends Xe{constructor(t=0,e=0,n=1,i=1,s=0,r=Math.PI*2,a=!1,o=0){super();this.isEllipseCurve=!0,this.type="EllipseCurve",this.aX=t,this.aY=e,this.xRadius=n,this.yRadius=i,this.aStartAngle=s,this.aEndAngle=r,this.aClockwise=a,this.aRotation=o}getPoint(t,e=new lt){let n=e,i=Math.PI*2,s=this.aEndAngle-this.aStartAngle,r=Math.abs(s)<Number.EPSILON;while(s<0)s+=i;while(s>i)s-=i;if(s<Number.EPSILON)if(r)s=0;else s=i;if(this.aClockwise===!0&&!r)if(s===i)s=-i;else s=s-i;let a=this.aStartAngle+t*s,o=this.aX+this.xRadius*Math.cos(a),l=this.aY+this.yRadius*Math.sin(a);if(this.aRotation!==0){let c=Math.cos(this.aRotation),u=Math.sin(this.aRotation),f=o-this.aX,h=l-this.aY;o=f*c-h*u+this.aX,l=f*u+h*c+this.aY}return n.set(o,l)}copy(t){return super.copy(t),this.aX=t.aX,this.aY=t.aY,this.xRadius=t.xRadius,this.yRadius=t.yRadius,this.aStartAngle=t.aStartAngle,this.aEndAngle=t.aEndAngle,this.aClockwise=t.aClockwise,this.aRotation=t.aRotation,this}toJSON(){let t=super.toJSON();return t.aX=this.aX,t.aY=this.aY,t.xRadius=this.xRadius,t.yRadius=this.yRadius,t.aStartAngle=this.aStartAngle,t.aEndAngle=this.aEndAngle,t.aClockwise=this.aClockwise,t.aRotation=this.aRotation,t}fromJSON(t){return super.fromJSON(t),this.aX=t.aX,this.aY=t.aY,this.xRadius=t.xRadius,this.yRadius=t.yRadius,this.aStartAngle=t.aStartAngle,this.aEndAngle=t.aEndAngle,this.aClockwise=t.aClockwise,this.aRotation=t.aRotation,this}}class To extends cs{constructor(t,e,n,i,s,r){super(t,e,n,n,i,s,r);this.isArcCurve=!0,this.type="ArcCurve"}}function Eo(){let t=0,e=0,n=0,i=0;function s(r,a,o,l){t=r,e=o,n=-3*r+3*a-2*o-l,i=2*r-2*a+o+l}return{initCatmullRom:function(r,a,o,l,c){s(a,o,c*(o-r),c*(l-a))},initNonuniformCatmullRom:function(r,a,o,l,c,u,f){let h=(a-r)/c-(o-r)/(c+u)+(o-a)/u,m=(o-a)/u-(l-a)/(u+f)+(l-o)/f;h*=u,m*=u,s(a,o,h,m)},calc:function(r){let a=r*r,o=a*r;return t+e*r+n*a+i*o}}}var Fl=new P,Ol=new P,ia=new Eo,sa=new Eo,ra=new Eo;class fr extends Xe{constructor(t=[],e=!1,n="centripetal",i=0.5){super();this.isCatmullRomCurve3=!0,this.type="CatmullRomCurve3",this.points=t,this.closed=e,this.curveType=n,this.tension=i}getPoint(t,e=new P){let n=e,i=this.points,s=i.length,r=(s-(this.closed?0:1))*t,a=Math.floor(r),o=r-a;if(this.closed)a+=a>0?0:(Math.floor(Math.abs(a)/s)+1)*s;else if(o===0&&a===s-1)a=s-2,o=1;let l,c;if(this.closed||a>0)l=i[(a-1)%s];else Ol.subVectors(i[0],i[1]).add(i[0]),l=Ol;let u=i[a%s],f=i[(a+1)%s];if(this.closed||a+2<s)c=i[(a+2)%s];else Fl.subVectors(i[s-1],i[s-2]).add(i[s-1]),c=Fl;if(this.curveType==="centripetal"||this.curveType==="chordal"){let h=this.curveType==="chordal"?0.5:0.25,m=Math.pow(l.distanceToSquared(u),h),v=Math.pow(u.distanceToSquared(f),h),T=Math.pow(f.distanceToSquared(c),h);if(v<0.0001)v=1;if(m<0.0001)m=v;if(T<0.0001)T=v;ia.initNonuniformCatmullRom(l.x,u.x,f.x,c.x,m,v,T),sa.initNonuniformCatmullRom(l.y,u.y,f.y,c.y,m,v,T),ra.initNonuniformCatmullRom(l.z,u.z,f.z,c.z,m,v,T)}else if(this.curveType==="catmullrom")ia.initCatmullRom(l.x,u.x,f.x,c.x,this.tension),sa.initCatmullRom(l.y,u.y,f.y,c.y,this.tension),ra.initCatmullRom(l.z,u.z,f.z,c.z,this.tension);return n.set(ia.calc(o),sa.calc(o),ra.calc(o)),n}copy(t){super.copy(t),this.points=[];for(let e=0,n=t.points.length;e<n;e++){let i=t.points[e];this.points.push(i.clone())}return this.closed=t.closed,this.curveType=t.curveType,this.tension=t.tension,this}toJSON(){let t=super.toJSON();t.points=[];for(let e=0,n=this.points.length;e<n;e++){let i=this.points[e];t.points.push(i.toArray())}return t.closed=this.closed,t.curveType=this.curveType,t.tension=this.tension,t}fromJSON(t){super.fromJSON(t),this.points=[];for(let e=0,n=t.points.length;e<n;e++){let i=t.points[e];this.points.push(new P().fromArray(i))}return this.closed=t.closed,this.curveType=t.curveType,this.tension=t.tension,this}}function Bl(t,e,n,i,s){let r=(i-e)*0.5,a=(s-n)*0.5,o=t*t,l=t*o;return(2*n-2*i+r+a)*l+(-3*n+3*i-2*r-a)*o+r*t+n}function du(t,e){let n=1-t;return n*n*e}function fu(t,e){return 2*(1-t)*t*e}function pu(t,e){return t*t*e}function Hi(t,e,n,i){return du(t,e)+fu(t,n)+pu(t,i)}function mu(t,e){let n=1-t;return n*n*n*e}function gu(t,e){let n=1-t;return 3*n*n*t*e}function _u(t,e){return 3*(1-t)*t*t*e}function xu(t,e){return t*t*t*e}function Vi(t,e,n,i,s){return mu(t,e)+gu(t,n)+_u(t,i)+xu(t,s)}class pr extends Xe{constructor(t=new lt,e=new lt,n=new lt,i=new lt){super();this.isCubicBezierCurve=!0,this.type="CubicBezierCurve",this.v0=t,this.v1=e,this.v2=n,this.v3=i}getPoint(t,e=new lt){let n=e,i=this.v0,s=this.v1,r=this.v2,a=this.v3;return n.set(Vi(t,i.x,s.x,r.x,a.x),Vi(t,i.y,s.y,r.y,a.y)),n}copy(t){return super.copy(t),this.v0.copy(t.v0),this.v1.copy(t.v1),this.v2.copy(t.v2),this.v3.copy(t.v3),this}toJSON(){let t=super.toJSON();return t.v0=this.v0.toArray(),t.v1=this.v1.toArray(),t.v2=this.v2.toArray(),t.v3=this.v3.toArray(),t}fromJSON(t){return super.fromJSON(t),this.v0.fromArray(t.v0),this.v1.fromArray(t.v1),this.v2.fromArray(t.v2),this.v3.fromArray(t.v3),this}}class Ao extends Xe{constructor(t=new P,e=new P,n=new P,i=new P){super();this.isCubicBezierCurve3=!0,this.type="CubicBezierCurve3",this.v0=t,this.v1=e,this.v2=n,this.v3=i}getPoint(t,e=new P){let n=e,i=this.v0,s=this.v1,r=this.v2,a=this.v3;return n.set(Vi(t,i.x,s.x,r.x,a.x),Vi(t,i.y,s.y,r.y,a.y),Vi(t,i.z,s.z,r.z,a.z)),n}copy(t){return super.copy(t),this.v0.copy(t.v0),this.v1.copy(t.v1),this.v2.copy(t.v2),this.v3.copy(t.v3),this}toJSON(){let t=super.toJSON();return t.v0=this.v0.toArray(),t.v1=this.v1.toArray(),t.v2=this.v2.toArray(),t.v3=this.v3.toArray(),t}fromJSON(t){return super.fromJSON(t),this.v0.fromArray(t.v0),this.v1.fromArray(t.v1),this.v2.fromArray(t.v2),this.v3.fromArray(t.v3),this}}class mr extends Xe{constructor(t=new lt,e=new lt){super();this.isLineCurve=!0,this.type="LineCurve",this.v1=t,this.v2=e}getPoint(t,e=new lt){let n=e;if(t===1)n.copy(this.v2);else n.copy(this.v2).sub(this.v1),n.multiplyScalar(t).add(this.v1);return n}getPointAt(t,e){return this.getPoint(t,e)}getTangent(t,e=new lt){return e.subVectors(this.v2,this.v1).normalize()}getTangentAt(t,e){return this.getTangent(t,e)}copy(t){return super.copy(t),this.v1.copy(t.v1),this.v2.copy(t.v2),this}toJSON(){let t=super.toJSON();return t.v1=this.v1.toArray(),t.v2=this.v2.toArray(),t}fromJSON(t){return super.fromJSON(t),this.v1.fromArray(t.v1),this.v2.fromArray(t.v2),this}}class wo extends Xe{constructor(t=new P,e=new P){super();this.isLineCurve3=!0,this.type="LineCurve3",this.v1=t,this.v2=e}getPoint(t,e=new P){let n=e;if(t===1)n.copy(this.v2);else n.copy(this.v2).sub(this.v1),n.multiplyScalar(t).add(this.v1);return n}getPointAt(t,e){return this.getPoint(t,e)}getTangent(t,e=new P){return e.subVectors(this.v2,this.v1).normalize()}getTangentAt(t,e){return this.getTangent(t,e)}copy(t){return super.copy(t),this.v1.copy(t.v1),this.v2.copy(t.v2),this}toJSON(){let t=super.toJSON();return t.v1=this.v1.toArray(),t.v2=this.v2.toArray(),t}fromJSON(t){return super.fromJSON(t),this.v1.fromArray(t.v1),this.v2.fromArray(t.v2),this}}class gr extends Xe{constructor(t=new lt,e=new lt,n=new lt){super();this.isQuadraticBezierCurve=!0,this.type="QuadraticBezierCurve",this.v0=t,this.v1=e,this.v2=n}getPoint(t,e=new lt){let n=e,i=this.v0,s=this.v1,r=this.v2;return n.set(Hi(t,i.x,s.x,r.x),Hi(t,i.y,s.y,r.y)),n}copy(t){return super.copy(t),this.v0.copy(t.v0),this.v1.copy(t.v1),this.v2.copy(t.v2),this}toJSON(){let t=super.toJSON();return t.v0=this.v0.toArray(),t.v1=this.v1.toArray(),t.v2=this.v2.toArray(),t}fromJSON(t){return super.fromJSON(t),this.v0.fromArray(t.v0),this.v1.fromArray(t.v1),this.v2.fromArray(t.v2),this}}class _r extends Xe{constructor(t=new P,e=new P,n=new P){super();this.isQuadraticBezierCurve3=!0,this.type="QuadraticBezierCurve3",this.v0=t,this.v1=e,this.v2=n}getPoint(t,e=new P){let n=e,i=this.v0,s=this.v1,r=this.v2;return n.set(Hi(t,i.x,s.x,r.x),Hi(t,i.y,s.y,r.y),Hi(t,i.z,s.z,r.z)),n}copy(t){return super.copy(t),this.v0.copy(t.v0),this.v1.copy(t.v1),this.v2.copy(t.v2),this}toJSON(){let t=super.toJSON();return t.v0=this.v0.toArray(),t.v1=this.v1.toArray(),t.v2=this.v2.toArray(),t}fromJSON(t){return super.fromJSON(t),this.v0.fromArray(t.v0),this.v1.fromArray(t.v1),this.v2.fromArray(t.v2),this}}class xr extends Xe{constructor(t=[]){super();this.isSplineCurve=!0,this.type="SplineCurve",this.points=t}getPoint(t,e=new lt){let n=e,i=this.points,s=(i.length-1)*t,r=Math.floor(s),a=s-r,o=i[r===0?r:r-1],l=i[r],c=i[r>i.length-2?i.length-1:r+1],u=i[r>i.length-3?i.length-1:r+2];return n.set(Bl(a,o.x,l.x,c.x,u.x),Bl(a,o.y,l.y,c.y,u.y)),n}copy(t){super.copy(t),this.points=[];for(let e=0,n=t.points.length;e<n;e++){let i=t.points[e];this.points.push(i.clone())}return this}toJSON(){let t=super.toJSON();t.points=[];for(let e=0,n=this.points.length;e<n;e++){let i=this.points[e];t.points.push(i.toArray())}return t}fromJSON(t){super.fromJSON(t),this.points=[];for(let e=0,n=t.points.length;e<n;e++){let i=t.points[e];this.points.push(new lt().fromArray(i))}return this}}var Hs=Object.freeze({__proto__:null,ArcCurve:To,CatmullRomCurve3:fr,CubicBezierCurve:pr,CubicBezierCurve3:Ao,EllipseCurve:cs,LineCurve:mr,LineCurve3:wo,QuadraticBezierCurve:gr,QuadraticBezierCurve3:_r,SplineCurve:xr});class Co extends Xe{constructor(){super();this.type="CurvePath",this.curves=[],this.autoClose=!1}add(t){this.curves.push(t)}closePath(){let t=this.curves[0].getPoint(0),e=this.curves[this.curves.length-1].getPoint(1);if(!t.equals(e)){let n=t.isVector2===!0?"LineCurve":"LineCurve3";this.curves.push(new Hs[n](e,t))}return this}getPoint(t,e){let n=t*this.getLength(),i=this.getCurveLengths(),s=0;while(s<i.length){if(i[s]>=n){let r=i[s]-n,a=this.curves[s],o=a.getLength(),l=o===0?0:1-r/o;return a.getPointAt(l,e)}s++}return null}getLength(){let t=this.getCurveLengths();return t[t.length-1]}updateArcLengths(){this.needsUpdate=!0,this.cacheLengths=null,this.getCurveLengths()}getCurveLengths(){if(this.cacheLengths&&this.cacheLengths.length===this.curves.length)return this.cacheLengths;let t=[],e=0;for(let n=0,i=this.curves.length;n<i;n++)e+=this.curves[n].getLength(),t.push(e);return this.cacheLengths=t,t}getSpacedPoints(t=40){let e=[];for(let n=0;n<=t;n++)e.push(this.getPoint(n/t));if(this.autoClose)e.push(e[0]);return e}getPoints(t=12){let e=[],n;for(let i=0,s=this.curves;i<s.length;i++){let r=s[i],a=r.isEllipseCurve?t*2:r.isLineCurve||r.isLineCurve3?1:r.isSplineCurve?t*r.points.length:t,o=r.getPoints(a);for(let l=0;l<o.length;l++){let c=o[l];if(n&&n.equals(c))continue;e.push(c),n=c}}if(this.autoClose&&e.length>1&&!e[e.length-1].equals(e[0]))e.push(e[0]);return e}copy(t){super.copy(t),this.curves=[];for(let e=0,n=t.curves.length;e<n;e++){let i=t.curves[e];this.curves.push(i.clone())}return this.autoClose=t.autoClose,this}toJSON(){let t=super.toJSON();t.autoClose=this.autoClose,t.curves=[];for(let e=0,n=this.curves.length;e<n;e++){let i=this.curves[e];t.curves.push(i.toJSON())}return t}fromJSON(t){super.fromJSON(t),this.autoClose=t.autoClose,this.curves=[];for(let e=0,n=t.curves.length;e<n;e++){let i=t.curves[e];this.curves.push(new Hs[i.type]().fromJSON(i))}return this}}class Vs extends Co{constructor(t){super();if(this.type="Path",this.currentPoint=new lt,t)this.setFromPoints(t)}setFromPoints(t){this.moveTo(t[0].x,t[0].y);for(let e=1,n=t.length;e<n;e++)this.lineTo(t[e].x,t[e].y);return this}moveTo(t,e){return this.currentPoint.set(t,e),this}lineTo(t,e){let n=new mr(this.currentPoint.clone(),new lt(t,e));return this.curves.push(n),this.currentPoint.set(t,e),this}quadraticCurveTo(t,e,n,i){let s=new gr(this.currentPoint.clone(),new lt(t,e),new lt(n,i));return this.curves.push(s),this.currentPoint.set(n,i),this}bezierCurveTo(t,e,n,i,s,r){let a=new pr(this.currentPoint.clone(),new lt(t,e),new lt(n,i),new lt(s,r));return this.curves.push(a),this.currentPoint.set(s,r),this}splineThru(t){let e=[this.currentPoint.clone()].concat(t),n=new xr(e);return this.curves.push(n),this.currentPoint.copy(t[t.length-1]),this}arc(t,e,n,i,s,r){let a=this.currentPoint.x,o=this.currentPoint.y;return this.absarc(t+a,e+o,n,i,s,r),this}absarc(t,e,n,i,s,r){return this.absellipse(t,e,n,n,i,s,r),this}ellipse(t,e,n,i,s,r,a,o){let l=this.currentPoint.x,c=this.currentPoint.y;return this.absellipse(t+l,e+c,n,i,s,r,a,o),this}absellipse(t,e,n,i,s,r,a,o){let l=new cs(t,e,n,i,s,r,a,o);if(this.curves.length>0){let u=l.getPoint(0);if(!u.equals(this.currentPoint))this.lineTo(u.x,u.y)}this.curves.push(l);let c=l.getPoint(1);return this.currentPoint.copy(c),this}copy(t){return super.copy(t),this.currentPoint.copy(t.currentPoint),this}toJSON(){let t=super.toJSON();return t.currentPoint=this.currentPoint.toArray(),t}fromJSON(t){return super.fromJSON(t),this.currentPoint.fromArray(t.currentPoint),this}}class vr extends Vs{constructor(t){super(t);this.uuid=xn(),this.type="Shape",this.holes=[]}getPointsHoles(t){let e=[];for(let n=0,i=this.holes.length;n<i;n++)e[n]=this.holes[n].getPoints(t);return e}extractPoints(t){return{shape:this.getPoints(t),holes:this.getPointsHoles(t)}}copy(t){super.copy(t),this.holes=[];for(let e=0,n=t.holes.length;e<n;e++){let i=t.holes[e];this.holes.push(i.clone())}return this}toJSON(){let t=super.toJSON();t.uuid=this.uuid,t.holes=[];for(let e=0,n=this.holes.length;e<n;e++){let i=this.holes[e];t.holes.push(i.toJSON())}return t}fromJSON(t){super.fromJSON(t),this.uuid=t.uuid,this.holes=[];for(let e=0,n=t.holes.length;e<n;e++){let i=t.holes[e];this.holes.push(new Vs().fromJSON(i))}return this}}function vu(t,e,n=2){let i=e&&e.length,s=i?e[0]*n:t.length,r=Yc(t,0,s,n,!0),a=[];if(!r||r.next===r.prev)return a;let o,l,c;if(i)r=Tu(t,e,r,n);if(t.length>80*n){o=t[0],l=t[1];let u=o,f=l;for(let h=n;h<s;h+=n){let m=t[h],v=t[h+1];if(m<o)o=m;if(v<l)l=v;if(m>u)u=m;if(v>f)f=v}c=Math.max(u-o,f-l),c=c!==0?32767/c:0}return Yi(r,a,n,o,l,c,0),a}function Yc(t,e,n,i,s){let r;if(s===Uu(t,e,n,i)>0)for(let a=e;a<n;a+=i)r=zl(a/i|0,t[a],t[a+1],r);else for(let a=n-i;a>=e;a-=i)r=zl(a/i|0,t[a],t[a+1],r);if(r&&Ti(r,r.next))Ji(r),r=r.next;return r}function kn(t,e){if(!t)return t;if(!e)e=t;let n=t,i;do if(i=!1,!n.steiner&&(Ti(n,n.next)||_e(n.prev,n,n.next)===0)){if(Ji(n),n=e=n.prev,n===n.next)break;i=!0}else n=n.next;while(i||n!==e);return e}function Yi(t,e,n,i,s,r,a){if(!t)return;if(!a&&r)Ru(t,i,s,r);let o=t;while(t.prev!==t.next){let l=t.prev,c=t.next;if(r?Su(t,i,s,r):yu(t)){e.push(l.i,t.i,c.i),Ji(t),t=c.next,o=c.next;continue}if(t=c,t===o){if(!a)Yi(kn(t),e,n,i,s,r,1);else if(a===1)t=Mu(kn(t),e),Yi(t,e,n,i,s,r,2);else if(a===2)bu(t,e,n,i,s,r);break}}}function yu(t){let e=t.prev,n=t,i=t.next;if(_e(e,n,i)>=0)return!1;let s=e.x,r=n.x,a=i.x,o=e.y,l=n.y,c=i.y,u=Math.min(s,r,a),f=Math.min(o,l,c),h=Math.max(s,r,a),m=Math.max(o,l,c),v=i.next;while(v!==e){if(v.x>=u&&v.x<=h&&v.y>=f&&v.y<=m&&ki(s,o,r,l,a,c,v.x,v.y)&&_e(v.prev,v,v.next)>=0)return!1;v=v.next}return!0}function Su(t,e,n,i){let s=t.prev,r=t,a=t.next;if(_e(s,r,a)>=0)return!1;let o=s.x,l=r.x,c=a.x,u=s.y,f=r.y,h=a.y,m=Math.min(o,l,c),v=Math.min(u,f,h),T=Math.max(o,l,c),p=Math.max(u,f,h),d=la(m,v,e,n,i),E=la(T,p,e,n,i),{prevZ:A,nextZ:x}=t;while(A&&A.z>=d&&x&&x.z<=E){if(A.x>=m&&A.x<=T&&A.y>=v&&A.y<=p&&A!==s&&A!==a&&ki(o,u,l,f,c,h,A.x,A.y)&&_e(A.prev,A,A.next)>=0)return!1;if(A=A.prevZ,x.x>=m&&x.x<=T&&x.y>=v&&x.y<=p&&x!==s&&x!==a&&ki(o,u,l,f,c,h,x.x,x.y)&&_e(x.prev,x,x.next)>=0)return!1;x=x.nextZ}while(A&&A.z>=d){if(A.x>=m&&A.x<=T&&A.y>=v&&A.y<=p&&A!==s&&A!==a&&ki(o,u,l,f,c,h,A.x,A.y)&&_e(A.prev,A,A.next)>=0)return!1;A=A.prevZ}while(x&&x.z<=E){if(x.x>=m&&x.x<=T&&x.y>=v&&x.y<=p&&x!==s&&x!==a&&ki(o,u,l,f,c,h,x.x,x.y)&&_e(x.prev,x,x.next)>=0)return!1;x=x.nextZ}return!0}function Mu(t,e){let n=t;do{let i=n.prev,s=n.next.next;if(!Ti(i,s)&&Jc(i,n,n.next,s)&&Zi(i,s)&&Zi(s,i))e.push(i.i,n.i,s.i),Ji(n),Ji(n.next),n=t=s;n=n.next}while(n!==t);return kn(n)}function bu(t,e,n,i,s,r){let a=t;do{let o=a.next.next;while(o!==a.prev){if(a.i!==o.i&&Lu(a,o)){let l=$c(a,o);a=kn(a,a.next),l=kn(l,l.next),Yi(a,e,n,i,s,r,0),Yi(l,e,n,i,s,r,0);return}o=o.next}a=a.next}while(a!==t)}function Tu(t,e,n,i){let s=[];for(let r=0,a=e.length;r<a;r++){let o=e[r]*i,l=r<a-1?e[r+1]*i:t.length,c=Yc(t,o,l,i,!1);if(c===c.next)c.steiner=!0;s.push(Pu(c))}s.sort(Eu);for(let r=0;r<s.length;r++)n=Au(s[r],n);return n}function Eu(t,e){let n=t.x-e.x;if(n===0){if(n=t.y-e.y,n===0){let i=(t.next.y-t.y)/(t.next.x-t.x),s=(e.next.y-e.y)/(e.next.x-e.x);n=i-s}}return n}function Au(t,e){let n=wu(t,e);if(!n)return e;let i=$c(n,t);return kn(i,i.next),kn(n,n.next)}function wu(t,e){let n=e,{x:i,y:s}=t,r=-1/0,a;if(Ti(t,n))return n;do{if(Ti(t,n.next))return n.next;else if(s<=n.y&&s>=n.next.y&&n.next.y!==n.y){let f=n.x+(s-n.y)*(n.next.x-n.x)/(n.next.y-n.y);if(f<=i&&f>r){if(r=f,a=n.x<n.next.x?n:n.next,f===i)return a}}n=n.next}while(n!==e);if(!a)return null;let o=a,l=a.x,c=a.y,u=1/0;n=a;do{if(i>=n.x&&n.x>=l&&i!==n.x&&Zc(s<c?i:r,s,l,c,s<c?r:i,s,n.x,n.y)){let f=Math.abs(s-n.y)/(i-n.x);if(Zi(n,t)&&(f<u||f===u&&(n.x>a.x||n.x===a.x&&Cu(a,n))))a=n,u=f}n=n.next}while(n!==o);return a}function Cu(t,e){return _e(t.prev,t,e.prev)<0&&_e(e.next,t,t.next)<0}function Ru(t,e,n,i){let s=t;do{if(s.z===0)s.z=la(s.x,s.y,e,n,i);s.prevZ=s.prev,s.nextZ=s.next,s=s.next}while(s!==t);s.prevZ.nextZ=null,s.prevZ=null,Iu(s)}function Iu(t){let e,n=1;do{let i=t,s;t=null;let r=null;e=0;while(i){e++;let a=i,o=0;for(let c=0;c<n;c++)if(o++,a=a.nextZ,!a)break;let l=n;while(o>0||l>0&&a){if(o!==0&&(l===0||!a||i.z<=a.z))s=i,i=i.nextZ,o--;else s=a,a=a.nextZ,l--;if(r)r.nextZ=s;else t=s;s.prevZ=r,r=s}i=a}r.nextZ=null,n*=2}while(e>1);return t}function la(t,e,n,i,s){return t=(t-n)*s|0,e=(e-i)*s|0,t=(t|t<<8)&16711935,t=(t|t<<4)&252645135,t=(t|t<<2)&858993459,t=(t|t<<1)&1431655765,e=(e|e<<8)&16711935,e=(e|e<<4)&252645135,e=(e|e<<2)&858993459,e=(e|e<<1)&1431655765,t|e<<1}function Pu(t){let e=t,n=t;do{if(e.x<n.x||e.x===n.x&&e.y<n.y)n=e;e=e.next}while(e!==t);return n}function Zc(t,e,n,i,s,r,a,o){return(s-a)*(e-o)>=(t-a)*(r-o)&&(t-a)*(i-o)>=(n-a)*(e-o)&&(n-a)*(r-o)>=(s-a)*(i-o)}function ki(t,e,n,i,s,r,a,o){return!(t===a&&e===o)&&Zc(t,e,n,i,s,r,a,o)}function Lu(t,e){return t.next.i!==e.i&&t.prev.i!==e.i&&!Nu(t,e)&&(Zi(t,e)&&Zi(e,t)&&Du(t,e)&&(_e(t.prev,t,e.prev)||_e(t,e.prev,e))||Ti(t,e)&&_e(t.prev,t,t.next)>0&&_e(e.prev,e,e.next)>0)}function _e(t,e,n){return(e.y-t.y)*(n.x-e.x)-(e.x-t.x)*(n.y-e.y)}function Ti(t,e){return t.x===e.x&&t.y===e.y}function Jc(t,e,n,i){let s=Bs(_e(t,e,n)),r=Bs(_e(t,e,i)),a=Bs(_e(n,i,t)),o=Bs(_e(n,i,e));if(s!==r&&a!==o)return!0;if(s===0&&Os(t,n,e))return!0;if(r===0&&Os(t,i,e))return!0;if(a===0&&Os(n,t,i))return!0;if(o===0&&Os(n,e,i))return!0;return!1}function Os(t,e,n){return e.x<=Math.max(t.x,n.x)&&e.x>=Math.min(t.x,n.x)&&e.y<=Math.max(t.y,n.y)&&e.y>=Math.min(t.y,n.y)}function Bs(t){return t>0?1:t<0?-1:0}function Nu(t,e){let n=t;do{if(n.i!==t.i&&n.next.i!==t.i&&n.i!==e.i&&n.next.i!==e.i&&Jc(n,n.next,t,e))return!0;n=n.next}while(n!==t);return!1}function Zi(t,e){return _e(t.prev,t,t.next)<0?_e(t,e,t.next)>=0&&_e(t,t.prev,e)>=0:_e(t,e,t.prev)<0||_e(t,t.next,e)<0}function Du(t,e){let n=t,i=!1,s=(t.x+e.x)/2,r=(t.y+e.y)/2;do{if(n.y>r!==n.next.y>r&&n.next.y!==n.y&&s<(n.next.x-n.x)*(r-n.y)/(n.next.y-n.y)+n.x)i=!i;n=n.next}while(n!==t);return i}function $c(t,e){let n=ca(t.i,t.x,t.y),i=ca(e.i,e.x,e.y),s=t.next,r=e.prev;return t.next=e,e.prev=t,n.next=s,s.prev=n,i.next=n,n.prev=i,r.next=i,i.prev=r,i}function zl(t,e,n,i){let s=ca(t,e,n);if(!i)s.prev=s,s.next=s;else s.next=i.next,s.prev=i,i.next.prev=s,i.next=s;return s}function Ji(t){if(t.next.prev=t.prev,t.prev.next=t.next,t.prevZ)t.prevZ.nextZ=t.nextZ;if(t.nextZ)t.nextZ.prevZ=t.prevZ}function ca(t,e,n){return{i:t,x:e,y:n,prev:null,next:null,z:0,prevZ:null,nextZ:null,steiner:!1}}function Uu(t,e,n,i){let s=0;for(let r=e,a=n-i;r<n;r+=i)s+=(t[a]-t[r])*(t[r+1]+t[a+1]),a=r;return s}class Kc{static triangulate(t,e,n=2){return vu(t,e,n)}}class zn{static area(t){let e=t.length,n=0;for(let i=e-1,s=0;s<e;i=s++)n+=t[i].x*t[s].y-t[s].x*t[i].y;return n*0.5}static isClockWise(t){return zn.area(t)<0}static triangulateShape(t,e){let n=[],i=[],s=[];Gl(t),kl(n,t);let r=t.length;e.forEach(Gl);for(let o=0;o<e.length;o++)i.push(r),r+=e[o].length,kl(n,e[o]);let a=Kc.triangulate(n,i);for(let o=0;o<a.length;o+=3)s.push(a.slice(o,o+3));return s}}function Gl(t){let e=t.length;if(e>2&&t[e-1].equals(t[0]))t.pop()}function kl(t,e){for(let n=0;n<e.length;n++)t.push(e[n].x),t.push(e[n].y)}class yr extends ve{constructor(t=new vr([new lt(0.5,0.5),new lt(-0.5,0.5),new lt(-0.5,-0.5),new lt(0.5,-0.5)]),e={}){super();this.type="ExtrudeGeometry",this.parameters={shapes:t,options:e},t=Array.isArray(t)?t:[t];let n=this,i=[],s=[];for(let a=0,o=t.length;a<o;a++){let l=t[a];r(l)}this.setAttribute("position",new jt(i,3)),this.setAttribute("uv",new jt(s,2)),this.computeVertexNormals();function r(a){let o=[],l=e.curveSegments!==void 0?e.curveSegments:12,c=e.steps!==void 0?e.steps:1,u=e.depth!==void 0?e.depth:1,f=e.bevelEnabled!==void 0?e.bevelEnabled:!0,h=e.bevelThickness!==void 0?e.bevelThickness:0.2,m=e.bevelSize!==void 0?e.bevelSize:h-0.1,v=e.bevelOffset!==void 0?e.bevelOffset:0,T=e.bevelSegments!==void 0?e.bevelSegments:3,p=e.extrudePath,d=e.UVGenerator!==void 0?e.UVGenerator:Fu,E,A=!1,x,b,C,w;if(p){E=p.getSpacedPoints(c),A=!0,f=!1;let j=p.isCatmullRomCurve3?p.closed:!1;x=p.computeFrenetFrames(c,j),b=new P,C=new P,w=new P}if(!f)T=0,h=0,m=0,v=0;let g=a.extractPoints(l),{shape:S,holes:O}=g;if(!zn.isClockWise(S)){S=S.reverse();for(let j=0,it=O.length;j<it;j++){let at=O[j];if(zn.isClockWise(at))O[j]=at.reverse()}}function F(j){let ct=j[0];for(let vt=1;vt<=j.length;vt++){let Rt=vt%j.length,Dt=j[Rt],kt=Dt.x-ct.x,Ht=Dt.y-ct.y,R=kt*kt+Ht*Ht,oe=Math.max(Math.abs(Dt.x),Math.abs(Dt.y),Math.abs(ct.x),Math.abs(ct.y)),Yt=0.000000000000000000010000000000000001*oe*oe;if(R<=Yt){j.splice(Rt,1),vt--;continue}ct=Dt}}F(S),O.forEach(F);let Z=O.length,I=S;for(let j=0;j<Z;j++){let it=O[j];S=S.concat(it)}function G(j,it,at){if(!it)Bt("ExtrudeGeometry: vec does not exist");return j.clone().addScaledVector(it,at)}let J=S.length;function k(j,it,at){let ct,vt,Rt,Dt=j.x-it.x,kt=j.y-it.y,Ht=at.x-j.x,R=at.y-j.y,oe=Dt*Dt+kt*kt,Yt=Dt*R-kt*Ht;if(Math.abs(Yt)>Number.EPSILON){let Jt=Math.sqrt(oe),M=Math.sqrt(Ht*Ht+R*R),_=it.x-kt/Jt,L=it.y+Dt/Jt,H=at.x-R/M,tt=at.y+Ht/M,ht=((H-_)*R-(tt-L)*Ht)/(Dt*R-kt*Ht);ct=_+Dt*ht-j.x,vt=L+kt*ht-j.y;let dt=ct*ct+vt*vt;if(dt<=2)return new lt(ct,vt);else Rt=Math.sqrt(dt/2)}else{let Jt=!1;if(Dt>Number.EPSILON){if(Ht>Number.EPSILON)Jt=!0}else if(Dt<-Number.EPSILON){if(Ht<-Number.EPSILON)Jt=!0}else if(Math.sign(kt)===Math.sign(R))Jt=!0;if(Jt)ct=-kt,vt=Dt,Rt=Math.sqrt(oe);else ct=Dt,vt=kt,Rt=Math.sqrt(oe/2)}return new lt(ct/Rt,vt/Rt)}let rt=[];for(let j=0,it=I.length,at=it-1,ct=j+1;j<it;j++,at++,ct++){if(at===it)at=0;if(ct===it)ct=0;rt[j]=k(I[j],I[at],I[ct])}let W=[],Q,nt=rt.concat();for(let j=0,it=Z;j<it;j++){let at=O[j];Q=[];for(let ct=0,vt=at.length,Rt=vt-1,Dt=ct+1;ct<vt;ct++,Rt++,Dt++){if(Rt===vt)Rt=0;if(Dt===vt)Dt=0;Q[ct]=k(at[ct],at[Rt],at[Dt])}W.push(Q),nt=nt.concat(Q)}let Pt;if(T===0)Pt=zn.triangulateShape(I,O);else{let j=[],it=[];for(let at=0;at<T;at++){let ct=at/T,vt=h*Math.cos(ct*Math.PI/2),Rt=m*Math.sin(ct*Math.PI/2)+v;for(let Dt=0,kt=I.length;Dt<kt;Dt++){let Ht=G(I[Dt],rt[Dt],Rt);if(st(Ht.x,Ht.y,-vt),ct===0)j.push(Ht)}for(let Dt=0,kt=Z;Dt<kt;Dt++){let Ht=O[Dt];Q=W[Dt];let R=[];for(let oe=0,Yt=Ht.length;oe<Yt;oe++){let Jt=G(Ht[oe],Q[oe],Rt);if(st(Jt.x,Jt.y,-vt),ct===0)R.push(Jt)}if(ct===0)it.push(R)}}Pt=zn.triangulateShape(j,it)}let Lt=Pt.length,se=m+v;for(let j=0;j<J;j++){let it=f?G(S[j],nt[j],se):S[j];if(!A)st(it.x,it.y,0);else C.copy(x.normals[0]).multiplyScalar(it.x),b.copy(x.binormals[0]).multiplyScalar(it.y),w.copy(E[0]).add(C).add(b),st(w.x,w.y,w.z)}for(let j=1;j<=c;j++)for(let it=0;it<J;it++){let at=f?G(S[it],nt[it],se):S[it];if(!A)st(at.x,at.y,u/c*j);else C.copy(x.normals[j]).multiplyScalar(at.x),b.copy(x.binormals[j]).multiplyScalar(at.y),w.copy(E[j]).add(C).add(b),st(w.x,w.y,w.z)}for(let j=T-1;j>=0;j--){let it=j/T,at=h*Math.cos(it*Math.PI/2),ct=m*Math.sin(it*Math.PI/2)+v;for(let vt=0,Rt=I.length;vt<Rt;vt++){let Dt=G(I[vt],rt[vt],ct);st(Dt.x,Dt.y,u+at)}for(let vt=0,Rt=O.length;vt<Rt;vt++){let Dt=O[vt];Q=W[vt];for(let kt=0,Ht=Dt.length;kt<Ht;kt++){let R=G(Dt[kt],Q[kt],ct);if(!A)st(R.x,R.y,u+at);else st(R.x,R.y+E[c-1].y,E[c-1].x+at)}}}Wt(),q();function Wt(){let j=i.length/3;if(f){let it=0,at=J*it;for(let ct=0;ct<Lt;ct++){let vt=Pt[ct];Nt(vt[2]+at,vt[1]+at,vt[0]+at)}it=c+T*2,at=J*it;for(let ct=0;ct<Lt;ct++){let vt=Pt[ct];Nt(vt[0]+at,vt[1]+at,vt[2]+at)}}else{for(let it=0;it<Lt;it++){let at=Pt[it];Nt(at[2],at[1],at[0])}for(let it=0;it<Lt;it++){let at=Pt[it];Nt(at[0]+J*c,at[1]+J*c,at[2]+J*c)}}n.addGroup(j,i.length/3-j,0)}function q(){let j=i.length/3,it=0;ot(I,it),it+=I.length;for(let at=0,ct=O.length;at<ct;at++){let vt=O[at];ot(vt,it),it+=vt.length}n.addGroup(j,i.length/3-j,1)}function ot(j,it){let at=j.length;while(--at>=0){let ct=at,vt=at-1;if(vt<0)vt=j.length-1;for(let Rt=0,Dt=c+T*2;Rt<Dt;Rt++){let kt=J*Rt,Ht=J*(Rt+1),R=it+ct+kt,oe=it+vt+kt,Yt=it+vt+Ht,Jt=it+ct+Ht;Ft(R,oe,Yt,Jt)}}}function st(j,it,at){o.push(j),o.push(it),o.push(at)}function Nt(j,it,at){Et(j),Et(it),Et(at);let ct=i.length/3,vt=d.generateTopUV(n,i,ct-3,ct-2,ct-1);re(vt[0]),re(vt[1]),re(vt[2])}function Ft(j,it,at,ct){Et(j),Et(it),Et(ct),Et(it),Et(at),Et(ct);let vt=i.length/3,Rt=d.generateSideWallUV(n,i,vt-6,vt-3,vt-2,vt-1);re(Rt[0]),re(Rt[1]),re(Rt[3]),re(Rt[1]),re(Rt[2]),re(Rt[3])}function Et(j){i.push(o[j*3+0]),i.push(o[j*3+1]),i.push(o[j*3+2])}function re(j){s.push(j.x),s.push(j.y)}}}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}toJSON(){let t=super.toJSON(),e=this.parameters.shapes,n=this.parameters.options;return Ou(e,n,t)}static fromJSON(t,e){let n=[];for(let s=0,r=t.shapes.length;s<r;s++){let a=e[t.shapes[s]];n.push(a)}let i=t.options.extrudePath;if(i!==void 0)t.options.extrudePath=new Hs[i.type]().fromJSON(i);return new yr(n,t.options)}}var Fu={generateTopUV:function(t,e,n,i,s){let r=e[n*3],a=e[n*3+1],o=e[i*3],l=e[i*3+1],c=e[s*3],u=e[s*3+1];return[new lt(r,a),new lt(o,l),new lt(c,u)]},generateSideWallUV:function(t,e,n,i,s,r){let a=e[n*3],o=e[n*3+1],l=e[n*3+2],c=e[i*3],u=e[i*3+1],f=e[i*3+2],h=e[s*3],m=e[s*3+1],v=e[s*3+2],T=e[r*3],p=e[r*3+1],d=e[r*3+2];if(Math.abs(o-u)<Math.abs(a-c))return[new lt(a,1-l),new lt(c,1-f),new lt(h,1-v),new lt(T,1-d)];else return[new lt(o,1-l),new lt(u,1-f),new lt(m,1-v),new lt(p,1-d)]}};function Ou(t,e,n){if(n.shapes=[],Array.isArray(t))for(let i=0,s=t.length;i<s;i++){let r=t[i];n.shapes.push(r.uuid)}else n.shapes.push(t.uuid);if(n.options=Object.assign({},e),e.extrudePath!==void 0)n.options.extrudePath=e.extrudePath.toJSON();return n}class Sr extends dr{constructor(t=1,e=0){let n=(1+Math.sqrt(5))/2,i=[-1,n,0,1,n,0,-1,-n,0,1,-n,0,0,-1,n,0,1,n,0,-1,-n,0,1,-n,n,0,-1,n,0,1,-n,0,-1,-n,0,1],s=[0,11,5,0,5,1,0,1,7,0,7,10,0,10,11,1,5,9,5,11,4,11,10,2,10,7,6,7,1,8,3,9,4,3,4,2,3,2,6,3,6,8,3,8,9,4,9,5,2,4,11,6,2,10,8,6,7,9,8,1];super(i,s,t,e);this.type="IcosahedronGeometry",this.parameters={radius:t,detail:e}}static fromJSON(t){return new Sr(t.radius,t.detail)}}class Ri extends ve{constructor(t=1,e=1,n=1,i=1){super();this.type="PlaneGeometry",this.parameters={width:t,height:e,widthSegments:n,heightSegments:i};let s=t/2,r=e/2,a=Math.floor(n),o=Math.floor(i),l=a+1,c=o+1,u=t/a,f=e/o,h=[],m=[],v=[],T=[];for(let p=0;p<c;p++){let d=p*f-r;for(let E=0;E<l;E++){let A=E*u-s;m.push(A,-d,0),v.push(0,0,1),T.push(E/a),T.push(1-p/o)}}for(let p=0;p<o;p++)for(let d=0;d<a;d++){let E=d+l*p,A=d+l*(p+1),x=d+1+l*(p+1),b=d+1+l*p;h.push(E,A,b),h.push(A,x,b)}this.setIndex(h),this.setAttribute("position",new jt(m,3)),this.setAttribute("normal",new jt(v,3)),this.setAttribute("uv",new jt(T,2))}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new Ri(t.width,t.height,t.widthSegments,t.heightSegments)}}class Mr extends ve{constructor(t=0.5,e=1,n=32,i=1,s=0,r=Math.PI*2){super();this.type="RingGeometry",this.parameters={innerRadius:t,outerRadius:e,thetaSegments:n,phiSegments:i,thetaStart:s,thetaLength:r},n=Math.max(3,n),i=Math.max(1,i);let a=[],o=[],l=[],c=[],u=t,f=(e-t)/i,h=new P,m=new lt;for(let v=0;v<=i;v++){for(let T=0;T<=n;T++){let p=s+T/n*r;h.x=u*Math.cos(p),h.y=u*Math.sin(p),o.push(h.x,h.y,h.z),l.push(0,0,1),m.x=(h.x/e+1)/2,m.y=(h.y/e+1)/2,c.push(m.x,m.y)}u+=f}for(let v=0;v<i;v++){let T=v*(n+1);for(let p=0;p<n;p++){let d=p+T,E=d,A=d+n+1,x=d+n+2,b=d+1;a.push(E,A,b),a.push(A,x,b)}}this.setIndex(a),this.setAttribute("position",new jt(o,3)),this.setAttribute("normal",new jt(l,3)),this.setAttribute("uv",new jt(c,2))}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new Mr(t.innerRadius,t.outerRadius,t.thetaSegments,t.phiSegments,t.thetaStart,t.thetaLength)}}class br extends ve{constructor(t=1,e=32,n=16,i=0,s=Math.PI*2,r=0,a=Math.PI){super();this.type="SphereGeometry",this.parameters={radius:t,widthSegments:e,heightSegments:n,phiStart:i,phiLength:s,thetaStart:r,thetaLength:a},e=Math.max(3,Math.floor(e)),n=Math.max(2,Math.floor(n));let o=Math.min(r+a,Math.PI),l=0,c=[],u=new P,f=new P,h=[],m=[],v=[],T=[];for(let p=0;p<=n;p++){let d=[],E=p/n,A=r+E*a,x=t*Math.cos(A),b=Math.sqrt(t*t-x*x),C=0;if(p===0&&r===0)C=0.5/e;else if(p===n&&o===Math.PI)C=-0.5/e;for(let w=0;w<=e;w++){let g=w/e,S=i+g*s;u.x=-b*Math.cos(S),u.y=x,u.z=b*Math.sin(S),m.push(u.x,u.y,u.z),f.copy(u).normalize(),v.push(f.x,f.y,f.z),T.push(g+C,1-E),d.push(l++)}c.push(d)}for(let p=0;p<n;p++)for(let d=0;d<e;d++){let E=c[p][d+1],A=c[p][d],x=c[p+1][d],b=c[p+1][d+1];if(p!==0||r>0)h.push(E,A,b);if(p!==n-1||o<Math.PI)h.push(A,x,b)}this.setIndex(h),this.setAttribute("position",new jt(m,3)),this.setAttribute("normal",new jt(v,3)),this.setAttribute("uv",new jt(T,2))}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new br(t.radius,t.widthSegments,t.heightSegments,t.phiStart,t.phiLength,t.thetaStart,t.thetaLength)}}class Tr extends ve{constructor(t=1,e=0.4,n=12,i=48,s=Math.PI*2,r=0,a=Math.PI*2){super();this.type="TorusGeometry",this.parameters={radius:t,tube:e,radialSegments:n,tubularSegments:i,arc:s,thetaStart:r,thetaLength:a},n=Math.floor(n),i=Math.floor(i);let o=[],l=[],c=[],u=[],f=new P,h=new P,m=new P;for(let v=0;v<=n;v++){let T=r+v/n*a;for(let p=0;p<=i;p++){let d=p/i*s;h.x=(t+e*Math.cos(T))*Math.cos(d),h.y=(t+e*Math.cos(T))*Math.sin(d),h.z=e*Math.sin(T),l.push(h.x,h.y,h.z),f.x=t*Math.cos(d),f.y=t*Math.sin(d),m.subVectors(h,f).normalize(),c.push(m.x,m.y,m.z),u.push(p/i),u.push(v/n)}}for(let v=1;v<=n;v++)for(let T=1;T<=i;T++){let p=(i+1)*v+T-1,d=(i+1)*(v-1)+T-1,E=(i+1)*(v-1)+T,A=(i+1)*v+T;o.push(p,d,A),o.push(d,E,A)}this.setIndex(o),this.setAttribute("position",new jt(l,3)),this.setAttribute("normal",new jt(c,3)),this.setAttribute("uv",new jt(u,2))}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new Tr(t.radius,t.tube,t.radialSegments,t.tubularSegments,t.arc,t.thetaStart,t.thetaLength)}}class Er extends ve{constructor(t=new _r(new P(-1,-1,0),new P(-1,1,0),new P(1,1,0)),e=64,n=1,i=8,s=!1){super();this.type="TubeGeometry",this.parameters={path:t,tubularSegments:e,radius:n,radialSegments:i,closed:s};let r=t.computeFrenetFrames(e,s);this.tangents=r.tangents,this.normals=r.normals,this.binormals=r.binormals;let a=new P,o=new P,l=new lt,c=new P,u=[],f=[],h=[],m=[];v(),this.setIndex(m),this.setAttribute("position",new jt(u,3)),this.setAttribute("normal",new jt(f,3)),this.setAttribute("uv",new jt(h,2));function v(){for(let E=0;E<e;E++)T(E);T(s===!1?e:0),d(),p()}function T(E){c=t.getPointAt(E/e,c);let A=r.normals[E],x=r.binormals[E];for(let b=0;b<=i;b++){let C=b/i*Math.PI*2,w=Math.sin(C),g=-Math.cos(C);o.x=g*A.x+w*x.x,o.y=g*A.y+w*x.y,o.z=g*A.z+w*x.z,o.normalize(),f.push(o.x,o.y,o.z),a.x=c.x+n*o.x,a.y=c.y+n*o.y,a.z=c.z+n*o.z,u.push(a.x,a.y,a.z)}}function p(){for(let E=1;E<=e;E++)for(let A=1;A<=i;A++){let x=(i+1)*(E-1)+(A-1),b=(i+1)*E+(A-1),C=(i+1)*E+A,w=(i+1)*(E-1)+A;m.push(x,b,w),m.push(b,C,w)}}function d(){for(let E=0;E<=e;E++)for(let A=0;A<=i;A++)l.x=E/e,l.y=A/i,h.push(l.x,l.y)}}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}toJSON(){let t=super.toJSON();return t.path=this.parameters.path.toJSON(),t}static fromJSON(t){return new Er(new Hs[t.path.type]().fromJSON(t.path),t.tubularSegments,t.radius,t.radialSegments,t.closed)}}function Qn(t){let e={};for(let n in t){e[n]={};for(let i in t[n]){let s=t[n][i];if(Hl(s))if(s.isRenderTargetTexture)zt("UniformsUtils: Textures of render targets cannot be cloned via cloneUniforms() or mergeUniforms()."),e[n][i]=null;else e[n][i]=s.clone();else if(Array.isArray(s))if(Hl(s[0])){let r=[];for(let a=0,o=s.length;a<o;a++)r[a]=s[a].clone();e[n][i]=r}else e[n][i]=s.slice();else e[n][i]=s}}return e}function Ie(t){let e={};for(let n=0;n<t.length;n++){let i=Qn(t[n]);for(let s in i)e[s]=i[s]}return e}function Hl(t){return t&&(t.isColor||t.isMatrix3||t.isMatrix4||t.isVector2||t.isVector3||t.isVector4||t.isTexture||t.isQuaternion)}function Bu(t){let e=[];for(let n=0;n<t.length;n++)e.push(t[n].clone());return e}function Ro(t){let e=t.getRenderTarget();if(e===null)return t.outputColorSpace;if(e.isXRRenderTarget===!0)return e.texture.colorSpace;return Kt.workingColorSpace}var Qc={clone:Qn,merge:Ie},zu=`void main() {
	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}`,Gu=`void main() {
	gl_FragColor = vec4( 1.0, 0.0, 0.0, 1.0 );
}`;class ke extends Ln{constructor(t){super();if(this.isShaderMaterial=!0,this.type="ShaderMaterial",this.defines={},this.uniforms={},this.uniformsGroups=[],this.vertexShader=zu,this.fragmentShader=Gu,this.linewidth=1,this.wireframe=!1,this.wireframeLinewidth=1,this.fog=!1,this.lights=!1,this.clipping=!1,this.forceSinglePass=!0,this.extensions={clipCullDistance:!1,multiDraw:!1},this.defaultAttributeValues={color:[1,1,1],uv:[0,0],uv1:[0,0]},this.index0AttributeName=void 0,this.uniformsNeedUpdate=!1,this.glslVersion=null,t!==void 0)this.setValues(t)}copy(t){return super.copy(t),this.fragmentShader=t.fragmentShader,this.vertexShader=t.vertexShader,this.uniforms=Qn(t.uniforms),this.uniformsGroups=Bu(t.uniformsGroups),this.defines=Object.assign({},t.defines),this.wireframe=t.wireframe,this.wireframeLinewidth=t.wireframeLinewidth,this.fog=t.fog,this.lights=t.lights,this.clipping=t.clipping,this.extensions=Object.assign({},t.extensions),this.glslVersion=t.glslVersion,this.defaultAttributeValues=Object.assign({},t.defaultAttributeValues),this.index0AttributeName=t.index0AttributeName,this.uniformsNeedUpdate=t.uniformsNeedUpdate,this}toJSON(t){let e=super.toJSON(t);e.glslVersion=this.glslVersion,e.uniforms={};for(let i in this.uniforms){let r=this.uniforms[i].value;if(r&&r.isTexture)e.uniforms[i]={type:"t",value:r.toJSON(t).uuid};else if(r&&r.isColor)e.uniforms[i]={type:"c",value:r.getHex()};else if(r&&r.isVector2)e.uniforms[i]={type:"v2",value:r.toArray()};else if(r&&r.isVector3)e.uniforms[i]={type:"v3",value:r.toArray()};else if(r&&r.isVector4)e.uniforms[i]={type:"v4",value:r.toArray()};else if(r&&r.isMatrix3)e.uniforms[i]={type:"m3",value:r.toArray()};else if(r&&r.isMatrix4)e.uniforms[i]={type:"m4",value:r.toArray()};else e.uniforms[i]={value:r}}if(Object.keys(this.defines).length>0)e.defines=this.defines;e.vertexShader=this.vertexShader,e.fragmentShader=this.fragmentShader,e.lights=this.lights,e.clipping=this.clipping;let n={};for(let i in this.extensions)if(this.extensions[i]===!0)n[i]=!0;if(Object.keys(n).length>0)e.extensions=n;return e}fromJSON(t,e){if(super.fromJSON(t,e),t.uniforms!==void 0)for(let n in t.uniforms){let i=t.uniforms[n];switch(this.uniforms[n]={},i.type){case"t":this.uniforms[n].value=e[i.value]||null;break;case"c":this.uniforms[n].value=new Zt().setHex(i.value);break;case"v2":this.uniforms[n].value=new lt().fromArray(i.value);break;case"v3":this.uniforms[n].value=new P().fromArray(i.value);break;case"v4":this.uniforms[n].value=new ge().fromArray(i.value);break;case"m3":this.uniforms[n].value=new Gt().fromArray(i.value);break;case"m4":this.uniforms[n].value=new ue().fromArray(i.value);break;default:this.uniforms[n].value=i.value}}if(t.defines!==void 0)this.defines=t.defines;if(t.vertexShader!==void 0)this.vertexShader=t.vertexShader;if(t.fragmentShader!==void 0)this.fragmentShader=t.fragmentShader;if(t.glslVersion!==void 0)this.glslVersion=t.glslVersion;if(t.extensions!==void 0)for(let n in t.extensions)this.extensions[n]=t.extensions[n];if(t.lights!==void 0)this.lights=t.lights;if(t.clipping!==void 0)this.clipping=t.clipping;return this}}class Io extends ke{constructor(t){super(t);this.isRawShaderMaterial=!0,this.type="RawShaderMaterial"}}class Po extends Ln{constructor(t){super();this.isMeshStandardMaterial=!0,this.type="MeshStandardMaterial",this.defines={STANDARD:""},this.color=new Zt(16777215),this.roughness=1,this.metalness=0,this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.emissive=new Zt(0),this.emissiveIntensity=1,this.emissiveMap=null,this.bumpMap=null,this.bumpScale=1,this.normalMap=null,this.normalMapType=0,this.normalScale=new lt(1,1),this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.roughnessMap=null,this.metalnessMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new on,this.envMapIntensity=1,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.flatShading=!1,this.fog=!0,this.setValues(t)}copy(t){return super.copy(t),this.defines={STANDARD:""},this.color.copy(t.color),this.roughness=t.roughness,this.metalness=t.metalness,this.map=t.map,this.lightMap=t.lightMap,this.lightMapIntensity=t.lightMapIntensity,this.aoMap=t.aoMap,this.aoMapIntensity=t.aoMapIntensity,this.emissive.copy(t.emissive),this.emissiveMap=t.emissiveMap,this.emissiveIntensity=t.emissiveIntensity,this.bumpMap=t.bumpMap,this.bumpScale=t.bumpScale,this.normalMap=t.normalMap,this.normalMapType=t.normalMapType,this.normalScale.copy(t.normalScale),this.displacementMap=t.displacementMap,this.displacementScale=t.displacementScale,this.displacementBias=t.displacementBias,this.roughnessMap=t.roughnessMap,this.metalnessMap=t.metalnessMap,this.alphaMap=t.alphaMap,this.envMap=t.envMap,this.envMapRotation.copy(t.envMapRotation),this.envMapIntensity=t.envMapIntensity,this.wireframe=t.wireframe,this.wireframeLinewidth=t.wireframeLinewidth,this.wireframeLinecap=t.wireframeLinecap,this.wireframeLinejoin=t.wireframeLinejoin,this.flatShading=t.flatShading,this.fog=t.fog,this}}class Lo extends Ln{constructor(t){super();this.isMeshDepthMaterial=!0,this.type="MeshDepthMaterial",this.depthPacking=3200,this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.wireframe=!1,this.wireframeLinewidth=1,this.setValues(t)}copy(t){return super.copy(t),this.depthPacking=t.depthPacking,this.map=t.map,this.alphaMap=t.alphaMap,this.displacementMap=t.displacementMap,this.displacementScale=t.displacementScale,this.displacementBias=t.displacementBias,this.wireframe=t.wireframe,this.wireframeLinewidth=t.wireframeLinewidth,this}}class No extends Ln{constructor(t){super();this.isMeshDistanceMaterial=!0,this.type="MeshDistanceMaterial",this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.setValues(t)}copy(t){return super.copy(t),this.map=t.map,this.alphaMap=t.alphaMap,this.displacementMap=t.displacementMap,this.displacementScale=t.displacementScale,this.displacementBias=t.displacementBias,this}}function vi(t,e){if(!t||t.constructor===e)return t;if(typeof e.BYTES_PER_ELEMENT==="number")return new e(t);return Array.prototype.slice.call(t)}function aa(t){return t!==void 0&&t.inTangents!==void 0&&t.outTangents!==void 0}class jn{constructor(t,e,n,i){this.parameterPositions=t,this._cachedIndex=0,this.resultBuffer=i!==void 0?i:new e.constructor(n),this.sampleValues=e,this.valueSize=n,this.settings=null,this.DefaultSettings_={}}evaluate(t){let e=this.parameterPositions,n=this._cachedIndex,i=e[n],s=e[n-1];n:{t:{let r;e:{i:if(!(t<i)){for(let a=n+2;;){if(i===void 0){if(t<s)break i;return n=e.length,this._cachedIndex=n,this.copySampleValue_(n-1)}if(n===a)break;if(s=i,i=e[++n],t<i)break t}r=e.length;break e}if(!(t>=s)){let a=e[1];if(t<a)n=2,s=a;for(let o=n-2;;){if(s===void 0)return this._cachedIndex=0,this.copySampleValue_(0);if(n===o)break;if(i=s,s=e[--n-1],t>=s)break t}r=n,n=0;break e}break n}while(n<r){let a=n+r>>>1;if(t<e[a])r=a;else n=a+1}if(i=e[n],s=e[n-1],s===void 0)return this._cachedIndex=0,this.copySampleValue_(0);if(i===void 0)return n=e.length,this._cachedIndex=n,this.copySampleValue_(n-1)}this._cachedIndex=n,this.intervalChanged_(n,s,i)}return this.interpolate_(n,s,t,i)}getSettings_(){return this.settings||this.DefaultSettings_}copySampleValue_(t){let e=this.resultBuffer,n=this.sampleValues,i=this.valueSize,s=t*i;for(let r=0;r!==i;++r)e[r]=n[s+r];return e}interpolate_(){throw Error("THREE.Interpolant: Call to abstract method.")}intervalChanged_(){}}class Do extends jn{constructor(t,e,n,i){super(t,e,n,i);this._weightPrev=-0,this._offsetPrev=-0,this._weightNext=-0,this._offsetNext=-0,this.DefaultSettings_={endingStart:2400,endingEnd:2400}}intervalChanged_(t,e,n){let i=this.parameterPositions,s=t-2,r=t+1,a=i[s],o=i[r];if(a===void 0)switch(this.getSettings_().endingStart){case 2401:s=t,a=2*e-n;break;case 2402:s=i.length-2,a=e+i[s]-i[s+1];break;default:s=t,a=n}if(o===void 0)switch(this.getSettings_().endingEnd){case 2401:r=t,o=2*n-e;break;case 2402:r=1,o=n+i[1]-i[0];break;default:r=t-1,o=e}let l=(n-e)*0.5,c=this.valueSize;this._weightPrev=l/(e-a),this._weightNext=l/(o-n),this._offsetPrev=s*c,this._offsetNext=r*c}interpolate_(t,e,n,i){let s=this.resultBuffer,r=this.sampleValues,a=this.valueSize,o=t*a,l=o-a,c=this._offsetPrev,u=this._offsetNext,f=this._weightPrev,h=this._weightNext,m=(n-e)/(i-e),v=m*m,T=v*m,p=-f*T+2*f*v-f*m,d=(1+f)*T+(-1.5-2*f)*v+(-0.5+f)*m+1,E=(-1-h)*T+(1.5+h)*v+0.5*m,A=h*T-h*v;for(let x=0;x!==a;++x)s[x]=p*r[c+x]+d*r[l+x]+E*r[o+x]+A*r[u+x];return s}}class Uo extends jn{constructor(t,e,n,i){super(t,e,n,i)}interpolate_(t,e,n,i){let s=this.resultBuffer,r=this.sampleValues,a=this.valueSize,o=t*a,l=o-a,c=(n-e)/(i-e),u=1-c;for(let f=0;f!==a;++f)s[f]=r[l+f]*u+r[o+f]*c;return s}}class Fo extends jn{constructor(t,e,n,i){super(t,e,n,i)}interpolate_(t){return this.copySampleValue_(t-1)}}class Oo extends jn{interpolate_(t,e,n,i){let s=this.resultBuffer,r=this.sampleValues,a=this.valueSize,o=t*a,l=o-a,c=this.inTangents,u=this.outTangents;if(!c||!u){let m=(n-e)/(i-e),v=1-m;for(let T=0;T!==a;++T)s[T]=r[l+T]*v+r[o+T]*m;return s}let f=a*2,h=t-1;for(let m=0;m!==a;++m){let v=r[l+m],T=r[o+m],p=h*f+m*2,d=u[p],E=u[p+1],A=t*f+m*2,x=c[A],b=c[A+1],C=Hu(n,e,d,x,i);s[m]=jc(C,v,E,b,T)}return s}}function jc(t,e,n,i,s){let r=1-t;return r*r*r*e+3*r*r*t*n+3*r*t*t*i+t*t*t*s}function ku(t,e,n,i,s){let r=1-t;return 3*r*r*(n-e)+6*r*t*(i-n)+3*t*t*(s-i)}function Hu(t,e,n,i,s){let r=(t-e)/(s-e);for(let a=0;a<8;a++){let o=jc(r,e,n,i,s)-t;if(Math.abs(o)<0.0000000001)break;let l=ku(r,e,n,i,s);if(Math.abs(l)<0.0000000001)break;r=Math.max(0,Math.min(1,r-o/l))}return r}class qe{constructor(t,e,n,i){if(t===void 0)throw Error("THREE.KeyframeTrack: track name is undefined");if(e===void 0||e.length===0)throw Error("THREE.KeyframeTrack: no keyframes in track named "+t);this.name=t,this.times=vi(e,this.TimeBufferType),this.values=vi(n,this.ValueBufferType),this.setInterpolation(i||this.DefaultInterpolation)}static toJSON(t){let e=t.constructor,n;if(e.toJSON!==this.toJSON)n=e.toJSON(t);else{n={name:t.name,times:vi(t.times,Array),values:vi(t.values,Array)};let i=t.getInterpolation();if(i!==t.DefaultInterpolation)n.interpolation=i;if(aa(t.settings))n.settings={inTangents:vi(t.settings.inTangents,Array),outTangents:vi(t.settings.outTangents,Array)}}return n.type=t.ValueTypeName,n}InterpolantFactoryMethodDiscrete(t){return new Fo(this.times,this.values,this.getValueSize(),t)}InterpolantFactoryMethodLinear(t){return new Uo(this.times,this.values,this.getValueSize(),t)}InterpolantFactoryMethodSmooth(t){return new Do(this.times,this.values,this.getValueSize(),t)}InterpolantFactoryMethodBezier(t){let e=new Oo(this.times,this.values,this.getValueSize(),t);if(this.settings)e.inTangents=this.settings.inTangents,e.outTangents=this.settings.outTangents;return e}setInterpolation(t){let e;switch(t){case 2300:e=this.InterpolantFactoryMethodDiscrete;break;case 2301:e=this.InterpolantFactoryMethodLinear;break;case 2302:e=this.InterpolantFactoryMethodSmooth;break;case 2303:e=this.InterpolantFactoryMethodBezier;break}if(e===void 0){let n="unsupported interpolation for "+this.ValueTypeName+" keyframe track named "+this.name;if(this.createInterpolant===void 0)if(t!==this.DefaultInterpolation)this.setInterpolation(this.DefaultInterpolation);else throw Error(n);return zt("KeyframeTrack:",n),this}return this.createInterpolant=e,this}getInterpolation(){switch(this.createInterpolant){case this.InterpolantFactoryMethodDiscrete:return 2300;case this.InterpolantFactoryMethodLinear:return 2301;case this.InterpolantFactoryMethodSmooth:return 2302;case this.InterpolantFactoryMethodBezier:return 2303}}getValueSize(){return this.values.length/this.times.length}shift(t){if(t!==0){let e=this.times;for(let n=0,i=e.length;n!==i;++n)e[n]+=t}return this}scale(t){if(t!==1){let e=this.times;for(let n=0,i=e.length;n!==i;++n)e[n]*=t;if(aa(this.settings))Vl(this.settings.inTangents,t),Vl(this.settings.outTangents,t)}return this}trim(t,e){let n=this.times,i=n.length,s=0,r=i-1;while(s!==i&&n[s]<t)++s;while(r!==-1&&n[r]>e)--r;if(++r,s!==0||r!==i){if(s>=r)r=Math.max(r,1),s=r-1;let a=this.getValueSize();this.times=n.slice(s,r),this.values=this.values.slice(s*a,r*a)}return this}validate(){let t=!0,e=this.getValueSize();if(e-Math.floor(e)!==0)Bt("KeyframeTrack: Invalid value size in track.",this),t=!1;let n=this.times,i=this.values,s=n.length;if(s===0)Bt("KeyframeTrack: Track is empty.",this),t=!1;let r=null;for(let a=0;a!==s;a++){let o=n[a];if(typeof o==="number"&&isNaN(o)){Bt("KeyframeTrack: Time is not a valid number.",this,a,o),t=!1;break}if(r!==null&&r>o){Bt("KeyframeTrack: Out of order keys.",this,a,o,r),t=!1;break}r=o}if(i!==void 0){if(qh(i))for(let a=0,o=i.length;a!==o;++a){let l=i[a];if(isNaN(l)){Bt("KeyframeTrack: Value is not a valid number.",this,a,l),t=!1;break}}}return t}optimize(){let t=this.times.slice(),e=this.values.slice(),n=this.getValueSize(),i=this.getInterpolation()===2302,s=t.length-1,r=1;for(let a=1;a<s;++a){let o=!1,l=t[a],c=t[a+1];if(l!==c&&(a!==1||l!==t[0]))if(!i){let u=a*n,f=u-n,h=u+n;for(let m=0;m!==n;++m){let v=e[u+m];if(v!==e[f+m]||v!==e[h+m]){o=!0;break}}}else o=!0;if(o){if(a!==r){t[r]=t[a];let u=a*n,f=r*n;for(let h=0;h!==n;++h)e[f+h]=e[u+h]}++r}}if(s>0){t[r]=t[s];for(let a=s*n,o=r*n,l=0;l!==n;++l)e[o+l]=e[a+l];++r}if(r!==t.length)this.times=t.slice(0,r),this.values=e.slice(0,r*n);else this.times=t,this.values=e;return this}clone(){let t=this.times.slice(),e=this.values.slice(),i=new this.constructor(this.name,t,e);if(i.createInterpolant=this.createInterpolant,aa(this.settings))i.settings={inTangents:this.settings.inTangents.slice(),outTangents:this.settings.outTangents.slice()};return i}}function Vl(t,e){for(let n=0,i=t.length;n!==i;n+=2)t[n]*=e}qe.prototype.ValueTypeName="";qe.prototype.TimeBufferType=Float32Array;qe.prototype.ValueBufferType=Float32Array;qe.prototype.DefaultInterpolation=2301;class ti extends qe{constructor(t,e,n){super(t,e,n)}}ti.prototype.ValueTypeName="bool";ti.prototype.ValueBufferType=Array;ti.prototype.DefaultInterpolation=2300;ti.prototype.InterpolantFactoryMethodLinear=void 0;ti.prototype.InterpolantFactoryMethodSmooth=void 0;class Bo extends qe{constructor(t,e,n,i){super(t,e,n,i)}}Bo.prototype.ValueTypeName="color";class zo extends qe{constructor(t,e,n,i){super(t,e,n,i)}}zo.prototype.ValueTypeName="number";class Go extends jn{constructor(t,e,n,i){super(t,e,n,i)}interpolate_(t,e,n,i){let s=this.resultBuffer,r=this.sampleValues,a=this.valueSize,o=(n-e)/(i-e),l=t*a;for(let c=l+a;l!==c;l+=4)cn.slerpFlat(s,0,r,l-a,r,l,o);return s}}class Ar extends qe{constructor(t,e,n,i){super(t,e,n,i)}InterpolantFactoryMethodLinear(t){return new Go(this.times,this.values,this.getValueSize(),t)}}Ar.prototype.ValueTypeName="quaternion";Ar.prototype.InterpolantFactoryMethodSmooth=void 0;class ei extends qe{constructor(t,e,n){super(t,e,n)}}ei.prototype.ValueTypeName="string";ei.prototype.ValueBufferType=Array;ei.prototype.DefaultInterpolation=2300;ei.prototype.InterpolantFactoryMethodLinear=void 0;ei.prototype.InterpolantFactoryMethodSmooth=void 0;class ko extends qe{constructor(t,e,n,i){super(t,e,n,i)}}ko.prototype.ValueTypeName="vector";class Ho{constructor(t,e,n){let i=this,s=!1,r=0,a=0,o=void 0,l=[];this.onStart=void 0,this.onLoad=t,this.onProgress=e,this.onError=n,this._abortController=null,this.itemStart=function(c){if(a++,s===!1){if(i.onStart!==void 0)i.onStart(c,r,a)}s=!0},this.itemEnd=function(c){if(r++,i.onProgress!==void 0)i.onProgress(c,r,a);if(r===a){if(s=!1,i.onLoad!==void 0)i.onLoad()}},this.itemError=function(c){if(i.onError!==void 0)i.onError(c)},this.resolveURL=function(c){if(c=c.normalize("NFC"),o)return o(c);return c},this.setURLModifier=function(c){return o=c,this},this.addHandler=function(c,u){return l.push(c,u),this},this.removeHandler=function(c){let u=l.indexOf(c);if(u!==-1)l.splice(u,2);return this},this.getHandler=function(c){for(let u=0,f=l.length;u<f;u+=2){let h=l[u],m=l[u+1];if(h.global)h.lastIndex=0;if(h.test(c))return m}return null},this.abort=function(){return this.abortController.abort(),this._abortController=null,this}}get abortController(){if(!this._abortController)this._abortController=new AbortController;return this._abortController}}var th=new Ho;class Vo{constructor(t){if(this.manager=t!==void 0?t:th,this.crossOrigin="anonymous",this.withCredentials=!1,this.path="",this.resourcePath="",this.requestHeader={},typeof __THREE_DEVTOOLS__<"u")__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}load(){}loadAsync(t,e){let n=this;return new Promise(function(i,s){n.load(t,i,e,s)})}parse(){}setCrossOrigin(t){return this.crossOrigin=t,this}setWithCredentials(t){return this.withCredentials=t,this}setPath(t){return this.path=t,this}setResourcePath(t){return this.resourcePath=t,this}setRequestHeader(t){return this.requestHeader=t,this}abort(){return this}}Vo.DEFAULT_MATERIAL_NAME="__DEFAULT";class wr extends Me{constructor(t,e=1){super();this.isLight=!0,this.type="Light",this.color=new Zt(t),this.intensity=e}copy(t,e){return super.copy(t,e),this.color.copy(t.color),this.intensity=t.intensity,this}toJSON(t){let e=super.toJSON(t);return e.object.color=this.color.getHex(),e.object.intensity=this.intensity,e}}class Wo extends wr{constructor(t,e,n){super(t,n);this.isHemisphereLight=!0,this.type="HemisphereLight",this.position.copy(Me.DEFAULT_UP),this.updateMatrix(),this.groundColor=new Zt(e)}copy(t,e){return super.copy(t,e),this.groundColor.copy(t.groundColor),this}toJSON(t){let e=super.toJSON(t);return e.object.groundColor=this.groundColor.getHex(),e}}var oa=new ue,Wl=new P,Xl=new P;class Xo{constructor(t){this.camera=t,this.intensity=1,this.bias=0,this.biasNode=null,this.normalBias=0,this.radius=1,this.blurSamples=8,this.mapSize=new lt(512,512),this.mapType=1009,this.map=null,this.mapPass=null,this.matrix=new ue,this.autoUpdate=!0,this.needsUpdate=!1,this._frustum=new os,this._frameExtents=new lt(1,1),this._viewportCount=1,this._viewports=[new ge(0,0,1,1)]}getViewportCount(){return this._viewportCount}getCamera(){return this.camera}getFrustum(){return this._frustum}updateMatrices(t){let e=this.camera;Wl.setFromMatrixPosition(t.matrixWorld),e.position.copy(Wl),Xl.setFromMatrixPosition(t.target.matrixWorld),e.lookAt(Xl),e.updateMatrixWorld(),this._updateMatrix(e,this.matrix,this._frustum)}_updateMatrix(t,e,n,i){oa.multiplyMatrices(t.projectionMatrix,t.matrixWorldInverse),n.setFromProjectionMatrix(oa,t.coordinateSystem,t.reversedDepth);let s=this._frameExtents,r=i?i.z/s.x:1,a=i?i.w/s.y:1,o=i?i.x/s.x:0,l=i?i.y/s.y:0;if(t.coordinateSystem===2001||t.reversedDepth)e.set(0.5*r,0,0,0.5*r+o,0,0.5*a,0,0.5*a+l,0,0,1,0,0,0,0,1);else e.set(0.5*r,0,0,0.5*r+o,0,0.5*a,0,0.5*a+l,0,0,0.5,0.5,0,0,0,1);e.multiply(oa)}getViewport(t){return this._viewports[t]}getFrameExtents(){return this._frameExtents}dispose(){if(this.map)this.map.dispose();if(this.mapPass)this.mapPass.dispose()}copy(t){return this.camera=t.camera.clone(),this.intensity=t.intensity,this.bias=t.bias,this.radius=t.radius,this.autoUpdate=t.autoUpdate,this.needsUpdate=t.needsUpdate,this.normalBias=t.normalBias,this.blurSamples=t.blurSamples,this.mapSize.copy(t.mapSize),this.biasNode=t.biasNode,this}clone(){return new this.constructor().copy(this)}toJSON(){let t={};return t.intensity=this.intensity,t.bias=this.bias,t.normalBias=this.normalBias,t.radius=this.radius,t.blurSamples=this.blurSamples,t.mapSize=this.mapSize.toArray(),t.camera=this.camera.toJSON(!1).object,delete t.camera.matrix,t}}var zs=new P,Gs=new cn,sn=new P;class hs extends Me{constructor(){super();this.isCamera=!0,this.type="Camera",this.matrixWorldInverse=new ue,this.projectionMatrix=new ue,this.projectionMatrixInverse=new ue,this.coordinateSystem=2000,this._reversedDepth=!1}get reversedDepth(){return this._reversedDepth}copy(t,e){return super.copy(t,e),this.matrixWorldInverse.copy(t.matrixWorldInverse),this.projectionMatrix.copy(t.projectionMatrix),this.projectionMatrixInverse.copy(t.projectionMatrixInverse),this.coordinateSystem=t.coordinateSystem,this}getWorldDirection(t){return super.getWorldDirection(t).negate()}updateMatrixWorld(t){if(super.updateMatrixWorld(t),this.matrixWorld.decompose(zs,Gs,sn),sn.x===1&&sn.y===1&&sn.z===1)this.matrixWorldInverse.copy(this.matrixWorld).invert();else this.matrixWorldInverse.compose(zs,Gs,sn.set(1,1,1)).invert()}updateWorldMatrix(t,e,n=!1){if(super.updateWorldMatrix(t,e,n),this.matrixWorld.decompose(zs,Gs,sn),sn.x===1&&sn.y===1&&sn.z===1)this.matrixWorldInverse.copy(this.matrixWorld).invert();else this.matrixWorldInverse.compose(zs,Gs,sn.set(1,1,1)).invert()}clone(){return new this.constructor().copy(this)}}var Rn=new P,ql=new lt,Yl=new lt;class Be extends hs{constructor(t=50,e=1,n=0.1,i=2000){super();this.isPerspectiveCamera=!0,this.type="PerspectiveCamera",this.fov=t,this.zoom=1,this.near=n,this.far=i,this.focus=10,this.aspect=e,this.view=null,this.filmGauge=35,this.filmOffset=0,this.updateProjectionMatrix()}copy(t,e){return super.copy(t,e),this.fov=t.fov,this.zoom=t.zoom,this.near=t.near,this.far=t.far,this.focus=t.focus,this.aspect=t.aspect,this.view=t.view===null?null:Object.assign({},t.view),this.filmGauge=t.filmGauge,this.filmOffset=t.filmOffset,this}setFocalLength(t){let e=0.5*this.getFilmHeight()/t;this.fov=ks*2*Math.atan(e),this.updateProjectionMatrix()}getFocalLength(){let t=Math.tan(Ur*0.5*this.fov);return 0.5*this.getFilmHeight()/t}getEffectiveFOV(){return ks*2*Math.atan(Math.tan(Ur*0.5*this.fov)/this.zoom)}getFilmWidth(){return this.filmGauge*Math.min(this.aspect,1)}getFilmHeight(){return this.filmGauge/Math.max(this.aspect,1)}getViewBounds(t,e,n){Rn.set(-1,-1,0.5).applyMatrix4(this.projectionMatrixInverse),e.set(Rn.x,Rn.y).multiplyScalar(-t/Rn.z),Rn.set(1,1,0.5).applyMatrix4(this.projectionMatrixInverse),n.set(Rn.x,Rn.y).multiplyScalar(-t/Rn.z)}getViewSize(t,e){return this.getViewBounds(t,ql,Yl),e.subVectors(Yl,ql)}setViewOffset(t,e,n,i,s,r){if(this.aspect=t/e,this.view===null)this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1};this.view.enabled=!0,this.view.fullWidth=t,this.view.fullHeight=e,this.view.offsetX=n,this.view.offsetY=i,this.view.width=s,this.view.height=r,this.updateProjectionMatrix()}clearViewOffset(){if(this.view!==null)this.view.enabled=!1;this.updateProjectionMatrix()}updateProjectionMatrix(){let t=this.near,e=t*Math.tan(Ur*0.5*this.fov)/this.zoom,n=2*e,i=this.aspect*n,s=-0.5*i,r=this.view;if(this.view!==null&&this.view.enabled){let{fullWidth:o,fullHeight:l}=r;s+=r.offsetX*i/o,e-=r.offsetY*n/l,i*=r.width/o,n*=r.height/l}let a=this.filmOffset;if(a!==0)s+=t*a/this.getFilmWidth();this.projectionMatrix.makePerspective(s,s+i,e,e-n,t,this.far,this.coordinateSystem,this.reversedDepth),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(t){let e=super.toJSON(t);if(e.object.fov=this.fov,e.object.zoom=this.zoom,e.object.near=this.near,e.object.far=this.far,e.object.focus=this.focus,e.object.aspect=this.aspect,this.view!==null)e.object.view=Object.assign({},this.view);return e.object.filmGauge=this.filmGauge,e.object.filmOffset=this.filmOffset,e}}class Ii extends hs{constructor(t=-1,e=1,n=1,i=-1,s=0.1,r=2000){super();this.isOrthographicCamera=!0,this.type="OrthographicCamera",this.zoom=1,this.view=null,this.left=t,this.right=e,this.top=n,this.bottom=i,this.near=s,this.far=r,this.updateProjectionMatrix()}copy(t,e){return super.copy(t,e),this.left=t.left,this.right=t.right,this.top=t.top,this.bottom=t.bottom,this.near=t.near,this.far=t.far,this.zoom=t.zoom,this.view=t.view===null?null:Object.assign({},t.view),this}setViewOffset(t,e,n,i,s,r){if(this.view===null)this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1};this.view.enabled=!0,this.view.fullWidth=t,this.view.fullHeight=e,this.view.offsetX=n,this.view.offsetY=i,this.view.width=s,this.view.height=r,this.updateProjectionMatrix()}clearViewOffset(){if(this.view!==null)this.view.enabled=!1;this.updateProjectionMatrix()}updateProjectionMatrix(){let t=(this.right-this.left)/(2*this.zoom),e=(this.top-this.bottom)/(2*this.zoom),n=(this.right+this.left)/2,i=(this.top+this.bottom)/2,s=n-t,r=n+t,a=i+e,o=i-e;if(this.view!==null&&this.view.enabled){let l=(this.right-this.left)/this.view.fullWidth/this.zoom,c=(this.top-this.bottom)/this.view.fullHeight/this.zoom;s+=l*this.view.offsetX,r=s+l*this.view.width,a-=c*this.view.offsetY,o=a-c*this.view.height}this.projectionMatrix.makeOrthographic(s,r,a,o,this.near,this.far,this.coordinateSystem,this.reversedDepth),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(t){let e=super.toJSON(t);if(e.object.zoom=this.zoom,e.object.left=this.left,e.object.right=this.right,e.object.top=this.top,e.object.bottom=this.bottom,e.object.near=this.near,e.object.far=this.far,this.view!==null)e.object.view=Object.assign({},this.view);return e}}class eh extends Xo{constructor(){super(new Ii(-5,5,5,-5,0.5,500));this.isDirectionalLightShadow=!0}}class qo extends wr{constructor(t,e){super(t,e);this.isDirectionalLight=!0,this.type="DirectionalLight",this.position.copy(Me.DEFAULT_UP),this.updateMatrix(),this.target=new Me,this.shadow=new eh}dispose(){super.dispose(),this.shadow.dispose()}copy(t){return super.copy(t),this.target=t.target.clone(),this.shadow=t.shadow.clone(),this}toJSON(t){let e=super.toJSON(t);return e.object.shadow=this.shadow.toJSON(),e.object.target=this.target.uuid,e}}class Yo extends ve{constructor(){super();this.isInstancedBufferGeometry=!0,this.type="InstancedBufferGeometry",this.instanceCount=1/0}copy(t){return super.copy(t),this.instanceCount=t.instanceCount,this}toJSON(){let t=super.toJSON();return t.instanceCount=this.instanceCount,t.isInstancedBufferGeometry=!0,t}}var yi=-90,Si=1;class Zo extends Me{constructor(t,e,n){super();this.type="CubeCamera",this.renderTarget=n,this.coordinateSystem=null,this.activeMipmapLevel=0;let i=new Be(yi,Si,t,e);i.layers=this.layers,this.add(i);let s=new Be(yi,Si,t,e);s.layers=this.layers,this.add(s);let r=new Be(yi,Si,t,e);r.layers=this.layers,this.add(r);let a=new Be(yi,Si,t,e);a.layers=this.layers,this.add(a);let o=new Be(yi,Si,t,e);o.layers=this.layers,this.add(o);let l=new Be(yi,Si,t,e);l.layers=this.layers,this.add(l)}updateCoordinateSystem(){let t=this.coordinateSystem,e=this.children.concat(),[n,i,s,r,a,o]=e;for(let l of e)this.remove(l);if(t===2000)n.up.set(0,1,0),n.lookAt(1,0,0),i.up.set(0,1,0),i.lookAt(-1,0,0),s.up.set(0,0,-1),s.lookAt(0,1,0),r.up.set(0,0,1),r.lookAt(0,-1,0),a.up.set(0,1,0),a.lookAt(0,0,1),o.up.set(0,1,0),o.lookAt(0,0,-1);else if(t===2001)n.up.set(0,-1,0),n.lookAt(-1,0,0),i.up.set(0,-1,0),i.lookAt(1,0,0),s.up.set(0,0,1),s.lookAt(0,1,0),r.up.set(0,0,-1),r.lookAt(0,-1,0),a.up.set(0,-1,0),a.lookAt(0,0,1),o.up.set(0,-1,0),o.lookAt(0,0,-1);else throw Error("THREE.CubeCamera.updateCoordinateSystem(): Invalid coordinate system: "+t);for(let l of e)this.add(l),l.updateMatrixWorld()}update(t,e){if(this.parent===null)this.updateMatrixWorld();let{renderTarget:n,activeMipmapLevel:i}=this;if(this.coordinateSystem!==t.coordinateSystem)this.coordinateSystem=t.coordinateSystem,this.updateCoordinateSystem();let[s,r,a,o,l,c]=this.children,u=t.getRenderTarget(),f=t.getActiveCubeFace(),h=t.getActiveMipmapLevel(),m=t.xr.enabled;t.xr.enabled=!1;let v=n.texture.generateMipmaps;n.texture.generateMipmaps=!1;let T=!1;if(t.isWebGLRenderer===!0)T=t.state.buffers.depth.getReversed();else T=t.reversedDepthBuffer;if(t.setRenderTarget(n,0,i),T&&t.autoClear===!1)t.clearDepth();if(t.render(e,s),t.setRenderTarget(n,1,i),T&&t.autoClear===!1)t.clearDepth();if(t.render(e,r),t.setRenderTarget(n,2,i),T&&t.autoClear===!1)t.clearDepth();if(t.render(e,a),t.setRenderTarget(n,3,i),T&&t.autoClear===!1)t.clearDepth();if(t.render(e,o),t.setRenderTarget(n,4,i),T&&t.autoClear===!1)t.clearDepth();if(t.render(e,l),n.texture.generateMipmaps=v,t.setRenderTarget(n,5,i),T&&t.autoClear===!1)t.clearDepth();t.render(e,c),t.setRenderTarget(u,f,h),t.xr.enabled=m,n.texture.needsPMREMUpdate=!0}}class Jo extends Be{constructor(t=[]){super();this.isArrayCamera=!0,this.isMultiViewCamera=!1,this.cameras=t}}var $o="\\[\\]\\.:\\/",Vu=new RegExp("["+$o+"]","g"),Ko="[^"+$o+"]",Wu="[^"+$o.replace("\\.","")+"]",Xu=/((?:WC+[\/:])*)/.source.replace("WC",Ko),qu=/(WCOD+)?/.source.replace("WCOD",Wu),Yu=/(?:\.(WC+)(?:\[(.+)\])?)?/.source.replace("WC",Ko),Zu=/\.(WC+)(?:\[(.+)\])?/.source.replace("WC",Ko),Ju=new RegExp("^"+Xu+qu+Yu+Zu+"$"),$u=["material","materials","bones","map"];class nh{constructor(t,e,n){let i=n||ae.parseTrackName(e);this._targetGroup=t,this._bindings=t.subscribe_(e,i)}getValue(t,e){this.bind();let n=this._targetGroup.nCachedObjects_,i=this._bindings[n];if(i!==void 0)i.getValue(t,e)}setValue(t,e){let n=this._bindings;for(let i=this._targetGroup.nCachedObjects_,s=n.length;i!==s;++i)n[i].setValue(t,e)}bind(){let t=this._bindings;for(let e=this._targetGroup.nCachedObjects_,n=t.length;e!==n;++e)t[e].bind()}unbind(){let t=this._bindings;for(let e=this._targetGroup.nCachedObjects_,n=t.length;e!==n;++e)t[e].unbind()}}class ae{constructor(t,e,n){this.path=e,this.parsedPath=n||ae.parseTrackName(e),this.node=ae.findNode(t,this.parsedPath.nodeName),this.rootNode=t,this.getValue=this._getValue_unbound,this.setValue=this._setValue_unbound}static create(t,e,n){if(!(t&&t.isAnimationObjectGroup))return new ae(t,e,n);else return new ae.Composite(t,e,n)}static sanitizeNodeName(t){return t.replace(/\s/g,"_").replace(Vu,"")}static parseTrackName(t){let e=Ju.exec(t);if(e===null)throw Error("THREE.PropertyBinding: Cannot parse trackName: "+t);let n={nodeName:e[2],objectName:e[3],objectIndex:e[4],propertyName:e[5],propertyIndex:e[6]},i=n.nodeName&&n.nodeName.lastIndexOf(".");if(i!==void 0&&i!==-1){let s=n.nodeName.substring(i+1);if($u.indexOf(s)!==-1)n.nodeName=n.nodeName.substring(0,i),n.objectName=s}if(n.propertyName===null||n.propertyName.length===0)throw Error("THREE.PropertyBinding: can not parse propertyName from trackName: "+t);return n}static findNode(t,e){if(e===void 0||e===""||e==="."||e===-1||e===t.name||e===t.uuid)return t;if(t.skeleton){let n=t.skeleton.getBoneByName(e);if(n!==void 0)return n}if(t.children){let n=function(s){for(let r=0;r<s.length;r++){let a=s[r];if(a.name===e||a.uuid===e)return a;let o=n(a.children);if(o)return o}return null},i=n(t.children);if(i)return i}return null}_getValue_unavailable(){}_setValue_unavailable(){}_getValue_direct(t,e){t[e]=this.targetObject[this.propertyName]}_getValue_array(t,e){let n=this.resolvedProperty;for(let i=0,s=n.length;i!==s;++i)t[e++]=n[i]}_getValue_arrayElement(t,e){t[e]=this.resolvedProperty[this.propertyIndex]}_getValue_toArray(t,e){this.resolvedProperty.toArray(t,e)}_setValue_direct(t,e){this.targetObject[this.propertyName]=t[e]}_setValue_direct_setNeedsUpdate(t,e){this.targetObject[this.propertyName]=t[e],this.targetObject.needsUpdate=!0}_setValue_direct_setMatrixWorldNeedsUpdate(t,e){this.targetObject[this.propertyName]=t[e],this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_array(t,e){let n=this.resolvedProperty;for(let i=0,s=n.length;i!==s;++i)n[i]=t[e++]}_setValue_array_setNeedsUpdate(t,e){let n=this.resolvedProperty;for(let i=0,s=n.length;i!==s;++i)n[i]=t[e++];this.targetObject.needsUpdate=!0}_setValue_array_setMatrixWorldNeedsUpdate(t,e){let n=this.resolvedProperty;for(let i=0,s=n.length;i!==s;++i)n[i]=t[e++];this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_arrayElement(t,e){this.resolvedProperty[this.propertyIndex]=t[e]}_setValue_arrayElement_setNeedsUpdate(t,e){this.resolvedProperty[this.propertyIndex]=t[e],this.targetObject.needsUpdate=!0}_setValue_arrayElement_setMatrixWorldNeedsUpdate(t,e){this.resolvedProperty[this.propertyIndex]=t[e],this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_fromArray(t,e){this.resolvedProperty.fromArray(t,e)}_setValue_fromArray_setNeedsUpdate(t,e){this.resolvedProperty.fromArray(t,e),this.targetObject.needsUpdate=!0}_setValue_fromArray_setMatrixWorldNeedsUpdate(t,e){this.resolvedProperty.fromArray(t,e),this.targetObject.matrixWorldNeedsUpdate=!0}_getValue_unbound(t,e){this.bind(),this.getValue(t,e)}_setValue_unbound(t,e){this.bind(),this.setValue(t,e)}bind(){let t=this.node,e=this.parsedPath,{objectName:n,propertyName:i,propertyIndex:s}=e;if(!t)t=ae.findNode(this.rootNode,e.nodeName),this.node=t;if(this.getValue=this._getValue_unavailable,this.setValue=this._setValue_unavailable,!t){zt("PropertyBinding: No target node found for track: "+this.path+".");return}if(n){let l=e.objectIndex;switch(n){case"materials":if(!t.material){Bt("PropertyBinding: Can not bind to material as node does not have a material.",this);return}if(!t.material.materials){Bt("PropertyBinding: Can not bind to material.materials as node.material does not have a materials array.",this);return}t=t.material.materials;break;case"bones":if(!t.skeleton){Bt("PropertyBinding: Can not bind to bones as node does not have a skeleton.",this);return}t=t.skeleton.bones;for(let c=0;c<t.length;c++)if(t[c].name===l){l=c;break}break;case"map":if("map"in t){t=t.map;break}if(!t.material){Bt("PropertyBinding: Can not bind to material as node does not have a material.",this);return}if(!t.material.map){Bt("PropertyBinding: Can not bind to material.map as node.material does not have a map.",this);return}t=t.material.map;break;default:if(t[n]===void 0){Bt("PropertyBinding: Can not bind to objectName of node undefined.",this);return}t=t[n]}if(l!==void 0){if(t[l]===void 0){Bt("PropertyBinding: Trying to bind to objectIndex of objectName, but is undefined.",this,t);return}t=t[l]}}let r=t[i];if(r===void 0){let l=e.nodeName;Bt("PropertyBinding: Trying to update property for track: "+l+"."+i+" but it wasn't found.",t);return}let a=this.Versioning.None;if(this.targetObject=t,t.isMaterial===!0)a=this.Versioning.NeedsUpdate;else if(t.isObject3D===!0)a=this.Versioning.MatrixWorldNeedsUpdate;let o=this.BindingType.Direct;if(s!==void 0){if(i==="morphTargetInfluences"){if(!t.geometry){Bt("PropertyBinding: Can not bind to morphTargetInfluences because node does not have a geometry.",this);return}if(!t.geometry.morphAttributes){Bt("PropertyBinding: Can not bind to morphTargetInfluences because node does not have a geometry.morphAttributes.",this);return}if(t.morphTargetDictionary[s]!==void 0)s=t.morphTargetDictionary[s]}o=this.BindingType.ArrayElement,this.resolvedProperty=r,this.propertyIndex=s}else if(r.fromArray!==void 0&&r.toArray!==void 0)o=this.BindingType.HasFromToArray,this.resolvedProperty=r;else if(Array.isArray(r))o=this.BindingType.EntireArray,this.resolvedProperty=r;else this.propertyName=i;this.getValue=this.GetterByBindingType[o],this.setValue=this.SetterByBindingTypeAndVersioning[o][a]}unbind(){this.node=null,this.getValue=this._getValue_unbound,this.setValue=this._setValue_unbound}}ae.Composite=nh;ae.prototype.BindingType={Direct:0,EntireArray:1,ArrayElement:2,HasFromToArray:3};ae.prototype.Versioning={None:0,NeedsUpdate:1,MatrixWorldNeedsUpdate:2};ae.prototype.GetterByBindingType=[ae.prototype._getValue_direct,ae.prototype._getValue_array,ae.prototype._getValue_arrayElement,ae.prototype._getValue_toArray];ae.prototype.SetterByBindingTypeAndVersioning=[[ae.prototype._setValue_direct,ae.prototype._setValue_direct_setNeedsUpdate,ae.prototype._setValue_direct_setMatrixWorldNeedsUpdate],[ae.prototype._setValue_array,ae.prototype._setValue_array_setNeedsUpdate,ae.prototype._setValue_array_setMatrixWorldNeedsUpdate],[ae.prototype._setValue_arrayElement,ae.prototype._setValue_arrayElement_setNeedsUpdate,ae.prototype._setValue_arrayElement_setMatrixWorldNeedsUpdate],[ae.prototype._setValue_fromArray,ae.prototype._setValue_fromArray_setNeedsUpdate,ae.prototype._setValue_fromArray_setMatrixWorldNeedsUpdate]];var Hg=new Float32Array(1);class Qo{static{Qo.prototype.isMatrix2=!0}constructor(t,e,n,i){if(this.elements=[1,0,0,1],t!==void 0)this.set(t,e,n,i)}identity(){return this.set(1,0,0,1),this}fromArray(t,e=0){for(let n=0;n<4;n++)this.elements[n]=t[n+e];return this}set(t,e,n,i){let s=this.elements;return s[0]=t,s[2]=e,s[1]=n,s[3]=i,this}}function jo(t,e,n,i){let s=Ku(i);switch(n){case 1021:return t*e;case 1028:return t*e/s.components*s.byteLength;case 1029:return t*e/s.components*s.byteLength;case 1030:return t*e*2/s.components*s.byteLength;case 1031:return t*e*2/s.components*s.byteLength;case 1022:return t*e*3/s.components*s.byteLength;case 1023:return t*e*4/s.components*s.byteLength;case 1033:return t*e*4/s.components*s.byteLength;case 33776:case 33777:return Math.floor((t+3)/4)*Math.floor((e+3)/4)*8;case 33778:case 33779:return Math.floor((t+3)/4)*Math.floor((e+3)/4)*16;case 35841:case 35843:return Math.max(t,16)*Math.max(e,8)/4;case 35840:case 35842:return Math.max(t,8)*Math.max(e,8)/2;case 36196:case 37492:case 37488:case 37489:return Math.floor((t+3)/4)*Math.floor((e+3)/4)*8;case 37496:case 37490:case 37491:return Math.floor((t+3)/4)*Math.floor((e+3)/4)*16;case 37808:return Math.floor((t+3)/4)*Math.floor((e+3)/4)*16;case 37809:return Math.floor((t+4)/5)*Math.floor((e+3)/4)*16;case 37810:return Math.floor((t+4)/5)*Math.floor((e+4)/5)*16;case 37811:return Math.floor((t+5)/6)*Math.floor((e+4)/5)*16;case 37812:return Math.floor((t+5)/6)*Math.floor((e+5)/6)*16;case 37813:return Math.floor((t+7)/8)*Math.floor((e+4)/5)*16;case 37814:return Math.floor((t+7)/8)*Math.floor((e+5)/6)*16;case 37815:return Math.floor((t+7)/8)*Math.floor((e+7)/8)*16;case 37816:return Math.floor((t+9)/10)*Math.floor((e+4)/5)*16;case 37817:return Math.floor((t+9)/10)*Math.floor((e+5)/6)*16;case 37818:return Math.floor((t+9)/10)*Math.floor((e+7)/8)*16;case 37819:return Math.floor((t+9)/10)*Math.floor((e+9)/10)*16;case 37820:return Math.floor((t+11)/12)*Math.floor((e+9)/10)*16;case 37821:return Math.floor((t+11)/12)*Math.floor((e+11)/12)*16;case 36492:case 36494:case 36495:return Math.ceil(t/4)*Math.ceil(e/4)*16;case 36283:case 36284:return Math.ceil(t/4)*Math.ceil(e/4)*8;case 36285:case 36286:return Math.ceil(t/4)*Math.ceil(e/4)*16}throw Error(`Unable to determine texture byte length for ${n} format.`)}function Ku(t){switch(t){case 1009:case 1010:return{byteLength:1,components:1};case 1012:case 1011:case 1016:return{byteLength:2,components:1};case 1017:case 1018:return{byteLength:2,components:4};case 1014:case 1013:case 1015:return{byteLength:4,components:1};case 35902:case 35899:return{byteLength:4,components:3}}throw Error(`THREE.TextureUtils: Unknown texture type ${t}.`)}if(typeof __THREE_DEVTOOLS__<"u")__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("register",{detail:{revision:"186"}}));if(typeof window<"u")if(window.__THREE__)zt("WARNING: Multiple instances of Three.js being imported.");else window.__THREE__="186";function Th(){let t=null,e=!1,n=null,i=null;function s(r,a){i=t.requestAnimationFrame(s),n(r,a)}return{start:function(){if(e===!0)return;if(n===null)return;if(t===null)return;i=t.requestAnimationFrame(s),e=!0},stop:function(){if(t!==null)t.cancelAnimationFrame(i);e=!1},setAnimationLoop:function(r){n=r},setContext:function(r){t=r}}}function Qu(t){let e=new WeakMap;function n(o,l){let{array:c,usage:u}=o,f=c.byteLength,h=t.createBuffer();t.bindBuffer(l,h),t.bufferData(l,c,u),o.onUploadCallback();let m;if(c instanceof Float32Array)m=t.FLOAT;else if(typeof Float16Array<"u"&&c instanceof Float16Array)m=t.HALF_FLOAT;else if(c instanceof Uint16Array)if(o.isFloat16BufferAttribute)m=t.HALF_FLOAT;else m=t.UNSIGNED_SHORT;else if(c instanceof Int16Array)m=t.SHORT;else if(c instanceof Uint32Array)m=t.UNSIGNED_INT;else if(c instanceof Int32Array)m=t.INT;else if(c instanceof Int8Array)m=t.BYTE;else if(c instanceof Uint8Array)m=t.UNSIGNED_BYTE;else if(c instanceof Uint8ClampedArray)m=t.UNSIGNED_BYTE;else throw Error("THREE.WebGLAttributes: Unsupported buffer data format: "+c);return{buffer:h,type:m,bytesPerElement:c.BYTES_PER_ELEMENT,version:o.version,size:f}}function i(o,l,c){let{array:u,updateRanges:f}=l;if(t.bindBuffer(c,o),f.length===0)t.bufferSubData(c,0,u);else{f.sort((m,v)=>m.start-v.start);let h=0;for(let m=1;m<f.length;m++){let v=f[h],T=f[m];if(T.start<=v.start+v.count+1)v.count=Math.max(v.count,T.start+T.count-v.start);else++h,f[h]=T}f.length=h+1;for(let m=0,v=f.length;m<v;m++){let T=f[m];t.bufferSubData(c,T.start*u.BYTES_PER_ELEMENT,u,T.start,T.count)}l.clearUpdateRanges()}l.onUploadCallback()}function s(o){if(o.isInterleavedBufferAttribute)o=o.data;return e.get(o)}function r(o){if(o.isInterleavedBufferAttribute)o=o.data;let l=e.get(o);if(l)t.deleteBuffer(l.buffer),e.delete(o)}function a(o,l){if(o.isInterleavedBufferAttribute)o=o.data;if(o.isGLBufferAttribute){let u=e.get(o);if(!u||u.version<o.version)e.set(o,{buffer:o.buffer,type:o.type,bytesPerElement:o.elementSize,version:o.version});return}let c=e.get(o);if(c===void 0)e.set(o,n(o,l));else if(c.version<o.version){if(c.size!==o.array.byteLength)throw Error("THREE.WebGLAttributes: The size of the buffer attribute's array buffer does not match the original size. Resizing buffer attributes is not supported.");i(c.buffer,o,l),c.version=o.version}}return{get:s,remove:r,update:a}}var ju=`#ifdef USE_ALPHAHASH
	if ( diffuseColor.a < getAlphaHashThreshold( vPosition ) ) discard;
#endif`,td=`#ifdef USE_ALPHAHASH
	const float ALPHA_HASH_SCALE = 0.05;
	float hash2D( vec2 value ) {
		return fract( 1.0e4 * sin( 17.0 * value.x + 0.1 * value.y ) * ( 0.1 + abs( sin( 13.0 * value.y + value.x ) ) ) );
	}
	float hash3D( vec3 value ) {
		return hash2D( vec2( hash2D( value.xy ), value.z ) );
	}
	float getAlphaHashThreshold( vec3 position ) {
		float maxDeriv = max(
			length( dFdx( position.xyz ) ),
			length( dFdy( position.xyz ) )
		);
		float pixScale = 1.0 / ( ALPHA_HASH_SCALE * maxDeriv );
		vec2 pixScales = vec2(
			exp2( floor( log2( pixScale ) ) ),
			exp2( ceil( log2( pixScale ) ) )
		);
		vec2 alpha = vec2(
			hash3D( floor( pixScales.x * position.xyz ) ),
			hash3D( floor( pixScales.y * position.xyz ) )
		);
		float lerpFactor = fract( log2( pixScale ) );
		float x = ( 1.0 - lerpFactor ) * alpha.x + lerpFactor * alpha.y;
		float a = min( lerpFactor, 1.0 - lerpFactor );
		vec3 cases = vec3(
			x * x / ( 2.0 * a * ( 1.0 - a ) ),
			( x - 0.5 * a ) / ( 1.0 - a ),
			1.0 - ( ( 1.0 - x ) * ( 1.0 - x ) / ( 2.0 * a * ( 1.0 - a ) ) )
		);
		float threshold = ( x < ( 1.0 - a ) )
			? ( ( x < a ) ? cases.x : cases.y )
			: cases.z;
		return clamp( threshold , 1.0e-6, 1.0 );
	}
#endif`,ed=`#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, vAlphaMapUv ).g;
#endif`,nd=`#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,id=`#ifdef USE_ALPHATEST
	#ifdef ALPHA_TO_COVERAGE
	diffuseColor.a = smoothstep( alphaTest, alphaTest + fwidth( diffuseColor.a ), diffuseColor.a );
	if ( diffuseColor.a == 0.0 ) discard;
	#else
	if ( diffuseColor.a < alphaTest ) discard;
	#endif
#endif`,sd=`#ifdef USE_ALPHATEST
	uniform float alphaTest;
#endif`,rd=`#ifdef USE_AOMAP
	float ambientOcclusion = ( texture2D( aoMap, vAoMapUv ).r - 1.0 ) * aoMapIntensity + 1.0;
	reflectedLight.indirectDiffuse *= ambientOcclusion;
	#if defined( USE_CLEARCOAT ) 
		clearcoatSpecularIndirect *= ambientOcclusion;
	#endif
	#if defined( USE_SHEEN ) 
		sheenSpecularIndirect *= ambientOcclusion;
	#endif
	#if defined( USE_ENVMAP ) && defined( STANDARD )
		float dotNV = saturate( dot( geometryNormal, geometryViewDir ) );
		reflectedLight.indirectSpecular *= computeSpecularOcclusion( dotNV, ambientOcclusion, material.roughness );
	#endif
#endif`,ad=`#ifdef USE_AOMAP
	uniform sampler2D aoMap;
	uniform float aoMapIntensity;
#endif`,od=`#ifdef USE_BATCHING
	#if ! defined( GL_ANGLE_multi_draw )
	#define gl_DrawID _gl_DrawID
	uniform int _gl_DrawID;
	#endif
	uniform highp sampler2D batchingTexture;
	uniform highp usampler2D batchingIdTexture;
	mat4 getBatchingMatrix( const in float i ) {
		int size = textureSize( batchingTexture, 0 ).x;
		int j = int( i ) * 4;
		int x = j % size;
		int y = j / size;
		vec4 v1 = texelFetch( batchingTexture, ivec2( x, y ), 0 );
		vec4 v2 = texelFetch( batchingTexture, ivec2( x + 1, y ), 0 );
		vec4 v3 = texelFetch( batchingTexture, ivec2( x + 2, y ), 0 );
		vec4 v4 = texelFetch( batchingTexture, ivec2( x + 3, y ), 0 );
		return mat4( v1, v2, v3, v4 );
	}
	float getIndirectIndex( const in int i ) {
		int size = textureSize( batchingIdTexture, 0 ).x;
		int x = i % size;
		int y = i / size;
		return float( texelFetch( batchingIdTexture, ivec2( x, y ), 0 ).r );
	}
#endif
#ifdef USE_BATCHING_COLOR
	uniform sampler2D batchingColorTexture;
	vec4 getBatchingColor( const in float i ) {
		int size = textureSize( batchingColorTexture, 0 ).x;
		int j = int( i );
		int x = j % size;
		int y = j / size;
		return texelFetch( batchingColorTexture, ivec2( x, y ), 0 );
	}
#endif`,ld=`#ifdef USE_BATCHING
	mat4 batchingMatrix = getBatchingMatrix( getIndirectIndex( gl_DrawID ) );
#endif`,cd=`vec3 transformed = vec3( position );
#ifdef USE_ALPHAHASH
	vPosition = vec3( position );
#endif`,hd=`vec3 objectNormal = vec3( normal );
#ifdef USE_TANGENT
	vec3 objectTangent = vec3( tangent.xyz );
#endif`,ud=`float G_BlinnPhong_Implicit( ) {
	return 0.25;
}
float D_BlinnPhong( const in float shininess, const in float dotNH ) {
	return RECIPROCAL_PI * ( shininess * 0.5 + 1.0 ) * pow( dotNH, shininess );
}
vec3 BRDF_BlinnPhong( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in vec3 specularColor, const in float shininess ) {
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNH = saturate( dot( normal, halfDir ) );
	float dotVH = saturate( dot( viewDir, halfDir ) );
	vec3 F = F_Schlick( specularColor, 1.0, dotVH );
	float G = G_BlinnPhong_Implicit( );
	float D = D_BlinnPhong( shininess, dotNH );
	return F * ( G * D );
} // validated`,dd=`#ifdef USE_IRIDESCENCE
	const mat3 XYZ_TO_REC709 = mat3(
		 3.2404542, -0.9692660,  0.0556434,
		-1.5371385,  1.8760108, -0.2040259,
		-0.4985314,  0.0415560,  1.0572252
	);
	vec3 Fresnel0ToIor( vec3 fresnel0 ) {
		vec3 sqrtF0 = sqrt( fresnel0 );
		return ( vec3( 1.0 ) + sqrtF0 ) / ( vec3( 1.0 ) - sqrtF0 );
	}
	vec3 IorToFresnel0( vec3 transmittedIor, float incidentIor ) {
		return pow2( ( transmittedIor - vec3( incidentIor ) ) / ( transmittedIor + vec3( incidentIor ) ) );
	}
	float IorToFresnel0( float transmittedIor, float incidentIor ) {
		return pow2( ( transmittedIor - incidentIor ) / ( transmittedIor + incidentIor ));
	}
	vec3 evalSensitivity( float OPD, vec3 shift ) {
		float phase = 2.0 * PI * OPD * 1.0e-9;
		vec3 val = vec3( 5.4856e-13, 4.4201e-13, 5.2481e-13 );
		vec3 pos = vec3( 1.6810e+06, 1.7953e+06, 2.2084e+06 );
		vec3 var = vec3( 4.3278e+09, 9.3046e+09, 6.6121e+09 );
		vec3 xyz = val * sqrt( 2.0 * PI * var ) * cos( pos * phase + shift ) * exp( - pow2( phase ) * var );
		xyz.x += 9.7470e-14 * sqrt( 2.0 * PI * 4.5282e+09 ) * cos( 2.2399e+06 * phase + shift[ 0 ] ) * exp( - 4.5282e+09 * pow2( phase ) );
		xyz /= 1.0685e-7;
		vec3 rgb = XYZ_TO_REC709 * xyz;
		return rgb;
	}
	vec3 evalIridescence( float outsideIOR, float eta2, float cosTheta1, float thinFilmThickness, vec3 baseF0 ) {
		vec3 I;
		float iridescenceIOR = mix( outsideIOR, eta2, smoothstep( 0.0, 0.03, thinFilmThickness ) );
		float sinTheta2Sq = pow2( outsideIOR / iridescenceIOR ) * ( 1.0 - pow2( cosTheta1 ) );
		float cosTheta2Sq = 1.0 - sinTheta2Sq;
		if ( cosTheta2Sq < 0.0 ) {
			return vec3( 1.0 );
		}
		float cosTheta2 = sqrt( cosTheta2Sq );
		float R0 = IorToFresnel0( iridescenceIOR, outsideIOR );
		float R12 = F_Schlick( R0, 1.0, cosTheta1 );
		float T121 = 1.0 - R12;
		float phi12 = 0.0;
		if ( iridescenceIOR < outsideIOR ) phi12 = PI;
		float phi21 = PI - phi12;
		vec3 baseIOR = Fresnel0ToIor( clamp( baseF0, 0.0, 0.9999 ) );		vec3 R1 = IorToFresnel0( baseIOR, iridescenceIOR );
		vec3 R23 = F_Schlick( R1, 1.0, cosTheta2 );
		vec3 phi23 = vec3( 0.0 );
		if ( baseIOR[ 0 ] < iridescenceIOR ) phi23[ 0 ] = PI;
		if ( baseIOR[ 1 ] < iridescenceIOR ) phi23[ 1 ] = PI;
		if ( baseIOR[ 2 ] < iridescenceIOR ) phi23[ 2 ] = PI;
		float OPD = 2.0 * iridescenceIOR * thinFilmThickness * cosTheta2;
		vec3 phi = vec3( phi21 ) + phi23;
		vec3 R123 = clamp( R12 * R23, 1e-5, 0.9999 );
		vec3 r123 = sqrt( R123 );
		vec3 Rs = pow2( T121 ) * R23 / ( vec3( 1.0 ) - R123 );
		vec3 C0 = R12 + Rs;
		I = C0;
		vec3 Cm = Rs - T121;
		for ( int m = 1; m <= 2; ++ m ) {
			Cm *= r123;
			vec3 Sm = 2.0 * evalSensitivity( float( m ) * OPD, float( m ) * phi );
			I += Cm * Sm;
		}
		return max( I, vec3( 0.0 ) );
	}
#endif`,fd=`#ifdef USE_BUMPMAP
	uniform sampler2D bumpMap;
	uniform float bumpScale;
	vec2 dHdxy_fwd() {
		vec2 dSTdx = dFdx( vBumpMapUv );
		vec2 dSTdy = dFdy( vBumpMapUv );
		float Hll = bumpScale * texture2D( bumpMap, vBumpMapUv ).x;
		float dBx = bumpScale * texture2D( bumpMap, vBumpMapUv + dSTdx ).x - Hll;
		float dBy = bumpScale * texture2D( bumpMap, vBumpMapUv + dSTdy ).x - Hll;
		return vec2( dBx, dBy );
	}
	vec3 perturbNormalArb( vec3 surf_pos, vec3 surf_norm, vec2 dHdxy, float faceDirection ) {
		vec3 vSigmaX = normalize( dFdx( surf_pos.xyz ) );
		vec3 vSigmaY = normalize( dFdy( surf_pos.xyz ) );
		vec3 vN = surf_norm;
		vec3 R1 = cross( vSigmaY, vN );
		vec3 R2 = cross( vN, vSigmaX );
		float fDet = dot( vSigmaX, R1 ) * faceDirection;
		vec3 vGrad = sign( fDet ) * ( dHdxy.x * R1 + dHdxy.y * R2 );
		return normalize( abs( fDet ) * surf_norm - vGrad );
	}
#endif`,pd=`#if NUM_CLIPPING_PLANES > 0
	vec4 plane;
	#ifdef ALPHA_TO_COVERAGE
		float distanceToPlane, distanceGradient;
		float clipOpacity = 1.0;
		#pragma unroll_loop_start
		for ( int i = 0; i < UNION_CLIPPING_PLANES; i ++ ) {
			plane = clippingPlanes[ i ];
			distanceToPlane = - dot( vClipPosition, plane.xyz ) + plane.w;
			distanceGradient = fwidth( distanceToPlane ) / 2.0;
			clipOpacity *= smoothstep( - distanceGradient, distanceGradient, distanceToPlane );
			if ( clipOpacity == 0.0 ) discard;
		}
		#pragma unroll_loop_end
		#if UNION_CLIPPING_PLANES < NUM_CLIPPING_PLANES
			float unionClipOpacity = 1.0;
			#pragma unroll_loop_start
			for ( int i = UNION_CLIPPING_PLANES; i < NUM_CLIPPING_PLANES; i ++ ) {
				plane = clippingPlanes[ i ];
				distanceToPlane = - dot( vClipPosition, plane.xyz ) + plane.w;
				distanceGradient = fwidth( distanceToPlane ) / 2.0;
				unionClipOpacity *= 1.0 - smoothstep( - distanceGradient, distanceGradient, distanceToPlane );
			}
			#pragma unroll_loop_end
			clipOpacity *= 1.0 - unionClipOpacity;
		#endif
		diffuseColor.a *= clipOpacity;
		if ( diffuseColor.a == 0.0 ) discard;
	#else
		#pragma unroll_loop_start
		for ( int i = 0; i < UNION_CLIPPING_PLANES; i ++ ) {
			plane = clippingPlanes[ i ];
			if ( dot( vClipPosition, plane.xyz ) > plane.w ) discard;
		}
		#pragma unroll_loop_end
		#if UNION_CLIPPING_PLANES < NUM_CLIPPING_PLANES
			bool clipped = true;
			#pragma unroll_loop_start
			for ( int i = UNION_CLIPPING_PLANES; i < NUM_CLIPPING_PLANES; i ++ ) {
				plane = clippingPlanes[ i ];
				clipped = ( dot( vClipPosition, plane.xyz ) > plane.w ) && clipped;
			}
			#pragma unroll_loop_end
			if ( clipped ) discard;
		#endif
	#endif
#endif`,md=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
	uniform vec4 clippingPlanes[ NUM_CLIPPING_PLANES ];
#endif`,gd=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
#endif`,_d=`#if NUM_CLIPPING_PLANES > 0
	vClipPosition = - mvPosition.xyz;
#endif`,xd=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA )
	diffuseColor *= vColor;
#endif`,vd=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#endif`,yd=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	varying vec4 vColor;
#endif`,Sd=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	vColor = vec4( 1.0 );
#endif
#ifdef USE_COLOR_ALPHA
	vColor *= color;
#elif defined( USE_COLOR )
	vColor.rgb *= color;
#endif
#ifdef USE_INSTANCING_COLOR
	vColor.rgb *= instanceColor.rgb;
#endif
#ifdef USE_BATCHING_COLOR
	vColor *= getBatchingColor( getIndirectIndex( gl_DrawID ) );
#endif`,Md=`#define PI 3.141592653589793
#define PI2 6.283185307179586
#define PI_HALF 1.5707963267948966
#define RECIPROCAL_PI 0.3183098861837907
#define RECIPROCAL_PI2 0.15915494309189535
#define EPSILON 1e-6
#ifndef saturate
#define saturate( a ) clamp( a, 0.0, 1.0 )
#endif
#define whiteComplement( a ) ( 1.0 - saturate( a ) )
float pow2( const in float x ) { return x*x; }
vec3 pow2( const in vec3 x ) { return x*x; }
float pow3( const in float x ) { return x*x*x; }
float pow4( const in float x ) { float x2 = x*x; return x2*x2; }
float max3( const in vec3 v ) { return max( max( v.x, v.y ), v.z ); }
float average( const in vec3 v ) { return dot( v, vec3( 0.3333333 ) ); }
highp float rand( const in vec2 uv ) {
	const highp float a = 12.9898, b = 78.233, c = 43758.5453;
	highp float dt = dot( uv.xy, vec2( a,b ) ), sn = mod( dt, PI );
	return fract( sin( sn ) * c );
}
#ifdef HIGH_PRECISION
	float precisionSafeLength( vec3 v ) { return length( v ); }
#else
	float precisionSafeLength( vec3 v ) {
		float maxComponent = max3( abs( v ) );
		return length( v / maxComponent ) * maxComponent;
	}
#endif
struct IncidentLight {
	vec3 color;
	vec3 direction;
	bool visible;
};
struct ReflectedLight {
	vec3 directDiffuse;
	vec3 directSpecular;
	vec3 indirectDiffuse;
	vec3 indirectSpecular;
};
#ifdef USE_ALPHAHASH
	varying vec3 vPosition;
#endif
vec3 transformDirection( in vec3 dir, in mat4 matrix ) {
	return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );
}
#define inverseTransformDirection transformDirectionByInverseViewMatrix
vec3 transformNormalByInverseViewMatrix( in vec3 normal, in mat4 viewMatrix ) {
	return normalize( ( vec4( normal, 0.0 ) * viewMatrix ).xyz );
}
vec3 transformDirectionByInverseViewMatrix( in vec3 dir, in mat4 viewMatrix ) {
	return normalize( ( vec4( dir, 0.0 ) * viewMatrix ).xyz );
}
bool isPerspectiveMatrix( mat4 m ) {
	return m[ 2 ][ 3 ] == - 1.0;
}
vec2 equirectUv( in vec3 dir ) {
	float u = atan( dir.z, dir.x ) * RECIPROCAL_PI2 + 0.5;
	float v = asin( clamp( dir.y, - 1.0, 1.0 ) ) * RECIPROCAL_PI + 0.5;
	return vec2( u, v );
}
vec3 BRDF_Lambert( const in vec3 diffuseColor ) {
	return RECIPROCAL_PI * diffuseColor;
}
vec3 F_Schlick( const in vec3 f0, const in float f90, const in float dotVH ) {
	float fresnel = exp2( ( - 5.55473 * dotVH - 6.98316 ) * dotVH );
	return f0 * ( 1.0 - fresnel ) + ( f90 * fresnel );
}
float F_Schlick( const in float f0, const in float f90, const in float dotVH ) {
	float fresnel = exp2( ( - 5.55473 * dotVH - 6.98316 ) * dotVH );
	return f0 * ( 1.0 - fresnel ) + ( f90 * fresnel );
} // validated`,bd=`#ifdef ENVMAP_TYPE_CUBE_UV
	#define cubeUV_minMipLevel 4.0
	#define cubeUV_minTileSize 16.0
	float getFace( vec3 direction ) {
		vec3 absDirection = abs( direction );
		float face = - 1.0;
		if ( absDirection.x > absDirection.z ) {
			if ( absDirection.x > absDirection.y )
				face = direction.x > 0.0 ? 0.0 : 3.0;
			else
				face = direction.y > 0.0 ? 1.0 : 4.0;
		} else {
			if ( absDirection.z > absDirection.y )
				face = direction.z > 0.0 ? 2.0 : 5.0;
			else
				face = direction.y > 0.0 ? 1.0 : 4.0;
		}
		return face;
	}
	vec2 getUV( vec3 direction, float face ) {
		vec2 uv;
		if ( face == 0.0 ) {
			uv = vec2( direction.z, direction.y ) / abs( direction.x );
		} else if ( face == 1.0 ) {
			uv = vec2( - direction.x, - direction.z ) / abs( direction.y );
		} else if ( face == 2.0 ) {
			uv = vec2( - direction.x, direction.y ) / abs( direction.z );
		} else if ( face == 3.0 ) {
			uv = vec2( - direction.z, direction.y ) / abs( direction.x );
		} else if ( face == 4.0 ) {
			uv = vec2( - direction.x, direction.z ) / abs( direction.y );
		} else {
			uv = vec2( direction.x, direction.y ) / abs( direction.z );
		}
		return 0.5 * ( uv + 1.0 );
	}
	vec3 bilinearCubeUV( sampler2D envMap, vec3 direction, float mipInt ) {
		float face = getFace( direction );
		float filterInt = max( cubeUV_minMipLevel - mipInt, 0.0 );
		mipInt = max( mipInt, cubeUV_minMipLevel );
		float faceSize = exp2( mipInt );
		highp vec2 uv = getUV( direction, face ) * ( faceSize - 2.0 ) + 1.0;
		if ( face > 2.0 ) {
			uv.y += faceSize;
			face -= 3.0;
		}
		uv.x += face * faceSize;
		uv.x += filterInt * 3.0 * cubeUV_minTileSize;
		uv.y += 4.0 * ( exp2( CUBEUV_MAX_MIP ) - faceSize );
		uv.x *= CUBEUV_TEXEL_WIDTH;
		uv.y *= CUBEUV_TEXEL_HEIGHT;
		#ifdef texture2DGradEXT
			return texture2DGradEXT( envMap, uv, vec2( 0.0 ), vec2( 0.0 ) ).rgb;
		#else
			return texture2D( envMap, uv ).rgb;
		#endif
	}
	#define cubeUV_r0 1.0
	#define cubeUV_m0 - 2.0
	#define cubeUV_r1 0.8
	#define cubeUV_m1 - 1.0
	#define cubeUV_r4 0.4
	#define cubeUV_m4 2.0
	#define cubeUV_r5 0.305
	#define cubeUV_m5 3.0
	#define cubeUV_r6 0.21
	#define cubeUV_m6 4.0
	float roughnessToMip( float roughness ) {
		float mip = 0.0;
		if ( roughness >= cubeUV_r1 ) {
			mip = ( cubeUV_r0 - roughness ) * ( cubeUV_m1 - cubeUV_m0 ) / ( cubeUV_r0 - cubeUV_r1 ) + cubeUV_m0;
		} else if ( roughness >= cubeUV_r4 ) {
			mip = ( cubeUV_r1 - roughness ) * ( cubeUV_m4 - cubeUV_m1 ) / ( cubeUV_r1 - cubeUV_r4 ) + cubeUV_m1;
		} else if ( roughness >= cubeUV_r5 ) {
			mip = ( cubeUV_r4 - roughness ) * ( cubeUV_m5 - cubeUV_m4 ) / ( cubeUV_r4 - cubeUV_r5 ) + cubeUV_m4;
		} else if ( roughness >= cubeUV_r6 ) {
			mip = ( cubeUV_r5 - roughness ) * ( cubeUV_m6 - cubeUV_m5 ) / ( cubeUV_r5 - cubeUV_r6 ) + cubeUV_m5;
		} else {
			mip = - 2.0 * log2( 1.16 * roughness );		}
		return mip;
	}
	vec4 textureCubeUV( sampler2D envMap, vec3 sampleDir, float roughness ) {
		float mip = clamp( roughnessToMip( roughness ), cubeUV_m0, CUBEUV_MAX_MIP );
		float mipF = fract( mip );
		float mipInt = floor( mip );
		vec3 color0 = bilinearCubeUV( envMap, sampleDir, mipInt );
		if ( mipF == 0.0 ) {
			return vec4( color0, 1.0 );
		} else {
			vec3 color1 = bilinearCubeUV( envMap, sampleDir, mipInt + 1.0 );
			return vec4( mix( color0, color1, mipF ), 1.0 );
		}
	}
#endif`,Td=`vec3 transformedNormal = objectNormal;
#ifdef USE_TANGENT
	vec3 transformedTangent = objectTangent;
#endif
#ifdef USE_BATCHING
	mat3 bm = mat3( batchingMatrix );
	transformedNormal /= vec3( dot( bm[ 0 ], bm[ 0 ] ), dot( bm[ 1 ], bm[ 1 ] ), dot( bm[ 2 ], bm[ 2 ] ) );
	transformedNormal = bm * transformedNormal;
	#ifdef USE_TANGENT
		transformedTangent = bm * transformedTangent;
	#endif
#endif
#ifdef USE_INSTANCING
	mat3 im = mat3( instanceMatrix );
	transformedNormal /= vec3( dot( im[ 0 ], im[ 0 ] ), dot( im[ 1 ], im[ 1 ] ), dot( im[ 2 ], im[ 2 ] ) );
	transformedNormal = im * transformedNormal;
	#ifdef USE_TANGENT
		transformedTangent = im * transformedTangent;
	#endif
#endif
transformedNormal = normalMatrix * transformedNormal;
#ifdef FLIP_SIDED
	transformedNormal = - transformedNormal;
#endif
#ifdef USE_TANGENT
	transformedTangent = ( modelViewMatrix * vec4( transformedTangent, 0.0 ) ).xyz;
#endif`,Ed=`#ifdef USE_DISPLACEMENTMAP
	uniform sampler2D displacementMap;
	uniform float displacementScale;
	uniform float displacementBias;
#endif`,Ad=`#ifdef USE_DISPLACEMENTMAP
	transformed += normalize( objectNormal ) * ( texture2D( displacementMap, vDisplacementMapUv ).x * displacementScale + displacementBias );
#endif`,wd=`#ifdef USE_EMISSIVEMAP
	vec4 emissiveColor = texture2D( emissiveMap, vEmissiveMapUv );
	#ifdef DECODE_VIDEO_TEXTURE_EMISSIVE
		emissiveColor = sRGBTransferEOTF( emissiveColor );
	#endif
	totalEmissiveRadiance *= emissiveColor.rgb;
#endif`,Cd=`#ifdef USE_EMISSIVEMAP
	uniform sampler2D emissiveMap;
#endif`,Rd="gl_FragColor = linearToOutputTexel( gl_FragColor );",Id=`vec4 LinearTransferOETF( in vec4 value ) {
	return value;
}
vec4 sRGBTransferEOTF( in vec4 value ) {
	return vec4( mix( pow( value.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), value.rgb * 0.0773993808, vec3( lessThanEqual( value.rgb, vec3( 0.04045 ) ) ) ), value.a );
}
vec4 sRGBTransferOETF( in vec4 value ) {
	return vec4( mix( pow( value.rgb, vec3( 0.41666 ) ) * 1.055 - vec3( 0.055 ), value.rgb * 12.92, vec3( lessThanEqual( value.rgb, vec3( 0.0031308 ) ) ) ), value.a );
}`,Pd=`#ifdef USE_ENVMAP
	#ifdef ENV_WORLDPOS
		vec3 cameraToFrag;
		if ( isOrthographic ) {
			cameraToFrag = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );
		} else {
			cameraToFrag = normalize( vWorldPosition - cameraPosition );
		}
		vec3 worldNormal = transformNormalByInverseViewMatrix( normal, viewMatrix );
		#ifdef ENVMAP_MODE_REFLECTION
			vec3 reflectVec = reflect( cameraToFrag, worldNormal );
		#else
			vec3 reflectVec = refract( cameraToFrag, worldNormal, refractionRatio );
		#endif
	#else
		vec3 reflectVec = vReflect;
	#endif
	#ifdef ENVMAP_TYPE_CUBE
		vec4 envColor = textureCube( envMap, envMapRotation * reflectVec );
		#ifdef ENVMAP_BLENDING_MULTIPLY
			outgoingLight = mix( outgoingLight, outgoingLight * envColor.xyz, specularStrength * reflectivity );
		#elif defined( ENVMAP_BLENDING_MIX )
			outgoingLight = mix( outgoingLight, envColor.xyz, specularStrength * reflectivity );
		#elif defined( ENVMAP_BLENDING_ADD )
			outgoingLight += envColor.xyz * specularStrength * reflectivity;
		#endif
	#endif
#endif`,Ld=`#ifdef USE_ENVMAP
	uniform float envMapIntensity;
	uniform mat3 envMapRotation;
	#ifdef ENVMAP_TYPE_CUBE
		uniform samplerCube envMap;
	#else
		uniform sampler2D envMap;
	#endif
#endif`,Nd=`#ifdef USE_ENVMAP
	uniform float reflectivity;
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		varying vec3 vWorldPosition;
		uniform float refractionRatio;
	#else
		varying vec3 vReflect;
	#endif
#endif`,Dd=`#ifdef USE_ENVMAP
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		
		varying vec3 vWorldPosition;
	#else
		varying vec3 vReflect;
		uniform float refractionRatio;
	#endif
#endif`,Ud=`#ifdef USE_ENVMAP
	#ifdef ENV_WORLDPOS
		vWorldPosition = worldPosition.xyz;
	#else
		vec3 cameraToVertex;
		if ( isOrthographic ) {
			cameraToVertex = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );
		} else {
			cameraToVertex = normalize( worldPosition.xyz - cameraPosition );
		}
		vec3 worldNormal = transformNormalByInverseViewMatrix( transformedNormal, viewMatrix );
		#ifdef ENVMAP_MODE_REFLECTION
			vReflect = reflect( cameraToVertex, worldNormal );
		#else
			vReflect = refract( cameraToVertex, worldNormal, refractionRatio );
		#endif
	#endif
#endif`,Fd=`#ifdef USE_FOG
	vFogDepth = - mvPosition.z;
#endif`,Od=`#ifdef USE_FOG
	varying float vFogDepth;
#endif`,Bd=`#ifdef USE_FOG
	#ifdef FOG_EXP2
		float fogFactor = 1.0 - exp( - fogDensity * fogDensity * vFogDepth * vFogDepth );
	#else
		float fogFactor = smoothstep( fogNear, fogFar, vFogDepth );
	#endif
	gl_FragColor.rgb = mix( gl_FragColor.rgb, fogColor, fogFactor );
#endif`,zd=`#ifdef USE_FOG
	uniform vec3 fogColor;
	varying float vFogDepth;
	#ifdef FOG_EXP2
		uniform float fogDensity;
	#else
		uniform float fogNear;
		uniform float fogFar;
	#endif
#endif`,Gd=`#ifdef USE_GRADIENTMAP
	uniform sampler2D gradientMap;
#endif
vec3 getGradientIrradiance( vec3 normal, vec3 lightDirection ) {
	float dotNL = dot( normal, lightDirection );
	vec2 coord = vec2( dotNL * 0.5 + 0.5, 0.0 );
	#ifdef USE_GRADIENTMAP
		return vec3( texture2D( gradientMap, coord ).r );
	#else
		vec2 fw = fwidth( coord ) * 0.5;
		return mix( vec3( 0.7 ), vec3( 1.0 ), smoothstep( 0.7 - fw.x, 0.7 + fw.x, coord.x ) );
	#endif
}`,kd=`#ifdef USE_LIGHTMAP
	uniform sampler2D lightMap;
	uniform float lightMapIntensity;
#endif`,Hd=`LambertMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularStrength = specularStrength;`,Vd=`varying vec3 vViewPosition;
struct LambertMaterial {
	vec3 diffuseColor;
	float specularStrength;
};
void RE_Direct_Lambert( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in LambertMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Lambert( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in LambertMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_Lambert
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Lambert`,Wd=`uniform bool receiveShadow;
uniform vec3 ambientLightColor;
#if defined( USE_LIGHT_PROBES )
	uniform vec3 lightProbe[ 9 ];
#endif
vec3 shGetIrradianceAt( in vec3 normal, in vec3 shCoefficients[ 9 ] ) {
	float x = normal.x, y = normal.y, z = normal.z;
	vec3 result = shCoefficients[ 0 ] * 0.886227;
	result += shCoefficients[ 1 ] * 2.0 * 0.511664 * y;
	result += shCoefficients[ 2 ] * 2.0 * 0.511664 * z;
	result += shCoefficients[ 3 ] * 2.0 * 0.511664 * x;
	result += shCoefficients[ 4 ] * 2.0 * 0.429043 * x * y;
	result += shCoefficients[ 5 ] * 2.0 * 0.429043 * y * z;
	result += shCoefficients[ 6 ] * ( 0.743125 * z * z - 0.247708 );
	result += shCoefficients[ 7 ] * 2.0 * 0.429043 * x * z;
	result += shCoefficients[ 8 ] * 0.429043 * ( x * x - y * y );
	return result;
}
vec3 getLightProbeIrradiance( const in vec3 lightProbe[ 9 ], const in vec3 normal ) {
	vec3 worldNormal = transformNormalByInverseViewMatrix( normal, viewMatrix );
	vec3 irradiance = shGetIrradianceAt( worldNormal, lightProbe );
	return irradiance;
}
vec3 getAmbientLightIrradiance( const in vec3 ambientLightColor ) {
	vec3 irradiance = ambientLightColor;
	return irradiance;
}
float getDistanceAttenuation( const in float lightDistance, const in float cutoffDistance, const in float decayExponent ) {
	float distanceFalloff = 1.0 / max( pow( lightDistance, decayExponent ), 0.01 );
	if ( cutoffDistance > 0.0 ) {
		distanceFalloff *= pow2( saturate( 1.0 - pow4( lightDistance / cutoffDistance ) ) );
	}
	return distanceFalloff;
}
float getSpotAttenuation( const in float coneCosine, const in float penumbraCosine, const in float angleCosine ) {
	return smoothstep( coneCosine, penumbraCosine, angleCosine );
}
#if NUM_SUN_LIGHTS > 0
	struct SunLight {
		vec3 direction;
		vec3 color;
	};
	uniform SunLight sunLights[ NUM_SUN_LIGHTS ];
	void getSunLightInfo( const in SunLight sunLight, out IncidentLight light ) {
		light.color = sunLight.color;
		light.direction = sunLight.direction;
		light.visible = true;
	}
#endif
#if NUM_DIR_LIGHTS > 0
	struct DirectionalLight {
		vec3 direction;
		vec3 color;
	};
	uniform DirectionalLight directionalLights[ NUM_DIR_LIGHTS ];
	void getDirectionalLightInfo( const in DirectionalLight directionalLight, out IncidentLight light ) {
		light.color = directionalLight.color;
		light.direction = directionalLight.direction;
		light.visible = true;
	}
#endif
#if NUM_POINT_LIGHTS > 0
	struct PointLight {
		vec3 position;
		vec3 color;
		float distance;
		float decay;
	};
	uniform PointLight pointLights[ NUM_POINT_LIGHTS ];
	void getPointLightInfo( const in PointLight pointLight, const in vec3 geometryPosition, out IncidentLight light ) {
		vec3 lVector = pointLight.position - geometryPosition;
		light.direction = normalize( lVector );
		float lightDistance = length( lVector );
		light.color = pointLight.color;
		light.color *= getDistanceAttenuation( lightDistance, pointLight.distance, pointLight.decay );
		light.visible = ( light.color != vec3( 0.0 ) );
	}
#endif
#if NUM_SPOT_LIGHTS > 0
	struct SpotLight {
		vec3 position;
		vec3 direction;
		vec3 color;
		float distance;
		float decay;
		float coneCos;
		float penumbraCos;
	};
	uniform SpotLight spotLights[ NUM_SPOT_LIGHTS ];
	void getSpotLightInfo( const in SpotLight spotLight, const in vec3 geometryPosition, out IncidentLight light ) {
		vec3 lVector = spotLight.position - geometryPosition;
		light.direction = normalize( lVector );
		float angleCos = dot( light.direction, spotLight.direction );
		float spotAttenuation = getSpotAttenuation( spotLight.coneCos, spotLight.penumbraCos, angleCos );
		if ( spotAttenuation > 0.0 ) {
			float lightDistance = length( lVector );
			light.color = spotLight.color * spotAttenuation;
			light.color *= getDistanceAttenuation( lightDistance, spotLight.distance, spotLight.decay );
			light.visible = ( light.color != vec3( 0.0 ) );
		} else {
			light.color = vec3( 0.0 );
			light.visible = false;
		}
	}
#endif
#if NUM_RECT_AREA_LIGHTS > 0
	struct RectAreaLight {
		vec3 color;
		vec3 position;
		vec3 halfWidth;
		vec3 halfHeight;
	};
	uniform sampler2D ltc_1;	uniform sampler2D ltc_2;
	uniform RectAreaLight rectAreaLights[ NUM_RECT_AREA_LIGHTS ];
#endif
#if NUM_HEMI_LIGHTS > 0
	struct HemisphereLight {
		vec3 direction;
		vec3 skyColor;
		vec3 groundColor;
	};
	uniform HemisphereLight hemisphereLights[ NUM_HEMI_LIGHTS ];
	vec3 getHemisphereLightIrradiance( const in HemisphereLight hemiLight, const in vec3 normal ) {
		float dotNL = dot( normal, hemiLight.direction );
		float hemiDiffuseWeight = 0.5 * dotNL + 0.5;
		vec3 irradiance = mix( hemiLight.groundColor, hemiLight.skyColor, hemiDiffuseWeight );
		return irradiance;
	}
#endif
#include <lightprobes_pars_fragment>`,Xd=`#ifdef USE_ENVMAP
	vec3 getIBLIrradiance( const in vec3 normal ) {
		#ifdef ENVMAP_TYPE_CUBE_UV
			vec3 worldNormal = transformNormalByInverseViewMatrix( normal, viewMatrix );
			vec4 envMapColor = textureCubeUV( envMap, envMapRotation * worldNormal, 1.0 );
			return PI * envMapColor.rgb * envMapIntensity;
		#else
			return vec3( 0.0 );
		#endif
	}
	vec3 getIBLRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness ) {
		#ifdef ENVMAP_TYPE_CUBE_UV
			vec3 reflectVec = reflect( - viewDir, normal );
			reflectVec = normalize( mix( reflectVec, normal, pow4( roughness ) ) );
			reflectVec = transformDirectionByInverseViewMatrix( reflectVec, viewMatrix );
			vec4 envMapColor = textureCubeUV( envMap, envMapRotation * reflectVec, roughness );
			return envMapColor.rgb * envMapIntensity;
		#else
			return vec3( 0.0 );
		#endif
	}
	#ifdef USE_RETROREFLECTION
		vec3 getIBLRetroRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness ) {
			#ifdef ENVMAP_TYPE_CUBE_UV
				vec3 retroVec = normalize( mix( viewDir, normal, pow4( roughness ) ) );
				retroVec = transformDirectionByInverseViewMatrix( retroVec, viewMatrix );
				vec4 envMapColor = textureCubeUV( envMap, envMapRotation * retroVec, roughness );
				return envMapColor.rgb * envMapIntensity;
			#else
				return vec3( 0.0 );
			#endif
		}
	#endif
	#ifdef USE_ANISOTROPY
		vec3 getIBLAnisotropyRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness, const in vec3 bitangent, const in float anisotropy ) {
			#ifdef ENVMAP_TYPE_CUBE_UV
				vec3 bentNormal = cross( bitangent, viewDir );
				bentNormal = normalize( cross( bentNormal, bitangent ) );
				bentNormal = normalize( mix( bentNormal, normal, pow2( pow2( 1.0 - anisotropy * ( 1.0 - roughness ) ) ) ) );
				return getIBLRadiance( viewDir, bentNormal, roughness );
			#else
				return vec3( 0.0 );
			#endif
		}
		#ifdef USE_RETROREFLECTION
			vec3 getIBLAnisotropyRetroRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness, const in vec3 bitangent, const in float anisotropy ) {
				#ifdef ENVMAP_TYPE_CUBE_UV
					vec3 bentNormal = cross( bitangent, viewDir );
					bentNormal = normalize( cross( bentNormal, bitangent ) );
					bentNormal = normalize( mix( bentNormal, normal, pow2( pow2( 1.0 - anisotropy * ( 1.0 - roughness ) ) ) ) );
					return getIBLRetroRadiance( viewDir, bentNormal, roughness );
				#else
					return vec3( 0.0 );
				#endif
			}
		#endif
	#endif
#endif`,qd=`ToonMaterial material;
material.diffuseColor = diffuseColor.rgb;`,Yd=`varying vec3 vViewPosition;
struct ToonMaterial {
	vec3 diffuseColor;
};
void RE_Direct_Toon( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in ToonMaterial material, inout ReflectedLight reflectedLight ) {
	vec3 irradiance = getGradientIrradiance( geometryNormal, directLight.direction ) * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Toon( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in ToonMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_Toon
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Toon`,Zd=`BlinnPhongMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularColor = specular;
material.specularShininess = shininess;
material.specularStrength = specularStrength;`,Jd=`varying vec3 vViewPosition;
struct BlinnPhongMaterial {
	vec3 diffuseColor;
	vec3 specularColor;
	float specularShininess;
	float specularStrength;
};
void RE_Direct_BlinnPhong( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
	reflectedLight.directSpecular += irradiance * BRDF_BlinnPhong( directLight.direction, geometryViewDir, geometryNormal, material.specularColor, material.specularShininess ) * material.specularStrength;
}
void RE_IndirectDiffuse_BlinnPhong( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_BlinnPhong
#define RE_IndirectDiffuse		RE_IndirectDiffuse_BlinnPhong`,$d=`PhysicalMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.diffuseContribution = diffuseColor.rgb * ( 1.0 - metalnessFactor );
material.metalness = metalnessFactor;
vec3 dxy = max( abs( dFdx( nonPerturbedNormal ) ), abs( dFdy( nonPerturbedNormal ) ) );
float geometryRoughness = max( max( dxy.x, dxy.y ), dxy.z );
material.roughness = max( roughnessFactor, 0.0525 );material.roughness += geometryRoughness;
material.roughness = min( material.roughness, 1.0 );
#ifdef IOR
	material.ior = ior;
	#ifdef USE_SPECULAR
		float specularIntensityFactor = specularIntensity;
		vec3 specularColorFactor = specularColor;
		#ifdef USE_SPECULAR_COLORMAP
			specularColorFactor *= texture2D( specularColorMap, vSpecularColorMapUv ).rgb;
		#endif
		#ifdef USE_SPECULAR_INTENSITYMAP
			specularIntensityFactor *= texture2D( specularIntensityMap, vSpecularIntensityMapUv ).a;
		#endif
		material.specularF90 = mix( specularIntensityFactor, 1.0, metalnessFactor );
	#else
		float specularIntensityFactor = 1.0;
		vec3 specularColorFactor = vec3( 1.0 );
		material.specularF90 = 1.0;
	#endif
	material.specularColor = min( pow2( ( material.ior - 1.0 ) / ( material.ior + 1.0 ) ) * specularColorFactor, vec3( 1.0 ) ) * specularIntensityFactor;
	material.specularColorBlended = mix( material.specularColor, diffuseColor.rgb, metalnessFactor );
#else
	material.specularColor = vec3( 0.04 );
	material.specularColorBlended = mix( material.specularColor, diffuseColor.rgb, metalnessFactor );
	material.specularF90 = 1.0;
#endif
#ifdef USE_CLEARCOAT
	material.clearcoat = clearcoat;
	material.clearcoatRoughness = clearcoatRoughness;
	material.clearcoatF0 = vec3( 0.04 );
	material.clearcoatF90 = 1.0;
	#ifdef USE_CLEARCOATMAP
		material.clearcoat *= texture2D( clearcoatMap, vClearcoatMapUv ).x;
	#endif
	#ifdef USE_CLEARCOAT_ROUGHNESSMAP
		material.clearcoatRoughness *= texture2D( clearcoatRoughnessMap, vClearcoatRoughnessMapUv ).y;
	#endif
	material.clearcoat = saturate( material.clearcoat );	material.clearcoatRoughness = max( material.clearcoatRoughness, 0.0525 );
	material.clearcoatRoughness += geometryRoughness;
	material.clearcoatRoughness = min( material.clearcoatRoughness, 1.0 );
#endif
#ifdef USE_DISPERSION
	material.dispersion = dispersion;
#endif
#ifdef USE_RETROREFLECTION
	material.retroreflectivity = retroreflectivity;
#endif
#ifdef USE_IRIDESCENCE
	material.iridescence = iridescence;
	material.iridescenceIOR = iridescenceIOR;
	#ifdef USE_IRIDESCENCEMAP
		material.iridescence *= texture2D( iridescenceMap, vIridescenceMapUv ).r;
	#endif
	#ifdef USE_IRIDESCENCE_THICKNESSMAP
		material.iridescenceThickness = (iridescenceThicknessMaximum - iridescenceThicknessMinimum) * texture2D( iridescenceThicknessMap, vIridescenceThicknessMapUv ).g + iridescenceThicknessMinimum;
	#else
		material.iridescenceThickness = iridescenceThicknessMaximum;
	#endif
#endif
#ifdef USE_SHEEN
	material.sheenColor = sheenColor;
	#ifdef USE_SHEEN_COLORMAP
		material.sheenColor *= texture2D( sheenColorMap, vSheenColorMapUv ).rgb;
	#endif
	material.sheenRoughness = clamp( sheenRoughness, 0.0001, 1.0 );
	#ifdef USE_SHEEN_ROUGHNESSMAP
		material.sheenRoughness *= texture2D( sheenRoughnessMap, vSheenRoughnessMapUv ).a;
	#endif
#endif
#ifdef USE_ANISOTROPY
	#ifdef USE_ANISOTROPYMAP
		mat2 anisotropyMat = mat2( anisotropyVector.x, anisotropyVector.y, - anisotropyVector.y, anisotropyVector.x );
		vec3 anisotropyPolar = texture2D( anisotropyMap, vAnisotropyMapUv ).rgb;
		vec2 anisotropyV = anisotropyMat * normalize( 2.0 * anisotropyPolar.rg - vec2( 1.0 ) ) * anisotropyPolar.b;
	#else
		vec2 anisotropyV = anisotropyVector;
	#endif
	material.anisotropy = length( anisotropyV );
	if( material.anisotropy == 0.0 ) {
		anisotropyV = vec2( 1.0, 0.0 );
	} else {
		anisotropyV /= material.anisotropy;
		material.anisotropy = saturate( material.anisotropy );
	}
	material.alphaT = mix( pow2( material.roughness ), 1.0, pow2( material.anisotropy ) );
	material.anisotropyT = tbn[ 0 ] * anisotropyV.x + tbn[ 1 ] * anisotropyV.y;
	material.anisotropyB = tbn[ 1 ] * anisotropyV.x - tbn[ 0 ] * anisotropyV.y;
#endif`,Kd=`uniform sampler2D dfgLUT;
struct PhysicalMaterial {
	vec3 diffuseColor;
	vec3 diffuseContribution;
	vec3 specularColor;
	vec3 specularColorBlended;
	float roughness;
	float metalness;
	float specularF90;
	float dispersion;
	vec2 dfg;
	vec3 multiScatteringCompensation;
	#ifdef USE_RETROREFLECTION
		float retroreflectivity;
	#endif
	#ifdef USE_CLEARCOAT
		float clearcoat;
		float clearcoatRoughness;
		vec3 clearcoatF0;
		float clearcoatF90;
	#endif
	#ifdef USE_IRIDESCENCE
		float iridescence;
		float iridescenceIOR;
		float iridescenceThickness;
		vec3 iridescenceFresnel;
		vec3 iridescenceF0Dielectric;
		vec3 iridescenceF0Metallic;
	#endif
	#ifdef USE_SHEEN
		vec3 sheenColor;
		float sheenRoughness;
	#endif
	#ifdef IOR
		float ior;
	#endif
	#ifdef USE_TRANSMISSION
		float transmission;
		float transmissionAlpha;
		float thickness;
		float attenuationDistance;
		vec3 attenuationColor;
	#endif
	#ifdef USE_ANISOTROPY
		float anisotropy;
		float alphaT;
		vec3 anisotropyT;
		vec3 anisotropyB;
	#endif
};
vec3 clearcoatSpecularDirect = vec3( 0.0 );
vec3 clearcoatSpecularIndirect = vec3( 0.0 );
vec3 sheenSpecularDirect = vec3( 0.0 );
vec3 sheenSpecularIndirect = vec3(0.0 );
vec3 Schlick_to_F0( const in vec3 f, const in float f90, const in float dotVH ) {
    float x = clamp( 1.0 - dotVH, 0.0, 1.0 );
    float x2 = x * x;
    float x5 = clamp( x * x2 * x2, 0.0, 0.9999 );
    return ( f - vec3( f90 ) * x5 ) / ( 1.0 - x5 );
}
float V_GGX_SmithCorrelated( const in float alpha, const in float dotNL, const in float dotNV ) {
	float a2 = pow2( alpha );
	float gv = dotNL * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNV ) );
	float gl = dotNV * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNL ) );
	return 0.5 / max( gv + gl, EPSILON );
}
float D_GGX( const in float alpha, const in float dotNH ) {
	float a2 = pow2( alpha );
	float denom = pow2( dotNH ) * ( a2 - 1.0 ) + 1.0;
	return RECIPROCAL_PI * a2 / pow2( denom );
}
#ifdef USE_ANISOTROPY
	float V_GGX_SmithCorrelated_Anisotropic( const in float alphaT, const in float alphaB, const in float dotTV, const in float dotBV, const in float dotTL, const in float dotBL, const in float dotNV, const in float dotNL ) {
		float gv = dotNL * length( vec3( alphaT * dotTV, alphaB * dotBV, dotNV ) );
		float gl = dotNV * length( vec3( alphaT * dotTL, alphaB * dotBL, dotNL ) );
		return 0.5 / max( gv + gl, EPSILON );
	}
	float D_GGX_Anisotropic( const in float alphaT, const in float alphaB, const in float dotNH, const in float dotTH, const in float dotBH ) {
		float a2 = alphaT * alphaB;
		highp vec3 v = vec3( alphaB * dotTH, alphaT * dotBH, a2 * dotNH );
		highp float v2 = dot( v, v );
		float w2 = a2 / v2;
		return RECIPROCAL_PI * a2 * pow2 ( w2 );
	}
#endif
#ifdef USE_CLEARCOAT
	vec3 BRDF_GGX_Clearcoat( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material) {
		vec3 f0 = material.clearcoatF0;
		float f90 = material.clearcoatF90;
		float roughness = material.clearcoatRoughness;
		float alpha = pow2( roughness );
		vec3 halfDir = normalize( lightDir + viewDir );
		float dotNL = saturate( dot( normal, lightDir ) );
		float dotNV = saturate( dot( normal, viewDir ) );
		float dotNH = saturate( dot( normal, halfDir ) );
		float dotVH = saturate( dot( viewDir, halfDir ) );
		vec3 F = F_Schlick( f0, f90, dotVH );
		float V = V_GGX_SmithCorrelated( alpha, dotNL, dotNV );
		float D = D_GGX( alpha, dotNH );
		return F * ( V * D );
	}
#endif
vec3 BRDF_GGX( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material ) {
	vec3 f0 = material.specularColorBlended;
	float f90 = material.specularF90;
	float roughness = material.roughness;
	float alpha = pow2( roughness );
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	float dotNH = saturate( dot( normal, halfDir ) );
	float dotVH = saturate( dot( viewDir, halfDir ) );
	vec3 F = F_Schlick( f0, f90, dotVH );
	#ifdef USE_IRIDESCENCE
		F = mix( F, material.iridescenceFresnel, material.iridescence );
	#endif
	#ifdef USE_ANISOTROPY
		float dotTL = dot( material.anisotropyT, lightDir );
		float dotTV = dot( material.anisotropyT, viewDir );
		float dotTH = dot( material.anisotropyT, halfDir );
		float dotBL = dot( material.anisotropyB, lightDir );
		float dotBV = dot( material.anisotropyB, viewDir );
		float dotBH = dot( material.anisotropyB, halfDir );
		float V = V_GGX_SmithCorrelated_Anisotropic( material.alphaT, alpha, dotTV, dotBV, dotTL, dotBL, dotNV, dotNL );
		float D = D_GGX_Anisotropic( material.alphaT, alpha, dotNH, dotTH, dotBH );
	#else
		float V = V_GGX_SmithCorrelated( alpha, dotNL, dotNV );
		float D = D_GGX( alpha, dotNH );
	#endif
	return F * ( V * D );
}
vec2 LTC_Uv( const in vec3 N, const in vec3 V, const in float roughness ) {
	const float LUT_SIZE = 64.0;
	const float LUT_SCALE = ( LUT_SIZE - 1.0 ) / LUT_SIZE;
	const float LUT_BIAS = 0.5 / LUT_SIZE;
	float dotNV = saturate( dot( N, V ) );
	vec2 uv = vec2( roughness, sqrt( 1.0 - dotNV ) );
	uv = uv * LUT_SCALE + LUT_BIAS;
	return uv;
}
float LTC_ClippedSphereFormFactor( const in vec3 f ) {
	float l = length( f );
	return max( ( l * l + f.z ) / ( l + 1.0 ), 0.0 );
}
vec3 LTC_EdgeVectorFormFactor( const in vec3 v1, const in vec3 v2 ) {
	float x = dot( v1, v2 );
	float y = abs( x );
	float a = 0.8543985 + ( 0.4965155 + 0.0145206 * y ) * y;
	float b = 3.4175940 + ( 4.1616724 + y ) * y;
	float v = a / b;
	float theta_sintheta = ( x > 0.0 ) ? v : 0.5 * inversesqrt( max( 1.0 - x * x, 1e-7 ) ) - v;
	return cross( v1, v2 ) * theta_sintheta;
}
vec3 LTC_Evaluate( const in vec3 N, const in vec3 V, const in vec3 P, const in mat3 mInv, const in vec3 rectCoords[ 4 ] ) {
	vec3 v1 = rectCoords[ 1 ] - rectCoords[ 0 ];
	vec3 v2 = rectCoords[ 3 ] - rectCoords[ 0 ];
	vec3 lightNormal = cross( v1, v2 );
	if( dot( lightNormal, P - rectCoords[ 0 ] ) < 0.0 ) return vec3( 0.0 );
	vec3 T1, T2;
	T1 = normalize( V - N * dot( V, N ) );
	T2 = - cross( N, T1 );
	mat3 mat = mInv * transpose( mat3( T1, T2, N ) );
	vec3 coords[ 4 ];
	coords[ 0 ] = mat * ( rectCoords[ 0 ] - P );
	coords[ 1 ] = mat * ( rectCoords[ 1 ] - P );
	coords[ 2 ] = mat * ( rectCoords[ 2 ] - P );
	coords[ 3 ] = mat * ( rectCoords[ 3 ] - P );
	coords[ 0 ] = normalize( coords[ 0 ] );
	coords[ 1 ] = normalize( coords[ 1 ] );
	coords[ 2 ] = normalize( coords[ 2 ] );
	coords[ 3 ] = normalize( coords[ 3 ] );
	vec3 vectorFormFactor = vec3( 0.0 );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 0 ], coords[ 1 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 1 ], coords[ 2 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 2 ], coords[ 3 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 3 ], coords[ 0 ] );
	float result = LTC_ClippedSphereFormFactor( vectorFormFactor );
	return vec3( result );
}
#if defined( USE_SHEEN )
float D_Charlie( float roughness, float dotNH ) {
	float alpha = pow2( roughness );
	float invAlpha = 1.0 / alpha;
	float cos2h = dotNH * dotNH;
	float sin2h = max( 1.0 - cos2h, 0.0078125 );
	return ( 2.0 + invAlpha ) * pow( sin2h, invAlpha * 0.5 ) / ( 2.0 * PI );
}
float V_Neubelt( float dotNV, float dotNL ) {
	return saturate( 1.0 / ( 4.0 * ( dotNL + dotNV - dotNL * dotNV ) ) );
}
vec3 BRDF_Sheen( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, vec3 sheenColor, const in float sheenRoughness ) {
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	float dotNH = saturate( dot( normal, halfDir ) );
	float D = D_Charlie( sheenRoughness, dotNH );
	float V = V_Neubelt( dotNV, dotNL );
	return sheenColor * ( D * V );
}
#endif
float IBLSheenBRDF( const in vec3 normal, const in vec3 viewDir, const in float roughness ) {
	float dotNV = saturate( dot( normal, viewDir ) );
	float r2 = roughness * roughness;
	float rInv = 1.0 / ( roughness + 0.1 );
	float a = -1.9362 + 1.0678 * roughness + 0.4573 * r2 - 0.8469 * rInv;
	float b = -0.6014 + 0.5538 * roughness - 0.4670 * r2 - 0.1255 * rInv;
	float DG = exp( a * dotNV + b );
	return saturate( DG );
}
vec3 EnvironmentBRDF( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float roughness ) {
	float dotNV = saturate( dot( normal, viewDir ) );
	vec2 fab = texture2D( dfgLUT, vec2( roughness, dotNV ) ).rg;
	return specularColor * fab.x + specularF90 * fab.y;
}
#ifdef USE_IRIDESCENCE
void computeMultiscatteringIridescence( const in vec2 fab, const in vec3 specularColor, const in float specularF90, const in float iridescence, const in vec3 iridescenceF0, inout vec3 singleScatter, inout vec3 multiScatter ) {
#else
void computeMultiscattering( const in vec2 fab, const in vec3 specularColor, const in float specularF90, inout vec3 singleScatter, inout vec3 multiScatter ) {
#endif
	#ifdef USE_IRIDESCENCE
		vec3 Fr = mix( specularColor, iridescenceF0, iridescence );
	#else
		vec3 Fr = specularColor;
	#endif
	vec3 FssEss = Fr * fab.x + specularF90 * fab.y;
	float Ess = fab.x + fab.y;
	float Ems = 1.0 - Ess;
	vec3 Favg = Fr + ( 1.0 - Fr ) * 0.047619;	vec3 Fms = FssEss * Favg / ( 1.0 - Ems * Favg );
	singleScatter += FssEss;
	multiScatter += Fms * Ems;
}
#if NUM_RECT_AREA_LIGHTS > 0
	void RE_Direct_RectArea_Physical( const in RectAreaLight rectAreaLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
		vec3 normal = geometryNormal;
		vec3 viewDir = geometryViewDir;
		vec3 position = geometryPosition;
		vec3 lightPos = rectAreaLight.position;
		vec3 halfWidth = rectAreaLight.halfWidth;
		vec3 halfHeight = rectAreaLight.halfHeight;
		vec3 lightColor = rectAreaLight.color;
		float roughness = material.roughness;
		vec3 rectCoords[ 4 ];
		rectCoords[ 0 ] = lightPos + halfWidth - halfHeight;		rectCoords[ 1 ] = lightPos - halfWidth - halfHeight;
		rectCoords[ 2 ] = lightPos - halfWidth + halfHeight;
		rectCoords[ 3 ] = lightPos + halfWidth + halfHeight;
		vec2 uv = LTC_Uv( normal, viewDir, roughness );
		vec4 t1 = texture2D( ltc_1, uv );
		vec4 t2 = texture2D( ltc_2, uv );
		mat3 mInv = mat3(
			vec3( t1.x, 0, t1.y ),
			vec3(    0, 1,    0 ),
			vec3( t1.z, 0, t1.w )
		);
		vec3 fresnel = ( material.specularColorBlended * t2.x + ( material.specularF90 - material.specularColorBlended ) * t2.y );
		reflectedLight.directSpecular += lightColor * fresnel * LTC_Evaluate( normal, viewDir, position, mInv, rectCoords );
		reflectedLight.directDiffuse += lightColor * material.diffuseContribution * LTC_Evaluate( normal, viewDir, position, mat3( 1.0 ), rectCoords );
		#ifdef USE_CLEARCOAT
			vec3 Ncc = geometryClearcoatNormal;
			vec2 uvClearcoat = LTC_Uv( Ncc, viewDir, material.clearcoatRoughness );
			vec4 t1Clearcoat = texture2D( ltc_1, uvClearcoat );
			vec4 t2Clearcoat = texture2D( ltc_2, uvClearcoat );
			mat3 mInvClearcoat = mat3(
				vec3( t1Clearcoat.x, 0, t1Clearcoat.y ),
				vec3(             0, 1,             0 ),
				vec3( t1Clearcoat.z, 0, t1Clearcoat.w )
			);
			vec3 fresnelClearcoat = material.clearcoatF0 * t2Clearcoat.x + ( material.clearcoatF90 - material.clearcoatF0 ) * t2Clearcoat.y;
			clearcoatSpecularDirect += lightColor * fresnelClearcoat * LTC_Evaluate( Ncc, viewDir, position, mInvClearcoat, rectCoords );
		#endif
	}
#endif
void RE_Direct_Physical( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	#ifdef USE_CLEARCOAT
		float dotNLcc = saturate( dot( geometryClearcoatNormal, directLight.direction ) );
		vec3 ccIrradiance = dotNLcc * directLight.color;
		clearcoatSpecularDirect += ccIrradiance * BRDF_GGX_Clearcoat( directLight.direction, geometryViewDir, geometryClearcoatNormal, material );
	#endif
	#ifdef USE_SHEEN
 
 		sheenSpecularDirect += irradiance * BRDF_Sheen( directLight.direction, geometryViewDir, geometryNormal, material.sheenColor, material.sheenRoughness );
 
 		float sheenAlbedoV = IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness );
 		float sheenAlbedoL = IBLSheenBRDF( geometryNormal, directLight.direction, material.sheenRoughness );
 
 		float sheenEnergyComp = 1.0 - max3( material.sheenColor ) * max( sheenAlbedoV, sheenAlbedoL );
 
 		irradiance *= sheenEnergyComp;
 
 	#endif
	vec3 specularBRDF = BRDF_GGX( directLight.direction, geometryViewDir, geometryNormal, material );
	#ifdef USE_RETROREFLECTION
		vec3 retroViewDir = reflect( - geometryViewDir, geometryNormal );
		vec3 retroSpecularBRDF = BRDF_GGX( directLight.direction, retroViewDir, geometryNormal, material );
		specularBRDF = mix( specularBRDF, retroSpecularBRDF, saturate( material.retroreflectivity ) );
	#endif
	reflectedLight.directSpecular += irradiance * specularBRDF * material.multiScatteringCompensation;
	vec3 halfDir = normalize( directLight.direction + geometryViewDir );
	float dotVH = saturate( dot( geometryViewDir, halfDir ) );
	vec3 F = F_Schlick( material.specularColor, material.specularF90, dotVH );
	#ifdef USE_RETROREFLECTION
		vec3 retroHalfDir = normalize( directLight.direction + retroViewDir );
		float dotRetroVH = saturate( dot( retroViewDir, retroHalfDir ) );
		vec3 retroF = F_Schlick( material.specularColor, material.specularF90, dotRetroVH );
		F = mix( F, retroF, saturate( material.retroreflectivity ) );
	#endif
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseContribution ) * ( 1.0 - F );
}
void RE_IndirectDiffuse_Physical( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
	vec3 singleScattering = vec3( 0.0 );
	vec3 multiScattering = vec3( 0.0 );
	#ifdef USE_IRIDESCENCE
		computeMultiscatteringIridescence( material.dfg, material.specularColor, material.specularF90, material.iridescence, material.iridescenceF0Dielectric, singleScattering, multiScattering );
	#else
		computeMultiscattering( material.dfg, material.specularColor, material.specularF90, singleScattering, multiScattering );
	#endif
	vec3 diffuse = irradiance * BRDF_Lambert( material.diffuseContribution ) * ( 1.0 - singleScattering - multiScattering );
	#ifdef USE_SHEEN
		float sheenAlbedo = IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness );
		sheenSpecularIndirect += irradiance * material.sheenColor * sheenAlbedo * RECIPROCAL_PI;
		float sheenEnergyComp = 1.0 - max3( material.sheenColor ) * sheenAlbedo;
		diffuse *= sheenEnergyComp;
	#endif
	reflectedLight.indirectDiffuse += diffuse;
}
void RE_IndirectSpecular_Physical( const in vec3 radiance, const in vec3 irradiance, const in vec3 clearcoatRadiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight) {
	#ifdef USE_CLEARCOAT
		clearcoatSpecularIndirect += clearcoatRadiance * EnvironmentBRDF( geometryClearcoatNormal, geometryViewDir, material.clearcoatF0, material.clearcoatF90, material.clearcoatRoughness );
	#endif
	#ifdef USE_SHEEN
		sheenSpecularIndirect += irradiance * material.sheenColor * IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness ) * RECIPROCAL_PI;
 	#endif
	vec3 singleScatteringDielectric = vec3( 0.0 );
	vec3 multiScatteringDielectric = vec3( 0.0 );
	vec3 singleScatteringMetallic = vec3( 0.0 );
	vec3 multiScatteringMetallic = vec3( 0.0 );
	#ifdef USE_IRIDESCENCE
		computeMultiscatteringIridescence( material.dfg, material.specularColor, material.specularF90, material.iridescence, material.iridescenceF0Dielectric, singleScatteringDielectric, multiScatteringDielectric );
		computeMultiscatteringIridescence( material.dfg, material.diffuseColor, material.specularF90, material.iridescence, material.iridescenceF0Metallic, singleScatteringMetallic, multiScatteringMetallic );
	#else
		computeMultiscattering( material.dfg, material.specularColor, material.specularF90, singleScatteringDielectric, multiScatteringDielectric );
		computeMultiscattering( material.dfg, material.diffuseColor, material.specularF90, singleScatteringMetallic, multiScatteringMetallic );
	#endif
	vec3 singleScattering = mix( singleScatteringDielectric, singleScatteringMetallic, material.metalness );
	vec3 multiScattering = mix( multiScatteringDielectric, multiScatteringMetallic, material.metalness );
	vec3 totalScatteringDielectric = singleScatteringDielectric + multiScatteringDielectric;
	vec3 diffuse = material.diffuseContribution * ( 1.0 - totalScatteringDielectric );
	vec3 cosineWeightedIrradiance = irradiance * RECIPROCAL_PI;
	vec3 indirectSpecular = radiance * singleScattering;
	indirectSpecular += multiScattering * cosineWeightedIrradiance;
	vec3 indirectDiffuse = diffuse * cosineWeightedIrradiance;
	#ifdef USE_SHEEN
		float sheenAlbedo = IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness );
		float sheenEnergyComp = 1.0 - max3( material.sheenColor ) * sheenAlbedo;
		indirectSpecular *= sheenEnergyComp;
		indirectDiffuse *= sheenEnergyComp;
	#endif
	reflectedLight.indirectSpecular += indirectSpecular;
	reflectedLight.indirectDiffuse += indirectDiffuse;
}
#define RE_Direct				RE_Direct_Physical
#define RE_Direct_RectArea		RE_Direct_RectArea_Physical
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Physical
#define RE_IndirectSpecular		RE_IndirectSpecular_Physical
float computeSpecularOcclusion( const in float dotNV, const in float ambientOcclusion, const in float roughness ) {
	return saturate( pow( dotNV + ambientOcclusion, exp2( - 16.0 * roughness - 1.0 ) ) - 1.0 + ambientOcclusion );
}`,Qd=`
vec3 geometryPosition = - vViewPosition;
vec3 geometryNormal = normal;
vec3 geometryViewDir = ( isOrthographic ) ? vec3( 0, 0, 1 ) : normalize( vViewPosition );
vec3 geometryClearcoatNormal = vec3( 0.0 );
#ifdef USE_CLEARCOAT
	geometryClearcoatNormal = clearcoatNormal;
#endif
#ifdef USE_IRIDESCENCE
	float dotNVi = saturate( dot( normal, geometryViewDir ) );
	if ( material.iridescenceThickness == 0.0 ) {
		material.iridescence = 0.0;
	} else {
		material.iridescence = saturate( material.iridescence );
	}
	if ( material.iridescence > 0.0 ) {
		vec3 iridescenceFresnelDielectric = evalIridescence( 1.0, material.iridescenceIOR, dotNVi, material.iridescenceThickness, material.specularColor );
		vec3 iridescenceFresnelMetallic = evalIridescence( 1.0, material.iridescenceIOR, dotNVi, material.iridescenceThickness, material.diffuseColor );
		material.iridescenceFresnel = mix( iridescenceFresnelDielectric, iridescenceFresnelMetallic, material.metalness );
		material.iridescenceF0Dielectric = Schlick_to_F0( iridescenceFresnelDielectric, 1.0, dotNVi );
		material.iridescenceF0Metallic = Schlick_to_F0( iridescenceFresnelMetallic, 1.0, dotNVi );
	}
#endif
#ifdef STANDARD
	float dotNVms = saturate( dot( geometryNormal, geometryViewDir ) );
	material.dfg = texture2D( dfgLUT, vec2( material.roughness, dotNVms ) ).rg;
	#if ( NUM_SUN_LIGHTS > 0 || NUM_DIR_LIGHTS > 0 || NUM_POINT_LIGHTS > 0 || NUM_SPOT_LIGHTS > 0 )
		float EssMs = material.dfg.x + material.dfg.y;
		material.multiScatteringCompensation = 1.0 + material.specularColorBlended * ( 1.0 / EssMs - 1.0 );
	#endif
#endif
IncidentLight directLight;
#if ( NUM_POINT_LIGHTS > 0 ) && defined( RE_Direct )
	PointLight pointLight;
	#if defined( USE_SHADOWMAP ) && NUM_POINT_LIGHT_SHADOWS > 0
	PointLightShadow pointLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_POINT_LIGHTS; i ++ ) {
		pointLight = pointLights[ i ];
		getPointLightInfo( pointLight, geometryPosition, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_POINT_LIGHT_SHADOWS ) && ( defined( SHADOWMAP_TYPE_PCF ) || defined( SHADOWMAP_TYPE_BASIC ) )
		pointLightShadow = pointLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getPointShadow( pointShadowMap[ i ], pointLightShadow.shadowMapSize, pointLightShadow.shadowIntensity, pointLightShadow.shadowBias, pointLightShadow.shadowRadius, vPointShadowCoord[ i ], pointLightShadow.shadowCameraNear, pointLightShadow.shadowCameraFar ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_SPOT_LIGHTS > 0 ) && defined( RE_Direct )
	SpotLight spotLight;
	vec4 spotColor;
	vec3 spotLightCoord;
	bool inSpotLightMap;
	#if defined( USE_SHADOWMAP ) && NUM_SPOT_LIGHT_SHADOWS > 0
	SpotLightShadow spotLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHTS; i ++ ) {
		spotLight = spotLights[ i ];
		getSpotLightInfo( spotLight, geometryPosition, directLight );
		#if ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS )
		#define SPOT_LIGHT_MAP_INDEX UNROLLED_LOOP_INDEX
		#elif ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
		#define SPOT_LIGHT_MAP_INDEX NUM_SPOT_LIGHT_MAPS
		#else
		#define SPOT_LIGHT_MAP_INDEX ( UNROLLED_LOOP_INDEX - NUM_SPOT_LIGHT_SHADOWS + NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS )
		#endif
		#if ( SPOT_LIGHT_MAP_INDEX < NUM_SPOT_LIGHT_MAPS )
			spotLightCoord = vSpotLightCoord[ i ].xyz / vSpotLightCoord[ i ].w;
			inSpotLightMap = all( lessThan( abs( spotLightCoord * 2. - 1. ), vec3( 1.0 ) ) );
			spotColor = texture2D( spotLightMap[ SPOT_LIGHT_MAP_INDEX ], spotLightCoord.xy );
			directLight.color = inSpotLightMap ? directLight.color * spotColor.rgb : directLight.color;
		#endif
		#undef SPOT_LIGHT_MAP_INDEX
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
		spotLightShadow = spotLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( spotShadowMap[ i ], spotLightShadow.shadowMapSize, spotLightShadow.shadowIntensity, spotLightShadow.shadowBias, spotLightShadow.shadowRadius, vSpotLightCoord[ i ] ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_SUN_LIGHTS > 0 ) && defined( RE_Direct )
	SunLight sunLight;
	#if defined( USE_SHADOWMAP ) && NUM_SUN_LIGHT_SHADOWS > 0
	SunLightShadow sunLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SUN_LIGHTS; i ++ ) {
		sunLight = sunLights[ i ];
		getSunLightInfo( sunLight, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_SUN_LIGHT_SHADOWS )
		sunLightShadow = sunLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getSunShadow( sunShadowMap[ i ], sunLightShadow, UNROLLED_LOOP_INDEX ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_DIR_LIGHTS > 0 ) && defined( RE_Direct )
	DirectionalLight directionalLight;
	#if defined( USE_SHADOWMAP ) && NUM_DIR_LIGHT_SHADOWS > 0
	DirectionalLightShadow directionalLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_DIR_LIGHTS; i ++ ) {
		directionalLight = directionalLights[ i ];
		getDirectionalLightInfo( directionalLight, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_DIR_LIGHT_SHADOWS )
		directionalLightShadow = directionalLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( directionalShadowMap[ i ], directionalLightShadow.shadowMapSize, directionalLightShadow.shadowIntensity, directionalLightShadow.shadowBias, directionalLightShadow.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_RECT_AREA_LIGHTS > 0 ) && defined( RE_Direct_RectArea )
	RectAreaLight rectAreaLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_RECT_AREA_LIGHTS; i ++ ) {
		rectAreaLight = rectAreaLights[ i ];
		RE_Direct_RectArea( rectAreaLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if defined( RE_IndirectDiffuse )
	vec3 iblIrradiance = vec3( 0.0 );
	vec3 irradiance = getAmbientLightIrradiance( ambientLightColor );
	#if defined( USE_LIGHT_PROBES )
		irradiance += getLightProbeIrradiance( lightProbe, geometryNormal );
	#endif
	#if ( NUM_HEMI_LIGHTS > 0 )
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_HEMI_LIGHTS; i ++ ) {
			irradiance += getHemisphereLightIrradiance( hemisphereLights[ i ], geometryNormal );
		}
		#pragma unroll_loop_end
	#endif
	#ifdef USE_LIGHT_PROBES_GRID
		vec3 probeWorldPos = ( ( vec4( geometryPosition, 1.0 ) - viewMatrix[ 3 ] ) * viewMatrix ).xyz;
		vec3 probeWorldNormal = transformNormalByInverseViewMatrix( geometryNormal, viewMatrix );
		irradiance += getLightProbeGridIrradiance( probeWorldPos, probeWorldNormal );
	#endif
#endif
#if defined( RE_IndirectSpecular )
	vec3 radiance = vec3( 0.0 );
	vec3 clearcoatRadiance = vec3( 0.0 );
#endif`,jd=`#if defined( RE_IndirectDiffuse )
	#ifdef USE_LIGHTMAP
		vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
		vec3 lightMapIrradiance = lightMapTexel.rgb * lightMapIntensity;
		irradiance += lightMapIrradiance;
	#endif
	#if defined( USE_ENVMAP ) && defined( ENVMAP_TYPE_CUBE_UV )
		#if defined( STANDARD ) || defined( LAMBERT ) || defined( PHONG )
			iblIrradiance += getIBLIrradiance( geometryNormal );
		#endif
	#endif
#endif
#if defined( USE_ENVMAP ) && defined( RE_IndirectSpecular )
	#ifdef USE_ANISOTROPY
		vec3 iblRadiance = getIBLAnisotropyRadiance( geometryViewDir, geometryNormal, material.roughness, material.anisotropyB, material.anisotropy );
	#else
		vec3 iblRadiance = getIBLRadiance( geometryViewDir, geometryNormal, material.roughness );
	#endif
	#ifdef USE_RETROREFLECTION
		#ifdef USE_ANISOTROPY
			vec3 retroIBLRadiance = getIBLAnisotropyRetroRadiance( geometryViewDir, geometryNormal, material.roughness, material.anisotropyB, material.anisotropy );
		#else
			vec3 retroIBLRadiance = getIBLRetroRadiance( geometryViewDir, geometryNormal, material.roughness );
		#endif
		iblRadiance = mix( iblRadiance, retroIBLRadiance, saturate( material.retroreflectivity ) );
	#endif
	radiance += iblRadiance;
	#ifdef USE_CLEARCOAT
		clearcoatRadiance += getIBLRadiance( geometryViewDir, geometryClearcoatNormal, material.clearcoatRoughness );
	#endif
#endif`,tf=`#if defined( RE_IndirectDiffuse )
	#if defined( LAMBERT ) || defined( PHONG )
		irradiance += iblIrradiance;
	#endif
	RE_IndirectDiffuse( irradiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif
#if defined( RE_IndirectSpecular )
	RE_IndirectSpecular( radiance, iblIrradiance, clearcoatRadiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif`,ef=`#ifdef USE_LIGHT_PROBES_GRID
uniform highp sampler3D probesSH;
uniform vec3 probesMin;
uniform vec3 probesMax;
uniform vec3 probesResolution;
vec3 getLightProbeGridIrradiance( vec3 worldPos, vec3 worldNormal ) {
	vec3 res = probesResolution;
	vec3 gridRange = probesMax - probesMin;
	vec3 resMinusOne = res - 1.0;
	vec3 probeSpacing = gridRange / resMinusOne;
	vec3 samplePos = worldPos + worldNormal * probeSpacing * 0.5;
	vec3 uvw = clamp( ( samplePos - probesMin ) / gridRange, 0.0, 1.0 );
	uvw = uvw * resMinusOne / res + 0.5 / res;
	float nz          = res.z;
	float paddedSlices = nz + 2.0;
	float atlasDepth  = 7.0 * paddedSlices;
	float uvZBase     = uvw.z * nz + 1.0;
	vec4 s0 = texture( probesSH, vec3( uvw.xy, ( uvZBase                       ) / atlasDepth ) );
	vec4 s1 = texture( probesSH, vec3( uvw.xy, ( uvZBase +       paddedSlices   ) / atlasDepth ) );
	vec4 s2 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 2.0 * paddedSlices   ) / atlasDepth ) );
	vec4 s3 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 3.0 * paddedSlices   ) / atlasDepth ) );
	vec4 s4 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 4.0 * paddedSlices   ) / atlasDepth ) );
	vec4 s5 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 5.0 * paddedSlices   ) / atlasDepth ) );
	vec4 s6 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 6.0 * paddedSlices   ) / atlasDepth ) );
	vec3 c0 = s0.xyz;
	vec3 c1 = vec3( s0.w, s1.xy );
	vec3 c2 = vec3( s1.zw, s2.x );
	vec3 c3 = s2.yzw;
	vec3 c4 = s3.xyz;
	vec3 c5 = vec3( s3.w, s4.xy );
	vec3 c6 = vec3( s4.zw, s5.x );
	vec3 c7 = s5.yzw;
	vec3 c8 = s6.xyz;
	float x = worldNormal.x, y = worldNormal.y, z = worldNormal.z;
	vec3 result = c0 * 0.886227;
	result += c1 * 2.0 * 0.511664 * y;
	result += c2 * 2.0 * 0.511664 * z;
	result += c3 * 2.0 * 0.511664 * x;
	result += c4 * 2.0 * 0.429043 * x * y;
	result += c5 * 2.0 * 0.429043 * y * z;
	result += c6 * ( 0.743125 * z * z - 0.247708 );
	result += c7 * 2.0 * 0.429043 * x * z;
	result += c8 * 0.429043 * ( x * x - y * y );
	return max( result, vec3( 0.0 ) );
}
#endif`,nf=`#if defined( USE_LOGARITHMIC_DEPTH_BUFFER )
	gl_FragDepth = vIsPerspective == 0.0 ? gl_FragCoord.z : log2( vFragDepth ) * logDepthBufFC * 0.5;
#endif`,sf=`#if defined( USE_LOGARITHMIC_DEPTH_BUFFER )
	uniform float logDepthBufFC;
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,rf=`#ifdef USE_LOGARITHMIC_DEPTH_BUFFER
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,af=`#ifdef USE_LOGARITHMIC_DEPTH_BUFFER
	vFragDepth = 1.0 + gl_Position.w;
	vIsPerspective = float( isPerspectiveMatrix( projectionMatrix ) );
#endif`,of=`#ifdef USE_MAP
	vec4 sampledDiffuseColor = texture2D( map, vMapUv );
	#ifdef DECODE_VIDEO_TEXTURE
		sampledDiffuseColor = sRGBTransferEOTF( sampledDiffuseColor );
	#endif
	diffuseColor *= sampledDiffuseColor;
#endif`,lf=`#ifdef USE_MAP
	uniform sampler2D map;
#endif`,cf=`#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
	#if defined( USE_POINTS_UV )
		vec2 uv = vUv;
	#else
		vec2 uv = ( uvTransform * vec3( gl_PointCoord.x, 1.0 - gl_PointCoord.y, 1 ) ).xy;
	#endif
#endif
#ifdef USE_MAP
	diffuseColor *= texture2D( map, uv );
#endif
#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, uv ).g;
#endif`,hf=`#if defined( USE_POINTS_UV )
	varying vec2 vUv;
#else
	#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
		uniform mat3 uvTransform;
	#endif
#endif
#ifdef USE_MAP
	uniform sampler2D map;
#endif
#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,uf=`float metalnessFactor = metalness;
#ifdef USE_METALNESSMAP
	vec4 texelMetalness = texture2D( metalnessMap, vMetalnessMapUv );
	metalnessFactor *= texelMetalness.b;
#endif`,df=`#ifdef USE_METALNESSMAP
	uniform sampler2D metalnessMap;
#endif`,ff=`#ifdef USE_INSTANCING_MORPH
	float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	float morphTargetBaseInfluence = texelFetch( morphTexture, ivec2( 0, gl_InstanceID ), 0 ).r;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		morphTargetInfluences[i] =  texelFetch( morphTexture, ivec2( i + 1, gl_InstanceID ), 0 ).r;
	}
#endif`,pf=`#if defined( USE_MORPHCOLORS )
	vColor *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		#if defined( USE_COLOR_ALPHA )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ) * morphTargetInfluences[ i ];
		#elif defined( USE_COLOR )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ).rgb * morphTargetInfluences[ i ];
		#endif
	}
#endif`,mf=`#ifdef USE_MORPHNORMALS
	objectNormal *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) objectNormal += getMorph( gl_VertexID, i, 1 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,gf=`#ifdef USE_MORPHTARGETS
	#ifndef USE_INSTANCING_MORPH
		uniform float morphTargetBaseInfluence;
		uniform float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	#endif
	uniform sampler2DArray morphTargetsTexture;
	uniform ivec2 morphTargetsTextureSize;
	vec4 getMorph( const in int vertexIndex, const in int morphTargetIndex, const in int offset ) {
		int texelIndex = vertexIndex * MORPHTARGETS_TEXTURE_STRIDE + offset;
		int y = texelIndex / morphTargetsTextureSize.x;
		int x = texelIndex - y * morphTargetsTextureSize.x;
		ivec3 morphUV = ivec3( x, y, morphTargetIndex );
		return texelFetch( morphTargetsTexture, morphUV, 0 );
	}
#endif`,_f=`#ifdef USE_MORPHTARGETS
	transformed *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) transformed += getMorph( gl_VertexID, i, 0 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,xf=`float faceDirection = gl_FrontFacing ? 1.0 : - 1.0;
#ifdef FLAT_SHADED
	vec3 fdx = dFdx( vViewPosition );
	vec3 fdy = dFdy( vViewPosition );
	vec3 normal = normalize( cross( fdx, fdy ) );
#else
	vec3 normal = normalize( vNormal );
	#ifdef DOUBLE_SIDED
		normal *= faceDirection;
	#endif
#endif
#if defined( USE_NORMALMAP_TANGENTSPACE ) || defined( USE_CLEARCOAT_NORMALMAP ) || defined( USE_ANISOTROPY )
	#ifdef USE_TANGENT
		mat3 tbn = mat3( normalize( vTangent ), normalize( vBitangent ), normal );
	#else
		mat3 tbn = getTangentFrame( - vViewPosition, normal,
		#if defined( USE_NORMALMAP )
			vNormalMapUv
		#elif defined( USE_CLEARCOAT_NORMALMAP )
			vClearcoatNormalMapUv
		#else
			vUv
		#endif
		);
	#endif
	#ifdef DOUBLE_SIDED
		tbn[0] *= faceDirection;
		tbn[1] *= faceDirection;
	#endif
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	#ifdef USE_TANGENT
		mat3 tbn2 = mat3( normalize( vTangent ), normalize( vBitangent ), normal );
	#else
		mat3 tbn2 = getTangentFrame( - vViewPosition, normal, vClearcoatNormalMapUv );
	#endif
	#ifdef DOUBLE_SIDED
		tbn2[0] *= faceDirection;
		tbn2[1] *= faceDirection;
	#endif
#endif
vec3 nonPerturbedNormal = normal;`,vf=`#ifdef USE_NORMALMAP_OBJECTSPACE
	normal = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0;
	#ifdef FLIP_SIDED
		normal = - normal;
	#endif
	#ifdef DOUBLE_SIDED
		normal = normal * faceDirection;
	#endif
	normal = normalize( normalMatrix * normal );
#elif defined( USE_NORMALMAP_TANGENTSPACE )
	vec3 mapN = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0;
	#if defined( USE_PACKED_NORMALMAP )
		mapN = vec3( mapN.xy, sqrt( saturate( 1.0 - dot( mapN.xy, mapN.xy ) ) ) );
	#endif
	mapN.xy *= normalScale;
	normal = normalize( tbn * mapN );
#elif defined( USE_BUMPMAP )
	normal = perturbNormalArb( - vViewPosition, normal, dHdxy_fwd(), faceDirection );
#endif`,yf=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,Sf=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,Mf=`#ifndef FLAT_SHADED
	vNormal = normalize( transformedNormal );
	#ifdef USE_TANGENT
		vTangent = normalize( transformedTangent );
		vBitangent = normalize( cross( vNormal, vTangent ) * tangent.w );
		#ifdef FLIP_SIDED
			vBitangent = - vBitangent;
		#endif
	#endif
#endif`,bf=`#ifdef USE_NORMALMAP
	uniform sampler2D normalMap;
	uniform vec2 normalScale;
#endif
#ifdef USE_NORMALMAP_OBJECTSPACE
	uniform mat3 normalMatrix;
#endif
#if ! defined ( USE_TANGENT ) && ( defined ( USE_NORMALMAP_TANGENTSPACE ) || defined ( USE_CLEARCOAT_NORMALMAP ) || defined( USE_ANISOTROPY ) )
	mat3 getTangentFrame( vec3 eye_pos, vec3 surf_norm, vec2 uv ) {
		vec3 q0 = dFdx( eye_pos.xyz );
		vec3 q1 = dFdy( eye_pos.xyz );
		vec2 st0 = dFdx( uv.st );
		vec2 st1 = dFdy( uv.st );
		vec3 N = surf_norm;
		vec3 q1perp = cross( q1, N );
		vec3 q0perp = cross( N, q0 );
		vec3 T = q1perp * st0.x + q0perp * st1.x;
		vec3 B = q1perp * st0.y + q0perp * st1.y;
		float det = max( dot( T, T ), dot( B, B ) );
		float scale = ( det == 0.0 ) ? 0.0 : inversesqrt( det );
		return mat3( T * scale, B * scale, N );
	}
#endif`,Tf=`#ifdef USE_CLEARCOAT
	vec3 clearcoatNormal = nonPerturbedNormal;
#endif`,Ef=`#ifdef USE_CLEARCOAT_NORMALMAP
	vec3 clearcoatMapN = texture2D( clearcoatNormalMap, vClearcoatNormalMapUv ).xyz * 2.0 - 1.0;
	clearcoatMapN.xy *= clearcoatNormalScale;
	clearcoatNormal = normalize( tbn2 * clearcoatMapN );
#endif`,Af=`#ifdef USE_CLEARCOATMAP
	uniform sampler2D clearcoatMap;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform sampler2D clearcoatNormalMap;
	uniform vec2 clearcoatNormalScale;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform sampler2D clearcoatRoughnessMap;
#endif`,wf=`#ifdef USE_IRIDESCENCEMAP
	uniform sampler2D iridescenceMap;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform sampler2D iridescenceThicknessMap;
#endif`,Cf=`#ifdef OPAQUE
diffuseColor.a = 1.0;
#endif
#ifdef USE_TRANSMISSION
diffuseColor.a *= material.transmissionAlpha;
#endif
gl_FragColor = vec4( outgoingLight, diffuseColor.a );`,Rf=`vec3 packNormalToRGB( const in vec3 normal ) {
	return normalize( normal ) * 0.5 + 0.5;
}
vec3 unpackRGBToNormal( const in vec3 rgb ) {
	return 2.0 * rgb.xyz - 1.0;
}
const float PackUpscale = 256. / 255.;const float UnpackDownscale = 255. / 256.;const float ShiftRight8 = 1. / 256.;
const float Inv255 = 1. / 255.;
const vec4 PackFactors = vec4( 1.0, 256.0, 256.0 * 256.0, 256.0 * 256.0 * 256.0 );
const vec2 UnpackFactors2 = vec2( UnpackDownscale, 1.0 / PackFactors.g );
const vec3 UnpackFactors3 = vec3( UnpackDownscale / PackFactors.rg, 1.0 / PackFactors.b );
const vec4 UnpackFactors4 = vec4( UnpackDownscale / PackFactors.rgb, 1.0 / PackFactors.a );
vec4 packDepthToRGBA( const in float v ) {
	if( v <= 0.0 )
		return vec4( 0., 0., 0., 0. );
	if( v >= 1.0 )
		return vec4( 1., 1., 1., 1. );
	float vuf;
	float af = modf( v * PackFactors.a, vuf );
	float bf = modf( vuf * ShiftRight8, vuf );
	float gf = modf( vuf * ShiftRight8, vuf );
	return vec4( vuf * Inv255, gf * PackUpscale, bf * PackUpscale, af );
}
vec3 packDepthToRGB( const in float v ) {
	if( v <= 0.0 )
		return vec3( 0., 0., 0. );
	if( v >= 1.0 )
		return vec3( 1., 1., 1. );
	float vuf;
	float bf = modf( v * PackFactors.b, vuf );
	float gf = modf( vuf * ShiftRight8, vuf );
	return vec3( vuf * Inv255, gf * PackUpscale, bf );
}
vec2 packDepthToRG( const in float v ) {
	if( v <= 0.0 )
		return vec2( 0., 0. );
	if( v >= 1.0 )
		return vec2( 1., 1. );
	float vuf;
	float gf = modf( v * 256., vuf );
	return vec2( vuf * Inv255, gf );
}
float unpackRGBAToDepth( const in vec4 v ) {
	return dot( v, UnpackFactors4 );
}
float unpackRGBToDepth( const in vec3 v ) {
	return dot( v, UnpackFactors3 );
}
float unpackRGToDepth( const in vec2 v ) {
	return v.r * UnpackFactors2.r + v.g * UnpackFactors2.g;
}
vec4 pack2HalfToRGBA( const in vec2 v ) {
	vec4 r = vec4( v.x, fract( v.x * 255.0 ), v.y, fract( v.y * 255.0 ) );
	return vec4( r.x - r.y / 255.0, r.y, r.z - r.w / 255.0, r.w );
}
vec2 unpackRGBATo2Half( const in vec4 v ) {
	return vec2( v.x + ( v.y / 255.0 ), v.z + ( v.w / 255.0 ) );
}
float viewZToOrthographicDepth( const in float viewZ, const in float near, const in float far ) {
	return ( viewZ + near ) / ( near - far );
}
float orthographicDepthToViewZ( const in float depth, const in float near, const in float far ) {
	#ifdef USE_REVERSED_DEPTH_BUFFER
	
		return depth * ( far - near ) - far;
	#else
		return depth * ( near - far ) - near;
	#endif
}
float viewZToPerspectiveDepth( const in float viewZ, const in float near, const in float far ) {
	return ( ( near + viewZ ) * far ) / ( ( far - near ) * viewZ );
}
float perspectiveDepthToViewZ( const in float depth, const in float near, const in float far ) {
	
	#ifdef USE_REVERSED_DEPTH_BUFFER
		return ( near * far ) / ( ( near - far ) * depth - near );
	#else
		return ( near * far ) / ( ( far - near ) * depth - far );
	#endif
}`,If=`#ifdef PREMULTIPLIED_ALPHA
	gl_FragColor.rgb *= gl_FragColor.a;
#endif`,Pf=`vec4 mvPosition = vec4( transformed, 1.0 );
#ifdef USE_BATCHING
	mvPosition = batchingMatrix * mvPosition;
#endif
#ifdef USE_INSTANCING
	mvPosition = instanceMatrix * mvPosition;
#endif
mvPosition = modelViewMatrix * mvPosition;
gl_Position = projectionMatrix * mvPosition;`,Lf=`#ifdef DITHERING
	gl_FragColor.rgb = dithering( gl_FragColor.rgb );
#endif`,Nf=`#ifdef DITHERING
	vec3 dithering( vec3 color ) {
		float grid_position = rand( gl_FragCoord.xy );
		vec3 dither_shift_RGB = vec3( 0.25 / 255.0, -0.25 / 255.0, 0.25 / 255.0 );
		dither_shift_RGB = mix( 2.0 * dither_shift_RGB, -2.0 * dither_shift_RGB, grid_position );
		return color + dither_shift_RGB;
	}
#endif`,Df=`float roughnessFactor = roughness;
#ifdef USE_ROUGHNESSMAP
	vec4 texelRoughness = texture2D( roughnessMap, vRoughnessMapUv );
	roughnessFactor *= texelRoughness.g;
#endif`,Uf=`#ifdef USE_ROUGHNESSMAP
	uniform sampler2D roughnessMap;
#endif`,Ff=`#if NUM_SPOT_LIGHT_COORDS > 0
	varying vec4 vSpotLightCoord[ NUM_SPOT_LIGHT_COORDS ];
#endif
#if NUM_SPOT_LIGHT_MAPS > 0
	uniform sampler2D spotLightMap[ NUM_SPOT_LIGHT_MAPS ];
#endif
#ifdef USE_SHADOWMAP
	#if NUM_SUN_LIGHT_SHADOWS > 0
		#define SUN_LIGHT_CASCADES 2
		#if defined( SHADOWMAP_TYPE_PCF )
			uniform sampler2DShadow sunShadowMap[ NUM_SUN_LIGHT_SHADOWS ];
		#else
			uniform sampler2D sunShadowMap[ NUM_SUN_LIGHT_SHADOWS ];
		#endif
		uniform mat4 sunShadowMatrix[ NUM_SUN_LIGHT_SHADOWS * SUN_LIGHT_CASCADES ];
		uniform vec4 sunShadowCascade[ NUM_SUN_LIGHT_SHADOWS * SUN_LIGHT_CASCADES ];
		varying vec4 vSunShadowWorldPosition;
		varying vec3 vSunShadowWorldNormal;
		struct SunLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SunLightShadow sunLightShadows[ NUM_SUN_LIGHT_SHADOWS ];
	#endif
	#if NUM_DIR_LIGHT_SHADOWS > 0
		#if defined( SHADOWMAP_TYPE_PCF )
			uniform sampler2DShadow directionalShadowMap[ NUM_DIR_LIGHT_SHADOWS ];
		#else
			uniform sampler2D directionalShadowMap[ NUM_DIR_LIGHT_SHADOWS ];
		#endif
		varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];
		struct DirectionalLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
		#if defined( SHADOWMAP_TYPE_PCF )
			uniform sampler2DShadow spotShadowMap[ NUM_SPOT_LIGHT_SHADOWS ];
		#else
			uniform sampler2D spotShadowMap[ NUM_SPOT_LIGHT_SHADOWS ];
		#endif
		struct SpotLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SpotLightShadow spotLightShadows[ NUM_SPOT_LIGHT_SHADOWS ];
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		#if defined( SHADOWMAP_TYPE_PCF )
			uniform samplerCubeShadow pointShadowMap[ NUM_POINT_LIGHT_SHADOWS ];
		#elif defined( SHADOWMAP_TYPE_BASIC )
			uniform samplerCube pointShadowMap[ NUM_POINT_LIGHT_SHADOWS ];
		#endif
		varying vec4 vPointShadowCoord[ NUM_POINT_LIGHT_SHADOWS ];
		struct PointLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
			float shadowCameraNear;
			float shadowCameraFar;
		};
		uniform PointLightShadow pointLightShadows[ NUM_POINT_LIGHT_SHADOWS ];
	#endif
	#if defined( SHADOWMAP_TYPE_PCF )
		float interleavedGradientNoise( vec2 position ) {
			return fract( 52.9829189 * fract( dot( position, vec2( 0.06711056, 0.00583715 ) ) ) );
		}
		vec2 vogelDiskSample( int sampleIndex, int samplesCount, float phi ) {
			const float goldenAngle = 2.399963229728653;
			float r = sqrt( ( float( sampleIndex ) + 0.5 ) / float( samplesCount ) );
			float theta = float( sampleIndex ) * goldenAngle + phi;
			return vec2( cos( theta ), sin( theta ) ) * r;
		}
	#endif
	#if defined( SHADOWMAP_TYPE_PCF )
		float getShadow( sampler2DShadow shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord ) {
			float shadow = 1.0;
			shadowCoord.xyz /= shadowCoord.w;
			shadowCoord.z += shadowBias;
			bool inFrustum = shadowCoord.x >= 0.0 && shadowCoord.x <= 1.0 && shadowCoord.y >= 0.0 && shadowCoord.y <= 1.0;
			bool frustumTest = inFrustum && shadowCoord.z <= 1.0;
			if ( frustumTest ) {
				vec2 texelSize = vec2( 1.0 ) / shadowMapSize;
				float radius = shadowRadius * texelSize.x;
				float phi = interleavedGradientNoise( gl_FragCoord.xy ) * PI2;
				shadow = (
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 0, 5, phi ) * radius, shadowCoord.z ) ) +
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 1, 5, phi ) * radius, shadowCoord.z ) ) +
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 2, 5, phi ) * radius, shadowCoord.z ) ) +
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 3, 5, phi ) * radius, shadowCoord.z ) ) +
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 4, 5, phi ) * radius, shadowCoord.z ) )
				) * 0.2;
			}
			return mix( 1.0, shadow, shadowIntensity );
		}
	#elif defined( SHADOWMAP_TYPE_VSM )
		float getShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord ) {
			float shadow = 1.0;
			shadowCoord.xyz /= shadowCoord.w;
			#ifdef USE_REVERSED_DEPTH_BUFFER
				shadowCoord.z -= shadowBias;
			#else
				shadowCoord.z += shadowBias;
			#endif
			bool inFrustum = shadowCoord.x >= 0.0 && shadowCoord.x <= 1.0 && shadowCoord.y >= 0.0 && shadowCoord.y <= 1.0;
			bool frustumTest = inFrustum && shadowCoord.z <= 1.0;
			if ( frustumTest ) {
				vec2 distribution = texture2D( shadowMap, shadowCoord.xy ).rg;
				float mean = distribution.x;
				float variance = distribution.y * distribution.y;
				#ifdef USE_REVERSED_DEPTH_BUFFER
					float hard_shadow = step( mean, shadowCoord.z );
				#else
					float hard_shadow = step( shadowCoord.z, mean );
				#endif
				
				if ( hard_shadow == 1.0 ) {
					shadow = 1.0;
				} else {
					variance = max( variance, 0.0000001 );
					float d = shadowCoord.z - mean;
					float p_max = variance / ( variance + d * d );
					p_max = clamp( ( p_max - 0.3 ) / 0.65, 0.0, 1.0 );
					shadow = max( hard_shadow, p_max );
				}
			}
			return mix( 1.0, shadow, shadowIntensity );
		}
	#else
		float getShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord ) {
			float shadow = 1.0;
			shadowCoord.xyz /= shadowCoord.w;
			#ifdef USE_REVERSED_DEPTH_BUFFER
				shadowCoord.z -= shadowBias;
			#else
				shadowCoord.z += shadowBias;
			#endif
			bool inFrustum = shadowCoord.x >= 0.0 && shadowCoord.x <= 1.0 && shadowCoord.y >= 0.0 && shadowCoord.y <= 1.0;
			bool frustumTest = inFrustum && shadowCoord.z <= 1.0;
			if ( frustumTest ) {
				float depth = texture2D( shadowMap, shadowCoord.xy ).r;
				#ifdef USE_REVERSED_DEPTH_BUFFER
					shadow = step( depth, shadowCoord.z );
				#else
					shadow = step( shadowCoord.z, depth );
				#endif
			}
			return mix( 1.0, shadow, shadowIntensity );
		}
	#endif
	#if NUM_SUN_LIGHT_SHADOWS > 0
		float getSunShadow(
			#if defined( SHADOWMAP_TYPE_PCF )
				sampler2DShadow shadowMap,
			#else
				sampler2D shadowMap,
			#endif
			SunLightShadow sunLightShadow,
			int shadowIndex
		) {
			vec4 shadowWorldPosition = vec4( vSunShadowWorldPosition.xyz + vSunShadowWorldNormal * sunLightShadow.shadowNormalBias, 1.0 );
			float viewDepth = vSunShadowWorldPosition.w;
			int cascadeOffset = shadowIndex * SUN_LIGHT_CASCADES;
			float shadow = 1.0;
			for ( int i = SUN_LIGHT_CASCADES - 1; i >= 0; i -- ) {
				vec4 cascade = sunShadowCascade[ cascadeOffset + i ];
				if ( viewDepth >= cascade.x && viewDepth < cascade.y ) {
					float cascadeShadow = getShadow(
						shadowMap,
						sunLightShadow.shadowMapSize,
						sunLightShadow.shadowIntensity,
						sunLightShadow.shadowBias,
						sunLightShadow.shadowRadius,
						sunShadowMatrix[ cascadeOffset + i ] * shadowWorldPosition
					);
					shadow = mix( cascadeShadow, shadow, smoothstep( cascade.z, cascade.y, viewDepth ) );
				}
			}
			return shadow;
		}
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
	#if defined( SHADOWMAP_TYPE_PCF )
	float getPointShadow( samplerCubeShadow shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord, float shadowCameraNear, float shadowCameraFar ) {
		float shadow = 1.0;
		vec3 lightToPosition = shadowCoord.xyz;
		vec3 bd3D = normalize( lightToPosition );
		vec3 absVec = abs( lightToPosition );
		float viewSpaceZ = max( max( absVec.x, absVec.y ), absVec.z );
		if ( viewSpaceZ - shadowCameraFar <= 0.0 && viewSpaceZ - shadowCameraNear >= 0.0 ) {
			#ifdef USE_REVERSED_DEPTH_BUFFER
				float dp = ( shadowCameraNear * ( shadowCameraFar - viewSpaceZ ) ) / ( viewSpaceZ * ( shadowCameraFar - shadowCameraNear ) );
				dp -= shadowBias;
			#else
				float dp = ( shadowCameraFar * ( viewSpaceZ - shadowCameraNear ) ) / ( viewSpaceZ * ( shadowCameraFar - shadowCameraNear ) );
				dp += shadowBias;
			#endif
			float texelSize = shadowRadius / shadowMapSize.x;
			vec3 absDir = abs( bd3D );
			vec3 tangent = absDir.x > absDir.z ? vec3( 0.0, 1.0, 0.0 ) : vec3( 1.0, 0.0, 0.0 );
			tangent = normalize( cross( bd3D, tangent ) );
			vec3 bitangent = cross( bd3D, tangent );
			float phi = interleavedGradientNoise( gl_FragCoord.xy ) * PI2;
			vec2 sample0 = vogelDiskSample( 0, 5, phi );
			vec2 sample1 = vogelDiskSample( 1, 5, phi );
			vec2 sample2 = vogelDiskSample( 2, 5, phi );
			vec2 sample3 = vogelDiskSample( 3, 5, phi );
			vec2 sample4 = vogelDiskSample( 4, 5, phi );
			shadow = (
				texture( shadowMap, vec4( bd3D + ( tangent * sample0.x + bitangent * sample0.y ) * texelSize, dp ) ) +
				texture( shadowMap, vec4( bd3D + ( tangent * sample1.x + bitangent * sample1.y ) * texelSize, dp ) ) +
				texture( shadowMap, vec4( bd3D + ( tangent * sample2.x + bitangent * sample2.y ) * texelSize, dp ) ) +
				texture( shadowMap, vec4( bd3D + ( tangent * sample3.x + bitangent * sample3.y ) * texelSize, dp ) ) +
				texture( shadowMap, vec4( bd3D + ( tangent * sample4.x + bitangent * sample4.y ) * texelSize, dp ) )
			) * 0.2;
		}
		return mix( 1.0, shadow, shadowIntensity );
	}
	#elif defined( SHADOWMAP_TYPE_BASIC )
	float getPointShadow( samplerCube shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord, float shadowCameraNear, float shadowCameraFar ) {
		float shadow = 1.0;
		vec3 lightToPosition = shadowCoord.xyz;
		vec3 absVec = abs( lightToPosition );
		float viewSpaceZ = max( max( absVec.x, absVec.y ), absVec.z );
		if ( viewSpaceZ - shadowCameraFar <= 0.0 && viewSpaceZ - shadowCameraNear >= 0.0 ) {
			float dp = ( shadowCameraFar * ( viewSpaceZ - shadowCameraNear ) ) / ( viewSpaceZ * ( shadowCameraFar - shadowCameraNear ) );
			dp += shadowBias;
			vec3 bd3D = normalize( lightToPosition );
			float depth = textureCube( shadowMap, bd3D ).r;
			#ifdef USE_REVERSED_DEPTH_BUFFER
				depth = 1.0 - depth;
			#endif
			shadow = step( dp, depth );
		}
		return mix( 1.0, shadow, shadowIntensity );
	}
	#endif
	#endif
#endif`,Of=`#if NUM_SPOT_LIGHT_COORDS > 0
	uniform mat4 spotLightMatrix[ NUM_SPOT_LIGHT_COORDS ];
	varying vec4 vSpotLightCoord[ NUM_SPOT_LIGHT_COORDS ];
#endif
#ifdef USE_SHADOWMAP
	#if NUM_SUN_LIGHT_SHADOWS > 0
		varying vec4 vSunShadowWorldPosition;
		varying vec3 vSunShadowWorldNormal;
	#endif
	#if NUM_DIR_LIGHT_SHADOWS > 0
		uniform mat4 directionalShadowMatrix[ NUM_DIR_LIGHT_SHADOWS ];
		varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];
		struct DirectionalLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
		struct SpotLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SpotLightShadow spotLightShadows[ NUM_SPOT_LIGHT_SHADOWS ];
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		uniform mat4 pointShadowMatrix[ NUM_POINT_LIGHT_SHADOWS ];
		varying vec4 vPointShadowCoord[ NUM_POINT_LIGHT_SHADOWS ];
		struct PointLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
			float shadowCameraNear;
			float shadowCameraFar;
		};
		uniform PointLightShadow pointLightShadows[ NUM_POINT_LIGHT_SHADOWS ];
	#endif
#endif`,Bf=`#if ( defined( USE_SHADOWMAP ) && ( NUM_DIR_LIGHT_SHADOWS > 0 || NUM_SUN_LIGHT_SHADOWS > 0 || NUM_POINT_LIGHT_SHADOWS > 0 ) ) || ( NUM_SPOT_LIGHT_COORDS > 0 )
	#ifdef HAS_NORMAL
		vec3 shadowWorldNormal = transformNormalByInverseViewMatrix( transformedNormal, viewMatrix );
	#else
		vec3 shadowWorldNormal = vec3( 0.0 );
	#endif
	vec4 shadowWorldPosition;
#endif
#if defined( USE_SHADOWMAP )
	#if NUM_SUN_LIGHT_SHADOWS > 0
		vSunShadowWorldPosition = vec4( worldPosition.xyz, - mvPosition.z );
		vSunShadowWorldNormal = shadowWorldNormal;
	#endif
	#if NUM_DIR_LIGHT_SHADOWS > 0
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {
			shadowWorldPosition = worldPosition + vec4( shadowWorldNormal * directionalLightShadows[ i ].shadowNormalBias, 0 );
			vDirectionalShadowCoord[ i ] = directionalShadowMatrix[ i ] * shadowWorldPosition;
		}
		#pragma unroll_loop_end
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_POINT_LIGHT_SHADOWS; i ++ ) {
			shadowWorldPosition = worldPosition + vec4( shadowWorldNormal * pointLightShadows[ i ].shadowNormalBias, 0 );
			vPointShadowCoord[ i ] = pointShadowMatrix[ i ] * shadowWorldPosition;
		}
		#pragma unroll_loop_end
	#endif
#endif
#if NUM_SPOT_LIGHT_COORDS > 0
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHT_COORDS; i ++ ) {
		shadowWorldPosition = worldPosition;
		#if ( defined( USE_SHADOWMAP ) && UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
			shadowWorldPosition.xyz += shadowWorldNormal * spotLightShadows[ i ].shadowNormalBias;
		#endif
		vSpotLightCoord[ i ] = spotLightMatrix[ i ] * shadowWorldPosition;
	}
	#pragma unroll_loop_end
#endif`,zf=`float getShadowMask() {
	float shadow = 1.0;
	#ifdef USE_SHADOWMAP
	#if NUM_SUN_LIGHT_SHADOWS > 0
	SunLightShadow sunLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SUN_LIGHT_SHADOWS; i ++ ) {
		sunLight = sunLightShadows[ i ];
		shadow *= receiveShadow ? getSunShadow( sunShadowMap[ i ], sunLight, UNROLLED_LOOP_INDEX ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_DIR_LIGHT_SHADOWS > 0
	DirectionalLightShadow directionalLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {
		directionalLight = directionalLightShadows[ i ];
		shadow *= receiveShadow ? getShadow( directionalShadowMap[ i ], directionalLight.shadowMapSize, directionalLight.shadowIntensity, directionalLight.shadowBias, directionalLight.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
	SpotLightShadow spotLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHT_SHADOWS; i ++ ) {
		spotLight = spotLightShadows[ i ];
		shadow *= receiveShadow ? getShadow( spotShadowMap[ i ], spotLight.shadowMapSize, spotLight.shadowIntensity, spotLight.shadowBias, spotLight.shadowRadius, vSpotLightCoord[ i ] ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0 && ( defined( SHADOWMAP_TYPE_PCF ) || defined( SHADOWMAP_TYPE_BASIC ) )
	PointLightShadow pointLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_POINT_LIGHT_SHADOWS; i ++ ) {
		pointLight = pointLightShadows[ i ];
		shadow *= receiveShadow ? getPointShadow( pointShadowMap[ i ], pointLight.shadowMapSize, pointLight.shadowIntensity, pointLight.shadowBias, pointLight.shadowRadius, vPointShadowCoord[ i ], pointLight.shadowCameraNear, pointLight.shadowCameraFar ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#endif
	return shadow;
}`,Gf=`#ifdef USE_SKINNING
	mat4 boneMatX = getBoneMatrix( skinIndex.x );
	mat4 boneMatY = getBoneMatrix( skinIndex.y );
	mat4 boneMatZ = getBoneMatrix( skinIndex.z );
	mat4 boneMatW = getBoneMatrix( skinIndex.w );
#endif`,kf=`#ifdef USE_SKINNING
	uniform mat4 bindMatrix;
	uniform mat4 bindMatrixInverse;
	uniform highp sampler2D boneTexture;
	mat4 getBoneMatrix( const in float i ) {
		int size = textureSize( boneTexture, 0 ).x;
		int j = int( i ) * 4;
		int x = j % size;
		int y = j / size;
		vec4 v1 = texelFetch( boneTexture, ivec2( x, y ), 0 );
		vec4 v2 = texelFetch( boneTexture, ivec2( x + 1, y ), 0 );
		vec4 v3 = texelFetch( boneTexture, ivec2( x + 2, y ), 0 );
		vec4 v4 = texelFetch( boneTexture, ivec2( x + 3, y ), 0 );
		return mat4( v1, v2, v3, v4 );
	}
#endif`,Hf=`#ifdef USE_SKINNING
	vec4 skinVertex = bindMatrix * vec4( transformed, 1.0 );
	vec4 skinned = vec4( 0.0 );
	skinned += boneMatX * skinVertex * skinWeight.x;
	skinned += boneMatY * skinVertex * skinWeight.y;
	skinned += boneMatZ * skinVertex * skinWeight.z;
	skinned += boneMatW * skinVertex * skinWeight.w;
	transformed = ( bindMatrixInverse * skinned ).xyz;
#endif`,Vf=`#ifdef USE_SKINNING
	mat4 skinMatrix = mat4( 0.0 );
	skinMatrix += skinWeight.x * boneMatX;
	skinMatrix += skinWeight.y * boneMatY;
	skinMatrix += skinWeight.z * boneMatZ;
	skinMatrix += skinWeight.w * boneMatW;
	skinMatrix = bindMatrixInverse * skinMatrix * bindMatrix;
	objectNormal = vec4( skinMatrix * vec4( objectNormal, 0.0 ) ).xyz;
	#ifdef USE_TANGENT
		objectTangent = vec4( skinMatrix * vec4( objectTangent, 0.0 ) ).xyz;
	#endif
#endif`,Wf=`float specularStrength;
#ifdef USE_SPECULARMAP
	vec4 texelSpecular = texture2D( specularMap, vSpecularMapUv );
	specularStrength = texelSpecular.r;
#else
	specularStrength = 1.0;
#endif`,Xf=`#ifdef USE_SPECULARMAP
	uniform sampler2D specularMap;
#endif`,qf=`#if defined( TONE_MAPPING )
	gl_FragColor.rgb = toneMapping( gl_FragColor.rgb );
#endif`,Yf=`#ifndef saturate
#define saturate( a ) clamp( a, 0.0, 1.0 )
#endif
uniform float toneMappingExposure;
vec3 LinearToneMapping( vec3 color ) {
	return saturate( toneMappingExposure * color );
}
vec3 ReinhardToneMapping( vec3 color ) {
	color *= toneMappingExposure;
	return saturate( color / ( vec3( 1.0 ) + color ) );
}
vec3 CineonToneMapping( vec3 color ) {
	color *= toneMappingExposure;
	color = max( vec3( 0.0 ), color - 0.004 );
	return pow( ( color * ( 6.2 * color + 0.5 ) ) / ( color * ( 6.2 * color + 1.7 ) + 0.06 ), vec3( 2.2 ) );
}
vec3 RRTAndODTFit( vec3 v ) {
	vec3 a = v * ( v + 0.0245786 ) - 0.000090537;
	vec3 b = v * ( 0.983729 * v + 0.4329510 ) + 0.238081;
	return a / b;
}
vec3 ACESFilmicToneMapping( vec3 color ) {
	const mat3 ACESInputMat = mat3(
		vec3( 0.59719, 0.07600, 0.02840 ),		vec3( 0.35458, 0.90834, 0.13383 ),
		vec3( 0.04823, 0.01566, 0.83777 )
	);
	const mat3 ACESOutputMat = mat3(
		vec3(  1.60475, -0.10208, -0.00327 ),		vec3( -0.53108,  1.10813, -0.07276 ),
		vec3( -0.07367, -0.00605,  1.07602 )
	);
	color *= toneMappingExposure / 0.6;
	color = ACESInputMat * color;
	color = RRTAndODTFit( color );
	color = ACESOutputMat * color;
	return saturate( color );
}
const mat3 LINEAR_REC2020_TO_LINEAR_SRGB = mat3(
	vec3( 1.6605, - 0.1246, - 0.0182 ),
	vec3( - 0.5876, 1.1329, - 0.1006 ),
	vec3( - 0.0728, - 0.0083, 1.1187 )
);
const mat3 LINEAR_SRGB_TO_LINEAR_REC2020 = mat3(
	vec3( 0.6274, 0.0691, 0.0164 ),
	vec3( 0.3293, 0.9195, 0.0880 ),
	vec3( 0.0433, 0.0113, 0.8956 )
);
vec3 agxDefaultContrastApprox( vec3 x ) {
	vec3 x2 = x * x;
	vec3 x4 = x2 * x2;
	return + 15.5 * x4 * x2
		- 40.14 * x4 * x
		+ 31.96 * x4
		- 6.868 * x2 * x
		+ 0.4298 * x2
		+ 0.1191 * x
		- 0.00232;
}
vec3 AgXToneMapping( vec3 color ) {
	const mat3 AgXInsetMatrix = mat3(
		vec3( 0.856627153315983, 0.137318972929847, 0.11189821299995 ),
		vec3( 0.0951212405381588, 0.761241990602591, 0.0767994186031903 ),
		vec3( 0.0482516061458583, 0.101439036467562, 0.811302368396859 )
	);
	const mat3 AgXOutsetMatrix = mat3(
		vec3( 1.1271005818144368, - 0.1413297634984383, - 0.14132976349843826 ),
		vec3( - 0.11060664309660323, 1.157823702216272, - 0.11060664309660294 ),
		vec3( - 0.016493938717834573, - 0.016493938717834257, 1.2519364065950405 )
	);
	const float AgxMinEv = - 12.47393;	const float AgxMaxEv = 4.026069;
	color *= toneMappingExposure;
	color = LINEAR_SRGB_TO_LINEAR_REC2020 * color;
	color = AgXInsetMatrix * color;
	color = max( color, 1e-10 );	color = log2( color );
	color = ( color - AgxMinEv ) / ( AgxMaxEv - AgxMinEv );
	color = clamp( color, 0.0, 1.0 );
	color = agxDefaultContrastApprox( color );
	color = AgXOutsetMatrix * color;
	color = pow( max( vec3( 0.0 ), color ), vec3( 2.2 ) );
	color = LINEAR_REC2020_TO_LINEAR_SRGB * color;
	color = clamp( color, 0.0, 1.0 );
	return color;
}
vec3 NeutralToneMapping( vec3 color ) {
	const float StartCompression = 0.8 - 0.04;
	const float Desaturation = 0.15;
	color *= toneMappingExposure;
	float x = min( color.r, min( color.g, color.b ) );
	float offset = x < 0.08 ? x - 6.25 * x * x : 0.04;
	color -= offset;
	float peak = max( color.r, max( color.g, color.b ) );
	if ( peak < StartCompression ) return color;
	float d = 1. - StartCompression;
	float newPeak = 1. - d * d / ( peak + d - StartCompression );
	color *= newPeak / peak;
	float g = 1. - 1. / ( Desaturation * ( peak - newPeak ) + 1. );
	return mix( color, vec3( newPeak ), g );
}
vec3 CustomToneMapping( vec3 color ) { return color; }`,Zf=`#ifdef USE_TRANSMISSION
	material.transmission = transmission;
	material.transmissionAlpha = 1.0;
	material.thickness = thickness;
	material.attenuationDistance = attenuationDistance;
	material.attenuationColor = attenuationColor;
	#ifdef USE_TRANSMISSIONMAP
		material.transmission *= texture2D( transmissionMap, vTransmissionMapUv ).r;
	#endif
	#ifdef USE_THICKNESSMAP
		material.thickness *= texture2D( thicknessMap, vThicknessMapUv ).g;
	#endif
	vec3 pos = vWorldPosition;
	vec3 v = normalize( cameraPosition - pos );
	vec3 n = transformNormalByInverseViewMatrix( normal, viewMatrix );
	vec4 transmitted = getIBLVolumeRefraction(
		n, v, material.roughness, material.diffuseContribution, material.specularColorBlended, material.specularF90,
		pos, modelMatrix, viewMatrix, projectionMatrix, material.dispersion, material.ior, material.thickness,
		material.attenuationColor, material.attenuationDistance );
	material.transmissionAlpha = mix( material.transmissionAlpha, transmitted.a, material.transmission );
	totalDiffuse = mix( totalDiffuse, transmitted.rgb, material.transmission );
#endif`,Jf=`#ifdef USE_TRANSMISSION
	uniform float transmission;
	uniform float thickness;
	uniform float attenuationDistance;
	uniform vec3 attenuationColor;
	#ifdef USE_TRANSMISSIONMAP
		uniform sampler2D transmissionMap;
	#endif
	#ifdef USE_THICKNESSMAP
		uniform sampler2D thicknessMap;
	#endif
	uniform vec2 transmissionSamplerSize;
	uniform sampler2D transmissionSamplerMap;
	uniform mat4 modelMatrix;
	uniform mat4 projectionMatrix;
	varying vec3 vWorldPosition;
	float w0( float a ) {
		return ( 1.0 / 6.0 ) * ( a * ( a * ( - a + 3.0 ) - 3.0 ) + 1.0 );
	}
	float w1( float a ) {
		return ( 1.0 / 6.0 ) * ( a *  a * ( 3.0 * a - 6.0 ) + 4.0 );
	}
	float w2( float a ){
		return ( 1.0 / 6.0 ) * ( a * ( a * ( - 3.0 * a + 3.0 ) + 3.0 ) + 1.0 );
	}
	float w3( float a ) {
		return ( 1.0 / 6.0 ) * ( a * a * a );
	}
	float g0( float a ) {
		return w0( a ) + w1( a );
	}
	float g1( float a ) {
		return w2( a ) + w3( a );
	}
	float h0( float a ) {
		return - 1.0 + w1( a ) / ( w0( a ) + w1( a ) );
	}
	float h1( float a ) {
		return 1.0 + w3( a ) / ( w2( a ) + w3( a ) );
	}
	vec4 bicubic( sampler2D tex, vec2 uv, vec4 texelSize, float lod ) {
		uv = uv * texelSize.zw + 0.5;
		vec2 iuv = floor( uv );
		vec2 fuv = fract( uv );
		float g0x = g0( fuv.x );
		float g1x = g1( fuv.x );
		float h0x = h0( fuv.x );
		float h1x = h1( fuv.x );
		float h0y = h0( fuv.y );
		float h1y = h1( fuv.y );
		vec2 p0 = ( vec2( iuv.x + h0x, iuv.y + h0y ) - 0.5 ) * texelSize.xy;
		vec2 p1 = ( vec2( iuv.x + h1x, iuv.y + h0y ) - 0.5 ) * texelSize.xy;
		vec2 p2 = ( vec2( iuv.x + h0x, iuv.y + h1y ) - 0.5 ) * texelSize.xy;
		vec2 p3 = ( vec2( iuv.x + h1x, iuv.y + h1y ) - 0.5 ) * texelSize.xy;
		return g0( fuv.y ) * ( g0x * textureLod( tex, p0, lod ) + g1x * textureLod( tex, p1, lod ) ) +
			g1( fuv.y ) * ( g0x * textureLod( tex, p2, lod ) + g1x * textureLod( tex, p3, lod ) );
	}
	vec4 textureBicubic( sampler2D sampler, vec2 uv, float lod ) {
		vec2 fLodSize = vec2( textureSize( sampler, int( lod ) ) );
		vec2 cLodSize = vec2( textureSize( sampler, int( lod + 1.0 ) ) );
		vec2 fLodSizeInv = 1.0 / fLodSize;
		vec2 cLodSizeInv = 1.0 / cLodSize;
		vec4 fSample = bicubic( sampler, uv, vec4( fLodSizeInv, fLodSize ), floor( lod ) );
		vec4 cSample = bicubic( sampler, uv, vec4( cLodSizeInv, cLodSize ), ceil( lod ) );
		return mix( fSample, cSample, fract( lod ) );
	}
	vec3 getVolumeTransmissionRay( const in vec3 n, const in vec3 v, const in float thickness, const in float ior, const in mat4 modelMatrix ) {
		vec3 refractionVector = refract( - v, normalize( n ), 1.0 / ior );
		vec3 modelScale;
		modelScale.x = length( vec3( modelMatrix[ 0 ].xyz ) );
		modelScale.y = length( vec3( modelMatrix[ 1 ].xyz ) );
		modelScale.z = length( vec3( modelMatrix[ 2 ].xyz ) );
		return normalize( refractionVector ) * thickness * modelScale;
	}
	float applyIorToRoughness( const in float roughness, const in float ior ) {
		return roughness * clamp( ior * 2.0 - 2.0, 0.0, 1.0 );
	}
	vec4 getTransmissionSample( const in vec2 fragCoord, const in float roughness, const in float ior ) {
		float lod = log2( transmissionSamplerSize.x ) * applyIorToRoughness( roughness, ior );
		return textureBicubic( transmissionSamplerMap, fragCoord.xy, lod );
	}
	vec3 volumeAttenuation( const in float transmissionDistance, const in vec3 attenuationColor, const in float attenuationDistance ) {
		if ( isinf( attenuationDistance ) ) {
			return vec3( 1.0 );
		} else {
			vec3 attenuationCoefficient = -log( attenuationColor ) / attenuationDistance;
			vec3 transmittance = exp( - attenuationCoefficient * transmissionDistance );			return transmittance;
		}
	}
	vec4 getIBLVolumeRefraction( const in vec3 n, const in vec3 v, const in float roughness, const in vec3 diffuseColor,
		const in vec3 specularColor, const in float specularF90, const in vec3 position, const in mat4 modelMatrix,
		const in mat4 viewMatrix, const in mat4 projMatrix, const in float dispersion, const in float ior, const in float thickness,
		const in vec3 attenuationColor, const in float attenuationDistance ) {
		vec4 transmittedLight;
		vec3 transmittance;
		#ifdef USE_DISPERSION
			float halfSpread = ( ior - 1.0 ) * 0.025 * dispersion;
			vec3 iors = vec3( ior - halfSpread, ior, ior + halfSpread );
			for ( int i = 0; i < 3; i ++ ) {
				vec3 transmissionRay = getVolumeTransmissionRay( n, v, thickness, iors[ i ], modelMatrix );
				vec3 refractedRayExit = position + transmissionRay;
				vec4 ndcPos = projMatrix * viewMatrix * vec4( refractedRayExit, 1.0 );
				vec2 refractionCoords = ndcPos.xy / ndcPos.w;
				refractionCoords += 1.0;
				refractionCoords /= 2.0;
				vec4 transmissionSample = getTransmissionSample( refractionCoords, roughness, iors[ i ] );
				transmittedLight[ i ] = transmissionSample[ i ];
				transmittedLight.a += transmissionSample.a;
				transmittance[ i ] = diffuseColor[ i ] * volumeAttenuation( length( transmissionRay ), attenuationColor, attenuationDistance )[ i ];
			}
			transmittedLight.a /= 3.0;
		#else
			vec3 transmissionRay = getVolumeTransmissionRay( n, v, thickness, ior, modelMatrix );
			vec3 refractedRayExit = position + transmissionRay;
			vec4 ndcPos = projMatrix * viewMatrix * vec4( refractedRayExit, 1.0 );
			vec2 refractionCoords = ndcPos.xy / ndcPos.w;
			refractionCoords += 1.0;
			refractionCoords /= 2.0;
			transmittedLight = getTransmissionSample( refractionCoords, roughness, ior );
			transmittance = diffuseColor * volumeAttenuation( length( transmissionRay ), attenuationColor, attenuationDistance );
		#endif
		vec3 attenuatedColor = transmittance * transmittedLight.rgb;
		vec3 F = EnvironmentBRDF( n, v, specularColor, specularF90, roughness );
		float transmittanceFactor = ( transmittance.r + transmittance.g + transmittance.b ) / 3.0;
		return vec4( ( 1.0 - F ) * attenuatedColor, 1.0 - ( 1.0 - transmittedLight.a ) * transmittanceFactor );
	}
#endif`,$f=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	varying vec2 vUv;
#endif
#ifdef USE_MAP
	varying vec2 vMapUv;
#endif
#ifdef USE_ALPHAMAP
	varying vec2 vAlphaMapUv;
#endif
#ifdef USE_LIGHTMAP
	varying vec2 vLightMapUv;
#endif
#ifdef USE_AOMAP
	varying vec2 vAoMapUv;
#endif
#ifdef USE_BUMPMAP
	varying vec2 vBumpMapUv;
#endif
#ifdef USE_NORMALMAP
	varying vec2 vNormalMapUv;
#endif
#ifdef USE_EMISSIVEMAP
	varying vec2 vEmissiveMapUv;
#endif
#ifdef USE_METALNESSMAP
	varying vec2 vMetalnessMapUv;
#endif
#ifdef USE_ROUGHNESSMAP
	varying vec2 vRoughnessMapUv;
#endif
#ifdef USE_ANISOTROPYMAP
	varying vec2 vAnisotropyMapUv;
#endif
#ifdef USE_CLEARCOATMAP
	varying vec2 vClearcoatMapUv;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	varying vec2 vClearcoatNormalMapUv;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	varying vec2 vClearcoatRoughnessMapUv;
#endif
#ifdef USE_IRIDESCENCEMAP
	varying vec2 vIridescenceMapUv;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	varying vec2 vIridescenceThicknessMapUv;
#endif
#ifdef USE_SHEEN_COLORMAP
	varying vec2 vSheenColorMapUv;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	varying vec2 vSheenRoughnessMapUv;
#endif
#ifdef USE_SPECULARMAP
	varying vec2 vSpecularMapUv;
#endif
#ifdef USE_SPECULAR_COLORMAP
	varying vec2 vSpecularColorMapUv;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	varying vec2 vSpecularIntensityMapUv;
#endif
#ifdef USE_TRANSMISSIONMAP
	uniform mat3 transmissionMapTransform;
	varying vec2 vTransmissionMapUv;
#endif
#ifdef USE_THICKNESSMAP
	uniform mat3 thicknessMapTransform;
	varying vec2 vThicknessMapUv;
#endif`,Kf=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	varying vec2 vUv;
#endif
#ifdef USE_MAP
	uniform mat3 mapTransform;
	varying vec2 vMapUv;
#endif
#ifdef USE_ALPHAMAP
	uniform mat3 alphaMapTransform;
	varying vec2 vAlphaMapUv;
#endif
#ifdef USE_LIGHTMAP
	uniform mat3 lightMapTransform;
	varying vec2 vLightMapUv;
#endif
#ifdef USE_AOMAP
	uniform mat3 aoMapTransform;
	varying vec2 vAoMapUv;
#endif
#ifdef USE_BUMPMAP
	uniform mat3 bumpMapTransform;
	varying vec2 vBumpMapUv;
#endif
#ifdef USE_NORMALMAP
	uniform mat3 normalMapTransform;
	varying vec2 vNormalMapUv;
#endif
#ifdef USE_DISPLACEMENTMAP
	uniform mat3 displacementMapTransform;
	varying vec2 vDisplacementMapUv;
#endif
#ifdef USE_EMISSIVEMAP
	uniform mat3 emissiveMapTransform;
	varying vec2 vEmissiveMapUv;
#endif
#ifdef USE_METALNESSMAP
	uniform mat3 metalnessMapTransform;
	varying vec2 vMetalnessMapUv;
#endif
#ifdef USE_ROUGHNESSMAP
	uniform mat3 roughnessMapTransform;
	varying vec2 vRoughnessMapUv;
#endif
#ifdef USE_ANISOTROPYMAP
	uniform mat3 anisotropyMapTransform;
	varying vec2 vAnisotropyMapUv;
#endif
#ifdef USE_CLEARCOATMAP
	uniform mat3 clearcoatMapTransform;
	varying vec2 vClearcoatMapUv;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform mat3 clearcoatNormalMapTransform;
	varying vec2 vClearcoatNormalMapUv;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform mat3 clearcoatRoughnessMapTransform;
	varying vec2 vClearcoatRoughnessMapUv;
#endif
#ifdef USE_SHEEN_COLORMAP
	uniform mat3 sheenColorMapTransform;
	varying vec2 vSheenColorMapUv;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	uniform mat3 sheenRoughnessMapTransform;
	varying vec2 vSheenRoughnessMapUv;
#endif
#ifdef USE_IRIDESCENCEMAP
	uniform mat3 iridescenceMapTransform;
	varying vec2 vIridescenceMapUv;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform mat3 iridescenceThicknessMapTransform;
	varying vec2 vIridescenceThicknessMapUv;
#endif
#ifdef USE_SPECULARMAP
	uniform mat3 specularMapTransform;
	varying vec2 vSpecularMapUv;
#endif
#ifdef USE_SPECULAR_COLORMAP
	uniform mat3 specularColorMapTransform;
	varying vec2 vSpecularColorMapUv;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	uniform mat3 specularIntensityMapTransform;
	varying vec2 vSpecularIntensityMapUv;
#endif
#ifdef USE_TRANSMISSIONMAP
	uniform mat3 transmissionMapTransform;
	varying vec2 vTransmissionMapUv;
#endif
#ifdef USE_THICKNESSMAP
	uniform mat3 thicknessMapTransform;
	varying vec2 vThicknessMapUv;
#endif`,Qf=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	vUv = vec3( uv, 1 ).xy;
#endif
#ifdef USE_MAP
	vMapUv = ( mapTransform * vec3( MAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ALPHAMAP
	vAlphaMapUv = ( alphaMapTransform * vec3( ALPHAMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_LIGHTMAP
	vLightMapUv = ( lightMapTransform * vec3( LIGHTMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_AOMAP
	vAoMapUv = ( aoMapTransform * vec3( AOMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_BUMPMAP
	vBumpMapUv = ( bumpMapTransform * vec3( BUMPMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_NORMALMAP
	vNormalMapUv = ( normalMapTransform * vec3( NORMALMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_DISPLACEMENTMAP
	vDisplacementMapUv = ( displacementMapTransform * vec3( DISPLACEMENTMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_EMISSIVEMAP
	vEmissiveMapUv = ( emissiveMapTransform * vec3( EMISSIVEMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_METALNESSMAP
	vMetalnessMapUv = ( metalnessMapTransform * vec3( METALNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ROUGHNESSMAP
	vRoughnessMapUv = ( roughnessMapTransform * vec3( ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ANISOTROPYMAP
	vAnisotropyMapUv = ( anisotropyMapTransform * vec3( ANISOTROPYMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOATMAP
	vClearcoatMapUv = ( clearcoatMapTransform * vec3( CLEARCOATMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	vClearcoatNormalMapUv = ( clearcoatNormalMapTransform * vec3( CLEARCOAT_NORMALMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	vClearcoatRoughnessMapUv = ( clearcoatRoughnessMapTransform * vec3( CLEARCOAT_ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_IRIDESCENCEMAP
	vIridescenceMapUv = ( iridescenceMapTransform * vec3( IRIDESCENCEMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	vIridescenceThicknessMapUv = ( iridescenceThicknessMapTransform * vec3( IRIDESCENCE_THICKNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SHEEN_COLORMAP
	vSheenColorMapUv = ( sheenColorMapTransform * vec3( SHEEN_COLORMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	vSheenRoughnessMapUv = ( sheenRoughnessMapTransform * vec3( SHEEN_ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULARMAP
	vSpecularMapUv = ( specularMapTransform * vec3( SPECULARMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULAR_COLORMAP
	vSpecularColorMapUv = ( specularColorMapTransform * vec3( SPECULAR_COLORMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	vSpecularIntensityMapUv = ( specularIntensityMapTransform * vec3( SPECULAR_INTENSITYMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_TRANSMISSIONMAP
	vTransmissionMapUv = ( transmissionMapTransform * vec3( TRANSMISSIONMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_THICKNESSMAP
	vThicknessMapUv = ( thicknessMapTransform * vec3( THICKNESSMAP_UV, 1 ) ).xy;
#endif`;var jf=`#if defined( USE_ENVMAP ) || defined( DISTANCE ) || defined ( USE_SHADOWMAP ) || defined ( USE_TRANSMISSION ) || NUM_SPOT_LIGHT_COORDS > 0
	vec4 worldPosition = vec4( transformed, 1.0 );
	#ifdef USE_BATCHING
		worldPosition = batchingMatrix * worldPosition;
	#endif
	#ifdef USE_INSTANCING
		worldPosition = instanceMatrix * worldPosition;
	#endif
	worldPosition = modelMatrix * worldPosition;
#endif`,tp=`varying vec2 vUv;
uniform mat3 uvTransform;
void main() {
	vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	gl_Position = vec4( position.xy, 1.0, 1.0 );
}`,ep=`uniform sampler2D t2D;
uniform float backgroundIntensity;
varying vec2 vUv;
void main() {
	vec4 texColor = texture2D( t2D, vUv );
	#ifdef DECODE_VIDEO_TEXTURE
		texColor = vec4( mix( pow( texColor.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), texColor.rgb * 0.0773993808, vec3( lessThanEqual( texColor.rgb, vec3( 0.04045 ) ) ) ), texColor.w );
	#endif
	texColor.rgb *= backgroundIntensity;
	gl_FragColor = texColor;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,np=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,ip=`#ifdef ENVMAP_TYPE_CUBE
	uniform samplerCube envMap;
#elif defined( ENVMAP_TYPE_CUBE_UV )
	uniform sampler2D envMap;
#endif
uniform float backgroundBlurriness;
uniform float backgroundIntensity;
uniform mat3 backgroundRotation;
varying vec3 vWorldDirection;
#include <cube_uv_reflection_fragment>
void main() {
	#ifdef ENVMAP_TYPE_CUBE
		vec4 texColor = textureCube( envMap, backgroundRotation * vWorldDirection );
	#elif defined( ENVMAP_TYPE_CUBE_UV )
		vec4 texColor = textureCubeUV( envMap, backgroundRotation * vWorldDirection, backgroundBlurriness );
	#else
		vec4 texColor = vec4( 0.0, 0.0, 0.0, 1.0 );
	#endif
	texColor.rgb *= backgroundIntensity;
	gl_FragColor = texColor;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,sp=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,rp=`uniform samplerCube tCube;
uniform float tFlip;
uniform float opacity;
varying vec3 vWorldDirection;
void main() {
	vec4 texColor = textureCube( tCube, vec3( tFlip * vWorldDirection.x, vWorldDirection.yz ) );
	gl_FragColor = texColor;
	gl_FragColor.a *= opacity;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,ap=`#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
varying vec2 vHighPrecisionZW;
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <skinbase_vertex>
	#include <morphinstance_vertex>
	#ifdef USE_DISPLACEMENTMAP
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vHighPrecisionZW = gl_Position.zw;
}`,op=`#if DEPTH_PACKING == 3200
	uniform float opacity;
#endif
#include <common>
#include <packing>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
varying vec2 vHighPrecisionZW;
void main() {
	vec4 diffuseColor = vec4( 1.0 );
	#include <clipping_planes_fragment>
	#if DEPTH_PACKING == 3200
		diffuseColor.a = opacity;
	#endif
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <logdepthbuf_fragment>
	#ifdef USE_REVERSED_DEPTH_BUFFER
		float fragCoordZ = vHighPrecisionZW[ 0 ] / vHighPrecisionZW[ 1 ];
	#else
		float fragCoordZ = 0.5 * vHighPrecisionZW[ 0 ] / vHighPrecisionZW[ 1 ] + 0.5;
	#endif
	#if DEPTH_PACKING == 3200
		gl_FragColor = vec4( vec3( 1.0 - fragCoordZ ), opacity );
	#elif DEPTH_PACKING == 3201
		gl_FragColor = packDepthToRGBA( fragCoordZ );
	#elif DEPTH_PACKING == 3202
		gl_FragColor = vec4( packDepthToRGB( fragCoordZ ), 1.0 );
	#elif DEPTH_PACKING == 3203
		gl_FragColor = vec4( packDepthToRG( fragCoordZ ), 0.0, 1.0 );
	#endif
}`,lp=`#define DISTANCE
varying vec3 vWorldPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <skinbase_vertex>
	#include <morphinstance_vertex>
	#ifdef USE_DISPLACEMENTMAP
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <worldpos_vertex>
	#include <clipping_planes_vertex>
	vWorldPosition = worldPosition.xyz;
}`,cp=`#define DISTANCE
uniform vec3 referencePosition;
uniform float nearDistance;
uniform float farDistance;
varying vec3 vWorldPosition;
#include <common>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( 1.0 );
	#include <clipping_planes_fragment>
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	float dist = length( vWorldPosition - referencePosition );
	dist = ( dist - nearDistance ) / ( farDistance - nearDistance );
	dist = saturate( dist );
	gl_FragColor = vec4( dist, 0.0, 0.0, 1.0 );
}`,hp=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
}`,up=`uniform sampler2D tEquirect;
varying vec3 vWorldDirection;
#include <common>
void main() {
	vec3 direction = normalize( vWorldDirection );
	vec2 sampleUV = equirectUv( direction );
	gl_FragColor = texture2D( tEquirect, sampleUV );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,dp=`uniform float scale;
attribute float lineDistance;
varying float vLineDistance;
#include <common>
#include <uv_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	vLineDistance = scale * lineDistance;
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
}`,fp=`uniform vec3 diffuse;
uniform float opacity;
uniform float dashSize;
uniform float totalSize;
varying float vLineDistance;
#include <common>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	if ( mod( vLineDistance, totalSize ) > dashSize ) {
		discard;
	}
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,pp=`#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#if defined ( USE_ENVMAP ) || defined ( USE_SKINNING )
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinbase_vertex>
		#include <skinnormal_vertex>
		#include <defaultnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <fog_vertex>
}`,mp=`uniform vec3 diffuse;
uniform float opacity;
#ifndef FLAT_SHADED
	varying vec3 vNormal;
#endif
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	#ifdef USE_LIGHTMAP
		vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
		reflectedLight.indirectDiffuse += lightMapTexel.rgb * lightMapIntensity * RECIPROCAL_PI;
	#else
		reflectedLight.indirectDiffuse += vec3( 1.0 );
	#endif
	#include <aomap_fragment>
	reflectedLight.indirectDiffuse *= diffuseColor.rgb;
	vec3 outgoingLight = reflectedLight.indirectDiffuse;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,gp=`#define LAMBERT
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,_p=`#define LAMBERT
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <cube_uv_reflection_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <envmap_physical_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_lambert_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_lambert_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,xp=`#define MATCAP
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <color_pars_vertex>
#include <displacementmap_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
	vViewPosition = - mvPosition.xyz;
}`,vp=`#define MATCAP
uniform vec3 diffuse;
uniform float opacity;
uniform sampler2D matcap;
varying vec3 vViewPosition;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <normal_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	vec3 viewDir = normalize( vViewPosition );
	vec3 x = normalize( vec3( viewDir.z, 0.0, - viewDir.x ) );
	vec3 y = cross( viewDir, x );
	vec2 uv = vec2( dot( x, normal ), dot( y, normal ) ) * 0.495 + 0.5;
	#ifdef USE_MATCAP
		vec4 matcapColor = texture2D( matcap, uv );
	#else
		vec4 matcapColor = vec4( vec3( mix( 0.2, 0.8, uv.y ) ), 1.0 );
	#endif
	vec3 outgoingLight = diffuseColor.rgb * matcapColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,yp=`#define NORMAL
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	varying vec3 vViewPosition;
#endif
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	vViewPosition = - mvPosition.xyz;
#endif
}`,Sp=`#define NORMAL
uniform float opacity;
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	varying vec3 vViewPosition;
#endif
#include <uv_pars_fragment>
#include <normal_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( 0.0, 0.0, 0.0, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	gl_FragColor = vec4( normalize( normal ) * 0.5 + 0.5, diffuseColor.a );
	#ifdef OPAQUE
		gl_FragColor.a = 1.0;
	#endif
}`,Mp=`#define PHONG
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,bp=`#define PHONG
uniform vec3 diffuse;
uniform vec3 emissive;
uniform vec3 specular;
uniform float shininess;
uniform float opacity;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <cube_uv_reflection_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <envmap_physical_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_phong_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_phong_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + reflectedLight.directSpecular + reflectedLight.indirectSpecular + totalEmissiveRadiance;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,Tp=`#define STANDARD
varying vec3 vViewPosition;
#ifdef USE_TRANSMISSION
	varying vec3 vWorldPosition;
#endif
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
#ifdef USE_TRANSMISSION
	vWorldPosition = worldPosition.xyz;
#endif
}`,Ep=`#define STANDARD
#ifdef PHYSICAL
	#define IOR
	#define USE_SPECULAR
#endif
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float roughness;
uniform float metalness;
uniform float opacity;
#ifdef IOR
	uniform float ior;
#endif
#ifdef USE_SPECULAR
	uniform float specularIntensity;
	uniform vec3 specularColor;
	#ifdef USE_SPECULAR_COLORMAP
		uniform sampler2D specularColorMap;
	#endif
	#ifdef USE_SPECULAR_INTENSITYMAP
		uniform sampler2D specularIntensityMap;
	#endif
#endif
#ifdef USE_CLEARCOAT
	uniform float clearcoat;
	uniform float clearcoatRoughness;
#endif
#ifdef USE_DISPERSION
	uniform float dispersion;
#endif
#ifdef USE_RETROREFLECTION
	uniform float retroreflectivity;
#endif
#ifdef USE_IRIDESCENCE
	uniform float iridescence;
	uniform float iridescenceIOR;
	uniform float iridescenceThicknessMinimum;
	uniform float iridescenceThicknessMaximum;
#endif
#ifdef USE_SHEEN
	uniform vec3 sheenColor;
	uniform float sheenRoughness;
	#ifdef USE_SHEEN_COLORMAP
		uniform sampler2D sheenColorMap;
	#endif
	#ifdef USE_SHEEN_ROUGHNESSMAP
		uniform sampler2D sheenRoughnessMap;
	#endif
#endif
#ifdef USE_ANISOTROPY
	uniform vec2 anisotropyVector;
	#ifdef USE_ANISOTROPYMAP
		uniform sampler2D anisotropyMap;
	#endif
#endif
varying vec3 vViewPosition;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <iridescence_fragment>
#include <cube_uv_reflection_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_physical_pars_fragment>
#include <fog_pars_fragment>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_physical_pars_fragment>
#include <transmission_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <clearcoat_pars_fragment>
#include <iridescence_pars_fragment>
#include <roughnessmap_pars_fragment>
#include <metalnessmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <roughnessmap_fragment>
	#include <metalnessmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <clearcoat_normal_fragment_begin>
	#include <clearcoat_normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_physical_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 totalDiffuse = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse;
	vec3 totalSpecular = reflectedLight.directSpecular + reflectedLight.indirectSpecular;
	#include <transmission_fragment>
	vec3 outgoingLight = totalDiffuse + totalSpecular + totalEmissiveRadiance;
	#ifdef USE_SHEEN
 
		outgoingLight = outgoingLight + sheenSpecularDirect + sheenSpecularIndirect;
 
 	#endif
	#ifdef USE_CLEARCOAT
		float dotNVcc = saturate( dot( geometryClearcoatNormal, geometryViewDir ) );
		vec3 Fcc = F_Schlick( material.clearcoatF0, material.clearcoatF90, dotNVcc );
		outgoingLight = outgoingLight * ( 1.0 - material.clearcoat * Fcc ) + ( clearcoatSpecularDirect + clearcoatSpecularIndirect ) * material.clearcoat;
	#endif
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,Ap=`#define TOON
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,wp=`#define TOON
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <gradientmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_toon_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_toon_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,Cp=`uniform float size;
uniform float scale;
#include <common>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
#ifdef USE_POINTS_UV
	varying vec2 vUv;
	uniform mat3 uvTransform;
#endif
void main() {
	#ifdef USE_POINTS_UV
		vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	#endif
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <project_vertex>
	gl_PointSize = size;
	#ifdef USE_SIZEATTENUATION
		bool isPerspective = isPerspectiveMatrix( projectionMatrix );
		if ( isPerspective ) gl_PointSize *= ( scale / - mvPosition.z );
	#endif
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <worldpos_vertex>
	#include <fog_vertex>
}`,Rp=`uniform vec3 diffuse;
uniform float opacity;
#include <common>
#include <color_pars_fragment>
#include <map_particle_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_particle_fragment>
	#include <color_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,Ip=`#include <common>
#include <batching_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <shadowmap_pars_vertex>
void main() {
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,Pp=`uniform vec3 color;
uniform float opacity;
#include <common>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <logdepthbuf_pars_fragment>
#include <shadowmap_pars_fragment>
#include <shadowmask_pars_fragment>
void main() {
	#include <logdepthbuf_fragment>
	gl_FragColor = vec4( color, opacity * ( 1.0 - getShadowMask() ) );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,Lp=`uniform float rotation;
uniform vec2 center;
#include <common>
#include <uv_pars_vertex>
#include <fog_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	vec4 mvPosition = modelViewMatrix[ 3 ];
	vec2 scale = vec2( length( modelMatrix[ 0 ].xyz ), length( modelMatrix[ 1 ].xyz ) );
	#ifndef USE_SIZEATTENUATION
		bool isPerspective = isPerspectiveMatrix( projectionMatrix );
		if ( isPerspective ) scale *= - mvPosition.z;
	#endif
	vec2 alignedPosition = ( position.xy - ( center - vec2( 0.5 ) ) ) * scale;
	vec2 rotatedPosition;
	rotatedPosition.x = cos( rotation ) * alignedPosition.x - sin( rotation ) * alignedPosition.y;
	rotatedPosition.y = sin( rotation ) * alignedPosition.x + cos( rotation ) * alignedPosition.y;
	mvPosition.xy += rotatedPosition;
	gl_Position = projectionMatrix * mvPosition;
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
}`,Np=`uniform vec3 diffuse;
uniform float opacity;
#include <common>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
}`,qt={alphahash_fragment:ju,alphahash_pars_fragment:td,alphamap_fragment:ed,alphamap_pars_fragment:nd,alphatest_fragment:id,alphatest_pars_fragment:sd,aomap_fragment:rd,aomap_pars_fragment:ad,batching_pars_vertex:od,batching_vertex:ld,begin_vertex:cd,beginnormal_vertex:hd,bsdfs:ud,iridescence_fragment:dd,bumpmap_pars_fragment:fd,clipping_planes_fragment:pd,clipping_planes_pars_fragment:md,clipping_planes_pars_vertex:gd,clipping_planes_vertex:_d,color_fragment:xd,color_pars_fragment:vd,color_pars_vertex:yd,color_vertex:Sd,common:Md,cube_uv_reflection_fragment:bd,defaultnormal_vertex:Td,displacementmap_pars_vertex:Ed,displacementmap_vertex:Ad,emissivemap_fragment:wd,emissivemap_pars_fragment:Cd,colorspace_fragment:Rd,colorspace_pars_fragment:Id,envmap_fragment:Pd,envmap_common_pars_fragment:Ld,envmap_pars_fragment:Nd,envmap_pars_vertex:Dd,envmap_physical_pars_fragment:Xd,envmap_vertex:Ud,fog_vertex:Fd,fog_pars_vertex:Od,fog_fragment:Bd,fog_pars_fragment:zd,gradientmap_pars_fragment:Gd,lightmap_pars_fragment:kd,lights_lambert_fragment:Hd,lights_lambert_pars_fragment:Vd,lights_pars_begin:Wd,lights_toon_fragment:qd,lights_toon_pars_fragment:Yd,lights_phong_fragment:Zd,lights_phong_pars_fragment:Jd,lights_physical_fragment:$d,lights_physical_pars_fragment:Kd,lights_fragment_begin:Qd,lights_fragment_maps:jd,lights_fragment_end:tf,lightprobes_pars_fragment:ef,logdepthbuf_fragment:nf,logdepthbuf_pars_fragment:sf,logdepthbuf_pars_vertex:rf,logdepthbuf_vertex:af,map_fragment:of,map_pars_fragment:lf,map_particle_fragment:cf,map_particle_pars_fragment:hf,metalnessmap_fragment:uf,metalnessmap_pars_fragment:df,morphinstance_vertex:ff,morphcolor_vertex:pf,morphnormal_vertex:mf,morphtarget_pars_vertex:gf,morphtarget_vertex:_f,normal_fragment_begin:xf,normal_fragment_maps:vf,normal_pars_fragment:yf,normal_pars_vertex:Sf,normal_vertex:Mf,normalmap_pars_fragment:bf,clearcoat_normal_fragment_begin:Tf,clearcoat_normal_fragment_maps:Ef,clearcoat_pars_fragment:Af,iridescence_pars_fragment:wf,opaque_fragment:Cf,packing:Rf,premultiplied_alpha_fragment:If,project_vertex:Pf,dithering_fragment:Lf,dithering_pars_fragment:Nf,roughnessmap_fragment:Df,roughnessmap_pars_fragment:Uf,shadowmap_pars_fragment:Ff,shadowmap_pars_vertex:Of,shadowmap_vertex:Bf,shadowmask_pars_fragment:zf,skinbase_vertex:Gf,skinning_pars_vertex:kf,skinning_vertex:Hf,skinnormal_vertex:Vf,specularmap_fragment:Wf,specularmap_pars_fragment:Xf,tonemapping_fragment:qf,tonemapping_pars_fragment:Yf,transmission_fragment:Zf,transmission_pars_fragment:Jf,uv_pars_fragment:$f,uv_pars_vertex:Kf,uv_vertex:Qf,worldpos_vertex:jf,background_vert:tp,background_frag:ep,backgroundCube_vert:np,backgroundCube_frag:ip,cube_vert:sp,cube_frag:rp,depth_vert:ap,depth_frag:op,distance_vert:lp,distance_frag:cp,equirect_vert:hp,equirect_frag:up,linedashed_vert:dp,linedashed_frag:fp,meshbasic_vert:pp,meshbasic_frag:mp,meshlambert_vert:gp,meshlambert_frag:_p,meshmatcap_vert:xp,meshmatcap_frag:vp,meshnormal_vert:yp,meshnormal_frag:Sp,meshphong_vert:Mp,meshphong_frag:bp,meshphysical_vert:Tp,meshphysical_frag:Ep,meshtoon_vert:Ap,meshtoon_frag:wp,points_vert:Cp,points_frag:Rp,shadow_vert:Ip,shadow_frag:Pp,sprite_vert:Lp,sprite_frag:Np},gt={common:{diffuse:{value:new Zt(16777215)},opacity:{value:1},map:{value:null},mapTransform:{value:new Gt},alphaMap:{value:null},alphaMapTransform:{value:new Gt},alphaTest:{value:0}},specularmap:{specularMap:{value:null},specularMapTransform:{value:new Gt}},envmap:{envMap:{value:null},envMapRotation:{value:new Gt},reflectivity:{value:1},ior:{value:1.5},refractionRatio:{value:0.98},dfgLUT:{value:null}},aomap:{aoMap:{value:null},aoMapIntensity:{value:1},aoMapTransform:{value:new Gt}},lightmap:{lightMap:{value:null},lightMapIntensity:{value:1},lightMapTransform:{value:new Gt}},bumpmap:{bumpMap:{value:null},bumpMapTransform:{value:new Gt},bumpScale:{value:1}},normalmap:{normalMap:{value:null},normalMapTransform:{value:new Gt},normalScale:{value:new lt(1,1)}},displacementmap:{displacementMap:{value:null},displacementMapTransform:{value:new Gt},displacementScale:{value:1},displacementBias:{value:0}},emissivemap:{emissiveMap:{value:null},emissiveMapTransform:{value:new Gt}},metalnessmap:{metalnessMap:{value:null},metalnessMapTransform:{value:new Gt}},roughnessmap:{roughnessMap:{value:null},roughnessMapTransform:{value:new Gt}},gradientmap:{gradientMap:{value:null}},fog:{fogDensity:{value:0.00025},fogNear:{value:1},fogFar:{value:2000},fogColor:{value:new Zt(16777215)}},lights:{ambientLightColor:{value:[]},lightProbe:{value:[]},sunLights:{value:[],properties:{direction:{},color:{}}},sunLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},sunShadowMatrix:{value:[]},sunShadowCascade:{value:[]},directionalLights:{value:[],properties:{direction:{},color:{}}},directionalLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},directionalShadowMatrix:{value:[]},spotLights:{value:[],properties:{color:{},position:{},direction:{},distance:{},coneCos:{},penumbraCos:{},decay:{}}},spotLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},spotLightMap:{value:[]},spotLightMatrix:{value:[]},pointLights:{value:[],properties:{color:{},position:{},decay:{},distance:{}}},pointLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{},shadowCameraNear:{},shadowCameraFar:{}}},pointShadowMatrix:{value:[]},hemisphereLights:{value:[],properties:{direction:{},skyColor:{},groundColor:{}}},rectAreaLights:{value:[],properties:{color:{},position:{},width:{},height:{}}},ltc_1:{value:null},ltc_2:{value:null},probesSH:{value:null},probesMin:{value:new P},probesMax:{value:new P},probesResolution:{value:new P}},points:{diffuse:{value:new Zt(16777215)},opacity:{value:1},size:{value:1},scale:{value:1},map:{value:null},alphaMap:{value:null},alphaMapTransform:{value:new Gt},alphaTest:{value:0},uvTransform:{value:new Gt}},sprite:{diffuse:{value:new Zt(16777215)},opacity:{value:1},center:{value:new lt(0.5,0.5)},rotation:{value:0},map:{value:null},mapTransform:{value:new Gt},alphaMap:{value:null},alphaMapTransform:{value:new Gt},alphaTest:{value:0}}},un={basic:{uniforms:Ie([gt.common,gt.specularmap,gt.envmap,gt.aomap,gt.lightmap,gt.fog]),vertexShader:qt.meshbasic_vert,fragmentShader:qt.meshbasic_frag},lambert:{uniforms:Ie([gt.common,gt.specularmap,gt.envmap,gt.aomap,gt.lightmap,gt.emissivemap,gt.bumpmap,gt.normalmap,gt.displacementmap,gt.fog,gt.lights,{emissive:{value:new Zt(0)},envMapIntensity:{value:1}}]),vertexShader:qt.meshlambert_vert,fragmentShader:qt.meshlambert_frag},phong:{uniforms:Ie([gt.common,gt.specularmap,gt.envmap,gt.aomap,gt.lightmap,gt.emissivemap,gt.bumpmap,gt.normalmap,gt.displacementmap,gt.fog,gt.lights,{emissive:{value:new Zt(0)},specular:{value:new Zt(1118481)},shininess:{value:30},envMapIntensity:{value:1}}]),vertexShader:qt.meshphong_vert,fragmentShader:qt.meshphong_frag},standard:{uniforms:Ie([gt.common,gt.envmap,gt.aomap,gt.lightmap,gt.emissivemap,gt.bumpmap,gt.normalmap,gt.displacementmap,gt.roughnessmap,gt.metalnessmap,gt.fog,gt.lights,{emissive:{value:new Zt(0)},roughness:{value:1},metalness:{value:0},envMapIntensity:{value:1}}]),vertexShader:qt.meshphysical_vert,fragmentShader:qt.meshphysical_frag},toon:{uniforms:Ie([gt.common,gt.aomap,gt.lightmap,gt.emissivemap,gt.bumpmap,gt.normalmap,gt.displacementmap,gt.gradientmap,gt.fog,gt.lights,{emissive:{value:new Zt(0)}}]),vertexShader:qt.meshtoon_vert,fragmentShader:qt.meshtoon_frag},matcap:{uniforms:Ie([gt.common,gt.bumpmap,gt.normalmap,gt.displacementmap,gt.fog,{matcap:{value:null}}]),vertexShader:qt.meshmatcap_vert,fragmentShader:qt.meshmatcap_frag},points:{uniforms:Ie([gt.points,gt.fog]),vertexShader:qt.points_vert,fragmentShader:qt.points_frag},dashed:{uniforms:Ie([gt.common,gt.fog,{scale:{value:1},dashSize:{value:1},totalSize:{value:2}}]),vertexShader:qt.linedashed_vert,fragmentShader:qt.linedashed_frag},depth:{uniforms:Ie([gt.common,gt.displacementmap]),vertexShader:qt.depth_vert,fragmentShader:qt.depth_frag},normal:{uniforms:Ie([gt.common,gt.bumpmap,gt.normalmap,gt.displacementmap,{opacity:{value:1}}]),vertexShader:qt.meshnormal_vert,fragmentShader:qt.meshnormal_frag},sprite:{uniforms:Ie([gt.sprite,gt.fog]),vertexShader:qt.sprite_vert,fragmentShader:qt.sprite_frag},background:{uniforms:{uvTransform:{value:new Gt},t2D:{value:null},backgroundIntensity:{value:1}},vertexShader:qt.background_vert,fragmentShader:qt.background_frag},backgroundCube:{uniforms:{envMap:{value:null},backgroundBlurriness:{value:0},backgroundIntensity:{value:1},backgroundRotation:{value:new Gt}},vertexShader:qt.backgroundCube_vert,fragmentShader:qt.backgroundCube_frag},cube:{uniforms:{tCube:{value:null},tFlip:{value:-1},opacity:{value:1}},vertexShader:qt.cube_vert,fragmentShader:qt.cube_frag},equirect:{uniforms:{tEquirect:{value:null}},vertexShader:qt.equirect_vert,fragmentShader:qt.equirect_frag},distance:{uniforms:Ie([gt.common,gt.displacementmap,{referencePosition:{value:new P},nearDistance:{value:1},farDistance:{value:1000}}]),vertexShader:qt.distance_vert,fragmentShader:qt.distance_frag},shadow:{uniforms:Ie([gt.lights,gt.fog,{color:{value:new Zt(0)},opacity:{value:1}}]),vertexShader:qt.shadow_vert,fragmentShader:qt.shadow_frag}};un.physical={uniforms:Ie([un.standard.uniforms,{clearcoat:{value:0},clearcoatMap:{value:null},clearcoatMapTransform:{value:new Gt},clearcoatNormalMap:{value:null},clearcoatNormalMapTransform:{value:new Gt},clearcoatNormalScale:{value:new lt(1,1)},clearcoatRoughness:{value:0},clearcoatRoughnessMap:{value:null},clearcoatRoughnessMapTransform:{value:new Gt},dispersion:{value:0},retroreflectivity:{value:0},iridescence:{value:0},iridescenceMap:{value:null},iridescenceMapTransform:{value:new Gt},iridescenceIOR:{value:1.3},iridescenceThicknessMinimum:{value:100},iridescenceThicknessMaximum:{value:400},iridescenceThicknessMap:{value:null},iridescenceThicknessMapTransform:{value:new Gt},sheen:{value:0},sheenColor:{value:new Zt(0)},sheenColorMap:{value:null},sheenColorMapTransform:{value:new Gt},sheenRoughness:{value:1},sheenRoughnessMap:{value:null},sheenRoughnessMapTransform:{value:new Gt},transmission:{value:0},transmissionMap:{value:null},transmissionMapTransform:{value:new Gt},transmissionSamplerSize:{value:new lt},transmissionSamplerMap:{value:null},thickness:{value:0},thicknessMap:{value:null},thicknessMapTransform:{value:new Gt},attenuationDistance:{value:0},attenuationColor:{value:new Zt(0)},specularColor:{value:new Zt(1,1,1)},specularColorMap:{value:null},specularColorMapTransform:{value:new Gt},specularIntensity:{value:1},specularIntensityMap:{value:null},specularIntensityMapTransform:{value:new Gt},anisotropyVector:{value:new lt},anisotropyMap:{value:null},anisotropyMapTransform:{value:new Gt}}]),vertexShader:qt.meshphysical_vert,fragmentShader:qt.meshphysical_frag};var Cr={r:0,b:0,g:0},Dp=new ue,Eh=new Gt;Eh.set(-1,0,0,0,1,0,0,0,1);function Up(t,e,n,i,s,r){let a=new Zt(0),o=s===!0?0:1,l,c,u=null,f=0,h=null;function m(E){let A=E.isScene===!0?E.background:null;if(A&&A.isTexture){let x=E.backgroundBlurriness>0;A=e.get(A,x)}return A}function v(E){let A=!1,x=m(E);if(x===null)p(a,o);else if(x&&x.isColor)p(x,1),A=!0;let b=t.xr.getEnvironmentBlendMode();if(b==="additive")n.buffers.color.setClear(0,0,0,1,r);else if(b==="alpha-blend")n.buffers.color.setClear(0,0,0,0,r);if(t.autoClear||A)n.buffers.depth.setTest(!0),n.buffers.depth.setMask(!0),n.buffers.color.setMask(!0),t.clear(t.autoClearColor,t.autoClearDepth,t.autoClearStencil)}function T(E,A){let x=m(A);if(x&&(x.isCubeTexture||x.mapping===Qi)){if(c===void 0)c=new We(new Kn(1,1,1),new ke({name:"BackgroundCubeMaterial",uniforms:Qn(un.backgroundCube.uniforms),vertexShader:un.backgroundCube.vertexShader,fragmentShader:un.backgroundCube.fragmentShader,side:Ne,depthTest:!1,depthWrite:!1,fog:!1,allowOverride:!1})),c.geometry.deleteAttribute("normal"),c.geometry.deleteAttribute("uv"),c.onBeforeRender=function(b,C,w){this.matrixWorld.copyPosition(w.matrixWorld)},Object.defineProperty(c.material,"envMap",{get:function(){return this.uniforms.envMap.value}}),i.update(c);if(c.material.uniforms.envMap.value=x,c.material.uniforms.backgroundBlurriness.value=A.backgroundBlurriness,c.material.uniforms.backgroundIntensity.value=A.backgroundIntensity,c.material.uniforms.backgroundRotation.value.setFromMatrix4(Dp.makeRotationFromEuler(A.backgroundRotation)).transpose(),x.isCubeTexture&&x.isRenderTargetTexture===!1)c.material.uniforms.backgroundRotation.value.premultiply(Eh);if(c.material.toneMapped=Kt.getTransfer(x.colorSpace)!==de,u!==x||f!==x.version||h!==t.toneMapping)c.material.needsUpdate=!0,u=x,f=x.version,h=t.toneMapping;c.layers.enableAll(),E.unshift(c,c.geometry,c.material,0,0,null)}else if(x&&x.isTexture){if(l===void 0)l=new We(new Ri(2,2),new ke({name:"BackgroundMaterial",uniforms:Qn(un.background.uniforms),vertexShader:un.background.vertexShader,fragmentShader:un.background.fragmentShader,side:Ai,depthTest:!1,depthWrite:!1,fog:!1,allowOverride:!1})),l.geometry.deleteAttribute("normal"),Object.defineProperty(l.material,"map",{get:function(){return this.uniforms.t2D.value}}),i.update(l);if(l.material.uniforms.t2D.value=x,l.material.uniforms.backgroundIntensity.value=A.backgroundIntensity,l.material.toneMapped=Kt.getTransfer(x.colorSpace)!==de,x.matrixAutoUpdate===!0)x.updateMatrix();if(l.material.uniforms.uvTransform.value.copy(x.matrix),u!==x||f!==x.version||h!==t.toneMapping)l.material.needsUpdate=!0,u=x,f=x.version,h=t.toneMapping;l.layers.enableAll(),E.unshift(l,l.geometry,l.material,0,0,null)}}function p(E,A){E.getRGB(Cr,Ro(t)),n.buffers.color.setClear(Cr.r,Cr.g,Cr.b,A,r)}function d(){if(c!==void 0)c.geometry.dispose(),c.material.dispose(),c=void 0;if(l!==void 0)l.geometry.dispose(),l.material.dispose(),l=void 0}return{getClearColor:function(){return a},setClearColor:function(E,A=1){a.set(E),o=A,p(a,o)},getClearAlpha:function(){return o},setClearAlpha:function(E){o=E,p(a,o)},render:v,addToRenderList:T,dispose:d}}function Fp(t,e){let n=t.getParameter(t.MAX_VERTEX_ATTRIBS),i={},s=h(null),r=s,a=!1;function o(N,F,Z,I,G){let J=!1,k=f(N,I,Z,F);if(r!==k)r=k,c(r.object);if(J=m(N,I,Z,G),J)v(N,I,Z,G);if(G!==null)e.update(G,t.ELEMENT_ARRAY_BUFFER);if(J||a){if(a=!1,x(N,F,Z,I),G!==null)t.bindBuffer(t.ELEMENT_ARRAY_BUFFER,e.get(G).buffer)}}function l(){return t.createVertexArray()}function c(N){return t.bindVertexArray(N)}function u(N){return t.deleteVertexArray(N)}function f(N,F,Z,I){let G=I.wireframe===!0,J=i[F.id];if(J===void 0)J={},i[F.id]=J;let k=N.isInstancedMesh===!0?N.id:0,rt=J[k];if(rt===void 0)rt={},J[k]=rt;let W=rt[Z.id];if(W===void 0)W={},rt[Z.id]=W;let Q=W[G];if(Q===void 0)Q=h(l()),W[G]=Q;return Q}function h(N){let F=[],Z=[],I=[];for(let G=0;G<n;G++)F[G]=0,Z[G]=0,I[G]=0;return{geometry:null,program:null,wireframe:!1,newAttributes:F,enabledAttributes:Z,attributeDivisors:I,object:N,attributes:{},index:null}}function m(N,F,Z,I){let G=r.attributes,J=F.attributes,k=0,rt=Z.getAttributes();for(let W in rt)if(rt[W].location>=0){let nt=G[W],Pt=J[W];if(Pt===void 0){if(W==="instanceMatrix"&&N.instanceMatrix)Pt=N.instanceMatrix;if(W==="instanceColor"&&N.instanceColor)Pt=N.instanceColor}if(nt===void 0)return!0;if(nt.attribute!==Pt)return!0;if(Pt&&nt.data!==Pt.data)return!0;k++}if(r.attributesNum!==k)return!0;if(r.index!==I)return!0;return!1}function v(N,F,Z,I){let G={},J=F.attributes,k=0,rt=Z.getAttributes();for(let W in rt)if(rt[W].location>=0){let nt=J[W];if(nt===void 0){if(W==="instanceMatrix"&&N.instanceMatrix)nt=N.instanceMatrix;if(W==="instanceColor"&&N.instanceColor)nt=N.instanceColor}let Pt={};if(Pt.attribute=nt,nt&&nt.data)Pt.data=nt.data;G[W]=Pt,k++}r.attributes=G,r.attributesNum=k,r.index=I}function T(){let N=r.newAttributes;for(let F=0,Z=N.length;F<Z;F++)N[F]=0}function p(N){d(N,0)}function d(N,F){let Z=r.newAttributes,I=r.enabledAttributes,G=r.attributeDivisors;if(Z[N]=1,I[N]===0)t.enableVertexAttribArray(N),I[N]=1;if(G[N]!==F)t.vertexAttribDivisor(N,F),G[N]=F}function E(){let N=r.newAttributes,F=r.enabledAttributes;for(let Z=0,I=F.length;Z<I;Z++)if(F[Z]!==N[Z])t.disableVertexAttribArray(Z),F[Z]=0}function A(N,F,Z,I,G,J,k){if(k===!0)t.vertexAttribIPointer(N,F,Z,G,J);else t.vertexAttribPointer(N,F,Z,I,G,J)}function x(N,F,Z,I){T();let G=I.attributes,J=Z.getAttributes(),k=F.defaultAttributeValues;for(let rt in J){let W=J[rt];if(W.location>=0){let Q=G[rt];if(Q===void 0){if(rt==="instanceMatrix"&&N.instanceMatrix)Q=N.instanceMatrix;if(rt==="instanceColor"&&N.instanceColor)Q=N.instanceColor}if(Q!==void 0){let nt=Q.normalized,Pt=Q.itemSize,Lt=e.get(Q);if(Lt===void 0)continue;let{buffer:se,type:Wt,bytesPerElement:q}=Lt,ot=Wt===t.INT||Wt===t.UNSIGNED_INT||Q.gpuType===Ea;if(Q.isInterleavedBufferAttribute){let st=Q.data,Nt=st.stride,Ft=Q.offset;if(st.isInstancedInterleavedBuffer){for(let Et=0;Et<W.locationSize;Et++)d(W.location+Et,st.meshPerAttribute);if(N.isInstancedMesh!==!0&&I._maxInstanceCount===void 0)I._maxInstanceCount=st.meshPerAttribute*st.count}else for(let Et=0;Et<W.locationSize;Et++)p(W.location+Et);t.bindBuffer(t.ARRAY_BUFFER,se);for(let Et=0;Et<W.locationSize;Et++)A(W.location+Et,Pt/W.locationSize,Wt,nt,Nt*q,(Ft+Pt/W.locationSize*Et)*q,ot)}else{if(Q.isInstancedBufferAttribute){for(let st=0;st<W.locationSize;st++)d(W.location+st,Q.meshPerAttribute);if(N.isInstancedMesh!==!0&&I._maxInstanceCount===void 0)I._maxInstanceCount=Q.meshPerAttribute*Q.count}else for(let st=0;st<W.locationSize;st++)p(W.location+st);t.bindBuffer(t.ARRAY_BUFFER,se);for(let st=0;st<W.locationSize;st++)A(W.location+st,Pt/W.locationSize,Wt,nt,Pt*q,Pt/W.locationSize*st*q,ot)}}else if(k!==void 0){let nt=k[rt];if(nt!==void 0)switch(nt.length){case 2:t.vertexAttrib2fv(W.location,nt);break;case 3:t.vertexAttrib3fv(W.location,nt);break;case 4:t.vertexAttrib4fv(W.location,nt);break;default:t.vertexAttrib1fv(W.location,nt)}}}}E()}function b(){S();for(let N in i){let F=i[N];for(let Z in F){let I=F[Z];for(let G in I){let J=I[G];for(let k in J)u(J[k].object),delete J[k];delete I[G]}}delete i[N]}}function C(N){if(i[N.id]===void 0)return;let F=i[N.id];for(let Z in F){let I=F[Z];for(let G in I){let J=I[G];for(let k in J)u(J[k].object),delete J[k];delete I[G]}}delete i[N.id]}function w(N){for(let F in i){let Z=i[F];for(let I in Z){let G=Z[I];if(G[N.id]===void 0)continue;let J=G[N.id];for(let k in J)u(J[k].object),delete J[k];delete G[N.id]}}}function g(N){for(let F in i){let Z=i[F],I=N.isInstancedMesh===!0?N.id:0,G=Z[I];if(G===void 0)continue;for(let J in G){let k=G[J];for(let rt in k)u(k[rt].object),delete k[rt];delete G[J]}if(delete Z[I],Object.keys(Z).length===0)delete i[F]}}function S(){if(O(),a=!0,r===s)return;r=s,c(r.object)}function O(){s.geometry=null,s.program=null,s.wireframe=!1}return{setup:o,reset:S,resetDefaultState:O,dispose:b,releaseStatesOfGeometry:C,releaseStatesOfObject:g,releaseStatesOfProgram:w,initAttributes:T,enableAttribute:p,disableUnusedAttributes:E}}function Op(t,e,n){let i;function s(l){i=l}function r(l,c){t.drawArrays(i,l,c),n.update(c,i,1)}function a(l,c,u){if(u===0)return;t.drawArraysInstanced(i,l,c,u),n.update(c,i,u)}function o(l,c,u){if(u===0)return;e.get("WEBGL_multi_draw").multiDrawArraysWEBGL(i,l,0,c,0,u);let h=0;for(let m=0;m<u;m++)h+=c[m];n.update(h,i,1)}this.setMode=s,this.render=r,this.renderInstances=a,this.renderMultiDraw=o}function Bp(t,e,n,i){let s;function r(){if(s!==void 0)return s;if(e.has("EXT_texture_filter_anisotropic")===!0){let w=e.get("EXT_texture_filter_anisotropic");s=t.getParameter(w.MAX_TEXTURE_MAX_ANISOTROPY_EXT)}else s=0;return s}function a(w){if(w!==tn&&i.convert(w)!==t.getParameter(t.IMPLEMENTATION_COLOR_READ_FORMAT))return!1;return!0}function o(w){let g=w===ln&&(e.has("EXT_color_buffer_half_float")||e.has("EXT_color_buffer_float"));if(w!==je&&w!==yn&&!g&&i.convert(w)!==t.getParameter(t.IMPLEMENTATION_COLOR_READ_TYPE))return!1;return!0}function l(w){if(w==="highp"){if(t.getShaderPrecisionFormat(t.VERTEX_SHADER,t.HIGH_FLOAT).precision>0&&t.getShaderPrecisionFormat(t.FRAGMENT_SHADER,t.HIGH_FLOAT).precision>0)return"highp";w="mediump"}if(w==="mediump"){if(t.getShaderPrecisionFormat(t.VERTEX_SHADER,t.MEDIUM_FLOAT).precision>0&&t.getShaderPrecisionFormat(t.FRAGMENT_SHADER,t.MEDIUM_FLOAT).precision>0)return"mediump"}return"lowp"}let c=n.precision!==void 0?n.precision:"highp",u=l(c);if(u!==c)zt("WebGLRenderer:",c,"not supported, using",u,"instead."),c=u;let f=n.logarithmicDepthBuffer===!0,h=n.reversedDepthBuffer===!0&&e.has("EXT_clip_control");if(n.reversedDepthBuffer===!0&&h===!1)zt("WebGLRenderer: Unable to use reversed depth buffer due to missing EXT_clip_control extension. Fallback to default depth buffer.");let m=t.getParameter(t.MAX_TEXTURE_IMAGE_UNITS),v=t.getParameter(t.MAX_VERTEX_TEXTURE_IMAGE_UNITS),T=t.getParameter(t.MAX_TEXTURE_SIZE),p=t.getParameter(t.MAX_CUBE_MAP_TEXTURE_SIZE),d=t.getParameter(t.MAX_VERTEX_ATTRIBS),E=t.getParameter(t.MAX_VERTEX_UNIFORM_VECTORS),A=t.getParameter(t.MAX_VARYING_VECTORS),x=t.getParameter(t.MAX_FRAGMENT_UNIFORM_VECTORS),b=t.getParameter(t.MAX_SAMPLES),C=t.getParameter(t.SAMPLES);return{isWebGL2:!0,getMaxAnisotropy:r,getMaxPrecision:l,textureFormatReadable:a,textureTypeReadable:o,precision:c,logarithmicDepthBuffer:f,reversedDepthBuffer:h,maxTextures:m,maxVertexTextures:v,maxTextureSize:T,maxCubemapSize:p,maxAttributes:d,maxVertexUniforms:E,maxVaryings:A,maxFragmentUniforms:x,maxSamples:b,samples:C}}function zp(t){let e=this,n=null,i=0,s=!1,r=!1,a=new rn,o=new Gt,l={value:null,needsUpdate:!1};this.uniform=l,this.numPlanes=0,this.numIntersection=0,this.init=function(f,h){let m=f.length!==0||h||i!==0||s;return s=h,i=f.length,m},this.beginShadows=function(){r=!0,u(null)},this.endShadows=function(){r=!1},this.setGlobalState=function(f,h){n=u(f,h,0)},this.setState=function(f,h,m){let{clippingPlanes:v,clipIntersection:T,clipShadows:p}=f,d=t.get(f);if(!s||v===null||v.length===0||r&&!p)if(r)u(null);else c();else{let E=r?0:i,A=E*4,x=d.clippingState||null;l.value=x,x=u(v,h,A,m);for(let b=0;b!==A;++b)x[b]=n[b];d.clippingState=x,this.numIntersection=T?this.numPlanes:0,this.numPlanes+=E}};function c(){if(l.value!==n)l.value=n,l.needsUpdate=i>0;e.numPlanes=i,e.numIntersection=0}function u(f,h,m,v){let T=f!==null?f.length:0,p=null;if(T!==0){if(p=l.value,v!==!0||p===null){let d=m+T*4,E=h.matrixWorldInverse;if(o.getNormalMatrix(E),p===null||p.length<d)p=new Float32Array(d);for(let A=0,x=m;A!==T;++A,x+=4)a.copy(f[A]).applyMatrix4(E,o),a.normal.toArray(p,x),p[x+3]=a.constant}l.value=p,l.needsUpdate=!0}return e.numPlanes=T,e.numIntersection=0,p}}var Li=4,Gp=6,kp=20,Hp=256,us=new Ii,ih=new Zt,tl=null,el=0,nl=0,il=!1,Vp=new P,ni=new P;class Ir{constructor(t){this._renderer=t,this._pingPongRenderTarget=null,this._lodMax=0,this._cubeSize=0,this._sizeLods=[],this._lodMeshes=[],this._backgroundBox=null,this._cubemapMaterial=null,this._equirectMaterial=null,this._blurMaterial=null,this._ggxMaterial=null}fromScene(t,e=0,n=0.1,i=100,s={}){let{size:r=256,position:a=Vp}=s;tl=this._renderer.getRenderTarget(),el=this._renderer.getActiveCubeFace(),nl=this._renderer.getActiveMipmapLevel(),il=this._renderer.xr.enabled,this._renderer.xr.enabled=!1,this._setSize(r);let o=this._allocateTargets();if(o.depthBuffer=!0,this._sceneToCubeUV(t,n,i,o,a),e>0)this._blur(o,0,0,e);return this._applyPMREM(o),this._cleanup(o),o}fromEquirectangular(t,e=null){return this._fromTexture(t,e)}fromCubemap(t,e=null){return this._fromTexture(t,e)}compileCubemapShader(){if(this._cubemapMaterial===null)this._cubemapMaterial=ah(),this._compileMaterial(this._cubemapMaterial)}compileEquirectangularShader(){if(this._equirectMaterial===null)this._equirectMaterial=rh(),this._compileMaterial(this._equirectMaterial)}dispose(){if(this._dispose(),this._cubemapMaterial!==null)this._cubemapMaterial.dispose();if(this._equirectMaterial!==null)this._equirectMaterial.dispose();if(this._backgroundBox!==null)this._backgroundBox.geometry.dispose(),this._backgroundBox.material.dispose()}_setSize(t){this._lodMax=Math.floor(Math.log2(t)),this._cubeSize=Math.pow(2,this._lodMax)}_dispose(){if(this._blurMaterial!==null)this._blurMaterial.dispose();if(this._ggxMaterial!==null)this._ggxMaterial.dispose();if(this._pingPongRenderTarget!==null)this._pingPongRenderTarget.dispose();for(let t=0;t<this._lodMeshes.length;t++)this._lodMeshes[t].geometry.dispose()}_cleanup(t){this._renderer.setRenderTarget(tl,el,nl),this._renderer.xr.enabled=il,t.scissorTest=!1,Pi(t,0,0,t.width,t.height)}_fromTexture(t,e){if(t.mapping===wi||t.mapping===Vn)this._setSize(t.image.length===0?16:t.image[0].width||t.image[0].image.width);else this._setSize(t.image.width/4);tl=this._renderer.getRenderTarget(),el=this._renderer.getActiveCubeFace(),nl=this._renderer.getActiveMipmapLevel(),il=this._renderer.xr.enabled,this._renderer.xr.enabled=!1;let n=e||this._allocateTargets();return this._textureToCubeUV(t,n),this._applyPMREM(n),this._cleanup(n),n}_allocateTargets(){let t=3*Math.max(this._cubeSize,112),e=4*this._cubeSize,n={magFilter:De,minFilter:De,generateMipmaps:!1,type:ln,format:tn,colorSpace:co,depthBuffer:!1},i=sh(t,e,n);if(this._pingPongRenderTarget===null||this._pingPongRenderTarget.width!==t||this._pingPongRenderTarget.height!==e){if(this._pingPongRenderTarget!==null)this._dispose();this._pingPongRenderTarget=sh(t,e,n);let{_lodMax:s}=this;({lodMeshes:this._lodMeshes,sizeLods:this._sizeLods}=Wp(s)),this._blurMaterial=qp(s,t,e),this._ggxMaterial=Xp(s,t,e)}return i}_compileMaterial(t){let e=new We(new ve,t);this._renderer.compile(e,us)}_sceneToCubeUV(t,e,n,i,s){let o=new Be(90,1,e,n),l=[1,-1,1,1,1,1],c=[1,1,1,-1,-1,-1],u=this._renderer,{autoClear:f,toneMapping:h}=u;if(u.getClearColor(ih),u.toneMapping=Qe,u.autoClear=!1,u.state.buffers.depth.getReversed())u.setRenderTarget(i),u.clearDepth(),u.setRenderTarget(null);if(this._backgroundBox===null)this._backgroundBox=new We(new Kn,new as({name:"PMREM.Background",side:Ne,depthWrite:!1,depthTest:!1}));let v=this._backgroundBox,T=v.material,p=!1,d=t.background;if(d){if(d.isColor)T.color.copy(d),t.background=null,p=!0}else T.color.copy(ih),p=!0;for(let E=0;E<6;E++){let A=E%3;if(A===0)o.up.set(0,l[E],0),o.position.set(s.x,s.y,s.z),o.lookAt(s.x+c[E],s.y,s.z);else if(A===1)o.up.set(0,0,l[E]),o.position.set(s.x,s.y,s.z),o.lookAt(s.x,s.y+c[E],s.z);else o.up.set(0,l[E],0),o.position.set(s.x,s.y,s.z),o.lookAt(s.x,s.y,s.z+c[E]);let x=this._cubeSize;if(Pi(i,A*x,E>2?x:0,x,x),u.setRenderTarget(i),p)u.render(v,o);u.render(t,o)}u.toneMapping=h,u.autoClear=f,t.background=d}_textureToCubeUV(t,e){let n=this._renderer,i=t.mapping===wi||t.mapping===Vn;if(i){if(this._cubemapMaterial===null)this._cubemapMaterial=ah();this._cubemapMaterial.uniforms.flipEnvMap.value=t.isRenderTargetTexture===!1?-1:1}else if(this._equirectMaterial===null)this._equirectMaterial=rh();let s=i?this._cubemapMaterial:this._equirectMaterial,r=this._lodMeshes[0];r.material=s;let a=s.uniforms;a.envMap.value=t;let o=this._cubeSize;Pi(e,0,0,3*o,2*o),n.setRenderTarget(e),n.render(r,us)}_applyPMREM(t){let e=this._renderer,n=e.autoClear;e.autoClear=!1;let i=this._lodMeshes.length;for(let s=1;s<i;s++)this._applyGGXFilter(t,s-1,s);e.autoClear=n}_applyGGXFilter(t,e,n){let i=this._renderer,s=this._pingPongRenderTarget,r=this._ggxMaterial,a=this._lodMeshes[n];a.material=r;let o=r.uniforms,l=n/(this._lodMeshes.length-1),c=e/(this._lodMeshes.length-1),u=Math.sqrt(l*l-c*c),f=l*1.25,h=u*f,{_lodMax:m}=this,v=this._sizeLods[n],T=3*v*(n>m-Li?n-m+Li:0),p=4*(this._cubeSize-v);o.envMap.value=t.texture,o.roughness.value=h,o.mipInt.value=m-e,Pi(s,T,p,3*v,2*v),i.setRenderTarget(s),i.render(a,us),o.envMap.value=s.texture,o.roughness.value=0,o.mipInt.value=m-n,Pi(t,T,p,3*v,2*v),i.setRenderTarget(t),i.render(a,us)}_blur(t,e,n,i){let s=this._pingPongRenderTarget,r=Math.min(i,Math.PI)/Math.SQRT2;this._blurPass(t,s,e,n,r),this._blurPass(s,t,n,n,r)}_blurPass(t,e,n,i,s){let r=this._renderer,a=this._blurMaterial,o=this._lodMeshes[i];o.material=a;let l=a.uniforms;l.envMap.value=t.texture,l.sigma.value=s,l.mipInt.value=this._lodMax-n;let c=this._sizeLods[i],u=3*c*(i>this._lodMax-Li?i-this._lodMax+Li:0),f=4*(this._cubeSize-c);Pi(e,u,f,3*c,2*c),r.setRenderTarget(e),r.render(o,us)}}function Wp(t){let e=[],n=[],i=t,s=t-Li+1+Gp;for(let r=0;r<s;r++){let a=Math.pow(2,i);e.push(a);let o=1/(a-2),l=-o,c=1+o,u=[l,l,c,l,c,c,l,l,c,c,l,c],f=6,h=6,m=3,v=new Float32Array(m*h*f),T=new Float32Array(m*h*f);for(let d=0;d<f;d++){let E=d%3*2/3-1,A=d>2?0:-1,x=[E,A,0,E+0.6666666666666666,A,0,E+0.6666666666666666,A+1,0,E,A,0,E+0.6666666666666666,A+1,0,E,A+1,0];v.set(x,m*h*d);for(let b=0;b<h;b++){let C=u[b*2]*2-1,w=u[b*2+1]*2-1;if(d===0)ni.set(1,w,C);else if(d===1)ni.set(-C,1,-w);else if(d===2)ni.set(-C,w,1);else if(d===3)ni.set(-1,w,-C);else if(d===4)ni.set(-C,-1,w);else ni.set(C,w,-1);ni.toArray(T,(d*h+b)*m)}}let p=new ve;if(p.setAttribute("position",new Ue(v,m)),p.setAttribute("outputDirection",new Ue(T,m)),n.push(new We(p,null)),i>Li)i--}return{lodMeshes:n,sizeLods:e}}function sh(t,e,n){let i=new Ge(t,e,n);return i.texture.mapping=Qi,i.texture.name="PMREM.cubeUv",i.scissorTest=!0,i}function Pi(t,e,n,i,s){t.viewport.set(e,n,i,s),t.scissor.set(e,n,i,s)}function Xp(t,e,n){return new ke({name:"PMREMGGXConvolution",defines:{GGX_SAMPLES:Hp,CUBEUV_TEXEL_WIDTH:1/e,CUBEUV_TEXEL_HEIGHT:1/n,CUBEUV_MAX_MIP:`${t}.0`},uniforms:{envMap:{value:null},roughness:{value:0},mipInt:{value:0}},vertexShader:Pr(),fragmentShader:`

			precision highp float;
			precision highp int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;
			uniform float roughness;
			uniform float mipInt;

			#define ENVMAP_TYPE_CUBE_UV
			#include <cube_uv_reflection_fragment>

			#define PI 3.14159265359

			// Van der Corput radical inverse
			float radicalInverse_VdC(uint bits) {
				bits = (bits << 16u) | (bits >> 16u);
				bits = ((bits & 0x55555555u) << 1u) | ((bits & 0xAAAAAAAAu) >> 1u);
				bits = ((bits & 0x33333333u) << 2u) | ((bits & 0xCCCCCCCCu) >> 2u);
				bits = ((bits & 0x0F0F0F0Fu) << 4u) | ((bits & 0xF0F0F0F0u) >> 4u);
				bits = ((bits & 0x00FF00FFu) << 8u) | ((bits & 0xFF00FF00u) >> 8u);
				return float(bits) * 2.3283064365386963e-10; // / 0x100000000
			}

			// Hammersley sequence
			vec2 hammersley(uint i, uint N) {
				return vec2(float(i) / float(N), radicalInverse_VdC(i));
			}

			// GGX VNDF importance sampling (Eric Heitz 2018)
			// "Sampling the GGX Distribution of Visible Normals"
			// https://jcgt.org/published/0007/04/01/
			vec3 importanceSampleGGX_VNDF(vec2 Xi, vec3 V, float roughness) {
				float alpha = roughness * roughness;

				// Section 4.1: Orthonormal basis
				vec3 T1 = vec3(1.0, 0.0, 0.0);
				vec3 T2 = cross(V, T1);

				// Section 4.2: Parameterization of projected area
				float r = sqrt(Xi.x);
				float phi = 2.0 * PI * Xi.y;
				float t1 = r * cos(phi);
				float t2 = r * sin(phi);
				float s = 0.5 * (1.0 + V.z);
				t2 = (1.0 - s) * sqrt(1.0 - t1 * t1) + s * t2;

				// Section 4.3: Reprojection onto hemisphere
				vec3 Nh = t1 * T1 + t2 * T2 + sqrt(max(0.0, 1.0 - t1 * t1 - t2 * t2)) * V;

				// Section 3.4: Transform back to ellipsoid configuration
				return normalize(vec3(alpha * Nh.x, alpha * Nh.y, max(0.0, Nh.z)));
			}

			void main() {
				vec3 N = normalize(vOutputDirection);
				vec3 V = N; // Assume view direction equals normal for pre-filtering

				vec3 prefilteredColor = vec3(0.0);
				float totalWeight = 0.0;

				// For very low roughness, just sample the environment directly
				if (roughness < 0.001) {
					gl_FragColor = vec4(bilinearCubeUV(envMap, N, mipInt), 1.0);
					return;
				}

				// Tangent space basis for VNDF sampling
				vec3 up = abs(N.z) < 0.999 ? vec3(0.0, 0.0, 1.0) : vec3(1.0, 0.0, 0.0);
				vec3 tangent = normalize(cross(up, N));
				vec3 bitangent = cross(N, tangent);

				for(uint i = 0u; i < uint(GGX_SAMPLES); i++) {
					vec2 Xi = hammersley(i, uint(GGX_SAMPLES));

					// For PMREM, V = N, so in tangent space V is always (0, 0, 1)
					vec3 H_tangent = importanceSampleGGX_VNDF(Xi, vec3(0.0, 0.0, 1.0), roughness);

					// Transform H back to world space
					vec3 H = normalize(tangent * H_tangent.x + bitangent * H_tangent.y + N * H_tangent.z);
					vec3 L = normalize(2.0 * dot(V, H) * H - V);

					float NdotL = max(dot(N, L), 0.0);

					if(NdotL > 0.0) {
						// Sample environment at fixed mip level
						// VNDF importance sampling handles the distribution filtering
						vec3 sampleColor = bilinearCubeUV(envMap, L, mipInt);

						// Weight by NdotL for the split-sum approximation
						// VNDF PDF naturally accounts for the visible microfacet distribution
						prefilteredColor += sampleColor * NdotL;
						totalWeight += NdotL;
					}
				}

				if (totalWeight > 0.0) {
					prefilteredColor = prefilteredColor / totalWeight;
				}

				gl_FragColor = vec4(prefilteredColor, 1.0);
			}
		`,blending:Ke,depthTest:!1,depthWrite:!1})}function qp(t,e,n){return new ke({name:"SphericalGaussianBlur",defines:{SAMPLES:kp,CUBEUV_TEXEL_WIDTH:1/e,CUBEUV_TEXEL_HEIGHT:1/n,CUBEUV_MAX_MIP:`${t}.0`},uniforms:{envMap:{value:null},sigma:{value:0},mipInt:{value:0}},vertexShader:Pr(),fragmentShader:`

			precision highp float;
			precision highp int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;
			uniform float sigma;
			uniform float mipInt;

			#define ENVMAP_TYPE_CUBE_UV
			#include <cube_uv_reflection_fragment>

			#define PI 3.14159265359
			#define GOLDEN_ANGLE 2.39996322973

			void main() {

				if ( sigma == 0.0 ) {

					gl_FragColor = vec4( bilinearCubeUV( envMap, vOutputDirection, mipInt ), 1.0 );
					return;

				}

				vec3 outputDirection = normalize( vOutputDirection );

				vec3 up = abs( outputDirection.z ) < 0.999 ? vec3( 0.0, 0.0, 1.0 ) : vec3( 1.0, 0.0, 0.0 );
				vec3 tangent = normalize( cross( up, outputDirection ) );
				vec3 bitangent = cross( outputDirection, tangent );

				// Truncate the kernel at three standard deviations or at the antipode.
				float thetaMax = min( 3.0 * sigma, PI );
				float truncation = 1.0 - exp( - 0.5 * thetaMax * thetaMax / ( sigma * sigma ) );

				vec3 accumColor = vec3( 0.0 );
				float accumWeight = 0.0;

				for ( int i = 0; i < SAMPLES; i ++ ) {

					// Stratified inverse-CDF sampling of the Gaussian, placed on a golden-angle spiral.
					float stratum = ( float( i ) + 0.5 ) / float( SAMPLES );
					float theta = sigma * sqrt( - 2.0 * log( 1.0 - stratum * truncation ) );
					float phi = float( i ) * GOLDEN_ANGLE;

					vec3 offset = cos( phi ) * tangent + sin( phi ) * bitangent;
					vec3 sampleDirection = cos( theta ) * outputDirection + sin( theta ) * offset;

					// Correct the planar sample density to solid angle.
					float weight = sin( theta ) / theta;

					accumColor += weight * bilinearCubeUV( envMap, sampleDirection, mipInt );
					accumWeight += weight;

				}

				gl_FragColor = vec4( accumColor / accumWeight, 1.0 );

			}
		`,blending:Ke,depthTest:!1,depthWrite:!1})}function rh(){return new ke({name:"EquirectangularToCubeUV",uniforms:{envMap:{value:null}},vertexShader:Pr(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;

			#include <common>

			void main() {

				vec3 outputDirection = normalize( vOutputDirection );
				vec2 uv = equirectUv( outputDirection );

				gl_FragColor = vec4( texture2D ( envMap, uv ).rgb, 1.0 );

			}
		`,blending:Ke,depthTest:!1,depthWrite:!1})}function ah(){return new ke({name:"CubemapToCubeUV",uniforms:{envMap:{value:null},flipEnvMap:{value:-1}},vertexShader:Pr(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			uniform float flipEnvMap;

			varying vec3 vOutputDirection;

			uniform samplerCube envMap;

			void main() {

				gl_FragColor = textureCube( envMap, vec3( flipEnvMap * vOutputDirection.x, vOutputDirection.yz ) );

			}
		`,blending:Ke,depthTest:!1,depthWrite:!1})}function Pr(){return`

		precision mediump float;
		precision mediump int;

		attribute vec3 outputDirection;

		varying vec3 vOutputDirection;

		void main() {

			vOutputDirection = outputDirection;
			gl_Position = vec4( position, 1.0 );

		}
	`}class ll extends Ge{constructor(t=1,e={}){super(t,t,e);this.isWebGLCubeRenderTarget=!0;let n={width:t,height:t,depth:1},i=[n,n,n,n,n,n];this.texture=new lr(i),this._setTextureOptions(e),this.texture.isRenderTargetTexture=!0}fromEquirectangularTexture(t,e){this.texture.type=e.type,this.texture.colorSpace=e.colorSpace,this.texture.generateMipmaps=e.generateMipmaps,this.texture.minFilter=e.minFilter,this.texture.magFilter=e.magFilter;let n={uniforms:{tEquirect:{value:null}},vertexShader:`

				varying vec3 vWorldDirection;

				vec3 transformDirection( in vec3 dir, in mat4 matrix ) {

					return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );

				}

				void main() {

					vWorldDirection = transformDirection( position, modelMatrix );

					#include <begin_vertex>
					#include <project_vertex>

				}
			`,fragmentShader:`

				uniform sampler2D tEquirect;

				varying vec3 vWorldDirection;

				#include <common>

				void main() {

					vec3 direction = normalize( vWorldDirection );

					vec2 sampleUV = equirectUv( direction );

					gl_FragColor = texture2D( tEquirect, sampleUV );

				}
			`},i=new Kn(5,5,5),s=new ke({name:"CubemapFromEquirect",uniforms:Qn(n.uniforms),vertexShader:n.vertexShader,fragmentShader:n.fragmentShader,side:Ne,blending:Ke});s.uniforms.tEquirect.value=e;let r=new We(i,s),a=e.minFilter;if(e.minFilter===Wn)e.minFilter=De;return new Zo(1,10,this).update(t,r),e.minFilter=a,r.geometry.dispose(),r.material.dispose(),this}clear(t,e=!0,n=!0,i=!0){let s=t.getRenderTarget();for(let r=0;r<6;r++)t.setRenderTarget(this,r),t.clear(e,n,i);t.setRenderTarget(s)}}function Yp(t){let e=new WeakMap,n=new WeakMap,i=null;function s(h,m=!1){if(h===null||h===void 0)return null;if(m)return a(h);return r(h)}function r(h){if(h&&h.isTexture){let m=h.mapping;if(m===qs||m===Ys)if(e.has(h)){let v=e.get(h).texture;return o(v,h.mapping)}else{let v=h.image;if(v&&v.height>0){let T=new ll(v.height);return T.fromEquirectangularTexture(t,h),e.set(h,T),h.addEventListener("dispose",c),o(T.texture,h.mapping)}else return null}}return h}function a(h){if(h&&h.isTexture){let m=h.mapping,v=m===qs||m===Ys,T=m===wi||m===Vn;if(v||T){let p=n.get(h),d=p!==void 0?p.texture.pmremVersion:0;if(h.isRenderTargetTexture&&h.pmremVersion!==d){if(i===null)i=new Ir(t);return p=v?i.fromEquirectangular(h,p):i.fromCubemap(h,p),p.texture.pmremVersion=h.pmremVersion,n.set(h,p),p.texture}else if(p!==void 0)return p.texture;else{let E=h.image;if(v&&E&&E.height>0||T&&E&&l(E)){if(i===null)i=new Ir(t);return p=v?i.fromEquirectangular(h):i.fromCubemap(h),p.texture.pmremVersion=h.pmremVersion,n.set(h,p),h.addEventListener("dispose",u),p.texture}else return null}}}return h}function o(h,m){if(m===qs)h.mapping=wi;else if(m===Ys)h.mapping=Vn;return h}function l(h){let m=0,v=6;for(let T=0;T<v;T++)if(h[T]!==void 0)m++;return m===v}function c(h){let m=h.target;m.removeEventListener("dispose",c);let v=e.get(m);if(v!==void 0)e.delete(m),v.dispose()}function u(h){let m=h.target;m.removeEventListener("dispose",u);let v=n.get(m);if(v!==void 0)n.delete(m),v.dispose()}function f(){if(e=new WeakMap,n=new WeakMap,i!==null)i.dispose(),i=null}return{get:s,dispose:f}}function Zp(t){let e={};function n(i){if(e[i]!==void 0)return e[i];let s=t.getExtension(i);return e[i]=s,s}return{has:function(i){return n(i)!==null},init:function(){n("EXT_color_buffer_float"),n("WEBGL_clip_cull_distance"),n("OES_texture_float_linear"),n("EXT_color_buffer_half_float"),n("WEBGL_multisampled_render_to_texture"),n("WEBGL_render_shared_exponent")},get:function(i){let s=n(i);if(s===null)Gn("WebGLRenderer: "+i+" extension not supported.");return s}}}function Jp(t,e,n,i){let s={},r=new WeakMap;function a(f){let h=f.target;if(h.index!==null)e.remove(h.index);for(let v in h.attributes)e.remove(h.attributes[v]);h.removeEventListener("dispose",a),delete s[h.id];let m=r.get(h);if(m)e.remove(m),r.delete(h);if(i.releaseStatesOfGeometry(h),h.isInstancedBufferGeometry===!0)delete h._maxInstanceCount;n.memory.geometries--}function o(f,h){if(s[h.id]===!0)return h;return h.addEventListener("dispose",a),s[h.id]=!0,n.memory.geometries++,h}function l(f){let h=f.attributes;for(let m in h)e.update(h[m],t.ARRAY_BUFFER)}function c(f){let h=[],m=f.index,v=f.attributes.position,T=0;if(v===void 0)return;if(m!==null){let E=m.array;T=m.version;for(let A=0,x=E.length;A<x;A+=3){let b=E[A+0],C=E[A+1],w=E[A+2];h.push(b,C,C,w,w,b)}}else{let E=v.array;T=v.version;for(let A=0,x=E.length/3-1;A<x;A+=3){let b=A+0,C=A+1,w=A+2;h.push(b,C,C,w,w,b)}}let p=new(v.count>=65535?ss:is)(h,1);p.version=T;let d=r.get(f);if(d)e.remove(d);r.set(f,p)}function u(f){let h=r.get(f);if(h){let m=f.index;if(m!==null){if(h.version<m.version)c(f)}}else c(f);return r.get(f)}return{get:o,update:l,getWireframeAttribute:u}}function $p(t,e,n){let i;function s(f){i=f}let r,a;function o(f){r=f.type,a=f.bytesPerElement}function l(f,h){t.drawElements(i,h,r,f*a),n.update(h,i,1)}function c(f,h,m){if(m===0)return;t.drawElementsInstanced(i,h,r,f*a,m),n.update(h,i,m)}function u(f,h,m){if(m===0)return;e.get("WEBGL_multi_draw").multiDrawElementsWEBGL(i,h,0,r,f,0,m);let T=0;for(let p=0;p<m;p++)T+=h[p];n.update(T,i,1)}this.setMode=s,this.setIndex=o,this.render=l,this.renderInstances=c,this.renderMultiDraw=u}function Kp(t){let e={geometries:0,textures:0},n={frame:0,calls:0,triangles:0,points:0,lines:0};function i(r,a,o){switch(n.calls++,a){case t.TRIANGLES:n.triangles+=o*(r/3);break;case t.LINES:n.lines+=o*(r/2);break;case t.LINE_STRIP:n.lines+=o*(r-1);break;case t.LINE_LOOP:n.lines+=o*r;break;case t.POINTS:n.points+=o*r;break;default:Bt("WebGLInfo: Unknown draw mode:",a);break}}function s(){n.calls=0,n.triangles=0,n.points=0,n.lines=0}return{memory:e,render:n,programs:null,autoReset:!0,reset:s,update:i}}function Qp(t,e,n){let i=new WeakMap,s=new ge;function r(a,o,l){let c=a.morphTargetInfluences,u=o.morphAttributes.position||o.morphAttributes.normal||o.morphAttributes.color,f=u!==void 0?u.length:0,h=i.get(o);if(h===void 0||h.count!==f){let S=function(){w.dispose(),i.delete(o),o.removeEventListener("dispose",S)};if(h!==void 0)h.texture.dispose();let m=o.morphAttributes.position!==void 0,v=o.morphAttributes.normal!==void 0,T=o.morphAttributes.color!==void 0,p=o.morphAttributes.position||[],d=o.morphAttributes.normal||[],E=o.morphAttributes.color||[],A=0;if(m===!0)A=1;if(v===!0)A=2;if(T===!0)A=3;let x=o.attributes.position.count*A,b=1;if(x>e.maxTextureSize)b=Math.ceil(x/e.maxTextureSize),x=e.maxTextureSize;let C=new Float32Array(x*b*4*f),w=new sr(C,x,b,f);w.type=yn,w.needsUpdate=!0;let g=A*4;for(let O=0;O<f;O++){let N=p[O],F=d[O],Z=E[O],I=x*b*4*O;for(let G=0;G<N.count;G++){let J=G*g;if(m===!0)s.fromBufferAttribute(N,G),C[I+J+0]=s.x,C[I+J+1]=s.y,C[I+J+2]=s.z,C[I+J+3]=0;if(v===!0)s.fromBufferAttribute(F,G),C[I+J+4]=s.x,C[I+J+5]=s.y,C[I+J+6]=s.z,C[I+J+7]=0;if(T===!0)s.fromBufferAttribute(Z,G),C[I+J+8]=s.x,C[I+J+9]=s.y,C[I+J+10]=s.z,C[I+J+11]=Z.itemSize===4?s.w:1}}h={count:f,texture:w,size:new lt(x,b)},i.set(o,h),o.addEventListener("dispose",S)}if(a.isInstancedMesh===!0&&a.morphTexture!==null)l.getUniforms().setValue(t,"morphTexture",a.morphTexture,n);else{let m=0;for(let T=0;T<c.length;T++)m+=c[T];let v=o.morphTargetsRelative?1:1-m;l.getUniforms().setValue(t,"morphTargetBaseInfluence",v),l.getUniforms().setValue(t,"morphTargetInfluences",c)}l.getUniforms().setValue(t,"morphTargetsTexture",h.texture,n),l.getUniforms().setValue(t,"morphTargetsTextureSize",h.size)}return{update:r}}function jp(t,e,n,i,s){let r=new WeakMap;function a(c){let u=s.render.frame,f=c.geometry,h=e.get(c,f);if(r.get(h)!==u)e.update(h),r.set(h,u);if(c.isInstancedMesh){if(c.hasEventListener("dispose",l)===!1)c.addEventListener("dispose",l);if(r.get(c)!==u){if(n.update(c.instanceMatrix,t.ARRAY_BUFFER),c.instanceColor!==null)n.update(c.instanceColor,t.ARRAY_BUFFER);r.set(c,u)}}if(c.isSkinnedMesh){let m=c.skeleton;if(r.get(m)!==u)m.update(),r.set(m,u)}return h}function o(){r=new WeakMap}function l(c){let u=c.target;if(u.removeEventListener("dispose",l),i.releaseStatesOfObject(u),n.remove(u.instanceMatrix),u.instanceColor!==null)n.remove(u.instanceColor)}return{update:a,dispose:o}}var tm={[xa]:"LINEAR_TONE_MAPPING",[va]:"REINHARD_TONE_MAPPING",[ya]:"CINEON_TONE_MAPPING",[Xs]:"ACES_FILMIC_TONE_MAPPING",[Ma]:"AGX_TONE_MAPPING",[ba]:"NEUTRAL_TONE_MAPPING",[Sa]:"CUSTOM_TONE_MAPPING"};function em(t,e,n,i,s,r){let a=new Ge(e,n,{type:t,depthBuffer:s,stencilBuffer:r,samples:i?4:0,storeMultisampledDepthBuffer:!1,storeMultisampledStencilBuffer:!1,resolveDepthBuffer:!1,resolveStencilBuffer:!1}),o=null,l=null,c=new ve;c.setAttribute("position",new jt([-1,3,0,-1,-1,0,3,-1,0],3)),c.setAttribute("uv",new jt([0,2,0,0,2,0],2));let u=new Io({uniforms:{tDiffuse:{value:null}},vertexShader:`
			precision highp float;

			uniform mat4 modelViewMatrix;
			uniform mat4 projectionMatrix;

			attribute vec3 position;
			attribute vec2 uv;

			varying vec2 vUv;

			void main() {
				vUv = uv;
				gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
			}`,fragmentShader:`
			precision highp float;

			uniform sampler2D tDiffuse;

			varying vec2 vUv;

			#include <tonemapping_pars_fragment>
			#include <colorspace_pars_fragment>

			void main() {
				gl_FragColor = texture2D( tDiffuse, vUv );

				#ifdef LINEAR_TONE_MAPPING
					gl_FragColor.rgb = LinearToneMapping( gl_FragColor.rgb );
				#elif defined( REINHARD_TONE_MAPPING )
					gl_FragColor.rgb = ReinhardToneMapping( gl_FragColor.rgb );
				#elif defined( CINEON_TONE_MAPPING )
					gl_FragColor.rgb = CineonToneMapping( gl_FragColor.rgb );
				#elif defined( ACES_FILMIC_TONE_MAPPING )
					gl_FragColor.rgb = ACESFilmicToneMapping( gl_FragColor.rgb );
				#elif defined( AGX_TONE_MAPPING )
					gl_FragColor.rgb = AgXToneMapping( gl_FragColor.rgb );
				#elif defined( NEUTRAL_TONE_MAPPING )
					gl_FragColor.rgb = NeutralToneMapping( gl_FragColor.rgb );
				#elif defined( CUSTOM_TONE_MAPPING )
					gl_FragColor.rgb = CustomToneMapping( gl_FragColor.rgb );
				#endif

				#ifdef SRGB_TRANSFER
					gl_FragColor = sRGBTransferOETF( gl_FragColor );
				#endif
			}`,depthTest:!1,depthWrite:!1}),f=new We(c,u),h=new Ii(-1,1,1,-1,0,1),m=null,v=null,T=!1,p,d=null,E=[],A=!1;this.setSize=function(x,b){if(a.setSize(x,b),o!==null)o.setSize(x,b);if(l!==null)l.setSize(x,b);for(let C=0;C<E.length;C++){let w=E[C];if(w.setSize)w.setSize(x,b)}},this.setEffects=function(x){E=x,A=E.length>0&&E[0].isRenderPass===!0;let{width:b,height:C}=a;if(E.length>0&&o===null)o=new Ge(b,C,{type:ln,depthBuffer:!1,stencilBuffer:!1}),l=new Ge(b,C,{type:ln,depthBuffer:!1,stencilBuffer:!1});for(let w=0;w<E.length;w++){let g=E[w];if(g.setSize)g.setSize(b,C)}},this.begin=function(x,b){if(T)return!1;if(x.toneMapping===Qe&&E.length===0)return!1;if(d=b,b!==null){let{width:C,height:w}=b;if(a.width!==C||a.height!==w)this.setSize(C,w)}if(A===!1)x.setRenderTarget(a);return p=x.toneMapping,x.toneMapping=Qe,!0},this.hasRenderPass=function(){return A},this.end=function(x,b){x.toneMapping=p,T=!0;let C=a,w=o;for(let g=0;g<E.length;g++){let S=E[g];if(S.enabled===!1)continue;if(S.render(x,w,C,b),S.needsSwap!==!1)C=w,w=w===o?l:o}if(m!==x.outputColorSpace||v!==x.toneMapping){if(m=x.outputColorSpace,v=x.toneMapping,u.defines={},Kt.getTransfer(m)===de)u.defines.SRGB_TRANSFER="";let g=tm[v];if(g)u.defines[g]="";u.needsUpdate=!0}u.uniforms.tDiffuse.value=C.texture,x.setRenderTarget(d),x.render(f,h),d=null,T=!1},this.isCompositing=function(){return T},this.dispose=function(){if(a.dispose(),o!==null)o.dispose();if(l!==null)l.dispose();c.dispose(),u.dispose()}}var Ah=new Ae,al=new $n(1,1),wh=new sr,Ch=new go,Rh=new lr,oh=[],lh=[],ch=new Float32Array(16),hh=new Float32Array(9),uh=new Float32Array(4);function Ni(t,e,n){let i=t[0];if(i<=0||i>0)return t;let s=e*n,r=oh[s];if(r===void 0)r=new Float32Array(s),oh[s]=r;if(e!==0){i.toArray(r,0);for(let a=1,o=0;a!==e;++a)o+=n,t[a].toArray(r,o)}return r}function be(t,e){if(t.length!==e.length)return!1;for(let n=0,i=t.length;n<i;n++)if(t[n]!==e[n])return!1;return!0}function Te(t,e){for(let n=0,i=e.length;n<i;n++)t[n]=e[n]}function Lr(t,e){let n=lh[e];if(n===void 0)n=new Int32Array(e),lh[e]=n;for(let i=0;i!==e;++i)n[i]=t.allocateTextureUnit();return n}function nm(t,e){let n=this.cache;if(n[0]===e)return;t.uniform1f(this.addr,e),n[0]=e}function im(t,e){let n=this.cache;if(e.x!==void 0){if(n[0]!==e.x||n[1]!==e.y)t.uniform2f(this.addr,e.x,e.y),n[0]=e.x,n[1]=e.y}else{if(be(n,e))return;t.uniform2fv(this.addr,e),Te(n,e)}}function sm(t,e){let n=this.cache;if(e.x!==void 0){if(n[0]!==e.x||n[1]!==e.y||n[2]!==e.z)t.uniform3f(this.addr,e.x,e.y,e.z),n[0]=e.x,n[1]=e.y,n[2]=e.z}else if(e.r!==void 0){if(n[0]!==e.r||n[1]!==e.g||n[2]!==e.b)t.uniform3f(this.addr,e.r,e.g,e.b),n[0]=e.r,n[1]=e.g,n[2]=e.b}else{if(be(n,e))return;t.uniform3fv(this.addr,e),Te(n,e)}}function rm(t,e){let n=this.cache;if(e.x!==void 0){if(n[0]!==e.x||n[1]!==e.y||n[2]!==e.z||n[3]!==e.w)t.uniform4f(this.addr,e.x,e.y,e.z,e.w),n[0]=e.x,n[1]=e.y,n[2]=e.z,n[3]=e.w}else{if(be(n,e))return;t.uniform4fv(this.addr,e),Te(n,e)}}function am(t,e){let n=this.cache,i=e.elements;if(i===void 0){if(be(n,e))return;t.uniformMatrix2fv(this.addr,!1,e),Te(n,e)}else{if(be(n,i))return;uh.set(i),t.uniformMatrix2fv(this.addr,!1,uh),Te(n,i)}}function om(t,e){let n=this.cache,i=e.elements;if(i===void 0){if(be(n,e))return;t.uniformMatrix3fv(this.addr,!1,e),Te(n,e)}else{if(be(n,i))return;hh.set(i),t.uniformMatrix3fv(this.addr,!1,hh),Te(n,i)}}function lm(t,e){let n=this.cache,i=e.elements;if(i===void 0){if(be(n,e))return;t.uniformMatrix4fv(this.addr,!1,e),Te(n,e)}else{if(be(n,i))return;ch.set(i),t.uniformMatrix4fv(this.addr,!1,ch),Te(n,i)}}function cm(t,e){let n=this.cache;if(n[0]===e)return;t.uniform1i(this.addr,e),n[0]=e}function hm(t,e){let n=this.cache;if(e.x!==void 0){if(n[0]!==e.x||n[1]!==e.y)t.uniform2i(this.addr,e.x,e.y),n[0]=e.x,n[1]=e.y}else{if(be(n,e))return;t.uniform2iv(this.addr,e),Te(n,e)}}function um(t,e){let n=this.cache;if(e.x!==void 0){if(n[0]!==e.x||n[1]!==e.y||n[2]!==e.z)t.uniform3i(this.addr,e.x,e.y,e.z),n[0]=e.x,n[1]=e.y,n[2]=e.z}else{if(be(n,e))return;t.uniform3iv(this.addr,e),Te(n,e)}}function dm(t,e){let n=this.cache;if(e.x!==void 0){if(n[0]!==e.x||n[1]!==e.y||n[2]!==e.z||n[3]!==e.w)t.uniform4i(this.addr,e.x,e.y,e.z,e.w),n[0]=e.x,n[1]=e.y,n[2]=e.z,n[3]=e.w}else{if(be(n,e))return;t.uniform4iv(this.addr,e),Te(n,e)}}function fm(t,e){let n=this.cache;if(n[0]===e)return;t.uniform1ui(this.addr,e),n[0]=e}function pm(t,e){let n=this.cache;if(e.x!==void 0){if(n[0]!==e.x||n[1]!==e.y)t.uniform2ui(this.addr,e.x,e.y),n[0]=e.x,n[1]=e.y}else{if(be(n,e))return;t.uniform2uiv(this.addr,e),Te(n,e)}}function mm(t,e){let n=this.cache;if(e.x!==void 0){if(n[0]!==e.x||n[1]!==e.y||n[2]!==e.z)t.uniform3ui(this.addr,e.x,e.y,e.z),n[0]=e.x,n[1]=e.y,n[2]=e.z}else{if(be(n,e))return;t.uniform3uiv(this.addr,e),Te(n,e)}}function gm(t,e){let n=this.cache;if(e.x!==void 0){if(n[0]!==e.x||n[1]!==e.y||n[2]!==e.z||n[3]!==e.w)t.uniform4ui(this.addr,e.x,e.y,e.z,e.w),n[0]=e.x,n[1]=e.y,n[2]=e.z,n[3]=e.w}else{if(be(n,e))return;t.uniform4uiv(this.addr,e),Te(n,e)}}function _m(t,e,n){let i=this.cache,s=n.allocateTextureUnit();if(i[0]!==s)t.uniform1i(this.addr,s),i[0]=s;let r;if(this.type===t.SAMPLER_2D_SHADOW)al.compareFunction=n.isReversedDepthBuffer()?ir:nr,r=al;else r=Ah;n.setTexture2D(e||r,s)}function xm(t,e,n){let i=this.cache,s=n.allocateTextureUnit();if(i[0]!==s)t.uniform1i(this.addr,s),i[0]=s;n.setTexture3D(e||Ch,s)}function vm(t,e,n){let i=this.cache,s=n.allocateTextureUnit();if(i[0]!==s)t.uniform1i(this.addr,s),i[0]=s;n.setTextureCube(e||Rh,s)}function ym(t,e,n){let i=this.cache,s=n.allocateTextureUnit();if(i[0]!==s)t.uniform1i(this.addr,s),i[0]=s;n.setTexture2DArray(e||wh,s)}function Sm(t){switch(t){case 5126:return nm;case 35664:return im;case 35665:return sm;case 35666:return rm;case 35674:return am;case 35675:return om;case 35676:return lm;case 5124:case 35670:return cm;case 35667:case 35671:return hm;case 35668:case 35672:return um;case 35669:case 35673:return dm;case 5125:return fm;case 36294:return pm;case 36295:return mm;case 36296:return gm;case 35678:case 36198:case 36298:case 36306:case 35682:return _m;case 35679:case 36299:case 36307:return xm;case 35680:case 36300:case 36308:case 36293:return vm;case 36289:case 36303:case 36311:case 36292:return ym}}function Mm(t,e){t.uniform1fv(this.addr,e)}function bm(t,e){let n=Ni(e,this.size,2);t.uniform2fv(this.addr,n)}function Tm(t,e){let n=Ni(e,this.size,3);t.uniform3fv(this.addr,n)}function Em(t,e){let n=Ni(e,this.size,4);t.uniform4fv(this.addr,n)}function Am(t,e){let n=Ni(e,this.size,4);t.uniformMatrix2fv(this.addr,!1,n)}function wm(t,e){let n=Ni(e,this.size,9);t.uniformMatrix3fv(this.addr,!1,n)}function Cm(t,e){let n=Ni(e,this.size,16);t.uniformMatrix4fv(this.addr,!1,n)}function Rm(t,e){t.uniform1iv(this.addr,e)}function Im(t,e){t.uniform2iv(this.addr,e)}function Pm(t,e){t.uniform3iv(this.addr,e)}function Lm(t,e){t.uniform4iv(this.addr,e)}function Nm(t,e){t.uniform1uiv(this.addr,e)}function Dm(t,e){t.uniform2uiv(this.addr,e)}function Um(t,e){t.uniform3uiv(this.addr,e)}function Fm(t,e){t.uniform4uiv(this.addr,e)}function Om(t,e,n){let i=this.cache,s=e.length,r=Lr(n,s);if(!be(i,r))t.uniform1iv(this.addr,r),Te(i,r);let a;if(this.type===t.SAMPLER_2D_SHADOW)a=al;else a=Ah;for(let o=0;o!==s;++o)n.setTexture2D(e[o]||a,r[o])}function Bm(t,e,n){let i=this.cache,s=e.length,r=Lr(n,s);if(!be(i,r))t.uniform1iv(this.addr,r),Te(i,r);for(let a=0;a!==s;++a)n.setTexture3D(e[a]||Ch,r[a])}function zm(t,e,n){let i=this.cache,s=e.length,r=Lr(n,s);if(!be(i,r))t.uniform1iv(this.addr,r),Te(i,r);for(let a=0;a!==s;++a)n.setTextureCube(e[a]||Rh,r[a])}function Gm(t,e,n){let i=this.cache,s=e.length,r=Lr(n,s);if(!be(i,r))t.uniform1iv(this.addr,r),Te(i,r);for(let a=0;a!==s;++a)n.setTexture2DArray(e[a]||wh,r[a])}function km(t){switch(t){case 5126:return Mm;case 35664:return bm;case 35665:return Tm;case 35666:return Em;case 35674:return Am;case 35675:return wm;case 35676:return Cm;case 5124:case 35670:return Rm;case 35667:case 35671:return Im;case 35668:case 35672:return Pm;case 35669:case 35673:return Lm;case 5125:return Nm;case 36294:return Dm;case 36295:return Um;case 36296:return Fm;case 35678:case 36198:case 36298:case 36306:case 35682:return Om;case 35679:case 36299:case 36307:return Bm;case 35680:case 36300:case 36308:case 36293:return zm;case 36289:case 36303:case 36311:case 36292:return Gm}}class Ih{constructor(t,e,n){this.id=t,this.addr=n,this.cache=[],this.type=e.type,this.setValue=Sm(e.type)}}class Ph{constructor(t,e,n){this.id=t,this.addr=n,this.cache=[],this.type=e.type,this.size=e.size,this.setValue=km(e.type)}}class Lh{constructor(t){this.id=t,this.seq=[],this.map={}}setValue(t,e,n){let i=this.seq;for(let s=0,r=i.length;s!==r;++s){let a=i[s];a.setValue(t,e[a.id],n)}}}var sl=/(\w+)(\])?(\[|\.)?/g;function dh(t,e){t.seq.push(e),t.map[e.id]=e}function Hm(t,e,n){let i=t.name,s=i.length;sl.lastIndex=0;while(!0){let r=sl.exec(i),a=sl.lastIndex,o=r[1],l=r[2]==="]",c=r[3];if(l)o=o|0;if(c===void 0||c==="["&&a+2===s){dh(n,c===void 0?new Ih(o,t,e):new Ph(o,t,e));break}else{let f=n.map[o];if(f===void 0)f=new Lh(o),dh(n,f);n=f}}}class ps{constructor(t,e){this.seq=[],this.map={};let n=t.getProgramParameter(e,t.ACTIVE_UNIFORMS);for(let r=0;r<n;++r){let a=t.getActiveUniform(e,r),o=t.getUniformLocation(e,a.name);Hm(a,o,this)}let i=[],s=[];for(let r of this.seq)if(r.type===t.SAMPLER_2D_SHADOW||r.type===t.SAMPLER_CUBE_SHADOW||r.type===t.SAMPLER_2D_ARRAY_SHADOW)i.push(r);else s.push(r);if(i.length>0)this.seq=i.concat(s)}setValue(t,e,n,i){let s=this.map[e];if(s!==void 0)s.setValue(t,n,i)}setOptional(t,e,n){let i=e[n];if(i!==void 0)this.setValue(t,n,i)}static upload(t,e,n,i){for(let s=0,r=e.length;s!==r;++s){let a=e[s],o=n[a.id];if(o.needsUpdate!==!1)a.setValue(t,o.value,i)}}static seqWithValue(t,e){let n=[];for(let i=0,s=t.length;i!==s;++i){let r=t[i];if(r.id in e)n.push(r)}return n}}function fh(t,e,n){let i=t.createShader(e);return t.shaderSource(i,n),t.compileShader(i),i}var Vm=37297,Wm=0;function Xm(t,e){let n=t.split(`
`),i=[],s=Math.max(e-6,0),r=Math.min(e+6,n.length);for(let a=s;a<r;a++){let o=a+1;i.push(`${o===e?">":" "} ${o}: ${n[a]}`)}return i.join(`
`)}var ph=new Gt;function qm(t){Kt._getMatrix(ph,Kt.workingColorSpace,t);let e=`mat3( ${ph.elements.map((n)=>n.toFixed(4))} )`;switch(Kt.getTransfer(t)){case ho:return[e,"LinearTransferOETF"];case de:return[e,"sRGBTransferOETF"];default:return zt("WebGLProgram: Unsupported color space: ",t),[e,"LinearTransferOETF"]}}function mh(t,e,n){let i=t.getShaderParameter(e,t.COMPILE_STATUS),r=(t.getShaderInfoLog(e)||"").trim();if(i&&r==="")return"";let a=/ERROR: 0:(\d+)/.exec(r);if(a){let o=parseInt(a[1]);return n.toUpperCase()+`

`+r+`

`+Xm(t.getShaderSource(e),o)}else return r}function Ym(t,e){let n=qm(e);return[`vec4 ${t}( vec4 value ) {`,`	return ${n[1]}( vec4( value.rgb * ${n[0]}, value.a ) );`,"}"].join(`
`)}var Zm={[xa]:"Linear",[va]:"Reinhard",[ya]:"Cineon",[Xs]:"ACESFilmic",[Ma]:"AgX",[ba]:"Neutral",[Sa]:"Custom"};function Jm(t,e){let n=Zm[e];if(n===void 0)return zt("WebGLProgram: Unsupported toneMapping:",e),"vec3 "+t+"( vec3 color ) { return LinearToneMapping( color ); }";return"vec3 "+t+"( vec3 color ) { return "+n+"ToneMapping( color ); }"}var Rr=new P;function $m(){Kt.getLuminanceCoefficients(Rr);let t=Rr.x.toFixed(4),e=Rr.y.toFixed(4),n=Rr.z.toFixed(4);return["float luminance( const in vec3 rgb ) {",`	const vec3 weights = vec3( ${t}, ${e}, ${n} );`,"\treturn dot( weights, rgb );","}"].join(`
`)}function Km(t){return[t.extensionClipCullDistance?"#extension GL_ANGLE_clip_cull_distance : require":"",t.extensionMultiDraw?"#extension GL_ANGLE_multi_draw : require":""].filter(fs).join(`
`)}function Qm(t){let e=[];for(let n in t){let i=t[n];if(i===!1)continue;e.push("#define "+n+" "+i)}return e.join(`
`)}function jm(t,e){let n={},i=t.getProgramParameter(e,t.ACTIVE_ATTRIBUTES);for(let s=0;s<i;s++){let r=t.getActiveAttrib(e,s),a=r.name,o=1;if(r.type===t.FLOAT_MAT2)o=2;if(r.type===t.FLOAT_MAT3)o=3;if(r.type===t.FLOAT_MAT4)o=4;n[a]={type:r.type,location:t.getAttribLocation(e,a),locationSize:o}}return n}function fs(t){return t!==""}function gh(t,e){let n=e.numSpotLightShadows+e.numSpotLightMaps-e.numSpotLightShadowsWithMaps;return t.replace(/NUM_SUN_LIGHTS/g,e.numSunLights).replace(/NUM_DIR_LIGHTS/g,e.numDirLights).replace(/NUM_SPOT_LIGHTS/g,e.numSpotLights).replace(/NUM_SPOT_LIGHT_MAPS/g,e.numSpotLightMaps).replace(/NUM_SPOT_LIGHT_COORDS/g,n).replace(/NUM_RECT_AREA_LIGHTS/g,e.numRectAreaLights).replace(/NUM_POINT_LIGHTS/g,e.numPointLights).replace(/NUM_HEMI_LIGHTS/g,e.numHemiLights).replace(/NUM_SUN_LIGHT_SHADOWS/g,e.numSunLightShadows).replace(/NUM_DIR_LIGHT_SHADOWS/g,e.numDirLightShadows).replace(/NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS/g,e.numSpotLightShadowsWithMaps).replace(/NUM_SPOT_LIGHT_SHADOWS/g,e.numSpotLightShadows).replace(/NUM_POINT_LIGHT_SHADOWS/g,e.numPointLightShadows)}function _h(t,e){return t.replace(/NUM_CLIPPING_PLANES/g,e.numClippingPlanes).replace(/UNION_CLIPPING_PLANES/g,e.numClippingPlanes-e.numClipIntersection)}var tg=/^[ \t]*#include +<([\w\d./]+)>/gm;function ol(t){return t.replace(tg,ng)}var eg=new Map;function ng(t,e){let n=qt[e];if(n===void 0){let i=eg.get(e);if(i!==void 0)n=qt[i],zt('WebGLRenderer: Shader chunk "%s" has been deprecated. Use "%s" instead.',e,i);else throw Error("THREE.WebGLProgram: Can not resolve #include <"+e+">")}return ol(n)}var ig=/#pragma unroll_loop_start\s+for\s*\(\s*int\s+i\s*=\s*(\d+)\s*;\s*i\s*<\s*(\d+)\s*;\s*i\s*\+\+\s*\)\s*{([\s\S]+?)}\s+#pragma unroll_loop_end/g;function xh(t){return t.replace(ig,sg)}function sg(t,e,n,i){let s="";for(let r=parseInt(e);r<parseInt(n);r++)s+=i.replace(/\[\s*i\s*\]/g,"[ "+r+" ]").replace(/UNROLLED_LOOP_INDEX/g,r);return s}function vh(t){let e=`precision ${t.precision} float;
	precision ${t.precision} int;
	precision ${t.precision} sampler2D;
	precision ${t.precision} samplerCube;
	precision ${t.precision} sampler3D;
	precision ${t.precision} sampler2DArray;
	precision ${t.precision} sampler2DShadow;
	precision ${t.precision} samplerCubeShadow;
	precision ${t.precision} sampler2DArrayShadow;
	precision ${t.precision} isampler2D;
	precision ${t.precision} isampler3D;
	precision ${t.precision} isamplerCube;
	precision ${t.precision} isampler2DArray;
	precision ${t.precision} usampler2D;
	precision ${t.precision} usampler3D;
	precision ${t.precision} usamplerCube;
	precision ${t.precision} usampler2DArray;
	`;if(t.precision==="highp")e+=`
#define HIGH_PRECISION`;else if(t.precision==="mediump")e+=`
#define MEDIUM_PRECISION`;else if(t.precision==="lowp")e+=`
#define LOW_PRECISION`;return e}var rg={[$i]:"SHADOWMAP_TYPE_PCF",[Ei]:"SHADOWMAP_TYPE_VSM"};function ag(t){return rg[t.shadowMapType]||"SHADOWMAP_TYPE_BASIC"}var og={[wi]:"ENVMAP_TYPE_CUBE",[Vn]:"ENVMAP_TYPE_CUBE",[Qi]:"ENVMAP_TYPE_CUBE_UV"};function lg(t){if(t.envMap===!1)return"ENVMAP_TYPE_CUBE";return og[t.envMapMode]||"ENVMAP_TYPE_CUBE"}var cg={[Vn]:"ENVMAP_MODE_REFRACTION"};function hg(t){if(t.envMap===!1)return"ENVMAP_MODE_REFLECTION";return cg[t.envMapMode]||"ENVMAP_MODE_REFLECTION"}var ug={[Sc]:"ENVMAP_BLENDING_MULTIPLY",[Mc]:"ENVMAP_BLENDING_MIX",[bc]:"ENVMAP_BLENDING_ADD"};function dg(t){if(t.envMap===!1)return"ENVMAP_BLENDING_NONE";return ug[t.combine]||"ENVMAP_BLENDING_NONE"}function fg(t){let e=t.envMapCubeUVHeight;if(e===null)return null;let n=Math.log2(e)-2,i=1/e;return{texelWidth:1/(3*Math.max(Math.pow(2,n),112)),texelHeight:i,maxMip:n}}function pg(t,e,n,i){let s=t.getContext(),{defines:r,vertexShader:a,fragmentShader:o}=n,l=ag(n),c=lg(n),u=hg(n),f=dg(n),h=fg(n),m=Km(n),v=Qm(r),T=s.createProgram(),p,d,E=n.glslVersion?"#version "+n.glslVersion+`
`:"";if(n.isRawShaderMaterial){if(p=["#define SHADER_TYPE "+n.shaderType,"#define SHADER_NAME "+n.shaderName,v].filter(fs).join(`
`),p.length>0)p+=`
`;if(d=["#define SHADER_TYPE "+n.shaderType,"#define SHADER_NAME "+n.shaderName,v].filter(fs).join(`
`),d.length>0)d+=`
`}else p=[vh(n),"#define SHADER_TYPE "+n.shaderType,"#define SHADER_NAME "+n.shaderName,v,n.extensionClipCullDistance?"#define USE_CLIP_DISTANCE":"",n.batching?"#define USE_BATCHING":"",n.batchingColor?"#define USE_BATCHING_COLOR":"",n.instancing?"#define USE_INSTANCING":"",n.instancingColor?"#define USE_INSTANCING_COLOR":"",n.instancingMorph?"#define USE_INSTANCING_MORPH":"",n.useFog&&n.fog?"#define USE_FOG":"",n.useFog&&n.fogExp2?"#define FOG_EXP2":"",n.map?"#define USE_MAP":"",n.envMap?"#define USE_ENVMAP":"",n.envMap?"#define "+u:"",n.lightMap?"#define USE_LIGHTMAP":"",n.aoMap?"#define USE_AOMAP":"",n.bumpMap?"#define USE_BUMPMAP":"",n.normalMap?"#define USE_NORMALMAP":"",n.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",n.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",n.displacementMap?"#define USE_DISPLACEMENTMAP":"",n.emissiveMap?"#define USE_EMISSIVEMAP":"",n.anisotropy?"#define USE_ANISOTROPY":"",n.anisotropyMap?"#define USE_ANISOTROPYMAP":"",n.clearcoatMap?"#define USE_CLEARCOATMAP":"",n.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",n.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",n.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",n.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",n.specularMap?"#define USE_SPECULARMAP":"",n.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",n.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",n.roughnessMap?"#define USE_ROUGHNESSMAP":"",n.metalnessMap?"#define USE_METALNESSMAP":"",n.alphaMap?"#define USE_ALPHAMAP":"",n.alphaHash?"#define USE_ALPHAHASH":"",n.transmission?"#define USE_TRANSMISSION":"",n.transmissionMap?"#define USE_TRANSMISSIONMAP":"",n.thicknessMap?"#define USE_THICKNESSMAP":"",n.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",n.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",n.mapUv?"#define MAP_UV "+n.mapUv:"",n.alphaMapUv?"#define ALPHAMAP_UV "+n.alphaMapUv:"",n.lightMapUv?"#define LIGHTMAP_UV "+n.lightMapUv:"",n.aoMapUv?"#define AOMAP_UV "+n.aoMapUv:"",n.emissiveMapUv?"#define EMISSIVEMAP_UV "+n.emissiveMapUv:"",n.bumpMapUv?"#define BUMPMAP_UV "+n.bumpMapUv:"",n.normalMapUv?"#define NORMALMAP_UV "+n.normalMapUv:"",n.displacementMapUv?"#define DISPLACEMENTMAP_UV "+n.displacementMapUv:"",n.metalnessMapUv?"#define METALNESSMAP_UV "+n.metalnessMapUv:"",n.roughnessMapUv?"#define ROUGHNESSMAP_UV "+n.roughnessMapUv:"",n.anisotropyMapUv?"#define ANISOTROPYMAP_UV "+n.anisotropyMapUv:"",n.clearcoatMapUv?"#define CLEARCOATMAP_UV "+n.clearcoatMapUv:"",n.clearcoatNormalMapUv?"#define CLEARCOAT_NORMALMAP_UV "+n.clearcoatNormalMapUv:"",n.clearcoatRoughnessMapUv?"#define CLEARCOAT_ROUGHNESSMAP_UV "+n.clearcoatRoughnessMapUv:"",n.iridescenceMapUv?"#define IRIDESCENCEMAP_UV "+n.iridescenceMapUv:"",n.iridescenceThicknessMapUv?"#define IRIDESCENCE_THICKNESSMAP_UV "+n.iridescenceThicknessMapUv:"",n.sheenColorMapUv?"#define SHEEN_COLORMAP_UV "+n.sheenColorMapUv:"",n.sheenRoughnessMapUv?"#define SHEEN_ROUGHNESSMAP_UV "+n.sheenRoughnessMapUv:"",n.specularMapUv?"#define SPECULARMAP_UV "+n.specularMapUv:"",n.specularColorMapUv?"#define SPECULAR_COLORMAP_UV "+n.specularColorMapUv:"",n.specularIntensityMapUv?"#define SPECULAR_INTENSITYMAP_UV "+n.specularIntensityMapUv:"",n.transmissionMapUv?"#define TRANSMISSIONMAP_UV "+n.transmissionMapUv:"",n.thicknessMapUv?"#define THICKNESSMAP_UV "+n.thicknessMapUv:"",n.vertexTangents&&n.flatShading===!1?"#define USE_TANGENT":"",n.vertexNormals?"#define HAS_NORMAL":"",n.vertexColors?"#define USE_COLOR":"",n.vertexAlphas?"#define USE_COLOR_ALPHA":"",n.vertexUv1s?"#define USE_UV1":"",n.vertexUv2s?"#define USE_UV2":"",n.vertexUv3s?"#define USE_UV3":"",n.pointsUvs?"#define USE_POINTS_UV":"",n.flatShading?"#define FLAT_SHADED":"",n.skinning?"#define USE_SKINNING":"",n.morphTargets?"#define USE_MORPHTARGETS":"",n.morphNormals&&n.flatShading===!1?"#define USE_MORPHNORMALS":"",n.morphColors?"#define USE_MORPHCOLORS":"",n.morphTargetsCount>0?"#define MORPHTARGETS_TEXTURE_STRIDE "+n.morphTextureStride:"",n.morphTargetsCount>0?"#define MORPHTARGETS_COUNT "+n.morphTargetsCount:"",n.doubleSided?"#define DOUBLE_SIDED":"",n.flipSided?"#define FLIP_SIDED":"",n.shadowMapEnabled?"#define USE_SHADOWMAP":"",n.shadowMapEnabled?"#define "+l:"",n.sizeAttenuation?"#define USE_SIZEATTENUATION":"",n.numLightProbes>0?"#define USE_LIGHT_PROBES":"",n.logarithmicDepthBuffer?"#define USE_LOGARITHMIC_DEPTH_BUFFER":"",n.reversedDepthBuffer?"#define USE_REVERSED_DEPTH_BUFFER":"","uniform mat4 modelMatrix;","uniform mat4 modelViewMatrix;","uniform mat4 projectionMatrix;","uniform mat4 viewMatrix;","uniform mat3 normalMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;","#ifdef USE_INSTANCING","\tattribute mat4 instanceMatrix;","#endif","#ifdef USE_INSTANCING_COLOR","\tattribute vec3 instanceColor;","#endif","#ifdef USE_INSTANCING_MORPH","\tuniform sampler2D morphTexture;","#endif","attribute vec3 position;","attribute vec3 normal;","attribute vec2 uv;","#ifdef USE_UV1","\tattribute vec2 uv1;","#endif","#ifdef USE_UV2","\tattribute vec2 uv2;","#endif","#ifdef USE_UV3","\tattribute vec2 uv3;","#endif","#ifdef USE_TANGENT","\tattribute vec4 tangent;","#endif","#if defined( USE_COLOR_ALPHA )","\tattribute vec4 color;","#elif defined( USE_COLOR )","\tattribute vec3 color;","#endif","#ifdef USE_SKINNING","\tattribute vec4 skinIndex;","\tattribute vec4 skinWeight;","#endif",`
`].filter(fs).join(`
`),d=[vh(n),"#define SHADER_TYPE "+n.shaderType,"#define SHADER_NAME "+n.shaderName,v,n.useFog&&n.fog?"#define USE_FOG":"",n.useFog&&n.fogExp2?"#define FOG_EXP2":"",n.alphaToCoverage?"#define ALPHA_TO_COVERAGE":"",n.map?"#define USE_MAP":"",n.matcap?"#define USE_MATCAP":"",n.envMap?"#define USE_ENVMAP":"",n.envMap?"#define "+c:"",n.envMap?"#define "+u:"",n.envMap?"#define "+f:"",h?"#define CUBEUV_TEXEL_WIDTH "+h.texelWidth:"",h?"#define CUBEUV_TEXEL_HEIGHT "+h.texelHeight:"",h?"#define CUBEUV_MAX_MIP "+h.maxMip+".0":"",n.lightMap?"#define USE_LIGHTMAP":"",n.aoMap?"#define USE_AOMAP":"",n.bumpMap?"#define USE_BUMPMAP":"",n.normalMap?"#define USE_NORMALMAP":"",n.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",n.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",n.packedNormalMap?"#define USE_PACKED_NORMALMAP":"",n.emissiveMap?"#define USE_EMISSIVEMAP":"",n.anisotropy?"#define USE_ANISOTROPY":"",n.anisotropyMap?"#define USE_ANISOTROPYMAP":"",n.clearcoat?"#define USE_CLEARCOAT":"",n.clearcoatMap?"#define USE_CLEARCOATMAP":"",n.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",n.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",n.dispersion?"#define USE_DISPERSION":"",n.retroreflection?"#define USE_RETROREFLECTION":"",n.iridescence?"#define USE_IRIDESCENCE":"",n.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",n.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",n.specularMap?"#define USE_SPECULARMAP":"",n.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",n.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",n.roughnessMap?"#define USE_ROUGHNESSMAP":"",n.metalnessMap?"#define USE_METALNESSMAP":"",n.alphaMap?"#define USE_ALPHAMAP":"",n.alphaTest?"#define USE_ALPHATEST":"",n.alphaHash?"#define USE_ALPHAHASH":"",n.sheen?"#define USE_SHEEN":"",n.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",n.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",n.transmission?"#define USE_TRANSMISSION":"",n.transmissionMap?"#define USE_TRANSMISSIONMAP":"",n.thicknessMap?"#define USE_THICKNESSMAP":"",n.vertexTangents&&n.flatShading===!1?"#define USE_TANGENT":"",n.vertexColors||n.instancingColor?"#define USE_COLOR":"",n.vertexAlphas||n.batchingColor?"#define USE_COLOR_ALPHA":"",n.vertexUv1s?"#define USE_UV1":"",n.vertexUv2s?"#define USE_UV2":"",n.vertexUv3s?"#define USE_UV3":"",n.pointsUvs?"#define USE_POINTS_UV":"",n.gradientMap?"#define USE_GRADIENTMAP":"",n.flatShading?"#define FLAT_SHADED":"",n.doubleSided?"#define DOUBLE_SIDED":"",n.flipSided?"#define FLIP_SIDED":"",n.shadowMapEnabled?"#define USE_SHADOWMAP":"",n.shadowMapEnabled?"#define "+l:"",n.premultipliedAlpha?"#define PREMULTIPLIED_ALPHA":"",n.numLightProbes>0?"#define USE_LIGHT_PROBES":"",n.numLightProbeGrids>0?"#define USE_LIGHT_PROBES_GRID":"",n.decodeVideoTexture?"#define DECODE_VIDEO_TEXTURE":"",n.decodeVideoTextureEmissive?"#define DECODE_VIDEO_TEXTURE_EMISSIVE":"",n.logarithmicDepthBuffer?"#define USE_LOGARITHMIC_DEPTH_BUFFER":"",n.reversedDepthBuffer?"#define USE_REVERSED_DEPTH_BUFFER":"","uniform mat4 viewMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;",n.toneMapping!==Qe?"#define TONE_MAPPING":"",n.toneMapping!==Qe?qt.tonemapping_pars_fragment:"",n.toneMapping!==Qe?Jm("toneMapping",n.toneMapping):"",n.dithering?"#define DITHERING":"",n.opaque?"#define OPAQUE":"",qt.colorspace_pars_fragment,Ym("linearToOutputTexel",n.outputColorSpace),$m(),n.useDepthPacking?"#define DEPTH_PACKING "+n.depthPacking:"",`
`].filter(fs).join(`
`);if(a=ol(a),a=gh(a,n),a=_h(a,n),o=ol(o),o=gh(o,n),o=_h(o,n),a=xh(a),o=xh(o),n.isRawShaderMaterial!==!0)E=`#version 300 es
`,p=[m,"#define attribute in","#define varying out","#define texture2D texture"].join(`
`)+`
`+p,d=["#define varying in",n.glslVersion===uo?"":"layout(location = 0) out highp vec4 pc_fragColor;",n.glslVersion===uo?"":"#define gl_FragColor pc_fragColor","#define gl_FragDepthEXT gl_FragDepth","#define texture2D texture","#define textureCube texture","#define texture2DProj textureProj","#define texture2DLodEXT textureLod","#define texture2DProjLodEXT textureProjLod","#define textureCubeLodEXT textureLod","#define texture2DGradEXT textureGrad","#define texture2DProjGradEXT textureProjGrad","#define textureCubeGradEXT textureGrad"].join(`
`)+`
`+d;let A=E+p+a,x=E+d+o,b=fh(s,s.VERTEX_SHADER,A),C=fh(s,s.FRAGMENT_SHADER,x);if(s.attachShader(T,b),s.attachShader(T,C),n.index0AttributeName!==void 0)s.bindAttribLocation(T,0,n.index0AttributeName);else if(n.hasPositionAttribute===!0)s.bindAttribLocation(T,0,"position");s.linkProgram(T);function w(N){if(t.debug.checkShaderErrors){let F=s.getProgramInfoLog(T)||"",Z=s.getShaderInfoLog(b)||"",I=s.getShaderInfoLog(C)||"",G=F.trim(),J=Z.trim(),k=I.trim(),rt=!0,W=!0;if(s.getProgramParameter(T,s.LINK_STATUS)===!1)if(rt=!1,typeof t.debug.onShaderError==="function")t.debug.onShaderError(s,T,b,C);else{let Q=mh(s,b,"vertex"),nt=mh(s,C,"fragment");Bt("WebGLProgram: Shader Error "+s.getError()+" - VALIDATE_STATUS "+s.getProgramParameter(T,s.VALIDATE_STATUS)+`

Material Name: `+N.name+`
Material Type: `+N.type+`

Program Info Log: `+G+`
`+Q+`
`+nt)}else if(G!=="")zt("WebGLProgram: Program Info Log:",G);else if(J===""||k==="")W=!1;if(W)N.diagnostics={runnable:rt,programLog:G,vertexShader:{log:J,prefix:p},fragmentShader:{log:k,prefix:d}}}s.deleteShader(b),s.deleteShader(C),g=new ps(s,T),S=jm(s,T)}let g;this.getUniforms=function(){if(g===void 0)w(this);return g};let S;this.getAttributes=function(){if(S===void 0)w(this);return S};let O=n.rendererExtensionParallelShaderCompile===!1;return this.isReady=function(){if(O===!1)O=s.getProgramParameter(T,Vm);return O},this.destroy=function(){i.releaseStatesOfProgram(this),s.deleteProgram(T),this.program=void 0},this.type=n.shaderType,this.name=n.shaderName,this.id=Wm++,this.cacheKey=e,this.usedTimes=1,this.program=T,this.vertexShader=b,this.fragmentShader=C,this}var mg=0;class Nh{constructor(){this.shaderCache=new Map,this.materialCache=new Map}update(t,e,n){let i=this._getShaderCacheForMaterial(t);if(i.has(e)===!1)i.add(e),e.usedTimes++;if(i.has(n)===!1)i.add(n),n.usedTimes++;return this}remove(t){let e=this.materialCache.get(t);for(let n of e)if(n.usedTimes--,n.usedTimes===0)this.shaderCache.delete(n.code);return this.materialCache.delete(t),this}getVertexShaderStage(t){return this._getShaderStage(t.vertexShader)}getFragmentShaderStage(t){return this._getShaderStage(t.fragmentShader)}dispose(){this.shaderCache.clear(),this.materialCache.clear()}_getShaderCacheForMaterial(t){let e=this.materialCache,n=e.get(t);if(n===void 0)n=new Set,e.set(t,n);return n}_getShaderStage(t){let e=this.shaderCache,n=e.get(t);if(n===void 0)n=new Dh(t),e.set(t,n);return n}}class Dh{constructor(t){this.id=mg++,this.code=t,this.usedTimes=0}}function gg(t){return t===Yn||t===tr||t===er}function _g(t,e,n,i,s,r){let a=new rr,o=new Nh,l=new Set,c=[],u=new Map,{logarithmicDepthBuffer:f,precision:h}=i,m={MeshDepthMaterial:"depth",MeshDistanceMaterial:"distance",MeshNormalMaterial:"normal",MeshBasicMaterial:"basic",MeshLambertMaterial:"lambert",MeshPhongMaterial:"phong",MeshToonMaterial:"toon",MeshStandardMaterial:"physical",MeshPhysicalMaterial:"physical",MeshMatcapMaterial:"matcap",LineBasicMaterial:"basic",LineDashedMaterial:"dashed",PointsMaterial:"points",ShadowMaterial:"shadow",SpriteMaterial:"sprite"};function v(g){if(l.add(g),g===0)return"uv";return`uv${g}`}function T(g,S,O,N,F,Z){let I=N.fog,G=F.geometry,J=g.isMeshStandardMaterial||g.isMeshLambertMaterial||g.isMeshPhongMaterial?N.environment:null,k=g.isMeshStandardMaterial||g.isMeshLambertMaterial&&!g.envMap||g.isMeshPhongMaterial&&!g.envMap,rt=e.get(g.envMap||J,k),W=!!rt&&rt.mapping===Qi?rt.image.height:null,Q=m[g.type];if(g.precision!==null){if(h=i.getMaxPrecision(g.precision),h!==g.precision)zt("WebGLProgram.getParameters:",g.precision,"not supported, using",h,"instead.")}let nt=G.morphAttributes.position||G.morphAttributes.normal||G.morphAttributes.color,Pt=nt!==void 0?nt.length:0,Lt=0;if(G.morphAttributes.position!==void 0)Lt=1;if(G.morphAttributes.normal!==void 0)Lt=2;if(G.morphAttributes.color!==void 0)Lt=3;let se,Wt,q,ot;if(Q){let fe=un[Q];se=fe.vertexShader,Wt=fe.fragmentShader}else{se=g.vertexShader,Wt=g.fragmentShader;let fe=o.getVertexShaderStage(g),ne=o.getFragmentShaderStage(g);o.update(g,fe,ne),q=fe.id,ot=ne.id}let st=t.getRenderTarget(),Nt=t.state.buffers.depth.getReversed(),Ft=F.isInstancedMesh===!0,Et=F.isBatchedMesh===!0,re=!!g.map,j=!!g.matcap,it=!!rt,at=!!g.aoMap,ct=!!g.lightMap,vt=!!g.bumpMap&&g.wireframe===!1,Rt=!!g.normalMap,Dt=!!g.displacementMap,kt=!!g.emissiveMap,Ht=!!g.metalnessMap,R=!!g.roughnessMap,oe=g.anisotropy>0,Yt=g.clearcoat>0,Jt=g.dispersion>0,M=g.retroreflectivity>0,_=g.iridescence>0,L=g.sheen>0,H=g.transmission>0,tt=oe&&!!g.anisotropyMap,ht=Yt&&!!g.clearcoatMap,dt=Yt&&!!g.clearcoatNormalMap,X=Yt&&!!g.clearcoatRoughnessMap,K=_&&!!g.iridescenceMap,St=_&&!!g.iridescenceThicknessMap,It=L&&!!g.sheenColorMap,mt=L&&!!g.sheenRoughnessMap,ut=!!g.specularMap,Ut=!!g.specularColorMap,Ot=!!g.specularIntensityMap,ee=H&&!!g.transmissionMap,U=H&&!!g.thicknessMap,ft=!!g.gradientMap,Y=!!g.alphaMap,pt=g.alphaTest>0,Mt=!!g.alphaHash,et=!!g.extensions,_t=Qe;if(g.toneMapped){if(st===null||st.isXRRenderTarget===!0)_t=t.toneMapping}let Vt={shaderID:Q,shaderType:g.type,shaderName:g.name,vertexShader:se,fragmentShader:Wt,defines:g.defines,customVertexShaderID:q,customFragmentShaderID:ot,isRawShaderMaterial:g.isRawShaderMaterial===!0,glslVersion:g.glslVersion,precision:h,batching:Et,batchingColor:Et&&F._colorsTexture!==null,instancing:Ft,instancingColor:Ft&&F.instanceColor!==null,instancingMorph:Ft&&F.morphTexture!==null,outputColorSpace:st===null?t.outputColorSpace:st.isXRRenderTarget===!0?st.texture.colorSpace:Kt.workingColorSpace,alphaToCoverage:!!g.alphaToCoverage,map:re,matcap:j,envMap:it,envMapMode:it&&rt.mapping,envMapCubeUVHeight:W,aoMap:at,lightMap:ct,bumpMap:vt,normalMap:Rt,displacementMap:Dt,emissiveMap:kt,normalMapObjectSpace:Rt&&g.normalMapType===Nc,normalMapTangentSpace:Rt&&g.normalMapType===oo,packedNormalMap:Rt&&g.normalMapType===oo&&gg(g.normalMap.format),metalnessMap:Ht,roughnessMap:R,anisotropy:oe,anisotropyMap:tt,clearcoat:Yt,clearcoatMap:ht,clearcoatNormalMap:dt,clearcoatRoughnessMap:X,dispersion:Jt,retroreflection:M,iridescence:_,iridescenceMap:K,iridescenceThicknessMap:St,sheen:L,sheenColorMap:It,sheenRoughnessMap:mt,specularMap:ut,specularColorMap:Ut,specularIntensityMap:Ot,transmission:H,transmissionMap:ee,thicknessMap:U,gradientMap:ft,opaque:g.transparent===!1&&g.blending===Ki&&g.alphaToCoverage===!1,alphaMap:Y,alphaTest:pt,alphaHash:Mt,combine:g.combine,mapUv:re&&v(g.map.channel),aoMapUv:at&&v(g.aoMap.channel),lightMapUv:ct&&v(g.lightMap.channel),bumpMapUv:vt&&v(g.bumpMap.channel),normalMapUv:Rt&&v(g.normalMap.channel),displacementMapUv:Dt&&v(g.displacementMap.channel),emissiveMapUv:kt&&v(g.emissiveMap.channel),metalnessMapUv:Ht&&v(g.metalnessMap.channel),roughnessMapUv:R&&v(g.roughnessMap.channel),anisotropyMapUv:tt&&v(g.anisotropyMap.channel),clearcoatMapUv:ht&&v(g.clearcoatMap.channel),clearcoatNormalMapUv:dt&&v(g.clearcoatNormalMap.channel),clearcoatRoughnessMapUv:X&&v(g.clearcoatRoughnessMap.channel),iridescenceMapUv:K&&v(g.iridescenceMap.channel),iridescenceThicknessMapUv:St&&v(g.iridescenceThicknessMap.channel),sheenColorMapUv:It&&v(g.sheenColorMap.channel),sheenRoughnessMapUv:mt&&v(g.sheenRoughnessMap.channel),specularMapUv:ut&&v(g.specularMap.channel),specularColorMapUv:Ut&&v(g.specularColorMap.channel),specularIntensityMapUv:Ot&&v(g.specularIntensityMap.channel),transmissionMapUv:ee&&v(g.transmissionMap.channel),thicknessMapUv:U&&v(g.thicknessMap.channel),alphaMapUv:Y&&v(g.alphaMap.channel),vertexTangents:!!G.attributes.tangent&&(Rt||oe),vertexNormals:!!G.attributes.normal,vertexColors:g.vertexColors,vertexAlphas:g.vertexColors===!0&&!!G.attributes.color&&G.attributes.color.itemSize===4,pointsUvs:F.isPoints===!0&&!!G.attributes.uv&&(re||Y),fog:!!I,useFog:g.fog===!0,fogExp2:!!I&&I.isFogExp2,flatShading:g.wireframe===!1&&(g.flatShading===!0||G.attributes.normal===void 0&&Rt===!1&&(g.isMeshLambertMaterial||g.isMeshPhongMaterial||g.isMeshStandardMaterial||g.isMeshPhysicalMaterial)),sizeAttenuation:g.sizeAttenuation===!0,logarithmicDepthBuffer:f,reversedDepthBuffer:Nt,skinning:F.isSkinnedMesh===!0,hasPositionAttribute:G.attributes.position!==void 0,morphTargets:G.morphAttributes.position!==void 0,morphNormals:G.morphAttributes.normal!==void 0,morphColors:G.morphAttributes.color!==void 0,morphTargetsCount:Pt,morphTextureStride:Lt,numSunLights:S.sun.length,numDirLights:S.directional.length,numPointLights:S.point.length,numSpotLights:S.spot.length,numSpotLightMaps:S.spotLightMap.length,numRectAreaLights:S.rectArea.length,numHemiLights:S.hemi.length,numSunLightShadows:S.sunShadowMap.length,numDirLightShadows:S.directionalShadowMap.length,numPointLightShadows:S.pointShadowMap.length,numSpotLightShadows:S.spotShadowMap.length,numSpotLightShadowsWithMaps:S.numSpotLightShadowsWithMaps,numLightProbes:S.numLightProbes,numLightProbeGrids:Z.length,numClippingPlanes:r.numPlanes,numClipIntersection:r.numIntersection,dithering:g.dithering,shadowMapEnabled:t.shadowMap.enabled&&O.length>0,shadowMapType:t.shadowMap.type,toneMapping:_t,decodeVideoTexture:re&&g.map.isVideoTexture===!0&&Kt.getTransfer(g.map.colorSpace)===de,decodeVideoTextureEmissive:kt&&g.emissiveMap.isVideoTexture===!0&&Kt.getTransfer(g.emissiveMap.colorSpace)===de,premultipliedAlpha:g.premultipliedAlpha,doubleSided:g.side===$e,flipSided:g.side===Ne,useDepthPacking:g.depthPacking>=0,depthPacking:g.depthPacking||0,index0AttributeName:g.index0AttributeName,extensionClipCullDistance:et&&g.extensions.clipCullDistance===!0&&n.has("WEBGL_clip_cull_distance"),extensionMultiDraw:(et&&g.extensions.multiDraw===!0||Et)&&n.has("WEBGL_multi_draw"),rendererExtensionParallelShaderCompile:n.has("KHR_parallel_shader_compile"),customProgramCacheKey:g.customProgramCacheKey()};return Vt.vertexUv1s=l.has(1),Vt.vertexUv2s=l.has(2),Vt.vertexUv3s=l.has(3),l.clear(),Vt}function p(g){let S=[];if(g.shaderID)S.push(g.shaderID);else S.push(g.customVertexShaderID),S.push(g.customFragmentShaderID);if(g.defines!==void 0)for(let O in g.defines)S.push(O),S.push(g.defines[O]);if(g.isRawShaderMaterial===!1)d(S,g),E(S,g),S.push(t.outputColorSpace);return S.push(g.customProgramCacheKey),S.join()}function d(g,S){g.push(S.precision),g.push(S.outputColorSpace),g.push(S.envMapMode),g.push(S.envMapCubeUVHeight),g.push(S.mapUv),g.push(S.alphaMapUv),g.push(S.lightMapUv),g.push(S.aoMapUv),g.push(S.bumpMapUv),g.push(S.normalMapUv),g.push(S.displacementMapUv),g.push(S.emissiveMapUv),g.push(S.metalnessMapUv),g.push(S.roughnessMapUv),g.push(S.anisotropyMapUv),g.push(S.clearcoatMapUv),g.push(S.clearcoatNormalMapUv),g.push(S.clearcoatRoughnessMapUv),g.push(S.iridescenceMapUv),g.push(S.iridescenceThicknessMapUv),g.push(S.sheenColorMapUv),g.push(S.sheenRoughnessMapUv),g.push(S.specularMapUv),g.push(S.specularColorMapUv),g.push(S.specularIntensityMapUv),g.push(S.transmissionMapUv),g.push(S.thicknessMapUv),g.push(S.combine),g.push(S.fogExp2),g.push(S.sizeAttenuation),g.push(S.morphTargetsCount),g.push(S.morphAttributeCount),g.push(S.numSunLights),g.push(S.numDirLights),g.push(S.numPointLights),g.push(S.numSpotLights),g.push(S.numSpotLightMaps),g.push(S.numHemiLights),g.push(S.numRectAreaLights),g.push(S.numSunLightShadows),g.push(S.numDirLightShadows),g.push(S.numPointLightShadows),g.push(S.numSpotLightShadows),g.push(S.numSpotLightShadowsWithMaps),g.push(S.numLightProbes),g.push(S.shadowMapType),g.push(S.toneMapping),g.push(S.numClippingPlanes),g.push(S.numClipIntersection),g.push(S.depthPacking)}function E(g,S){if(a.disableAll(),S.instancing)a.enable(0);if(S.instancingColor)a.enable(1);if(S.instancingMorph)a.enable(2);if(S.matcap)a.enable(3);if(S.envMap)a.enable(4);if(S.normalMapObjectSpace)a.enable(5);if(S.normalMapTangentSpace)a.enable(6);if(S.clearcoat)a.enable(7);if(S.iridescence)a.enable(8);if(S.alphaTest)a.enable(9);if(S.vertexColors)a.enable(10);if(S.vertexAlphas)a.enable(11);if(S.vertexUv1s)a.enable(12);if(S.vertexUv2s)a.enable(13);if(S.vertexUv3s)a.enable(14);if(S.vertexTangents)a.enable(15);if(S.anisotropy)a.enable(16);if(S.alphaHash)a.enable(17);if(S.batching)a.enable(18);if(S.dispersion)a.enable(19);if(S.retroreflection)a.enable(24);if(S.batchingColor)a.enable(20);if(S.gradientMap)a.enable(21);if(S.packedNormalMap)a.enable(22);if(S.vertexNormals)a.enable(23);if(g.push(a.mask),a.disableAll(),S.fog)a.enable(0);if(S.useFog)a.enable(1);if(S.flatShading)a.enable(2);if(S.logarithmicDepthBuffer)a.enable(3);if(S.reversedDepthBuffer)a.enable(4);if(S.skinning)a.enable(5);if(S.morphTargets)a.enable(6);if(S.morphNormals)a.enable(7);if(S.morphColors)a.enable(8);if(S.premultipliedAlpha)a.enable(9);if(S.shadowMapEnabled)a.enable(10);if(S.doubleSided)a.enable(11);if(S.flipSided)a.enable(12);if(S.useDepthPacking)a.enable(13);if(S.dithering)a.enable(14);if(S.transmission)a.enable(15);if(S.sheen)a.enable(16);if(S.opaque)a.enable(17);if(S.pointsUvs)a.enable(18);if(S.decodeVideoTexture)a.enable(19);if(S.decodeVideoTextureEmissive)a.enable(20);if(S.alphaToCoverage)a.enable(21);if(S.numLightProbeGrids>0)a.enable(22);if(S.hasPositionAttribute)a.enable(23);g.push(a.mask)}function A(g){let S=m[g.type],O;if(S){let N=un[S];O=Qc.clone(N.uniforms)}else O=g.uniforms;return O}function x(g,S){let O=u.get(S);if(O!==void 0)++O.usedTimes;else O=new pg(t,S,g,s),c.push(O),u.set(S,O);return O}function b(g){if(--g.usedTimes===0){let S=c.indexOf(g);c[S]=c[c.length-1],c.pop(),u.delete(g.cacheKey),g.destroy()}}function C(g){o.remove(g)}function w(){o.dispose()}return{getParameters:T,getProgramCacheKey:p,getUniforms:A,acquireProgram:x,releaseProgram:b,releaseShaderCache:C,programs:c,dispose:w}}function xg(){let t=new WeakMap;function e(a){return t.has(a)}function n(a){let o=t.get(a);if(o===void 0)o={},t.set(a,o);return o}function i(a){t.delete(a)}function s(a,o,l){t.get(a)[o]=l}function r(){t=new WeakMap}return{has:e,get:n,remove:i,update:s,dispose:r}}function vg(t,e){if(t.groupOrder!==e.groupOrder)return t.groupOrder-e.groupOrder;else if(t.renderOrder!==e.renderOrder)return t.renderOrder-e.renderOrder;else if(t.material.id!==e.material.id)return t.material.id-e.material.id;else if(t.materialVariant!==e.materialVariant)return t.materialVariant-e.materialVariant;else if(t.z!==e.z)return t.z-e.z;else return t.id-e.id}function yh(t,e){if(t.groupOrder!==e.groupOrder)return t.groupOrder-e.groupOrder;else if(t.renderOrder!==e.renderOrder)return t.renderOrder-e.renderOrder;else if(t.z!==e.z)return e.z-t.z;else return t.id-e.id}function Sh(){let t=[],e=0,n=[],i=[],s=[];function r(){e=0,n.length=0,i.length=0,s.length=0}function a(h){let m=0;if(h.isInstancedMesh)m+=2;if(h.isSkinnedMesh)m+=1;return m}function o(h,m,v,T,p,d){let E=t[e];if(E===void 0)E={id:h.id,object:h,geometry:m,material:v,materialVariant:a(h),groupOrder:T,renderOrder:h.renderOrder,z:p,group:d},t[e]=E;else E.id=h.id,E.object=h,E.geometry=m,E.material=v,E.materialVariant=a(h),E.groupOrder=T,E.renderOrder=h.renderOrder,E.z=p,E.group=d;return e++,E}function l(h,m,v,T,p,d,E){if(E.reversedDepth===!0)p=-p;let A=o(h,m,v,T,p,d);if(v.transmission>0)i.push(A);else if(v.transparent===!0)s.push(A);else n.push(A)}function c(h,m,v,T,p,d){let E=o(h,m,v,T,p,d);if(v.transmission>0)i.unshift(E);else if(v.transparent===!0)s.unshift(E);else n.unshift(E)}function u(h,m){if(n.length>1)n.sort(h||vg);if(i.length>1)i.sort(m||yh);if(s.length>1)s.sort(m||yh)}function f(){for(let h=e,m=t.length;h<m;h++){let v=t[h];if(v.id===null)break;v.id=null,v.object=null,v.geometry=null,v.material=null,v.group=null}}return{opaque:n,transmissive:i,transparent:s,init:r,push:l,unshift:c,finish:f,sort:u}}function yg(){let t=new WeakMap;function e(i,s){let r=t.get(i),a;if(r===void 0)a=new Sh,t.set(i,[a]);else if(s>=r.length)a=new Sh,r.push(a);else a=r[s];return a}function n(){t=new WeakMap}return{get:e,dispose:n}}function Sg(){let t={};return{get:function(e){if(t[e.id]!==void 0)return t[e.id];let n;switch(e.type){case"SunLight":case"DirectionalLight":n={direction:new P,color:new Zt};break;case"SpotLight":n={position:new P,direction:new P,color:new Zt,distance:0,coneCos:0,penumbraCos:0,decay:0};break;case"PointLight":n={position:new P,color:new Zt,distance:0,decay:0};break;case"HemisphereLight":n={direction:new P,skyColor:new Zt,groundColor:new Zt};break;case"RectAreaLight":n={color:new Zt,position:new P,halfWidth:new P,halfHeight:new P};break}return t[e.id]=n,n}}}function Mg(){let t={};return{get:function(e){if(t[e.id]!==void 0)return t[e.id];let n;switch(e.type){case"SunLight":case"DirectionalLight":n={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new lt};break;case"SpotLight":n={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new lt};break;case"PointLight":n={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new lt,shadowCameraNear:1,shadowCameraFar:1000};break}return t[e.id]=n,n}}}var bg=0;function Tg(t,e){return(e.castShadow?2:0)-(t.castShadow?2:0)+(e.map?1:0)-(t.map?1:0)}function Eg(t){let e=new Sg,n=Mg(),i={version:0,hash:{sunLength:-1,directionalLength:-1,pointLength:-1,spotLength:-1,rectAreaLength:-1,hemiLength:-1,numSunShadows:-1,numDirectionalShadows:-1,numPointShadows:-1,numSpotShadows:-1,numSpotMaps:-1,numLightProbes:-1},ambient:[0,0,0],probe:[],sun:[],sunShadow:[],sunShadowMap:[],sunShadowMatrix:[],sunShadowCascade:[],directional:[],directionalShadow:[],directionalShadowMap:[],directionalShadowMatrix:[],spot:[],spotLightMap:[],spotShadow:[],spotShadowMap:[],spotLightMatrix:[],rectArea:[],rectAreaLTC1:null,rectAreaLTC2:null,point:[],pointShadow:[],pointShadowMap:[],pointShadowMatrix:[],hemi:[],numSpotLightShadowsWithMaps:0,numLightProbes:0};for(let c=0;c<9;c++)i.probe.push(new P);let s=new P,r=new ue,a=new ue;function o(c){let u=0,f=0,h=0;for(let F=0;F<9;F++)i.probe[F].set(0,0,0);let m=0,v=0,T=0,p=0,d=0,E=0,A=0,x=0,b=0,C=0,w=0,g=0,S=0,O=0;c.sort(Tg);for(let F=0,Z=c.length;F<Z;F++){let I=c[F],{color:G,intensity:J,distance:k}=I,rt=null;if(I.shadow&&I.shadow.map)if(I.shadow.map.texture.format===Yn)rt=I.shadow.map.texture;else rt=I.shadow.map.depthTexture||I.shadow.map.texture;if(I.isAmbientLight)u+=G.r*J,f+=G.g*J,h+=G.b*J;else if(I.isLightProbe){for(let W=0;W<9;W++)i.probe[W].addScaledVector(I.sh.coefficients[W],J);O++}else if(I.isSunLight){let W=e.get(I);if(W.color.copy(I.color).multiplyScalar(I.intensity),I.castShadow){let Q=I.shadow,nt=n.get(I);nt.shadowIntensity=Q.intensity,nt.shadowBias=Q.bias,nt.shadowNormalBias=Q.normalBias,nt.shadowRadius=Q.radius,nt.shadowMapSize.copy(Q.mapSize).multiply(Q.getFrameExtents()),i.sunShadow[v]=nt,i.sunShadowMap[v]=rt;let Pt=Q.getViewportCount();for(let Lt=0;Lt<Pt;Lt++)i.sunShadowMatrix[T+Lt]=Q.getMatrix(Lt),i.sunShadowCascade[T+Lt]=Q._cascadeData[Lt];T+=Pt,v++}i.sun[m]=W,m++}else if(I.isDirectionalLight){let W=e.get(I);if(W.color.copy(I.color).multiplyScalar(I.intensity),I.castShadow){let Q=I.shadow,nt=n.get(I);nt.shadowIntensity=Q.intensity,nt.shadowBias=Q.bias,nt.shadowNormalBias=Q.normalBias,nt.shadowRadius=Q.radius,nt.shadowMapSize=Q.mapSize,i.directionalShadow[p]=nt,i.directionalShadowMap[p]=rt,i.directionalShadowMatrix[p]=I.shadow.matrix,b++}i.directional[p]=W,p++}else if(I.isSpotLight){let W=e.get(I);W.position.setFromMatrixPosition(I.matrixWorld),W.color.copy(G).multiplyScalar(J),W.distance=k,W.coneCos=Math.cos(I.angle),W.penumbraCos=Math.cos(I.angle*(1-I.penumbra)),W.decay=I.decay,i.spot[E]=W;let Q=I.shadow;if(I.map){if(i.spotLightMap[g]=I.map,g++,Q.updateMatrices(I),I.castShadow)S++}if(i.spotLightMatrix[E]=Q.matrix,I.castShadow){let nt=n.get(I);nt.shadowIntensity=Q.intensity,nt.shadowBias=Q.bias,nt.shadowNormalBias=Q.normalBias,nt.shadowRadius=Q.radius,nt.shadowMapSize=Q.mapSize,i.spotShadow[E]=nt,i.spotShadowMap[E]=rt,w++}E++}else if(I.isRectAreaLight){let W=e.get(I);W.color.copy(G).multiplyScalar(J),W.halfWidth.set(I.width*0.5,0,0),W.halfHeight.set(0,I.height*0.5,0),i.rectArea[A]=W,A++}else if(I.isPointLight){let W=e.get(I);if(W.color.copy(I.color).multiplyScalar(I.intensity),W.distance=I.distance,W.decay=I.decay,I.castShadow){let Q=I.shadow,nt=n.get(I);nt.shadowIntensity=Q.intensity,nt.shadowBias=Q.bias,nt.shadowNormalBias=Q.normalBias,nt.shadowRadius=Q.radius,nt.shadowMapSize=Q.mapSize,nt.shadowCameraNear=Q.camera.near,nt.shadowCameraFar=Q.camera.far,i.pointShadow[d]=nt,i.pointShadowMap[d]=rt,i.pointShadowMatrix[d]=I.shadow.matrix,C++}i.point[d]=W,d++}else if(I.isHemisphereLight){let W=e.get(I);W.skyColor.copy(I.color).multiplyScalar(J),W.groundColor.copy(I.groundColor).multiplyScalar(J),i.hemi[x]=W,x++}}if(A>0)if(t.has("OES_texture_float_linear")===!0)i.rectAreaLTC1=gt.LTC_FLOAT_1,i.rectAreaLTC2=gt.LTC_FLOAT_2;else i.rectAreaLTC1=gt.LTC_HALF_1,i.rectAreaLTC2=gt.LTC_HALF_2;i.ambient[0]=u,i.ambient[1]=f,i.ambient[2]=h;let N=i.hash;if(N.sunLength!==m||N.directionalLength!==p||N.pointLength!==d||N.spotLength!==E||N.rectAreaLength!==A||N.hemiLength!==x||N.numSunShadows!==v||N.numDirectionalShadows!==b||N.numPointShadows!==C||N.numSpotShadows!==w||N.numSpotMaps!==g||N.numLightProbes!==O)i.sun.length=m,i.directional.length=p,i.spot.length=E,i.rectArea.length=A,i.point.length=d,i.hemi.length=x,i.sunShadow.length=v,i.sunShadowMap.length=v,i.sunShadowMatrix.length=T,i.sunShadowCascade.length=T,i.directionalShadow.length=b,i.directionalShadowMap.length=b,i.directionalShadowMatrix.length=b,i.pointShadow.length=C,i.pointShadowMap.length=C,i.pointShadowMatrix.length=C,i.spotShadow.length=w,i.spotShadowMap.length=w,i.spotLightMatrix.length=w+g-S,i.spotLightMap.length=g,i.numSpotLightShadowsWithMaps=S,i.numLightProbes=O,N.sunLength=m,N.directionalLength=p,N.pointLength=d,N.spotLength=E,N.rectAreaLength=A,N.hemiLength=x,N.numSunShadows=v,N.numDirectionalShadows=b,N.numPointShadows=C,N.numSpotShadows=w,N.numSpotMaps=g,N.numLightProbes=O,i.version=bg++}function l(c,u){let f=0,h=0,m=0,v=0,T=0,p=0,d=u.matrixWorldInverse;for(let E=0,A=c.length;E<A;E++){let x=c[E];if(x.isSunLight){let b=i.sun[f];b.direction.setFromMatrixPosition(x.matrixWorld),b.direction.transformDirection(d),f++}else if(x.isDirectionalLight){let b=i.directional[h];b.direction.setFromMatrixPosition(x.matrixWorld),s.setFromMatrixPosition(x.target.matrixWorld),b.direction.sub(s),b.direction.transformDirection(d),h++}else if(x.isSpotLight){let b=i.spot[v];b.position.setFromMatrixPosition(x.matrixWorld),b.position.applyMatrix4(d),b.direction.setFromMatrixPosition(x.matrixWorld),s.setFromMatrixPosition(x.target.matrixWorld),b.direction.sub(s),b.direction.transformDirection(d),v++}else if(x.isRectAreaLight){let b=i.rectArea[T];b.position.setFromMatrixPosition(x.matrixWorld),b.position.applyMatrix4(d),a.identity(),r.copy(x.matrixWorld),r.premultiply(d),a.extractRotation(r),b.halfWidth.set(x.width*0.5,0,0),b.halfHeight.set(0,x.height*0.5,0),b.halfWidth.applyMatrix4(a),b.halfHeight.applyMatrix4(a),T++}else if(x.isPointLight){let b=i.point[m];b.position.setFromMatrixPosition(x.matrixWorld),b.position.applyMatrix4(d),m++}else if(x.isHemisphereLight){let b=i.hemi[p];b.direction.setFromMatrixPosition(x.matrixWorld),b.direction.transformDirection(d),p++}}}return{setup:o,setupView:l,state:i}}function Mh(t){let e=new Eg(t),n=[],i=[],s=[];function r(h){f.camera=h,n.length=0,i.length=0,s.length=0}function a(h){n.push(h)}function o(h){i.push(h)}function l(h){s.push(h)}function c(){e.setup(n)}function u(h){e.setupView(n,h)}let f={lightsArray:n,shadowsArray:i,lightProbeGridArray:s,camera:null,lights:e,transmissionRenderTarget:{},textureUnits:0};return{init:r,state:f,setupLights:c,setupLightsView:u,pushLight:a,pushShadow:o,pushLightProbeGrid:l}}function Ag(t){let e=new WeakMap;function n(s,r=0){let a=e.get(s),o;if(a===void 0)o=new Mh(t),e.set(s,[o]);else if(r>=a.length)o=new Mh(t),a.push(o);else o=a[r];return o}function i(){e=new WeakMap}return{get:n,dispose:i}}var wg=`void main() {
	gl_Position = vec4( position, 1.0 );
}`,Cg=`uniform sampler2D shadow_pass;
uniform vec2 resolution;
uniform float radius;
void main() {
	const float samples = float( VSM_SAMPLES );
	float mean = 0.0;
	float squared_mean = 0.0;
	float uvStride = samples <= 1.0 ? 0.0 : 2.0 / ( samples - 1.0 );
	float uvStart = samples <= 1.0 ? 0.0 : - 1.0;
	for ( float i = 0.0; i < samples; i ++ ) {
		float uvOffset = uvStart + i * uvStride;
		#ifdef HORIZONTAL_PASS
			vec2 distribution = texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( uvOffset, 0.0 ) * radius ) / resolution ).rg;
			mean += distribution.x;
			squared_mean += distribution.y * distribution.y + distribution.x * distribution.x;
		#else
			float depth = texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( 0.0, uvOffset ) * radius ) / resolution ).r;
			mean += depth;
			squared_mean += depth * depth;
		#endif
	}
	mean = mean / samples;
	squared_mean = squared_mean / samples;
	float std_dev = sqrt( max( 0.0, squared_mean - mean * mean ) );
	gl_FragColor = vec4( mean, std_dev, 0.0, 1.0 );
}`,Rg=[new P(1,0,0),new P(-1,0,0),new P(0,1,0),new P(0,-1,0),new P(0,0,1),new P(0,0,-1)],Ig=[new P(0,-1,0),new P(0,-1,0),new P(0,0,1),new P(0,0,-1),new P(0,-1,0),new P(0,-1,0)],bh=new ue,ds=new P,rl=new P;function Pg(t,e,n){let i=new os,s=new lt,r=new lt,a=new ge,o=new Lo,l=new No,c={},u=n.maxTextureSize,f={[Ai]:Ne,[Ne]:Ai,[$e]:$e},h=new ke({defines:{VSM_SAMPLES:8},uniforms:{shadow_pass:{value:null},resolution:{value:new lt},radius:{value:4}},vertexShader:wg,fragmentShader:Cg}),m=h.clone();m.defines.HORIZONTAL_PASS=1;let v=new ve;v.setAttribute("position",new Ue(new Float32Array([-1,-1,0.5,3,-1,0.5,-1,3,0.5]),3));let T=new We(v,h),p=this;this.enabled=!1,this.autoUpdate=!0,this.needsUpdate=!1,this.type=$i;let d=this.type;this.render=function(C,w,g){if(p.enabled===!1)return;if(p.autoUpdate===!1&&p.needsUpdate===!1)return;if(C.length===0)return;if(this.type===$l)zt("WebGLShadowMap: PCFSoftShadowMap has been removed. Using PCFShadowMap instead."),this.type=$i;let S=t.getRenderTarget(),O=t.getActiveCubeFace(),N=t.getActiveMipmapLevel(),F=t.state;if(F.setBlending(Ke),F.buffers.depth.getReversed()===!0)F.buffers.color.setClear(0,0,0,0);else F.buffers.color.setClear(1,1,1,1);F.buffers.depth.setTest(!0),F.setScissorTest(!1);let Z=d!==this.type;if(Z)w.traverse(function(I){if(I.material)if(Array.isArray(I.material))I.material.forEach((G)=>G.needsUpdate=!0);else I.material.needsUpdate=!0});for(let I=0,G=C.length;I<G;I++){let J=C[I],k=J.shadow;if(k===void 0){zt("WebGLShadowMap:",J,"has no shadow.");continue}if(k.autoUpdate===!1&&k.needsUpdate===!1)continue;s.copy(k.mapSize);let rt=k.getFrameExtents();if(s.multiply(rt),r.copy(k.mapSize),s.x>u||s.y>u){if(s.x>u)r.x=Math.floor(u/rt.x),s.x=r.x*rt.x,k.mapSize.x=r.x;if(s.y>u)r.y=Math.floor(u/rt.y),s.y=r.y*rt.y,k.mapSize.y=r.y}let W=t.state.buffers.depth.getReversed();if(k.camera._reversedDepth=W,k.map===null||Z===!0){if(k.map!==null){if(k.map.depthTexture!==null)k.map.depthTexture.dispose(),k.map.depthTexture=null;k.map.dispose()}if(this.type===Ei){if(J.isPointLight){zt("WebGLShadowMap: VSM shadow maps are not supported for PointLights. Use PCF or BasicShadowMap instead.");continue}k.map=new Ge(s.x,s.y,{format:Yn,type:ln,minFilter:De,magFilter:De,generateMipmaps:!1}),k.map.texture.name=J.name+".shadowMap",k.map.depthTexture=new $n(s.x,s.y,yn),k.map.depthTexture.name=J.name+".shadowMapDepth",k.map.depthTexture.format=Xn,k.map.depthTexture.compareFunction=null,k.map.depthTexture.minFilter=In,k.map.depthTexture.magFilter=In}else{if(J.isPointLight)k.map=new ll(s.x),k.map.depthTexture=new bo(s.x,Pn);else k.map=new Ge(s.x,s.y),k.map.depthTexture=new $n(s.x,s.y,Pn);if(k.map.depthTexture.name=J.name+".shadowMap",k.map.depthTexture.format=Xn,this.type===$i)k.map.depthTexture.compareFunction=W?ir:nr,k.map.depthTexture.minFilter=De,k.map.depthTexture.magFilter=De;else k.map.depthTexture.compareFunction=null,k.map.depthTexture.minFilter=In,k.map.depthTexture.magFilter=In}k.camera.updateProjectionMatrix()}if(k.map.isWebGLCubeRenderTarget!==!0&&(k.map.width!==s.x||k.map.height!==s.y))k.map.setSize(s.x,s.y);let Q=k.map.isWebGLCubeRenderTarget?6:k.getViewportCount();if(J.isPointLight!==!0)k.updateMatrices(J,g);for(let nt=0;nt<Q;nt++){let Pt=k.getCamera(nt);if(J.isPointLight){let{camera:Lt,matrix:se}=k,Wt=J.distance||Lt.far;if(Wt!==Lt.far)Lt.far=Wt,Lt.updateProjectionMatrix();ds.setFromMatrixPosition(J.matrixWorld),Lt.position.copy(ds),rl.copy(Lt.position),rl.add(Rg[nt]),Lt.up.copy(Ig[nt]),Lt.lookAt(rl),Lt.updateMatrixWorld(),se.makeTranslation(-ds.x,-ds.y,-ds.z),bh.multiplyMatrices(Lt.projectionMatrix,Lt.matrixWorldInverse),k._frustum.setFromProjectionMatrix(bh,Lt.coordinateSystem,Lt.reversedDepth)}if(k.map.isWebGLCubeRenderTarget)t.setRenderTarget(k.map,nt),t.clear();else{if(nt===0)t.setRenderTarget(k.map),t.clear();let Lt=k.getViewport(nt);a.set(r.x*Lt.x,r.y*Lt.y,r.x*Lt.z,r.y*Lt.w),F.viewport(a)}i=k.getFrustum(nt),x(w,g,Pt,J,this.type)}if(k.isPointLightShadow!==!0&&this.type===Ei)E(k,g);k.needsUpdate=!1}d=this.type,p.needsUpdate=!1,t.setRenderTarget(S,O,N)};function E(C,w){let g=e.update(T);if(h.defines.VSM_SAMPLES!==C.blurSamples)h.defines.VSM_SAMPLES=C.blurSamples,m.defines.VSM_SAMPLES=C.blurSamples,h.needsUpdate=!0,m.needsUpdate=!0;if(C.mapPass===null)C.mapPass=new Ge(s.x,s.y,{format:Yn,type:ln});else if(C.mapPass.width!==C.map.width||C.mapPass.height!==C.map.height)C.mapPass.setSize(C.map.width,C.map.height);h.uniforms.shadow_pass.value=C.map.depthTexture,h.uniforms.resolution.value.set(C.map.width,C.map.height),h.uniforms.radius.value=C.radius,t.setRenderTarget(C.mapPass),t.clear(),t.renderBufferDirect(w,null,g,h,T,null),m.uniforms.shadow_pass.value=C.mapPass.texture,m.uniforms.resolution.value.set(C.map.width,C.map.height),m.uniforms.radius.value=C.radius,t.setRenderTarget(C.map),t.clear(),t.renderBufferDirect(w,null,g,m,T,null)}function A(C,w,g,S){let O=null,N=g.isPointLight===!0?C.customDistanceMaterial:C.customDepthMaterial;if(N!==void 0)O=N;else if(O=g.isPointLight===!0?l:o,t.localClippingEnabled&&w.clipShadows===!0&&Array.isArray(w.clippingPlanes)&&w.clippingPlanes.length!==0||w.displacementMap&&w.displacementScale!==0||w.alphaMap&&w.alphaTest>0||w.map&&w.alphaTest>0||w.alphaToCoverage===!0){let F=O.uuid,Z=w.uuid,I=c[F];if(I===void 0)I={},c[F]=I;let G=I[Z];if(G===void 0)G=O.clone(),I[Z]=G,w.addEventListener("dispose",b);O=G}if(O.visible=w.visible,O.wireframe=w.wireframe,S===Ei)O.side=w.shadowSide!==null?w.shadowSide:w.side;else O.side=w.shadowSide!==null?w.shadowSide:f[w.side];if(O.alphaMap=w.alphaMap,O.alphaTest=w.alphaToCoverage===!0?0.5:w.alphaTest,O.map=w.map,O.clipShadows=w.clipShadows,O.clippingPlanes=w.clippingPlanes,O.clipIntersection=w.clipIntersection,O.displacementMap=w.displacementMap,O.displacementScale=w.displacementScale,O.displacementBias=w.displacementBias,O.wireframeLinewidth=w.wireframeLinewidth,O.linewidth=w.linewidth,g.isPointLight===!0&&O.isMeshDistanceMaterial===!0){let F=t.properties.get(O);F.light=g}return O}function x(C,w,g,S,O){if(C.visible===!1)return;if(C.layers.test(w.layers)&&(C.isMesh||C.isLine||C.isPoints)){if((C.castShadow||C.receiveShadow&&O===Ei)&&(!C.frustumCulled||C.intersectsFrustum(i))){C.modelViewMatrix.multiplyMatrices(g.matrixWorldInverse,C.matrixWorld);let Z=e.update(C),I=C.material;if(Array.isArray(I)){let G=Z.groups;for(let J=0,k=G.length;J<k;J++){let rt=G[J],W=I[rt.materialIndex];if(W&&W.visible){let Q=A(C,W,S,O);C.onBeforeShadow(t,C,w,g,Z,Q,rt),t.renderBufferDirect(g,null,Z,Q,C,rt),C.onAfterShadow(t,C,w,g,Z,Q,rt)}}}else if(I.visible){let G=A(C,I,S,O);C.onBeforeShadow(t,C,w,g,Z,G,null),t.renderBufferDirect(g,null,Z,G,C,null),C.onAfterShadow(t,C,w,g,Z,G,null)}}}let F=C.children;for(let Z=0,I=F.length;Z<I;Z++)x(F[Z],w,g,S,O)}function b(C){C.target.removeEventListener("dispose",b);for(let g in c){let S=c[g],O=C.target.uuid;if(O in S)S[O].dispose(),delete S[O]}}}function Lg(t,e){function n(){let U=!1,ft=new ge,Y=null,pt=new ge(0,0,0,0);return{setMask:function(Mt){if(Y!==Mt&&!U)t.colorMask(Mt,Mt,Mt,Mt),Y=Mt},setLocked:function(Mt){U=Mt},setClear:function(Mt,et,_t,Vt,fe){if(fe===!0)Mt*=Vt,et*=Vt,_t*=Vt;if(ft.set(Mt,et,_t,Vt),pt.equals(ft)===!1)t.clearColor(Mt,et,_t,Vt),pt.copy(ft)},reset:function(){U=!1,Y=null,pt.set(-1,0,0,0)}}}function i(){let U=!1,ft=!1,Y=null,pt=null,Mt=null;return{setReversed:function(et){if(ft!==et){let _t=e.get("EXT_clip_control");if(et)_t.clipControlEXT(_t.LOWER_LEFT_EXT,_t.ZERO_TO_ONE_EXT);else _t.clipControlEXT(_t.LOWER_LEFT_EXT,_t.NEGATIVE_ONE_TO_ONE_EXT);ft=et;let Vt=Mt;Mt=null,this.setClear(Vt)}},getReversed:function(){return ft},setTest:function(et){if(et)st(t.DEPTH_TEST);else Nt(t.DEPTH_TEST)},setMask:function(et){if(Y!==et&&!U)t.depthMask(et),Y=et},setFunc:function(et){if(ft)et=Wc[et];if(pt!==et){switch(et){case pc:t.depthFunc(t.NEVER);break;case mc:t.depthFunc(t.ALWAYS);break;case gc:t.depthFunc(t.LESS);break;case _a:t.depthFunc(t.LEQUAL);break;case _c:t.depthFunc(t.EQUAL);break;case xc:t.depthFunc(t.GEQUAL);break;case vc:t.depthFunc(t.GREATER);break;case yc:t.depthFunc(t.NOTEQUAL);break;default:t.depthFunc(t.LEQUAL)}pt=et}},setLocked:function(et){U=et},setClear:function(et){if(Mt!==et){if(Mt=et,ft)et=1-et;t.clearDepth(et)}},reset:function(){U=!1,Y=null,pt=null,Mt=null,ft=!1}}}function s(){let U=!1,ft=null,Y=null,pt=null,Mt=null,et=null,_t=null,Vt=null,fe=null;return{setTest:function(ne){if(!U)if(ne)st(t.STENCIL_TEST);else Nt(t.STENCIL_TEST)},setMask:function(ne){if(ft!==ne&&!U)t.stencilMask(ne),ft=ne},setFunc:function(ne,en,dn){if(Y!==ne||pt!==en||Mt!==dn)t.stencilFunc(ne,en,dn),Y=ne,pt=en,Mt=dn},setOp:function(ne,en,dn){if(et!==ne||_t!==en||Vt!==dn)t.stencilOp(ne,en,dn),et=ne,_t=en,Vt=dn},setLocked:function(ne){U=ne},setClear:function(ne){if(fe!==ne)t.clearStencil(ne),fe=ne},reset:function(){U=!1,ft=null,Y=null,pt=null,Mt=null,et=null,_t=null,Vt=null,fe=null}}}let r=new n,a=new i,o=new s,l=new WeakMap,c=new WeakMap,u={},f={},h={},m=new WeakMap,v=[],T=null,p=!1,d=null,E=null,A=null,x=null,b=null,C=null,w=null,g=new Zt(0,0,0),S=0,O=!1,N=null,F=null,Z=null,I=null,G=null,J=t.getParameter(t.MAX_COMBINED_TEXTURE_IMAGE_UNITS),k=!1,rt=0,W=t.getParameter(t.VERSION);if(W.indexOf("WebGL")!==-1)rt=parseFloat(/^WebGL (\d)/.exec(W)[1]),k=rt>=1;else if(W.indexOf("OpenGL ES")!==-1)rt=parseFloat(/^OpenGL ES (\d)/.exec(W)[1]),k=rt>=2;let Q=null,nt={},Pt=t.getParameter(t.SCISSOR_BOX),Lt=t.getParameter(t.VIEWPORT),se=new ge().fromArray(Pt),Wt=new ge().fromArray(Lt);function q(U,ft,Y,pt){let Mt=new Uint8Array(4),et=t.createTexture();t.bindTexture(U,et),t.texParameteri(U,t.TEXTURE_MIN_FILTER,t.NEAREST),t.texParameteri(U,t.TEXTURE_MAG_FILTER,t.NEAREST);for(let _t=0;_t<Y;_t++)if(U===t.TEXTURE_3D||U===t.TEXTURE_2D_ARRAY)t.texImage3D(ft,0,t.RGBA,1,1,pt,0,t.RGBA,t.UNSIGNED_BYTE,Mt);else t.texImage2D(ft+_t,0,t.RGBA,1,1,0,t.RGBA,t.UNSIGNED_BYTE,Mt);return et}let ot={};ot[t.TEXTURE_2D]=q(t.TEXTURE_2D,t.TEXTURE_2D,1),ot[t.TEXTURE_CUBE_MAP]=q(t.TEXTURE_CUBE_MAP,t.TEXTURE_CUBE_MAP_POSITIVE_X,6),ot[t.TEXTURE_2D_ARRAY]=q(t.TEXTURE_2D_ARRAY,t.TEXTURE_2D_ARRAY,1,1),ot[t.TEXTURE_3D]=q(t.TEXTURE_3D,t.TEXTURE_3D,1,1),r.setClear(0,0,0,1),a.setClear(1),o.setClear(0),st(t.DEPTH_TEST),a.setFunc(_a),vt(!1),Rt(ua),st(t.CULL_FACE),at(Ke);function st(U){if(u[U]!==!0)t.enable(U),u[U]=!0}function Nt(U){if(u[U]!==!1)t.disable(U),u[U]=!1}function Ft(U,ft){if(h[U]!==ft){if(t.bindFramebuffer(U,ft),h[U]=ft,U===t.DRAW_FRAMEBUFFER)h[t.FRAMEBUFFER]=ft;if(U===t.FRAMEBUFFER)h[t.DRAW_FRAMEBUFFER]=ft;return!0}return!1}function Et(U,ft){let Y=v,pt=!1;if(U){if(Y=m.get(ft),Y===void 0)Y=[],m.set(ft,Y);let Mt=U.textures;if(Y.length!==Mt.length||Y[0]!==t.COLOR_ATTACHMENT0){for(let et=0,_t=Mt.length;et<_t;et++)Y[et]=t.COLOR_ATTACHMENT0+et;Y.length=Mt.length,pt=!0}}else if(Y[0]!==t.BACK)Y[0]=t.BACK,pt=!0;if(pt)t.drawBuffers(Y)}function re(U){if(T!==U)return t.useProgram(U),T=U,!0;return!1}let j={[Hn]:t.FUNC_ADD,[Kl]:t.FUNC_SUBTRACT,[Ql]:t.FUNC_REVERSE_SUBTRACT};j[jl]=t.MIN,j[tc]=t.MAX;let it={[ec]:t.ZERO,[ma]:t.ONE,[nc]:t.SRC_COLOR,[sc]:t.SRC_ALPHA,[cc]:t.SRC_ALPHA_SATURATE,[oc]:t.DST_COLOR,[rc]:t.DST_ALPHA,[ic]:t.ONE_MINUS_SRC_COLOR,[ga]:t.ONE_MINUS_SRC_ALPHA,[lc]:t.ONE_MINUS_DST_COLOR,[ac]:t.ONE_MINUS_DST_ALPHA,[hc]:t.CONSTANT_COLOR,[uc]:t.ONE_MINUS_CONSTANT_COLOR,[dc]:t.CONSTANT_ALPHA,[fc]:t.ONE_MINUS_CONSTANT_ALPHA};function at(U,ft,Y,pt,Mt,et,_t,Vt,fe,ne){if(U===Ke){if(p===!0)Nt(t.BLEND),p=!1;return}if(p===!1)st(t.BLEND),p=!0;if(U!==pa){if(U!==d||ne!==O){if(E!==Hn||b!==Hn)t.blendEquation(t.FUNC_ADD),E=Hn,b=Hn;if(ne)switch(U){case Ki:t.blendFuncSeparate(t.ONE,t.ONE_MINUS_SRC_ALPHA,t.ONE,t.ONE_MINUS_SRC_ALPHA);break;case Ws:t.blendFunc(t.ONE,t.ONE);break;case da:t.blendFuncSeparate(t.ZERO,t.ONE_MINUS_SRC_COLOR,t.ZERO,t.ONE);break;case fa:t.blendFuncSeparate(t.DST_COLOR,t.ONE_MINUS_SRC_ALPHA,t.ZERO,t.ONE);break;default:Bt("WebGLState: Invalid blending: ",U);break}else switch(U){case Ki:t.blendFuncSeparate(t.SRC_ALPHA,t.ONE_MINUS_SRC_ALPHA,t.ONE,t.ONE_MINUS_SRC_ALPHA);break;case Ws:t.blendFuncSeparate(t.SRC_ALPHA,t.ONE,t.ONE,t.ONE);break;case da:Bt("WebGLState: SubtractiveBlending requires material.premultipliedAlpha = true");break;case fa:Bt("WebGLState: MultiplyBlending requires material.premultipliedAlpha = true");break;default:Bt("WebGLState: Invalid blending: ",U);break}A=null,x=null,C=null,w=null,g.set(0,0,0),S=0,d=U,O=ne}return}if(Mt=Mt||ft,et=et||Y,_t=_t||pt,ft!==E||Mt!==b)t.blendEquationSeparate(j[ft],j[Mt]),E=ft,b=Mt;if(Y!==A||pt!==x||et!==C||_t!==w)t.blendFuncSeparate(it[Y],it[pt],it[et],it[_t]),A=Y,x=pt,C=et,w=_t;if(Vt.equals(g)===!1||fe!==S)t.blendColor(Vt.r,Vt.g,Vt.b,fe),g.copy(Vt),S=fe;d=U,O=!1}function ct(U,ft){U.side===$e?Nt(t.CULL_FACE):st(t.CULL_FACE);let Y=U.side===Ne;if(ft)Y=!Y;vt(Y),U.blending===Ki&&U.transparent===!1?at(Ke):at(U.blending,U.blendEquation,U.blendSrc,U.blendDst,U.blendEquationAlpha,U.blendSrcAlpha,U.blendDstAlpha,U.blendColor,U.blendAlpha,U.premultipliedAlpha),a.setFunc(U.depthFunc),a.setTest(U.depthTest),a.setMask(U.depthWrite),r.setMask(U.colorWrite);let pt=U.stencilWrite;if(o.setTest(pt),pt)o.setMask(U.stencilWriteMask),o.setFunc(U.stencilFunc,U.stencilRef,U.stencilFuncMask),o.setOp(U.stencilFail,U.stencilZFail,U.stencilZPass);kt(U.polygonOffset,U.polygonOffsetFactor,U.polygonOffsetUnits),U.alphaToCoverage===!0?st(t.SAMPLE_ALPHA_TO_COVERAGE):Nt(t.SAMPLE_ALPHA_TO_COVERAGE)}function vt(U){if(N!==U){if(U)t.frontFace(t.CW);else t.frontFace(t.CCW);N=U}}function Rt(U){if(U!==Zl){if(st(t.CULL_FACE),U!==F)if(U===ua)t.cullFace(t.BACK);else if(U===Jl)t.cullFace(t.FRONT);else t.cullFace(t.FRONT_AND_BACK)}else Nt(t.CULL_FACE);F=U}function Dt(U){if(U!==Z){if(k)t.lineWidth(U);Z=U}}function kt(U,ft,Y){if(U){if(st(t.POLYGON_OFFSET_FILL),I!==ft||G!==Y){if(I=ft,G=Y,a.getReversed())ft=-ft;t.polygonOffset(ft,Y)}}else Nt(t.POLYGON_OFFSET_FILL)}function Ht(U){if(U)st(t.SCISSOR_TEST);else Nt(t.SCISSOR_TEST)}function R(U){if(U===void 0)U=t.TEXTURE0+J-1;if(Q!==U)t.activeTexture(U),Q=U}function oe(U,ft,Y){if(Y===void 0)if(Q===null)Y=t.TEXTURE0+J-1;else Y=Q;let pt=nt[Y];if(pt===void 0)pt={type:void 0,texture:void 0},nt[Y]=pt;if(pt.type!==U||pt.texture!==ft){if(Q!==Y)t.activeTexture(Y),Q=Y;t.bindTexture(U,ft||ot[U]),pt.type=U,pt.texture=ft}}function Yt(){let U=nt[Q];if(U!==void 0&&U.type!==void 0)t.bindTexture(U.type,null),U.type=void 0,U.texture=void 0}function Jt(){try{t.compressedTexImage2D(...arguments)}catch(U){Bt("WebGLState:",U)}}function M(){try{t.compressedTexImage3D(...arguments)}catch(U){Bt("WebGLState:",U)}}function _(){try{t.texSubImage2D(...arguments)}catch(U){Bt("WebGLState:",U)}}function L(){try{t.texSubImage3D(...arguments)}catch(U){Bt("WebGLState:",U)}}function H(){try{t.compressedTexSubImage2D(...arguments)}catch(U){Bt("WebGLState:",U)}}function tt(){try{t.compressedTexSubImage3D(...arguments)}catch(U){Bt("WebGLState:",U)}}function ht(){try{t.texStorage2D(...arguments)}catch(U){Bt("WebGLState:",U)}}function dt(){try{t.texStorage3D(...arguments)}catch(U){Bt("WebGLState:",U)}}function X(){try{t.texImage2D(...arguments)}catch(U){Bt("WebGLState:",U)}}function K(){try{t.texImage3D(...arguments)}catch(U){Bt("WebGLState:",U)}}function St(U){if(f[U]!==void 0)return f[U];else return t.getParameter(U)}function It(U,ft){if(f[U]!==ft)t.pixelStorei(U,ft),f[U]=ft}function mt(U){if(se.equals(U)===!1)t.scissor(U.x,U.y,U.z,U.w),se.copy(U)}function ut(U){if(Wt.equals(U)===!1)t.viewport(U.x,U.y,U.z,U.w),Wt.copy(U)}function Ut(U,ft){let Y=c.get(ft);if(Y===void 0)Y=new WeakMap,c.set(ft,Y);let pt=Y.get(U);if(pt===void 0)pt=t.getUniformBlockIndex(ft,U.name),Y.set(U,pt)}function Ot(U,ft){let pt=c.get(ft).get(U);if(l.get(ft)!==pt)t.uniformBlockBinding(ft,pt,U.__bindingPointIndex),l.set(ft,pt)}function ee(){t.disable(t.BLEND),t.disable(t.CULL_FACE),t.disable(t.DEPTH_TEST),t.disable(t.POLYGON_OFFSET_FILL),t.disable(t.SCISSOR_TEST),t.disable(t.STENCIL_TEST),t.disable(t.SAMPLE_ALPHA_TO_COVERAGE),t.blendEquation(t.FUNC_ADD),t.blendFunc(t.ONE,t.ZERO),t.blendFuncSeparate(t.ONE,t.ZERO,t.ONE,t.ZERO),t.blendColor(0,0,0,0),t.colorMask(!0,!0,!0,!0),t.clearColor(0,0,0,0),t.depthMask(!0),t.depthFunc(t.LESS),a.setReversed(!1),t.clearDepth(1),t.stencilMask(4294967295),t.stencilFunc(t.ALWAYS,0,4294967295),t.stencilOp(t.KEEP,t.KEEP,t.KEEP),t.clearStencil(0),t.cullFace(t.BACK),t.frontFace(t.CCW),t.polygonOffset(0,0),t.activeTexture(t.TEXTURE0),t.bindFramebuffer(t.FRAMEBUFFER,null),t.bindFramebuffer(t.DRAW_FRAMEBUFFER,null),t.bindFramebuffer(t.READ_FRAMEBUFFER,null),t.useProgram(null),t.lineWidth(1),t.scissor(0,0,t.canvas.width,t.canvas.height),t.viewport(0,0,t.canvas.width,t.canvas.height),t.pixelStorei(t.PACK_ALIGNMENT,4),t.pixelStorei(t.UNPACK_ALIGNMENT,4),t.pixelStorei(t.UNPACK_FLIP_Y_WEBGL,!1),t.pixelStorei(t.UNPACK_PREMULTIPLY_ALPHA_WEBGL,!1),t.pixelStorei(t.UNPACK_COLORSPACE_CONVERSION_WEBGL,t.BROWSER_DEFAULT_WEBGL),t.pixelStorei(t.PACK_ROW_LENGTH,0),t.pixelStorei(t.PACK_SKIP_PIXELS,0),t.pixelStorei(t.PACK_SKIP_ROWS,0),t.pixelStorei(t.UNPACK_ROW_LENGTH,0),t.pixelStorei(t.UNPACK_IMAGE_HEIGHT,0),t.pixelStorei(t.UNPACK_SKIP_PIXELS,0),t.pixelStorei(t.UNPACK_SKIP_ROWS,0),t.pixelStorei(t.UNPACK_SKIP_IMAGES,0),u={},f={},Q=null,nt={},h={},m=new WeakMap,v=[],T=null,p=!1,d=null,E=null,A=null,x=null,b=null,C=null,w=null,g=new Zt(0,0,0),S=0,O=!1,N=null,F=null,Z=null,I=null,G=null,se.set(0,0,t.canvas.width,t.canvas.height),Wt.set(0,0,t.canvas.width,t.canvas.height),r.reset(),a.reset(),o.reset()}return{buffers:{color:r,depth:a,stencil:o},enable:st,disable:Nt,bindFramebuffer:Ft,drawBuffers:Et,useProgram:re,setBlending:at,setMaterial:ct,setFlipSided:vt,setCullFace:Rt,setLineWidth:Dt,setPolygonOffset:kt,setScissorTest:Ht,activeTexture:R,bindTexture:oe,unbindTexture:Yt,compressedTexImage2D:Jt,compressedTexImage3D:M,texImage2D:X,texImage3D:K,pixelStorei:It,getParameter:St,updateUBOMapping:Ut,uniformBlockBinding:Ot,texStorage2D:ht,texStorage3D:dt,texSubImage2D:_,texSubImage3D:L,compressedTexSubImage2D:H,compressedTexSubImage3D:tt,scissor:mt,viewport:ut,reset:ee}}function Ng(t,e,n,i,s,r,a){let o=e.has("WEBGL_multisampled_render_to_texture")?e.get("WEBGL_multisampled_render_to_texture"):null,l=typeof navigator>"u"?!1:/OculusBrowser/g.test(navigator.userAgent),c=new lt,u=new WeakMap,f=new Set,h,m=new WeakMap,v=!1;try{v=typeof OffscreenCanvas<"u"&&new OffscreenCanvas(1,1).getContext("2d")!==null}catch(M){}function T(M,_){return v?new OffscreenCanvas(M,_):Wi("canvas")}function p(M,_,L){let H=1,tt=Jt(M);if(tt.width>L||tt.height>L)H=L/Math.max(tt.width,tt.height);if(H<1)if(typeof HTMLImageElement<"u"&&M instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&M instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&M instanceof ImageBitmap||typeof VideoFrame<"u"&&M instanceof VideoFrame){let ht=Math.floor(H*tt.width),dt=Math.floor(H*tt.height);if(h===void 0)h=T(ht,dt);let X=_?T(ht,dt):h;return X.width=ht,X.height=dt,X.getContext("2d").drawImage(M,0,0,ht,dt),zt("WebGLRenderer: Texture has been resized from ("+tt.width+"x"+tt.height+") to ("+ht+"x"+dt+")."),X}else{if("data"in M)zt("WebGLRenderer: Image in DataTexture is too big ("+tt.width+"x"+tt.height+").");return M}return M}function d(M){return M.generateMipmaps}function E(M){t.generateMipmap(M)}function A(M){if(M.isWebGLCubeRenderTarget)return t.TEXTURE_CUBE_MAP;if(M.isWebGL3DRenderTarget)return t.TEXTURE_3D;if(M.isWebGLArrayRenderTarget||M.isCompressedArrayTexture)return t.TEXTURE_2D_ARRAY;return t.TEXTURE_2D}function x(M,_,L,H,tt,ht=!1){if(M!==null){if(t[M]!==void 0)return t[M];zt("WebGLRenderer: Attempt to use non-existing WebGL internal format '"+M+"'")}let dt;if(H){if(dt=e.get("EXT_texture_norm16"),!dt)zt("WebGLRenderer: Unable to use normalized textures without EXT_texture_norm16 extension")}let X=_;if(_===t.RED){if(L===t.FLOAT)X=t.R32F;if(L===t.HALF_FLOAT)X=t.R16F;if(L===t.UNSIGNED_BYTE)X=t.R8;if(L===t.UNSIGNED_SHORT&&dt)X=dt.R16_EXT;if(L===t.SHORT&&dt)X=dt.R16_SNORM_EXT}if(_===t.RED_INTEGER){if(L===t.UNSIGNED_BYTE)X=t.R8UI;if(L===t.UNSIGNED_SHORT)X=t.R16UI;if(L===t.UNSIGNED_INT)X=t.R32UI;if(L===t.BYTE)X=t.R8I;if(L===t.SHORT)X=t.R16I;if(L===t.INT)X=t.R32I}if(_===t.RG){if(L===t.FLOAT)X=t.RG32F;if(L===t.HALF_FLOAT)X=t.RG16F;if(L===t.UNSIGNED_BYTE)X=t.RG8;if(L===t.UNSIGNED_SHORT&&dt)X=dt.RG16_EXT;if(L===t.SHORT&&dt)X=dt.RG16_SNORM_EXT}if(_===t.RG_INTEGER){if(L===t.UNSIGNED_BYTE)X=t.RG8UI;if(L===t.UNSIGNED_SHORT)X=t.RG16UI;if(L===t.UNSIGNED_INT)X=t.RG32UI;if(L===t.BYTE)X=t.RG8I;if(L===t.SHORT)X=t.RG16I;if(L===t.INT)X=t.RG32I}if(_===t.RGB_INTEGER){if(L===t.UNSIGNED_BYTE)X=t.RGB8UI;if(L===t.UNSIGNED_SHORT)X=t.RGB16UI;if(L===t.UNSIGNED_INT)X=t.RGB32UI;if(L===t.BYTE)X=t.RGB8I;if(L===t.SHORT)X=t.RGB16I;if(L===t.INT)X=t.RGB32I}if(_===t.RGBA_INTEGER){if(L===t.UNSIGNED_BYTE)X=t.RGBA8UI;if(L===t.UNSIGNED_SHORT)X=t.RGBA16UI;if(L===t.UNSIGNED_INT)X=t.RGBA32UI;if(L===t.BYTE)X=t.RGBA8I;if(L===t.SHORT)X=t.RGBA16I;if(L===t.INT)X=t.RGBA32I}if(_===t.RGB){if(L===t.UNSIGNED_SHORT&&dt)X=dt.RGB16_EXT;if(L===t.SHORT&&dt)X=dt.RGB16_SNORM_EXT;if(L===t.UNSIGNED_INT_5_9_9_9_REV)X=t.RGB9_E5;if(L===t.UNSIGNED_INT_10F_11F_11F_REV)X=t.R11F_G11F_B10F}if(_===t.RGBA){let K=ht?ho:Kt.getTransfer(tt);if(L===t.FLOAT)X=t.RGBA32F;if(L===t.HALF_FLOAT)X=t.RGBA16F;if(L===t.UNSIGNED_BYTE)X=K===de?t.SRGB8_ALPHA8:t.RGBA8;if(L===t.UNSIGNED_SHORT&&dt)X=dt.RGBA16_EXT;if(L===t.SHORT&&dt)X=dt.RGBA16_SNORM_EXT;if(L===t.UNSIGNED_SHORT_4_4_4_4)X=t.RGBA4;if(L===t.UNSIGNED_SHORT_5_5_5_1)X=t.RGB5_A1}if(X===t.R16F||X===t.R32F||X===t.RG16F||X===t.RG32F||X===t.RGBA16F||X===t.RGBA32F)e.get("EXT_color_buffer_float");return X}function b(M,_){let L;if(M){if(_===null||_===Pn||_===Ci)L=t.DEPTH24_STENCIL8;else if(_===yn)L=t.DEPTH32F_STENCIL8;else if(_===ts)L=t.DEPTH24_STENCIL8,zt("DepthTexture: 16 bit depth attachment is not supported with stencil. Using 24-bit attachment.")}else if(_===null||_===Pn||_===Ci)L=t.DEPTH_COMPONENT24;else if(_===yn)L=t.DEPTH_COMPONENT32F;else if(_===ts)L=t.DEPTH_COMPONENT16;return L}function C(M,_){if(d(M)===!0||M.isFramebufferTexture&&M.minFilter!==In&&M.minFilter!==De)return Math.log2(Math.max(_.width,_.height))+1;else if(M.mipmaps!==void 0&&M.mipmaps.length>0)return M.mipmaps.length;else if(M.isCompressedTexture&&Array.isArray(M.image))return _.mipmaps.length;else return 1}function w(M){let _=M.target;if(_.removeEventListener("dispose",w),S(_),_.isVideoTexture)u.delete(_);if(_.isHTMLTexture)f.delete(_)}function g(M){let _=M.target;_.removeEventListener("dispose",g),N(_)}function S(M){let _=i.get(M);if(_.__webglInit===void 0)return;let L=M.source,H=m.get(L);if(H){let tt=H[_.__cacheKey];if(tt.usedTimes--,tt.usedTimes===0)O(M);if(Object.keys(H).length===0)m.delete(L)}i.remove(M)}function O(M){let _=i.get(M);t.deleteTexture(_.__webglTexture);let L=M.source,H=m.get(L);delete H[_.__cacheKey],a.memory.textures--}function N(M){let _=i.get(M);if(M.depthTexture)M.depthTexture.dispose(),i.remove(M.depthTexture);if(M.isWebGLCubeRenderTarget)for(let H=0;H<6;H++){if(Array.isArray(_.__webglFramebuffer[H]))for(let tt=0;tt<_.__webglFramebuffer[H].length;tt++)t.deleteFramebuffer(_.__webglFramebuffer[H][tt]);else t.deleteFramebuffer(_.__webglFramebuffer[H]);if(_.__webglDepthbuffer)t.deleteRenderbuffer(_.__webglDepthbuffer[H])}else{if(Array.isArray(_.__webglFramebuffer))for(let H=0;H<_.__webglFramebuffer.length;H++)t.deleteFramebuffer(_.__webglFramebuffer[H]);else t.deleteFramebuffer(_.__webglFramebuffer);if(_.__webglDepthbuffer)t.deleteRenderbuffer(_.__webglDepthbuffer);if(_.__webglMultisampledFramebuffer)t.deleteFramebuffer(_.__webglMultisampledFramebuffer);if(_.__webglColorRenderbuffer){for(let H=0;H<_.__webglColorRenderbuffer.length;H++)if(_.__webglColorRenderbuffer[H])t.deleteRenderbuffer(_.__webglColorRenderbuffer[H])}if(_.__webglDepthRenderbuffer)t.deleteRenderbuffer(_.__webglDepthRenderbuffer)}let L=M.textures;for(let H=0,tt=L.length;H<tt;H++){let ht=i.get(L[H]);if(ht.__webglTexture)t.deleteTexture(ht.__webglTexture),a.memory.textures--;i.remove(L[H])}i.remove(M)}let F=0;function Z(){F=0}function I(){return F}function G(M){F=M}function J(){let M=F;if(M>=s.maxTextures)zt("WebGLTextures: Trying to use "+(M+1)+" texture units while this GPU supports only "+s.maxTextures);return F+=1,M}function k(M){let _=[];return _.push(M.wrapS),_.push(M.wrapT),_.push(M.wrapR||0),_.push(M.magFilter),_.push(M.minFilter),_.push(M.anisotropy),_.push(M.internalFormat),_.push(M.format),_.push(M.type),_.push(M.generateMipmaps),_.push(M.premultiplyAlpha),_.push(M.flipY),_.push(M.unpackAlignment),_.push(M.colorSpace),_.join()}function rt(M,_){let L=i.get(M);if(M.isVideoTexture)oe(M);if(M.isRenderTargetTexture===!1&&M.isExternalTexture!==!0&&M.version>0&&L.__version!==M.version){let H=M.image;if(H===null)zt("WebGLRenderer: Texture marked for update but no image data found.");else if(H.complete===!1)zt("WebGLRenderer: Texture marked for update but image is incomplete");else{Nt(L,M,_);return}}else if(M.isExternalTexture)L.__webglTexture=M.sourceTexture?M.sourceTexture:null;n.bindTexture(t.TEXTURE_2D,L.__webglTexture,t.TEXTURE0+_)}function W(M,_){let L=i.get(M);if(M.isRenderTargetTexture===!1&&M.version>0&&L.__version!==M.version){Nt(L,M,_);return}else if(M.isExternalTexture)L.__webglTexture=M.sourceTexture?M.sourceTexture:null;n.bindTexture(t.TEXTURE_2D_ARRAY,L.__webglTexture,t.TEXTURE0+_)}function Q(M,_){let L=i.get(M);if(M.isRenderTargetTexture===!1&&M.version>0&&L.__version!==M.version){Nt(L,M,_);return}n.bindTexture(t.TEXTURE_3D,L.__webglTexture,t.TEXTURE0+_)}function nt(M,_){let L=i.get(M);if(M.isCubeDepthTexture!==!0&&M.version>0&&L.__version!==M.version){Ft(L,M,_);return}n.bindTexture(t.TEXTURE_CUBE_MAP,L.__webglTexture,t.TEXTURE0+_)}let Pt={[Ta]:t.REPEAT,[Zs]:t.CLAMP_TO_EDGE,[Tc]:t.MIRRORED_REPEAT},Lt={[In]:t.NEAREST,[Ec]:t.NEAREST_MIPMAP_NEAREST,[ji]:t.NEAREST_MIPMAP_LINEAR,[De]:t.LINEAR,[Js]:t.LINEAR_MIPMAP_NEAREST,[Wn]:t.LINEAR_MIPMAP_LINEAR},se={[Dc]:t.NEVER,[zc]:t.ALWAYS,[Uc]:t.LESS,[nr]:t.LEQUAL,[Fc]:t.EQUAL,[ir]:t.GEQUAL,[Oc]:t.GREATER,[Bc]:t.NOTEQUAL};function Wt(M,_){if(_.type===yn&&e.has("OES_texture_float_linear")===!1&&(_.magFilter===De||_.magFilter===Js||_.magFilter===ji||_.magFilter===Wn||_.minFilter===De||_.minFilter===Js||_.minFilter===ji||_.minFilter===Wn))zt("WebGLRenderer: Unable to use linear filtering with floating point textures. OES_texture_float_linear not supported on this device.");if(t.texParameteri(M,t.TEXTURE_WRAP_S,Pt[_.wrapS]),t.texParameteri(M,t.TEXTURE_WRAP_T,Pt[_.wrapT]),M===t.TEXTURE_3D||M===t.TEXTURE_2D_ARRAY)t.texParameteri(M,t.TEXTURE_WRAP_R,Pt[_.wrapR]);if(t.texParameteri(M,t.TEXTURE_MAG_FILTER,Lt[_.magFilter]),t.texParameteri(M,t.TEXTURE_MIN_FILTER,Lt[_.minFilter]),_.compareFunction)t.texParameteri(M,t.TEXTURE_COMPARE_MODE,t.COMPARE_REF_TO_TEXTURE),t.texParameteri(M,t.TEXTURE_COMPARE_FUNC,se[_.compareFunction]);if(e.has("EXT_texture_filter_anisotropic")===!0){if(_.magFilter===In)return;if(_.minFilter!==ji&&_.minFilter!==Wn)return;if(_.type===yn&&e.has("OES_texture_float_linear")===!1)return;if(_.anisotropy>1||i.get(_).__currentAnisotropy){let L=e.get("EXT_texture_filter_anisotropic");t.texParameterf(M,L.TEXTURE_MAX_ANISOTROPY_EXT,Math.min(_.anisotropy,s.getMaxAnisotropy())),i.get(_).__currentAnisotropy=_.anisotropy}}}function q(M,_){let L=!1;if(M.__webglInit===void 0)M.__webglInit=!0,_.addEventListener("dispose",w);let H=_.source,tt=m.get(H);if(tt===void 0)tt={},m.set(H,tt);let ht=k(_);if(ht!==M.__cacheKey){if(tt[ht]===void 0)tt[ht]={texture:t.createTexture(),usedTimes:0},a.memory.textures++,L=!0;tt[ht].usedTimes++;let dt=tt[M.__cacheKey];if(dt!==void 0){if(tt[M.__cacheKey].usedTimes--,dt.usedTimes===0)O(_)}M.__cacheKey=ht,M.__webglTexture=tt[ht].texture}return L}function ot(M,_,L){return Math.floor(Math.floor(M/L)/_)}function st(M,_,L,H){let ht=M.updateRanges;if(ht.length===0)n.texSubImage2D(t.TEXTURE_2D,0,0,0,_.width,_.height,L,H,_.data);else{ht.sort((It,mt)=>It.start-mt.start);let dt=0;for(let It=1;It<ht.length;It++){let mt=ht[dt],ut=ht[It],Ut=mt.start+mt.count,Ot=ot(ut.start,_.width,4),ee=ot(mt.start,_.width,4);if(ut.start<=Ut+1&&Ot===ee&&ot(ut.start+ut.count-1,_.width,4)===Ot)mt.count=Math.max(mt.count,ut.start+ut.count-mt.start);else++dt,ht[dt]=ut}ht.length=dt+1;let X=n.getParameter(t.UNPACK_ROW_LENGTH),K=n.getParameter(t.UNPACK_SKIP_PIXELS),St=n.getParameter(t.UNPACK_SKIP_ROWS);n.pixelStorei(t.UNPACK_ROW_LENGTH,_.width);for(let It=0,mt=ht.length;It<mt;It++){let ut=ht[It],Ut=Math.floor(ut.start/4),Ot=Math.ceil(ut.count/4),ee=Ut%_.width,U=Math.floor(Ut/_.width),ft=Ot,Y=1;n.pixelStorei(t.UNPACK_SKIP_PIXELS,ee),n.pixelStorei(t.UNPACK_SKIP_ROWS,U),n.texSubImage2D(t.TEXTURE_2D,0,ee,U,ft,1,L,H,_.data)}M.clearUpdateRanges(),n.pixelStorei(t.UNPACK_ROW_LENGTH,X),n.pixelStorei(t.UNPACK_SKIP_PIXELS,K),n.pixelStorei(t.UNPACK_SKIP_ROWS,St)}}function Nt(M,_,L){let H=t.TEXTURE_2D;if(_.isDataArrayTexture||_.isCompressedArrayTexture)H=t.TEXTURE_2D_ARRAY;if(_.isData3DTexture)H=t.TEXTURE_3D;let tt=q(M,_),ht=_.source;n.bindTexture(H,M.__webglTexture,t.TEXTURE0+L);let dt=i.get(ht);if(ht.version!==dt.__version||tt===!0){if(n.activeTexture(t.TEXTURE0+L),(typeof ImageBitmap<"u"&&_.image instanceof ImageBitmap)===!1){let Y=Kt.getPrimaries(Kt.workingColorSpace),pt=_.colorSpace===Zn?null:Kt.getPrimaries(_.colorSpace),Mt=_.colorSpace===Zn||Y===pt?t.NONE:t.BROWSER_DEFAULT_WEBGL;n.pixelStorei(t.UNPACK_FLIP_Y_WEBGL,_.flipY),n.pixelStorei(t.UNPACK_PREMULTIPLY_ALPHA_WEBGL,_.premultiplyAlpha),n.pixelStorei(t.UNPACK_COLORSPACE_CONVERSION_WEBGL,Mt)}n.pixelStorei(t.UNPACK_ALIGNMENT,_.unpackAlignment);let K=p(_.image,!1,s.maxTextureSize);K=Yt(_,K);let St=r.convert(_.format,_.colorSpace),It=r.convert(_.type),mt=x(_.internalFormat,St,It,_.normalized,_.colorSpace,_.isVideoTexture);Wt(H,_);let ut,Ut=_.mipmaps,Ot=_.isVideoTexture!==!0,ee=dt.__version===void 0||tt===!0,U=ht.dataReady,ft=C(_,K);if(_.isDepthTexture){if(mt=b(_.format===qn,_.type),ee)if(Ot)n.texStorage2D(t.TEXTURE_2D,1,mt,K.width,K.height);else n.texImage2D(t.TEXTURE_2D,0,mt,K.width,K.height,0,St,It,null)}else if(_.isDataTexture)if(Ut.length>0){if(Ot&&ee)n.texStorage2D(t.TEXTURE_2D,ft,mt,Ut[0].width,Ut[0].height);for(let Y=0,pt=Ut.length;Y<pt;Y++)if(ut=Ut[Y],Ot){if(U)n.texSubImage2D(t.TEXTURE_2D,Y,0,0,ut.width,ut.height,St,It,ut.data)}else n.texImage2D(t.TEXTURE_2D,Y,mt,ut.width,ut.height,0,St,It,ut.data);_.generateMipmaps=!1}else if(Ot){if(ee)n.texStorage2D(t.TEXTURE_2D,ft,mt,K.width,K.height);if(U)st(_,K,St,It)}else n.texImage2D(t.TEXTURE_2D,0,mt,K.width,K.height,0,St,It,K.data);else if(_.isCompressedTexture)if(_.isCompressedArrayTexture){if(Ot&&ee)n.texStorage3D(t.TEXTURE_2D_ARRAY,ft,mt,Ut[0].width,Ut[0].height,K.depth);for(let Y=0,pt=Ut.length;Y<pt;Y++)if(ut=Ut[Y],_.format!==tn)if(St!==null)if(Ot){if(U)if(_.layerUpdates.size>0){let Mt=jo(ut.width,ut.height,_.format,_.type);for(let et of _.layerUpdates){let _t=ut.data.subarray(et*Mt/ut.data.BYTES_PER_ELEMENT,(et+1)*Mt/ut.data.BYTES_PER_ELEMENT);n.compressedTexSubImage3D(t.TEXTURE_2D_ARRAY,Y,0,0,et,ut.width,ut.height,1,St,_t)}}else n.compressedTexSubImage3D(t.TEXTURE_2D_ARRAY,Y,0,0,0,ut.width,ut.height,K.depth,St,ut.data)}else n.compressedTexImage3D(t.TEXTURE_2D_ARRAY,Y,mt,ut.width,ut.height,K.depth,0,ut.data,0,0);else zt("WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()");else if(Ot){if(U)n.texSubImage3D(t.TEXTURE_2D_ARRAY,Y,0,0,0,ut.width,ut.height,K.depth,St,It,ut.data)}else n.texImage3D(t.TEXTURE_2D_ARRAY,Y,mt,ut.width,ut.height,K.depth,0,St,It,ut.data);if(_.layerUpdates.size>0)_.clearLayerUpdates()}else{if(Ot&&ee)n.texStorage2D(t.TEXTURE_2D,ft,mt,Ut[0].width,Ut[0].height);for(let Y=0,pt=Ut.length;Y<pt;Y++)if(ut=Ut[Y],_.format!==tn)if(St!==null)if(Ot){if(U)n.compressedTexSubImage2D(t.TEXTURE_2D,Y,0,0,ut.width,ut.height,St,ut.data)}else n.compressedTexImage2D(t.TEXTURE_2D,Y,mt,ut.width,ut.height,0,ut.data);else zt("WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()");else if(Ot){if(U)n.texSubImage2D(t.TEXTURE_2D,Y,0,0,ut.width,ut.height,St,It,ut.data)}else n.texImage2D(t.TEXTURE_2D,Y,mt,ut.width,ut.height,0,St,It,ut.data)}else if(_.isDataArrayTexture)if(Ot){if(ee)n.texStorage3D(t.TEXTURE_2D_ARRAY,ft,mt,K.width,K.height,K.depth);if(U)if(_.layerUpdates.size>0){let Y=jo(K.width,K.height,_.format,_.type);for(let pt of _.layerUpdates){let Mt=K.data.subarray(pt*Y/K.data.BYTES_PER_ELEMENT,(pt+1)*Y/K.data.BYTES_PER_ELEMENT);n.texSubImage3D(t.TEXTURE_2D_ARRAY,0,0,0,pt,K.width,K.height,1,St,It,Mt)}_.clearLayerUpdates()}else n.texSubImage3D(t.TEXTURE_2D_ARRAY,0,0,0,0,K.width,K.height,K.depth,St,It,K.data)}else n.texImage3D(t.TEXTURE_2D_ARRAY,0,mt,K.width,K.height,K.depth,0,St,It,K.data);else if(_.isData3DTexture)if(Ot){if(ee)n.texStorage3D(t.TEXTURE_3D,ft,mt,K.width,K.height,K.depth);if(U)n.texSubImage3D(t.TEXTURE_3D,0,0,0,0,K.width,K.height,K.depth,St,It,K.data)}else n.texImage3D(t.TEXTURE_3D,0,mt,K.width,K.height,K.depth,0,St,It,K.data);else if(_.isFramebufferTexture){if(ee)if(Ot)n.texStorage2D(t.TEXTURE_2D,ft,mt,K.width,K.height);else{let Y=K.width,pt=K.height;for(let Mt=0;Mt<ft;Mt++)n.texImage2D(t.TEXTURE_2D,Mt,mt,Y,pt,0,St,It,null),Y>>=1,pt>>=1}}else if(_.isHTMLTexture){if("texElementImage2D"in t){let Y=t.canvas;if(!Y.hasAttribute("layoutsubtree"))Y.setAttribute("layoutsubtree","true");if(K.parentNode!==Y){Y.appendChild(K),f.add(_),Y.onpaint=(pt)=>{let Mt=pt.changedElements;for(let et of f)if(Mt.includes(et.image))et.needsUpdate=!0},Y.requestPaint();return}if(t.texElementImage2D.length===3)t.texElementImage2D(t.TEXTURE_2D,t.RGBA8,K);else{let{RGBA:Mt,RGBA:et,UNSIGNED_BYTE:_t}=t;t.texElementImage2D(t.TEXTURE_2D,0,Mt,et,_t,K)}t.texParameteri(t.TEXTURE_2D,t.TEXTURE_MIN_FILTER,t.LINEAR),t.texParameteri(t.TEXTURE_2D,t.TEXTURE_WRAP_S,t.CLAMP_TO_EDGE),t.texParameteri(t.TEXTURE_2D,t.TEXTURE_WRAP_T,t.CLAMP_TO_EDGE)}}else if(Ut.length>0){if(Ot&&ee){let Y=Jt(Ut[0]);n.texStorage2D(t.TEXTURE_2D,ft,mt,Y.width,Y.height)}for(let Y=0,pt=Ut.length;Y<pt;Y++)if(ut=Ut[Y],Ot){if(U)n.texSubImage2D(t.TEXTURE_2D,Y,0,0,St,It,ut)}else n.texImage2D(t.TEXTURE_2D,Y,mt,St,It,ut);_.generateMipmaps=!1}else if(Ot){if(ee){let Y=Jt(K);n.texStorage2D(t.TEXTURE_2D,ft,mt,Y.width,Y.height)}if(U)n.texSubImage2D(t.TEXTURE_2D,0,0,0,St,It,K)}else n.texImage2D(t.TEXTURE_2D,0,mt,St,It,K);if(d(_))E(H);if(dt.__version=ht.version,_.onUpdate)_.onUpdate(_)}M.__version=_.version}function Ft(M,_,L){if(_.image.length!==6)return;let H=q(M,_),tt=_.source;n.bindTexture(t.TEXTURE_CUBE_MAP,M.__webglTexture,t.TEXTURE0+L);let ht=i.get(tt);if(tt.version!==ht.__version||H===!0){n.activeTexture(t.TEXTURE0+L);let dt=Kt.getPrimaries(Kt.workingColorSpace),X=_.colorSpace===Zn?null:Kt.getPrimaries(_.colorSpace),K=_.colorSpace===Zn||dt===X?t.NONE:t.BROWSER_DEFAULT_WEBGL;n.pixelStorei(t.UNPACK_FLIP_Y_WEBGL,_.flipY),n.pixelStorei(t.UNPACK_PREMULTIPLY_ALPHA_WEBGL,_.premultiplyAlpha),n.pixelStorei(t.UNPACK_ALIGNMENT,_.unpackAlignment),n.pixelStorei(t.UNPACK_COLORSPACE_CONVERSION_WEBGL,K);let St=_.isCompressedTexture||_.image[0].isCompressedTexture,It=_.image[0]&&_.image[0].isDataTexture,mt=[];for(let et=0;et<6;et++){if(!St&&!It)mt[et]=p(_.image[et],!0,s.maxCubemapSize);else mt[et]=It?_.image[et].image:_.image[et];mt[et]=Yt(_,mt[et])}let ut=mt[0],Ut=r.convert(_.format,_.colorSpace),Ot=r.convert(_.type),ee=x(_.internalFormat,Ut,Ot,_.normalized,_.colorSpace),U=_.isVideoTexture!==!0,ft=ht.__version===void 0||H===!0,Y=tt.dataReady,pt=C(_,ut);Wt(t.TEXTURE_CUBE_MAP,_);let Mt;if(St){if(U&&ft)n.texStorage2D(t.TEXTURE_CUBE_MAP,pt,ee,ut.width,ut.height);for(let et=0;et<6;et++){Mt=mt[et].mipmaps;for(let _t=0;_t<Mt.length;_t++){let Vt=Mt[_t];if(_.format!==tn)if(Ut!==null)if(U){if(Y)n.compressedTexSubImage2D(t.TEXTURE_CUBE_MAP_POSITIVE_X+et,_t,0,0,Vt.width,Vt.height,Ut,Vt.data)}else n.compressedTexImage2D(t.TEXTURE_CUBE_MAP_POSITIVE_X+et,_t,ee,Vt.width,Vt.height,0,Vt.data);else zt("WebGLRenderer: Attempt to load unsupported compressed texture format in .setTextureCube()");else if(U){if(Y)n.texSubImage2D(t.TEXTURE_CUBE_MAP_POSITIVE_X+et,_t,0,0,Vt.width,Vt.height,Ut,Ot,Vt.data)}else n.texImage2D(t.TEXTURE_CUBE_MAP_POSITIVE_X+et,_t,ee,Vt.width,Vt.height,0,Ut,Ot,Vt.data)}}}else{if(Mt=_.mipmaps,U&&ft){if(Mt.length>0)pt++;let et=Jt(mt[0]);n.texStorage2D(t.TEXTURE_CUBE_MAP,pt,ee,et.width,et.height)}for(let et=0;et<6;et++)if(It){if(U){if(Y)n.texSubImage2D(t.TEXTURE_CUBE_MAP_POSITIVE_X+et,0,0,0,mt[et].width,mt[et].height,Ut,Ot,mt[et].data)}else n.texImage2D(t.TEXTURE_CUBE_MAP_POSITIVE_X+et,0,ee,mt[et].width,mt[et].height,0,Ut,Ot,mt[et].data);for(let _t=0;_t<Mt.length;_t++){let fe=Mt[_t].image[et].image;if(U){if(Y)n.texSubImage2D(t.TEXTURE_CUBE_MAP_POSITIVE_X+et,_t+1,0,0,fe.width,fe.height,Ut,Ot,fe.data)}else n.texImage2D(t.TEXTURE_CUBE_MAP_POSITIVE_X+et,_t+1,ee,fe.width,fe.height,0,Ut,Ot,fe.data)}}else{if(U){if(Y)n.texSubImage2D(t.TEXTURE_CUBE_MAP_POSITIVE_X+et,0,0,0,Ut,Ot,mt[et])}else n.texImage2D(t.TEXTURE_CUBE_MAP_POSITIVE_X+et,0,ee,Ut,Ot,mt[et]);for(let _t=0;_t<Mt.length;_t++){let Vt=Mt[_t];if(U){if(Y)n.texSubImage2D(t.TEXTURE_CUBE_MAP_POSITIVE_X+et,_t+1,0,0,Ut,Ot,Vt.image[et])}else n.texImage2D(t.TEXTURE_CUBE_MAP_POSITIVE_X+et,_t+1,ee,Ut,Ot,Vt.image[et])}}}if(d(_))E(t.TEXTURE_CUBE_MAP);if(ht.__version=tt.version,_.onUpdate)_.onUpdate(_)}M.__version=_.version}function Et(M,_,L,H,tt,ht){let dt=r.convert(L.format,L.colorSpace),X=r.convert(L.type),K=x(L.internalFormat,dt,X,L.normalized,L.colorSpace),St=i.get(_),It=i.get(L);if(It.__renderTarget=_,!St.__hasExternalTextures){let mt=Math.max(1,_.width>>ht),ut=Math.max(1,_.height>>ht);if(tt===t.TEXTURE_3D||tt===t.TEXTURE_2D_ARRAY)n.texImage3D(tt,ht,K,mt,ut,_.depth,0,dt,X,null);else n.texImage2D(tt,ht,K,mt,ut,0,dt,X,null)}if(n.bindFramebuffer(t.FRAMEBUFFER,M),R(_))o.framebufferTexture2DMultisampleEXT(t.FRAMEBUFFER,H,tt,It.__webglTexture,0,Ht(_));else if(tt===t.TEXTURE_2D||tt>=t.TEXTURE_CUBE_MAP_POSITIVE_X&&tt<=t.TEXTURE_CUBE_MAP_NEGATIVE_Z)t.framebufferTexture2D(t.FRAMEBUFFER,H,tt,It.__webglTexture,ht);n.bindFramebuffer(t.FRAMEBUFFER,null)}function re(M,_,L){if(t.bindRenderbuffer(t.RENDERBUFFER,M),_.depthBuffer){let H=_.depthTexture,tt=H&&H.isDepthTexture?H.type:null,ht=b(_.stencilBuffer,tt),dt=_.stencilBuffer?t.DEPTH_STENCIL_ATTACHMENT:t.DEPTH_ATTACHMENT;if(R(_))o.renderbufferStorageMultisampleEXT(t.RENDERBUFFER,Ht(_),ht,_.width,_.height);else if(L)t.renderbufferStorageMultisample(t.RENDERBUFFER,Ht(_),ht,_.width,_.height);else t.renderbufferStorage(t.RENDERBUFFER,ht,_.width,_.height);t.framebufferRenderbuffer(t.FRAMEBUFFER,dt,t.RENDERBUFFER,M)}else{let H=_.textures;for(let tt=0;tt<H.length;tt++){let ht=H[tt],dt=r.convert(ht.format,ht.colorSpace),X=r.convert(ht.type),K=x(ht.internalFormat,dt,X,ht.normalized,ht.colorSpace);if(R(_))o.renderbufferStorageMultisampleEXT(t.RENDERBUFFER,Ht(_),K,_.width,_.height);else if(L)t.renderbufferStorageMultisample(t.RENDERBUFFER,Ht(_),K,_.width,_.height);else t.renderbufferStorage(t.RENDERBUFFER,K,_.width,_.height)}}t.bindRenderbuffer(t.RENDERBUFFER,null)}function j(M,_,L){let H=_.isWebGLCubeRenderTarget===!0;if(n.bindFramebuffer(t.FRAMEBUFFER,M),!(_.depthTexture&&_.depthTexture.isDepthTexture))throw Error("THREE.WebGLTextures: renderTarget.depthTexture must be an instance of THREE.DepthTexture.");let tt=i.get(_.depthTexture);if(tt.__renderTarget=_,!tt.__webglTexture||_.depthTexture.image.width!==_.width||_.depthTexture.image.height!==_.height)_.depthTexture.image.width=_.width,_.depthTexture.image.height=_.height,_.depthTexture.needsUpdate=!0;if(H){if(tt.__webglInit===void 0)tt.__webglInit=!0,_.depthTexture.addEventListener("dispose",w);if(tt.__webglTexture===void 0){tt.__webglTexture=t.createTexture(),n.bindTexture(t.TEXTURE_CUBE_MAP,tt.__webglTexture),Wt(t.TEXTURE_CUBE_MAP,_.depthTexture);let St=r.convert(_.depthTexture.format),It=r.convert(_.depthTexture.type),mt;if(_.depthTexture.format===Xn)mt=t.DEPTH_COMPONENT24;else if(_.depthTexture.format===qn)mt=t.DEPTH24_STENCIL8;for(let ut=0;ut<6;ut++)t.texImage2D(t.TEXTURE_CUBE_MAP_POSITIVE_X+ut,0,mt,_.width,_.height,0,St,It,null)}}else rt(_.depthTexture,0);let ht=tt.__webglTexture,dt=Ht(_),X=H?t.TEXTURE_CUBE_MAP_POSITIVE_X+L:t.TEXTURE_2D,K=_.depthTexture.format===qn?t.DEPTH_STENCIL_ATTACHMENT:t.DEPTH_ATTACHMENT;if(_.depthTexture.format===Xn)if(R(_))o.framebufferTexture2DMultisampleEXT(t.FRAMEBUFFER,K,X,ht,0,dt);else t.framebufferTexture2D(t.FRAMEBUFFER,K,X,ht,0);else if(_.depthTexture.format===qn)if(R(_))o.framebufferTexture2DMultisampleEXT(t.FRAMEBUFFER,K,X,ht,0,dt);else t.framebufferTexture2D(t.FRAMEBUFFER,K,X,ht,0);else throw Error("THREE.WebGLTextures: Unknown depthTexture format.")}function it(M){let _=i.get(M),L=M.isWebGLCubeRenderTarget===!0;if(_.__boundDepthTexture!==M.depthTexture){let H=M.depthTexture;if(_.__depthDisposeCallback)_.__depthDisposeCallback();if(H){let tt=()=>{delete _.__boundDepthTexture,delete _.__depthDisposeCallback,H.removeEventListener("dispose",tt)};H.addEventListener("dispose",tt),_.__depthDisposeCallback=tt}_.__boundDepthTexture=H}if(M.depthTexture&&!_.__autoAllocateDepthBuffer)if(L)for(let H=0;H<6;H++)j(_.__webglFramebuffer[H],M,H);else{let H=M.texture.mipmaps;if(H&&H.length>0)j(_.__webglFramebuffer[0],M,0);else j(_.__webglFramebuffer,M,0)}else if(L){_.__webglDepthbuffer=[];for(let H=0;H<6;H++)if(n.bindFramebuffer(t.FRAMEBUFFER,_.__webglFramebuffer[H]),_.__webglDepthbuffer[H]===void 0)_.__webglDepthbuffer[H]=t.createRenderbuffer(),re(_.__webglDepthbuffer[H],M,!1);else{let tt=M.stencilBuffer?t.DEPTH_STENCIL_ATTACHMENT:t.DEPTH_ATTACHMENT,ht=_.__webglDepthbuffer[H];t.bindRenderbuffer(t.RENDERBUFFER,ht),t.framebufferRenderbuffer(t.FRAMEBUFFER,tt,t.RENDERBUFFER,ht)}}else{let H=M.texture.mipmaps;if(H&&H.length>0)n.bindFramebuffer(t.FRAMEBUFFER,_.__webglFramebuffer[0]);else n.bindFramebuffer(t.FRAMEBUFFER,_.__webglFramebuffer);if(_.__webglDepthbuffer===void 0)_.__webglDepthbuffer=t.createRenderbuffer(),re(_.__webglDepthbuffer,M,!1);else{let tt=M.stencilBuffer?t.DEPTH_STENCIL_ATTACHMENT:t.DEPTH_ATTACHMENT,ht=_.__webglDepthbuffer;t.bindRenderbuffer(t.RENDERBUFFER,ht),t.framebufferRenderbuffer(t.FRAMEBUFFER,tt,t.RENDERBUFFER,ht)}}n.bindFramebuffer(t.FRAMEBUFFER,null)}function at(M,_,L){let H=i.get(M);if(_!==void 0)Et(H.__webglFramebuffer,M,M.texture,t.COLOR_ATTACHMENT0,t.TEXTURE_2D,0);if(L!==void 0)it(M)}function ct(M){let _=M.texture,L=i.get(M),H=i.get(_);M.addEventListener("dispose",g);let tt=M.textures,ht=M.isWebGLCubeRenderTarget===!0,dt=tt.length>1;if(!dt){if(H.__webglTexture===void 0)H.__webglTexture=t.createTexture();H.__version=_.version,a.memory.textures++}if(ht){L.__webglFramebuffer=[];for(let X=0;X<6;X++)if(_.mipmaps&&_.mipmaps.length>0){L.__webglFramebuffer[X]=[];for(let K=0;K<_.mipmaps.length;K++)L.__webglFramebuffer[X][K]=t.createFramebuffer()}else L.__webglFramebuffer[X]=t.createFramebuffer()}else{if(_.mipmaps&&_.mipmaps.length>0){L.__webglFramebuffer=[];for(let X=0;X<_.mipmaps.length;X++)L.__webglFramebuffer[X]=t.createFramebuffer()}else L.__webglFramebuffer=t.createFramebuffer();if(dt)for(let X=0,K=tt.length;X<K;X++){let St=i.get(tt[X]);if(St.__webglTexture===void 0)St.__webglTexture=t.createTexture(),a.memory.textures++}if(M.samples>0&&R(M)===!1){L.__webglMultisampledFramebuffer=t.createFramebuffer(),L.__webglColorRenderbuffer=[],n.bindFramebuffer(t.FRAMEBUFFER,L.__webglMultisampledFramebuffer);for(let X=0;X<tt.length;X++){let K=tt[X];L.__webglColorRenderbuffer[X]=t.createRenderbuffer(),t.bindRenderbuffer(t.RENDERBUFFER,L.__webglColorRenderbuffer[X]);let St=r.convert(K.format,K.colorSpace),It=r.convert(K.type),mt=x(K.internalFormat,St,It,K.normalized,K.colorSpace,M.isXRRenderTarget===!0),ut=Ht(M);t.renderbufferStorageMultisample(t.RENDERBUFFER,ut,mt,M.width,M.height),t.framebufferRenderbuffer(t.FRAMEBUFFER,t.COLOR_ATTACHMENT0+X,t.RENDERBUFFER,L.__webglColorRenderbuffer[X])}if(t.bindRenderbuffer(t.RENDERBUFFER,null),M.depthBuffer)L.__webglDepthRenderbuffer=t.createRenderbuffer(),re(L.__webglDepthRenderbuffer,M,!0);n.bindFramebuffer(t.FRAMEBUFFER,null)}}if(ht){n.bindTexture(t.TEXTURE_CUBE_MAP,H.__webglTexture),Wt(t.TEXTURE_CUBE_MAP,_);for(let X=0;X<6;X++)if(_.mipmaps&&_.mipmaps.length>0)for(let K=0;K<_.mipmaps.length;K++)Et(L.__webglFramebuffer[X][K],M,_,t.COLOR_ATTACHMENT0,t.TEXTURE_CUBE_MAP_POSITIVE_X+X,K);else Et(L.__webglFramebuffer[X],M,_,t.COLOR_ATTACHMENT0,t.TEXTURE_CUBE_MAP_POSITIVE_X+X,0);if(d(_))E(t.TEXTURE_CUBE_MAP);n.unbindTexture()}else if(dt){for(let X=0,K=tt.length;X<K;X++){let St=tt[X],It=i.get(St),mt=t.TEXTURE_2D;if(M.isWebGL3DRenderTarget||M.isWebGLArrayRenderTarget)mt=M.isWebGL3DRenderTarget?t.TEXTURE_3D:t.TEXTURE_2D_ARRAY;if(n.bindTexture(mt,It.__webglTexture),Wt(mt,St),Et(L.__webglFramebuffer,M,St,t.COLOR_ATTACHMENT0+X,mt,0),d(St))E(mt)}n.unbindTexture()}else{let X=t.TEXTURE_2D;if(M.isWebGL3DRenderTarget||M.isWebGLArrayRenderTarget)X=M.isWebGL3DRenderTarget?t.TEXTURE_3D:t.TEXTURE_2D_ARRAY;if(n.bindTexture(X,H.__webglTexture),Wt(X,_),_.mipmaps&&_.mipmaps.length>0)for(let K=0;K<_.mipmaps.length;K++)Et(L.__webglFramebuffer[K],M,_,t.COLOR_ATTACHMENT0,X,K);else Et(L.__webglFramebuffer,M,_,t.COLOR_ATTACHMENT0,X,0);if(d(_))E(X);n.unbindTexture()}if(M.depthBuffer)it(M)}function vt(M){let _=M.textures;for(let L=0,H=_.length;L<H;L++){let tt=_[L];if(d(tt)){let ht=A(M),dt=i.get(tt).__webglTexture;n.bindTexture(ht,dt),E(ht),n.unbindTexture()}}}let Rt=[],Dt=[];function kt(M){if(M.samples>0){if(R(M)===!1){let{textures:_,width:L,height:H}=M,tt=t.COLOR_BUFFER_BIT,ht=M.stencilBuffer?t.DEPTH_STENCIL_ATTACHMENT:t.DEPTH_ATTACHMENT,dt=i.get(M),X=_.length>1;if(X)for(let St=0;St<_.length;St++)n.bindFramebuffer(t.FRAMEBUFFER,dt.__webglMultisampledFramebuffer),t.framebufferRenderbuffer(t.FRAMEBUFFER,t.COLOR_ATTACHMENT0+St,t.RENDERBUFFER,null),n.bindFramebuffer(t.FRAMEBUFFER,dt.__webglFramebuffer),t.framebufferTexture2D(t.DRAW_FRAMEBUFFER,t.COLOR_ATTACHMENT0+St,t.TEXTURE_2D,null,0);n.bindFramebuffer(t.READ_FRAMEBUFFER,dt.__webglMultisampledFramebuffer);let K=M.texture.mipmaps;if(K&&K.length>0)n.bindFramebuffer(t.DRAW_FRAMEBUFFER,dt.__webglFramebuffer[0]);else n.bindFramebuffer(t.DRAW_FRAMEBUFFER,dt.__webglFramebuffer);for(let St=0;St<_.length;St++){if(M.resolveDepthBuffer){if(M.depthBuffer)tt|=t.DEPTH_BUFFER_BIT;if(M.stencilBuffer&&M.resolveStencilBuffer)tt|=t.STENCIL_BUFFER_BIT}if(X){t.framebufferRenderbuffer(t.READ_FRAMEBUFFER,t.COLOR_ATTACHMENT0,t.RENDERBUFFER,dt.__webglColorRenderbuffer[St]);let It=i.get(_[St]).__webglTexture;t.framebufferTexture2D(t.DRAW_FRAMEBUFFER,t.COLOR_ATTACHMENT0,t.TEXTURE_2D,It,0)}if(t.blitFramebuffer(0,0,L,H,0,0,L,H,tt,t.NEAREST),l===!0){if(Rt.length=0,Dt.length=0,Rt.push(t.COLOR_ATTACHMENT0+St),M.depthBuffer&&M.storeMultisampledDepthBuffer===!1)Rt.push(ht),Dt.push(ht),t.invalidateFramebuffer(t.DRAW_FRAMEBUFFER,Dt);t.invalidateFramebuffer(t.READ_FRAMEBUFFER,Rt)}}if(n.bindFramebuffer(t.READ_FRAMEBUFFER,null),n.bindFramebuffer(t.DRAW_FRAMEBUFFER,null),X)for(let St=0;St<_.length;St++){n.bindFramebuffer(t.FRAMEBUFFER,dt.__webglMultisampledFramebuffer),t.framebufferRenderbuffer(t.FRAMEBUFFER,t.COLOR_ATTACHMENT0+St,t.RENDERBUFFER,dt.__webglColorRenderbuffer[St]);let It=i.get(_[St]).__webglTexture;n.bindFramebuffer(t.FRAMEBUFFER,dt.__webglFramebuffer),t.framebufferTexture2D(t.DRAW_FRAMEBUFFER,t.COLOR_ATTACHMENT0+St,t.TEXTURE_2D,It,0)}n.bindFramebuffer(t.DRAW_FRAMEBUFFER,dt.__webglMultisampledFramebuffer)}else if(M.depthBuffer&&M.storeMultisampledDepthBuffer===!1&&l){let _=M.stencilBuffer?t.DEPTH_STENCIL_ATTACHMENT:t.DEPTH_ATTACHMENT;t.invalidateFramebuffer(t.DRAW_FRAMEBUFFER,[_])}}}function Ht(M){return Math.min(s.maxSamples,M.samples)}function R(M){let _=i.get(M);return M.samples>0&&e.has("WEBGL_multisampled_render_to_texture")===!0&&_.__useRenderToTexture!==!1}function oe(M){let _=a.render.frame;if(u.get(M)!==_)u.set(M,_),M.update()}function Yt(M,_){let{colorSpace:L,format:H,type:tt}=M;if(M.isCompressedTexture===!0||M.isVideoTexture===!0)return _;if(L!==co&&L!==Zn)if(Kt.getTransfer(L)===de){if(H!==tn||tt!==je)zt("WebGLTextures: sRGB encoded textures have to use RGBAFormat and UnsignedByteType.")}else Bt("WebGLTextures: Unsupported texture color space:",L);return _}function Jt(M){if(typeof HTMLImageElement<"u"&&M instanceof HTMLImageElement)c.width=M.naturalWidth||M.width,c.height=M.naturalHeight||M.height;else if(typeof VideoFrame<"u"&&M instanceof VideoFrame)c.width=M.displayWidth,c.height=M.displayHeight;else c.width=M.width,c.height=M.height;return c}this.allocateTextureUnit=J,this.resetTextureUnits=Z,this.getTextureUnits=I,this.setTextureUnits=G,this.setTexture2D=rt,this.setTexture2DArray=W,this.setTexture3D=Q,this.setTextureCube=nt,this.rebindTextures=at,this.setupRenderTarget=ct,this.updateRenderTargetMipmap=vt,this.updateMultisampleRenderTarget=kt,this.setupDepthRenderbuffer=it,this.setupFrameBufferTexture=Et,this.useMultisampledRTT=R,this.isReversedDepthBuffer=function(){return n.buffers.depth.getReversed()}}function Dg(t,e){function n(i,s=Zn){let r,a=Kt.getTransfer(s);if(i===je)return t.UNSIGNED_BYTE;if(i===Aa)return t.UNSIGNED_SHORT_4_4_4_4;if(i===wa)return t.UNSIGNED_SHORT_5_5_5_1;if(i===Cc)return t.UNSIGNED_INT_5_9_9_9_REV;if(i===Rc)return t.UNSIGNED_INT_10F_11F_11F_REV;if(i===Ac)return t.BYTE;if(i===wc)return t.SHORT;if(i===ts)return t.UNSIGNED_SHORT;if(i===Ea)return t.INT;if(i===Pn)return t.UNSIGNED_INT;if(i===yn)return t.FLOAT;if(i===ln)return t.HALF_FLOAT;if(i===Ic)return t.ALPHA;if(i===Pc)return t.RGB;if(i===tn)return t.RGBA;if(i===Xn)return t.DEPTH_COMPONENT;if(i===qn)return t.DEPTH_STENCIL;if(i===Lc)return t.RED;if(i===Ca)return t.RED_INTEGER;if(i===Yn)return t.RG;if(i===Ra)return t.RG_INTEGER;if(i===Ia)return t.RGBA_INTEGER;if(i===$s||i===Ks||i===Qs||i===js)if(a===de)if(r=e.get("WEBGL_compressed_texture_s3tc_srgb"),r!==null){if(i===$s)return r.COMPRESSED_SRGB_S3TC_DXT1_EXT;if(i===Ks)return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT1_EXT;if(i===Qs)return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT3_EXT;if(i===js)return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT5_EXT}else return null;else if(r=e.get("WEBGL_compressed_texture_s3tc"),r!==null){if(i===$s)return r.COMPRESSED_RGB_S3TC_DXT1_EXT;if(i===Ks)return r.COMPRESSED_RGBA_S3TC_DXT1_EXT;if(i===Qs)return r.COMPRESSED_RGBA_S3TC_DXT3_EXT;if(i===js)return r.COMPRESSED_RGBA_S3TC_DXT5_EXT}else return null;if(i===Pa||i===La||i===Na||i===Da)if(r=e.get("WEBGL_compressed_texture_pvrtc"),r!==null){if(i===Pa)return r.COMPRESSED_RGB_PVRTC_4BPPV1_IMG;if(i===La)return r.COMPRESSED_RGB_PVRTC_2BPPV1_IMG;if(i===Na)return r.COMPRESSED_RGBA_PVRTC_4BPPV1_IMG;if(i===Da)return r.COMPRESSED_RGBA_PVRTC_2BPPV1_IMG}else return null;if(i===Ua||i===Fa||i===Oa||i===Ba||i===za||i===tr||i===Ga)if(r=e.get("WEBGL_compressed_texture_etc"),r!==null){if(i===Ua||i===Fa)return a===de?r.COMPRESSED_SRGB8_ETC2:r.COMPRESSED_RGB8_ETC2;if(i===Oa)return a===de?r.COMPRESSED_SRGB8_ALPHA8_ETC2_EAC:r.COMPRESSED_RGBA8_ETC2_EAC;if(i===Ba)return r.COMPRESSED_R11_EAC;if(i===za)return r.COMPRESSED_SIGNED_R11_EAC;if(i===tr)return r.COMPRESSED_RG11_EAC;if(i===Ga)return r.COMPRESSED_SIGNED_RG11_EAC}else return null;if(i===ka||i===Ha||i===Va||i===Wa||i===Xa||i===qa||i===Ya||i===Za||i===Ja||i===$a||i===Ka||i===Qa||i===ja||i===to)if(r=e.get("WEBGL_compressed_texture_astc"),r!==null){if(i===ka)return a===de?r.COMPRESSED_SRGB8_ALPHA8_ASTC_4x4_KHR:r.COMPRESSED_RGBA_ASTC_4x4_KHR;if(i===Ha)return a===de?r.COMPRESSED_SRGB8_ALPHA8_ASTC_5x4_KHR:r.COMPRESSED_RGBA_ASTC_5x4_KHR;if(i===Va)return a===de?r.COMPRESSED_SRGB8_ALPHA8_ASTC_5x5_KHR:r.COMPRESSED_RGBA_ASTC_5x5_KHR;if(i===Wa)return a===de?r.COMPRESSED_SRGB8_ALPHA8_ASTC_6x5_KHR:r.COMPRESSED_RGBA_ASTC_6x5_KHR;if(i===Xa)return a===de?r.COMPRESSED_SRGB8_ALPHA8_ASTC_6x6_KHR:r.COMPRESSED_RGBA_ASTC_6x6_KHR;if(i===qa)return a===de?r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x5_KHR:r.COMPRESSED_RGBA_ASTC_8x5_KHR;if(i===Ya)return a===de?r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x6_KHR:r.COMPRESSED_RGBA_ASTC_8x6_KHR;if(i===Za)return a===de?r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x8_KHR:r.COMPRESSED_RGBA_ASTC_8x8_KHR;if(i===Ja)return a===de?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x5_KHR:r.COMPRESSED_RGBA_ASTC_10x5_KHR;if(i===$a)return a===de?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x6_KHR:r.COMPRESSED_RGBA_ASTC_10x6_KHR;if(i===Ka)return a===de?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x8_KHR:r.COMPRESSED_RGBA_ASTC_10x8_KHR;if(i===Qa)return a===de?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x10_KHR:r.COMPRESSED_RGBA_ASTC_10x10_KHR;if(i===ja)return a===de?r.COMPRESSED_SRGB8_ALPHA8_ASTC_12x10_KHR:r.COMPRESSED_RGBA_ASTC_12x10_KHR;if(i===to)return a===de?r.COMPRESSED_SRGB8_ALPHA8_ASTC_12x12_KHR:r.COMPRESSED_RGBA_ASTC_12x12_KHR}else return null;if(i===eo||i===no||i===io)if(r=e.get("EXT_texture_compression_bptc"),r!==null){if(i===eo)return a===de?r.COMPRESSED_SRGB_ALPHA_BPTC_UNORM_EXT:r.COMPRESSED_RGBA_BPTC_UNORM_EXT;if(i===no)return r.COMPRESSED_RGB_BPTC_SIGNED_FLOAT_EXT;if(i===io)return r.COMPRESSED_RGB_BPTC_UNSIGNED_FLOAT_EXT}else return null;if(i===so||i===ro||i===er||i===ao)if(r=e.get("EXT_texture_compression_rgtc"),r!==null){if(i===so)return r.COMPRESSED_RED_RGTC1_EXT;if(i===ro)return r.COMPRESSED_SIGNED_RED_RGTC1_EXT;if(i===er)return r.COMPRESSED_RED_GREEN_RGTC2_EXT;if(i===ao)return r.COMPRESSED_SIGNED_RED_GREEN_RGTC2_EXT}else return null;if(i===Ci)return t.UNSIGNED_INT_24_8;return t[i]!==void 0?t[i]:null}return{convert:n}}var Ug=`
void main() {

	gl_Position = vec4( position, 1.0 );

}`,Fg=`
uniform sampler2DArray depthColor;
uniform float depthWidth;
uniform float depthHeight;

void main() {

	vec2 coord = vec2( gl_FragCoord.x / depthWidth, gl_FragCoord.y / depthHeight );

	if ( coord.x >= 1.0 ) {

		gl_FragDepth = texture( depthColor, vec3( coord.x - 1.0, coord.y, 1 ) ).r;

	} else {

		gl_FragDepth = texture( depthColor, vec3( coord.x, coord.y, 0 ) ).r;

	}

}`;class Uh{constructor(){this.texture=null,this.mesh=null,this.depthNear=0,this.depthFar=0}init(t,e){if(this.texture===null){let n=new cr(t.texture);if(t.depthNear!==e.depthNear||t.depthFar!==e.depthFar)this.depthNear=t.depthNear,this.depthFar=t.depthFar;this.texture=n}}getMesh(t){if(this.texture!==null){if(this.mesh===null){let e=t.cameras[0].viewport,n=new ke({vertexShader:Ug,fragmentShader:Fg,uniforms:{depthColor:{value:this.texture},depthWidth:{value:e.z},depthHeight:{value:e.w}}});this.mesh=new We(new Ri(20,20),n)}}return this.mesh}reset(){this.texture=null,this.mesh=null}getDepthTexture(){return this.texture}}class Fh extends Sn{constructor(t,e){super();let n=this,i=null,s=1,r=null,a="local-floor",o=1,l=null,c=null,u=null,f=null,h=null,m=null,v=typeof XRWebGLBinding<"u",T=new Uh,p={},d=e.getContextAttributes(),E=null,A=null,x=[],b=[],C=new lt,w=null,g=null,S=new Be;S.viewport=new ge;let O=new Be;O.viewport=new ge;let N=[S,O],F=new Jo,Z=null,I=null;this.cameraAutoUpdate=!0,this.enabled=!1,this.isPresenting=!1,this.getController=function(q){let ot=x[q];if(ot===void 0)ot=new ns,x[q]=ot;return ot.getTargetRaySpace()},this.getControllerGrip=function(q){let ot=x[q];if(ot===void 0)ot=new ns,x[q]=ot;return ot.getGripSpace()},this.getHand=function(q){let ot=x[q];if(ot===void 0)ot=new ns,x[q]=ot;return ot.getHandSpace()};function G(q){let ot=b.indexOf(q.inputSource);if(ot===-1)return;let st=x[ot];if(st!==void 0)st.update(q.inputSource,q.frame,l||r),st.dispatchEvent({type:q.type,data:q.inputSource})}function J(){i.removeEventListener("select",G),i.removeEventListener("selectstart",G),i.removeEventListener("selectend",G),i.removeEventListener("squeeze",G),i.removeEventListener("squeezestart",G),i.removeEventListener("squeezeend",G),i.removeEventListener("end",J),i.removeEventListener("inputsourceschange",k);for(let q=0;q<x.length;q++){let ot=b[q];if(ot===null)continue;b[q]=null,x[q].disconnect(ot)}Z=null,I=null,T.reset();for(let q in p)delete p[q];if(t.setRenderTarget(E),h=null,f=null,u=null,i=null,A=null,Wt.stop(),n.isPresenting=!1,t.setPixelRatio(w),t.setSize(C.width,C.height,!1),g!==null){let q=g.camera;q.fov=g.fov,q.zoom=g.zoom,q.updateProjectionMatrix(),g=null}n.dispatchEvent({type:"sessionend"})}this.setFramebufferScaleFactor=function(q){if(s=q,n.isPresenting===!0)zt("WebXRManager: Cannot change framebuffer scale while presenting.")},this.setReferenceSpaceType=function(q){if(a=q,n.isPresenting===!0)zt("WebXRManager: Cannot change reference space type while presenting.")},this.getReferenceSpace=function(){return l||r},this.setReferenceSpace=function(q){l=q},this.getBaseLayer=function(){return f!==null?f:h},this.getBinding=function(){if(u===null&&v)u=new XRWebGLBinding(i,e);return u},this.getFrame=function(){return m},this.getSession=function(){return i},this.setSession=async function(q){if(i=q,i!==null){if(E=t.getRenderTarget(),i.addEventListener("select",G),i.addEventListener("selectstart",G),i.addEventListener("selectend",G),i.addEventListener("squeeze",G),i.addEventListener("squeezestart",G),i.addEventListener("squeezeend",G),i.addEventListener("end",J),i.addEventListener("inputsourceschange",k),d.xrCompatible!==!0)await e.makeXRCompatible();if(w=t.getPixelRatio(),t.getSize(C),!(v&&("createProjectionLayer"in XRWebGLBinding.prototype))){let st={antialias:d.antialias,alpha:!0,depth:d.depth,stencil:d.stencil,framebufferScaleFactor:s};h=new XRWebGLLayer(i,e,st),i.updateRenderState({baseLayer:h}),t.setPixelRatio(1),t.setSize(h.framebufferWidth,h.framebufferHeight,!1),A=new Ge(h.framebufferWidth,h.framebufferHeight,{format:tn,type:je,colorSpace:t.outputColorSpace,stencilBuffer:d.stencil,resolveDepthBuffer:h.ignoreDepthValues===!1,resolveStencilBuffer:h.ignoreDepthValues===!1,storeMultisampledDepthBuffer:h.ignoreDepthValues===!1,storeMultisampledStencilBuffer:h.ignoreDepthValues===!1})}else{let st=null,Nt=null,Ft=null;if(d.depth)Ft=d.stencil?e.DEPTH24_STENCIL8:e.DEPTH_COMPONENT24,st=d.stencil?qn:Xn,Nt=d.stencil?Ci:Pn;let Et={colorFormat:e.RGBA8,depthFormat:Ft,scaleFactor:s};u=this.getBinding(),f=u.createProjectionLayer(Et),i.updateRenderState({layers:[f]}),t.setPixelRatio(1),t.setSize(f.textureWidth,f.textureHeight,!1),A=new Ge(f.textureWidth,f.textureHeight,{format:tn,type:je,depthTexture:new $n(f.textureWidth,f.textureHeight,Nt,void 0,void 0,void 0,void 0,void 0,void 0,st),stencilBuffer:d.stencil,colorSpace:t.outputColorSpace,samples:d.antialias?4:0,resolveDepthBuffer:f.ignoreDepthValues===!1,resolveStencilBuffer:f.ignoreDepthValues===!1,storeMultisampledDepthBuffer:f.ignoreDepthValues===!1,storeMultisampledStencilBuffer:f.ignoreDepthValues===!1})}A.isXRRenderTarget=!0,this.setFoveation(o),l=null,r=await i.requestReferenceSpace(a),Wt.setContext(i),Wt.start(),n.isPresenting=!0,n.dispatchEvent({type:"sessionstart"})}},this.getEnvironmentBlendMode=function(){if(i!==null)return i.environmentBlendMode},this.getDepthTexture=function(){return T.getDepthTexture()};function k(q){for(let ot=0;ot<q.removed.length;ot++){let st=q.removed[ot],Nt=b.indexOf(st);if(Nt>=0)b[Nt]=null,x[Nt].disconnect(st)}for(let ot=0;ot<q.added.length;ot++){let st=q.added[ot],Nt=b.indexOf(st);if(Nt===-1){for(let Et=0;Et<x.length;Et++)if(Et>=b.length){b.push(st),Nt=Et;break}else if(b[Et]===null){b[Et]=st,Nt=Et;break}if(Nt===-1)break}let Ft=x[Nt];if(Ft)Ft.connect(st)}}let rt=new P,W=new P;function Q(q,ot,st){rt.setFromMatrixPosition(ot.matrixWorld),W.setFromMatrixPosition(st.matrixWorld);let Nt=rt.distanceTo(W),Ft=ot.projectionMatrix.elements,Et=st.projectionMatrix.elements,re=Ft[14]/(Ft[10]-1),j=Ft[14]/(Ft[10]+1),it=(Ft[9]+1)/Ft[5],at=(Ft[9]-1)/Ft[5],ct=(Ft[8]-1)/Ft[0],vt=(Et[8]+1)/Et[0],Rt=re*ct,Dt=re*vt,kt=Nt/(-ct+vt),Ht=kt*-ct;if(ot.matrixWorld.decompose(q.position,q.quaternion,q.scale),q.translateX(Ht),q.translateZ(kt),q.matrixWorld.compose(q.position,q.quaternion,q.scale),q.matrixWorldInverse.copy(q.matrixWorld).invert(),Ft[10]===-1)q.projectionMatrix.copy(ot.projectionMatrix),q.projectionMatrixInverse.copy(ot.projectionMatrixInverse);else{let R=re+kt,oe=j+kt,Yt=Rt-Ht,Jt=Dt+(Nt-Ht),M=it*j/oe*R,_=at*j/oe*R;q.projectionMatrix.makePerspective(Yt,Jt,M,_,R,oe),q.projectionMatrixInverse.copy(q.projectionMatrix).invert()}}function nt(q,ot){if(ot===null)q.matrixWorld.copy(q.matrix);else q.matrixWorld.multiplyMatrices(ot.matrixWorld,q.matrix);q.matrixWorldInverse.copy(q.matrixWorld).invert()}this.updateCamera=function(q){if(i===null)return;let{near:ot,far:st}=q;if(T.texture!==null){if(T.depthNear>0)ot=T.depthNear;if(T.depthFar>0)st=T.depthFar}if(F.near=O.near=S.near=ot,F.far=O.far=S.far=st,Z!==F.near||I!==F.far)i.updateRenderState({depthNear:F.near,depthFar:F.far}),Z=F.near,I=F.far;F.layers.mask=q.layers.mask|6,S.layers.mask=F.layers.mask&-5,O.layers.mask=F.layers.mask&-3;let Nt=q.parent,Ft=F.cameras;nt(F,Nt);for(let Et=0;Et<Ft.length;Et++)nt(Ft[Et],Nt);if(Ft.length===2)Q(F,S,O);else F.projectionMatrix.copy(S.projectionMatrix);if(g===null&&q.isPerspectiveCamera)g={camera:q,fov:q.fov,zoom:q.zoom};Pt(q,F,Nt)};function Pt(q,ot,st){if(st===null)q.matrix.copy(ot.matrixWorld);else q.matrix.copy(st.matrixWorld),q.matrix.invert(),q.matrix.multiply(ot.matrixWorld);if(q.matrix.decompose(q.position,q.quaternion,q.scale),q.updateMatrixWorld(!0),q.projectionMatrix.copy(ot.projectionMatrix),q.projectionMatrixInverse.copy(ot.projectionMatrixInverse),q.isPerspectiveCamera)q.fov=ks*2*Math.atan(1/q.projectionMatrix.elements[5]),q.zoom=1}this.getCamera=function(){return F},this.getFoveation=function(){if(f===null&&h===null)return;return o},this.setFoveation=function(q){if(o=q,f!==null)f.fixedFoveation=q;if(h!==null&&h.fixedFoveation!==void 0)h.fixedFoveation=q},this.hasDepthSensing=function(){return T.texture!==null},this.getDepthSensingMesh=function(){return T.getMesh(F)},this.getCameraTexture=function(q){return p[q]};let Lt=null;function se(q,ot){if(c=ot.getViewerPose(l||r),m=ot,c!==null){let st=c.views;if(h!==null)t.setRenderTargetFramebuffer(A,h.framebuffer),t.setRenderTarget(A);let Nt=!1;if(st.length!==F.cameras.length)F.cameras.length=0,Nt=!0;for(let j=0;j<st.length;j++){let it=st[j],at=null;if(h!==null)at=h.getViewport(it);else{let vt=u.getViewSubImage(f,it);if(at=vt.viewport,j===0)t.setRenderTargetTextures(A,vt.colorTexture,vt.depthStencilTexture),t.setRenderTarget(A)}let ct=N[j];if(ct===void 0)ct=new Be,ct.layers.enable(j),ct.viewport=new ge,N[j]=ct;if(ct.matrix.fromArray(it.transform.matrix),ct.matrix.decompose(ct.position,ct.quaternion,ct.scale),ct.projectionMatrix.fromArray(it.projectionMatrix),ct.projectionMatrixInverse.copy(ct.projectionMatrix).invert(),ct.viewport.set(at.x,at.y,at.width,at.height),j===0)F.matrix.copy(ct.matrix),F.matrix.decompose(F.position,F.quaternion,F.scale);if(Nt===!0)F.cameras.push(ct)}let Ft=i.enabledFeatures;if(Ft&&Ft.includes("depth-sensing")&&i.depthUsage=="gpu-optimized"&&v){u=n.getBinding();let j=u.getDepthInformation(st[0]);if(j&&j.isValid&&j.texture)T.init(j,i.renderState)}if(Ft&&Ft.includes("camera-access")&&v){t.state.unbindTexture(),u=n.getBinding();for(let j=0;j<st.length;j++){let it=st[j].camera;if(it){let at=p[it];if(!at)at=new cr,p[it]=at;let ct=u.getCameraImage(it);at.sourceTexture=ct}}}}for(let st=0;st<x.length;st++){let Nt=b[st],Ft=x[st];if(Nt!==null&&Ft!==void 0)Ft.update(Nt,ot,l||r)}if(Lt)Lt(q,ot);if(ot.detectedPlanes)n.dispatchEvent({type:"planesdetected",data:ot});m=null}let Wt=new Th;Wt.setAnimationLoop(se),this.setAnimationLoop=function(q){Lt=q},this.dispose=function(){}}}var Og=new ue,Oh=new Gt;Oh.set(-1,0,0,0,1,0,0,0,1);function Bg(t,e){function n(p,d){if(p.matrixAutoUpdate===!0)p.updateMatrix();d.value.copy(p.matrix)}function i(p,d){if(d.color.getRGB(p.fogColor.value,Ro(t)),d.isFog)p.fogNear.value=d.near,p.fogFar.value=d.far;else if(d.isFogExp2)p.fogDensity.value=d.density}function s(p,d,E,A,x){if(d.isNodeMaterial)d.uniformsNeedUpdate=!1;else if(d.isMeshBasicMaterial)r(p,d);else if(d.isMeshLambertMaterial){if(r(p,d),d.envMap)p.envMapIntensity.value=d.envMapIntensity}else if(d.isMeshToonMaterial)r(p,d),f(p,d);else if(d.isMeshPhongMaterial){if(r(p,d),u(p,d),d.envMap)p.envMapIntensity.value=d.envMapIntensity}else if(d.isMeshStandardMaterial){if(r(p,d),h(p,d),d.isMeshPhysicalMaterial)m(p,d,x)}else if(d.isMeshMatcapMaterial)r(p,d),v(p,d);else if(d.isMeshDepthMaterial)r(p,d);else if(d.isMeshDistanceMaterial)r(p,d),T(p,d);else if(d.isMeshNormalMaterial)r(p,d);else if(d.isLineBasicMaterial){if(a(p,d),d.isLineDashedMaterial)o(p,d)}else if(d.isPointsMaterial)l(p,d,E,A);else if(d.isSpriteMaterial)c(p,d);else if(d.isShadowMaterial)p.color.value.copy(d.color),p.opacity.value=d.opacity;else if(d.isShaderMaterial)d.uniformsNeedUpdate=!1}function r(p,d){if(p.opacity.value=d.opacity,d.color)p.diffuse.value.copy(d.color);if(d.emissive)p.emissive.value.copy(d.emissive).multiplyScalar(d.emissiveIntensity);if(d.map)p.map.value=d.map,n(d.map,p.mapTransform);if(d.alphaMap)p.alphaMap.value=d.alphaMap,n(d.alphaMap,p.alphaMapTransform);if(d.bumpMap){if(p.bumpMap.value=d.bumpMap,n(d.bumpMap,p.bumpMapTransform),p.bumpScale.value=d.bumpScale,d.side===Ne)p.bumpScale.value*=-1}if(d.normalMap){if(p.normalMap.value=d.normalMap,n(d.normalMap,p.normalMapTransform),p.normalScale.value.copy(d.normalScale),d.side===Ne)p.normalScale.value.negate()}if(d.displacementMap)p.displacementMap.value=d.displacementMap,n(d.displacementMap,p.displacementMapTransform),p.displacementScale.value=d.displacementScale,p.displacementBias.value=d.displacementBias;if(d.emissiveMap)p.emissiveMap.value=d.emissiveMap,n(d.emissiveMap,p.emissiveMapTransform);if(d.specularMap)p.specularMap.value=d.specularMap,n(d.specularMap,p.specularMapTransform);if(d.alphaTest>0)p.alphaTest.value=d.alphaTest;let E=e.get(d),{envMap:A,envMapRotation:x}=E;if(A){if(p.envMap.value=A,p.envMapRotation.value.setFromMatrix4(Og.makeRotationFromEuler(x)).transpose(),A.isCubeTexture&&A.isRenderTargetTexture===!1)p.envMapRotation.value.premultiply(Oh);p.reflectivity.value=d.reflectivity,p.ior.value=d.ior,p.refractionRatio.value=d.refractionRatio}if(d.lightMap)p.lightMap.value=d.lightMap,p.lightMapIntensity.value=d.lightMapIntensity,n(d.lightMap,p.lightMapTransform);if(d.aoMap)p.aoMap.value=d.aoMap,p.aoMapIntensity.value=d.aoMapIntensity,n(d.aoMap,p.aoMapTransform)}function a(p,d){if(p.diffuse.value.copy(d.color),p.opacity.value=d.opacity,d.map)p.map.value=d.map,n(d.map,p.mapTransform)}function o(p,d){p.dashSize.value=d.dashSize,p.totalSize.value=d.dashSize+d.gapSize,p.scale.value=d.scale}function l(p,d,E,A){if(p.diffuse.value.copy(d.color),p.opacity.value=d.opacity,p.size.value=d.size*E,p.scale.value=A*0.5,d.map)p.map.value=d.map,n(d.map,p.uvTransform);if(d.alphaMap)p.alphaMap.value=d.alphaMap,n(d.alphaMap,p.alphaMapTransform);if(d.alphaTest>0)p.alphaTest.value=d.alphaTest}function c(p,d){if(p.diffuse.value.copy(d.color),p.opacity.value=d.opacity,p.rotation.value=d.rotation,d.map)p.map.value=d.map,n(d.map,p.mapTransform);if(d.alphaMap)p.alphaMap.value=d.alphaMap,n(d.alphaMap,p.alphaMapTransform);if(d.alphaTest>0)p.alphaTest.value=d.alphaTest}function u(p,d){p.specular.value.copy(d.specular),p.shininess.value=Math.max(d.shininess,0.0001)}function f(p,d){if(d.gradientMap)p.gradientMap.value=d.gradientMap}function h(p,d){if(p.metalness.value=d.metalness,d.metalnessMap)p.metalnessMap.value=d.metalnessMap,n(d.metalnessMap,p.metalnessMapTransform);if(p.roughness.value=d.roughness,d.roughnessMap)p.roughnessMap.value=d.roughnessMap,n(d.roughnessMap,p.roughnessMapTransform);if(d.envMap)p.envMapIntensity.value=d.envMapIntensity}function m(p,d,E){if(p.ior.value=d.ior,d.sheen>0){if(p.sheenColor.value.copy(d.sheenColor).multiplyScalar(d.sheen),p.sheenRoughness.value=d.sheenRoughness,d.sheenColorMap)p.sheenColorMap.value=d.sheenColorMap,n(d.sheenColorMap,p.sheenColorMapTransform);if(d.sheenRoughnessMap)p.sheenRoughnessMap.value=d.sheenRoughnessMap,n(d.sheenRoughnessMap,p.sheenRoughnessMapTransform)}if(d.clearcoat>0){if(p.clearcoat.value=d.clearcoat,p.clearcoatRoughness.value=d.clearcoatRoughness,d.clearcoatMap)p.clearcoatMap.value=d.clearcoatMap,n(d.clearcoatMap,p.clearcoatMapTransform);if(d.clearcoatRoughnessMap)p.clearcoatRoughnessMap.value=d.clearcoatRoughnessMap,n(d.clearcoatRoughnessMap,p.clearcoatRoughnessMapTransform);if(d.clearcoatNormalMap){if(p.clearcoatNormalMap.value=d.clearcoatNormalMap,n(d.clearcoatNormalMap,p.clearcoatNormalMapTransform),p.clearcoatNormalScale.value.copy(d.clearcoatNormalScale),d.side===Ne)p.clearcoatNormalScale.value.negate()}}if(d.dispersion>0)p.dispersion.value=d.dispersion;if(d.retroreflectivity>0)p.retroreflectivity.value=d.retroreflectivity;if(d.iridescence>0){if(p.iridescence.value=d.iridescence,p.iridescenceIOR.value=d.iridescenceIOR,p.iridescenceThicknessMinimum.value=d.iridescenceThicknessRange[0],p.iridescenceThicknessMaximum.value=d.iridescenceThicknessRange[1],d.iridescenceMap)p.iridescenceMap.value=d.iridescenceMap,n(d.iridescenceMap,p.iridescenceMapTransform);if(d.iridescenceThicknessMap)p.iridescenceThicknessMap.value=d.iridescenceThicknessMap,n(d.iridescenceThicknessMap,p.iridescenceThicknessMapTransform)}if(d.transmission>0){if(p.transmission.value=d.transmission,p.transmissionSamplerMap.value=E.texture,p.transmissionSamplerSize.value.set(E.width,E.height),d.transmissionMap)p.transmissionMap.value=d.transmissionMap,n(d.transmissionMap,p.transmissionMapTransform);if(p.thickness.value=d.thickness,d.thicknessMap)p.thicknessMap.value=d.thicknessMap,n(d.thicknessMap,p.thicknessMapTransform);p.attenuationDistance.value=d.attenuationDistance,p.attenuationColor.value.copy(d.attenuationColor)}if(d.anisotropy>0){if(p.anisotropyVector.value.set(d.anisotropy*Math.cos(d.anisotropyRotation),d.anisotropy*Math.sin(d.anisotropyRotation)),d.anisotropyMap)p.anisotropyMap.value=d.anisotropyMap,n(d.anisotropyMap,p.anisotropyMapTransform)}if(p.specularIntensity.value=d.specularIntensity,p.specularColor.value.copy(d.specularColor),d.specularColorMap)p.specularColorMap.value=d.specularColorMap,n(d.specularColorMap,p.specularColorMapTransform);if(d.specularIntensityMap)p.specularIntensityMap.value=d.specularIntensityMap,n(d.specularIntensityMap,p.specularIntensityMapTransform)}function v(p,d){if(d.matcap)p.matcap.value=d.matcap}function T(p,d){let E=e.get(d).light;p.referencePosition.value.setFromMatrixPosition(E.matrixWorld),p.nearDistance.value=E.shadow.camera.near,p.farDistance.value=E.shadow.camera.far}return{refreshFogUniforms:i,refreshMaterialUniforms:s}}function zg(t,e,n,i){let s={},r={},a=[],o=t.getParameter(t.MAX_UNIFORM_BUFFER_BINDINGS);function l(x,b){let C=b.program;i.uniformBlockBinding(x,C)}function c(x,b){let C=s[x.id];if(C===void 0)p(x),C=u(x),s[x.id]=C,x.addEventListener("dispose",E);let w=b.program;i.updateUBOMapping(x,w);let g=e.render.frame;if(r[x.id]!==g)h(x),r[x.id]=g}function u(x){let b=f();x.__bindingPointIndex=b;let C=t.createBuffer(),{__size:w,usage:g}=x;return t.bindBuffer(t.UNIFORM_BUFFER,C),t.bufferData(t.UNIFORM_BUFFER,w,g),t.bindBuffer(t.UNIFORM_BUFFER,null),t.bindBufferBase(t.UNIFORM_BUFFER,b,C),C}function f(){for(let x=0;x<o;x++)if(a.indexOf(x)===-1)return a.push(x),x;return Bt("WebGLRenderer: Maximum number of simultaneously usable uniforms groups reached."),0}function h(x){let b=s[x.id],{uniforms:C,__cache:w}=x;t.bindBuffer(t.UNIFORM_BUFFER,b);for(let g=0,S=C.length;g<S;g++){let O=C[g];if(Array.isArray(O))for(let N=0,F=O.length;N<F;N++)m(O[N],g,N,w);else m(O,g,0,w)}t.bindBuffer(t.UNIFORM_BUFFER,null)}function m(x,b,C,w){if(T(x,b,C,w)===!0){let{__offset:g,value:S}=x;if(Array.isArray(S)){let O=0;for(let N=0;N<S.length;N++){let F=S[N],Z=d(F);if(v(F,x.__data,O),typeof F!=="number"&&typeof F!=="boolean"&&!F.isMatrix3&&!ArrayBuffer.isView(F))O+=Z.storage/Float32Array.BYTES_PER_ELEMENT}}else v(S,x.__data,0);t.bufferSubData(t.UNIFORM_BUFFER,g,x.__data)}}function v(x,b,C){if(typeof x==="number"||typeof x==="boolean")b[0]=x;else if(x.isMatrix3)b[0]=x.elements[0],b[1]=x.elements[1],b[2]=x.elements[2],b[3]=0,b[4]=x.elements[3],b[5]=x.elements[4],b[6]=x.elements[5],b[7]=0,b[8]=x.elements[6],b[9]=x.elements[7],b[10]=x.elements[8],b[11]=0;else if(ArrayBuffer.isView(x))b.set(new x.constructor(x.buffer,x.byteOffset,b.length));else x.toArray(b,C)}function T(x,b,C,w){let g=x.value,S=b+"_"+C;if(w[S]===void 0){if(typeof g==="number"||typeof g==="boolean")w[S]=g;else if(ArrayBuffer.isView(g))w[S]=g.slice();else w[S]=g.clone();return!0}else{let O=w[S];if(typeof g==="number"||typeof g==="boolean"){if(O!==g)return w[S]=g,!0}else if(ArrayBuffer.isView(g))return!0;else if(O.equals(g)===!1)return O.copy(g),!0}return!1}function p(x){let b=x.uniforms,C=0,w=16;for(let S=0,O=b.length;S<O;S++){let N=Array.isArray(b[S])?b[S]:[b[S]];for(let F=0,Z=N.length;F<Z;F++){let I=N[F],G=Array.isArray(I.value)?I.value:[I.value];for(let J=0,k=G.length;J<k;J++){let rt=G[J],W=d(rt),Q=C%w,nt=Q%W.boundary,Pt=Q+nt;if(C+=nt,Pt!==0&&w-Pt<W.storage)C+=w-Pt;I.__data=new Float32Array(W.storage/Float32Array.BYTES_PER_ELEMENT),I.__offset=C,C+=W.storage}}}let g=C%w;if(g>0)C+=w-g;return x.__size=C,x.__cache={},this}function d(x){let b={boundary:0,storage:0};if(typeof x==="number"||typeof x==="boolean")b.boundary=4,b.storage=4;else if(x.isVector2)b.boundary=8,b.storage=8;else if(x.isVector3||x.isColor)b.boundary=16,b.storage=12;else if(x.isVector4)b.boundary=16,b.storage=16;else if(x.isMatrix3)b.boundary=48,b.storage=48;else if(x.isMatrix4)b.boundary=64,b.storage=64;else if(x.isTexture)zt("WebGLRenderer: Texture samplers can not be part of an uniforms group.");else if(ArrayBuffer.isView(x))b.boundary=16,b.storage=x.byteLength;else zt("WebGLRenderer: Unsupported uniform value type.",x);return b}function E(x){let b=x.target;b.removeEventListener("dispose",E);let C=a.indexOf(b.__bindingPointIndex);a.splice(C,1),t.deleteBuffer(s[b.id]),delete s[b.id],delete r[b.id]}function A(){for(let x in s)t.deleteBuffer(s[x]);a=[],s={},r={}}return{bind:l,update:c,dispose:A}}var Gg=new Uint16Array([12469,15057,12620,14925,13266,14620,13807,14376,14323,13990,14545,13625,14713,13328,14840,12882,14931,12528,14996,12233,15039,11829,15066,11525,15080,11295,15085,10976,15082,10705,15073,10495,13880,14564,13898,14542,13977,14430,14158,14124,14393,13732,14556,13410,14702,12996,14814,12596,14891,12291,14937,11834,14957,11489,14958,11194,14943,10803,14921,10506,14893,10278,14858,9960,14484,14039,14487,14025,14499,13941,14524,13740,14574,13468,14654,13106,14743,12678,14818,12344,14867,11893,14889,11509,14893,11180,14881,10751,14852,10428,14812,10128,14765,9754,14712,9466,14764,13480,14764,13475,14766,13440,14766,13347,14769,13070,14786,12713,14816,12387,14844,11957,14860,11549,14868,11215,14855,10751,14825,10403,14782,10044,14729,9651,14666,9352,14599,9029,14967,12835,14966,12831,14963,12804,14954,12723,14936,12564,14917,12347,14900,11958,14886,11569,14878,11247,14859,10765,14828,10401,14784,10011,14727,9600,14660,9289,14586,8893,14508,8533,15111,12234,15110,12234,15104,12216,15092,12156,15067,12010,15028,11776,14981,11500,14942,11205,14902,10752,14861,10393,14812,9991,14752,9570,14682,9252,14603,8808,14519,8445,14431,8145,15209,11449,15208,11451,15202,11451,15190,11438,15163,11384,15117,11274,15055,10979,14994,10648,14932,10343,14871,9936,14803,9532,14729,9218,14645,8742,14556,8381,14461,8020,14365,7603,15273,10603,15272,10607,15267,10619,15256,10631,15231,10614,15182,10535,15118,10389,15042,10167,14963,9787,14883,9447,14800,9115,14710,8665,14615,8318,14514,7911,14411,7507,14279,7198,15314,9675,15313,9683,15309,9712,15298,9759,15277,9797,15229,9773,15166,9668,15084,9487,14995,9274,14898,8910,14800,8539,14697,8234,14590,7790,14479,7409,14367,7067,14178,6621,15337,8619,15337,8631,15333,8677,15325,8769,15305,8871,15264,8940,15202,8909,15119,8775,15022,8565,14916,8328,14804,8009,14688,7614,14569,7287,14448,6888,14321,6483,14088,6171,15350,7402,15350,7419,15347,7480,15340,7613,15322,7804,15287,7973,15229,8057,15148,8012,15046,7846,14933,7611,14810,7357,14682,7069,14552,6656,14421,6316,14251,5948,14007,5528,15356,5942,15356,5977,15353,6119,15348,6294,15332,6551,15302,6824,15249,7044,15171,7122,15070,7050,14949,6861,14818,6611,14679,6349,14538,6067,14398,5651,14189,5311,13935,4958,15359,4123,15359,4153,15356,4296,15353,4646,15338,5160,15311,5508,15263,5829,15188,6042,15088,6094,14966,6001,14826,5796,14678,5543,14527,5287,14377,4985,14133,4586,13869,4257,15360,1563,15360,1642,15358,2076,15354,2636,15341,3350,15317,4019,15273,4429,15203,4732,15105,4911,14981,4932,14836,4818,14679,4621,14517,4386,14359,4156,14083,3795,13808,3437,15360,122,15360,137,15358,285,15355,636,15344,1274,15322,2177,15281,2765,15215,3223,15120,3451,14995,3569,14846,3567,14681,3466,14511,3305,14344,3121,14037,2800,13753,2467,15360,0,15360,1,15359,21,15355,89,15346,253,15325,479,15287,796,15225,1148,15133,1492,15008,1749,14856,1882,14685,1886,14506,1783,14324,1608,13996,1398,13702,1183]),hn=null;function kg(){if(hn===null)hn=new or(Gg,16,16,Yn,ln),hn.name="DFG_LUT",hn.minFilter=De,hn.magFilter=De,hn.wrapS=Zs,hn.wrapT=Zs,hn.generateMipmaps=!1,hn.needsUpdate=!0;return hn}class Bh{constructor(t={}){let{canvas:e=kc(),context:n=null,depth:i=!0,stencil:s=!1,alpha:r=!1,antialias:a=!1,premultipliedAlpha:o=!0,preserveDrawingBuffer:l=!1,powerPreference:c="default",failIfMajorPerformanceCaveat:u=!1,reversedDepthBuffer:f=!1,outputBufferType:h=je}=t;this.isWebGLRenderer=!0;let m;if(n!==null){if(typeof WebGLRenderingContext<"u"&&n instanceof WebGLRenderingContext)throw Error("THREE.WebGLRenderer: WebGL 1 is not supported since r163.");m=n.getContextAttributes().alpha}else m=r;let v=h,T=new Set([Ia,Ra,Ca]),p=new Set([je,Pn,ts,Ci,Aa,wa]),d=new Uint32Array(4),E=new Int32Array(4),A=new P,x=null,b=null,C=[],w=[],g=null;this.domElement=e,this.debug={checkShaderErrors:!0,diagnostics:{keywords:!1},onShaderError:null},this.autoClear=!0,this.autoClearColor=!0,this.autoClearDepth=!0,this.autoClearStencil=!0,this.sortObjects=!0,this.clippingPlanes=[],this.localClippingEnabled=!1,this.toneMapping=Qe,this.toneMappingExposure=1,this.transmissionResolutionScale=1;let S=this,O=!1,N=null,F=null,Z=null,I=null;this._outputColorSpace=lo;let G=0,J=0,k=null,rt=-1,W=null,Q=new ge,nt=new ge,Pt=null,Lt=new Zt(0),se=0,{width:Wt,height:q}=e,ot=1,st=null,Nt=null,Ft=new ge(0,0,Wt,q),Et=new ge(0,0,Wt,q),re=!1,j=new os,it=!1,at=!1,ct=new ue,vt=new P,Rt=new ge,Dt={background:null,fog:null,environment:null,overrideMaterial:null,isScene:!0},kt=!1;function Ht(){return k===null?ot:1}let R=n;function oe(y,D){return e.getContext(y,D)}let Yt,Jt,M,_,L,H,tt,ht,dt,X,K,St,It,mt,ut,Ut,Ot,ee,U,ft,Y,pt,Mt;try{let y={alpha:!0,depth:i,stencil:s,antialias:a,premultipliedAlpha:o,preserveDrawingBuffer:l,powerPreference:c,failIfMajorPerformanceCaveat:u};if("setAttribute"in e)e.setAttribute("data-engine",`three.js r${ha}`);if(e.addEventListener("webglcontextlost",Vt,!1),e.addEventListener("webglcontextrestored",fe,!1),e.addEventListener("webglcontextcreationerror",ne,!1),R===null){if(R=oe("webgl2",y),R===null)if(oe("webgl2"))throw Error("THREE.WebGLRenderer: Error creating WebGL context with your selected attributes.");else throw Error("THREE.WebGLRenderer: Error creating WebGL context.")}et()}catch(y){throw e.removeEventListener("webglcontextlost",Vt,!1),e.removeEventListener("webglcontextrestored",fe,!1),e.removeEventListener("webglcontextcreationerror",ne,!1),Bt("WebGLRenderer: "+y.message),y}function et(){if(Yt=new Zp(R),Yt.init(),Y=new Dg(R,Yt),Jt=new Bp(R,Yt,t,Y),M=new Lg(R,Yt),Jt.reversedDepthBuffer&&f)M.buffers.depth.setReversed(!0);F=R.createFramebuffer(),Z=R.createFramebuffer(),I=R.createFramebuffer(),_=new Kp(R),L=new xg,H=new Ng(R,Yt,M,L,Jt,Y,_),tt=new Yp(S),ht=new Qu(R),pt=new Fp(R,ht),dt=new Jp(R,ht,_,pt),X=new jp(R,dt,ht,pt,_),ee=new Qp(R,Jt,H),ut=new zp(L),K=new _g(S,tt,Yt,Jt,pt,ut),St=new Bg(S,L),It=new yg,mt=new Ag(Yt),Ot=new Up(S,tt,M,X,m,o),Ut=new Pg(S,X,Jt),Mt=new zg(R,_,Jt,M),U=new Op(R,Yt,_),ft=new $p(R,Yt,_),_.programs=K.programs,S.capabilities=Jt,S.extensions=Yt,S.properties=L,S.renderLists=It,S.shadowMap=Ut,S.state=M,S.info=_}if(v!==je)g=new em(v,e.width,e.height,a,i,s);let _t=new Fh(S,R);this.xr=_t,this.getContext=function(){return R},this.getContextAttributes=function(){return R.getContextAttributes()},this.forceContextLoss=function(){let y=Yt.get("WEBGL_lose_context");if(y)y.loseContext()},this.forceContextRestore=function(){let y=Yt.get("WEBGL_lose_context");if(y)y.restoreContext()},this.getPixelRatio=function(){return ot},this.setPixelRatio=function(y){if(y===void 0)return;ot=y,this.setSize(Wt,q,!1)},this.getSize=function(y){return y.set(Wt,q)},this.setSize=function(y,D,V=!0){if(_t.isPresenting){zt("WebGLRenderer: Can't change size while VR device is presenting.");return}if(Wt=y,q=D,e.width=Math.floor(y*ot),e.height=Math.floor(D*ot),V===!0)e.style.width=y+"px",e.style.height=D+"px";if(g!==null)g.setSize(e.width,e.height);this.setViewport(0,0,y,D)},this.getDrawingBufferSize=function(y){return y.set(Wt*ot,q*ot).floor()},this.setDrawingBufferSize=function(y,D,V){Wt=y,q=D,ot=V,e.width=Math.floor(y*V),e.height=Math.floor(D*V),this.setViewport(0,0,y,D)},this.setEffects=function(y){if(v===je){Bt("WebGLRenderer: setEffects() requires outputBufferType set to HalfFloatType or FloatType.");return}if(y){for(let D=0;D<y.length;D++)if(y[D].isOutputPass===!0){zt("WebGLRenderer: OutputPass is not needed in setEffects(). Tone mapping and color space conversion are applied automatically.");break}}g.setEffects(y||[])},this.getCurrentViewport=function(y){return y.copy(Q)},this.getViewport=function(y){return y.copy(Ft)},this.setViewport=function(y,D,V,B){if(y.isVector4)Ft.set(y.x,y.y,y.z,y.w);else Ft.set(y,D,V,B);M.viewport(Q.copy(Ft).multiplyScalar(ot).round())},this.getScissor=function(y){return y.copy(Et)},this.setScissor=function(y,D,V,B){if(y.isVector4)Et.set(y.x,y.y,y.z,y.w);else Et.set(y,D,V,B);M.scissor(nt.copy(Et).multiplyScalar(ot).round())},this.getScissorTest=function(){return re},this.setScissorTest=function(y){M.setScissorTest(re=y)},this.setOpaqueSort=function(y){st=y},this.setTransparentSort=function(y){Nt=y},this.getClearColor=function(y){return y.copy(Ot.getClearColor())},this.setClearColor=function(){Ot.setClearColor(...arguments)},this.getClearAlpha=function(){return Ot.getClearAlpha()},this.setClearAlpha=function(){Ot.setClearAlpha(...arguments)},this.clear=function(y=!0,D=!0,V=!0){let B=0;if(y){let z=!1;if(k!==null){let yt=k.texture.format;z=T.has(yt)}if(z){let yt=k.texture.type,Tt=p.has(yt),xt=Ot.getClearColor(),At=Ot.getClearAlpha(),{r:Ct,g:Xt,b:$t}=xt;if(Tt)d[0]=Ct,d[1]=Xt,d[2]=$t,d[3]=At,R.clearBufferuiv(R.COLOR,0,d);else E[0]=Ct,E[1]=Xt,E[2]=$t,E[3]=At,R.clearBufferiv(R.COLOR,0,E)}else B|=R.COLOR_BUFFER_BIT}if(D)B|=R.DEPTH_BUFFER_BIT,this.state.buffers.depth.setMask(!0);if(V)B|=R.STENCIL_BUFFER_BIT,this.state.buffers.stencil.setMask(4294967295);if(B!==0)R.clear(B)},this.clearColor=function(){this.clear(!0,!1,!1)},this.clearDepth=function(){this.clear(!1,!0,!1)},this.clearStencil=function(){this.clear(!1,!1,!0)},this.setNodesHandler=function(y){y.setRenderer(this),N=y},this.dispose=function(){e.removeEventListener("webglcontextlost",Vt,!1),e.removeEventListener("webglcontextrestored",fe,!1),e.removeEventListener("webglcontextcreationerror",ne,!1),Ot.dispose(),It.dispose(),mt.dispose(),L.dispose(),tt.dispose(),X.dispose(),pt.dispose(),Mt.dispose(),K.dispose(),_t.dispose(),_t.removeEventListener("sessionstart",hl),_t.removeEventListener("sessionend",ul),Nn.stop()};function Vt(y){y.preventDefault(),Xi("WebGLRenderer: Context Lost."),O=!0}function fe(){Xi("WebGLRenderer: Context Restored."),O=!1;let y=_.autoReset,D=Ut.enabled,V=Ut.autoUpdate,B=Ut.needsUpdate,z=Ut.type;et(),_.autoReset=y,Ut.enabled=D,Ut.autoUpdate=V,Ut.needsUpdate=B,Ut.type=z}function ne(y){Bt("WebGLRenderer: A WebGL context could not be created. Reason: ",y.statusMessage)}function en(y){let D=y.target;D.removeEventListener("dispose",en),dn(D)}function dn(y){zh(y),L.remove(y)}function zh(y){let D=L.get(y).programs;if(D!==void 0){if(D.forEach(function(V){K.releaseProgram(V)}),y.isShaderMaterial)K.releaseShaderCache(y)}}this.renderBufferDirect=function(y,D,V,B,z,yt){if(D===null)D=Dt;let Tt=z.isMesh&&z.matrixWorld.determinantAffine()<0,xt=Hh(y,D,V,B,z);M.setMaterial(B,Tt);let At=V.index,Ct=1;if(B.wireframe===!0){if(At=dt.getWireframeAttribute(V),At===void 0)return;Ct=2}let Xt=V.drawRange,$t=V.attributes.position,wt=Xt.start*Ct,ie=(Xt.start+Xt.count)*Ct;if(yt!==null)wt=Math.max(wt,yt.start*Ct),ie=Math.min(ie,(yt.start+yt.count)*Ct);if(At!==null)wt=Math.max(wt,0),ie=Math.min(ie,At.count);else if($t!==void 0&&$t!==null)wt=Math.max(wt,0),ie=Math.min(ie,$t.count);let ye=ie-wt;if(ye<0||ye===1/0)return;pt.setup(z,B,xt,V,At);let me,he=U;if(At!==null)me=ht.get(At),he=ft,he.setIndex(me);if(z.isMesh)if(B.wireframe===!0)M.setLineWidth(B.wireframeLinewidth*Ht()),he.setMode(R.LINES);else he.setMode(R.TRIANGLES);else if(z.isLine){let we=B.linewidth;if(we===void 0)we=1;if(M.setLineWidth(we*Ht()),z.isLineSegments)he.setMode(R.LINES);else if(z.isLineLoop)he.setMode(R.LINE_LOOP);else he.setMode(R.LINE_STRIP)}else if(z.isPoints)he.setMode(R.POINTS);else if(z.isSprite)he.setMode(R.TRIANGLES);if(z.isBatchedMesh)if(!Yt.get("WEBGL_multi_draw")){let{_multiDrawStarts:we,_multiDrawCounts:bt,_multiDrawCount:Pe}=z,te=At?ht.get(At).bytesPerElement:1,He=L.get(B).currentProgram.getUniforms();for(let nn=0;nn<Pe;nn++)He.setValue(R,"_gl_DrawID",nn),he.render(we[nn]/te,bt[nn])}else he.renderMultiDraw(z._multiDrawStarts,z._multiDrawCounts,z._multiDrawCount);else if(z.isInstancedMesh)he.renderInstances(wt,ye,z.count);else if(V.isInstancedBufferGeometry){let we=V._maxInstanceCount!==void 0?V._maxInstanceCount:1/0,bt=Math.min(V.instanceCount,we);he.renderInstances(wt,ye,bt)}else he.render(wt,ye)};function cl(y,D,V,B){if(N!==null&&y.isNodeMaterial)N.setObject(B,y);if(it===!0)ut.setState(y,V,!1);if(y.transparent===!0&&y.side===$e&&y.forceSinglePass===!1)y.side=Ne,y.needsUpdate=!0,gs(y,D,B),y.side=Ai,y.needsUpdate=!0,gs(y,D,B),y.side=$e;else gs(y,D,B)}this.compile=function(y,D,V=null){if(V===null)V=y;if(N!==null)N.renderStart(y,D,V);if(b=mt.get(V),b.init(D),w.push(b),V.traverseVisible(function(z){if(z.isLight&&z.layers.test(D.layers)){if(b.pushLight(z),z.castShadow)b.pushShadow(z)}}),y!==V)y.traverseVisible(function(z){if(z.isLight&&z.layers.test(D.layers)){if(b.pushLight(z),z.castShadow)b.pushShadow(z)}});if(b.setupLights(),N!==null)N.updateLights(b.state.lightsArray);if(at=this.localClippingEnabled,it=ut.init(this.clippingPlanes,at),it===!0)ut.setGlobalState(this.clippingPlanes,D);if(N!==null)Ut.render(b.state.shadowsArray,V,D);let B=new Set;if(y.traverse(function(z){if(!(z.isMesh||z.isPoints||z.isLine||z.isSprite))return;let yt=z.material;if(yt)if(Array.isArray(yt))for(let Tt=0;Tt<yt.length;Tt++){let xt=yt[Tt];cl(xt,V,D,z),B.add(xt)}else cl(yt,V,D,z),B.add(yt)}),b=w.pop(),N!==null)N.renderEnd();return B},this.compileAsync=function(y,D,V=null){let B=this.compile(y,D,V);return new Promise((z)=>{function yt(){if(B.forEach(function(Tt){let At=L.get(Tt).currentProgram;if(At===void 0||At.isReady())B.delete(Tt)}),B.size===0){z(y);return}setTimeout(yt,10)}if(Yt.get("KHR_parallel_shader_compile")!==null)yt();else setTimeout(yt,10)})};let Nr=null;function Gh(y){if(Nr)Nr(y)}function hl(){Nn.stop()}function ul(){Nn.start()}let Nn=new Th;if(Nn.setAnimationLoop(Gh),typeof self<"u")Nn.setContext(self);this.setAnimationLoop=function(y){Nr=y,_t.setAnimationLoop(y),y===null?Nn.stop():Nn.start()},_t.addEventListener("sessionstart",hl),_t.addEventListener("sessionend",ul),this.render=function(y,D){if(D!==void 0&&D.isCamera!==!0){Bt("WebGLRenderer.render: camera is not an instance of THREE.Camera.");return}if(O===!0)return;if(N!==null)N.renderStart(y,D);let V=_t.enabled===!0&&_t.isPresenting===!0,B=g!==null&&(k===null||V)&&g.begin(S,k);if(y.matrixWorldAutoUpdate===!0)y.updateMatrixWorld();if(D.parent===null&&D.matrixWorldAutoUpdate===!0)D.updateMatrixWorld();if(_t.enabled===!0&&_t.isPresenting===!0&&(g===null||g.isCompositing()===!1)){if(_t.cameraAutoUpdate===!0)_t.updateCamera(D);D=_t.getCamera()}if(y.isScene===!0)y.onBeforeRender(S,y,D,k);if(b=mt.get(y,w.length),b.init(D),b.state.textureUnits=H.getTextureUnits(),w.push(b),ct.multiplyMatrices(D.projectionMatrix,D.matrixWorldInverse),j.setFromProjectionMatrix(ct,fo,D.reversedDepth),at=this.localClippingEnabled,it=ut.init(this.clippingPlanes,at),x=It.get(y,C.length),x.init(),C.push(x),_t.enabled===!0&&_t.isPresenting===!0){let Tt=S.xr.getDepthSensingMesh();if(Tt!==null)Dr(Tt,D,-1/0,S.sortObjects)}if(Dr(y,D,0,S.sortObjects),x.finish(),N!==null)N.updateLights(b.state.lightsArray);if(S.sortObjects===!0)x.sort(st,Nt);if(kt=_t.enabled===!1||_t.isPresenting===!1||_t.hasDepthSensing()===!1,kt)Ot.addToRenderList(x,y);if(this.info.render.frame++,this.info.autoReset===!0)this.info.reset();if(it===!0)ut.beginShadows();let z=b.state.shadowsArray;if(Ut.render(z,y,D),it===!0)ut.endShadows();if((B&&g.hasRenderPass())===!1){let Tt=x.opaque,xt=x.transmissive;if(b.setupLights(),D.isArrayCamera){let At=D.cameras;if(xt.length>0)for(let Ct=0,Xt=At.length;Ct<Xt;Ct++){let $t=At[Ct];fl(Tt,xt,y,$t)}if(kt)Ot.render(y);for(let Ct=0,Xt=At.length;Ct<Xt;Ct++){let $t=At[Ct];dl(x,y,$t,$t.viewport)}}else{if(xt.length>0)fl(Tt,xt,y,D);if(kt)Ot.render(y);dl(x,y,D)}}if(k!==null&&J===0)H.updateMultisampleRenderTarget(k),H.updateRenderTargetMipmap(k);if(B)g.end(S);if(y.isScene===!0)y.onAfterRender(S,y,D);if(pt.resetDefaultState(),rt=-1,W=null,w.pop(),w.length>0){if(b=w[w.length-1],H.setTextureUnits(b.state.textureUnits),it===!0)ut.setGlobalState(S.clippingPlanes,b.state.camera)}else b=null;if(C.pop(),C.length>0)x=C[C.length-1];else x=null;if(N!==null)N.renderEnd()};function Dr(y,D,V,B){if(y.visible===!1)return;if(y.layers.test(D.layers)){if(y.isGroup)V=y.renderOrder;else if(y.isLOD){if(y.autoUpdate===!0)y.update(D)}else if(y.isLightProbeGrid)b.pushLightProbeGrid(y);else if(y.isLight){if(b.pushLight(y),y.castShadow)b.pushShadow(y)}else if(y.isSprite){if(!y.frustumCulled||y.intersectsFrustum(j)){if(B)Rt.setFromMatrixPosition(y.matrixWorld).applyMatrix4(ct);let Tt=X.update(y),xt=y.material;if(xt.visible)x.push(y,Tt,xt,V,Rt.z,null,D)}}else if(y.isMesh||y.isLine||y.isPoints){if(!y.frustumCulled||y.intersectsFrustum(j)){let Tt=X.update(y),xt=y.material;if(B){if(y.boundingSphere!==void 0){if(y.boundingSphere===null)y.computeBoundingSphere();Rt.copy(y.boundingSphere.center)}else{if(Tt.boundingSphere===null)Tt.computeBoundingSphere();Rt.copy(Tt.boundingSphere.center)}Rt.applyMatrix4(y.matrixWorld).applyMatrix4(ct)}if(Array.isArray(xt)){let At=Tt.groups;for(let Ct=0,Xt=At.length;Ct<Xt;Ct++){let $t=At[Ct],wt=xt[$t.materialIndex];if(wt&&wt.visible)x.push(y,Tt,wt,V,Rt.z,$t,D)}}else if(xt.visible)x.push(y,Tt,xt,V,Rt.z,null,D)}}}let yt=y.children;for(let Tt=0,xt=yt.length;Tt<xt;Tt++)Dr(yt[Tt],D,V,B)}function dl(y,D,V,B){let{opaque:z,transmissive:yt,transparent:Tt}=y;if(b.setupLightsView(V),it===!0)ut.setGlobalState(S.clippingPlanes,V);if(B)M.viewport(Q.copy(B));if(z.length>0)ms(z,D,V);if(yt.length>0)ms(yt,D,V);if(Tt.length>0)ms(Tt,D,V);M.buffers.depth.setTest(!0),M.buffers.depth.setMask(!0),M.buffers.color.setMask(!0),M.setPolygonOffset(!1)}function fl(y,D,V,B){if((V.isScene===!0?V.overrideMaterial:null)!==null)return;if(b.state.transmissionRenderTarget[B.id]===void 0){let wt=Yt.has("EXT_color_buffer_half_float")||Yt.has("EXT_color_buffer_float");b.state.transmissionRenderTarget[B.id]=new Ge(1,1,{generateMipmaps:!0,type:wt?ln:je,minFilter:Wn,samples:Math.max(4,Jt.samples),stencilBuffer:s,resolveDepthBuffer:!1,resolveStencilBuffer:!1,storeMultisampledDepthBuffer:!1,storeMultisampledStencilBuffer:!1,colorSpace:Kt.workingColorSpace})}let yt=b.state.transmissionRenderTarget[B.id],Tt=B.viewport||Q;yt.setSize(Tt.z*S.transmissionResolutionScale,Tt.w*S.transmissionResolutionScale);let xt=S.getRenderTarget(),At=S.getActiveCubeFace(),Ct=S.getActiveMipmapLevel();if(S.setRenderTarget(yt),S.getClearColor(Lt),se=S.getClearAlpha(),se<1)S.setClearColor(16777215,0.5);if(S.clear(),kt)Ot.render(V);let Xt=S.toneMapping;S.toneMapping=Qe;let $t=B.viewport;if(B.viewport!==void 0)B.viewport=void 0;if(b.setupLightsView(B),it===!0)ut.setGlobalState(S.clippingPlanes,B);if(ms(y,V,B),H.updateMultisampleRenderTarget(yt),H.updateRenderTargetMipmap(yt),Yt.has("WEBGL_multisampled_render_to_texture")===!1){let wt=!1;for(let ie=0,ye=D.length;ie<ye;ie++){let me=D[ie],{object:he,geometry:we,material:bt,group:Pe}=me;if(bt.side===$e&&he.layers.test(B.layers)){let te=bt.side;bt.side=Ne,bt.needsUpdate=!0,pl(he,V,B,we,bt,Pe),bt.side=te,bt.needsUpdate=!0,wt=!0}}if(wt===!0)H.updateMultisampleRenderTarget(yt),H.updateRenderTargetMipmap(yt)}if(S.setRenderTarget(xt,At,Ct),S.setClearColor(Lt,se),$t!==void 0)B.viewport=$t;S.toneMapping=Xt}function ms(y,D,V){let B=D.isScene===!0?D.overrideMaterial:null;for(let z=0,yt=y.length;z<yt;z++){let Tt=y[z],{object:xt,geometry:At,group:Ct}=Tt,Xt=Tt.material;if(Xt.allowOverride===!0&&B!==null)Xt=B;if(xt.layers.test(V.layers))pl(xt,D,V,At,Xt,Ct)}}function pl(y,D,V,B,z,yt){if(N!==null&&z.isNodeMaterial)N.setObject(y,z);if(y.onBeforeRender(S,D,V,B,z,yt),y.modelViewMatrix.multiplyMatrices(V.matrixWorldInverse,y.matrixWorld),y.normalMatrix.getNormalMatrix(y.modelViewMatrix),z.onBeforeRender(S,D,V,B,y,yt),z.transparent===!0&&z.side===$e&&z.forceSinglePass===!1)z.side=Ne,z.needsUpdate=!0,S.renderBufferDirect(V,D,B,z,y,yt),z.side=Ai,z.needsUpdate=!0,S.renderBufferDirect(V,D,B,z,y,yt),z.side=$e;else S.renderBufferDirect(V,D,B,z,y,yt);y.onAfterRender(S,D,V,B,z,yt)}function gs(y,D,V){if(D.isScene!==!0)D=Dt;let B=L.get(y),z=b.state.lights,yt=b.state.shadowsArray,Tt=z.state.version,xt=K.getParameters(y,z.state,yt,D,V,b.state.lightProbeGridArray),At=K.getProgramCacheKey(xt),Ct=B.programs;B.environment=y.isMeshStandardMaterial||y.isMeshLambertMaterial||y.isMeshPhongMaterial?D.environment:null,B.fog=D.fog;let Xt=y.isMeshStandardMaterial||y.isMeshLambertMaterial&&!y.envMap||y.isMeshPhongMaterial&&!y.envMap;if(B.envMap=tt.get(y.envMap||B.environment,Xt),B.envMapRotation=B.environment!==null&&y.envMap===null?D.environmentRotation:y.envMapRotation,Ct===void 0)y.addEventListener("dispose",en),Ct=new Map,B.programs=Ct;let $t=Ct.get(At);if($t!==void 0){if(B.currentProgram===$t&&B.lightsStateVersion===Tt)return gl(y,xt),$t}else{if(xt.uniforms=K.getUniforms(y),N!==null&&y.isNodeMaterial)N.build(y,V,xt);y.onBeforeCompile(xt,S),$t=K.acquireProgram(xt,At),Ct.set(At,$t),B.uniforms=xt.uniforms}let wt=B.uniforms;if(!y.isShaderMaterial&&!y.isRawShaderMaterial||y.clipping===!0)wt.clippingPlanes=ut.uniform;if(gl(y,xt),B.needsLights=Wh(y),B.lightsStateVersion=Tt,B.needsLights)wt.ambientLightColor.value=z.state.ambient,wt.lightProbe.value=z.state.probe,wt.sunLights.value=z.state.sun,wt.sunLightShadows.value=z.state.sunShadow,wt.directionalLights.value=z.state.directional,wt.directionalLightShadows.value=z.state.directionalShadow,wt.spotLights.value=z.state.spot,wt.spotLightShadows.value=z.state.spotShadow,wt.rectAreaLights.value=z.state.rectArea,wt.ltc_1.value=z.state.rectAreaLTC1,wt.ltc_2.value=z.state.rectAreaLTC2,wt.pointLights.value=z.state.point,wt.pointLightShadows.value=z.state.pointShadow,wt.hemisphereLights.value=z.state.hemi,wt.sunShadowMatrix.value=z.state.sunShadowMatrix,wt.sunShadowCascade.value=z.state.sunShadowCascade,wt.directionalShadowMatrix.value=z.state.directionalShadowMatrix,wt.spotLightMatrix.value=z.state.spotLightMatrix,wt.spotLightMap.value=z.state.spotLightMap,wt.pointShadowMatrix.value=z.state.pointShadowMatrix;return B.lightProbeGrid=b.state.lightProbeGridArray.length>0,B.currentProgram=$t,B.uniformsList=null,$t}function ml(y){if(y.uniformsList===null){let D=y.currentProgram.getUniforms();y.uniformsList=ps.seqWithValue(D.seq,y.uniforms)}return y.uniformsList}function gl(y,D){let V=L.get(y);V.outputColorSpace=D.outputColorSpace,V.batching=D.batching,V.batchingColor=D.batchingColor,V.instancing=D.instancing,V.instancingColor=D.instancingColor,V.instancingMorph=D.instancingMorph,V.skinning=D.skinning,V.morphTargets=D.morphTargets,V.morphNormals=D.morphNormals,V.morphColors=D.morphColors,V.morphTargetsCount=D.morphTargetsCount,V.numClippingPlanes=D.numClippingPlanes,V.numIntersection=D.numClipIntersection,V.vertexAlphas=D.vertexAlphas,V.vertexTangents=D.vertexTangents,V.toneMapping=D.toneMapping}function kh(y,D){if(y.length===0)return null;if(y.length===1)return y[0].texture!==null?y[0]:null;A.setFromMatrixPosition(D.matrixWorld);for(let V=0,B=y.length;V<B;V++){let z=y[V];if(z.texture!==null&&z.boundingBox.containsPoint(A))return z}return null}function Hh(y,D,V,B,z){if(D.isScene!==!0)D=Dt;H.resetTextureUnits();let yt=D.fog,Tt=B.isMeshStandardMaterial||B.isMeshLambertMaterial||B.isMeshPhongMaterial?D.environment:null,xt=k===null?S.outputColorSpace:k.isXRRenderTarget===!0?k.texture.colorSpace:Kt.workingColorSpace,At=B.isMeshStandardMaterial||B.isMeshLambertMaterial&&!B.envMap||B.isMeshPhongMaterial&&!B.envMap,Ct=tt.get(B.envMap||Tt,At),Xt=B.vertexColors===!0&&!!V.attributes.color&&V.attributes.color.itemSize===4,$t=!!V.attributes.tangent&&(!!B.normalMap||B.anisotropy>0),wt=!!V.morphAttributes.position,ie=!!V.morphAttributes.normal,ye=!!V.morphAttributes.color,me=Qe;if(B.toneMapped){if(k===null||k.isXRRenderTarget===!0)me=S.toneMapping}let he=V.morphAttributes.position||V.morphAttributes.normal||V.morphAttributes.color,we=he!==void 0?he.length:0,bt=L.get(B),Pe=b.state.lights;if(it===!0){if(at===!0||y!==W){let pe=y===W&&B.id===rt;ut.setState(B,y,pe)}}let te=!1;if(B.version===bt.__version){if(bt.needsLights&&bt.lightsStateVersion!==Pe.state.version)te=!0;else if(bt.outputColorSpace!==xt)te=!0;else if(z.isBatchedMesh&&bt.batching===!1)te=!0;else if(!z.isBatchedMesh&&bt.batching===!0)te=!0;else if(z.isBatchedMesh&&bt.batchingColor===!0&&z._colorsTexture===null)te=!0;else if(z.isBatchedMesh&&bt.batchingColor===!1&&z._colorsTexture!==null)te=!0;else if(z.isInstancedMesh&&bt.instancing===!1)te=!0;else if(!z.isInstancedMesh&&bt.instancing===!0)te=!0;else if(z.isSkinnedMesh&&bt.skinning===!1)te=!0;else if(!z.isSkinnedMesh&&bt.skinning===!0)te=!0;else if(z.isInstancedMesh&&bt.instancingColor===!0&&z.instanceColor===null)te=!0;else if(z.isInstancedMesh&&bt.instancingColor===!1&&z.instanceColor!==null)te=!0;else if(z.isInstancedMesh&&bt.instancingMorph===!0&&z.morphTexture===null)te=!0;else if(z.isInstancedMesh&&bt.instancingMorph===!1&&z.morphTexture!==null)te=!0;else if(bt.envMap!==Ct)te=!0;else if(B.fog===!0&&bt.fog!==yt)te=!0;else if(bt.numClippingPlanes!==void 0&&(bt.numClippingPlanes!==ut.numPlanes||bt.numIntersection!==ut.numIntersection))te=!0;else if(bt.vertexAlphas!==Xt)te=!0;else if(bt.vertexTangents!==$t)te=!0;else if(bt.morphTargets!==wt)te=!0;else if(bt.morphNormals!==ie)te=!0;else if(bt.morphColors!==ye)te=!0;else if(bt.toneMapping!==me)te=!0;else if(bt.morphTargetsCount!==we)te=!0;else if(!!bt.lightProbeGrid!==b.state.lightProbeGridArray.length>0)te=!0}else te=!0,bt.__version=B.version;let He=bt.currentProgram;if(te===!0){if(He=gs(B,D,z),N&&B.isNodeMaterial)N.onUpdateProgram(B,He,bt)}let nn=!1,Mn=!1,ii=!1,le=He.getUniforms(),xe=bt.uniforms;if(M.useProgram(He.program))nn=!0,Mn=!0,ii=!0;if(B.id!==rt)rt=B.id,Mn=!0;if(bt.needsLights){let pe=kh(b.state.lightProbeGridArray,z);if(bt.lightProbeGrid!==pe)bt.lightProbeGrid=pe,Mn=!0}if(nn||W!==y){if(M.buffers.depth.getReversed()&&y.reversedDepth!==!0)y._reversedDepth=!0,y.updateProjectionMatrix();le.setValue(R,"projectionMatrix",y.projectionMatrix),le.setValue(R,"viewMatrix",y.matrixWorldInverse);let Tn=le.map.cameraPosition;if(Tn!==void 0)Tn.setValue(R,vt.setFromMatrixPosition(y.matrixWorld));if(Jt.logarithmicDepthBuffer)le.setValue(R,"logDepthBufFC",2/(Math.log(y.far+1)/Math.LN2));if(B.isMeshPhongMaterial||B.isMeshToonMaterial||B.isMeshLambertMaterial||B.isMeshBasicMaterial||B.isMeshStandardMaterial||B.isShaderMaterial)le.setValue(R,"isOrthographic",y.isOrthographicCamera===!0);if(W!==y)W=y,Mn=!0,ii=!0}if(bt.needsLights){if(Pe.state.sunShadowMap.length>0)le.setValue(R,"sunShadowMap",Pe.state.sunShadowMap,H);if(Pe.state.directionalShadowMap.length>0)le.setValue(R,"directionalShadowMap",Pe.state.directionalShadowMap,H);if(Pe.state.spotShadowMap.length>0)le.setValue(R,"spotShadowMap",Pe.state.spotShadowMap,H);if(Pe.state.pointShadowMap.length>0)le.setValue(R,"pointShadowMap",Pe.state.pointShadowMap,H)}if(z.isSkinnedMesh){le.setOptional(R,z,"bindMatrix"),le.setOptional(R,z,"bindMatrixInverse");let pe=z.skeleton;if(pe){if(pe.boneTexture===null)pe.computeBoneTexture();le.setValue(R,"boneTexture",pe.boneTexture,H)}}if(z.isBatchedMesh){if(le.setOptional(R,z,"batchingTexture"),le.setValue(R,"batchingTexture",z._matricesTexture,H),le.setOptional(R,z,"batchingIdTexture"),le.setValue(R,"batchingIdTexture",z._indirectTexture,H),le.setOptional(R,z,"batchingColorTexture"),z._colorsTexture!==null)le.setValue(R,"batchingColorTexture",z._colorsTexture,H)}let bn=V.morphAttributes;if(bn.position!==void 0||bn.normal!==void 0||bn.color!==void 0)ee.update(z,V,He);if(Mn||bt.receiveShadow!==z.receiveShadow)bt.receiveShadow=z.receiveShadow,le.setValue(R,"receiveShadow",z.receiveShadow);if((B.isMeshStandardMaterial||B.isMeshLambertMaterial||B.isMeshPhongMaterial)&&B.envMap===null&&D.environment!==null)xe.envMapIntensity.value=D.environmentIntensity;if(xe.dfgLUT!==void 0)xe.dfgLUT.value=kg();if(Mn){if(le.setValue(R,"toneMappingExposure",S.toneMappingExposure),bt.needsLights)Vh(xe,ii);if(yt&&B.fog===!0)St.refreshFogUniforms(xe,yt);if(St.refreshMaterialUniforms(xe,B,ot,q,b.state.transmissionRenderTarget[y.id]),bt.needsLights&&bt.lightProbeGrid){let pe=bt.lightProbeGrid;xe.probesSH.value=pe.texture,xe.probesMin.value.copy(pe.boundingBox.min),xe.probesMax.value.copy(pe.boundingBox.max),xe.probesResolution.value.copy(pe.resolution)}ps.upload(R,ml(bt),xe,H)}if(B.isShaderMaterial&&B.uniformsNeedUpdate===!0)ps.upload(R,ml(bt),xe,H),B.uniformsNeedUpdate=!1;if(B.isSpriteMaterial)le.setValue(R,"center",z.center);if(le.setValue(R,"modelViewMatrix",z.modelViewMatrix),le.setValue(R,"normalMatrix",z.normalMatrix),le.setValue(R,"modelMatrix",z.matrixWorld),B.uniformsGroups!==void 0){let pe=B.uniformsGroups;for(let Tn=0,si=pe.length;Tn<si;Tn++){let xl=pe[Tn];Mt.update(xl,He),Mt.bind(xl,He)}}return He}function Vh(y,D){y.ambientLightColor.needsUpdate=D,y.lightProbe.needsUpdate=D,y.sunLights.needsUpdate=D,y.sunLightShadows.needsUpdate=D,y.directionalLights.needsUpdate=D,y.directionalLightShadows.needsUpdate=D,y.pointLights.needsUpdate=D,y.pointLightShadows.needsUpdate=D,y.spotLights.needsUpdate=D,y.spotLightShadows.needsUpdate=D,y.rectAreaLights.needsUpdate=D,y.hemisphereLights.needsUpdate=D}function Wh(y){return y.isMeshLambertMaterial||y.isMeshToonMaterial||y.isMeshPhongMaterial||y.isMeshStandardMaterial||y.isShadowMaterial||y.isShaderMaterial&&y.lights===!0}this.getActiveCubeFace=function(){return G},this.getActiveMipmapLevel=function(){return J},this.getRenderTarget=function(){return k},this.setRenderTargetTextures=function(y,D,V){let B=L.get(y);if(B.__autoAllocateDepthBuffer=y.resolveDepthBuffer===!1,B.__autoAllocateDepthBuffer===!1)B.__useRenderToTexture=!1;L.get(y.texture).__webglTexture=D,L.get(y.depthTexture).__webglTexture=B.__autoAllocateDepthBuffer?void 0:V,B.__hasExternalTextures=!0},this.setRenderTargetFramebuffer=function(y,D){let V=L.get(y);V.__webglFramebuffer=D,V.__useDefaultFramebuffer=D===void 0},this.setRenderTarget=function(y,D=0,V=0){k=y,G=D,J=V;let B=null,z=!1,yt=!1;if(y){let xt=L.get(y);if(xt.__useDefaultFramebuffer!==void 0){M.bindFramebuffer(R.FRAMEBUFFER,xt.__webglFramebuffer),Q.copy(y.viewport),nt.copy(y.scissor),Pt=y.scissorTest,M.viewport(Q),M.scissor(nt),M.setScissorTest(Pt),rt=-1;return}else if(xt.__webglFramebuffer===void 0)H.setupRenderTarget(y);else if(xt.__hasExternalTextures)H.rebindTextures(y,L.get(y.texture).__webglTexture,L.get(y.depthTexture).__webglTexture);else if(y.depthBuffer){let Xt=y.depthTexture;if(xt.__boundDepthTexture!==Xt){if(Xt!==null&&L.has(Xt)&&(y.width!==Xt.image.width||y.height!==Xt.image.height))throw Error("THREE.WebGLRenderer: Attached DepthTexture is initialized to the incorrect size.");H.setupDepthRenderbuffer(y)}}let At=y.texture;if(At.isData3DTexture||At.isDataArrayTexture||At.isCompressedArrayTexture)yt=!0;let Ct=L.get(y).__webglFramebuffer;if(y.isWebGLCubeRenderTarget){if(Array.isArray(Ct[D]))B=Ct[D][V];else B=Ct[D];z=!0}else if(y.samples>0&&H.useMultisampledRTT(y)===!1)B=L.get(y).__webglMultisampledFramebuffer;else if(Array.isArray(Ct))B=Ct[V];else B=Ct;Q.copy(y.viewport),nt.copy(y.scissor),Pt=y.scissorTest}else Q.copy(Ft).multiplyScalar(ot).floor(),nt.copy(Et).multiplyScalar(ot).floor(),Pt=re;if(V!==0)B=F;if(M.bindFramebuffer(R.FRAMEBUFFER,B))M.drawBuffers(y,B);if(M.viewport(Q),M.scissor(nt),M.setScissorTest(Pt),z){let xt=L.get(y.texture);R.framebufferTexture2D(R.FRAMEBUFFER,R.COLOR_ATTACHMENT0,R.TEXTURE_CUBE_MAP_POSITIVE_X+D,xt.__webglTexture,V)}else if(yt){let xt=D;for(let At=0;At<y.textures.length;At++){let Ct=L.get(y.textures[At]);R.framebufferTextureLayer(R.FRAMEBUFFER,R.COLOR_ATTACHMENT0+At,Ct.__webglTexture,V,xt)}}else if(y!==null&&V!==0){let xt=L.get(y.texture);R.framebufferTexture2D(R.FRAMEBUFFER,R.COLOR_ATTACHMENT0,R.TEXTURE_2D,xt.__webglTexture,V)}rt=-1};function _l(y){let D=L.get(y);if(D.__readFormat!==y.format||D.__readType!==y.type)D.__readFormat=y.format,D.__readType=y.type,D.__formatReadable=Jt.textureFormatReadable(y.format),D.__typeReadable=Jt.textureTypeReadable(y.type);return D}if(this.readRenderTargetPixels=function(y,D,V,B,z,yt,Tt,xt=0){if(!(y&&y.isWebGLRenderTarget)){Bt("WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");return}let At=L.get(y).__webglFramebuffer;if(y.isWebGLCubeRenderTarget&&Tt!==void 0)At=At[Tt];if(At){M.bindFramebuffer(R.FRAMEBUFFER,At);try{let Ct=y.textures[xt],{format:Xt,type:$t}=Ct;if(y.textures.length>1)R.readBuffer(R.COLOR_ATTACHMENT0+xt);let wt=_l(Ct);if(wt.__formatReadable===!1){Bt("WebGLRenderer.readRenderTargetPixels: renderTarget is not in RGBA or implementation defined format.");return}if(wt.__typeReadable===!1){Bt("WebGLRenderer.readRenderTargetPixels: renderTarget is not in UnsignedByteType or implementation defined type.");return}if(D>=0&&D<=y.width-B&&(V>=0&&V<=y.height-z))R.readPixels(D,V,B,z,Y.convert(Xt),Y.convert($t),yt)}finally{let Ct=k!==null?L.get(k).__webglFramebuffer:null;M.bindFramebuffer(R.FRAMEBUFFER,Ct)}}},this.readRenderTargetPixelsAsync=async function(y,D,V,B,z,yt,Tt,xt=0){if(!(y&&y.isWebGLRenderTarget))throw Error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");let At=L.get(y).__webglFramebuffer;if(y.isWebGLCubeRenderTarget&&Tt!==void 0)At=At[Tt];if(At)if(D>=0&&D<=y.width-B&&(V>=0&&V<=y.height-z)){M.bindFramebuffer(R.FRAMEBUFFER,At);let Ct=y.textures[xt],{format:Xt,type:$t}=Ct;if(y.textures.length>1)R.readBuffer(R.COLOR_ATTACHMENT0+xt);let wt=_l(Ct);if(wt.__formatReadable===!1)throw Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in RGBA or implementation defined format.");if(wt.__typeReadable===!1)throw Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in UnsignedByteType or implementation defined type.");let ie=R.createBuffer();R.bindBuffer(R.PIXEL_PACK_BUFFER,ie),R.bufferData(R.PIXEL_PACK_BUFFER,yt.byteLength,R.STREAM_READ),R.readPixels(D,V,B,z,Y.convert(Xt),Y.convert($t),0),R.bindBuffer(R.PIXEL_PACK_BUFFER,null);let ye=k!==null?L.get(k).__webglFramebuffer:null;M.bindFramebuffer(R.FRAMEBUFFER,ye);let me=R.fenceSync(R.SYNC_GPU_COMMANDS_COMPLETE,0);return R.flush(),await Vc(R,me,4),R.bindBuffer(R.PIXEL_PACK_BUFFER,ie),R.getBufferSubData(R.PIXEL_PACK_BUFFER,0,yt),R.bindBuffer(R.PIXEL_PACK_BUFFER,null),R.deleteBuffer(ie),R.deleteSync(me),yt}else throw Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: requested read bounds are out of range.")},this.copyFramebufferToTexture=function(y,D=null,V=0){let B=Math.pow(2,-V),z=Math.floor(y.image.width*B),yt=Math.floor(y.image.height*B),Tt=D!==null?D.x:0,xt=D!==null?D.y:0;H.setTexture2D(y,0),R.copyTexSubImage2D(R.TEXTURE_2D,V,0,0,Tt,xt,z,yt),M.unbindTexture()},this.copyTextureToTexture=function(y,D,V=null,B=null,z=0,yt=0){let Tt,xt,At,Ct,Xt,$t,wt,ie,ye,me=y.isCompressedTexture?y.mipmaps[yt]:y.image;if(V!==null)Tt=V.max.x-V.min.x,xt=V.max.y-V.min.y,At=V.isBox3?V.max.z-V.min.z:1,Ct=V.min.x,Xt=V.min.y,$t=V.isBox3?V.min.z:0;else{let xe=Math.pow(2,-z);if(Tt=Math.floor(me.width*xe),xt=Math.floor(me.height*xe),y.isDataArrayTexture)At=me.depth;else if(y.isData3DTexture)At=Math.floor(me.depth*xe);else At=1;Ct=0,Xt=0,$t=0}if(B!==null)wt=B.x,ie=B.y,ye=B.z;else wt=0,ie=0,ye=0;let he=Y.convert(D.format),we=Y.convert(D.type),bt;if(D.isData3DTexture)H.setTexture3D(D,0),bt=R.TEXTURE_3D;else if(D.isDataArrayTexture||D.isCompressedArrayTexture)H.setTexture2DArray(D,0),bt=R.TEXTURE_2D_ARRAY;else H.setTexture2D(D,0),bt=R.TEXTURE_2D;M.activeTexture(R.TEXTURE0),M.pixelStorei(R.UNPACK_FLIP_Y_WEBGL,D.flipY),M.pixelStorei(R.UNPACK_PREMULTIPLY_ALPHA_WEBGL,D.premultiplyAlpha),M.pixelStorei(R.UNPACK_ALIGNMENT,D.unpackAlignment);let Pe=M.getParameter(R.UNPACK_ROW_LENGTH),te=M.getParameter(R.UNPACK_IMAGE_HEIGHT),He=M.getParameter(R.UNPACK_SKIP_PIXELS),nn=M.getParameter(R.UNPACK_SKIP_ROWS),Mn=M.getParameter(R.UNPACK_SKIP_IMAGES);M.pixelStorei(R.UNPACK_ROW_LENGTH,me.width),M.pixelStorei(R.UNPACK_IMAGE_HEIGHT,me.height),M.pixelStorei(R.UNPACK_SKIP_PIXELS,Ct),M.pixelStorei(R.UNPACK_SKIP_ROWS,Xt),M.pixelStorei(R.UNPACK_SKIP_IMAGES,$t);let ii=y.isDataArrayTexture||y.isData3DTexture,le=D.isDataArrayTexture||D.isData3DTexture;if(y.isDepthTexture){let xe=L.get(y),bn=L.get(D),pe=L.get(xe.__renderTarget),Tn=L.get(bn.__renderTarget);M.bindFramebuffer(R.READ_FRAMEBUFFER,pe.__webglFramebuffer),M.bindFramebuffer(R.DRAW_FRAMEBUFFER,Tn.__webglFramebuffer);for(let si=0;si<At;si++){if(ii)R.framebufferTextureLayer(R.READ_FRAMEBUFFER,R.COLOR_ATTACHMENT0,L.get(y).__webglTexture,z,$t+si),R.framebufferTextureLayer(R.DRAW_FRAMEBUFFER,R.COLOR_ATTACHMENT0,L.get(D).__webglTexture,yt,ye+si);R.blitFramebuffer(Ct,Xt,Tt,xt,wt,ie,Tt,xt,R.DEPTH_BUFFER_BIT,R.NEAREST)}M.bindFramebuffer(R.READ_FRAMEBUFFER,null),M.bindFramebuffer(R.DRAW_FRAMEBUFFER,null)}else if(z!==0||y.isRenderTargetTexture||L.has(y)){let xe=L.get(y),bn=L.get(D);M.bindFramebuffer(R.READ_FRAMEBUFFER,Z),M.bindFramebuffer(R.DRAW_FRAMEBUFFER,I);for(let pe=0;pe<At;pe++){if(ii)R.framebufferTextureLayer(R.READ_FRAMEBUFFER,R.COLOR_ATTACHMENT0,xe.__webglTexture,z,$t+pe);else R.framebufferTexture2D(R.READ_FRAMEBUFFER,R.COLOR_ATTACHMENT0,R.TEXTURE_2D,xe.__webglTexture,z);if(le)R.framebufferTextureLayer(R.DRAW_FRAMEBUFFER,R.COLOR_ATTACHMENT0,bn.__webglTexture,yt,ye+pe);else R.framebufferTexture2D(R.DRAW_FRAMEBUFFER,R.COLOR_ATTACHMENT0,R.TEXTURE_2D,bn.__webglTexture,yt);if(z!==0)R.blitFramebuffer(Ct,Xt,Tt,xt,wt,ie,Tt,xt,R.COLOR_BUFFER_BIT,R.NEAREST);else if(le)R.copyTexSubImage3D(bt,yt,wt,ie,ye+pe,Ct,Xt,Tt,xt);else R.copyTexSubImage2D(bt,yt,wt,ie,Ct,Xt,Tt,xt)}M.bindFramebuffer(R.READ_FRAMEBUFFER,null),M.bindFramebuffer(R.DRAW_FRAMEBUFFER,null)}else if(le)if(y.isDataTexture||y.isData3DTexture)R.texSubImage3D(bt,yt,wt,ie,ye,Tt,xt,At,he,we,me.data);else if(D.isCompressedArrayTexture)R.compressedTexSubImage3D(bt,yt,wt,ie,ye,Tt,xt,At,he,me.data);else R.texSubImage3D(bt,yt,wt,ie,ye,Tt,xt,At,he,we,me);else if(y.isDataTexture)R.texSubImage2D(R.TEXTURE_2D,yt,wt,ie,Tt,xt,he,we,me.data);else if(y.isCompressedTexture)R.compressedTexSubImage2D(R.TEXTURE_2D,yt,wt,ie,me.width,me.height,he,me.data);else R.texSubImage2D(R.TEXTURE_2D,yt,wt,ie,Tt,xt,he,we,me);if(M.pixelStorei(R.UNPACK_ROW_LENGTH,Pe),M.pixelStorei(R.UNPACK_IMAGE_HEIGHT,te),M.pixelStorei(R.UNPACK_SKIP_PIXELS,He),M.pixelStorei(R.UNPACK_SKIP_ROWS,nn),M.pixelStorei(R.UNPACK_SKIP_IMAGES,Mn),yt===0&&D.generateMipmaps)R.generateMipmap(bt);M.unbindTexture()},this.initRenderTarget=function(y){if(L.get(y).__webglFramebuffer===void 0)H.setupRenderTarget(y)},this.initTexture=function(y){if(y.isCubeTexture)H.setTextureCube(y,0);else if(y.isData3DTexture)H.setTexture3D(y,0);else if(y.isDataArrayTexture||y.isCompressedArrayTexture)H.setTexture2DArray(y,0);else H.setTexture2D(y,0);M.unbindTexture()},this.resetState=function(){G=0,J=0,k=null,M.reset(),pt.reset()},typeof __THREE_DEVTOOLS__<"u")__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}get coordinateSystem(){return fo}get outputColorSpace(){return this._outputColorSpace}set outputColorSpace(t){this._outputColorSpace=t;let e=this.getContext();e.drawingBufferColorSpace=Kt._getDrawingBufferColorSpace(t),e.unpackColorSpace=Kt._getUnpackColorSpace()}}export{Xs as ACESFilmicToneMapping,Hn as AddEquation,Ws as AdditiveBlending,Ne as BackSide,Kn as BoxGeometry,Ue as BufferAttribute,ve as BufferGeometry,hs as Camera,Mo as CanvasTexture,fr as CatmullRomCurve3,hr as CircleGeometry,Zt as Color,Kt as ColorManagement,ur as ConeGeometry,pa as CustomBlending,ls as CylinderGeometry,or as DataTexture,qo as DirectionalLight,$e as DoubleSide,Gc as DynamicDrawUsage,on as Euler,yr as ExtrudeGeometry,jt as Float32BufferAttribute,Bn as Group,Wo as HemisphereLight,Sr as IcosahedronGeometry,So as InstancedBufferAttribute,Yo as InstancedBufferGeometry,De as LinearFilter,Gt as Matrix3,ue as Matrix4,We as Mesh,as as MeshBasicMaterial,Po as MeshStandardMaterial,Ke as NoBlending,ma as OneFactor,ga as OneMinusSrcAlphaFactor,Ii as OrthographicCamera,Ir as PMREMGenerator,Ri as PlaneGeometry,cn as Quaternion,ha as REVISION,tn as RGBAFormat,Ta as RepeatWrapping,Mr as RingGeometry,lo as SRGBColorSpace,_o as Scene,ke as ShaderMaterial,vr as Shape,br as SphereGeometry,vo as Sprite,ar as SpriteMaterial,Tr as TorusGeometry,Er as TubeGeometry,is as Uint16BufferAttribute,ss as Uint32BufferAttribute,lt as Vector2,P as Vector3,ge as Vector4,Bh as WebGLRenderer};
