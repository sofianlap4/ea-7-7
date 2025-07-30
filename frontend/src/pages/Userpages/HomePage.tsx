import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Banner from "../../components/Banner/Banner";
import Features from "../../components/Features/Features";
import HowItWorks from "../../components/HowItWorks/HowItWorks";
import Access from "../../components/Access/Access";
import Footer from "../../components/Footer/Footer";
import PacksOffers from "../../components/PacksOffers/PacksOffers";
import Testimonials from "../../components/Testimonials/Testimonials";
import RegisterNow from "../../components/RegisterNow/RegisterNow";



const HomePage: React.FC = ({  }) => {

  return (
    <div>
        <Banner />
        <Features />
        <HowItWorks />
        <PacksOffers />
        <Access />
        <Testimonials />
        <RegisterNow />
        <Footer />
    </div>
  );
};

export default HomePage;
