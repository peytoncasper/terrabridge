import React, { useState } from 'react';
import './CodeConverter.css';
import spinner from './spinner.gif';

const CodeConverter = () => {
  const [inputCode, setInputCode] = useState('');
  const [outputCode, setOutputCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [inputLanguage, setInputLanguage] = useState('');
  const [outputLanguage, setOutputLanguage] = useState('');
  const [inputMetrics, setInputMetrics] = useState({ variables: 0, outputs: 0, resources: 0 });
  const [outputMetrics, setOutputMetrics] = useState({ variables: 0, outputs: 0, resources: 0 });

  const handleInputChange = (e) => {
    setInputCode(e.target.value);
  };

  const convertCode = async () => {
    setIsLoading(true);

    // Determine the input language
    const languageResponse = await fetch('/determine-language', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ code: inputCode }),
    }).catch((error) => {
      console.error('Error:', error);
    });

    const languageData = await languageResponse.json();
    setInputLanguage(languageData.language);

    // Analyze the input code
    const analyzeResponse = await fetch('/analyze-code', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ code: inputCode, language: languageData.language }),
    }).catch((error) => {
      console.error('Error:', error);
    });

    const analyzeData = await analyzeResponse.json();

    const analysis = JSON.parse(analyzeData.analysis);

    setInputMetrics({
      variables: analysis.variables || analysis.parameters || 0,
      outputs: analysis.outputs || 0,
      resources: analysis.resources || 0,
    })



    const requestBody = {
      template: inputCode,
    };

   const convertResponse =  await fetch('/convert', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    }).catch((error) => {
      console.error('Error:', error);
    });

    const convertedCode = await convertResponse.json();

    console.log(convertedCode.convertedTemplate)

    setOutputCode(convertedCode.convertedTemplate)

    const outputLanguageResponse = await fetch('/determine-language', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ code: convertedCode.convertedTemplate }),
    }).catch((error) => {
      console.error('Error:', error);
    });;

    const outputLangData = await outputLanguageResponse.json();
    setOutputLanguage(outputLangData.language);

    // Analyze the input code
    const outputMetricsResponse = await fetch('/analyze-code', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ code: convertedCode.convertedTemplate, language: outputLangData.language }),
    }).catch((error) => {
      console.error('Error:', error);
    });;

    const outputMetrics = await outputMetricsResponse.json();

    const outMetrics = JSON.parse(outputMetrics.analysis);

    setOutputMetrics({
      variables: outMetrics.variables || outMetrics.parameters || 0,
      outputs: outMetrics.outputs || 0,
      resources: outMetrics.resources || 0,
    })

    setIsLoading(false);

  };

  return (
    <div className="code-converter">
      {isLoading && (
        <div className="loading-spinner-container">
          <img src={spinner} alt="Loading..." />
        </div>
      )}

      <button className="convert-button" onClick={convertCode}>
        Convert
      </button>
      <div className="textarea-container">
        <div className="input-container">
          <h3>
            Language: {inputLanguage} Variables: {inputMetrics.variables}, Outputs: {inputMetrics.outputs}, Resources: {inputMetrics.resources}
          </h3>
          <textarea
            className="input-code"
            placeholder="Paste your ARM/CloudFormation code here"
            value={inputCode}
            onChange={handleInputChange}
          ></textarea>
        </div>
        <div className="output-container">
          <h3>
          Language: {outputLanguage} Variables: {outputMetrics.variables}, Outputs: {outputMetrics.outputs}, Resources: {outputMetrics.resources}

          </h3>
          <textarea
            className="output-code"
            placeholder="Your Terraform code will appear here"
            value={outputCode}
            readOnly
          ></textarea>
        </div>
      </div>
    </div>
  );
};

export default CodeConverter;
