declare module 'react-native-flash-message' {
    import { Component } from 'react';
    import { ViewStyle } from 'react-native';

    export interface MessageOptions {
        message: string;
        description?: string;
        type?: 'none' | 'default' | 'info' | 'success' | 'danger' | 'warning';
        backgroundColor?: string;
        color?: string;
        duration?: number;
        icon?: 'none' | 'auto' | 'success' | 'info' | 'warning' | 'danger' | any;
        position?: 'top' | 'center' | 'bottom';
        animated?: boolean;
        animationDuration?: number;
        hideOnPress?: boolean;
        onPress?: () => void;
        onLongPress?: () => void;
        floating?: boolean;
        autoHide?: boolean;
        style?: ViewStyle;
        textStyle?: ViewStyle;
        titleStyle?: ViewStyle;
        renderCustomContent?: () => JSX.Element;
        renderAfterContent?: () => JSX.Element;
        renderBeforeContent?: () => JSX.Element;
    }

    export function showMessage(options: MessageOptions): void;
    export function hideMessage(): void;

    export interface FlashMessageProps {
        position?: 'top' | 'center' | 'bottom';
        animated?: boolean;
        animationDuration?: number;
        hideOnPress?: boolean;
        style?: ViewStyle;
        textStyle?: ViewStyle;
        titleStyle?: ViewStyle;
        duration?: number;
        autoHide?: boolean;
        floating?: boolean;
    }

    export default class FlashMessage extends Component<FlashMessageProps> {}
}