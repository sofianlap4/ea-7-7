import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { fetchStudentCourses } from "../api/courses";

const CourseList: React.FC<{ userRole: string }> = ({ userRole }) => {
  const [courses, setCourses] = useState<any[]>([]);

  useEffect(() => {
    if (userRole === "student") {
      fetchStudentCourses()
        .then(response => {
          if (response.success) {
            setCourses(Array.isArray(response.data) ? response.data : []);
          } else {
            setCourses([]);
            console.error("Error fetching student courses:", response.error);
          }
        })
        .catch(() => setCourses([]));
    }
  }, [userRole]);

  return (
    <div>
      <h2>All Courses</h2>
      <ul>
        {courses.length > 0 ? (
          courses.map((course) => (
            <li key={course.id}>
              <Link to={`/courses/${course.id}`}>
                <strong>{course.title}</strong>
              </Link>
              {course.description ? `: ${course.description}` : ""}
            </li>
          ))
        ) : (
          <li>No courses found.</li>
        )}
      </ul>
    </div>
  );
};

export default CourseList;