"use client";

import React, { createContext, useContext } from "react";

interface Session {
    session: {
        id: string;
        email: string;
        firstName: string;
        lastName: string;
        avatar: string;
        phoneNumber?: string;
        role: string;
    } | null;
}

interface SessionProviderProps {
    session: Session;
    children: React.ReactNode;
}

// Create the UserContext
export const SessionContext = createContext<Session>({session: null});

// Export a custom hook for easy usage of the context
export const useSession = () => {
    const context = useContext(SessionContext);

    if (!context) {
        throw new Error("useSession must be used within a UserContext.Provider");
    }

    return context;
};

export default function SessionProvider({ session, children }: SessionProviderProps) {
    return (
        <SessionContext.Provider value={session}>
            {children}
        </SessionContext.Provider>
    );
  }