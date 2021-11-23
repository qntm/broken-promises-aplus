<a href="https://promisesaplus.com/">
    <img src="https://promisesaplus.com/assets/logo-small.png" alt="Promises/A+ logo"
         title="Promises/A+ 1.0 compliant" align="right" />
</a>

# broken-promises-aplus

An implementation of the [Promises/A+](https://promisesaplus.com) specification which, although it passes the [Compliance Test Suite](https://github.com/promises-aplus/promises-tests), does not work.

## Installation

```sh
npm install broken-promises-aplus
```

## Testing

```sh
npm test
```

This runs the full [Promises/A+ Compliance Test Suite](https://github.com/promises-aplus/promises-tests).

## Usage

```js
import Promise from 'broken-promises-aplus'

const get = url => new Promise((resolve, reject) => {
  var xhr = new XMLHttpRequest()
  xhr.addEventListener("error", reject)
  xhr.addEventListener("load", resolve)
  xhr.open("GET", url)
  xhr.send()
})

get("https://github.com")
  .then(JSON.parse)
  .then(console.log)
```

The above code causes a puzzling exception to be thrown. No HTTP request is sent.

## Why?

The purpose of this library is to demonstrate a point about Test-Driven Development:

> **If the people writing the tests and the people developing the software have opposing goals, then it must be impossible to programmatically distinguish a testing scenario from normal use.**

A prominent recent example of this *not* happening when it *should* have happened is the [Volkswagen emissions scandal](https://en.wikipedia.org/wiki/Volkswagen_emissions_scandal). Here, the developers of the VW engine control unit programmed it to display unusual low-emissions behaviour when it (the ECU) detected that an emissions test was in progress, and to display much improved performance (at the cost of emissions) the rest of the time.

In the same way, `broken-promises-aplus` is programmed to behave like a conforming Promises/A+ implementation when it detects that the Compliance Test Suite is in progress, and to display other behaviour at all other times.

## How can I help?

There are two major ways you can help to improve this library:

* Improve the heuristics by which the library detects that a Compliance Test Suite is in progress
* Make suggestions and pull requests for more interesting behaviour for when no Compliance Test Suite is in progress (nothing destructive, please)
