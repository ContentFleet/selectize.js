/**
 * Plugin: "include_exclude" (selectize.js)
 * Copyright (c) 2014 Christoph Brennecke <cb@contentfleet.com>
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this
 * file except in compliance with the License. You may obtain a copy of the License at:
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF
 * ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 *
 * @author Christoph Brennecke <cb@contentfleet.com>
 */

Selectize.define('include_exclude', function(options) {
  if (this.settings.mode === 'single') return;

  options = $.extend({
    label       : '+',
    title       : 'Include/exclude',
    className   : 'include-exclude',
    prepend     : true,
    excludeLabel: '-',
    excludeClass: 'excluded'
  }, options);

  var self = this;
  var html = '<a href="javascript:void(0)" class="' + options.className + '" tabindex="-1" title="' + escape_html(options.title) + '">' + options.label + '</a>';

  /**
   * Appends an element as a child (with raw HTML).
   *
   * @param {string} html_container
   * @param {string} html_element
   * @param {bool} exclude
   * @return {string}
   */
  var prepend = function(html_container, html_element, exclude) {
    var $container = $(html_container).prepend(html_element);
    if (exclude) {
      $container.addClass(options.excludeClass);
      $container.find('.include-exclude').text(options.excludeLabel);
    }
    return $container[0].outerHTML;
  };

  this.render = (function() {
    var original = self.render;
    return function(templateName, data) {
      var label = data[self.settings.labelField];
      if (templateName === 'item' && label && (label[0] === '-')) {
        data[self.settings.labelField] = label.substr(1);
      }
      return original.apply(this, arguments);
    };
  })();

  this.setup = (function() {
    var original = self.setup;
    return function() {
      // override the item rendering method to add the button to each
      if (options.prepend) {
        var render_item = self.settings.render.item;
        self.settings.render.item = function(data) {
          var value = data[self.settings.valueField];
          var exclude = value.length && (value[0] === '-');
          return prepend(render_item.apply(this, arguments), html, exclude);
        };
      }

      original.apply(this, arguments);

      // add event listener
      this.$control.on('click', '.' + options.className, function(e) {
        e.preventDefault();
        if (self.isLocked) return;

        var $target = $(e.currentTarget);
        var $item = $target.parent();
        $item.toggleClass(options.excludeClass);
        var excluded = $item.hasClass(options.excludeClass);
        $target.text(excluded ? options.excludeLabel : options.label);

        var currentValue = $item.attr('data-value');
        var newValue = currentValue;
        if (excluded)
          newValue = '-' + currentValue;
        else
          newValue = currentValue.substr(1);

        var data = self.options[currentValue];
        if (!data) return;

        data[self.settings.valueField] = newValue;

        self.updateOption(currentValue, data);
      });

    };
  })();

});