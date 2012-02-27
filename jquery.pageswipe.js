/**
 * pageSwipe 1.1
 * https://github.com/torkiljohnsen/swipe
 *
 * Adapted from https://github.com/sgentile/jquery.swipe
 * Borrowed some ideas from https://github.com/bradbirdsall/Swipe
 * Modelled after http://www.virgentech.com/blog/2009/10/building-object-oriented-jquery-plugin.html
 *
 * Dual licensed under the MIT and GPL licenses
 */

(function($){
    var Swipeable = function(element, options)
    {
        var plugin   = this;
        var page     = $(element);
        var defaults = {
            minSwipeLength  : 20, // the shortest distance, in % of the page width, that user must swipe to move the page
            snapPosition    : 85  // number of % left/right that the page will be moved on a successful swipe. If set to 100%, the page will disappear completely.
        };

        plugin.config = {};

        var init = function() {
            plugin.config = $.extend(defaults, options || {});
            attach();
        };

        var attach = function () {

            // attach handlers to events
            page.on({
                "touchstart": function(event) {
                    // http://stackoverflow.com/questions/671498/jquery-live-removing-iphone-touch-event-attributes
                    this.touchStart(event.originalEvent);
                },
                "touchmove": function(event) {
                    this.touchMove(event.originalEvent);
                },
                "touchcancel": function(event) {
                    this.touchCancel(event.originalEvent);
                },
                "touchend": function(event) {
                    this.touchEnd(event.originalEvent);
                }
            });

            // Windows 8 touch support
            if (window.navigator.msPointerEnabled) {
                page.on({
                    "MSPointerCancel": function(event) {
                        this.touchCancel(event.originalEvent);
                       
                    },
                    "MSPointerDown": function(event) {
                        this.touchStart(event.originalEvent);
                    },
                    "MSPointerMove": function(event) {
                        this.touchMove(event.originalEvent);

                    },
                    "MSPointerOut": function(event) {
                        this.touchCancel(event.originalEvent);
                       
                    },
                    "MSPointerUp": function(event) {
                        this.touchEnd(event.originalEvent);
                    }
                });
            }
        };

        init();
    };

    $.fn.swipeable = function(options)
    {
        return this.each(function() {
           var element = $(this);
          
           // Return early if this element already has a plugin instance
           if (element.data('swipeable')) return;

           // pass options to plugin constructor
           var swipeable = new Swipeable(this, options);

           // Store plugin object in this element's data
           element.data('swipeable', swipeable);
        });
    };
})(jQuery);

/*
(function($) {
    $.fn.pageSwipe = function() {

        // Set options
        var defaults = {
            minSwipeLength      : 20, // the shortest distance, in % of the page width, that user must swipe to move the page
            snapPosition        : 85  // number of % left/right that the page will be moved on a successful swipe. If set to 100%, the page will disappear completely.
        };

        var options = $.extend(defaults, options);
    
        return this.each(function() {

            var page = $(this);

            // attach handlers to events
            page.on({
                "touchstart": function(event) {
                    // http://stackoverflow.com/questions/671498/jquery-live-removing-iphone-touch-event-attributes
                    this.touchStart(event.originalEvent);
                },
                "touchmove": function(event) {
                    this.touchMove(event.originalEvent);
                },
                "touchcancel": function(event) {
                    this.touchCancel(event.originalEvent);
                },
                "touchend": function(event) {
                    this.touchEnd(event.originalEvent, function (swipe) {
                        this._trigger("swiped", event, { swipeDirection: swipe });
                    });
                }
            });

            // Windows 8 touch support
            if (window.navigator.msPointerEnabled) {
                page.on({
                    "MSPointerCancel": function(event) {
                        this.touchCancel(event.originalEvent);
                       
                    },
                    "MSPointerDown": function(event) {
                        this.touchStart(event.originalEvent);
                    },
                    "MSPointerMove": function(event) {
                        this.touchMove(event.originalEvent);

                    },
                    "MSPointerOut": function(event) {
                        this.touchCancel(event.originalEvent);
                       
                    },
                    "MSPointerUp": function(event) {
                        this.touchEnd(event.originalEvent, function(swipe) {
                            this._trigger("swiped", event, { swipeDirection: swipe });
                        });
                    }
                });
            }

        });
    
    };
})(jQuery);*/