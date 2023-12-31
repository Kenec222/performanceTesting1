/**
 * Copyright (C) 2021 Unicorn a.s.
 *
 * This program is free software: you can redistribute it and/or modify it under the terms of the GNU General Public
 * License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later
 * version.
 *
 * This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied
 * warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License at
 * <https://gnu.org/licenses/> for more details.
 *
 * You may obtain additional information at <https://unicorn.com> or contact Unicorn a.s. at address: V Kapslovne 2767/2,
 * Praha 3, Czech Republic or at the email: info@unicorn.com.
 */

import * as UU5 from "uu5g04";
import ns from "./bricks-editable-ns.js";
import Lsi from "./bricks-editable-lsi.js";
import Css from "./css.js";
import ColorPicker from "./color-picker.js";

const DEFAULT_PROPS_MAP = {
  contentEditable: false,
  columnsCount: 0,
  underline: false,
  level: null,
  header: "",
  footer: "",
  colorSchema: null,
  content: null,
  children: null,
};

const MAIN_CLASS_NAME = ns.css("newspaper-editable");
const NAME = ns.name("NewspaperEditable");

function getColumnsCountLsi(columnsCount) {
  if (columnsCount === 1) {
    return "columnsCountValue1";
  } else if (columnsCount === 2 || columnsCount === 3) {
    return "columnsCountValue2";
  } else {
    return "columnsCountValue3";
  }
}

export const NewspaperEditable = UU5.Common.VisualComponent.create({
  //@@viewOn:mixins
  mixins: [UU5.Common.BaseMixin],
  //@@viewOff:mixins

  //@@viewOn:statics
  statics: {
    tagName: NAME,
    classNames: {
      main: MAIN_CLASS_NAME,
      columnsCountDropdown: () =>
        Css.css(`
          &.uu5-bricks-editable-toolbar-dropdown {
            width: 148px;
          }
        `),
    },
    lsi: () => ({ ...Lsi.newspaper, ...Lsi.common }),
  },
  //@@viewOff:statics

  //@@viewOn:propTypes
  propTypes: {
    component: UU5.PropTypes.object.isRequired,
    renderView: UU5.PropTypes.func,
  },
  //@@viewOff:propTypes

  //@@viewOn:getDefaultProps
  getDefaultProps() {
    return {
      component: null,
      renderView: undefined,
    };
  },
  //@@viewOff:getDefaultProps

  //@@viewOn:reactLifeCycle
  getInitialState() {
    let values = this.props.component.getEditablePropsValues(Object.keys(DEFAULT_PROPS_MAP));

    return {
      ...values,
      showFooter: !!values.footer,
      showHeader: !!values.header,
    };
  },
  //@@viewOff:reactLifeCycle

  //@@viewOn:interface
  getPropsToSave() {
    return this._getPropsToSave();
  },
  //@@viewOff:interface

  //@@viewOn:overridingMethods
  //@@viewOff:overridingMethods

  //@@viewOn:private
  // props actions
  _onEndEditation() {
    this.props.component.endEditation(this._getPropsToSave());
  },

  _getPropsToSave(state = this.state) {
    // eslint-disable-next-line no-unused-vars
    let { showFooter, showHeader, children, content, ...result } = state;

    for (let propName in DEFAULT_PROPS_MAP) {
      if (result[propName] !== undefined && result[propName] === DEFAULT_PROPS_MAP[propName]) {
        result[propName] = undefined;
      }
    }

    // remove header or footer if they are not showed
    if (!showHeader) {
      result.header = undefined;
    }
    if (!showFooter) {
      result.footer = undefined;
    }

    return result;
  },

  // change state handlers
  _changeColorSchema(opt) {
    this.setState({ colorSchema: opt.value }, () => {
      this.props.component.saveEditation({
        colorSchema: !opt.value || opt.value === "default" ? undefined : opt.value,
      });
    });
  },

  _toggleHeader(value, setStateCallback) {
    this.setState(
      (state) => ({
        showHeader: !state.showHeader,
      }),
      setStateCallback
    );
  },

  _toggleFooter(value, setStateCallback) {
    this.setState(
      (state) => ({
        showFooter: !state.showFooter,
      }),
      setStateCallback
    );
  },

  _toggleUnderline() {
    this.setState((state) => ({ underline: !state.underline }));
  },

  _changeLevel(value, setStateCallback) {
    this.setState({ level: value }, setStateCallback);
  },

  _changeColumnsCount(value) {
    this.setState({ columnsCount: value }, () => this.props.component.saveEditation({ columnsCount: value }));
  },

  _changeHeaderContent(opt) {
    this.setState({ header: opt.value });
  },

  _changeFooterContent(opt) {
    this.setState({ footer: opt.value });
  },

  _getHeaderToolbarItems() {
    let levelItems = [1, 2, 3, 4, 5, 6].map((level) => ({
      content: `${this.getLsiValue("level")} ${level}`,
      value: level,
    }));
    levelItems.unshift({ content: this.getLsiValue("defaultLevel"), value: null });

    return [
      {
        type: "button",
        props: () => {
          return {
            pressed: this.state.underline,
            onClick: this._toggleUnderline,
            tooltip: this.getLsiValue("underlineTooltip"),
            icon: "mdi-format-underline",
          };
        },
      },
      {
        type: "dropdown",
        props: () => {
          let label = this.state.level
            ? `${this.getLsiValue("level")} ${this.state.level}`
            : `${this.getLsiValue("defaultLevel")}`;

          return {
            value: this.state.level,
            label,
            onClick: this._changeLevel,
            tooltip: this.getLsiValue("levelTooltip"),
            items: levelItems,
            className: this.getClassName("levelDropdown"),
          };
        },
      },
    ];
  },

  _getToolbarItems() {
    let columnsCountItems = [1, 2, 3, 4, 5, 6].map((columnsCount) => ({
      content: `${columnsCount} ${this.getLsiValue(getColumnsCountLsi(columnsCount))}`,
      value: columnsCount,
    }));

    return [
      {
        type: ColorPicker,
        props: () => {
          return {
            value: this.state.colorSchema,
            onClick: this._changeColorSchema,
            tooltip: this.getLsiValue("colorSchemaTooltip"),
          };
        },
      },
      {
        type: "dropdown",
        props: () => {
          let label = `${this.state.columnsCount} ${this.getLsiValue(getColumnsCountLsi(this.state.columnsCount))}`;

          return {
            value: this.state.columnsCount,
            label,
            onClick: this._changeColumnsCount,
            tooltip: this.getLsiValue("columnsCountTooltip"),
            items: columnsCountItems,
            className: this.getClassName("columnsCountDropdown"),
          };
        },
      },
    ];
  },

  _getToolbarSettings() {
    return [
      {
        value: this.state.showHeader,
        onClick: this._toggleHeader,
        label: this.getLsiComponent("showHeaderCheckboxLabel"),
      },
      {
        value: this.state.showFooter,
        onClick: this._toggleFooter,
        label: this.getLsiComponent("showFooterCheckboxLabel"),
      },
    ];
  },
  //@@viewOff:private

  //@@viewOn:render
  render() {
    const mainProps = this.getMainPropsToPass();
    return (
      <UU5.BricksEditable.Toolbar
        {...mainProps}
        onClose={this._onEndEditation}
        settingsItems={this._getToolbarSettings()}
        items={this._getToolbarItems()}
      >
        {this.props.renderView(
          [
            this.state.showHeader ? (
              <UU5.BricksEditable.Input
                value={this.state.header || ""}
                placeholder={this.getLsi("headerPlaceholder")}
                onChange={this._changeHeaderContent}
                toolbarItems={this._getHeaderToolbarItems()}
                key="headerInput"
              >
                {({ children }) => (
                  <UU5.Bricks.Header
                    underline={this.state.underline}
                    level={this.state.level}
                    parent={this.props.renderInline ? undefined : this.props.component}
                    nestingLevel={undefined}
                  >
                    {children}
                  </UU5.Bricks.Header>
                )}
              </UU5.BricksEditable.Input>
            ) : null,
            this.props.component.getChildren(),
            this.state.showFooter ? (
              <UU5.BricksEditable.Input
                value={this.state.footer || ""}
                placeholder={this.getLsi("footerPlaceholder")}
                onChange={this._changeFooterContent}
                key="footerInput"
              >
                {({ children }) => <UU5.Bricks.Footer parent={this.props.component}>{children}</UU5.Bricks.Footer>}
              </UU5.BricksEditable.Input>
            ) : null,
          ],
          undefined,
          true
        )}
      </UU5.BricksEditable.Toolbar>
    );
  },
  //@@viewOff:render
});

export default NewspaperEditable;
