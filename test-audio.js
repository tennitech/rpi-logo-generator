const puppeteer = require('puppeteer');
(async () => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    page.on('console', msg => console.log('BROWSER LOG:', msg.text()));
    await page.goto('http://localhost:3000/?style=waveform');
    
    // Evaluate in page
    await page.evaluate(async () => {
        const waitFor = ms => new Promise(r => setTimeout(r, ms));
        
        // enable audio
        const audioTgl = document.getElementById('waveform-audio-toggle');
        audioTgl.click();
        
        await waitFor(500);
        
        // pause via spacebar
        console.log("Pressing SPACE to PAUSE");
        document.dispatchEvent(new KeyboardEvent('keydown', {code: 'Space'}));
        document.dispatchEvent(new KeyboardEvent('keyup',   {code: 'Space'}));
        
        await waitFor(2000); // Wait 2s
        
        // play via spacebar
        console.log("Pressing SPACE to PLAY");
        document.dispatchEvent(new KeyboardEvent('keydown', {code: 'Space'}));
        document.dispatchEvent(new KeyboardEvent('keyup',   {code: 'Space'}));
        
        // Monitor state for 3 seconds
        for(let i=0; i<30; i++) {
           console.log("State:", window.audioContext?.state, " Oscillators connected:", window.isAudioPlaying);
           await waitFor(100);
        }
    });
    
    await browser.close();
})();
