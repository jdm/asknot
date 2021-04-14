// Licensed under Apache License, Version 2.0
// which is compatible with MPL V2.0
// sourced from https://newsdev.github.io/adcom/persist-js.html

+function (factory) {
  if (typeof define === 'function' && define.amd) {
    define('adcom/persist', ['jquery'], factory)
  } else {
    factory(window.jQuery)
  }
}(function ($) {
  'use strict';

  // PERSIST CLASS DEFINITION
  // ========================
  var Persist = function (element, options) {
    this.options = options
    this.$element = $(element)

    this.$key = this.options.key || this.$element.attr('id')

    this.observations = {}
    this.filters = {}
  }

  Persist.VERSION = '0.1.1'

  // These are meant to mirror MutationObserver options, plus some extras
  Persist.DEFAULTS = {
    key: null
  }

  Persist.prototype.attributes = function (attributes, filter) {
    var $this = this
    attributes = (typeof attributes == 'string') ? attributes.split(/[,\s]+/) : attributes
    filter = (typeof filter == 'string') ? filter.split(/[,\s]+/) : filter

    attributes.forEach(function(attr) {
      var key = { element: $this.$key, type: 'attributes', path: attr }
      $this.filters[key] = filter

      var ev = $.Event('add.ac.persist', { key: key })
      $this.$element.trigger(ev)
      if (ev.isDefaultPrevented()) return

      var observer = new MutationObserver(function (mutations) {
        mutations.forEach(function (mutation) {
          // Extend the mutation object with additional properties
          // Allows user event to change the persisted value if desired

          var value = $this.$element[0].getAttribute(attr)

          // if filters are turned on, filter out any attributes not in the
          // filter list for storage.
          if (filter) {
            value = $.unique($.grep(value.split(/[,\s]+/), function (item) { return filter.indexOf(item) > -1 })).join(' ')
          }

          // Change is persisted by hooking into the mutation event.
          // var ev = $.Event('mutation.ac.persist', $.extend({}, key, { mutation: mutation }))
          var ev = $.Event('mutation.ac.persist', { key: key, mutation: mutation, value: value })
          $this.$element.trigger(ev)
        })
      })

      var ev = $.Event('added.ac.persist', { key: key })
      $this.$element.trigger(ev)

      // Don't add mutation until after added, so we don't count initialization mutation...
      var options = $.extend({}, $this.options, { attributes: true, attributeFilter: [attr] })
      observer.observe($this.$element[0], options)

      // Remove old observer at this key
      if ($this.observations[key]) $this.observations[key].disconnect()
      $this.observations[key] = observer
    })
  }
  Persist.prototype.attribute = Persist.prototype.attributes

  function getPath (parent, child, path) {
    path = path || []
    if (parent.childNodes.length == 0 && parent != child) return false
    if (parent == child) return true

    for (var i = 0; i < parent.childNodes.length; i++) {
      var descendent = parent.childNodes[i]
      if (getPath(descendent, child, path) !== false) {
        path.unshift(i)
        return path
      }
    }
  }

  Persist.prototype.characterData = function () {
    var $this = this
    var key = { element: this.$key, type: 'characterData' }

    var ev = $.Event('add.ac.persist', { key: key })
    this.$element.trigger(ev)
    if (ev.isDefaultPrevented()) return

    var observer = new MutationObserver(function (mutations) {
      mutations.forEach(function (mutation) {
        var path = getPath($this.$element[0], mutation.target)

        var value = mutation.target.data

        var ev = $.Event('mutation.ac.persist', {
          mutation: mutation,
          value: value,
          key: $.extend({path: path.join('.')}, key)
        })
        $this.$element.trigger(ev)
      })
    })

    // How to get all separate records underneat this one..
    var ev = $.Event('added.ac.persist', { key: key })
    this.$element.trigger(ev)

    // Don't add mutation until after added, so we don't count initialization mutation...
    var options = $.extend({}, this.options, { characterData: true, subtree: true })
    observer.observe($this.$element[0], options)

    // Remove old observer at this key
    if ($this.observations[key]) $this.observations[key].disconnect()
    $this.observations[key] = observer
  }

  Persist.prototype.update = function (key, value) {
    switch (key.type) {
      case "attributes":
        var filter = this.filters[key]
        if (filter) {
          var currentValues = this.$element[0].getAttribute(key.path).split(/[,\s]+/)
          var storedValues = value.split(/[,\s]+/)

          var newValues = $.grep(currentValues, function (item) { return filter.indexOf(item) < 0 })
          newValues = $.unique($.merge(newValues, storedValues))
          value = newValues.join(' ')
        }
        this.$element.attr(key.path, value)
        break;

      case "characterData":
        var node = this.$element[0]
        key.path.split('.').forEach(function(idx) {
          node = node.childNodes[idx]
        })
        window.node = node
        node.replaceData(0, node.length, value)
        break;

      // case "childList":
      //   break;
    }
  }


  // PERSIST PLUGIN DEFINITION
  // =========================

  function Plugin(option) {
    var args = Array.prototype.slice.call(arguments, Plugin.length)
    return this.each(function () {
      var $this = $(this)
      var data  = $this.data('ac.persist')

      // Reset if we call the constructor again with options
      if (typeof option == 'object' && option && data) data = false

      var options = $.extend({}, Persist.DEFAULTS, $this.data(), data && data.options, typeof option == 'object' && option)

      if (!data) $this.data('ac.persist', (data = new Persist(this, options)))
      if (typeof option == 'string') data[option].apply(data, args)
    })
  }

  var old = $.fn.persist

  $.fn.persist             = Plugin
  $.fn.persist.Constructor = Persist

  // PERSIST NO CONFLICT
  // ===================

  $.fn.persist.noConflict = function () {
    $.fn.persist = old
    return this
  }

  return Persist
});
