export const Text = {
    Download(text, fname) {
        const blob = new Blob([text], { type: 'text/plain' });
        if (window.saveAs) {
            window.saveAs(blob, fname);
        } else if (navigator.saveBlob) {
            navigator.saveBlob(blob, fname);
        } else {
            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.setAttribute("href",url);
            link.setAttribute("download",fname);
            const event = document.createEvent('MouseEvents');
            event.initMouseEvent('click', true, true, window, 1, 0, 0, 0, 0, false, false, false, false, 0, null);
            link.dispatchEvent(event);
        }
    },

    async LoadFile(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = function(evt) {
                resolve(evt.target.result)
            }
            reader.onerror = function(err) {
                reject(err)
            }
            reader.readAsText(file);
        })
    }
}