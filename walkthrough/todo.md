## Must-Do work

### Necessary for MVP
-  navbar: There should be links for home, listings, blog, bolo, about, Contact, etc - be Toggleable for mobile screens
-  homepage hero section - full-screen overlayed background image/video with responsiveness - managed by admin
-  finish implementing on car details, specifications area
-  Implement favorite(requires auth check) - currently the like button does nothing

-  Dealer Dashboard:
    - view inventory
    - make the sidenav toggleble on mobile screens
    - finish on Total Views, Total Leads, Total Sales, Inventory
    - recent activity
    - add edit and view actions on inventory management to make it even better
    -  Dealer searching the inventory.
    -  Dealer Analytics

-  buyers/user profile:
    - They can write their reviews/suggestions to the admin. The admin can remove/republish the review
    - Finish working on Favourites, BOLO requests, Recent Activities

-  Admin dashboard (with a header + toggleable sidebar on all screens):
    Implement:
    - Admin notifications for activities.
    - verifying dealers so that their inventory could show up in the marketplace
    - search functionality
    - manage Hero section - check schema.prisma file, model HeroSection, to understand what I mean.
    - Manage reviews
    - Analytics on dealers, users, total inventory, etc

-  header in marketplace & car details
-  using slug instead of car ID on the URL for on Car details



### Additional Features
- [ ] View 360-degree button in car-details page
- [ ] Reviews:
    - Admin creates Reviews/insights on cars then publishes it
- [ ] Dealer recieving email notification when verified.
- [ ] Reason for rejecting application.
- [ ] Add DMs, Chatbot, public chat, features (if i could intergrate chat feature from a seperate project)


### Known bugs
 - [ ] Sorting cars bug (`car-sort component` ) - probably something to do with state management