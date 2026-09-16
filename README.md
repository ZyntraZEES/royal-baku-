# Royal Baku Car Rental & Tourism

## Admin editable catalog
The admin dashboard now supports browser-local editing for:
- Fleet vehicles: add, edit, duplicate, delete, availability, featured status, images, specs and pricing
- Tours: add, edit, duplicate, delete, availability, featured status, images, itinerary and pricing
- Bookings: review status and delete local demo requests
- Customers: derived customer records from booking requests
- Reviews: add, edit, hide/show and delete
- FAQs: add, edit, hide/show and delete
- Company content: business name, phone, WhatsApp, email, address and opening hours
- Rental pricing: child seat, additional driver, delivery, weekly and monthly discounts
- Data backup: export JSON and restore default data

## Public website connection
Fleet, tour, booking and homepage featured content reads from the same browser-local catalog data. Changes made in the admin dashboard are therefore reflected on the customer-facing pages in the same browser. Separate browser devices do not share this data.

## Theme
Dark/light mode has been removed from the project. The site now uses the dark premium theme only.

## Production note
This remains a frontend/localStorage prototype. A production deployment should move catalog, bookings, authentication and media storage to a secure backend/database.
