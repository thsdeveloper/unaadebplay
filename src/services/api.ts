import AsyncStorage from "@react-native-async-storage/async-storage";
import {authentication, createDirectus, rest, readExtensions} from '@directus/sdk';
import {Sector} from "../types/Sector";
import {LocalStorage} from "../utils/storageUtils";

const url = 'https://back-unaadeb.onrender.com'

const storage = new LocalStorage();

interface Schema {
    setores: Sector[];
}


const directusClient = createDirectus<Schema>(url).with(authentication('json', {storage})).with(rest());


export default directusClient;