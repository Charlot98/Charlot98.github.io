export const reportLearners = ['张伊雯','徐李祥瑞','林雨睿','梁思思','沈烨'];
export const preferredTeachers = {
  '沈烨':'李铭婕','梁思思':'张秋梅','张伊雯':'江蓝',
  '林雨睿':'刘慜思','徐李祥瑞':'马萌','彭竻川':'曲莹莹',
};
const teachers = new Set(['戴榕全','刘蕾','张博闻','白璐','张志轩','吴璇','邝怡','曲艺','陈可欣','李铭婕','刘慜思','张秋梅','曲莹莹','马萌','江蓝','王兆雪','冯军利','张若邈']);
const roomPriority = ['us-room-3','us-room-1','us-room-2','us-room-4'];
const rooms = ['us-room-1','us-room-2','us-room-3','us-room-4'];
const isLearner = person => reportLearners.includes(person);
const roomOf = (day, person) => rooms.find(room => (day[room] || []).includes(person));
const staffTeachers = (day, room) => (day[room] || []).filter(person => teachers.has(person));

export function displayReportName(person, columnId = '') {
  return isLearner(person) && columnId.startsWith('us-') ? `/${person}` : person;
}

export function reportRosterEntryText(entry) {
  return entry.map(person => displayReportName(person, 'us-report')).join('');
}

export function supervisionPairs(day) {
  return rooms.flatMap(room => {
    const names = day[room] || [];
    let precedingTeacher;
    const precedingByLearner = new Map();
    for (const person of names) {
      if (teachers.has(person)) precedingTeacher = person;
      else if (isLearner(person)) precedingByLearner.set(person, precedingTeacher);
    }
    return names.filter(isLearner).flatMap(learner => {
      const available = staffTeachers(day, room);
      const preceding = precedingByLearner.get(learner);
      const teacher = available.includes(preceding) ? preceding
        : available.includes(preferredTeachers[learner]) ? preferredTeachers[learner] : available[0];
      if (!teacher) return [];
      return [{ room, teacher, learner }];
    });
  });
}

export function roomRosterEntries(day, room, names = day[room] || []) {
  const pairs = supervisionPairs(day).filter(pair => pair.room === room && names.includes(pair.teacher) && names.includes(pair.learner));
  const byTeacher = new Map();
  for (const { teacher, learner } of pairs) {
    if (!byTeacher.has(teacher)) byTeacher.set(teacher, []);
    byTeacher.get(teacher).push(learner);
  }
  const pairedLearners = new Set(pairs.map(pair => pair.learner));
  return names.filter(person => !pairedLearners.has(person)).map(person => [person,...(byTeacher.get(person) || [])]);
}

// 带教关系用于展示与自动推荐，不再限制手动调整的位置和每屋报告人数。
export function supervisionLayoutValid() {
  return true;
}

function colocatePeng(day, moves) {
  const source = roomOf(day,'彭竻川'), target = roomOf(day,'曲莹莹');
  if (!source || !target || source === target || target === 'us-room-4') return;
  const candidates = (day[target] || []).filter(person => person !== '曲莹莹' && !isLearner(person));
  const replacement = candidates.find(person => !teachers.has(person)) || candidates[0];
  if (!replacement) return;
  day[source] = day[source].map(person => person === '彭竻川' ? replacement : person);
  day[target] = day[target].map(person => person === replacement ? '彭竻川' : person);
  moves.push({person:'彭竻川',from:source,to:target,reason:'优先与曲莹莹同屋'});
  moves.push({person:replacement,from:target,to:source,reason:'同日超声屋位互换'});
}

// Changes only same-day ultrasound locations. Existing room placements are manual choices.
export function allocateUltrasoundReports(schedule, {preferPengColocation = true} = {}) {
  const moves = [], unassigned = [];
  for (const [date,day] of Object.entries(schedule)) {
    const pending = [...new Set((day['us-report'] || []).filter(isLearner))];
    if (!pending.length) continue;
    const dayMoves = [];
    if (preferPengColocation) colocatePeng(day,dayMoves);
    for (const learner of pending) {
      const candidates = roomPriority.flatMap((room, rank) => {
        const available = staffTeachers(day, room);
        if (!available.length) return [];
        const teacher = available.includes(preferredTeachers[learner]) ? preferredTeachers[learner] : available[0];
        const count = (day[room] || []).filter(isLearner).length;
        return [{ room, teacher, cost: (teacher === preferredTeachers[learner] ? 0 : 1000) + count * 100 + rank * 10 }];
      }).sort((left, right) => left.cost - right.cost);
      if (!candidates.length) continue;
      const { teacher, room } = candidates[0];
      day['us-report'] = day['us-report'].filter(person => person !== learner);
      day[room] = [...(day[room] || [])];
      let insertion = day[room].indexOf(teacher) + 1;
      while (isLearner(day[room][insertion])) insertion += 1;
      day[room].splice(insertion,0,learner);
      dayMoves.push({person:learner,teacher,from:'us-report',to:room,reason:'超声报告带教'});
    }
    for (const person of pending.filter(person => (day['us-report'] || []).includes(person))) unassigned.push({date,person,reason:'可用带教屋位不足'});
    moves.push(...dayMoves.map(move => ({date,...move})));
  }
  return {moves,unassigned};
}

export function canMoveSupervisedAssignment() {
  return true;
}
