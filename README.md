# i18n with gettext and browserify

A worked example of adding `gettext` style language translation to a [browerified](https://github.com/substack/node-browserify) client-side JS app.

Internationalizing an app comes at a cost; it can reduce the readability of templates, and affect the run-time performance of the app. `gettext` has some limitations but is well supported and has been successfully helping translate apps for years.

As such, the the goals of this example are to implement i18n and:

- Use a gettext compatible api.
- Handle simple translations, pluralisation and date formatting.
- Keep the HTML templates as clear and readable as possible.
- As much as possible, do the work of translating up front, at build time.

**Try it out cloning the repo and running:**

```sh
npm install
npm start
```

## gettext

The `gettext` api supports simple text-replacement translations and locale-sensitive pluralization. This app uses [jed.js](http://slexaxton.github.io/Jed/) to provided a `gettext` compatible api for front-end code.

`gettext` works with dictionaries stored as `.po` (Portable Object) human-readable files, and `.mo` (Machine Object) files optimised for robots. jed.js uses dictionaries stored as the JSON equivalent of the `.po` files that can be automatically derived from existing `.po` files via tools like [`po2json`](https://github.com/mikeedwards/po2json)

`gettext` has no built in support for locale-sensitive date formatting, so we use [moment.js](http://momentjs.com/#multiple-locale-support) for that.

## Readable templates

To identify the simple phrases that should be translated we add a `data-i18n` attribute to elements.

```html
<h3 data-i18n>Login</h3>
<p class="login__lead" data-i18n>
  Please enter your email and password to log in
</p>
```

`gettext` recommends using the default language as the key for looking up translations where possible, so we use the trimmed text content of these elements as the phrase to translate, so `<h3 data-i18n>Login</h3>` becomes a gettext lookup for "Login" in the chosen locale.

Standard handlebars style variable substitution is supported, so:

```html
<h1 data-i18n>Welcome {{name}}</h1>
```

...would use `Welcome {{name}}` as the key to look up, and the entry in the Spanish locale dictionary would look like:

```json
"Welcome {{name}}": ["Hola {{name}}"]
```

The translation is done first, and then the templates standard variable substitution fills out the `{{name}}` at run time...

## Simple translations at build time

The `data-i18n` magic is done at build time. A custom `118ify` transform is used with browserify to process the templates, translating the text content of the elements before handing over to the handlebars transform, that converts the html into a javascript function. As the translation happens before the templates are compiled, the standard handlebars variable substitution still works, even within phrases that are translated.

As such these translations are done up-front, before deployment, creating languages specific app bundles, via browserify:

```sh
"bundle_es": "browserify app.js -o dist/es/bundle.js -t [ ./i18n/i18ify.js --lang es ] -t hbsfy",
```

## Context sensitive translations at runtime

Some phrases can only be translated when we know the value of the variables in them. The most common case is pluralisation, where the number of things changes at run time, _"There is 1 new alert"_ vs _"There are 3 new alerts"_

This is handled in the templates via a handlebars helper.

```html
<p>
  {{ngettext "There is 1 new alert" "There are %d new alerts" alerts}}
</p>
```
where `ngettext` is the pluralisation function from `gettext`, provided to the templates as:

```js
Handlebars.registerHelper('ngettext', function (one, other, count) {
  var res = i18n.translate(one).ifPlural(count, other).fetch(count)
  return res
})
```

In the above example, `i18n` is an instance of jed.js, initialised with dictionary for the current locale. It uses the more readable api, which maps onto specific `gettext` api calls. Jed supports both styles, so calling `ngetext` is equivalent to asking `ifPlural`

```js
var getText = i18n.sprintf(i18n.ngettext(one, other, count), count)
var chained = i18n.translate(one).ifPlural(count, other).fetch(count)
console.assert(getText === chained)
```

## Bundling a locale; aliasing i18n

As we have to do some translations at runtime, we have to include a dictionary in the bundle, but we don't want to include every possible language, just the translations for a specific locale.

We hide those details in the `i18n` package. At build time we alias `i18n` to point to the right locale data and the rest of the app code simply uses `i18n` to get translations for the chosen locale.

The locale specific files are in `./i18n/<language-code>`. Each locale contains a dictionary of translations and a js file that sets up locale specific customisations.

For the default `en` locale, we only have to initialise jed.js, but for other locales we also configure moment.js to use the right locale for it's date formatting:

```js
// Configure moment.js for Spanish
var moment = require('moment')
require('moment/locale/es')
moment.locale('es')

// Configure gettext
var i18n = require('../i18n.js')
module.exports = i18n(require('./dict.json'))
module.exports.moment = moment
```

With this file we can coax browserify to include the right dictionaries in the current bundle, rather than all of them.

The rest of the app sees this module exposed as `i18n` by aliasing of `i18n` to a specific locale. This is done using a browserify transform called `pkgify` which let's us map a package name to a file at build time:

```sh
"bundle_es": "browserify app.js -o dist/es/bundle.js -t [ pkgify --packages [ --i18n i18n/es/es.js ] ]"
```

where `[ --i18n i18n/es/es.js ]` is re-writing calls to `require('i18n')` as `require('./i18n/es/es.js')`

## Building a locale specific bundle

Browserify is doing a lot of work for us, so we capture the command line configuration in [npm run scripts](http://substack.net/task_automation_with_npm_run) in the `package.json`

```json
"scripts": {
  "watch": "watchify app.js -o dist/en/bundle.js -t [ pkgify --packages [ --i18n i18n/en/en.js ] ] -t hbsfy",
  "bundle": "browserify app.js -o dist/en/bundle.js -t [ pkgify --packages [ --i18n ./i18n/en/en.js ] ] -t hbsfy",
  "bundle_de": "browserify app.js -o dist/de/bundle.js -t [ pkgify --packages [ --i18n i18n/de/de.js ] ] -t [ ./i18n/i18ify.js --lang de ] -t hbsfy",
  "bundle_es": "browserify app.js -o dist/es/bundle.js -t [ pkgify --packages [ --i18n i18n/es/es.js ] ] -t [ ./i18n/i18ify.js --lang es ] -t hbsfy"
},
```

The bundle commands only differ on an language code string so there is an exercise for the interested reader to optimise these commands.

The output of the commands are locale specific app bundles found in /dist/<locale>/bundle.js which contain all our app code and language specific templates.

They can be run by an `npm start`

## Translating outside of templates and other advanced stories

If you're forced to do some translating in your app code, you can simply require the `i18n` module and call the api directly:

```js
i18n
  .translate("There is 1 ship in your account")
  .ifPlural(totalShips, "There are %d ships in your account")
  .fetch(totalShips),
```

Which supports pluralisation and variable substution in the output.

Date formatting is handled by moment which is configured and exposed as `i18n.moment`, and can be used in conjunction with variable substitution in translated text.

```js
i18n
  .translate("There will be 1h of scheduled maintenance on %s")
  .fetch(i18n.moment("2015-12-25").format('LLL'))
```

## Bonus points

- Where we translate ahead of time as part of the build we add the path to the source file as an html data attribute. During dev we can use that info to show tooltips to help developers and translators to figure out where in the app the text is from.
- jed.js supports a `"missing_key_callback"` function which we map to add a warning to the console where the current dictionary is asked to translated key it doesn't have.

O!

## References

- http://slexaxton.github.io/Jed/
- http://docs.translatehouse.org/projects/localization-guide/en/latest/l10n/pluralforms.html?id=l10n/pluralforms
- https://github.com/substack/browserify-handbook
- http://momentjs.com/#multiple-locale-support
- http://www.jeromesteunou.net/internationalisation-in-javascript.html
