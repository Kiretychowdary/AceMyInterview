  // Enhanced code execution with Judge0 - simple and working version
  const executeCodeWithJudge0 = async (sourceCode, languageId, input = "", timeout = 5) => {
    const judge0Urls = getJudge0Urls();
    const headers = getJudge0Headers();

    try {
      // Validate inputs
      if (!sourceCode || !sourceCode.trim()) {
        throw new Error('Source code cannot be empty');
      }

      // Helper function to safely encode to base64
      const safeBtoa = (str) => {
        try {
          return btoa(str || '');
        } catch (e) {
          console.warn('Failed to encode to base64:', str);
          return btoa(unescape(encodeURIComponent(str || '')));
        }
      };

      // Submit code for execution
      let submitResponse;
      try {
        // First try: Plain text
        const plainPayload = {
          source_code: sourceCode,
          language_id: languageId,
          stdin: input || "",
          cpu_time_limit: timeout,
          memory_limit: 128000,
        };

        console.log('Trying Judge0 submission with plain text...');
        submitResponse = await axios.post(judge0Urls.submit, plainPayload, { headers, timeout: 15000 });
      } catch (plainError) {
        console.log('Plain text failed, trying base64...', plainError.message);

        // Second try: Base64 encoded
        const base64Payload = {
          source_code: safeBtoa(sourceCode),
          language_id: languageId,
          stdin: safeBtoa(input || ""),
          cpu_time_limit: timeout,
          memory_limit: 128000,
        };

        submitResponse = await axios.post(judge0Urls.submit, base64Payload, { headers, timeout: 15000 });
      }

      const token = submitResponse.data.token;
      console.log('Judge0 submission successful, token:', token);

      if (!token) {
        throw new Error('No token received from Judge0');
      }

      // Poll for result
      let attempts = 0;
      const maxAttempts = 20;
      
      while (attempts < maxAttempts) {
        attempts++;
        await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds

        const resultResponse = await axios.get(judge0Urls.getResult(token), { headers, timeout: 8000 });
        const result = resultResponse.data;

        console.log('Poll attempt', attempts, 'Status:', result.status?.description);

        // If still processing, continue polling
        if (result.status.id <= 2) {
          continue;
        }

        // Helper function to safely decode base64
        const safeAtob = (str) => {
          if (!str) return '';
          try {
            return atob(str);
          } catch (e) {
            return str; // Return original if decode fails
          }
        };

        const finalOutput = safeAtob(result.stdout);
        
        return {
          success: result.status.id === 3, // 3 = Accepted
          output: finalOutput,
          error: safeAtob(result.stderr),
          status: result.status.description,
          statusId: result.status.id,
          time: result.time,
          memory: result.memory,
          compileOutput: safeAtob(result.compile_output)
        };
      }

      throw new Error('Execution timeout - taking too long to process');

    } catch (error) {
      console.error('Judge0 execution error:', error);
      
      // Enhanced error messaging for 403 errors
      if (error.response?.status === 403) {
        throw new Error(`🔑 Authentication Failed (403): Your RapidAPI key may not have Judge0 CE subscription.

🚨 Common Solutions:
1. Visit https://rapidapi.com/judge0-official/api/judge0-ce/ 
2. Subscribe to Judge0 CE (free plan available)
3. Verify your API key is correct in environment variables

🔍 Your API Key starts with: ${headers['X-RapidAPI-Key'].substring(0, 10)}...

💡 The Judge0 CE subscription is required for code execution.`);
      }
      
      throw new Error(`Execution failed: ${error.message}`);
    }
  };
