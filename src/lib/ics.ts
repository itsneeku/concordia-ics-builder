import { createEvents, type EventAttributes, type DateArray } from 'ics';
import type { FormInputEvent } from './components/ui/input';
import { nanoid } from 'nanoid';

export type Class = {
	name: string;
	days: days[];
	timeslot: Timeslot;
	location: string;
	uid: string;
	removed?: boolean;
	editableCol?: string;
};

export type Timeslot = {
	start: {
		hour: number;
		minute: number;
	};
	end: {
		hour: number;
		minute: number;
	};
};

enum days {
	Su = 'Sunday',
	Mo = 'Monday',
	Tu = 'Tuesday',
	We = 'Wednesday',
	Th = 'Thursday',
	Fr = 'Friday',
	Sa = 'Saturday'
}

const semesterStartDate: DateArray = [2024, 9, 3];
const semesterEndDate: DateArray = [2024, 12, 3];
const daysOfWeek = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
const daysOfWeekFull = [
	'Sunday',
	'Monday',
	'Tuesday',
	'Wednesday',
	'Thursday',
	'Friday',
	'Saturday'
];
const campuses = ['SGW', 'LOY', 'TBA'];
const courseRegex = /^[A-Za-z]{3,4} \d{3,4}/;
const componentRegex = /\(.*\)/;

export const parseInput = (text: String): Class[] => {
	const classes: Class[] = [];
	let currentClass: Class = {} as Class;
	for (let line of text.split('\n')) {
		line = normalize(line);
		try {
			if (daysOfWeek.some((day) => line.startsWith(day))) {
				currentClass.days = line
					.split(' ')[0]
					.match(/[A-Z][a-z]?/g)
					?.map((day) => days[day as keyof typeof days]) as days[];
				currentClass.timeslot = getTimeslot(line.substring(line.search(/\d/)).split(' - '));
			} else if (campuses.some((campus) => line.endsWith(campus))) {
				currentClass.location = line;
			} else if (courseRegex.test(line)) {
				currentClass.name = line.split('-')[0];
			} else if (componentRegex.test(line)) {
				currentClass.name += ` ${line.split(' ')[0]}`;
			}
		} catch (err) {
			console.error('Error parsing line:', line, '\n', err);
			continue;
		}
		if (isClassFullyPopulated(currentClass)) {
			classes.push({ ...currentClass, uid: `${nanoid()}@concordiaCalendar.neeku.dev` });
			currentClass = {} as Class;
		}
	}
	return classes;
};

const getTimeslot = (text: string[]): Timeslot => {
	const parseTime = (time: string) => {
		let [hour, minute] = time.split(':').map((part) => parseInt(part));
		if (time.toLowerCase().includes('pm') && hour !== 12) hour += 12;
		if (time.toLowerCase().includes('am') && hour === 12) hour = 0;
		return { hour, minute };
	};

	const [start, end] = text.map(parseTime);

	return { start, end };
};

const normalize = (text: string): string => {
	return text
		.replace(/(Schedule|Class)/, '')
		.replace(/\s+/g, ' ')
		.trim();
};

export const createEventAttributes = (classes: Class[]): EventAttributes[] => {
	let events: EventAttributes[] = [];
	for (const cls of classes) {
		if (cls.removed) continue;
		const event: EventAttributes = {
			title: `${cls.name}`,
			start: [
				...getNextClassDate(semesterStartDate, cls.days),
				cls.timeslot.start.hour,
				cls.timeslot.start.minute
			] as DateArray,
			end: [
				...getNextClassDate(semesterStartDate, cls.days),
				cls.timeslot.end.hour,
				cls.timeslot.end.minute
			] as DateArray,
			location: cls.location,
			recurrenceRule: getRecurrenceRule(cls.days, semesterEndDate),
			exclusionDates: getReadingWeek(2024, 10, 14, 18).map(
				(date) => [...date, cls.timeslot.start.hour, cls.timeslot.start.minute] as DateArray
			),
			uid: cls.uid,
			startOutputType: 'local'
		};
		events.push(event);
	}
	return events;
};

const isClassFullyPopulated = (cls: Partial<Class>): cls is Class => {
	return Boolean(cls.days && cls.timeslot && cls.location && cls.name);
};

const getRecurrenceRule = (days: days[], semesterEndDate: DateArray): string =>
	`FREQ=WEEKLY;
	BYDAY=${days.map((day) => day.substring(0, 2).toUpperCase()).join()};
	INTERVAL=1;
	UNTIL=${semesterEndDate[0]}${semesterEndDate[1]}0${semesterEndDate[2]}
	`.replace(/\s/g, '');

const getNextClassDate = (startDate: DateArray, classDays: string[]): DateArray => {
	console.log('in getNextClassDate', startDate, classDays);
	const nextDate = new Date(startDate[0], startDate[1] - 1, startDate[2]);
	while (true) {
		const dayName = new Intl.DateTimeFormat('en-US', { weekday: 'long' }).format(nextDate);
		if (classDays.includes(dayName)) {
			return [nextDate.getFullYear(), nextDate.getMonth() + 1, nextDate.getDate()];
		}
		nextDate.setDate(nextDate.getDate() + 1);
	}
};

const getReadingWeek = (
	year: number,
	month: number,
	startDate: number,
	endDate: number
): DateArray[] => {
	return Array.from({ length: endDate - startDate }, (_, i) => [year, month, startDate + i]);
};
