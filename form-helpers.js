// -*- coding: utf-8 -*-
// :Progetto:  canjs.helpers -- handlebars helpers
// :Creato:    mer 28 ago 2013 22:36:47 CEST
// :Autore:    Alberto Berti <alberto@metapensiero.it>
// :Licenza:   GNU General Public License version 3 or later
//

//jsl:declare can

// Some pieces come from:
/**
 * handlebars.form-helpers.js
 * https://github.com/badsyntax/handlebars-form-helpers
 * Copyright (c) 2013 Richard Willis; Licensed MIT
 */

(function(){
    var helpers, Field;
    function openTag(type, closing, attr) {
        var html = ['<' + type];
        for (var prop in attr) {
            html.push(prop + '="' + attr[prop] + '"');
        }
        return html.join(' ') + (!closing ? ' /' : '') + '>';
    }

    function closeTag(type) {
        return '</' + type + '>';
    }

    function createElement(type, closing, attr, contents) {
        return openTag(type, closing, attr) + (closing ? (contents || '') + closeTag(type) : '');
    }

    function extend(obj1, obj2) {
        for(var key in obj2) {
            obj1[key] = obj2[key];
        }
        return obj1;
    }

    /* {{button "Submit form"}} */
    function helperButton(name, body, options) {
        return new String(createElement('button', true, extend({
            name: name,
            type: 'button'
        }, options.hash), body));
    }
    /* <input {{field person.name name="firstname"}} /> */

    Field = can.Control.extend('metapensiero.mustache.FieldController', {
        init: function(el, options) {
            var opts_html, opts_byid = {};
            var value_name, label_name;
            // el here is always a "jQuery" collection, use the first
            // item
            this._is_select = options.hash && options.hash.options && el[0].tagName.toLowerCase() == 'select';
            if (this._is_select) {
                options.multiple = options.hash.multiple || false;
                value_name = options.hash.value_name || 'value';
                label_name = options.hash.label_name || 'text';
                opts_html = '';
                if (!options.multiple) {
                    opts_html += createElement('option', true, {value: 'choose',
                                                                disabled:'disabled'},
                                               'scegli...');
                }
                options.hash.options.forEach(function(o) {
                    opts_byid[o[value_name]] = o;
                    opts_html += createElement('option', true,
                                               {value: o[value_name]},
                                               o[label_name]);
                });
                el.append(opts_html);
                options.opts_byid = opts_byid;
                options.set_scalar = (options.hash.set_scalar === undefined?
                                      true: options.hash.set_scalar);
                options.value_name = value_name;
                delete options.hash.options;
                delete options.hash.value_name;
                delete options.hash.label_name;
                delete options.hash.set_scalar;
            }
            //happens when using multiple, value if present is a List
            if (!(options.value.isComputed || typeof options.value === "function")) {
                //replace it as a compute
                options.obj = options.value;
                options.value = can.compute(function(v) {
                    if(v !== undefined) {
                        options.obj.attr('length', 0);
                        options.obj.attr(v);
                    } else {
                        return options.obj
                    }
                });
            }
            if(options.hash)
                el.attr(options.hash);
            this.setField(options.value);
        },

        '{value} change': 'setField',
        'change': function(el){
            // set field value on select change
            var sel_v, sel_m, self;
            self = this;
            if (this._is_select && !this.options.set_scalar) {
                sel_v = el.val();
                if (this.options.multiple) {
                    sel_m = [];
                    sel_v.forEach(function(v) {
                        sel_m.push(self.options.opts_byid[v]);
                    });
                    this.options.value(sel_m);
                } else {
                    this.options.value(this.options.opts_byid[sel_v]);
                }
            } else {
                this.options.value(el.val());
            }
        },

        setField: function(value) {
            // set select value on field change
            var v, m, value_name;
            if (value.isComputed || typeof value === "function") {
                v = value();
            } else {
                v = value;
            }
            if (this._is_select && !v) {
                this.element.val('choose');
            } else {
                if (this._is_select && !this.options.set_scalar) {
                    value_name = this.options.value_name;
                    if (this.options.multiple) {
                        // v should be array like
                        m = [];
                        v.forEach(function(el) {
                            m.push(el[value_name]);
                        });
                        this.element.val(m);
                    } else {
                        this.element.val(v[value_name]);
                    }
                } else {
                    this.element.val(v);
                }
            }
        }
    });

    function helperField(value, options) {
        return function(el){
            new Field(el, {value: value, hash: options.hash});
        };
    }

    /* {{label "name" "Please enter your name"}} */
    /* {{#label}}Anything here{{/label}} */
    function helperLabel(input, body, options) {

        options = Array.prototype.pop.call(arguments);
        body = options.fn && options.fn(this) || body;

        var attr = {};
        if (typeof input === 'string') {
            attr['for'] = input;
        }

        var element = createElement('label', true, extend(attr, options.hash), body);

        return new String(element);
    }

    helpers = {
        field: helperField,
        button: helperButton,
        label: helperLabel
    };
    for (var n in helpers) {
        can.Mustache.registerHelper(n, helpers[n]);
    }
})();
