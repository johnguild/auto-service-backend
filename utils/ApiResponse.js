/**
 * Generic api response object
 * 
 * usage
 * const api = new ApiResponse('Login user')
 * api.send({ user })
 * or
 * api.status(400).errors([ 'No match found!' ]).send()
 */
class ApiResponse {

    constructor (res, action='') {
        this.res = res
        this.apiStatus = 200
        this.apiAction = action
        this.apiErrors = []
        this.apiResultTotal = undefined
        this.apiResultCount = undefined
        this.apiResultSkipped = undefined
        this.apiResultPage = undefined
        this.authToken = undefined;

    }

    status (status) {
        this.apiStatus = status
        return this
    }

    action (action) {
        this.apiAction = action
        return this
    }

    errors (errors = []) {
        if (errors.length > 0 ) {
            errors.forEach(e => {
                if (typeof e === 'string' || e instanceof String) {
                    this.apiErrors.push(e)
                } else if (e.msg !== undefined) {
                    this.apiErrors.push(`${e.param} ${e.msg}`)
                } else if (e.message !== undefined) {
                    this.apiErrors.push(e.msg)
                }
            })
        }
        return this
    }

    token (token = '') {
        this.authToken = token;
        return this
    }


    skipped (skipped) {
        this.apiResultSkipped = skipped
        return this
    }

    total (total) {
        this.apiResultTotal = total
        return this
    }

    resultCount (resultCount) {
        this.apiResultCount = resultCount
        return this
    }

    page (page) {
        this.apiResultPage = page
        return this
    }

  
    send (data) {

        const resObj = {
            action: this.apiAction,
            errors: this.apiErrors,
        }

        if (this.authToken != undefined) resObj.authToken = this.authToken;
        if (this.apiResultTotal != undefined) resObj.total = this.apiResultTotal;
        if (this.apiResultCount != undefined) resObj.resultCount = this.apiResultCount;
        if (this.apiResultSkipped != undefined) resObj.skipped = this.apiResultSkipped;
        if (this.apiResultPage != undefined) resObj.page = this.apiResultPage;

        resObj.data = data;

        this.res.status(this.apiStatus)
            .send(resObj)
    }
}

module.exports = ApiResponse