import Ember from 'ember';
import TaskEvent from 'ember-evented-tasks/-private/task-event';
import isEventedObject from 'ember-evented-tasks/utils/is-evented-object';

const {
  assert,
  observer,
  makeArray,
  A: emberArray
} = Ember;

export default Ember.Object.extend({
  disabled: false,

  // Private
  _events: null,
  _subscribers: null,

  init() {
    this._super(...arguments);

    this.set('_events', emberArray([]));
    this.set('_subscribers', emberArray([]));

    this.registerEvents();
  },

  destroy() {
    this._super(...arguments);

    this.get('_subscribers').forEach((s) => this.unsubscribe(s));
    this.set('_events', null);
    this.set('_subscribers', null);
  },

  registerEvents() {},

  register(method, eventNames, once = false) {
    let events = this.get('_events');
    let subscribers = this.get('_subscribers');

    makeArray(eventNames).forEach((name) => {
      let foundEvent = this._findEvent(method, name, once);

      if (!foundEvent) {
        let taskEvent = new TaskEvent(name, this, method, once);

        subscribers.forEach((s) => taskEvent.subscribe(s));
        events.pushObject(taskEvent);
      }
    });
  },

  unregister(method, eventNames, once = false) {
    let events = this.get('_events');
    let subscribers = this.get('_subscribers');

    makeArray(eventNames).forEach((name) => {
      let foundEvent = this._findEvent(method, name, once);

      if (foundEvent) {
        subscribers.forEach((s) => foundEvent.unsubscribe(s));
        events.removeObject(foundEvent);
      }
    });
  },

  subscribe(obj) {
    let subscribers = this.get('_subscribers');

    assert(`${obj} must be evented.`, isEventedObject(obj));

    if (!subscribers.includes(obj)) {
      obj.__ee_tasks__ = obj.__ee_tasks__ || emberArray([]);

      this._subscribe(obj);
      subscribers.addObject(obj);
      obj.__ee_tasks__.addObject(this);
    }
  },

  _subscribe(obj) {
    let disabled = this.get('disabled');
    let events = this.get('_events');

    if (disabled) {
      return;
    }

    events.forEach((event) => event.subscribe(obj));
  },

  unsubscribe(obj) {
    let subscribers = this.get('_subscribers');

    if (subscribers.includes(obj)) {
      this._unsubscribe(obj);
      subscribers.removeObject(obj);
      obj.__ee_tasks__.removeObject(this);
    }
  },

  _unsubscribe(obj) {
    this.get('_events').forEach((event) => event.unsubscribe(obj));
  },

  _findEvent(method, name, once) {
    let events = this.get('_events');

    return events.find((event) => {
      return event.method === method &&
             event.name === name &&
             event.once === once;
    });
  },

  _disabledDidChange: observer('disabled', function() {
    let disabled = this.get('disabled');
    let subscribers = this.get('_subscribers');

    if (disabled) {
      subscribers.forEach((s) => this._unsubscribe(s));
    } else {
      subscribers.forEach((s) => this._subscribe(s));
    }
  })
});
