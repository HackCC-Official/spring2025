"use client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getBrowserClient } from "@/features/auth/lib/supabase-client";
import { Logo } from "@/components/logo";
import { SkyFixed } from "@/components/sky";
import { FileUploader } from "@/components/ui/file-uploader";
import { ApplicationInput, ApplicationCalendar, ApplicationTextarea } from "@/features/application/components/application-input";
import { ApplicationLabel } from "@/features/application/components/application-label";
import { ApplicationMultipleGroup, ApplicationMultipleItem } from "@/features/application/components/application-multiple";
import { ApplicationSelect } from "@/features/application/components/application-select";
import { FormCard } from "@/features/application/components/form-card";
import { Button } from "@/components/ui/button";
import schools from '@/features/application/data/schools.json'
import residences from '@/features/application/data/residences.json'


export default function ApplyPage() {
    const router = useRouter()
    const [authCheck, setAuthChecked] = useState(false)

    useEffect(() => {
    // Function to check if user is logged in
    const checkAuth = async () => {
        const supabase = getBrowserClient()
        const { data: { session } } = await supabase.auth.getSession();

        if (!session) {
            // User is logged in, redirect to a protected route
            router.push('/register'); // Replace with your desired route
        } else {
            setAuthChecked(true)
        }
    };

    checkAuth();
    }, [router]); // Add navigate to the dependency array

    if (!authCheck) {
        return (
            <div className="relative w-screen h-screen overflow-x-hidden">
                <SkyFixed />
            </div>
        )
    }

    return (
        <div className="relative w-screen h-screen overflow-x-hidden">
            <SkyFixed />
            <div className="flex flex-col justify-center items-center mx-auto mt-24 text-white">
                <div className="relative flex">
                    <Logo />
                </div>
                <div className="z-10 flex sm:flex-row flex-col mt-4 mb-16 font-bagel text-2xl sm:text-3xl md:text-4xl text-center">
                    <p>2025 Application</p>
                </div>
            </div>
            <FormCard className="p-4 md:p-16 font-mont">
                <h1 className="font-bagel md:text-[2rem] text-xl text-center">Thank you for Applying!</h1>
                <p className="mt-2 md:mt-4 px-4 md:px-20 font-semibold text-muted-foreground text-xs md:text-sm text-center">
                    Please tell us a little about you, your team and the project you have in mind to work on. Our team will collect applications from March 10 - April 22, 2025.
                </p>
                <p className="mt-4 text-xs md:text-sm text-center italic">
                    All Fields Required
                </p>

                {/* Form */}
                <form className="space-y-10 mt-8">
                    <div>
                        <ApplicationLabel>Your Name</ApplicationLabel>
                        <div className="items-center gap-8 grid grid-cols-2 mt-4">
                            <ApplicationInput 
                                placeholder="First name"
                            />
                            <ApplicationInput
                                placeholder="Last name"
                            />
                        </div>
                    </div>
                    <div>
                        <ApplicationLabel>Email</ApplicationLabel>
                        <ApplicationInput 
                            type='email'
                            className="mt-4"
                            placeholder="Email"
                        />
                    </div>
                    <div className="items-center gap-8 grid grid-cols-2">
                        <div>   
                            <ApplicationLabel>Phone Number</ApplicationLabel>
                            <ApplicationInput
                                type='tel'
                                className="mt-4" 
                                placeholder="Phone Number"
                            />
                        </div>
                        <div>
                            <ApplicationLabel>Birth of Date</ApplicationLabel>
                            <ApplicationCalendar 
                                className="mt-4"
                            />
                        </div>
                    </div>
                    <div className="gap-8 grid grid-cols-2">
                        <div>
                            <ApplicationLabel>Gender</ApplicationLabel>
                            <ApplicationMultipleGroup className='mt-4'>
                                <ApplicationMultipleItem id='male' value='Male' />
                                <ApplicationMultipleItem id='female' value='Female' />
                                <ApplicationMultipleItem id='non-binary' value='Non-binary' />
                                <ApplicationMultipleItem id='pnts' value='Prefer not to say' />
                                <ApplicationMultipleItem id='other-1' value='Other' />
                            </ApplicationMultipleGroup>
                        </div>
                        <div>
                            <ApplicationLabel>Graduation Year</ApplicationLabel>
                            <ApplicationMultipleGroup className='mt-4'>
                                <ApplicationMultipleItem id='2025' value='2025' />
                                <ApplicationMultipleItem id='2026' value='2026' />
                                <ApplicationMultipleItem id='2027' value='2027' />
                                <ApplicationMultipleItem id='2028' value='2028' />
                                <ApplicationMultipleItem id='2029' value='2029' />
                                <ApplicationMultipleItem id='other-2' value='Other' />
                            </ApplicationMultipleGroup>
                        </div>
                    </div>
                    <div>
                        <ApplicationLabel>Your School</ApplicationLabel>
                        <div className="mt-4">
                            <ApplicationSelect
                                placeholder="School"
                                values={schools.map(s => s.institution)}
                            />
                        </div>
                    </div>
                    <div>
                        <ApplicationLabel>Your residence</ApplicationLabel>
                        <div className="mt-4">
                            <ApplicationSelect
                                placeholder="residence"
                                values={residences.map(r => r.city)}
                            />
                        </div>
                    </div>
                    <div>
                        <ApplicationLabel>Your CC Transcript</ApplicationLabel>
                        <FileUploader className="mt-4" />
                    </div>
                    <div>
                        <ApplicationLabel>Your Resume</ApplicationLabel>
                        <FileUploader className="mt-4" />
                    </div>
                    <div>
                        <ApplicationLabel>Describe your coding background (approx. 500 words)</ApplicationLabel>
                        <ApplicationTextarea className='mt-4' />
                    </div>
                    <div>
                        <ApplicationLabel>Explain your motivation and reason for attending hackcc (approx. 500 words)</ApplicationLabel>
                        <ApplicationTextarea className='mt-4' />
                    </div>
                    <div className="flex justify-end">
                        <Button className="bg-lightpurple p-8 font-mont font-semibold">
                            Submit Application
                        </Button>
                    </div>
                </form>
            </FormCard>
        </div>
    )
}
