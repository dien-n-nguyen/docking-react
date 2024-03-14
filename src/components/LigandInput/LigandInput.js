import React, { useState } from 'react';
import data from './sdf_mapping_filtered.json'

const LigandInput = ({ onSelect }) => {
  // State to manage the selected option
  const [selectedOption, setSelectedOption] = useState('');

  // Handler function to update the selected option when changed
  const handleSelectChange = (event) => {
    const selectedLigand = event.target.value
    setSelectedOption(selectedLigand);
    onSelect(selectedLigand)
  };

  return (
    <div style={{ textAlign: 'left' , flex: 1 }}>
      {/* Dropdown menu */}
      <label htmlFor="ligand-select">Select ligand: </label>
      <select value={selectedOption} onChange={handleSelectChange} id="ligand-select">
        {/* Map over the options array to render <option> elements */}
        <option value=''>Select ligand</option>
        {data.map((option, index) => (
          <option key={index} value={option.value}>{option.text}</option>
        ))}
      </select>
    </div>
  );
};

export default LigandInput;