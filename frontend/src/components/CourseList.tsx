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
      <h2>Liste des cours :</h2>
      <ul>
        {courses.length > 0 ? (
          courses.map((course) => (
            <li key={course.id}>
              <Link to={`/courses/${course.id}`}>
                <strong>titre: {course.title}</strong>
              </Link>
              description: {course.description ? `: ${course.description}` : ""}
            </li>
          ))
        ) : (
          <li>Pas de cours trouvés.</li>
        )}
      </ul>
    </div>
  );
};

export default CourseList;