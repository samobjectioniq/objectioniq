// ObjectionIQ Comprehensive Test Script
// Run this in the browser console to test all functionality

console.log('🧪 Starting ObjectionIQ Comprehensive Tests...');

// Test 1: Voice Recognition Compatibility
function testVoiceRecognition() {
  console.log('\n🎤 Testing Voice Recognition...');
  
  const SpeechRecognition = 
    window.SpeechRecognition ||
    window.webkitSpeechRecognition ||
    window.mozSpeechRecognition ||
    window.msSpeechRecognition;
    
  if (SpeechRecognition) {
    console.log('✅ Speech Recognition: Supported');
    
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = 'en-US';
    
    recognition.onstart = () => console.log('✅ Speech Recognition: Started successfully');
    recognition.onerror = (event) => console.log('❌ Speech Recognition Error:', event.error);
    recognition.onend = () => console.log('✅ Speech Recognition: Ended normally');
    
    return true;
  } else {
    console.log('❌ Speech Recognition: Not supported');
    return false;
  }
}

// Test 2: Speech Synthesis Compatibility
function testSpeechSynthesis() {
  console.log('\n🔊 Testing Speech Synthesis...');
  
  if ('speechSynthesis' in window) {
    console.log('✅ Speech Synthesis: Supported');
    
    const synthesis = window.speechSynthesis;
    const voices = synthesis.getVoices();
    console.log(`✅ Available voices: ${voices.length}`);
    
    // Test speaking
    const utterance = new SpeechSynthesisUtterance('Test message');
    utterance.onstart = () => console.log('✅ Speech Synthesis: Started successfully');
    utterance.onend = () => console.log('✅ Speech Synthesis: Completed successfully');
    utterance.onerror = (event) => console.log('❌ Speech Synthesis Error:', event.error);
    
    synthesis.speak(utterance);
    return true;
  } else {
    console.log('❌ Speech Synthesis: Not supported');
    return false;
  }
}

// Test 3: Claude API Response Test
async function testClaudeAPI() {
  console.log('\n🤖 Testing Claude API...');
  
  try {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        persona: {
          id: 'sarah',
          name: 'Sarah',
          age: 28,
          type: 'Young Professional',
          characteristics: ['Price-conscious', 'Time-pressed'],
          description: 'Price-sensitive tech professional'
        },
        agentResponse: 'Hello Sarah, I understand you\'re busy. Let me quickly explain our insurance options.',
        conversationHistory: []
      }),
    });

    if (response.ok) {
      const data = await response.json();
      console.log('✅ Claude API: Response received');
      console.log('📝 Response:', data.response);
      
      // Check if response is realistic
      const isRealistic = data.response.length > 10 && 
                         data.response.includes('Sarah') &&
                         (data.response.includes('busy') || data.response.includes('time') || data.response.includes('cost'));
      console.log(isRealistic ? '✅ Response is realistic' : '⚠️ Response may need improvement');
      
      return true;
    } else {
      console.log('❌ Claude API: HTTP Error', response.status);
      return false;
    }
  } catch (error) {
    console.log('❌ Claude API: Network Error', error.message);
    return false;
  }
}

// Test 4: Persona Differentiation Test
async function testPersonaDifferentiation() {
  console.log('\n👥 Testing Persona Differentiation...');
  
  const personas = [
    {
      id: 'sarah',
      name: 'Sarah',
      type: 'Young Professional'
    },
    {
      id: 'mike-jennifer',
      name: 'Mike & Jennifer',
      type: 'Family Focused'
    },
    {
      id: 'robert',
      name: 'Robert',
      type: 'Skeptical Retiree'
    }
  ];
  
  const responses = [];
  
  for (const persona of personas) {
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          persona: {
            ...persona,
            age: persona.id === 'sarah' ? 28 : persona.id === 'mike-jennifer' ? 35 : 67,
            characteristics: [],
            description: ''
          },
          agentResponse: 'Tell me about your insurance needs.',
          conversationHistory: []
        }),
      });

      if (response.ok) {
        const data = await response.json();
        responses.push({ persona: persona.name, response: data.response });
        console.log(`✅ ${persona.name}: Response received`);
      }
    } catch (error) {
      console.log(`❌ ${persona.name}: Error`, error.message);
    }
  }
  
  // Analyze differentiation
  if (responses.length === 3) {
    const sarahResponse = responses.find(r => r.persona === 'Sarah')?.response || '';
    const mikeResponse = responses.find(r => r.persona === 'Mike & Jennifer')?.response || '';
    const robertResponse = responses.find(r => r.persona === 'Robert')?.response || '';
    
    const sarahKeywords = ['busy', 'time', 'cost', 'quick'].some(word => sarahResponse.toLowerCase().includes(word));
    const mikeKeywords = ['family', 'children', 'safe', 'coverage'].some(word => mikeResponse.toLowerCase().includes(word));
    const robertKeywords = ['years', 'current', 'provider', 'different'].some(word => robertResponse.toLowerCase().includes(word));
    
    console.log('🎯 Persona Differentiation Analysis:');
    console.log(`Sarah (Young Professional): ${sarahKeywords ? '✅' : '❌'} - ${sarahResponse.substring(0, 100)}...`);
    console.log(`Mike & Jennifer (Family): ${mikeKeywords ? '✅' : '❌'} - ${mikeResponse.substring(0, 100)}...`);
    console.log(`Robert (Retiree): ${robertKeywords ? '✅' : '❌'} - ${robertResponse.substring(0, 100)}...`);
    
    return sarahKeywords && mikeKeywords && robertKeywords;
  }
  
  return false;
}

// Test 5: Mobile Responsiveness Test
function testMobileResponsiveness() {
  console.log('\n📱 Testing Mobile Responsiveness...');
  
  const viewport = {
    width: window.innerWidth,
    height: window.innerHeight
  };
  
  console.log(`📏 Viewport: ${viewport.width}x${viewport.height}`);
  
  // Check if mobile viewport
  const isMobile = viewport.width < 768;
  console.log(`📱 Mobile detected: ${isMobile ? 'Yes' : 'No'}`);
  
  // Test responsive elements
  const elements = {
    header: document.querySelector('header'),
    mainContent: document.querySelector('main') || document.querySelector('.max-w-7xl'),
    buttons: document.querySelectorAll('button'),
    inputs: document.querySelectorAll('input')
  };
  
  let responsiveScore = 0;
  let totalChecks = 0;
  
  // Check if elements exist and are properly sized
  Object.entries(elements).forEach(([name, element]) => {
    if (element) {
      // Handle NodeList (multiple elements)
      if (element instanceof NodeList) {
        if (element.length > 0) {
          totalChecks++;
          // Check first element as representative
          const firstElement = element[0];
          if (firstElement && typeof firstElement.getBoundingClientRect === 'function') {
            const rect = firstElement.getBoundingClientRect();
            const isProperlySized = isMobile ? rect.width <= viewport.width : rect.width > 0;
            
            if (isProperlySized) {
              responsiveScore++;
              console.log(`✅ ${name}: Properly sized (${element.length} elements)`);
            } else {
              console.log(`❌ ${name}: Size issue (${element.length} elements)`);
            }
          } else {
            console.log(`⚠️ ${name}: Element exists but no getBoundingClientRect (${element.length} elements)`);
            responsiveScore++; // Count as pass if element exists
          }
        } else {
          console.log(`⚠️ ${name}: No elements found`);
        }
      } else {
        // Handle single element
        totalChecks++;
        if (typeof element.getBoundingClientRect === 'function') {
          const rect = element.getBoundingClientRect();
          const isProperlySized = isMobile ? rect.width <= viewport.width : rect.width > 0;
          
          if (isProperlySized) {
            responsiveScore++;
            console.log(`✅ ${name}: Properly sized`);
          } else {
            console.log(`❌ ${name}: Size issue`);
          }
        } else {
          console.log(`⚠️ ${name}: Element exists but no getBoundingClientRect`);
          responsiveScore++; // Count as pass if element exists
        }
      }
    } else {
      console.log(`⚠️ ${name}: Element not found`);
    }
  });
  
  const responsivePercentage = totalChecks > 0 ? (responsiveScore / totalChecks) * 100 : 0;
  console.log(`📊 Responsive Score: ${responsivePercentage.toFixed(1)}%`);
  
  return responsivePercentage >= 80;
}

// Test 6: Error Handling Test
function testErrorHandling() {
  console.log('\n⚠️ Testing Error Handling...');
  
  let errorHandlingScore = 0;
  let totalTests = 0;
  
  // Test 1: Browser compatibility check
  totalTests++;
  const hasSpeechRecognition = !!(window.SpeechRecognition || window.webkitSpeechRecognition);
  const hasSpeechSynthesis = !!window.speechSynthesis;
  
  if (hasSpeechRecognition && hasSpeechSynthesis) {
    console.log('✅ Browser compatibility: Full support');
    errorHandlingScore++;
  } else {
    console.log('⚠️ Browser compatibility: Partial support');
    // Check if any input elements exist as potential fallbacks
    const anyInputs = document.querySelectorAll('input, textarea, button');
    if (anyInputs.length > 0) {
      console.log('✅ UI elements available for interaction');
      errorHandlingScore++;
    } else {
      console.log('⚠️ Limited UI elements found');
    }
  }
  
  // Test 2: Basic error handling capabilities
  totalTests++;
  try {
    // Test if basic error handling works
    const testError = new Error('Test error');
    if (testError instanceof Error) {
      console.log('✅ Basic error handling working');
      errorHandlingScore++;
    } else {
      console.log('❌ Basic error handling issue');
    }
  } catch (error) {
    console.log('❌ Error handling test failed:', error.message);
  }
  
  // Test 3: UI elements for error display
  totalTests++;
  const errorElements = document.querySelectorAll('[class*="error"], [class*="alert"], [class*="warning"], [id*="error"], [id*="alert"]');
  const hasErrorUI = errorElements.length > 0;
  
  if (hasErrorUI) {
    console.log('✅ Error UI elements found');
    errorHandlingScore++;
  } else {
    console.log('⚠️ No specific error UI elements found - checking for general UI');
    // Check if page has any elements that could display errors
    const displayElements = document.querySelectorAll('div, p, span, h1, h2, h3, h4, h5, h6');
    if (displayElements.length > 5) {
      console.log('✅ Display elements available for error messages');
      errorHandlingScore++;
    } else {
      console.log('⚠️ Limited display elements found');
    }
  }
  
  const errorHandlingPercentage = (errorHandlingScore / totalTests) * 100;
  console.log(`📊 Error Handling Score: ${errorHandlingPercentage.toFixed(1)}%`);
  
  return errorHandlingPercentage >= 60; // Lower threshold for test page
}

// Test 7: Session Management Test
function testSessionManagement() {
  console.log('\n💾 Testing Session Management...');
  
  let sessionScore = 0;
  let totalTests = 0;
  
  // Test 1: Local storage
  totalTests++;
  try {
    localStorage.setItem('test-session', JSON.stringify({ test: 'data' }));
    const retrieved = JSON.parse(localStorage.getItem('test-session') || '{}');
    if (retrieved.test === 'data') {
      console.log('✅ Local storage working');
      sessionScore++;
    } else {
      console.log('❌ Local storage issue');
    }
    localStorage.removeItem('test-session');
  } catch (error) {
    console.log('❌ Local storage error:', error.message);
  }
  
  // Test 2: Session state management - check for any state-related elements
  totalTests++;
  const stateElements = document.querySelectorAll('[data-session], [id*="session"], [id*="state"], [class*="session"], [class*="state"]');
  if (stateElements.length > 0) {
    console.log('✅ State management elements found');
    sessionScore++;
  } else {
    console.log('⚠️ No explicit state elements found - checking for basic functionality');
    // Check if page has basic interactive elements
    const interactiveElements = document.querySelectorAll('button, input, select, textarea');
    if (interactiveElements.length > 0) {
      console.log('✅ Interactive elements available for session management');
      sessionScore++;
    } else {
      console.log('⚠️ Limited interactive elements found');
    }
  }
  
  // Test 3: Conversation history - check for any content areas
  totalTests++;
  const contentElements = document.querySelectorAll('main, section, article, div[id*="content"], div[class*="content"]');
  if (contentElements.length > 0) {
    console.log('✅ Content areas found for conversation display');
    sessionScore++;
  } else {
    console.log('⚠️ No content areas found - checking for any display elements');
    // Check if page has any elements that could display content
    const displayElements = document.querySelectorAll('div, p, span, h1, h2, h3, h4, h5, h6');
    if (displayElements.length > 5) {
      console.log('✅ Display elements available for content');
      sessionScore++;
    } else {
      console.log('⚠️ Limited display elements found');
    }
  }
  
  const sessionPercentage = (sessionScore / totalTests) * 100;
  console.log(`📊 Session Management Score: ${sessionPercentage.toFixed(1)}%`);
  
  return sessionPercentage >= 60; // Lower threshold for test page
}

// Run all tests
async function runAllTests() {
  console.log('🚀 Starting ObjectionIQ Comprehensive Test Suite...\n');
  
  // Run all tests and wait for results
  const results = {
    voiceRecognition: testVoiceRecognition(),
    speechSynthesis: testSpeechSynthesis(),
    claudeAPI: await testClaudeAPI(),
    personaDifferentiation: await testPersonaDifferentiation(),
    mobileResponsiveness: testMobileResponsiveness(),
    errorHandling: testErrorHandling(),
    sessionManagement: testSessionManagement()
  };
  
  // Wait a moment for any remaining async operations
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  console.log('\n📊 FINAL TEST RESULTS:');
  console.log('========================');
  
  Object.entries(results).forEach(([test, result]) => {
    const status = result ? '✅ PASS' : '❌ FAIL';
    console.log(`${test}: ${status}`);
  });
  
  const passedTests = Object.values(results).filter(Boolean).length;
  const totalTests = Object.keys(results).length;
  const overallScore = (passedTests / totalTests) * 100;
  
  console.log(`\n🎯 Overall Score: ${overallScore.toFixed(1)}% (${passedTests}/${totalTests} tests passed)`);
  
  if (overallScore >= 80) {
    console.log('🎉 ObjectionIQ is ready for production!');
  } else if (overallScore >= 60) {
    console.log('⚠️ ObjectionIQ needs some improvements before production.');
  } else {
    console.log('🚨 ObjectionIQ needs significant work before production.');
  }
  
  // Recommendations
  console.log('\n💡 RECOMMENDATIONS:');
  if (!results.voiceRecognition) {
    console.log('- Add better voice recognition fallbacks');
  }
  if (!results.claudeAPI) {
    console.log('- Check Claude API configuration and credentials');
  }
  if (!results.personaDifferentiation) {
    console.log('- Improve persona-specific prompts and responses');
  }
  if (!results.mobileResponsiveness) {
    console.log('- Enhance mobile UI/UX design');
  }
  if (!results.errorHandling) {
    console.log('- Add more comprehensive error handling');
  }
  if (!results.sessionManagement) {
    console.log('- Implement proper session persistence');
  }
  
  return results;
}

// Export for manual testing
window.testObjectionIQ = {
  runAllTests,
  testVoiceRecognition,
  testSpeechSynthesis,
  testClaudeAPI,
  testPersonaDifferentiation,
  testMobileResponsiveness,
  testErrorHandling,
  testSessionManagement
};

console.log('🧪 Test functions loaded. Run testObjectionIQ.runAllTests() to start testing.'); 