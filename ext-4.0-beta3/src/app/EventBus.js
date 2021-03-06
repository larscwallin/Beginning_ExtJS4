/**
 * @class Ext.app.EventBus
 *
 * Class documentation for the MVC classes will be present before 4.0 final, in the mean time please refer to the MVC
 * guide
 */
Ext.define('Ext.app.EventBus', {
    requires: [
        'Ext.util.Event'
    ],
    mixins: {
        observable: 'Ext.util.Observable'
    },
    
    constructor: function() {
        this.mixins.observable.constructor.call(this);
        
        this.bus = {};
        
        var me = this;
        Ext.override(Ext.Component, {
            fireEvent: function(ev) {
                if (Ext.util.Observable.prototype.fireEvent.apply(this, arguments) !== false) {
                    return me.dispatch.call(me, ev, this, arguments);
                }
                return false;
            }
        });
    },

    dispatch: function(ev, target, args) {
        var bus = this.bus,
            selectors = bus[ev],
            selector, controllers, id, events, event, i, ln;
        
        if (selectors) {
            // Loop over all the selectors that are bound to this event
            for (selector in selectors) {
                // Check if the target matches the selector
                if (target.is(selector)) {
                    // Loop over all the controllers that are bound to this selector   
                    controllers = selectors[selector];
                    for (id in controllers) {
                        // Loop over all the events that are bound to this selector on this controller
                        events = controllers[id];
                        for (i = 0, ln = events.length; i < ln; i++) {
                            event = events[i];
                            // Fire the event!
                            return event.fire.apply(event, Array.prototype.slice.call(args, 1));
                        }
                    }
                }
            }
        }
    },
    
    control: function(selectors, listeners, controller) {
        var bus = this.bus,
            selector, fn;
        
        if (Ext.isString(selectors)) {
            selector = selectors;
            selectors = {};
            selectors[selector] = listeners;
            this.control(selectors, null, controller);
            return;
        }
    
        Ext.Object.each(selectors, function(selector, listeners) {
            Ext.Object.each(listeners, function(ev, listener) {
                var options = {},   
                    scope = controller,
                    event = Ext.create('Ext.util.Event', controller, ev);
                
                // Normalize the listener                
                if (Ext.isObject(listener)) {
                    options = listener;
                    listener = options.fn;
                    scope = options.scope || controller;
                    delete options.fn;
                    delete options.scope;
                }
                
                event.addListener(listener, scope, options);

                // Create the bus tree if it is not there yet
                bus[ev] = bus[ev] || {};
                bus[ev][selector] = bus[ev][selector] || {};
                bus[ev][selector][controller.id] = bus[ev][selector][controller.id] || [];            
                
                // Push our listener in our bus
                bus[ev][selector][controller.id].push(event);
            });
        });
    }
});