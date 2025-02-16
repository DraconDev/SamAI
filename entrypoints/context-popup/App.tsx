import React, { useState, useEffect } from 'react';

export default function App() {
  const [input, setInput] = useState('');
  const [elementInfo, setElementInfo] = useState<{
    value: string;
    placeholder: string;
    inputType: string;
    elementId: string;
    elementName: string;
  }>({
    value: '',
    placeholder: '',
    inputType: '',
    elementId: '',
    elementName: ''
  });

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setElementInfo({
      value: params.get('value') || '',
      placeholder: params.get('placeholder') || '',
      inputType: params.get('inputType') || '',
      elementId: params.get('elementId') || '',
      elementName: params.get('elementName') || ''
    });
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Input submitted:', input);
    console.log('Element info:', elementInfo);
    // TODO: Handle the input
    setInput('');
  };

  return (
    <div className="p-4 min-w-[300px]">
      <div className="mb-4 text-sm text-gray-600">
        <p>Element Type: {elementInfo.inputType}</p>
        {elementInfo.elementId && <p>ID: {elementInfo.elementId}</p>}
        {elementInfo.elementName && <p>Name: {elementInfo.elementName}</p>}
        {elementInfo.value && <p>Current Value: {elementInfo.value}</p>}
      </div>
      <form onSubmit={handleSubmit} className="flex flex-col gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={elementInfo.placeholder || "Type your message..."}
          className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          autoFocus
        />
        <button
          type="submit"
          className="w-full p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          Send
        </button>
      </form>
    </div>
  );
}
