

import React from 'react'
import Image from "next/image";
import CatCloudCluster from "../../../../public/Cat Cloud.png"
import CloudBack from "../../../../public/Violet Cloud Cluster Opaque 1.png"
import CloudMid from "../../../../public/Violet Cloud Cluster 2.png"
import CloudFront from "../../../../public/Purple Cloud Cluster 1.png"
import Moon from "../../../../public/Moon.png"
import { Sky } from '@/components/sky';

export const Homebg = () => {
    return (
        <div className='z-10'>
            <Sky></Sky>
            <Image className="top-0 md:top-12 2xl:top-10 right-0 md:right-8 2xl:right-20 absolute w-auto h-40 sm:h-44 md:h-50 2xl:h-56"  src={Moon} alt="Moon"></Image>
            <Image className="-right-[450px] md:-right-[600px] 2xl:-right-[750px] -bottom-36 md:-bottom-40 2xl:-bottom-56 absolute w-[1000px] md:w-[1500px] 2xl:w-[2000px] min-w-[1000px] md:min-w-[1500px] 2xl:min-w-[2000px] h-auto animate-swaying ease-linear" src={CatCloudCluster} alt="Cat Cloud Cluster"></Image>
            <div className="bottom-[45%] -left-60 md:-left-48 2xl:-left-32 absolute 2xl:[&>*]:min-w-[1100px]md:[&>*]:w-[800px] 2xl:[&>*]:w-[1100px] [&>*]:w-[500px] md:[&>*]:min-w-[800px] [&>*]:min-w-[500px] [&>*]:h-auto">
                <Image src={CloudBack} alt="Back CLoud"></Image>
                <Image className="-mt-[170px] md:-mt-[300px] 2xl:-mt-[400px] ml-[75px]" src={CloudMid} alt="Mid CLoud"></Image>
                <Image className="-mt-[170px] md:-mt-[300px] 2xl:-mt-[400px]" src={CloudFront} alt="Front CLoud"></Image>
            </div>
        </div>
    )
}
