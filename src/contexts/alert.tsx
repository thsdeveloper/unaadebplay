import React, { useState } from 'react'
import { MessageType} from "react-native-flash-message"

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
                },
                error: (text: string, time?: number) => {
                    setMessage(text)
                    setAlertType('danger')
                    time && setDuration(time)
                },
                warning: (text: string, time?: number) => {
                    setMessage(text)
                    setAlertType('warning')
                    time && setDuration(time)
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