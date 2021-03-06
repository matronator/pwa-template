import { watch, series, parallel, src, dest } from 'gulp' // gulp
import noop from 'gulp-noop' // gulp
import browserSync from 'browser-sync' // gulp
import cacheBuster from 'gulp-rev' // gulp
import sourcemaps from 'gulp-sourcemaps' // gulp
import filenames from 'gulp-filenames' // gulp
import tap from 'gulp-tap' // gulp
import sprite from 'gulp-svg-sprite' // gulp
import imagemin from 'gulp-imagemin' // gulp
import postcss from 'gulp-postcss' // css
import postcssImport from 'postcss-import' // css
import postcssNesting from 'postcss-nesting' // css
import postcssNano from 'cssnano' // css
import postcssCustomMedia from 'postcss-custom-media' // css
import postcssCustomProperties from 'postcss-custom-properties' // css
import postcssCalc from 'postcss-calc' // css
import postscssAutoprefixer from 'autoprefixer' // css
import postcssMixins from 'postcss-mixins' // css
import browserify from 'browserify' // js
import buffer from 'vinyl-buffer' // js
import babelify from 'babelify' // js
import uglify from 'gulp-uglify-es' // js
import fs from 'fs' // general
import del from 'del' // general
import yargs from 'yargs' // general
import dotenv from 'dotenv' // general

dotenv.config()

// set isProduction and module variables
const {
    production: isProduction = false
} = yargs.argv

// create browserSync server
const server = browserSync.create()

// create array of postcss processors (order is important)
const cssProcessors = [
    postcssImport, // must be the first
    postcssMixins, // https://github.com/postcss/postcss-mixins
    postcssNesting, // https://github.com/postcss/postcss-nested
    postcssCalc, // https://github.com/postcss/postcss-calc
    postcssCustomMedia, // https://drafts.csswg.org/mediaqueries-5/#custom-mq
].concat(isProduction ? [ // enable additional processors on production (saves time on development)
    postcssCustomProperties, // https://www.w3.org/TR/css-variables-1/
    postscssAutoprefixer({ browsers: ['last 2 versions', 'ie >= 11'] }), // same as babel,
    postcssNano,
] : [])

const config = {
    serverUrl: `http://127.0.0.1:8000/`,
    proxyPort: 3000,
    buildDest: `dist/`,
    js: {
        entry: `src/js/*.js`,
        watch: [`src/js/**/*.js`],
    },
    css: {
        entry: `src/css/*.css`,
        watch: [`src/css/**/*.css`, `src/js/components/**/*.css`],
    },
    images: {
        entry: `src/images/**`,
        watch: [],
        directory: `images`,
    },
    etc: {
        entry: `src/etc/**`,
        watch: [`src/etc/**`],
        directory: `etc`,
    },
    icons: {
        entry: `src/icons/*.svg`,
        watch: [`src/icons/*.svg`],
        spriteConfig: {
            mode: {
                inline: true,
                symbol: { // generate right into the build folder
                    dest: ``,
                    sprite: `sprite.svg`
                }
            }
        }
    },
    templates: {
        watch: [`*.html`]
    },
    manifest: {
        base: `${process.cwd()}/dist/`,
        path: `${process.cwd()}/dist/asset-manifest.json`,
        merge: true,
    }
}

/*
* Private tasks
* */
function reload(done) {
    server.reload()
    done()
}

async function serve() {
    await server.init({
        proxy: config.serverUrl,
        port: config.proxyPort,
        open: true,
        notify: false
    })
}

function clean(done) {
    del([`${config.buildDest}/**/*`])
    done()
}

function js() {
    return src(config.js.entry, { read: false }) // no need of reading because browserify does
        .pipe(tap(file => { // transform files using gulp-tap
            file.contents = browserify(file.path, {
                transform: [babelify],
                debug: isProduction // enable source maps on production
            }).bundle()
        }))
        .pipe(buffer()) // need this if you want to continue using the stream with other plugins
        .pipe(isProduction ? sourcemaps.init({ loadMaps: true }) : noop())
        .pipe(isProduction ? cacheBuster() : noop()) // cache bust on production
        .pipe(isProduction ? uglify() : noop())
        .pipe(isProduction ? sourcemaps.write('.', { includeContent: false }) : noop())
        .pipe(isProduction ? dest(config.buildDest) : noop()) // this build is for manifest.json
        .pipe(isProduction ? cacheBuster.manifest(config.manifest.path, config.manifest) : noop())
        .pipe(dest(config.buildDest))
}

function css() {
    return src(config.css.entry)
        .pipe(isProduction ? sourcemaps.init() : noop()) // generate source-maps only for production
        .pipe(isProduction ? cacheBuster() : noop()) // cache bust on production
        .pipe(postcss(cssProcessors))
        .pipe(isProduction ? sourcemaps.write('.', { includeContent: false }) : noop())
        .pipe(isProduction ? dest(config.buildDest) : noop()) // this build is for manifest.json
        .pipe(isProduction ? cacheBuster.manifest(config.manifest.path, config.manifest) : noop())
        .pipe(dest(config.buildDest))
}

function icons() {
    return src(config.icons.entry)
        .pipe(sprite(config.icons.spriteConfig))
        .pipe(dest(config.buildDest))
}

function images() {
    return src(config.images.entry)
        .pipe(imagemin([
            imagemin.svgo({
                plugins: [
                    { removeViewBox: true },
                    { cleanupIDs: false }
                ]
            })
        ]))
        .pipe(dest(config.buildDest + config.images.directory))
}

function etc() {
    return src(config.etc.entry)
        .pipe(dest(config.buildDest + config.etc.directory))
}

function createDevManifest(done) {
    // asset manifest is not generated during development in order to save time
    // nevertheless, it is required by php script to load the assets
    const manifest = {}
    for (const filename of filenames.get(`files`)) {
        manifest[filename] = filename
    }
    fs.writeFile(config.manifest.path, JSON.stringify(manifest, null, 4), () => {
        done()
    })
}

function getCssAndJsFileNames() {
    return src([config.css.entry, config.js.entry])
        .pipe(filenames(`files`))
        .pipe(noop())
}

function watchFiles() {
    watch(config.css.watch, series(css, reload))
    watch(config.js.watch, series(js, reload))
    watch(config.icons.watch, series(icons, reload))
    watch(config.templates.watch, series(reload))
}

/*
* Public task
* */
export default isProduction ?
    series(
        clean,
        css, // not parallel because manifest.json creation
        js, // not parallel because manifest.json creation
        parallel(icons, images, etc)
    ) :
    series(
        clean,
        getCssAndJsFileNames,
        parallel(js, css, icons, serve, createDevManifest, images, etc),
        watchFiles
    )
