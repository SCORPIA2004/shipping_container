import { useState } from "react";
import { FiBox } from "react-icons/fi";
import "./App.css";
import type { InputData, PackingResult, AppView } from "./types";
import { sampleData } from "./utils/sampleData";
import { packBoxes } from "./services/PackingAlgorithm";
import InputForm from "./components/InputForm";
import Visualizer3D from "./components/Visualizer3D";

function App() {
  // App state
  const [currentView, setCurrentView] = useState<AppView>("input");
  const [inputData, setInputData] = useState<InputData>(sampleData);
  const [packingResult, setPackingResult] = useState<PackingResult | null>(
    null,
  );

  // Handle form submission
  const handleSubmit = (data: InputData) => {
    setInputData(data);

    // Run packing algorithm
    const result = packBoxes(data.container, data.boxTypes);

    setPackingResult(result);
    setCurrentView("visualizer");
  };

  // Handle back navigation
  const handleBack = () => {
    setCurrentView("input");
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>
          <FiBox className="app-header__icon" />
          Container Packing Visualizer
        </h1>
        <p className="subtitle">Optimize and visualize your shipment</p>
      </header>

      <main className="app-main">
        {currentView === "input" ? (
          <InputForm onSubmit={handleSubmit} />
        ) : (
          <Visualizer3D
            container={inputData.container}
            packingResult={packingResult}
            onBack={handleBack}
          />
        )}
      </main>
    </div>
  );
}

export default App;
