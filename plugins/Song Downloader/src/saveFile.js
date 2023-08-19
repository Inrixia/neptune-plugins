export const saveFile = (blob, fileName) => {
	// Create a new Object URL for the Blob
	const objectUrl = URL.createObjectURL(blob);

	// Create a link element
	const a = document.createElement("a");

	// Set the download attribute on the link element
	a.href = objectUrl;
	a.download = fileName;

	// Trigger the download by simulating a click on the link
	a.click();

	// Clean up: revoke the Object URL after the link is clicked
	URL.revokeObjectURL(objectUrl);
};
