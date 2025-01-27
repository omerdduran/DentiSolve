# Component Architecture

## Overview

The Dental CPMS uses a modular component architecture based on React and Next.js, with Shadcn UI for base components and TailwindCSS for styling. The component structure follows atomic design principles and emphasizes reusability and maintainability.

## Component Organization

### 1. UI Components (`/components/ui`)
Base UI components from Shadcn UI and custom components
- Buttons
- Inputs
- Cards
- Modals
- Typography
- Layout elements

### 2. Navigation Components (`/components/Navigation`)
Components for site navigation
- Main Navigation Bar
- Sidebar
- Breadcrumbs
- Menu Items
- Mobile Navigation

### 3. Form Components (`/components/Forms`)
Reusable form components and layouts
- Input Fields
- Form Layouts
- Validation Components
- Form Wrappers
- Custom Form Controls

### 4. Modal Components (`/components/Modals`)
Dialog and modal components
- Confirmation Dialogs
- Patient Information Modals
- Appointment Details
- Alert Modals
- Custom Modal Wrappers

### 5. Calendar Components (`/components/CalendarViews`)
Calendar and scheduling related components
- Calendar Grid
- Appointment Slots
- Time Picker
- Date Range Selector
- Schedule Views

### 6. Dashboard Components (`/components/Dashboard`)
Dashboard specific components
- Statistics Cards
- Overview Panels
- Quick Action Buttons
- Status Indicators
- Activity Feeds

### 7. Chart Components (`/components/Charts`)
Data visualization components
- Line Charts
- Bar Charts
- Pie Charts
- Statistics Displays
- Custom Visualizations

### 8. Admin Panel Components (`/components/admin-panel`)
Administrative interface components
- User Management
- System Settings
- Access Control
- Backup Management
- Audit Logs

## Standalone Components

### LoginScreen (`LoginScreen.tsx`)
- Main authentication interface
- Login form handling
- Error states
- Loading states

### EventForm (`EventForm.tsx`)
- Appointment creation/editing
- Date/time selection
- Patient association
- Validation logic

## Component Design Principles

### 1. Atomic Design
Components are organized following atomic design methodology:
- **Atoms**: Basic UI elements (buttons, inputs)
- **Molecules**: Simple component combinations
- **Organisms**: Complex components
- **Templates**: Page layouts
- **Pages**: Full page implementations

### 2. Composition Patterns

```typescript
// Example of component composition
const PatientCard: React.FC<PatientCardProps> = ({ patient }) => {
  return (
    <Card>
      <CardHeader>
        <PatientInfo patient={patient} />
      </CardHeader>
      <CardContent>
        <PatientDetails patient={patient} />
      </CardContent>
      <CardFooter>
        <PatientActions patient={patient} />
      </CardFooter>
    </Card>
  );
};
```

### 3. Props Interface

```typescript
// Example of props interface
interface PatientCardProps {
  patient: Patient;
  onEdit?: (patient: Patient) => void;
  onDelete?: (id: string) => void;
  isLoading?: boolean;
  error?: Error;
}
```

## State Management

1. **Local State**
   - React useState for component-level state
   - useReducer for complex state logic

2. **Global State**
   - React Context for app-wide state
   - Custom hooks for shared logic

## Styling Approach

1. **TailwindCSS**
   - Utility-first CSS framework
   - Custom theme configuration
   - Responsive design utilities

2. **Component Variants**
   - Shadcn UI variants
   - Custom variant definitions
   - Consistent styling patterns

## Best Practices

### 1. Component Structure
```typescript
// Example component structure
import { useState, useEffect } from 'react';
import type { ComponentProps } from './types';

export const Component: React.FC<ComponentProps> = ({ prop1, prop2 }) => {
  // State management
  const [state, setState] = useState(initial);

  // Side effects
  useEffect(() => {
    // Effect logic
  }, [dependencies]);

  // Event handlers
  const handleEvent = () => {
    // Event logic
  };

  // Render methods
  const renderContent = () => {
    // Render logic
  };

  return (
    <div>
      {renderContent()}
    </div>
  );
};
```

### 2. Performance Optimization
- React.memo for expensive components
- useMemo for complex calculations
- useCallback for stable callbacks
- Lazy loading for large components

### 3. Accessibility
- ARIA labels and roles
- Keyboard navigation
- Focus management
- Screen reader support

## Testing Strategy

1. **Unit Tests**
   - Component rendering
   - Props validation
   - Event handling
   - State changes

2. **Integration Tests**
   - Component interactions
   - Form submissions
   - API interactions
   - State management

## Documentation Guidelines

1. **Component Documentation**
   - Purpose and usage
   - Props interface
   - Example usage
   - Edge cases

2. **Storybook Integration**
   - Component stories
   - Various states
   - Interactive examples
   - Documentation

## Future Improvements

1. **Component Library**
   - Extract common components
   - Create NPM package
   - Version control
   - Documentation site

2. **Performance**
   - Bundle size optimization
   - Code splitting
   - Performance monitoring
   - Caching strategies 