import { XMLHttpInterceptor } from './XMLHttpInterceptor'
export const testCoupons = async (
  coupons: string[],
  onResult: (result: Record<string, any>) => void = (res) => {
    console.log('coupon test result :: ', res)
  },
) => {
  let res: Record<string, any>[] = []

  for (let coupon of coupons) {
    // console.log("testing coupon ::", coupon)

    if (coupon) {
      let r = await testCoupon(coupon)
      onResult(r)
      res.push(r)
    }
    //console.log("testing next")
  }

  return res
}

let testCoupon = (coupon: string) => {
  return new Promise<Record<string, any>>((resolve, reject) => {
    // @ts-ignore: Unreachable code error
    const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
      window.HTMLInputElement.prototype,
      'value',
    ).set
    const couponInput = <HTMLInputElement>document.getElementById('code')
    // console.log('code inpute>>',couponInput );

    const couponSubmit = <HTMLInputElement>(
      document.querySelector("[ae_button_type='coupon_code'][type='button']")
    )
    //console.log('submit inpute>>', couponSubmit );
    let applyCoupon = () => {
      // @ts-ignore: Unreachable code error
      nativeInputValueSetter.call(couponInput, coupon)
      const inputEvent = new Event('input', { bubbles: true })
      couponInput.dispatchEvent(inputEvent)
      couponSubmit.click()
    }
    let interceptResult = () => {
      let interceptor = new XMLHttpInterceptor({
        urlMatch: '/orders/coupons.do',
      })
      interceptor.patch((request) => {
        request.addEventListener(
          'readystatechange',
          (ev) => {
            if (request.readyState == 4) {
              interceptor.unpatch()
              //console.log("found a coupon request ::: ", request.response)

              let result = parseCouponTestResult(coupon, request.response)
              //      setTimeout(() => resolve(result), 00)
              resolve(result)
              // resolve()
            }
          },
          false,
        )
      })
    }
    //REMOVE COUPON IF EXIST
    //TODO: ADD OTHER LANGUAGES SUPPORT
    let submitText = couponSubmit.textContent
    if (
      submitText != 'Apply' &&
      submitText != 'Confirmer' &&
      submitText != 'تقديم'
    ) {
      // alert("removing")
      couponSubmit.click()

      let interceptor = new XMLHttpInterceptor({
        urlMatch: '/orders/coupons.do',
      })
      interceptor.patch((request) => {
        request.addEventListener(
          'readystatechange',
          (ev) => {
            if (request.readyState == 4) {
              interceptor.unpatch()
              interceptResult()
              applyCoupon()
            }
          },
          false,
        )
      })
    } else {
      if (couponInput) {
        interceptResult()
        applyCoupon()
      }
    }
  })
}

let parseCouponTestResult = (coupon: string, responce: any) => {
  // console.log("coupon :::", coupon);
  let couponCode = responce.price.couponCode
  //console.log(`parsing test result for ${coupon} :: `, responce);
  //if (responce.price) console.log("price object ::", responce.price);

  let res: any
  try {
    res = {
      coupon: couponCode.platformCouponCode,
      message: couponCode.couponCodeWarnMsg,
      amount: couponCode.couponCodeAmount.formatted,
    }
  } catch {
    res = {
      coupon: coupon,
      message: couponCode.couponCodeWarnMsg,
      //amount: couponCode.couponCodeAmount.formatted
      amount: '0 $',
    }
  }
  return res
}
