import { GenericItem } from '../services/items';

export interface FilesTypes extends GenericItem {
    storage: string,
    filename_disk: string,
    filename_download: string,
    title: string,
    type: string,
    folder: string | null,
    uploaded_by: string,
    uploaded_on: Date,
    modified_by: string | null,
    modified_on: Date,
    filesize: number,
    width: number,
    height: number,
    duration: number | null,
    description: string | null,
    location: string | null,
    tags: string[],
    metadata: object
}