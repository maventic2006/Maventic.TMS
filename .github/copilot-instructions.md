# GitHub Copilot Instructions for TMS-Dev-2

## Project Overview
TMS-Dev-2 is an AI-agent-driven development project in its initial phase. Currently serves as a foundation for autonomous problem-solving workflows with advanced AI collaboration capabilities.

## Architecture Summary

### Current Project Structure
```
.github/
├── chatmodes/                    # AI agent behavior configurations
│   └── beastMode_lates.chatmode.md  # Autonomous agent workflow definition
├── instructions/                 # Agent memory and behavior storage
│   └── memory.instruction.md     # User preferences and system behaviors
└── copilot-instructions.md       # Project architecture documentation (this file)
```

### Core Architectural Patterns
- **Configuration-Driven AI Agents**: Uses chatmode files to define agent behaviors and workflows
- **Memory-Persistent AI Interactions**: Leverages instruction files for maintaining context across sessions
- **Research-Integrated Development**: Architecture supports extensive web research before implementation
- **Autonomous Workflow Management**: Built for complete problem resolution without manual intervention

## Current Existing Functionalities

### AI Agent Configuration System
- **Beast Mode Chatmode**: Comprehensive autonomous agent behavior definition in `beastMode_lates.chatmode.md`
  - 10-step problem-solving workflow
  - Web research integration patterns
  - Todo list management system
  - Incremental development approach
  - Root cause debugging methodology

### Memory Management System
- **Persistent Instructions**: User preferences and system behaviors stored in `memory.instruction.md`
- **Cross-Session Context**: Maintains user workflow preferences and technology choices
- **Behavioral Consistency**: Ensures consistent AI agent responses across different sessions

### Documentation Architecture
- **Separation of Concerns**: Clear distinction between agent behavior (memory) and project structure (copilot instructions)
- **Scalable Configuration**: Architecture supports adding new chatmodes and instruction sets
- **Version Control Integration**: All configurations tracked in Git for change management

## Testing Strategy

### Current Testing Approach
- **Incremental Validation**: Test after each significant architectural change
- **Configuration Testing**: Validate chatmode and instruction file parsing
- **Cross-Platform Compatibility**: Ensure configurations work across different AI platforms

### Planned Testing Framework
- **Agent Behavior Testing**: Validate autonomous workflow execution
- **Memory Persistence Testing**: Ensure instruction files maintain consistency
- **Integration Testing**: Test interaction between different configuration components

## Development Architecture Guidelines

### File Organization Principles
- **Configuration Isolation**: Keep AI agent configurations separate from application code
- **Hierarchical Structure**: Use nested directories for different types of instructions
- **Clear Naming Conventions**: Use descriptive filenames that indicate purpose and scope

### Scalability Considerations
- **Modular Chatmodes**: Architecture supports multiple specialized chatmode configurations
- **Extensible Instructions**: Memory system designed to accommodate growing complexity
- **Component Separation**: Clear boundaries between different architectural concerns

### Integration Patterns
- **Git-Native Configuration**: All configurations stored and versioned with code
- **Platform-Agnostic Design**: Architecture works across different AI development environments
- **Backward Compatibility**: Changes maintain compatibility with existing configurations

## Future Architecture Planning

### Anticipated Components
- **Application Code Structure**: Will likely include src/, tests/, and config/ directories
- **Build and Deployment**: Architecture will support modern build tools and CI/CD pipelines
- **External Integrations**: Framework ready for API integrations and external service connections

### Architectural Evolution
- **Incremental Growth**: Current foundation supports adding new components without restructuring
- **Configuration Scaling**: Memory and chatmode systems designed for increased complexity
- **Maintainability Focus**: Architecture prioritizes long-term maintainability and clarity