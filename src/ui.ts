export const initUI = (btnCallback: (inputAreaValue: string) => void) => {
  let checkExist = setInterval(() => {
    // check if the coupon form exist
    let couponForm = document.getElementsByClassName(
      'order-charge-container',
    )[0]

    if (couponForm) {
      //clear the interval
      clearInterval(checkExist)
      //id used to style the ui
      let uiId = 'aliexpress-bulk-coupons-tester'
      let runBtnId = 'run-coupons-test-btn'
      let couponsInputId = 'coupons-tester-input'
      let ui = document.getElementById(uiId)

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
 `

      if (!ui) {
        ui = document.createElement('div')
        ui.id = uiId
        ui.classList.add('order-charge-container')
        //console.log("created ui");
        ui.innerHTML = template
        //add event listners
        setTimeout(() => {
          let btn = document.getElementById(runBtnId)
          let coupons = <HTMLInputElement>(
            document.getElementById(couponsInputId)
          )

          btn?.addEventListener('click', () => {
            //runBtn.classList.toggle("active");
            //console.log('coupons ====>', coupons?.value)

            btnCallback(coupons?.value)
          })
        }, 200)
      }

      couponForm.insertAdjacentElement('afterend', ui)
    }
  }, 200)
}
