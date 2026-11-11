# Design notes (from Figma, file 5kXWqezL5KWUaOWy3VDNRx)

Work from these notes; do not re-read the frames.

## Shared frame chrome
- 393 x 852, white bg, 5px border `#9b0300` (DTU red), radius 30px. Implemented as `.app-shell` in `src/index.css`.
- Font: Inter (300 / 400 / 700).

## Splash — "open app" (2:8)
- Only the DTU logo image (`public/images/dtu-logo.png`, 540x383), shown at 370 x 263, centered (left 11, top 261).
- Behavior: visible 1 s, then `/login`. Must stay unchanged.

## Login — "log in" (217:1140)
- Column, gap 33px, top 33px, width 384 (inside the border).
  1. Campus photo (`public/images/login-campus.png`), full width, aspect 1191/717.
  2. DTU logo 370 x 142 (same image, cropped center, object-fit cover).
  3. Inputs 319 x 39, 1px black border, no radius; placeholder "User" / "Password", Inter Light 20 `#808080`, padding-left 14; vertical gap 12.
  4. Button "Access" 140 x 39, Inter Bold 20 white, Figma bg blue `#0988ff`.
  5. Help text Inter 12: "DTU Users Can change their password here" (link change_password),
     "Guest.dtu.dk users can change their password here" (link guest login), then bold block
     "Login in the format: / DTU Users: username@dtu.dk / DTU Students: username@dtu.dk / Guest.dtu.dk Users: username@win.dtu.dk".
- Deviations: button and links in DTU red; inputs/button 44px tall (touch target).

## Home — "homepage day / week / month / list" (104:237, 181:478, 181:418, 181:526)
- The 4 frames are ONE screen (`/home`); only the calendar tab differs. "Your Calendar" is centered only in the List
  frame: we keep it left-aligned everywhere.
- Header: avatar 67 (PNG with the red ring baked in) at x26 y37, gap 14, name Inter Bold 30. DTU logo 47 x 65 at x325 y28.
  Name/photo come from `src/data/currentUser.tsx` (default = author, swap on real login).
- Content column x20, width 353, scrolls (y135 → 744). Groups: title (Bold 20, underlined, "→") + card, gap 11.
  Card 342 x 94, 1px #808080, radius 10. Announcement text Light 15. Upcoming card: date Bold 20 at x21,
  time/title Bold 15 + course Bold 15 #808080 at x73. Deadlines get a red border.
- Gap 17 between the two groups, 41 before "Your Calendar" (Bold 25). Calendar group gap 31.
- Segmented control: bg #dfdada, radius 10, px 8, gap 7, inset shadow 0 4 4 .25; tabs 38 tall, widths 49/74/61/48,
  Inter SemiBold 15; active bg #8b8b8b.
- Calendar area 335 x 457 = screenshot of the DTU Learn calendar (reference only). Learn look: ‹ › small bordered
  buttons + title ("October 2026", "19 October, 2026 - 25 October, 2026", "23 October, 2026", List: "Upcoming events"),
  light grey header with Mon..Sun, thin grey grid, weekend shaded, "all day" row, 24h labels, Lato-like font.
  Event chips: green-grey (activity), mauve (deadline).
- Tab bar (157:274): 352 x 54 pill #be2b31, radius 30, drop shadow 0 4 2 .25, at x20 y759. Icons: home, mdi:school,
  gis:map-search, DTU logo. Active = white 50% ellipse 55 x 50 with shadow.

## Sub-screen chrome (shared by Upcoming Events, Profile, Study Announcements)
- Back arrow `public/icons/back.svg` (eva:arrow-ios-back-outline, red) 36x36 at x23 y26. Tab bar same as Home.

## Upcoming Events — All / Deadlines / Activities (27:21, 122:428, 122:472)
- Title "Upcoming Events" Bold 25, x89 y47 (visually centered next to the arrow). Activities frame lacks the title (Figma slip).
- Segmented control x23 y124, w340, bg #dfdada radius 10, px 8; tabs 38 tall, SemiBold 15; active bg #808080 white text radius 10.
  Labels All / Deadlines / Activities (tab widths ~74 / 96 / 105).
- List x21 y181 w342, column, gap 19 (Deadlines frame: gap 30, start y192).
- Activity card 342x94, 1px #808080, radius 10, white, pl 20 pr 7 py 11, gap 14, items centered.
  Date block Bold 20 centered ("Nov" / "4"). Text Bold 15: time, title, course "code name, term" in #808080 (wraps).
- Deadline card: same, but border 2px red (#ff0000) + inset shadow 0 4 4 red, px 7.

## Profile — "Edit My User Profile" (40:131)
- Title Bold 25 at x101 y31. Line "Name (s-number)" Regular 20 at x30 y97.
- Avatar 67 (red ring) x27 y137; button "Change Picture" 93x27 bg #e5e5e5 radius 10, Regular 10, x19 y211 (has drop shadow).
- Field = label SemiBold 10 above + input 211x29, 1px black, radius 5, value Regular 13 (pl 5).
  nickname (x125 y131, beside avatar), email, home address, phone number, linkedIn (x19, rows every ~50px from y255),
  personal information: textarea 345x56 at y491. "ID card PIN" input y586 with eye-hide icon (`public/icons/eye-hide.svg`, 24)
  inside right edge; "Change PIN" button 93x27 at x247 beside it.
- Figma typo "Chance" → "Change".

## Study Announcements (134:556)
- Back arrow, then title "Study Announcements" Bold 25 centered at y71 (own row, below the arrow).
- List x21 y127 w342, gap 26. Card 342x94, 1px #808080 radius 10, padding 20/16, text Light 15:
  "Study Announcement <code>:" line then title (wraps).
