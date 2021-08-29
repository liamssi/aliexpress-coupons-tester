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
                console.log('------------------->>-', r);
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

    //window.Alpine = Alpine
    //Alpine.start()
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
