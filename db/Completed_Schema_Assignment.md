MongoDB Assignment

Your Account: ngand1@fpt.com

---------------------------------------------

1. Identify the Main Entities
- Students
- Courses
- Modules
- Reviews

2. Design the MongoDB Schema:
a. Students Collection:
{
  _id: ObjectId,
  name: String,
  email: String,
  enrolledCourses: [ObjectId] // References Course._id
}
Reasoning:
Separate collection to track students and their enrolled courses, enabling flexible queries and avoiding data duplication.

b. Courses Collection:
{
  _id: ObjectId,
  title: String,
  description: String
}
Reasoning:
Course metadata stored separately; modules handled in a dedicated collection for scalability and clear separation of concerns.

c. Modules Collection:
{
  _id: ObjectId,
  courseId: ObjectId, // References Course._id
  title: String,
  description: String
}
Reasoning:
Modules as a separate collection to allow independent review, indexing, and efficient aggregation; courseId field groups modules by course.

d. Reviews Collection:
{
  _id: ObjectId,
  studentId: ObjectId,    // References Students._id
  courseId: ObjectId,     // References Courses._id
  moduleId: ObjectId,     // References Modules._id
  contentRating: Number,   // Rating for module content
  instructorRating: Number,// Rating for instructor performance
  feedback: String,
  createdAt: Date
}
Reasoning:
Storing reviews separately optimizes querying and aggregation without embedding large arrays; supports efficient calculation of average ratings.

---------------------------------------------

3. MongoDB Aggregation Queries

a. Retrieve list of reviews for a specific module:
```js
db.reviews.find({ moduleId: ObjectId("<MODULE_ID>") });
```

b. Calculate the average rating for a module:
```js
db.reviews.aggregate([
  { $match: { moduleId: ObjectId("<MODULE_ID>") } },
  {
    $group: {
      _id: "$moduleId",
      avgContentRating: { $avg: "$contentRating" },
      avgInstructorRating: { $avg: "$instructorRating" }
    }
  }
]);
```

c. Calculate the average rating for an instructor (across all modules in a course):
```js
db.reviews.aggregate([
  { $match: { courseId: ObjectId("<COURSE_ID>") } },
  {
    $group: {
      _id: "$courseId",
      avgContentRating: { $avg: "$contentRating" },
      avgInstructorRating: { $avg: "$instructorRating" }
    }
  }
]);
```

d. Retrieve the list of highest-rated modules within each course:
```js
db.reviews.aggregate([
  {
    $group: {
      _id: { courseId: "$courseId", moduleId: "$moduleId" },
      avgRating: { $avg: "$contentRating" }
    }
  },
  { $sort: { "_id.courseId": 1, avgRating: -1 } },
  {
    $group: {
      _id: "$_id.courseId",
      moduleId: { $first: "$_id.moduleId" },
      avgRating: { $first: "$avgRating" }
    }
  },
  {
    $lookup: {
      from: "modules",
      localField: "moduleId",
      foreignField: "_id",
      as: "module"
    }
  },
  { $unwind: "$module" },
  {
    $project: {
      _id: 0,
      courseId: "$_id",
      moduleId: 1,
      moduleTitle: "$module.title",
      avgRating: 1
    }
  }
]);
```
