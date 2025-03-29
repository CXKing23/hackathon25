import React, { useState } from "react";
import Logo from "./path/to/logo.png"; // Make sure to import your logo image correctly

const YourComponentName = () => {
  const [isSpinning, setIsSpinning] = useState(false);
  const [result, setResult] = useState("Some result text");

  return (
    <div>
      <div>
        <img
          src={Logo}
          alt="Logo"
          className={`Logo${isSpinning ? "spin" : ""}`}
        />
        <p>{result}</p>
      </div>
    </div>
  );
};

export default Logo;