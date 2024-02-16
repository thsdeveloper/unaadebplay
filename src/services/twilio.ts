import axios from "axios";
import {VerificationCheckType, VerificationTwilioType} from "../types/VerifyTwilioType";

export async function sendVerificationSMS(to: string, channel: string): Promise<VerificationTwilioType> {
    try {
        const response = await axios.post('https://back-unaadeb.onrender.com/stripe/twilio-verification', {to: to, channel: channel});
        return response.data;
    } catch (error) {
        throw error;
    }
}

export async function verifyCode(to: string, code: string): Promise<VerificationCheckType> {
    try {
        const response = await axios.post('https://back-unaadeb.onrender.com/stripe/twilio-verify-code', {toPhoneNumber: to, code: code});
        return response.data;
    } catch (error) {
        throw error;
    }
}