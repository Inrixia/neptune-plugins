import confetti from "canvas-confetti";
confetti();

document.addEventListener("drop", (event) => {
	// event.preventDefault();
	// event.stopPropagation();
	for (const file of event.dataTransfer?.files ?? []) {
		// Using the path attribute to get absolute file path
		console.log(file);
	}
});
