import axios from "axios";
import {VerificationCheckType, VerificationTwilioType} from "@/types/VerifyTwilioType";

export async function sendVerificationSMS(to: string, channel: string = 'sms'): Promise<VerificationTwilioType> {
    try {
        const response = await axios.post('https://back-unaadeb.onrender.com/twilio/send-code-verification', {to: to, channel: channel});
        return response.data;
    } catch (error) {
        throw error;
    }
}

export async function verifyCode(to: string, code: string): Promise<VerificationCheckType> {
    try {
        const response = await axios.post('https://back-unaadeb.onrender.com/twilio/verify-code', {toPhoneNumber: to, code: code});
        return response.data;
    } catch (error) {
        throw error;
    }
}

// Exportar como objeto para facilitar o uso
export const twilioService = {
    sendVerificationSMS: async (phone: string): Promise<{ id: string }> => {
        try {
            const result = await sendVerificationSMS(phone, 'sms');
            return { id: result.sid || 'temp-id' };
        } catch (error) {
            console.error('Erro ao enviar SMS:', error);
            throw error;
        }
    },
    
    verifyCode: async (verificationId: string, code: string): Promise<boolean> => {
        try {
            // O verificationId aqui seria o telefone no nosso caso
            const result = await verifyCode(verificationId, code);
            return result.status === 'approved';
        } catch (error) {
            console.error('Erro ao verificar código:', error);
            return false;
        }
    }
};