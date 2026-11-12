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

## My studies — tab "school" (7:22) → route `/student`
- DTU logo 47x65 top right (x326 y29), same as Home. No back arrow (main tab screen).
- "Grades and ECTS→" Bold 25 underlined, x22 y64.
- Row at y115: pie 112x112 (x25) — Figma shows an IMAGE (4 slices with "NN ECTS" labels, small green center circle);
  reference only. Text "Ects completed:" / "65/120" Bold 20 at x167 y137.
- Full-width 1px black divider at y244 (x3 → 388).
- "My Courses→" Bold 25 underlined x23 y252. Two course cards 344x115, radius 30, drop shadow: banner image fills the top,
  white bottom strip 52 tall (rounded bottom 30), text Bold 15 "code name, term" padding 10. Gap 13 between cards.
- "Studyplanner→" (y585) and "Exams Dates→" (y639) Bold 20 underlined, x18.
- "Study Guidance" Bold 20 underlined + external-link icon 21 (`public/icons/external-link.svg`), centered at y721.

## Grades and ECTS (27:16) → route `/grades`
- Back arrow. "Progress" Bold 20 centered (y50).
- Progress bar x28 y89, 345x32, track #d9d9d9, fill Figma blue #0088ff (inset 2px), text "65/120 ects" Bold 20 right-aligned inside.
- Row y133: pie 112 (x24, Figma IMAGE, same as My studies) + "12 activities planned" / "8 activities completed" Bold 20 (x151).
  "StudyPlanner→" SemiBold 20 underlined, right side (x197 y235).
  Button "Show ECTS distribution" bg #dfdada radius 10, Medium 10, h34, drop shadow 0 4 2 .25, x19 y258 (under the pie).
- Full-width divider y320.
- "Grades" Bold 30 centered; "Your list of grades →" Bold 20 underlined centered; "Grades Insights" Bold 25 #808080 centered;
  row "Current GPA: 8.3" Bold 20 left + "GPA calculator →" Bold 15 underlined right;
  card "Last grade:\n<code> <title>: <grade> (<ects>ects)" Bold 15, 1px black border radius 10, padding 10;
  chart area 338x214 (Figma IMAGE: blue grade line, orange GPA line, shaded period band "SPRING 2026"), horizontal scroll.

## ECTS distribution (96:138) — modal over /grades
- 351x501 white card radius 20, close button (ant-design close-square) top right. Content is a SCREENSHOT of the official
  Studyplanner "Course type distribution": legend + big pie, then per-type small pies "Registered NN ECTS / Missing NN ECTS".
  Colors from Studyplanner: green (polytechnic foundation), blue (programme specific), red (thesis), orange (electives).
  White background (never black).

## GPA calculator (44:40) → route `/grades/calculator`
- Back arrow, title "GPA calculator" Bold 20 centered y50. Column x21 y112 gap 15, Bold 20: "Current GPA: x", "Current ECTS
  passed: n", "Expected grade: _", "Ects expected: _". Button "Calculate" 255x34 radius 30 Figma teal #43cab4, white Bold 20,
  drop shadow, centered y285. Result "Expected GPA: 9.12" Bold 20 at y369.

## Studyplanner (27:19) → route `/studyplanner`
- Back arrow (x23 y26). Programme title Bold 20 (x17 y95, w359, wraps): "Msc in Human Centred Artificial Inteligence".
  Row y164: "120 ECTS planned" Bold 20 left + button "Show ECTS distribution" (same as Grades: #dfdada, r10, Medium 10, h34, shadow).
- Scroll area x10 w372 from y199. Each YEAR block: bg #f1f1f1, padding 17/11/29, gap 14.
  Year header: bg #dfdada, Medium 10, pad 5/100/5/10: "Year of study 1 September 2025 - 31 August 2026".
  Term bar: #be2b31 h20 w350, SemiBold 9 white "1. Term" (number = semester number).
  Footer: "ECTS in this year of study: 55" Bold 9 underlined, right aligned.
- VIEW 1 (completed): heading row SemiBold 9 "Winter exam 2025/2026 ... Result  ECTS"; rows w350 white, border 1px
  rgba(128,128,128,.5), pad 3/5, stacked with no gap: 13px color square (course type color) + "code name" Medium 9, ECTS right.
- VIEW 2 (ongoing/future): per PERIOD a heading row "13 weeks autumn 2026" / "January 2027" SemiBold 9 + right group
  "Placement  Status  ECTS" + 12px 2x2 grid icon. Rows: square + name (w178), placement Light 9 ("E5B", "JAN"),
  check icon 14px (status), ECTS Medium 9. Empty period: "Nothing was planned for this period" Light Italic 9.
  Under each period a pill "Register/withdraw not open" rgba(190,43,49,.6), white Light 9, r5, pad 7/5, right side.
- Basket (y955): IMAGE (screenshot of official Studyplanner basket: header "Basket" + trash, rows: move handle, color
  square, red code + name, schedule group, trash). Build as real list.

## My Courses (116:377) → route `/courses`
- Back arrow. Search pill x23 y76 350x53, r30, white, inset shadows (0 4 6 3 .2 / 0 -4 4 0 .25), search icon 24 (x59),
  placeholder "Search for courses" Light Italic 20 (x90).
- List from y155, x21, gap ~21: course card 344x115 r30 = banner image (top 63px) + white bottom 52px with
  "code name, 2026 Fall" Bold 15 (2 lines). Same card as My studies (CourseCard). Card shadow as in screenshot.

## Exam dates (163:1493) → route `/exams`
- Back arrow, "Exams Dates" Bold 25 centered (y55).
- Period dropdown pill x14 y147: bg #d4d4d4, r20, pad 5/20, gap 10, shadow 0 4 2 .25, "Fall 2026" Bold 15 + chevron-down 24.
- List x11 y197 gap 14: card 342x94, 1px #808080, r10, pad 11/18, gap 13: date "DEC\n6" Bold 20 centered;
  text Bold 15: "Course Numbers:", the course numbers / schedule groups, "Grading Deadline: 12/1 2027" in #808080.

## Campus (7:55) → route `/campus` (tab map)
- DTU logo top right (x326 y29, 47x65, same as My studies). Column x21 y93 gap 16: "Food and Drinks→" Bold 25 underlined;
  row gap 21 of 2 venue cards 154x161, border 3 #9b0300, r20 (IMAGE: crop of the eat@DTU screenshot, assets 92d39).
- "Library→" Bold 25 underlined (x22 y339), then Bold 20 lines with blank line between: "avaible seats now: 376",
  "in the library now:424", "visited today: 2500".
- Map card x21 y538 352x213, border 3 black, r20 (IMAGE: MazeMap screenshot, blue location dot) + expand icon 42
  (ant-design arrows-alt) top right (x316 y554) on a grey rounded square.

## Food and Drinks (30:172) → `/campus/food`
- Back arrow. "Eat@" black + "DTU" red (#ff0000), Bold 35, centered y44. "Select Venue" Bold 20 #808080 centered y99.
- Grid x28 y157 334 wide, 2 cols, gap 26 x 41, rows ~161: 6 venue cards (border 3 #9b0300, r20), each a CROP of one
  screenshot (asset 92d39): B101 Food Court, B101 Hav a Java Central, B101 Social, B101 Food Court, SkyLab,
  Ballerup The Canteen. Only the first (B101) is clickable → `/campus/food/101`.

## Food 101 (157:1132) → `/campus/food/101`
- Same header. Grid 336x336, 2x2, gap 23 x 37: Wicked Rabbit, Folkekøkken, Street Food, Bazaar (crops of asset 68f37).
  Not clickable (order page not built).

## Library (30:193) → `/campus/library`
- Back arrow. "DTU" red + " Smart Libray" Bold 35 (y73). Three blocks: "Seats - Entire library" / "First floor" /
  "Second Floor" Bold 25, under each two boxes: "Free\n\nN" blue #0000ff, "Occupied\n\nN" orange #ff5100,
  SemiBold 20 white, r10, pad 10, gap 39.
- Links centered Bold 15 underlined + external icon 16: "DTU Findit", "Book Group Room/Booth", "Use the Printers".

## DTU page (9:124) → route `/dtu` (tab DTU)
- DTU logo top right (same as Campus). Column x26 y94: "News→" Bold 25 underlined, gap 16, news card 322x229 r15
  shadow 0 4 4 .25: image cover; red #9b0300 badge (Medium 13 black, h26, pad 10, r top-right 15) sitting on the image
  bottom-left at y151; white caption bar at y177 (SemiBold 13, pad 10, r bottom 15).
- "Upcoming Events in DTU→" Bold 25 underlined (y400). Event card 333 wide: image h156 r-top 10, white caption h35
  (SemiBold 15 centered, r-bottom 10, drop shadow 0 4 2 .25).
- "Services for students→" Bold 20 underlined (y663), "Contacts→" Bold 20 underlined (y708).

## News from DTU (116:336) → `/dtu/news`
- Back arrow, title "News from DTU" Bold 25 centered y40. Scroll list x34 y89 w326, gap 31, same news card as DTU page
  (caption Medium 13 here instead of SemiBold).

## Events in DTU (116:351) → `/dtu/events`
- Back arrow, title "Events in DTU" Bold 25 y44. List x33 y90 w326 gap 12: event card image h178 + caption Medium 15.

## Services for students (45:154) → `/dtu/services`
- Back arrow, title Bold 25 centered y90. Column x35 y145 w321 gap 36: four tiles 321x106 r10, label SemiBold 15 white
  bottom-left (x~11, y74) + white icon 24 right of the label: Study Abroad #ff6600 (plane, public/images/dtu/icon-plane),
  "DTU Careeh Hub" (typo) green #008000 (job search), Student Life #00c0e8 (party), Well being & Support pink #ffc0cb (heart).

## Contact (45:127) → `/dtu/contact`
- Back arrow, title "Contact" Bold 25 centered y65. Text block x34 y114 w339: headings Bold 20, body Regular/Medium 15,
  bullets. Main address + tel + "Send e-mail (via contact form)" link; "Opening hours of the reception:" Bold 20 +
  "Monday - Friday: 8 a.m. – 4 p.m." Medium 20; Information regarding Studies (OSS link + address, tel, fax);
  Information regarding Finance and Accounting (address, tel, fax).

## Career Hub (224:1162), Study Abroad (224:1270), Student Life (224:1324), Wellbeing (224:1216)
- All: back arrow + scrolling content column, tab bar. Static images in public/images/dtu/.
- Career Hub: logo image 253x69 (careerhub-logo.png) at x23 y55, gap 20; SemiBold Italic 20 intro; Regular 15 text with
  "DTU Career Hub" underlined links, bullets, Bold 15 subheading.
- Study Abroad: title "Why go on Exchange?" Bold 25 centered (screenshot shows a yellow glow, not in layers), image
  344x206 full width, gap 22; 4 Bold 15 headings + Regular 15 paragraphs; "Find out more" Bold 15 underlined + external
  icon 16 (centered).
- Student Life: title "Student Life at DTU" Bold 25, image 407x229 full width, gap 14; Bold 15 headings + Regular 15
  text; SemiBold Italic underlined links "Check out your options on DTU Sport" (dtuSport), "Check out PF" (pf).
- Wellbeing: title "Wellbeing & Support" Bold 25, intro Medium 15 #808080, image 1466x829 full width, gap 26; 4 SemiBold
  15 headings + Regular 15 text; centered SemiBold 15 underlined link "DTU Help and Guidance" (studentHelp).

## Course page — shared chrome (42:205, 40:112, 42:174, 227:460, 93:2) → `/courses/:courseId`
- Banner 383x207 at x5 y7, r30, 5px border `#9b0300`, course picture `object-fit: cover` + black overlay 30%.
  Course title over it: Bold 20 white, x16 y~127, width 352 (2 lines). Back arrow (red) x23 y26 on top of the image.
- Tab row y183, h37, white, 3 equal cells (~125px): "My Course" / "Content" / "Assignments", Semi Bold Italic 20 black.
  Active tab = 3px underline under the cell (Figma cyan `#00C0E8`). Row has a soft shadow below (0 4 2 .25).
- Tab bar as everywhere (school tab active).

## Course — My Course (42:205)
- Scroll area from y244. "Classlist →" Semi Bold 20 underlined (link). Divider: 2px black line full width + shadow.
- "Groups" Semi Bold 20; "My Group" Light 20; "Number: 20" / "Members: 1/4" / "Assigments: 2" Light 20, values blue `#0988ff`.
- Divider. "Announcements" Bold 20. Each: title Light 20 underlined blue `#0988ff` (link), "<author> posted on 03 November,
  2026 09:00" Light 20, then full body text Light 20, x16.

## Course — Classlist (227:460) (inside My Course tab, tabs stay visible)
- "Classlist" Semi Bold 25 at x11; filter pill right (x281): bg `#d4d4d4`, r20, pad 5/20, "All" Bold 15 + chevron-down 24, shadow.
- Rows full width 384, 1px border `#808080`, pad 10, gap 46: [photo 32x36 + name Regular 15, gap 12] [ "email: …" / "role: …"
  Regular 15, labels Medium]. Row height ~58. (Photo → initials avatar per privacy rule.)

## Course — Content (40:112)
- Under tabs (y226), module rows 383x42, 1px border rgba(0,0,0,.5), 6px gap, title Medium 18 x12, cyan check (bi:check-lg 28)
  at right on visited modules; unvisited has no check.

## Course — module open (93:2) (e.g. "Lecture 2")
- Tabs replaced by a white bar at y182: module title Semi Bold Italic 15, shadow 0 4 2 .25.
- Topic rows same style as module rows (file name Medium 18 + cyan check when opened).

## Course — Assignments (42:174)
- Cards from y245, 383x181, gap 11, rounded ~10, 1px grey border + drop shadow. Pad 16/17:
  title Medium 18 blue `#0988ff` ("Group 20: Premortem"), blank line, "Due on 23 september, 2026, 23:59" Bold 12 `#808080`,
  "Completation status: 1 Submission, 1 File", "Evaluation Status:" same style.

## List of Grades (38:24) → `/grades/list`
- Back arrow; "List of Grades" Bold 20 centered (y50). Header row y94 Bold 15: Number (x27) / Title (x135) / Grade (x246) / ECTS (x315).
- Rows from y124, pitch 59, 342 wide, 1px black border, r10, pad 5: code Bold 15, title Bold 12 (w93, wraps),
  grade "10 (B)" Bold 15, ECTS Bold 15.

## Calendar event preview (157:1094) — Figma IMAGE (Learn popup screenshot)
- Small white card r10: clock icon + title Bold ("Group work"), course ("02830 Advanced project ..., Fall 2026"),
  rooms ("LYN.358.042 | LYN.358.039"), "30 September, 2026 13:00 - 30 September, 2026 17:00", note text, ✕ top right.
  Built as a centered card over the calendar (colored left border = chip color).

## Studyplanner schedule (273:425) — Figma IMAGE (official Studyplanner screenshot)
- Period header "Placement Status ECTS" + 2x2 grid icon (tooltip "Show schedule"). Opens under the period rows:
  table Monday-Friday x 8-12 / 13-17 / 18-22, black slot tags (E1A E3A E5A E2B E4B / E2A E4A E5B E1B E3B / E7 on Tuesday
  evening), course codes inside their slot; below: "02830  The course is in schedule E5B for project presentations ..."

## eat@DTU venue page (275:425) — Figma IMAGE (screenshots of the eat@DTU Android app, "Bazaar")
- Top: back arrow, DTU logo centered, (bell, profile). Row of round DTU-red buttons with label under: "Weekly menu", "E-Smiley".
- Venue name Bold centered. Full-width DTU-red rounded buttons: "Order here >" (cutlery icon), "Bonus 0".
- "Ongoing orders", "Current" (news carousel). Grey info box: "BAZAAR" bold caps, "🍛 Bazaar", description
  ("A modern Indian kitchen, where stews and curries are allowed to simmer ..."), "WHEN & WHERE" bold caps,
  "B101 Monday to Friday 11.00 - 14.00", "FIND FOOD & DRINKS ON CAMPUS", red underlined link "VIEW MAP OF CANTEENS & CAFÉES",
  help line food-app@foodandco.dk. "Follow us" + Instagram icon.
- Built (author's scope): name, Weekly menu (sample data), WHEN & WHERE (real DTU opening hours), map link,
  "Order here" opens the eat@DTU app / store. No bonus, orders, news, E-Smiley.
