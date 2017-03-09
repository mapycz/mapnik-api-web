'use strict';
(function (window) {
    let UI = function () {
        this.menu = document.querySelector('#menu_content');
        this.container = document.querySelector('#symbolizers');
        this.fetch();
    };

    let referenceUri = 'https://raw.githubusercontent.com/mapycz/mapnik/master/docs/api-reference/';

    UI.prototype = {

        baseDoc: referenceUri + 'reference.json',
        datasourcesDoc: referenceUri + 'datasources.json',
        commonPropsId: 'common',

        isArray: Array.isArray || function (obj) {
            return (Object.prototype.toString.call(obj) === '[object Array]');
        },

        prop_anchor: function (obj, prop) {
            return obj + '-' + prop;
        },

        node: function (what, attrs, parent, content) {
            let el = document.createElement(what);
            for (let attr in attrs) el[attr] = attrs[attr];
            if (parent) parent.appendChild(el);
            if (content) el.innerHTML = content;
            return el;
        },

        fetchAll: function(urls, apply) {
            let promises = [];
            for (var url of urls) {
                let url_capture = url;
                promises.push(new Promise(function (resolve, reject) {
                    nanoajax.ajax(url_capture,
                        function (code, content) {
                            resolve([url_capture, content]);
                        });
                }));
            }

            Promise.all(promises).then(apply);
        },

        fetch: function () {
            let urls = [this.baseDoc, this.datasourcesDoc];
            let self = this;
            let apply = function (results) {
                results = new Map(results);
                self.buildBase(JSON.parse(results.get(self.baseDoc)));
                self.buildDatasources(JSON.parse(results.get(self.datasourcesDoc)));
                //console.log(results);
            };

            this.fetchAll(urls, apply);
        },

        buildBase: function (ref) {
            this.container.innerHTML = '';
            this.menu.innerHTML = '';

            let basicStructs = ['map', 'layer', 'style'];

            let basicStructsNode = this.node('p', {}, this.menu);
            for (let id of basicStructs) {
                this.addObject(id, ref[id], basicStructsNode);
            }

            let symbolizersNode = this.node('p', {}, this.menu);
            for (let id in ref.symbolizers) {
                this.addObject(id, ref.symbolizers[id], symbolizersNode);
            }

            let commonProps = '*';
            let commonPropsNode = this.node('p', {}, this.menu);
            this.addObject(this.commonPropsId, ref[commonProps], commonPropsNode);

            if (window.location.hash) window.location = window.location;
        },

        addObject: function (id, rules, parent) {
            this.node('a', {className: 'block', href: '#' + id}, parent, id);
            this.addObjectBlock(id, rules);
        },

        addObjectBlock: function (id, rules) {
            let container = this.node('div', {className: 'symbolizer'}, this.container);
            let section = this.node('h2', {}, container);
            this.node('a', {href: '#' + id, id: id}, section, id);
            for (let ruleId in rules) {
                this.addProperty(id, ruleId, rules[ruleId], container);
            }
        },

        addProperty: function (objId, id, props, parent) {
            let see_also = props['see-also'];
            let title = this.node('h3', {}, parent);
            let prop_anchor = this.prop_anchor(objId, id);
            this.node('a', {id: prop_anchor, href: '#' + prop_anchor}, title, id);

            if (props.type) {
                this.node('span', 'type', title, '=' + (this.isArray(props.type) ? 'list' : props.type));
            }

            if (props.status && props.status !== 'stable') {
                this.node('span', {className: 'status ' + props.status}, title, props.status);
            }

            if (props.doc) {
                this.node('p', {}, parent, this.codize(props.doc));
            }

            let defaultValue = props['default-value'];
            let defaultValueUndefined = defaultValue === undefined || defaultValue === null;
            let defaultValueNode;
            if (!defaultValueUndefined) {
                if (defaultValue === '')
                {
                    defaultValue = 'none';
                }
                defaultValueNode = this.propertyNode('Default', String(defaultValue), parent);
            }

            if (props['default-meaning']) {
                if (defaultValueUndefined) {
                    console.warn('default-meaning without default-value: ' + objId + '/' + id);
                }
                else {
                    this.node('em', {}, defaultValueNode, ' (' + this.codize(props['default-meaning']) + ')');
                }
            }

            if (this.isArray(props.type)) {
                this.propertyNode('Values', props.type.join(', '), parent);
            }

            if (props.functions) {
                this.propertyNode('Functions', props.functions.join(', '), parent);
            }

            if (props.range) {
                this.propertyNode('Range', props.range, parent);
            }

            if (see_also) {
                let link = see_also.replace('/', '-');
                if (link == see_also) {
                    link = this.commonPropsId + '-' + see_also
                }
                this.propertyNode('See also', '<a href="#' + link + '">' + see_also + '</a>', parent);
            }
        },

        buildDatasources: function (ref) {
            let dsNode = this.node('p', {}, this.menu);
            for (let id in ref.datasources) {
                this.addObject(id, ref.datasources[id], dsNode);
            }

            if (window.location.hash) window.location = window.location;
        },

        propertyNode: function (name, content, parent) {
            return this.node('p', '', parent, '<strong>' + name + ': </strong>' + content);
        },

        codize: function (text) {
            return text.replace(/`([^`]*)`/g, '<code>$1</code>')
        }
    };

    UI.init = function () {
        return new UI();
    };

    window.UI = UI;
})(window);

