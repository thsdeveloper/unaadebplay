import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Application from 'expo-application';
import * as Crypto from 'expo-crypto';

const DEVICE_ID_KEY = '@UNAADEB:DeviceId';

export async function getOrCreateDeviceId(): Promise<string> {
    let deviceId = await AsyncStorage.getItem(DEVICE_ID_KEY);

    if (!deviceId) {
        // Combine informações únicas do dispositivo
        const installationId = Application.androidId || Application.applicationId;
        const randomBytes = await Crypto.digestStringAsync(
            Crypto.CryptoDigestAlgorithm.SHA256,
            Date.now().toString() + Math.random().toString()
        );

        deviceId = `${installationId}-${randomBytes.substring(0, 8)}`;
        await AsyncStorage.setItem(DEVICE_ID_KEY, deviceId);
    }

    return deviceId;
}

export async function validateDeviceId(storedDeviceId: string): Promise<boolean> {
    const currentDeviceId = await getOrCreateDeviceId();
    return storedDeviceId === currentDeviceId;
}
