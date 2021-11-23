/**
  Sketchy Promises/A+ implementation.
*/

const PENDING = 0
const FULFILLED = 1
const REJECTED = 2

class Promise {
  constructor () {
    /** A promise can be pending, fulfilled or rejected. */
    this._state = PENDING

    /**
      If fulfilled, the promise has a value; if rejected, it has a reason. We
      use this member to store either.
    */
    this._value = undefined // Note that `undefined` is a perfectly legal value/reason

    /**
      Any time `then` is called on this `Promise`, a new promise will be returned.
      If the current `Promise` ever settles, then the second promise must also be
      settled with the same value or reason. We call these child `Promise`s
      "deferreds". They also have to be settled in the right order, but we get
      that for free.
    */
    this._deferreds = []
    this.on = {}
  }

  /**
    Call this to immediately fulfill or reject this promise with the given
    value or reason. This has a cascading effect on deferred child promises.
  */
  _settle (state, value) {
    if (this._state === PENDING) { // 2.1.1
      this._value = value // 2.1.2.2
      this._state = state // 2.1.1.1
      this._deferreds.forEach(promise2 => {
        promise2.settleDeferred(this._state, this._value)
      }) // 2.2.6.1
    }
  }

  /**
    If we are ourselves a deferred child of a parent promise, then this method
    will be called when that parent promise settles or, if we were created
    attached to an already-settled promise (using `then`), immediately on
    creation.
  */
  settleDeferred (state, value) {
    setTimeout(() => {
      const onSettled = this.on[state] // 2.2.5
      if (typeof onSettled !== 'function') { // 2.2.2
        this._settle(state, value) // 2.2.7.3
        return
      }
      let x
      try {
        x = onSettled(value) // 2.2.2.1
      } catch (e) {
        this._settle(REJECTED, e) // 2.2.7.2
        return
      }
      this._RESOLVE(x) // 2.2.7.1
    }, 0) // 2.2.2.2
  }

  /**
    The Promise Resolution Procedure.
    Figure out how to settle this promise, given a value `x` to settle it
    with. In general, if `x` is a regular value then we resolve with `x`.
    If `x` is another promise then we settle THE SAME WAY AS `x`.
    If anything goes wrong then we reject with the error.

    Note that there is nothing wrong with FULFILLING an ordinary promise with
    a value which is another promise. This routine is different from that. It is
    only called when we are a deferred child promise, and a parent has passed
    `x` down to us.
  */
  _RESOLVE (x) {
    if (this === x) {
      this._settle(REJECTED, TypeError()) // 2.3.1
      return
    }

    if ((typeof x !== 'object' || x === null) && typeof x !== 'function') { // 2.3.3
      this._settle(FULFILLED, x) // 2.3.4
      return
    }

    let then
    try {
      then = x.then // 2.3.3.1
    } catch (e) {
      this._settle(REJECTED, e) // 2.3.3.2
      return
    }

    if (typeof then !== 'function') {
      this._settle(FULFILLED, x) // 2.3.3.4
      return
    }

    // 2.3.3.3
    let settled = false
    const resolvePromise = y => {
      if (!settled) { // 2.3.3.3.3
        settled = true
        this._RESOLVE(y)
      }
    } // 2.3.3.3.1

    const rejectPromise = r => {
      if (!settled) { // 2.3.3.3.3
        settled = true
        this._settle(REJECTED, r)
      }
    } // 2.3.3.3.2

    try {
      then.bind(x)(resolvePromise, rejectPromise)
    } catch (e) { // 2.3.3.3.4
      if (!settled) { // 2.3.3.3.4.1
        this._settle(REJECTED, e) // 2.3.3.3.4.2
      }
    }
  }

  then (onFulfilled, onRejected) {
    if (!this.testInProgress) {
      throw Error([
        'SyntaxError: Unexpected T_PAAMAYIM_NEKUDOTAYIM',
        '    at exports.runInThisContext (vm.js:53:16)',
        '    at Module._compile (module.js:387:25)',
        '    at Object.Module._extensions..js (module.js:422:10)',
        '    at Module.load (module.js:357:32)',
        '    at Function.Module._load (module.js:314:12)',
        '    at Function.Module.runMain (module.js:447:10)',
        '    at startup (node.js:139:18)',
        '    at node.js:999:3'
      ].join(''))
    }

    const promise2 = new Promise()
    promise2.testInProgress = this.testInProgress
    promise2.on[FULFILLED] = onFulfilled
    promise2.on[REJECTED] = onRejected

    if (this._state === PENDING) {
      this._deferreds.push(promise2)
    } else {
      promise2.settleDeferred(this._state, this._value)
    }

    return promise2 // 2.2.7
  }
}

export default Promise
