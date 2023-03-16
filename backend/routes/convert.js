const express = require('express');
const axios = require('axios');
const router = express.Router();
require('dotenv').config(); // Add this line


const determineLanguage = async (input) => {
    const openApiUrl = 'https://api.openai.com/v1/chat/completions';
    const prompt = 'What type of code is this? Output this as these one of these three valid responses. - ARM - CloudFormation - Terraform';
    const text = `${prompt}\n\n${input}`;

    const requestBody = {
      model: 'gpt-3.5-turbo',
      messages: [{'role': 'user', 'content': text}],
      max_tokens: 128, // Adjust this value as needed
      n: 1,
    };

    const response = await axios.post(openApiUrl, requestBody, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAPI_API_KEY}`,
      },
    });

    const language = response.data.choices[0].message.content;

    return language
}

const analyzeCode = async (inputCode, language) => {
    let prompt = '';

  
    switch (language) {
      case 'ARM':
        prompt = `Analyze the following ARM template and extract the number of outputs, parameters, and resources.  Provide the informtion as a JSON object with the following keys. resources, parameters, and outputs. The values should be a count only. :\n\n${inputCode}\n\nAnalysis:`;
        break;
      case 'CloudFormation':
        prompt = `Analyze the following CloudFormation template and extract the number of parameters, outputs, and resources. Provide the informtion as a JSON object with the following keys. resources, parameters, and outputs. The values should be a count only.:\n\n${inputCode}\n\nAnalysis:`;
        break;
      case 'Terraform':
        prompt = `Analyze the following Terraform code and extract the number of resources, outputs, and variables. Provide the informtion as a JSON object with the following keys. resources, variables, and outputs. The values should be a count only:\n\n${inputCode}\n\nAnalysis:`;
        break;
      default:
        throw new Error(`Unsupported language: ${language}`);
    }
  
    const openApiUrl = 'https://api.openai.com/v1/chat/completions';
    const text = `${prompt}\n\n${inputCode}`;

    const requestBody = {
        model: 'gpt-3.5-turbo',
        messages: [{'role': 'user', 'content': text}],
        max_tokens: 512, // Adjust this value as needed
        n: 1,
    };
  
    const response = await axios.post(openApiUrl, requestBody, {
    headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAPI_API_KEY}`,
    },
    });
  
    const analysis = response.data.choices[0].message.content;
    return analysis;
  };

  router.post('/determine-language', async (req, res) => {
    const { code } = req.body;
  
    if (!code) {
      return res.status(400).json({ error: 'No code provided' });
    }
  
    try {
      var language = await determineLanguage(code);
      if (language.includes('ARM')) {
        language = "ARM"
      } else if (language.includes('Cloud Formation') || language.includes('CloudFormation')) {
        language = "CloudFormation"
      } else if (language.includes('Terraform')) {
        language = "Terraform"
      }
    

      res.json({ language });
    } catch (error) {
      console.error('Error determining language:', error.message);
      res.status(500).json({ error: 'Error determining language' });
    }
  });
  
  router.post('/analyze-code', async (req, res) => {
    const { code, language } = req.body;
  
    if (!code || !language) {
      return res.status(400).json({ error: 'Code and language are required' });
    }
  
    try {
      const analysis = await analyzeCode(code, language);
      res.json({ analysis });
    } catch (error) {
      console.error('Error analyzing code:', error.message);
      res.status(500).json({ error: 'Error analyzing code' });
    }
  });
  

router.post('/convert', async (req, res) => {
  const { template } = req.body;

  if (!template) {
    return res.status(400).json({ error: 'No template provided' });
  }

  try {

    const openApiUrl = 'https://api.openai.com/v1/chat/completions';
    const prompt = 'Convert the following ARM or CloudFormation code to Terraform code and wrap the resulting Terraform code in triple backticks:';
    const text = `${prompt}\n\n${template}`;

    const requestBody = {
      model: 'gpt-3.5-turbo',
      messages: [{'role': 'user', 'content': text}],
      max_tokens: 2048, // Adjust this value as needed
      n: 1,
    };

    const response = await axios.post(openApiUrl, requestBody, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAPI_API_KEY}`,
      },
    });


    var convertedTemplate = response.data.choices[0].message.content;

    // Remove the backticks and the Terraform indicator
    convertedTemplate = convertedTemplate.replace(/^\s*```\s*([\w-]+)?\s*/, '');
    convertedTemplate = convertedTemplate.replace(/\s*```\s*$/, '');

    res.json({ convertedTemplate });
  } catch (error) {
    console.log(error)
    console.error('Error converting template:', error.message);
    res.status(500).json({ error: 'Error converting template' });
  }
});

module.exports = router;
