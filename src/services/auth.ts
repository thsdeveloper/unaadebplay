import {UserTypes} from "../types/UserTypes";
import {passwordRequest, passwordReset, readMe} from "@directus/sdk";
import directusClient from "./api";

export async function signIn(email, password): Promise<UserTypes> {
    try {
        await directusClient.login(email, password)
        return await directusClient.request<UserTypes>(readMe())
    } catch (error) {
        throw error;
    }
}

export async function signOut(): Promise<void> {
    try {
        await directusClient.logout()
    } catch (error) {
        throw error;
    }
}

export async function requestPassword(email: string): Promise<void> {
    try {
        await directusClient.request(passwordRequest(email, 'https://unaadeb.app.br/reset-password'));
    } catch (error) {
        throw error;
    }
}

export async function requestResetPassword(token: string, newPassword: string): Promise<void> {
    try {
        await directusClient.request(passwordReset(token, newPassword));
    } catch (error) {
        throw error;
    }
}