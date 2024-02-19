import AsyncStorage from "@react-native-async-storage/async-storage";

export class LocalStorage {
    async get() {
        const item = await AsyncStorage.getItem("directus-data");
        return JSON.parse(<string>item);
    }
    async set(data) {
        await AsyncStorage.setItem("directus-data", JSON.stringify(data));
    }
}