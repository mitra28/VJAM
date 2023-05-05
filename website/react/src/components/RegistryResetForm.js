import React, { useState } from 'react';

function RegistryResetForm() {
  const [message, setMessage] = useState('');
  const handleSubmit = async (event) => {
    event.preventDefault();
    console.log('Package delete handle submit!');
  
    
    const response = await fetch(`/reset`, { // use fetch API to make a POST request to /api/packages endpoint
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json'
      },
    });
    
    if (response.ok) {
      console.log('Registry reset successfully!');
      const output = await response.json();
      setMessage(output);
      console.log(output);

    } else {
      console.error('Failed to reset registry.');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <button type="submit">Reset Registry</button>
      {message && <div>{message.msg}</div>}
    </form>
  );
}

export default RegistryResetForm;