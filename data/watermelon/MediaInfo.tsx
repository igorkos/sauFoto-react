
export interface GpsCoordinates {
    /**
     * Latitude of the GPS coordinates.
     */
    latitude: number | undefined;
    /**
     * Longitude of the GPS coordinates.
     */
    longitude: number | undefined;
}

export interface MediaInfo {
    width: number,
    height: number,
    creationTime: string,
    location?: GpsCoordinates,
    exif?:string
}
