/**
 * build categories.json
 * toPath fontawesomepicker/asset/categories.json
 */

const fs = require('fs')
const path = require('path')
const yamljs = require('yamljs')

const rawIcons = yamljs.parse(fs.readFileSync('./node_modules/@fortawesome/fontawesome-free/metadata/icons.yml', 'utf-8'))
const rawCategories = yamljs.parse(fs.readFileSync('./node_modules/@fortawesome/fontawesome-free/metadata/categories.yml', 'utf-8'))


function getCategories(name) {
    const categories = []
    for ( const key in rawCategories ) {
        if ( rawCategories[key].icons.includes(name) ) categories.push(key)
    }
    if ( !categories.length ) categories.push('others')
    return categories
}

function toNames(name, styles) {
    return styles.map(type =>{
        switch ( type ) {
            case 'brands':
                return 'fab-' + name
            case 'solid':
                return 'fas-' + name
            case 'regular':
                return 'far-' + name
        }
    })
}


const data = {}

const keys = Object.keys(rawIcons)
keys.forEach(name =>{
    if ( rawIcons[name].private ) return
    const styles = rawIcons[name].styles
    const categories = getCategories(name)

    categories.forEach(item =>{
        data[item] = data[item] || {
            icons: [],
            label: item
        }

        data[item].icons.push(...toNames(name, styles))
    })
})


// `Others' should be put last 
const others = data.others
delete data.others
data.others = others


fs.writeFileSync(
    path.resolve(__dirname, '../fontawesomepicker/asset/categories.json'),
    JSON.stringify(data)
)
fs.writeFileSync(
    path.resolve(__dirname, '../fontawesomepicker/asset/categories.js'),
    `fontawesomepickerCallback(${JSON.stringify(data)})`
)
