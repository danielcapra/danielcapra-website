function copyMailToClipboard() {

    const copyText = "hi@danielcapra.com";

    const type = "text/plain";
    const blob = new Blob([copyText], { type });
    const data = [new ClipboardItem({ [type]: blob })];

    navigator.clipboard.write(data).then(
        () => {
            /* success */
            // Alert the copied text
            alert(copyText + " copied to clipboard!");
        },
        () => {
            /* failure */
            alert("Tried to copy " + copyText + " to clipboard but failed. Try again or select and copy manually!")
        },
    );
}