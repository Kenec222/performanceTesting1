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

import {
  useSession,
  createComponent,
  PropTypes,
  useState,
  usePreviousValue,
  useMemo,
  useLayoutEffect,
  Utils,
} from "uu5g05";

const SessionContext = useSession._context;
const sessionHolder = useSession._sessionHolder;

const registerSession = (session, setIdentity, setExpiring) => {
  let rollback;
  const isSession = !!Object.keys(session).length;

  const changeIdentity = () => {
    if (typeof session.getIdentity === "function") {
      let newIdentity = getIdentityFromSession(session);
      setIdentity((curIdentity) =>
        newIdentity !== curIdentity &&
        (!newIdentity || !curIdentity || !Utils.Object.shallowEqual(newIdentity, curIdentity))
          ? newIdentity
          : curIdentity
      );
    }
  };
  const expireSession = () => setExpiring(true);
  const extendSession = () => setExpiring(false);

  if (isSession) {
    if (session.initComplete) {
      session.addListener("identityChange", changeIdentity);
      session.addListener("sessionExpiring", expireSession);
      session.addListener("sessionExtended", extendSession);
    } else {
      session.initPromise.then(() => {
        if (rollback) return;
        changeIdentity();
        setExpiring(session.isExpiring());
        session.addListener("identityChange", changeIdentity);
        session.addListener("sessionExpiring", expireSession);
        session.addListener("sessionExtended", extendSession);
      });
    }
  }

  return () => {
    rollback = true;
    if (isSession) {
      session.removeListener("identityChange", changeIdentity);
      session.removeListener("sessionExpiring", expireSession);
      session.removeListener("sessionExtended", extendSession);
    }
  };
};

function getIdentityFromSession(currentSession) {
  if (!currentSession || !currentSession.isAuthenticated()) return null;
  let oidcIdentity = currentSession.getIdentity(); // contains also internal fields, methods, ... => we'll use only subset of fields
  let uu5Identity = {};
  uu5Identity.id = oidcIdentity.id;
  uu5Identity.name = oidcIdentity.name;
  uu5Identity.email = oidcIdentity.email;
  uu5Identity.uuIdentity = oidcIdentity.uuIdentity;
  uu5Identity.levelOfAssurance = oidcIdentity.levelOfAssurance;
  uu5Identity.loginLevelOfAssurance = oidcIdentity.loginLevelOfAssurance;
  return uu5Identity;
}

const SessionProvider = createComponent({
  uu5Tag: "UU5.Hooks.SessionProvider",

  propTypes: {
    session: PropTypes.shape({
      initComplete: PropTypes.bool,
      initPromise: PropTypes.object,
      addListener: PropTypes.func,
      removeListener: PropTypes.func,
      getIdentity: PropTypes.func,
      isAuthenticated: PropTypes.func,
      isExpiring: PropTypes.func,
      // TODO login, logout
    }).isRequired,
  },

  defaultProps: {
    session: undefined,
  },

  render({ session, children }) {
    let [identity, setIdentity] = useState(() =>
      session && !session.initComplete ? undefined : getIdentityFromSession(session)
    );
    let [isExpiring, setExpiring] = useState(() => (session && session.initComplete ? session.isExpiring() : false));

    const prevSession = usePreviousValue(session, session);
    if (session !== prevSession) {
      let newIdentity = session && !session.initComplete ? undefined : getIdentityFromSession(session);
      if (!Utils.Object.shallowEqual(newIdentity, identity)) setIdentity((identity = newIdentity));
      let newExpiring = session && session.initComplete ? session.isExpiring() : false;
      if (newExpiring !== isExpiring) setExpiring((isExpiring = newExpiring));
    }
    useLayoutEffect(() => {
      const unregister = registerSession(session, setIdentity, setExpiring);
      return () => unregister();
    }, [session]);

    const value = useMemo(() => {
      let sessionState = "pending";
      if (identity) {
        sessionState = "authenticated";
      } else if (identity === null) {
        sessionState = "notAuthenticated";
      }

      // NOTE Keep value in sync with uu5g05.
      return {
        state: sessionState,
        identity,
        isExpiring,
        session,
        login: (...args) => (typeof session.login === "function" && session.login(...args)) || Promise.resolve(),
        logout: (...args) =>
          (typeof session.logout === "function" &&
            session.logout(...args).catch((e) => {
              // TODO error
              console.error(`User ${identity.uuIdentity} is not logged out.`, e);
            })) ||
          Promise.resolve(),
      };
    }, [identity, isExpiring, session]);

    // remember session as "global"
    // NOTE This assumes that there's always rendered at most 1 SessionProvider.
    // NOTE This must be set sooner than in useEffect because it must be available within
    // 1st render (when uu5string parsing might be happenning).
    if (sessionHolder) sessionHolder.session = value;

    return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
  },
});

export { SessionContext, useSession, SessionProvider, getIdentityFromSession };
