#!/usr/bin/env node

import { $ } from 'execa';

async function main() {
  const { stdout: status } = await $`git status --porcelain`;
  if (status) {
    console.error(`❗️ Working directory is not clean:\n${status}`);
    return;
  }

  const { stdout: nextVersion } = await $`auto shipit --dry-run --quiet`;

  console.info(`📌 Temporarily bumping version to '${nextVersion}' for build step`);
  await $`npm --no-git-tag-version version ${nextVersion}`;

  console.info('📦 Building with new version');
  await $({
    stdio: 'inherit',
    env: {
      ...process.env,
      SENTRY_RELEASE: nextVersion,
    },
  })`yarn build`;

  console.info('🧹 Resetting changes to let `auto` do its thing');
  await $`git reset --hard`;

  console.info('🌐 Sending sourcemaps to Sentry');
  await $`sentry-cli sourcemaps inject dist`;
  await $`sentry-cli sourcemaps upload dist`;
  await $`sentry-cli sourcemaps inject action`;
  await $`sentry-cli sourcemaps upload action`;

  console.info('🚀 Creating new release in Sentry');
  await $`sentry-cli releases new -p cli ${nextVersion}`;

  console.info('🔗 Associating commits with release');
  await $`sentry-cli releases set-commits --auto ${nextVersion}`;

  console.info('🧹 Removing sourcemaps from build');
  await $`yarn clean:sourcemaps`;

  console.info('✅ Build with new version completed, ready for auto!');
}

main();
