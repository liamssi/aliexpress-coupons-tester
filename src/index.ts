/*hzhdjkhklhezik*/
import { initUI } from './ui'
import { testCoupons } from './testCoupon'
import './style.css'
import { Grid } from 'gridjs'
import 'gridjs/dist/theme/mermaid.css'
import Alpine from 'alpinejs'

//window.Alpine = Alpine

Alpine.start()
// ==UserScript==

export let init = () => {
  // ==/UserScript== 45654654

  //result gridlet
  let resulGridId = 'result-grid'
  let resultGrid = new Grid({
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
  })
  //
  resultGrid.on('rowClick', (ev, row) => {
    // console.log('row: ' + JSON.stringify(row.cells[0].data))

    navigator.clipboard.writeText(<string>row.cells[0].data)
  })

  initUI(async (text) => {
    let lines = text
      .split(/\r*\n/)
      .map((el) => {
        return el.replace(/\s/g, '')
      })
      .filter((el) => {
        return el != null && el != ''
      })

    //
    let initResultUI = () => {
      let resulGridId = 'result-grid'

      let checkExist = setInterval(() => {
        // check if the coupon form exist
        let main = document.getElementById('main')

        if (main) {
          //clear the interval
          clearInterval(checkExist)
          //id used to style the ui
          let uiId = 'aliexpress-bulk-coupons-tester-result'
          let ui = document.getElementById(uiId)

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
        
                        `
          //console.log("created ui");

          if (!ui) {
            ui = document.createElement('div')
            ui.id = uiId
            ui.classList.add('card-container')
            //console.log("created ui");
            ui.innerHTML = template
          }

          main
            .getElementsByClassName('card-container')[0]
            .insertAdjacentElement('afterend', ui)
        }
      }, 200)
    }

    //  console.log('final result ::', finalResult)
    initResultUI()

    setTimeout(() => {
      let g = document.getElementById(resulGridId)

      if (g) resultGrid.render(g)
    }, 500)

    let results: any = []
    let onResult = (result: any) => {
      results.push(result)

      resultGrid
        .updateConfig({
          data: results,
        })
        .forceRender()
    }

    let finalResult = await testCoupons(lines, onResult)
  })
}

init()
