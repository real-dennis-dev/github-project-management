import { CommonActions } from "@react-navigation/native";

/**
 * Navigation utility functions
 */
const navigationUtils = {
  /**
   * Reset navigation stack and navigate to screen
   * @param {Object} navigation - Navigation object
   * @param {string} routeName - Route name to navigate to
   * @param {Object} params - Route parameters
   */
  resetAndNavigate: (navigation, routeName, params = {}) => {
    navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{ name: routeName, params }],
      })
    );
  },

  /**
   * Replace current screen with new screen
   * @param {Object} navigation - Navigation object
   * @param {string} routeName - Route name to replace with
   * @param {Object} params - Route parameters
   */
  replace: (navigation, routeName, params = {}) => {
    navigation.dispatch(CommonActions.replace(routeName, params));
  },

  /**
   * Push new screen to stack
   * @param {Object} navigation - Navigation object
   * @param {string} routeName - Route name to push
   * @param {Object} params - Route parameters
   */
  push: (navigation, routeName, params = {}) => {
    navigation.dispatch(CommonActions.push(routeName, params));
  },

  /**
   * Pop to specific screen in stack
   * @param {Object} navigation - Navigation object
   * @param {number} count - Number of screens to pop
   */
  pop: (navigation, count = 1) => {
    navigation.dispatch(CommonActions.pop(count));
  },

  /**
   * Pop to top of stack
   * @param {Object} navigation - Navigation object
   */
  popToTop: (navigation) => {
    navigation.dispatch(CommonActions.popToTop());
  },

  /**
   * Navigate to route with parameters
   * @param {Object} navigation - Navigation object
   * @param {string} routeName - Route name
   * @param {Object} params - Route parameters
   * @param {Object} options - Navigation options
   */
  navigate: (navigation, routeName, params = {}, options = {}) => {
    navigation.navigate(routeName, params, options);
  },

  /**
   * Get current route name
   * @param {Object} navigation - Navigation object
   * @returns {string} Current route name
   */
  getCurrentRoute: (navigation) => {
    const state = navigation.getState();
    if (state && state.index !== undefined) {
      const route = state.routes[state.index];
      return route.name;
    }
    return null;
  },

  /**
   * Get route parameters
   * @param {Object} route - Route object
   * @param {string} key - Parameter key
   * @param {any} defaultValue - Default value if key not found
   * @returns {any} Parameter value
   */
  getRouteParam: (route, key, defaultValue = null) => {
    if (route && route.params) {
      return route.params[key] || defaultValue;
    }
    return defaultValue;
  },

  /**
   * Set navigation options dynamically
   * @param {Object} navigation - Navigation object
   * @param {Object} options - Navigation options
   */
  setOptions: (navigation, options) => {
    navigation.setOptions(options);
  },

  /**
   * Navigate and merge parameters
   * @param {Object} navigation - Navigation object
   * @param {string} routeName - Route name
   * @param {Object} params - Parameters to merge
   */
  navigateWithMerge: (navigation, routeName, params = {}) => {
    navigation.dispatch(
      CommonActions.navigate({
        name: routeName,
        params,
        merge: true,
      })
    );
  },

  /**
   * Check if screen is focused
   * @param {Object} navigation - Navigation object
   * @param {string} routeName - Route name
   * @returns {boolean} Is screen focused
   */
  isFocused: (navigation, routeName) => {
    const state = navigation.getState();
    if (state && state.index !== undefined) {
      const currentRoute = state.routes[state.index];
      return currentRoute.name === routeName;
    }
    return false;
  },
};

export default navigationUtils;
