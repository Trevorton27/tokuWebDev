/**
 * Code execution service - Run code via JDoodle API
 */

import axios from 'axios';
import { logger } from '@/lib/logger';
import type { CodeExecutionResult } from '@/lib/types';

const JDOODLE_API_URL = 'https://api.jdoodle.com/v1/execute';
const CLIENT_ID = process.env.JDOODLE_CLIENT_ID || '';
const CLIENT_SECRET = process.env.JDOODLE_CLIENT_SECRET || '';

// Language version mapping for JDoodle
const LANGUAGE_VERSIONS: Record<string, { language: string; versionIndex: string }> = {
  javascript: { language: 'nodejs', versionIndex: '4' },
  python: { language: 'python3', versionIndex: '4' },
  java: { language: 'java', versionIndex: '4' },
  cpp: { language: 'cpp17', versionIndex: '1' },
  typescript: { language: 'nodejs', versionIndex: '4' },
  go: { language: 'go', versionIndex: '4' },
  rust: { language: 'rust', versionIndex: '4' },
};

export async function runCodeWithJDoodle(
  code: string,
  language: string,
  stdin = ''
): Promise<CodeExecutionResult> {
  try {
    const langConfig = LANGUAGE_VERSIONS[language.toLowerCase()];

    if (!langConfig) {
      throw new Error(`Unsupported language: ${language}`);
    }

    // Check if JDoodle credentials are configured
    if (!CLIENT_ID || !CLIENT_SECRET) {
      logger.warn('JDoodle credentials not configured, using mock execution');
      return mockExecution(code, stdin);
    }

    const response = await axios.post(JDOODLE_API_URL, {
      clientId: CLIENT_ID,
      clientSecret: CLIENT_SECRET,
      script: code,
      language: langConfig.language,
      versionIndex: langConfig.versionIndex,
      stdin,
    });

    const { output, memory, cpuTime, statusCode } = response.data;

    return {
      stdout: output || '',
      stderr: statusCode !== 200 ? output : '',
      executionTime: parseFloat(cpuTime) || 0,
      memory: parseFloat(memory) || 0,
      error: statusCode !== 200 ? 'Execution error' : undefined,
    };
  } catch (error) {
    logger.error('Code execution failed', error, { language });

    if (axios.isAxiosError(error) && error.response) {
      return {
        stdout: '',
        stderr: error.response.data?.error || 'Execution failed',
        executionTime: 0,
        error: 'JDoodle API error',
      };
    }

    return {
      stdout: '',
      stderr: 'Internal execution error',
      executionTime: 0,
      error: 'Execution failed',
    };
  }
}

/**
 * Mock execution for development/testing when JDoodle is not configured
 */
function mockExecution(code: string, stdin: string): CodeExecutionResult {
  logger.debug('Using mock code execution');

  return {
    stdout: 'Mock execution output\n(Configure JDoodle API for real execution)',
    stderr: '',
    executionTime: 0.1,
    memory: 1024,
  };
}

/**
 * Validate code output against expected output
 */
export function validateOutput(actual: string, expected: string): boolean {
  const normalizeOutput = (str: string) =>
    str
      .trim()
      .replace(/\r\n/g, '\n')
      .replace(/\s+$/gm, '');

  return normalizeOutput(actual) === normalizeOutput(expected);
}

/**
 * Run code against test cases
 */
export async function evaluateSubmission(
  code: string,
  language: string,
  testCases: Array<{ input: string; expectedOutput: string; weight?: number }>
): Promise<{ passed: boolean; score: number; results: any[] }> {
  try {
    const results = await Promise.all(
      testCases.map(async (testCase) => {
        const result = await runCodeWithJDoodle(code, language, testCase.input);
        const passed = validateOutput(result.stdout, testCase.expectedOutput);

        return {
          input: testCase.input,
          expectedOutput: testCase.expectedOutput,
          actualOutput: result.stdout,
          passed,
          error: result.error || result.stderr,
          weight: testCase.weight || 1,
        };
      })
    );

    const totalWeight = results.reduce((sum, r) => sum + r.weight, 0);
    const passedWeight = results.filter((r) => r.passed).reduce((sum, r) => sum + r.weight, 0);
    const score = Math.round((passedWeight / totalWeight) * 100);
    const passed = score === 100;

    return { passed, score, results };
  } catch (error) {
    logger.error('Evaluation failed', error);
    throw new Error('Failed to evaluate submission');
  }
}
