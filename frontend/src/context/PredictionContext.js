import React, { createContext, useContext, useState } from "react";

const PredictionContext = createContext(undefined);

export const PredictionProvider = ({ children }) => {
  const [predictions, setPredictions] = useState([]);
  const [lastPrediction, setLastPrediction] = useState(null);

  const addPrediction = (input, result) => {
    const newPrediction = {
      id: Date.now(),
      timestamp: new Date().toISOString(),
      input,
      result,
    };
    setPredictions((prev) => [newPrediction, ...prev].slice(0, 50));
    setLastPrediction(newPrediction);
    return newPrediction;
  };

  const clearPredictions = () => {
    setPredictions([]);
    setLastPrediction(null);
  };

  return (
    <PredictionContext.Provider
      value={{
        predictions,
        lastPrediction,
        addPrediction,
        clearPredictions,
      }}
    >
      {children}
    </PredictionContext.Provider>
  );
};

export const usePrediction = () => {
  const context = useContext(PredictionContext);
  if (context === undefined) {
    throw new Error("usePrediction must be used within a PredictionProvider");
  }
  return context;
};
