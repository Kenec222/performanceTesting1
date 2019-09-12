/**
 * Copyright (C) 2019 Unicorn a.s.
 * 
 * This program is free software; you can use it under the terms of the UAF Open License v01 or
 * any later version. The text of the license is available in the file LICENSE or at www.unicorn.com.
 * 
 * This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even
 * the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See LICENSE for more details.
 * 
 * You may contact Unicorn a.s. at address: V Kapslovne 2767/2, Praha 3, Czech Republic or
 * at the email: info@unicorn.com.
 */

import React from 'react';
import PropTypes from "prop-types";
import createReactClass from 'create-react-class';
import * as UU5 from "uu5g04";
import { TAG, css } from "./config.js";

export const Tile = createReactClass({

  //@@viewOn:mixins
  mixins: [
    UU5.Common.BaseMixin,
    UU5.Common.ElementaryMixin,
    UU5.Common.NestingLevelMixin,
    UU5.Common.ColorSchemaMixin,
    UU5.Common.ContentMixin,
    UU5.Common.PureRenderMixin
  ],
  //@@viewOff:mixins

  //@@viewOn:statics
  statics: {
    tagName: TAG + "Tile",
    nestingLevelList: UU5.Environment.getNestingLevelList("boxCollection"),
    classNames: {
      main: () => css`
        padding: 8px 16px;
        max-width: 100%;

        &.uu5-common-bg-style-filled {
          background-color: #FAFAFA;
          border: 1px solid #E0E0E0;
        }
      `,
      bgStyle: "uu5-common-bg-style-",
      elevation: "uu5-common-elevation-"
    },
    opt: {
      pureRender: true
    }
  },
  //@@viewOff:statics

  //@@viewOn:propTypes
  propTypes: {
    bgStyle: PropTypes.oneOf(["filled", "outline", "transparent", "underline"]),
    elevation: PropTypes.oneOf(['-1', '0', '1', '2', '3', '4', '5', -1, 0, 1, 2, 3, 4, 5]),
    borderRadius: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    width: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    padding: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    margin: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  },
  //@@viewOff:propTypes

  //@@viewOn:getDefaultProps
  getDefaultProps() {
    return {
      bgStyle: "filled",
      elevation: undefined,
      borderRadius: undefined,
      width: undefined,
      padding: undefined,
      margin: undefined,
    };
  },
  //@@viewOff:getDefaultProps

  //@@viewOn:reactLifeCycle
  //@@viewOff:reactLifeCycle

  //@@viewOn:interface
  //@@viewOff:interface

  //@@viewOn:overriding
  //@@viewOff:overriding

  //@@viewOn:private
  _getMainAttrs() {
    let attrs = this.getMainAttrs();

    let classNames = [attrs.className];
    if (this.props.bgStyle) classNames.push(this.getClassName("bgStyle") + this.props.bgStyle);
    if (this.props.elevation) classNames.push(this.getClassName("elevation") + this.props.elevation);
    if (classNames.length) attrs.className = classNames.join(" ");

    let style = {};
    ["borderRadius", "width", "padding", "margin"].forEach(name => {
      if (this.props[name] != undefined) style[name] = this.props[name];
    });
    if (Object.keys.length) attrs.style = { ...style, ...attrs.style };

    return attrs;
  },
  //@@viewOff:private

  //@@viewOn:render
  render() {
    return (
      this.getNestingLevel()
        ? (
          <div {...this._getMainAttrs()}>
            {this.getChildren()}
            {this.getDisabledCover()}
          </div>
        ) : null
    );
  }
  //@@viewOff:render
});

export default Tile;