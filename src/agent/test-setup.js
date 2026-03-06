// src/agent/test-setup.js
// Run this file to verify your LangGraph.js setup is working correctly

import 'dotenv/config';
import { ChatOpenAI } from '@langchain/openai';

async function testConnection() {
  console.log('🔍 Testing OpenAI connection...\n');

  // Check if API key is set
  if (!process.env.OPENAI_API_KEY) {
    console.error('❌ OPENAI_API_KEY is not set in .env file');
    console.error('   Create a .env file in your project root with:');
    console.error('   OPENAI_API_KEY=sk-your-api-key-here');
    process.exit(1);
  }

  console.log('✅ API key found\n');

  // Initialize the model
  const model = new ChatOpenAI({
    modelName: process.env.OPENAI_MODEL || 'gpt-4o-mini',
    temperature: 0,
  });

  console.log(`Using model: ${model.modelName}\n`);

  try {
    // Make a simple test call
    const response = await model.invoke('Say "LangGraph.js is ready!" and nothing else.');
    
    console.log('🤖 Response:', response.content);
    console.log('\n✅ Setup complete! You are ready to build agents.\n');
  } catch (error) {
    console.error('❌ Error connecting to OpenAI:', error.message);
    
    if (error.message.includes('401')) {
      console.error('Your API key appears to be invalid.');
    } else if (error.message.includes('429')) {
      console.error('Rate limit exceeded. Please wait and try again.');
    } else if (error.message.includes('insufficient_quota')) {
      console.error('Your OpenAI account has insufficient credits.');
    }
    
    process.exit(1);
  }
}

testConnection();
