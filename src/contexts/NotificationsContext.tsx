
import React, { createContext, useContext, useState, useEffect } from "react";

type NotificationsContextType = {
  notificationsEnabled: boolean;
  toggleNotifications: () => void;
};

const NotificationsContext = createContext<NotificationsContextType | undefined>(undefined);

export const NotificationsProvider = ({ children }: { children: React.ReactNode }) => {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  useEffect(() => {
    // Check if user has notifications preference stored
    const storedPreference = localStorage.getItem("notifications");
    if (storedPreference === "disabled") {
      setNotificationsEnabled(false);
    }
  }, []);

  const toggleNotifications = () => {
    setNotificationsEnabled((prev) => {
      const newValue = !prev;
      localStorage.setItem("notifications", newValue ? "enabled" : "disabled");
      return newValue;
    });
  };

  return (
    <NotificationsContext.Provider value={{ notificationsEnabled, toggleNotifications }}>
      {children}
    </NotificationsContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationsContext);
  if (context === undefined) {
    throw new Error("useNotifications must be used within a NotificationsProvider");
  }
  return context;
};
