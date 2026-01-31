"use client"


import Link from 'next/link'
// import React from 'react'
import { Button } from './ui/button'
import Image from 'next/image'

import React, { useEffect, useRef } from "react";


const HeroSection = () => {

     const imageRef = useRef(null);

     useEffect(() => {
      // const imageElement = imageRef.current;
        const handleScroll = () =>{
         const scrollPosition = window.scrollY;
         const scrollThreshold = 100;

         if(scrollPosition>scrollThreshold){
          imageElement.classList.add("scrolled");
         } else{
          imageElement.classList.remove("scrolled");
         }
        };
        const imageElement = imageRef.current;
        window.addEventListener("scroll",handleScroll);

        return () => window.removeEventListener("scroll",handleScroll);
     }, [])
  return (
    <div className="pb-20 px-4">
      <div className="container mx-auto text-center">
        <h1 className="text-5xl md:text-8xl lg:text-[77px] pb-6 gradient-title">
            Manage Your Finances <br/> with Savvy
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-2xl mx-auto">
            An AI-powered financial management platform that helps you track , analyze & optimize your spending with real-time insights.
        </p>
        <div className="flex justify-center space-x-4">
            <Link href="/dashboard">
            <Button size="lg" className="px-8">
                Get started
            </Button>
            </Link>
                 <Link href="https://www.geeksforgeeks.org/nextjs/nextjs-tutorial/">
            <Button size="lg" variant='outline' className="px-8">
                Watch Demo
            </Button>
            </Link>
        </div>
        <div className="hero-image-wrapper">
        <div ref={imageRef} className="hero-image">
            <Image src="/robot.jpg" width={880} height={620} alt="Dashboard preview" className="rounded-lg shadow-2xl border mx-auto" 
            priority/>
        </div>
        </div>
      </div>
    </div>
  )
}

export default HeroSection;
