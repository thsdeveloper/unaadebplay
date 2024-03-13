import axios from "axios";
import {VerificationCheckType, VerificationTwilioType} from "@/types/VerifyTwilioType";

export async function sendVerificationSMS(to: string, channel: string): Promise<VerificationTwilioType> {
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