const makeIcsFile = function(content, icsFile) {
  var data = new Blob([content], { type: 'text/calendar' });

  // If we are replacing a previously generated file we need to
  // manually revoke the object URL to avoid memory leaks.
  if (icsFile !== null) {
    window.URL.revokeObjectURL(icsFile);
  }

  icsFile = window.URL.createObjectURL(data);

  // returns a URL you can use as a href
  return icsFile;
};

export const createIcsData = eventData => {
  if (!eventData) return;
  const shifts = [];
  eventData.forEach(week => {
    week.shifts.forEach(shift => {
      const timestring = shift.start.split(':');
      shifts.push({
        title: `${shift.type}: ${shift.start} - ${shift.end}`,
        location: week.location,
        start: [
          shift.date.get('year'),
          shift.date.get('month') + 1, //offset january index 0
          shift.date.get('date'),
          parseInt(timestring[0], 10),
          parseInt(timestring[1], 10)
        ],
        duration: shift.duration
      });
    });
  });
  return shifts;
};

const createDownloadIcsLink = events => {
  if (!events) {
    return '';
  }
  const icsFile = null;
  return makeIcsFile(events, icsFile);
};

export default createDownloadIcsLink;
