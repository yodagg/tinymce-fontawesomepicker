/**
 * to    fontawesomepicker/asset/categories.js
 */

const fs = require('fs')
const path = require('path')
const yamljs = require('yamljs')

const fontawesomeVer = 'pro'    //  free/pro
const fontawesomePath = './fontawesome-pro-5.14.0-web'
const rawIcons = yamljs.parse(fs.readFileSync(fontawesomePath + '/metadata/icons.yml', 'utf-8'))
const rawCategories = yamljs.parse(fs.readFileSync(fontawesomePath + '/metadata/categories.yml', 'utf-8'))


function iconClasses(name, styles) {
    return styles.map(style =>{
        switch ( style ) {
            case 'brands'   : return 'fab-' + name
            case 'solid'    : return 'fas-' + name
            case 'regular'  : return 'far-' + name
            case 'light'    : return 'fal-' + name
            case 'duotone'  : return 'fad-' + name
        }
    })
}

function iconCategories(name) {
    const categories = []
    for ( const key in rawCategories ) {
        if ( rawCategories[key].icons.includes(name) ) categories.push(key)
    }
    if ( !categories.length ) categories.push('others')
    return categories
}


const data = {}

const keys = Object.keys(rawIcons)
keys.forEach(name =>{
    if ( rawIcons[name].private ) return
    const styles = rawIcons[name].styles
    const categories = iconCategories(name)

    categories.forEach(item =>{
        data[item] = data[item] || {
            icons: [],
            label: item
        }

        data[item].icons.push(...iconClasses(name, styles))
    })
})


// `Others' should be put last 
const others = data.others
delete data.others
data.others = others


// fs.writeFileSync(
//     path.resolve(__dirname, `../fontawesomepicker/asset/categories-${fontawesomeVer}.json`),
//     JSON.stringify(data)
// )
fs.writeFileSync(
    path.resolve(__dirname, `../fontawesomepicker/asset/categories-${fontawesomeVer}.js`),
    `fontawesomepickerCallback(${JSON.stringify(data)})`
)
