(function () {
	'use strict'

	var PLUGIN_NAME = 'fontawesomepicker'
	var CALLBACK_NAME = 'fontawesomepickerCallback'
	var global = tinymce.util.Tools.resolve('tinymce.PluginManager')
	var jsonpCache = {}

	var utils = {
		loadStyle: function (doc, src) {
			if (doc.querySelector('link[href*="' + src + '"]')) return
			var link = doc.createElement('link')
			link.href = src
			link.rel = 'stylesheet'
			doc.head.appendChild(link)
		},
		unique: function (arr) {
			var hash = arr.reduce(function (ret, item) {
				ret[item] = 1
				return ret
			}, {})
			return Object.keys(hash)
		},
		getRngNode: function (editor) {
			var rng = editor.selection.getRng()
			var target = rng.startContainer
			if (target.nodeType !== 1) target = target.parentNode
			return target
		},
		jsonp: function (url, callbackName, callback) {
            jsonpCache[url] = jsonpCache[url] || {}
            var cache = jsonpCache[url]

            //  first
            //  create script
            if ( !cache.status && !cache.script ) {
                var js = document.createElement('script')
                js.src = url
                document.head.appendChild(js)
                cache.status = 0
                cache.script = js
                window[callbackName] = function(data) {
                    cache.status = 1
                    cache.data = data
                }
                cache.script.onload = cache.script.onerror = function() {
                    delete window[callbackName]
                    delete cache.script
                    this.parentNode && this.parentNode.removeChild(this)
                }
            }

            //  pending
            if ( !cache.status && cache.script ) {
                cache.script.addEventListener('load', function() {
                    callback(cache.data)
                })
            }

            //  read cache
            if ( cache.status ) {
                callback(cache.data)
            }
		},
		getmatrix: function(args) {
			var aa = Math.round(180 * Math.asin(args[0]) / Math.PI)
			var bb = Math.round(180 * Math.acos(args[1]) / Math.PI)
			var cc = Math.round(180 * Math.asin(args[2]) / Math.PI)
			var dd = Math.round(180 * Math.acos(args[3]) / Math.PI)
			var deg = 0
			if (aa == bb || -aa == bb) {
				deg = dd
			} else if (-aa + bb == 180) {
				deg = 180 + cc
			} else if (aa + bb == 180) {
				deg = 360 - cc || 360 - dd
			}
			return deg >= 360 ? 0 : deg
		}
	}

	var IconsPanel = function () {
		var categories = {}
		var bodyHtml = ''

		function initAsset(editor, pluginUrl) {
			var fontawesomeUrl = editor.getParam('fontawesomeUrl')
			var fontawesomePro = editor.getParam('fontawesomePro')
			var fontawesomeVer = !!fontawesomePro ? 'pro' : 'free'

			utils.loadStyle(document, fontawesomeUrl)
			utils.loadStyle(document, pluginUrl + '/asset/style.css')
			utils.loadStyle(document, pluginUrl + '/asset/style-'+ fontawesomeVer +'.css')
			utils.loadStyle(editor.contentDocument, fontawesomeUrl)

			if ( !categories.all ) {
				loadCategories(pluginUrl + '/asset/categories-'+ fontawesomeVer +'.js')
			}
		}

		function loadCategories(src) {
			utils.jsonp(src, CALLBACK_NAME, function(data) {
				formatCategories(data)
			})
		}

		function formatCategories(data) {
			categories.all = {
				icons: [],
				label: 'all'
			}
			for (var key in data) {
				categories.all.icons = categories.all.icons.concat(data[key].icons)
				categories[key] = data[key]
			}
			categories.all.icons = utils.unique(categories.all.icons)
		}

		return function (editor, pluginUrl) {
			editor.on('init', initAsset.bind(null, editor, pluginUrl))

			return {
				editor: editor,
				open: function () {
					editor.windowManager.open({
						title: 'Icons',
						size: 'large',
						body: {
							type: 'panel',
							items: [{
								type: 'htmlpanel',
								html: this.renderBody()
							}]
						},
						buttons: [{ type: 'cancel', name: 'close', text: 'Close', primary: true }]
					})
					this.openAfter()
				},
				openAfter: function () {
					var that = this
					that.changeNav('all')
					editor.$('.mce-fontawesomepicker--nav__item', document)
						.off('click').on('click', function () {
							var title = this.getAttribute('title')
							that.changeNav(title)
						})

					editor.$('.mce-fontawesomepicker--icon', document)
						.off('click').on('click', function () {
							var title = this.getAttribute('title')
							that.insertIcon(title)
						})
				},
				renderNav: function () {
					var html = ''
					html += '<div class="mce-fontawesomepicker--nav">'
					for (var key in categories) {
						var item = categories[key]
						html += '<div class="mce-fontawesomepicker--nav__item" title="' + key + '">' + item.label + '</div>'
					}
					html += '</div>'
					return html
				},
				renderIcons: function () {
					var that = this
					var html = ''
					html += '<div class="mce-fontawesomepicker--icons">'
					html += categories.all.icons.reduce(function (ret, name) {
						var icon = that.toIconClass(name)
						ret += '<div class="mce-fontawesomepicker--icon" title="' + name + '">'
						ret += '	<span><i class="' + icon + '"></i></span>'
						ret += '	<span>' + name + '</span>'
						ret += '</div>'
						return ret
					}, '')
					html += '</div>'
					return html
				},
				renderBody: function () {
					if (bodyHtml) return bodyHtml
					bodyHtml += '<div class="mce-fontawesomepicker--body">'
					bodyHtml += '	<div class="mce-fontawesomepicker--aside">'
					bodyHtml += this.renderNav()
					bodyHtml += '	</div>'
					bodyHtml += '	<div class="mce-fontawesomepicker--content">'
					bodyHtml += this.renderIcons()
					bodyHtml += '	</div>'
					bodyHtml += '</div>'
					return bodyHtml
				},
				toIconClass: function (name) {
					var prefix = name.split('-')[0]
					var icon = name.replace(prefix, prefix + ' fa')
					return icon
				},
				showIcons: function (category) {
					var data = categories[category]
					if (!data) return
					editor.$('.mce-fontawesomepicker--icon', document)
						.each(function (el) {
							var title = this.getAttribute('title')
							this.style.display = data.icons.includes(title) ? 'block' : 'none'
						})
				},
				changeNav: function (category) {
					var $current = document.querySelector('.mce-fontawesomepicker--nav__item.current')
					var $category = document.querySelector('.mce-fontawesomepicker--nav__item[title="' + category + '"]')
					if ($current) $current.classList.remove('current')
					if ($category) $category.classList.add('current')
					this.showIcons(category)
				},
				insertIcon: function (name) {
					var icon = this.toIconClass(name)

					// Empty tags will be automatically deleted
					// Use <!--. --> to placeholder
					var html = ' <span class="mark-fapkw"><!-- . --><span contenteditable="false" class="mark-fapk ' + icon + '"></span></span> '
					editor.execCommand('mceInsertContent', false, html)
					editor.windowManager.close()
				}
			}
		}
	}

	var SettingPanel = function (editor) {
		var target = utils.getRngNode(editor)
		var targetIcon = editor.$(target).children('.mark-fapk')[0]
		var rotate = editor.$(targetIcon).css('transform').replace(/(matrix|none|\(|\))/g, '')
		rotate = utils.getmatrix(rotate.split(',').map(parseFloat))

		editor.windowManager.open({
			title: 'Icon setting',
			body: {
				type: 'panel',
				items: [
					{
						type: 'selectbox',
						name: 'icon-style',
						label: 'Style',
						items: [
							{ value: 'none', text: 'None' },
							{ value: 'rounded', text: 'Circle' },
							{ value: 'boxed', text: 'Square' },
							{ value: 'rounded-less', text: 'Rounded' },
							{ value: 'rounded-outline', text: 'Outline Circle' },
							{ value: 'boxed-outline', text: 'Outline Square' },
							{ value: 'rounded-less-outline', text: 'Outline Rounded' },
						]
					},
					{
						type: 'input',
						name: 'icon-size',
						label: 'Icon size'
					},
					{
						type: 'colorinput',
						name: 'icon-color',
						label: 'Icon color'
					},
					{
						type: 'input',
						name: 'icon-rotate',
						label: 'Rotation angle (0deg)'
					},
					{
						type: 'colorinput',
						name: 'style-color',
						label: 'Style color'
					}
				]
			},
			buttons: [
				{
					type: 'cancel',
					name: 'closeButton',
					text: 'Cancel'
				},
				{
					type: 'submit',
					name: 'submitButton',
					text: 'Change',
					primary: true
				}
			],
			initialData: {
				'icon-style': editor.$(target).attr('icon-style') || 'none',
				'icon-size': editor.$(targetIcon).css('font-size'),
				'icon-color': editor.$(targetIcon).css('color') || '',
				'icon-rotate': rotate + 'deg',
				'style-color': editor.$(target).attr('style-color') || ''
			},
			onSubmit: function (api) {
				var data = api.getData()
				var style = {
					'font-size': data['icon-size'],
					'color': data['icon-color']
				}

				targetIcon.removeAttribute('style')
				if (![0, '0', '0deg'].includes(data['icon-rotate'])) {
					style['display'] = 'inline-block'

					style['transform'] = 'rotate(' + data['icon-rotate'] + ')'
					style['-ms-transform'] = 'rotate(' + data['icon-rotate'] + ')'
					style['-moz-transform'] = 'rotate(' + data['icon-rotate'] + ')'
					style['-webkit-transform'] = 'rotate(' + data['icon-rotate'] + ')'
					style['-o-transform'] = 'rotate(' + data['icon-rotate'] + ')'
				}

				if ( data['icon-style'] === 'none' ) {
					target.removeAttribute('icon-style')
					target.removeAttribute('style-color')
				} else {
					editor.$(target).attr('icon-style', data['icon-style'])
					editor.$(target).attr('style-color', data['style-color'])
					style['display'] = 'inline-block'
					style['text-align'] = 'center'
					style['width'] = style['height'] = style['line-height'] = '1.4em'

					switch ( data['icon-style'] ) {
						case 'rounded': {
							style['border-radius'] = '50%'
							style['background-color'] = data['style-color']
							break
						}
						case 'boxed': {
							style['background-color'] = data['style-color']
							break
						}
						case 'rounded-less': {
							style['border-radius'] = '5px'
							style['background-color'] = data['style-color']
							break
						}
						case 'rounded-outline': {
							style['border-radius'] = '50%'
							style['border'] = '2px solid ' + data['style-color']
							break
						}
						case 'boxed-outline': {
							style['border'] = '2px solid ' + data['style-color']
							break
						}
						case 'rounded-less-outline': {
							style['border-radius'] = '5px'
							style['border'] = '2px solid ' + data['style-color']
							break
						}
					}
				}

				editor.$(targetIcon).css(style)
				// editor.execCommand('mceReplaceContent', false, '')
				api.close()
			}

		})
	}

	var iconsButtonSvg = '<svg width="24" height="24" viewBox=\"0 0 512 512\"><path d=\"M116.65 219.35a15.68 15.68 0 0 0 22.65 0l96.75-99.83c28.15-29 26.5-77.1-4.91-103.88C203.75-7.7 163-3.5 137.86 22.44L128 32.58l-9.85-10.14C93.05-3.5 52.25-7.7 24.86 15.64c-31.41 26.78-33 74.85-5 103.88zm143.92 100.49h-48l-7.08-14.24a27.39 27.39 0 0 0-25.66-17.78h-71.71a27.39 27.39 0 0 0-25.66 17.78l-7 14.24h-48A27.45 27.45 0 0 0 0 347.3v137.25A27.44 27.44 0 0 0 27.43 512h233.14A27.45 27.45 0 0 0 288 484.55V347.3a27.45 27.45 0 0 0-27.43-27.46zM144 468a52 52 0 1 1 52-52 52 52 0 0 1-52 52zm355.4-115.9h-60.58l22.36-50.75c2.1-6.65-3.93-13.21-12.18-13.21h-75.59c-6.3 0-11.66 3.9-12.5 9.1l-16.8 106.93c-1 6.3 4.88 11.89 12.5 11.89h62.31l-24.2 83c-1.89 6.65 4.2 12.9 12.23 12.9a13.26 13.26 0 0 0 10.92-5.25l92.4-138.91c4.88-6.91-1.16-15.7-10.87-15.7zM478.08.33L329.51 23.17C314.87 25.42 304 38.92 304 54.83V161.6a83.25 83.25 0 0 0-16-1.7c-35.35 0-64 21.48-64 48s28.65 48 64 48c35.2 0 63.73-21.32 64-47.66V99.66l112-17.22v47.18a83.25 83.25 0 0 0-16-1.7c-35.35 0-64 21.48-64 48s28.65 48 64 48c35.2 0 63.73-21.32 64-47.66V32c0-19.48-16-34.42-33.92-31.67z\"/></svg>'
	function registerUi(editor) {
		editor.ui.registry.addIcon(PLUGIN_NAME, iconsButtonSvg)
		editor.ui.registry.addButton(PLUGIN_NAME, {
			icon: PLUGIN_NAME,
			tooltip: PLUGIN_NAME,
			onAction: function () {
				editor.execCommand('mceOpenFontawesomepicker')
			}
		})
		editor.ui.registry.addMenuItem(PLUGIN_NAME, {
			icon: PLUGIN_NAME,
			text: PLUGIN_NAME,
			onAction: function () {
				editor.execCommand('mceOpenFontawesomepicker')
			}
		})

		editor.ui.registry.addMenuItem('fontawesomesetting', {
			icon: 'preferences',
			text: 'Icon setting',
			onAction: function () {
				SettingPanel(editor)
			}
		})
		editor.ui.registry.addContextMenu('fontawesomesetting', {
			update: function (element) {
				var classList = element.classList
				if (classList.contains('mark-fapk') || classList.contains('mark-fapkw')) return 'fontawesomesetting'
				return ''
			}
		})
	}

	var Icons = IconsPanel()

	function Plugin() {
		global.add(PLUGIN_NAME, function (editor, pluginUrl) {
			var iconsPanel = Icons(editor, pluginUrl)

			// setting
			editor.settings.extended_valid_elements = editor.settings.extended_valid_elements || ''
			editor.settings.extended_valid_elements += ',span[*]'
			editor.settings.contextmenu = editor.settings.contextmenu || ''
			editor.settings.contextmenu += ' fontawesomesetting'

			// register
			editor.addCommand('mceOpenFontawesomepicker', function () {
				iconsPanel.open()
			})
			registerUi(editor)

			return {}
		})
	}

	Plugin()

}());
