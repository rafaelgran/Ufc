// Test script for drag and drop functionality
const puppeteer = require('puppeteer');

async function testDragAndDrop() {
    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();
    
    try {
        // Navigate to the admin page
        await page.goto('http://localhost:3000');
        console.log('✅ Page loaded successfully');
        
        // Wait for the page to load
        await page.waitForSelector('#events-tab');
        console.log('✅ Events tab found');
        
        // Click on an event to go to event details
        await page.waitForSelector('.event-card');
        const eventCards = await page.$$('.event-card');
        
        if (eventCards.length > 0) {
            await eventCards[0].click();
            console.log('✅ Event clicked');
            
            // Wait for event details to load
            await page.waitForSelector('#mainCardFightsList', { timeout: 5000 });
            console.log('✅ Event details loaded');
            
            // Check if there are fight items
            const fightItems = await page.$$('#mainCardFightsList .fight-item');
            console.log(`✅ Found ${fightItems.length} fight items in main card`);
            
            if (fightItems.length > 1) {
                // Test drag and drop
                const firstFight = fightItems[0];
                const secondFight = fightItems[1];
                
                // Get the bounding boxes
                const firstBox = await firstFight.boundingBox();
                const secondBox = await secondFight.boundingBox();
                
                // Perform drag and drop
                await page.mouse.move(firstBox.x + firstBox.width / 2, firstBox.y + firstBox.height / 2);
                await page.mouse.down();
                await page.mouse.move(secondBox.x + secondBox.width / 2, secondBox.y + secondBox.height / 2);
                await page.mouse.up();
                
                console.log('✅ Drag and drop performed');
                
                // Wait a bit to see if the order changes
                await page.waitForTimeout(2000);
                
                // Check console logs for any errors
                const logs = await page.evaluate(() => {
                    return window.console.logs || [];
                });
                
                console.log('Console logs:', logs);
                
            } else {
                console.log('⚠️ Not enough fight items to test drag and drop');
            }
        } else {
            console.log('⚠️ No event cards found');
        }
        
    } catch (error) {
        console.error('❌ Test failed:', error);
    } finally {
        await browser.close();
    }
}

// Run the test
testDragAndDrop(); 