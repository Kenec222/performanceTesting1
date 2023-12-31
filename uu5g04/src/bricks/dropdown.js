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

//@@viewOn:revision
// coded: Martin Mach, 09.09.2020
// reviewed: Filip Janovský, 14.09.2020 - approved
//@@viewOff:revision

//@@viewOn:imports
import * as UU5 from "uu5g04";
import ns from "./bricks-ns.js";
const ClassNames = UU5.Common.ClassNames;

import Button from "./button.js";
import Icon from "./icon.js";
import DropdownItem from "./dropdown-item.js";
import Popover from "./popover.js";
import CompactMenu from "./internal/compact-menu";

import "./dropdown.less";
import Css from "./internal/css.js";

const DropdownEditable = UU5.Common.Component.lazy(async () => {
  await SystemJS.import("uu5g04-forms");
  await SystemJS.import("uu5g04-bricks-editable");
  return import("./internal/dropdown-editable.js");
});
//@@viewOff:imports

export const Dropdown = UU5.Common.VisualComponent.create({
  displayName: "Dropdown", // for backward compatibility (test snapshots)
  //@@viewOn:mixins
  mixins: [
    UU5.Common.BaseMixin,
    UU5.Common.ElementaryMixin,
    UU5.Common.ColorSchemaMixin,
    UU5.Common.ContentMixin,
    UU5.Common.NestingLevelMixin,
    UU5.Common.PureRenderMixin,
    UU5.Common.EditableMixin,
  ],
  //@@viewOff:mixins

  //@@viewOn:statics
  statics: {
    tagName: ns.name("Dropdown"),
    nestingLevelList: UU5.Environment.getNestingLevelList("bigBoxCollection", "box"),
    classNames: {
      main: ns.css("dropdown"),
      dropdown: ns.css("dropdown-dropdown"),
      dropup: ns.css("dropdown-dropup"),
      split: ns.css("dropdown-group"),
      buttonGroup: ns.css("button-group", "button-group-horizontal"),
      pullRight: ns.css("dropdown-right"),
      pullRightMenu: ns.css("dropdown-menu-right"),
      dropdownBtn: ns.css("dropdown-button"),
      buttonCover: ns.css("dropdown-button-cover"),
      menu: ns.css("dropdown-menu"),
      menuList: ns.css("dropdown-menu-list"),
      menuWrapper: ns.css("dropdown-menu-wrapper"),
      open: ns.css("dropdown-open"),
      autoDropup: ns.css("dropdown-dropup"),
      autoDropdown: ns.css("dropdown-dropdown"),
      block: ns.css("dropdown-block"),
      linkSplit: ns.css("dropdown-link-split"),
      size: ns.css("dropdown-size-"),
      compactMenu: () => Css.css`
        min-width: 160px;
        background: #FFFFFF;
        padding: 2px 0;
        border: 1px solid #BDBDBD;
        border-radius: 2px;
        box-shadow: 0 2px 7px 0 rgba(0, 0, 0, 0.34);
        background-clip: padding-box;
      `,
      displayBlock: () => Css.css`display: block;`,
    },
    defaults: {
      childTagName: DropdownItem.tagName,
      offset: 4,
    },
    opt: {
      nestingLevelRoot: true,
    },
  },
  //@@viewOff:statics

  //@@viewOn:propTypes
  propTypes: {
    label: UU5.PropTypes.any, // content
    size: UU5.PropTypes.string,
    onClick: UU5.PropTypes.func,
    bgStyle: UU5.PropTypes.oneOf(["filled", "outline", "transparent", "underline", "link"]),

    // icon props
    iconOpen: UU5.PropTypes.string,
    iconClosed: UU5.PropTypes.string,
    iconHidden: UU5.PropTypes.bool,

    // dropdown props
    items: UU5.PropTypes.arrayOf(UU5.PropTypes.object),
    pullRight: UU5.PropTypes.bool,
    dropup: UU5.PropTypes.bool,
    split: UU5.PropTypes.bool,

    // link child props
    smoothScroll: UU5.PropTypes.number,
    offset: UU5.PropTypes.number,

    closedOnLeave: UU5.PropTypes.bool,
    openOnHover: UU5.PropTypes.bool,
    allowTags: UU5.PropTypes.arrayOf(UU5.PropTypes.string),
    disableBackdrop: UU5.PropTypes.bool,
    menuClassName: UU5.PropTypes.string,
    borderRadius: UU5.PropTypes.string,
    elevation: UU5.PropTypes.oneOf(["-1", "0", "1", "2", "3", "4", "5", -1, 0, 1, 2, 3, 4, 5]),
    elevationHover: UU5.PropTypes.oneOf(["-1", "0", "1", "2", "3", "4", "5", -1, 0, 1, 2, 3, 4, 5]),
    buttonProps: UU5.PropTypes.object,
    splitButtonProps: UU5.PropTypes.object,
    baseline: UU5.PropTypes.bool,
    fitMenuToViewport: UU5.PropTypes.bool,
    popoverLocation: UU5.PropTypes.oneOf(["local", "portal"]),
    compactSubmenu: UU5.PropTypes.oneOfType([UU5.PropTypes.bool, UU5.PropTypes.string]),
  },
  //@@viewOff:propTypes

  //@@viewOn:getDefaultProps
  getDefaultProps() {
    return {
      label: "Dropdown",
      size: "m",
      onClick: null,
      bgStyle: "filled",
      iconOpen: "mdi-menu-down",
      iconClosed: "mdi-menu-down",
      items: [],
      iconHidden: false,
      pullRight: false,
      dropup: false,
      split: false,
      smoothScroll: 1000,
      offset: null,
      closedOnLeave: false,
      openOnHover: false,
      allowTags: [],
      disableBackdrop: false,
      menuClassName: null,
      borderRadius: null,
      elevation: null,
      elevationHover: null,
      buttonProps: null,
      splitButtonProps: null,
      baseline: false,
      fitMenuToViewport: false,
      popoverLocation: "local", // "local" <=> backward-compatible behaviour
      compactSubmenu: "xs",
    };
  },
  //@@viewOff:getDefaultProps

  //@@viewOn:reactLifeCycle
  getInitialState() {
    return {
      open: false,
      pullRight: false,
      block: false,
    };
  },
  //@@viewOff:reactLifeCycle

  //@@viewOn:interface
  isDropdown() {
    return true;
  },

  open(setStateCallback) {
    if (this.isOpen()) return this;
    this.setState({ open: true }, () => this._open(setStateCallback));
    return this;
  },

  close(setStateCallback) {
    this.setState({ open: false }, setStateCallback);
    return this;
  },

  toggle(setStateCallback) {
    this.setState(
      (state) => {
        return { open: !state.open };
      },
      () => this.isOpen() && this._open(setStateCallback)
    );
    return this;
  },

  isOpen() {
    return this.state.open;
  },
  //@@viewOff:interface

  //@@viewOn:overriding
  shouldChildRender_(child) {
    let childTagName = UU5.Common.Tools.getChildTagName(child);
    let defaultChildTagName = this.getDefault().childTagName;
    let childTagNames = this.props.allowTags.concat(defaultChildTagName);
    let result = childTagNames.indexOf(childTagName) > -1;
    if (!result && (typeof child !== "string" || child.trim())) {
      if (childTagName)
        this.showError("childTagNotAllowed", [childTagName, this.getTagName(), childTagName, defaultChildTagName], {
          mixinName: "UU5.Common.BaseMixin",
        });
      else this.showError("childNotAllowed", [child, defaultChildTagName], { mixinName: "UU5.Common.BaseMixin" });
    }
    return result;
  },

  expandChildProps_(child) {
    const newChildProps = { ...child.props };

    newChildProps.smoothScroll = newChildProps.smoothScroll || this.props.smoothScroll;
    newChildProps.offset = newChildProps.offset || this.props.offset;
    newChildProps.dropup = newChildProps.dropup || (this.state && this.state.dropup);

    return newChildProps;
  },

  onBeforeForceEndEditation_() {
    return this._editRef ? this._editRef.getPropsToSave() : undefined;
  },
  //@@viewOff:overriding

  //@@viewOn:private
  _findTarget(item) {
    let result = false;
    let id = this.getId();

    if (item.id === id) {
      result = true;
    } else if (item.parentElement) {
      result = this._findTarget(item.parentElement);
    }

    return result;
  },

  _getIcon() {
    let icon = null;
    if (!this.props.iconHidden) {
      var iconName = this.isOpen() ? this.props.iconOpen : this.props.iconClosed;
      icon = <Icon key="ddicon" icon={iconName} />;
    }
    return icon;
  },

  _getCompactMenuItems(content) {
    return UU5.Common.Children.toArray(content).map((child) => {
      let props = child.props;
      if (props.divider) {
        return "separator";
      } else {
        let itemContent = props.content || props.children;
        let items = itemContent && props.label ? this._getCompactMenuItems(itemContent) : undefined;
        return {
          ...props,
          content: null,
          children: null,
          label: props.label || itemContent,
          items,
          onClick: (opt) => {
            if (typeof props.onClick === "function") props.onClick(opt.item, opt.event);
            if (!items) this.close();
          },
        };
      }
    });
  },

  _getChildren({ screenSize }) {
    let screenSizeRegExp = new RegExp(`\\b${screenSize}\\b`);
    if (this.props.compactSubmenu === true || this.props.compactSubmenu.match(screenSizeRegExp)) {
      let content;

      if (this.props.items && this.props.items.length > 0) {
        content = {
          tag: this.getDefault().childTagName,
          propsArray: this.props.items,
        };
      } else if (this.props.children) {
        content = this.props.children;
      } else if (this.props.content) {
        content = this.props.content;
      }
      return (
        <CompactMenu
          items={this._getCompactMenuItems(
            UU5.Utils.Content.getChildren(content, this.props, { nestingLevel: this.constructor.nestingLevelList })
          )}
          className={this.getClassName("compactMenu")}
        />
      );
    } else {
      let contentProps = {};

      if (this.props.items && this.props.items.length > 0) {
        contentProps = {
          content: {
            tag: this.getDefault().childTagName,
            propsArray: this.props.items,
          },
        };
      } else if (this.props.children) {
        contentProps = { children: this.props.children };
      } else if (this.props.content) {
        contentProps = { content: this.props.content };
      }
      let menuClassName = this.getClassName("menu");
      if (this.state.block) {
        menuClassName += " " + this.getClassName("block");
      }

      return (
        <div className={menuClassName}>
          <ul className={this.getClassName("menuList")}>{this.buildChildren(contentProps)}</ul>
        </div>
      );
    }
  },

  _getButton() {
    const dropdown = this;
    let onClick = null;
    if (this.props.split) {
      if (typeof this.props.onClick === "function") {
        onClick = function (button, event) {
          dropdown.props.onClick(dropdown, event);
        };
      }
    } else {
      onClick = this._onClickHandler;
    }

    var buttonProps = {
      colorSchema: this.getColorSchema(),
      size: this.props.size,
      disabled: this.isDisabled(),
      onClick: onClick,
      borderRadius: this.props.borderRadius,
      bgStyle: this.props.bgStyle,
      elevation: this.props.elevation,
      elevationHover: this.props.elevationHover,
    };

    if (this.props.buttonProps) {
      buttonProps = UU5.Common.Tools.merge(buttonProps, this.props.buttonProps);
    }

    let icon = null;
    if (!this.props.split) {
      buttonProps.className = [buttonProps.className, this.getClassName().dropdownBtn].filter(v => !!v).join(" ");
      icon = this._getIcon();
    }

    let content;
    if (Array.isArray(this.props.label)) {
      content = this.props.label.concat([icon]);
    } else {
      content = [this.props.label, icon];
    }
    return <Button {...buttonProps} content={content} />;
  },

  _getIconButton() {
    let iconButton = null;

    if (this.props.split) {
      let splitButtonProps = this.props.splitButtonProps || {};
      iconButton = (
        <Button
          colorSchema={this.getColorSchema()}
          size={this.props.size}
          disabled={this.isDisabled()}
          className={this.getClassName().dropdownBtn}
          onClick={this._onClickHandler}
          bgStyle={this.props.bgStyle}
          {...splitButtonProps}
        >
          {this.props.iconHidden ? " " : this._getIcon()}
        </Button>
      );
    }

    return iconButton;
  },

  _onClickHandler() {
    this.toggle();
    return this;
  },

  _getMainAttrsClassName(isOpen) {
    let className = "";
    if (isOpen) {
      className += " " + this.getClassName().open;
    }
    if (this.props.baseline) {
      className += " uu5-bricks-button-baseline";
    }

    this.props.pullRight && (className += " " + this.getClassName().pullRight);

    if (this.props.split) {
      className += " " + this.getClassName().split;
    } else if (this.props.dropup) {
      className += " " + this.getClassName().dropup;
    } else {
      className += " " + this.getClassName().dropdown;
    }

    if (this.state.dropup) {
      className += " " + this.getClassName().autoDropup;
    } else {
      className += " " + this.getClassName().autoDropdown;
    }

    if (this.props.buttonProps?.displayBlock) {
      className += " " + this.getClassName("displayBlock");
    }

    return className.substr(1);
  },

  _getMainAttrs() {
    let mainAttrs = this.getMainAttrs();

    mainAttrs.id = this.getId();

    mainAttrs.className += " " + this._getMainAttrsClassName(this.isOpen());

    mainAttrs.onMouseLeave =
      this.props.closedOnLeave || this.props.openOnHover
        ? () => {
            this.close();
          }
        : null;

    mainAttrs.onMouseOver = this.props.openOnHover
      ? () => {
          this.open();
        }
      : null;

    return mainAttrs;
  },

  _getPosition() {
    let position;
    if (this.props.pullRight && this.props.dropup) {
      position = "top-right";
    } else if (this.props.pullRight) {
      position = "bottom-right";
    } else if (this.props.dropup) {
      position = "top-left";
    } else {
      position = "bottom-left";
    }

    return position;
  },

  _open(setStateCallback) {
    if (this._popover) {
      let className = this.getClassName("main");

      if (this.props.menuClassName) {
        className += " " + this.props.menuClassName;
      }

      if (this.props.elevation) {
        className += " " + ClassNames.elevation + this.props.elevation;
      }

      // if rendering into portal, we have to pass additional classes to the popover (drop-up, etc.) because
      // the content will be outside of Dropdown DOM and styles must work (backward compatible)
      if (this.props.popoverLocation === "portal") {
        className += " " + this._getMainAttrsClassName(true);
      }

      let bodyClassName = this.getClassName("menuWrapper");
      this._popover.open(
        {
          onClose: this.close,
          disabled: this.isDisabled(),
          disableBackdrop: this.props.disableBackdrop,
          aroundElement: this._button,
          position: this._getPosition(),
          offset: this.getDefault().offset,
          content: <UU5.Bricks.ScreenSize>{this._getChildren}</UU5.Bricks.ScreenSize>,
          className: className,
          bodyClassName: bodyClassName,
          fitHeightToViewport: this.props.fitMenuToViewport,
        },
        setStateCallback
      );
    } else if (typeof setStateCallback === "function") {
      setStateCallback();
    }
  },

  _ref(ref) {
    this._editRef = ref;
  },
  //@@viewOff:private

  //@@viewOn:render
  render() {
    return (
      <div {...this._getMainAttrs()}>
        {this.isInlineEdited() && (
          <UU5.Common.Suspense fallback={this.getEditingLoading()}>
            <DropdownEditable component={this} ref={this._ref} />
          </UU5.Common.Suspense>
        )}
        <div
          className={this.getClassName().buttonCover}
          id={this.getId() + "-cover"}
          ref={(button) => (this._button = button)}
        >
          {this._getButton()}
          {this.props.bgStyle === "link" ? (
            <span className={this.getClassName("linkSplit") + " " + this.getClassName("size") + this.props.size} />
          ) : null}
          {this._getIconButton()}
          {this.getDisabledCover()}
        </div>

        {this.isOpen() ? (
          <Popover
            controlled={false}
            location={this.props.popoverLocation}
            ref={(popover) => (this._popover = popover)}
          />
        ) : null}
      </div>
    );
  },
  //@@viewOff:render
});

Dropdown.Item = DropdownItem;
export default Dropdown;
