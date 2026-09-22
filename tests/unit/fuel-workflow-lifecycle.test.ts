import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const workflowPaths = [
  '.github/workflows/update-fuel-prices.yml',
  '.github/workflows/update-fuel-prices-germany.yml',
] as const;

describe('rolling fuel-data branch lifecycle', () => {
  for (const path of workflowPaths) {
    const source = readFileSync(path, 'utf8');

    it(`${path} recreates the publication branch from the current default branch`, () => {
      expect(source).toContain('git switch --force-create "$FUEL_BRANCH" "origin/$BASE_BRANCH"');
      expect(source).toContain('+refs/heads/$BASE_BRANCH:refs/remotes/origin/$BASE_BRANCH');
      expect(source).not.toMatch(/\bgit rebase\b/);
    });

    it(`${path} pins destructive branch replacement to the observed remote SHA`, () => {
      expect(source).toContain('git ls-remote --heads origin "refs/heads/$FUEL_BRANCH"');
      expect(source).toContain('EXPECTED_REMOTE_SHA: ${{ steps.fuel-branch.outputs.remote_sha }}');
      expect(source).toContain('--force-with-lease="refs/heads/$FUEL_BRANCH:$EXPECTED_REMOTE_SHA"');
      expect(source).not.toMatch(/git push\s+--force(?:\s|$)/);
    });

    it(`${path} serializes writers and reuses an open rolling PR`, () => {
      expect(source).toContain('group: ${{ github.repository }}-fuel-data-rolling-pr');
      expect(source).toContain('cancel-in-progress: false');
      expect(source).toContain("--state open --json number --jq '.[0].number // empty'");
      expect(source).toContain('if [ -z "$pr_number" ]; then');
    });

    it(`${path} does not create empty fuel commits`, () => {
      expect(source).toContain('git diff --quiet -- src/data/fuel-prices.json src/data/fuel-price-history.json');
      expect(source).toContain('No price change — nothing to commit.');
    });
  }
});
