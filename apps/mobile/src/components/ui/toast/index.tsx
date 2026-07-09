'use client';
import React from 'react';
import { createToast } from '@gluestack-ui/toast';
import { View, Pressable, Text } from 'react-native';
import {
  Motion,
  AnimatePresence,
  createMotionAnimatedComponent,
} from '@legendapp/motion';
import { tva } from '@gluestack-ui/nativewind-utils/tva';
import {
  withStyleContext,
  useStyleContext,
} from '@gluestack-ui/nativewind-utils/withStyleContext';
import { cssInterop } from 'nativewind';
import type { VariantProps } from '@gluestack-ui/nativewind-utils';
import { PrimitiveIcon, UIIcon } from '@gluestack-ui/icon';

const SCOPE = 'TOAST';

const MotionView = createMotionAnimatedComponent(View);

const UIToast = createToast({
  Root: withStyleContext(MotionView, SCOPE),
  Title: Text,
  Description: Text,
  Icon: UIIcon,
  CloseButton: Pressable,
  AnimatePresence: AnimatePresence,
});

cssInterop(PrimitiveIcon, {
  className: {
    target: 'style',
    nativeStyleToProp: {
      height: true,
      width: true,
      fill: true,
      color: 'classNameColor',
      stroke: true,
    },
  },
});

const toastStyle = tva({
  base: 'p-4 m-1 rounded-lg gap-3 border web:pointer-events-auto shadow-hard-2',
  variants: {
    action: {
      error: 'bg-error-50 border-error-300',
      warning: 'bg-warning-50 border-warning-300',
      success: 'bg-success-50 border-success-300',
      info: 'bg-info-50 border-info-300',
      muted: 'bg-background-50 border-background-300',
    },
    variant: {
      solid: '',
      outline: 'border bg-transparent',
      accent: 'border-l-4',
    },
  },
  compoundVariants: [
    {
      action: 'error',
      variant: 'solid',
      class: 'bg-error-500 border-error-500',
    },
    {
      action: 'warning',
      variant: 'solid',
      class: 'bg-warning-500 border-warning-500',
    },
    {
      action: 'success',
      variant: 'solid',
      class: 'bg-success-500 border-success-500',
    },
    {
      action: 'info',
      variant: 'solid',
      class: 'bg-info-500 border-info-500',
    },
    {
      action: 'muted',
      variant: 'solid',
      class: 'bg-background-500 border-background-500',
    },
    {
      action: 'error',
      variant: 'outline',
      class: 'bg-background-0 border-error-300',
    },
    {
      action: 'warning',
      variant: 'outline',
      class: 'bg-background-0 border-warning-300',
    },
    {
      action: 'success',
      variant: 'outline',
      class: 'bg-background-0 border-success-300',
    },
    {
      action: 'info',
      variant: 'outline',
      class: 'bg-background-0 border-info-300',
    },
    {
      action: 'muted',
      variant: 'outline',
      class: 'bg-background-0 border-background-300',
    },
    {
      action: 'error',
      variant: 'accent',
      class: 'bg-background-0 border-l-error-500',
    },
    {
      action: 'warning',
      variant: 'accent',
      class: 'bg-background-0 border-l-warning-500',
    },
    {
      action: 'success',
      variant: 'accent',
      class: 'bg-background-0 border-l-success-500',
    },
    {
      action: 'info',
      variant: 'accent',
      class: 'bg-background-0 border-l-info-500',
    },
    {
      action: 'muted',
      variant: 'accent',
      class: 'bg-background-0 border-l-background-500',
    },
  ],
});

const toastTitleStyle = tva({
  base: 'font-semibold text-base web:select-none',
  parentVariants: {
    action: {
      error: 'text-error-900',
      warning: 'text-warning-900',
      success: 'text-success-900',
      info: 'text-info-900',
      muted: 'text-typography-900',
    },
    variant: {
      solid: 'text-typography-0',
      outline: '',
      accent: '',
    },
  },
  parentCompoundVariants: [
    {
      variant: 'solid',
      action: 'error',
      class: 'text-error-50',
    },
    {
      variant: 'solid',
      action: 'warning',
      class: 'text-warning-50',
    },
    {
      variant: 'solid',
      action: 'success',
      class: 'text-success-50',
    },
    {
      variant: 'solid',
      action: 'info',
      class: 'text-info-50',
    },
    {
      variant: 'solid',
      action: 'muted',
      class: 'text-typography-50',
    },
  ],
});

const toastDescriptionStyle = tva({
  base: 'text-sm web:select-none',
  parentVariants: {
    action: {
      error: 'text-error-700',
      warning: 'text-warning-700',
      success: 'text-success-700',
      info: 'text-info-700',
      muted: 'text-typography-700',
    },
    variant: {
      solid: 'text-typography-50',
      outline: '',
      accent: '',
    },
  },
  parentCompoundVariants: [
    {
      variant: 'solid',
      action: 'error',
      class: 'text-error-50',
    },
    {
      variant: 'solid',
      action: 'warning',
      class: 'text-warning-50',
    },
    {
      variant: 'solid',
      action: 'success',
      class: 'text-success-50',
    },
    {
      variant: 'solid',
      action: 'info',
      class: 'text-info-50',
    },
    {
      variant: 'solid',
      action: 'muted',
      class: 'text-typography-50',
    },
  ],
});

const toastIconStyle = tva({
  base: 'fill-none',
  parentVariants: {
    action: {
      error: 'text-error-600',
      warning: 'text-warning-600',
      success: 'text-success-600',
      info: 'text-info-600',
      muted: 'text-typography-600',
    },
    variant: {
      solid: 'text-typography-0',
      outline: '',
      accent: '',
    },
  },
  parentCompoundVariants: [
    {
      variant: 'solid',
      action: 'error',
      class: 'text-error-50',
    },
    {
      variant: 'solid',
      action: 'warning',
      class: 'text-warning-50',
    },
    {
      variant: 'solid',
      action: 'success',
      class: 'text-success-50',
    },
    {
      variant: 'solid',
      action: 'info',
      class: 'text-info-50',
    },
    {
      variant: 'solid',
      action: 'muted',
      class: 'text-typography-50',
    },
  ],
});

const toastCloseButtonStyle = tva({
  base: 'group/toast-close-button rounded p-1.5 data-[focus-visible=true]:web:bg-background-0 web:outline-0 cursor-pointer',
});

type IToastProps = React.ComponentProps<typeof UIToast> &
  VariantProps<typeof toastStyle> & { className?: string };

type IToastTitleProps = React.ComponentProps<typeof UIToast.Title> &
  VariantProps<typeof toastTitleStyle> & { className?: string };

type IToastDescriptionProps = React.ComponentProps<typeof UIToast.Description> &
  VariantProps<typeof toastDescriptionStyle> & { className?: string };

type IToastIconProps = React.ComponentProps<typeof UIToast.Icon> &
  VariantProps<typeof toastIconStyle> & {
    className?: string;
    as?: React.ElementType;
    height?: number;
    width?: number;
  };

type IToastCloseButtonProps = React.ComponentProps<
  typeof UIToast.CloseButton
> &
  VariantProps<typeof toastCloseButtonStyle> & { className?: string };

const Toast = React.forwardRef<React.ComponentRef<typeof UIToast>, IToastProps>(
  function Toast(
    { className, variant = 'solid', action = 'muted', ...props },
    ref
  ) {
    return (
      <UIToast
        ref={ref}
        {...props}
        className={toastStyle({ variant, action, class: className })}
        context={{ variant, action }}
      />
    );
  }
);

const ToastTitle = React.forwardRef<
  React.ComponentRef<typeof UIToast.Title>,
  IToastTitleProps
>(function ToastTitle({ className, variant, action, ...props }, ref) {
  const {
    variant: parentVariant,
    action: parentAction,
  } = useStyleContext(SCOPE);

  return (
    <UIToast.Title
      ref={ref}
      {...props}
      className={toastTitleStyle({
        parentVariants: {
          variant: parentVariant,
          action: parentAction,
        },
        variant,
        action,
        class: className,
      })}
    />
  );
});

const ToastDescription = React.forwardRef<
  React.ComponentRef<typeof UIToast.Description>,
  IToastDescriptionProps
>(function ToastDescription({ className, variant, action, ...props }, ref) {
  const {
    variant: parentVariant,
    action: parentAction,
  } = useStyleContext(SCOPE);

  return (
    <UIToast.Description
      ref={ref}
      {...props}
      className={toastDescriptionStyle({
        parentVariants: {
          variant: parentVariant,
          action: parentAction,
        },
        variant,
        action,
        class: className,
      })}
    />
  );
});

const ToastIcon = React.forwardRef<
  React.ComponentRef<typeof UIToast.Icon>,
  IToastIconProps
>(function ToastIcon({ className, size, ...props }, ref) {
  const {
    variant: parentVariant,
    action: parentAction,
  } = useStyleContext(SCOPE);

  if (typeof size === 'number') {
    return (
      <UIToast.Icon
        ref={ref}
        {...props}
        className={toastIconStyle({ class: className })}
        size={size}
      />
    );
  } else if (
    (props.height !== undefined || props.width !== undefined) &&
    size === undefined
  ) {
    return (
      <UIToast.Icon
        ref={ref}
        {...props}
        className={toastIconStyle({ class: className })}
      />
    );
  }

  return (
    <UIToast.Icon
      ref={ref}
      {...props}
      className={toastIconStyle({
        parentVariants: {
          variant: parentVariant,
          action: parentAction,
        },
        class: className,
      })}
    />
  );
});

const ToastCloseButton = React.forwardRef<
  React.ComponentRef<typeof UIToast.CloseButton>,
  IToastCloseButtonProps
>(function ToastCloseButton({ className, ...props }, ref) {
  return (
    <UIToast.CloseButton
      ref={ref}
      {...props}
      className={toastCloseButtonStyle({
        class: className,
      })}
    />
  );
});

Toast.displayName = 'Toast';
ToastTitle.displayName = 'ToastTitle';
ToastDescription.displayName = 'ToastDescription';
ToastIcon.displayName = 'ToastIcon';
ToastCloseButton.displayName = 'ToastCloseButton';

export { Toast, ToastTitle, ToastDescription, ToastIcon, ToastCloseButton };
export { ToastProvider, useToast } from './toast-provider';
export type { ToastConfig, ToastPosition, ToastAction, ToastVariant } from './toast-provider';
