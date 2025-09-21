/**
 * Comprehensive Test Runner for Kerala Map Standalone
 * This script runs all test suites and generates a comprehensive report
 */

import { execSync } from 'child_process';
import { writeFileSync } from 'fs';

interface TestResult {
  suite: string;
  passed: number;
  failed: number;
  total: number;
  duration: number;
  coverage?: number;
}

interface TestReport {
  timestamp: string;
  totalTests: number;
  totalPassed: number;
  totalFailed: number;
  overallDuration: number;
  suites: TestResult[];
  recommendations: string[];
}

class TestRunner {
  private results: TestResult[] = [];
  private startTime: number = 0;

  async runAllTests(): Promise<TestReport> {
    console.log('🚀 Starting comprehensive test suite for Kerala Map Standalone...\n');
    this.startTime = Date.now();

    // Run individual test suites
    await this.runTestSuite('Authentication Tests', 'src/tests/authentication.test.tsx');
    await this.runTestSuite('Map Interactions Tests', 'src/tests/mapInteractions.test.tsx');
    await this.runTestSuite('Data Loading Tests', 'src/tests/dataLoading.test.tsx');
    await this.runTestSuite('Mobile Basic Tests', 'src/tests/mobileBasic.test.tsx');
    await this.runTestSuite('Mobile Responsiveness Tests', 'src/tests/mobileResponsiveness.test.tsx');
    await this.runTestSuite('PDF Export Tests', 'src/tests/pdfExport.test.tsx');
    await this.runTestSuite('Map PDF Integration Tests', 'src/tests/mapPdfIntegration.test.tsx');

    // Generate comprehensive report
    const report = this.generateReport();
    this.saveReport(report);
    this.printSummary(report);

    return report;
  }

  private async runTestSuite(suiteName: string, testFile: string): Promise<void> {
    console.log(`📋 Running ${suiteName}...`);
    
    try {
      const startTime = Date.now();
      const output = execSync(`npm run test:run ${testFile}`, { 
        encoding: 'utf-8',
        cwd: process.cwd()
      });
      const duration = Date.now() - startTime;

      // Parse test results from output
      const result = this.parseTestOutput(output, suiteName, duration);
      this.results.push(result);

      console.log(`✅ ${suiteName}: ${result.passed}/${result.total} passed (${duration}ms)\n`);
    } catch (error: any) {
      console.log(`❌ ${suiteName}: Failed to run tests`);
      console.log(`Error: ${error.message}\n`);
      
      this.results.push({
        suite: suiteName,
        passed: 0,
        failed: 1,
        total: 1,
        duration: 0
      });
    }
  }

  private parseTestOutput(output: string, suiteName: string, duration: number): TestResult {
    // Parse vitest output to extract test results
    const lines = output.split('\n');
    let passed = 0;
    let failed = 0;
    let total = 0;

    for (const line of lines) {
      if (line.includes('✓') || line.includes('PASS')) {
        passed++;
      } else if (line.includes('✗') || line.includes('FAIL')) {
        failed++;
      }
    }

    total = passed + failed;

    // If no specific results found, try to parse summary
    const summaryMatch = output.match(/(\d+) passed.*?(\d+) failed/);
    if (summaryMatch) {
      passed = parseInt(summaryMatch[1]);
      failed = parseInt(summaryMatch[2]);
      total = passed + failed;
    }

    // If still no results, assume single test
    if (total === 0) {
      if (output.includes('PASS') || output.includes('✓')) {
        passed = 1;
        total = 1;
      } else {
        failed = 1;
        total = 1;
      }
    }

    return {
      suite: suiteName,
      passed,
      failed,
      total,
      duration
    };
  }

  private generateReport(): TestReport {
    const totalTests = this.results.reduce((sum, result) => sum + result.total, 0);
    const totalPassed = this.results.reduce((sum, result) => sum + result.passed, 0);
    const totalFailed = this.results.reduce((sum, result) => sum + result.failed, 0);
    const overallDuration = Date.now() - this.startTime;

    const recommendations = this.generateRecommendations();

    return {
      timestamp: new Date().toISOString(),
      totalTests,
      totalPassed,
      totalFailed,
      overallDuration,
      suites: this.results,
      recommendations
    };
  }

  private generateRecommendations(): string[] {
    const recommendations: string[] = [];
    const failedSuites = this.results.filter(result => result.failed > 0);

    if (failedSuites.length > 0) {
      recommendations.push('🔧 Fix failing tests before deployment');
      failedSuites.forEach(suite => {
        recommendations.push(`   - ${suite.suite}: ${suite.failed} failed tests`);
      });
    }

    const slowSuites = this.results.filter(result => result.duration > 5000);
    if (slowSuites.length > 0) {
      recommendations.push('⚡ Optimize slow test suites');
      slowSuites.forEach(suite => {
        recommendations.push(`   - ${suite.suite}: ${suite.duration}ms (consider mocking external dependencies)`);
      });
    }

    const passRate = (this.results.reduce((sum, result) => sum + result.passed, 0) / 
                     this.results.reduce((sum, result) => sum + result.total, 0)) * 100;

    if (passRate < 95) {
      recommendations.push('📈 Improve test coverage and reliability');
      recommendations.push(`   - Current pass rate: ${passRate.toFixed(1)}% (target: 95%+)`);
    }

    if (recommendations.length === 0) {
      recommendations.push('🎉 All tests passing! Ready for deployment');
      recommendations.push('💡 Consider adding more edge case tests');
      recommendations.push('🔍 Run mobile device testing procedures');
    }

    return recommendations;
  }

  private saveReport(report: TestReport): void {
    const reportJson = JSON.stringify(report, null, 2);
    const reportMd = this.generateMarkdownReport(report);

    writeFileSync('test-report.json', reportJson);
    writeFileSync('test-report.md', reportMd);

    console.log('📄 Test reports saved:');
    console.log('   - test-report.json (machine-readable)');
    console.log('   - test-report.md (human-readable)\n');
  }

  private generateMarkdownReport(report: TestReport): string {
    const passRate = (report.totalPassed / report.totalTests * 100).toFixed(1);
    
    return `# Kerala Map Standalone - Test Report

**Generated:** ${new Date(report.timestamp).toLocaleString()}  
**Duration:** ${(report.overallDuration / 1000).toFixed(2)}s  
**Pass Rate:** ${passRate}%

## Summary

- **Total Tests:** ${report.totalTests}
- **Passed:** ${report.totalPassed} ✅
- **Failed:** ${report.totalFailed} ${report.totalFailed > 0 ? '❌' : ''}

## Test Suites

| Suite | Passed | Failed | Total | Duration | Status |
|-------|--------|--------|-------|----------|--------|
${report.suites.map(suite => {
  const status = suite.failed === 0 ? '✅ PASS' : '❌ FAIL';
  return `| ${suite.suite} | ${suite.passed} | ${suite.failed} | ${suite.total} | ${suite.duration}ms | ${status} |`;
}).join('\n')}

## Recommendations

${report.recommendations.map(rec => `- ${rec}`).join('\n')}

## Next Steps

${report.totalFailed === 0 ? `
### ✅ All Tests Passing
1. Run mobile device testing procedures
2. Perform manual testing on target devices
3. Deploy to staging environment
4. Conduct user acceptance testing
` : `
### ❌ Tests Failing
1. Fix failing tests before proceeding
2. Re-run test suite to verify fixes
3. Review test coverage for gaps
4. Consider adding integration tests
`}

## Mobile Testing

After all automated tests pass, follow the mobile testing procedures:

1. **Device Testing:** Test on physical iOS and Android devices
2. **Browser Testing:** Verify compatibility across mobile browsers
3. **Performance Testing:** Check load times and responsiveness
4. **Accessibility Testing:** Verify screen reader compatibility
5. **PWA Testing:** Test installation and offline functionality

## Coverage Analysis

Run \`npm run test:coverage\` to generate detailed coverage reports.

Target coverage metrics:
- **Statements:** 80%+
- **Branches:** 75%+
- **Functions:** 80%+
- **Lines:** 80%+
`;
  }

  private printSummary(report: TestReport): void {
    const passRate = (report.totalPassed / report.totalTests * 100).toFixed(1);
    
    console.log('📊 TEST SUMMARY');
    console.log('================');
    console.log(`Total Tests: ${report.totalTests}`);
    console.log(`Passed: ${report.totalPassed} ✅`);
    console.log(`Failed: ${report.totalFailed} ${report.totalFailed > 0 ? '❌' : ''}`);
    console.log(`Pass Rate: ${passRate}%`);
    console.log(`Duration: ${(report.overallDuration / 1000).toFixed(2)}s`);
    console.log('');
    
    if (report.totalFailed === 0) {
      console.log('🎉 All tests passed! Ready for mobile device testing.');
    } else {
      console.log('⚠️  Some tests failed. Please fix before proceeding.');
    }
    
    console.log('\n📋 RECOMMENDATIONS:');
    report.recommendations.forEach(rec => console.log(`   ${rec}`));
  }
}

// Export for use in other scripts
export { TestRunner };

// Run if called directly
if (require.main === module) {
  const runner = new TestRunner();
  runner.runAllTests().catch(console.error);
}