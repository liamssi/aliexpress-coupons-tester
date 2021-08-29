// ==UserScript==
// @name         ALIEXPRESS BULK COUPONS TESTER
// @version      1.0.0
// @description  A bulk coupons tester for AliExpress.
// @author       BELGHIT ISMAIL (fb.com/belghit.be/)
// @match        https://shoppingcart.aliexpress.com/order*
// @icon         https://www.google.com/s2/favicons?domain=aliexpress.com
// @grant        none
// @run-at			 document-end     
// @updateURL		 https://github.com/liamssi/aliexpress-coupons-tester/raw/master/dist/userscript.user.js
// @downloadURL	 https://github.com/liamssi/aliexpress-coupons-tester/raw/master/dist/userscript.user.js      
// ==/UserScript== 
var aliexpressBulkCoupons = (function (exports) {
    'use strict';

    /*! *****************************************************************************
    Copyright (c) Microsoft Corporation.

    Permission to use, copy, modify, and/or distribute this software for any
    purpose with or without fee is hereby granted.

    THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
    REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
    AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
    INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
    LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
    OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
    PERFORMANCE OF THIS SOFTWARE.
    ***************************************************************************** */

    function __awaiter(thisArg, _arguments, P, generator) {
        function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
        return new (P || (P = Promise))(function (resolve, reject) {
            function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
            function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
            function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
            step((generator = generator.apply(thisArg, _arguments || [])).next());
        });
    }

    const initUI = (btnCallback) => {
        let checkExist = setInterval(() => {
            // check if the coupon form exist
            let couponForm = document.getElementsByClassName('order-charge-container')[0];
            if (couponForm) {
                //clear the interval
                clearInterval(checkExist);
                //id used to style the ui
                let uiId = 'aliexpress-bulk-coupons-tester';
                let runBtnId = 'run-coupons-test-btn';
                let couponsInputId = 'coupons-tester-input';
                let ui = document.getElementById(uiId);
                //ui template
                let template = `
      <div x-data="{ open: true}" class="coupon-code" x-init="coupons =Alpine.reactive({ count: 0 })">
      <div class="coupon-code-title">
        <div x-text="'Bulk Coupons Tester'"></div>
        <button
          x-on:click="open = ! open"
          x-text="open?'close':'open'"
          class="next-btn next-medium next-btn-primary next-btn-text"
        >
        </button>
      </div>
    
      <div x-show="open" class="next-large">
        <div style="
        background-image: linear-gradient(rgba(242, 242, 242,60%) 50%, #Fff 50%);
        background-size: 100% 32px;
        background-position: left 10px;
        padding:0;
        ;
        ">
        <textarea
          style="resize: none;
          width:100%;
          border-radius: 4px;
          border:1px solid #e0e0e0;
          background: url(http://i.imgur.com/2cOaJ.png);
          background-attachment: local;
          background-repeat: no-repeat;
          padding-left: 35px;
          padding-top: 10px;"
          x-ref="coupons"
          rows="4"
          id="${couponsInputId}" 
           @keyup="coupons.count =$refs.coupons.value.split(/\\r*\\n/).filter(el => {
        return el != null && el != '';
           }).length"
        ></textarea>
      </div>
    <div class="coupon-code-title">
      <div class="" style="color:gray" x-text="'coupons:'+ coupons.count "></div>
        <button
          x-on:click="$refs.coupons.value='';coupons.count=0"
          x-text="'clear'"
          class="next-btn next-medium next-btn-primary next-btn-text "
        >
        </button>

        </div>
        <div
          id="${runBtnId}"
          style=" width:100%"
          class="next-btn next-small next-btn-secondary"
        >
          Test Coupons
        </div>
      </div>
      <div id="coupon-tester-result"></div>
    </div>
 `;
                if (!ui) {
                    ui = document.createElement('div');
                    ui.id = uiId;
                    ui.classList.add('order-charge-container');
                    //console.log("created ui");
                    ui.innerHTML = template;
                    //add event listners
                    setTimeout(() => {
                        let btn = document.getElementById(runBtnId);
                        let coupons = (document.getElementById(couponsInputId));
                        btn === null || btn === void 0 ? void 0 : btn.addEventListener('click', () => {
                            //runBtn.classList.toggle("active");
                            //console.log('coupons ====>', coupons?.value)
                            btnCallback(coupons === null || coupons === void 0 ? void 0 : coupons.value);
                        });
                    }, 200);
                }
                couponForm.insertAdjacentElement('afterend', ui);
            }
        }, 200);
    };

    class XMLHttpInterceptor {
        constructor(rule) {
            this.patched = false;
            this.XMLHttpRequestOpen = XMLHttpRequest.prototype.open;
            this.XMLHttpRequestSend = XMLHttpRequest.prototype.send;
            this.XMLHttpRequestsetRequestHeader = XMLHttpRequest.prototype.setRequestHeader;
            this.rule = rule;
        }
        //triggers event when a match found
        triggerNextMatch(req) {
            let matchEvent = new CustomEvent('match', {
                detail: req,
            });
            dispatchEvent(matchEvent);
        }
        get getPatched() {
            return this.patched;
        }
        get getsRule() {
            return this.rule;
        }
        set setRule(rule) {
            this.rule = rule;
        }
        // return a promise that resolves when the first match request found
        patch(matchCallback = () => { }) {
            if (this.patched) {
                return;
            }
            let targetUrlMatch = this.rule.urlMatch;
            let bodyMatch = this.rule.bodyMatch || '';
            let XMLHttpRequestOpen = this.XMLHttpRequestOpen;
            let XMLHttpRequestSend = this.XMLHttpRequestSend;
            let XMLHttpRequestsetRequestHeader = this.XMLHttpRequestsetRequestHeader;
            //trigers the nextmatch event
            let triggerNext = this.triggerNextMatch;
            //* patch the open method to Capture
            XMLHttpRequest.prototype.open = function (method, url, async) {
                // console.log('url ==', url)
                this.url = url;
                XMLHttpRequestOpen.call(this, method, url, async ? async : true);
            };
            //*patch setHeaders to capture Headers
            XMLHttpRequest.prototype.setRequestHeader = function (header, value) {
                var _a;
                XMLHttpRequestsetRequestHeader.call(this, header, value);
                if ((_a = this.url) === null || _a === void 0 ? void 0 : _a.match(targetUrlMatch)) {
                    //   console.log('matched', this.url)
                    if (!this.headers) {
                        this.headers = {};
                    }
                    this.headers[header] = value;
                }
            };
            //* patch send to
            XMLHttpRequest.prototype.send = function (body) {
                var _a;
                if (((_a = this.url) === null || _a === void 0 ? void 0 : _a.match(targetUrlMatch)) &&
                    (body === null || body === void 0 ? void 0 : body.toString().match(bodyMatch))) {
                    //save the body
                    this.body = body;
                    matchCallback(this);
                    triggerNext(this);
                }
                XMLHttpRequestSend.call(this, body);
            };
            this.patched = true;
        }
        //* unpatch function
        unpatch() {
            if (!this.patched)
                return;
            XMLHttpRequest.prototype.open = this.XMLHttpRequestOpen;
            XMLHttpRequest.prototype.send = this.XMLHttpRequestSend;
            XMLHttpRequest.prototype.setRequestHeader = this.XMLHttpRequestsetRequestHeader;
            this.patched = false;
        }
    }

    const testCoupons = (coupons, onResult = (res) => {
        console.log('coupon test result :: ', res);
    }) => __awaiter(void 0, void 0, void 0, function* () {
        let res = [];
        for (let coupon of coupons) {
            // console.log("testing coupon ::", coupon)
            if (coupon) {
                let r = yield testCoupon(coupon);
                onResult(r);
                res.push(r);
            }
            //console.log("testing next")
        }
        return res;
    });
    let testCoupon = (coupon) => {
        return new Promise((resolve, reject) => {
            // @ts-ignore: Unreachable code error
            const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
            const couponInput = document.getElementById('code');
            // console.log('code inpute>>',couponInput );
            const couponSubmit = (document.querySelector("[ae_button_type='coupon_code'][type='button']"));
            //console.log('submit inpute>>', couponSubmit );
            let applyCoupon = () => {
                // @ts-ignore: Unreachable code error
                nativeInputValueSetter.call(couponInput, coupon);
                const inputEvent = new Event('input', { bubbles: true });
                couponInput.dispatchEvent(inputEvent);
                couponSubmit.click();
            };
            let interceptResult = () => {
                let interceptor = new XMLHttpInterceptor({
                    urlMatch: '/orders/coupons.do',
                });
                interceptor.patch((request) => {
                    request.addEventListener('readystatechange', (ev) => {
                        if (request.readyState == 4) {
                            interceptor.unpatch();
                            //console.log("found a coupon request ::: ", request.response)
                            let result = parseCouponTestResult(coupon, request.response);
                            //      setTimeout(() => resolve(result), 00)
                            resolve(result);
                            // resolve()
                        }
                    }, false);
                });
            };
            //REMOVE COUPON IF EXIST
            //TODO: ADD OTHER LANGUAGES SUPPORT
            let submitText = couponSubmit.textContent;
            if (submitText != 'Apply' &&
                submitText != 'Confirmer' &&
                submitText != 'تقديم') {
                // alert("removing")
                couponSubmit.click();
                let interceptor = new XMLHttpInterceptor({
                    urlMatch: '/orders/coupons.do',
                });
                interceptor.patch((request) => {
                    request.addEventListener('readystatechange', (ev) => {
                        if (request.readyState == 4) {
                            interceptor.unpatch();
                            interceptResult();
                            applyCoupon();
                        }
                    }, false);
                });
            }
            else {
                if (couponInput) {
                    interceptResult();
                    applyCoupon();
                }
            }
        });
    };
    let parseCouponTestResult = (coupon, responce) => {
        // console.log("coupon :::", coupon);
        let couponCode = responce.price.couponCode;
        //console.log(`parsing test result for ${coupon} :: `, responce);
        //if (responce.price) console.log("price object ::", responce.price);
        let res;
        try {
            res = {
                coupon: couponCode.platformCouponCode,
                message: couponCode.couponCodeWarnMsg,
                amount: couponCode.couponCodeAmount.formatted,
            };
        }
        catch (_a) {
            res = {
                coupon: coupon,
                message: couponCode.couponCodeWarnMsg,
                //amount: couponCode.couponCodeAmount.formatted
                amount: '0 $',
            };
        }
        return res;
    };

    function styleInject(css, ref) {
      if ( ref === void 0 ) ref = {};
      var insertAt = ref.insertAt;

      if (!css || typeof document === 'undefined') { return; }

      var head = document.head || document.getElementsByTagName('head')[0];
      var style = document.createElement('style');
      style.type = 'text/css';

      if (insertAt === 'top') {
        if (head.firstChild) {
          head.insertBefore(style, head.firstChild);
        } else {
          head.appendChild(style);
        }
      } else {
        head.appendChild(style);
      }

      if (style.styleSheet) {
        style.styleSheet.cssText = css;
      } else {
        style.appendChild(document.createTextNode(css));
      }
    }

    var css_248z$1 = ".table-cell{cursor:pointer;padding:5px;position:relative}.table-cell:hover{background-color:#f2f2f2}";
    styleInject(css_248z$1);

    function t(t,e){for(var n=0;n<e.length;n++){var r=e[n];r.enumerable=r.enumerable||!1,r.configurable=!0,"value"in r&&(r.writable=!0),Object.defineProperty(t,r.key,r);}}function e(e,n,r){return n&&t(e.prototype,n),r&&t(e,r),e}function n(){return (n=Object.assign||function(t){for(var e=1;e<arguments.length;e++){var n=arguments[e];for(var r in n)Object.prototype.hasOwnProperty.call(n,r)&&(t[r]=n[r]);}return t}).apply(this,arguments)}function r(t,e){t.prototype=Object.create(e.prototype),t.prototype.constructor=t,i(t,e);}function i(t,e){return (i=Object.setPrototypeOf||function(t,e){return t.__proto__=e,t})(t,e)}function o(t){if(void 0===t)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return t}function s(t,e){(null==e||e>t.length)&&(e=t.length);for(var n=0,r=new Array(e);n<e;n++)r[n]=t[n];return r}function a(t,e){var n="undefined"!=typeof Symbol&&t[Symbol.iterator]||t["@@iterator"];if(n)return (n=n.call(t)).next.bind(n);if(Array.isArray(t)||(n=function(t,e){if(t){if("string"==typeof t)return s(t,e);var n=Object.prototype.toString.call(t).slice(8,-1);return "Object"===n&&t.constructor&&(n=t.constructor.name),"Map"===n||"Set"===n?Array.from(t):"Arguments"===n||/^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)?s(t,e):void 0}}(t))||e&&t&&"number"==typeof t.length){n&&(t=n);var r=0;return function(){return r>=t.length?{done:!0}:{done:!1,value:t[r++]}}}throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.")}var u,l,c,p,h,f,d={},_=[],m=/acit|ex(?:s|g|n|p|$)|rph|grid|ows|mnc|ntw|ine[ch]|zoo|^ord|itera/i;function g(t,e){for(var n in e)t[n]=e[n];return t}function v(t){var e=t.parentNode;e&&e.removeChild(t);}function y(t,e,n){var r,i,o,s=arguments,a={};for(o in e)"key"==o?r=e[o]:"ref"==o?i=e[o]:a[o]=e[o];if(arguments.length>3)for(n=[n],o=3;o<arguments.length;o++)n.push(s[o]);if(null!=n&&(a.children=n),"function"==typeof t&&null!=t.defaultProps)for(o in t.defaultProps)void 0===a[o]&&(a[o]=t.defaultProps[o]);return b(t,a,r,i,null)}function b(t,e,n,r,i){var o={type:t,props:e,key:n,ref:r,__k:null,__:null,__b:0,__e:null,__d:void 0,__c:null,__h:null,constructor:void 0,__v:null==i?++u.__v:i};return null!=u.vnode&&u.vnode(o),o}function k(t){return t.children}function S(t,e){this.props=t,this.context=e;}function C(t,e){if(null==e)return t.__?C(t.__,t.__.__k.indexOf(t)+1):null;for(var n;e<t.__k.length;e++)if(null!=(n=t.__k[e])&&null!=n.__e)return n.__e;return "function"==typeof t.type?C(t):null}function P(t){var e,n;if(null!=(t=t.__)&&null!=t.__c){for(t.__e=t.__c.base=null,e=0;e<t.__k.length;e++)if(null!=(n=t.__k[e])&&null!=n.__e){t.__e=t.__c.base=n.__e;break}return P(t)}}function x(t){(!t.__d&&(t.__d=!0)&&c.push(t)&&!N.__r++||h!==u.debounceRendering)&&((h=u.debounceRendering)||p)(N);}function N(){for(var t;N.__r=c.length;)t=c.sort(function(t,e){return t.__v.__b-e.__v.__b}),c=[],t.some(function(t){var e,n,r,i,o,s;t.__d&&(o=(i=(e=t).__v).__e,(s=e.__P)&&(n=[],(r=g({},i)).__v=i.__v+1,A(s,i,r,e.__n,void 0!==s.ownerSVGElement,null!=i.__h?[o]:null,n,null==o?C(i):o,i.__h),U(n,i),i.__e!=o&&P(i)));});}function E(t,e,n,r,i,o,s,a,u,l){var c,p,h,f,m,g,v,y=r&&r.__k||_,w=y.length;for(n.__k=[],c=0;c<e.length;c++)if(null!=(f=n.__k[c]=null==(f=e[c])||"boolean"==typeof f?null:"string"==typeof f||"number"==typeof f||"bigint"==typeof f?b(null,f,null,null,f):Array.isArray(f)?b(k,{children:f},null,null,null):f.__b>0?b(f.type,f.props,f.key,null,f.__v):f)){if(f.__=n,f.__b=n.__b+1,null===(h=y[c])||h&&f.key==h.key&&f.type===h.type)y[c]=void 0;else for(p=0;p<w;p++){if((h=y[p])&&f.key==h.key&&f.type===h.type){y[p]=void 0;break}h=null;}A(t,f,h=h||d,i,o,s,a,u,l),m=f.__e,(p=f.ref)&&h.ref!=p&&(v||(v=[]),h.ref&&v.push(h.ref,null,f),v.push(p,f.__c||m,f)),null!=m?(null==g&&(g=m),"function"==typeof f.type&&null!=f.__k&&f.__k===h.__k?f.__d=u=F(f,u,t):u=T(t,f,h,y,m,u),l||"option"!==n.type?"function"==typeof n.type&&(n.__d=u):t.value=""):u&&h.__e==u&&u.parentNode!=t&&(u=C(h));}for(n.__e=g,c=w;c--;)null!=y[c]&&("function"==typeof n.type&&null!=y[c].__e&&y[c].__e==n.__d&&(n.__d=C(r,c+1)),M(y[c],y[c]));if(v)for(c=0;c<v.length;c++)H(v[c],v[++c],v[++c]);}function F(t,e,n){var r,i;for(r=0;r<t.__k.length;r++)(i=t.__k[r])&&(i.__=t,e="function"==typeof i.type?F(i,e,n):T(n,i,i,t.__k,i.__e,e));return e}function T(t,e,n,r,i,o){var s,a,u;if(void 0!==e.__d)s=e.__d,e.__d=void 0;else if(null==n||i!=o||null==i.parentNode)t:if(null==o||o.parentNode!==t)t.appendChild(i),s=null;else {for(a=o,u=0;(a=a.nextSibling)&&u<r.length;u+=2)if(a==i)break t;t.insertBefore(i,o),s=o;}return void 0!==s?s:i.nextSibling}function D(t,e,n){"-"===e[0]?t.setProperty(e,n):t[e]=null==n?"":"number"!=typeof n||m.test(e)?n:n+"px";}function R(t,e,n,r,i){var o;t:if("style"===e)if("string"==typeof n)t.style.cssText=n;else {if("string"==typeof r&&(t.style.cssText=r=""),r)for(e in r)n&&e in n||D(t.style,e,"");if(n)for(e in n)r&&n[e]===r[e]||D(t.style,e,n[e]);}else if("o"===e[0]&&"n"===e[1])o=e!==(e=e.replace(/Capture$/,"")),e=e.toLowerCase()in t?e.toLowerCase().slice(2):e.slice(2),t.l||(t.l={}),t.l[e+o]=n,n?r||t.addEventListener(e,o?I:L,o):t.removeEventListener(e,o?I:L,o);else if("dangerouslySetInnerHTML"!==e){if(i)e=e.replace(/xlink[H:h]/,"h").replace(/sName$/,"s");else if("href"!==e&&"list"!==e&&"form"!==e&&"tabIndex"!==e&&"download"!==e&&e in t)try{t[e]=null==n?"":n;break t}catch(t){}"function"==typeof n||(null!=n&&(!1!==n||"a"===e[0]&&"r"===e[1])?t.setAttribute(e,n):t.removeAttribute(e));}}function L(t){this.l[t.type+!1](u.event?u.event(t):t);}function I(t){this.l[t.type+!0](u.event?u.event(t):t);}function A(t,e,n,r,i,o,s,a,l){var c,p,h,f,m,y,b,w,C,P,x,N=e.type;if(void 0!==e.constructor)return null;null!=n.__h&&(l=n.__h,a=e.__e=n.__e,e.__h=null,o=[a]),(c=u.__b)&&c(e);try{t:if("function"==typeof N){if(w=e.props,C=(c=N.contextType)&&r[c.__c],P=c?C?C.props.value:c.__:r,n.__c?b=(p=e.__c=n.__c).__=p.__E:("prototype"in N&&N.prototype.render?e.__c=p=new N(w,P):(e.__c=p=new S(w,P),p.constructor=N,p.render=O),C&&C.sub(p),p.props=w,p.state||(p.state={}),p.context=P,p.__n=r,h=p.__d=!0,p.__h=[]),null==p.__s&&(p.__s=p.state),null!=N.getDerivedStateFromProps&&(p.__s==p.state&&(p.__s=g({},p.__s)),g(p.__s,N.getDerivedStateFromProps(w,p.__s))),f=p.props,m=p.state,h)null==N.getDerivedStateFromProps&&null!=p.componentWillMount&&p.componentWillMount(),null!=p.componentDidMount&&p.__h.push(p.componentDidMount);else {if(null==N.getDerivedStateFromProps&&w!==f&&null!=p.componentWillReceiveProps&&p.componentWillReceiveProps(w,P),!p.__e&&null!=p.shouldComponentUpdate&&!1===p.shouldComponentUpdate(w,p.__s,P)||e.__v===n.__v){p.props=w,p.state=p.__s,e.__v!==n.__v&&(p.__d=!1),p.__v=e,e.__e=n.__e,e.__k=n.__k,e.__k.forEach(function(t){t&&(t.__=e);}),p.__h.length&&s.push(p);break t}null!=p.componentWillUpdate&&p.componentWillUpdate(w,p.__s,P),null!=p.componentDidUpdate&&p.__h.push(function(){p.componentDidUpdate(f,m,y);});}p.context=P,p.props=w,p.state=p.__s,(c=u.__r)&&c(e),p.__d=!1,p.__v=e,p.__P=t,c=p.render(p.props,p.state,p.context),p.state=p.__s,null!=p.getChildContext&&(r=g(g({},r),p.getChildContext())),h||null==p.getSnapshotBeforeUpdate||(y=p.getSnapshotBeforeUpdate(f,m)),x=null!=c&&c.type===k&&null==c.key?c.props.children:c,E(t,Array.isArray(x)?x:[x],e,n,r,i,o,s,a,l),p.base=e.__e,e.__h=null,p.__h.length&&s.push(p),b&&(p.__E=p.__=null),p.__e=!1;}else null==o&&e.__v===n.__v?(e.__k=n.__k,e.__e=n.__e):e.__e=function(t,e,n,r,i,o,s,a){var u,l,c,p,h=n.props,f=e.props,m=e.type,g=0;if("svg"===m&&(i=!0),null!=o)for(;g<o.length;g++)if((u=o[g])&&(u===t||(m?u.localName==m:3==u.nodeType))){t=u,o[g]=null;break}if(null==t){if(null===m)return document.createTextNode(f);t=i?document.createElementNS("http://www.w3.org/2000/svg",m):document.createElement(m,f.is&&f),o=null,a=!1;}if(null===m)h===f||a&&t.data===f||(t.data=f);else {if(o=o&&_.slice.call(t.childNodes),l=(h=n.props||d).dangerouslySetInnerHTML,c=f.dangerouslySetInnerHTML,!a){if(null!=o)for(h={},p=0;p<t.attributes.length;p++)h[t.attributes[p].name]=t.attributes[p].value;(c||l)&&(c&&(l&&c.__html==l.__html||c.__html===t.innerHTML)||(t.innerHTML=c&&c.__html||""));}if(function(t,e,n,r,i){var o;for(o in n)"children"===o||"key"===o||o in e||R(t,o,null,n[o],r);for(o in e)i&&"function"!=typeof e[o]||"children"===o||"key"===o||"value"===o||"checked"===o||n[o]===e[o]||R(t,o,e[o],n[o],r);}(t,f,h,i,a),c)e.__k=[];else if(g=e.props.children,E(t,Array.isArray(g)?g:[g],e,n,r,i&&"foreignObject"!==m,o,s,t.firstChild,a),null!=o)for(g=o.length;g--;)null!=o[g]&&v(o[g]);a||("value"in f&&void 0!==(g=f.value)&&(g!==t.value||"progress"===m&&!g)&&R(t,"value",g,h.value,!1),"checked"in f&&void 0!==(g=f.checked)&&g!==t.checked&&R(t,"checked",g,h.checked,!1));}return t}(n.__e,e,n,r,i,o,s,l);(c=u.diffed)&&c(e);}catch(t){e.__v=null,(l||null!=o)&&(e.__e=a,e.__h=!!l,o[o.indexOf(a)]=null),u.__e(t,e,n);}}function U(t,e){u.__c&&u.__c(e,t),t.some(function(e){try{t=e.__h,e.__h=[],t.some(function(t){t.call(e);});}catch(t){u.__e(t,e.__v);}});}function H(t,e,n){try{"function"==typeof t?t(e):t.current=e;}catch(t){u.__e(t,n);}}function M(t,e,n){var r,i,o;if(u.unmount&&u.unmount(t),(r=t.ref)&&(r.current&&r.current!==t.__e||H(r,null,e)),n||"function"==typeof t.type||(n=null!=(i=t.__e)),t.__e=t.__d=void 0,null!=(r=t.__c)){if(r.componentWillUnmount)try{r.componentWillUnmount();}catch(t){u.__e(t,e);}r.base=r.__P=null;}if(r=t.__k)for(o=0;o<r.length;o++)r[o]&&M(r[o],e,n);null!=i&&v(i);}function O(t,e,n){return this.constructor(t,n)}function j(t,e,n){var r,i,o;u.__&&u.__(t,e),i=(r="function"==typeof n)?null:n&&n.__k||e.__k,o=[],A(e,t=(!r&&n||e).__k=y(k,null,[t]),i||d,d,void 0!==e.ownerSVGElement,!r&&n?[n]:i?null:e.firstChild?_.slice.call(e.childNodes):null,o,!r&&n?n:i?i.__e:e.firstChild,r),U(o,t);}function W(){return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g,function(t){var e=16*Math.random()|0;return ("x"==t?e:3&e|8).toString(16)})}u={__e:function(t,e){for(var n,r,i;e=e.__;)if((n=e.__c)&&!n.__)try{if((r=n.constructor)&&null!=r.getDerivedStateFromError&&(n.setState(r.getDerivedStateFromError(t)),i=n.__d),null!=n.componentDidCatch&&(n.componentDidCatch(t),i=n.__d),i)return n.__E=n}catch(e){t=e;}throw t},__v:0},l=function(t){return null!=t&&void 0===t.constructor},S.prototype.setState=function(t,e){var n;n=null!=this.__s&&this.__s!==this.state?this.__s:this.__s=g({},this.state),"function"==typeof t&&(t=t(g({},n),this.props)),t&&g(n,t),null!=t&&this.__v&&(e&&this.__h.push(e),x(this));},S.prototype.forceUpdate=function(t){this.__v&&(this.__e=!0,t&&this.__h.push(t),x(this));},S.prototype.render=k,c=[],p="function"==typeof Promise?Promise.prototype.then.bind(Promise.resolve()):setTimeout,N.__r=0,f=0;var B=function(){function t(t){this._id=void 0,this._id=t||W();}return e(t,[{key:"id",get:function(){return this._id}}]),t}(),z={search:{placeholder:"Type a keyword..."},sort:{sortAsc:"Sort column ascending",sortDesc:"Sort column descending"},pagination:{previous:"Previous",next:"Next",navigate:function(t,e){return "Page "+t+" of "+e},page:function(t){return "Page "+t},showing:"Showing",of:"of",to:"to",results:"results"},loading:"Loading...",noRecordsFound:"No matching records found",error:"An error happened while fetching the data"},q=function(){function t(t){this._language=void 0,this._defaultLanguage=void 0,this._language=t,this._defaultLanguage=z;}var e=t.prototype;return e.getString=function(t,e){if(!e||!t)return null;var n=t.split("."),r=n[0];if(e[r]){var i=e[r];return "string"==typeof i?function(){return i}:"function"==typeof i?i:this.getString(n.slice(1).join("."),i)}return null},e.translate=function(t){var e,n=this.getString(t,this._language);return (e=n||this.getString(t,this._defaultLanguage))?e.apply(void 0,[].slice.call(arguments,1)):t},t}(),G=function(t){function e(e,n){var r,i;return (r=t.call(this,e,n)||this).config=void 0,r._=void 0,r.config=function(t){if(!t)return null;var e=Object.keys(t);return e.length?t[e[0]].props.value:null}(n),r.config&&(r._=(i=r.config.translator,function(t){return i.translate.apply(i,[t].concat([].slice.call(arguments,1)))})),r}return r(e,t),e}(S),X=function(t){function e(){return t.apply(this,arguments)||this}return r(e,t),e.prototype.render=function(){return y(this.props.parentElement,{dangerouslySetInnerHTML:{__html:this.props.content}})},e}(G);function $(t,e){return y(X,{content:t,parentElement:e})}X.defaultProps={parentElement:"span"};var K,V=function(t){function e(e){var n;return (n=t.call(this)||this).data=void 0,n.update(e),n}r(e,t);var n=e.prototype;return n.cast=function(t){return t instanceof HTMLElement?$(t.outerHTML):t},n.update=function(t){return this.data=this.cast(t),this},e}(B),Y=function(t){function n(e){var n;return (n=t.call(this)||this)._cells=void 0,n.cells=e||[],n}r(n,t);var i=n.prototype;return i.cell=function(t){return this._cells[t]},i.toArray=function(){return this.cells.map(function(t){return t.data})},n.fromCells=function(t){return new n(t.map(function(t){return new V(t.data)}))},e(n,[{key:"cells",get:function(){return this._cells},set:function(t){this._cells=t;}},{key:"length",get:function(){return this.cells.length}}]),n}(B),Z=function(t){function n(e){var n;return (n=t.call(this)||this)._rows=void 0,n._length=void 0,n.rows=e instanceof Array?e:e instanceof Y?[e]:[],n}return r(n,t),n.prototype.toArray=function(){return this.rows.map(function(t){return t.toArray()})},n.fromRows=function(t){return new n(t.map(function(t){return Y.fromCells(t.cells)}))},n.fromArray=function(t){return new n((t=function(t){return !t[0]||t[0]instanceof Array?t:[t]}(t)).map(function(t){return new Y(t.map(function(t){return new V(t)}))}))},e(n,[{key:"rows",get:function(){return this._rows},set:function(t){this._rows=t;}},{key:"length",get:function(){return this._length||this.rows.length},set:function(t){this._length=t;}}]),n}(B),J=function(){function t(){this.callbacks=void 0;}var e=t.prototype;return e.init=function(t){this.callbacks||(this.callbacks={}),t&&!this.callbacks[t]&&(this.callbacks[t]=[]);},e.on=function(t,e){return this.init(t),this.callbacks[t].push(e),this},e.off=function(t,e){var n=t;return this.init(),this.callbacks[n]&&0!==this.callbacks[n].length?(this.callbacks[n]=this.callbacks[n].filter(function(t){return t!=e}),this):this},e.emit=function(t){var e=arguments,n=t;return this.init(n),this.callbacks[n].length>0&&(this.callbacks[n].forEach(function(t){return t.apply(void 0,[].slice.call(e,1))}),!0)},t}();!function(t){t[t.Initiator=0]="Initiator",t[t.ServerFilter=1]="ServerFilter",t[t.ServerSort=2]="ServerSort",t[t.ServerLimit=3]="ServerLimit",t[t.Extractor=4]="Extractor",t[t.Transformer=5]="Transformer",t[t.Filter=6]="Filter",t[t.Sort=7]="Sort",t[t.Limit=8]="Limit";}(K||(K={}));var Q=function(t){function n(e){var n;return (n=t.call(this)||this).id=void 0,n._props=void 0,n._props={},n.id=W(),e&&n.setProps(e),n}r(n,t);var i=n.prototype;return i.process=function(){var t=[].slice.call(arguments);this.validateProps instanceof Function&&this.validateProps.apply(this,t),this.emit.apply(this,["beforeProcess"].concat(t));var e=this._process.apply(this,t);return this.emit.apply(this,["afterProcess"].concat(t)),e},i.setProps=function(t){return Object.assign(this._props,t),this.emit("propsUpdated",this),this},e(n,[{key:"props",get:function(){return this._props}}]),n}(J),tt=function(t){function n(){return t.apply(this,arguments)||this}return r(n,t),n.prototype._process=function(t){return this.props.keyword?(e=String(this.props.keyword).trim(),n=this.props.columns,r=this.props.ignoreHiddenColumns,i=t,o=this.props.selector,e=e.replace(/[-[\]{}()*+?.,\\^$|#\s]/g,"\\$&"),new Z(i.rows.filter(function(t,i){return t.cells.some(function(t,s){if(!t)return !1;if(r&&n&&n[s]&&"object"==typeof n[s]&&n[s].hidden)return !1;var a="";if("function"==typeof o)a=o(t.data,i,s);else if("object"==typeof t.data){var u=t.data;u&&u.props&&u.props.content&&(a=u.props.content);}else a=String(t.data);return new RegExp(e,"gi").test(a)})}))):t;var e,n,r,i,o;},e(n,[{key:"type",get:function(){return K.Filter}}]),n}(Q);function et(){var t="gridjs";return ""+t+[].slice.call(arguments).reduce(function(t,e){return t+"-"+e},"")}function nt(){return [].slice.call(arguments).filter(function(t){return t}).reduce(function(t,e){return (t||"")+" "+e},"").trim()||null}var rt,it=function(t){function n(e){var n;return (n=t.call(this)||this)._state=void 0,n.dispatcher=void 0,n.dispatcher=e,n._state=n.getInitialState(),e.register(n._handle.bind(o(n))),n}r(n,t);var i=n.prototype;return i._handle=function(t){this.handle(t.type,t.payload);},i.setState=function(t){var e=this._state;this._state=t,this.emit("updated",t,e);},e(n,[{key:"state",get:function(){return this._state}}]),n}(J),ot=function(t){function e(){return t.apply(this,arguments)||this}r(e,t);var n=e.prototype;return n.getInitialState=function(){return {keyword:null}},n.handle=function(t,e){"SEARCH_KEYWORD"===t&&this.search(e.keyword);},n.search=function(t){this.setState({keyword:t});},e}(it),st=function(){function t(t){this.dispatcher=void 0,this.dispatcher=t;}return t.prototype.dispatch=function(t,e){this.dispatcher.dispatch({type:t,payload:e});},t}(),at=function(t){function e(){return t.apply(this,arguments)||this}return r(e,t),e.prototype.search=function(t){this.dispatch("SEARCH_KEYWORD",{keyword:t});},e}(st),ut=function(t){function i(){return t.apply(this,arguments)||this}return r(i,t),i.prototype._process=function(t){if(!this.props.keyword)return t;var e={};return this.props.url&&(e.url=this.props.url(t.url,this.props.keyword)),this.props.body&&(e.body=this.props.body(t.body,this.props.keyword)),n({},t,e)},e(i,[{key:"type",get:function(){return K.ServerFilter}}]),i}(Q),lt=new(function(){function t(){}var e=t.prototype;return e.format=function(t,e){return "[Grid.js] ["+e.toUpperCase()+"]: "+t},e.error=function(t,e){void 0===e&&(e=!1);var n=this.format(t,"error");if(e)throw Error(n);console.error(n);},e.warn=function(t){console.warn(this.format(t,"warn"));},e.info=function(t){console.info(this.format(t,"info"));},t}()),ct=function(t){function e(){return t.apply(this,arguments)||this}return r(e,t),e}(G);!function(t){t[t.Header=0]="Header",t[t.Footer=1]="Footer",t[t.Cell=2]="Cell";}(rt||(rt={}));var pt=function(){function t(){this.plugins=void 0,this.plugins=[];}var e=t.prototype;return e.get=function(t){var e=this.plugins.filter(function(e){return e.id===t});return e.length>0?e[0]:null},e.add=function(t){return t.id?null!==this.get(t.id)?(lt.error("Duplicate plugin ID: "+t.id),this):(this.plugins.push(t),this):(lt.error("Plugin ID cannot be empty"),this)},e.remove=function(t){return this.plugins.splice(this.plugins.indexOf(this.get(t)),1),this},e.list=function(t){return (null!=t||null!=t?this.plugins.filter(function(e){return e.position===t}):this.plugins).sort(function(t,e){return t.order-e.order})},t}(),ht=function(t){function e(){return t.apply(this,arguments)||this}return r(e,t),e.prototype.render=function(){var t=this;if(this.props.pluginId){var e=this.config.plugin.get(this.props.pluginId);return e?y(k,{},y(e.component,n({plugin:e},e.props,this.props.props))):null}return void 0!==this.props.position?y(k,{},this.config.plugin.list(this.props.position).map(function(e){return y(e.component,n({plugin:e},e.props,t.props.props))})):null},e}(G),ft=function(t){function e(e,n){var r;(r=t.call(this,e,n)||this).searchProcessor=void 0,r.actions=void 0,r.store=void 0,r.storeUpdatedFn=void 0,r.actions=new at(r.config.dispatcher),r.store=new ot(r.config.dispatcher);var i,s=e.keyword;return e.enabled&&(s&&r.actions.search(s),r.storeUpdatedFn=r.storeUpdated.bind(o(r)),r.store.on("updated",r.storeUpdatedFn),i=e.server?new ut({keyword:e.keyword,url:e.server.url,body:e.server.body}):new tt({keyword:e.keyword,columns:r.config.header&&r.config.header.columns,ignoreHiddenColumns:e.ignoreHiddenColumns||void 0===e.ignoreHiddenColumns,selector:e.selector}),r.searchProcessor=i,r.config.pipeline.register(i)),r}r(e,t);var n=e.prototype;return n.componentWillUnmount=function(){this.config.pipeline.unregister(this.searchProcessor),this.store.off("updated",this.storeUpdatedFn);},n.storeUpdated=function(t){this.searchProcessor.setProps({keyword:t.keyword});},n.onChange=function(t){this.actions.search(t.target.value);},n.render=function(){if(!this.props.enabled)return null;var t,e,n,r=this.onChange.bind(this);return this.searchProcessor instanceof ut&&(t=r,e=this.props.debounceTimeout,r=function(){var r=arguments;return new Promise(function(i){n&&clearTimeout(n),n=setTimeout(function(){return i(t.apply(void 0,[].slice.call(r)))},e);})}),y("div",{className:et(nt("search",this.config.className.search))},y("input",{type:"search",placeholder:this._("search.placeholder"),"aria-label":this._("search.placeholder"),onInput:r,className:nt(et("input"),et("search","input")),value:this.store.state.keyword}))},e}(ct);ft.defaultProps={debounceTimeout:250};var dt=function(t){function n(){return t.apply(this,arguments)||this}r(n,t);var i=n.prototype;return i.validateProps=function(){if(isNaN(Number(this.props.limit))||isNaN(Number(this.props.page)))throw Error("Invalid parameters passed")},i._process=function(t){var e=this.props.page;return new Z(t.rows.slice(e*this.props.limit,(e+1)*this.props.limit))},e(n,[{key:"type",get:function(){return K.Limit}}]),n}(Q),_t=function(t){function i(){return t.apply(this,arguments)||this}return r(i,t),i.prototype._process=function(t){var e={};return this.props.url&&(e.url=this.props.url(t.url,this.props.page,this.props.limit)),this.props.body&&(e.body=this.props.body(t.body,this.props.page,this.props.limit)),n({},t,e)},e(i,[{key:"type",get:function(){return K.ServerLimit}}]),i}(Q),mt=function(t){function n(e,n){var r;return (r=t.call(this,e,n)||this).processor=void 0,r.onUpdateFn=void 0,r.setTotalFromTabularFn=void 0,r.state={limit:e.limit,page:e.page||0,total:0},r}r(n,t);var i=n.prototype;return i.componentWillMount=function(){var t,e=this;this.props.enabled&&(this.setTotalFromTabularFn=this.setTotalFromTabular.bind(this),this.props.server?(t=new _t({limit:this.state.limit,page:this.state.page,url:this.props.server.url,body:this.props.server.body}),this.config.pipeline.on("afterProcess",this.setTotalFromTabularFn)):(t=new dt({limit:this.state.limit,page:this.state.page})).on("beforeProcess",this.setTotalFromTabularFn),this.processor=t,this.config.pipeline.register(t),this.config.pipeline.on("error",function(){e.setState({total:0,page:0});}));},i.setTotalFromTabular=function(t){this.setTotal(t.length);},i.onUpdate=function(t){this.props.resetPageOnUpdate&&t!==this.processor&&this.setPage(0);},i.componentDidMount=function(){this.onUpdateFn=this.onUpdate.bind(this),this.config.pipeline.on("updated",this.onUpdateFn);},i.componentWillUnmount=function(){this.config.pipeline.unregister(this.processor),this.config.pipeline.off("updated",this.onUpdateFn);},i.setPage=function(t){if(t>=this.pages||t<0||t===this.state.page)return null;this.setState({page:t}),this.processor.setProps({page:t});},i.setTotal=function(t){this.setState({total:t});},i.renderPages=function(){var t=this;if(this.props.buttonsCount<=0)return null;var e=Math.min(this.pages,this.props.buttonsCount),n=Math.min(this.state.page,Math.floor(e/2));return this.state.page+Math.floor(e/2)>=this.pages&&(n=e-(this.pages-this.state.page)),y(k,null,this.pages>e&&this.state.page-n>0&&y(k,null,y("button",{tabIndex:0,role:"button",onClick:this.setPage.bind(this,0),title:this._("pagination.firstPage"),"aria-label":this._("pagination.firstPage"),className:this.config.className.paginationButton},this._("1")),y("button",{tabIndex:-1,className:nt(et("spread"),this.config.className.paginationButton)},"...")),Array.from(Array(e).keys()).map(function(e){return t.state.page+(e-n)}).map(function(e){return y("button",{tabIndex:0,role:"button",onClick:t.setPage.bind(t,e),className:nt(t.state.page===e?nt(et("currentPage"),t.config.className.paginationButtonCurrent):null,t.config.className.paginationButton),title:t._("pagination.page",e+1),"aria-label":t._("pagination.page",e+1)},t._(""+(e+1)))}),this.pages>e&&this.pages>this.state.page+n+1&&y(k,null,y("button",{tabIndex:-1,className:nt(et("spread"),this.config.className.paginationButton)},"..."),y("button",{tabIndex:0,role:"button",onClick:this.setPage.bind(this,this.pages-1),title:this._("pagination.page",this.pages),"aria-label":this._("pagination.page",this.pages),className:this.config.className.paginationButton},this._(""+this.pages))))},i.renderSummary=function(){return y(k,null,this.props.summary&&this.state.total>0&&y("div",{role:"status","aria-live":"polite",className:nt(et("summary"),this.config.className.paginationSummary),title:this._("pagination.navigate",this.state.page+1,this.pages)},this._("pagination.showing")," ",y("b",null,this._(""+(this.state.page*this.state.limit+1)))," ",this._("pagination.to")," ",y("b",null,this._(""+Math.min((this.state.page+1)*this.state.limit,this.state.total)))," ",this._("pagination.of")," ",y("b",null,this._(""+this.state.total))," ",this._("pagination.results")))},i.render=function(){return this.props.enabled?y("div",{className:nt(et("pagination"),this.config.className.pagination)},this.renderSummary(),y("div",{className:et("pages")},this.props.prevButton&&y("button",{tabIndex:0,role:"button",disabled:0===this.state.page,onClick:this.setPage.bind(this,this.state.page-1),title:this._("pagination.previous"),"aria-label":this._("pagination.previous"),className:nt(this.config.className.paginationButton,this.config.className.paginationButtonPrev)},this._("pagination.previous")),this.renderPages(),this.props.nextButton&&y("button",{tabIndex:0,role:"button",disabled:this.pages===this.state.page+1||0===this.pages,onClick:this.setPage.bind(this,this.state.page+1),title:this._("pagination.next"),"aria-label":this._("pagination.next"),className:nt(this.config.className.paginationButton,this.config.className.paginationButtonNext)},this._("pagination.next")))):null},e(n,[{key:"pages",get:function(){return Math.ceil(this.state.total/this.state.limit)}}]),n}(ct);function gt(t,e){return "string"==typeof t?t.indexOf("%")>-1?e/100*parseInt(t,10):parseInt(t,10):t}function vt(t){return t?Math.floor(t)+"px":""}mt.defaultProps={summary:!0,nextButton:!0,prevButton:!0,buttonsCount:3,limit:10,resetPageOnUpdate:!0};var yt=function(t){function e(e,n){var r;return (r=t.call(this,e,n)||this).tableElement=void 0,r.tableClassName=void 0,r.tableStyle=void 0,r.tableElement=r.props.tableRef.current.base.cloneNode(!0),r.tableElement.style.position="absolute",r.tableElement.style.width="100%",r.tableElement.style.zIndex="-2147483640",r.tableElement.style.visibility="hidden",r.tableClassName=r.tableElement.className,r.tableStyle=r.tableElement.style.cssText,r}r(e,t);var i=e.prototype;return i.widths=function(){this.tableElement.className=this.tableClassName+" "+et("shadowTable"),this.tableElement.style.tableLayout="auto",this.tableElement.style.width="auto",this.tableElement.style.padding="0",this.tableElement.style.margin="0",this.tableElement.style.border="none",this.tableElement.style.outline="none";var t=Array.from(this.base.parentNode.querySelectorAll("thead th")).reduce(function(t,e){var r;return e.style.width=e.clientWidth+"px",n(((r={})[e.getAttribute("data-column-id")]={minWidth:e.clientWidth},r),t)},{});return this.tableElement.className=this.tableClassName,this.tableElement.style.cssText=this.tableStyle,this.tableElement.style.tableLayout="auto",Array.from(this.base.parentNode.querySelectorAll("thead th")).reduce(function(t,e){return t[e.getAttribute("data-column-id")].width=e.clientWidth,t},t)},i.render=function(){var t=this;return this.props.tableRef.current?y("div",{ref:function(e){e&&e.appendChild(t.tableElement);}}):null},e}(G);function bt(t){if(!t)return "";var e=t.split(" ");return 1===e.length&&/([a-z][A-Z])+/g.test(t)?t:e.map(function(t,e){return 0==e?t.toLowerCase():t.charAt(0).toUpperCase()+t.slice(1).toLowerCase()}).join("")}var wt=function(t){function i(){var e;return (e=t.call(this)||this)._columns=void 0,e._columns=[],e}r(i,t);var o=i.prototype;return o.adjustWidth=function(t){var e=t.container,n=t.tableRef,r=t.tempRef,o=t.tempRef||!0;if(!e)return this;var s=e.clientWidth,u={current:null},l={};if(n.current&&o){var c=y(yt,{tableRef:n});c.ref=u,j(c,r.current),l=u.current.widths();}for(var p,h=a(i.tabularFormat(this.columns).reduce(function(t,e){return t.concat(e)},[]));!(p=h()).done;){var f=p.value;f.columns&&f.columns.length>0||(!f.width&&o?f.id in l&&(f.width=vt(l[f.id].width),f.minWidth=vt(l[f.id].minWidth)):f.width=vt(gt(f.width,s)));}return n.current&&o&&j(null,r.current),this},o.setSort=function(t,e){for(var r,i=a(e||this.columns||[]);!(r=i()).done;){var o=r.value;o.columns&&o.columns.length>0&&(o.sort={enabled:!1}),void 0===o.sort&&t.sort&&(o.sort={enabled:!0}),o.sort?"object"==typeof o.sort&&(o.sort=n({enabled:!0},o.sort)):o.sort={enabled:!1},o.columns&&this.setSort(t,o.columns);}},o.setFixedHeader=function(t,e){for(var n,r=a(e||this.columns||[]);!(n=r()).done;){var i=n.value;void 0===i.fixedHeader&&(i.fixedHeader=t.fixedHeader),i.columns&&this.setFixedHeader(t,i.columns);}},o.setResizable=function(t,e){for(var n,r=a(e||this.columns||[]);!(n=r()).done;){var i=n.value;void 0===i.resizable&&(i.resizable=t.resizable),i.columns&&this.setResizable(t,i.columns);}},o.setID=function(t){for(var e,n=a(t||this.columns||[]);!(e=n()).done;){var r=e.value;r.id||"string"!=typeof r.name||(r.id=bt(r.name)),r.id||lt.error('Could not find a valid ID for one of the columns. Make sure a valid "id" is set for all columns.'),r.columns&&this.setID(r.columns);}},o.populatePlugins=function(t,e){for(var r,i=a(e);!(r=i()).done;){var o=r.value;void 0!==o.plugin&&t.plugin.add(n({id:o.id,props:{}},o.plugin,{position:rt.Cell}));}},i.fromColumns=function(t){for(var e,n=new i,r=a(t);!(e=r()).done;){var o=e.value;if("string"==typeof o||l(o))n.columns.push({name:o});else if("object"==typeof o){var s=o;s.columns&&(s.columns=i.fromColumns(s.columns).columns),"object"==typeof s.plugin&&void 0===s.data&&(s.data=null),n.columns.push(o);}}return n},i.fromUserConfig=function(t){var e=new i;return t.from?e.columns=i.fromHTMLTable(t.from).columns:t.columns?e.columns=i.fromColumns(t.columns).columns:!t.data||"object"!=typeof t.data[0]||t.data[0]instanceof Array||(e.columns=Object.keys(t.data[0]).map(function(t){return {name:t}})),e.columns.length?(e.setID(),e.setSort(t),e.setFixedHeader(t),e.setResizable(t),e.populatePlugins(t,e.columns),e):null},i.fromHTMLTable=function(t){for(var e,n=new i,r=a(t.querySelector("thead").querySelectorAll("th"));!(e=r()).done;){var o=e.value;n.columns.push({name:o.innerHTML,width:o.width});}return n},i.tabularFormat=function(t){var e=[],n=t||[],r=[];if(n&&n.length){e.push(n);for(var i,o=a(n);!(i=o()).done;){var s=i.value;s.columns&&s.columns.length&&(r=r.concat(s.columns));}r.length&&(e=e.concat(this.tabularFormat(r)));}return e},i.leafColumns=function(t){var e=[],n=t||[];if(n&&n.length)for(var r,i=a(n);!(r=i()).done;){var o=r.value;o.columns&&0!==o.columns.length||e.push(o),o.columns&&(e=e.concat(this.leafColumns(o.columns)));}return e},i.maximumDepth=function(t){return this.tabularFormat([t]).length-1},e(i,[{key:"columns",get:function(){return this._columns},set:function(t){this._columns=t;}},{key:"visibleColumns",get:function(){return this._columns.filter(function(t){return !t.hidden})}}]),i}(B),kt=function(){function t(){this._callbacks=void 0,this._isDispatching=void 0,this._isHandled=void 0,this._isPending=void 0,this._lastID=void 0,this._pendingPayload=void 0,this._callbacks={},this._isDispatching=!1,this._isHandled={},this._isPending={},this._lastID=1;}var e=t.prototype;return e.register=function(t){var e="ID_"+this._lastID++;return this._callbacks[e]=t,e},e.unregister=function(t){if(!this._callbacks[t])throw Error("Dispatcher.unregister(...): "+t+" does not map to a registered callback.");delete this._callbacks[t];},e.waitFor=function(t){if(!this._isDispatching)throw Error("Dispatcher.waitFor(...): Must be invoked while dispatching.");for(var e=0;e<t.length;e++){var n=t[e];if(this._isPending[n]){if(!this._isHandled[n])throw Error("Dispatcher.waitFor(...): Circular dependency detected while ' +\n            'waiting for "+n+".")}else {if(!this._callbacks[n])throw Error("Dispatcher.waitFor(...): "+n+" does not map to a registered callback.");this._invokeCallback(n);}}},e.dispatch=function(t){if(this._isDispatching)throw Error("Dispatch.dispatch(...): Cannot dispatch in the middle of a dispatch.");this._startDispatching(t);try{for(var e in this._callbacks)this._isPending[e]||this._invokeCallback(e);}finally{this._stopDispatching();}},e.isDispatching=function(){return this._isDispatching},e._invokeCallback=function(t){this._isPending[t]=!0,this._callbacks[t](this._pendingPayload),this._isHandled[t]=!0;},e._startDispatching=function(t){for(var e in this._callbacks)this._isPending[e]=!1,this._isHandled[e]=!1;this._pendingPayload=t,this._isDispatching=!0;},e._stopDispatching=function(){delete this._pendingPayload,this._isDispatching=!1;},t}(),St=function(){},Ct=function(t){function e(e){var n;return (n=t.call(this)||this).data=void 0,n.set(e),n}r(e,t);var n=e.prototype;return n.get=function(){try{return Promise.resolve(this.data()).then(function(t){return {data:t,total:t.length}})}catch(t){return Promise.reject(t)}},n.set=function(t){return t instanceof Array?this.data=function(){return t}:t instanceof Function&&(this.data=t),this},e}(St),Pt=function(t){function e(e){var n;return (n=t.call(this)||this).options=void 0,n.options=e,n}r(e,t);var i=e.prototype;return i.handler=function(t){return "function"==typeof this.options.handle?this.options.handle(t):t.ok?t.json():(lt.error("Could not fetch data: "+t.status+" - "+t.statusText,!0),null)},i.get=function(t){var e=n({},this.options,t);return "function"==typeof e.data?e.data(e):fetch(e.url,e).then(this.handler.bind(this)).then(function(t){return {data:e.then(t),total:"function"==typeof e.total?e.total(t):void 0}})},e}(St),xt=function(){function t(){}return t.createFromUserConfig=function(t){var e=null;return t.data&&(e=new Ct(t.data)),t.from&&(e=new Ct(this.tableElementToArray(t.from)),t.from.style.display="none"),t.server&&(e=new Pt(t.server)),e||lt.error("Could not determine the storage type",!0),e},t.tableElementToArray=function(t){for(var e,n,r=[],i=a(t.querySelector("tbody").querySelectorAll("tr"));!(e=i()).done;){for(var o,s=[],u=a(e.value.querySelectorAll("td"));!(o=u()).done;){var l=o.value;1===l.childNodes.length&&l.childNodes[0].nodeType===Node.TEXT_NODE?s.push((n=l.innerHTML,(new DOMParser).parseFromString(n,"text/html").documentElement.textContent)):s.push($(l.innerHTML));}r.push(s);}return r},t}(),Nt="undefined"!=typeof Symbol?Symbol.iterator||(Symbol.iterator=Symbol("Symbol.iterator")):"@@iterator";function Et(t,e,n){if(!t.s){if(n instanceof Ft){if(!n.s)return void(n.o=Et.bind(null,t,e));1&e&&(e=n.s),n=n.v;}if(n&&n.then)return void n.then(Et.bind(null,t,e),Et.bind(null,t,2));t.s=e,t.v=n;var r=t.o;r&&r(t);}}var Ft=function(){function t(){}return t.prototype.then=function(e,n){var r=new t,i=this.s;if(i){var o=1&i?e:n;if(o){try{Et(r,1,o(this.v));}catch(t){Et(r,2,t);}return r}return this}return this.o=function(t){try{var i=t.v;1&t.s?Et(r,1,e?e(i):i):n?Et(r,1,n(i)):Et(r,2,i);}catch(t){Et(r,2,t);}},r},t}();function Tt(t){return t instanceof Ft&&1&t.s}var Dt,Rt=function(t){function n(e){var n;return (n=t.call(this)||this)._steps=new Map,n.cache=new Map,n.lastProcessorIndexUpdated=-1,e&&e.forEach(function(t){return n.register(t)}),n}r(n,t);var i=n.prototype;return i.clearCache=function(){this.cache=new Map,this.lastProcessorIndexUpdated=-1;},i.register=function(t,e){if(void 0===e&&(e=null),null===t.type)throw Error("Processor type is not defined");t.on("propsUpdated",this.processorPropsUpdated.bind(this)),this.addProcessorByPriority(t,e),this.afterRegistered(t);},i.unregister=function(t){if(t){var e=this._steps.get(t.type);e&&e.length&&(this._steps.set(t.type,e.filter(function(e){return e!=t})),this.emit("updated",t));}},i.addProcessorByPriority=function(t,e){var n=this._steps.get(t.type);if(!n){var r=[];this._steps.set(t.type,r),n=r;}if(null===e||e<0)n.push(t);else if(n[e]){var i=n.slice(0,e-1),o=n.slice(e+1);this._steps.set(t.type,i.concat(t).concat(o));}else n[e]=t;},i.getStepsByType=function(t){return this.steps.filter(function(e){return e.type===t})},i.getSortedProcessorTypes=function(){return Object.keys(K).filter(function(t){return !isNaN(Number(t))}).map(function(t){return Number(t)})},i.process=function(t){try{var e=this,n=function(t){return e.lastProcessorIndexUpdated=i.length,e.emit("afterProcess",o),o},r=e.lastProcessorIndexUpdated,i=e.steps,o=t,s=function(t,n){try{var s=function(t,e,n){if("function"==typeof t[Nt]){var r,i,o,s=t[Nt]();if(function t(n){try{for(;!(r=s.next()).done;)if((n=e(r.value))&&n.then){if(!Tt(n))return void n.then(t,o||(o=Et.bind(null,i=new Ft,2)));n=n.v;}i?Et(i,1,n):i=n;}catch(t){Et(i||(i=new Ft),2,t);}}(),s.return){var a=function(t){try{r.done||s.return();}catch(t){}return t};if(i&&i.then)return i.then(a,function(t){throw a(t)});a();}return i}if(!("length"in t))throw new TypeError("Object is not iterable");for(var u=[],l=0;l<t.length;l++)u.push(t[l]);return function(t,e,n){var r,i,o=-1;return function n(s){try{for(;++o<t.length;)if((s=e(o))&&s.then){if(!Tt(s))return void s.then(n,i||(i=Et.bind(null,r=new Ft,2)));s=s.v;}r?Et(r,1,s):r=s;}catch(t){Et(r||(r=new Ft),2,t);}}(),r}(u,function(t){return e(u[t])})}(i,function(t){var n=e.findProcessorIndexByID(t.id),i=function(){if(n>=r)return Promise.resolve(t.process(o)).then(function(n){e.cache.set(t.id,o=n);});o=e.cache.get(t.id);}();if(i&&i.then)return i.then(function(){})});}catch(t){return n(t)}return s&&s.then?s.then(void 0,n):s}(0,function(t){throw lt.error(t),e.emit("error",o),t});return Promise.resolve(s&&s.then?s.then(n):n())}catch(t){return Promise.reject(t)}},i.findProcessorIndexByID=function(t){return this.steps.findIndex(function(e){return e.id==t})},i.setLastProcessorIndex=function(t){var e=this.findProcessorIndexByID(t.id);this.lastProcessorIndexUpdated>e&&(this.lastProcessorIndexUpdated=e);},i.processorPropsUpdated=function(t){this.setLastProcessorIndex(t),this.emit("propsUpdated"),this.emit("updated",t);},i.afterRegistered=function(t){this.setLastProcessorIndex(t),this.emit("afterRegister"),this.emit("updated",t);},e(n,[{key:"steps",get:function(){for(var t,e=[],n=a(this.getSortedProcessorTypes());!(t=n()).done;){var r=this._steps.get(t.value);r&&r.length&&(e=e.concat(r));}return e.filter(function(t){return t})}}]),n}(J),Lt=function(t){function n(){return t.apply(this,arguments)||this}return r(n,t),n.prototype._process=function(t){try{return Promise.resolve(this.props.storage.get(t))}catch(t){return Promise.reject(t)}},e(n,[{key:"type",get:function(){return K.Extractor}}]),n}(Q),It=function(t){function n(){return t.apply(this,arguments)||this}return r(n,t),n.prototype._process=function(t){var e=Z.fromArray(t.data);return e.length=t.total,e},e(n,[{key:"type",get:function(){return K.Transformer}}]),n}(Q),At=function(t){function i(){return t.apply(this,arguments)||this}return r(i,t),i.prototype._process=function(){return Object.entries(this.props.serverStorageOptions).filter(function(t){return "function"!=typeof t[1]}).reduce(function(t,e){var r;return n({},t,((r={})[e[0]]=e[1],r))},{})},e(i,[{key:"type",get:function(){return K.Initiator}}]),i}(Q),Ut=function(t){function n(){return t.apply(this,arguments)||this}r(n,t);var i=n.prototype;return i.castData=function(t){if(!t||!t.length)return [];if(!this.props.header||!this.props.header.columns)return t;var e=wt.leafColumns(this.props.header.columns);return t[0]instanceof Array?t.map(function(t){var n=0;return e.map(function(e,r){return void 0!==e.data?(n++,"function"==typeof e.data?e.data(t):e.data):t[r-n]})}):"object"!=typeof t[0]||t[0]instanceof Array?[]:t.map(function(t){return e.map(function(e,n){return void 0!==e.data?"function"==typeof e.data?e.data(t):e.data:e.id?t[e.id]:(lt.error("Could not find the correct cell for column at position "+n+".\n                          Make sure either 'id' or 'selector' is defined for all columns."),null)})})},i._process=function(t){return {data:this.castData(t.data),total:t.total}},e(n,[{key:"type",get:function(){return K.Transformer}}]),n}(Q),Ht=function(){function t(){}return t.createFromConfig=function(t){var e=new Rt;return t.storage instanceof Pt&&e.register(new At({serverStorageOptions:t.server})),e.register(new Lt({storage:t.storage})),e.register(new Ut({header:t.header})),e.register(new It),e},t}(),Mt=function(){function t(e){this._userConfig=void 0,Object.assign(this,n({},t.defaultConfig(),e)),this._userConfig={};}var e=t.prototype;return e.assign=function(t){for(var e=0,n=Object.keys(t);e<n.length;e++){var r=n[e];"_userConfig"!==r&&(this[r]=t[r]);}return this},e.update=function(e){return e?(this._userConfig=n({},this._userConfig,e),this.assign(t.fromUserConfig(this._userConfig)),this):this},t.defaultConfig=function(){return {plugin:new pt,dispatcher:new kt,tableRef:{current:null},tempRef:{current:null},width:"100%",height:"auto",autoWidth:!0,style:{},className:{}}},t.fromUserConfig=function(e){var r=new t(e);return r._userConfig=e,"boolean"==typeof e.sort&&e.sort&&r.assign({sort:{multiColumn:!0}}),r.assign({header:wt.fromUserConfig(r)}),r.assign({storage:xt.createFromUserConfig(e)}),r.assign({pipeline:Ht.createFromConfig(r)}),r.assign({translator:new q(e.language)}),r.plugin.add({id:"search",position:rt.Header,component:ft,props:n({enabled:!0===e.search||e.search instanceof Object},e.search)}),r.plugin.add({id:"pagination",position:rt.Footer,component:mt,props:n({enabled:!0===e.pagination||e.pagination instanceof Object},e.pagination)}),e.plugins&&e.plugins.forEach(function(t){return r.plugin.add(t)}),r},t}();!function(t){t[t.Init=0]="Init",t[t.Loading=1]="Loading",t[t.Loaded=2]="Loaded",t[t.Rendered=3]="Rendered",t[t.Error=4]="Error";}(Dt||(Dt={}));var Wt,Bt=function(t){function e(){return t.apply(this,arguments)||this}r(e,t);var i=e.prototype;return i.content=function(){return this.props.column&&"function"==typeof this.props.column.formatter?this.props.column.formatter(this.props.cell.data,this.props.row,this.props.column):this.props.column&&this.props.column.plugin?y(ht,{pluginId:this.props.column.id,props:{column:this.props.column,cell:this.props.cell,row:this.props.row}}):this.props.cell.data},i.handleClick=function(t){this.props.messageCell||this.config.eventEmitter.emit("cellClick",t,this.props.cell,this.props.column,this.props.row);},i.getCustomAttributes=function(t){return t?"function"==typeof t.attributes?t.attributes(this.props.cell.data,this.props.row,this.props.column):t.attributes:{}},i.render=function(){return y("td",n({role:this.props.role,colSpan:this.props.colSpan,"data-column-id":this.props.column&&this.props.column.id,className:nt(et("td"),this.props.className,this.config.className.td),style:n({},this.props.style,this.config.style.td),onClick:this.handleClick.bind(this)},this.getCustomAttributes(this.props.column)),this.content())},e}(G),zt=function(t){function e(){return t.apply(this,arguments)||this}r(e,t);var n=e.prototype;return n.getColumn=function(t){if(this.props.header){var e=wt.leafColumns(this.props.header.columns);if(e)return e[t]}return null},n.handleClick=function(t){this.props.messageRow||this.config.eventEmitter.emit("rowClick",t,this.props.row);},n.getChildren=function(){var t=this;return this.props.children?this.props.children:y(k,null,this.props.row.cells.map(function(e,n){var r=t.getColumn(n);return r&&r.hidden?null:y(Bt,{key:e.id,cell:e,row:t.props.row,column:r})}))},n.render=function(){return y("tr",{className:nt(et("tr"),this.config.className.tr),onClick:this.handleClick.bind(this)},this.getChildren())},e}(G),qt=function(t){function e(){return t.apply(this,arguments)||this}return r(e,t),e.prototype.render=function(){return y(zt,{messageRow:!0},y(Bt,{role:"alert",colSpan:this.props.colSpan,messageCell:!0,cell:new V(this.props.message),className:nt(et("message"),this.props.className?this.props.className:null)}))},e}(G),Gt=function(t){function e(){return t.apply(this,arguments)||this}r(e,t);var n=e.prototype;return n.headerLength=function(){return this.props.header?this.props.header.visibleColumns.length:0},n.render=function(){var t=this;return y("tbody",{className:nt(et("tbody"),this.config.className.tbody)},this.props.data&&this.props.data.rows.map(function(e){return y(zt,{key:e.id,row:e,header:t.props.header})}),this.props.status===Dt.Loading&&(!this.props.data||0===this.props.data.length)&&y(qt,{message:this._("loading"),colSpan:this.headerLength(),className:nt(et("loading"),this.config.className.loading)}),this.props.status===Dt.Rendered&&this.props.data&&0===this.props.data.length&&y(qt,{message:this._("noRecordsFound"),colSpan:this.headerLength(),className:nt(et("notfound"),this.config.className.notfound)}),this.props.status===Dt.Error&&y(qt,{message:this._("error"),colSpan:this.headerLength(),className:nt(et("error"),this.config.className.error)}))},e}(G),Xt=function(t){function n(){return t.apply(this,arguments)||this}r(n,t);var i=n.prototype;return i.validateProps=function(){for(var t,e=a(this.props.columns);!(t=e()).done;){var n=t.value;void 0===n.direction&&(n.direction=1),1!==n.direction&&-1!==n.direction&&lt.error("Invalid sort direction "+n.direction);}},i.compare=function(t,e){return t>e?1:t<e?-1:0},i.compareWrapper=function(t,e){for(var n,r=0,i=a(this.props.columns);!(n=i()).done;){var o=n.value;if(0!==r)break;var s=t.cells[o.index].data,u=e.cells[o.index].data;r|="function"==typeof o.compare?o.compare(s,u)*o.direction:this.compare(s,u)*o.direction;}return r},i._process=function(t){var e=[].concat(t.rows);e.sort(this.compareWrapper.bind(this));var n=new Z(e);return n.length=t.length,n},e(n,[{key:"type",get:function(){return K.Sort}}]),n}(Q),$t=function(t){function e(){return t.apply(this,arguments)||this}r(e,t);var n=e.prototype;return n.getInitialState=function(){return []},n.handle=function(t,e){"SORT_COLUMN"===t?this.sortColumn(e.index,e.direction,e.multi,e.compare):"SORT_COLUMN_TOGGLE"===t&&this.sortToggle(e.index,e.multi,e.compare);},n.sortToggle=function(t,e,n){var r=[].concat(this.state).find(function(e){return e.index===t});this.sortColumn(t,r&&1===r.direction?-1:1,e,n);},n.sortColumn=function(t,e,n,r){var i=[].concat(this.state),o=i.length,s=i.find(function(e){return e.index===t}),a=!1,u=!1,l=!1,c=!1;if(void 0!==s?n?-1===s.direction?l=!0:c=!0:1===o?c=!0:o>1&&(u=!0,a=!0):0===o?a=!0:o>0&&!n?(a=!0,u=!0):o>0&&n&&(a=!0),u&&(i=[]),a)i.push({index:t,direction:e,compare:r});else if(c){var p=i.indexOf(s);i[p].direction=e;}else if(l){var h=i.indexOf(s);i.splice(h,1);}this.setState(i);},e}(it),Kt=function(t){function e(){return t.apply(this,arguments)||this}r(e,t);var n=e.prototype;return n.sortColumn=function(t,e,n,r){this.dispatch("SORT_COLUMN",{index:t,direction:e,multi:n,compare:r});},n.sortToggle=function(t,e,n){this.dispatch("SORT_COLUMN_TOGGLE",{index:t,multi:e,compare:n});},e}(st),Vt=function(t){function i(){return t.apply(this,arguments)||this}return r(i,t),i.prototype._process=function(t){var e={};return this.props.url&&(e.url=this.props.url(t.url,this.props.columns)),this.props.body&&(e.body=this.props.body(t.body,this.props.columns)),n({},t,e)},e(i,[{key:"type",get:function(){return K.ServerSort}}]),i}(Q),Yt=function(t){function e(e,n){var r;return (r=t.call(this,e,n)||this).sortProcessor=void 0,r.actions=void 0,r.store=void 0,r.updateStateFn=void 0,r.updateSortProcessorFn=void 0,r.actions=new Kt(r.config.dispatcher),r.store=new $t(r.config.dispatcher),e.enabled&&(r.sortProcessor=r.getOrCreateSortProcessor(),r.updateStateFn=r.updateState.bind(o(r)),r.store.on("updated",r.updateStateFn),r.state={direction:0}),r}r(e,t);var i=e.prototype;return i.componentWillUnmount=function(){this.config.pipeline.unregister(this.sortProcessor),this.store.off("updated",this.updateStateFn),this.updateSortProcessorFn&&this.store.off("updated",this.updateSortProcessorFn);},i.updateState=function(){var t=this,e=this.store.state.find(function(e){return e.index===t.props.index});this.setState(e?{direction:e.direction}:{direction:0});},i.updateSortProcessor=function(t){this.sortProcessor.setProps({columns:t});},i.getOrCreateSortProcessor=function(){var t=K.Sort;this.config.sort&&"object"==typeof this.config.sort.server&&(t=K.ServerSort);var e,r=this.config.pipeline.getStepsByType(t);return r.length>0?e=r[0]:(this.updateSortProcessorFn=this.updateSortProcessor.bind(this),this.store.on("updated",this.updateSortProcessorFn),e=t===K.ServerSort?new Vt(n({columns:this.store.state},this.config.sort.server)):new Xt({columns:this.store.state}),this.config.pipeline.register(e)),e},i.changeDirection=function(t){t.preventDefault(),t.stopPropagation(),this.actions.sortToggle(this.props.index,!0===t.shiftKey&&this.config.sort.multiColumn,this.props.compare);},i.render=function(){if(!this.props.enabled)return null;var t=this.state.direction,e="neutral";return 1===t?e="asc":-1===t&&(e="desc"),y("button",{tabIndex:-1,"aria-label":this._("sort.sort"+(1===t?"Desc":"Asc")),title:this._("sort.sort"+(1===t?"Desc":"Asc")),className:nt(et("sort"),et("sort",e),this.config.className.sort),onClick:this.changeDirection.bind(this)})},e}(G),Zt=function(t){function e(){for(var e,n=arguments.length,r=new Array(n),i=0;i<n;i++)r[i]=arguments[i];return (e=t.call.apply(t,[this].concat(r))||this).moveFn=void 0,e.upFn=void 0,e}r(e,t);var n=e.prototype;return n.getPageX=function(t){return t instanceof MouseEvent?Math.floor(t.pageX):Math.floor(t.changedTouches[0].pageX)},n.start=function(t){var e,n,r,i,o;t.stopPropagation(),this.setState({offsetStart:parseInt(this.props.thRef.current.style.width,10)-this.getPageX(t)}),this.upFn=this.end.bind(this),this.moveFn=(e=this.move.bind(this),void 0===(n=10)&&(n=100),function(){var t=[].slice.call(arguments);r?(clearTimeout(i),i=setTimeout(function(){Date.now()-o>=n&&(e.apply(void 0,t),o=Date.now());},Math.max(n-(Date.now()-o),0))):(e.apply(void 0,t),o=Date.now(),r=!0);}),document.addEventListener("mouseup",this.upFn),document.addEventListener("touchend",this.upFn),document.addEventListener("mousemove",this.moveFn),document.addEventListener("touchmove",this.moveFn);},n.move=function(t){t.stopPropagation();var e=this.props.thRef.current;this.state.offsetStart+this.getPageX(t)>=parseInt(e.style.minWidth,10)&&(e.style.width=this.state.offsetStart+this.getPageX(t)+"px");},n.end=function(t){t.stopPropagation(),document.removeEventListener("mouseup",this.upFn),document.removeEventListener("mousemove",this.moveFn),document.removeEventListener("touchmove",this.moveFn),document.removeEventListener("touchend",this.upFn);},n.render=function(){return y("div",{className:nt(et("th"),et("resizable")),onMouseDown:this.start.bind(this),onTouchStart:this.start.bind(this),onClick:function(t){return t.stopPropagation()}})},e}(G),Jt=function(t){function e(e,n){var r;return (r=t.call(this,e,n)||this).sortRef={current:null},r.thRef={current:null},r.state={style:{}},r}r(e,t);var i=e.prototype;return i.isSortable=function(){return this.props.column.sort.enabled},i.isResizable=function(){return this.props.column.resizable},i.onClick=function(t){t.stopPropagation(),this.isSortable()&&this.sortRef.current.changeDirection(t);},i.keyDown=function(t){this.isSortable()&&13===t.which&&this.onClick(t);},i.componentDidMount=function(){var t=this;setTimeout(function(){if(t.props.column.fixedHeader&&t.thRef.current){var e=t.thRef.current.offsetTop;"number"==typeof e&&t.setState({style:{top:e}});}},0);},i.content=function(){return void 0!==this.props.column.name?this.props.column.name:void 0!==this.props.column.plugin?y(ht,{pluginId:this.props.column.plugin.id,props:{column:this.props.column}}):null},i.getCustomAttributes=function(){var t=this.props.column;return t?"function"==typeof t.attributes?t.attributes(null,null,this.props.column):t.attributes:{}},i.render=function(){var t={};return this.isSortable()&&(t.tabIndex=0),y("th",n({ref:this.thRef,"data-column-id":this.props.column&&this.props.column.id,className:nt(et("th"),this.isSortable()?et("th","sort"):null,this.props.column.fixedHeader?et("th","fixed"):null,this.config.className.th),onClick:this.onClick.bind(this),style:n({},this.config.style.th,{minWidth:this.props.column.minWidth,width:this.props.column.width},this.state.style,this.props.style),onKeyDown:this.keyDown.bind(this),rowSpan:this.props.rowSpan>1?this.props.rowSpan:void 0,colSpan:this.props.colSpan>1?this.props.colSpan:void 0},this.getCustomAttributes(),t),y("div",{className:et("th","content")},this.content()),this.isSortable()&&y(Yt,n({ref:this.sortRef,index:this.props.index},this.props.column.sort)),this.isResizable()&&this.props.index<this.config.header.visibleColumns.length-1&&y(Zt,{column:this.props.column,thRef:this.thRef}))},e}(G),Qt=function(t){function e(){return t.apply(this,arguments)||this}r(e,t);var n=e.prototype;return n.renderColumn=function(t,e,n,r){var i=function(t,e,n){var r=wt.maximumDepth(t),i=n-e;return {rowSpan:Math.floor(i-r-r/i),colSpan:t.columns&&t.columns.length||1}}(t,e,r);return y(Jt,{column:t,index:n,colSpan:i.colSpan,rowSpan:i.rowSpan})},n.renderRow=function(t,e,n){var r=this,i=wt.leafColumns(this.props.header.columns);return y(zt,null,t.map(function(t){return t.hidden?null:r.renderColumn(t,e,i.indexOf(t),n)}))},n.renderRows=function(){var t=this,e=wt.tabularFormat(this.props.header.columns);return e.map(function(n,r){return t.renderRow(n,r,e.length)})},n.render=function(){return this.props.header?y("thead",{key:this.props.header.id,className:nt(et("thead"),this.config.className.thead)},this.renderRows()):null},e}(G),te=function(t){function e(){return t.apply(this,arguments)||this}return r(e,t),e.prototype.render=function(){return y("table",{role:"grid",className:nt(et("table"),this.config.className.table),style:n({},this.config.style.table,{height:this.props.height})},y(Qt,{header:this.props.header}),y(Gt,{data:this.props.data,status:this.props.status,header:this.props.header}))},e}(G),ee=function(t){function e(e,n){var r;return (r=t.call(this,e,n)||this).headerRef={current:null},r.state={isActive:!0},r}r(e,t);var i=e.prototype;return i.componentDidMount=function(){0===this.headerRef.current.children.length&&this.setState({isActive:!1});},i.render=function(){return this.state.isActive?y("div",{ref:this.headerRef,className:nt(et("head"),this.config.className.header),style:n({},this.config.style.header)},y(ht,{position:rt.Header})):null},e}(G),ne=function(t){function e(e,n){var r;return (r=t.call(this,e,n)||this).footerRef={current:null},r.state={isActive:!0},r}r(e,t);var i=e.prototype;return i.componentDidMount=function(){0===this.footerRef.current.children.length&&this.setState({isActive:!1});},i.render=function(){return this.state.isActive?y("div",{ref:this.footerRef,className:nt(et("footer"),this.config.className.footer),style:n({},this.config.style.footer)},y(ht,{position:rt.Footer})):null},e}(G),re=function(t){function e(e,n){var r;return (r=t.call(this,e,n)||this).configContext=void 0,r.processPipelineFn=void 0,r.configContext=function(t,e){var n={__c:e="__cC"+f++,__:null,Consumer:function(t,e){return t.children(e)},Provider:function(t){var n,r;return this.getChildContext||(n=[],(r={})[e]=this,this.getChildContext=function(){return r},this.shouldComponentUpdate=function(t){this.props.value!==t.value&&n.some(x);},this.sub=function(t){n.push(t);var e=t.componentWillUnmount;t.componentWillUnmount=function(){n.splice(n.indexOf(t),1),e&&e.call(t);};}),t.children}};return n.Provider.__=n.Consumer.contextType=n}(),r.state={status:Dt.Loading,header:e.header,data:null},r}r(e,t);var i=e.prototype;return i.processPipeline=function(){try{var t=this;t.props.config.eventEmitter.emit("beforeLoad"),t.setState({status:Dt.Loading});var e=function(e,n){try{var r=Promise.resolve(t.props.pipeline.process()).then(function(e){t.setState({data:e,status:Dt.Loaded}),t.props.config.eventEmitter.emit("load",e);});}catch(t){return n(t)}return r&&r.then?r.then(void 0,n):r}(0,function(e){lt.error(e),t.setState({status:Dt.Error,data:null});});return Promise.resolve(e&&e.then?e.then(function(){}):void 0)}catch(t){return Promise.reject(t)}},i.componentDidMount=function(){try{var t=this,e=t.props.config;return Promise.resolve(t.processPipeline()).then(function(){e.header&&t.state.data&&t.state.data.length&&t.setState({header:e.header.adjustWidth(e)}),t.processPipelineFn=t.processPipeline.bind(t),t.props.pipeline.on("updated",t.processPipelineFn);})}catch(t){return Promise.reject(t)}},i.componentWillUnmount=function(){this.props.pipeline.off("updated",this.processPipelineFn);},i.componentDidUpdate=function(t,e){e.status!=Dt.Rendered&&this.state.status==Dt.Loaded&&(this.setState({status:Dt.Rendered}),this.props.config.eventEmitter.emit("ready"));},i.render=function(){return y(this.configContext.Provider,{value:this.props.config},y("div",{role:"complementary",className:nt("gridjs",et("container"),this.state.status===Dt.Loading?et("loading"):null,this.props.config.className.container),style:n({},this.props.config.style.container,{width:this.props.width})},this.state.status===Dt.Loading&&y("div",{className:et("loading-bar")}),y(ee,null),y("div",{className:et("wrapper"),style:{height:this.props.height}},y(te,{ref:this.props.config.tableRef,data:this.state.data,header:this.state.header,width:this.props.width,height:this.props.height,status:this.state.status})),y(ne,null),y("div",{ref:this.props.config.tempRef,id:"gridjs-temp",className:et("temp")})))},e}(G),ie=function(t){function e(e){var n;return (n=t.call(this)||this).config=void 0,n.plugin=void 0,n.config=new Mt({instance:o(n),eventEmitter:o(n)}).update(e),n.plugin=n.config.plugin,n}r(e,t);var n=e.prototype;return n.updateConfig=function(t){return this.config.update(t),this},n.createElement=function(){return y(re,{config:this.config,pipeline:this.config.pipeline,header:this.config.header,width:this.config.width,height:this.config.height})},n.forceRender=function(){return this.config&&this.config.container||lt.error("Container is empty. Make sure you call render() before forceRender()",!0),this.config.pipeline.clearCache(),j(null,this.config.container),j(this.createElement(),this.config.container),this},n.render=function(t){return t||lt.error("Container element cannot be null",!0),t.childNodes.length>0?(lt.error("The container element "+t+" is not empty. Make sure the container is empty and call render() again"),this):(this.config.container=t,j(this.createElement(),t),this)},e}(J),se=[],ae=u.__b,ue=u.__r,le=u.diffed,ce=u.__c,pe=u.unmount;function _e(){se.forEach(function(t){if(t.__P)try{t.__H.__h.forEach(ge),t.__H.__h.forEach(ve),t.__H.__h=[];}catch(e){t.__H.__h=[],u.__e(e,t.__v);}}),se=[];}u.__b=function(t){ae&&ae(t);},u.__r=function(t){ue&&ue(t);var e=(t.__c).__H;e&&(e.__h.forEach(ge),e.__h.forEach(ve),e.__h=[]);},u.diffed=function(t){le&&le(t);var e=t.__c;e&&e.__H&&e.__H.__h.length&&(1!==se.push(e)&&Wt===u.requestAnimationFrame||((Wt=u.requestAnimationFrame)||function(t){var e,n=function(){clearTimeout(r),me&&cancelAnimationFrame(e),setTimeout(t);},r=setTimeout(n,100);me&&(e=requestAnimationFrame(n));})(_e));},u.__c=function(t,e){e.some(function(t){try{t.__h.forEach(ge),t.__h=t.__h.filter(function(t){return !t.__||ve(t)});}catch(n){e.some(function(t){t.__h&&(t.__h=[]);}),e=[],u.__e(n,t.__v);}}),ce&&ce(t,e);},u.unmount=function(t){pe&&pe(t);var e=t.__c;if(e&&e.__H)try{e.__H.__.forEach(ge);}catch(t){u.__e(t,e.__v);}};var me="function"==typeof requestAnimationFrame;function ge(t){"function"==typeof t.__c&&t.__c();}function ve(t){t.__c=t.__();}

    var css_248z = ".gridjs-footer button,.gridjs-head button{background-color:transparent;background-image:none;border:none;cursor:pointer;margin:0;outline:none;padding:0}.gridjs-temp{position:relative}.gridjs-head{margin-bottom:5px;padding:5px 1px;width:100%}.gridjs-head:after{clear:both;content:\"\";display:block}.gridjs-head:empty{border:none;padding:0}.gridjs-container{color:#000;display:inline-block;overflow:hidden;padding:2px;position:relative;z-index:0}.gridjs-footer{background-color:#fff;border-bottom-width:1px;border-color:#e5e7eb;border-radius:0 0 8px 8px;border-top:1px solid #e5e7eb;box-shadow:0 1px 3px 0 rgba(0,0,0,.1),0 1px 2px 0 rgba(0,0,0,.26);display:block;padding:12px 24px;position:relative;width:100%;z-index:5}.gridjs-footer:empty{border:none;padding:0}input.gridjs-input{-webkit-appearance:none;-moz-appearance:none;appearance:none;background-color:#fff;border:1px solid #d2d6dc;border-radius:5px;font-size:14px;line-height:1.45;outline:none;padding:10px 13px}input.gridjs-input:focus{border-color:#9bc2f7;box-shadow:0 0 0 3px rgba(149,189,243,.5)}.gridjs-pagination{color:#3d4044}.gridjs-pagination:after{clear:both;content:\"\";display:block}.gridjs-pagination .gridjs-summary{float:left;margin-top:5px}.gridjs-pagination .gridjs-pages{float:right}.gridjs-pagination .gridjs-pages button{background-color:#fff;border:1px solid #d2d6dc;border-right:none;outline:none;padding:5px 14px;-webkit-user-select:none;-moz-user-select:none;-ms-user-select:none;user-select:none}.gridjs-pagination .gridjs-pages button:focus{box-shadow:0 0 0 2px rgba(149,189,243,.5)}.gridjs-pagination .gridjs-pages button:hover{background-color:#f7f7f7;color:#3c4257;outline:none}.gridjs-pagination .gridjs-pages button:disabled,.gridjs-pagination .gridjs-pages button:hover:disabled,.gridjs-pagination .gridjs-pages button[disabled]{background-color:#fff;color:#6b7280;cursor:default}.gridjs-pagination .gridjs-pages button.gridjs-spread{background-color:#fff;box-shadow:none;cursor:default}.gridjs-pagination .gridjs-pages button.gridjs-currentPage{background-color:#f7f7f7;font-weight:700}.gridjs-pagination .gridjs-pages button:last-child{border-bottom-right-radius:6px;border-right:1px solid #d2d6dc;border-top-right-radius:6px}.gridjs-pagination .gridjs-pages button:first-child{border-bottom-left-radius:6px;border-top-left-radius:6px}button.gridjs-sort{background-color:transparent;background-position-x:center;background-repeat:no-repeat;background-size:contain;border:none;cursor:pointer;float:right;height:24px;margin:0;outline:none;padding:0;width:13px}button.gridjs-sort-neutral{background-image:url(\"data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MDEuOTk4IiBoZWlnaHQ9IjQwMS45OTgiIHN0eWxlPSJlbmFibGUtYmFja2dyb3VuZDpuZXcgMCAwIDQwMS45OTggNDAxLjk5OCIgeG1sOnNwYWNlPSJwcmVzZXJ2ZSI+PHBhdGggZD0iTTczLjA5MiAxNjQuNDUyaDI1NS44MTNjNC45NDkgMCA5LjIzMy0xLjgwNyAxMi44NDgtNS40MjQgMy42MTMtMy42MTYgNS40MjctNy44OTggNS40MjctMTIuODQ3cy0xLjgxMy05LjIyOS01LjQyNy0xMi44NUwyMTMuODQ2IDUuNDI0QzIxMC4yMzIgMS44MTIgMjA1Ljk1MSAwIDIwMC45OTkgMHMtOS4yMzMgMS44MTItMTIuODUgNS40MjRMNjAuMjQyIDEzMy4zMzFjLTMuNjE3IDMuNjE3LTUuNDI0IDcuOTAxLTUuNDI0IDEyLjg1IDAgNC45NDggMS44MDcgOS4yMzEgNS40MjQgMTIuODQ3IDMuNjIxIDMuNjE3IDcuOTAyIDUuNDI0IDEyLjg1IDUuNDI0ek0zMjguOTA1IDIzNy41NDlINzMuMDkyYy00Ljk1MiAwLTkuMjMzIDEuODA4LTEyLjg1IDUuNDIxLTMuNjE3IDMuNjE3LTUuNDI0IDcuODk4LTUuNDI0IDEyLjg0N3MxLjgwNyA5LjIzMyA1LjQyNCAxMi44NDhMMTg4LjE0OSAzOTYuNTdjMy42MjEgMy42MTcgNy45MDIgNS40MjggMTIuODUgNS40MjhzOS4yMzMtMS44MTEgMTIuODQ3LTUuNDI4bDEyNy45MDctMTI3LjkwNmMzLjYxMy0zLjYxNCA1LjQyNy03Ljg5OCA1LjQyNy0xMi44NDggMC00Ljk0OC0xLjgxMy05LjIyOS01LjQyNy0xMi44NDctMy42MTQtMy42MTYtNy44OTktNS40Mi0xMi44NDgtNS40MnoiLz48L3N2Zz4=\");background-position-y:center;opacity:.3}button.gridjs-sort-asc{background-image:url(\"data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyOTIuMzYyIiBoZWlnaHQ9IjI5Mi4zNjEiIHN0eWxlPSJlbmFibGUtYmFja2dyb3VuZDpuZXcgMCAwIDI5Mi4zNjIgMjkyLjM2MSIgeG1sOnNwYWNlPSJwcmVzZXJ2ZSI+PHBhdGggZD0iTTI4Ni45MzUgMTk3LjI4NyAxNTkuMDI4IDY5LjM4MWMtMy42MTMtMy42MTctNy44OTUtNS40MjQtMTIuODQ3LTUuNDI0cy05LjIzMyAxLjgwNy0xMi44NSA1LjQyNEw1LjQyNCAxOTcuMjg3QzEuODA3IDIwMC45MDQgMCAyMDUuMTg2IDAgMjEwLjEzNHMxLjgwNyA5LjIzMyA1LjQyNCAxMi44NDdjMy42MjEgMy42MTcgNy45MDIgNS40MjUgMTIuODUgNS40MjVoMjU1LjgxM2M0Ljk0OSAwIDkuMjMzLTEuODA4IDEyLjg0OC01LjQyNSAzLjYxMy0zLjYxMyA1LjQyNy03Ljg5OCA1LjQyNy0xMi44NDdzLTEuODE0LTkuMjMtNS40MjctMTIuODQ3eiIvPjwvc3ZnPg==\");background-position-y:35%;background-size:10px}button.gridjs-sort-desc{background-image:url(\"data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyOTIuMzYyIiBoZWlnaHQ9IjI5Mi4zNjIiIHN0eWxlPSJlbmFibGUtYmFja2dyb3VuZDpuZXcgMCAwIDI5Mi4zNjIgMjkyLjM2MiIgeG1sOnNwYWNlPSJwcmVzZXJ2ZSI+PHBhdGggZD0iTTI4Ni45MzUgNjkuMzc3Yy0zLjYxNC0zLjYxNy03Ljg5OC01LjQyNC0xMi44NDgtNS40MjRIMTguMjc0Yy00Ljk1MiAwLTkuMjMzIDEuODA3LTEyLjg1IDUuNDI0QzEuODA3IDcyLjk5OCAwIDc3LjI3OSAwIDgyLjIyOGMwIDQuOTQ4IDEuODA3IDkuMjI5IDUuNDI0IDEyLjg0N2wxMjcuOTA3IDEyNy45MDdjMy42MjEgMy42MTcgNy45MDIgNS40MjggMTIuODUgNS40MjhzOS4yMzMtMS44MTEgMTIuODQ3LTUuNDI4TDI4Ni45MzUgOTUuMDc0YzMuNjEzLTMuNjE3IDUuNDI3LTcuODk4IDUuNDI3LTEyLjg0NyAwLTQuOTQ4LTEuODE0LTkuMjI5LTUuNDI3LTEyLjg1eiIvPjwvc3ZnPg==\");background-position-y:65%;background-size:10px}button.gridjs-sort:focus{outline:none}table.gridjs-table{border-collapse:collapse;display:table;margin:0;max-width:100%;overflow:auto;padding:0;table-layout:fixed;text-align:left}.gridjs-tbody,td.gridjs-td{background-color:#fff}td.gridjs-td{border:1px solid #e5e7eb;box-sizing:content-box;padding:12px 24px}td.gridjs-td:first-child{border-left:none}td.gridjs-td:last-child{border-right:none}td.gridjs-message{text-align:center}th.gridjs-th{background-color:#f9fafb;border:1px solid #e5e7eb;border-top:none;box-sizing:border-box;color:#6b7280;outline:none;padding:14px 24px;position:relative;-webkit-user-select:none;-moz-user-select:none;-ms-user-select:none;user-select:none;vertical-align:middle;white-space:nowrap}th.gridjs-th .gridjs-th-content{float:left;overflow:hidden;text-overflow:ellipsis;width:100%}th.gridjs-th-sort{cursor:pointer}th.gridjs-th-sort .gridjs-th-content{width:calc(100% - 15px)}th.gridjs-th-sort:focus,th.gridjs-th-sort:hover{background-color:#e5e7eb}th.gridjs-th-fixed{box-shadow:0 1px 0 0 #e5e7eb;position:sticky}@supports (-moz-appearance:none){th.gridjs-th-fixed{box-shadow:0 0 0 1px #e5e7eb}}th.gridjs-th:first-child{border-left:none}th.gridjs-th:last-child{border-right:none}.gridjs-tr{border:none}.gridjs-tr-selected td{background-color:#ebf5ff}.gridjs-tr:last-child td{border-bottom:0}.gridjs *,.gridjs :after,.gridjs :before{box-sizing:border-box}.gridjs-wrapper{-webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale;border-color:#e5e7eb;border-radius:8px 8px 0 0;border-top-width:1px;box-shadow:0 1px 3px 0 rgba(0,0,0,.1),0 1px 2px 0 rgba(0,0,0,.26);display:block;overflow:auto;position:relative;width:100%;z-index:1}.gridjs-wrapper:nth-last-of-type(2){border-bottom-width:1px;border-radius:8px}.gridjs-search{float:left}.gridjs-search-input{width:250px}.gridjs-loading-bar{background-color:#fff;opacity:.5;z-index:10}.gridjs-loading-bar,.gridjs-loading-bar:after{bottom:0;left:0;position:absolute;right:0;top:0}.gridjs-loading-bar:after{-webkit-animation:shimmer 2s infinite;animation:shimmer 2s infinite;background-image:linear-gradient(90deg,hsla(0,0%,80%,0),hsla(0,0%,80%,.2) 20%,hsla(0,0%,80%,.5) 60%,hsla(0,0%,80%,0));content:\"\";transform:translateX(-100%)}@-webkit-keyframes shimmer{to{transform:translateX(100%)}}@keyframes shimmer{to{transform:translateX(100%)}}.gridjs-td .gridjs-checkbox{cursor:pointer;display:block;margin:auto}.gridjs-resizable{bottom:0;position:absolute;right:0;top:0;width:5px}.gridjs-resizable:hover{background-color:#9bc2f7;cursor:ew-resize}";
    styleInject(css_248z);

    var __create = Object.create;
    var __defProp = Object.defineProperty;
    var __getProtoOf = Object.getPrototypeOf;
    var __hasOwnProp = Object.prototype.hasOwnProperty;
    var __getOwnPropNames = Object.getOwnPropertyNames;
    var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
    var __markAsModule = (target) => __defProp(target, "__esModule", {value: true});
    var __commonJS = (callback, module) => () => {
      if (!module) {
        module = {exports: {}};
        callback(module.exports, module);
      }
      return module.exports;
    };
    var __exportStar = (target, module, desc) => {
      if (module && typeof module === "object" || typeof module === "function") {
        for (let key of __getOwnPropNames(module))
          if (!__hasOwnProp.call(target, key) && key !== "default")
            __defProp(target, key, {get: () => module[key], enumerable: !(desc = __getOwnPropDesc(module, key)) || desc.enumerable});
      }
      return target;
    };
    var __toModule = (module) => {
      return __exportStar(__markAsModule(__defProp(module != null ? __create(__getProtoOf(module)) : {}, "default", module && module.__esModule && "default" in module ? {get: () => module.default, enumerable: true} : {value: module, enumerable: true})), module);
    };

    // node_modules/@vue/shared/dist/shared.cjs.js
    var require_shared_cjs = __commonJS((exports) => {
      Object.defineProperty(exports, "__esModule", {value: true});
      function makeMap(str, expectsLowerCase) {
        const map = Object.create(null);
        const list = str.split(",");
        for (let i = 0; i < list.length; i++) {
          map[list[i]] = true;
        }
        return expectsLowerCase ? (val) => !!map[val.toLowerCase()] : (val) => !!map[val];
      }
      var PatchFlagNames = {
        [1]: `TEXT`,
        [2]: `CLASS`,
        [4]: `STYLE`,
        [8]: `PROPS`,
        [16]: `FULL_PROPS`,
        [32]: `HYDRATE_EVENTS`,
        [64]: `STABLE_FRAGMENT`,
        [128]: `KEYED_FRAGMENT`,
        [256]: `UNKEYED_FRAGMENT`,
        [512]: `NEED_PATCH`,
        [1024]: `DYNAMIC_SLOTS`,
        [2048]: `DEV_ROOT_FRAGMENT`,
        [-1]: `HOISTED`,
        [-2]: `BAIL`
      };
      var slotFlagsText = {
        [1]: "STABLE",
        [2]: "DYNAMIC",
        [3]: "FORWARDED"
      };
      var GLOBALS_WHITE_LISTED = "Infinity,undefined,NaN,isFinite,isNaN,parseFloat,parseInt,decodeURI,decodeURIComponent,encodeURI,encodeURIComponent,Math,Number,Date,Array,Object,Boolean,String,RegExp,Map,Set,JSON,Intl,BigInt";
      var isGloballyWhitelisted = /* @__PURE__ */ makeMap(GLOBALS_WHITE_LISTED);
      var range = 2;
      function generateCodeFrame(source, start2 = 0, end = source.length) {
        const lines = source.split(/\r?\n/);
        let count = 0;
        const res = [];
        for (let i = 0; i < lines.length; i++) {
          count += lines[i].length + 1;
          if (count >= start2) {
            for (let j = i - range; j <= i + range || end > count; j++) {
              if (j < 0 || j >= lines.length)
                continue;
              const line = j + 1;
              res.push(`${line}${" ".repeat(Math.max(3 - String(line).length, 0))}|  ${lines[j]}`);
              const lineLength = lines[j].length;
              if (j === i) {
                const pad = start2 - (count - lineLength) + 1;
                const length = Math.max(1, end > count ? lineLength - pad : end - start2);
                res.push(`   |  ` + " ".repeat(pad) + "^".repeat(length));
              } else if (j > i) {
                if (end > count) {
                  const length = Math.max(Math.min(end - count, lineLength), 1);
                  res.push(`   |  ` + "^".repeat(length));
                }
                count += lineLength + 1;
              }
            }
            break;
          }
        }
        return res.join("\n");
      }
      var specialBooleanAttrs = `itemscope,allowfullscreen,formnovalidate,ismap,nomodule,novalidate,readonly`;
      var isSpecialBooleanAttr = /* @__PURE__ */ makeMap(specialBooleanAttrs);
      var isBooleanAttr2 = /* @__PURE__ */ makeMap(specialBooleanAttrs + `,async,autofocus,autoplay,controls,default,defer,disabled,hidden,loop,open,required,reversed,scoped,seamless,checked,muted,multiple,selected`);
      var unsafeAttrCharRE = /[>/="'\u0009\u000a\u000c\u0020]/;
      var attrValidationCache = {};
      function isSSRSafeAttrName(name) {
        if (attrValidationCache.hasOwnProperty(name)) {
          return attrValidationCache[name];
        }
        const isUnsafe = unsafeAttrCharRE.test(name);
        if (isUnsafe) {
          console.error(`unsafe attribute name: ${name}`);
        }
        return attrValidationCache[name] = !isUnsafe;
      }
      var propsToAttrMap = {
        acceptCharset: "accept-charset",
        className: "class",
        htmlFor: "for",
        httpEquiv: "http-equiv"
      };
      var isNoUnitNumericStyleProp = /* @__PURE__ */ makeMap(`animation-iteration-count,border-image-outset,border-image-slice,border-image-width,box-flex,box-flex-group,box-ordinal-group,column-count,columns,flex,flex-grow,flex-positive,flex-shrink,flex-negative,flex-order,grid-row,grid-row-end,grid-row-span,grid-row-start,grid-column,grid-column-end,grid-column-span,grid-column-start,font-weight,line-clamp,line-height,opacity,order,orphans,tab-size,widows,z-index,zoom,fill-opacity,flood-opacity,stop-opacity,stroke-dasharray,stroke-dashoffset,stroke-miterlimit,stroke-opacity,stroke-width`);
      var isKnownAttr = /* @__PURE__ */ makeMap(`accept,accept-charset,accesskey,action,align,allow,alt,async,autocapitalize,autocomplete,autofocus,autoplay,background,bgcolor,border,buffered,capture,challenge,charset,checked,cite,class,code,codebase,color,cols,colspan,content,contenteditable,contextmenu,controls,coords,crossorigin,csp,data,datetime,decoding,default,defer,dir,dirname,disabled,download,draggable,dropzone,enctype,enterkeyhint,for,form,formaction,formenctype,formmethod,formnovalidate,formtarget,headers,height,hidden,high,href,hreflang,http-equiv,icon,id,importance,integrity,ismap,itemprop,keytype,kind,label,lang,language,loading,list,loop,low,manifest,max,maxlength,minlength,media,min,multiple,muted,name,novalidate,open,optimum,pattern,ping,placeholder,poster,preload,radiogroup,readonly,referrerpolicy,rel,required,reversed,rows,rowspan,sandbox,scope,scoped,selected,shape,size,sizes,slot,span,spellcheck,src,srcdoc,srclang,srcset,start,step,style,summary,tabindex,target,title,translate,type,usemap,value,width,wrap`);
      function normalizeStyle(value) {
        if (isArray(value)) {
          const res = {};
          for (let i = 0; i < value.length; i++) {
            const item = value[i];
            const normalized = normalizeStyle(isString(item) ? parseStringStyle(item) : item);
            if (normalized) {
              for (const key in normalized) {
                res[key] = normalized[key];
              }
            }
          }
          return res;
        } else if (isObject(value)) {
          return value;
        }
      }
      var listDelimiterRE = /;(?![^(]*\))/g;
      var propertyDelimiterRE = /:(.+)/;
      function parseStringStyle(cssText) {
        const ret = {};
        cssText.split(listDelimiterRE).forEach((item) => {
          if (item) {
            const tmp = item.split(propertyDelimiterRE);
            tmp.length > 1 && (ret[tmp[0].trim()] = tmp[1].trim());
          }
        });
        return ret;
      }
      function stringifyStyle(styles) {
        let ret = "";
        if (!styles) {
          return ret;
        }
        for (const key in styles) {
          const value = styles[key];
          const normalizedKey = key.startsWith(`--`) ? key : hyphenate(key);
          if (isString(value) || typeof value === "number" && isNoUnitNumericStyleProp(normalizedKey)) {
            ret += `${normalizedKey}:${value};`;
          }
        }
        return ret;
      }
      function normalizeClass(value) {
        let res = "";
        if (isString(value)) {
          res = value;
        } else if (isArray(value)) {
          for (let i = 0; i < value.length; i++) {
            const normalized = normalizeClass(value[i]);
            if (normalized) {
              res += normalized + " ";
            }
          }
        } else if (isObject(value)) {
          for (const name in value) {
            if (value[name]) {
              res += name + " ";
            }
          }
        }
        return res.trim();
      }
      var HTML_TAGS = "html,body,base,head,link,meta,style,title,address,article,aside,footer,header,h1,h2,h3,h4,h5,h6,hgroup,nav,section,div,dd,dl,dt,figcaption,figure,picture,hr,img,li,main,ol,p,pre,ul,a,b,abbr,bdi,bdo,br,cite,code,data,dfn,em,i,kbd,mark,q,rp,rt,rtc,ruby,s,samp,small,span,strong,sub,sup,time,u,var,wbr,area,audio,map,track,video,embed,object,param,source,canvas,script,noscript,del,ins,caption,col,colgroup,table,thead,tbody,td,th,tr,button,datalist,fieldset,form,input,label,legend,meter,optgroup,option,output,progress,select,textarea,details,dialog,menu,summary,template,blockquote,iframe,tfoot";
      var SVG_TAGS = "svg,animate,animateMotion,animateTransform,circle,clipPath,color-profile,defs,desc,discard,ellipse,feBlend,feColorMatrix,feComponentTransfer,feComposite,feConvolveMatrix,feDiffuseLighting,feDisplacementMap,feDistanceLight,feDropShadow,feFlood,feFuncA,feFuncB,feFuncG,feFuncR,feGaussianBlur,feImage,feMerge,feMergeNode,feMorphology,feOffset,fePointLight,feSpecularLighting,feSpotLight,feTile,feTurbulence,filter,foreignObject,g,hatch,hatchpath,image,line,linearGradient,marker,mask,mesh,meshgradient,meshpatch,meshrow,metadata,mpath,path,pattern,polygon,polyline,radialGradient,rect,set,solidcolor,stop,switch,symbol,text,textPath,title,tspan,unknown,use,view";
      var VOID_TAGS = "area,base,br,col,embed,hr,img,input,link,meta,param,source,track,wbr";
      var isHTMLTag = /* @__PURE__ */ makeMap(HTML_TAGS);
      var isSVGTag = /* @__PURE__ */ makeMap(SVG_TAGS);
      var isVoidTag = /* @__PURE__ */ makeMap(VOID_TAGS);
      var escapeRE = /["'&<>]/;
      function escapeHtml(string) {
        const str = "" + string;
        const match = escapeRE.exec(str);
        if (!match) {
          return str;
        }
        let html = "";
        let escaped;
        let index;
        let lastIndex = 0;
        for (index = match.index; index < str.length; index++) {
          switch (str.charCodeAt(index)) {
            case 34:
              escaped = "&quot;";
              break;
            case 38:
              escaped = "&amp;";
              break;
            case 39:
              escaped = "&#39;";
              break;
            case 60:
              escaped = "&lt;";
              break;
            case 62:
              escaped = "&gt;";
              break;
            default:
              continue;
          }
          if (lastIndex !== index) {
            html += str.substring(lastIndex, index);
          }
          lastIndex = index + 1;
          html += escaped;
        }
        return lastIndex !== index ? html + str.substring(lastIndex, index) : html;
      }
      var commentStripRE = /^-?>|<!--|-->|--!>|<!-$/g;
      function escapeHtmlComment(src) {
        return src.replace(commentStripRE, "");
      }
      function looseCompareArrays(a, b) {
        if (a.length !== b.length)
          return false;
        let equal = true;
        for (let i = 0; equal && i < a.length; i++) {
          equal = looseEqual(a[i], b[i]);
        }
        return equal;
      }
      function looseEqual(a, b) {
        if (a === b)
          return true;
        let aValidType = isDate(a);
        let bValidType = isDate(b);
        if (aValidType || bValidType) {
          return aValidType && bValidType ? a.getTime() === b.getTime() : false;
        }
        aValidType = isArray(a);
        bValidType = isArray(b);
        if (aValidType || bValidType) {
          return aValidType && bValidType ? looseCompareArrays(a, b) : false;
        }
        aValidType = isObject(a);
        bValidType = isObject(b);
        if (aValidType || bValidType) {
          if (!aValidType || !bValidType) {
            return false;
          }
          const aKeysCount = Object.keys(a).length;
          const bKeysCount = Object.keys(b).length;
          if (aKeysCount !== bKeysCount) {
            return false;
          }
          for (const key in a) {
            const aHasKey = a.hasOwnProperty(key);
            const bHasKey = b.hasOwnProperty(key);
            if (aHasKey && !bHasKey || !aHasKey && bHasKey || !looseEqual(a[key], b[key])) {
              return false;
            }
          }
        }
        return String(a) === String(b);
      }
      function looseIndexOf(arr, val) {
        return arr.findIndex((item) => looseEqual(item, val));
      }
      var toDisplayString = (val) => {
        return val == null ? "" : isObject(val) ? JSON.stringify(val, replacer, 2) : String(val);
      };
      var replacer = (_key, val) => {
        if (isMap(val)) {
          return {
            [`Map(${val.size})`]: [...val.entries()].reduce((entries, [key, val2]) => {
              entries[`${key} =>`] = val2;
              return entries;
            }, {})
          };
        } else if (isSet(val)) {
          return {
            [`Set(${val.size})`]: [...val.values()]
          };
        } else if (isObject(val) && !isArray(val) && !isPlainObject(val)) {
          return String(val);
        }
        return val;
      };
      var babelParserDefaultPlugins = [
        "bigInt",
        "optionalChaining",
        "nullishCoalescingOperator"
      ];
      var EMPTY_OBJ = Object.freeze({});
      var EMPTY_ARR = Object.freeze([]);
      var NOOP = () => {
      };
      var NO = () => false;
      var onRE = /^on[^a-z]/;
      var isOn = (key) => onRE.test(key);
      var isModelListener = (key) => key.startsWith("onUpdate:");
      var extend = Object.assign;
      var remove = (arr, el) => {
        const i = arr.indexOf(el);
        if (i > -1) {
          arr.splice(i, 1);
        }
      };
      var hasOwnProperty = Object.prototype.hasOwnProperty;
      var hasOwn = (val, key) => hasOwnProperty.call(val, key);
      var isArray = Array.isArray;
      var isMap = (val) => toTypeString(val) === "[object Map]";
      var isSet = (val) => toTypeString(val) === "[object Set]";
      var isDate = (val) => val instanceof Date;
      var isFunction = (val) => typeof val === "function";
      var isString = (val) => typeof val === "string";
      var isSymbol = (val) => typeof val === "symbol";
      var isObject = (val) => val !== null && typeof val === "object";
      var isPromise = (val) => {
        return isObject(val) && isFunction(val.then) && isFunction(val.catch);
      };
      var objectToString = Object.prototype.toString;
      var toTypeString = (value) => objectToString.call(value);
      var toRawType = (value) => {
        return toTypeString(value).slice(8, -1);
      };
      var isPlainObject = (val) => toTypeString(val) === "[object Object]";
      var isIntegerKey = (key) => isString(key) && key !== "NaN" && key[0] !== "-" && "" + parseInt(key, 10) === key;
      var isReservedProp = /* @__PURE__ */ makeMap(",key,ref,onVnodeBeforeMount,onVnodeMounted,onVnodeBeforeUpdate,onVnodeUpdated,onVnodeBeforeUnmount,onVnodeUnmounted");
      var cacheStringFunction = (fn) => {
        const cache = Object.create(null);
        return (str) => {
          const hit = cache[str];
          return hit || (cache[str] = fn(str));
        };
      };
      var camelizeRE = /-(\w)/g;
      var camelize = cacheStringFunction((str) => {
        return str.replace(camelizeRE, (_, c) => c ? c.toUpperCase() : "");
      });
      var hyphenateRE = /\B([A-Z])/g;
      var hyphenate = cacheStringFunction((str) => str.replace(hyphenateRE, "-$1").toLowerCase());
      var capitalize = cacheStringFunction((str) => str.charAt(0).toUpperCase() + str.slice(1));
      var toHandlerKey = cacheStringFunction((str) => str ? `on${capitalize(str)}` : ``);
      var hasChanged = (value, oldValue) => value !== oldValue && (value === value || oldValue === oldValue);
      var invokeArrayFns = (fns, arg) => {
        for (let i = 0; i < fns.length; i++) {
          fns[i](arg);
        }
      };
      var def = (obj, key, value) => {
        Object.defineProperty(obj, key, {
          configurable: true,
          enumerable: false,
          value
        });
      };
      var toNumber = (val) => {
        const n = parseFloat(val);
        return isNaN(n) ? val : n;
      };
      var _globalThis;
      var getGlobalThis = () => {
        return _globalThis || (_globalThis = typeof globalThis !== "undefined" ? globalThis : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : typeof global !== "undefined" ? global : {});
      };
      exports.EMPTY_ARR = EMPTY_ARR;
      exports.EMPTY_OBJ = EMPTY_OBJ;
      exports.NO = NO;
      exports.NOOP = NOOP;
      exports.PatchFlagNames = PatchFlagNames;
      exports.babelParserDefaultPlugins = babelParserDefaultPlugins;
      exports.camelize = camelize;
      exports.capitalize = capitalize;
      exports.def = def;
      exports.escapeHtml = escapeHtml;
      exports.escapeHtmlComment = escapeHtmlComment;
      exports.extend = extend;
      exports.generateCodeFrame = generateCodeFrame;
      exports.getGlobalThis = getGlobalThis;
      exports.hasChanged = hasChanged;
      exports.hasOwn = hasOwn;
      exports.hyphenate = hyphenate;
      exports.invokeArrayFns = invokeArrayFns;
      exports.isArray = isArray;
      exports.isBooleanAttr = isBooleanAttr2;
      exports.isDate = isDate;
      exports.isFunction = isFunction;
      exports.isGloballyWhitelisted = isGloballyWhitelisted;
      exports.isHTMLTag = isHTMLTag;
      exports.isIntegerKey = isIntegerKey;
      exports.isKnownAttr = isKnownAttr;
      exports.isMap = isMap;
      exports.isModelListener = isModelListener;
      exports.isNoUnitNumericStyleProp = isNoUnitNumericStyleProp;
      exports.isObject = isObject;
      exports.isOn = isOn;
      exports.isPlainObject = isPlainObject;
      exports.isPromise = isPromise;
      exports.isReservedProp = isReservedProp;
      exports.isSSRSafeAttrName = isSSRSafeAttrName;
      exports.isSVGTag = isSVGTag;
      exports.isSet = isSet;
      exports.isSpecialBooleanAttr = isSpecialBooleanAttr;
      exports.isString = isString;
      exports.isSymbol = isSymbol;
      exports.isVoidTag = isVoidTag;
      exports.looseEqual = looseEqual;
      exports.looseIndexOf = looseIndexOf;
      exports.makeMap = makeMap;
      exports.normalizeClass = normalizeClass;
      exports.normalizeStyle = normalizeStyle;
      exports.objectToString = objectToString;
      exports.parseStringStyle = parseStringStyle;
      exports.propsToAttrMap = propsToAttrMap;
      exports.remove = remove;
      exports.slotFlagsText = slotFlagsText;
      exports.stringifyStyle = stringifyStyle;
      exports.toDisplayString = toDisplayString;
      exports.toHandlerKey = toHandlerKey;
      exports.toNumber = toNumber;
      exports.toRawType = toRawType;
      exports.toTypeString = toTypeString;
    });

    // node_modules/@vue/shared/index.js
    var require_shared = __commonJS((exports, module) => {
      {
        module.exports = require_shared_cjs();
      }
    });

    // node_modules/@vue/reactivity/dist/reactivity.cjs.js
    var require_reactivity_cjs = __commonJS((exports) => {
      Object.defineProperty(exports, "__esModule", {value: true});
      var shared = require_shared();
      var targetMap = new WeakMap();
      var effectStack = [];
      var activeEffect;
      var ITERATE_KEY = Symbol("iterate");
      var MAP_KEY_ITERATE_KEY = Symbol("Map key iterate");
      function isEffect(fn) {
        return fn && fn._isEffect === true;
      }
      function effect3(fn, options = shared.EMPTY_OBJ) {
        if (isEffect(fn)) {
          fn = fn.raw;
        }
        const effect4 = createReactiveEffect(fn, options);
        if (!options.lazy) {
          effect4();
        }
        return effect4;
      }
      function stop2(effect4) {
        if (effect4.active) {
          cleanup(effect4);
          if (effect4.options.onStop) {
            effect4.options.onStop();
          }
          effect4.active = false;
        }
      }
      var uid = 0;
      function createReactiveEffect(fn, options) {
        const effect4 = function reactiveEffect() {
          if (!effect4.active) {
            return fn();
          }
          if (!effectStack.includes(effect4)) {
            cleanup(effect4);
            try {
              enableTracking();
              effectStack.push(effect4);
              activeEffect = effect4;
              return fn();
            } finally {
              effectStack.pop();
              resetTracking();
              activeEffect = effectStack[effectStack.length - 1];
            }
          }
        };
        effect4.id = uid++;
        effect4.allowRecurse = !!options.allowRecurse;
        effect4._isEffect = true;
        effect4.active = true;
        effect4.raw = fn;
        effect4.deps = [];
        effect4.options = options;
        return effect4;
      }
      function cleanup(effect4) {
        const {deps} = effect4;
        if (deps.length) {
          for (let i = 0; i < deps.length; i++) {
            deps[i].delete(effect4);
          }
          deps.length = 0;
        }
      }
      var shouldTrack = true;
      var trackStack = [];
      function pauseTracking() {
        trackStack.push(shouldTrack);
        shouldTrack = false;
      }
      function enableTracking() {
        trackStack.push(shouldTrack);
        shouldTrack = true;
      }
      function resetTracking() {
        const last = trackStack.pop();
        shouldTrack = last === void 0 ? true : last;
      }
      function track(target, type, key) {
        if (!shouldTrack || activeEffect === void 0) {
          return;
        }
        let depsMap = targetMap.get(target);
        if (!depsMap) {
          targetMap.set(target, depsMap = new Map());
        }
        let dep = depsMap.get(key);
        if (!dep) {
          depsMap.set(key, dep = new Set());
        }
        if (!dep.has(activeEffect)) {
          dep.add(activeEffect);
          activeEffect.deps.push(dep);
          if (activeEffect.options.onTrack) {
            activeEffect.options.onTrack({
              effect: activeEffect,
              target,
              type,
              key
            });
          }
        }
      }
      function trigger(target, type, key, newValue, oldValue, oldTarget) {
        const depsMap = targetMap.get(target);
        if (!depsMap) {
          return;
        }
        const effects = new Set();
        const add2 = (effectsToAdd) => {
          if (effectsToAdd) {
            effectsToAdd.forEach((effect4) => {
              if (effect4 !== activeEffect || effect4.allowRecurse) {
                effects.add(effect4);
              }
            });
          }
        };
        if (type === "clear") {
          depsMap.forEach(add2);
        } else if (key === "length" && shared.isArray(target)) {
          depsMap.forEach((dep, key2) => {
            if (key2 === "length" || key2 >= newValue) {
              add2(dep);
            }
          });
        } else {
          if (key !== void 0) {
            add2(depsMap.get(key));
          }
          switch (type) {
            case "add":
              if (!shared.isArray(target)) {
                add2(depsMap.get(ITERATE_KEY));
                if (shared.isMap(target)) {
                  add2(depsMap.get(MAP_KEY_ITERATE_KEY));
                }
              } else if (shared.isIntegerKey(key)) {
                add2(depsMap.get("length"));
              }
              break;
            case "delete":
              if (!shared.isArray(target)) {
                add2(depsMap.get(ITERATE_KEY));
                if (shared.isMap(target)) {
                  add2(depsMap.get(MAP_KEY_ITERATE_KEY));
                }
              }
              break;
            case "set":
              if (shared.isMap(target)) {
                add2(depsMap.get(ITERATE_KEY));
              }
              break;
          }
        }
        const run = (effect4) => {
          if (effect4.options.onTrigger) {
            effect4.options.onTrigger({
              effect: effect4,
              target,
              key,
              type,
              newValue,
              oldValue,
              oldTarget
            });
          }
          if (effect4.options.scheduler) {
            effect4.options.scheduler(effect4);
          } else {
            effect4();
          }
        };
        effects.forEach(run);
      }
      var isNonTrackableKeys = /* @__PURE__ */ shared.makeMap(`__proto__,__v_isRef,__isVue`);
      var builtInSymbols = new Set(Object.getOwnPropertyNames(Symbol).map((key) => Symbol[key]).filter(shared.isSymbol));
      var get2 = /* @__PURE__ */ createGetter();
      var shallowGet = /* @__PURE__ */ createGetter(false, true);
      var readonlyGet = /* @__PURE__ */ createGetter(true);
      var shallowReadonlyGet = /* @__PURE__ */ createGetter(true, true);
      var arrayInstrumentations = {};
      ["includes", "indexOf", "lastIndexOf"].forEach((key) => {
        const method = Array.prototype[key];
        arrayInstrumentations[key] = function(...args) {
          const arr = toRaw2(this);
          for (let i = 0, l = this.length; i < l; i++) {
            track(arr, "get", i + "");
          }
          const res = method.apply(arr, args);
          if (res === -1 || res === false) {
            return method.apply(arr, args.map(toRaw2));
          } else {
            return res;
          }
        };
      });
      ["push", "pop", "shift", "unshift", "splice"].forEach((key) => {
        const method = Array.prototype[key];
        arrayInstrumentations[key] = function(...args) {
          pauseTracking();
          const res = method.apply(this, args);
          resetTracking();
          return res;
        };
      });
      function createGetter(isReadonly2 = false, shallow = false) {
        return function get3(target, key, receiver) {
          if (key === "__v_isReactive") {
            return !isReadonly2;
          } else if (key === "__v_isReadonly") {
            return isReadonly2;
          } else if (key === "__v_raw" && receiver === (isReadonly2 ? shallow ? shallowReadonlyMap : readonlyMap : shallow ? shallowReactiveMap : reactiveMap).get(target)) {
            return target;
          }
          const targetIsArray = shared.isArray(target);
          if (!isReadonly2 && targetIsArray && shared.hasOwn(arrayInstrumentations, key)) {
            return Reflect.get(arrayInstrumentations, key, receiver);
          }
          const res = Reflect.get(target, key, receiver);
          if (shared.isSymbol(key) ? builtInSymbols.has(key) : isNonTrackableKeys(key)) {
            return res;
          }
          if (!isReadonly2) {
            track(target, "get", key);
          }
          if (shallow) {
            return res;
          }
          if (isRef(res)) {
            const shouldUnwrap = !targetIsArray || !shared.isIntegerKey(key);
            return shouldUnwrap ? res.value : res;
          }
          if (shared.isObject(res)) {
            return isReadonly2 ? readonly(res) : reactive3(res);
          }
          return res;
        };
      }
      var set2 = /* @__PURE__ */ createSetter();
      var shallowSet = /* @__PURE__ */ createSetter(true);
      function createSetter(shallow = false) {
        return function set3(target, key, value, receiver) {
          let oldValue = target[key];
          if (!shallow) {
            value = toRaw2(value);
            oldValue = toRaw2(oldValue);
            if (!shared.isArray(target) && isRef(oldValue) && !isRef(value)) {
              oldValue.value = value;
              return true;
            }
          }
          const hadKey = shared.isArray(target) && shared.isIntegerKey(key) ? Number(key) < target.length : shared.hasOwn(target, key);
          const result = Reflect.set(target, key, value, receiver);
          if (target === toRaw2(receiver)) {
            if (!hadKey) {
              trigger(target, "add", key, value);
            } else if (shared.hasChanged(value, oldValue)) {
              trigger(target, "set", key, value, oldValue);
            }
          }
          return result;
        };
      }
      function deleteProperty(target, key) {
        const hadKey = shared.hasOwn(target, key);
        const oldValue = target[key];
        const result = Reflect.deleteProperty(target, key);
        if (result && hadKey) {
          trigger(target, "delete", key, void 0, oldValue);
        }
        return result;
      }
      function has(target, key) {
        const result = Reflect.has(target, key);
        if (!shared.isSymbol(key) || !builtInSymbols.has(key)) {
          track(target, "has", key);
        }
        return result;
      }
      function ownKeys(target) {
        track(target, "iterate", shared.isArray(target) ? "length" : ITERATE_KEY);
        return Reflect.ownKeys(target);
      }
      var mutableHandlers = {
        get: get2,
        set: set2,
        deleteProperty,
        has,
        ownKeys
      };
      var readonlyHandlers = {
        get: readonlyGet,
        set(target, key) {
          {
            console.warn(`Set operation on key "${String(key)}" failed: target is readonly.`, target);
          }
          return true;
        },
        deleteProperty(target, key) {
          {
            console.warn(`Delete operation on key "${String(key)}" failed: target is readonly.`, target);
          }
          return true;
        }
      };
      var shallowReactiveHandlers = shared.extend({}, mutableHandlers, {
        get: shallowGet,
        set: shallowSet
      });
      var shallowReadonlyHandlers = shared.extend({}, readonlyHandlers, {
        get: shallowReadonlyGet
      });
      var toReactive = (value) => shared.isObject(value) ? reactive3(value) : value;
      var toReadonly = (value) => shared.isObject(value) ? readonly(value) : value;
      var toShallow = (value) => value;
      var getProto = (v) => Reflect.getPrototypeOf(v);
      function get$1(target, key, isReadonly2 = false, isShallow = false) {
        target = target["__v_raw"];
        const rawTarget = toRaw2(target);
        const rawKey = toRaw2(key);
        if (key !== rawKey) {
          !isReadonly2 && track(rawTarget, "get", key);
        }
        !isReadonly2 && track(rawTarget, "get", rawKey);
        const {has: has2} = getProto(rawTarget);
        const wrap = isShallow ? toShallow : isReadonly2 ? toReadonly : toReactive;
        if (has2.call(rawTarget, key)) {
          return wrap(target.get(key));
        } else if (has2.call(rawTarget, rawKey)) {
          return wrap(target.get(rawKey));
        } else if (target !== rawTarget) {
          target.get(key);
        }
      }
      function has$1(key, isReadonly2 = false) {
        const target = this["__v_raw"];
        const rawTarget = toRaw2(target);
        const rawKey = toRaw2(key);
        if (key !== rawKey) {
          !isReadonly2 && track(rawTarget, "has", key);
        }
        !isReadonly2 && track(rawTarget, "has", rawKey);
        return key === rawKey ? target.has(key) : target.has(key) || target.has(rawKey);
      }
      function size(target, isReadonly2 = false) {
        target = target["__v_raw"];
        !isReadonly2 && track(toRaw2(target), "iterate", ITERATE_KEY);
        return Reflect.get(target, "size", target);
      }
      function add(value) {
        value = toRaw2(value);
        const target = toRaw2(this);
        const proto = getProto(target);
        const hadKey = proto.has.call(target, value);
        if (!hadKey) {
          target.add(value);
          trigger(target, "add", value, value);
        }
        return this;
      }
      function set$1(key, value) {
        value = toRaw2(value);
        const target = toRaw2(this);
        const {has: has2, get: get3} = getProto(target);
        let hadKey = has2.call(target, key);
        if (!hadKey) {
          key = toRaw2(key);
          hadKey = has2.call(target, key);
        } else {
          checkIdentityKeys(target, has2, key);
        }
        const oldValue = get3.call(target, key);
        target.set(key, value);
        if (!hadKey) {
          trigger(target, "add", key, value);
        } else if (shared.hasChanged(value, oldValue)) {
          trigger(target, "set", key, value, oldValue);
        }
        return this;
      }
      function deleteEntry(key) {
        const target = toRaw2(this);
        const {has: has2, get: get3} = getProto(target);
        let hadKey = has2.call(target, key);
        if (!hadKey) {
          key = toRaw2(key);
          hadKey = has2.call(target, key);
        } else {
          checkIdentityKeys(target, has2, key);
        }
        const oldValue = get3 ? get3.call(target, key) : void 0;
        const result = target.delete(key);
        if (hadKey) {
          trigger(target, "delete", key, void 0, oldValue);
        }
        return result;
      }
      function clear() {
        const target = toRaw2(this);
        const hadItems = target.size !== 0;
        const oldTarget = shared.isMap(target) ? new Map(target) : new Set(target);
        const result = target.clear();
        if (hadItems) {
          trigger(target, "clear", void 0, void 0, oldTarget);
        }
        return result;
      }
      function createForEach(isReadonly2, isShallow) {
        return function forEach(callback, thisArg) {
          const observed = this;
          const target = observed["__v_raw"];
          const rawTarget = toRaw2(target);
          const wrap = isShallow ? toShallow : isReadonly2 ? toReadonly : toReactive;
          !isReadonly2 && track(rawTarget, "iterate", ITERATE_KEY);
          return target.forEach((value, key) => {
            return callback.call(thisArg, wrap(value), wrap(key), observed);
          });
        };
      }
      function createIterableMethod(method, isReadonly2, isShallow) {
        return function(...args) {
          const target = this["__v_raw"];
          const rawTarget = toRaw2(target);
          const targetIsMap = shared.isMap(rawTarget);
          const isPair = method === "entries" || method === Symbol.iterator && targetIsMap;
          const isKeyOnly = method === "keys" && targetIsMap;
          const innerIterator = target[method](...args);
          const wrap = isShallow ? toShallow : isReadonly2 ? toReadonly : toReactive;
          !isReadonly2 && track(rawTarget, "iterate", isKeyOnly ? MAP_KEY_ITERATE_KEY : ITERATE_KEY);
          return {
            next() {
              const {value, done} = innerIterator.next();
              return done ? {value, done} : {
                value: isPair ? [wrap(value[0]), wrap(value[1])] : wrap(value),
                done
              };
            },
            [Symbol.iterator]() {
              return this;
            }
          };
        };
      }
      function createReadonlyMethod(type) {
        return function(...args) {
          {
            const key = args[0] ? `on key "${args[0]}" ` : ``;
            console.warn(`${shared.capitalize(type)} operation ${key}failed: target is readonly.`, toRaw2(this));
          }
          return type === "delete" ? false : this;
        };
      }
      var mutableInstrumentations = {
        get(key) {
          return get$1(this, key);
        },
        get size() {
          return size(this);
        },
        has: has$1,
        add,
        set: set$1,
        delete: deleteEntry,
        clear,
        forEach: createForEach(false, false)
      };
      var shallowInstrumentations = {
        get(key) {
          return get$1(this, key, false, true);
        },
        get size() {
          return size(this);
        },
        has: has$1,
        add,
        set: set$1,
        delete: deleteEntry,
        clear,
        forEach: createForEach(false, true)
      };
      var readonlyInstrumentations = {
        get(key) {
          return get$1(this, key, true);
        },
        get size() {
          return size(this, true);
        },
        has(key) {
          return has$1.call(this, key, true);
        },
        add: createReadonlyMethod("add"),
        set: createReadonlyMethod("set"),
        delete: createReadonlyMethod("delete"),
        clear: createReadonlyMethod("clear"),
        forEach: createForEach(true, false)
      };
      var shallowReadonlyInstrumentations = {
        get(key) {
          return get$1(this, key, true, true);
        },
        get size() {
          return size(this, true);
        },
        has(key) {
          return has$1.call(this, key, true);
        },
        add: createReadonlyMethod("add"),
        set: createReadonlyMethod("set"),
        delete: createReadonlyMethod("delete"),
        clear: createReadonlyMethod("clear"),
        forEach: createForEach(true, true)
      };
      var iteratorMethods = ["keys", "values", "entries", Symbol.iterator];
      iteratorMethods.forEach((method) => {
        mutableInstrumentations[method] = createIterableMethod(method, false, false);
        readonlyInstrumentations[method] = createIterableMethod(method, true, false);
        shallowInstrumentations[method] = createIterableMethod(method, false, true);
        shallowReadonlyInstrumentations[method] = createIterableMethod(method, true, true);
      });
      function createInstrumentationGetter(isReadonly2, shallow) {
        const instrumentations = shallow ? isReadonly2 ? shallowReadonlyInstrumentations : shallowInstrumentations : isReadonly2 ? readonlyInstrumentations : mutableInstrumentations;
        return (target, key, receiver) => {
          if (key === "__v_isReactive") {
            return !isReadonly2;
          } else if (key === "__v_isReadonly") {
            return isReadonly2;
          } else if (key === "__v_raw") {
            return target;
          }
          return Reflect.get(shared.hasOwn(instrumentations, key) && key in target ? instrumentations : target, key, receiver);
        };
      }
      var mutableCollectionHandlers = {
        get: createInstrumentationGetter(false, false)
      };
      var shallowCollectionHandlers = {
        get: createInstrumentationGetter(false, true)
      };
      var readonlyCollectionHandlers = {
        get: createInstrumentationGetter(true, false)
      };
      var shallowReadonlyCollectionHandlers = {
        get: createInstrumentationGetter(true, true)
      };
      function checkIdentityKeys(target, has2, key) {
        const rawKey = toRaw2(key);
        if (rawKey !== key && has2.call(target, rawKey)) {
          const type = shared.toRawType(target);
          console.warn(`Reactive ${type} contains both the raw and reactive versions of the same object${type === `Map` ? ` as keys` : ``}, which can lead to inconsistencies. Avoid differentiating between the raw and reactive versions of an object and only use the reactive version if possible.`);
        }
      }
      var reactiveMap = new WeakMap();
      var shallowReactiveMap = new WeakMap();
      var readonlyMap = new WeakMap();
      var shallowReadonlyMap = new WeakMap();
      function targetTypeMap(rawType) {
        switch (rawType) {
          case "Object":
          case "Array":
            return 1;
          case "Map":
          case "Set":
          case "WeakMap":
          case "WeakSet":
            return 2;
          default:
            return 0;
        }
      }
      function getTargetType(value) {
        return value["__v_skip"] || !Object.isExtensible(value) ? 0 : targetTypeMap(shared.toRawType(value));
      }
      function reactive3(target) {
        if (target && target["__v_isReadonly"]) {
          return target;
        }
        return createReactiveObject(target, false, mutableHandlers, mutableCollectionHandlers, reactiveMap);
      }
      function shallowReactive(target) {
        return createReactiveObject(target, false, shallowReactiveHandlers, shallowCollectionHandlers, shallowReactiveMap);
      }
      function readonly(target) {
        return createReactiveObject(target, true, readonlyHandlers, readonlyCollectionHandlers, readonlyMap);
      }
      function shallowReadonly(target) {
        return createReactiveObject(target, true, shallowReadonlyHandlers, shallowReadonlyCollectionHandlers, shallowReadonlyMap);
      }
      function createReactiveObject(target, isReadonly2, baseHandlers, collectionHandlers, proxyMap) {
        if (!shared.isObject(target)) {
          {
            console.warn(`value cannot be made reactive: ${String(target)}`);
          }
          return target;
        }
        if (target["__v_raw"] && !(isReadonly2 && target["__v_isReactive"])) {
          return target;
        }
        const existingProxy = proxyMap.get(target);
        if (existingProxy) {
          return existingProxy;
        }
        const targetType = getTargetType(target);
        if (targetType === 0) {
          return target;
        }
        const proxy = new Proxy(target, targetType === 2 ? collectionHandlers : baseHandlers);
        proxyMap.set(target, proxy);
        return proxy;
      }
      function isReactive2(value) {
        if (isReadonly(value)) {
          return isReactive2(value["__v_raw"]);
        }
        return !!(value && value["__v_isReactive"]);
      }
      function isReadonly(value) {
        return !!(value && value["__v_isReadonly"]);
      }
      function isProxy(value) {
        return isReactive2(value) || isReadonly(value);
      }
      function toRaw2(observed) {
        return observed && toRaw2(observed["__v_raw"]) || observed;
      }
      function markRaw(value) {
        shared.def(value, "__v_skip", true);
        return value;
      }
      var convert = (val) => shared.isObject(val) ? reactive3(val) : val;
      function isRef(r) {
        return Boolean(r && r.__v_isRef === true);
      }
      function ref(value) {
        return createRef(value);
      }
      function shallowRef(value) {
        return createRef(value, true);
      }
      var RefImpl = class {
        constructor(_rawValue, _shallow = false) {
          this._rawValue = _rawValue;
          this._shallow = _shallow;
          this.__v_isRef = true;
          this._value = _shallow ? _rawValue : convert(_rawValue);
        }
        get value() {
          track(toRaw2(this), "get", "value");
          return this._value;
        }
        set value(newVal) {
          if (shared.hasChanged(toRaw2(newVal), this._rawValue)) {
            this._rawValue = newVal;
            this._value = this._shallow ? newVal : convert(newVal);
            trigger(toRaw2(this), "set", "value", newVal);
          }
        }
      };
      function createRef(rawValue, shallow = false) {
        if (isRef(rawValue)) {
          return rawValue;
        }
        return new RefImpl(rawValue, shallow);
      }
      function triggerRef(ref2) {
        trigger(toRaw2(ref2), "set", "value", ref2.value);
      }
      function unref(ref2) {
        return isRef(ref2) ? ref2.value : ref2;
      }
      var shallowUnwrapHandlers = {
        get: (target, key, receiver) => unref(Reflect.get(target, key, receiver)),
        set: (target, key, value, receiver) => {
          const oldValue = target[key];
          if (isRef(oldValue) && !isRef(value)) {
            oldValue.value = value;
            return true;
          } else {
            return Reflect.set(target, key, value, receiver);
          }
        }
      };
      function proxyRefs(objectWithRefs) {
        return isReactive2(objectWithRefs) ? objectWithRefs : new Proxy(objectWithRefs, shallowUnwrapHandlers);
      }
      var CustomRefImpl = class {
        constructor(factory) {
          this.__v_isRef = true;
          const {get: get3, set: set3} = factory(() => track(this, "get", "value"), () => trigger(this, "set", "value"));
          this._get = get3;
          this._set = set3;
        }
        get value() {
          return this._get();
        }
        set value(newVal) {
          this._set(newVal);
        }
      };
      function customRef(factory) {
        return new CustomRefImpl(factory);
      }
      function toRefs(object) {
        if (!isProxy(object)) {
          console.warn(`toRefs() expects a reactive object but received a plain one.`);
        }
        const ret = shared.isArray(object) ? new Array(object.length) : {};
        for (const key in object) {
          ret[key] = toRef(object, key);
        }
        return ret;
      }
      var ObjectRefImpl = class {
        constructor(_object, _key) {
          this._object = _object;
          this._key = _key;
          this.__v_isRef = true;
        }
        get value() {
          return this._object[this._key];
        }
        set value(newVal) {
          this._object[this._key] = newVal;
        }
      };
      function toRef(object, key) {
        return isRef(object[key]) ? object[key] : new ObjectRefImpl(object, key);
      }
      var ComputedRefImpl = class {
        constructor(getter, _setter, isReadonly2) {
          this._setter = _setter;
          this._dirty = true;
          this.__v_isRef = true;
          this.effect = effect3(getter, {
            lazy: true,
            scheduler: () => {
              if (!this._dirty) {
                this._dirty = true;
                trigger(toRaw2(this), "set", "value");
              }
            }
          });
          this["__v_isReadonly"] = isReadonly2;
        }
        get value() {
          const self2 = toRaw2(this);
          if (self2._dirty) {
            self2._value = this.effect();
            self2._dirty = false;
          }
          track(self2, "get", "value");
          return self2._value;
        }
        set value(newValue) {
          this._setter(newValue);
        }
      };
      function computed(getterOrOptions) {
        let getter;
        let setter;
        if (shared.isFunction(getterOrOptions)) {
          getter = getterOrOptions;
          setter = () => {
            console.warn("Write operation failed: computed value is readonly");
          };
        } else {
          getter = getterOrOptions.get;
          setter = getterOrOptions.set;
        }
        return new ComputedRefImpl(getter, setter, shared.isFunction(getterOrOptions) || !getterOrOptions.set);
      }
      exports.ITERATE_KEY = ITERATE_KEY;
      exports.computed = computed;
      exports.customRef = customRef;
      exports.effect = effect3;
      exports.enableTracking = enableTracking;
      exports.isProxy = isProxy;
      exports.isReactive = isReactive2;
      exports.isReadonly = isReadonly;
      exports.isRef = isRef;
      exports.markRaw = markRaw;
      exports.pauseTracking = pauseTracking;
      exports.proxyRefs = proxyRefs;
      exports.reactive = reactive3;
      exports.readonly = readonly;
      exports.ref = ref;
      exports.resetTracking = resetTracking;
      exports.shallowReactive = shallowReactive;
      exports.shallowReadonly = shallowReadonly;
      exports.shallowRef = shallowRef;
      exports.stop = stop2;
      exports.toRaw = toRaw2;
      exports.toRef = toRef;
      exports.toRefs = toRefs;
      exports.track = track;
      exports.trigger = trigger;
      exports.triggerRef = triggerRef;
      exports.unref = unref;
    });

    // node_modules/@vue/reactivity/index.js
    var require_reactivity = __commonJS((exports, module) => {
      {
        module.exports = require_reactivity_cjs();
      }
    });

    // packages/alpinejs/src/scheduler.js
    var flushPending = false;
    var flushing = false;
    var queue = [];
    function scheduler(callback) {
      queueJob(callback);
    }
    function queueJob(job) {
      if (!queue.includes(job))
        queue.push(job);
      queueFlush();
    }
    function queueFlush() {
      if (!flushing && !flushPending) {
        flushPending = true;
        queueMicrotask(flushJobs);
      }
    }
    function flushJobs() {
      flushPending = false;
      flushing = true;
      for (let i = 0; i < queue.length; i++) {
        queue[i]();
      }
      queue.length = 0;
      flushing = false;
    }

    // packages/alpinejs/src/reactivity.js
    var reactive;
    var effect;
    var release;
    var raw;
    var shouldSchedule = true;
    function disableEffectScheduling(callback) {
      shouldSchedule = false;
      callback();
      shouldSchedule = true;
    }
    function setReactivityEngine(engine) {
      reactive = engine.reactive;
      release = engine.release;
      effect = (callback) => engine.effect(callback, {scheduler: (task) => {
        if (shouldSchedule) {
          scheduler(task);
        } else {
          task();
        }
      }});
      raw = engine.raw;
    }
    function overrideEffect(override) {
      effect = override;
    }
    function elementBoundEffect(el) {
      let cleanup = () => {
      };
      let wrappedEffect = (callback) => {
        let effectReference = effect(callback);
        if (!el._x_effects) {
          el._x_effects = new Set();
          el._x_runEffects = () => {
            el._x_effects.forEach((i) => i());
          };
        }
        el._x_effects.add(effectReference);
        cleanup = () => {
          if (effectReference === void 0)
            return;
          el._x_effects.delete(effectReference);
          release(effectReference);
        };
      };
      return [wrappedEffect, () => {
        cleanup();
      }];
    }

    // packages/alpinejs/src/mutation.js
    var onAttributeAddeds = [];
    var onElRemoveds = [];
    var onElAddeds = [];
    function onElAdded(callback) {
      onElAddeds.push(callback);
    }
    function onElRemoved(callback) {
      onElRemoveds.push(callback);
    }
    function onAttributesAdded(callback) {
      onAttributeAddeds.push(callback);
    }
    function onAttributeRemoved(el, name, callback) {
      if (!el._x_attributeCleanups)
        el._x_attributeCleanups = {};
      if (!el._x_attributeCleanups[name])
        el._x_attributeCleanups[name] = [];
      el._x_attributeCleanups[name].push(callback);
    }
    function cleanupAttributes(el, names) {
      if (!el._x_attributeCleanups)
        return;
      Object.entries(el._x_attributeCleanups).forEach(([name, value]) => {
        (names === void 0 || names.includes(name)) && value.forEach((i) => i());
        delete el._x_attributeCleanups[name];
      });
    }
    var observer = new MutationObserver(onMutate);
    var currentlyObserving = false;
    function startObservingMutations() {
      observer.observe(document, {subtree: true, childList: true, attributes: true, attributeOldValue: true});
      currentlyObserving = true;
    }
    function stopObservingMutations() {
      observer.disconnect();
      currentlyObserving = false;
    }
    var recordQueue = [];
    var willProcessRecordQueue = false;
    function flushObserver() {
      recordQueue = recordQueue.concat(observer.takeRecords());
      if (recordQueue.length && !willProcessRecordQueue) {
        willProcessRecordQueue = true;
        queueMicrotask(() => {
          processRecordQueue();
          willProcessRecordQueue = false;
        });
      }
    }
    function processRecordQueue() {
      onMutate(recordQueue);
      recordQueue.length = 0;
    }
    function mutateDom(callback) {
      if (!currentlyObserving)
        return callback();
      flushObserver();
      stopObservingMutations();
      let result = callback();
      startObservingMutations();
      return result;
    }
    function onMutate(mutations) {
      let addedNodes = [];
      let removedNodes = [];
      let addedAttributes = new Map();
      let removedAttributes = new Map();
      for (let i = 0; i < mutations.length; i++) {
        if (mutations[i].target._x_ignoreMutationObserver)
          continue;
        if (mutations[i].type === "childList") {
          mutations[i].addedNodes.forEach((node) => node.nodeType === 1 && addedNodes.push(node));
          mutations[i].removedNodes.forEach((node) => node.nodeType === 1 && removedNodes.push(node));
        }
        if (mutations[i].type === "attributes") {
          let el = mutations[i].target;
          let name = mutations[i].attributeName;
          let oldValue = mutations[i].oldValue;
          let add = () => {
            if (!addedAttributes.has(el))
              addedAttributes.set(el, []);
            addedAttributes.get(el).push({name, value: el.getAttribute(name)});
          };
          let remove = () => {
            if (!removedAttributes.has(el))
              removedAttributes.set(el, []);
            removedAttributes.get(el).push(name);
          };
          if (el.hasAttribute(name) && oldValue === null) {
            add();
          } else if (el.hasAttribute(name)) {
            remove();
            add();
          } else {
            remove();
          }
        }
      }
      removedAttributes.forEach((attrs, el) => {
        cleanupAttributes(el, attrs);
      });
      addedAttributes.forEach((attrs, el) => {
        onAttributeAddeds.forEach((i) => i(el, attrs));
      });
      for (let node of addedNodes) {
        if (removedNodes.includes(node))
          continue;
        onElAddeds.forEach((i) => i(node));
      }
      for (let node of removedNodes) {
        if (addedNodes.includes(node))
          continue;
        onElRemoveds.forEach((i) => i(node));
      }
      addedNodes = null;
      removedNodes = null;
      addedAttributes = null;
      removedAttributes = null;
    }

    // packages/alpinejs/src/scope.js
    function addScopeToNode(node, data2, referenceNode) {
      node._x_dataStack = [data2, ...closestDataStack(referenceNode || node)];
      return () => {
        node._x_dataStack = node._x_dataStack.filter((i) => i !== data2);
      };
    }
    function refreshScope(element, scope) {
      let existingScope = element._x_dataStack[0];
      Object.entries(scope).forEach(([key, value]) => {
        existingScope[key] = value;
      });
    }
    function closestDataStack(node) {
      if (node._x_dataStack)
        return node._x_dataStack;
      if (node instanceof ShadowRoot) {
        return closestDataStack(node.host);
      }
      if (!node.parentNode) {
        return [];
      }
      return closestDataStack(node.parentNode);
    }
    function mergeProxies(objects) {
      return new Proxy({}, {
        ownKeys: () => {
          return Array.from(new Set(objects.flatMap((i) => Object.keys(i))));
        },
        has: (target, name) => {
          return objects.some((obj) => obj.hasOwnProperty(name));
        },
        get: (target, name) => {
          return (objects.find((obj) => obj.hasOwnProperty(name)) || {})[name];
        },
        set: (target, name, value) => {
          let closestObjectWithKey = objects.find((obj) => obj.hasOwnProperty(name));
          if (closestObjectWithKey) {
            closestObjectWithKey[name] = value;
          } else {
            objects[objects.length - 1][name] = value;
          }
          return true;
        }
      });
    }

    // packages/alpinejs/src/interceptor.js
    function initInterceptors(data2) {
      let isObject = (val) => typeof val === "object" && !Array.isArray(val) && val !== null;
      let recurse = (obj, basePath = "") => {
        Object.entries(obj).forEach(([key, value]) => {
          let path = basePath === "" ? key : `${basePath}.${key}`;
          if (typeof value === "object" && value !== null && value._x_interceptor) {
            obj[key] = value.initialize(data2, path, key);
          } else {
            if (isObject(value) && value !== obj && !(value instanceof Element)) {
              recurse(value, path);
            }
          }
        });
      };
      return recurse(data2);
    }
    function interceptor(callback, mutateObj = () => {
    }) {
      let obj = {
        initialValue: void 0,
        _x_interceptor: true,
        initialize(data2, path, key) {
          return callback(this.initialValue, () => get(data2, path), (value) => set(data2, path, value), path, key);
        }
      };
      mutateObj(obj);
      return (initialValue) => {
        if (typeof initialValue === "object" && initialValue !== null && initialValue._x_interceptor) {
          let initialize = obj.initialize.bind(obj);
          obj.initialize = (data2, path, key) => {
            let innerValue = initialValue.initialize(data2, path, key);
            obj.initialValue = innerValue;
            return initialize(data2, path, key);
          };
        } else {
          obj.initialValue = initialValue;
        }
        return obj;
      };
    }
    function get(obj, path) {
      return path.split(".").reduce((carry, segment) => carry[segment], obj);
    }
    function set(obj, path, value) {
      if (typeof path === "string")
        path = path.split(".");
      if (path.length === 1)
        obj[path[0]] = value;
      else if (path.length === 0)
        throw error;
      else {
        if (obj[path[0]])
          return set(obj[path[0]], path.slice(1), value);
        else {
          obj[path[0]] = {};
          return set(obj[path[0]], path.slice(1), value);
        }
      }
    }

    // packages/alpinejs/src/magics.js
    var magics = {};
    function magic(name, callback) {
      magics[name] = callback;
    }
    function injectMagics(obj, el) {
      Object.entries(magics).forEach(([name, callback]) => {
        Object.defineProperty(obj, `$${name}`, {
          get() {
            return callback(el, {Alpine: alpine_default, interceptor});
          },
          enumerable: false
        });
      });
      return obj;
    }

    // packages/alpinejs/src/evaluator.js
    function evaluate(el, expression, extras = {}) {
      let result;
      evaluateLater(el, expression)((value) => result = value, extras);
      return result;
    }
    function evaluateLater(...args) {
      return theEvaluatorFunction(...args);
    }
    var theEvaluatorFunction = normalEvaluator;
    function setEvaluator(newEvaluator) {
      theEvaluatorFunction = newEvaluator;
    }
    function normalEvaluator(el, expression) {
      let overriddenMagics = {};
      injectMagics(overriddenMagics, el);
      let dataStack = [overriddenMagics, ...closestDataStack(el)];
      if (typeof expression === "function") {
        return generateEvaluatorFromFunction(dataStack, expression);
      }
      let evaluator = generateEvaluatorFromString(dataStack, expression);
      return tryCatch.bind(null, el, expression, evaluator);
    }
    function generateEvaluatorFromFunction(dataStack, func) {
      return (receiver = () => {
      }, {scope = {}, params = []} = {}) => {
        let result = func.apply(mergeProxies([scope, ...dataStack]), params);
        runIfTypeOfFunction(receiver, result);
      };
    }
    var evaluatorMemo = {};
    function generateFunctionFromString(expression) {
      if (evaluatorMemo[expression]) {
        return evaluatorMemo[expression];
      }
      let AsyncFunction = Object.getPrototypeOf(async function() {
      }).constructor;
      let rightSideSafeExpression = /^[\n\s]*if.*\(.*\)/.test(expression) || /^(let|const)/.test(expression) ? `(() => { ${expression} })()` : expression;
      let func = new AsyncFunction(["__self", "scope"], `with (scope) { __self.result = ${rightSideSafeExpression} }; __self.finished = true; return __self.result;`);
      evaluatorMemo[expression] = func;
      return func;
    }
    function generateEvaluatorFromString(dataStack, expression) {
      let func = generateFunctionFromString(expression);
      return (receiver = () => {
      }, {scope = {}, params = []} = {}) => {
        func.result = void 0;
        func.finished = false;
        let completeScope = mergeProxies([scope, ...dataStack]);
        let promise = func(func, completeScope);
        if (func.finished) {
          runIfTypeOfFunction(receiver, func.result, completeScope, params);
        } else {
          promise.then((result) => {
            runIfTypeOfFunction(receiver, result, completeScope, params);
          });
        }
      };
    }
    function runIfTypeOfFunction(receiver, value, scope, params) {
      if (typeof value === "function") {
        let result = value.apply(scope, params);
        if (result instanceof Promise) {
          result.then((i) => runIfTypeOfFunction(receiver, i, scope, params));
        } else {
          receiver(result);
        }
      } else {
        receiver(value);
      }
    }
    function tryCatch(el, expression, callback, ...args) {
      try {
        return callback(...args);
      } catch (e) {
        console.warn(`Alpine Expression Error: ${e.message}

Expression: "${expression}"

`, el);
        throw e;
      }
    }

    // packages/alpinejs/src/directives.js
    var prefixAsString = "x-";
    function prefix(subject = "") {
      return prefixAsString + subject;
    }
    function setPrefix(newPrefix) {
      prefixAsString = newPrefix;
    }
    var directiveHandlers = {};
    function directive(name, callback) {
      directiveHandlers[name] = callback;
    }
    function directives(el, attributes, originalAttributeOverride) {
      let transformedAttributeMap = {};
      let directives2 = Array.from(attributes).map(toTransformedAttributes((newName, oldName) => transformedAttributeMap[newName] = oldName)).filter(outNonAlpineAttributes).map(toParsedDirectives(transformedAttributeMap, originalAttributeOverride)).sort(byPriority);
      return directives2.map((directive2) => {
        return getDirectiveHandler(el, directive2);
      });
    }
    var isDeferringHandlers = false;
    var directiveHandlerStacks = new Map();
    var currentHandlerStackKey = Symbol();
    function deferHandlingDirectives(callback) {
      isDeferringHandlers = true;
      let key = Symbol();
      currentHandlerStackKey = key;
      directiveHandlerStacks.set(key, []);
      let flushHandlers = () => {
        while (directiveHandlerStacks.get(key).length)
          directiveHandlerStacks.get(key).shift()();
        directiveHandlerStacks.delete(key);
      };
      let stopDeferring = () => {
        isDeferringHandlers = false;
        flushHandlers();
      };
      callback(flushHandlers);
      stopDeferring();
    }
    function getDirectiveHandler(el, directive2) {
      let noop = () => {
      };
      let handler3 = directiveHandlers[directive2.type] || noop;
      let cleanups = [];
      let cleanup = (callback) => cleanups.push(callback);
      let [effect3, cleanupEffect] = elementBoundEffect(el);
      cleanups.push(cleanupEffect);
      let utilities = {
        Alpine: alpine_default,
        effect: effect3,
        cleanup,
        evaluateLater: evaluateLater.bind(evaluateLater, el),
        evaluate: evaluate.bind(evaluate, el)
      };
      let doCleanup = () => cleanups.forEach((i) => i());
      onAttributeRemoved(el, directive2.original, doCleanup);
      let fullHandler = () => {
        if (el._x_ignore || el._x_ignoreSelf)
          return;
        handler3.inline && handler3.inline(el, directive2, utilities);
        handler3 = handler3.bind(handler3, el, directive2, utilities);
        isDeferringHandlers ? directiveHandlerStacks.get(currentHandlerStackKey).push(handler3) : handler3();
      };
      fullHandler.runCleanups = doCleanup;
      return fullHandler;
    }
    var startingWith = (subject, replacement) => ({name, value}) => {
      if (name.startsWith(subject))
        name = name.replace(subject, replacement);
      return {name, value};
    };
    var into = (i) => i;
    function toTransformedAttributes(callback) {
      return ({name, value}) => {
        let {name: newName, value: newValue} = attributeTransformers.reduce((carry, transform) => {
          return transform(carry);
        }, {name, value});
        if (newName !== name)
          callback(newName, name);
        return {name: newName, value: newValue};
      };
    }
    var attributeTransformers = [];
    function mapAttributes(callback) {
      attributeTransformers.push(callback);
    }
    function outNonAlpineAttributes({name}) {
      return alpineAttributeRegex().test(name);
    }
    var alpineAttributeRegex = () => new RegExp(`^${prefixAsString}([^:^.]+)\\b`);
    function toParsedDirectives(transformedAttributeMap, originalAttributeOverride) {
      return ({name, value}) => {
        let typeMatch = name.match(alpineAttributeRegex());
        let valueMatch = name.match(/:([a-zA-Z0-9\-:]+)/);
        let modifiers = name.match(/\.[^.\]]+(?=[^\]]*$)/g) || [];
        let original = originalAttributeOverride || transformedAttributeMap[name] || name;
        return {
          type: typeMatch ? typeMatch[1] : null,
          value: valueMatch ? valueMatch[1] : null,
          modifiers: modifiers.map((i) => i.replace(".", "")),
          expression: value,
          original
        };
      };
    }
    var DEFAULT = "DEFAULT";
    var directiveOrder = [
      "ignore",
      "ref",
      "data",
      "bind",
      "init",
      "for",
      "model",
      "transition",
      "show",
      "if",
      DEFAULT,
      "element"
    ];
    function byPriority(a, b) {
      let typeA = directiveOrder.indexOf(a.type) === -1 ? DEFAULT : a.type;
      let typeB = directiveOrder.indexOf(b.type) === -1 ? DEFAULT : b.type;
      return directiveOrder.indexOf(typeA) - directiveOrder.indexOf(typeB);
    }

    // packages/alpinejs/src/utils/dispatch.js
    function dispatch(el, name, detail = {}) {
      el.dispatchEvent(new CustomEvent(name, {
        detail,
        bubbles: true,
        composed: true,
        cancelable: true
      }));
    }

    // packages/alpinejs/src/nextTick.js
    var tickStack = [];
    var isHolding = false;
    function nextTick(callback) {
      tickStack.push(callback);
      queueMicrotask(() => {
        isHolding || setTimeout(() => {
          releaseNextTicks();
        });
      });
    }
    function releaseNextTicks() {
      isHolding = false;
      while (tickStack.length)
        tickStack.shift()();
    }
    function holdNextTicks() {
      isHolding = true;
    }

    // packages/alpinejs/src/utils/walk.js
    function walk(el, callback) {
      if (el instanceof ShadowRoot) {
        Array.from(el.children).forEach((el2) => walk(el2, callback));
        return;
      }
      let skip = false;
      callback(el, () => skip = true);
      if (skip)
        return;
      let node = el.firstElementChild;
      while (node) {
        walk(node, callback);
        node = node.nextElementSibling;
      }
    }

    // packages/alpinejs/src/utils/warn.js
    function warn(message, ...args) {
      console.warn(`Alpine Warning: ${message}`, ...args);
    }

    // packages/alpinejs/src/lifecycle.js
    function start() {
      if (!document.body)
        warn("Unable to initialize. Trying to load Alpine before `<body>` is available. Did you forget to add `defer` in Alpine's `<script>` tag?");
      dispatch(document, "alpine:init");
      dispatch(document, "alpine:initializing");
      startObservingMutations();
      onElAdded((el) => initTree(el, walk));
      onElRemoved((el) => nextTick(() => destroyTree(el)));
      onAttributesAdded((el, attrs) => {
        directives(el, attrs).forEach((handle) => handle());
      });
      let outNestedComponents = (el) => !closestRoot(el.parentElement);
      Array.from(document.querySelectorAll(allSelectors())).filter(outNestedComponents).forEach((el) => {
        initTree(el);
      });
      dispatch(document, "alpine:initialized");
    }
    var rootSelectorCallbacks = [];
    var initSelectorCallbacks = [];
    function rootSelectors() {
      return rootSelectorCallbacks.map((fn) => fn());
    }
    function allSelectors() {
      return rootSelectorCallbacks.concat(initSelectorCallbacks).map((fn) => fn());
    }
    function addRootSelector(selectorCallback) {
      rootSelectorCallbacks.push(selectorCallback);
    }
    function addInitSelector(selectorCallback) {
      initSelectorCallbacks.push(selectorCallback);
    }
    function closestRoot(el) {
      if (!el)
        return;
      if (rootSelectors().some((selector) => el.matches(selector)))
        return el;
      if (!el.parentElement)
        return;
      return closestRoot(el.parentElement);
    }
    function isRoot(el) {
      return rootSelectors().some((selector) => el.matches(selector));
    }
    function initTree(el, walker = walk) {
      deferHandlingDirectives(() => {
        walker(el, (el2, skip) => {
          directives(el2, el2.attributes).forEach((handle) => handle());
          el2._x_ignore && skip();
        });
      });
    }
    function destroyTree(root) {
      walk(root, (el) => cleanupAttributes(el));
    }

    // packages/alpinejs/src/plugin.js
    function plugin(callback) {
      callback(alpine_default);
    }

    // packages/alpinejs/src/store.js
    var stores = {};
    var isReactive = false;
    function store(name, value) {
      if (!isReactive) {
        stores = reactive(stores);
        isReactive = true;
      }
      if (value === void 0) {
        return stores[name];
      }
      stores[name] = value;
      if (typeof value === "object" && value !== null && value.hasOwnProperty("init") && typeof value.init === "function") {
        stores[name].init();
      }
    }
    function getStores() {
      return stores;
    }

    // packages/alpinejs/src/clone.js
    var isCloning = false;
    function skipDuringClone(callback) {
      return (...args) => isCloning || callback(...args);
    }
    function clone(oldEl, newEl) {
      newEl._x_dataStack = oldEl._x_dataStack;
      isCloning = true;
      dontRegisterReactiveSideEffects(() => {
        cloneTree(newEl);
      });
      isCloning = false;
    }
    function cloneTree(el) {
      let hasRunThroughFirstEl = false;
      let shallowWalker = (el2, callback) => {
        walk(el2, (el3, skip) => {
          if (hasRunThroughFirstEl && isRoot(el3))
            return skip();
          hasRunThroughFirstEl = true;
          callback(el3, skip);
        });
      };
      initTree(el, shallowWalker);
    }
    function dontRegisterReactiveSideEffects(callback) {
      let cache = effect;
      overrideEffect((callback2, el) => {
        let storedEffect = cache(callback2);
        release(storedEffect);
        return () => {
        };
      });
      callback();
      overrideEffect(cache);
    }

    // packages/alpinejs/src/datas.js
    var datas = {};
    function data(name, callback) {
      datas[name] = callback;
    }
    function injectDataProviders(obj, context) {
      Object.entries(datas).forEach(([name, callback]) => {
        Object.defineProperty(obj, name, {
          get() {
            return (...args) => {
              return callback.bind(context)(...args);
            };
          },
          enumerable: false
        });
      });
      return obj;
    }

    // packages/alpinejs/src/alpine.js
    var Alpine = {
      get reactive() {
        return reactive;
      },
      get release() {
        return release;
      },
      get effect() {
        return effect;
      },
      get raw() {
        return raw;
      },
      version: "3.2.4",
      disableEffectScheduling,
      setReactivityEngine,
      addRootSelector,
      mapAttributes,
      evaluateLater,
      setEvaluator,
      closestRoot,
      interceptor,
      mutateDom,
      directive,
      evaluate,
      initTree,
      nextTick,
      prefix: setPrefix,
      plugin,
      magic,
      store,
      start,
      clone,
      data
    };
    var alpine_default = Alpine;

    // packages/alpinejs/src/index.js
    var import_reactivity9 = __toModule(require_reactivity());

    // packages/alpinejs/src/magics/$nextTick.js
    magic("nextTick", () => nextTick);

    // packages/alpinejs/src/magics/$dispatch.js
    magic("dispatch", (el) => dispatch.bind(dispatch, el));

    // packages/alpinejs/src/magics/$watch.js
    magic("watch", (el) => (key, callback) => {
      let evaluate2 = evaluateLater(el, key);
      let firstTime = true;
      let oldValue;
      effect(() => evaluate2((value) => {
        let div = document.createElement("div");
        div.dataset.throwAway = value;
        if (!firstTime) {
          queueMicrotask(() => {
            callback(value, oldValue);
            oldValue = value;
          });
        } else {
          oldValue = value;
        }
        firstTime = false;
      }));
    });

    // packages/alpinejs/src/magics/$store.js
    magic("store", getStores);

    // packages/alpinejs/src/magics/$refs.js
    magic("refs", (el) => closestRoot(el)._x_refs || {});

    // packages/alpinejs/src/magics/$el.js
    magic("el", (el) => el);

    // packages/alpinejs/src/utils/classes.js
    function setClasses(el, value) {
      if (Array.isArray(value)) {
        return setClassesFromString(el, value.join(" "));
      } else if (typeof value === "object" && value !== null) {
        return setClassesFromObject(el, value);
      } else if (typeof value === "function") {
        return setClasses(el, value());
      }
      return setClassesFromString(el, value);
    }
    function setClassesFromString(el, classString) {
      let missingClasses = (classString2) => classString2.split(" ").filter((i) => !el.classList.contains(i)).filter(Boolean);
      let addClassesAndReturnUndo = (classes) => {
        el.classList.add(...classes);
        return () => {
          el.classList.remove(...classes);
        };
      };
      classString = classString === true ? classString = "" : classString || "";
      return addClassesAndReturnUndo(missingClasses(classString));
    }
    function setClassesFromObject(el, classObject) {
      let split = (classString) => classString.split(" ").filter(Boolean);
      let forAdd = Object.entries(classObject).flatMap(([classString, bool]) => bool ? split(classString) : false).filter(Boolean);
      let forRemove = Object.entries(classObject).flatMap(([classString, bool]) => !bool ? split(classString) : false).filter(Boolean);
      let added = [];
      let removed = [];
      forRemove.forEach((i) => {
        if (el.classList.contains(i)) {
          el.classList.remove(i);
          removed.push(i);
        }
      });
      forAdd.forEach((i) => {
        if (!el.classList.contains(i)) {
          el.classList.add(i);
          added.push(i);
        }
      });
      return () => {
        removed.forEach((i) => el.classList.add(i));
        added.forEach((i) => el.classList.remove(i));
      };
    }

    // packages/alpinejs/src/utils/styles.js
    function setStyles(el, value) {
      if (typeof value === "object" && value !== null) {
        return setStylesFromObject(el, value);
      }
      return setStylesFromString(el, value);
    }
    function setStylesFromObject(el, value) {
      let previousStyles = {};
      Object.entries(value).forEach(([key, value2]) => {
        previousStyles[key] = el.style[key];
        el.style.setProperty(kebabCase(key), value2);
      });
      setTimeout(() => {
        if (el.style.length === 0) {
          el.removeAttribute("style");
        }
      });
      return () => {
        setStyles(el, previousStyles);
      };
    }
    function setStylesFromString(el, value) {
      let cache = el.getAttribute("style", value);
      el.setAttribute("style", value);
      return () => {
        el.setAttribute("style", cache);
      };
    }
    function kebabCase(subject) {
      return subject.replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase();
    }

    // packages/alpinejs/src/utils/once.js
    function once(callback, fallback = () => {
    }) {
      let called = false;
      return function() {
        if (!called) {
          called = true;
          callback.apply(this, arguments);
        } else {
          fallback.apply(this, arguments);
        }
      };
    }

    // packages/alpinejs/src/directives/x-transition.js
    directive("transition", (el, {value, modifiers, expression}, {evaluate: evaluate2}) => {
      if (typeof expression === "function")
        expression = evaluate2(expression);
      if (!expression) {
        registerTransitionsFromHelper(el, modifiers, value);
      } else {
        registerTransitionsFromClassString(el, expression, value);
      }
    });
    function registerTransitionsFromClassString(el, classString, stage) {
      registerTransitionObject(el, setClasses, "");
      let directiveStorageMap = {
        enter: (classes) => {
          el._x_transition.enter.during = classes;
        },
        "enter-start": (classes) => {
          el._x_transition.enter.start = classes;
        },
        "enter-end": (classes) => {
          el._x_transition.enter.end = classes;
        },
        leave: (classes) => {
          el._x_transition.leave.during = classes;
        },
        "leave-start": (classes) => {
          el._x_transition.leave.start = classes;
        },
        "leave-end": (classes) => {
          el._x_transition.leave.end = classes;
        }
      };
      directiveStorageMap[stage](classString);
    }
    function registerTransitionsFromHelper(el, modifiers, stage) {
      registerTransitionObject(el, setStyles);
      let doesntSpecify = !modifiers.includes("in") && !modifiers.includes("out") && !stage;
      let transitioningIn = doesntSpecify || modifiers.includes("in") || ["enter"].includes(stage);
      let transitioningOut = doesntSpecify || modifiers.includes("out") || ["leave"].includes(stage);
      if (modifiers.includes("in") && !doesntSpecify) {
        modifiers = modifiers.filter((i, index) => index < modifiers.indexOf("out"));
      }
      if (modifiers.includes("out") && !doesntSpecify) {
        modifiers = modifiers.filter((i, index) => index > modifiers.indexOf("out"));
      }
      let wantsAll = !modifiers.includes("opacity") && !modifiers.includes("scale");
      let wantsOpacity = wantsAll || modifiers.includes("opacity");
      let wantsScale = wantsAll || modifiers.includes("scale");
      let opacityValue = wantsOpacity ? 0 : 1;
      let scaleValue = wantsScale ? modifierValue(modifiers, "scale", 95) / 100 : 1;
      let delay = modifierValue(modifiers, "delay", 0);
      let origin = modifierValue(modifiers, "origin", "center");
      let property = "opacity, transform";
      let durationIn = modifierValue(modifiers, "duration", 150) / 1e3;
      let durationOut = modifierValue(modifiers, "duration", 75) / 1e3;
      let easing = `cubic-bezier(0.4, 0.0, 0.2, 1)`;
      if (transitioningIn) {
        el._x_transition.enter.during = {
          transformOrigin: origin,
          transitionDelay: delay,
          transitionProperty: property,
          transitionDuration: `${durationIn}s`,
          transitionTimingFunction: easing
        };
        el._x_transition.enter.start = {
          opacity: opacityValue,
          transform: `scale(${scaleValue})`
        };
        el._x_transition.enter.end = {
          opacity: 1,
          transform: `scale(1)`
        };
      }
      if (transitioningOut) {
        el._x_transition.leave.during = {
          transformOrigin: origin,
          transitionDelay: delay,
          transitionProperty: property,
          transitionDuration: `${durationOut}s`,
          transitionTimingFunction: easing
        };
        el._x_transition.leave.start = {
          opacity: 1,
          transform: `scale(1)`
        };
        el._x_transition.leave.end = {
          opacity: opacityValue,
          transform: `scale(${scaleValue})`
        };
      }
    }
    function registerTransitionObject(el, setFunction, defaultValue = {}) {
      if (!el._x_transition)
        el._x_transition = {
          enter: {during: defaultValue, start: defaultValue, end: defaultValue},
          leave: {during: defaultValue, start: defaultValue, end: defaultValue},
          in(before = () => {
          }, after = () => {
          }) {
            transition(el, setFunction, {
              during: this.enter.during,
              start: this.enter.start,
              end: this.enter.end,
              entering: true
            }, before, after);
          },
          out(before = () => {
          }, after = () => {
          }) {
            transition(el, setFunction, {
              during: this.leave.during,
              start: this.leave.start,
              end: this.leave.end,
              entering: false
            }, before, after);
          }
        };
    }
    window.Element.prototype._x_toggleAndCascadeWithTransitions = function(el, value, show, hide) {
      let clickAwayCompatibleShow = () => requestAnimationFrame(show);
      if (value) {
        el._x_transition ? el._x_transition.in(show) : clickAwayCompatibleShow();
        return;
      }
      el._x_hidePromise = el._x_transition ? new Promise((resolve, reject) => {
        el._x_transition.out(() => {
        }, () => resolve(hide));
        el._x_transitioning.beforeCancel(() => reject({isFromCancelledTransition: true}));
      }) : Promise.resolve(hide);
      queueMicrotask(() => {
        let closest = closestHide(el);
        if (closest) {
          if (!closest._x_hideChildren)
            closest._x_hideChildren = [];
          closest._x_hideChildren.push(el);
        } else {
          queueMicrotask(() => {
            let hideAfterChildren = (el2) => {
              let carry = Promise.all([
                el2._x_hidePromise,
                ...(el2._x_hideChildren || []).map(hideAfterChildren)
              ]).then(([i]) => i());
              delete el2._x_hidePromise;
              delete el2._x_hideChildren;
              return carry;
            };
            hideAfterChildren(el).catch((e) => {
              if (!e.isFromCancelledTransition)
                throw e;
            });
          });
        }
      });
    };
    function closestHide(el) {
      let parent = el.parentNode;
      if (!parent)
        return;
      return parent._x_hidePromise ? parent : closestHide(parent);
    }
    function transition(el, setFunction, {during, start: start2, end, entering} = {}, before = () => {
    }, after = () => {
    }) {
      if (el._x_transitioning)
        el._x_transitioning.cancel();
      if (Object.keys(during).length === 0 && Object.keys(start2).length === 0 && Object.keys(end).length === 0) {
        before();
        after();
        return;
      }
      let undoStart, undoDuring, undoEnd;
      performTransition(el, {
        start() {
          undoStart = setFunction(el, start2);
        },
        during() {
          undoDuring = setFunction(el, during);
        },
        before,
        end() {
          undoStart();
          undoEnd = setFunction(el, end);
        },
        after,
        cleanup() {
          undoDuring();
          undoEnd();
        }
      }, entering);
    }
    function performTransition(el, stages, entering) {
      let interrupted, reachedBefore, reachedEnd;
      let finish = once(() => {
        mutateDom(() => {
          interrupted = true;
          if (!reachedBefore)
            stages.before();
          if (!reachedEnd) {
            stages.end();
            releaseNextTicks();
          }
          stages.after();
          if (el.isConnected)
            stages.cleanup();
          delete el._x_transitioning;
        });
      });
      el._x_transitioning = {
        beforeCancels: [],
        beforeCancel(callback) {
          this.beforeCancels.push(callback);
        },
        cancel: once(function() {
          while (this.beforeCancels.length) {
            this.beforeCancels.shift()();
          }
          finish();
        }),
        finish,
        entering
      };
      mutateDom(() => {
        stages.start();
        stages.during();
      });
      holdNextTicks();
      requestAnimationFrame(() => {
        if (interrupted)
          return;
        let duration = Number(getComputedStyle(el).transitionDuration.replace(/,.*/, "").replace("s", "")) * 1e3;
        let delay = Number(getComputedStyle(el).transitionDelay.replace(/,.*/, "").replace("s", "")) * 1e3;
        if (duration === 0)
          duration = Number(getComputedStyle(el).animationDuration.replace("s", "")) * 1e3;
        mutateDom(() => {
          stages.before();
        });
        reachedBefore = true;
        requestAnimationFrame(() => {
          if (interrupted)
            return;
          mutateDom(() => {
            stages.end();
          });
          releaseNextTicks();
          setTimeout(el._x_transitioning.finish, duration + delay);
          reachedEnd = true;
        });
      });
    }
    function modifierValue(modifiers, key, fallback) {
      if (modifiers.indexOf(key) === -1)
        return fallback;
      const rawValue = modifiers[modifiers.indexOf(key) + 1];
      if (!rawValue)
        return fallback;
      if (key === "scale") {
        if (isNaN(rawValue))
          return fallback;
      }
      if (key === "duration") {
        let match = rawValue.match(/([0-9]+)ms/);
        if (match)
          return match[1];
      }
      if (key === "origin") {
        if (["top", "right", "left", "center", "bottom"].includes(modifiers[modifiers.indexOf(key) + 2])) {
          return [rawValue, modifiers[modifiers.indexOf(key) + 2]].join(" ");
        }
      }
      return rawValue;
    }

    // packages/alpinejs/src/directives/x-ignore.js
    var handler = () => {
    };
    handler.inline = (el, {modifiers}, {cleanup}) => {
      modifiers.includes("self") ? el._x_ignoreSelf = true : el._x_ignore = true;
      cleanup(() => {
        modifiers.includes("self") ? delete el._x_ignoreSelf : delete el._x_ignore;
      });
    };
    directive("ignore", handler);

    // packages/alpinejs/src/directives/x-effect.js
    directive("effect", (el, {expression}, {effect: effect3}) => effect3(evaluateLater(el, expression)));

    // packages/alpinejs/src/utils/bind.js
    function bind(el, name, value, modifiers = []) {
      if (!el._x_bindings)
        el._x_bindings = reactive({});
      el._x_bindings[name] = value;
      name = modifiers.includes("camel") ? camelCase(name) : name;
      switch (name) {
        case "value":
          bindInputValue(el, value);
          break;
        case "style":
          bindStyles(el, value);
          break;
        case "class":
          bindClasses(el, value);
          break;
        default:
          bindAttribute(el, name, value);
          break;
      }
    }
    function bindInputValue(el, value) {
      if (el.type === "radio") {
        if (el.attributes.value === void 0) {
          el.value = value;
        }
        if (window.fromModel) {
          el.checked = checkedAttrLooseCompare(el.value, value);
        }
      } else if (el.type === "checkbox") {
        if (Number.isInteger(value)) {
          el.value = value;
        } else if (!Number.isInteger(value) && !Array.isArray(value) && typeof value !== "boolean" && ![null, void 0].includes(value)) {
          el.value = String(value);
        } else {
          if (Array.isArray(value)) {
            el.checked = value.some((val) => checkedAttrLooseCompare(val, el.value));
          } else {
            el.checked = !!value;
          }
        }
      } else if (el.tagName === "SELECT") {
        updateSelect(el, value);
      } else {
        if (el.value === value)
          return;
        el.value = value;
      }
    }
    function bindClasses(el, value) {
      if (el._x_undoAddedClasses)
        el._x_undoAddedClasses();
      el._x_undoAddedClasses = setClasses(el, value);
    }
    function bindStyles(el, value) {
      if (el._x_undoAddedStyles)
        el._x_undoAddedStyles();
      el._x_undoAddedStyles = setStyles(el, value);
    }
    function bindAttribute(el, name, value) {
      if ([null, void 0, false].includes(value) && attributeShouldntBePreservedIfFalsy(name)) {
        el.removeAttribute(name);
      } else {
        if (isBooleanAttr(name))
          value = name;
        setIfChanged(el, name, value);
      }
    }
    function setIfChanged(el, attrName, value) {
      if (el.getAttribute(attrName) != value) {
        el.setAttribute(attrName, value);
      }
    }
    function updateSelect(el, value) {
      const arrayWrappedValue = [].concat(value).map((value2) => {
        return value2 + "";
      });
      Array.from(el.options).forEach((option) => {
        option.selected = arrayWrappedValue.includes(option.value);
      });
    }
    function camelCase(subject) {
      return subject.toLowerCase().replace(/-(\w)/g, (match, char) => char.toUpperCase());
    }
    function checkedAttrLooseCompare(valueA, valueB) {
      return valueA == valueB;
    }
    function isBooleanAttr(attrName) {
      const booleanAttributes = [
        "disabled",
        "checked",
        "required",
        "readonly",
        "hidden",
        "open",
        "selected",
        "autofocus",
        "itemscope",
        "multiple",
        "novalidate",
        "allowfullscreen",
        "allowpaymentrequest",
        "formnovalidate",
        "autoplay",
        "controls",
        "loop",
        "muted",
        "playsinline",
        "default",
        "ismap",
        "reversed",
        "async",
        "defer",
        "nomodule"
      ];
      return booleanAttributes.includes(attrName);
    }
    function attributeShouldntBePreservedIfFalsy(name) {
      return !["aria-pressed", "aria-checked"].includes(name);
    }

    // packages/alpinejs/src/utils/on.js
    function on(el, event, modifiers, callback) {
      let listenerTarget = el;
      let handler3 = (e) => callback(e);
      let options = {};
      let wrapHandler = (callback2, wrapper) => (e) => wrapper(callback2, e);
      if (modifiers.includes("dot"))
        event = dotSyntax(event);
      if (modifiers.includes("camel"))
        event = camelCase2(event);
      if (modifiers.includes("passive"))
        options.passive = true;
      if (modifiers.includes("window"))
        listenerTarget = window;
      if (modifiers.includes("document"))
        listenerTarget = document;
      if (modifiers.includes("prevent"))
        handler3 = wrapHandler(handler3, (next, e) => {
          e.preventDefault();
          next(e);
        });
      if (modifiers.includes("stop"))
        handler3 = wrapHandler(handler3, (next, e) => {
          e.stopPropagation();
          next(e);
        });
      if (modifiers.includes("self"))
        handler3 = wrapHandler(handler3, (next, e) => {
          e.target === el && next(e);
        });
      if (modifiers.includes("away") || modifiers.includes("outside")) {
        listenerTarget = document;
        handler3 = wrapHandler(handler3, (next, e) => {
          if (el.contains(e.target))
            return;
          if (el.offsetWidth < 1 && el.offsetHeight < 1)
            return;
          next(e);
        });
      }
      handler3 = wrapHandler(handler3, (next, e) => {
        if (isKeyEvent(event)) {
          if (isListeningForASpecificKeyThatHasntBeenPressed(e, modifiers)) {
            return;
          }
        }
        next(e);
      });
      if (modifiers.includes("debounce")) {
        let nextModifier = modifiers[modifiers.indexOf("debounce") + 1] || "invalid-wait";
        let wait = isNumeric(nextModifier.split("ms")[0]) ? Number(nextModifier.split("ms")[0]) : 250;
        handler3 = debounce(handler3, wait);
      }
      if (modifiers.includes("throttle")) {
        let nextModifier = modifiers[modifiers.indexOf("throttle") + 1] || "invalid-wait";
        let wait = isNumeric(nextModifier.split("ms")[0]) ? Number(nextModifier.split("ms")[0]) : 250;
        handler3 = throttle(handler3, wait);
      }
      if (modifiers.includes("once")) {
        handler3 = wrapHandler(handler3, (next, e) => {
          next(e);
          listenerTarget.removeEventListener(event, handler3, options);
        });
      }
      listenerTarget.addEventListener(event, handler3, options);
      return () => {
        listenerTarget.removeEventListener(event, handler3, options);
      };
    }
    function dotSyntax(subject) {
      return subject.replace(/-/g, ".");
    }
    function camelCase2(subject) {
      return subject.toLowerCase().replace(/-(\w)/g, (match, char) => char.toUpperCase());
    }
    function debounce(func, wait) {
      var timeout;
      return function() {
        var context = this, args = arguments;
        var later = function() {
          timeout = null;
          func.apply(context, args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
      };
    }
    function throttle(func, limit) {
      let inThrottle;
      return function() {
        let context = this, args = arguments;
        if (!inThrottle) {
          func.apply(context, args);
          inThrottle = true;
          setTimeout(() => inThrottle = false, limit);
        }
      };
    }
    function isNumeric(subject) {
      return !Array.isArray(subject) && !isNaN(subject);
    }
    function kebabCase2(subject) {
      return subject.replace(/([a-z])([A-Z])/g, "$1-$2").replace(/[_\s]/, "-").toLowerCase();
    }
    function isKeyEvent(event) {
      return ["keydown", "keyup"].includes(event);
    }
    function isListeningForASpecificKeyThatHasntBeenPressed(e, modifiers) {
      let keyModifiers = modifiers.filter((i) => {
        return !["window", "document", "prevent", "stop", "once"].includes(i);
      });
      if (keyModifiers.includes("debounce")) {
        let debounceIndex = keyModifiers.indexOf("debounce");
        keyModifiers.splice(debounceIndex, isNumeric((keyModifiers[debounceIndex + 1] || "invalid-wait").split("ms")[0]) ? 2 : 1);
      }
      if (keyModifiers.length === 0)
        return false;
      if (keyModifiers.length === 1 && keyToModifiers(e.key).includes(keyModifiers[0]))
        return false;
      const systemKeyModifiers = ["ctrl", "shift", "alt", "meta", "cmd", "super"];
      const selectedSystemKeyModifiers = systemKeyModifiers.filter((modifier) => keyModifiers.includes(modifier));
      keyModifiers = keyModifiers.filter((i) => !selectedSystemKeyModifiers.includes(i));
      if (selectedSystemKeyModifiers.length > 0) {
        const activelyPressedKeyModifiers = selectedSystemKeyModifiers.filter((modifier) => {
          if (modifier === "cmd" || modifier === "super")
            modifier = "meta";
          return e[`${modifier}Key`];
        });
        if (activelyPressedKeyModifiers.length === selectedSystemKeyModifiers.length) {
          if (keyToModifiers(e.key).includes(keyModifiers[0]))
            return false;
        }
      }
      return true;
    }
    function keyToModifiers(key) {
      if (!key)
        return [];
      key = kebabCase2(key);
      let modifierToKeyMap = {
        ctrl: "control",
        slash: "/",
        space: "-",
        spacebar: "-",
        cmd: "meta",
        esc: "escape",
        up: "arrow-up",
        down: "arrow-down",
        left: "arrow-left",
        right: "arrow-right"
      };
      modifierToKeyMap[key] = key;
      return Object.keys(modifierToKeyMap).map((modifier) => {
        if (modifierToKeyMap[modifier] === key)
          return modifier;
      }).filter((modifier) => modifier);
    }

    // packages/alpinejs/src/directives/x-model.js
    directive("model", (el, {modifiers, expression}, {effect: effect3, cleanup}) => {
      let evaluate2 = evaluateLater(el, expression);
      let assignmentExpression = `${expression} = rightSideOfExpression($event, ${expression})`;
      let evaluateAssignment = evaluateLater(el, assignmentExpression);
      var event = el.tagName.toLowerCase() === "select" || ["checkbox", "radio"].includes(el.type) || modifiers.includes("lazy") ? "change" : "input";
      let assigmentFunction = generateAssignmentFunction(el, modifiers, expression);
      let removeListener = on(el, event, modifiers, (e) => {
        evaluateAssignment(() => {
        }, {scope: {
          $event: e,
          rightSideOfExpression: assigmentFunction
        }});
      });
      cleanup(() => removeListener());
      el._x_forceModelUpdate = () => {
        evaluate2((value) => {
          if (value === void 0 && expression.match(/\./))
            value = "";
          window.fromModel = true;
          mutateDom(() => bind(el, "value", value));
          delete window.fromModel;
        });
      };
      effect3(() => {
        if (modifiers.includes("unintrusive") && document.activeElement.isSameNode(el))
          return;
        el._x_forceModelUpdate();
      });
    });
    function generateAssignmentFunction(el, modifiers, expression) {
      if (el.type === "radio") {
        mutateDom(() => {
          if (!el.hasAttribute("name"))
            el.setAttribute("name", expression);
        });
      }
      return (event, currentValue) => {
        return mutateDom(() => {
          if (event instanceof CustomEvent && event.detail !== void 0) {
            return event.detail || event.target.value;
          } else if (el.type === "checkbox") {
            if (Array.isArray(currentValue)) {
              let newValue = modifiers.includes("number") ? safeParseNumber(event.target.value) : event.target.value;
              return event.target.checked ? currentValue.concat([newValue]) : currentValue.filter((el2) => !checkedAttrLooseCompare2(el2, newValue));
            } else {
              return event.target.checked;
            }
          } else if (el.tagName.toLowerCase() === "select" && el.multiple) {
            return modifiers.includes("number") ? Array.from(event.target.selectedOptions).map((option) => {
              let rawValue = option.value || option.text;
              return safeParseNumber(rawValue);
            }) : Array.from(event.target.selectedOptions).map((option) => {
              return option.value || option.text;
            });
          } else {
            let rawValue = event.target.value;
            return modifiers.includes("number") ? safeParseNumber(rawValue) : modifiers.includes("trim") ? rawValue.trim() : rawValue;
          }
        });
      };
    }
    function safeParseNumber(rawValue) {
      let number = rawValue ? parseFloat(rawValue) : null;
      return isNumeric2(number) ? number : rawValue;
    }
    function checkedAttrLooseCompare2(valueA, valueB) {
      return valueA == valueB;
    }
    function isNumeric2(subject) {
      return !Array.isArray(subject) && !isNaN(subject);
    }

    // packages/alpinejs/src/directives/x-cloak.js
    directive("cloak", (el) => queueMicrotask(() => mutateDom(() => el.removeAttribute(prefix("cloak")))));

    // packages/alpinejs/src/directives/x-init.js
    addInitSelector(() => `[${prefix("init")}]`);
    directive("init", skipDuringClone((el, {expression}) => evaluate(el, expression, {})));

    // packages/alpinejs/src/directives/x-text.js
    directive("text", (el, {expression}, {effect: effect3, evaluateLater: evaluateLater2}) => {
      let evaluate2 = evaluateLater2(expression);
      effect3(() => {
        evaluate2((value) => {
          mutateDom(() => {
            el.textContent = value;
          });
        });
      });
    });

    // packages/alpinejs/src/directives/x-html.js
    directive("html", (el, {expression}, {effect: effect3, evaluateLater: evaluateLater2}) => {
      let evaluate2 = evaluateLater2(expression);
      effect3(() => {
        evaluate2((value) => {
          el.innerHTML = value;
        });
      });
    });

    // packages/alpinejs/src/directives/x-bind.js
    mapAttributes(startingWith(":", into(prefix("bind:"))));
    directive("bind", (el, {value, modifiers, expression, original}, {effect: effect3}) => {
      if (!value)
        return applyBindingsObject(el, expression, original, effect3);
      if (value === "key")
        return storeKeyForXFor(el, expression);
      let evaluate2 = evaluateLater(el, expression);
      effect3(() => evaluate2((result) => {
        if (result === void 0 && expression.match(/\./))
          result = "";
        mutateDom(() => bind(el, value, result, modifiers));
      }));
    });
    function applyBindingsObject(el, expression, original, effect3) {
      let getBindings = evaluateLater(el, expression);
      let cleanupRunners = [];
      effect3(() => {
        while (cleanupRunners.length)
          cleanupRunners.pop()();
        getBindings((bindings) => {
          let attributes = Object.entries(bindings).map(([name, value]) => ({name, value}));
          directives(el, attributes, original).map((handle) => {
            cleanupRunners.push(handle.runCleanups);
            handle();
          });
        });
      });
    }
    function storeKeyForXFor(el, expression) {
      el._x_keyExpression = expression;
    }

    // packages/alpinejs/src/directives/x-data.js
    addRootSelector(() => `[${prefix("data")}]`);
    directive("data", skipDuringClone((el, {expression}, {cleanup}) => {
      expression = expression === "" ? "{}" : expression;
      let magicContext = {};
      injectMagics(magicContext, el);
      let dataProviderContext = {};
      injectDataProviders(dataProviderContext, magicContext);
      let data2 = evaluate(el, expression, {scope: dataProviderContext});
      injectMagics(data2, el);
      let reactiveData = reactive(data2);
      initInterceptors(reactiveData);
      let undo = addScopeToNode(el, reactiveData);
      reactiveData["init"] && evaluate(el, reactiveData["init"]);
      cleanup(() => {
        undo();
        reactiveData["destroy"] && evaluate(el, reactiveData["destroy"]);
      });
    }));

    // packages/alpinejs/src/directives/x-show.js
    directive("show", (el, {modifiers, expression}, {effect: effect3}) => {
      let evaluate2 = evaluateLater(el, expression);
      let hide = () => mutateDom(() => {
        el.style.display = "none";
        el._x_isShown = false;
      });
      let show = () => mutateDom(() => {
        if (el.style.length === 1 && el.style.display === "none") {
          el.removeAttribute("style");
        } else {
          el.style.removeProperty("display");
        }
        el._x_isShown = true;
      });
      let clickAwayCompatibleShow = () => setTimeout(show);
      let toggle = once((value) => value ? show() : hide(), (value) => {
        if (typeof el._x_toggleAndCascadeWithTransitions === "function") {
          el._x_toggleAndCascadeWithTransitions(el, value, show, hide);
        } else {
          value ? clickAwayCompatibleShow() : hide();
        }
      });
      let oldValue;
      let firstTime = true;
      effect3(() => evaluate2((value) => {
        if (!firstTime && value === oldValue)
          return;
        if (modifiers.includes("immediate"))
          value ? clickAwayCompatibleShow() : hide();
        toggle(value);
        oldValue = value;
        firstTime = false;
      }));
    });

    // packages/alpinejs/src/directives/x-for.js
    directive("for", (el, {expression}, {effect: effect3, cleanup}) => {
      let iteratorNames = parseForExpression(expression);
      let evaluateItems = evaluateLater(el, iteratorNames.items);
      let evaluateKey = evaluateLater(el, el._x_keyExpression || "index");
      el._x_prevKeys = [];
      el._x_lookup = {};
      effect3(() => loop(el, iteratorNames, evaluateItems, evaluateKey));
      cleanup(() => {
        Object.values(el._x_lookup).forEach((el2) => el2.remove());
        delete el._x_prevKeys;
        delete el._x_lookup;
      });
    });
    function loop(el, iteratorNames, evaluateItems, evaluateKey) {
      let isObject = (i) => typeof i === "object" && !Array.isArray(i);
      let templateEl = el;
      evaluateItems((items) => {
        if (isNumeric3(items) && items >= 0) {
          items = Array.from(Array(items).keys(), (i) => i + 1);
        }
        if (items === void 0)
          items = [];
        let lookup = el._x_lookup;
        let prevKeys = el._x_prevKeys;
        let scopes = [];
        let keys = [];
        if (isObject(items)) {
          items = Object.entries(items).map(([key, value]) => {
            let scope = getIterationScopeVariables(iteratorNames, value, key, items);
            evaluateKey((value2) => keys.push(value2), {scope: {index: key, ...scope}});
            scopes.push(scope);
          });
        } else {
          for (let i = 0; i < items.length; i++) {
            let scope = getIterationScopeVariables(iteratorNames, items[i], i, items);
            evaluateKey((value) => keys.push(value), {scope: {index: i, ...scope}});
            scopes.push(scope);
          }
        }
        let adds = [];
        let moves = [];
        let removes = [];
        let sames = [];
        for (let i = 0; i < prevKeys.length; i++) {
          let key = prevKeys[i];
          if (keys.indexOf(key) === -1)
            removes.push(key);
        }
        prevKeys = prevKeys.filter((key) => !removes.includes(key));
        let lastKey = "template";
        for (let i = 0; i < keys.length; i++) {
          let key = keys[i];
          let prevIndex = prevKeys.indexOf(key);
          if (prevIndex === -1) {
            prevKeys.splice(i, 0, key);
            adds.push([lastKey, i]);
          } else if (prevIndex !== i) {
            let keyInSpot = prevKeys.splice(i, 1)[0];
            let keyForSpot = prevKeys.splice(prevIndex - 1, 1)[0];
            prevKeys.splice(i, 0, keyForSpot);
            prevKeys.splice(prevIndex, 0, keyInSpot);
            moves.push([keyInSpot, keyForSpot]);
          } else {
            sames.push(key);
          }
          lastKey = key;
        }
        for (let i = 0; i < removes.length; i++) {
          let key = removes[i];
          lookup[key].remove();
          lookup[key] = null;
          delete lookup[key];
        }
        for (let i = 0; i < moves.length; i++) {
          let [keyInSpot, keyForSpot] = moves[i];
          let elInSpot = lookup[keyInSpot];
          let elForSpot = lookup[keyForSpot];
          let marker = document.createElement("div");
          mutateDom(() => {
            elForSpot.after(marker);
            elInSpot.after(elForSpot);
            marker.before(elInSpot);
            marker.remove();
          });
          refreshScope(elForSpot, scopes[keys.indexOf(keyForSpot)]);
        }
        for (let i = 0; i < adds.length; i++) {
          let [lastKey2, index] = adds[i];
          let lastEl = lastKey2 === "template" ? templateEl : lookup[lastKey2];
          let scope = scopes[index];
          let key = keys[index];
          let clone2 = document.importNode(templateEl.content, true).firstElementChild;
          addScopeToNode(clone2, reactive(scope), templateEl);
          mutateDom(() => {
            lastEl.after(clone2);
            initTree(clone2);
          });
          if (typeof key === "object") {
            warn("x-for key cannot be an object, it must be a string or an integer", templateEl);
          }
          lookup[key] = clone2;
        }
        for (let i = 0; i < sames.length; i++) {
          refreshScope(lookup[sames[i]], scopes[keys.indexOf(sames[i])]);
        }
        templateEl._x_prevKeys = keys;
      });
    }
    function parseForExpression(expression) {
      let forIteratorRE = /,([^,\}\]]*)(?:,([^,\}\]]*))?$/;
      let stripParensRE = /^\s*\(|\)\s*$/g;
      let forAliasRE = /([\s\S]*?)\s+(?:in|of)\s+([\s\S]*)/;
      let inMatch = expression.match(forAliasRE);
      if (!inMatch)
        return;
      let res = {};
      res.items = inMatch[2].trim();
      let item = inMatch[1].replace(stripParensRE, "").trim();
      let iteratorMatch = item.match(forIteratorRE);
      if (iteratorMatch) {
        res.item = item.replace(forIteratorRE, "").trim();
        res.index = iteratorMatch[1].trim();
        if (iteratorMatch[2]) {
          res.collection = iteratorMatch[2].trim();
        }
      } else {
        res.item = item;
      }
      return res;
    }
    function getIterationScopeVariables(iteratorNames, item, index, items) {
      let scopeVariables = {};
      if (/^\[.*\]$/.test(iteratorNames.item) && Array.isArray(item)) {
        let names = iteratorNames.item.replace("[", "").replace("]", "").split(",").map((i) => i.trim());
        names.forEach((name, i) => {
          scopeVariables[name] = item[i];
        });
      } else {
        scopeVariables[iteratorNames.item] = item;
      }
      if (iteratorNames.index)
        scopeVariables[iteratorNames.index] = index;
      if (iteratorNames.collection)
        scopeVariables[iteratorNames.collection] = items;
      return scopeVariables;
    }
    function isNumeric3(subject) {
      return !Array.isArray(subject) && !isNaN(subject);
    }

    // packages/alpinejs/src/directives/x-ref.js
    function handler2() {
    }
    handler2.inline = (el, {expression}, {cleanup}) => {
      let root = closestRoot(el);
      if (!root._x_refs)
        root._x_refs = {};
      root._x_refs[expression] = el;
      cleanup(() => delete root._x_refs[expression]);
    };
    directive("ref", handler2);

    // packages/alpinejs/src/directives/x-if.js
    directive("if", (el, {expression}, {effect: effect3, cleanup}) => {
      let evaluate2 = evaluateLater(el, expression);
      let show = () => {
        if (el._x_currentIfEl)
          return el._x_currentIfEl;
        let clone2 = el.content.cloneNode(true).firstElementChild;
        addScopeToNode(clone2, {}, el);
        mutateDom(() => {
          el.after(clone2);
          initTree(clone2);
        });
        el._x_currentIfEl = clone2;
        el._x_undoIf = () => {
          clone2.remove();
          delete el._x_currentIfEl;
        };
        return clone2;
      };
      let hide = () => {
        if (!el._x_undoIf)
          return;
        el._x_undoIf();
        delete el._x_undoIf;
      };
      effect3(() => evaluate2((value) => {
        value ? show() : hide();
      }));
      cleanup(() => el._x_undoIf && el._x_undoIf());
    });

    // packages/alpinejs/src/directives/x-on.js
    mapAttributes(startingWith("@", into(prefix("on:"))));
    directive("on", skipDuringClone((el, {value, modifiers, expression}, {cleanup}) => {
      let evaluate2 = expression ? evaluateLater(el, expression) : () => {
      };
      let removeListener = on(el, value, modifiers, (e) => {
        evaluate2(() => {
        }, {scope: {$event: e}, params: [e]});
      });
      cleanup(() => removeListener());
    }));

    // packages/alpinejs/src/index.js
    alpine_default.setEvaluator(normalEvaluator);
    alpine_default.setReactivityEngine({reactive: import_reactivity9.reactive, effect: import_reactivity9.effect, release: import_reactivity9.stop, raw: import_reactivity9.toRaw});
    var src_default = alpine_default;

    // packages/alpinejs/builds/module.js
    var module_default = src_default;

    module_default.start();
    // @ts-ignore:
    window.Alpine = module_default;
    // ==UserScript==
    let init = () => {
        // ==/UserScript== 45654654
        //result gridlet
        let resulGridId = 'result-grid';
        let resultGrid = new ie({
            columns: ['Coupon', 'Amount', 'Message'],
            pagination: {
                enabled: true,
                limit: 6,
            },
            search: true,
            autoWidth: true,
            sort: true,
            data: [],
            className: {
                td: 'table-cell',
            },
        });
        //
        resultGrid.on('rowClick', (ev, row) => {
            // console.log('row: ' + JSON.stringify(row.cells[0].data))
            navigator.clipboard.writeText(row.cells[0].data);
        });
        initUI((text) => __awaiter(void 0, void 0, void 0, function* () {
            let lines = text
                .split(/\r*\n/)
                .map((el) => {
                return el.replace(/\s/g, '');
            })
                .filter((el) => {
                return el != null && el != '';
            });
            //
            let initResultUI = () => {
                let resulGridId = 'result-grid';
                let checkExist = setInterval(() => {
                    // check if the coupon form exist
                    let main = document.getElementById('main');
                    if (main) {
                        //clear the interval
                        clearInterval(checkExist);
                        //id used to style the ui
                        let uiId = 'aliexpress-bulk-coupons-tester-result';
                        let ui = document.getElementById(uiId);
                        //ui template
                        let template = `
          <div x-data="{ open: true}" class="coupon-code" x-init="coupons =Alpine.reactive({ count: 0 })">
          <div class="coupon-code-title">
            <div class="main-title" style="font-size: 18px;
            color: #000;
            font-weight: 700;
            margin-bottom: 24px;
            margin-top: 8px;
            line-height: 25px;" x-text="'Bulk Coupons Tester'"></div>
            <button
              x-on:click="open = ! open"
              x-text="open?'close':'open'"
              class="next-btn next-medium next-btn-primary next-btn-text"
            >
            </button>
          </div>
        
        
          <div x-show="open" id="${resulGridId}" class='shopping-cart-product'></div>
        </div>
        
                        `;
                        //console.log("created ui");
                        if (!ui) {
                            ui = document.createElement('div');
                            ui.id = uiId;
                            ui.classList.add('card-container');
                            //console.log("created ui");
                            ui.innerHTML = template;
                        }
                        main
                            .getElementsByClassName('card-container')[0]
                            .insertAdjacentElement('afterend', ui);
                    }
                }, 200);
            };
            //  console.log('final result ::', finalResult)
            initResultUI();
            setTimeout(() => {
                let g = document.getElementById(resulGridId);
                if (g)
                    resultGrid.render(g);
            }, 500);
            let results = [];
            let onResult = (result) => {
                results.push(result);
                resultGrid
                    .updateConfig({
                    data: results,
                })
                    .forceRender();
            };
            yield testCoupons(lines, onResult);
        }));
    };
    init();

    exports.init = init;

    Object.defineProperty(exports, '__esModule', { value: true });

    return exports;

}({}));
