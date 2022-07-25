import ImageResizer from "react-native-image-resizer";

export async function cacheImageData(blob: Blob, width: number, height: number): Promise<string> {
    return new Promise((resolve, reject) => {
        const fileReaderInstance = new FileReader();
        fileReaderInstance.onload = async () => {
            const data = fileReaderInstance.result as string
            const blobUri = data.replace('application/octet-stream', 'image/jpeg')
            const result = await ImageResizer.createResizedImage(blobUri, width, height, 'JPEG', 100, 0)
            resolve(result.uri)
        }
        fileReaderInstance.readAsDataURL(blob)
    })
}

export async function cacheImage(uri: string, width: number, height: number): Promise<string> {
    const result = await ImageResizer.createResizedImage(uri, width, height, 'JPEG', 100, 0)
    return result.uri
}
