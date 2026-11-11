/**
 * Official DTU exam dates, the same for every student (not personal data).
 * Source: LINKS.examDates (tables copied on 2026-11-11, sorted by date).
 * Dates are calendar days (no time), "YYYY-MM-DD". `courses` = the lines of the "Date of exam/course number" cell.
 * To update: copy the tables again from the source page.
 */
export type ExamDay = { date: string; courses: string[]; gradingDeadline: string };
export type ExamPeriod = { title: string; exams: ExamDay[] };

export const examPeriods: ExamPeriod[] = [
  {
    "title": "Re-exam and exam of 3-weeks course in August 2026",
    "exams": [
      {
        "date": "2026-08-12",
        "courses": [
          "Reexam of 3-weeks course from June and July"
        ],
        "gradingDeadline": "2026-09-09"
      },
      {
        "date": "2026-08-13",
        "courses": [
          "F1-A and F1-B"
        ],
        "gradingDeadline": "2026-09-10"
      },
      {
        "date": "2026-08-14",
        "courses": [
          "F2-A and F2-B"
        ],
        "gradingDeadline": "2026-09-11"
      },
      {
        "date": "2026-08-17",
        "courses": [
          "F3-A and F3-B"
        ],
        "gradingDeadline": "2026-09-14"
      },
      {
        "date": "2026-08-18",
        "courses": [
          "F4-A, F4-B, F7, 12100, 12101"
        ],
        "gradingDeadline": "2026-09-15"
      },
      {
        "date": "2026-08-19",
        "courses": [
          "F5-A and F5-B"
        ],
        "gradingDeadline": "2026-09-16"
      },
      {
        "date": "2026-08-20",
        "courses": [
          "01002 (re-exam), 01004 (re-exam), 02451"
        ],
        "gradingDeadline": "2026-09-17"
      },
      {
        "date": "2026-08-21",
        "courses": [
          "01037, 01922",
          "3-weeks course from August"
        ],
        "gradingDeadline": "2026-09-18"
      },
      {
        "date": "2026-08-22",
        "courses": [
          "Replacement exam"
        ],
        "gradingDeadline": "2026-09-19"
      }
    ]
  },
  {
    "title": "Winter exam December 2026 – January 2027",
    "exams": [
      {
        "date": "2026-12-06",
        "courses": [
          "01001, 01003, 01025, 01034, 01035, 01037"
        ],
        "gradingDeadline": "2027-01-12"
      },
      {
        "date": "2026-12-07",
        "courses": [
          "E1-A"
        ],
        "gradingDeadline": "2027-01-13"
      },
      {
        "date": "2026-12-08",
        "courses": [
          "E1-B"
        ],
        "gradingDeadline": "2027-01-14"
      },
      {
        "date": "2026-12-09",
        "courses": [
          "E2-A"
        ],
        "gradingDeadline": "2027-01-15"
      },
      {
        "date": "2026-12-10",
        "courses": [
          "E2-B"
        ],
        "gradingDeadline": "2027-01-18"
      },
      {
        "date": "2026-12-11",
        "courses": [
          "E3-A"
        ],
        "gradingDeadline": "2027-01-19"
      },
      {
        "date": "2026-12-12",
        "courses": [
          "01915, 10916, 10935"
        ],
        "gradingDeadline": "2027-01-19"
      },
      {
        "date": "2026-12-14",
        "courses": [
          "E3-B"
        ],
        "gradingDeadline": "2027-01-20"
      },
      {
        "date": "2026-12-15",
        "courses": [
          "E4-A"
        ],
        "gradingDeadline": "2027-01-21"
      },
      {
        "date": "2026-12-16",
        "courses": [
          "E4-B"
        ],
        "gradingDeadline": "2027-01-22"
      },
      {
        "date": "2026-12-17",
        "courses": [
          "E5-A"
        ],
        "gradingDeadline": "2027-01-25"
      },
      {
        "date": "2026-12-18",
        "courses": [
          "E5-B"
        ],
        "gradingDeadline": "2027-01-26"
      },
      {
        "date": "2026-12-19",
        "courses": [
          "02323, 02402, 02403, 12105, 12106"
        ],
        "gradingDeadline": "2027-01-26"
      },
      {
        "date": "2026-12-21",
        "courses": [
          "02002, 02003, 02452"
        ],
        "gradingDeadline": "2027-01-27"
      },
      {
        "date": "2026-12-22",
        "courses": [
          "E7, 10060, 10065",
          "Re-exam of 3-weeks course from August"
        ],
        "gradingDeadline": "2027-01-28"
      },
      {
        "date": "2026-12-23",
        "courses": [
          "Replacement exam for exams held 6/12-22/12 2026"
        ],
        "gradingDeadline": "2027-01-29"
      },
      {
        "date": "2027-01-22",
        "courses": [
          "3-weeks course from January"
        ],
        "gradingDeadline": "2027-02-19"
      },
      {
        "date": "2027-01-23",
        "courses": [
          "Replacement exam for 3-weeks courses January 2027"
        ],
        "gradingDeadline": "2027-02-19"
      }
    ]
  },
  {
    "title": "Ordinary summer exam and re-exam May – June 2027",
    "exams": [
      {
        "date": "2027-05-13",
        "courses": [
          "F1-A and E1-A"
        ],
        "gradingDeadline": "2027-06-10"
      },
      {
        "date": "2027-05-14",
        "courses": [
          "01002, 01004, 01025, 01034, 01035"
        ],
        "gradingDeadline": "2027-06-11"
      },
      {
        "date": "2027-05-18",
        "courses": [
          "F1-B and E1-B"
        ],
        "gradingDeadline": "2027-06-15"
      },
      {
        "date": "2027-05-19",
        "courses": [
          "F2-A and E2-A"
        ],
        "gradingDeadline": "2027-06-16"
      },
      {
        "date": "2027-05-20",
        "courses": [
          "F2-B and E2-B"
        ],
        "gradingDeadline": "2027-06-17"
      },
      {
        "date": "2027-05-21",
        "courses": [
          "F3-A and E3-A"
        ],
        "gradingDeadline": "2027-06-18"
      },
      {
        "date": "2027-05-22",
        "courses": [
          "01922, 10054, 10916, 10935, 01001 (re-exam), 01003 (re-exam)"
        ],
        "gradingDeadline": "2027-06-18"
      },
      {
        "date": "2027-05-24",
        "courses": [
          "F3-B and E3-B"
        ],
        "gradingDeadline": "2027-06-21"
      },
      {
        "date": "2027-05-25",
        "courses": [
          "F4-A and E4-A"
        ],
        "gradingDeadline": "2027-06-22"
      },
      {
        "date": "2027-05-26",
        "courses": [
          "02323, 02402, 12100, 12101, 12105, 12106"
        ],
        "gradingDeadline": "2027-06-23"
      },
      {
        "date": "2027-05-27",
        "courses": [
          "F4-B and E4-B"
        ],
        "gradingDeadline": "2027-06-24"
      },
      {
        "date": "2027-05-28",
        "courses": [
          "F5-A and E5-A"
        ],
        "gradingDeadline": "2027-06-25"
      },
      {
        "date": "2027-05-31",
        "courses": [
          "02002, 02003, 02451, 02452"
        ],
        "gradingDeadline": "2027-06-28"
      },
      {
        "date": "2027-06-01",
        "courses": [
          "F5-B and E5-B"
        ],
        "gradingDeadline": "2027-06-29"
      },
      {
        "date": "2027-06-02",
        "courses": [
          "F7, E7, 10060 (partial exam and re-exam), 10065 (re-exam)",
          "Re-exam of 3-weeks course from January"
        ],
        "gradingDeadline": "2027-06-30"
      },
      {
        "date": "2027-06-03",
        "courses": [
          "Replacement exam for exams held 13/5-2/6 2027"
        ],
        "gradingDeadline": "2027-07-01"
      },
      {
        "date": "2027-06-24",
        "courses": [
          "02323, 02402 (reeksamen)",
          "3-weeks course from June"
        ],
        "gradingDeadline": "2027-07-22"
      },
      {
        "date": "2027-06-26",
        "courses": [
          "Replacement exam for 3-weeks course June 2027"
        ],
        "gradingDeadline": "2027-07-23"
      }
    ]
  },
  {
    "title": "Re-exam and exam of 3-weeks courses in August 2027",
    "exams": [
      {
        "date": "2027-08-11",
        "courses": [
          "Re-exam of 3-weeks courses from June and July"
        ],
        "gradingDeadline": "2027-09-08"
      },
      {
        "date": "2027-08-12",
        "courses": [
          "F1-A and F1-B"
        ],
        "gradingDeadline": "2027-09-09"
      },
      {
        "date": "2027-08-13",
        "courses": [
          "F2-A and F2-B"
        ],
        "gradingDeadline": "2027-09-10"
      },
      {
        "date": "2027-08-16",
        "courses": [
          "F3-A and F3-B"
        ],
        "gradingDeadline": "2027-09-13"
      },
      {
        "date": "2027-08-17",
        "courses": [
          "F4-A, F4-B, F7, 12100, 12101"
        ],
        "gradingDeadline": "2027-09-14"
      },
      {
        "date": "2027-08-18",
        "courses": [
          "F5-A and F5-B"
        ],
        "gradingDeadline": "2027-09-15"
      },
      {
        "date": "2027-08-19",
        "courses": [
          "01002 (re-exam), 01004 (re-exam), 01922, 02451"
        ],
        "gradingDeadline": "2027-09-16"
      },
      {
        "date": "2027-08-20",
        "courses": [
          "01037",
          "3-weeks course from August"
        ],
        "gradingDeadline": "2027-09-17"
      },
      {
        "date": "2027-08-21",
        "courses": [
          "Replacement exam"
        ],
        "gradingDeadline": "2027-09-17"
      }
    ]
  },
  {
    "title": "Winter exam December 2027 – January 2028",
    "exams": [
      {
        "date": "2027-12-06",
        "courses": [
          "E1-A"
        ],
        "gradingDeadline": "2028-01-11"
      },
      {
        "date": "2027-12-07",
        "courses": [
          "01001, 01003, 01025, 01034, 01035, 01037"
        ],
        "gradingDeadline": "2028-01-12"
      },
      {
        "date": "2027-12-08",
        "courses": [
          "E1-B"
        ],
        "gradingDeadline": "2028-01-13"
      },
      {
        "date": "2027-12-09",
        "courses": [
          "E2-A"
        ],
        "gradingDeadline": "2028-01-14"
      },
      {
        "date": "2027-12-10",
        "courses": [
          "E2-B"
        ],
        "gradingDeadline": "2028-01-17"
      },
      {
        "date": "2027-12-11",
        "courses": [
          "10916, 10935"
        ],
        "gradingDeadline": "2028-01-18"
      },
      {
        "date": "2027-12-13",
        "courses": [
          "E3-A"
        ],
        "gradingDeadline": "2028-01-18"
      },
      {
        "date": "2027-12-14",
        "courses": [
          "E3-B"
        ],
        "gradingDeadline": "2028-01-19"
      },
      {
        "date": "2027-12-15",
        "courses": [
          "E4-A"
        ],
        "gradingDeadline": "2028-01-20"
      },
      {
        "date": "2027-12-16",
        "courses": [
          "E4-B"
        ],
        "gradingDeadline": "2028-01-21"
      },
      {
        "date": "2027-12-17",
        "courses": [
          "E5-A"
        ],
        "gradingDeadline": "2028-01-24"
      },
      {
        "date": "2027-12-18",
        "courses": [
          "02323, 02402, 02403, 12105, 12106"
        ],
        "gradingDeadline": "2028-01-25"
      },
      {
        "date": "2027-12-20",
        "courses": [
          "E5-B"
        ],
        "gradingDeadline": "2028-01-25"
      },
      {
        "date": "2027-12-21",
        "courses": [
          "02002, 02003, 02452"
        ],
        "gradingDeadline": "2028-01-26"
      },
      {
        "date": "2027-12-22",
        "courses": [
          "E7, 10060, 10065",
          "Re-exam of 3-weeks course from August"
        ],
        "gradingDeadline": "2028-01-27"
      },
      {
        "date": "2027-12-23",
        "courses": [
          "Replacement exam for exams held 6/12-22/12 2027"
        ],
        "gradingDeadline": "2028-01-28"
      },
      {
        "date": "2028-01-21",
        "courses": [
          "3-weeks course from January"
        ],
        "gradingDeadline": "2028-02-18"
      },
      {
        "date": "2028-01-22",
        "courses": [
          "Replacement exam for 3-weeks courses January 2028"
        ],
        "gradingDeadline": "2028-02-19"
      }
    ]
  },
  {
    "title": "Ordinary summer exam and re-exam May – June 2028",
    "exams": [
      {
        "date": "2028-05-09",
        "courses": [
          "F1-A and E1-A"
        ],
        "gradingDeadline": "2028-06-09"
      },
      {
        "date": "2028-05-10",
        "courses": [
          "01002, 01004, 01025, 01034, 01035"
        ],
        "gradingDeadline": "2028-06-12"
      },
      {
        "date": "2028-05-11",
        "courses": [
          "F1-B and E1-B"
        ],
        "gradingDeadline": "2028-06-13"
      },
      {
        "date": "2028-05-12",
        "courses": [
          "F2-A and E2-A"
        ],
        "gradingDeadline": "2028-06-14"
      },
      {
        "date": "2028-05-15",
        "courses": [
          "F2-B and E2-B"
        ],
        "gradingDeadline": "2028-06-15"
      },
      {
        "date": "2028-05-16",
        "courses": [
          "F3-A and E3-A"
        ],
        "gradingDeadline": "2028-06-16"
      },
      {
        "date": "2028-05-17",
        "courses": [
          "01922, 10054, 10916, 10935, 01001 (re-exam), 01003 (re-exam)"
        ],
        "gradingDeadline": "2028-06-19"
      },
      {
        "date": "2028-05-18",
        "courses": [
          "F3-B and E3-B"
        ],
        "gradingDeadline": "2028-06-20"
      },
      {
        "date": "2028-05-19",
        "courses": [
          "F4-A and E4-A"
        ],
        "gradingDeadline": "2028-06-21"
      },
      {
        "date": "2028-05-20",
        "courses": [
          "02323, 02402, 12100, 12101, 12105, 12106"
        ],
        "gradingDeadline": "2028-06-21"
      },
      {
        "date": "2028-05-22",
        "courses": [
          "F4-B and E4-B"
        ],
        "gradingDeadline": "2028-06-22"
      },
      {
        "date": "2028-05-23",
        "courses": [
          "F5-A and E5-A"
        ],
        "gradingDeadline": "2028-06-23"
      },
      {
        "date": "2028-05-24",
        "courses": [
          "02002, 02003, 02451, 02452"
        ],
        "gradingDeadline": "2028-06-26"
      },
      {
        "date": "2028-05-29",
        "courses": [
          "F5-B and E5-B"
        ],
        "gradingDeadline": "2028-06-27"
      },
      {
        "date": "2028-05-30",
        "courses": [
          "F7, E7, 10060 (partial exam and re-exam), 10065 (re-exam)",
          "Re-exam of 3-weeks course from January"
        ],
        "gradingDeadline": "2028-06-28"
      },
      {
        "date": "2028-05-31",
        "courses": [
          "Replacement exam for exams held 9/5-30/5 2028"
        ],
        "gradingDeadline": "2028-06-29"
      },
      {
        "date": "2028-06-22",
        "courses": [
          "02323, 02402 (reeksamen)",
          "3-weeks course from June"
        ],
        "gradingDeadline": "2028-07-20"
      },
      {
        "date": "2028-06-24",
        "courses": [
          "Replacement exam for 3-weeks course June 2028"
        ],
        "gradingDeadline": "2028-07-21"
      }
    ]
  },
  {
    "title": "Re-exam and exam of 3-weeks courses in August 2028",
    "exams": [
      {
        "date": "2028-08-09",
        "courses": [
          "Re-exam of 3-weeks courses from June and July"
        ],
        "gradingDeadline": "2028-09-06"
      },
      {
        "date": "2028-08-10",
        "courses": [
          "F1-A and F1-B"
        ],
        "gradingDeadline": "2028-09-07"
      },
      {
        "date": "2028-08-11",
        "courses": [
          "F2-A and F2-B"
        ],
        "gradingDeadline": "2028-09-08"
      },
      {
        "date": "2028-08-14",
        "courses": [
          "F3-A and F3-B"
        ],
        "gradingDeadline": "2028-09-11"
      },
      {
        "date": "2028-08-15",
        "courses": [
          "F4-A, F4-B, F7, 12100, 12101"
        ],
        "gradingDeadline": "2028-09-12"
      },
      {
        "date": "2028-08-16",
        "courses": [
          "F5-A and F5-B"
        ],
        "gradingDeadline": "2028-09-13"
      },
      {
        "date": "2028-08-17",
        "courses": [
          "01002 (re-exam), 01004 (re-exam), 01922, 02451"
        ],
        "gradingDeadline": "2028-09-14"
      },
      {
        "date": "2028-08-18",
        "courses": [
          "01037",
          "3-weeks course from August"
        ],
        "gradingDeadline": "2028-09-15"
      },
      {
        "date": "2028-08-19",
        "courses": [
          "Replacement exam"
        ],
        "gradingDeadline": "2028-09-15"
      }
    ]
  },
  {
    "title": "Winter exam December 2028 – January 2029",
    "exams": [
      {
        "date": "2028-12-04",
        "courses": [
          "E1-A"
        ],
        "gradingDeadline": "2029-01-09"
      },
      {
        "date": "2028-12-05",
        "courses": [
          "01001, 01003, 01025, 01034, 01035, 01037"
        ],
        "gradingDeadline": "2029-01-10"
      },
      {
        "date": "2028-12-06",
        "courses": [
          "E1-B"
        ],
        "gradingDeadline": "2029-01-11"
      },
      {
        "date": "2028-12-07",
        "courses": [
          "E2-A"
        ],
        "gradingDeadline": "2029-01-12"
      },
      {
        "date": "2028-12-08",
        "courses": [
          "E2-B"
        ],
        "gradingDeadline": "2029-01-13"
      },
      {
        "date": "2028-12-09",
        "courses": [
          "10916, 10935"
        ],
        "gradingDeadline": "2029-01-15"
      },
      {
        "date": "2028-12-11",
        "courses": [
          "E3-A"
        ],
        "gradingDeadline": "2029-01-16"
      },
      {
        "date": "2028-12-12",
        "courses": [
          "E3-B"
        ],
        "gradingDeadline": "2029-01-17"
      },
      {
        "date": "2028-12-13",
        "courses": [
          "E4-A"
        ],
        "gradingDeadline": "2029-01-18"
      },
      {
        "date": "2028-12-14",
        "courses": [
          "E4-B"
        ],
        "gradingDeadline": "2029-01-19"
      },
      {
        "date": "2028-12-15",
        "courses": [
          "E5-A"
        ],
        "gradingDeadline": "2029-01-22"
      },
      {
        "date": "2028-12-18",
        "courses": [
          "02323, 02402, 02403, 12105, 12106"
        ],
        "gradingDeadline": "2029-01-23"
      },
      {
        "date": "2028-12-19",
        "courses": [
          "E5-B"
        ],
        "gradingDeadline": "2029-01-24"
      },
      {
        "date": "2028-12-20",
        "courses": [
          "02002, 02003, 02452"
        ],
        "gradingDeadline": "2029-01-25"
      },
      {
        "date": "2028-12-21",
        "courses": [
          "E7, 10060, 10065",
          "Reexam of 3-weeks course from August"
        ],
        "gradingDeadline": "2029-01-26"
      },
      {
        "date": "2028-12-22",
        "courses": [
          "Replacement exam for exams held 4/12-21/12 2028"
        ],
        "gradingDeadline": "2029-01-16"
      },
      {
        "date": "2029-01-19",
        "courses": [
          "3-weeks course from January"
        ],
        "gradingDeadline": "2029-02-16"
      },
      {
        "date": "2029-01-20",
        "courses": [
          "Replacement exam for 3-weeks course January 2028"
        ],
        "gradingDeadline": "2029-02-16"
      }
    ]
  },
  {
    "title": "Ordinary summer exam and re-exam May – June 2029",
    "exams": [
      {
        "date": "2029-05-14",
        "courses": [
          "F1-A and E1-A"
        ],
        "gradingDeadline": "2029-06-13"
      },
      {
        "date": "2029-05-15",
        "courses": [
          "01002, 01004, 01025, 01034, 01035"
        ],
        "gradingDeadline": "2029-06-14"
      },
      {
        "date": "2029-05-16",
        "courses": [
          "F1-B and E1-B"
        ],
        "gradingDeadline": "2029-06-15"
      },
      {
        "date": "2029-05-17",
        "courses": [
          "F2-A and E2-A"
        ],
        "gradingDeadline": "2029-06-18"
      },
      {
        "date": "2029-05-18",
        "courses": [
          "F2-B and E2-B"
        ],
        "gradingDeadline": "2029-06-19"
      },
      {
        "date": "2029-05-22",
        "courses": [
          "F3-A and E3-A"
        ],
        "gradingDeadline": "2029-06-20"
      },
      {
        "date": "2029-05-23",
        "courses": [
          "01922, 10054, 10916, 10935, 01001 (reexam), 01003 (reexam)"
        ],
        "gradingDeadline": "2029-06-21"
      },
      {
        "date": "2029-05-24",
        "courses": [
          "F3-B and E3-B"
        ],
        "gradingDeadline": "2029-06-22"
      },
      {
        "date": "2029-05-25",
        "courses": [
          "F4-A and E4-A"
        ],
        "gradingDeadline": "2029-06-25"
      },
      {
        "date": "2029-05-28",
        "courses": [
          "02323, 02402, 12100, 12101, 12105, 12106"
        ],
        "gradingDeadline": "2029-06-26"
      },
      {
        "date": "2029-05-29",
        "courses": [
          "F4-B and E4-B"
        ],
        "gradingDeadline": "2029-06-27"
      },
      {
        "date": "2029-05-30",
        "courses": [
          "F5-A and E5-A"
        ],
        "gradingDeadline": "2029-06-28"
      },
      {
        "date": "2029-05-31",
        "courses": [
          "02002, 02003, 02451, 02452"
        ],
        "gradingDeadline": "2029-06-29"
      },
      {
        "date": "2029-06-01",
        "courses": [
          "F5-B og E5-B"
        ],
        "gradingDeadline": "2029-07-02"
      },
      {
        "date": "2029-06-04",
        "courses": [
          "F7, E7, 10060 (partial exam and reexam), 10065 (reexam)",
          "Reexam of 3-weeks course from January"
        ],
        "gradingDeadline": "2029-07-03"
      },
      {
        "date": "2029-06-06",
        "courses": [
          "Replacemenet exam for exams held 14/5-4/6 2029"
        ],
        "gradingDeadline": "2029-07-04"
      },
      {
        "date": "2029-06-28",
        "courses": [
          "02323, 02402 (reexam)",
          "3-weeks course from June"
        ],
        "gradingDeadline": "2029-07-26"
      },
      {
        "date": "2029-06-29",
        "courses": [
          "Replacemenet exam for 3-weeks course June 2028"
        ],
        "gradingDeadline": "2029-07-27"
      }
    ]
  },
  {
    "title": "Re-exam and exam of 3-weeks courses in August 2029",
    "exams": [
      {
        "date": "2029-08-08",
        "courses": [
          "Reexam of 3-weeks course from June and July"
        ],
        "gradingDeadline": "2029-09-05"
      },
      {
        "date": "2029-08-09",
        "courses": [
          "F1-A and F1-B"
        ],
        "gradingDeadline": "2029-09-06"
      },
      {
        "date": "2029-08-10",
        "courses": [
          "F2-A and F2-B"
        ],
        "gradingDeadline": "2029-09-07"
      },
      {
        "date": "2029-08-13",
        "courses": [
          "F3-A and F3-B"
        ],
        "gradingDeadline": "2029-09-10"
      },
      {
        "date": "2029-08-14",
        "courses": [
          "F4-A, F4-B, F7, 12100, 12101"
        ],
        "gradingDeadline": "2029-09-11"
      },
      {
        "date": "2029-08-15",
        "courses": [
          "F5-A and F5-B"
        ],
        "gradingDeadline": "2029-09-12"
      },
      {
        "date": "2029-08-16",
        "courses": [
          "01002 (reexam), 01004 (reexam), 01922, 02451"
        ],
        "gradingDeadline": "2029-09-13"
      },
      {
        "date": "2029-08-17",
        "courses": [
          "01037",
          "3-weeks course from August"
        ],
        "gradingDeadline": "2029-09-14"
      },
      {
        "date": "2029-08-18",
        "courses": [
          "Replacementexam"
        ],
        "gradingDeadline": "2029-09-14"
      }
    ]
  }
];
