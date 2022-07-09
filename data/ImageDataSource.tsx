import * as React from "react";


export const ImageDataSource =
    function ImageDataSource(){
        return Array.apply(null, Array(120)).map((v, i) => {
            return {
                id: i,
                image: 'https://unsplash.it/400/800?image=' + (i + 1)
            };
        })
    }
