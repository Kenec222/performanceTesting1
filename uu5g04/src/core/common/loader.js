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

//@@viewOn:imports
import { PropTypes, Utils } from "uu5g05";
import Environment from "../environment/environment.js";
import BaseMixin from "./base-mixin.js";
import Tools from "./tools.js";
import Error from "./error.js";
import Request from "./request.js";
import Context from "./context.js";
import Component from "./component.js";
import Element from "./element.js";
//@@viewOff:imports

export const Loader = Component.create({
  displayName: "Loader", // for backward compatibility (test snapshots)
  //@@viewOn:mixins
  mixins: [BaseMixin],
  //@@viewOff:mixins

  //@@viewOn:statics
  statics: {
    tagName: "UU5.Common.Loader",
    defaults: {
      reloadInterval: 10 * 1000, // 10s
    },
    errors: {
      loaderError: "Loader error:",
      onLoadNoPromise: "No promise returns from onLoad.",
    },
  },
  //@@viewOff:statics

  //@@viewOn:propTypes
  propTypes: {
    uri: PropTypes.string,
    method: PropTypes.oneOf(["get", "post"]),
    data: PropTypes.object,
    headers: PropTypes.object,
    authenticate: PropTypes.bool,
    onLoad: PropTypes.func,
    loading: PropTypes.node,
    error: PropTypes.oneOfType([PropTypes.func, PropTypes.node]),
    reloadInterval: PropTypes.number,
  },
  //@@viewOn:propTypes

  //@@viewOn:getDefaultProps
  getDefaultProps() {
    return {
      uri: undefined,
      method: "get",
      data: undefined,
      headers: undefined,
      authenticate: false,
      onLoad: undefined,
      loading: undefined,
      error: (dtoOut) => (
        <Error
          errorData={dtoOut}
          moreInfo
          content={dtoOut.data && dtoOut.data.error ? dtoOut.data.error : dtoOut.error}
        />
      ),
      reloadInterval: undefined,
    };
  },
  //@@viewOff:getDefaultProps

  //@@viewOn:reactLifeCycle
  getInitialState() {
    return this._shouldLoad() ? { loaderState: "loading" } : { loaderState: "ready", data: this.props.data };
  },

  componentDidMount() {
    if (this._shouldLoad()) this._initLoading();
  },

  UNSAFE_componentWillReceiveProps(nextProps) {
    if (
      this._shouldLoad(nextProps) &&
      (this.props.onLoad !== nextProps.onLoad || this.props.uri !== nextProps.uri || this.props.data !== nextProps.data)
    ) {
      this.setState({ loaderState: "loading" });
      this._initLoading(nextProps);
    }
  },

  componentWillUnmount() {
    if (this._interval) {
      clearInterval(this._interval);
    }
  },
  //@@viewOff:reactLifeCycle

  //@@viewOn:interface
  //@@viewOff:interface

  //@@viewOn:overriding
  //@@viewOff:overriding

  //@@viewOn:private
  _shouldLoad(props = this.props) {
    return !(!props.onLoad && !props.uri && props.data);
  },

  _done(data) {
    this.isRendered() && this.setState({ loaderState: "ready", data });
  },

  _fail(data) {
    this.showError("loaderError", null, { context: { dtoOut: data } });
    this.isRendered() && this.setState({ loaderState: "error", data });
  },

  _load(props = this.props) {
    if (typeof props.onLoad === "function") {
      let processed = false;
      let done = (data) => {
        if (!processed) {
          processed = true;
          this._done(data);
        }
      };
      let fail = (e) => {
        if (!processed) {
          processed = true;
          this._fail(e);
        }
      };
      let promise = props.onLoad({
        data: props.data,
        // TODO: backward compatibility (remove in the next major version)
        done,
        fail,
      });
      // TODO if is for backward compatibility (uncomment to the next major version)
      if (promise && typeof promise.then === "function") {
        promise.then(done, fail);
      }
      // TODO: backward compatibility (uncomment to the next major version)
      // else {
      //   this.showError("onLoadNoPromise");
      // }
    } else if (props.uri) {
      this._doLoad(props).then(this._done, this._fail);
    }
  },

  async _doLoad(props) {
    let headers = props.headers;

    let session = Environment.getSession();
    if (props.authenticate && session && session.isAuthenticated() && Environment.isTrustedDomain(props.uri)) {
      headers = { ...headers, ...(await Tools.getAuthenticatedHeaders(props.uri, session)) };
    }

    return Request.call(props.method.toUpperCase(), props.uri, props.data, { headers });
  },

  _initLoading(props = this.props) {
    this._load(props);

    if (this._interval) {
      clearInterval(this._interval);
    }

    if (props.reloadInterval) {
      this._interval = setInterval(
        () => this._load(props),
        Math.max(props.reloadInterval, this.getDefault("reloadInterval"))
      );
    }
  },

  _getChildren(children) {
    let result;
    if (typeof children === "function") {
      result = children({ data: this.state.data });
    } else {
      result =
        Utils.Content.map(children, (child) => {
          if (Element.isValid(child)) {
            return Element.clone(child, { data: this.state.data });
          } else {
            return child;
          }
        }) || null;
    }
    return result;
  },
  //@@viewOff:private

  //@@viewOn:render
  render() {
    let result;
    let isLoading = this.state.loaderState === "loading";
    let isError = this.state.loaderState === "error";

    if (typeof this.props.children === "function") {
      result = this.props.children({ isLoading, isError, data: this.state.data });
    } else {
      if (isLoading) {
        result = this.props.loading !== undefined ? this.props.loading : Tools.findComponent("UU5.Bricks.Loading");
      } else if (isError) {
        result = this._getChildren(this.props.error);
      } else {
        result = this._getChildren(this.props.children);
      }
    }

    return result;
  },
  //@@viewOff:render
});

Loader.createContext = () => {
  const LoaderContext = Context.create();

  const createProvider = ({ children, ...props }, ref) => (
    <Loader {...props} ref_={ref}>
      {(values) => <LoaderContext.Provider value={values}>{children}</LoaderContext.Provider>}
    </Loader>
  );

  const Provider = Utils.Component.forwardRef(createProvider);

  return { Provider, Consumer: LoaderContext.Consumer, Context: LoaderContext };
};

export default Loader;
