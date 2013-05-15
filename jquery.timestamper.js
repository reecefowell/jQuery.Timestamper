
/*
 * This file is part of the CCDNComponent CommonBundle
 *
 * (c) CCDN (c) CodeConsortium <http://www.codeconsortium.com/> 
 * 
 * Available on github <http://www.github.com/codeconsortium/CommonBundle>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

/**
 * Plugin jQuery.TimeStamper
 *
 * @author Reece Fowell <reece at codeconsortium dot com>
 *
 * Create fuzzy timestamps that autoupdate as time progresses.
 *
 * Requires JQuery, make sure to have JQuery included in your JS to use this.
 * JQuery needs to be loaded before this script in order for it to work.
 * @link http://jquery.com/
 *
 * Also requires moments.js
 * @link http://momentjs.com/
 */

$(document).ready(function() {
	$('abbr.timestamper').timestamper({
		interval: (1000 * 30)
	});
});

!function($) {

	//
	// TIMESTAMPER PLUGIN DEFINITION
	//
	$.fn.timestamper = function (params) {
		var iters = [];

		return this.each(function () {
			var $this = $(this);
			var obj = new Timestamper($this, params);
			setInterval($.proxy(obj.refresh, obj), obj.params.interval);
		});
	};

	//
	// TIMESTAMPER PUBLIC CLASS DEFINITION
	//
	var Timestamper = function (element, params) {
		this.init('timestamper', element, params)
	};

	Timestamper.prototype = {

		constructor: Timestamper,

		//
		// Default values.
		//
		defaults:  {
			interval: 10000,
			seconds: {
				inMinute: 60,
				inHour: (60 * 60),
				inDay: (60 * 60 * 24),
				inWeek: (60 * 60 * 24 * 7),
				inMonth: (60 * 60 * 24 * 7 * 4),
				inYear: (60 * 60 * 24 * 365)
			}
		},

		//
		// Initialise Object.
		// - Is called from the constructor.
		//
		init: function(type, element, params) {
			// Setup config.
			this.params = this.defaults;
			this.mergeDefaultParams(this.params, params);

			// Save objects.
			this.element = element;

			// Prepare the date object from the timestamp date string.
			this.ts = new moment.utc($(this.element).attr('title'), "YYYY-MM-DD HH:mm:ss TZ");

			// Initial run.
			this.refresh();
		},

		//
		// Merges optional parameters with defaults.
		// - Optional params will always overwrite default params.
		// - Undefined params will be added to the default params.
		//
		mergeDefaultParams: function(defaults, compare) {
			var self = this;

			$.each(compare, function(key, val) {
				if ($.isPlainObject(val)) {
					if (defaults.hasOwnProperty(key)) {
						self.mergeDefaultParams(defaults[key], val);
					} else {
						defaults[key] = val;
					}
				} else {
					if (defaults.hasOwnProperty(key)) {
						defaults[key] = val;
					}
				}
			});
		},

		//
		// Gets the new time message and sets the text value
		// of the element to the new timestamp message.
		//
		refresh: function() {
			var nw = new moment();
			var self = this;

			var message = function() {
				if (nw.diff(self.ts, 'seconds') < 60) { return self.ts.fromNow(); }
				if (nw.diff(self.ts, 'minutes') < 60) { return self.ts.fromNow(); }
				if (nw.diff(self.ts, 'hours') < 24) { return self.ts.fromNow(); }
				if (nw.diff(self.ts, 'days') < 7) { return self.ts.fromNow() + self.ts.format(' HH:mm'); }
				if (nw.diff(self.ts, 'weeks') < 4) { return self.ts.format('YYYY-MM-DD HH:mm:ss'); }
				if (nw.diff(self.ts, 'months') < 12) { return self.ts.format('YYYY-MM-DD HH:mm:ss'); }
				if (nw.diff(self.ts, 'years') < 1) { return self.ts.format('YYYY-MM-DD HH:mm:ss'); }
			};

			$(this.element).text(message());
		},

	};

}(window.jQuery);
