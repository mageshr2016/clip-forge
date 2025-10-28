const { build } = require('electron-builder');
const path = require('path');

const config = {
  appId: 'com.clipforge.app',
  productName: 'ClipForge',
  directories: {
    output: 'build'
  },
  files: [
    'out/**/*',
    'resources/**/*'
  ],
  win: {
    target: 'dir', // Use directory target to avoid installer issues
    icon: 'resources/icon.png'
  },
  mac: {
    target: 'dir',
    icon: 'resources/icon.png',
    category: 'public.app-category.video'
  },
  linux: {
    target: 'dir',
    icon: 'resources/icon.png',
    category: 'AudioVideo'
  }
};

build({
  config,
  win: ['dir']
}).then(() => {
  console.log('✅ Build completed successfully!');
  console.log('📁 Executable location: build/win-unpacked/ClipForge.exe');
}).catch((error) => {
  console.error('❌ Build failed:', error);
  process.exit(1);
});
