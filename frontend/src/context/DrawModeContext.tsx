import React, { createContext, useContext, ReactNode, useState } from "react";

interface DrawModeContextType {
  drawModeOn: boolean;
  setDrawModeOn: React.Dispatch<React.SetStateAction<boolean>>;
}

const DrawModeContext = createContext<DrawModeContextType | undefined>(
  undefined,
);

export const DrawModeProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [drawModeOn, setDrawModeOn] = useState<boolean>(false);

  return (
    <DrawModeContext.Provider value={{ drawModeOn, setDrawModeOn }}>
      {children}
    </DrawModeContext.Provider>
  );
};

export const useDrawMode = () => {
  const context = useContext(DrawModeContext);
  if (!context) {
    throw new Error("useDrawMode must be used within a DrawModeProvider");
  }
  return context;
};
