import Ember from 'ember';
import Behavior, { onEvent } from 'ember-evented-behaviors';
import { keyDown } from 'ember-keyboard';

const {
  set
} = Ember;

export default Behavior.extend({
  items: null,

  subscribeEvents() {
    this.subscribe('selectOne', [ onEvent('click'), onEvent('onClick', 'shift+cmd') ]);
    this.subscribe(this.selectOneShift, onEvent('onClick', 'shift'), true);
    this.subscribe('selectAll', keyDown('cmd+KeyA'));
    this.subscribe('unselectAll', keyDown('cmd+KeyU'));
  },

  selectOne() {
    console.log('Selected one');
  },

  selectOneShift() {
    console.log('Selected one + shift');
  },

  selectAll(context, e) {
    console.log('Selected All');
    e.preventDefault();

    let items = this.get('items');
    items.forEach((i) => set(i, 'selected', true));
  },

  unselectAll(context, e) {
    console.log('Unselected All');
    e.preventDefault();

    let items = this.get('items');
    items.forEach((i) => set(i, 'selected', false));
  }
});