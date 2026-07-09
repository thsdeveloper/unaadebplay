declare global {
    var ErrorUtils: {
        setGlobalHandler: (handler: (error: Error, isFatal?: boolean) => void) => void;
        getGlobalHandler: () => (error: Error, isFatal?: boolean) => void;
    };
}

export {};