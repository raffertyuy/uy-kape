#!/usr/bin/env node

/**
 * Test Structure Verification Script
 * Validates that the new test structure is working correctly
 */

import { exec } from "child_process";
import { promisify } from "util";
import path from "path";
import fs from "fs";

const execAsync = promisify(exec);

interface TestResult {
  name: string;
  passed: boolean;
  message: string;
  details?: string;
}

class TestValidator {
  private results: TestResult[] = [];

  async validate(): Promise<void> {
    console.log("🧪 Validating test structure...\n");

    await this.checkFileStructure();
    await this.checkTestConfiguration();
    await this.checkSharedUtilities();
    await this.runSampleTests();

    this.printResults();
  }

  private async checkFileStructure(): Promise<void> {
    console.log("📁 Checking file structure...");

    // Check test directories exist
    const requiredDirs = [
      "tests/config",
      "tests/e2e/admin",
      "tests/e2e/guest",
      "tests/e2e/system",
      "tests/outputs",
    ];

    for (const dir of requiredDirs) {
      const exists = fs.existsSync(dir);
      this.addResult(
        `Directory: ${dir}`,
        exists,
        exists ? "Directory exists" : "Directory missing",
      );
    }

    // Check config files exist
    const configFiles = [
      "tests/config/vitest.config.ts",
      "tests/config/vitest.config.ci.ts",
      "tests/config/test-utils.tsx",
      "tests/config/fixtures.ts",
      "tests/config/mocks.ts",
      "tests/config/fileMock.js",
    ];

    for (const file of configFiles) {
      const exists = fs.existsSync(file);
      this.addResult(
        `Config file: ${path.basename(file)}`,
        exists,
        exists ? "File exists" : "File missing",
      );
    }

    // Check co-located test structure
    const sampleColocatedTests = [
      "src/components/__tests__",
      "src/hooks/__tests__",
      "src/utils/__tests__",
    ];

    for (const dir of sampleColocatedTests) {
      const exists = fs.existsSync(dir);
      this.addResult(
        `Co-located tests: ${dir}`,
        exists,
        exists ? "Tests co-located properly" : "Co-located tests missing",
      );
    }
  }

  private async checkTestConfiguration(): Promise<void> {
    console.log("⚙️  Checking test configuration...");

    try {
      // Check if vitest config loads
      const { stdout, stderr } = await execAsync("npx vitest --version");
      this.addResult(
        "Vitest installation",
        !stderr && stdout.includes("vitest"),
        stdout.trim() || "Vitest not found",
      );
    } catch (error) {
      this.addResult(
        "Vitest installation",
        false,
        `Error: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }

    // Check package.json scripts
    try {
      const packageJson = JSON.parse(fs.readFileSync("package.json", "utf8"));
      const scripts = packageJson.scripts || {};

      const requiredScripts = [
        "test",
        "test:run",
        "test:ci",
        "test:ci-no-coverage",
      ];

      for (const script of requiredScripts) {
        const exists = scripts[script] !== undefined;
        this.addResult(
          `NPM script: ${script}`,
          exists,
          exists ? "Script configured" : "Script missing",
        );
      }
    } catch (error) {
      this.addResult(
        "Package.json scripts",
        false,
        `Error reading package.json: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      );
    }
  }

  private async checkSharedUtilities(): Promise<void> {
    console.log("🔧 Checking shared utilities...");

    try {
      // Check test-utils exports
      const testUtilsPath = "tests/config/test-utils.tsx";
      const content = fs.readFileSync(testUtilsPath, "utf8");

      const expectedExports = [
        "customRender as render",
        "actAsync",
        "actSync",
        "createUserEvent",
        "clickButton",
      ];

      for (const exportItem of expectedExports) {
        const exists = content.includes(exportItem);
        this.addResult(
          `Test util export: ${exportItem}`,
          exists,
          exists ? "Export available" : "Export missing",
        );
      }
    } catch (error) {
      this.addResult(
        "Test utilities check",
        false,
        `Error: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }

    try {
      // Check fixtures exports
      const fixturesPath = "tests/config/fixtures.ts";
      const content = fs.readFileSync(fixturesPath, "utf8");

      const expectedFixtures = [
        "mockDrinks",
        "mockOrders",
        "createMockDrink",
        "createMockOrder",
      ];

      for (const fixture of expectedFixtures) {
        const exists = content.includes(`export const ${fixture}`) ||
          content.includes(`export { ${fixture}`);
        this.addResult(
          `Fixture: ${fixture}`,
          exists,
          exists ? "Fixture available" : "Fixture missing",
        );
      }
    } catch (error) {
      this.addResult(
        "Fixtures check",
        false,
        `Error: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }

  private async runSampleTests(): Promise<void> {
    console.log("🎯 Running sample tests...");

    const sampleTests = [
      "src/components/__tests__/Layout.test.tsx",
      "src/hooks/__tests__/useGuestInfo.test.ts",
      "src/utils/__tests__/globalErrorHandler.test.ts",
    ];

    for (const testFile of sampleTests) {
      if (fs.existsSync(testFile)) {
        try {
          const { stdout, stderr } = await execAsync(
            `npm run test:run -- ${testFile}`,
            { timeout: 30000 },
          );

          const passed = !stderr && stdout.includes("passed");
          this.addResult(
            `Sample test: ${path.basename(testFile)}`,
            passed,
            passed ? "Test passes" : "Test failed",
            stderr || stdout.slice(-200),
          );
        } catch (error) {
          this.addResult(
            `Sample test: ${path.basename(testFile)}`,
            false,
            `Error running test: ${
              error instanceof Error ? error.message : "Unknown error"
            }`,
          );
        }
      } else {
        this.addResult(
          `Sample test: ${path.basename(testFile)}`,
          false,
          "Test file not found",
        );
      }
    }
  }

  private addResult(
    name: string,
    passed: boolean,
    message: string,
    details?: string,
  ): void {
    this.results.push({ name, passed, message, details });
    const icon = passed ? "✅" : "❌";
    console.log(`  ${icon} ${name}: ${message}`);
    if (details && !passed) {
      console.log(`     Details: ${details.slice(0, 100)}...`);
    }
  }

  private printResults(): void {
    const passed = this.results.filter((r) => r.passed).length;
    const total = this.results.length;
    const success = passed === total;

    console.log(`\n${"=".repeat(60)}`);
    console.log(`📊 Test Structure Validation Results`);
    console.log("=".repeat(60));
    console.log(
      `Passed: ${passed}/${total} (${Math.round(passed / total * 100)}%)`,
    );

    if (success) {
      console.log("\n🎉 Test structure validation PASSED!");
      console.log("✨ Your test structure is properly configured and working.");
    } else {
      console.log("\n💥 Test structure validation FAILED!");
      console.log("❗ Please fix the issues above before proceeding.");

      const failed = this.results.filter((r) => !r.passed);
      console.log("\nFailed checks:");
      failed.forEach((result) => {
        console.log(`  • ${result.name}: ${result.message}`);
      });
    }

    console.log("\n📚 For more information, see: docs/testing.md");
    process.exit(success ? 0 : 1);
  }
}

// Run validation if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const validator = new TestValidator();
  validator.validate().catch((error) => {
    console.error("💥 Validation failed with error:", error);
    process.exit(1);
  });
}

export { TestValidator };
