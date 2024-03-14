import React, { useState } from 'react';

const ReceptorInput = ({ onInput }) => {
  // State to manage the value of the text field
  const [receptorValue, setReceptorValue] = useState('');

  // Handler function to update the text field value when changed
  const handleReceptorValueChange = (event) => {
    const inputReceptor = event.target.value;
    setReceptorValue(inputReceptor);
    onInput(inputReceptor)
  };

  return (
    <div style={{ textAlign: 'left', flex: 1 }}>
      {/* Text field */}
      <label htmlFor="receptorName">Receptor Name: </label>
      <input 
        type="text"
        id="receptorName"
        label="Receptor Name"
        value={receptorValue}
        onChange={handleReceptorValueChange}
        placeholder="E.g.AT3G22180"
      />
    </div>
  );
};

export default ReceptorInput;
