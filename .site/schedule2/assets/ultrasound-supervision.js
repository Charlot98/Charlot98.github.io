export const reportLearners = ['张伊雯','徐李祥瑞','林雨睿','梁思思','沈烨'];
export const preferredTeachers = {
  '沈烨':'李铭婕','梁思思':'张秋梅','张伊雯':'江蓝',
  '林雨睿':'刘慜思','徐李祥瑞':'马萌','彭竻川':'曲莹莹',
};
const teachers = new Set(['戴榕全','刘蕾','张博闻','白璐','张志轩','吴璇','邝怡','曲艺','陈可欣','李铭婕','刘慜思','张秋梅','曲莹莹','马萌','江蓝','王兆雪','冯军利','张若邈']);
const seniorAndMiddle = new Set(['戴榕全','刘蕾','张博闻','白璐','张志轩','吴璇','邝怡','曲艺','陈可欣','李铭婕','刘慜思','张秋梅','曲莹莹']);
const roomPriority = ['us-room-3','us-room-1','us-room-2','us-room-4'];
const rooms = ['us-room-1','us-room-2','us-room-3','us-room-4'];
const isLearner = person => reportLearners.includes(person);
const roomOf = (day, person) => rooms.find(room => (day[room] || []).includes(person));
const staffTeachers = (day, room) => (day[room] || []).filter(person => teachers.has(person));

export function supervisionPairs(day) {
  return rooms.flatMap(room => {
    const names = day[room] || [], used = new Set();
    return names.filter(isLearner).flatMap(learner => {
      const available = staffTeachers(day, room).filter(person => !used.has(person));
      const preceding = names[names.indexOf(learner)-1];
      const teacher = available.includes(preceding) ? preceding
        : available.includes(preferredTeachers[learner]) ? preferredTeachers[learner] : available[0];
      if (!teacher) return [];
      used.add(teacher);
      return [{ room, teacher, learner }];
    });
  });
}

export function roomRosterEntries(day, room, names = day[room] || []) {
  const pairs = supervisionPairs(day).filter(pair => pair.room === room && names.includes(pair.teacher) && names.includes(pair.learner));
  const byTeacher = new Map(pairs.map(pair => [pair.teacher,pair.learner]));
  const pairedLearners = new Set(pairs.map(pair => pair.learner));
  return names.filter(person => !pairedLearners.has(person)).map(person => byTeacher.has(person) ? [person,byTeacher.get(person)] : [person]);
}

// 1、3、4号屋最多1名报告人员，2号屋可临时多放；有报告人员的屋必须有带教。
export function supervisionLayoutValid(day) {
  if (!day) return true;
  return rooms.every((room) => {
    const learners = (day[room] || []).filter(isLearner);
    if (!learners.length) return true;
    if (room !== "us-room-2" && learners.length > 1) return false;
    return staffTeachers(day, room).length > 0;
  });
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

function ensureTeacherRooms(day, count, moves) {
  while (rooms.filter(room => staffTeachers(day,room).length).length < count) {
    const target = roomPriority.find(room => !staffTeachers(day,room).length && !(day[room] || []).some(isLearner));
    if (!target) return;
    const donor = roomPriority.find(room => room !== 'us-room-4' && staffTeachers(day,room).length >= 2);
    if (!donor) return;
    const teacher = staffTeachers(day,donor).find(person => donor !== 'us-room-1' || !seniorAndMiddle.has(person) || staffTeachers(day,donor).filter(p => seniorAndMiddle.has(p)).length >= 2);
    const replacement = (day[target] || []).find(person => !teachers.has(person) && !isLearner(person));
    if (!teacher || !replacement) return;
    day[donor] = day[donor].map(person => person === teacher ? replacement : person);
    day[target] = day[target].map(person => person === replacement ? teacher : person);
    moves.push({person:teacher,from:donor,to:target,reason:'补齐一对一带教'});
    moves.push({person:replacement,from:target,to:donor,reason:'同日超声屋位互换'});
  }
}

// Changes only same-day ultrasound locations. Existing room placements are manual choices.
export function allocateUltrasoundReports(schedule, {preferPengColocation = true} = {}) {
  const moves = [], unassigned = [];
  for (const [date,day] of Object.entries(schedule)) {
    const pending = [...new Set((day['us-report'] || []).filter(isLearner))];
    if (!pending.length) continue;
    const dayMoves = [];
    if (preferPengColocation) colocatePeng(day,dayMoves);
    const occupied = new Set(rooms.filter(room => (day[room] || []).some(isLearner)));
    ensureTeacherRooms(day,pending.length+occupied.size,dayMoves);
    let best = null;
    const search = (index,used,assignments,cost) => {
      if (index === pending.length) {
        if (!best || assignments.length > best.assignments.length || assignments.length === best.assignments.length && cost < best.cost) best={assignments:[...assignments],cost};
        return;
      }
      const learner = pending[index];
      for (const [rank,room] of roomPriority.entries()) {
        if (used.has(room)) continue;
        const available = staffTeachers(day,room);
        if (!available.length) continue;
        const teacher = available.includes(preferredTeachers[learner]) ? preferredTeachers[learner] : available[0];
        used.add(room);
        assignments.push({learner,teacher,room});
        search(index+1,used,assignments,cost+(teacher === preferredTeachers[learner] ? 0 : 1000)+rank*10);
        assignments.pop();used.delete(room);
      }
      search(index+1,used,assignments,cost);
    };
    search(0,occupied,[],0);
    for (const {learner,teacher,room} of best?.assignments || []) {
      day['us-report'] = day['us-report'].filter(person => person !== learner);
      day[room] = [...(day[room] || [])];
      day[room].splice(day[room].indexOf(teacher)+1,0,learner);
      dayMoves.push({person:learner,teacher,from:'us-report',to:room,reason:'一对一超声报告'});
    }
    for (const person of pending.filter(person => (day['us-report'] || []).includes(person))) unassigned.push({date,person,reason:'可用带教屋位不足'});
    moves.push(...dayMoves.map(move => ({date,...move})));
  }
  return {moves,unassigned};
}

export function canMoveSupervisedAssignment(schedule,source,targetDate,targetRoom) {
  const sourceDay = schedule[source.dateKey], targetDay = schedule[targetDate];
  const sourceIsRoom = rooms.includes(source.columnId), targetIsRoom = rooms.includes(targetRoom);
  if (isLearner(source.person) && (sourceIsRoom || source.columnId === 'us-report')) {
    if (!targetIsRoom) return false;
    const occupied = (targetDay[targetRoom] || []).some(person => isLearner(person) && person !== source.person);
    if (occupied && targetRoom !== 'us-room-2') return false;
    if (!staffTeachers(targetDay,targetRoom).length) return false;
  }
  if (sourceIsRoom && teachers.has(source.person) && (targetDate !== source.dateKey || targetRoom !== source.columnId)) {
    if ((sourceDay[source.columnId] || []).some(isLearner) && staffTeachers(sourceDay,source.columnId).filter(person => person !== source.person).length === 0) return false;
  }
  return true;
}
