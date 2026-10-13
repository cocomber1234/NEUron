(function () {
  "use strict";

  function calculateCategoryAverage(subject, categoryId) {
    const scores = subject.activities.filter(function (activity) {
      return activity.categoryId === categoryId;
    });
    if (!scores.length) return null;
    const earned = scores.reduce(function (sum, activity) {
      return sum + activity.score;
    }, 0);
    const possible = scores.reduce(function (sum, activity) {
      return sum + activity.total;
    }, 0);
    return possible > 0 ? earned / possible : null;
  }

  function calculateSubjectPercentage(subject) {
    if (!subject.categories.length || subject.categories.some(function (category) {
      return calculateCategoryAverage(subject, category.id) === null;
    })) return null;
    const weightTotal = subject.categories.reduce(function (sum, category) {
      return sum + Number(category.weight);
    }, 0);
    if (Math.abs(weightTotal - 100) > 0.000001) return null;
    const percentage = subject.categories.reduce(function (sum, category) {
      return sum + calculateCategoryAverage(subject, category.id) * Number(category.weight);
    }, 0);
    return Math.round(percentage);
  }

  function convertPercentageToGrade(percentage, conversionTable) {
    if (percentage === null || percentage === undefined) return null;
    const matchingRow = conversionTable.slice().sort(function (a, b) {
      return b.minimum - a.minimum;
    }).find(function (row) {
      return percentage >= Number(row.minimum);
    });
    return matchingRow ? Number(matchingRow.grade) : null;
  }

  function calculateSubjectGrade(subject, conversionTable) {
    return convertPercentageToGrade(calculateSubjectPercentage(subject), conversionTable);
  }

  window.NeuronGrading = {
    calculateCategoryAverage: calculateCategoryAverage,
    calculateSubjectPercentage: calculateSubjectPercentage,
    calculateSubjectGrade: calculateSubjectGrade
  };
}());
