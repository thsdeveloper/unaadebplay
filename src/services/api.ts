import AsyncStorage from "@react-native-async-storage/async-storage";
import {authentication, createDirectus, rest} from '@directus/sdk';

const url = 'https://back-unaadeb.onrender.com'

class LocalStorage {
    async get() {
        const item = await AsyncStorage.getItem("directus-data");
        return JSON.parse(<string>item);
    }
    async set(data: any) {
       await AsyncStorage.setItem("directus-data", JSON.stringify(data));
    }
}
const storage = new LocalStorage();

const directusClient = createDirectus(url).with(authentication('json', {storage})).with(rest());


export default directusClient;