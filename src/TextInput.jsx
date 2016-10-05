import React from 'react';

import nodeHeight from './nodeHeight';

import css from './text-input.css';

export default class TextInput extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      focus: false,
      height: null,
      minHeight: -Infinity,
      maxHeight: Infinity
    }

    this.calculateHeight = this.calculateHeight.bind(this);
    this.handleFocus = this.handleFocus.bind(this);
    this.handleBlur = this.handleBlur.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.handleKeyDown = this.handleKeyDown.bind(this);
  }

  componentDidMount() {
    this.calculateHeight();
    window.addEventListener('resize', this.calculateHeight);
  }

  componentWillReceiveProps() {
    // Render the content and then update the state/height
    clearTimeout(this.updateId);
    this.updateId = setTimeout(this.calculateHeight, 0);
  }

  componentWillUnmount() {
    clearTimeout(this.updateId);
    window.removeEventListener('resize', this.calculateHeight);
  }

  handleFocus(event) {
    if (!this.props.editable) {
      return;
    }
    this.setState({
      focus: true
    });
    if (typeof this.props.onFocus === 'function') {
      this.props.onFocus(event);
    }
  }

  handleBlur(event) {
    this.setState({
      focus: false
    });
    if (typeof this.props.onBlur === 'function') {
      this.props.onBlur(event);
    }
  }

  handleChange(event) {
    this.calculateHeight();

    if (typeof this.props.onChange === 'function') {
      this.props.onChange(event);
    }
  }

  handleKeyDown(event) {
    if (event.key === 'Enter' || event.keyCode === 13) {
      event.preventDefault();
      if (typeof this.props.onEnterKeyDown === 'function') {
        this.props.onEnterKeyDown(event);
      }
    }
    if (typeof this.props.onKeyDown === 'function') {
      this.props.onKeyDown(event);
    }
  }

  /**
   * Calculate the height of the node and update the state
   */
  calculateHeight() {
    let state = nodeHeight(
      this.refs.input,
      this.props.minRows,
      this.props.maxRows
    );
    this.setState(state);
 }

  /**
  * Get css class names for the component for it's different states
  * @return {String}
  */
  classNames() {
    let classes = ['text-input', css.container, this.props.className];

    let value = this.props.value || this.props.defaultValue;
    let valueIsNotEmpty = value && value.length > 0;

    if (this.state.focus || valueIsNotEmpty) {
     classes.push(css.active);
    }

    if (this.state.focus) {
     classes.push(css.focus);
    }

    if (this.props.label) {
      classes.push(css.hasLabel);
    }

    if (valueIsNotEmpty && typeof this.props.validate === 'function') {
      if (this.validate(this.props.value)) {
        classes.push(css.success);
      } else {
        classes.push(css.error);
      }
    }

    return classes
      .filter((cla) => typeof cla === 'string' && cla.length)
      .join(' ')
      .trim();
  }

  /**
   * If we have a validate function call it
   * @param  {Mixed} value
   * @return {Boolean}
   */
  validate(value) {
    if (typeof this.props.validate !== 'function') {
      return true;
    }
    return this.props.validate(value);
  }

  /**
   * Render
   * @return {React}
   */
  render(){
    let props = this.props;
    let styles = { props };

    styles.height = this.state.height;

    let maxHeight = Math.max(styles.maxHeight ? styles.maxHeight : -Infinity, this.state.maxHeight);

    // Hide scrollbar if we don't need it
    if (maxHeight >= this.state.height) {
      styles.overflow = 'hidden';
    } else {
      styles.overflow = 'auto';
    }

    return (
      <div className={this.classNames()}>
        <textarea
          placeholder={this.props.placeholder}
          tabIndex={this.props.tabIndex}
          onDragStart={this.props.onDragStart}
          onDragEnd={this.props.onDragEnd}
          onDragOver={this.props.onDragOver}
          className={'text-input--field ' + css.field}
          ref='input'
          disabled={this.props.disabled || !this.props.editable}
          style={styles}
          value={this.props.value}
          onClick={this.props.onClick}
          onFocus={this.handleFocus}
          onBlur={this.handleBlur}
          onChange={this.handleChange}
          onKeyDown={this.handleKeyDown}
        />
        {this.props.label ?
          <label className={'text-input--label ' + css.label}>
            {this.props.label}
          </label>
        : null}
      </div>
    );
  }
}

/**
 * Defaults
 * @type {Object}
 */
TextInput.defaultProps = {
  editable: true,
  value: '',
  label: null
};
