import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Banner from "../components/Banner/Banner";
import Features from "../components/Features/Features";



const HomePage: React.FC = ({  }) => {

  return (
    <div>
        <Banner />
        <Features />
    </div>
  );
};

export default HomePage;
