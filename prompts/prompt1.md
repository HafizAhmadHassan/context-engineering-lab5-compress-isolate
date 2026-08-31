I want you to recreate the website at:

https://day5-unified-lab.vercel.app/

Build a new, independent implementation that reproduces the website's visible UI, layout, styling, navigation, and user interactions as closely as reasonably possible.

IMPORTANT:

Do not copy or reuse proprietary source code.
Recreate the functionality from observation.
Use original implementation code.
Do not copy logos, images, or other copyrighted assets unless they are clearly provided for reuse.
The goal is a functionally equivalent learning/project interface, not unauthorized access to the original project's backend or source code.
Phase 1 — Inspect the reference

First inspect the reference website carefully.

Analyze:

Overall page structure
Header/navigation
Sidebar
Main content area
Cards and panels
Buttons
Forms and inputs
Typography
Colors
Borders, shadows, spacing, and radius
Responsive behavior
Hover states
Active states
Empty states
Loading states
Error states
All visible pages/routes
All interactive elements

Before coding, produce a concise implementation plan.

Phase 2 — Choose the stack

Use:

Next.js
React
TypeScript
Tailwind CSS
shadcn/ui where appropriate

Keep the project simple and maintainable.

Phase 3 — Rebuild the UI

Recreate the interface as closely as possible.

Requirements:

Responsive desktop and mobile layouts
Reusable React components
Clean component hierarchy
Matching spacing and visual hierarchy
Matching colors and typography
Functional buttons
Functional navigation
Appropriate loading/error states
Accessible HTML
Keyboard-accessible controls

Do not create a static screenshot.

The result must be an actual working web application.

Phase 4 — Functionality

Identify what each interactive element does on the reference website.

Where the original requires private APIs, credentials, databases, or external services that we do not have access to:

Create a clean mock implementation.
Clearly isolate the mock service.
Use realistic sample data.
Do not attempt to access private credentials or undocumented APIs.

The application should still be fully usable for demonstration.

Phase 5 — Project structure

Use a clean structure similar to:

app/
components/
lib/
public/
types/

Create reusable components instead of putting everything into one page.

Phase 6 — Verification

After implementation:

Run the development server.
Check every route.
Check desktop layout.
Check mobile layout.
Test every button.
Test every form.
Fix console errors.
Fix TypeScript errors.
Run the production build.
Fix any build failures.

Do not stop after creating the initial UI.

Phase 7 — Final result

Give me:

The completed project.
The commands to run it locally.
The environment variables required, if any.
A list of implemented routes.
A list of features that are mocked rather than connected to real services.
Deployment instructions for Vercel.

Do not deploy anything or push to GitHub unless I explicitly ask you to.