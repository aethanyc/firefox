/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/. */

"use strict";

const {
  createRef,
  Component,
} = require("resource://devtools/client/shared/vendor/react.mjs");
const PropTypes = require("resource://devtools/client/shared/vendor/react-prop-types.mjs");
const dom = require("resource://devtools/client/shared/vendor/react-dom-factories.js");

class Draggable extends Component {
  static get propTypes() {
    return {
      onMove: PropTypes.func.isRequired,
      onDoubleClick: PropTypes.func,
      onStart: PropTypes.func,
      onStop: PropTypes.func,
      style: PropTypes.object,
      title: PropTypes.string,
      className: PropTypes.string,
    };
  }

  constructor(props) {
    super(props);

    this.draggableEl = createRef();

    this.startDragging = this.startDragging.bind(this);
    this.stopDragging = this.stopDragging.bind(this);
    this.onDoubleClick = this.onDoubleClick.bind(this);
    this.onMove = this.onMove.bind(this);

    this.mouseX = 0;
    this.mouseY = 0;
  }
  startDragging(ev) {
    // We want to handle a drag during a mouse button is pressed.  So, we can
    // ignore pointer events which are caused by other devices.
    if (ev.pointerType != "mouse") {
      return;
    }

    const xDiff = Math.abs(this.mouseX - ev.clientX);
    const yDiff = Math.abs(this.mouseY - ev.clientY);

    // This allows for double-click.
    if (this.props.onDoubleClick && xDiff + yDiff <= 1) {
      return;
    }
    this.mouseX = ev.clientX;
    this.mouseY = ev.clientY;

    if (this.isDragging) {
      return;
    }
    this.isDragging = true;

    // "pointermove" is fired when the button state is changed too.  Therefore,
    // we should listen to "mousemove" to handle the pointer position changes.
    this.draggableEl.current.addEventListener("mousemove", this.onMove);
    this.draggableEl.current.setPointerCapture(ev.pointerId);
    this.draggableEl.current.addEventListener(
      "mousedown",
      event => event.preventDefault(),
      { once: true }
    );

    this.props.onStart && this.props.onStart();
  }

  onDoubleClick() {
    if (this.props.onDoubleClick) {
      this.props.onDoubleClick();
    }
  }

  onMove(ev) {
    if (!this.isDragging) {
      return;
    }

    ev.preventDefault();
    // Use viewport coordinates so, moving mouse over iframes
    // doesn't mangle (relative) coordinates.
    this.props.onMove(ev.clientX, ev.clientY);
  }

  stopDragging() {
    if (!this.isDragging) {
      return;
    }
    this.isDragging = false;
    this.draggableEl.current.removeEventListener("mousemove", this.onMove);
    this.draggableEl.current.addEventListener(
      "mouseup",
      event => event.preventDefault(),
      { once: true }
    );
    this.props.onStop && this.props.onStop();
  }

  render() {
    return dom.div({
      ref: this.draggableEl,
      role: "presentation",
      style: this.props.style,
      title: this.props.title,
      className: this.props.className,
      onPointerDown: this.startDragging,
      onPointerUp: this.stopDragging,
      onDoubleClick: this.onDoubleClick,
    });
  }
}

module.exports = Draggable;
