import { registerRootComponent } from "expo";
import App from "./App";

// Register the main component
registerRootComponent(App);

// Log app initialization
console.log("App initialized at:", new Date().toISOString());
console.log("Platform:", Platform.OS);
console.log("App Version:", "1.0.0");

// Handle any uncaught errors
if (__DEV__) {
  const originalError = console.error;
  console.error = (...args) => {
    originalError(...args);
    // You can add custom error reporting here
  };
}
