/**
 * build categories.json
 */

const fs = require('fs')
const path = require('path')
const yamljs = require('yamljs')

const rawIcons = require('../fontawesome-free-5.11.2-web/metadata/icons.json')
const rawCategories = yamljs.parse(fs.readFileSync('../fontawesome-free-5.11.2-web/metadata/categories.yml', 'utf-8'))


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

for ( const name in rawIcons ) {
    const styles = rawIcons[name].styles
    const categories = getCategories(name)

    categories.forEach(item =>{
        data[item] = data[item] || {
            icons: [],
            label: item
        }

        data[item].icons.push(...toNames(name, styles))
    })
}

const toPath = path.resolve(__dirname, '../fontawesomepicker/asset/categories.json')
fs.writeFileSync(toPath, JSON.stringify(data))
