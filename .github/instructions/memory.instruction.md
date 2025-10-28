---
applyTo: "**"
---

# Memory Instructions for TMS-Dev-2 AI Agents

## User Behavior Preferences

### Preferred AI Mode and Model

- **Always use `beastMode_lates` chatmode** for all development tasks and problem-solving
- **Preferred AI Model**: Claude Sonnet 4.5 for all types of responses and interactions
- User expects autonomous, complete problem resolution without yielding control back
- User prefers agents that work through entire todo lists before returning control

### Communication Style Preferences

- **Tone**: Casual, friendly yet professional communication
- **Action Communication**: Always announce actions before tool calls ("Let me fetch the URL...", "Now I will search...")
- **Progress Updates**: Show updated todo lists after each completed step
- **No Code Display**: Avoid displaying code blocks unless specifically requested
- **Structured Responses**: Use bullet points and clear formatting

### Development Workflow Preferences

- **Research-First Approach**: Always verify external dependencies via web research before implementation
- **Incremental Development**: Make small, testable changes with frequent validation
- **Root Cause Analysis**: Debug thoroughly to identify underlying issues, not symptoms
- **Comprehensive Testing**: Test rigorously for edge cases and boundary conditions

## VS Code Behavior Preferences

### File Management

- Always use absolute file paths for tool operations
- Read large code sections (2000+ lines) for better context understanding
- Use `grep_search` for file overviews instead of multiple small reads
- Handle URI schemes (untitled:, vscode-userdata:) appropriately

### Environment Management

- Proactively create `.env` files with placeholders when API keys or secrets are detected
- Never auto-commit changes without explicit user permission
- Use `git status` and `git log` for repository state awareness

### Error Handling

- Use `get_errors` tool to identify code problems immediately
- Implement defensive programming with comprehensive error checking
- Add descriptive logging and print statements during debugging

## System Behavior Preferences

### Web Research Methodology

- Use Google search via `https://www.google.com/search?q=query` for up-to-date information
- Recursively fetch relevant links found in search results
- Gather comprehensive information before implementing solutions
- Never rely solely on training data - always verify with current web research

### Todo List Management

- Always use markdown checkbox format wrapped in code blocks
- Display updated todo lists after each completed step
- Never end turn without completing all todo list items
- Use emojis to indicate status when appropriate

### Memory Updates

- Update this memory file when user provides new preferences or behavior patterns
- Store project-specific user requirements and workflow preferences
- Remember user's technology stack preferences and coding style choices

## Agent Autonomy Guidelines

### Problem-Solving Approach

1. Always fetch provided URLs using `fetch_webpage` tool
2. Understand problems deeply with sequential thinking
3. Investigate codebase thoroughly before making changes
4. Research internet for up-to-date information on dependencies
5. Develop step-by-step plans with detailed todo lists
6. Implement incrementally with frequent testing
7. Debug with root cause analysis
8. Validate comprehensively with additional tests

### Quality Standards

- **Complete Autonomy**: Solve problems completely before returning control
- **No Assumptions**: Gather context first, then perform tasks
- **Rigorous Testing**: Create additional tests beyond basic requirements
- **Context Awareness**: Always read substantial code sections for complete understanding

## Technology Preferences

- User prefers modern, well-documented libraries and frameworks
- Always research latest versions and best practices before implementation
- Prioritize maintainable, scalable solutions over quick fixes
- Consider performance implications in all architectural decisions

---

## Common Issues and Solutions

### Frontend Loading/Initialization Issues

**Issue**: Application stuck on "Initializing TMS" loading screen  
**Root Cause**: Authentication initialization not properly completing or timing out  
**Solutions**:

1. **Initial Loading State**: Always set `isLoading: false` in Redux initial state. Let AuthInitializer manage the loading state explicitly
2. **Promise Handling**: Use `.then()/.catch()` instead of `.finally()` to ensure `setAuthInitialized()` is called in BOTH success and error cases
3. **Backup Timers**: Always implement fallback timers (5-10 seconds) to force initialization completion
4. **Cookie Detection**: Check for auth cookie existence BEFORE attempting token verification
5. **Explicit State Updates**: Always dispatch `setAuthInitialized()` to set `isLoading: false` after verification attempts

**Prevention Checklist**:

- [ ] AuthInitializer has backup timer (10 seconds max)
- [ ] Token verification has timeout protection (5 seconds)
- [ ] Both success and error paths call `setAuthInitialized()`
- [ ] Initial Redux state has `isLoading: false`
- [ ] No cookie check skips verification and immediately initializes

### Database Column Name Mismatches

**Issue**: SQL errors with "Unknown column" messages (e.g., `ER_BAD_FIELD_ERROR`)  
**Root Cause**: Migration files don't match actual database schema or developer assumes column names  
**Solutions**:

1. **Always Query Actual Schema**: Use this command to check actual column names:
   ```bash
   node -e "const knex = require('knex')(require('./knexfile').development); knex('TABLE_NAME').columnInfo().then(cols => { console.log(JSON.stringify(cols, null, 2)); process.exit(); });"
   ```
2. **Use SQL Aliases**: When column names differ from expected, use `as` aliases:
   ```javascript
   .select('actual_column_name as expected_name')
   ```
3. **Check Migration Files**: Always review migration files BEFORE writing queries
4. **Document Schema**: Keep DATABASE_SCHEMA.md updated with actual table structures

**Common Column Name Patterns**:

- Migration uses `service_country` but query tries `country`
- Migration uses `service_state` but query tries `state`
- Migration uses `document_type_id` but query tries `document_type`

**Prevention Checklist**:

- [ ] Check migration file for exact column names
- [ ] Query actual database schema with columnInfo() before writing queries
- [ ] Use SQL aliases to match frontend expectations
- [ ] Test queries with actual data before deploying

### Authentication State Management

**Issue**: User logged out on page reload despite valid JWT token  
**Root Cause**: Cookie-based JWT not properly verified on app initialization  
**Solutions**:

1. **Session Cookies**: Remove `maxAge` from cookie options to create session cookies
2. **Token Verification**: Call `verifyToken` on app load if auth cookie exists
3. **Proper State Restoration**: Set `isAuthenticated: true` after successful verification
4. **Error Handling**: If verification fails, clear state but don't block UI

**Prevention Checklist**:

- [ ] AuthInitializer checks for cookie on mount
- [ ] verifyToken async thunk properly restores user state
- [ ] Failed verification doesn't prevent app from loading
- [ ] Session cookies expire when browser closes (no maxAge)

### Type Coercion Errors in React Components

**Issue**: `TypeError: X.toFixed is not a function` or similar method-not-available errors  
**Root Cause**: MySQL decimal/numeric fields returned as strings from database driver, causing type mismatches in frontend  
**Solutions**:

1. **Defensive Type Checking**: Always validate and convert data types before using type-specific methods:
   ```javascript
   const numericValue =
     typeof value === "number" ? value : parseFloat(value) || 0;
   ```
2. **Graceful Fallbacks**: Provide default values when conversion fails:
   ```javascript
   const safeRating = parseFloat(rating) || 0;
   ```
3. **Value Clamping**: Clamp values to expected ranges to prevent display issues:
   ```javascript
   const clampedValue = Math.max(min, Math.min(max, numericValue));
   ```
4. **Backend Type Casting**: Consider explicitly converting decimal fields to numbers in backend responses:
   ```javascript
   avgRating: parseFloat(transporter.avg_rating) || 0;
   ```

**Common Type Coercion Patterns**:

- MySQL `decimal()` fields may return as strings depending on driver
- JSON parsing can convert numbers to strings in certain cases
- Form inputs always return strings and need conversion
- API responses may have inconsistent type formatting

**Prevention Checklist**:

- [ ] Check data type before calling type-specific methods (`.toFixed()`, `.toString()`, etc.)
- [ ] Use `parseFloat()` or `Number()` for numeric conversions with fallbacks
- [ ] Implement value clamping for bounded numeric inputs (ratings, percentages)
- [ ] Test with actual database data, not mock data
- [ ] Handle null, undefined, and empty string cases explicitly
