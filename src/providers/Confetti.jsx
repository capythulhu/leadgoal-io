import { createContext, useState } from "react";
import ReactConfetti from "react-confetti";

export const ConfettiContext = createContext({
  isConfettiVisible: false,
  showConfetti: () => {},
});

export const ConfettiProvider = ({ children }) => {
  const [isConfettiVisible, setIsConfettiVisible] = useState(false);

  return (
    <ConfettiContext.Provider
      value={{
        isConfettiVisible,
        showConfetti: () => {
          setIsConfettiVisible(true);
          setTimeout(() => setIsConfettiVisible(false), 3000);
        },
      }}
    >
      <ReactConfetti
        numberOfPieces={isConfettiVisible ? 500 : 0}
        gravity={0.05}
        recycle={true}
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 1000,
        }}
      />
      {children}
    </ConfettiContext.Provider>
  );
};
