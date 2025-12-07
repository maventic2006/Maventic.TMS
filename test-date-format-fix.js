/**
 * Test script to verify the date formatting fix for MySQL DATE fields
 */

// Test the formatDateForMySQL function
const formatDateForMySQL = (isoDateString) => {
  if (!isoDateString || isoDateString === "") return null;
  
  try {
    const date = new Date(isoDateString);
    if (isNaN(date.getTime())) {
      console.warn(`[Test] Invalid date string: ${isoDateString}`);
      return null;
    }

    // Convert to MySQL date format (YYYY-MM-DD)
    // Use UTC to maintain consistency
    const year = date.getUTCFullYear();
    const month = String(date.getUTCMonth() + 1).padStart(2, "0");
    const day = String(date.getUTCDate()).padStart(2, "0");

    const result = `${year}-${month}-${day}`;
    console.log(`[Test] Date converted: ${isoDateString} â†’ ${result}`);
    return result;
  } catch (error) {
    console.warn(`[Test] Error formatting date ${isoDateString}:`, error.message);
    return null;
  }
};

// Test cases - including the problematic date from the error
const testDates = [
  "2025-09-21T18:30:00.000Z", // The problematic date from error
  "2024-12-07T10:30:00.000Z",
  "2025-01-01",
  "2024-06-15T14:20:30.123Z",
  null,
  "",
  "invalid-date",
];

console.log("í·ª Testing Date Format Fix for MySQL DATE Fields");
console.log("=" .repeat(60));

testDates.forEach(date => {
  console.log(`\nInput:  ${date}`);
  console.log(`Output: ${formatDateForMySQL(date)}`);
  console.log("-".repeat(40));
});

console.log("\nâœ… Date formatting test complete!");
