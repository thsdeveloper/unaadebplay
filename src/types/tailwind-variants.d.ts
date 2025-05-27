declare module 'tailwind-variants/dist/config' {
    export interface TVConfig {
        slots?: Record<string, any>;
        variants?: Record<string, any>;
        compoundVariants?: Array<any>;
        defaultVariants?: Record<string, any>;
    }
    
    export type TV = (config: TVConfig) => any;
}