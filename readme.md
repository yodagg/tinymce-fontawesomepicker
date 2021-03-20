# tinymce-fontawesomepicker
A plugin for `tinymce v5` that selects the `fontawesome` icon.

[example](http://gitpages.wo2.me/tinymce-fontawesomepicker/)


# usage
- Move the `fontawesomepicker` folder to `tinymce/plugins`
    ```js
    window.tinymce.init({
        selector: 'textarea',
        plugins: 'fontawesomepicker',
        toolbar: 'fontawesomepicker',
        fontawesomeUrl: 'https://www.unpkg.com/@fortawesome/fontawesome-free@5.14.0/css/all.min.css',
        fontawesomePro: false, //default: false, enable or disable Pro vs Free font  
    })
    ```

- Url `fontawesomepicker`
    ```js
    window.tinymce.init({
        selector: 'textarea',
        plugins: 'fontawesomepicker',
        toolbar: 'fontawesomepicker',
        fontawesomeUrl: 'https://www.unpkg.com/@fortawesome/fontawesome-free@5.14.0/css/all.min.css',
        fontawesomePro: false, //default: false, enable or disable Pro vs Free font  
        external_plugins: {
            //  url
            fontawesomepicker: 'https://www.unpkg.com/tinymce-fontawesomepicker/fontawesomepicker/plugin.min.js'
        },
    })
    ```


# preview
![icons](icons.png)

