'use strict';
(function (window) {
    var UI = function () {
        this.menu = document.querySelector('#menu_content');
        this.container = document.querySelector('#symbolizers');
        this.fetch();
    };

    UI.prototype = {

        referenceUri: './mapnik/docs/api-reference/',
        commonPropsId: 'common',

        isArray: Array.isArray || function (obj) {
            return (Object.prototype.toString.call(obj) === '[object Array]');
        },

        prop_anchor: function (obj, prop) {
            return obj + '-' + prop;
        },

        node: function (what, attrs, parent, content) {
            var el = document.createElement(what);
            for (var attr in attrs) el[attr] = attrs[attr];
            if (parent) parent.appendChild(el);
            if (content) el.innerHTML = content;
            return el;
        },

        fetch: function () {
            var self = this;
            nanoajax.ajax(this.referenceUri + 'reference.json',
                function (code, content) {
                    self.build(JSON.parse(content));
                });
            return true;
        },

        build: function (ref) {
            this.container.innerHTML = '';
            this.menu.innerHTML = '';

            var commonProps = '*';
            var commonPropsNode = this.node('p', {}, this.menu);
            this.addObject(this.commonPropsId, ref[commonProps], commonPropsNode);

            var basicStructs = ['map', 'layer', 'style'];

            var basicStructsNode = this.node('p', {}, this.menu);
            for (var id of basicStructs) {
                this.addObject(id, ref[id], basicStructsNode);
            }

            var symbolizersNode = this.node('p', {}, this.menu);
            for (var id in ref.symbolizers) {
                this.addObject(id, ref.symbolizers[id], symbolizersNode);
            }
            if (window.location.hash) window.location = window.location;
        },

        addObject: function (id, rules, parent) {
            this.node('a', {className: 'block', href: '#' + id}, parent, id);
            this.addObjectBlock(id, rules);
        },

        addObjectBlock: function (id, rules) {
            var container = this.node('div', {className: 'symbolizer'}, this.container);
            var section = this.node('h2', {}, container);
            this.node('a', {href: '#' + id, id: id}, section, id);
            for (var ruleId in rules) {
                this.addProperty(id, ruleId, rules[ruleId], container);
            }
        },

        addProperty: function (objId, id, props, parent) {
            var see_also = props['see-also'];
            var title = this.node('h3', {}, parent);
            var prop_anchor = this.prop_anchor(objId, id);
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

            var defaultValue = props['default-value'];
            var defaultValueUndefined = defaultValue === undefined || defaultValue === null;
            var defaultValueNode;
            if (!defaultValueUndefined) {
                if (defaultValue === '')
                {
                    defaultValue = 'none';
                }
                defaultValueNode = this.node('p', {}, parent, '<strong>Default: </strong>' + String(defaultValue));
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
                this.node('p', '', parent, '<strong>Values: </strong>' + props.type.join(', '));
            }

            if (props.functions) {
                this.node('p', '', parent, '<strong>Functions: </strong>' + props.functions.join(', '));
            }

            if (props.range) {
                this.node('p', '', parent, '<strong>Range: </strong>' + props.range);
            }

            if (see_also) {
                var link = see_also.replace('/', '-');
                if (link == see_also) {
                    link = this.commonPropsId + '-' + see_also
                }
                this.node('p', '', parent, '<strong>See also: </strong><a href="#' + link + '">' + see_also + '</a>');
            }
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

