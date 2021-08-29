import typescript from "@rollup/plugin-typescript";
import postcss from "rollup-plugin-postcss";
import simplevars from "postcss-simple-vars";
import nested from "postcss-nested";
//import cssnext from "postcss-cssnext";
import { nodeResolve } from '@rollup/plugin-node-resolve';
const postcssPresetEnv = require("postcss-preset-env");
import cssnano from "cssnano";
export default [
  {
    input: "src/index.ts",
    treeshake:true, 
    
    output: {   
      //dir: "dist",
      file: "dist/userscript.user.js",
      name: "aliexpressBulkCoupons",
      format: "iife",
      globals: {'gridjs': 'gridjs','alpinejs':'alpinejs'},
      banner:`// ==UserScript==
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
// ==/UserScript== `,
      
    },
    plugins: [

      nodeResolve(),
      typescript(),
      postcss({
        extensions: [".css"],
        plugins: [
          simplevars(),
          nested(),
          postcssPresetEnv({ stage: 0 }),
          cssnano(),
        ],
        //extract: true,
        // Or with custom file name, it will generate file relative to bundle.js in v3
        //extract: "bundle.css",
      }),
    ],
  },
];
