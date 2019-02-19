import moment from 'moment';
import localization from 'moment/locale/nb';

const shiftTypes = {
  A: {
    start: '14:30',
    end: '22:00',
    duration: {
      hours: 7,
      minutes: 30
    }
  },
  AX: {
    start: '14:30',
    end: '22:00',
    duration: {
      hours: 7,
      minutes: 30
    }
  },
  D: {
    start: '07:00',
    end: '15:00',
    duration: {
      hours: 8,
      minutes: 0
    }
  },
  N: {
    start: '21:45',
    end: '07:15',
    duration: {
      hours: 10,
      minutes: 30
    }
  },
  D51: {
    start: '10:30',
    end: '15:00',
    duration: {
      hours: 4,
      minutes: 30
    }
  },
  DPFAG: {
    start: '07:00',
    end: '16:00',
    duration: {
      hours: 9,
      minutes: 0
    }
  }
};

const parseStartDate = sms => {
  const r = new RegExp(/([0-3]?\d\.{1})([01]?\d\.{1})([12]{1}\d{3}\.?)/g);
  const match = sms.match(r) && sms.match(r)[0];

  const momentFriendlyDate = match
    .split('.')
    .reverse()
    .join('-');

  return moment(momentFriendlyDate, null, 'nb');
};

const parseShifts = (sms, startDate) => {
  const r1 = new RegExp(/(Uke \d{1,2})(.*\n?)/gm);
  const ranges = sms.match(r1);

  const indexes = [];
  const slices = [];

  if (ranges)
    ranges.forEach(range => {
      const index = sms.indexOf(range.trim());
      indexes.push(index);
    });

  indexes.forEach((index, i) => {
    slices.push(sms.slice(index, indexes[i + 1] || sms.length));
  });

  const r2 = new RegExp(
    /\b((man|tir|ons|tor|fre|lør|søn))\b ?\d{1,2} ?\w{1,5}/g
  );

  let currentDate = startDate;
  const updateCurrentDate = newDate => {
    currentDate = moment(newDate.format());
  };

  return slices.map(slice => {
    const w = slice.match(/(Uke \d{1,2})/g)[0];
    const loc = slice.match(/\[.*\]/g)[0];
    const workWeek = {
      week: w.slice(w.length - 1),
      location: loc && loc.substring(1, loc.length - 1),
      shifts: parseShiftHours(slice.match(r2), currentDate, updateCurrentDate)
    };
    return workWeek;
  });
};

const parseShiftHours = (shifts, lastDate, updateCurrentDate) => {
  const mappedShifts = shifts.map(shift => {
    const shiftType = shift.match(/\w{1,5}$/g);
    const date = addDate(
      lastDate,
      parseInt(shift.substring(3, shift.length - 1).trim(), 10)
    );
    return {
      date: moment(date.format()),
      type: shiftType,
      ...shiftTypes[shiftType]
    };
  });
  updateCurrentDate(mappedShifts[mappedShifts.length - 1].date);
  return mappedShifts;
};

const addDate = (d, currentDate) => {
  const lastDate = d.get('date');
  const diff = currentDate - lastDate;
  if (diff >= 0) {
    d.add(diff, 'days');
    return d;
  }
  d.add(1, 'months');
  d.set('date', currentDate);
  return d;
};

export const parseSMS = sms => {
  moment()
    .locale('nb', localization)
    .format('LLL');
  const startDate = parseStartDate(sms); // gets year and start date to calculate date/year wrapping
  const shifts = parseShifts(sms, startDate);
  return shifts;
};

export default parseSMS;
