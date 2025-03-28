

import { Title } from "@/components/title";
import Card from "./ui/Card"
import Plane from "./ui/plane"


export default function carousel() {
    return (
        <div className="w-full h-auto text-center">
        <Title text="Event Schedule"></Title>
`        <div className="md:relative w-full h-auto md:h-[300px] lg:h-[400px] overflow-hidden">
            <div className="-right-[1190px] md:absolute">
                <div className="flex md:flex-row flex-col items-center gap-[20px] w-full h-auto md:animate-marqueeEffect md:hover:pause">
                    <Plane></Plane>
                    <Card day="Day 1" text="Day one of HackCC is an action packed day, kicking off with a welcome keynote and lorem ipsum dolor sit amet, consectetur adipiscing elit."></Card>
                    <Card day="Day 2" text="Day two continues with lorem ipsum dolor sit amet, consectetur adipiscing elit. Quisque eu nunc nec mauris accumsan sollicitudin."></Card>           
                </div>  
            </div>
        </div>`
        </div>
    )
}
//-right-[1190px]
//md:animate-marqueeEffect md:hover:pause





//md:animate-marqueeEffect
//animate-moveSpriteSheet
//-right-[1068px]
/*
        <div className="bg-blue-500 w-full h-full">
            <div className="relative w-[250px] h-[250px] overflow-clip">
                <Image className="left-0 absolute w-[1250px] h-[250px] object-cover object-left overflow-visible animate-moveSpriteSheet" src={spritesheet} alt="plane" ></Image>
            </div>
        </div>
*/