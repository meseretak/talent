const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Define paths
const projectRoot = process.cwd();
const prismaClientDir = path.join(projectRoot, 'node_modules', '@prisma', 'client');
const generatedDir = path.join(projectRoot, 'src', 'generated', 'prisma');
const buildGeneratedDir = path.join(projectRoot, 'build', 'src', 'generated');

// Create directories if they don't exist
console.log('Creating necessary directories...');
if (!fs.existsSync(generatedDir)) {
  fs.mkdirSync(generatedDir, { recursive: true });
}

if (!fs.existsSync(buildGeneratedDir)) {
  fs.mkdirSync(buildGeneratedDir, { recursive: true });
}

// Clean installation
console.log('Cleaning node_modules/@prisma...');
try {
  if (fs.existsSync(path.join(projectRoot, 'node_modules', '@prisma'))) {
    fs.rmSync(path.join(projectRoot, 'node_modules', '@prisma'), { recursive: true, force: true });
  }
  console.log('Successfully cleaned @prisma directory');
} catch (err) {
  console.error('Error cleaning @prisma directory:', err);
}

// Reinstall dependencies
console.log('Reinstalling dependencies...');
try {
  execSync('yarn install --force', { stdio: 'inherit' });
  console.log('Successfully reinstalled dependencies');
} catch (err) {
  console.error('Error reinstalling dependencies:', err);
  process.exit(1);
}

// Generate Prisma client
console.log('Generating Prisma client...');
try {
  execSync('npx prisma generate --schema=./prisma/schema', { stdio: 'inherit' });
  console.log('Successfully generated Prisma client');
} catch (err) {
  console.error('Error generating Prisma client:', err);
  process.exit(1);
}

// Ensure the client is copied to the build directory
console.log('Copying Prisma client to build directory...');
try {
  if (!fs.existsSync(buildGeneratedDir)) {
    fs.mkdirSync(buildGeneratedDir, { recursive: true });
  }

  if (fs.existsSync(generatedDir)) {
    fs.cpSync(generatedDir, path.join(buildGeneratedDir, 'prisma'), { recursive: true });
    console.log('Successfully copied Prisma client to build directory');
  } else {
    console.error('Generated Prisma directory does not exist');
  }
} catch (err) {
  console.error('Error copying Prisma client to build directory:', err);
}

console.log('Prisma fix completed!');
