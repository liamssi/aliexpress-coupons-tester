
export { };
declare global {

    type httpHeader = { [key: string]: any }


    interface XMLHttpRequest {
        url?: string
        headers?: httpHeader
        body?: Document | BodyInit | null | undefined
    }

    type matchRule = {
        urlMatch: string | RegExp,
        bodyMatch?: string | RegExp
    }
    type facebookPost = {
        text: ''
        url: '',
        creationTime

    }

}

