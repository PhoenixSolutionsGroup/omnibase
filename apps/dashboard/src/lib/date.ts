export const formatTimestamp = (timestamp: string) => {
	try {
		return new Date(timestamp).toLocaleString("en-AU", {
			year: "numeric",
			month: "short",
			day: "numeric",
			hour: "2-digit",
			minute: "2-digit",
			second: "2-digit",
			hour12: false,
		});
	} catch {
		return timestamp;
	}
};
