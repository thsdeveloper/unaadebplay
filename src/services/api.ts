import AsyncStorage from "@react-native-async-storage/async-storage";
import {authentication, createDirectus, rest} from '@directus/sdk';
import {Sector} from "../types/Sector";

const url = 'https://back-unaadeb.onrender.com'

class LocalStorage {
    async get() {
        const item = await AsyncStorage.getItem("directus-data");
        return JSON.parse(<string>item);
    }
    async set(data) {
       await AsyncStorage.setItem("directus-data", JSON.stringify(data));
    }
}
const storage = new LocalStorage();

interface Schema {
    setores: Sector[];
}



const directusClient = createDirectus<Schema>(url).with(authentication('json', {storage})).with(rest());

export default directusClient;