import * as React from "react";
class StacksManager {
    private static _instance: StacksManager;

    public isLoggedIn():boolean
    {
        return false;
    }

    public static getInstance(): StacksManager
    {
        if (StacksManager._instance == null)
        {
            StacksManager._instance = new StacksManager();
        }
        return this._instance;
    }
    constructor()
    {
        if(StacksManager._instance)
        {
            throw new Error("Error: Instantiation failed: Use StacksManager.getInstance() instead of new.");
        }
    }
}

export const stacks = StacksManager.getInstance()
