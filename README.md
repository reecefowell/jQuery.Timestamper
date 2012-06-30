TIMESTAMPER jQuery Plugin.
==========================

### About

Create fuzzy timestamps that auto update as time progresses.

By Reece Fowell <reece [at] codeconsortium [dot] com>

eg:
	1 minute ago.
	3 hours ago.
	17:50 Yesterday.

### Setup
To use this plugin please add jQuery to your site.

This plugin was built using jQuery 1.7.1.

Usage is simple, Make your timestamps an abbreviation like so:

```html
<abbr class="timestamper" title="2012-06-30 07:31">2012-06-30 at 07:31</abbr>
```

The content of the abbr does not matter, use whatever timestamp you like, bearing
in mind that search engines will cache the content of the page so put a sensible date
in there. 

The class should be timestamper if you want minimal setup, but can be changed.

The title must adhere to the date format of YYYY-MM-DD HH:II, timestamper will either not work
or do something funky if this is not setup correctly.

You can choose your own selector and change the css class to whatever you like by adding the
following to your html head.

```html
<head>
	<script type="text/javascript">
		$(document).ready(function() {
			$('abbr.timestamper').timestamper({ 
				interval: (1000 * 60 * 5),
			});
	
		});
	</script>
</head>
```

The interval is how often the fuzzy timestamp will update. Change the tag and its selector in
the jQuery $('tag.class') part.

### Full Configuration:

```html
<head>
	<script type="text/javascript">
		$(document).ready(function() {
			$('abbr.timestamper').timestamper({
				interval: 10000,
				message: {
					just_now: 'less than a minute ago',
					min_1: '1 minute ago',
					min_x: '{IA} minutes ago',
					hour_1: '1 hour ago',
					hour_x: '{HA} hours ago',
					day_1: '{H}:{I} Yesterday',
					day_x: '{DA} days ago at {H}:{I}',
				},
				seconds: {
					inMinute: 60,
					inHour: (60 * 60),
					inDay: (60 * 60 * 24),
					inWeek: (60 * 60 * 24 * 7),
					inMonth: (60 * 60 * 24 * 7 * 4),
					inYear: (60 * 60 * 24 * 365)
				}
			}
		});
	</script>
</head>
```
