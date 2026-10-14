(function () {
  "use strict";

  const DATABASE_KEY = "neuron.database.v1";
  const DEFAULT_CONVERSION = [
    { minimum: 98, grade: 1.0 },
    { minimum: 95, grade: 1.25 },
    { minimum: 92, grade: 1.5 },
    { minimum: 89, grade: 1.75 },
    { minimum: 86, grade: 2.0 },
    { minimum: 83, grade: 2.25 },
    { minimum: 80, grade: 2.5 },
    { minimum: 78, grade: 2.75 },
    { minimum: 75, grade: 3.0 },
    { minimum: 0, grade: 5.0 }
  ];

  async function createId() {
    if (window.crypto && typeof window.crypto.randomUUID === "function") {
      return window.crypto.randomUUID();
    }
    return "id-" + Date.now().toString(36) + "-" + Math.random().toString(36).slice(2);
  }

  async function readDatabase() {
    let raw;
    try {
      raw = window.localStorage.getItem(DATABASE_KEY);
    } catch (error) {
      throw new Error("Your browser could not read local storage. Check its privacy settings and try again.");
    }
    if (!raw) {
      return { users: [], currentUserId: null, conversionTable: DEFAULT_CONVERSION };
    }
    try {
      const data = JSON.parse(raw);
      if (!data || !Array.isArray(data.users) || !Array.isArray(data.conversionTable)) {
        throw new Error("The saved data has an unexpected format.");
      }
      return data;
    } catch (error) {
      throw new Error("Saved NEUron data could not be read. Clear this site's NEUron storage to start fresh.");
    }
  }

  async function writeDatabase(database) {
    try {
      window.localStorage.setItem(DATABASE_KEY, JSON.stringify(database));
    } catch (error) {
      throw new Error("Your changes could not be saved. Check that browser storage is available.");
    }
  }

  async function getCurrentUser() {
    const database = await readDatabase();
    return database.users.find(function (user) {
      return user.id === database.currentUserId;
    }) || null;
  }

  async function beginDemoSession(name, email) {
    const database = await readDatabase();
    const normalizedEmail = email.trim().toLowerCase();
    let user = database.users.find(function (item) {
      return item.email.toLowerCase() === normalizedEmail;
    });
    if (user) {
      user.name = name.trim();
    } else {
      user = {
        id: await createId(),
        name: name.trim(),
        email: normalizedEmail,
        semesters: [],
        activeSemesterId: null
      };
      database.users.push(user);
    }
    database.currentUserId = user.id;
    await writeDatabase(database);
    return user;
  }

  async function clearSession() {
    const database = await readDatabase();
    database.currentUserId = null;
    await writeDatabase(database);
  }

  async function getConversionTable() {
    const database = await readDatabase();
    return database.conversionTable;
  }

  async function saveConversionTable(rows) {
    const database = await readDatabase();
    database.conversionTable = rows;
    await writeDatabase(database);
  }

  async function getCurrentSemester(userId) {
    const database = await readDatabase();
    const user = database.users.find(function (item) {
      return item.id === userId;
    });
    if (!user) return null;
    return user.semesters.find(function (semester) {
      return semester.id === user.activeSemesterId;
    }) || user.semesters[user.semesters.length - 1] || null;
  }

  async function createSemester(userId, name, subjectNames, details) {
    const database = await readDatabase();
    const user = database.users.find(function (item) {
      return item.id === userId;
    });
    if (!user) throw new Error("Your account could not be found. Please sign in again.");
    const categories = [
      { name: "Quizzes", weight: 25 },
      { name: "Exams", weight: 40 },
      { name: "Projects", weight: 25 },
      { name: "Participation", weight: 10 }
    ];
    const subjects = [];
    for (const subjectName of subjectNames) {
      subjects.push({
        id: await createId(),
        name: subjectName,
        categories: categories.map(function (category) {
          return { id: category.name.toLowerCase(), name: category.name, weight: category.weight };
        }),
        activities: [],
        classSlots: []
      });
    }
    const semester = {
      id: await createId(),
      name: name.trim(),
      yearLevel: details && details.yearLevel ? details.yearLevel : null,
      term: details && details.term ? details.term : null,
      subjects: subjects,
      createdAt: new Date().toISOString()
    };
    user.semesters.push(semester);
    user.activeSemesterId = semester.id;
    await writeDatabase(database);
    return semester;
  }

  async function addSubject(userId, semesterId, name) {
    const database = await readDatabase();
    const user = database.users.find(function (item) {
      return item.id === userId;
    });
    const semester = user && user.semesters.find(function (item) {
      return item.id === semesterId;
    });
    if (!semester) throw new Error("Your semester could not be found. Refresh and try again.");
    const subject = {
      id: await createId(),
      name: name.trim(),
      categories: [
        { id: "quizzes", name: "Quizzes", weight: 25 },
        { id: "exams", name: "Exams", weight: 40 },
        { id: "projects", name: "Projects", weight: 25 },
        { id: "participation", name: "Participation", weight: 10 }
      ],
      activities: [],
      classSlots: []
    };
    semester.subjects.push(subject);
    await writeDatabase(database);
    return subject;
  }

  async function updateSubjectCategories(userId, semesterId, subjectId, categories) {
    const database = await readDatabase();
    const user = database.users.find(function (item) {
      return item.id === userId;
    });
    const semester = user && user.semesters.find(function (item) {
      return item.id === semesterId;
    });
    const subject = semester && semester.subjects.find(function (item) {
      return item.id === subjectId;
    });
    if (!subject) throw new Error("That subject could not be found. Refresh and try again.");
    subject.categories = categories;
    await writeDatabase(database);
  }

  async function addActivity(userId, semesterId, subjectId, activity) {
    const database = await readDatabase();
    const user = database.users.find(function (item) {
      return item.id === userId;
    });
    const semester = user && user.semesters.find(function (item) {
      return item.id === semesterId;
    });
    const subject = semester && semester.subjects.find(function (item) {
      return item.id === subjectId;
    });
    if (!subject) throw new Error("That subject could not be found. Refresh and try again.");
    const category = subject.categories.find(function (item) {
      return item.id === activity.categoryId;
    });
    if (!category) throw new Error("Choose a grading category for this score.");
    const savedActivity = {
      id: await createId(),
      name: activity.name.trim(),
      categoryId: activity.categoryId,
      score: Number(activity.score),
      total: Number(activity.total),
      date: activity.date || new Date().toISOString().slice(0, 10)
    };
    subject.activities.push(savedActivity);
    await writeDatabase(database);
    return savedActivity;
  }

  async function addClassSlot(userId, semesterId, subjectId, classSlot) {
    const database = await readDatabase();
    const user = database.users.find(function (item) {
      return item.id === userId;
    });
    const semester = user && user.semesters.find(function (item) {
      return item.id === semesterId;
    });
    const subject = semester && semester.subjects.find(function (item) {
      return item.id === subjectId;
    });
    if (!subject) throw new Error("Choose a subject for this class.");
    const savedSlot = {
      id: await createId(),
      day: classSlot.day,
      startTime: classSlot.startTime,
      endTime: classSlot.endTime,
      room: classSlot.room.trim()
    };
    subject.classSlots.push(savedSlot);
    await writeDatabase(database);
    return savedSlot;
  }

  async function updateProfile(userId, name) {
    const database = await readDatabase();
    const user = database.users.find(function (item) {
      return item.id === userId;
    });
    if (!user) throw new Error("Your account could not be found. Please sign in again.");
    user.name = name.trim();
    await writeDatabase(database);
    return user;
  }

  window.NeuronStorage = {
    getCurrentUser: getCurrentUser,
    beginDemoSession: beginDemoSession,
    clearSession: clearSession,
    getCurrentSemester: getCurrentSemester,
    createSemester: createSemester,
    addSubject: addSubject,
    updateSubjectCategories: updateSubjectCategories,
    addActivity: addActivity,
    addClassSlot: addClassSlot,
    getConversionTable: getConversionTable,
    saveConversionTable: saveConversionTable,
    updateProfile: updateProfile
  };
}());
