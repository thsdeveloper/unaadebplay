import React, { createContext, useContext, useState, useCallback } from 'react';
import { View, StyleSheet } from 'react-native';
import { Toast, ToastTitle, ToastDescription } from './index';
import { AnimatePresence } from '@legendapp/motion';

export type ToastPosition = 'top' | 'top-right' | 'top-left' | 'bottom' | 'bottom-right' | 'bottom-left';
export type ToastAction = 'error' | 'warning' | 'success' | 'info' | 'muted';
export type ToastVariant = 'solid' | 'outline' | 'accent';

export interface ToastConfig {
  id?: string;
  title?: string;
  description?: string;
  action?: ToastAction;
  variant?: ToastVariant;
  duration?: number;
  placement?: ToastPosition;
  isClosable?: boolean;
}

interface ToastContextValue {
  show: (config: ToastConfig) => void;
  hide: (id: string) => void;
  hideAll: () => void;
}

interface ToastItem extends ToastConfig {
  id: string;
  timestamp: number;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

const TOAST_DURATION = 3000;
const MAX_TOASTS = 5;

const getPositionStyles = (placement: ToastPosition = 'top') => {
  const positions = {
    'top': { top: 50, alignItems: 'center' as const },
    'top-right': { top: 50, right: 20 },
    'top-left': { top: 50, left: 20 },
    'bottom': { bottom: 50, alignItems: 'center' as const },
    'bottom-right': { bottom: 50, right: 20 },
    'bottom-left': { bottom: 50, left: 20 },
  };
  return positions[placement];
};

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const show = useCallback((config: ToastConfig) => {
    const id = config.id || `toast-${Date.now()}-${Math.random()}`;
    const duration = config.duration !== undefined ? config.duration : TOAST_DURATION;

    const newToast: ToastItem = {
      ...config,
      id,
      timestamp: Date.now(),
      action: config.action || 'muted',
      variant: config.variant || 'solid',
      placement: config.placement || 'top',
      isClosable: config.isClosable !== false,
    };

    setToasts(prev => {
      // Limit to MAX_TOASTS
      const updated = [...prev, newToast];
      if (updated.length > MAX_TOASTS) {
        return updated.slice(updated.length - MAX_TOASTS);
      }
      return updated;
    });

    // Auto-hide toast after duration (0 = don't auto-hide)
    if (duration > 0) {
      setTimeout(() => {
        hide(id);
      }, duration);
    }
  }, []);

  const hide = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  const hideAll = useCallback(() => {
    setToasts([]);
  }, []);

  // Group toasts by placement
  const toastsByPlacement = toasts.reduce((acc, toast) => {
    const placement = toast.placement || 'top';
    if (!acc[placement]) {
      acc[placement] = [];
    }
    acc[placement].push(toast);
    return acc;
  }, {} as Record<ToastPosition, ToastItem[]>);

  return (
    <ToastContext.Provider value={{ show, hide, hideAll }}>
      {children}

      {/* Render toast containers for each placement */}
      {Object.entries(toastsByPlacement).map(([placement, placementToasts]) => (
        <View
          key={placement}
          style={[
            styles.container,
            getPositionStyles(placement as ToastPosition),
          ]}
          pointerEvents="box-none"
        >
          <AnimatePresence>
            {placementToasts.map(toast => (
              <Toast
                key={toast.id}
                action={toast.action}
                variant={toast.variant}
                className="mb-2 mx-4 min-w-[320px] max-w-[400px]"
              >
                <View className="flex-1">
                  {toast.title && (
                    <ToastTitle className="mb-1">
                      {toast.title}
                    </ToastTitle>
                  )}
                  {toast.description && (
                    <ToastDescription>
                      {toast.description}
                    </ToastDescription>
                  )}
                </View>
              </Toast>
            ))}
          </AnimatePresence>
        </View>
      ))}
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return context;
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    width: '100%',
    zIndex: 9999,
    display: 'flex',
    flexDirection: 'column',
  },
});
