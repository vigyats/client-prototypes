# Event Management System - New Features

## Overview
Complete overhaul of the event management system with registration, detailed information, and auto-pinning features.

## New Event Fields

### 1. **Images**
- **Event Flyer** (Left side) - Main promotional image
- **Cover Image** (Optional) - Additional cover photo

### 2. **Registration**
- **Registration Form URL** - Google Forms or any registration link
- **Registration Start Date** - When registration opens
- **Registration End Date** - When registration closes
- **Auto-Pin Feature**: Events with open registration automatically appear on home page

### 3. **Event Details**
- **Event Price** - Free, ₹500, $50, etc.
- **Participation Type** - Team, Individual, or Both
- **Event Start Date** - When event begins
- **Event End Date** - When event ends

### 4. **Content Fields** (All auto-translated)
- **Title** - Event name
- **Location** - City, venue, or region
- **Summary** - Brief overview
- **Introduction** - Detailed introduction
- **Requirements** - Eligibility, prerequisites, what to bring
- **Detailed Content** - Full event description with rich text

## Key Features

### 1. **Clickable Event Cards**
- Click any event card to open the full event page
- No need for separate "View" button
- Smooth navigation experience

### 2. **Registration Button**
- Appears ONLY when registration form URL is provided
- "Register" button redirects to Google Form
- Opens in new tab for better UX

### 3. **Auto-Translation**
- Write content in ONE language (English, Hindi, or Marathi)
- System automatically translates to other 2 languages
- All fields are translated: title, location, summary, introduction, requirements

### 4. **Home Page Auto-Pinning**
- Events with OPEN registration dates automatically pinned
- Shows as "New Event" in square box on home page
- Removed when registration closes

### 5. **Two-Column Layout**
**Left Column:**
- Event Flyer upload
- Cover Image upload (optional)
- Basic information (slug, price, participation type)
- Registration form URL
- All date fields

**Right Column:**
- Language selector
- Status (Draft/Published)
- All content fields
- Rich text editor

## User Flow

### Creating an Event:
1. Click "New Event"
2. **Left Side**: Upload flyer, add basic info, dates, registration link
3. **Right Side**: Select language, write content
4. Click "Create Event"
5. System auto-translates to all languages
6. If registration is open → Event auto-pins to home page

### Viewing Events:
1. Click on any event card
2. Event page opens with:
   - Flyer on left
   - Event details on right
   - "Register" button (if form URL provided)
   - All information in selected language

### Registration Flow:
1. User sees event on home page (if registration open)
2. Clicks event card
3. Reads event details
4. Clicks "Register" button
5. Redirected to Google Form
6. Completes registration

## Database Schema Updates

### Events Table:
```
- registration_start_date (timestamp)
- registration_end_date (timestamp)
- flyer_image_path (text)
- registration_form_url (text)
- event_price (text)
- participation_type (text)
```

### Event Translations Table:
```
- summary (text)
- introduction (text)
- requirements (text)
```

## Benefits

1. **User-Friendly**: Write once in preferred language
2. **Automatic**: Translation and home page pinning
3. **Complete**: All event information in one place
4. **Professional**: Flyer + detailed information layout
5. **Integrated**: Registration directly linked
6. **Smart**: Auto-pins based on registration dates

## Example Event Creation

```
Left Side:
- Flyer: event-poster.jpg
- Price: ₹500
- Participation: Team
- Registration Form: https://forms.google.com/xyz
- Registration: Jan 1 - Jan 15, 2026
- Event: Jan 20 - Jan 22, 2026

Right Side (in Hindi):
- Title: राष्ट्रीय परामर्श 2026
- Location: नई दिल्ली
- Summary: युवा नेतृत्व पर राष्ट्रीय परामर्श
- Introduction: यह कार्यक्रम...
- Requirements: 18-25 वर्ष, छात्र ID
- Content: [Rich text with agenda, schedule, etc.]

Result:
✓ Event created in Hindi
✓ Auto-translated to English & Marathi
✓ Auto-pinned on home page (registration open)
✓ Register button visible
```

## Notes

- Registration form URL is optional
- If no form URL, no Register button appears
- Events auto-unpin when registration closes
- All dates are optional (can show "TBD")
- Flyer is recommended but optional
