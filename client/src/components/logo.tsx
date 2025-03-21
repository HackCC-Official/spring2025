import { cn } from "@/lib/utils"
import Image from "next/image"
import LogoImg from '../../public/Logo.svg'

export function Logo({ className } : { className?: string }) {
  return (
    <Image className={cn([
      "z-10 ml-[5%] w-auto h-40 sm:h-48 md:h-48 lg:h-48 2xl:h-56",
      className
    ])} src={LogoImg} alt="HackCC Logo"></Image>
  )
}