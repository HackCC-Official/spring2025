//import Image from "next/image";
//import QRScanner from "../components/qrscan"


import FrontPage from "../features/home-page/home"
import AttendeeContainer from "@/features/attendee/AttendeeContainer";
import Venue from "../features/venue/map";
import Footer from "@/features/footer/apply-page/Footer";
import VolunteerJudgeContainer from "../features/volunteer-judge/VolunteerJudgeContainer";
import { Navbar } from "@/components/navbar";
import About from "@/features/about/about";
import Collage from "@/features/collage/Collage";
import Slider from "@/features/organizers/Slider";
import Carousel from "@/features/events/carosoul";

export default function HomePage() {
  return (
    <div className="flex flex-wrap w-screen h-screen">
      <Navbar></Navbar>
      {<FrontPage></FrontPage>}
      <About></About>
      <Collage></Collage>
      {/*<Carousel></Carousel>*/}
      <AttendeeContainer/>
      <Slider></Slider>
      <VolunteerJudgeContainer></VolunteerJudgeContainer>
      <Footer></Footer>

    </div>
  )
}