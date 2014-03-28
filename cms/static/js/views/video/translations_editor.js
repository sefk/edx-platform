define(
    [
        "jquery", "underscore",
        "js/views/abstract_editor", "js/models/uploads", "js/views/uploads"

    ],
function($, _, AbstractEditor, FileUpload, UploadDialog) {
    "use strict";
    var Translations = AbstractEditor.extend({
        events : {
            "click .setting-clear" : "clear",
            "click .create-setting" : "addEntry",
            "click .remove-setting" : "removeEntry",
            "click .upload-setting" : "upload",
            "change select" : "onChangeHandler"
        },

        templateName: "metadata-translations-entry",
        templateItemName: "metadata-translations-item",

        initialize: function () {
            var templateName = _.result(this, 'templateItemName'),
                tpl = document.getElementById(templateName).text;

            if(!tpl) {
                console.error("Couldn't load template for item: " + templateName);
            }

            this.templateItem = _.template(tpl);
            AbstractEditor.prototype.initialize.apply(this, arguments);
        },

        getDropdown: function () {
            var dropdown,
                disableOptions = function (element, values) {
                    var dropdown = $(element).clone();

                    _.each(values, function(value, key) {
                        var option = dropdown[0].options.namedItem(key);

                        if (option) {
                            option.disabled = true;
                        }
                    });

                    return dropdown;
                };

            return function (values) {
                if (dropdown) {
                    return disableOptions(dropdown, values);
                }

                dropdown = document.createElement('select');
                dropdown.options.add(new Option());
                _.each(this.model.get('languages'), function(lang, index) {
                    var option = new Option();

                    option.setAttribute('name', lang.code);
                    option.value = lang.code;
                    option.text = lang.label;
                    dropdown.options.add(option);
                });

                return disableOptions(dropdown, values);
            };
        }(),

        getValueFromEditor: function () {
            var dict = {},
                items = this.$el.find('ol').find('.list-settings-item');

            _.each(items, function(element, index) {
                var key = $(element).find('select').val(),
                    value = $(element).find('.input').val();

                // Keys should be unique, so if our keys are duplicated and
                // second key is empty or key and value are empty just do
                // nothing. Otherwise, it'll be overwritten by the new value.
                if (value === '') {
                    if (key === '' || key in dict) {
                        return false;
                    }
                }

                dict[key] = value;
            });

            return dict;
        },

        // @TODO: Use backbone render patterns.
        setValueInEditor: function (values) {
            var self = this,
                frag = document.createDocumentFragment(),
                dropdown = self.getDropdown(values);

            _.each(values, function(value, key) {
                var html = $(self.templateItem({
                        'lang': key,
                        'value': value,
                        'url': self.model.get('urlRoot') + '/' + key
                    })).prepend(dropdown.clone().val(key))[0];

                frag.appendChild(html);
            });

            this.$el.find('ol').html([frag]);
        },

        addEntry: function(event) {
            event.preventDefault();
            // We don't call updateModel here since it's bound to the
            // change event
            var dict = $.extend(true, {}, this.model.get('value'));
            dict[''] = '';
            this.setValueInEditor(dict);
            this.$el.find('.create-setting').addClass('is-disabled');
        },

        removeEntry: function(event) {
            event.preventDefault();

            var entry = $(event.currentTarget).data('lang');
            this.setValueInEditor(_.omit(this.model.get('value'), entry));
            this.updateModel();
            this.$el.find('.create-setting').removeClass('is-disabled');
        },

        upload: function (event) {
            event.preventDefault();

            var self = this,
                target = $(event.currentTarget),
                lang = target.data('lang'),
                model = new FileUpload({
                    title: gettext('Upload translation.'),
                    fileFormats: ['srt']
                }),
                view = new UploadDialog({
                    model: model,
                    url: self.model.get('urlRoot') + '/' + lang,
                    onSuccess: function (response) {
                        if (!response['filename']) { return; }

                        var dict = $.extend(true, {}, self.model.get('value'));

                        dict[lang] = response['filename'];
                        self.model.setValue(dict);
                    }
                });

            $('.wrapper-view').after(view.show().el);
        },

        enableAdd: function() {
            this.$el.find('.create-setting').removeClass('is-disabled');
        },

        clear: function() {
            AbstractEditor.prototype.clear.apply(this, arguments);
            if (_.isNull(this.model.getValue())) {
                this.$el.find('.create-setting').removeClass('is-disabled');
            }
        },

        onChangeHandler: function (event) {
            this.showClearButton();
            this.enableAdd();
            this.updateModel();
        }
    });

    return Translations;
});
