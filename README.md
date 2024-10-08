# Concordia Calendar Builder

Easily add your Concordia schedule to your favourite calendar app.

[Live deployment](https://concordia.neeku.dev/)

<p align="middle">
  <img src="/static/ss-1-main.png" width="24%"/>
  <img src="/static/ss-2-configure.png" width="24%" /> 
  <img src="/static/ss-3-course-dialog.png" width="24%" />
  <img src="/static/ss-4-semester-dialog.png" width="24%" />
</p>

This tool helps you generate an iCalendar (.ics) ([RFC5545](https://datatracker.ietf.org/doc/html/rfc5545)) from your Student Centre's course schedule that you can import into Google Calendar, Apple Calendar, Microsoft Outlook, Samsung Calendar, and more.

## Features

- Parse schedule data from [Student Center > Academics](https://campus.concordia.ca/psc/pscsprd/EMPLOYEE/SA/c/SA_LEARNER_SERVICES.SSS_STUDENT_CENTER.GBL?Page=SSS_STUDENT_CENTER&Action=U&TargetFrameName=None) or add courses manually. Screenshots parsing is WIP.
- Manage semesters and days off, courses, and their locations, days, and times.
- Generate valid iCalendar files as per ([RFC7986](https://datatracker.ietf.org/doc/html/rfc7986)).
- Compatible with .ics importing quirks (misbehaving EXDATE) on Android and iOS.
- Always use Concordia's local time zone (America/Toronto).
