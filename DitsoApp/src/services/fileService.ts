import apiClient from './apiClient';

export interface UploadedFile {
    id: number;
    fileName: string;
    mimeType: string;
    fileSize: number;
    uploadedAt: string;
}

export const fileService = {
    /**
     * Sube una imagen como comprobante.
     * @param uri URI local del archivo (resultado de expo-image-picker)
     * @param mimeType Tipo MIME, ej: "image/jpeg"
     * @param fileName Nombre del archivo
     */
    async upload(uri: string, mimeType: string = 'image/jpeg', fileName: string = 'comprobante.jpg'): Promise<UploadedFile> {
        const formData = new FormData();
        formData.append('file', {
            uri,
            type: mimeType,
            name: fileName,
        } as any);

        const response = await apiClient.post<UploadedFile>('/files/upload', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        return response.data;
    },

    /**
     * Devuelve la URL de descarga de un comprobante (para mostrar en Image).
     */
    getDownloadUrl(fileId: number): string {
        // apiClient.defaults.baseURL es algo como http://192.168.x.x:5000/api
        const base = (apiClient.defaults.baseURL ?? '').replace(/\/api$/, '');
        return `${base}/api/files/${fileId}`;
    },

    async deleteFile(fileId: number): Promise<void> {
        await apiClient.delete(`/files/${fileId}`);
    },
};
