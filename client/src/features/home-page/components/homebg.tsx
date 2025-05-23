

import React from 'react'
import Image from "next/image";

import CloudBack from "../../../../public/Violet Cloud Cluster Opaque 1.webp"
import CloudMid from "../../../../public/Violet Cloud Cluster 2.webp"
import CloudFront from "../../../../public/Purple Cloud Cluster 1.webp"
import Moon from "../../../../public/Moon.webp"
import CatCloud from '../../../../public/Cat Cloud.webp'
import { Sky } from '@/components/sky';

export const Homebg = () => {
    return (
        <div className='z-10'>
            
            <Sky></Sky>
            <Image priority loading='eager'src={CatCloud} className="-right-[300px] md:-right-[800px] 2xl:-right-[600px] -bottom-8 md:-bottom-32 absolute w-[700px] md:w-[1500px] min-w-[700px] md:min-w-[1500px] h-auto animate-swaying ease-linear" alt="Cat Cloud Cluster" sizes="(min-width: 1540px) 2000px, (min-width: 780px) 1500px, 700px" ></Image>
            <Image className="top-0 md:top-12 2xl:top-10 right-0 md:right-8 2xl:right-20 absolute w-auto h-40 sm:h-44 md:h-50 2xl:h-56"  src={Moon} alt="Moon" sizes="(min-width: 1540px) 274px, (min-width: 640px) 215px, 196px" ></Image>
            <div className="bottom-[45%] -left-60 md:-left-48 2xl:-left-32 absolute 2xl:[&>*]:min-w-[1100px]md:[&>*]:w-[800px] 2xl:[&>*]:w-[1100px] [&>*]:w-[500px] md:[&>*]:min-w-[800px] [&>*]:min-w-[500px] [&>*]:h-auto">
                <Image src={CloudBack} alt="Back CLoud" sizes="(min-width: 1540px) 1100px, (min-width: 780px) 800px, 500px" ></Image>
                <Image className="-mt-[170px] md:-mt-[300px] 2xl:-mt-[400px] ml-[75px]"  src={CloudMid} alt="Mid CLoud"  sizes="(min-width: 1540px) 1100px, (min-width: 780px) 800px, 500px"></Image>
                <Image className="-mt-[170px] md:-mt-[300px] 2xl:-mt-[400px]" src={CloudFront}  alt="Front CLoud"  sizes="(min-width: 1540px) 1100px, (min-width: 780px) 800px, 500px"></Image>
            </div>
        </div>
    )
}
