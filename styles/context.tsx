import * as React from "react";

export const AuthContext = React.createContext< {signIn: (foundUser: string) => Promise<void>, signOut: () => Promise<void>, signUp: () => void} | null>(null);
