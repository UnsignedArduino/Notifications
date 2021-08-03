namespace SpriteKind {
    export const Notification = SpriteKind.create();
}

//% color="#0000cc" icon="\uf075"
namespace Notification {
    let notification: Sprite = null;
    /**
     * Display some text with an optional icon at the top of the screen. 
     * @param rawText: A string of text to display.
     * @param speed: The speed multiplier for how fast the notification shows.
     * @param icon: A 8x8 image as the icon. If the dimensions do not fit, no icon will be displayed.
     */
    //% block="Notify with text $rawText || at speed $speed | with icon $icon"
    //% rawText.defl="Notification!"
    //% speed.defl=1
    //% icon.shadow=screen_image_picker
    //% expandableArgumentMode="enabeled"
    //% weight=100
    export function notify(rawText: string, speed?: number, icon?: Image) {
        // Replace newlines with spaces
        const text = console.inspect(rawText).split("\n").join(" ");
        let font = image.getFontForText(text);
        let padding = 4;
        let holdTime = 1000; // ms
        let textTime = ((text.length * font.charWidth) / 40) * 1000;
        let textOffset = 0;
        let textTimeMultiplier = 1;
        if (speed) {
            textTimeMultiplier = speed;
        }
        let imageWidth = 156;
        let textLength = Math.max(text.length * font.charWidth, 24 * font.charWidth);
        let imageHeight = font.charHeight + padding;
        let bubble = image.create(imageWidth, imageHeight);
        let hasIcon = false;
        if (icon && icon.width == 8 && icon.height == 8) {
            hasIcon = true;
        }
        notification = sprites.create(img`
            .
        `, SpriteKind.Notification);
        notification.setFlag(SpriteFlag.Ghost, true);
        notification.setFlag(SpriteFlag.RelativeToCamera, true);
        function clearBubble() {
            bubble.fill(1);
        }
        function printToBubble(str: string, x: number) {
            if (hasIcon) {
                bubble.print(str, x+10, 2, 15, font);
            } else {
                bubble.print(str, x, 2, 15, font);
            }
        }
        function padBubble() {
            // Left padding
            if (hasIcon) {
                bubble.fillRect(0, 0, padding+10, imageHeight, 1);
                spriteutils.drawTransparentImage(icon, bubble, padding-1, 2);
            } else {
                bubble.fillRect(0, 0, padding, imageHeight, 1);
            }
            // Right side padding
            bubble.fillRect(imageWidth - padding, 0, padding, font.charHeight + padding, 1);
        }
        function roundBubbleEdges() {
            bubble.setPixel(0, 0, 0);
            bubble.setPixel(imageWidth - 1, 0, 0);
            bubble.setPixel(0, font.charHeight + padding - 1, 0);
            bubble.setPixel(imageWidth - 1, font.charHeight + padding - 1, 0);
        }
        clearBubble();
        printToBubble(text, padding);
        padBubble();
        roundBubbleEdges();
        notification.setImage(bubble);
        notification.left = 2;
        notification.bottom = -2;
        notification.z = 100000000000;
        while (notification.top < 2) {
            notification.top += 1;
            pause(50);
        }
        let totalLength;
        pause(holdTime / textTimeMultiplier);
        for (let i = 0; i < Math.abs(text.length * font.charWidth); i++) {
            totalLength = Math.abs(text.length * font.charWidth) + (padding * 2) + textOffset;
            if (hasIcon) {
                totalLength += 10;
            }
            if (text.length > 24 && totalLength > imageWidth) {
                clearBubble();
                printToBubble(text, padding + textOffset);
                padBubble();
                roundBubbleEdges();
                textOffset -= 1;
            }
            pause(textTime / Math.abs(text.length * font.charWidth) / textTimeMultiplier);
        }
        pause(holdTime / textTimeMultiplier);
        notification.top = 2;
        while (notification.bottom > -2) {
            notification.bottom -= 1;
            pause(50);
        }
        notification.destroy();
    }

    /**
     * Returns whether we are displaying a notification or not. 
     */
    //% block="Showing notification"
    //% weight=70
    export function isNotifying(): boolean {
        return !(spriteutils.isDestroyed(notification));
    }

    /**
     * Blocks until no notifications are displaying; returns immediately if no notification is displaying.
     */
    //% block="Wait for notification to finish"
    //% weight=80
    export function waitForNotificationFinish() {
        while (Notification.isNotifying()) {
            pause(0);
        }
    }

    /**
     * Cancels the current notification. 
     * (Technically, the last notification cause we only keep a pointer to the last one)
     */
    //% block="Cancel the current notification"
    //% weight=90
    export function cancelNotification() {
        if (!isNotifying()) {
            return;
        }
        while (notification.bottom > -2) {
            notification.bottom -= 1;
            pause(50);
        }
        notification.destroy();
    }
}
