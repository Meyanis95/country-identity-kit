import { useState, useEffect } from "react";

export const useLoadingSpinner = (run: boolean) => {
  const LOADING_SPINNER = ["🌎", "🌍", "🌏"];
  const [loadText, setloadText] = useState(LOADING_SPINNER[0]);
  const [loadCounter, setloadCounter] = useState(0);

  useEffect(() => {
    let spinner: NodeJS.Timeout;
    if (run) {
      spinner = setTimeout(() => {
        const spinnerIndex = loadCounter % LOADING_SPINNER.length;
        setloadText(LOADING_SPINNER[spinnerIndex]);
        setloadCounter(loadCounter + 1);
        if (loadCounter === LOADING_SPINNER.length) {
          setloadCounter(0);
        }
      }, 100);
    }
    return () => {
      if (run) {
        clearTimeout(spinner);
      }
    };
  });

  return loadText;
};
