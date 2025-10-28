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
