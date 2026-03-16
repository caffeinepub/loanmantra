# LoanMantra

## Current State
- Multi-step loan application form (Apply.tsx) with 3 steps — no back button between steps
- Home.tsx contains multiple references to "Patna" in hero badge, testimonials, footer
- Dashboard.tsx has password-protected admin panel showing leads table with Name, Phone, CIBIL, Amount, Lenders, Status, Date
- Dashboard does not show full user registration fields (email, salary, age, PAN)

## Requested Changes (Diff)

### Add
- Back button in Apply.tsx for steps 2 and 3 to return to the previous step
- Email, Salary, Age, PAN columns in the admin dashboard leads table
- Expandable row detail in dashboard to show all user fields

### Modify
- Replace all instances of "Patna" with "India" in Home.tsx (hero badge, testimonials, footer)
- Dashboard table to display complete registration data per lead

### Remove
- All "Patna" text from the frontend

## Implementation Plan
1. Apply.tsx: Add a "Back" button on steps 2 and 3 that calls `setStep(step - 1)`
2. Home.tsx: Replace "Patna's #1 Loan Aggregator" → "India's #1 Loan Aggregator", "Happy Customers from Patna" → "Happy Customers Across India", footer "Patna, Bihar" → "India", testimonial city fields → "India", "📍 Patna, Bihar, India" → "📍 India"
3. Dashboard.tsx: Add Email, Salary, Age, PAN to the leads table (additional columns or expandable row)
