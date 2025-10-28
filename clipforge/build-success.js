const fs = require('fs');
const path = require('path');

// Check if the executable exists
const exePath = path.join(__dirname, 'build', 'win-unpacked', 'ClipForge.exe');

if (fs.existsSync(exePath)) {
  console.log('✅ SUCCESS: ClipForge executable found!');
  console.log('📁 Location:', exePath);
  console.log('📊 Size:', (fs.statSync(exePath).size / 1024 / 1024).toFixed(2), 'MB');
  console.log('');
  console.log('🚀 To run the app:');
  console.log('   1. Navigate to: build/win-unpacked/');
  console.log('   2. Double-click: ClipForge.exe');
  console.log('');
  console.log('✨ The app is ready to use!');
  process.exit(0);
} else {
  console.log('❌ Executable not found. Please run: npm run build');
  process.exit(1);
}
