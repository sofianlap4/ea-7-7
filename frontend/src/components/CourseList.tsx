import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { fetchStudentCourses, fetchPaidVersionPreviewsCourses } from "../api/courses";
import { fetchUserActivePackStatus } from "../api/users";
import { useNavigate } from "react-router-dom";


const CourseList: React.FC<{ userRole: string; userId?: string }> = ({ userRole, userId }) => {
  const [courses, setCourses] = useState<any[]>([]);
  const [premiumCourses, setPremiumCourses] = useState<any[]>([]);
  const [isFreeVersion, setIsFreeVersion] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    let ignore = false;
    async function fetchData() {
      setLoading(true);
      if (userRole === "student" && userId) {
        // Check active pack status
        const status = await fetchUserActivePackStatus(userId);
        if (status.success && status.data) {
          setIsFreeVersion(status.data.freeVersion === true);
          if (status.data.freeVersion === true) {
            // Free version: fetch both sections
            const [freeRes, premiumRes] = await Promise.all([
              fetchStudentCourses(),
              fetchPaidVersionPreviewsCourses(),
            ]);
            if (!ignore) {
              setCourses(Array.isArray(freeRes.data) ? freeRes.data : []);
              setPremiumCourses(Array.isArray(premiumRes.data) ? premiumRes.data : []);
            }
          } else if (status.data.freeVersion === false) {
            // Paid version: only fetch normal courses
            const freeRes = await fetchStudentCourses();
            if (!ignore) {
              setCourses(Array.isArray(freeRes.data) ? freeRes.data : []);
              setPremiumCourses([]);
            }
          } else {
            // No active pack
            if (!ignore) {
              setCourses([]);
              setPremiumCourses([]);
            }
          }
        } else {
          setIsFreeVersion(null);
          setCourses([]);
          setPremiumCourses([]);
        }
      }
      setLoading(false);
    }
    fetchData();
    return () => { ignore = true; };
  }, [userRole, userId]);

  if (loading) return <div>Chargement...</div>;

  return (
    <div>
      <h2>Liste des cours :</h2>
      <ul>
        {courses.length > 0 ? (
          courses.map((course) => (
            <li key={course.id} style={course.isOpened ? {} : { color: "gray" }}>
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

      {isFreeVersion && premiumCourses.length > 0 && (
        <>
          <h3>Premium (cours disponibles si vous passez à la version payante) :</h3>
          <ul>
            {premiumCourses.map((course) => (
              <li
                key={course.id}
                style={{ background: "#eee", color: "#888", cursor: "pointer", borderRadius: 4, marginBottom: 8, padding: 8 }}
                onClick={() => navigate("/packs")}
                title="Voir les packs disponibles"
              >
                <strong>titre: {course.title}</strong>
                {course.description ? ` : ${course.description}` : ""}
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
};

export default CourseList;