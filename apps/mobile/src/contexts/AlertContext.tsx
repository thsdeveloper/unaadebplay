import React, { useState } from 'react'
import { MessageType, showMessage} from "react-native-flash-message"
import { lightColors as palette } from "@/constants/colors"

// Mantemos o react-native-flash-message; só trocamos as cores de fundo padrão da lib
// pelas cores acentuadas do nosso Design System (src/constants/colors.ts), para que o
// banner combine com a paleta do app. Texto branco garante contraste sobre o acento.
const ALERT_BG: Record<'success' | 'danger' | 'warning', string> = {
    success: palette.success, // #10B981
    danger: palette.error,    // #EF4444 (vermelho de erro da paleta)
    warning: palette.warning, // #F59E0B
}
const ALERT_TEXT = '#FFFFFF'

interface AlertContextData {
    type: MessageType
    message: string
    duration?: number
    success: (text: string, time?: number) => void
    error: (text: string, time?: number) => void
    warning: (text: string, time?: number) => void
    clear: () => void
}

const AlertContext = React.createContext<AlertContextData>({} as AlertContextData)

interface AlertProviderProps {
    children: React.ReactNode;
    // other props here
}

const AlertProvider: React.FC<AlertProviderProps> = ({ children }: AlertProviderProps) => {
    const [alertType, setAlertType] = useState<MessageType>('default')
    const [message, setMessage] = useState<string>('')
    const [duration, setDuration] = useState<number>(5000)

    return (
        <AlertContext.Provider
            value={{
                type: alertType,
                message: message,
                duration: duration,
                success: (text: string, time?: number) => {
                    setMessage(text)
                    setAlertType('success')
                    time && setDuration(time)
                    showMessage({
                        message: text,
                        type: 'success',
                        backgroundColor: ALERT_BG.success,
                        color: ALERT_TEXT,
                        duration: time || duration,
                    });
                },
                error: (text: string, time?: number) => {
                    setMessage(text)
                    setAlertType('danger')
                    time && setDuration(time)
                    showMessage({
                        message: text,
                        type: 'danger',
                        backgroundColor: ALERT_BG.danger,
                        color: ALERT_TEXT,
                        duration: time || duration,
                    });
                },
                warning: (text: string, time?: number) => {
                    setMessage(text)
                    setAlertType('warning')
                    time && setDuration(time)
                    showMessage({
                        message: text,
                        type: 'warning',
                        backgroundColor: ALERT_BG.warning,
                        color: ALERT_TEXT,
                        duration: time || duration,
                    });
                },
                clear: () => {
                    setMessage('')
                    setAlertType('default')
                }
            }}
        >
            {children}
        </AlertContext.Provider>
    )
}

export { AlertProvider }
export default AlertContext